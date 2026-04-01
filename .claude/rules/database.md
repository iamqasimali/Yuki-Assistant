---
paths:
  - "**/models/**/*.py"
  - "**/migrations/**/*"
  - "**/alembic/**/*"
  - "**/*schema*.py"
---

# Base de données (PostgreSQL + pgvector)

- Schéma pour historique des conversations et contexte utilisateur ; indexer ce qui sert aux listes paginées.
- **pgvector** : embeddings cohérents avec le modèle choisi ; documenter la dimension.
- Migrations versionnées ; éviter les migrations destructives sans plan de rollback.
- Pas de secrets en dur dans le code ; `DATABASE_URL` via environnement.
