from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str
    FRONTEND_URL: str = "https://telemetry.ryanbarszcz.com"

    CLERK_SECRET_KEY: str
    CLERK_JWKS_URL: str
    CLERK_ISSUER: str

    AWS_REGION: str
    AWS_ACCESS_KEY_ID: str
    AWS_SECRET_ACCESS_KEY: str

    S3_BUCKET_NAME: str
    SQS_TELEMETRY_QUEUE_URL: str

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )


settings = Settings()