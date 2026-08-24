# Offene Punkte — Visueller Redesign-Reset

Stand: 2026-08-24, nach Abschluss Paket 4 (Einstellungen, Geräte,
Geräteformulare, übrige produktive Screens) auf Branch `design/redesign-v1`.

**`docs/design/redesign-v1-handoff.md` bleibt die Quelle für alles Visuelle,
`docs/konzept.md`/`docs/ux-regeln.md` für Produktlogik/UX.** Dieses Dokument
ist nur die Liste dessen, was beim Umbau tatsächlich noch aussteht oder als
bewusste Zwischenlösung markiert wurde — für Sessions, die diesen Strang ohne
den vollen Kontext dieser Umsetzung fortsetzen.

Der Gesamtplan (Pakete 1–5, Screen-Zuordnung, Risiken) liegt als
Plan-Datei unter `C:\Users\julia\.claude\plans\wir-implementieren-jetzt-den-steady-backus.md`
— nicht im Repo, nur lokal bei Julian. Dieses Dokument hier fasst nur den
Teil zusammen, der für die Weiterarbeit am Code wirklich relevant ist.

---

## 0. Zwei Punkte ohne Bezug zum visuellen Redesign — vorläufig hier notiert

**a) Verlaufskurve zeigt bei mindestens einem Profil eine falsche Häufung.**
Gemeldet für „Espresso Entcoffeiniert" (Café Langen), Profil „Espresso": alle
Shots bis auf einen liegen sichtbar falsch im Diagramm. Ein echter Bug wurde
bereits gefunden und behoben (`daten/migration/migrieren.ts`: die
Zeitstempel-Spreizung migrierter Shots zählte `gueltigeShots.length` statt
der tatsächlich geschriebenen Shot-Anzahl — behoben, siehe Commit
„Anpassungen: Bruehgruppe-Kachel, Icons, Migrations-Zeitstempel-Fix,
Labels"). Für den konkret gemeldeten Fall ließ sich die Häufung aus der
eingecheckten Seed-Datei (`daten/seed/notion-2026-08-20.json`) mit dem
damaligen Code **nicht reproduzieren** — Zeitstempel und Mahlgrad sind für
dieses Profil bereits gleichmäßig verteilt. Zwei offene Erklärungen:
entweder läuft die App noch mit älteren IndexedDB-Daten aus einem früheren
Migrationslauf (dann hilft ein erneuter Migrationsdurchlauf), oder es handelt
sich um einen echten, später selbst geloggten Shot mit einem abweichenden
Wert. Braucht mehr Kontext von Julian (Datum/Uhrzeit der betroffenen Shots),
bevor hier weiter gesucht werden kann. **Kein Redesign-Thema** — Korrektheit
der Datenschicht, nur vorläufig hier abgelegt, weil noch kein passenderer
Ort dafür existiert.

**b) Urteilsstufe „Referenz" — offene Produktfrage, nicht entschieden.**
Julian: „Referenz ist nicht notwendig, da ja jeder Shot auf Wunsch das neue
Ziel verändern kann und somit auch eine neue Referenz gründet." Das ist eine
**Produktlogik-Frage** (vierte Urteilsstufe ggf. entfernen: Schema
`daten/schema/common.ts` `Urteil`-Enum, `Urteil.svelte`, K26/K32/K57 in
`docs/konzept.md`, ggf. `domain/ranking.ts`/Historie-Planung) — ausdrücklich
**nicht** im Rahmen der visuellen Redesign-Pakete umgesetzt oder entschieden,
weil das Produktlogik verändern würde. Wenn das umgesetzt werden soll, gehört
es zuerst als Entscheidung ins Konzept, dann als eigener (kleiner) Auftrag.

---

## 1. Rückwärtskompatible Alias-Tokens — müssen mit Paket 2–4 abgebaut werden

`src/muster/tokens.css` definiert zur Übergangszeit fünf Alias-Rollen, die es
im Handoff nicht mehr gibt:

```
--ruhig        → var(--blatt)
--feld         → var(--vertiefung)
--feld-blatt   → var(--blatt)
--feld-rahmen  → transparent
--linie-zart   → var(--linie)
```

