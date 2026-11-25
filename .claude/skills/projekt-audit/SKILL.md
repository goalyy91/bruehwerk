---
name: projekt-audit
description: Bestehendes Projekt nach Julians Rollout-Ablauf aufräumen — Bestandsaufnahme, CLAUDE.md-Audit, Verifikation, Hook, UI-Audit. Nutzen bei "Projekt auditieren", "CLAUDE.md aufräumen", "Rollout".
---

# Projekt-Audit (Claude Code)

Julian arbeitet per Vibe Coding, ohne Entwickler-Hintergrund. Jeder Schritt endet mit einem kurzen Bericht in verständlicher Sprache und einer Entscheidung per Optionen a/b/c plus Freitext. Nichts löschen oder scharf schalten ohne Freigabe.

Bestehende Projektregeln (CLAUDE.md, Backlog-/Stand-Dateien, Versionierung, Branch-Regeln) gehen vor und werden beim Audit nicht verwässert, sondern nur gestrafft. Bereits gelaufenes Audit (z. B. Velora) nicht wiederholen, nur auf Neues prüfen.

## Ablauf
0. **Optional, Zweitmeinung:** Wenn Julian zustimmt, das offizielle Anthropic-Plugin Claude Code Setup nutzen (`/plugin install claude-code-setup@claude-plugins-official`, dann "Set up Claude Code for this project"). Es ändert keine Dateien. Seine Empfehlungen (Hooks, Skills, MCP-Server, Subagenten) als Liste festhalten und in Schritt 2 gegen die Projektregeln prüfen, nicht pauschal übernehmen.
1. **Bestandsaufnahme (nur lesen):** CLAUDE.md, `.claude/` (Skills, Hooks, Settings), Ordnerstruktur, package.json-Skripte, `.gitignore` (steht `.env` drin?), offensichtliche Geheimnisse im Repo. Bericht: was da ist, was fehlt, was auffällt.
2. **CLAUDE.md-Audit:** Doppeltes, Veraltetes und Allgemeines streichen (globale Regeln liegen in `~/.claude/`), Ziel unter ~130 Zeilen. Wiederkehrende Abläufe (z. B. Backlog-Pflege) als Skill nach `.claude/skills/` auslagern. Vorher/Nachher als Diff zeigen.
3. **Verifikation:** Build/Syntax-Check laufen lassen (z. B. `npm run build` oder vorhandenes Prüfskript). Fehler erklären, nicht stillschweigend beheben.
4. **Hook scharf schalten:** z. B. Syntax-Check als PostToolUse-Hook in `.claude/settings.json`. Danach testen, ob er greift.
5. **UI-Audit:** Skill ux-review (und darin web-design-guidelines) einmal über die bestehende Oberfläche. Befunde nach Schwere vorlegen.
6. **Abschluss:** kurze Zusammenfassung was geändert wurde, Commit mit klarer Nachricht erst nach Julians Freigabe.

Optional: Workspace-Datei gegen Ordnerverwechslung anlegen.
