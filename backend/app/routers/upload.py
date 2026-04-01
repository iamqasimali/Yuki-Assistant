"""Extraction de texte depuis un fichier uploadé."""

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from app.config import Settings, get_settings
from app.schemas import UploadResponse
from app.security import get_current_user
from app.services.extraction import extract_text_from_upload

router = APIRouter(tags=["upload"])


@router.post("/upload", response_model=UploadResponse)
async def upload_fichier(
    fichier: UploadFile = File(...),
    settings: Settings = Depends(get_settings),
    _user: str = Depends(get_current_user),
) -> UploadResponse:
    try:
        texte, nom = await extract_text_from_upload(fichier, settings)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Lecture du fichier impossible : {e!s}",
        ) from e
    return UploadResponse(texte=texte, nom_fichier=nom)
