import threading
import time
from typing import Any

import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from csv_recorder import CsvRecorder
from obd_reader import ObdReader
from session_manifest import SessionManifest
from metrics import AVAILABLE_METRICS
from config import API_URL, FRONTEND_ORIGINS


UPLOAD_TIMEOUT_SECONDS = 30
STOP_TIMEOUT_SECONDS = UPLOAD_TIMEOUT_SECONDS + 10

app = FastAPI(
    title="Vehicle Telemetry Logger Service"
)

# TODO: Change origin to frontend and I think the other is backend

app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class StartRequest(BaseModel):
    session_id: str
    vehicle_id: str
    selected_metrics: list[str]
    sample_rate: float = Field(
        default=5.0,
        gt=0,
        le=20,
    )
    auth_token: str


recording_thread: threading.Thread | None = None
connection_thread: threading.Thread | None = None

obd_reader: ObdReader | None = None

stop_event = threading.Event()

state_lock = threading.Lock()

state: dict[str, Any] = {
    "is_connected": False,
    "is_connecting": False,
    "is_recording": False,
    "connection_status": "idle",
    "session_id": None,
    "vehicle_id": None,
    "selected_metrics": [],
    "sample_rate": 5.0,
    "sample_count": 0,
    "latest_point": None,
    "upload_status": None,
    "manifest": None,
    "error": None,
}


def update_state(**updates: Any) -> None:
    with state_lock:
        state.update(updates)


def get_state_snapshot() -> dict[str, Any]:
    with state_lock:
        return dict(state)


def upload_finished_run(
    session_id: str,
    csv_file_name: str,
    csv_bytes: bytes,
    manifest_file_name: str,
    manifest_bytes: bytes,
    auth_token: str,
) -> dict[str, Any] | None:
    response = requests.post(
        f"{API_URL}/sessions/{session_id}/upload-csv",
        headers={
            "Authorization": f"Bearer {auth_token}",
        },
        files={
            "csv_file": (
                csv_file_name,
                csv_bytes,
                "text/csv",
            ),
            "manifest_file": (
                manifest_file_name,
                manifest_bytes,
                "application/json",
            ),
        },
        timeout=UPLOAD_TIMEOUT_SECONDS,
    )

    if not response.ok:
        raise RuntimeError(
            f"Backend returned {response.status_code}: "
            f"{response.text}"
        )

    if not response.content:
        return None

    try:
        return response.json()
    except requests.JSONDecodeError:
        return {
            "message": response.text,
        }


def recording_loop(request: StartRequest) -> None:
    global obd_reader
    
    recorder: CsvRecorder | None = None

    try:
        if obd_reader is None:
            raise RuntimeError(
                "OBD-II adapter is not connected."
            )

        reader = obd_reader

        recorder = CsvRecorder(
            selected_metrics=
                request.selected_metrics,
            session_id=request.session_id,
            vehicle_id=request.vehicle_id,
        )

        recorder.start()

        manifest = SessionManifest(
            session_id=request.session_id,
            vehicle_id=request.vehicle_id,
            selected_metrics=
                request.selected_metrics,
            sample_rate=request.sample_rate,
        )

        delay_seconds = (
            1.0 / request.sample_rate
        )

        while not stop_event.is_set():
            loop_started_at = time.monotonic()

            point = reader.read_point()

            recorder.write_point(point)
            manifest.increment_samples()

            update_state(
                sample_count=
                    manifest.sample_count,
                latest_point=
                    point.to_dict(),
            )

            elapsed_seconds = (
                time.monotonic() -
                loop_started_at
            )

            remaining_delay = max(
                0.0,
                delay_seconds -
                elapsed_seconds,
            )

            stop_event.wait(
                remaining_delay
            )

        (
            csv_file_name,
            csv_bytes,
        ) = recorder.finish()

        (
            manifest_file_name,
            manifest_bytes,
            manifest_data,
        ) = manifest.finish(
            csv_file_name
        )

        update_state(
            upload_status="uploading",
            manifest=manifest_data,
        )

        upload_finished_run(
            session_id=request.session_id,
            csv_file_name=csv_file_name,
            csv_bytes=csv_bytes,
            manifest_file_name=
                manifest_file_name,
            manifest_bytes=manifest_bytes,
            auth_token=request.auth_token,
        )

        update_state(
            upload_status="uploaded",
            error=None,
        )

    except Exception as error:
        update_state(
            upload_status="failed",
            error=str(error),
        )

    finally:
        update_state(
            is_recording=False,
        )

