# BRÜHWERK · IMPLEMENTATION HANDOFF (VISUELLER REDESIGN-RESET)

Stand: Sitzung 8, Designphase abgeschlossen. Bildquelle: `Sitzung 8 - Final.dc.html`
(Vorstufen: `Sitzung 8 - Schärfung.dc.html`, `Sitzung 8 - Überarbeitet.dc.html`,
`Sitzung 8 - Visueller Reset.dc.html`).

---

## 1 · STATUS

**Final und freigegeben**

- Gesamtwirkung: warm, ruhig, reduziert, editorial, handwerklich.
- Farbwelt hell und dunkel (Abschnitt 3).
- Typografische Logik: Source Serif 4 führt, Source Sans 3 nur als Apparat.
- Radius- und Formensprache, drei Flächenebenen, keine Schatten.
- Zustands- und Aktionslogik: **eine** gefüllte Fläche je Theme für Auswahl und Primäraktion.
- Kaffeeliste als Kartenrichtung.
- Kaffeeblatt-Komposition, Profildarstellung, Parameterkacheln.
- Tab-Leiste 64 px mit 24-px-Zeichen.
- Führungswert ohne Sonderauszeichnung.
- Suchfeld 60 px mit Lupe.

**Bewusst offen**

- Light-Mode-Füllfarbe des gewählten Zustands (`#83553A`) bleibt vorläufig und kann
  später feinjustiert werden. Genau **ein** Wert, an genau einer Stelle im Tokenblatt.
- Text unter den Tab-Symbolen: bleibt vorerst stehen; die Leiste ist so bemessen, dass
  sie auch ohne Text trägt.

**Was Claude Code nicht neu entscheiden darf**

- Keine neue Farbwelt, keine zweite Akzentfarbe, keine Signalfarben für Zustände.
- Keine Schatten, keine Rahmen um Blätter, kein Card-Look über Schatten.
- Keine Rückkehr zu gefärbter Schrift in gewählten Zuständen, kein Akzentstrich als Auswahl.
- Keine schwarzen oder weißen Vollflächen als Button.
- Keine Vergrößerung einzelner Werte (Führungswert bleibt gleich groß).
- Keine Änderung an Navigation, Reihenfolge, Feldnamen, Wegen oder Anzahl der Schritte.
- Keine Ersatzformen für beschlossene Darstellungen (K79: Röstgrad fünf Bohnen,
  Bewertung fünf Sterne, Anbauhöhe mit Tausenderpunkt, Charge mit Nummer und Röstdatum).

**Achtung, Bildlücke:** Für *Einstellungen*, *Geräte*, *Neues Brühgerät* und
*Shot loggen · Was stört?* existiert bisher nur das Bild aus
`Sitzung 8 - Visueller Reset.dc.html`. Dort gelten noch die **verworfenen** Zustände
(dunkle Tinte-Pille, Akzentfläche mit gefärbter Schrift, Tab-Leiste 58/20, Listentypo
19/600, Führungswert 44). Diese Screens sind nach den Regeln dieses Handoffs zu bauen,
nicht nach jenem Bild. Inhalte und Reihenfolge dort sind korrekt und bleiben.

---

## 2 · QUELLENHIERARCHIE

1. `docs/konzept.md` — Source of Truth für Produktlogik, Datenmodell, Funktionen, K-Punkte.
2. `docs/ux-regeln.md` — Source of Truth für UX-, Interaktions- und Prozessregeln.
3. **Dieser Handoff** — Source of Truth für alles Visuelle. Er überschreibt ältere
   visuelle Festlegungen (Tokenblatt Sitzung 2, Musterblatt Sitzung 3, Übergabe
   Sitzung 6, Abschnitt 3 „Tokens“) **nur dort, wo sie dem Redesign widersprechen**.

