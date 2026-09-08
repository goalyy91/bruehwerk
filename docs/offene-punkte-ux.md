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

## 1. Profil/Setup-Modell: Kompatibilitätsfilter Setup

**Kontext:** Die Setup-Auswahl beim Anlegen/Ändern eines Profils
(`Profilblatt.svelte`, `Kaffeeblatt.svelte`) zeigt aktuell alle vorhandenen
Setups, unabhängig vom Gerätetyp. Ein Pour-Over-Profil könnte so versehentlich
an ein Espresso-Setup gebunden werden.

**Blockiert durch eine offene Modellfrage:** Es gibt aktuell kein
Getränke-Konzept im Code, das einem Profil eine Zubereitungsart zuordnet.
`Profil` (`daten/schema/kaffee.ts`) hat nur `kaffeeId` + `setupId` + `name` —
keine Referenz auf eine Getränkeart. Diese Verbindung ergibt sich erst aus dem
Bau von Paket 06 (Getränke/Bestellung).

**Entscheidung (bereits getroffen, nur noch nicht fällig):** Zurückstellen bis
Paket 06 — dann ergibt sich die Verbindung Profil↔Getränk ohnehin aus dem Bau
dieses Pakets. Nicht vorab am `Bruehgeraet.typ` oder `Kaffee.geeignetFuer`
behelfsweise filtern (das wäre Zweckentfremdung von `geeignetFuer`, das ist als
Bohnen-Eigenschaft gedacht, nicht als Profil-Filter).

Dieselbe Session hat auch schon die Setup-Vorbelegung für die Bestellung
entschieden (Ranking-Fenster-Logik wie bei der Bohnen-Vorbelegung, K12/K56,
≥60 % vorbelegt / 40–60 % gefragt ohne Vorbelegung / ≤40 % gar nicht gefragt,
kein separater Kontext-Umschalter) — das hängt ebenfalls an Paket 06 und ist
hier nur als Erinnerung notiert, damit es beim Bauen nicht neu verhandelt
werden muss.

## Bereits geklärt, nicht mehr offen (zur Erinnerung)

- **Koffein-Frage:** Im Konzept entschieden (K45/K46, `docs/konzept.md`):
  Koffein wird vor der Bohne gefragt und filtert die Bohnenliste. Gehört zur
  Bestellung (Paket 06), nicht zu den Einstellungen.
- **Notion-Charge-Import:** Migration legt bei fehlender Charge automatisch
  eine Platzhalter-Charge an, bricht nicht ab (`daten/migration/migrieren.ts`).
