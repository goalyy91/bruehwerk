# Offene UX-Punkte — Brühwerk

Stand: 2026-08-21, Branch `paket-03-kaffees-profile-shots`. Dieses Dokument ist
für eine neue Chat-Session gedacht, die diese Session nicht kennt — jeder
Punkt ist so beschrieben, dass er ohne Rückfrage umsetzbar ist. Wo eine echte
Entscheidung noch offen ist, steht das explizit dabei.

**`docs/konzept.md` bleibt die Quelle für alle K-Nummern und Geschäftsregeln.**
Dieses Dokument ist nur die Aufgabenliste für die UX-Korrekturrunde, kein
Ersatz dafür.

## Was schon erledigt ist (nicht nochmal anfassen)

- **Paket UX-1 — Navigation & Verlauf**: echter Browser-Verlauf
  (`src/bereiche/route.ts`, `src/bereiche/navigation.svelte.ts`) statt Zustand
  nur im Speicher. Android-Geste, System-Zurück, Zurück-Pfeil laufen alle über
  `navigation.zurueck()`. `Rahmen.svelte` ist der einzige Navigations-Besitzer.
- **Paket UX-2 — Kaffees-Bereich**: Kaffeeblatt ist reine Leseansicht,
  Bearbeiten eine eigene Route (`KaffeeBearbeiten.svelte`) hinter dem
  Stift-Symbol in der Kopfzeile (`Kopfzeile.svelte` hat dafür einen
  `aktion`-Snippet-Slot). Bohnen-Icon ist ein echtes SVG mit Mittelrille.
  Kaffee-Status (offen/angebrochen/leer) ist weg, eine neue Charge markiert
  die alte automatisch als leer — inkl. Röstdatum-Feld dabei. Neue Bausteine
  `muster/Segment.svelte` (gleich breite Auswahl-Leiste) und
  `muster/AuswahlListe.svelte` (zuklappbares Auswahlfeld, **kein** immer
  offenes `<select>`-Äquivalent).
- **Bugfixes**: `touch-action: manipulation` global (tokens.css) gegen
  Tipp-Verzögerung auf Touch-Geräten. `navigation.gehe()` verhindert doppelte
  Verlaufseinträge zur selben Route. **Wichtigster Fund:** `structuredClone()`
  auf Svelte-`$state`-Objekten wirft `"could not be cloned"`, sobald ein
  Array-Feld dabei ist — ersetzt durch `$state.snapshot()` in
  `KaffeeBearbeiten.svelte`, `Muehleblatt.svelte`, `Bruehgeraetblatt.svelte`,
  `Setupblatt.svelte`. **Falls du an einer weiteren Stelle einen neuen
  Entwurf per `untrack(() => structuredClone(bestehend))` baust, benutz
  `$state.snapshot()` statt `structuredClone()` — sonst reproduzierst du
  denselben Fehler.**
- Trefferflächen von `Bohnen.svelte`/`Sterne.svelte` per
  Padding+Gegen-Margin-Trick vergrößert, sichtbare Größe bleibt K79-konform.

## Wie verifizieren, bevor etwas als „fertig" gilt

**Nicht raten.** Diese Session hat zweimal einen UI-Bug fälschlich woanders
vermutet, bevor der echte Fehler (`structuredClone`) per echtem Browser-Test
gefunden wurde. Vorgehen, das sich bewährt hat:

```bash
# einmalig, falls noch nicht vorhanden:
npx --yes playwright install chromium

# Dev-Server im Hintergrund, dann warten bis er antwortet:
npm run dev -- --port 5175 &
timeout 30 bash -c 'until curl -sf http://localhost:5175 >/dev/null; do sleep 1; done'
```

Playwright ist nicht als Projekt-Abhängigkeit installiert — es liegt im
npx-Cache. Node-ESM-Imports brauchen den vollen Dateipfad dorthin, z. B.:

```js
import { chromium } from 'file:///C:/Users/<user>/AppData/Local/npm-cache/_npx/<hash>/node_modules/playwright/index.mjs';
```

(`<hash>` per `find` unter `_npx` ermitteln, siehe oben — oder `npm install
--no-save playwright` direkt im Scratchpad-Ordner ausführen, das ist
sauberer, falls in einer neuen Session verfügbar.)

Skript-Muster: Seite öffnen → Aktion ausführen (`click`/`fill`) →
`page.on('pageerror', …)` mitschneiden → Screenshot → Konsole/Fehler
ausgeben. Nach dem Test: `lsof -ti:5175 -sTCP:LISTEN | xargs -r kill`, um den
Port wieder freizugeben.

