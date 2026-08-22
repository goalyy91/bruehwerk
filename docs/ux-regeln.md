# UX- und Design-Arbeitsregeln — Brühwerk

Diese Regeln beschreiben **wie** gestaltet wird, nicht **was** gebaut wird. Die
fachlichen Regeln — Bündelung, Spielraum, Herkunftszeichen, Sprache — stehen weiter in
`docs/konzept.md` und `CLAUDE.md`. Bei Widerspruch gewinnt `docs/konzept.md`, und dann
gehört dieses Dokument korrigiert.

Ziel ist nicht, möglichst viele Designideen einzubauen, sondern eine **ruhige,
konsistente, im Alltag schnelle App**, die sich wie eine persönliche Werkstatt anfühlt —
nicht wie ein Dashboard.

Grundlage sind die neunundsiebzig Gestaltungspunkte (`K1`–`K79`) aus den sechs
Design-Sitzungen, das Tokenblatt `src/muster/tokens.css` und die 22 Muster-Komponenten
in `src/muster/`. Diese Regeln ändern daran nichts — sie legen fest, in welcher
Reihenfolge man denkt, wenn ein neuer Bildschirm oder eine neue Informationshierarchie
entsteht.

---

## 1. Drei Perspektiven vor jeder größeren UI-Änderung

Bei neuen Bildschirmen, neuen Mustern, oder einer Änderung an der Informationshierarchie
eines bestehenden Bildschirms werden immer drei Abschnitte durchlaufen — als benannte
Abschnitte **in einer Antwort**, ohne eigene Subagenten dafür zu starten (die würden
Konzept und Muster kalt neu erarbeiten müssen, siehe `~/.claude/CLAUDE.md`,
Effizienz-Vorgaben). Bei reinen Textänderungen oder Bugfixes entfällt der Durchlauf.

**Perspektive 1 — UX.** Nur die Frage: funktioniert dieser Screen intuitiv und
effizient? Was will der Nutzer hier hauptsächlich tun, ist die Aktion sofort erkennbar,
was kann verborgen bleiben, gibt es unnötige Taps oder Entscheidungen, ist die
Hierarchie eindeutig, funktioniert die Bedienung einhändig auf dem Telefon? Kein Code.

**Perspektive 2 — Brühwerk-Design.** Fühlt sich der Screen wie Brühwerk an? Geprüft
werden Hierarchie, Typografie, Abstände, Dichte, die vorhandenen Muster (Karten, Buttons,
Segment, Einzelauswahl, Übergänge), Konsistenz mit bestehenden Bildschirmen. Auch hier
kein Code.

**Perspektive 3 — Synthese/Umsetzung.** Erst hier wird entschieden und implementiert:
welche Vorschläge bringen wirklich etwas, was ist mit geringem Aufwand machbar, was wäre
Overengineering, welche vorhandene Komponente lässt sich wiederverwenden.

Das verzahnt sich mit dem allgemeinen Plan-Mode-Vorgehen aus `~/.claude/CLAUDE.md`:
Perspektive 1 und 2 gehören **in den Plan** (vor deiner Freigabe), Perspektive 3 ist das,
was nach der Freigabe passiert. Es entstehen keine drei konkurrierenden Prozesse,
sondern eine feste Reihenfolge:

**UX prüfen → Brühwerk-Design prüfen → sinnvollste Lösung synthetisieren → erst dann
implementieren.**

---

## 2. Progressive Disclosure — je Bildschirm neu entschieden

Brühwerk zeigt zuerst, was in der jeweiligen Situation wichtig ist. Auf jedem Bildschirm
wird in Perspektive 1 die Frage gestellt: **was ist jetzt wirklich relevant?**

Das Ergebnis dieser Prüfung ist **nicht vorentschieden**. Zwei Ausgänge sind beide
gültig:

