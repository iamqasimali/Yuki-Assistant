---
name: fix-issue
description: Enchaîner analyse → correctif → vérif pour un bug ou une régression Yuki
disable-model-invocation: true
argument-hint: "[symptôme, erreur, ou numéro d’issue]"
---

Tu traites un problème signalé pour **Yuki Assistant** (`$ARGUMENTS`).

1. **Comprendre** : reformuler le symptôme attendu vs observé ; noter fichiers ou endpoints impliqués.
2. **Investiguer** : lire le code et la config pertinents ; reproduire mentalement ou via tests.
3. **Corriger** : changement minimal, messages utilisateur en **français**.
4. **Vérifier** : lancer le test ou la commande la plus ciblée disponible (`pytest`, `ruff`, `npm run lint`, etc.).
5. **Synthèse** : cause racine en une phrase + fichiers modifiés.

Si l’information est insuffisante, poser au plus **deux** questions ciblées puis continuer avec des hypothèses explicites.
