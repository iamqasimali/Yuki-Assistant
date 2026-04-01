---
paths:
  - "**/frontend/**/*.{ts,tsx,js,jsx,css}"
  - "**/web/**/*.{ts,tsx,js,jsx,css}"
  - "**/src/**/*.{ts,tsx,js,jsx}"
---

# Frontend (React + Vite + Tailwind)

- Textes UI, titres, erreurs réseau : **français**.
- Icônes : **Lucide React** ; styles : **Tailwind** cohérents avec la référence [assistant-yuki-web](https://assistant-yuki-web-u-7l6d.bolt.host).
- Appels API : gérer chargement, erreurs, et annulation si besoin (`AbortController`).
- Upload : états preview / progression ; ne pas envoyer de secrets côté client.
