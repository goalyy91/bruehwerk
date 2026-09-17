# Backlog

Sammelstelle für Bugs, Änderungswünsche und Ideen aus der Backlog-Session.
Wird hier nur ergänzt, nicht abgearbeitet. Andere Sessions arbeiten Punkte ab
und markieren sie als `[x] erledigt` oder löschen sie.

Format je Eintrag: Datum, kurzer Titel, Beschreibung, ggf. Bezug (Datei/K-Nummer).

---

## Offen

## Erledigt

### 2026-09-17 — Kaffeeblatt → Profil-Klick führt nicht zum Rezept/Loggen
Ursache gefunden: Die Verlaufskurve im Profilblatt beschriftet ihre Achse mit
drei Werten (kleinster/mittlerer/größter Mahlgrad). Bei genau einem
geloggten Shot sind alle drei identisch — `muster/Verlaufskurve.svelte`
benutzte den Beschriftungstext aber als Svelte-`each`-Schlüssel, und Svelte
bricht bei doppeltem Schlüssel mit einem (in Produktion unsichtbaren) Fehler
ab. Betraf "Herr Rüdiger" (ein einziger Shot, über den Bestellungs-Weg
geloggt — der zeigt keine Kurve, daher dort unauffällig).
Gefixt: Schlüssel entfernt (Position statt Text ist die Identität der drei
Marken) — behebt jede Art doppelter Beschriftung, nicht nur diesen Fall.
Zusätzlich: bei nur einem Messwert steht jetzt eine Beschriftung mittig statt
dreimal derselben Zahl (`domain/auswertung.ts::achsMarken`, getestet). Der
identische Bug steckte auch in `einstellungen/Backup.svelte`s Fehlerliste,
gleich mitgefixt. PR folgt.

### 2026-09-14 — Übungsdurchgang zählt auch unbeendet
Uebungsmodus.svelte zählte für "Durchgänge diese Woche" und den
Zielfrequenz-Abgleich alle Durchgänge eines Sets, auch abgebrochene und
noch laufende. Gefixt: Filter auf `art === 'normal' && status ===
'abgeschlossen'` ergänzt (wie UebungsAuswertung.svelte es bereits machte).
PR #35.

### 2026-09-14 — Bar-Dashboard zeigt Übungsmodus fälschlich als "fällig"
Geklärt: "fällig" ist bewusst rein Leitner-Box-getrieben, unabhängig vom
Wochenziel (Konzept: Zielfrequenz ist "für Erinnerungen, nicht für den
Algorithmus") — kein Bug im Verhalten. Die Meldung nannte aber keine Zahl,
was neben der Wochenziel-Kennzahl wie ein Widerspruch wirkte. Gefixt:
Meldungstext nennt jetzt die Anzahl fälliger Aromen
(`domain/hinweise.ts::anzahlUebungFaellig`). PR #35.

### 2026-09-14 — Fastway soll nicht nach Koffein/Bohne fragen
Mit dem Nutzer geklärt: Fastway nimmt immer die auf der Kachel gezeigte
Bohne, ohne Rückfrage (bewusster Konzeptbruch zu K45/K46). Fallback bleibt
für Getränke ohne bekannte Bohne (bisheriger Koffein-/Bohnen-Ablauf).
PR #37.

### 2026-09-14 — Gussplan fehlt beim Abarbeiten der Bestellung
BestellungAbarbeiten.svelte zeigte bei Pour-Over-Durchgängen keinen
Gussplan. Gefixt: dieselbe Ableitung/Platzierung wie ShotErfassung.svelte
übernommen (`muster/Gussplanansicht.svelte`). PR #36.
