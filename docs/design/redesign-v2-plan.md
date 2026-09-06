# Brühwerk — Redesign v2: Gesamtplan

**Wiederhergestellt am 2026-09-04** aus dem Sitzungs-Transkript, nachdem die ursprüngliche
Plan-Datei (`.claude/plans/zany-sleeping-peach.md`) von den Einzelplänen der folgenden Etappen
überschrieben wurde — derselbe Dateiname wurde für jede Etappe wiederverwendet, statt einen
neuen zu wählen. Dieses Dokument ist jetzt die dauerhafte Fassung, im Repo statt nur lokal unter
`.claude/plans/`. Fortschritt je Etappe steht in `offene-punkte-redesign.md` (Abschnitte 21–25);
dieses Dokument bleibt die ursprüngliche Zielbeschreibung, unverändert gegenüber dem Original.

## Kontext

Es gab bereits einen kompletten visuellen Redesign-Durchgang (Branch `design/redesign-v1`,
Pakete 1–5, `docs/design/redesign-v1-handoff.md`, mehrere Rückmeldungsrunden). Das Ergebnis
gefällt nicht — es wirkt wie eine Rohfassung. Julians eigene Diagnose: der Top-Down-Musterset-
Ansatz hat Design-Entscheidungen erzwungen, bevor ein fertiger Screen sichtbar war.

**Meine Diagnose weicht davon ab, und das ist die wichtigste Aussage dieses Plans.**
Die Reihenfolge war ein Faktor, aber nicht die Ursache. Die Ursache steht im Handoff selbst,
Abschnitt „NICHT VERHANDELBAR":

- keine Schatten, nirgends, in keiner Stärke
- kein Rand um Blätter und Karten
- genau ein Akzent, keine Signalfarbe für Zustände
- **alle Werte gleich groß (19/500)**
- **Führungswert ausdrücklich nicht hervorheben** — „fachlich führend, visuell gewöhnlich"
- keine Vergrößerung einzelner Werte
- keine Balken, keine Fortschrittsanzeigen

Das ist eine Verbotsliste gegen visuelle Hierarchie. Ein Screen ohne Hierarchie sieht aus wie
ein Entwurf, egal in welcher Reihenfolge er entsteht. Gleichzeitig definiert `tokens.css`
**elf Schriftgrößen**, die sich teils um 0,5 px unterscheiden — viele Stufen ohne wahrnehmbaren
Sprung. Das ist die schlechteste Kombination: zu viele Werte, zu wenig Unterschied.

Die Korrektur ist deshalb nicht „mehr Design", sondern **weniger Stufen mit größeren Sprüngen**
— das deckt sich mit Julians Vorgabe „nicht zu viele verschiedene Schriften, Styles, Größen,
kein Durcheinander".

**Ziel:** eine PWA, die preisverdächtig aussieht *und* im Alltag schnell bleibt. Der
Zwei-Tap-Alltagspfad bleibt unangetastet.

---

## Entschieden (aus der Fragerunde)

| Frage | Antwort |
| --- | --- |
| Farbwelt | bleibt als DNA, darf erweitert und angepasst werden |
| Disziplin | zwei Schriften, wenige Größen, kein Durcheinander |
| Arbeitsweise | mit Code, aber effizienter — Richtung Mockup |
| Bestand | selbstrechnend aus Bezügen, manuell korrigierbar; Portionen für eingefrorene Kaffees |
| QR-Scan für Bestand | vorgemerkt, nicht jetzt |
| Le Nez | 60er-Set, recherchiert |
| Modus B (Personen/Self-Order/QR) | zurückgestellt |
| Reihenfolge | von mir entschieden |

