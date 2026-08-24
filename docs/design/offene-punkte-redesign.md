# Offene Punkte — Visueller Redesign-Reset

Stand: 2026-08-24, nach Paket 5 (Musterblatt, Konsistenz-Audit, Token-
Hygiene, Light/Dark-Strukturprüfung) **und** einer anschließenden freien
Rückmeldungsrunde (Einstellungen, Geräte/Brühgerät-Formulare, Kaffeeblatt,
Homebar) auf Branch `design/redesign-v1`. Redesign-Umsetzung inhaltlich
abgeschlossen — offen bleiben nur die unten gelisteten, bewusst nicht selbst
entschiedenen Punkte.

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

## 1. Rückwärtskompatible Alias-Tokens — erledigt in Paket 5

`src/muster/tokens.css` definierte zur Übergangszeit fünf Alias-Rollen
(`--ruhig`, `--feld`, `--feld-blatt`, `--feld-rahmen`, `--linie-zart`), die es
im Handoff nicht mehr gibt. Nach Paket 4 waren die einzigen verbleibenden
Nutzer `Ablaufliste.svelte`, `BausteinListe.svelte`, `DrillDown.svelte`
(ausschließlich über `Musterblatt.svelte` erreichbar). Paket 5 hat alle drei
auf die echten Rollen umgestellt (Blattliste mit Haarlinien statt eckig
umrandeter `--feld`-Zeilen, „gewählt"/„aktiv" jetzt Füllfläche statt
`box-shadow: inset … var(--akzent)` — dieselbe Migration wie in Paket 1 für
die produktiven Muster) und den kompletten Alias-Block **ersatzlos aus
`tokens.css` entfernt**. Verifiziert per Grep über ganz `src/` (Stand
2026-08-24): keine Treffer mehr für `--feld)`/`--feld-blatt`/
`--feld-rahmen`/`--linie-zart`/`--ruhig)` außerhalb erklärender Kommentare in
zwei Geräteformularen (die beschreiben dort nur noch, was früher da war).

`--radius-feld`/`--radius-chip` existierten schon vor Paket 5 nicht mehr als
Tokens (kein produktiver Screen nutzte sie zuletzt in Paket 4).

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

## 4. Sechs Muster ohne Produktions-Verwendung — Token-Migration in Paket 5 erledigt

`Ablaufliste.svelte`, `BausteinListe.svelte`, `DrillDown.svelte`,
`Rangliste.svelte`, `DoppelteEinheit.svelte`, `Treppe.svelte` werden weiterhin
**ausschließlich** von `Musterblatt.svelte` verwendet (verifiziert per Grep
über `src/bereiche`, Stand 2026-08-24) — kein produktiver Screen bindet sie
ein, das ändert Paket 5 nicht (kein Screen wurde dafür neu gebaut). Beim
Nachlesen zeigte sich: `Rangliste.svelte`, `DoppelteEinheit.svelte` und
`Treppe.svelte` liefen schon auf den neuen Tokens (keine Aliase, kein
Schatten) — nur `Ablaufliste.svelte`, `BausteinListe.svelte` und
`DrillDown.svelte` trugen noch alte Auswahlmuster (`box-shadow: inset …
var(--akzent)`, `--feld`/`--feld-rahmen`/`--ruhig`). Diese drei sind jetzt
migriert (siehe Punkt 1). `BausteinListe.svelte`s „angehoben"-Zustand
(während des Ziehens, keine Auswahl) bekam bewusst **keine** Füllfläche wie
die übrigen Auswahlstrich-Migrationen, sondern einen linken Akzentstreifen
auf Vertiefungsfläche — Füllfläche hätte hier wie eine Auswahl statt wie ein
Zwischenzustand gewirkt.

Bei Bedarf vorher prüfen, ob sich die Nichtverwendung inzwischen geändert hat
(`grep -rl "from '.*/muster/<Name>.svelte'" src/bereiche`).

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

## 7. Musterblatt — vollständig auf finalen Redesign-Stand gebracht (Paket 5)

`Musterblatt.svelte` zeigt jetzt zusätzlich zu den ursprünglichen 15
Musterabschnitten: `Segment`, `AuswahlListe`, `Suchfeld`, `Kaffeekarte`,
`Parameterkachel`, `Werteliste`, die globale Formularzeile-/
Eingabefeld-Text-Utility (inkl. `disabled`-Zustand), `Kopfzeile` im
`gross`-Modus (mit und ohne Rückweg) sowie einen Fokuszustand-Hinweis — alles
Muster, die produktiv verwendet werden, aber im Musterblatt bisher fehlten
(verifiziert per Grep: Aufrufer in `src/bereiche` vorhanden, kein Eintrag im
alten Musterblatt-Import). Kein neues Muster wurde dafür erfunden — jede
Ergänzung bindet eine bestehende `src/muster/*.svelte`-Komponente oder
`tokens.css`-Utility genau so ein, wie ein produktiver Screen sie auch nutzt.

