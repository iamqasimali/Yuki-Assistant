"""Préférences et personnalité (GET/POST /config)."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.config_store import ensure_config_row, load_config_data
from app.database import get_db
from app.schemas import ConfigOut, ConfigUpdate
from app.security import get_current_user

router = APIRouter(tags=["config"])


@router.get("/config", response_model=ConfigOut)
async def get_config(
    db: AsyncSession = Depends(get_db),
    _user: str = Depends(get_current_user),
) -> ConfigOut:
    await ensure_config_row(db)
    data = await load_config_data(db)
    return ConfigOut(
        personnalite_extra=str(data.get("personnalite_extra") or ""),
        preferences=data.get("preferences") if isinstance(data.get("preferences"), dict) else {},
    )


@router.post("/config", response_model=ConfigOut)
async def update_config(
    body: ConfigUpdate,
    db: AsyncSession = Depends(get_db),
    _user: str = Depends(get_current_user),
) -> ConfigOut:
    row = await ensure_config_row(db)
    current = dict(row.data or {})
    if body.personnalite_extra is not None:
        current["personnalite_extra"] = body.personnalite_extra
    if body.preferences is not None:
        current["preferences"] = body.preferences
    row.data = current
    db.add(row)
    await db.flush()
    return ConfigOut(
        personnalite_extra=str(current.get("personnalite_extra") or ""),
        preferences=current.get("preferences") if isinstance(current.get("preferences"), dict) else {},
    )