**Recherche-Ergebnis Le Nez:** Das Set ist **Le Nez du Café 2.0 · 60 Aromen** (2025, Jean
Lenoir). Es ist in **genau den neun SCA-Familien** organisiert — Floral, Fruity,
Sour/Fermented, Green/Vegetative, Other, Roasted, Spices, Nutty/Cocoa, Sweet. Das Mapping aus
K55 wird dadurch sachlich korrekt statt geraten. 20 Aromen stammen aus dem alten 36er-Set,
25 aus den Wein-/Whisky-Kollektionen, 15 sind neu.
Quellen: [lenez.com](https://www.lenez.com/en/aroma-kit/coffee/le-nez-du-cafe-60-aromas/) ·
[Roast Magazine](https://www.roastmagazine.com/stories/le-nez-2025)

---

## Die Arbeitsweise — Antwort auf „mehr Richtung Mockup?"

Ja, aber mit einer Präzisierung: **ein Mockup aus echtem HTML und CSS, kein Bild.**

Ich baue *eine* HTML-Datei mit drei Screens nebeneinander, hell und dunkel, und veröffentliche
sie als Artifact. Du bekommst eine URL, öffnest sie auf dem Telefon und beurteilst sie dort.

Warum das der effiziente Weg ist:

- **Nichts geht verloren.** Das CSS aus dem Mockup wandert direkt in `tokens.css`. Ein Bild
  müsste man nachbauen und dabei neu interpretieren — genau die Lücke, an der Redesign v1
  gescheitert ist.
- **Eine Datei statt dreißig.** Kein Svelte-Umbau, keine Tests, kein `svelte-check`, kein
  Build. Eine Korrekturrunde kostet Minuten statt Stunden.
- **Echtes Gerät.** Du beurteilst auf dem Telefon, nicht im Desktop-Browser — die Regel aus
  `CLAUDE.md`, die bisher nur fürs Musterblatt galt.

Erst nach deiner Freigabe des Bildes fassen wir Produktionscode an.

**Die drei Perspektiven bleiben** (`docs/ux-regeln.md` Regel 1): jede Etappe mit neuem Screen
durchläuft UX → Brühwerk-Design → Synthese als benannte Abschnitte in einer Antwort, keine
Subagenten dafür.

---

## Etappenplan

### Etappe 0 · Bildsprache am Mockup — *keine Produktionsänderung*

Eine Datei, drei Screens, beide Themes:

| Screen | Warum dieser |
| --- | --- |
| **Dashboard** | das Neue und Emotionale — hier entsteht die Tonalität |
| **Kaffeeblatt** | „liebevolle Produktinfos", der Sympathie-Test |
| **Verkostung mit Aromenauswahl** | der dichteste, schwerste Fall — wenn die Sprache hier trägt, trägt sie überall |

Was in dieser Etappe konkret entschieden wird:

- **Typo-Skala von elf auf sechs Stufen** mit deutlichen Sprüngen statt vieler Nachbarwerte.
  Weiterhin genau zwei Schriften (Source Serif 4 für Inhalt, Source Sans 3 für Apparat).
- **Hierarchie-Ebenen benennen:** Held · Inhalt · Beiwerk. Jedes Element bekommt eine.
- **Farbwelt erweitern**, nicht ersetzen: die warme Papierpalette bleibt, dazu kommen eine
  Tiefen-Ebene für schwebende Elemente und eine zweite Zustandsfläche.
- **Aufgehobene Verbote, jeweils begründet und begrenzt** — Schatten für Schwebendes,
  Größensprünge für Werte, die wirklich zählen, Kategoriefarben ausschließlich im Aromarad.
- Übergänge und Mikrobewegung, `prefers-reduced-motion` respektiert.

**Erwartetes Ergebnis:** eine Artifact-URL. Wir rechnen mit ein bis zwei Korrekturrunden am
Bild — die sind hier billig und ausdrücklich eingeplant.

**Bean Conqueror** fließt hier ein, nicht als Optik, sondern als Struktur: Dashboard mit
„verfügbaren Bohnen" plus letzten Bezügen, Bestandsliste mit *verfügbar / aufgebraucht*,
Gramm und Röstdatum. Das bestätigt den Bestands-Ansatz unabhängig.

---

### Etappe 1 · Fundament

- `src/muster/tokens.css` auf die freigegebene Skala ziehen.
- Die Kernbausteine in `src/muster/` nachziehen: `Knopf`, `Segment`, `Chips`, `Urteil`,
  `Kopfzeile`, `Kaffeekarte`, `Parameterkachel`, `Werteliste`, Tab-Leiste in `Rahmen.svelte`.
- **`docs/design/redesign-v1-handoff.md` wird abgelöst** durch ein neues Dokument. Bleibt das
  alte stehen, zieht ein späterer Durchgang wieder die alten Verbote heran — das ist der
  wahrscheinlichste Weg, wie dieser Redesign rückabgewickelt wird.
- **Neu: `Blattliste.svelte`.** Dasselbe Panel-CSS ist an neun Stellen kopiert
  (`offene-punkte-redesign.md` Punkt 8). Jetzt ist der Moment.
- Einstellungsseite als Gegenprobe: gleiche Farben und Typografie, bewusst höhere Dichte —
  dein Punkt 5, „beides gleichzeitig".

**Prüfung:** `npm test` (vitest · svelte-check · vite build) muss grün bleiben.

---

### Etappe 2 · Dashboard + Bestandsverwaltung

Erster echter Screen. Funktion und Gestaltung in einem Zug, damit nichts zweimal angefasst wird.

**Datenmodell** (`src/daten/schema/kaffee.ts`): `Charge` bekommt `einwaage` (Gramm),
`portionen?` (Anzahl · Gramm je Portion, für eingefrorene Kaffees), `eingefroren` und
`korrektur`. Nummer bleibt optional — Julians Rückmeldung „mir reicht das Röstdatum"
(`offene-punkte-redesign.md` Punkt 15).

**Neu `src/domain/vorrat.ts`** — reine Rechnerei, kein `idb`:
Restmenge = Einwaage − Σ (Input je Bezug) − Σ Verschnitt ± Korrektur. Die App kennt beide
Größen bereits; `CLAUDE.md` begründet den Verschnitt im Modell genau damit („sonst ist der
Bohnenverbrauch dauerhaft falsch"). Dazu Reichweite in Bezügen und eine Alters-Einschätzung,
die Gefrierlagerung berücksichtigt.

**Dashboard** (`src/bereiche/bar/Bar.svelte`, heute 221 Zeilen mit nur einer Muster-Komponente):
persönliche Begrüßung, Schnellstart-Kacheln aus dem Decay-Ranking, prominenter Einstieg in die
Bestellung, Info-Bereich für knappen Bestand und Kaffees, die raus müssen.

Kein Streak, keine Gamification — `begruessung.ts` begründet das bereits gut.

**Prüfung:** Tests für `vorrat.ts` mit den Zahlen aus dem Konzept, danach am Telefon.

---

### Etappe 3 · Kaffeeblatt

Tonalität von Datenauflistung zu Produktinfo. Herkunft, Aufbereitung, Facts erzählend statt
tabellarisch. Rezepte je Zubereitungsart klar erkennbar — aktuell hängen sie an
`Profil.setupId`, was im Bild nicht sichtbar macht, dass das der Ristretto- und das der
Pour-over-Weg ist. Bestand der aktuellen Charge sichtbar (Ergebnis aus Etappe 2).

---

### Etappe 4 · Verkostung + Aromen

**Daten:** die 60 echten Le-Nez-2.0-Aromen ersetzen die Platzhalter in `src/daten/aromen.ts`.
Explizites, dokumentiertes Mapping Le Nez ↔ SCA — bis auf Aromenebene, nicht nur auf
Kategorieebene wie heute (`LENEZ_VERTEILUNG`). **Du prüfst die Liste einmal gegen deine
Schachtel**, bevor sie eingecheckt wird; Fläschchennummern sind der Teil, den ich nicht
vollständig belegen kann.

**Funktion:** Auswahl auf jeder Ebene und Mehrfachauswahl kann `DrillDown.svelte` bereits —
das ist kein Neubau, sondern muss sichtbarer werden.

**Gestaltung:** Farbcodierung je Kategorie. Das **hebt K36 auf** („keine Farbcodierung im
Aromarad — ein Akzent bleibt ein Akzent"). Ich halte die Aufhebung für richtig, weil neun
Kategorien ohne Farbe schlecht unterscheidbar sind, aber sie gehört als Entscheidung ins
Konzept, nicht still in den Code.

---

### Etappe 5 · Reaktionsvorschläge reparieren — *Ursache gefunden*

Dein Punkt 9. Es liegt weder an zu wenig Daten noch an unklarer Formulierung, sondern an
`src/domain/diagnose.ts`: **sechs Regeln, die fast alle mehrere Symptome gleichzeitig
verlangen.**

| Regel | verlangt |
| --- | --- |
| Unterextraktion | sauer **und** dünn **und** schnell |
| Überextraktion | bitter **und** adstringent **und** langsam |
| starke Unterextraktion | sauer **und** salzig |
| KT zu hoch | brandig **und** stark |
| Konzentration niedrig | flach — **und sonst nichts** |
| Verteilung | ungleichmäßig |

Wer nur „zu sauer" antippt, bekommt nichts. „bitter + langsam" — nichts. „sauer + schnell" —
nichts. Elf Symptome ergeben über zweitausend Kombinationen; sechs davon sind abgedeckt. Die
Regeln sind 1:1 aus der Konzepttabelle übernommen, wo sie als Lehrbuch-Vollbilder formuliert
sind. In der Praxis tippt man ein bis zwei Chips an.

**Lösung: Evidenz statt Konjunktion.** Jedes Symptom zahlt auf Achsen ein
(Extraktion zu niedrig / zu hoch, Konzentration, Verteilung, Temperatur), gewichtet nach
Stärke. Die stärkste Achse gewinnt und bringt ihre Empfehlung mit. Ein einzelnes „zu sauer"
ergibt dann einen Vorschlag mit klarer Aussage — der Zwei-Symptom-Fall bleibt eindeutiger und
darf das auch zeigen.

Kein Overengineering: eine Tabelle Symptom → Achse → Gewicht, eine Summierung. Die sechs
bestehenden Regeln bleiben als Sonderfälle mit Vorrang erhalten, damit die geprüften
Konzeptzahlen weiter gelten.

Zusammen mit der Neugestaltung von `ShotErfassung.svelte`, damit der Screen einmal angefasst
wird.

**Zu klären, wenn wir hier ankommen:** ob eine Empfehlung, die auf schwacher Evidenz beruht,
das auch sagen soll („könnte an X liegen") oder ob leise Sicherheit besser ist.

---

### Etappe 6 · Übungsmodus intelligent

Setzt Etappe 4 voraus — mit Platzhalter-Aromen ist Üben sinnlos.

`src/daten/schema/uebung.ts` trackt heute `versuche`, `treffer`, `letzterVersuch`. Für deine
Anforderung fehlt wenig: eine Verwechslungsmatrix (was wurde stattdessen getippt) macht die
Auswahl deutlich klüger, ohne das Modell aufzublähen.

`domain/uebung.ts` gewichtet heute nur nach Trefferquote. Neu: Quote **und** Abstand seit dem
letzten Versuch, mit Halbwertszeit — dasselbe Decay-Verfahren, das `ranking.ts` schon nutzt
und das getestet ist. Kein Karteikasten-System mit fünf Fächern; das wäre die überengineerte
Variante, vor der du gewarnt hast.

---

### Etappe 7 · Bestellung, Modus A (Café-Style)

Mengenbasierte Erfassung ohne Personenzuordnung. Auslastungs-Hinweise aus dem
Verschnitt-Rechenmodell, das bereits steht (`domain/plan.ts`) — „ein halber Shot bliebe übrig,
noch ein Doppio?" ist genau die Frage, die das Modell schon beantworten kann.

Modus B, Self-Order und QR bleiben zurückgestellt. Ich notiere sie als offene Punkte, damit
das Datenmodell ihnen nicht im Weg steht — die Position trägt heute schon eine Person.

---

### Etappe 8 · Rest und Konsistenzdurchgang

Übrige Screens auf die neue Sprache, Musterblatt aktualisieren, jeder Screen in hell und
dunkel gegen das neue Design-Dokument geprüft.

---

## Was du erwarten darfst

- **Nach Etappe 0:** eine Telefon-URL mit drei Screens in beiden Themes. Ab da weißt du, wie
  die App aussehen wird. Das ist der Moment, in dem du Nein sagen kannst, ohne dass viel
  verloren ist.
- **Nach Etappe 2:** ein echtes, bedienbares Dashboard mit funktionierender Bestandsführung.
- **Nach Etappe 5:** die Bewertung liefert bei realistischen Eingaben verlässlich einen
  Vorschlag.
- **Nach jeder Etappe:** `npm test` grün, mit gezeigter Ausgabe.

**Was ich nicht verspreche:** dass Etappe 0 im ersten Anlauf sitzt. Ein bis zwei
Korrekturrunden am Bild sind eingeplant und normal — dafür ist das Mockup da.

## Risiken

| Risiko | Umgang |
| --- | --- |
| Neue Freiheiten kippen ins Beliebige | Sechs Größen, zwei Schriften, jede Ausnahme einzeln begründet und begrenzt |
| Alter Handoff zieht das Design zurück | wird in Etappe 1 ersetzt, nicht ergänzt |
| Le-Nez-Nummern falsch zugeordnet | du prüfst einmal gegen die Schachtel, vor dem Einchecken |
| K36 und Handoff-Regeln werden still gebrochen | jede Aufhebung kommt als Konzeptänderung, nicht als Code-Detail |
| Zwei-Tap-Alltagspfad wird länger | wird bei jedem Dashboard-Entwurf explizit nachgezählt |

## Bekannte Altlast, nicht Teil dieses Plans

Der gemeldete Verlaufskurven-Bug (`offene-punkte-redesign.md` Punkt 0a) ist ungeklärt und
nicht reproduzierbar. Er gehört in einen eigenen kleinen Auftrag — dafür brauche ich Datum und
Uhrzeit der betroffenen Shots.

## Verifikation

- `npm test` nach jeder Code-Etappe, Ausgabe wird gezeigt.
- Neue Domain-Logik (`vorrat.ts`, Diagnose-Achsen, Übungs-Decay) bekommt Tests mit den Zahlen
  aus dem Konzept, nicht aus meiner Erinnerung.
- `tests/schichten.test.ts` erzwingt weiter, dass `domain/` nichts von Svelte oder `idb` weiß.
- Optik und Bedienung prüfst du am Telefon — dafür gibt es keinen Befehl.
