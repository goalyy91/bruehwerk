# Brühwerk — Etappe 9: Politur, Fastway, Klartext

## Kontext

Sieben Rückmeldungen in einer Nachricht, nach dem Ansehen von Etappe 8 am Telefon. Gemeinsamer
Nenner: die App fühlt sich an mehreren Stellen nach "gebaut", nicht nach "gestaltet" an — zu
große Bedienelemente, eine Einstellungsseite, die wie eine Formularliste wirkt statt wie ein
Menü, Beschriftungen, die wie Platzhaltertext klingen, und ein handfester Navigationsfehler beim
schnellen Weg vom Dashboard. Drei Entscheidungen wurden mit dir schon geklärt (unten), der Rest
ist als Plan hier zur Freigabe.

**Geklärt im Vorgespräch:**

- **Trefferfläche/Bedienschrift bleiben bei ≥48px/≥15px** — das ist keine Hausregel, sondern
  Apple HIG (44pt Minimum) und Material Design (48dp Minimum) und deckt sich mit WCAG 2.5.5
  (44px CSS). Jede Vergleichs-App, die "filigran" wirkt (Things 3, Bear, Linear, das native
  iOS-Einstellungen-Menü selbst), unterschreitet das nicht — sie zeichnet nur eine **kleinere
  sichtbare Form innerhalb derselben unsichtbaren Tippzone**. Genau das ist jetzt der Weg
  (Block D unten), keine Ausnahme von der Regel.
- **Fastway wird ein echter Zwei-Tap-Weg** direkt zum Shot, ohne Bestellung/Plan/Abarbeiten —
  das war als Zwei-Tap-Pfad schon in `CLAUDE.md` versprochen, aber seit dem Café-Style-Umbau
  (Etappe 7) faktisch nicht mehr eingelöst (Block A).

---

## A · Fastway — echter Zwei-Tap-Weg vom Dashboard zum Shot

**Root Cause, gefunden beim Nachlesen:** `Bar.svelte::kachelWaehlen()` legt eine Bestellung an
und öffnet `BestellungAufnehmen` — das war schon vor Etappe 7 so (das Bestellungsmodell war der
einzige Weg, ein Getränk zu loggen), nur ist seit dem Café-Style-Umbau der Weg dorthin länger
geworden (Person/Getränk/Koffein/Bohne/hinzufügen/Plan/Abarbeiten). Bei dir blieb es zusätzlich
hängen — vermutlich `bohnenOptionen.length === 0` (keine passende Bohne), dann bleibt
"Position hinzufügen" dauerhaft deaktiviert, ohne erklärenden Hinweis in diesem Zustand.

**Der eigentlich richtige Weg existiert schon** — `Profilblatt.svelte` hat einen "Shot loggen"-
Knopf, der **direkt** zu `ShotErfassung` navigiert (`navigation.gehe({ name: 'shot', kaffeeId,
profilId })`), ganz ohne Bestellung/Durchgang. Der Fastway muss nur denselben Sprung machen,
mit automatisch aufgelöster Bohne und Profil statt manueller Navigation über Kaffees → Profil.

**Neu, lokal in `Bar.svelte`** (kein neues Domain-Modul nötig — reine Orchestrierung
vorhandener Funktionen, dieselben, die `BestellungAufnehmen.svelte` schon nutzt):

```
kachelWaehlen(getraenk):
  1. Koffein: vorbelegung(eigene Positionen dieser Person, getraenkId) — dieselbe Funktion,
     dieselbe Schwelle wie in der Bestellung. frage === false → 'normal' still übernehmen.
     frage === true → eine Rückfrage (VorbelegteFrage, inline auf der Bar oder ein sehr
     kleiner Zwischenschritt) statt automatisch zu raten (K12: Rezeptur-Fragen ohne Vorbelegung).
  2. Bohne: bohnenSchnittmenge(kaffees, zubereitung, koffein).
     - genau 1 Treffer → automatisch.
     - 0 Treffer → Fehlermeldung statt weiterzuspringen ("Keine passende Bohne aktiv").
     - >1 Treffer → dieselbe Logik wie beim Verschnitt-"Bohne wechseln": die zuletzt für
       genau dieses Getränk verwendete Bohne (bohneFuerGetraenk(), existiert schon lokal in
       Bar.svelte) ist die Vorauswahl; nur wenn die nicht mehr zur Schnittmenge passt, eine
       kurze Rückfrage (Einzelauswahl).
  3. Profil: bestand.profilFuerZubereitung(kaffeeId, zubereitung) — vorhandene Funktion.
  4. navigation.gehe({ name: 'shot', kaffeeId, profilId }) — derselbe Sprung wie vom Profilblatt.
```