**Stand nach Paket 4: kein produktiver Screen nutzt die Aliase mehr.** Verifiziert
per Grep über `src/bereiche` (Stand 2026-08-24) — null Treffer für
`--feld)`/`--feld-blatt`/`--feld-rahmen`/`--linie-zart`/`--ruhig`/
`radius-feld`/`radius-chip` in `src/bereiche/**/*.svelte`. Auch `Kontextmenue.
svelte` (produktiv in mehreren Ansicht-Screens genutzt) ist jetzt umgestellt.

**Einzige verbleibenden Nutzer der Aliase:** `Ablaufliste.svelte`,
`BausteinListe.svelte`, `DrillDown.svelte` (siehe Punkt 4) — ausschließlich
über `Musterblatt.svelte` erreichbar, das explizit Paket 5 ist. Die Aliase
bleiben deshalb **bewusst in `tokens.css` stehen**, bis diese drei Muster in
Paket 5 migriert sind — sie sonst schon jetzt zu entfernen, hätte
`Musterblatt.svelte` (aktuell noch ein echter, erreichbarer Bildschirm)
optisch kaputt gemacht, ohne dass diese Session an der Datei etwas geändert
hätte. Danach: Aliase ersatzlos aus `tokens.css` streichen.

`--radius-feld`/`--radius-chip` existieren **nicht mehr** als Tokens. Auch
hier: kein produktiver Screen nutzt sie mehr (`Einstellungen.svelte`s `.karte`
wurde in Paket 4 durch `.panel`/`--r-blatt` ersetzt).

## 2. Zwei Handoff-interne Maß-Konflikte — bewusst wörtlich umgesetzt

Der Handoff widerspricht an zwei Stellen seiner eigenen
„Nicht verhandelbar“-Regel „Trefferfläche ≥ 48 px“:

- **Segment-Felder:** Handoff 3.8 nennt explizit „Höhe 40–42“ →
  `--segment-feld-hoehe: 42px` in `tokens.css`, genutzt von `Segment.svelte`
  und `LesartUmschalter.svelte`.
- **AuswahlListe-Feld (geschlossen):** Handoff 3.8 nennt explizit „Höhe 38“ →
  hart codiert in `AuswahlListe.svelte` (`.feld { min-height: 38px }`).

Beide Stellen wurden wörtlich nach der genannten Zahl umgesetzt, nicht nach
der 48-px-Regel — das ist keine eigene Designentscheidung, sondern ein
Widerspruch im Handoff-Dokument selbst. Falls das korrigiert werden soll,
gehört die Korrektur zuerst in den Handoff, danach in den Code.

## 3. Kopfzeile: zweite Titelgröße — erledigt in Paket 2

`Kopfzeile.svelte` hat jetzt einen additiven `gross`-Prop (boolean, Default
`false`): Icon-Reihe (Rückweg + Aktion) in einer eigenen Zeile, Titel als
32/600-Block darunter. Erster und bisher einziger Aufrufer:
`Kaffeeblatt.svelte`. Jeder andere Aufruf ohne `gross` verhält sich exakt wie
zuvor (verifiziert: `svelte-check` 0 Fehler, alle 358 Tests grün). Kein
`<br>`-Parsing im Titelstring — mehrzeilige Titel entstehen durch natürlichen
Zeilenumbruch bei 32px Schriftgröße, nicht durch eine erzwungene Trennstelle.

## 4. Sechs Muster ohne Produktions-Verwendung — zurückgestellt auf Paket 5

`Ablaufliste.svelte`, `BausteinListe.svelte`, `DrillDown.svelte`,
`Rangliste.svelte`, `DoppelteEinheit.svelte`, `Treppe.svelte` werden aktuell
**ausschließlich** von `Musterblatt.svelte` verwendet (verifiziert per Grep
über `src/bereiche`, Stand 2026-08-23) — kein produktiver Screen bindet sie
ein. Sie tragen deshalb noch alte Auswahlmuster (u. a. `box-shadow: inset …
var(--akzent)` in `Ablaufliste.zeile.aktiv` und `BausteinListe.zeile.
angehoben`) und wurden in Paket 1 nicht angefasst, weil das nur zusammen mit
`Musterblatt.svelte` selbst sauber ginge (Paket 5: „Musterblatt-Ergänzung und
Konsistenzprüfung“). Bei Bedarf vorher prüfen, ob sich das inzwischen
geändert hat (`grep -rl "from '.*/muster/<Name>.svelte'" src/bereiche`).

