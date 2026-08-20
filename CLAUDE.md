# Brühwerk

Ein Laborbuch für Kaffee. PWA, offline-first, für ein Telefon, für einen Menschen.

Dieses Dokument enthält nur, was man dem Projekt nicht ansieht. Allgemeine
Arbeitsregeln stehen in `~/.claude/CLAUDE.md` und werden hier nicht wiederholt.

**Die sieben Anthropic-Strategien** (Paket 00, spätester Termin vor der ersten
Zeile Anwendungscode) sind mit `~/.claude/CLAUDE.md` bereits umgesetzt — dort
stehen sie als Arbeitsregeln, nicht hier noch einmal dupliziert.

---

## Wo die Wahrheit steht

**`docs/konzept.md` ist die Quelle, nicht dieses Dokument.** Fassung 9, 20.08.2026,
mit 79 eingearbeiteten Gestaltungspunkten (`K1`–`K79`). Jede Zahl, jede Regel und
jede Formel unten steht dort ausführlich begründet. Bei Widerspruch gewinnt das
Konzept — und dann gehört dieses Dokument korrigiert.

`docs/konzept-nachzug.md` ist das Register: welcher K-Punkt an welcher Stelle im
Konzept seine Hauptstelle hat. Nützlich, wenn im Code ein `K42` auftaucht und
unklar ist, worauf es sich bezieht.

**Code-Kommentare verweisen auf K-Nummern.** Das ist Absicht: eine Regel, deren
Herkunft man nachschlagen kann, wird seltener aus Versehen wegoptimiert.

---

## Datenquelle

Es gibt **keine API und kein Backend als Wahrheit.**

- **IndexedDB ist die Wahrheit.** Schreiben ist sofort und offline. Es gibt
  keinen Zustand, in dem ein Netzfehler das Loggen blockiert.
- **Cloud-Backup ist entkoppelt** und darf ausfallen, ohne dass die Bedienung
  es merkt. Der Backend-Anbieter ist noch nicht gewählt (Kandidaten: Supabase,
  Cloudflare D1, Firebase). Auswahlkriterium neben den Freikontingenten: manche
  pausieren Projekte bei Inaktivität.
- **Manueller Datei-Export** ist der zweite, anbieterfreie Backup-Weg. Er muss
  auch dann noch funktionieren, wenn der Cloud-Dienst eingestellt wird.
- **Notion fließt genau einmal hinein** (Paket 02) und wird danach nicht mehr
  gebraucht. **Dieses Repo bekommt nie einen `NOTION_TOKEN`.** Die Migration
  läuft aus dem Velora-Repo und erzeugt eine Seed-Datei.

Das Velora-Repo ist reine Rezept-Referenz. Nichts wird geteilt, nichts
transplantiert — außer den Daten, einmalig.

### Was die Migration reparieren muss

In Notion stehen 14 Dial-in-Shots als `### Shot 1…14`, die App schrieb sie
später als `####`. Sobald ein `heading_4` existierte, las der alte Parser jedes
`###` als Variantennamen — die 14 Shots waren unsichtbar. **Der Import muss
beide Formate lesen.** Ein Prüflauf meldet jeden nicht eindeutig zuordenbaren
Datensatz, statt ihn stillschweigend fallen zu lassen.

Ebenfalls aus der Migration: `MG` bedeutet je Kaffee etwas anderes (3,70 =
Timemore Sculptor, 65 = KINGrinder-K6-Klicks). Das Setup wird aus dem
Wertebereich erschlossen: `3,x` → Sculptor, `60–70` → K6.

---

## Architektur: die Schichten

```
src/
  domain/     reines TypeScript. Planer, Spielraum, Diagnose, Ranking.
  daten/      IndexedDB, zod-Schemata, Sync, Export.
  muster/     die 15 Muster aus der Design-Übergabe als Komponenten.
  bereiche/   Alltag · Bestellung · Kaffees · Historie · Einstellungen.
```

**`domain/` und `daten/` importieren nichts von Svelte.** `domain/` kennt
zusätzlich nicht einmal `idb` — es rechnet, es speichert nicht.

