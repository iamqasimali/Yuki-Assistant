---
name: deploy
description: Checklist déploiement Docker/VPS (build, compose, santé des services)
disable-model-invocation: true
argument-hint: "[environnement cible, ex. staging ou production]"
---

Tu guides le déploiement de **Yuki Assistant** pour : **$ARGUMENTS**.

1. Vérifier que `docker-compose.yml` (ou équivalent) et les `Dockerfile` sont à jour avec `prompt.md`.
2. Lister les **variables d’environnement** requises (Postgres, JWT, URL Ollama, domaine) sans afficher de secrets.
3. Proposer la séquence : `docker compose build` → `docker compose up -d` (ou scripts du repo) → vérifications (`curl` santé, logs).
4. Rappeler nginx + TLS (Let’s Encrypt) si le déploiement est public.
5. Si quelque chose manque dans le repo, le signaler clairement (fichier à créer ou doc à ajouter).

Adapter les commandes au gestionnaire réel du projet (`docker compose` vs `docker-compose`).
