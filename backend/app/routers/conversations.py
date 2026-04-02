"""Liste des conversations (sidebar)."""

from datetime import datetime

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Conversation, Message
from app.schemas import ConversationListItem, ConversationListResponse
from app.security import get_current_user

router = APIRouter(tags=["conversations"])

_last_msg_subq = (
    select(
        Message.conversation_id.label("cid"),
        func.max(Message.created_at).label("last_at"),
    )
    .group_by(Message.conversation_id)
    .subquery()
)


@router.get("/conversations", response_model=ConversationListResponse)
async def list_conversations(
    db: AsyncSession = Depends(get_db),
    _user: str = Depends(get_current_user),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
) -> ConversationListResponse:
    count_result = await db.execute(select(func.count()).select_from(Conversation))
    total = int(count_result.scalar_one())

    stmt = (
        select(Conversation, _last_msg_subq.c.last_at)
        .outerjoin(_last_msg_subq, Conversation.id == _last_msg_subq.c.cid)
        .order_by(func.coalesce(_last_msg_subq.c.last_at, Conversation.created_at).desc())
        .limit(limit)
        .offset(offset)
    )
    result = await db.execute(stmt)
    rows = result.all()

    items: list[ConversationListItem] = []
    for conv, last_at in rows:
        updated: datetime = last_at if last_at is not None else conv.created_at
        items.append(
            ConversationListItem(
                id=conv.id,
                title=conv.title,
                updated_at=updated,
            )
        )

    return ConversationListResponse(conversations=items, total=total)
