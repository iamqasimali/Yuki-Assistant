# Yuki Assistant

Assistant personnel IA avec mémoire, analyse de fichiers (PDF, DOCX, images) et interface en français. Spécification détaillée : [`prompt.md`](prompt.md).

## Architecture

| Partie | Stack |
|--------|--------|
| **backend/** | FastAPI, SQLAlchemy async, PostgreSQL + pgvector, Ollama (`llama3`, option `llava`) |
| **frontend/** | React 19, Vite 6, Tailwind CSS, Lucide React, React Router |
| **docker-compose.yml** | PostgreSQL `pgvector/pgvector:pg16` |

## Prérequis

- Docker (pour Postgres) **ou** PostgreSQL 16 + extension `vector`
- Python 3.11+ (`backend/.venv` recommandé)
- Node.js 20+ / npm
- [Ollama](https://ollama.com/) avec `ollama pull llama3` (et optionnellement `ollama pull llava`)

## Démarrage rapide

### 1. Base de données

```bash
docker compose up -d db
```

### 2. Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate   # Windows : .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
export DATABASE_URL=postgresql+asyncpg://yuki:yuki@localhost:5433/yuki
alembic upgrade head
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Avec **uv** : `uv sync --group dev` puis `uv run alembic upgrade head` et `uv run uvicorn app.main:app --reload --port 8000`.

- API : http://127.0.0.1:8000 — Documentation : http://127.0.0.1:8000/docs  
- Mot de passe par défaut (hash dans `.env.example`) : **`yuki-dev`**

### 3. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

- UI : http://localhost:5173  

## Variables d’environnement

Voir `backend/.env.example` et `frontend/.env.example`. En production : `JWT_SECRET` fort, hash bcrypt unique pour `YUKI_PASSWORD_HASH`, HTTPS.

## Personnalité de Yuki

- Texte système par défaut : `backend/app/prompts.py`  
- Instructions utilisateur supplémentaires : page **Paramètres** (stockées en base via `POST /config`).

## Documentation pour les agents IA

- `AGENTS.md` / `CLAUDE.md`
- `.claude/` — agents, commandes, règles, hooks
