from __future__ import annotations

import argparse
import getpass
import sys

from pending_upload_service import (
    PendingRunError,
    get_pending_runs,
    upload_all_pending_runs,
    upload_pending_run,
)


def parse_arguments() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Upload locally saved vehicle logger runs "
            "to the backend."
        )
    )

    parser.add_argument(
        "--run",
        dest="run_id",
        help=(
            "Upload one specific run by its filename stem. "
            "Example: --run 2026-07-13_10-30-00_mustang"
        ),
    )

    parser.add_argument(
        "--list",
        action="store_true",
        help="List pending runs without uploading them.",
    )

    return parser.parse_args()


def list_runs() -> int:
    runs = get_pending_runs()

    if not runs:
        print("No pending runs found.")
        return 0

    print(f"Found {len(runs)} pending run(s):")
    print()

    for run in runs:
        print(f"Run ID: {run['id']}")
        print(f"CSV: {run['csv_file_name']}")
        print(f"Status: {run['status']}")

        if run.get("session_id"):
            print(f"Session ID: {run['session_id']}")

        if run.get("duration_seconds") is not None:
            print(
                "Duration: "
                f"{max(0, run['duration_seconds'])} seconds"
            )

        if run.get("sample_count") is not None:
            print(f"Samples: {run['sample_count']}")

        if run.get("error"):
            print(f"Error: {run['error']}")

        print("-" * 50)

    return 0


def request_token() -> str:
    token = getpass.getpass(
        "Paste Clerk token: "
    ).strip()

    if not token:
        raise PendingRunError(
            "No Clerk token was provided."
        )

    return token


def upload_one(
    run_id: str,
    token: str,
) -> int:
    print(f"Uploading {run_id}...")

    try:
        result = upload_pending_run(
            run_id=run_id,
            token=token,
        )

    except PendingRunError as error:
        print(f"Upload failed: {error}")
        return 1

    print(
        "Uploaded successfully: "
        f"{result['csv_file_name']}"
    )

    return 0


def upload_all(token: str) -> int:
    runs = get_pending_runs()

    if not runs:
        print("No pending runs to upload.")
        return 0

    valid_runs = [
        run
        for run in runs
        if run["status"] == "pending"
    ]

    if not valid_runs:
        print("No valid pending runs are ready to upload.")

        for run in runs:
            if run.get("error"):
                print(
                    f"- {run['csv_file_name']}: "
                    f"{run['error']}"
                )

        return 1

    print(
        f"Attempting to upload {len(valid_runs)} run(s)..."
    )
    print()

    results = upload_all_pending_runs(token)

    uploaded_count = 0
    failed_count = 0

    for result in results:
        if result.get("uploaded"):
            uploaded_count += 1
            print(
                f"Uploaded: {result['csv_file_name']}"
            )
        else:
            failed_count += 1
            print(
                f"Failed: {result['id']} — "
                f"{result.get('error', 'Unknown error')}"
            )

    print()
    print(
        f"Finished. Uploaded: {uploaded_count}, "
        f"Failed: {failed_count}"
    )

    return 1 if failed_count else 0


def main() -> int:
    args = parse_arguments()

    if args.list:
        return list_runs()

    try:
        token = request_token()
    except PendingRunError as error:
        print(error)
        return 1

    if args.run_id:
        return upload_one(
            run_id=args.run_id,
            token=token,
        )

    return upload_all(token)


if __name__ == "__main__":
    sys.exit(main())