Bei Widerspruch zwischen visueller Regel und Produktlogik gewinnt immer die Produktlogik.
Funktion, Navigation und Informationsarchitektur werden durch diesen Handoff nicht verändert.
Was hier nicht geregelt ist, bleibt wie in den Vorprotokollen beschlossen.

---

## 3 · VISUELLES FUNDAMENT

### 3.1 Farbe · Rollen und Werte

| Rolle | Token | Hell | Dunkel | Verwendung |
| --- | --- | --- | --- | --- |
| Grund | `--grund` | `#F1EBE1` | `#17140F` | Bildschirmhintergrund |
| Blatt | `--blatt` | `#FCFAF6` | `#211D18` | trägt Inhalt: Gruppen, Karten, Kacheln, Tab-Leiste |
| Vertiefung | `--vertiefung` | `#E8DFD1` | `#2B2620` | Wertfeld, Segment-Bahn, offener Zustand, Schalter aus |
| Linie | `--linie` | `#F0E8DB` | `#2F2922` | Haarlinie innerhalb eines Blattes |
| Spur | `--spur` | `#CFC4B2` | `#5F584E` | Chevron, leere Bohne, leerer Stern, leerer Herkunftskreis |
| Tinte | `--tinte` | `#1E1A16` | `#F1ECE4` | Titel, Namen, Werte |
| Satz | `--satz` | `#4A423A` | `#CFC8BE` | Fließtext, Labels in Zeilen |
| gedämpft | `--gedaempft` | `#8A8175` | `#948C81` | Meta, Einheiten, Gruppenköpfe, inaktiver Tab |
| Akzent | `--akzent` | `#A2643B` | `#D29A66` | Textlinks („+ Profil“), Zeichen in Kacheln, aktiver Tab, Zurück-Pfeil |
| Füllfläche | `--fuellung` | `#83553A` | `#E0AE79` | Primäraktion **und** gewählter Zustand |
| Schrift auf Füllfläche | `--auf-fuellung` | `#F7EFE4` | `#221D18` | ausschließlich dort |
| Badge-Fläche | `--badge` | `#F4ECE1` | `#2B2620` | rundes Zeichen-Badge (Profile) |
| Achtung | `--achtung` | `#7D6415` | `#C9A15A` | halbes Zustandszeichen |
| kritisch | `--kritisch` | `#93332A` | `#CD7A63` | schraffiertes Zustandszeichen |

Regeln: ein Akzent, keine zweite Akzentfarbe. Farbe ist nie alleiniger Träger eines
Zustands. Kein Grün, kein Blau, kein kräftiges Orange. Kein Farbverlauf außer im
Halb-Zeichen (technisch ein 50-%-Split, kein Dekor).

### 3.2 Typografie

**Source Serif 4** — trägt allen Inhalt.

| Einsatz | Größe | Gewicht | Zeilenhöhe | Laufweite |
| --- | --- | --- | --- | --- |
| Blattitel (Kaffeename, Screentitel groß) | 30–32 | 600 | 1.12 | −0.02 em |
| Screentitel mit Rückweg | 26 | 600 | 1.2 | −0.02 em |
| Objektname / Frage („Wie war er?“) | 20–21 | 400 | 1.25 | −0.01 em |
| Listenname, Bedienwort, Zeile | 17 | 400 | 1.3 | 0 |
| Satz, Beschreibung | 15–16 | 400 | 1.55 | 0 |
| Wert / Zahl | 19 | 500 | 1 | −0.01 em, `tabular-nums lining-nums` |

**Source Sans 3** — trägt ausschließlich den Apparat.

| Einsatz | Größe | Gewicht | Zusatz |
| --- | --- | --- | --- |
| Gruppenkopf | 10.5 | 400 | Versalien, `letter-spacing .14em`, gedämpft |
| Kachel-Label | 10.5 | 400 | Versalien, `letter-spacing .12em`, gedämpft |
| Meta, Einheit, Zählform, Datum | 12–12.5 | 400 | gedämpft; Datum tabular |
| Tab-Label | 11 | 400 / 600 aktiv | — |