def connect_obd_loop() -> None:
    global obd_reader

    try:
        update_state(
            is_connecting=True,
            is_connected=False,
            connection_status="connecting",
            error=None,
        )

        obd_reader = ObdReader([])

        update_state(
            is_connecting=False,
            is_connected=True,
            connection_status="connected",
            error=None,
        )

    except Exception as error:
        obd_reader = None

        update_state(
            is_connecting=False,
            is_connected=False,
            connection_status="failed",
            error=str(error),
        )


@app.get("/health")
def health() -> dict[str, str]:
    return {
        "status": "ok",
    }


@app.get("/status")
def status() -> dict[str, Any]:
    return get_state_snapshot()

@app.post("/connect")
def connect_obd() -> dict[str, str]:
    global connection_thread

    current_state = get_state_snapshot()

    if current_state["is_connected"]:
        return {
            "message": "OBD-II adapter is already connected.",
        }

    if current_state["is_connecting"]:
        return {
            "message": "OBD-II connection is already in progress.",
        }

    connection_thread = threading.Thread(
        target=connect_obd_loop,
        daemon=True,
        name="obd-connection",
    )

    connection_thread.start()

    return {
        "message": "OBD-II connection started.",
    }


@app.post("/start")
def start_recording(
    request: StartRequest,
) -> dict[str, str]:
    global recording_thread
    global obd_reader

    current_state = get_state_snapshot()

    if not current_state["is_connected"] or obd_reader is None:
        raise HTTPException(
            status_code=409,
            detail="OBD-II adapter is not connected.",
        )

    obd_reader.set_selected_metrics(
        request.selected_metrics
    )

    if current_state["is_recording"]:
        raise HTTPException(
            status_code=400,
            detail="Already recording.",
        )

    if not request.selected_metrics:
        raise HTTPException(
            status_code=400,
            detail=(
                "At least one metric must "
                "be selected."
            ),
        )
    
    unknown_metrics = sorted(
        set(request.selected_metrics)
        - set(AVAILABLE_METRICS)
    )

    if unknown_metrics:
        raise HTTPException(
            status_code=422,
            detail={
                "message": "Unsupported telemetry metrics.",
                "metrics": unknown_metrics,
            },
        )

    if not request.auth_token.strip():
        raise HTTPException(
            status_code=401,
            detail=(
                "An authentication token "
                "is required."
            ),
        )
    
    print("Received selected metrics:")
    print(request.selected_metrics)

    stop_event.clear()

    update_state(
        is_recording=True,
        session_id=request.session_id,
        vehicle_id=request.vehicle_id,
        selected_metrics=
            request.selected_metrics,
        sample_rate=request.sample_rate,
        sample_count=0,
        latest_point=None,
        upload_status=None,
        manifest=None,
        error=None,
    )

    recording_thread = threading.Thread(
        target=recording_loop,
        args=(request,),
        daemon=True,
        name=(
            f"telemetry-session-"
            f"{request.session_id}"
        ),
    )

    recording_thread.start()

    return {
        "message": "Recording started.",
        "session_id": request.session_id,
    }


@app.post("/stop")
def stop_recording() -> dict[str, Any]:
    global recording_thread

    current_state = get_state_snapshot()

    if not current_state["is_recording"]:
        raise HTTPException(
            status_code=400,
            detail=(
                "Not currently recording."
            ),
        )

    stop_event.set()

    if recording_thread is not None:
        recording_thread.join(
            timeout=STOP_TIMEOUT_SECONDS
        )

    if (
        recording_thread is not None
        and recording_thread.is_alive()
    ):
        raise HTTPException(
            status_code=504,
            detail=(
                "The logger did not stop "
                "within the expected time."
            ),
        )

    final_state = get_state_snapshot()

    if (
        final_state["upload_status"]
        == "failed"
    ):
        raise HTTPException(
            status_code=502,
            detail=(
                final_state["error"]
                or "The session upload failed."
            ),
        )

    if (
        final_state["upload_status"]
        != "uploaded"
    ):
        raise HTTPException(
            status_code=500,
            detail=(
                "The recording stopped, but "
                "the upload did not complete."
            ),
        )

    recording_thread = None

    return {
        "message": (
            "Recording stopped and "
            "uploaded successfully."
        ),
        "upload_status": "uploaded",
        "manifest":
            final_state["manifest"],
        "error": None,
    }