**Bewusst nicht ins Musterblatt übernommen:** die Tab-Leiste (`Rahmen.
svelte`). Sie ist kein eigenständiges `src/muster`-Muster, sondern
App-Chrome mit eigenem SVG-Icon-Satz — eine zweite Kopie im Musterblatt wäre
genau die Art Duplikation, die Paket 5 abbauen soll, keine, die es anlegen
sollte. Stattdessen direkt in `Rahmen.svelte` geprüft (Konsistenz-Audit,
siehe unten): nutzt bereits durchgehend die neuen Tokens, kein Alt-Rest
gefunden.

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

## 14. Lokale `.link`-Textzeile — kleine Restduplikation, bewusst nicht vereinheitlicht

`Beobachtungen.svelte`, `GussplanEditor.svelte` und `Migration.svelte` bauen
je eine eigene `.link`-Klasse für akzentfarbene Textzeilen-Aktionen
(„+ Beobachtung“, Gussplan-Werkzeuge, „Migration erneut prüfen“) — identisches
Grundmuster (`color: var(--akzent); background: none; border: none;`), aber
mit **unterschiedlicher Schriftgröße** (`--fs-meta` 12 / `--fs-satz` 15 /
`--fs-bedienwort` 17). Kleiner als in Paket 4 vermutet: `Einstellungen.svelte`
und `Kaffeeblatt.svelte` nutzen diese Klasse inzwischen nicht mehr (dort schon
durch `.blattzeile`-Zeilen ersetzt) — nur noch drei Fundstellen, nicht fünf.

**Bewusst nicht vereinheitlicht:** die unterschiedlichen Größen könnten
Absicht sein (unterschiedliches Gewicht der drei Aktionen im jeweiligen
Kontext) oder schlicht Zufall — das lässt sich ohne Rückfrage nicht
unterscheiden, und eine falsch geratene „richtige“ Größe wäre eine sichtbare
Änderung an drei produktiven Screens. Kein Blocker, kleinste der offenen
Konsistenzfragen dieses Redesigns.

## 15. Chargennummer — Rückmeldung 2026-08-24, keine Funktions-/Datenmodelländerung in dieser Runde