Damit bleibt das Bestellungsmodell für seinen eigentlichen Zweck (mehrere Getränke/Personen,
Bündelung, Verschnitt) unverändert — der Fastway ist ein zweiter, kürzerer Eingang zu
`ShotErfassung`, kein Ersatz für die Bestellung. `chargeStatusAktualisieren` läuft ohnehin schon
beim Shot-Schreiben in `ShotErfassung.svelte`, nicht an der Bestellung — Bestandsführung bleibt
unberührt.

**Rückfragen bleiben Ausnahme, keine Regel:** bei einer eingespielten "Dein Espresso"-Kachel
(die per Definition schon Rangliste/Historie hat) ist `frage === false` der häufige Fall — der
Zwei-Tap-Weg bleibt für dich in der Praxis meistens wirklich zwei Taps.

## B · Bestellmodus umbenennen — ERLEDIGT (2026-09-06)

*"Café-Style" → "Mengen", "Für mich/andere" → "Personen"* — durchgehend umbenannt (Segment-
Labels, `modus`-Typ, alle internen `cafe*`-Bezeichner → `mengen*`, Kommentare in
`Bar.svelte`/`domain/ranking.ts`/`daten/schema/bestellung.ts`).

**Default korrigiert, abweichend vom ursprünglichen Vorschlag hier:** deine Rückmeldung nach
dem ersten Test war eindeutig — "Personen" ist der Default, nicht "Mengen" (schon in Block A
als Fix mit umgesetzt, `let modus = $state(...)('person')`). Seit der Fastway (Block A) läuft
`BestellungAufnehmen` ohnehin nur noch über den allgemeinen "Getränk wählen"-Knopf.

**Zwei echte Bugs unterwegs gefunden und behoben** (beide beim Testen von "Personen" aufgefallen):
1. Bei komplett leerer Personenliste bestätigte sich die "bin ich Standard?"-Prüfung fälschlich
   selbst (leerer String verglichen mit leerem String) — der Auswahl-Dialog blieb für immer
   verborgen, "Position hinzufügen" ließ sich nie aktivieren.
