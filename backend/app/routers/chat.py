"""Endpoint de chat avec persistance et Ollama."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.config import Settings, get_settings
from app.config_store import load_config_data
from app.database import get_db
from app.models import Conversation, Message
from app.schemas import ChatRequest, ChatResponse
from app.security import get_current_user
from app.services.ollama import generate_reply

router = APIRouter(tags=["chat"])


@router.post("/chat", response_model=ChatResponse)
async def chat(
    body: ChatRequest,
    db: AsyncSession = Depends(get_db),
    settings: Settings = Depends(get_settings),
    _user: str = Depends(get_current_user),
) -> ChatResponse:
    conv_id: UUID | None = body.conversation_id
    if conv_id is None:
        conv = Conversation(title=None)
        db.add(conv)
        await db.flush()
        conv_id = conv.id
    else:
        result = await db.execute(select(Conversation).where(Conversation.id == conv_id))
        conv = result.scalar_one_or_none()
        if conv is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation introuvable.",
            )

    contenu_utilisateur = body.message.strip()
    if body.contexte_fichier:
        contenu_utilisateur = (
            f"[Contexte fichier]\n{body.contexte_fichier.strip()}\n\n{contenu_utilisateur}"
        )

    db.add(
        Message(
            conversation_id=conv_id,
            role="user",
            content=contenu_utilisateur,
        )
    )
    await db.flush()

    result = await db.execute(
        select(Conversation)
        .where(Conversation.id == conv_id)
        .options(selectinload(Conversation.messages))
    )
    conv_loaded = result.scalar_one()
    triees = sorted(conv_loaded.messages, key=lambda m: m.created_at)
    derniers = triees[-settings.context_message_limit :]
    ollama_messages = [{"role": m.role, "content": m.content} for m in derniers]

    config_data = await load_config_data(db)
    extra = str(config_data.get("personnalite_extra") or "")

    try:
        reponse_texte = await generate_reply(settings, ollama_messages, personnalite_extra=extra)
    except RuntimeError as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(e),
        ) from e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Erreur lors de l’appel au modèle : {e!s}",
        ) from e

    db.add(
        Message(
            conversation_id=conv_id,
            role="assistant",
            content=reponse_texte,
        )
    )

    if conv_loaded.title is None and body.message.strip():
        brut = body.message.strip()
        conv_loaded.title = brut[:80] + ("…" if len(brut) > 80 else "")

    return ChatResponse(reponse=reponse_texte, conversation_id=conv_id)