## 5. Neuer Baustein: `Suchfeld.svelte`

Nicht im Handoff als eigenes „Muster“ geführt (dort nur im Bauteil-Abschnitt
3.8 beschrieben), aber als eigene Komponente gebaut statt als lokales CSS in
`KaffeeListe.svelte` — Konsistenzgrund: eine zweite Suchzeile (z. B. Historie,
Paket 05) bekommt sonst dasselbe CSS ein zweites Mal von Hand. Einziger
aktueller Aufrufer: `KaffeeListe.svelte`. Gehört ins Musterblatt, sobald
Paket 5 ansteht (`ux-regeln.md` Regel 6/K74).

## 6. Schwebender „+“-Knopf in `KaffeeListe.svelte` — erledigt in Paket 2

Rund (Radius 999) und mit der Füllfläche (`--fuellung`/`--auf-fuellung`)
statt der bisherigen eckigen Tinte-Fläche.

## 7. Musterblatt — vier Stellen minimal nachgezogen, Rest offen

`Musterblatt.svelte` ist Paket 5, wurde aber an vier Stellen doch angefasst,
weil sie sonst auf inzwischen nicht mehr existierende Tokens gezeigt hätten
(`--ruhig`/`--feld`-Swatches, `--fs-fuehrung`-Demo, `--h-papier`,
`--marke-gut`) — reine Token-Umbenennung, keine Strukturänderung. Der Rest der
Datei (14 Musterabschnitte, Tab-Leiste im Bild, etc.) ist unverändert und
zeigt entsprechend noch die alte Optik der dort eingebundenen, noch nicht
migrierten Muster (siehe Punkt 4).

## 8. Neues Muster für „Blatt mit navigierbaren Zeilen“ — weiterhin offen, jetzt an neun Stellen dupliziert

War nach Paket 2 an zwei Stellen (Kaffeeblatt Profile/Chargen), ist nach
Paket 4 an mindestens neun: zusätzlich `Geraete.svelte` (Setups/Mühlen/
Brühgeräte-Listen), `Einstellungen.svelte` (Geräte verwalten/Beobachtungen/
Musterblatt-Zeilen), `Beobachtungen.svelte` (Eintrag-Panels),
`GussplanEditor.svelte` (Bausteinliste), `TempReferenz.svelte`
(Messpunkt-Liste), `Migration.svelte` (Berichtliste) — jedes Mal derselbe
lokale `.panel { background: var(--blatt); border-radius: var(--r-blatt);
padding: 0 var(--r4); } .panel > :not(:first-child) { border-top: 1px solid
var(--linie); }` plus eine passende Zeilen-Klasse. Ich habe **weiterhin
bewusst kein neues Muster gebaut** (siehe Begründung unten), aber die
Duplikation ist jetzt so groß, dass sich ein echtes `Blattliste.svelte`
in Paket 5 kaum noch vermeiden lässt: gäbe es das Muster morgen, ließen sich
alle neun Stellen darauf zurückführen, ohne dass sich am Verhalten irgendwo
etwas ändert — genau der Fall, den `ux-regeln.md` Regel 6/12 für „gemeinsame
Lösung statt lokaler Kopie“ meint. Bitte vor Paket 5 entscheiden, ob dieses
Muster jetzt gebaut wird (dann zusammen mit Punkt 5, `Suchfeld.svelte`, ins
Musterblatt aufnehmen) oder ob die Duplikation bewusst bleibt.

**Warum ich es nicht selbst entschieden habe:** ein neues Muster ist eine
Architekturentscheidung mit API-Fragen, die ohne Rückfrage falsch geraten
werden können — welche Zeilen-Varianten es abdecken muss (mit/ohne rundes
Icon-Badge, mit/ohne Chevron, mit/ohne Meta-Text, mit Sonderzuständen wie
„aktuelle“/„leer“ bei Chargen), ist genau die Art Frage, die `ExitPlanMode`
vor der Umsetzung klären sollte, nicht ich mitten in einem visuellen Paket.

---

## 9. Setup-Kette zeigt nur Setup-Name + Modus, nicht Mühle/Brühgerät — offene Designfrage