Julian: „Mir reicht das Röstdatum als Charge, benötige keine separate
Nummer oder so." Das ist eine **Funktions-/Datenmodellfrage** (`Charge.
nummer` müsste aus `daten/schema.ts` raus, `Kaffeeblatt.svelte`s Anlage-
Formular verlangt aktuell noch beide Felder als Pflicht) — ausdrücklich
**nicht** in dieser rein visuellen Rückmeldungsrunde umgesetzt. Sichtbar
gemacht wurde nur die visuelle Teilkorrektur (Charge „aktuelle" nicht mehr
fett, sondern Akzentfarbe). Wenn die Nummer wirklich wegfallen soll: eigener
kleiner Auftrag, der `Charge.nummer` optional macht oder streicht und prüft,
ob migrierte Altdaten (Notion-Import, siehe CLAUDE.md „Chargen sind
Platzhalter") davon betroffen sind.

## 16. "Übernehmen?"-Vorschlag bei Bewertung — nur für Mahlgrad, nicht für andere Parameter

Julian fragte, ob eine Parameteränderung beim Bezug (Input, Kessel, Drehzahl,
…) gefolgt von „sehr gut"/„Referenz" ebenfalls anbietet, sie als neuen
Zielwert zu übernehmen. **Antwort: teilweise ja** — `ShotErfassung.svelte`
prüft das (K12 „Alltagskorrektur") ausdrücklich nur für **Mahlgrad**
(`mg !== profil.ziel.mg`), nicht für Input/Kessel/Drehzahl/Output/
Preinfusion/Zeit. Das ist offenbar eine bewusste Entscheidung aus Paket 04
(Mahlgrad ist der Parameter, den man laufend fein nachjustiert; die übrigen
gelten eher als Setup-Fixwerte) — aber nicht mehr dokumentiert, warum genau
diese Grenze gezogen wurde. **Nicht selbst erweitert**, weil das den
Auslöser einer Rezeptur-Rückfrage ändern würde (K12: „Fragen, die eine
Rezeptur ändern, [bekommen] nie [eine Vorbelegung]" — eine *neue* Frage
einzuführen ist ein Funktionsschritt, kein visueller). Eine Ausweitung auf
weitere Parameter ist eine **UX-Nachzug-Idee**, kein Bug.

## 17. Verlaufskurve + Temperatur im selben Diagramm — Einschätzung, nichts umgesetzt

Julian überlegt, die Brühgruppentemperatur in dieselbe Verlaufskurve wie den
Mahlgrad zu integrieren. Ehrliche Einschätzung (keine Umsetzung, reine
Analyse-Frage):

- **Mahlgrad-Kurve allein:** zeigt, wie sich der Mahlgrad über die Zeit
  bewegt hat (Drift, Totzonen, Chargenwechsel) — bereits gebaut, funktioniert
  als Diagnosewerkzeug für „wo stehe ich gerade".
- **Temperatur-Kurve allein:** hätte denselben Nutzen für Temperatur-Drift
  — nur relevant, wenn PID an ist (siehe Punkt oben zu Gruppen/PID), bei den
  meisten Setups vermutlich über lange Zeit eine flache Linie.
- **Beide zusammen in einem Diagramm:** **eher kein Mehrwert, eher
  Verwirrung.** Mahlgrad und Temperatur sind zwei unabhängige Achsen mit
  unterschiedlichen Einheiten und unterschiedlicher Änderungsfrequenz (Mahlgrad
  wird oft pro Shot leicht nachjustiert, Temperatur bleibt meist über Wochen
  fix) — eine gemeinsame X-Achse (Zeit) mit zwei Y-Skalen liest sich nur dann
  sinnvoll, wenn man explizit nach einer **Korrelation** sucht (ändert sich der
  ideale Mahlgrad mit der Temperatur?). Dafür bräuchte es aber eher eine
  **Streudiagramm-Ansicht** (Temperatur auf X, Mahlgrad auf Y, ein Punkt je
  Shot) als zwei überlagerte Zeitverläufe — das beantwortet die eigentlich
  interessante Frage direkter als zwei Linien übereinander.
- **Empfehlung:** getrennt lassen, und falls die Korrelationsfrage wirklich
  interessiert, ein eigenes, einfaches Streudiagramm dafür bauen statt die
  bestehende Verlaufskurve zu überladen. Das ist eine **UX-Nachzug-Idee**
  für später, keine jetzt zu entscheidende Sache.
- **Der Diagrammfehler aus Punkt 0a besteht laut Julian weiterhin** („das
  mit dem Diagramm passt ohnehin noch immer nicht … da ist ein Bug").
  Weiterhin nicht reproduzierbar ohne mehr Kontext (siehe Punkt 0a) — bleibt
  offen, jetzt erneut bestätigt statt neu untersucht.

## 18. Getränke-Bereich in Einstellungen verschieben? — Einschätzung: nein, dort lassen

Julian fragte, ob es Sinn macht, „Getränke" in die Einstellungen zu packen
statt als eigenen Reiter zu lassen. Einschätzung: **nein, dort lassen wo es
ist.** Die fünf Bereiche der Tab-Leiste (Bar, Kaffees, Historie, Getränke,
Einstellungen, `docs/konzept.md`) sind als gleichrangige Hauptbereiche der
App gedacht — Getränke ist eine Stammdaten-Verwaltung auf derselben Ebene
wie Kaffees, nicht eine Einstellung *über* die App. In Einstellungen zu
wandern würde sie hinter einem zusätzlichen Tap verstecken, ohne dass sich
ihre Bedeutung geändert hätte. Aktuell zeigt sie nur einen Platzhalter
(„kommt in Paket 06") — das ist vermutlich der eigentliche Grund, warum sie
gerade wenig nach „eigenem Bereich" aussieht, nicht die Position in der
Leiste.

## 19. Konsistenz-Audit Paket 5 — Befund

Durchsucht: alte Rollen-Tokens (`--feld`/`--ruhig`/`--linie-zart`/…), rohe
Hex-Werte außerhalb `tokens.css`, `box-shadow`-Nutzung, `--radius-feld`/
`--radius-chip`. Ergebnis: außer den drei in Punkt 1/4 behobenen Stellen
**keine weiteren Treffer** in `src/muster` oder `src/bereiche`. Tab-Leiste
(`Rahmen.svelte`), Kontextmenü, alle Geräteformulare: durchgehend neue
Tokens, keine Schatten, keine alten Radien. Einzige verbliebene Kleinigkeit:
Punkt 14.

## 20. Zwei Rückfragen aus der Rückmeldungsrunde 2026-08-24 — Antwort steht aus

Zwei Punkte aus Julians Rückmeldung wurden **nicht** umgesetzt, weil eine
falsch geratene Antwort entweder die zentrale "+"-Aktion der App sichtbar
falsch gemacht hätte oder eine Formulierung erfunden hätte, die für Cold
Brew (kein Tassen-Gerät) unpassend gewesen wäre:

- **Schwebender „+"-Knopf in `KaffeeListe.svelte`:** Julians Beschreibung
  („ist aktuell fix und ganz unten, es schwebt nicht und bleibt immer da")
  ließ zwei Lesarten offen — Beschwerde über fehlende visuelle Elevation
  (kein Schatten erlaubt, siehe `.schwebend` in `KaffeeListe.svelte`) oder
  ein tatsächliches Positionierungsproblem. Rückfrage gestellt, Code
  ungeändert (`position: fixed`, korrekt über der Tab-Leiste positioniert,
  siehe Datei).
- **„Mengen"/„angeboten"-Wortlaut in `Bruehgeraetblatt.svelte`:** Julian
  wollte für Moka „Tassen" statt „angeboten". Ob dasselbe Wort auch für
  Pour Over und Cold Brew passt (Cold Brew wird eher in Portionen/Batches als
  in „Tassen" gedacht), ist offen — Rückfrage gestellt, Feld/Text bisher
  unverändert bei „Mengen"/„Wie viele Portionen gleichzeitig angeboten
  werden."

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
- **Nach Paket 4 war kein produktiver Screen mehr unmigriert.** Einzig
  `Musterblatt.svelte` zeigte noch die alte Formsprache, begrenzt auf die
  sechs dort exklusiv genutzten Muster aus Punkt 4.
- Source Sans 3 als Apparatschrift installiert und eingebunden
  (`@fontsource-variable/source-sans-3`).
- Paket 5 vollständig: `Ablaufliste.svelte`/`BausteinListe.svelte`/
  `DrillDown.svelte` auf neue Tokens migriert (Punkt 1/4); alle fünf
  Alias-Tokens ersatzlos aus `tokens.css` entfernt (Punkt 1); Musterblatt um
  acht fehlende, aber produktiv verwendete Muster/Utilities ergänzt (Punkt 7);
  Konsistenz-Audit über `src/muster`+`src/bereiche` durchgeführt, ein
  kleiner Restbefund dokumentiert (Punkt 14/15); Light/Dark strukturell
  geprüft (eine Rollenzuordnung, keine Sonderfälle je Theme); Responsive
  per CSS-Review geprüft (kein `chromium-cli` auf dieser Maschine — siehe
  Abschlussbericht).
- `npm test` (vitest inkl. `tokens.test.ts`/`schichten.test.ts`, svelte-check,
  vite build) grün nach Paket 1–5 (359 Tests, 0 svelte-check-Fehler).
- Rückmeldungsrunde 2026-08-24 (nach Paket 5): Einstellungen bekamen
  durchgehend kleine Überschriften je Abschnitt (Geräte/Beobachtungen/
  Werkzeuge neu, Backup jetzt als Blattzeilen-Panel statt freistehender
  Knöpfe), Erklärtexte unter „Verhalten" sind jetzt vom Schalterzustand
  abhängig; Setup zeigt nur noch Mühle/Brühgerät (Zubehör-Zeile entfernt,
  Feld bleibt im Schema); Brühgerät-Formular: „Espresso"→„Siebträger",
  Gruppen/PID/Cooling-Flush nur noch bei Siebträger sichtbar (vorher immer,
  auch bei Moka/Pour Over/Cold Brew), einzelnes „Gruppen"-Feld von Werteliste
  auf Formularzeile umgestellt; Kaffee-Sortierung jetzt Name/Rösterei/
  Bewertung statt Name/Bewertung/Röstgrad (`domain/bestand.ts`); Kaffeeblatt:
  lokale h2-Dopplung mit falschem font-family behoben, „aktuelle" Charge
  nicht mehr fett (Akzentfarbe statt Schriftgewicht), Bohne-Details von
  Werteliste (großer/fetter Wert) auf Detailzeilen im selben Panel wie die
  Bohne-Falte umgestellt (Wert in Beschriftungsgröße); Profilblatt-Hinweis
  „Input und Mahlgrad haben keinen …" entfernt; Homebar-Icons Kaffees→Bohne
  (Bohnen.svelte-Form als Outline), Bar→Tasse (dieselbe wie Parameterkachel
  „output"), aktiver Tab bekommt eine Badge-Fläche + etwas mehr Größe.
  Zwei Rückfragen offen (Punkt 20). Drei Punkte bewusst nicht umgesetzt, weil
  Funktion/Datenmodell bzw. reine UX-Nachzug-Ideen (Punkte 15–17).
