---
name: ux-review
description: UX-Prüfung der gebauten App im Code und im laufenden Browser — Kernaufgaben und Tap-Zahl, Tippflächen, Kontrast, Zustände, Audit mit web-design-guidelines. Nutzen nach UI-Etappen, vor Abnahme, bei "prüf die UX".
---

# UX-Review (Claude Code)

Gegenstück zum Chat-Skill ux-review. Im Chat werden Mockups und Nutzertests bewertet; hier wird geprüft, ob die **gebaute** App hält, was Lastenheft und Mockups versprechen. Julian ist kein Entwickler: Befunde verständlich formulieren, Code-Details nur im Anhang.

## Grundlagen
- **Projektregeln gehen vor.** Zuerst CLAUDE.md und vorhandene Gestaltungsregeln lesen (z. B. `docs/ux-regeln.md`, Design-Tokens in `SPEC.md`, Musterbibliothek). Was dort bewusst entschieden ist (auch "bewusst nicht gebaut"), ist kein Befund. Verifikationsregeln der CLAUDE.md (z. B. "CSS nur theoretisch prüfen") ebenfalls einhalten und Abweichungen davon nur vorschlagen.
- Maßstab: Kernaufgaben mit Ziel-Tapzahl aus dem Anforderungsdokument (`LASTENHEFT.md`, `docs/konzept.md`, `docs/SPEC.md`, `wisp-spec.md` o. Ä.) und die freigegebenen Mockups. Fehlen Zielwerte, nachfragen statt raten.
- Zielgerät: Android-Handy, PWA, Hochformat (Prüfbreite 390 px), oft einhändig.
- Nichts eigenmächtig umbauen. Erst Befundliste, dann Julian entscheiden lassen (beheben / später / bewusst so lassen).

## Prüfschritte
1. **Kernaufgaben im laufenden Build:** App lokal starten (Befehl aus CLAUDE.md). Wenn Playwright verfügbar ist und die CLAUDE.md es zulässt, jede Kernaufgabe in 390 px Breite durchklicken (vorhandenen Test-Harness nutzen, z. B. `test/drive.js`), Taps zählen, Screenshots je Schritt. Sonst Tap-Pfad aus dem Code ableiten und das als Ableitung kennzeichnen.
2. **Tippflächen:** interaktive Elemente unter 48 × 48 px (Material-Richtwert) oder mit zu wenig Abstand auflisten.
3. **Daumenbereich:** primäre Aktionen in der unteren Bildschirmhälfte? Wichtiges oben in den Ecken markieren.
4. **Kontrast und Lesbarkeit:** Text unter 4,5:1 (großer Text unter 3:1) aus den tatsächlichen CSS-Werten berechnen. Information nur über Farbe? Schrift unter 16 px für Fließtext?
5. **Zustände:** Für jeden Bildschirm leer / lädt / Fehler / offline prüfen. Was sieht man, was kann man tun? Geht beim Schließen und Wiederöffnen etwas verloren?
6. **Konsistenz:** uneinheitliche Abstände, Schriftgrößen, Farben außerhalb der Design-Tokens, unterschiedliche Begriffe für dasselbe.
7. **Audit:** Skill web-design-guidelines über die geänderten Dateien laufen lassen, Befunde übernehmen.

## Ausgabe
1. Kurzurteil in 2–3 Sätzen.
2. Tabelle Kernaufgaben: Aufgabe · Taps ist · Taps Ziel · Hindernis.
3. Befunde nach Schwere: 4 kritisch (Kernaufgabe scheitert, Datenverlust) · 3 hoch · 2 mittel · 1 kosmetisch. Je Befund: Bildschirm/Element · Problem · Warum · Vorschlag · Aufwand · `datei:zeile`.
4. Top 3 nach Wirkung pro Aufwand.
5. Entscheidung per Optionen a/b/c plus Freitext. Erst nach Freigabe umsetzen, danach betroffene Kernaufgaben erneut messen.
