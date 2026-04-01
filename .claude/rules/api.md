---
paths:
  - "**/backend/**/*.py"
  - "**/api/**/*.py"
  - "**/app/**/*.py"
---

# API FastAPI

- Endpoints attendus : `POST /chat`, `POST /upload`, `GET /history`, `GET/POST /config` (voir `prompt.md`).
- Documentation OpenAPI à jour ; réponses d’erreur **claires et en français**.
- Valider les entrées (Pydantic) ; ne jamais faire confiance aux fichiers uploadés (type, taille).
- Auth minimale : mot de passe + JWT ou sessions ; protéger les routes qui lisent l’historique ou la config.
- Intégration LLM via **Ollama** ; réponses assistant en français, persona Yuki.