Danach immer die volle Kette: `npm test` (vitest → svelte-check → vite
build), dann `git add -A && git commit … && git push origin
paket-03-kaffees-profile-shots` — die Vercel-Preview des Branches
aktualisiert sich automatisch, der User testet dort auf dem Telefon.

---

## 1. Geräte-Verwaltung: Löschen fehlt

**Datei:** `src/bereiche/einstellungen/Geraete.svelte`

**Befund:** Mühle/Brühgerät/Setup sind bearbeitbar (siehe UX-1/UX-2), aber es
gibt **keinen Löschen-Button** in der Oberfläche. `loeschen(sammlung, id)`
existiert bereits generisch in `src/daten/ablage.ts:117-120` und wird
aktuell nirgends für Geräte aufgerufen (nur in `GussplanEditor.svelte` für
Gussplan-Bausteine).

**Aufgabe:** Löschen-Button je Zeile in `Geraete.svelte` (Mühle, Brühgerät,
Setup). Vorher prüfen, ob das Gerät noch referenziert wird:

- Ein **Setup** hängt an `muehleId` + `bruehgeraetId` — eine Mühle/ein
  Brühgerät, das noch in einem Setup steckt, sollte nicht sang- und klanglos
  löschbar sein (sonst zeigt `bestand.muehleVon(setupId)`/`bruehgeraetVon`
  plötzlich `undefined`, mehrere Bildschirme gehen davon aus, dass es das
  Gerät gibt).
- Ein **Profil** hängt an `setupId` (`daten/schema/kaffee.ts:208-222`) — ein
  Setup, das noch in einem Profil steckt, sollte ebenso geschützt sein.

