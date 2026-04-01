"""Connexion par mot de passe (JWT)."""

from fastapi import APIRouter, Depends, HTTPException, status

from app.config import Settings, get_settings
from app.schemas import LoginRequest, LoginResponse
from app.security import create_access_token, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
async def login(
    body: LoginRequest,
    settings: Settings = Depends(get_settings),
) -> LoginResponse:
    if not settings.yuki_password_hash:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Le serveur n’est pas configuré : définissez YUKI_PASSWORD_HASH dans l’environnement.",
        )
    if not verify_password(body.mot_de_passe, settings.yuki_password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Mot de passe incorrect.",
        )
    token = create_access_token(settings)
    return LoginResponse(access_token=token)
