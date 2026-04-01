# Configuration projet `.claude/`

- Instructions principales : `CLAUDE.md` et `AGENTS.md` à la racine du dépôt (spécification complète dans `prompt.md`).
- **Agents** : `.claude/agents/*.md` — sous-agents spécialisés (revue, debug, tests, etc.).
- **Commandes** : `.claude/commands/*.md` — workflows `/fix-issue`, `/deploy`, `/pr-review`.
- **Règles** : `.claude/rules/*.md` — conventions chargées selon les chemins (`paths` en frontmatter).
- **Hooks** : `.claude/hooks/*.sh` — sécurité Bash avant exécution, lint après écriture.
- **Skills** : `.claude/skills/*/SKILL.md` — savoir-faire réutilisable (ex. `/frontend-design`).

Voir la [documentation des hooks](https://code.claude.com/docs/en/hooks) et des [sous-agents](https://code.claude.com/docs/en/sub-agents).
