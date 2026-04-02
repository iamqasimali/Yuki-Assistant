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

Démarrer Postgres (depuis la racine du dépôt) :

```bash
docker compose up -d db
```

Appliquer les migrations :

```bash
export DATABASE_URL=postgresql+asyncpg://yuki:yuki@localhost:5433/yuki
uv run alembic upgrade head
```

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
