# Offene UX-Punkte — Brühwerk

Stand: 2026-08-22. Die Korrekturrunde aus der vorherigen Fassung dieses
Dokuments (Punkte 1–7: Geräte löschen, Ansehen/Bearbeiten-Trennung,
PID-Screen, „Verhalten“-Block, Rezept-Darstellung, Übergang beim
Routenwechsel) ist erledigt, ebenso der anschließende Abgleich des gesamten
Paket-03-Bestands gegen `docs/ux-regeln.md` (Muster `Knopf.svelte` +
`Kontextmenue.svelte`, Schatten/Trefferflächen/hartkodierte Werte auf Tokens,
Kaffeeblatt-Umbau, Spielraum-Fachfehler Preinfusion/Zeit in
`ShotErfassung.svelte` behoben). Nichts davon ist hier noch offen.

**`docs/konzept.md` bleibt die Quelle für alle K-Nummern und Geschäftsregeln,
`docs/ux-regeln.md` für die Gestaltungsreihenfolge.** Dieses Dokument ist nur
die Aufgabenliste für das, was tatsächlich noch aussteht.

## Bereits geklärt, nicht mehr offen (zur Erinnerung)

- **Profil/Setup-Kompatibilitätsfilter — erledigt 2026-09-08.** War
  zurückgestellt, bis Paket 06 die Verbindung Profil↔Zubereitungsart liefert
  (`bestand.profilFuerZubereitung()`: der Gerätetyp hinter dem Setup
  entscheidet, `bruehgeraetVon(setupId)?.typ`). Paket 06 ist gebaut,
  `Profilblatt.svelte::kompatibleSetups` filtert "Setup ändern" jetzt auf
  Setups mit demselben Gerätetyp — dieselbe Zuordnung, kein zweites Konzept.
  Die separat notierte Setup-Vorbelegung für die Bestellung
  (Ranking-Fenster-Logik wie bei der Bohnen-Vorbelegung) ist beim Bau der
  Bestellung mitgelaufen, ebenfalls erledigt.

- **Koffein-Frage:** Im Konzept entschieden (K45/K46, `docs/konzept.md`):
  Koffein wird vor der Bohne gefragt und filtert die Bohnenliste. Gehört zur
  Bestellung (Paket 06), nicht zu den Einstellungen.
- **Notion-Charge-Import:** Migration legt bei fehlender Charge automatisch
  eine Platzhalter-Charge an, bricht nicht ab (`daten/migration/migrieren.ts`).
