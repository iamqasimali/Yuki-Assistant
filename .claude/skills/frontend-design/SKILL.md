---
name: frontend-design
description: UI Yuki — Tailwind, Lucide, chat + upload, ton français. Utiliser pour composants, pages ou polish visuel aligné sur la ref Bolt.
---

Pour le frontend **Yuki Assistant** :

1. **Structure** : chat principal, zone de saisie, pièces jointes / preview, indicateur de frappe, lien vers paramètres.
2. **Style** : Tailwind, espacements réguliers, états hover/focus accessibles, mode sombre si la ref l’utilise.
3. **Langue** : tous les libellés et toasts en **français**.
4. **Icônes** : `lucide-react` ; éviter des packs mélangés.
5. **Référence visuelle** : [assistant-yuki-web-u-7l6d.bolt.host](https://assistant-yuki-web-u-7l6d.bolt.host) — s’en rapprocher sans copier du code tiers non libre.

Lors d’un changement, préférer des composants petits et réutilisables (bouton envoi, bulle message, carte fichier).
