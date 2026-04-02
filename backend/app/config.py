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
    database_url: str = "postgresql+asyncpg://yuki:yuki@localhost:5433/yuki"

    # Authentification : hash bcrypt du mot de passe (voir .env.example)
    yuki_password_hash: str = ""

    # JWT
    jwt_secret: str = "changez-moi-en-production"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24 * 7

    # Ollama
    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "llama3"
    # Liste séparée par des virgules ; vide = seul OLLAMA_MODEL est autorisé (sécurité)
    ollama_model_allowlist: str = ""
    ollama_vision_model: str = ""  # ex. llava — vide = pas d’analyse vision sur /upload

    # Chat
    context_message_limit: int = 20

    # CORS (origines séparées par des virgules)
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def ollama_model_allowlist_parsed(self) -> list[str]:
        raw = self.ollama_model_allowlist.strip()
        if not raw:
            return []
        return [x.strip() for x in raw.split(",") if x.strip()]


def resolve_ollama_chat_model(settings: Settings, requested: str | None) -> str:
    """Choisit le modèle Ollama ; lève ValueError si la requête est refusée."""
    default = (settings.ollama_model or "").strip() or "llama3"
    allow = settings.ollama_model_allowlist_parsed
    if not allow:
        r = (requested or "").strip()
        if r and r != default:
            raise ValueError("Modèle non autorisé.")
        return default
    if requested and requested.strip():
        choice = requested.strip()
    else:
        choice = default if default in allow else allow[0]
    if choice not in allow:
        raise ValueError(f"Modèle non autorisé : {choice}")
    return choice


def ollama_models_for_api(settings: Settings) -> tuple[list[str], str]:
    """Liste pour GET /models et modèle par défaut."""
    default = (settings.ollama_model or "").strip() or "llama3"
    allow = settings.ollama_model_allowlist_parsed
    if not allow:
        return ([default], default)
    resolved_default = default if default in allow else allow[0]
    return (allow, resolved_default)


@lru_cache
def get_settings() -> Settings:
    return Settings()