Fett (600) kommt nur vor: auf der Füllfläche, im aktiven Tab-Label und in großen Titeln.
Nie in Listenzeilen, nie in Werten. Untergrenze Bedienelement 15 px, Label 10.5 px.

### 3.3 Raum

Leiter: `4 · 8 · 10 · 12 · 14 · 18 · 20 · 22 · 24`.
Seitenrand 22 · Blattpolster 18 · Kartenpolster 18/20 · Kartenabstand 14 ·
Gruppenabstand 20–24 · Kachelabstand 10 · Zeilenhöhe 54–66 · Trefferfläche ≥ 48 ·
Safe Area unten zusätzlich zur Tab-Leiste. Kein waagerechtes Scrollen.

### 3.4 Radius

Blatt 20 · Karte 18 · Kachel 16 · Urteilskachel 16 · Bedienelement/Pille/Suchfeld 999 ·
rundes Badge und Kopfzeilen-Knopf 38 (voll rund) · **Wertfeld 4** · Bildschirmrahmen im
Mockup 26 (kein Produktwert).

### 3.5 Flächenebenen, Linien, Schatten

Drei Ebenen, nie vier: Grund → Blatt → Vertiefung. Blätter haben **keinen Rand**.
Haarlinien 1 px nur *innerhalb* eines Blattes, nie außen herum; senkrechte Haarlinie
nur zwischen zwei Werteblöcken (Röstgrad | Bewertung).
**Schatten sind global verboten**, auch als „subtile Elevation“.

### 3.6 Zustände

- **Gewählt / aktiv:** Füllfläche + Schrift auf Füllfläche. Kein Rand, kein Strich,
  keine gefärbte Schrift. Gewicht darf auf 600 gehen.
- **Offen:** Vertiefung + Satzfarbe.
- **Nicht möglich:** Vertiefung + Spurfarbe.
- **Herkunft (Kreisfamilie, 10 px):** gefüllt = gemessen/gerechnet · Ring = übernommen ·
  gestrichelter Ring = geschätzt. Geschätzt zusätzlich: Tilde, gedämpft, Gewicht 400,
  eine Stelle weniger.
- **Zustandszeichen (10 px, 11 px am Wert):** gefüllt = gut · linke Hälfte gefüllt bei
  ganzem Rahmen = Achtung · 45°-Schraffur = kritisch. Ohne Farbe erkennbar.
- Keine Balken, keine Fortschrittsanzeigen, keine LED-Metaphorik.

### 3.7 Fokus

`outline: 2px solid var(--akzent); outline-offset: 2px;` nur bei `:focus-visible`.
Andere Form als jede Auswahlmarkierung.

### 3.8 Bauteile · Maße