Das ist die zentrale Entscheidung des Projekts, nicht die Wahl des Frameworks.
Die teuren Teile — Bündelung, Totzonen, Spielraum-Logik, Ranking — sind damit
ohne Bildschirm testbar, und ein Framework-Wechsel ließe genau den Teil stehen,
der Arbeit war.

**Die Regel wird erzwungen, nicht angemahnt:** `tests/schichten.test.ts` liest
die Import-Spezifizierer und bricht den Build. Nachweislich — die Gegenprobe
mit einem eingeschmuggelten `import { mount } from 'svelte'` schlägt fehl.

Passend dazu: die Domäne weiß nichts von einem Nutzer, nichts von einem Gerät,
nichts von Chrome. Das ist keine Zukunftsplanung, sondern eine Liste von
Dingen, die man *unterlässt* (siehe *Zwei Türen* unten).

---

## Kritische Business-Logik

Diese Regeln sehen aus wie Details und sind es nicht. Wer sie beim Umbauen
„vereinfacht", zerstört genau das, was die App von einem Notizbuch unterscheidet.

### Bündelung und Verschnitt — `domain/plan.ts`

Je **zwei Halb-Bezug-Getränke mit derselben Bohne und demselben Profil** ergeben
einen Bezug. Eines übrig ergibt ebenfalls einen — mit Verschnitt.

| Bestellung | Bezüge | Verschnitt |
| --- | --- | --- |
| 1 × Cappuccino | 1 | 9 g |
| 1 × Cappuccino + Extra Shot | 1 | — |
| 2 × Cappuccino | 1 | — |
| 3 × Cappuccino | 2 | 9 g |
| 2 × Cappuccino, einer mit Extra Shot | 2 | 9 g |

Die letzte Zeile ist die wichtige: **ein Extra Shot löst den Verschnitt nur bei
ungerader Anzahl auf — bei gerader erzeugt er ihn.** Die App redet ihn niemandem
ein. Und sie *warnt* nicht vor Verschnitt, sie rechnet ihn mit: drei Cappuccino
sind zwei Bezüge und ein halber Shot in den Ausguss, und das ist eine bewusste
Entscheidung, keine Panne.

Ein **Bohnenwechsel ist definitionsgemäß ein neuer Durchgang.** Deshalb steckt
die Bohne im Bündelungs-Schlüssel und die Frage „darf gebündelt werden" stellt
sich nie.

Der Verschnitt gehört ins Modell, weil sonst der **Bohnenverbrauch dauerhaft
falsch** ist — wer nur Tassen zählt, unterschätzt bei ungerader Anzahl um
9 g pro Fall.

### Spielraum — `domain/spielraum.ts` (K6, K34, K56)

**Nicht jeder Unterschied zwischen Ziel und Ist ist eine Abweichung.** Zwei
Sekunden und vier Zehntel Gramm sind Streuung. Gemeldet wird erst außerhalb
des Spielraums, und dann **als Satz, nicht als Zahl**.

Vorgabe: `zeit ± 2 s` · `output ± 0,4 g` · `durchlaufzeit ± 5 s`, je Profil
pflegbar.

**Input und Mahlgrad haben keinen Spielraum** — die stellt man ein, statt sie
zu messen; dort ist jede Änderung Absicht und nie ein Befund. Eine Abweichung
dort läuft über die Übernahme-Frage im Alltagspfad, nicht über die
Abweichungsmeldung.

Der Grund für das Ganze: eine App, die jede Streuung meldet, erzeugt täglich
ein Alarmsignal ohne Inhalt und trainiert an, Meldungen zu überlesen.

### Ranking und Vorbelegung — `domain/ranking.ts` (K12, K25, K56)

**Zwei verschiedene Mechaniken, die man nicht verwechseln darf.**

Getränke-Reihenfolge ist ein **exponentiell abklingender Zähler**, kein Sortieren
nach Summe:

```
score  =  Σ 2^(−Δt / H)          H = Halbwertszeit = 60 Tage
score  ←  score · 2^(−Δt / H) + 1     inkrementell, konstante Zeit
```

Vorbelegte Fragen (Koffein, Kännchen, Bohne, Extra Shot) laufen dagegen über
ein **festes Fenster der letzten 20 Positionen**, nicht über Decay — Koffein ist
eine Gewohnheit, die sich ändert.

