"""Appels au serveur Ollama (chat)."""

import httpx

from app.config import Settings
from app.prompts import YUKI_SYSTEM_PROMPT


async def generate_reply(
    settings: Settings,
    messages: list[dict[str, str]],
    personnalite_extra: str = "",
) -> str:
    """
    messages : liste de { "role": "user"|"assistant", "content": "..." }
    pour l’API chat d’Ollama.
    """
    system = YUKI_SYSTEM_PROMPT
    if personnalite_extra.strip():
        system += "\n\nInstructions supplémentaires de l’utilisateur :\n" + personnalite_extra.strip()

    url = f"{settings.ollama_base_url.rstrip('/')}/api/chat"
    ollama_messages = [{"role": "system", "content": system}, *messages]
    payload = {
        "model": settings.ollama_model,
        "messages": ollama_messages,
        "stream": False,
    }
    async with httpx.AsyncClient(timeout=300.0) as client:
        r = await client.post(url, json=payload)
        if r.status_code >= 400:
            detail = r.text[:500]
            raise RuntimeError(
                f"Ollama a répondu {r.status_code}. Vérifiez que le modèle "
                f"« {settings.ollama_model} » est disponible (ollama pull). Détail : {detail}"
            )
        r.raise_for_status()
        data = r.json()
    msg = data.get("message") or {}
    content = msg.get("content") or ""
    return content.strip() or "Je n’ai pas pu formuler de réponse. Réessaie dans un instant."