| Bauteil | Maße |
| --- | --- |
| **Tab-Leiste** | Höhe 64 auf Blattfläche, Zeichen 24 px `stroke-width 1.3`, Label 11, Abstand Zeichen/Label 5, aktiv = Akzent + 600, inaktiv = gedämpft. Kein Rand nach oben. |
| **Suchfeld** | Höhe 60, Radius 999, Blattfläche, Lupe 17 px in Spurfarbe, Abstand 12, Text 16.5 in Spur-/Platzhalterfarbe, Innenrand 22. |
| **Primäraktion** | Pille, Höhe 50, Radius 999, Füllfläche, Schrift 18 auf Füllfläche, volle Spaltenbreite. Höchstens eine je Bildschirm. |
| **Sekundäraktion** | Textzeile im Akzent (`+ Profil`, `+ Charge`, `Geräte verwalten`), keine Fläche. |
| **Segment** | Bahn in Vertiefung, Radius 999, Innenpolster 3, Felder Höhe 40–42, Radius 999, gewähltes Feld = Füllfläche. |
| **Chip** | Radius 999, Polster 10/16, offen = Vertiefung, gewählt = Füllfläche. Ein Chip trägt weiterhin seine Stärke (K53). |
| **Schalter** | 52 × 32, Knopf 26, Radius 999; an = Füllfläche mit hellem Knopf (hell) bzw. dunklem Knopf (dunkel), aus = Vertiefung. |
| **Eingabefeld (Wert)** | Vertiefung, **Radius 4**, Polster 8/12, rechtsbündig, Serif 19/500 tabular, Einheit daneben in fester Spalte (22–26 px, Sans 12). |
| **Eingabefeld (Text/Auswahl)** | Vertiefung, Radius 4, Höhe 38, Serif 17; Auswahlpfeil „▾“ in gedämpft rechts. |
| **Karte** | Blattfläche, Radius 18, Polster 18/20, Abstand zur nächsten Karte 14, kein Rand, kein Schatten. |
| **Urteilskachel** | Raster 2 × 2, Höhe 58, Radius 16, Abstand 10; offen = Vertiefung, gewählt = Füllfläche. |
| **Parameterkachel** | Raster 2 Spalten, Abstand 10, Blattfläche, Radius 16, Polster 13/15; Zeichen 15 px im Akzent, Label 10.5 Versalien gedämpft, Wert 19/500 + Einheit 12. |
| **Kurve** | eine Akzentlinie 1.5 px, Punkte als Kreise r 4 (letzter Punkt gefüllt), Achsenbeschriftung Sans 11 gedämpft, kein Raster. |

### 3.9 Technische Wertdarstellung

Zahlen immer Source Serif 4, 500, `font-variant-numeric: tabular-nums lining-nums`,
`letter-spacing: -.01em`. Werte stehen rechtsbündig im eckigen Feld oder rechts in der
Zeile; Einheit immer in eigener, fester Spalte. Fehlender Wert = „—“ in Spurfarbe.
Führungswert **immer mit Einheit**, aber ohne Größensprung, ohne Kreis, ohne Rahmen,
ohne Wort. Kein Mono außer in Code-Übergaben.

---

## 4 · DESIGNPRINZIPIEN

1. **Weiches Blatt, präziser Wertkern.** Alles, was Inhalt trägt oder angefasst wird, ist
   rund. Nur Messwerte sitzen in eckigen Feldern (Radius 4). Der harte Kern ist die
   Ausnahme und dadurch lesbar.
2. **Serif führt, Sans ist Apparat.** Inhalt, Namen, Bedienwörter und Zahlen sind Serif.
   Sans trägt nur Gruppenköpfe, Labels, Einheiten, Zählformen, Meta und Tab-Leiste.
3. **Drei wahrnehmbare Flächenebenen.** Grund, Blatt, Vertiefung. Kein Beige-in-Beige
   darüber hinaus.
4. **Keine Schatten.** Tiefe entsteht aus Helligkeit, Radius und Abstand.
5. **Karten ohne Standard-Card-Look.** Keine Ränder, keine Schatten, kein Hover-Lift.
   Der Abstand zwischen Karten ist größer als das Polster darin, damit kein Stapel entsteht.
6. **Kreisfamilie für Zustands- und Herkunftszeichen.** Keine Balken, keine Striche.
7. **Ruhige Auswahlzustände.** Eine gefüllte Fläche, sonst nichts. Kein farbiger Text,
   kein Akzentstrich, keine schwarze oder weiße Vollfläche.
8. **Keine unnötig dominanten Einzelwerte.** Alle Werte auf einer Größe.
9. **Führungswert nicht hervorheben.** Er ist fachlich führend, visuell gewöhnlich.
10. **Funktion vor Dekoration.** Jedes Element hat eine Aufgabe.

---

## 5 · KOMPONENTEN-MAPPING