Empfehlung: vor dem Löschen zählen, wie viele abhängige Datensätze existieren
(`bestand.setups.filter(s => s.muehleId === id)` etc.), und wenn > 0 eine
Fehlermeldung statt des Löschens zeigen („wird noch von 2 Setups benutzt").
Kein stilles Kaskadenlöschen — das würde Profile/Setups unbemerkt kaputt
machen.

## 2. Geräte: Ansehen/Bearbeiten-Trennung (wie beim Kaffee)

**Betrifft:** `Muehleblatt.svelte`, `Bruehgeraetblatt.svelte`,
`Setupblatt.svelte`.

**Befund:** Diese drei sind direkte Bearbeitungsformulare — kein
Unterschied zwischen Ansehen und Bearbeiten. Der Kaffee hat das schon
(`Kaffeeblatt.svelte` = Leseansicht, `KaffeeBearbeiten.svelte` = Formular
hinter dem Stift). Der User hat ausdrücklich gesagt: **dieselbe Denke soll
für die gesamte Gerätepflege gelten.**

**Aufgabe:** Für jedes der drei Geräte-Blätter eine Leseansicht bauen, die
alle Werte zeigt (Wertzeilen wie in `Kaffeeblatt.svelte`), mit Stift-Symbol
in der Kopfzeile zum bestehenden Formular. Wichtiger Unterschied zum Kaffee:
Ein **neues** Gerät (kein `id` in der Route) hat naturgemäß keine
Leseansicht — dort direkt das Formular zeigen wie bisher.

Vorschlag für die Routen (`src/bereiche/route.ts`): analog zu
`kaffee`/`kaffeeBearbeiten` z. B.

```ts
| { name: 'muehle'; id: string }            // Ansicht, nur mit id erreichbar
| { name: 'muehleNeu' }                     // Formular fuer neu
| { name: 'muehleBearbeiten'; id: string }  // Formular fuer bestehende
```

— oder einfacher: die bestehende Route `muehle` (mit optionalem `id`) bleibt
das Formular, und eine neue Route `muehleAnsicht` (nur mit Pflicht-`id`) wird
davorgeschaltet, wenn man aus `Geraete.svelte` auf eine bestehende Mühle
tippt. `Geraete.svelte`s `onOeffnenMuehle(id?)` würde bei vorhandener `id`
zur neuen Ansicht navigieren statt direkt zum Formular. Denselben Umbau für
`bruehgeraet`/`setup`.

**Wichtig:** `Rahmen.svelte` muss die neuen Routen verdrahten, `route.test.ts`
um Hin-/Rückweg + `elternVon` + `tabVon` für die neuen Routen ergänzen (siehe
bestehende Tests für `kaffeeBearbeiten` als Vorlage).

## 3. PID / Kesseltemperatur als eigener Screen

**Datei:** `src/bereiche/einstellungen/Bruehgeraetblatt.svelte:198-204`

**Aktueller Code:**

```svelte
{#if entwurf.ktEinstellbar}
  {#if bestehend}
    <TempReferenz bruehgeraetId={bestehend.id} />
  {:else}
    <p class="erklaerung">Die Temperaturtabelle kannst du pflegen, sobald das Gerät angelegt ist.</p>
  {/if}
{/if}
```

**Befund (User-Bug-Report):** Bei einem neuen Gerät zeigt das Aktivieren von
PID nur einen Hinweistext statt eines Eingabefelds — man muss erst speichern,
dann erneut reingehen, um die Tabelle zu sehen.

**Gewünschtes Verhalten:** PID-Schalter aktivieren → sofort erscheint darunter
eine Zeile „Kesseltemperatur-Tabelle pflegen ›“, die auf einen **eigenen
Bildschirm** führt (nicht inline auf demselben Screen). Dort wird die Tabelle
bearbeitet, „Speichern“ führt zurück zum Gerät.

**Zu klären, bevor implementiert wird:** `TempReferenz.svelte` braucht aktuell
eine `bruehgeraetId` — bei einem **neuen, noch nicht gespeicherten** Gerät
gibt es die noch nicht. Zwei Wege:

- **A (einfacher):** Beim Aktivieren von PID wird das Gerät sofort mit einer
  `id` (schon vorhanden, `crypto.randomUUID()` läuft beim Entwurf-Erzeugen)
  aber noch **nicht persistiert** — die Temperaturtabelle lebt vorerst nur im
  lokalen `entwurf.tempReferenz`-Array (das Feld gibt es schon,
  `Bruehgeraet.tempReferenz`), erst der „speichern“-Knopf auf dem
  Haupt-Formular schreibt alles inklusive Tabelle in die Ablage. Der neue
  Screen bekommt dann nicht `bruehgeraetId`, sondern die Werte + einen
  Callback zum Zurückschreiben in `entwurf.tempReferenz`, ähnlich wie
  `GussplanEditor.svelte` es für Profile macht (dort auch kein sofortiges
  Schreiben in die Ablage, sondern State im Eltern-Formular).
- **B:** Erzwingen, dass das Gerät beim ersten PID-Aktivieren sofort
  gespeichert wird (auch wenn der Rest des Formulars noch nicht fertig ist).
  Unschöner, weil ein halb ausgefülltes Formular dann schon einen
  Datensatz erzeugt.

**Empfehlung: A.** Passt zum bestehenden Muster (Entwurf lokal halten, ein
Speichern-Knopf), und `TempReferenz.svelte` müsste dafür so umgebaut werden,
dass sie auch mit einem lokalen Werte-Array statt einer `bruehgeraetId`
arbeitet (Props ändern: `werte` + `onAendern` statt `bruehgeraetId`).

Neue Route z. B. `{ name: 'tempReferenz' }` (kein extra Bezeichner nötig,
weil es immer nur ein Bruehgerät-Formular gleichzeitig offen gibt — die
Rückgabe der Werte läuft über einen Callback, nicht über die Route).

## 4. Profil/Setup-Modell: Kompatibilitätsfilter + Setup-Vorbelegung

**Kontext:** In einer früheren Runde dieser Session wurde entschieden (User
hat bestätigt: **„bin auf jedenfall bei A“**):

> Setup-Auswahl bekommt dieselbe Ranking-Fenster-Logik, die es für die
> Bohnen-Vorbelegung schon gibt (`domain/ranking.ts`, K12/K56): welches Setup
> wurde bei diesem Getränk in den letzten 20 Malen am häufigsten genutzt?
> ≥60 % → vorbelegt, 40–60 % → gefragt ohne Vorbelegung, ≤40 % → gar nicht
> gefragt. Kein separater „Kontext“-Umschalter (Zuhause/Unterwegs/Arbeit).

**Diese Setup-Vorbelegung hängt an der Bestellung/dem Alltagspfad (Paket 06),
die es im Code noch nicht gibt.** Nicht implementieren, bevor Paket 06
ansteht — es gibt noch keinen Bildschirm, an dem „welches Setup für diesen
Bezug“ überhaupt gefragt wird. Nur als Entscheidung hier dokumentiert, damit
sie beim Bauen von Paket 06 nicht neu verhandelt werden muss.

**Was aber JETZT schon Sinn ergeben könnte — Kompatibilitätsfilter:** Beim
Anlegen/Ändern eines Profils zeigt die Setup-Auswahl aktuell **alle**
vorhandenen Setups, unabhängig vom Gerätetyp (`Profilblatt.svelte:92-97`,
`setupWechseln` in Zeile 69; `Kaffeeblatt.svelte:218-222` beim Anlegen eines
neuen Profils). Ein Pour-Over-Profil könnte so versehentlich an ein
Espresso-Setup gebunden werden.

**Blockiert durch eine offene Modellfrage:** Es gibt aktuell **kein
Getränke-Konzept im Code**, das einem Profil eine Zubereitungsart zuordnet.
`Profil` (`daten/schema/kaffee.ts:208-222`) hat nur `kaffeeId` + `setupId` +
`name` — keine Referenz auf eine Getränkeart. Das `Getraenk`-Schema
existiert zwar (`daten/schema/getraenk.ts`), aber es gibt noch keinen
Bereich „Getränke“ (kommt laut `Rahmen.svelte` erst in Paket 06) und keine
Verbindung Profil↔Getränk.

**Zwei Wege, das aufzulösen — noch keine Entscheidung, mit dem User klären:**

1. Den Kompatibilitätsfilter zurückstellen, bis Paket 06 (Getränke/Bestellung)
   ansteht — dann ergibt sich die Verbindung Profil↔Getränk ohnehin aus dem
   Bau dieses Pakets.
2. Vorab am `Bruehgeraet.typ` selbst filtern, ganz ohne Getränke-Bezug: z. B.
   ein Profil, dessen zugehöriger Kaffee `geeignetFuer` (`Kaffee.geeignetFuer`,
   K46) eine bestimmte Zubereitungsart nennt, könnte die Setup-Liste
   einschränken. Fühlt sich aber nach Zweckentfremdung von `geeignetFuer` an
   (das ist als Bohnen-Eigenschaft gedacht, nicht als Profil-Filter) —
   deshalb eher **Option 1 empfohlen**: zurückstellen bis Paket 06.

## 5. Einstellungen: „Verhalten"-Block

**Datei:** `src/bereiche/einstellungen/Einstellungen.svelte:34`

**Befund:** Die drei Schalter (Begründung Koffein, Begründung Bohne, Milch
schäumen) stehen unter der Überschrift `<h2>Allgemein</h2>`. Der User wollte
einen eigenen, klar benannten Block, in dem später weitere einfache
Ein/Aus-Einstellungen dazukommen.

**Aufgabe:** Überschrift zu „Verhalten“ ändern (oder passenderen Namen
wählen), ggf. den Block visuell als eigene Karte fassen (Rahmen/Hintergrund
wie bei den `.gruppe`-Abschnitten im Kaffeeblatt). Kleine, risikoarme
Änderung.

## 6. Rezept-Darstellung (Profilblatt „Ziel") + Shot-Erfassung

Zwei zusammenhängende Punkte, vom User in dieser Session genannt:

### 6a. Profilblatt „Ziel"-Sektion entspricht nicht dem Design

**Datei:** `src/bereiche/kaffees/Profilblatt.svelte:101-157` (Sektion
`<section class="ziel">`)

**Befund:** Die Werte (Input, Mahlgrad, RPM, Kesseltemperatur, Output,
Preinfusion, Zeit) sind handgebaute `<input>`-Felder mit eigenem CSS. Es gibt
bereits ein fertig designtes Baustein-Muster dafür:
**`src/muster/IstGegenZiel.svelte`** („Muster 5“ aus der Design-Übergabe,
K3/K5/K6) — Herkunftszeichen (Ring/Punkt/halb) links, Label, Wert, Einheit als
CSS-Grid, Führungswert 44 px groß, weitere Werte 19 px rechtsbündig in fester
Spalte. Das Profilblatt nutzt dieses Muster **nicht**.

**Wichtig — `IstGegenZiel` passt nicht 1:1:** Diese Komponente ist für den
Vergleich *Ist gegen Ziel* gebaut (K3: „Ziel im Gruppenkopf, Ist mit dem Ziel
vorbelegt“, editierbare `ist`-Werte, Herkunftszeichen zeigen ob ein Wert
berührt/überschrieben wurde). Das Profilblatt zeigt aber nur das **Ziel
selbst** (das Rezept), ohne einen Ist-Vergleich — dafür ist `IstGegenZiel`
konzeptionell nicht gebaut. Vor der Umsetzung klären: entweder

- eine **neue, einfachere Grid-Darstellung** im selben visuellen Stil
  (Grid-Layout, Führungswert-Typografie) aber **ohne** Herkunftszeichen bauen,
  weil beim reinen Rezept nichts „gemessen“ oder „überschrieben“ ist, oder
- `IstGegenZiel` so erweitern, dass sie auch in einem reinen
  „Ziel-Editier“-Modus (ohne Ist-Zeile, ohne Herkunftszeichen) läuft.

Empfehlung: erste Option (neues, einfacheres Grid-Muster), weil das die
Bedeutung von `IstGegenZiel` nicht verwässert — dessen Herkunftszeichen haben
im Konzept eine echte Bedeutung (K54), die im Rezept-Kontext nicht zutrifft.

### 6b. Führungswert-Emphase gehört nicht ins Rezept

**Direkter Zitat-Auftrag vom User:** „im Rezept soll der führende Parameter
(z. B. Output) nicht größer als alles andere sein — das ist nur relevant,
wenn ich gerade einen Shot logge bzw. eine Bestellung abarbeite.“

**Befund:** `Profilblatt.svelte:144-156` markiert das führende Feld
(`fuehrungsFeld === 'output'` bzw. `'zeit'`) über `class:gross` →
`.wert-eingabe.gross` (Zeile 234) mit `font-size: var(--fs-fuehrung)` (44 px).
Das passiert **immer**, auch beim reinen Ansehen/Ändern des Rezepts.

**Aufgabe:** Die `.gross`-Emphase aus `Profilblatt.svelte`s Ziel-Sektion
entfernen — dort sind alle Werte gleich groß. Die Emphase gehört
ausschließlich in den Live-Kontext:
`src/bereiche/shot/ShotErfassung.svelte`, die **bereits** `IstGegenZiel`
korrekt verwendet (dort ist die Führungswert-Größe angebracht, weil dort
tatsächlich Ist gegen Ziel verglichen wird, während ein Shot läuft). Prüfen,
ob `ShotErfassung.svelte` das schon richtig macht (vermutlich ja, da sie
`IstGegenZiel` nutzt) — falls dort ebenfalls ein Fehler auffällt, separat
behandeln.

## 7. (Niedrige Priorität) Übergang beim Routenwechsel

Im ursprünglichen UX-1-Plan war vorgesehen: „Ebenenwechsel bekommt den im
Design vorgesehenen Übergang (`--t-ebene`, `--e-rein`/`--e-raus`): vor/zurück
leicht versetzt eingeblendet, `prefers-reduced-motion` wird respektiert.“ —
das wurde **nicht umgesetzt**, `Rahmen.svelte` wechselt Bildschirme aktuell
ohne Animation. Rein kosmetisch, keine Funktionseinbuße. Die Tokens
`--t-ebene`/`--e-rein`/`--e-raus` existieren bereits in `tokens.css`, ein
`@media (prefers-reduced-motion: reduce)`-Block existiert ebenfalls global
(deaktiviert alle Animationen auf 1 ms) — eine neue Transition müsste sich
nur an die bestehenden Tokens halten, nicht selbst um `reduced-motion`
kümmern.

---

## Bereits geklärt, nicht mehr offen (zur Erinnerung)

- **Koffein-Frage:** Im Konzept entschieden (K45/K46, `docs/konzept.md`):
  Koffein wird **vor** der Bohne gefragt und filtert die Bohnenliste. Gehört
  zur Bestellung (Paket 06), nicht zu den Einstellungen. Kein weiterer
  Klärungsbedarf, nur noch nicht gebaut, weil Paket 06 fehlt.
- **Notion-Charge-Import:** Bereits korrekt — Migration legt bei fehlender
  Charge automatisch eine Platzhalter-Charge an, bricht nicht ab
  (`daten/migration/migrieren.ts:132-141`). Nichts zu tun.

## Empfohlene Reihenfolge

1. **Geräte löschen** (Punkt 1) — klein, in sich abgeschlossen, kein
   Modellumbau nötig.
2. **Geräte Ansehen/Bearbeiten** (Punkt 2) — größer, aber folgt exakt dem
   Kaffee-Muster, das schon einmal gebaut wurde.
3. **PID-Screen** (Punkt 3) — hängt an Punkt 2 (gleiche Datei,
   Bruehgeraetblatt), macht Sinn direkt danach.
4. **„Verhalten"-Block** (Punkt 5) — klein, jederzeit zwischendurch machbar.
5. **Rezept-Darstellung + Führungswert** (Punkt 6) — eigenständig, kann
   parallel oder danach.
6. **Kompatibilitätsfilter Setup** (Punkt 4) — erst mit dem User klären,
   wahrscheinlich auf Paket 06 verschieben.
7. **Übergang** (Punkt 7) — zuletzt, optional.
