---
name: pr-review
description: Revue structurée avant merge (diff, risques, tests)
disable-model-invocation: true
argument-hint: "[branche ou lien PR]"
---

Tu fais une **revue de PR** pour **Yuki Assistant** concernant : **$ARGUMENTS**.

1. Résumer l’objectif du changement en 2–3 phrases.
2. Parcourir le diff (ou les fichiers modifiés) : API, auth, uploads, i18n français, perf évidente.
3. **Bloqueurs** : bugs, régressions sécurité, breaking changes non documentés.
4. **Suggestions** : améliorations non bloquantes.
5. **Tests** : ce qui manque ou ce qui a été bien couvert.

Ton : professionnel, en français ; citations `fichier:contexte` quand utile.
