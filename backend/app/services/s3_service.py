from uuid import uuid4

import boto3
from botocore.exceptions import ClientError
from fastapi import UploadFile

from app.core.config import settings


s3_client = boto3.client(
    "s3",
    region_name=settings.AWS_REGION,
    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
)

async def upload_session_csv(
    session_id: str,
    csv_file: UploadFile,
) -> dict:
    if not settings.S3_BUCKET_NAME:
        raise RuntimeError("S3_BUCKET_NAME is not configured")

    file_bytes = await csv_file.read()

    file_name = csv_file.filename or f"{uuid4()}.csv"
    s3_key = f"sessions/{session_id}/{file_name}"

    s3_client.put_object(
        Bucket=settings.S3_BUCKET_NAME,
        Key=s3_key,
        Body=file_bytes,
        ContentType="text/csv",
    )

    return {
        "file_name": file_name,
        "s3_key": s3_key,
        "file_size_bytes": len(file_bytes),
    }

def download_session_csv_from_s3(
    s3_key: str,
) -> bytes:
    if not settings.S3_BUCKET_NAME:
        raise RuntimeError(
            "S3_BUCKET_NAME is not configured"
        )

    if not s3_key:
        raise RuntimeError(
            "S3 key is missing"
        )
    
    try:
        response = s3_client.get_object(
            Bucket=settings.S3_BUCKET_NAME,
            Key=s3_key,
        )

        return response["Body"].read()
    
    except Exception as error:
        error_code = (
            error.response.get("Error", {})
            .get("Code", "Unknown")
        )

        error_message = (
            error.response.get("Error", {})
            .get("Message", str(error))
        )

        raise RuntimeError(
            f"S3 download failed "
            f"for bucket={settings.S3_BUCKET_NAME}, "
            f"key={s3_key}, "
            f"code={error_code}, "
            f"message={error_message}"
        ) from error