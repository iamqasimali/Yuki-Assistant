"""Schémas Pydantic (requêtes / réponses)."""

from datetime import datetime
from typing import Any, Literal, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    mot_de_passe: str = Field(..., description="Mot de passe d’accès à Yuki")


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=32000)
    conversation_id: Optional[UUID] = None
    contexte_fichier: Optional[str] = Field(
        None,
        description="Texte extrait d’un fichier déjà envoyé via /upload",
    )


class ChatResponse(BaseModel):
    reponse: str
    conversation_id: UUID


class UploadResponse(BaseModel):
    texte: str
    nom_fichier: str


class MessageOut(BaseModel):
    id: UUID
    role: Literal["user", "assistant"]
    content: str
    created_at: datetime

    model_config = {"from_attributes": True}


class HistoryResponse(BaseModel):
    messages: list[MessageOut]
    conversation_id: UUID
    prochain_curseur: Optional[str] = None


class ConfigOut(BaseModel):
    personnalite_extra: str = ""
    preferences: dict[str, Any] = Field(default_factory=dict)


class ConfigUpdate(BaseModel):
    personnalite_extra: Optional[str] = None
    preferences: Optional[dict[str, Any]] = None