Die Referenz zeigt für die Setup-Kette unter dem Profilnamen ein vierteiliges
Beispiel: „Espresso · Sculptor · Mozzafiato · Dial-in" (Profiltyp · Mühle ·
Brühgerät · Modus). Der tatsächliche Code zeigt weiterhin nur zwei Teile:
„Setup-Name · Modus" (Profilblatt.svelte, ShotErfassung.svelte) — das war
schon vor Paket 3 so und ist unverändert geblieben. Mühle/Brühgerät sind über
`bestand.muehleVon`/`bestand.bruehgeraetVon` im Code bereits verfügbar, eine
Erweiterung wäre also technisch klein. **Ich habe das bewusst nicht
geändert**, weil das eine Entscheidung über gezeigten Inhalt ist, keine rein
visuelle — genau die Grenze, die dieser Redesign-Auftrag ausdrücklich nicht
überschreiten sollte. Julian müsste entscheiden, ob die Setup-Kette erweitert
wird.

## 10. „Fertig"-Knopf nicht als Pille am Fuß der Ansicht gepinnt — offene Designfrage

Handoff-Text (Screen-Mapping "Shot-Logging") und die dunkle Referenz-Ansicht
(C4) zeigen „fertig" als Pille, die am unteren Bildschirmrand über der
Tab-Leiste klebt (`flex:1`-Spacer + Pille). Die tatsächlichen `Knopf`-Aufrufe
in `ShotErfassung.svelte` (Diagnose-Phase, Drift-Phase) stehen dagegen im
normalen Textfluss direkt nach ihrem Inhalt — wie vor dem Redesign. **Bewusst
nicht angepasst**, weil eine echte Fuß-Fixierung eine Änderung an der
Scroll-Container-Struktur des gesamten Rahmens (`Rahmen.svelte` `.inhalt`)
verlangen würde, nicht nur an diesem einen Screen — das wäre über den
Auftragsumfang "Profil + Shot" hinausgegangen und hätte die gemeinsame
Navigations-Hülle angefasst. Wenn das gewünscht ist, gehört es in einen
eigenen, gezielten Auftrag.

## 11. Hinweis-Kachel (Kessel außerhalb der Messreihe) nutzt dieselbe Blattfläche wie normale Kacheln

Die Referenz zeigt für diese eine Kachel einen minimal abweichenden
Hintergrundton (`#f6f0e7` statt `#fcfaf6` bei den übrigen Kacheln — ein Unter-
schied von wenigen Promille Helligkeit). Ich habe dafür **keinen neuen Token**
eingeführt und stattdessen dieselbe `--blatt`-Fläche wie alle anderen Kacheln
verwendet, weil (a) der Unterschied im Bild kaum wahrnehmbar ist und (b) ein
Farbwert ohne benannte Rolle im Handoff-Text eine eigene, nicht abgesicherte
Designentscheidung gewesen wäre. Das Halbzeichen (Achtung-Kreis) und der
eigene Text unterscheiden die Kachel bereits ausreichend von den Wertkacheln.

## 12. Kopfzeile `gross` jetzt auch für Root-Tab-Screens ohne Rückweg

Handoff-Text nennt für Root-Tab-Screens (Kaffees, Einstellungen, Bar, Historie,
Getränke) explizit „Titel 32/600“ — dieselbe Größe wie Objektseiten, nur ohne
Rückweg-Zeile darüber. `Kopfzeile.svelte`s `gross`-Modus war das bisher nicht
gewachsen (er rechnete mit mindestens `onZurueck` oder `aktion`, sonst hätte
er eine leere Icon-Reihe gerendert). Jetzt additiv gefixt: ohne beides fällt
die Icon-Reihe einfach weg. `KaffeeListe.svelte`, `Einstellungen.svelte`,
`Bar.svelte` und die beiden Platzhalter-Kopfzeilen in `Rahmen.svelte`
(Historie/Getränke) nutzen jetzt `gross`. **Das war vorher inkonsistent**
(Kaffeeliste zeigte schon vorher fälschlich nur 26px, seit Paket 2) — hier
über die Konsistenzprüfung in Paket 4 gefunden und korrigiert.

## 13. Setup-Kette in `Profilblatt.svelte`/`ShotErfassung.svelte` — weiterhin unverändert (siehe Punkt 9)