Funktional bleibt **jede** Komponente unverändert: gleiche Props, gleiche Events, gleiche
Zustände, gleiche Ausgabe. Verändert wird ausschließlich die Darstellung.

| Muster | Neue visuelle Behandlung | Funktional unverändert |
| --- | --- | --- |
| `Kopfzeile.svelte` | Rückweg und Aktion als runde 38-px-Knöpfe auf Blattfläche, Zeichen im Akzent; Titel Serif 26/600, bei Objektseiten 30–32 zweizeilig | Rückweg, Aktions-Slot, Titelquelle |
| `Werteliste.svelte` | Label links Serif 16 in Satzfarbe, Wert rechts im 4-px-Feld, Einheit in fester Spalte | Feldnamen, Reihenfolge, Einheiten |
| `IstGegenZiel.svelte` | Zeilenliste 54 px auf Blatt mit Haarlinien, Herkunftskreis links, Wert 19 rechts | zwei getrennte Felder Ziel/Ist |
| `Segment.svelte` | Bahn Vertiefung, gewähltes Feld Füllfläche | gleich breite Felder, Einfachauswahl |
| `Einzelauswahl.svelte` | wie Chip: offen Vertiefung, gewählt Füllfläche | Auswahllogik |
| `Urteil.svelte` | 2 × 2, Höhe 58, Radius 16, gewählt = Füllfläche | vier Stufen, Reihenfolge |
| `Chips.svelte` | Pille, gewählt = Füllfläche; Stärke bleibt im Chip | Mehrfachtippen für Stärke (K53) |
| `Schalter.svelte` | 52 × 32, an = Füllfläche | Ein/Aus-Semantik |
| `AuswahlListe.svelte` | Blatt, Zeilen mit Haarlinie, „▾“ in gedämpft | Zuklappen, Auswahl |
| `Herkunft.svelte` | **unverändert** — drei Kreisformen, nur Farbtoken neu | alles |
| `Bohnen.svelte` | **unverändert** — fünf Bohnen, gefüllt/leer, Wort daneben (K79) | alles |
| `Sterne.svelte` | **unverändert** — fünf Sterne, Größe 14–17 (K79) | alles |
| `Verlaufskurve.svelte` | Akzentlinie 1.5, Punkte r 4, Achse Sans 11, kein Raster | Datenlogik, Punktzahl |
| `Treppe.svelte` | **unverändert** in der Form (Höhe = Entfernung vom Ziel) | alles |
| `DrillDown.svelte` | Zeile 56–60 auf Blatt, Zählung rechts in Sans 12, „›“ in Spurfarbe | Navigation, Zählung |
| `BausteinListe.svelte` | Blatt mit Haarlinien, Typspalte 98 bleibt | Spaltenlogik |
| `Ablaufliste.svelte` | Zeilen 64 auf Blatt, offener Ring rechts | Erststart-Kette (K62) |
| `Vorschlag.svelte` | Blattzeile, „übernehmen“ als Akzent-Textzeile; abgelehnt = gedämpfte Zeile mit Ring | K68/K76 |
| `VorbelegteFrage.svelte` | Frage Serif 20, Antworten als Chips | 60/40-Gewichtung |
| `Rangliste.svelte` | Blatt mit Haarlinien, Rangzahl Sans 12 | Person im Gruppenkopf (K71) |
| `DoppelteEinheit.svelte` | Wert 19 + zwei Einheiten in Sans 12 | Rechenlogik |
| `LesartUmschalter.svelte` | wie Segment | **nicht** als Umfangsfilter (K73) |
| Tab-Leiste | 64 px, Zeichen 24, Label 11, aktiv Akzent + 600 | fünf Ziele, Reihenfolge |

Neu hinzugekommen (kein neues Muster im Sinne der Regel 6, sondern zwei Darstellungsformen
bestehender Inhalte):

- **Parameterkachel** — zweispaltiges Raster für Shot- und Zielwerte. Gleiche Felder,
  gleiche Reihenfolge, gleiche Einheiten wie in der bisherigen Werteliste.
