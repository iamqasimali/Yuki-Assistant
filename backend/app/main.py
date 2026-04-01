"""Point d’entrée FastAPI."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import auth, chat, config_route, history, upload

settings = get_settings()

app = FastAPI(
    title="Yuki Assistant API",
    description="API REST pour l’assistant personnel Yuki (mémoire, fichiers, Ollama).",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(chat.router)
app.include_router(upload.router)
app.include_router(history.router)
app.include_router(config_route.router)


@app.get("/health")
async def sante() -> dict[str, str]:
    """Sonde de disponibilité (charge équilibreur / Docker)."""
    return {"statut": "ok"}
