import threading
import time
from typing import Any
import requests

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from csv_recorder import CsvRecorder
from obd_reader import ObdReader
from session_manifest import SessionManifest
from upload_package import UploadPackage

API_URL = "http://127.0.0.1:8000"

app = FastAPI(title="Vehicle Telemetry Logger Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

recording_thread: threading.Thread | None = None
stop_event = threading.Event()

state: dict[str, Any] = {
    "is_recording": False,
    "session_id": None,
    "vehicle_id": None,
    "selected_metrics": [],
    "sample_rate": 5.0,
    "sample_count": 0,
    "latest_point": None,
    "last_file": None,
    "upload_status": None,
    "error": None,
}

class StartRequest(BaseModel):
    session_id: str
    vehicle_id: str
    selected_metrics: list[str]
    sample_rate: float = 5.0
    auth_token: str

def upload_finished_run(
    session_id: str,
    csv_file,
    manifest_file,
    auth_token: str,
) -> None:
    with csv_file.open("rb") as csv, manifest_file.open("rb") as manifest:
        response = requests.post(
            f"{API_URL}/sessions/{session_id}/upload-csv",
            headers={
                "Authorization": f"Bearer {auth_token}",
            },
            files={
                "csv_file": (csv_file.name, csv, "text/csv"),
                "manifest_file": (
                    manifest_file.name,
                    manifest,
                    "application/json",
                ),
            },
            timeout=30,
        )

    response.raise_for_status()


def recording_loop(request: StartRequest) -> None:
    global state

    try:
        reader = ObdReader(request.selected_metrics)

        recorder = CsvRecorder(
            selected_metrics=request.selected_metrics,
            session_id=request.session_id,
            vehicle_id=request.vehicle_id,
        )
        recorder.start()

        manifest = SessionManifest(
            session_id=request.session_id,
            vehicle_id=request.vehicle_id,
            selected_metrics=request.selected_metrics,
            sample_rate=request.sample_rate,
        )

        delay_seconds = 1 / request.sample_rate

        while not stop_event.is_set():
            point = reader.read_point()
            recorder.write_point(point)
            manifest.increment_samples()

            state["sample_count"] = manifest.sample_count
            state["latest_point"] = point.to_dict()

            time.sleep(delay_seconds)

        csv_file = recorder.finish()
        manifest_file = manifest.finish(csv_file)

        package = UploadPackage(csv_file=csv_file, manifest_file=manifest_file)
        package.validate()

        try:
            upload_finished_run(
                session_id=request.session_id,
                csv_file=csv_file,
                manifest_file=manifest_file,
                auth_token=request.auth_token,
            )

            state["upload_status"] = "uploaded"

        except Exception as upload_error:
            state["upload_status"] = "pending"
            state["error"] = f"Recording saved locally, upload failed: {upload_error}"

        state["last_file"] = {
            "csv_file": str(csv_file),
            "manifest_file": str(manifest_file),
        }

    except Exception as error:
        state["error"] = str(error)

    finally:
        state["is_recording"] = False


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/status")
def status():
    return state


@app.post("/start")
def start_recording(request: StartRequest):
    global recording_thread

    if state["is_recording"]:
        raise HTTPException(status_code=400, detail="Already recording")

    stop_event.clear()

    state.update(
        {
            "is_recording": True,
            "session_id": request.session_id,
            "vehicle_id": request.vehicle_id,
            "selected_metrics": request.selected_metrics,
            "sample_rate": request.sample_rate,
            "sample_count": 0,
            "latest_point": None,
            "last_file": None,
            "upload_status": None,
            "error": None,
        }
    )

    recording_thread = threading.Thread(
        target=recording_loop,
        args=(request,),
        daemon=True,
    )
    recording_thread.start()

    return {"message": "Recording started", "session_id": request.session_id}


@app.post("/stop")
def stop_recording():
    global recording_thread

    if not state["is_recording"]:
        raise HTTPException(status_code=400, detail="Not currently recording")

    stop_event.set()

    if recording_thread:
        recording_thread.join(timeout=10)

    return {
        "message": "Recording stopped",
        "last_file": state["last_file"],
        "upload_status": state["upload_status"],
        "error": state["error"],
    }