- **Kaffeekarte** — Trägerform der Kaffeeliste.

Beide gehören ins Musterblatt (K74), sobald sie gebaut sind.

---

## 6 · SCREEN-MAPPING

### Kaffeeliste
- **Visuell neu:** Titel 32/600. Suchfeld 60 px mit Lupe. Segment mit Füllfläche.
  Zählform „Kaffee · 8 von 8“ links, „nur aktive“ mit Schalter rechts. Jeder Kaffee als
  Karte (Radius 18, Polster 18/20, Abstand 14): Name Serif 17/400, Röster Sans 12,
  darunter Haarlinie, darunter Röstgrad links und Bewertung rechts.
- **Komponenten:** Kopfzeile, Segment, Schalter, Bohnen, Sterne, Kaffeekarte.
- **Nicht geändert:** Sortierfelder, Suchverhalten, Filter „nur aktive“, Zählform,
  Reihenfolge, Trefferziel.

### Kaffeeblatt
- **Visuell neu:** Rückweg und Stift als runde Knöpfe. Titel 30/600 zweizeilig, Röster
  15 im Akzent darunter. Röstgrad und Bewertung in **einer** Blattzeile, getrennt durch
  senkrechte Haarlinie. Profile als Blatt mit Zeilen à 66 px, rundem Zeichen-Badge 38,
  Modus rechts in Sans 12, „›“ in Spurfarbe. „Bohne“ als Falte. Chargen als Blattzeilen
  mit Datum rechts. „+ Profil“ / „+ Charge“ als Akzent-Textzeile.
- **Komponenten:** Kopfzeile, Bohnen, Sterne, AuswahlListe (Falte), Blattliste.
- **Nicht geändert:** Reihenfolge der Gruppen, Faltverhalten, Chargenformat
  (Nummer + Röstdatum), Bearbeiten-Weg.

### Profile / Espresso-Setup
- **Visuell neu:** Titel 26/600, Setup-Kette in Sans 12 darunter, Primäraktion
  „Shot loggen“ als Pille. Zielwerte als Parameterkacheln (Input, Mahlgrad, Drehzahl,
  Kessel, Output, Preinfusion, Zeit). Hinweis „außerhalb der Messreihe“ als eigene ruhige
  Kachel mit halbem Zeichen. Spielraum als Blatt mit 4-px-Wertfeldern. Verlauf als Kurve
  auf Blatt. „Setup ändern“ als Blattzeile mit „▾“.
- **Komponenten:** Kopfzeile, Parameterkachel, Werteliste, Verlaufskurve, AuswahlListe.
- **Nicht geändert:** Feldnamen, Einheiten, Reihenfolge, Spielraum-Startwerte
  (Zeit ± 2 s, Output ± 0,4 g, Durchlaufzeit ± 5 s), Messreihen-Regel (K67, K75).

### Shot-Logging
- **Visuell neu:** Kopf mit Kaffeename 20 und Profil in Sans 12. Parameter als Kacheln.
  Ziel als Zeilenliste mit Herkunftskreisen, alle Werte 19. „Wie war er?“ als 2 × 2,
  gewählt = Füllfläche. „Was stört?“: Gruppenköpfe Geschmack/Lauf, Chips, „etwas
  anderes …“ als gedämpfte Zeile, „fertig“ als Pille am Fuß.
- **Komponenten:** Kopfzeile, Parameterkachel, IstGegenZiel, Urteil, Chips, Primäraktion.
- **Nicht geändert:** zwei Schritte, Urteilsstufen, Symptomlisten und ihre Reihenfolge,
  „fertig ohne Auswahl“ ist gültig, kein Timer.