- **Dichte bleibt, visueller Lärm sinkt.** Für die dichten Bildschirme aus den
  Design-Sitzungen (Shot-Erfassung, Gussplan-Editor) war Dichte eine bewusste
  Entscheidung — alles auf einen Blick, kein Blättern während des Bezugs. Hier heißt die
  Prüfung: gleiche Information, ruhigere Darstellung.
- **Progressive Disclosure.** Wo Dichte nicht aus Tempo-Gründen gewählt wurde (z. B.
  Kaffeeblatt, Einstellungen), darf Information tiefer gelegt werden.

Grundregel, wenn Progressive Disclosure der Ausgang ist:

**Wichtig jetzt → sichtbar. Wichtig manchmal → erreichbar. Selten benötigt →
versteckt.**

Beispiel mit echten Feldern: Ein Kaffee-Detail zeigt zuerst Name, Profil-Modus
(`dialin`/`eingefahren`, `daten/schema/kaffee.ts:222`), letzter Shot und die primäre
Aktion. Herkunft, komplette Shot-Historie und Charge dürfen tiefer liegen.

---

## 3. Eine dominante Primäraktion pro Screen

Jeder Screen hat möglichst eine klar erkennbare Hauptaktion: Shot loggen, Bestellung
aufnehmen, Guss hinzufügen, Urteil geben. Sekundäre Funktionen dürfen die Primäraktion
nicht visuell konkurrenzieren — keine zwei gleich stark dargestellten Buttons.

---

## 4. Sekundäraktionen aus der Hauptoberfläche entfernen

Aktionen wie bearbeiten, duplizieren, exportieren, archivieren, zurücksetzen, löschen
müssen nicht permanent sichtbar sein.

**Regel:** Was regelmäßig gebraucht wird, bleibt sichtbar. Was nur gelegentlich
gebraucht wird, wandert ins **`⋯`-Kontextmenü** in der Kopfzeile.

Das ist ein noch nicht gebauter Baustein (vorgeschlagener Name:
`src/muster/Kontextmenue.svelte`) — solange ein Bildschirm nur eine Sekundäraktion hat
(wie aktuell das Bearbeiten beim Kaffee), bleibt es beim vorhandenen Stift-Symbol in
`Kopfzeile.svelte` (`aktion`-Snippet-Slot). Das `⋯`-Menü kommt, sobald ein Bildschirm
mehr als eine Sekundäraktion braucht — absehbar beim Geräte-Löschen
(`docs/offene-punkte-ux.md`, Punkt 1).

**Bewusst kein Bottom Sheet.** `AuswahlListe.svelte` deckt „zuklappbare Auswahl aus
mehreren Werten" bereits ab, ein zweiter Baustein für denselben Zweck wäre Redundanz
(Regel 12, Konsistenz vor Einzellösung).

**Bewusst keine Wischgeste zum Löschen** (K44) — auch nicht, wenn eine Referenz-App das
so macht. Einen Schritt mitten im Aufguss oder ein Gerät wegzuwischen bemerkt man zu
spät.

---

## 5. Auswahl statt Formular

Bei wenigen klar definierten Zuständen (etwa zwei bis fünf) keine Dropdowns oder
unnötigen Formulare — stattdessen die vorhandenen Auswahl-Muster:

| Muster | Wofür |
| --- | --- |
| `Segment.svelte` | gleich breite Auswahl-Leiste, z. B. Stärke `leicht · deutlich` |
| `Einzelauswahl.svelte` | einzelne Option aus wenigen |
| `Urteil.svelte` | Shot-Urteil `daneben · okay · sehr gut · Referenz` |
| `Schalter.svelte` | Ein/Aus, z. B. Koffein `normal · entkoffeiniert` |
| `AuswahlListe.svelte` | zuklappbares Auswahlfeld für längere Listen, **kein** offenes `<select>`-Äquivalent |

