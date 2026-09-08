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

## 20. Zwei Rückfragen aus der Rückmeldungsrunde 2026-08-24 — beantwortet und umgesetzt

- **Schwebender „+"-Knopf in `KaffeeListe.svelte`:** war ein echter Bug,
  keine Wahrnehmungsfrage — Julians Antwort („er bewegt sich mit, wenn ich
  die Kaffee-Kachel-Liste verschiebe") bestätigte ein Positionierungs-
  problem. Ursache gefunden: `.ebene` in `Rahmen.svelte` trug
  `animation-fill-mode: both` für den Bildschirmwechsel-Übergang — dadurch
  behandelte Chrome dieses Element dauerhaft (auch nach Animationsende) als
  Containing Block für `position: fixed`-Nachfahren, weil die `.vor`/
  `.zurueck`-Klasse nie wieder entfernt wird ({#key} baut bei jedem
  Bildschirmwechsel ein neues Element). `.schwebend` verhielt sich dadurch
  wie `position: absolute` relativ zu `.ebene` statt zum Viewport. Fix:
  `animation-fill-mode: both` entfernt — wirkungslos für die eigentliche
  Optik (die einzige Keyframe hat kein „to", fällt beim Animationsende
  ohnehin auf die normale, unanimierte Basisdarstellung zurück), behebt
  aber die dauerhafte Containing-Block-Falle.
- **„Mengen"/„angeboten"-Wortlaut in `Bruehgeraetblatt.svelte`:** Julian:
  „lass uns überall von Portionen sprechen." Umgesetzt für alle drei
  Nicht-Siebträger-Typen (Moka/Pour Over/Cold Brew) — Feldbeschriftung
  „Mengen"→„Portionen", Erklärtext ohne „anbieten"-Framing („Wie viele
  Portionen sich gleichzeitig zubereiten lassen."), dieselbe Wortwahl auch
  in der Validierungsfehlermeldung beim Speichern.

## 21. Redesign v2 — Etappe 1 „Fundament" (2026-09-04)

Neuer Durchgang, eigener Branch-Kontext: Julian fand das Ergebnis von Redesign v1 trotz
Konsistenz-Audit „wie eine Rohfassung". Diagnose: nicht (nur) die Bau-Reihenfolge, sondern das
Handoff selbst — „alle Werte gleich groß", „Führungswert nicht hervorheben", ein Akzent, keine
Schatten — ist eine Verbotsliste gegen visuelle Hierarchie. Vorgehen diesmal: erst ein
HTML-Mockup als Artifact (drei Screens — Dashboard, Kaffeeblatt, Verkostung —, hell und dunkel,
fünf Korrekturrunden mit echtem Rückmeldungs-Hin-und-her), danach genau das validierte CSS in
echten Code. **Dieser Handoff bleibt unangetastet** — er wird nicht ersetzt, sondern hier als
Delta dokumentiert, solange nicht alle Screens neu geprüft sind (aktuell drei von ca. fünfzehn).

Geänderter Code:

- **`tokens.css`:** neuer Token `--fuellung-leicht` (hell `#d9b7a0` · dunkel `#8f6c4d`) — zweite,
  hellere Füllfläche, ergänzt `--fuellung` an allen sechs Stellen (Rohfarbe hell/dunkel,
  Standard-Zuordnung, `prefers-color-scheme`, `[data-theme='dunkel']`, `[data-theme='hell']`).
- **`Knopf.svelte` (`.primaer`), `LesartUmschalter.svelte`:** Font-Family kurzzeitig von Serif auf
  `--schrift-sans` umgestellt (Mockup-Rückmeldung: Serif 600 auf einer Füllfläche/Pillenbahn
  wirke „klobig"/„komisch"). **Am echten Gerät zurückgedreht** (2026-09-04, „Import ausführen" in
  `Migration.svelte`) — dort war das Urteil umgekehrt, zurück auf Serif, dieselbe Schriftart wie
  Kaffeeblatt Name/Röster. Geprüft: das sind die einzigen zwei Stellen in `src/muster/`, die für
  Buttons/Auswahlflächen je Sans genutzt hätten — alle anderen (Segment, Einzelauswahl, Chips,
  Urteil, AuswahlListe, DrillDown, Suchfeld) waren durchgehend Serif und blieben unangetastet.
  Betrifft automatisch auch `GussplanEditor.svelte` (kumulativ/inkrementell-Umschalter, teilt
  sich `LesartUmschalter.svelte`) und `ShotErfassung.svelte`/alle `Knopf`-Aufrufer.
  **Lehre für spätere Mockups:** ein statisches Bild überträgt sich nicht immer 1:1 aufs echte,
  interaktive Gerät — Julians erster Eindruck vom Mockup war hier nicht der letzte.
- **`Chips.svelte`:** „leicht" bekommt `--fuellung-leicht` statt `--fuellung` als Füllfläche (Text
  „leicht adstringent" o. ä. war schon korrekt, nur die Farbe war vorher fälschlich grün — Julian:
  „grün ist hier definitiv irreführend", suggeriert „gut"). Betrifft automatisch auch
  `ShotErfassung.svelte` „Was stört?" (teilt sich dieselbe Komponente).
- **`Treppe.svelte`:** Pixel-Balken (14–46px) durch gestapelte Striche ersetzt (bipolar
  `[3,2,1,2,3]`, einseitig `[1,1,2,3,3]` — Ziffern sind jetzt Strich-Anzahlen, keine Pixelmaße).
  `istGefuellt()` unverändert. Neuer optionaler Prop `mitErklaerung` (Default `true`) — spart die
  „bipolar · Mitte ist Ziel"-Zeile, wenn der Aufrufer (Verkostungsbogen) einen einzigen
  zusammenfassenden Satz für alle sechs Treppen zeigt. `Musterblatt.svelte` unverändert (Default
  greift). Titel-Font war fälschlich Serif, jetzt Sans wie der Rest der App-Meta-Texte.
- **`Verkostungsbogen.svelte`:** ein Satz oberhalb der sechs Treppen erklärt bipolar/einseitig
  einmal statt sechsmal; Kaffeename-Überschrift von 20px/400 auf `--fs-titel`/`--gw-titel`
  (26px/600) — vorher unauffälliger als die „Wie war er?"-Frage in ShotErfassung, jetzt die
  eigentliche Überschrift des Screens.
- **`docs/konzept.md`/`docs/konzept-nachzug.md`:** K36 aufgehoben — Kategoriefarben im Aromarad
  jetzt erlaubt (neun gedämpfte Töne, Punkt/dünner Rand, keine Vollflächen), begrenzt auf das
  Aromarad. Konzeptentscheidung zuerst, Code folgt erst mit den echten Le-Nez-2.0-Daten (eigene
  Etappe).

**Bewusst nicht in dieser Etappe:** Dashboard/Kaffeeblatt/Verkostung als vollständige Screens
(brauchen ihre Fachlogik zuerst, z. B. eine Bestandsrechnung, die es noch nicht gibt), eine
Bestandskarte oder Steckbrief-Kacheln als neue Muster (kein zweiter echter Aufrufer vorhanden),
die größere Typo-Skala-Überarbeitung („elf Schriftgrößen") — dafür wurde noch kein Bild gezeigt.

## 22. Redesign v2 — Etappe 2 „Dashboard + Bestandsverwaltung" (2026-09-04)

Erster vollständiger Screen nach dem Fundament. Neu im Datenmodell: `Charge` bekommt
`einwaage`/`eingefroren`/`portionsgroesse`/`korrektur` (alle optional, `src/daten/schema/
kaffee.ts`), `AppEinstellungen` bekommt drei Bestand-Schwellen (`src/daten/schema/
einstellungen.ts`) — Julians Vorgabe als Default (2 Bezüge knapp · 8 Wochen frisch · 8 Monate
eingefroren), in den Einstellungen änderbar.

**Wichtiger Fund beim Entwurf:** `Shot.chargeId`/`Shot.ist.input` reichen für die Restrechnung
allein — der Verschnitt aus `domain/plan.ts` ist reine Vorab-Planung, bei einem geteilten Bezug
wird trotzdem ein voller Bezug gezogen und geloggt, der Verschnitt steckt also schon im
gemessenen Input mit drin. Kein zweiter Abzug nötig.

Neu `src/domain/vorrat.ts`: `restGramm` (Korrektur ist ein Restatement — „ich hab nachgewogen,
X Gramm" ersetzt die Basis, kein additives Delta), `geschaetzteBezuege`,
`durchschnittlicherInput`, `altersTage`, `brauchtAufmerksamkeit`. Getestet mit den echten
Schwellenwerten.

`Kaffeeblatt.svelte`: „+ Charge" hat jetzt Einwaage (Vorbelegung 250 g) und einen
„eingefroren"-Schalter mit optionaler Portionsgröße; „Aktuelle Charge" zeigt Restmenge/Bezüge,
wenn bekannt; neue Aktion „Bestand korrigieren". Bewusst noch im bestehenden Panel-Stil — die
Steckbrief-Überarbeitung dieses Screens ist Etappe 3.

`Bar.svelte`: neuer Abschnitt „Bestand", bis zu drei Karten (dringendste zuerst — „knapp" hat
Vorrang vor „alt"), Markup/CSS aus dem Bildsprache-Mockup übernommen. **Bestandkarte bleibt
lokal in `Bar.svelte`**, noch keine Extraktion zu `src/muster/` — erst ein zweiter echter
Aufrufer (Kaffeeblatt, Etappe 3) rechtfertigt das eigene Muster.

**Nachgezogen, nicht in Etappe 1 erledigt:** `--schatten`/`--schatten-weich` fehlten in
`tokens.css`, obwohl das Bildsprache-Mockup sie an genau den Elementen zeigte, die jetzt gebaut
wurden (Primäraktion, Bestandkarte). Jetzt ergänzt, mit Kommentar im Tokenblatt, der die
Aufhebung von Handoff „NICHT VERHANDELBAR: keine Schatten" dokumentiert — dieselbe Behandlung
wie K36, keine stille Ausnahme.

**Rückmeldung 2026-09-04, live am Telefon getestet:**

- **Kritischer, app-weiter Fund, nichts mit Etappe 2 zu tun:** `crypto.randomUUID()` ist nur in
  sicheren Kontexten verfügbar (HTTPS oder `localhost`) — über die LAN-IP des Dev-Servers
  (`http://192.168.178.90:5173`, kein sicherer Kontext) scheitert jede ID-Erzeugung lautlos.
  Erklärt zwei scheinbar unabhängige Fehlberichte (Charge anlegen, Shot speichern) mit
  derselben Ursache, an 20 Stellen in 16 Dateien. Fix: neues `src/daten/id.ts::neueId()`
  (fällt auf `crypto.getRandomValues()` zurück, das auch unsicher verfügbar bleibt), ersetzt
  `crypto.randomUUID()` app-weit.
- **Chargen-Panel wirkte „unübersichtlich":** Bestand-Info und „Bestand korrigieren" standen als
  eigene, durch Haarlinien getrennte Zeilen nach der Chargenliste — sahen aus wie unabhängige
  Listeneinträge statt wie Eigenschaften der aktuellen Charge. Jetzt Teil derselben
  `.chargenzeile`, die Trennlinie fällt pro Charge, nicht pro Info-Schnipsel.
- **Einwaage ohne sichtbare Einheit** — stand nur im Platzhaltertext („Einwaage in g"), der beim
  Tippen verschwindet. Jetzt `.mengenfeld`: Zahlenfeld mit dauerhaft sichtbarem „g" daneben,
  auch bei Portionsgröße und Bestand-Korrektur.
- **Bar.svelte Bestand-Karten** — Julian: „sieht einfach nur grausam aus". Noch nicht behoben,
  kein Screenshot davon vorhanden — nachgefragt, bevor geraten wird.

**Rückmeldung 2026-09-04, Nachtrag — FIFO statt Auto-Nullung:** Julian friert Kaffees
portionsweise vor und legt eine neue Charge an, bevor die alte aufgebraucht ist —
`chargeAnlegen()` hat die alte bisher automatisch als leer markiert (Kommentar in `daten/
schema/kaffee.ts` ging von „nie zwei offene Chargen gleichzeitig" aus, das war die jetzt
widerlegte Annahme). Mein erster Entwurf war noch unvollständig: nur „leer" und „auf 0
korrigiert" als Auslöser, nur an den drei Kaffeeblatt-Stellen geprüft. Julians Korrektur: auch
**Shot-Loggen selbst** kann eine Charge zum Ausscheiden bringen, wenn der Rest für keinen
weiteren Bezug mehr reicht (nicht erst bei exakt 0).

Neu: `domain/vorrat.ts::chargeAusgeschieden`/`naechsteAktiveCharge` (FIFO nach Röstdatum,
Schwelle „reicht für einen weiteren Bezug" statt „= 0"), `bereiche/bestand.svelte.ts::
chargeStatusAktualisieren` als **ein** gemeinsamer Schreibpfad, aufgerufen von allen vier
Stellen, an denen eine Charge ausscheiden kann: `Kaffeeblatt.svelte` (Charge anlegen, Bestand
korrigieren, neu „Als leer markieren" für Chargen ohne Einwaage), `ShotErfassung.svelte` und
`BestellungAbarbeiten.svelte` (je nach erfolgreichem Shot-Schreiben — die einzigen zwei Stellen
im Code, an denen ein neuer, echt konsumierender Shot entsteht, per Grep über alle
`schreiben('shot', …)`-Aufrufe geprüft).

## 23. Redesign v2 — Etappe 3 „Kaffeeblatt-Steckbrief" (2026-09-04)

Rein visuelle Etappe, keine neue Domain-Logik. „Bohne" ist jetzt ein Steckbrief statt sieben
gleich gewichteter Zeilen: Herkunft/Anbauhöhe/Varietät/Aufbereitung als Icon-Kacheln (warm
getönter Grund, `color-mix(--akzent 7%, --blatt)`), genau die vier aus dem Bildsprache-Mockup.
Art wandert vor die Kacheln (schnellster Fakt), Botanik/Röstgrad (Röster) bleiben Textzeilen
danach — bewusst keine Kacheln für alle sieben, das hätte aufgebläht statt geklärt.

**Bewusst nicht gebaut:** ein freier Beschreibungstext. Der Mockup-Absatz („Washed, aus 1.850 m
Höhe …") war ein Beispieltext, keine echte Datenquelle — dafür fehlt ein Datenfeld
(Schema + `KaffeeBearbeiten.svelte`), das wäre eine Funktionserweiterung, keine visuelle
Anpassung bestehender Daten.

„Aktuelle Charge" zeigt die Restmenge jetzt als Bühnen-Zahl (`--fs` 26px/500) statt reinem
Fließtext — „im selben Stil wie im Dashboard". Da das jetzt der **zweite** echte Aufrufer war
(nach Bar.svelte), wurde `.zahl-buehne` ein globales Utility in `tokens.css` statt einer
zweiten lokalen Kopie — dieselbe Regel wie bei `Suchfeld`/`Blattliste` seinerzeit.

## 24. Redesign v2 — Kaffeeblatt „Quartett-Karte" + Profil-Icon-Raster (2026-09-04)

Bildgetriebene Nachbesserung am Kaffeeblatt, drei Freigaben zuvor über eigene Artifact-Mockups
geprüft: die Karte selbst („gefällt mir schon richtig gut"), Profile als Icon-Raster („gefällt
mir auch richtig gut") und die konkrete Icon-Bibliothek (drei Korrekturrunden, zuletzt „passt").

**Vier vormals getrennte Blöcke** (Blick-Panel, Bohne-Falte, freischwebendes Steckbrief-Grid,
Botanik-Panel) sind jetzt eine Karte (`.identitaet`): Röster-Zeile → Röstgrad/Bewertung → vier
Steckbrief-Kacheln (unverändert aus Etappe 3) → Art/Botanik als Fußzeile. Kein Falte-Mechanismus
mehr — bei einer Karte, die man ohnehin komplett ansieht, machte ein Aufklapp sie nur unruhiger,
nicht übersichtlicher. Die alten Zeilen-/Falte-Klassen (`.listenzeile`, `.badge`, `.chevron`,
`.falte*`, `.detailzeile`, `.detail-label`, `.detail-wert`) waren dadurch ohne Aufrufer und
wurden entfernt, nicht nur unbenutzt liegen gelassen.

**Profile** sind jetzt ein Icon-Raster (`.profil-raster`) statt einer Zeilenliste — 56-px-Kreise
mit `ProfilIcon` (neues Muster `src/muster/ProfilIcon.svelte`, sieben Varianten: vier
Zubereitungsarten + drei Tassen-Füllstände für Siebträger-Getränke) plus Name darunter, eine
„+"-Kachel als Leerzustand-Ersatz. Neues optionales Schema-Feld `Profil.icon`
(`daten/schema/kaffee.ts`): bleibt `undefined`, solange niemand aktiv wählt — die Oberfläche
leitet es dann live aus `Bruehgeraet.typ` her (`standardIconVon()`), nur eine bewusst vom Gerät
abweichende Wahl wird gespeichert. Das „+ Profil"-Formular bekam dafür eine Icon-Auswahlzeile
(`.icon-auswahl`, sieben 42-px-Kreise wie eine Farbpalette), vorbelegt mit dem hergeleiteten
Gerät-Icon.

Größen-Lehre aus der Icon-Bibliothek direkt übernommen: Geräte-Icons (Siebträger/Moka/Pour
Over/Cold Brew) brauchen mehr Fläche in der Kachel als die Tassen-Icons (Ristretto/Espresso/
Lungo) — sonst wiederholt sich das „zu klein"-Problem aus der Mockup-Rückmeldung
(`profilIconGroesse()` im Script, 30 px vs. 26 px).

Verifikation: `npm test` grün (522 Tests, 0 svelte-check-Fehler, Build ok).

## 25. Redesign v2 — Etappe 5 „Diagnose-Sackgasse" korrigiert (2026-09-04) — *Zwischenlösung, siehe Abschnitt 26*

**Nachtrag:** Diese Etappe wurde ohne Zugriff auf den ursprünglichen Gesamtplan umgesetzt (der
ging zwischenzeitlich verloren, siehe Abschnitt 26) und traf dabei eine falsche Annahme — die
sechs engen Regeln seien die vollständige, bewusste Spezifikation. Die zwei Sätze unten bleiben
richtig und sinnvoll, lösen aber nicht den eigentlich gemeldeten Fehler (zu wenige Kombinationen
liefern überhaupt einen Vorschlag). Die eigentliche Lösung steht in Abschnitt 26.

Ursprünglicher Verdacht (aus der ersten Rückmeldungsrunde dieses Strangs): `domain/diagnose.ts`
deckt nur sechs von potenziell tausenden Symptom-Kombinationen ab, das sei ein Bug. **Beim
genaueren Hinsehen war das falsch** — die sechs Regeln (plus die Drift-Regel in `domain/drift.ts`)
sind exakt „Die Regeln dahinter" aus `docs/konzept.md:506-516`, die vollständige Spezifikation,
nicht eine unvollständige erste Fassung. `diagnose.test.ts` prüft sogar explizit: „keine passende
Kombination → keine Diagnose, keine erzwungene Regel". Das Regelwerk zu verbreitern wäre gegen die
Spezifikation gewesen, nicht deren Erfüllung.

Der echte Fehler saß eine Ebene höher, in `ShotErfassung.svelte` (Phase `diagnose`): Passte keine
Regel zur Auswahl — oder passte eine, war aber gerade unterdrückt (K68/K76, zuletzt schon gezeigt) —
erschien nur der „fertig"-Knopf, ohne jede Erklärung. Wer Chips ausgewählt hat und dann nichts
weiter sah, konnte nicht unterscheiden zwischen „hat nicht funktioniert" und „ist so gewollt". Zwei
ehrliche Sätze ergänzt, keine Regeländerung: „Für diese Auswahl gibt es noch keine hinterlegte
Regel — die Befunde bleiben trotzdem am Shot stehen" (kein Match) bzw. „Diese Diagnose kam beim
letzten Mal schon — sie erscheint erst wieder, wenn sich der Befund beim nächsten Shot wiederholt"
(K76-Unterdrückung). Beide nutzen die vorhandene `.hinweis`-Klasse, kein neues CSS.

Verifikation: `npm test` grün (522 Tests, 0 svelte-check-Fehler, Build ok) — reine UI-Textergänzung,
kein neuer Domain-Test nötig (keine neue Rechenlogik, nur zwei zusätzliche Anzeigebedingungen).

## 26. Redesign v2 — der verlorene Gesamtplan, und Etappe 5 richtig nachgeholt (2026-09-04)

**Was passiert war:** Der Gesamtplan für diesen Redesign-Strang wurde zu Beginn per `ExitPlanMode`
freigegeben und in `.claude/plans/zany-sleeping-peach.md` gespeichert — aber jede folgende Etappe
hat ihren eigenen Einzelplan in **dieselbe Datei** geschrieben, statt eine neue anzulegen. Der
Gesamtplan wurde damit von seinen eigenen Nachfolgern überschrieben. Julian hat das bemerkt, als
nach „Etappe 7" gefragt wurde und die Antwort „weiß ich nicht mehr genau" lautete. Der Plan war
nicht endgültig weg — er ließ sich aus dem rohen Sitzungs-Transkript wiederherstellen —, aber das
war Zufall, kein verlässlicher Weg. Der wiederhergestellte Plan steht jetzt dauerhaft im Repo:
`docs/design/redesign-v2-plan.md`. **Lehre:** Pläne, die über eine einzelne Etappe hinaus gelten,
gehören sofort ins Repo, nicht nur nach `.claude/plans/`, das pro Sitzung wiederverwendet wird.

**Abgleich der erledigten Etappen gegen den wiederhergestellten Plan** ergab drei Funde:

- `redesign-v1-handoff.md` sollte laut Plan in Etappe 1 abgelöst werden — ist es nicht,
  **aber bewusst und dokumentiert** zurückgestellt (Abschnitt 21: „solange nicht alle Screens neu
  geprüft sind"). Kein stiller Fehler, weiterhin für Etappe 8 vorgesehen.
- Die Typo-Skala-Vereinfachung „elf auf sechs Stufen" ist ebenfalls **bewusst und dokumentiert**
  zurückgestellt (Abschnitt 21: „dafür wurde noch kein Bild gezeigt"). Aktuell neun statt sechs
  unterschiedliche Schriftgrößen in `tokens.css`.
- `Blattliste.svelte` (geplant für Etappe 1, sollte das an mittlerweile 13 Stellen duplizierte
  `.panel`-CSS bündeln) wurde **weder gebaut noch als zurückgestellt dokumentiert** — der einzige
  echte, unbemerkte Rückstand. Bleibt offen für Etappe 8.
- **Etappe 5 war die einzige echte Fehlumsetzung**, nicht nur ein Rückstand: siehe unten.

**Etappe 5 richtig nachgeholt.** Der Plan wollte „Evidenz statt Konjunktion" — ein Achsen-Scoring,
keine engen Konjunktions-Regeln. Umgesetzt in `domain/diagnose.ts`: `diagnostiziere()` versucht
zuerst die sechs exakten Konzept-Regeln (`diagnostiziereExakt`, unverändert), fällt bei keinem
Treffer auf `diagnostiziereAchse()` zurück. Jedes der elf Symptome gehört zu einer von fünf Achsen
(Unterextraktion/Überextraktion/KT-hoch/Konzentration-niedrig/Verteilung — dieselbe Gruppierung
wie in der Konzepttabelle, nur benannt); die Achse mit den meisten ausgewählten Symptomen gewinnt,
Gleichstand nach Tabellenreihenfolge. Diagnose-Text, Empfehlung und Änderungsformel kommen
unverändert von der „Vertreter-Regel" der gewinnenden Achse — kein neuer Text, nur eine weichere
Voraussetzung. Ausnahme: „starke Unterextraktion" bleibt exklusiv der exakten
sauer+salzig-Kombination vorbehalten, ein einzelnes „salzig" bekommt die einfache Variante.

Ein Achsen-Treffer trägt `geschaetzt: true` und zeigt in `ShotErfassung.svelte` eine gedämpfte
Meta-Zeile „geschätzt aus Einzelbefund" über das bereits vorhandene `herkunft`-Feld von
`Vorschlag.svelte` — kein neues CSS, keine neue Komponente, dieselbe Sprache wie bei geschätzten
Zahlenwerten (K54/K13). Entscheidung dazu (gedämpfte Meta-Zeile vs. Titel-Kennzeichnung vs. gar
keine) mit Julian abgestimmt statt selbst gesetzt.

`docs/konzept.md` bekam einen neuen Absatz nach „Die Regeln dahinter", der die Achsen-Stufe
dokumentiert — dieselbe Behandlung wie die K36-Aufhebung, Konzept zuerst, nicht nur ein
Code-Kommentar. Ein bestehender Test musste bewusst angepasst werden:
`diagnostiziere([befund('bitter')])` lieferte vorher `undefined`, liefert jetzt einen geschätzten
Überextraktions-Vorschlag — genau der Fall, den diese Etappe beheben sollte.

Verifikation: `npm test` (neue/angepasste `diagnose.test.ts`-Fälle, svelte-check, build).

## 27. Redesign v2 — Etappe 7 „Bestellung, Modus A (Café-Style)" (2026-09-04)

Zweiter, mengenbasierter Aufnahme-Weg neben dem bestehenden personenbezogenen — aus der
allerersten Liste, Punkt 1. **Fund beim Erkunden:** die „intelligenten Auslastungs-Hinweise"
(„noch ein Doppio?") aus derselben Liste existierten bereits — das Verschnitt-Angebot am Fuß von
`BestellungPlan.svelte` arbeitet komplett personenunabhängig (`domain/plan.ts` bündelt nur nach
Bohne+Profil). Diese Etappe musste also nur die **Aufnahme** ändern, nicht Plan oder Abarbeiten.

`Position.personId` (`daten/schema/bestellung.ts`) ist jetzt optional — wörtlich „keine
Personenzuordnung", kein Sonderwert wie eine „anonym"-Person. `domain/ranking.ts::rangiereGetraenke`
zählt bei `personId === undefined` café-weit über alle Positionen statt personenbezogen (zwei
Zeilen geändert, kein neuer Rechenweg, neuer Test in `ranking.test.ts`).

`BestellungAufnehmen.svelte` bekam ein `Segment` ganz oben („Für mich/andere" · „Café-Style",
Default bleibt der bestehende Weg — Julians eigener Zwei-Tap-Alltagspfad ändert sich nicht). Der
Café-Zweig: Getränk (café-weite Rangliste) → Menge (neuer, lokal gebauter Stepper, kein eigenes
Muster für einen einzigen Aufrufer) → Koffein (ohne Vorbelegung, keine Historie vorhanden) →
Bohne (dieselbe Schnittmenge wie im Personen-Weg, bei genau einem Treffer automatisch vorbelegt)
→ „N× hinzufügen" schreibt N Positionen und hängt sie in einem abschließenden Schreibvorgang an
die Bestellung (derselbe Sammel-dann-einmal-schreiben-Zuschnitt wie
`BestellungPlan.svelte::abarbeitenStarten()`). Bewusst keine Extra-Shot-Frage beim Aufnehmen —
bei „3× Cappuccino" ist unklar, welche der drei es beträfe; ein später entstehender halber Bezug
läuft stattdessen ganz regulär durch das bestehende Verschnitt-Angebot im Plan.

`BestellungAufnehmen.svelte`/`BestellungPlan.svelte`: die Stellen, die `personName(pos.personId)`
anzeigen, lassen die Namens-Vorsilbe weg, wenn `personId` fehlt, statt „unbekannt" zu zeigen.
`BestellungAbarbeiten.svelte` fasst `personId` nirgends an — unberührt.

`docs/konzept.md` bekam einen neuen Unterabschnitt „Zwei Aufnahme-Wege — Modus A" in „Die
Bestellung", direkt nach „Aufnehmen".

Modus B, Self-Order und QR bleiben wie im Gesamtplan vorgesehen zurückgestellt — das
Datenmodell steht ihnen nicht im Weg (`Position.personId` existiert weiterhin für den
personenbezogenen Weg).

Verifikation: `npm test` (neuer `ranking.test.ts`-Fall, svelte-check, build).

**Rückmeldung 2026-09-04, direkt danach:**

- **Café-Style ist jetzt Default** (`modus = $state('cafe')`) — der Alltagsfall an der Homebar
  ist eher „wer auch immer kommt" als „immer Julian".
- **„Keine Bohne aktiv" — echter, älterer Bug, nicht durch Etappe 7 verursacht.** `geeignetFuer`
  wurde beim Kaffee-Anlegen hart auf `[]` gesetzt (`KaffeeNeu.svelte`) und hatte **nirgends** eine
  Bedienung, es danach zu ändern — `bohnenSchnittmenge()` fand deshalb für jeden selbst
  angelegten Kaffee (alles außer den Notion-migrierten) nie eine Bohne, in beiden Aufnahme-Wegen
  gleichermaßen. Café-Style hat das nur zuerst sichtbar gemacht. Behoben: `KaffeeBearbeiten.svelte`
  bekam eine Mehrfachauswahl „Geeignet für" (eine Reihe `Schalter`, Optionen aus den vorhandenen
  Getränke-Zubereitungsarten statt einer festen Liste). `KaffeeNeu.svelte` bewusst nicht erweitert
  — bleibt beim Minimalformular-Prinzip (K64, „Rest ist am Kaffeeblatt nachpflegbar").
- **Modus-Default hängt jetzt vom Einstieg ab**, nicht mehr fest auf einen Wert: kommt der
  Einstieg über eine Zwei-Tap-Kachel mit vorausgewähltem Getränk (`Bar.svelte::kachelWaehlen`,
  „nur für mich"-Fall), startet `BestellungAufnehmen.svelte` im Personen-Modus mit vorbelegter
  Standardperson — genau wie vor Etappe 7. Kommt der Einstieg über den allgemeinen „Getränk
  wählen"-Knopf ohne Vorwahl, startet Café-Style. `bestellungEntwurf.abgeholt()` wird jetzt genau
  einmal gelesen (ist destruktiv) und für beide Defaults verwendet, statt zweimal aufgerufen.

**Rückmeldung 2026-09-04, noch mal danach — „geeignet für" reichte nicht, Ursache war unklar:**
Zwei Nachbesserungen, statt nur zu raten. Erstens bekam `KaffeeNeu.svelte` dieselbe
„Geeignet für"-Mehrfachauswahl wie `KaffeeBearbeiten.svelte` — anders als Herkunft/Varietät ist
das kein beschreibendes Detail, das K64 zurückstellen darf, sondern schaltet frei, ob ein Kaffee
in der Bestellung überhaupt wählbar ist; ein frisch angelegter Kaffee war bis zum nächsten
bewussten Bearbeiten-Besuch unsichtbar. Zweitens wurde der „Keine passende Bohne aktiv"-Hinweis
in `BestellungAufnehmen.svelte` (beide Modi) selbsterklärend — er nennt jetzt die zwei möglichen
Ursachen (fehlendes „Geeignet für" oder Koffein passt nicht) direkt an der Stelle, statt nur den
Zustand zu melden.

## 28. Redesign v2 — Bestellungs-Ablauf auf neue Design-Sprache gehoben (2026-09-04)

Vorgezogen aus Etappe 8 ("Rest & Konsistenzdurchgang"): Julian hat beim Live-Testen des
Bestellungs-Ablaufs (Aufnehmen/Plan/Abarbeiten) dreimal hintereinander Reibung gemeldet — Plan-
Screen wirkte verwirrend, „weiter zum Plan" sah nach reinem Text aus, der ganze Ablauf "unsauber".
Erst Mockup als Artifact (`bestellung-redesign.html`, vier konkrete Änderungen, freigegeben mit
„ja ich würde sagen so starten wir mal"), dann direkt portiert — der Umfang war klein genug
(reine CSS-Änderungen + eine neue Anzeige-Hilfsfunktion, keine neuen Dateien, keine
Schema-Änderung), um ohne eigene Plan-Mode-Runde direkt umzusetzen; das Bild war schon
abgenommen.

- **`Knopf.svelte` „sekundär"** bekommt eine `--vertiefung`-Fläche statt eines 1px-Rands, der auf
  der warmen Papierfarbe kaum sichtbar war ("sieht nur nach Text aus"). App-weite Änderung, nur
  drei echte Aufrufer (`BestellungAufnehmen`, `Beobachtungen`, `Musterblatt`).
- **`Werteliste.svelte`** bekommt denselben Karten-Schatten wie `Kaffeeblatt.svelte .identitaet`
  (`box-shadow` mit `--schatten`) — betrifft nebenbei auch Profilblatt "Spielraum" und mehrere
  Geräte-Ansichten, die dasselbe Muster nutzen. Reine Konsistenz-Aufwertung, keine
  Funktionsänderung.
- **`BestellungAufnehmen.svelte`/`BestellungPlan.svelte` `.panel`** bekommen dieselbe
  Schatten-Behandlung (bisher flach, kaum vom Grund abgesetzt).
- **`BestellungPlan.svelte`: neue Getränke-Zusammenfassung** in der eingeklappten Bezug-Zeile
  (`getraenkeZusammenfassung()`, gruppiert nach Getränk-Id, "3× Cappuccino" statt "Cappuccino +
  Cappuccino + Cappuccino"). Löst nebenbei eine echte Verwirrung: zwei Bezüge derselben Bohne mit
  unterschiedlichen Getränken sahen bisher wie ein Duplikat, weil die Zeile nur den Kaffee-Namen
  zeigte.
- **Verschnitt-Angebot wird eine eigene Karte** (`.verschnitt-karte`, `color-mix`-getönter
  Hintergrund wie `Kaffeeblatt.svelte .steckbrief-kachel`) mit Pillen-Knöpfen statt einer losen
  Textzeile mit drei Textlinks — bleibt bewusst ruhig, kein Ausrufezeichen, keine Signalfarbe
  (konzept.md:738).

**Bewusst nicht angefasst:** die Bündelungslogik selbst (`domain/plan.ts`) — kritische,
getestete Business-Logik, die auf Julians Rückmeldung wartet, was er genau bestellt hatte, bevor
dort irgendetwas geändert wird.

Verifikation: `npm test` grün (531 Tests, 0 svelte-check-Fehler, Build ok).

## 29. Redesign v2 — Verschnitt-Angebot: Stammdaten-Fix + vierter Weg „Bohne wechseln" (2026-09-04)

Julian meldete den Fall aus Abschnitt 28 konkret: 1× Cappuccino + 1× Espresso, dieselbe Bohne,
zeigte zwei separate Bezüge statt eines gemeinsamen „Doppelbezugs". **Zwei Analyserunden nötig,
beide Male hat Julian mich korrigiert:**

1. Erste Annahme: die Kombination sei mathematisch nicht sauber (Espresso „ganz" = 2 Shots,
   Cappuccino „halb" = 1 Shot, 3 ist ungerade) — mit Verweis auf den bestehenden, expliziten Test
   `'buendeln nicht mit halben Bezuegen derselben Bohne'`. **Falsch:** ein Espresso braucht
   physisch nur einen Shot, keine zwei. Der Fehler saß nicht in `domain/plan.ts` (die
   Bündelungslogik war immer richtig), sondern in den **Stammdaten**:
   `GETRAENK_ESPRESSO.basis.anteilBezug` war `'ganz'`, ist jetzt `'halb'`
   (`daten/stammdaten-getraenke.ts`) — eine Zeile, keine Domain- oder Testanpassung nötig.
   `GETRAENK_DOPPIO` bleibt `'ganz'` (zwei Shots, korrekt). Damit bündelt Espresso + Cappuccino
   derselben Bohne jetzt automatisch über die unveränderte, bereits getestete Logik.
2. **Klärungsrunde zur Restfrage** (der Screenshot zeigte zusätzlich zwei *verschiedene* Bohnen
   mit je einem eigenen Rest): Julians eigene Beschreibung des allgemeinen Prinzips — Shots je
   Bohne zusammenzählen, bei „x·2+1" (ungerade) einen von vier realistischen Wegen anbieten
   (Extra Shot / eigene Position / verwerfen / **Bohne wechseln**) — deckte sich mit drei
   bestehenden Wegen plus einem echt fehlenden vierten.

**Vierter Weg „Bohne wechseln"** — neu in `domain/plan.ts`: `bohnenwechselKandidaten(plan,
profilId, eigeneKaffeeId)`, reine Funktion, findet andere Bohnen mit demselben Profil, die im
selben Plan ebenfalls einen unpaarigen Rest haben. Bewusst ohne Koffein-/Aktiv-Prüfung — die
liegt in `BestellungPlan.svelte`, das dafür `bohnenSchnittmenge()` (`domain/getraenk.ts`)
wiederverwendet, dieselbe Funktion, die auch die Bohnenauswahl beim Aufnehmen filtert. Damit kann
ein Wechsel nie über Koffein/Entkoffeiniert hinweg vorgeschlagen werden. Der Knopf erscheint nur,
wenn tatsächlich eine passende Bohne existiert, und nennt sie beim Namen („Bohne wechseln →
Espresso Entcoffeiniert").

Verifikation: `npm test` grün (535 Tests, 4 neu, 0 svelte-check-Fehler, Build ok).

**Rückmeldung 2026-09-04, direkt danach — der Knopf erschien nie:** echter Bug in
`bohnenwechselKandidaten`, nicht nur fehlende Testdaten. Der erste Entwurf filterte nach
`d.profilId === profilId` — aber `profilId` ist je Bohne eigen
(`bestand.profilFuerZubereitung(kaffeeId, zubereitung)` liefert selbst bei gleicher Zubereitung
nie dieselbe Id für zwei verschiedene Kaffees). Der Filter fand deshalb **nie** einen Kandidaten,
in keinem realen Fall — im eigenen Testfixture unbemerkt, weil dessen `cappuccino()`-Helfer allen
Aufrufen dieselbe hartkodierte `profilId` gibt, unabhängig vom Kaffee. Behoben: Funktion filtert
nur noch nach „hat selbst auch einen Rest", ganz ohne Profil-Kriterium — die eigentliche
Zubereitungs-/Koffein-Eignung übernimmt ohnehin schon `bohnenSchnittmenge()` beim Aufrufer. Neuer
Test mit zwei bewusst unterschiedlichen `profilId`s (`plan.test.ts`) deckt genau diesen Fall jetzt
ab. Verifikation: `npm test` weiterhin grün (535 Tests).

## 30. Redesign v2 — Etappe 8 „Rest und Konsistenzdurchgang" (2026-09-06)

Letzte Etappe des Redesign v2. Vier Screens waren auf der neuen Bildsprache (Dashboard,
Kaffeeblatt, Verkostung, Bestellungs-Ablauf) — diese Etappe holt den Rest der App nach und
erledigt vier von Julian benannte Einzelaufträge. Ablauf: erst ein UX-/Design-Konsistenzblick
(zwei getrennte Perspektiven, dann eine Synthese, `docs/ux-regeln.md` Regel 1), Freigabe im
Plan Mode, danach Umsetzung in sechs Blöcken A–F mit `npm test` nach jedem Block.

**Wichtiger Fund vor dem Bauen:** ein Explore-Subagent hatte zunächst gemeldet, Einstellungen/
Geräte/Getränkepflege seien „bereits im neuen Look" — er verwechselte „nutzt Tokens" mit „hat
die Redesign-v2-Tiefe". Eigene Nachprüfung zeigte den echten Unterschied: `.panel`/`.blattzeile`
in diesen Screens hatten nie den `--schatten` bekommen, den Bar/Kaffeeblatt/Bestellungs-Ablauf
seit Etappe 1–3 tragen — das war der eigentliche sichtbare Bruch, nicht fehlende Tokens.

### A · Dashboard — drei Zonen, priorisierte Meldungsliste, Kennzahl-Kachel

Mockup zuerst (`artifact-design`), zwei Korrekturrunden mit Julian:

- **1-2 Meldungen** statt anfänglich 3 (Vorgabe: Galaxy S25, kein Scrollen auf dem Dashboard).
- **Kennzahl** ist am Ende **eine** Kachel, zufällig aus einem Sieben-Fakten-Pool gezogen (nicht
  zwei, wie ein Zwischenstand vorsah) — Julians finale Liste: Bezüge diesen Monat/dieser Woche,
  Koffeinhaltig-Anteil, meistgenutzte Bohne, verschiedene Bohnen (90 Tage), aktive Bohnen im
  Bestand, häufigste Zubereitung.

Neu `src/domain/hinweise.ts` (rein, kein Svelte/idb, 26 Tests in `hinweise.test.ts`):
`sortiereUndDeckeln()` (Priorität `knapp > alt > restUnbekannt > dialinOffen > beobachtung`,
Deckelung + Restzähler „und N weitere"), `restmengeUnbekannt()`, `dialinOffen()`,
`kennzahlenPool()`/`waehleKennzahlen()` (Zufall injizierbar, Muster aus
`domain/begruessung.ts::begruessung`), `meistgenutzteKaffeeId()` (auch für den Ruhezustand).

**Fund dabei:** `Kaffee.aktuelleChargeId` ohne Einwaage/Korrektur ließ `restGramm()` bewusst
`undefined` liefern (K64) — die alte `bestandHinweise`-Logik in `Bar.svelte` warf diesen Fall
still weg (`if (rest === undefined) return undefined`). Eine Bohne ohne Einwaage konnte dadurch
nie als „knapp" auffallen, egal wie leer sie war. Jetzt eine eigene Meldung „Restmenge
unbekannt" (Prio C, neutraler Spurfarbe-Rand statt Kritisch/Achtung — keine Dringlichkeit, nur
eine Wissenslücke).

**Zweiter Fund:** `Profil.modus` wird bei „+ Profil" auf `'dialin'` gesetzt und danach nirgends
mehr geändert — eine „Dial-in offen"-Meldung wäre unabstellbar gewesen ohne einen Umschalter,
der noch gar nicht existierte. Siehe Block C.

`Bar.svelte`: „Jetzt"-Zone (Kacheln + Primäraktion) bewusst **ohne** Kartenrahmen — eine
zusätzliche Blattfläche um die bereits `--blatt`-farbene Primär-Kachel hätte eine vierte
Flächenebene gebraucht (nicht verhandelbar), stattdessen enger Abstand über Flex-Column.
Bestand-Zone jetzt immer da (Meldungen oder Ruhezustand-Bohne), verschwindet nur bei komplett
leerem Bestand. Kennzahl-Kachel per `$effect`, das erst feuert, sobald `bestand.geladen` wahr
ist (die eigentliche Ziehung läuft in `untrack()`, damit spätere Shot-Änderungen sie nicht
neu würfeln) — nötig, weil `bestand.laden()` asynchron ist und ein einmaliger `untrack()` beim
Modul-Init (wie bei `begruessungsText`) hier leer gelaufen wäre.

### B · Kaffee aktiv/inaktiv ins Kontextmenü

`Kaffeeblatt.svelte`: der Stift-Solo-Button in der Kopfzeile wird ein `Kontextmenue` (bearbeiten
/ ausblenden·einblenden) — derselbe Weg, den Mühle/Brühgerät/Getränk schon gehen.
`KaffeeBearbeiten.svelte`: die `aktiv`-Schalterzeile entfällt ersatzlos.

### C · Profilblatt — Spielraum eingeklappt, Dial-in-Umschalter

Spielraum ist jetzt eine Falte (Startzustand zu), dieselbe `.aufklappbar`-Mechanik wie „Setup
ändern" zwei Zeilen tiefer, nur mit dem Gruppenkopf-Look statt der leiseren Meta-Zeile. Neue
Akzent-Textzeile „Als eingefahren markieren", sichtbar nur solange `profil.modus === 'dialin'`
— schließt die in Block A gefundene Lücke.

### D · Neues Muster `Blattliste`/`Blattzeile`

Das Handoff nennt „Blattliste" seit Sitzung 8 als Komponente für Kaffeeblatt/Einstellungen/
Geräte (Abschnitt 6), gebaut wurde sie nie — sieben Dateien bauten „Blatt mit Zeilen"
seitdem wortgleich selbst nach. `Blattliste.svelte` (nur der Rahmen: Fläche, Radius, Haarlinie,
Schatten) und `Blattzeile.svelte` (Name + optionale Meta + Chevron/Akzent, `akzent`≠`chevron`
unabhängig — eine Einstellungen-Zeile navigiert UND ist Akzent-Text, eine Geräte-Zeile navigiert
mit normalem Text, „+ Setup" ist Akzent ohne Chevron).

**Bewusste Scope-Entscheidung:** `Blattliste` (nur der Rahmen) kam in alle sieben Dateien
(Einstellungen, Geräte, Backup, Getränkeliste, Personen, Beobachtungen, Temperatur-Referenz).
`Blattzeile` (die feste Name+Chevron-Form) nur in die vier, wo sie wirklich passt (Einstellungen,
Geräte, Backup, Getränkeliste) — Personen/Beobachtungen/Temperatur-Referenz haben eigenes
Zeileninnenleben (Kontextmenü, Aufklapp-Formular, Herkunftszeichen statt Chevron) und behalten
ihre lokale Zeilen-Markup, nur der äußere Rahmen ist jetzt gemeinsam. Eine erzwungene
Einheits-Zeile für alle sieben hätte das Muster zur Wunderkiste gemacht, ohne echten Gewinn.

Neuer Token `--blattzeile: 56px` ersetzt die 48/56/60-px-Streuung, die dieselbe Zeilenform
bisher je Datei anders hoch machte. `Musterblatt.svelte` bekam einen Abschnitt dafür.

### E · Einstellungen — vier Gruppen statt sieben

„Geräte", „Personen", „Verhalten", „Bestand", „Beobachtungen", „Backup", „Werkzeuge" →
**Verwalten** (Geräte · Personen · Beobachtungen · Musterblatt · Übungsmodus, eine Blattliste
mit fünf Akzent-Zeilen) · **Verhalten** · **Bestand** · **Daten** (Migration · Backup).
`Backup.svelte` verlor dabei seine eigene „Backup"-Überschrift — „Daten" trägt sie jetzt
gemeinsam mit Migration. Reihenfolge innerhalb jeder Gruppe unverändert, nur die Bündelung.

### F · Typografie — korrigierter Umfang

Geplant war, sechs 12,5-/14,5-px-Stellen auf einen neuen Token `--fs-erklaerung` zu heben.
**Beim Nachschauen bestätigten sich nur drei** — `Einstellungen.svelte`, `Bruehgeraetblatt.svelte`,
`Getraenkeblatt.svelte`, alle drei tatsächlich `.erklaerung`-Zeilen mit identischer Rolle
(gedämpfter Satz unter einem Schalter/Feld). Die anderen drei ursprünglich vermuteten Treffer
(`BestellungPlan.svelte` `.getraenke`/`.weg-knopf`, `Kaffeeblatt.svelte` `.profil-name`) waren
reine Pixel-Koinzidenzen — je eigene Rolle (Meta-Zeile, Pillen-Knopf, Profil-Label), die nur
zufällig denselben Zahlenwert wie ein Erklärsatz trugen. Diese blieben unangetastet; sie
zusammenzulegen hätte unabhängige Konzepte künstlich verknüpft. Zusätzlich vereinheitlicht:
`Kaffeeblatt.svelte`s `.steckbrief-label` (10,5 px, `letter-spacing: 0.1em`) auf
`--fs-kachel-label`/`--label-spacing-kachel` (0,12em) — dieselbe Rolle wie die
Kennzahl-/Parameterkachel-Labels, nur bisher separat handjustiert.

**Bewusst nicht in dieser Etappe:** die größere Typo-Skala-Konsolidierung (11→6 Schriftgrößen,
alter Backlog-Punkt) — dafür wurde kein Bild gezeigt, gehört in einen eigenen Durchgang mit
Mockup, nicht nebenbei mit erledigt.

Verifikation: `npm test` nach jedem Block A–F, durchgehend grün (Domain-Tests 563→565, Typen
0 Fehler, Build ok).

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