Punkt 9 bleibt unverändert offen — in Paket 4 nicht nochmal angefasst, da
außerhalb dieses Pakets Scope (betrifft Profilblatt/ShotErfassung, Paket 3).

## Bereits erledigt, nicht mehr offen (zur Erinnerung)

- Paket 1 vollständig: Tokens, Knopf, Segment, Chips, Urteil, Einzelauswahl,
  Schalter, AuswahlListe, Werteliste, IstGegenZiel, Vorschlag,
  LesartUmschalter, VorbelegteFrage, Kopfzeile (Rückweg-Knopf), Herkunft
  (Schatten entfernt), Tab-Leiste (`Rahmen.svelte`), Suchfeld neu.
- Paket 2 vollständig: `Kaffeekarte.svelte` neu, `KaffeeListe.svelte`
  (Karten statt Zeilen, runder gefüllter Anlege-Knopf), `Kaffeeblatt.svelte`
  (Kopfzeile-`gross`-Modus, Röstgrad/Bewertung-Blattzeile mit senkrechter
  Haarlinie, Profile/Bohne-Falte/Chargen als Blattpanel), `Kopfzeile.svelte`
  um additiven `gross`-Prop erweitert.
- Paket 3 vollständig: `Parameterkachel.svelte` neu (sieben feste Symbole:
  Input/Mahlgrad/Drehzahl/Kessel/Output/Preinfusion/Zeit), neue globale
  Utility `.parameter-raster` in `tokens.css`. `Profilblatt.svelte` (Ziel als
  Kachel-Raster, Kessel-Hinweiskachel, Spielraum-Werteliste präzisiert,
  Reihenfolge Titel→Setup-Kette→Primäraktion, Label „Kessel" statt
  „Kesseltemperatur"). `ShotErfassung.svelte` (Parameter als Kachel-Raster,
  Kaffeename/„Wie war er?" auf Objektname-Größe 20/400). `Werteliste.svelte`
  und `IstGegenZiel.svelte` um fehlendes Sans-Register bei Gruppenkopf/
  Einheit ergänzt (galt vorher versehentlich als Serif).
- Paket 4 vollständig: alle verbleibenden produktiven Screens umgestellt —
  `Einstellungen.svelte`, `Geraete.svelte`, `Bruehgeraetblatt.svelte`,
  `Muehleblatt.svelte`, `Setupblatt.svelte`, `BruehgeraetAnsicht.svelte`,
  `MuehleAnsicht.svelte`, `SetupAnsicht.svelte`, `TempReferenz.svelte`,
  `Migration.svelte`, `Backup.svelte`, `Beobachtungen.svelte`,
  `GussplanEditor.svelte`, `KaffeeBearbeiten.svelte`, `KaffeeNeu.svelte`,
  `Bar.svelte`, `Rahmen.svelte` (Historie/Getränke-Platzhalter),
  `Kontextmenue.svelte`, `Kopfzeile.svelte` (gross für Root-Tabs, Punkt 12).
  Drei neue globale Utilities in `tokens.css`: `h2` (Gruppenkopf-Basis),
  `.formularzeile`/`.formularzeile-label` (Label+Feld-Zeile),
  `.eingabefeld-text` (Vertiefung/Radius-4-Textfeld) — lösen die Duplikation
  aus elf Dateien ab (Handoff-Screen-Mapping „Geräte/Geräteformulare“).
  `KaffeeBearbeiten.svelte`s Röstgrad/Bewertung-Zeile jetzt wie in der
  Leseansicht (Kaffeeblatt) eine Blattzeile mit senkrechter Haarlinie statt
  einer randlosen Zeile.
- **Nach Paket 4 ist kein produktiver Screen mehr unmigriert.** Einzig
  `Musterblatt.svelte` (explizit Paket 5) zeigt noch die alte Formsprache,
  begrenzt auf die sechs dort exklusiv genutzten Muster aus Punkt 4.
- Source Sans 3 als Apparatschrift installiert und eingebunden
  (`@fontsource-variable/source-sans-3`).
- `npm test` (vitest inkl. `tokens.test.ts`/`schichten.test.ts`, svelte-check,
  vite build) grün nach Paket 1–4 (359 Tests, 0 svelte-check-Fehler).
