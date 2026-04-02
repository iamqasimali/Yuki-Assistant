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

Depuis la **racine du dépôt** (là où se trouve `docker-compose.yml`) :

```bash
docker compose up -d db
```

Vérifiez que le conteneur écoute bien : `docker compose ps`. Le port **5432** doit être libre ; sinon Compose ne pourra pas publier le service ou un autre Postgres prendra la connexion.

### Dépannage : `FATAL: role "yuki" does not exist`

Cela signifie qu’une base PostgreSQL répond sur `localhost:5432`, mais **sans** l’utilisateur `yuki` (souvent Postgres local Homebrew / Postgres.app, pas l’image du projet).

1. **Recommandé** : arrêter l’autre Postgres sur 5432 (ou changer son port), puis `docker compose up -d db` et réessayez `alembic upgrade head`.
2. **Alternative** : dans `docker-compose.yml`, mappez par ex. `"5433:5432"` et utilisez  
   `DATABASE_URL=postgresql+asyncpg://yuki:yuki@localhost:5433/yuki`.
3. **Sans Docker** : en `psql` en superutilisateur, par exemple :

```sql
CREATE USER yuki WITH PASSWORD 'yuki';
CREATE DATABASE yuki OWNER yuki;
\c yuki
CREATE EXTENSION IF NOT EXISTS vector;
```

Puis `DATABASE_URL=postgresql+asyncpg://yuki:yuki@localhost:5432/yuki` (ou le port réel de votre instance).

### Dépannage : `command not found: alembic`

`alembic` n’est pas installé globalement : il est dans le **venv**. Soit vous activez le venv (`source .venv/bin/activate` sous macOS/Linux), soit vous appelez l’exécutable directement depuis `backend/` :

```bash
.venv/bin/alembic upgrade head
.venv/bin/uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

(Équivalent : `python -m alembic` / `python -m uvicorn` **avec le `python` du venv**.)

### 2. Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate   # Windows : .venv\Scripts\activate — requis pour `alembic` / `uvicorn` dans le PATH
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

### Chat UI / Ollama (English)

- **`OLLAMA_MODEL_ALLOWLIST`** (optional): comma-separated model names exposed in the web UI and accepted on `POST /chat` (e.g. `llama3,mistral`). If **empty**, only **`OLLAMA_MODEL`** is allowed; any other `model` in the request body is rejected (avoids arbitrary model injection).
- **`GET /models`** (authenticated): returns `{ "models": [...], "default": "..." }` for the header dropdown.
- **Microphone** in the chat composer is a **stub** (disabled, “Bientôt disponible”); speech-to-text is not implemented yet.

## Personnalité de Yuki

- Texte système par défaut : `backend/app/prompts.py`  
- Instructions utilisateur supplémentaires : page **Paramètres** (stockées en base via `POST /config`).

## Documentation pour les agents IA

- `AGENTS.md` / `CLAUDE.md`
- `.claude/` — agents, commandes, règles, hooks
