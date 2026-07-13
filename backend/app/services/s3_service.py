import os
from uuid import uuid4

import boto3
from fastapi import UploadFile


AWS_REGION = os.getenv("AWS_REGION")
S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME")

s3_client = boto3.client(
    "s3",
    region_name=AWS_REGION,
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
)


async def upload_session_csv(
    session_id: str,
    csv_file: UploadFile,
) -> dict:
    if not S3_BUCKET_NAME:
        raise RuntimeError("S3_BUCKET_NAME is not configured")

    file_bytes = await csv_file.read()

    file_name = csv_file.filename or f"{uuid4()}.csv"
    s3_key = f"sessions/{session_id}/{file_name}"

    s3_client.put_object(
        Bucket=S3_BUCKET_NAME,
        Key=s3_key,
        Body=file_bytes,
        ContentType="text/csv",
    )

    return {
        "file_name": file_name,
        "s3_key": s3_key,
        "file_size_bytes": len(file_bytes),
    }