### Einstellungen
- **Visuell neu:** Titel 32/600. „Geräte verwalten“ als Blattzeile im Akzent mit „›“.
  Gruppe „Verhalten“ als Blatt: Zeile mit Name Serif 17, Schalter rechts (an =
  Füllfläche), Beschreibung darunter in 14.5 gedämpft, Haarlinie zwischen den Einträgen.
  „Backup“ als Gruppenkopf mit Satz.
- **Komponenten:** Schalter, Blattliste.
- **Nicht geändert:** Schaltertexte, Beschreibungen, Reihenfolge, Backup-Verhalten.

### Geräte / Geräteformulare
- **Geräte:** Gruppen Setups / Mühlen / Brühgeräte, jeweils Blatt mit Zeilen 56 px,
  Haarlinien, „›“, letzte Zeile „+ Setup“ / „+ Mühle“ / „+ Brühgerät“ im Akzent.
- **Neues Brühgerät:** Blatt mit Formularzeilen — Label links Serif 16, Feld rechts in
  Vertiefung mit Radius 4 (Name, Typ mit „▾“, Gruppen numerisch). Erklärsätze in Sans
  12.5 gedämpft unter der jeweiligen Zeile. Schalter Dampflanze / Cooling Flush / PID.
  Segmente „Führungswert“ (Output · Durchlaufzeit) und „Sieb“ (einzel · doppel) mit
  Füllfläche. „anlegen“ als Pille am Fuß; deaktiviert = Vertiefung mit Spurfarbe.
- **Komponenten:** Kopfzeile, Werteliste, Schalter, Segment, Primäraktion, Blattliste.
- **Nicht geändert:** Felder, Reihenfolge, Erklärtexte, Geräteregeln (Siebträger Output ·
  Pour Over Durchlaufzeit · Moka kein Führungswert), Kesseltemperatur-Tabelle als
  eigener Weg.

---

## 7 · LIGHT UND DARK

Ein Satz semantischer Rollen, zwei Helligkeitsfassungen. Keine eigene Gestaltungsidee je
Theme, keine unterschiedlichen Radien, Größen, Abstände oder Kompositionen.

- Rohfarben beider Themes im `:root`; `@media (prefers-color-scheme)` und
  `[data-theme]` enthalten **nur Zuordnungen**, nie neue Farbwerte.
- Übertragungsregel: **heller heißt näher an der Hand.** Blatt ist heller als Grund,
  Vertiefung ist im Hellen dunkler als das Blatt und im Dunkeln heller als das Blatt.
- Die Füllfläche ist in beiden Themes derselbe warme Ton in zwei Helligkeiten:
  `#83553A` mit Papierschrift hell, `#E0AE79` mit dunkler Schrift dunkel.
- Der Akzent wird im Dunkeln heller und weniger gesättigt (`#A2643B` → `#D29A66`).
- Zustands- und Herkunftszeichen behalten Form und Größe; nur die Farbtoken wechseln.
- Beide Themes sind in jeder Designprüfung nebeneinander zu zeigen.

---

## 8 · UX-NACHZUG (nicht Teil dieser Implementierung)

Während des Designs entstanden, ausdrücklich **nicht** jetzt bauen:

1. Zusätzlicher Inhalt in der Kaffeekarte (letzter Shot, Charge, Restmenge) — verändert
   Informationsmenge, gehört in den UX-Audit.
2. Sekundäraktionen in ein `⋯`-Kontextmenü der Kopfzeile, sobald ein Bildschirm mehr als
   eine hat (Regel 4 der UX-Regeln).
3. Muster 9 verallgemeinern (Typspalte optional) für schlichte Listen.
4. Theme-Schalter in den Einstellungen (hell · dunkel · System) — Struktur kann es,
   Bild fehlt.
5. Wortwahl statt „Standzeit“ in der Wartungszeile.
6. rem-Umstellung für Systemschriftgrößen.

---

## 9 · OFFENE PUNKTE

