# Agent Instructions — Yuki Assistant

## Source of truth

Full product spec: **`prompt.md`** (personality, API, stack, deployment). Read it before major features or architecture changes.

## Language

- **Product (code comments, UI copy, user-facing API errors, README for end users)** → **French**, per `prompt.md`.
- **Yuki’s runtime replies** → French (persona in `prompt.md` §1).
- **Talking to the project maintainer** (explanations, PR descriptions, chat with the human) → **English** unless they ask otherwise.

## Stack (target)

| Layer | Choice |
|-------|--------|
| Backend | FastAPI, PostgreSQL + pgvector, Ollama (`llama3`, vision `llava` or OCR path) |
| Frontend | React + Vite, Tailwind CSS, Lucide React |
| Deploy | Docker Compose, nginx + TLS |

## API shape (reference)

- `POST /chat`, `POST /upload`, `GET /history`, `GET/POST /config`
- Auth: password + JWT or sessions (minimum viable)

## Conventions

- REST + OpenAPI/Swagger on the backend.
- File ingestion: images/PDF/DOCX/TXT with clear extraction errors in French.
- Keep deployment env vars documented when adding services.

## Package manager

Prefer **uv** for Python when `pyproject.toml` exists; otherwise follow lockfiles once added. Prefer **pnpm** if `pnpm-lock.yaml` exists, else **npm** from `package-lock.json`.

## Commit attribution

AI commits MUST include a trailer:

```
Co-Authored-By: Claude <noreply@anthropic.com>
```

(Use the actual model line you are given in-session if different.)

## File-scoped commands

After tooling exists, prefer targeted checks:

| Task | Command (adjust paths) |
|------|-------------------------|
| Python tests | `uv run pytest path/to/test_file.py` or `pytest path/to/test_file.py` |
| Python lint | `uv run ruff check path/to/file.py` |
| Frontend lint | `pnpm eslint path/to/file.tsx` or `npm run lint -- path` |
| Types | `pnpm exec tsc --noEmit` or `npx tsc --noEmit` |

## UI reference

Design target: [assistant-yuki-web-u-7l6d.bolt.host](https://assistant-yuki-web-u-7l6d.bolt.host) — replicate layout/feel, fully wired to the API.

## Claude Code (`.claude/`)

- **Agents** : `.claude/agents/*.md` — reviewer, debugger, tests, refactor, doc, sécurité.
- **Commandes** : `/fix-issue`, `/deploy`, `/pr-review` depuis `.claude/commands/`.
- **Règles** : `.claude/rules/` (API, DB, frontend) avec `paths` pour chargement ciblé.
- **Hooks** : sécurité Bash (`pre-commit.sh`), lint après écriture (`lint-on-save.sh`).
- **Skill** : `/frontend-design` → `.claude/skills/frontend-design/SKILL.md`.
- Index local : `.claude/CLAUDE.md`.
