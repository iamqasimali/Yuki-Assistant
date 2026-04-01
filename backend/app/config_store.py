"""Lecture / mise à jour de la configuration applicative (ligne unique id=1)."""

from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import AppConfigRow

DEFAULT_CONFIG: dict[str, Any] = {
    "personnalite_extra": "",
    "preferences": {},
}


async def load_config_data(db: AsyncSession) -> dict[str, Any]:
    result = await db.execute(select(AppConfigRow).where(AppConfigRow.id == 1))
    row = result.scalar_one_or_none()
    if row is None:
        return DEFAULT_CONFIG.copy()
    merged = {**DEFAULT_CONFIG, **(row.data or {})}
    return merged


async def ensure_config_row(db: AsyncSession) -> AppConfigRow:
    result = await db.execute(select(AppConfigRow).where(AppConfigRow.id == 1))
    row = result.scalar_one_or_none()
    if row is None:
        row = AppConfigRow(id=1, data=dict(DEFAULT_CONFIG))
        db.add(row)
        await db.flush()
    return row