1. **Light-Mode-Füllfarbe des gewählten Zustands (`#83553A`) ist vorläufig.** Sie kann
   später feinjustiert werden. Deshalb: genau ein Token, an genau einer Stelle definiert,
   nirgends hartkodiert, keine abgeleiteten Varianten daraus bilden.
2. Text unter den Tab-Symbolen noch nicht final. Die Leiste ist so gebaut, dass ein
   Entfall des Labels keine Maßänderung erzwingt.

Keine weiteren offenen Fragen.

---

## 10 · IMPLEMENTIERUNGSREIHENFOLGE

1. **Fundament.** `src/muster/tokens.css` auf die Werte aus Abschnitt 3 ziehen: Farben
   beider Themes, Typo-Skala, Raumleiter, Radien, Zeichenmaße. Alte Tokens, die dem
   widersprechen (Radius 0/2, Führungswert 44, Feldfarben), ersetzen — Namen beibehalten,
   wo möglich; neue Namen: `--vertiefung`, `--fuellung`, `--auf-fuellung`, `--badge`.
2. **Gemeinsame Muster.** Kopfzeile, Segment, Chips, Schalter, Urteil, Einzelauswahl,
   Werteliste, IstGegenZiel, Blattliste, Tab-Leiste, Primäraktion, Suchfeld,
   Parameterkachel, Kaffeekarte.
3. **Kaffeeliste und Kaffeeblatt.**
4. **Shot-Logging und Profil/Parameter.**
5. **Restliche Screens.** Einstellungen, Geräte, Geräteformulare, danach alle übrigen
   Bildschirme, die dieselben Muster verwenden.
6. **Musterblatt und Konsistenzprüfung.** Musterblatt um Parameterkachel und Kaffeekarte
   ergänzen; anschließend jeden Bildschirm in hell und dunkel gegen Abschnitt 3 und 4
   prüfen: keine Schatten, keine gefärbte Schrift in Auswahl, keine Sondergrößen, drei
   Ebenen, Tab-Leiste 64.

---

## NICHT VERHANDELBAR FÜR DIE IMPLEMENTIERUNG

- **Keine Schatten.** Nirgends, in keiner Stärke.
- **Kein Rand um Blätter und Karten.** Trennung nur über Helligkeit und Abstand.
- **Drei Flächenebenen.** Keine vierte einführen.
- **Eine Füllfläche je Theme** für Auswahl und Primäraktion. Kein farbiger Text im
  gewählten Zustand, kein Akzentstrich als Auswahl, keine schwarze oder weiße Vollfläche.
- **Ein Akzent.** Keine zweite Akzentfarbe, keine Signalfarbe für „gut“, Farbe nie
  alleiniger Träger eines Zustands.
- **Serif für Inhalt, Sans nur für den Apparat.** Keine Sans-Überschriften, kein Mono.
- **Alle Werte gleich groß (19/500 tabular).** Führungswert ohne Größe, Kreis, Rahmen
  oder Wort. Einheit immer sichtbar, immer in eigener Spalte.
- **Wertfelder bleiben eckig (Radius 4)**, alles andere rund.
- **Kreisfamilie für Zustand und Herkunft.** Keine Balken, keine Fortschrittsanzeigen,
  keine Countdowns.
- **K79 gilt unverändert:** Röstgrad fünf Bohnen, Bewertung fünf Sterne, Anbauhöhe mit
  Tausenderpunkt, Charge mit Nummer und Röstdatum — nie durch eine schlichtere Form
  ersetzen.
- **Trefferfläche ≥ 48 px, Bedienschrift ≥ 15 px, Label ≥ 10.5 px, kein waagerechtes
  Scrollen, Rückweg immer sichtbar** (einzige Ausnahme: Erststart, K78).
- **Keine UX-Änderung.** Navigation, Reihenfolge, Feldnamen, Wege, Schrittzahl und
  Produktlogik bleiben exakt wie in `docs/konzept.md` und `docs/ux-regeln.md`.