**Sprachlich wichtig:** Das Wort *Chip* ist in Brühwerk belegt — ein Chip ist eine
**Auffälligkeit mit Stärke** (K53, `Chips.svelte`, z. B. „deutlich papierig"), kein
allgemeines Auswahlelement. Ein Chip trägt immer eine Stärke, die durch mehrfaches
Tippen wechselt; für reine Zustandsauswahl ohne Stärke gilt eines der Muster oben.

---

## 6. Das vorhandene Design-System — nicht neu erfinden

Brühwerk hat bereits einen kleinen, verbindlichen Komponentenbaukasten. Neue Varianten
entstehen nur, wenn eine konkrete Aufgabe mit dem Vorhandenen nicht lösbar ist.

**Tokens** (`src/muster/tokens.css`):

- Fläche: `--grund` (Hintergrund) · `--ruhig` · `--feld` · `--feld-blatt` als
  Flächenhierarchie über Farbwerte — **keine Schatten**.
- Text: `--tinte` (Titel) · `--satz` (Inhalt) · `--gedaempft` (Meta/Sekundär).
- Akzent: `--akzent` (kein „Primärfarbe"-Konzept mit gefüllten Buttons — der Akzent ist
  zurückhaltend eingesetzt), `--achtung`, `--kritisch`.
- Typografie: `--fs-fuehrung` (44 px, Führungswert) · `--fs-titel` · `--fs-urteil` ·
  `--fs-satz` · `--fs-meta` · `--fs-label`.
- Abstand/Radius: `--seitenrand`, `--treffer` (48 px Trefferfläche), `--r1`–`--r7`.
  `--radius-feld: 0` und `--radius-chip: 2px` sind bewusst harte Kanten, kein
  App-typisches Abrunden.
- Bewegung: `--t-ebene`, `--t-auswahl`, `--t-uebernehmen` mit `--e-rein`/`--e-raus`,
  `prefers-reduced-motion` global respektiert.

**Muster** (`src/muster/`, 22 Bausteine, vollständige Liste im Musterblatt
`src/bereiche/Musterblatt.svelte`): u. a. `Ablaufliste`, `AuswahlListe`,
`BausteinListe`, `Bohnen`, `Chips`, `DoppelteEinheit`, `DrillDown`, `Einzelauswahl`,
`Herkunft`, `IstGegenZiel`, `Kopfzeile`, `LesartUmschalter`, `Rangliste`, `Schalter`,
`Segment`, `Sterne`, `Treppe`, `Urteil`, `Verlaufskurve`, `VorbelegteFrage`,
`Vorschlag`, `Werteliste`.

Vor jedem neuen Baustein: passt eines der 22 Muster mit kleiner Anpassung? Erst wenn
das nachweislich nicht geht, entsteht ein neues Muster — und es gehört ins Musterblatt
(Paket 01b, K74).

---

## 7. Der Zwei-Tap-Alltagspfad ist heilig

**App auf → Getränk antippen (steht wegen des Decay-Rankings oben) → „Wie war er?"
antippen, fertig.** Neue Funktionen dürfen zusätzliche Tiefe schaffen, aber diesen Pfad
nicht verlängern. Komplexität gehört hinter den schnellen Einstieg, nicht davor.

---

## 8. Keine Tabellen- und Formular-Optik

Das gilt der **Darstellung**, nicht der **Informationsmenge** — die dichten Bildschirme
aus Regel 2 bleiben davon unberührt. Bevor eine Tabelle, eine Formularliste oder eine
technische Property-Ansicht entsteht, prüfen: lässt sich dieselbe Information als
lesbare Zeile mit Label und Einheit darstellen (`Werteliste.svelte`,
`IstGegenZiel.svelte`) statt als Zellenraster?

---

## 9. Kontext vor Vollständigkeit

Dieselbe Entität darf je nach Kontext unterschiedlich dargestellt werden. Beim Shot sind
**Input · Mahlgrad · Output · Zeit** relevant; im Kaffeeblatt eher Herkunft, Röster,
Aufbereitung. Keine universelle Karte bauen, die überall alles zeigt.

---

## 10. Leidenschaft sichtbar machen — außerhalb des Alltagspfads

Kaffees sollen sich wie eine persönliche Sammlung anfühlen. Erkenntnisse, Historie,
besondere Shots und die Entwicklung eines Kaffees dürfen erzählerischer dargestellt
werden als reine Stammdaten — in **Historie**, **Kaffeeblatt** und **Erkenntnissen**.

Grenzen, die aus dem Konzept bereits gelten und hier nicht verhandelt werden:

- **Keine Gamification.**
- **Keine neuen Farben für Zustände** (K69) — kein „bald fällig"-Rot, keine
  Fortschrittsbalken.
- **Nicht im Alltagspfad.** K57/K58 gelten weiter: kein Urteil unter Zeitdruck, kein
  Abschluss-Bildschirm in der Bestellung. Erzählung passiert nachträglich in der
  Historie, nicht zwischen den zwei Taps.

---

## 11. Funktion vor Dekoration

Jedes visuelle Element erfüllt mindestens eine Aufgabe: Hierarchie schaffen, Orientierung
geben, Zustand zeigen, Bedienung erleichtern, Inhalte strukturieren, Persönlichkeit
erzeugen. Dekoration ohne Funktion bleibt die Ausnahme.

---

## 12. Konsistenz schlägt die perfekte Einzellösung

Erfüllt eine bestehende Komponente eine Aufgabe gut genug, wird sie wiederverwendet
statt eine theoretisch perfekte Speziallösung zu bauen. Neunzig Prozent gute, aber
konsistente Komponenten schlagen zehn individuell perfekte, die sich widersprechen.

---

## Umgang mit externen Designreferenzen

Apps wie Things, Crouton, SmartGym, Mela, Craft, Day One, Sofa, Structured, Bear,
Flighty dienen als **Referenzbibliothek**, nicht als Anforderung. Kein Screen wird
kopiert. Stattdessen: welches Problem löst das Pattern, ist dieses Problem auch in
Brühwerk vorhanden, passt die Lösung zur bestehenden Logik, geht es einfacher mit
vorhandenen Mustern?

**Zwei Brühwerk-spezifische Einschränkungen dabei:**

- Diese Apps sind überwiegend **iOS-first**. Referenzgerät für Brühwerk ist
  Android/Chrome (`CLAUDE.md`, *Zwei Türen*) — ein iOS-typisches Pattern zu übernehmen
  ist kein Grund, eine Chrome-eigene Abhängigkeit oder iOS-Testaufwand einzugehen.
- iOS-typische Patterns wie **Wischaktionen** oder **Bottom Sheets als Hauptnavigation**
  stehen teils gegen bestehende Entscheidungen (K44, Regel 4 oben) und werden deshalb
  nicht automatisch übernommen, nur weil eine Referenz-App sie nutzt.

Eine externe Inspiration wird erst Teil von Brühwerk, wenn sie den Drei-Perspektiven-
Prozess bestanden hat.

---

## Entscheidungsregel bei Unsicherheit

- Einfachere vs. komplexere Lösung ohne deutlichen Mehrwert der komplexeren →
  **die einfachere wählen.**
- Änderung sichert nur theoretische Zukunftsmöglichkeiten ab, macht den heutigen Ablauf
  komplizierter → **nicht bauen.**
- Funktion wird selten gebraucht → **tiefer legen statt dauerhaft zeigen.**
- Information lässt sich automatisch ableiten → **nicht zusätzlich abfragen.**
- Bestehendes Pattern funktioniert → **wiederverwenden statt neu erfinden.**

Ziel ist nicht maximale Funktionalität pro Screen, sondern **maximale Klarheit bei der
jeweils aktuellen Aufgabe.**

Das deckt sich mit dem Abschnitt *Was bewusst nicht gebaut wird* in `CLAUDE.md` — dort
stehen die bereits getroffenen Anwendungsfälle dieser Regel (kein Timer, kein Urteil in
der Bestellung, keine Ressourcen/Rüstzeiten in der Oberfläche).