2. `VorbelegteFrage.svelte` hatte eine eigene, doppelte Sichtbarkeitsregel ("≤ 40 % zeig dich gar
   nicht"), die mit der Absicht der aufrufenden Screens kollidierte: bei einer komplett neuen
   Person entscheidet `domain/ranking.ts::vorbelegung()` bewusst "frag trotzdem" (mit `anteil: 0`)
   — das Bauteil blendete sich trotzdem aus. Fix: das Bauteil verlässt sich jetzt auf die
   `.frage`-Entscheidung des Aufrufers, keine eigene zweite Prüfung mehr.
3. **Dritter Fund, nach Freigabe von Block A/B:** war `koffein` einmal auf 'normal' vorbelegt
   (≤ 40 %, App fragt bewusst gar nicht), gab es keinen Weg mehr, für eine einzelne Position
   trotzdem "entkoffeiniert" zu wählen — die Frage-Komponente erschien nie, keine andere
   Kontrolle existierte. Fix: derselbe leise Ausnahme-Link wie "für jemand anderen" ("stattdessen
   entkoffeiniert"/"stattdessen normal") — die stille Vorbelegung bleibt Regelfall (kein
   Alarmsignal ohne Inhalt, K56), ein Tap genügt für die Ausnahme.

## C · Abarbeiten — welches Getränk, deutlicher — ERLEDIGT (2026-09-07)

*Umgesetzt wie unten vorgeschlagen:* `BestellungAbarbeiten.svelte`, Überschrift trägt jetzt
`getraenkNamen(aktiv.positionIds)`, die Meta-Zeile darunter `kaffeeName · profil.name`. Nur die
aktive Karte betroffen — „Danach"- und „Erledigt"-Zeilen behalten ihre Form (`Kaffee · Getränk`),
weil sie Übersicht sind und keine Entscheidung. Keine Größen- oder Abstandsänderung; die
Typografie kommt in Block D.


Der Getränkename steht heute schon in der Meta-Zeile (`{profil.name} · {getraenkNamen(...)}`),
aber klein und gedämpft direkt unter dem Kaffeenamen — leicht zu übersehen, wenn du gerade
zwischen Tassen wählst. Vorschlag: Getränkename wird die eigentliche Überschrift (er ist die
Entscheidung, die du gerade triffst — "welche Tasse"), Kaffeename rutscht in die Meta-Zeile
darunter (umgekehrte Reihenfolge). Bei einem Doppelbezug (zwei Getränke, ein Durchgang) zeigt
die Überschrift beide, mit "+" verbunden — das tut `getraenkNamen()` schon.

## D · Typografie und Bedienelemente — sichtbar schlanker, Tippzone unverändert — ERLEDIGT (2026-09-07)

*Mockup vorab wie vorgesehen* (Artifact „Schlanker gezeichnet", alt gegen neu, hell und dunkel,
mit sichtbar gemachter 48-px-Zone), danach freigegeben und umgesetzt in `tokens.css`,
`Schalter.svelte`, `Segment.svelte`, `Kontextmenue.svelte`.

**Zwei Abweichungen von der Tabelle unten, beide beim Nachrechnen aufgefallen:**

1. **Segment 38 px statt 36.** Die Tabelle übersah, dass beim Segment das Feld *selbst* die
   Tippfläche ist — es gibt keine Zeile drumherum wie beim Schalter. Heute misst ein Feld 42 px
   (die 48 der Leiste kommen erst durch 2×3 px Bahnpolster). 36 hätte die „≥ 48, nicht
   verhandelbar"-Regel tiefer gebrochen als der Ist-Zustand. 38 ist optisch kaum von 36 zu
   unterscheiden und kostet nur vier statt sechs Pixel Trefferfläche.
2. **`Knopf.svelte` gar nicht angefasst.** Die Tabellenzeile verlangt „weniger vertikales
   Innenpolster" — das existiert im Code nicht, die Höhe kommt allein aus `min-height: 48px`,
   das Polster ist waagerecht. Es gab dort schlicht nichts wegzunehmen. Die Knöpfe wirken
   trotzdem leichter, allein durch die von der Leiter geerbte kleinere Schrift.

Neu dazu: `--fs-segment: 13.5px` und `--schalter-weg: 18px` (der Knopfweg stand vorher als
nackte `translateX(20px)` in der Komponente und wäre beim nächsten Maßwechsel stehen geblieben).

**Offene Drift, nicht hier behoben:** `Kaffeeblatt.svelte` setzt den Rösternamen auf feste
`15px` — ein Echo des alten `--fs-satz`, das jetzt aus der Reihe fällt. Gehört in Block F, der
diese Datei ohnehin öffnet. (`Werteliste.svelte` mit festen 17px ist dagegen Absicht: eigener
Handoff-Wert für Werteingabefelder, und Werte bleiben in Block D unangetastet.)


### Perspektive UX

Nichts an der Bedienung ändert sich — jeder Schalter, jedes Segment-Feld, jede Menüzeile bleibt
mindestens 48×48px antippbar. Was sich ändert, ist ausschließlich das, was man **sieht**:
dünnere Konturen, weniger Innenpolster, kleinere gezeichnete Formen innerhalb derselben
unsichtbaren Zone. Kein Bedienschritt, keine Reihenfolge, keine Fläche wird kleiner *getroffen*
als heute.

### Perspektive Design

Konkrete, punktuelle Ziele statt einer pauschalen "alles kleiner"-Anweisung:

| Element | Heute | Vorschlag | Warum |
| --- | --- | --- | --- |
| `Schalter.svelte` | 52×32px Pille, 26px Knopf | 44×26px Pille, 20px Knopf, Tippzone bleibt 48×48 (Padding drumherum) | wirkt aktuell wie ein iOS-Schalter aus 2013, moderne Systeme zeichnen ihn schlanker |
| `Segment.svelte` | Feldhöhe 42px, `--fs-satz` (15px) | Feldhöhe 36px, 13.5px, Bahn dünner (Polster 2px statt 3) | die Leiste selbst darf schlanker sein, ihr Tippbereich (`min-height` bleibt am Elternelement ≥48) |
| `Kontextmenue.svelte` | Serif 17px, Zeile 48px hoch, Menü min. 180px breit | **Sans statt Serif** (es ist Apparat/Bedienung, keine Inhaltszeile — passt zur bestehenden Regel "Serif für Inhalt, Sans nur Apparat", die hier bisher nicht befolgt wurde), 14.5px, Menübreite an Text angepasst statt Mindestbreite 180 | ein Action-Menü in Serif ist der eigentliche Grund, warum es "nicht wie eine App-Store-App" wirkt — native Kontextmenüs sind immer Systemschrift, nie eine Buchschrift |
| `Knopf.svelte` „sekundär"/„still" | 48px Mindesthöhe, 17px | Mindesthöhe bleibt 48 (Tippzone), aber weniger vertikales Innenpolster wirkt kompakter ohne die Zone zu verkleinern | |
| Typo-Leiter (`tokens.css`) | 9 Fließtextgrößen zwischen 10.5 und 32px | punktuelle Verdichtung: `--fs-bedienwort` 17→16px, `--fs-satz` 15→14.5px — beide bleiben über der Apple-Untergrenze für Fließtext (13px) | Source Serif 4 hat mehr optisches Gewicht als eine Systemschrift bei gleicher Zahl — schon ein Punkt weniger macht spürbar mehr "leicht" als "klein" |

**Bewusst nicht angetastet:** `--fs-wert` (Zahlen, 19px) und `--fs-titel`/`--fs-blattitel` — das
sind die "editorial" tragenden Elemente (Werte, Titel), die dem "edel"-Anspruch gerade ihre
Substanz geben. Filigran heißt weniger Fläche um die Werte, nicht kleinere Werte.

### Perspektive Synthese

Wie bei Etappe 8: **erst ein Mockup**, kein blindes Durchziehen der Tabelle oben. Ein
Musterblatt-Ausschnitt (Schalter, Segment, Kontextmenü, Knopf nebeneinander, alt gegen neu,
hell und dunkel) als HTML-Artifact, mit den Zahlen aus der Tabelle — danach exakt das
freigegebene CSS in `tokens.css` und die vier Muster-Komponenten. Betrifft nur `src/muster/*` —
jeder Bildschirm, der diese Bausteine nutzt, erbt die neue Optik automatisch, ohne selbst
angefasst zu werden.

## E · Einstellungen — reines Navigationsmenü, wie iOS/Android-Systemeinstellungen

Root-Screen zeigt nach Etappe 8 vier Gruppen, aber zwei davon ("Verhalten", "Bestand") sind
**Formulare direkt auf der Seite**, nicht Ziele zum Antippen — das bricht mit dem
"Antippen-führt-zu-Unterseite"-Muster, das "Geräte verwalten" & Co. schon haben, und macht die
Seite zur Mischung aus Menü und Formular. In einem klassischen Einstellungsmenü ist die
Root-Seite ausschließlich eine Liste von Zielen.

**Vorschlag:** Root-Einstellungen wird eine einzige, kurze Liste reiner Ziele:

```
Geräte
Personen
Verhalten          →  (neuer Screen: die drei Schalter + Erklärsätze, unverändert)
Bestand            →  (neuer Screen: die drei Schwellenwerte, unverändert)
Beobachtungen
Daten              →  (neuer Screen: Migration + Backup, unverändert)
Erweitert          →  (neuer Screen: Musterblatt, Übungsmodus — Entwickler-/Testwerkzeuge,
                       gehören nicht neben "Geräte" auf die erste Ebene)
```

Zwei neue, kleine Screens (`VerhaltenScreen.svelte`, `BestandScreen.svelte` — Inhalt 1:1 aus dem
heutigen `Einstellungen.svelte` übernommen, nur in eine eigene Route verschoben) plus ein
`ErweitertScreen.svelte` für Musterblatt/Übungsmodus. `Daten` bekommt ebenfalls einen eigenen
Screen (heute schon fast fertig: `Migration`+`Backup` stehen bereits zusammen, nur noch nicht
hinter einer eigenen Route). Jede neue Route folgt demselben Muster wie `Beobachtungen`/
`Personen` heute schon (`Kopfzeile` mit Rückweg, `navigation.gehe`/`navigation.zurueck`).

Ergebnis: **jede Ebene sieht aus wie jede andere** — eine Kopfzeile mit Rückweg, darunter
`Blattliste`/Formularzeilen. Kein Bildschirm mischt mehr "hier navigieren" mit "hier direkt
einstellen".

## F · Beschriftungen — der hochsichere Kern jetzt, der Rest als eigener Durchgang

Der Explore-Agent ist fertig — **über 80 Fundstellen in 20 Dateien**, voller Bericht liegt dir
als Datei vor (`beschriftungs-audit.md`). Das ist zu viel für einen sicheren Rutsch in dieser
Etappe: die meisten Vorschläge sind neue Vokabeln, die der Agent erfunden hat — gute Ideen, aber
noch keine getroffene Entscheidung. Zwei Kategorien nehme ich trotzdem **jetzt schon** mit rein,
weil sie keine Geschmacksfrage sind, sondern bestehende eigene Regeln verletzen:

**1. Echte Regelverstöße (CLAUDE.md-Sprachtabelle):**
- `Kaffeeblatt.svelte`: „≈ {n} ml **Ertrag**" → „≈ {n} ml **Output**" — steht wortwörtlich in der
  „Nicht"-Spalte der Sprachtabelle.
- `Getraenkeblatt.svelte` (zwei Stellen): Erklärtexte enthalten `(K46)`/`(K48)` — K-Nummern
  gehören laut CLAUDE.md in Code-Kommentare, nicht in sichtbaren Text. Klammern raus.

**2. Dein eigenes Beispiel + zitierte Enum-Werte (derselbe Fehler, mehrfach):**

| Heute | Vorschlag |
| --- | --- |
| „Knapp" ab · [2] Bezüge übrig | Mindestbestand · [2] Bezüge |
| „Alt" ab (frisch) · [8] Wochen | Frischefenster · [8] Wochen |
| „Alt" ab (eingefroren) · [8] Monate | Frischefenster, gefroren · [8] Monate |
| „…als „knapp" oder „sollte bald raus" markiert…" | „Ab hier meldet sich eine Bohne von selbst." |

Die Anführungszeichen sind selbst das Symptom: die Oberfläche zitiert ihren eigenen internen
Statuswert (`art: 'knapp'`), statt einen eigenständigen Begriff zu benutzen.

**3. Echte Doppel-Benennungen desselben Konzepts** (verwirrt, unabhängig vom Geschmack):
„Bestand unbekannt" (Kaffeeblatt) vs. „Restmenge unbekannt" (Bar) für dieselbe Sache — auf
„Restmenge" vereinheitlicht. „Einwaage" wird an zwei Stellen (Kaffeeblatt Packungsgröße, dein
Espresso-Input) für zwei verschiedene Dinge benutzt — die Packungsgröße bekommt einen eigenen
Namen („Packungsgröße"), „Einwaage" bleibt exklusiv der Siebträger-Dosis vorbehalten.

**Bewusst nicht jetzt:** die übrigen ~70 Vorschläge (Getränkeblatt-Fachbegriffe, GussplanEditor,
Kontostand-Wortwahl in der Bestellung, …) — die brauchen dich als Entscheider, Begriff für
Begriff, nicht mich allein. Vorschlag: eigener, kurzer Durchgang nach Etappe 9, bei dem ich dir
die Kandidaten gebündelt nach Bildschirm vorlege (AskUserQuestion, mehrere pro Screen) statt sie
in einem Rutsch zu übernehmen.

---

## Reihenfolge und Dateien

Blöcke sind unabhängig voneinander umsetzbar; Reihenfolge nach Nutzen zuerst:

1. **A** (Fastway) — der einzige echte Bug, größter Alltagsnutzen. `Bar.svelte`, `Rahmen.svelte`
   (falls eine neue Rückfrage-Route nötig wird — voraussichtlich nicht, siehe oben).
2. **B** (Umbenennung + Default) — klein, `BestellungAufnehmen.svelte`.
3. **C** (Abarbeiten-Kopf) — klein, `BestellungAbarbeiten.svelte`.
4. **D** (Typografie) — Mockup zuerst, danach `tokens.css` + `Schalter/Segment/Kontextmenue/
   Knopf.svelte`. Größter visueller Hebel, betrifft die ganze App auf einen Schlag.
5. **E** (Einstellungen-Menü) — drei neue Screens + Routing, `Rahmen.svelte`, `route.ts`.
6. **F** (Beschriftungen, hochsicherer Kern) — `Kaffeeblatt.svelte`, `Getraenkeblatt.svelte`,
   das neue `BestandScreen.svelte` aus Block E. Nur Texte, kein Strukturwechsel.

`npm test` nach jedem Block, Ausgabe wird gezeigt. Am Telefon je Block: A (Kachel antippen, bei
dir bekanntem Fall), D (Musterblatt hell/dunkel), E (jede neue Route einzeln antippen).
