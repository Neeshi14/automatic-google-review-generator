from functools import lru_cache

from pydantic import AnyHttpUrl
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "sqlite:///./review_qr.db"
    gemini_api_key: str = ""
    frontend_url: AnyHttpUrl = "http://localhost:5173"
    backend_url: AnyHttpUrl = "http://localhost:8000"
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    max_generations_per_session: int = 3

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