| Anteil über 20 Positionen | Verhalten |
| --- | --- |
| ≥ 60 % | fragen, mit Ja vorbelegt |
| > 40 % und < 60 % | fragen, **ohne** Vorbelegung |
| ≤ 40 % | gar nicht fragen |

**Die mittlere Zeile ist die wichtigste.** Bei 50/50 zu raten liegt die Hälfte
der Zeit falsch, und ausgerechnet dieser Fehler fällt erst beim Trinken auf und
kostet dann ein ganzes Getränk. Nicht zu raten ist dort die bessere Funktion.

### Vorbelegung hat eine Grenze — K12

**Fragen ohne Eingriff werden vorbelegt** (Koffein, Kännchen, Bohnenvorschlag).
**Fragen, die eine Rezeptur ändern, nie** — „Als neuen Ausgangswert übernehmen?"
und der Diagnosevorschlag haben keine Voreinstellung. Eine vorbelegte
Rezepturänderung ist eine, die man versehentlich bestätigt und Wochen später
als unerklärliche Drift wiederfindet.

### Füllmenge ist die Konstante, nicht die Milchmenge

```
Milch  =  Füllmenge  −  Σ Shots
```

Eingegeben wird trotzdem die Milchmenge; die App merkt sich die Füllmenge
daraus. Damit passt sich die Milch von selbst an, wenn sich ein Extra Shot
oder ein geänderter Profil-Output dazwischenschiebt.

Jedes Getränk hat eine **Mindestmenge** für seine ausgleichende Zutat. Wird sie
unterschritten, wird der Extra Shot dort gar nicht erst angeboten (Espresso
Macchiato: 30 ml Milch minus 20 ml wäre kein Macchiato mehr).

### Herkunft — drei Zeichen, nicht vier (K54, K13)

| Zeichen | Bedeutung | Darstellung |
| --- | --- | --- |
| gefüllter Punkt | gemessen **oder gerechnet** | voll, alle Stellen |
| Ring | übernommen | voll, alle Stellen |
| gestrichelter Ring | geschätzt | Tilde, gedämpft, eine Stelle weniger |

**Gerechnete Werte bekommen kein eigenes Zeichen** — sie sind so sicher wie
ihre Eingaben. Balance, Komplexität und Gesamt werden bei jeder Anzeige
gerechnet und **nie gespeichert**.

Ein geschätzter Wert, der aussieht wie ein gemessener, wäre schlechter als gar
keiner. Deshalb: `≈ 93 °C` statt `93,4 °C`, solange die Herkunft *geschätzt* ist.
Die Legende erscheint **nur außerhalb des Alltagspfads**.

### Kesseltemperatur ≠ Brühtemperatur

Die Rocket Mozzafiato ist ein **Wärmetauscher**. `KT 121` ist eine
Maschineneinstellung, keine Brühtemperatur. Jede Röster-Empfehlung nennt aber
die Brühtemperatur. Ohne die Referenztabelle je Brühgerät sind beide Welten
nicht vergleichbar.

