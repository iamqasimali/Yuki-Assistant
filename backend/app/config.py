"""Paramètres chargés depuis l’environnement."""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Base de données PostgreSQL (asyncpg)
    database_url: str = "postgresql+asyncpg://yuki:yuki@localhost:5432/yuki"

    # Authentification : hash bcrypt du mot de passe (voir .env.example)
    yuki_password_hash: str = ""

    # JWT
    jwt_secret: str = "changez-moi-en-production"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24 * 7

    # Ollama
    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "llama3"
    ollama_vision_model: str = ""  # ex. llava — vide = pas d’analyse vision sur /upload

    # Chat
    context_message_limit: int = 20

    # CORS (origines séparées par des virgules)
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
