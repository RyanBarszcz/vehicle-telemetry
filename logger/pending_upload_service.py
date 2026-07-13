from __future__ import annotations

import json
import shutil
from pathlib import Path
from typing import Any

import requests


API_URL = "http://127.0.0.1:8000"

LOGGER_DIR = Path(__file__).resolve().parent
RUNS_DIR = LOGGER_DIR / "runs"
PENDING_DIR = RUNS_DIR / "pending"
UPLOADED_DIR = RUNS_DIR / "uploaded"


class PendingRunError(RuntimeError):
    """Raised when a pending run cannot be loaded or uploaded."""


def ensure_run_directories() -> None:
    PENDING_DIR.mkdir(parents=True, exist_ok=True)
    UPLOADED_DIR.mkdir(parents=True, exist_ok=True)


def get_pending_runs() -> list[dict[str, Any]]:
    """
    Return information about every CSV file currently waiting in runs/pending.
    """

    ensure_run_directories()

    pending_runs: list[dict[str, Any]] = []

    for csv_file in sorted(PENDING_DIR.glob("*.csv")):
        manifest_file = csv_file.with_suffix(".json")

        if not manifest_file.exists():
            pending_runs.append(
                {
                    "id": csv_file.stem,
                    "csv_file_name": csv_file.name,
                    "manifest_file_name": None,
                    "session_id": None,
                    "title": None,
                    "started_at": None,
                    "ended_at": None,
                    "duration_seconds": None,
                    "sample_count": None,
                    "status": "missing_manifest",
                    "error": "Manifest JSON file is missing.",
                }
            )
            continue

        try:
            manifest = read_manifest(manifest_file)

            pending_runs.append(
                {
                    "id": csv_file.stem,
                    "csv_file_name": csv_file.name,
                    "manifest_file_name": manifest_file.name,
                    "session_id": manifest.get("session_id"),
                    "title": manifest.get("title"),
                    "started_at": manifest.get("started_at"),
                    "ended_at": manifest.get("ended_at"),
                    "duration_seconds": manifest.get(
                        "duration_seconds"
                    ),
                    "sample_count": manifest.get("sample_count"),
                    "selected_metrics": manifest.get(
                        "selected_metrics",
                        [],
                    ),
                    "status": "pending",
                    "error": None,
                }
            )

        except PendingRunError as error:
            pending_runs.append(
                {
                    "id": csv_file.stem,
                    "csv_file_name": csv_file.name,
                    "manifest_file_name": manifest_file.name,
                    "session_id": None,
                    "title": None,
                    "started_at": None,
                    "ended_at": None,
                    "duration_seconds": None,
                    "sample_count": None,
                    "status": "invalid_manifest",
                    "error": str(error),
                }
            )

    return pending_runs


def upload_pending_run(
    run_id: str,
    token: str,
) -> dict[str, Any]:
    """
    Upload one CSV and manifest pair to the backend.

    Files are moved from runs/pending to runs/uploaded only after the backend
    returns a successful response.
    """

    ensure_run_directories()

    if not token.strip():
        raise PendingRunError("A Clerk token is required.")

    safe_run_id = validate_run_id(run_id)

    csv_file = PENDING_DIR / f"{safe_run_id}.csv"
    manifest_file = PENDING_DIR / f"{safe_run_id}.json"

    if not csv_file.exists():
        raise PendingRunError(
            f"CSV file does not exist: {csv_file.name}"
        )

    if not manifest_file.exists():
        raise PendingRunError(
            f"Manifest file does not exist: {manifest_file.name}"
        )

    manifest = read_manifest(manifest_file)
    session_id = manifest.get("session_id")

    if not session_id:
        raise PendingRunError(
            f"{manifest_file.name} does not contain a session_id."
        )

    try:
        with (
            csv_file.open("rb") as csv,
            manifest_file.open("rb") as manifest_json,
        ):
            response = requests.post(
                f"{API_URL}/sessions/{session_id}/upload-csv",
                headers={
                    "Authorization": f"Bearer {token.strip()}",
                },
                files={
                    "csv_file": (
                        csv_file.name,
                        csv,
                        "text/csv",
                    ),
                    "manifest_file": (
                        manifest_file.name,
                        manifest_json,
                        "application/json",
                    ),
                },
                timeout=30,
            )

    except requests.ConnectionError as error:
        raise PendingRunError(
            "Could not connect to the backend."
        ) from error
    except requests.Timeout as error:
        raise PendingRunError(
            "The upload request timed out."
        ) from error
    except requests.RequestException as error:
        raise PendingRunError(
            f"Upload request failed: {error}"
        ) from error

    if not response.ok:
        response_message = get_response_message(response)

        raise PendingRunError(
            f"Backend returned {response.status_code}: "
            f"{response_message}"
        )

    move_run_to_uploaded(
        csv_file=csv_file,
        manifest_file=manifest_file,
    )

    return {
        "id": safe_run_id,
        "session_id": session_id,
        "csv_file_name": csv_file.name,
        "manifest_file_name": manifest_file.name,
        "uploaded": True,
        "backend_response": parse_json_response(response),
    }