Startbelegung: **Kessel − 27 K**, Herkunft *geschätzt*. Das ist eine
Gattungsregel für Wärmetauscher, **keine Messung an dieser Maschine** — deshalb
gedämpft dargestellt. Zwischenwerte werden linear interpoliert, außerhalb der
Messreihe **nicht extrapoliert** (dort steht „außerhalb der Messreihe").

### Drehzahl ist die zweite Mahlachse

`rpm` sitzt neben `mg`, nicht neben dem Gussplan — sie verändert die
Partikelverteilung, nicht das Gießen. Folge, die wirklich etwas ändert: **die
Totzonen-Karte ist je Drehzahl gültig.** Ändert sich die Drehzahl innerhalb
eines Profils, sagt die App „die Mahlgrad-Historie dieses Profils gilt dafür
nicht", statt stillschweigend weiterzuvergleichen.

**Keine Regel darüber, in welche Richtung RPM wirkt.** Für die Timemore-Serie
widersprechen sich die Berichte je nach Mahlwerk. Die App loggt und zeigt
irgendwann die eigene Korrelation — langsamer als eine eingebaute Regel, aber
wahr.

Das RPM-Feld erscheint nur, wenn die gebundene Mühle eine Drehzahl hat
(`Muehle.rpmEinstellbar`). Eine Handmühle hat keine, und ein leeres Feld wäre
kein Zustand, sondern eine offene Frage.

---

## Was bewusst nicht gebaut wird

Diese Liste ist so wichtig wie die Feature-Liste. Wer sie nicht kennt, „ergänzt"
irgendwann etwas, das mit Absicht fehlt.

- **Kein Timer.** Nicht als Option, nicht als Schalter. Am Siebträger wird nach
  Auswaage gefahren, beim Pour Over steht die Zeit auf der Waage. Eine
  mitlaufende Uhr erzeugt Druck. Zeit erscheint an genau zwei Stellen: als
  Ergebniswert im Shot und als Vorabschätzung einer Bestellung — beides Zahlen
  zum Ansehen, keine, die laufen.
- **Kein Urteil in der Bestellung** (K57, K58), **kein Abschluss-Bildschirm**,
  **kein Personengitter**. Wenn fünf Getränke fertig sind und Leute warten, ist
  das der schlechteste Moment für ein Urteil. Bewertet wird ausschließlich über
  die **Historie**, am einzelnen Shot, nachträglich.
- **Keine Ressourcen, Rüstzeiten, Standzeiten oder Aufräumschritte in der
  Oberfläche** (K48). Das Rechenmodell dahinter bleibt und trägt die geschätzte
  Dauer und die Bündelung — es erscheint nur an keiner Stelle im Bild.
- **Keine Ansagen im Plan** (K47). Kein „500er Kännchen nehmen", keine
  Standzeit, kein „Espresso zuletzt". Das Kännchen wird gerechnet, damit die
  Dauer stimmt, aber nicht angesagt. Ein Plan mit drei Hinweisen pro Bestellung
  wird nach einer Woche überblättert.
- **Abgehakt wird nur auf Durchgangs- und Positionsebene** (K2, K37). Handgriffe
  hakt niemand ab.
- **Keine Farbcodierung im Aromarad** (K36).
- **Keine Wischgeste zum Löschen** im Gussplan-Editor (K44) — einen Schritt
  mitten im Aufguss wegzuwischen bemerkt man zu spät.
- **Keine Personenzuordnung je Tasse außerhalb der Bestellung** (K34).
- **Keine Umgebungsdaten.** Ein Wetterdienst misst außen, die Mühle steht innen.
- **Kein LLM-Aufruf.** Vorbereitet ist nur die Naht:
  `vorschlag(kontext) → { text, begruendung, quelle: 'regel' | 'llm' }`.
  Dahinter liegt zunächst nur das Regelwerk. Ein API-Aufbau ist laufender
  Aufwand und wird erst gebaut, wenn Modellwahl, Auslösefrequenz und gerechnete
  Monatskosten vorgelegen haben.
- **Keine Tageszeit-Abhängigkeit** bei der Koffein-Vorbelegung — sie würde die
  Historie halbieren.

---

## Sprache

Diese Wörter sind entschieden. Sie stehen so im Code, in der Oberfläche und in
Commits.

| Nutze | Nicht |
| --- | --- |
| **Input** | Dose |
| **Output** | Yield, Ertrag |
| **Preinfusion** | Vorbrühen |
| **Bestellung** | Runde |
| **Durchgang** | Bezugsgruppe, Batch |
| **Nachklang** | Abgang |
| **Auffälligkeit** | Defekt, Fehler |

Feste Reihenfolge überall, wo Werte nebeneinander stehen:
**Output → Preinfusion → Zeit** (K5).

**Bezeichner sind deutsch** — `spielraum`, `durchgang`, `verschnittGramm`. Die
Domäne spricht die Sprache des Konzepts; eine Übersetzungsschicht zwischen
Dokument und Code wäre eine dauernde Fehlerquelle. Umlaute in Bezeichnern
werden aufgelöst (`groesse`, `fuehrungswert`), in Strings und Kommentaren nicht.

---

## Zwei Türen, die offen bleiben

Kosten heute fast nichts, wären später teuer. **Beides ist eine Liste von
Dingen, die man unterlässt — nichts davon wird gebaut.**

- **Anderes Gerät.** Android/Chrome ist das Referenzgerät, **aber keine
  Abhängigkeit davon ohne Not.** Keine Chrome-eigene Fähigkeit ohne Grund,
  Safe-Area-Abstände von Anfang an, und jeder Bildschirm hat einen sichtbaren
  Rückweg statt sich auf die Android-Geste zu verlassen. Kein iOS-Testaufwand.
  *(Diese Regel weicht bewusst von Velora ab, wo „kein iOS/Safari annehmen" steht.)*
- **Zweiter Mensch.** Nichts im Datenmodell setzt einen einzelnen Nutzer voraus
  — Setups, Profile, Kaffees, Personen sind durchgehend Sammlungen. Kein Login,
  keine Konten, keine Rechteverwaltung.

---

## Verifikation

**Ein Befehl:**

```
npm test
```

Er läuft in drei Stufen, schnellste zuerst, und bricht bei der ersten ab:

| Stufe | Befehl | Was sie fängt |
| --- | --- | --- |
| 1 | `vitest run` | Business-Logik **und** die Schichtentrennung |
| 2 | `svelte-check` | Typfehler in `.ts` und `.svelte` |
| 3 | `vite build` | alles, was erst beim Bündeln auffällt |

Gemessen: **~20 s** für den vollen Durchlauf (warmer `node_modules`-Stand,
20.08.2026). Der interne `vitest`-Lauf selbst braucht unter einer Sekunde —
den Rest kosten Node-Start, `svelte-check` und `vite build`.

Ein **PostToolUse-Hook** in `.claude/settings.json` führt `npm test` nach jeder
Änderung an `src/`, `tests/` oder den Config-Dateien automatisch aus. Das ist
Absicht: eine Verifikation, die man von Hand anstoßen muss, läuft genau so
lange, bis es eilig wird.

**Tests prüfen die Zahlen aus dem Konzept, nicht meine Erinnerung daran.** Die
Bündelungstabelle und die Decay-Werte stehen als Erwartungswerte in
`plan.test.ts` und `ranking.test.ts`. Ändert sich das Konzept, schlagen sie an —
und das ist der gewünschte Weg herum.

**Was `npm test` nicht prüft:** ob es am Telefon gut aussieht und ob es sich gut
bedient. Dafür gibt es keinen Befehl. Das Musterblatt (Paket 01b) wird auf dem
echten Gerät geöffnet, nicht im Desktop-Browser beurteilt.

---

## Umsetzungsreihenfolge

Die Pakete stehen im Konzept. Zwei Punkte daraus, die den Ablauf steuern:

- **Paket 01b — Musterblatt vor dem ersten Bildschirm.** Die 15 Muster als
  Bauteile, alle auf einer Seite, beide Themes, geöffnet auf dem echten Telefon.
  Token-, Abstands- und Trefferflächenfehler fängt man einmal statt fünfzehnmal.
- **Historie (Paket 05) vor der Bestellung (Paket 06).** Seit K57 jede Bewertung
  dorthin verlegt, ist sie Voraussetzung dafür, dass die Bestellung nicht
  bewertet.

---

## Offen — noch nicht geliefert

Nicht raten, nicht mit Platzhaltern füllen, die später wie Daten aussehen:

- **Die Temperatur-Referenztabelle** — existiert bereits, wird befüllt statt
  gemessen. Bis dahin: Kessel − 27 K, Herkunft *geschätzt*, gedämpft.
- **Le-Nez-Nummern und ihre SCA-Kategoriezuordnung** — 60 Aromen, bis Paket 05.
  Zahlen in Entwürfen sind Beispiele, nicht die echte Liste.
- **Die Milliliter-Angaben der neun Getränke** — im Konzept Vorschläge, keine
  Messungen. Vor Paket 06 einmal gegenprüfen.
- **Cold-Brew-Mahlgrad** — bewusst unbeziffert. Deutlich gröber als 65 Klicks
  am K6; die Zahl liefert der erste Ansatz.
- **Backend für das Cloud-Backup** — noch nicht gewählt.
