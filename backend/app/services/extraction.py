"""Extraction de texte depuis PDF, DOCX, TXT et images (option vision)."""

import base64
import io
from pathlib import Path

import httpx
from docx import Document
from fastapi import UploadFile
from pypdf import PdfReader

from app.config import Settings


async def extract_text_from_upload(
    fichier: UploadFile,
    settings: Settings,
) -> tuple[str, str]:
    """Retourne (texte_extrait, nom_fichier)."""
    nom = fichier.filename or "fichier"
    suffix = Path(nom).suffix.lower()
    contenu = await fichier.read()

    if suffix == ".pdf":
        reader = PdfReader(io.BytesIO(contenu))
        parts: list[str] = []
        for page in reader.pages:
            t = page.extract_text()
            if t:
                parts.append(t)
        return ("\n".join(parts).strip() or "(PDF sans texte extractible)", nom)

    if suffix == ".docx":
        doc = Document(io.BytesIO(contenu))
        return ("\n".join(p.text for p in doc.paragraphs).strip() or "(Document vide)", nom)

    if suffix in (".txt", ".md", ".csv"):
        try:
            texte = contenu.decode("utf-8")
        except UnicodeDecodeError:
            texte = contenu.decode("latin-1", errors="replace")
        return (texte.strip() or "(Fichier vide)", nom)

    if suffix in (".png", ".jpg", ".jpeg", ".gif", ".webp"):
        if settings.ollama_vision_model:
            return await _vision_ollama(contenu, nom, settings)
        return (
            "[Image] Aucun modèle vision configuré (OLLAMA_VISION_MODEL). "
            "Joignez l’image dans le chat une fois llava (ou équivalent) configuré.",
            nom,
        )

    raise ValueError(
        f"Type de fichier non pris en charge : {suffix}. "
        "Formats acceptés : PDF, DOCX, TXT, images PNG/JPEG/WebP/GIF."
    )


async def _vision_ollama(raw: bytes, nom: str, settings: Settings) -> tuple[str, str]:
    b64 = base64.b64encode(raw).decode("ascii")
    url = f"{settings.ollama_base_url.rstrip('/')}/api/generate"
    payload = {
        "model": settings.ollama_vision_model,
        "prompt": "Décris brièvement le contenu de cette image en français.",
        "images": [b64],
        "stream": False,
    }
    async with httpx.AsyncClient(timeout=120.0) as client:
        r = await client.post(url, json=payload)
        r.raise_for_status()
        data = r.json()
    texte = (data.get("response") or "").strip() or "(Aucune description)"
    return (texte, nom)