def upload_all_pending_runs(
    token: str,
) -> list[dict[str, Any]]:
    """
    Attempt to upload every valid run currently in runs/pending.

    One failed upload does not stop the remaining uploads.
    """

    results: list[dict[str, Any]] = []

    for run in get_pending_runs():
        run_id = run["id"]

        if run["status"] != "pending":
            results.append(
                {
                    "id": run_id,
                    "uploaded": False,
                    "error": run["error"]
                    or "Run is not ready to upload.",
                }
            )
            continue

        try:
            result = upload_pending_run(
                run_id=run_id,
                token=token,
            )

            results.append(result)

        except PendingRunError as error:
            results.append(
                {
                    "id": run_id,
                    "uploaded": False,
                    "error": str(error),
                }
            )

    return results


def read_manifest(
    manifest_file: Path,
) -> dict[str, Any]:
    try:
        manifest_text = manifest_file.read_text(
            encoding="utf-8"
        )
        manifest = json.loads(manifest_text)

    except OSError as error:
        raise PendingRunError(
            f"Could not read {manifest_file.name}: {error}"
        ) from error
    except json.JSONDecodeError as error:
        raise PendingRunError(
            f"{manifest_file.name} contains invalid JSON: {error}"
        ) from error

    if not isinstance(manifest, dict):
        raise PendingRunError(
            f"{manifest_file.name} must contain a JSON object."
        )

    return manifest


def validate_run_id(run_id: str) -> str:
    normalized_run_id = run_id.strip()

    if not normalized_run_id:
        raise PendingRunError("Run ID cannot be empty.")

    safe_run_id = Path(normalized_run_id).name

    if safe_run_id != normalized_run_id:
        raise PendingRunError("Invalid run ID.")

    if safe_run_id in {".", ".."}:
        raise PendingRunError("Invalid run ID.")

    return safe_run_id


def move_run_to_uploaded(
    csv_file: Path,
    manifest_file: Path,
) -> None:
    uploaded_csv = get_available_destination(
        UPLOADED_DIR / csv_file.name
    )
    uploaded_manifest = uploaded_csv.with_suffix(".json")

    try:
        shutil.move(
            str(csv_file),
            str(uploaded_csv),
        )
        shutil.move(
            str(manifest_file),
            str(uploaded_manifest),
        )
    except OSError as error:
        raise PendingRunError(
            "The backend accepted the upload, but the local files "
            f"could not be moved: {error}"
        ) from error


def get_available_destination(
    destination: Path,
) -> Path:
    """
    Prevent an older uploaded file from being overwritten.
    """

    if not destination.exists():
        return destination

    counter = 1

    while True:
        candidate = destination.with_name(
            f"{destination.stem}_{counter}{destination.suffix}"
        )

        if not candidate.exists():
            return candidate

        counter += 1


def get_response_message(
    response: requests.Response,
) -> str:
    try:
        response_data = response.json()

        if isinstance(response_data, dict):
            detail = response_data.get("detail")

            if detail:
                return str(detail)

        return str(response_data)

    except requests.JSONDecodeError:
        return response.text or "Unknown backend error"


def parse_json_response(
    response: requests.Response,
) -> Any | None:
    if not response.content:
        return None

    try:
        return response.json()
    except requests.JSONDecodeError:
        return response.text