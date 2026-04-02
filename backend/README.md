# Backend Yuki (FastAPI)

## Prérequis

- Python 3.11+
- [uv](https://docs.astral.sh/uv/)
- PostgreSQL avec extension **pgvector** (l’image Docker du projet l’inclut)

## Installation

```bash
cd backend
cp .env.example .env
uv sync --group dev
```

Démarrer Postgres (depuis la **racine du dépôt**, pas `backend/`) :

```bash
docker compose up -d db
```

Si `alembic` échoue avec **`role "yuki" does not exist`**, le port 5432 est probablement utilisé par un autre PostgreSQL (sans utilisateur `yuki`). Libérez 5432 pour Docker, ou exposez le conteneur sur un autre port (ex. `5433:5432`) et adaptez `DATABASE_URL`.

Appliquer les migrations :

```bash
export DATABASE_URL=postgresql+asyncpg://yuki:yuki@localhost:5432/yuki
uv run alembic upgrade head
```

Avec **pip** et un venv : activez-le (`source .venv/bin/activate`) puis `alembic upgrade head`, ou sans activer : `.venv/bin/alembic upgrade head` depuis ce dossier. Sinon le shell affiche `command not found: alembic`.

## Lancer l’API

```bash
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- Documentation interactive : http://127.0.0.1:8000/docs  
- Santé : http://127.0.0.1:8000/health  

## Générer un nouveau hash de mot de passe

```bash
uv run python -c "import bcrypt; print(bcrypt.hashpw(b'votre-mot', bcrypt.gensalt()).decode())"
```

Placez le résultat dans `YUKI_PASSWORD_HASH`.
