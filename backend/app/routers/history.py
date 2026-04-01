"""Historique des messages paginé."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Conversation, Message
from app.schemas import HistoryResponse, MessageOut
from app.security import get_current_user

router = APIRouter(tags=["history"])


@router.get("/history", response_model=HistoryResponse)
async def get_history(
    conversation_id: UUID,
    db: AsyncSession = Depends(get_db),
    _user: str = Depends(get_current_user),
    limit: int = Query(50, ge=1, le=200),
    avant_id: UUID | None = Query(None, description="Messages plus anciens que cet identifiant"),
) -> HistoryResponse:
    conv_result = await db.execute(select(Conversation).where(Conversation.id == conversation_id))
    if conv_result.scalar_one_or_none() is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation introuvable.")

    q = (
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.desc())
        .limit(limit + 1)
    )
    if avant_id is not None:
        ref = await db.execute(select(Message).where(Message.id == avant_id))
        ref_msg = ref.scalar_one_or_none()
        if ref_msg is None or ref_msg.conversation_id != conversation_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Curseur de pagination invalide.",
            )
        q = (
            select(Message)
            .where(
                Message.conversation_id == conversation_id,
                Message.created_at < ref_msg.created_at,
            )
            .order_by(Message.created_at.desc())
            .limit(limit + 1)
        )

    result = await db.execute(q)
    rows = list(result.scalars().all())
    has_more = len(rows) > limit
    page = rows[:limit]
    page_chrono = list(reversed(page))

    prochain = None
    if has_more and page:
        prochain = str(page[-1].id)

    messages_out = [
        MessageOut(
            id=m.id,
            role=m.role,  # type: ignore[arg-type]
            content=m.content,
            created_at=m.created_at,
        )
        for m in page_chrono
    ]

    return HistoryResponse(
        messages=messages_out,
        conversation_id=conversation_id,
        prochain_curseur=prochain,
    )
