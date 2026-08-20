# Brühwerk

**Konzept · Fassung 8 · nach der Gestaltung · 20.08.2026**

Ein Laborbuch für Kaffee. Setup-bewusstes Shot-Logging, ein Dial-in das aus deinen Daten lernt, eine Alltagskorrektur die zwei Taps dauert, und eine Bestellung, die in Durchgängen denkt statt in Handgriffen. Die Gestaltung ist durch; dieses Konzept trägt ihre einundsechzig Entscheidungen.

**Repo-Analyse** velora @ 1.16.2 · **Datenbestand** 8 Kaffees · 20+ Shots · **Gestaltung** abgeschlossen · K1–K61 eingearbeitet · **Status** Konzept, keine Umsetzung

---

## Was die Gestaltung zurückgebracht hat

Sechs Sitzungen haben einundsechzig Punkte erzeugt, die das Konzept berühren. Fünf davon nehmen etwas zurück, das hier über mehrere Fassungen aufgebaut worden war — die stehen zuerst.

> **Die Choreografie verschwindet aus der Oberfläche**
>
> Fassung 2 bis 7 haben die Bestellung als *Ressourcenplan* beschrieben: Spuren für Mühle, Brühgruppe, Dampflanze und dich, Rüstzeiten mit Phasen, benannte Standzeiten, ein Ablaufplan als Bild. Am Bildschirm hat sich das als das Falsche erwiesen. **K48 nimmt Ressourcen, Rüstzeiten, Standzeiten und das Aufräumen aus der Bedienung.**
>
> Das Rechenmodell bleibt — es trägt die Bündelung und die geschätzte Dauer. Was geht, ist die Erzählung darüber. Und damit verengt sich ein Prinzip, das hier groß geschrieben stand: *„ehrlich statt glatt"* hieß bisher, die App nenne Standzeiten offen. Sie nennt sie nicht mehr. Der Grund ist derselbe, aus dem in Fassung 4 die Standzeit-Warnung bei Milchgetränken entfiel — sie war eine Zahl ohne Folge. Ehrlichkeit heißt ab hier: die App behauptet keine Genauigkeit, die sie nicht hat. Sie erklärt nicht mehr ungefragt ihren eigenen Ablauf.

> **Aus Achsen und Skalen werden sechs gleichrangige Größen**
>
> Fassung 6 hat die Verkostung in zwei Sorten geteilt: bipolare Achsen mit Zielmitte für Säure, Bitterkeit und Körper, einseitige Skalen für Aroma, Süße und Nachklang. Die Unterscheidung war richtig und bleibt **im Modell** bestehen. Am Bildschirm ist sie eine Sortierhilfe für den Autor gewesen, kein Gewinn für den Ausfüllenden.
>
> **K52 macht daraus eine Form:** die Treppe. Fünf Stäbe, deren Höhe die Entfernung vom Ziel zeigt — bei den bipolaren Größen liegt die Mitte am niedrigsten, bei den einseitigen steigt sie nach rechts. Die Art steht als Meta im Kopf. Damit sieht man den Unterschied, statt ihn erklärt zu bekommen, und die sechs Größen stehen gleichrangig untereinander.

| Was | Fassung 7 | Jetzt | Punkt |
| --- | --- | --- | --- |
| Bestellung | Ressourcenplan mit Rüstzeiten und Standzeiten | **Kette aus Durchgängen**; Handgriffe sind Modell, nicht Oberfläche | K48 |
| Kernobjekt | Position und Bezug | **Durchgang** — was ein Gerät in einem Zug bedient | K18 K19 |
| Bewerten | Urteil am Ende der Bestellung | **kein Urteil in der Bestellung** — ausschließlich über die Historie | K57 K58 |
| Verkostung | Achsen und Skalen getrennt | **sechs Treppen**, gleichrangig, Art als Meta | K52 |
| Aromen | Flavor Wheel als Rückgrat, Le Nez daneben | **Le Nez in denselben neun Kategorien**, mit Fläschchennummer, ohne Radverweis | K55 |
| Vokabular | Dose, Yield | **Input, Output**; Reihenfolge Output → Preinfusion → Zeit | K5 |
| Bohnenwahl | Best Fit als Vorschlag | **Schnittmenge** aus „geeignet für" × Koffein × aktiv | K45 K46 |
| Genauigkeit | Ist gegen Ziel, jede Abweichung sichtbar | **Spielraum je Größe** — Abweichung erst außerhalb | K6 K56 |
| Führung | alle Parameter gleich gewichtet | **ein Führungswert je Gerät**, Moka keiner | K7 |
| Herkunft | vier Zustände denkbar | **drei Zeichen**; Gerechnetes trägt den gefüllten Punkt | K54 |

Die übrigen einundfünfzig Punkte sind Präzisierungen und stehen an ihrem Ort im Text. Wo ein Punkt eine Aussage dieses Dokuments ersetzt, ist er dort genannt.

## Ausgangslage

Fünf Befunde aus Code und Daten. Sie sind der Grund, warum „überarbeiten" nicht reicht.

> **Befund 1 · Akut**
>
> **Deine Dial-in-Historie ist in der App unsichtbar.** Bei „Espresso Entcoffeiniert" stehen 14 handgeschriebene Shots im Notion-Body als `### Shot 1…14`. `api/coffee-shot.js` schreibt neue Shots aber als `####`. Sobald *ein* `heading_4` existiert, schaltet `parseDialInLog()` auf „neues Format" — und liest danach jedes `###` als Variantennamen statt als Shot.
>
> Ich habe den Parser gegen die echte Seitenstruktur laufen lassen. Ergebnis: **1 sichtbarer Shot** — der von der App selbst geschriebene, mit `Ergebnis: –`. Die 14 Shots mit der eigentlichen Erkenntnis sind weg. Die Seite hat sich beim ersten App-Schreibvorgang selbst zerlegt.

#### Befund 2 — „MG" bedeutet je nach Kaffee etwas anderes

Espresso Entcoffeiniert: `MG 3,70` — Timemore Sculptor. Manaresi: `MG 65` — KINGrinder-K6-Klicks für den Moka-Bereich. Gleiches Feld, zwei völlig verschiedene Skalen, keine Zuordnung zum Gerät. Setup-pro-Profil ist deshalb kein Komfort-Feature: **ohne es ist das Datenmodell schon heute mehrdeutig.**

#### Befund 3 — Notion ist als Schreib-Backend das falsche Werkzeug

Ein einziger Shot-Log kostet heute bis zu vier sequenzielle Notion-Requests: Seite lesen → Parameter patchen → Seite neu lesen → Shot anhängen. Das ist vertretbar für „gelegentlich Werte korrigieren". Es ist nicht vertretbar für Loggen an der Maschine oder eine Bestellung mit fünf Getränken. Dazu kommt: das Block-Parsing ist nachweislich fragil — siehe Befund 1.

#### Befund 4 — Getränke-Rezepte haben in der Rezepte-DB keinen Platz

`Typ` ist `Kochen | Backen | Brot`. Ein Cappuccino ist strukturell etwas anderes als ein skalierbares Zutaten-Rezept: er ist eine *Komposition* aus Shot + Milch + Verhältnis + Gefäß + *Reihenfolge*, und der Shot kommt aus einem anderen Datensatz. Das braucht ein eigenes Modell.

#### Befund 5 — Die Eigenschaften des Kaffees sind heute nirgends

Röstgrad, Herkunft, Aufbereitung, Arabica-Anteil, Entkoffeinierungsverfahren: nichts davon existiert als Feld. Was da ist, liegt in `Tasting-Text` und `Erkenntnisse` als Fließtext. Damit ist nichts davon such-, sortier- oder auswertbar — und die Frage *„welche Naturals liefen bei mir eigentlich gut?"* ist heute nicht beantwortbar, obwohl die Daten im Haus wären.

> **Nebenbefund · Dokumentation**
>
> `CLAUDE.md` ist veraltet. Nicht erwähnt: `tasting.js`, `admin.js`, `api/coffee-shot.js`, `api/bring.js`. Die Kaffees-DB hat sechs Properties mehr als dokumentiert: `Dial-in`, `Dose (g)`, `KT`, `Yield (g)`, `Zeit (s)`, `Preinfusion (s)` — die alten Namen; in der neuen App heißen sie `Input` und `Output`. Wird beim Abschluss mitgezogen.

## Entscheidungen

- **Architektur: Eigene App, eigenes Repo** — Velora bleibt reine Rezept-Referenz. Nichts wird geteilt, nichts transplantiert — außer den Daten.

- **Design: Von Null, und zuerst** — Keine Velora-Erbschaft. Claude Design läuft *vor* der Implementierung auf Datenmodell und Flows. Am Ende steht nur noch eine Politur, kein Design-Nachtrag.

- **Datenhaltung: Lokal, mit Cloud-Backup** — IndexedDB ist die Wahrheit. Schreiben ist sofort und offline. Sync läuft im Hintergrund und darf ausfallen, ohne die Bedienung zu blockieren.

- **LLM: Vorerst ohne, Naht vorbereitet** — Alles Vorschlagende läuft über *eine* Schnittstelle. Ein späterer LLM ist ein Austausch der Implementierung, kein Umbau.

- **Notion: Import, dann Ablösung** — Einmalige Migration inklusive der 14 verschütteten Shots. Danach ist die App die Wahrheit — mit Backup auf zwei Wegen.

- **Timer: Keiner** — Du fährst nach Auswaage, und die Zeit steht auf Waage und Maschine. Die App zählt nicht mit. Begründung im Abschnitt *Warum kein Timer*.

## Architektur

Mit „Design von Null" ist die Frage nach einer geteilten Basis praktisch beantwortet: **es gibt nichts mehr zu teilen.** Der Vollständigkeit halber die Zahlen aus der Analyse — 594 CSS-Regeln in `index.html`, davon 315 generisch und 87 Basis/Tokens, zusammen rund 400 theoretisch teilbare Regeln. Die werden jetzt bewusst nicht angefasst.

Was ohnehin gegen eine Kopplung sprach, bleibt gültig:

- **Velora ist per Architekturregel eine Single-File-App.** Echtes Teilen bräuchte einen Build-Step oder eine ausgelagerte CSS-Datei — und würde genau die Architektur brechen, die dort geschützt ist. Ohne das heißt „geteilte Basis" praktisch *einmal kopieren plus gekoppelt deployen*: die Kopplung zahlen, das Teilen nicht bekommen.
- **Service Worker.** Eine Origin, ein Scope, zwei Apps. In der Git-History steht bereits `Fix: neue Deployments erreichten das Gerät nie (Service-Worker-Cache)`. Diese Bug-Klasse würde sich verdoppeln.
- **Deploy-Kopplung.** Jedes Kaffee-Deploy deployt Velora mit. Velora ist fertig und stabil; die neue App wird monatelang im Umbau sein.
- **Routing.** `vercel.json` leitet aktuell alles auf `/index.html`. Ein Fehler beim Umbau nimmt Velora mit runter.
- **Die Konventionen forken ohnehin.** `npm test` parst den `<script>`-Block aus `index.html`, `VERSION` lebt dort, die Deklarationsreihenfolge-Regel gilt für `renderCoffeeDetail`. Für den Umfang der neuen App ist Single-File die falsche Form — sie braucht eigene Regeln, in einer eigenen `CLAUDE.md`.

> **Ergebnis**
>
> Technisch hält nichts von der Trennung ab, und der letzte verbliebene Nachteil aus Fassung 1 — *Design-Drift zwischen den Apps* — ist mit deiner Entscheidung kein Nachteil mehr, sondern Absicht. Übrig bleibt: zwei Repos statt einem. Das ist teilweise ein Vorteil, weil jede Arbeitssession fokussierteren Kontext hat. Die Migration fahre ich aus dem Velora-Repo und erzeuge eine Seed-Datei; das neue Projekt braucht nie einen `NOTION_TOKEN`.

#### Zwei Türen, die offen bleiben

Gebaut wird die App für dich, auf deinem Telefon, nach deinem Geschmack. Aber du hast zwei Dinge benannt, die heute unwahrscheinlich sind und trotzdem passieren könnten: ein Wechsel auf ein iPhone, und ein zweiter Mensch, der sie benutzt. **Beide Türen kosten jetzt fast nichts und wären später teuer** — deshalb bleiben sie offen, ohne dass irgendetwas dafür gebaut wird.

| Tür | Was das heute heißt | Was es *nicht* heißt |
| --- | --- | --- |
| **Anderes Gerät** | Android/Chrome bleibt das Referenzgerät — dort wird entworfen und getestet. Aber keine Chrome-eigene Fähigkeit ohne Not, Safe-Area-Abstände von Anfang an, und jeder Bildschirm hat einen sichtbaren Rückweg statt sich auf die Android-Geste zu verlassen. | Kein iOS-Testaufwand, keine doppelte Entwicklung, keine Kompromisse im Entwurf. Es ist eine Liste von Dingen, die man *unterlässt*, keine, die man baut. |
| **Zweiter Mensch** | Nichts im Datenmodell setzt voraus, dass es einen Nutzer gibt — es *erwähnt* ihn nur nirgends. Beim Nachsehen ist das bereits erfüllt: Setups, Profile, Kaffees, Personen sind durchgehend Sammlungen, keine Einzelstücke. Es fehlt lediglich eine Zuordnung, wem etwas gehört. | Kein Login, keine Konten, keine Rechteverwaltung. Der Unterschied zwischen „ein Feld ergänzen" und „die App umbauen" ist genau der, dass das Modell schon plural ist. |

> **Der eine Punkt, an dem iOS wirklich wehtäte**
>
> Push-Benachrichtigungen und die Installation als App sind auf iOS eingeschränkter als auf Android. Für Brühwerk trifft das ins Leere: Es gibt keinen Timer, keine Erinnerungen, nichts, was von sich aus meldet. **Die einzige Funktion, die je eine Benachrichtigung wollen würde, ist der fertige Cold-Brew-Ansatz** — und die ist im Konzept bewusst als Zeitpunkt zum Nachsehen gebaut, nicht als Meldung. Die Entscheidung gegen den Timer zahlt sich hier ein zweites Mal aus.

In die `CLAUDE.md` der neuen App gehört daraus eine Regel, die von Velora abweicht: dort steht heute *„Plattform: Android/Chrome — kein iOS/Safari annehmen"*, und das ist für Velora richtig. Für Brühwerk lautet sie **„Android/Chrome ist das Referenzgerät, aber keine Abhängigkeit davon ohne Not"**. Ein Unterschied von wenigen Wörtern, der über Jahre wirkt.

## Dein Gerätepark

Alles, was die App an Ressourcen kennt. Aus dieser Liste ergeben sich Skalen, Schrittweiten und Rüstzeiten.

- **Rocket Mozzafiato R** — Espressomaschine, E61, Wärmetauscher, Rotationspumpe. Eine Brühgruppe, eine Dampflanze. Deine `KT`-Werte 119–121 sind **Kesseltemperatur**, nicht Brühtemperatur — dazu unten die Referenztabelle. Cooling Flush: **3 s**, fest im Ablauf.
- **Siebträger · Doppelsieb** — **Einer, und immer das Doppelsieb.** Das Einzelsieb nutzt du nicht. Zwei Konsequenzen, beide groß: zwischen zwei Bezügen liegt immer Ausklopfen und Spülen im kritischen Pfad — und zwei gleiche Milchgetränke mit derselben Bohne kommen aus *einem* Bezug.
- **Timemore Sculptor 076S** — Elektrische Mühle, für Espresso *und* Pour Over. Numerische Skala, Espressobereich 3,60–4,00, Schrittweite 0,05. **Drehzahl einstellbar und von dir aktiv genutzt** — 1200 rpm am Siebträger, am Pour Over eine andere. Die Drehzahl gehört zum Mahlen, nicht zum Aufguss; eigener Abschnitt unten.
- **KINGrinder K6** — Handmühle, Klickskala, keine Drehzahl. Dein Moka-Bereich liegt bei 65 Klicks. Schrittweite 1 Klick. **Kommt eventuell auch für Pour Over dazu** — deshalb muss ein Pour-Over-Profil die Mühle frei wählen können und das RPM-Feld verschwinden, wenn keine da ist.
- **Hario V60 02** — Pour Over. Braucht einen Gussplan statt einer Parameterzeile — eigener Abschnitt unten. Die Mühle ist nicht festgelegt: Sculptor oder K6, beide Profile stehen gleichberechtigt am selben Kaffee.
- **Bialetti 1 Tasse** — Moka. Eigenes Brühgerät mit eigener Dosis/Wasser-Menge — nicht dieselbe wie die 3er. **Die Wahl richtet sich nach der Tassenzahl**, nicht nach dem Kaffee.
- **Bialetti 3 Tassen** — Moka, zweites Brühgerät. Der Planer wählt zwischen 1er und 3er anhand der Positionen in der Bestellung und schlägt sie vor — änderbar.
- **Cold Brew** — Bleibt drin, wie von dir bestätigt. Sonderrolle: kein Gerät im Ablauf einer Bestellung, sondern ein **Ansatz mit Fertig-Zeitpunkt**. Details unten bei den Getränken.
- **Milchkännchen 350 ml** — Dein Standard. Bei 60 % Füllstand — mehr geht beim Schäumen nicht — sind das **210 ml nutzbar**: genau eine Cappuccino-Portion.
- **Milchkännchen 500 ml** — Selten genutzt, Volumen von dir mit „eher 500" angegeben. **300 ml nutzbar** — und damit das einzige Kännchen, in dem zwei Cappuccino-Portionen zusammen Platz haben. Wenn es doch 700 ml sind, ändert das nur eine Zahl im Setup.
- **Schwanenhalskanne 700 ml** — Temperatur einstellbar. Damit ist die Wassertemperatur beim Pour Over ein echter, geloggter Parameter — und keine Schätzung. Sie kann pro Guss variieren.

> **Was das Kännchenvolumen entscheidet**
>
> Ein Kännchen lässt sich beim Schäumen nur etwa zu **60 %** füllen, sonst fehlt der Platz für den Schaum. Daraus rechnet die App ohne Nachfrage: 2 × Cappuccino sind 260 ml Milch — das **passt nicht ins 350er, sondern nur ins 500er**. Ein Latte Macchiato allein (220 ml) übrigens auch nicht. Der Plan sagt deshalb nicht nur, was zu tun ist, sondern welches Kännchen du greifen sollst. Der Füllfaktor ist eine Zahl im Setup — wenn du enger oder großzügiger arbeitest, korrigierst du sie einmal.

#### Die Temperatur-Referenztabelle

Dein Wunsch, und er löst ein echtes Problem: **die Mozzafiato ist eine Wärmetauschermaschine.** Was der Kessel anzeigt, ist die Dampfkessel-Temperatur — das Brühwasser wird davon abgeleitet und ist deutlich kühler. Deine `KT 121` ist deshalb keine Brühtemperatur, sondern eine Maschineneinstellung. Jede Röster-Empfehlung und jedes Rezept im Netz nennt aber die *Brühtemperatur*. Ohne Übersetzung sind die beiden Welten nicht vergleichbar.

Die App bekommt deshalb pro Brühgerät eine Messreihe, die du selbst füllst:

| Kessel | Flush | Brühgruppe | Herkunft | Datum |
| --- | --- | --- | --- | --- |
| 119 °C | 3 s | ≈ 92 °C | geschätzt | — |
| 121 °C | 3 s | ≈ 94 °C | geschätzt | — |
| 123 °C | 3 s | ≈ 96 °C | geschätzt | — |

So sieht die Startbelegung aus, wenn deine Tabelle noch nicht da ist: Faustregel Kessel minus 27 K, Herkunft *geschätzt*, Tilde statt Nachkommastelle. Deine Werte ersetzen sie Zeile für Zeile.

Was die App damit tut:

- **Zweite Zahl überall.** Wo `KT 121` steht, steht künftig `121 °C Kessel · ≈ 93,4 °C Gruppe`. Zwischenwerte werden linear interpoliert, außerhalb der Messreihe wird *nicht* extrapoliert — dort steht schlicht „außerhalb der Messreihe".
- **Rückwärts lesen.** Ein Röster empfiehlt 93 °C? Die App sagt dir, welche Kesseltemperatur das bei dir ist. Das ist der eigentliche Gewinn.
- **Flush als zweite Achse.** Bei einem Wärmetauscher hängt die Brühtemperatur nicht nur am Kessel, sondern genauso an der Flush-Dauer. Du fährst konstant 3 s, deshalb reicht dir heute eine Spalte — die Achse bleibt trotzdem im Modell, damit eine Gewohnheitsänderung die Reihe nicht entwertet, sondern nur ergänzt.
- **Herkunft wird mitgeschrieben.** Eine übernommene Tabelle, eine eigene Messung und eine Schätzung sind nicht dasselbe wert — und ohne Messgerät im Siebträger misst man mehrere Grad zu niedrig, weil das Wasser auf dem Weg abkühlt. Die App vergleicht deshalb nur Zeilen gleicher Herkunft miteinander, statt Präzision zu behaupten, die die Quelle nicht hergibt.

> **Du hast die Tabelle schon**
>
> Das ändert den Aufwand grundlegend: **die Referenz wird nicht gemessen, sondern befüllt.** Die Herkunft *übernommen* kommt als dritter Wert dazu, neben *gemessen* und *geschätzt*. Damit ist die Funktion ab dem ersten Tag vollständig nutzbar und braucht weder Thermometer noch Messreihe.
>
> Wirf sie mir rein, wenn wir an Paket 03 sind — dann steht sie als Startbestand drin, statt dass du sie abtippst. Kommt sie nicht rechtzeitig, startet die Tabelle nach deiner Ansage mit Standardwerten: für einen E61-Wärmetauscher liegt die Brühtemperatur nach kurzem Flush grob **27 K unter der Kesseltemperatur**. Das ergibt genau die Zahlen oben — 121 °C Kessel ≈ 93,4 °C Gruppe.

> **Die Bedingung, unter der ich das einbaue**
>
> Diese 27 K sind eine **Gattungsregel für Wärmetauscher, keine Messung an deiner Mozzafiato.** Der reale Versatz hängt an Kesseldruck, Flushdauer, Gruppentemperatur und daran, wie lange die Maschine schon steht — er kann mehrere Kelvin danebenliegen.
>
> Deshalb steht solchen Zeilen die Herkunft *geschätzt* an, und die App **stellt sie sichtbar anders dar** als Werte aus deiner Tabelle: die abgeleitete Gruppentemperatur erscheint gedämpft und mit einer Tilde, also `≈ 93 °C` statt `93,4 °C`. Ein geschätzter Wert, der aussieht wie ein gemessener, wäre schlechter als gar keiner — er würde eine Genauigkeit behaupten, die nicht da ist, und du würdest fremde Rezepte danach einstellen. Sobald deine Tabelle drin ist, verschwindet die Dämpfung von selbst.

#### Drei Herkunftszeichen, nicht vier K54 K13

Die Kennzeichnung gilt nicht nur für die Temperatur — sie zieht sich durch die ganze App, überall wo ein Wert steht. Aus der Gestaltung kommt ihre endgültige Form:

| Zeichen | Bedeutung | Wie der Wert aussieht |
| --- | --- | --- |
| **gefüllter Punkt** | gemessen *oder gerechnet* | voll, mit allen Stellen |
| **Ring** | übernommen | voll, mit allen Stellen |
| **gestrichelter Ring** | geschätzt | Tilde, gedämpft, eine Stelle weniger |

**Gerechnete Werte bekommen kein eigenes Zeichen** K54. Ein Wert, der aus gemessenen Eingaben folgt — Balance aus den Achsen, Ertrag aus Input und Verhältnis — ist genau so sicher wie diese Eingaben. Ein viertes Zeichen hätte eine Unsicherheit behauptet, die nicht existiert, und hätte die Legende von drei auf vier Zeilen verlängert, ohne eine Frage zu beantworten.

Und die Legende selbst erscheint **nur außerhalb des Alltagspfads** K13. Beim Shot-Erfassen stehen die Zeichen ohne Erklärung da. Wer zweimal am Tag loggt, kennt sie nach einer Woche; wer sie nachschlagen will, findet das i-Zeichen im Kaffee-Detail und in den Einstellungen. Eine dauerhaft sichtbare Legende ist Beipackzettel im Arbeitsweg.

## Datenmodell

Ein Profil hängt immer an einem Setup — damit ist „MG 65" nie wieder mehrdeutig. Dazu die strukturierten Kaffee-Eigenschaften, und aus der Gestaltung neu: der Durchgang als Kernobjekt, Spielräume je Größe und ein Vokabular, das ohne Barista-Jargon auskommt.

```
Setup        { name, muehle→, bruehgeraet→, zubehoer[],
               parallelSchaeumen: bool,
               sammelSchaeumen: 'nie' | 'geteilterBezug' | 'immer',
               begruendungKoffein: bool,   // K31 — zwei getrennte Schalter,
               begruendungBohne: bool,     //       Standard an
               ablauf→ }
Muehle       { name, skala:{ typ:'numerisch'|'klicks', min, max, schritt },
               rpmEinstellbar, rpmBereich?:{ min, max, schritt } }
Bruehgeraet  { name, typ:'espresso'|'moka'|'pourover'|'coldbrew',
               gruppen, dampflanze: bool, ktEinstellbar,
               sieb?: { art:'einzel'|'doppel', portionen },
               fuehrungswert: 'output'|'durchlaufzeit'|null,   // K7
               mengen[],                   // K8 — 1× immer, 2× am Doppelsieb,
                                           //      3× an der 3er, Pour Over bis 2
               flushDauer?,                // Cooling Flush, 0 = keiner
               tempReferenz[{ kt, flush, gruppe, ts,
                              herkunft:'uebernommen'|'gemessen'|'geschaetzt' }] }
Zubehoer     { name, art:'milchkanne'|'sieb'|'wasserkocher'|'tamper'|'wdt'|…,
               volumen?, fuellfaktor?,     // Milchkanne: nutzbar = volumen × faktor
               temperaturEinstellbar? }

Ablauf       { schritte[{ id, name, dauer, ressource, phase,
                          unbeaufsichtigt: bool, bedingung? }],
               buendel[{ name, schrittIds[], dauer? }] }
             // K48: reines Rechenmodell. Trägt die geschätzte Dauer und die
             // Bündelung — erscheint nirgends in der Oberfläche.

Kaffee       { name, roester, aktiv: bool,
               art: 'single' | 'blend',
               herkunft[],                 // Länder — mehrfach deckt Blends ab
               varietaet?, anbauhoehe?,
               aufbereitung: 'washed'|'honey'|'natural'|'anaerob'|
                             'wet-hulled'|'sonstige',
               botanik: { arabica%, robusta% },
               roestgrad: 1…5,             // hell → dunkel, fünf Bohnen
               roestgradRoester?,          // Wortlaut des Rösters, frei
               entkoffeiniert: bool,
               entkoffeinierung?: 'swiss-water'|'co2'|'ea'|'mc'|'unbekannt',
               geeignetFuer[],             // K46 — Zubereitungsarten
               chargen[→], aktuelleCharge→,
               bewertung, status:'offen'|'angebrochen'|'leer',
               erkenntnisse[{ ts, text, herkunft, shot?→ }] }
Charge       { kaffee→, nummer, roestdatum, leer: bool }   // K61 — keine Packungsgröße

Profil       { kaffee→, setup→, name, standard,
               ziel: { input, mg, rpm?, kt, output, pre, zeit },   // K5
                                          // Reihenfolge Output → Preinfusion → Zeit
                                          // rpm nur wenn die Mühle eine hat
               spielraum: { zeit: 2, output: 0.4, durchlaufzeit: 5 },
                                          // K6 K34 K56 — je Größe pflegbar,
                                          // in Schritten der Größe;
                                          // Input und Mahlgrad haben keinen
               gussplan?→,                 // Pour Over
               ansatz?: { verhaeltnis, ziehzeit, ort, filtern },   // Cold Brew
               modus: 'dialin' | 'eingefahren',
               hinweise }
Gussplan     { name, gesamtwasser, lesart:'kumulativ'|'inkrementell',
               bausteine[…] }              // eigener Abschnitt unten
Shot         { ts, kaffee→, charge→, profil→, setup→,
               ist: { input, mg, rpm, kt, output, pre, zeit },
               portionen: 1 | 2,           // ein Bezug, ein oder zwei Tassen
               urteil: 'daneben'|'okay'|'sehr gut'|'referenz',
               befunde[{ symptom→, staerke:'leicht'|'deutlich' }],   // K1
               vorschlag?,                 // K10 — bleibt bis zum nächsten Shot
               freitext?, tasting?→, durchgang?→ }
Symptom      { id, label, quelle:'system'|'eigen',
               regel?: { parameter, richtung, schritte } }
Tasting      { shot→,
               groessen: { saeure, koerper, bitterkeit,      // bipolar, Mitte ist Ziel
                           aroma, suesse, nachklang },       // einseitig, mehr ist mehr
                                          // K52 — sechs gleichrangig; die Art
                                          // bleibt im Modell, trennt aber nicht mehr
               auffaelligkeiten[{ id, staerke:'leicht'|'deutlich' }],   // K53
               aromen[{ set, pfad[], nummer? }],   // K55 — kein Radverweis
               freitext }
             // Balance, Komplexität und Gesamt werden gerechnet, nicht gespeichert.
Aromaset     { id, name, quelle, kategorien[], vialNummern: bool }
             // K55 — beide Sets in denselben neun SCA-Kategorien

Getraenk     { name, aktiv: bool, kategorie, vorlage?→,
               zubereitung,                // K46 — die Rezeptseite der Kopplung
               basis: { bruehgeraet→, anteilBezug: 'ganz'|'halb',
                        profilPraeferenz, ausVorrat: bool },
               fuellmenge,                 // die Konstante; wird geteilt (K34)
               ausgleich: 'milch' | 'heisswasser' | null,
               mindestAusgleich?,          // darunter kein Extra Shot
               milch?: { textur, temperatur },   // Menge wird gerechnet
               heisswasser?: { temperatur },
               gefaess: { name, volumen },
               reihenfolge[],              // z. B. Wasser → Shot (Long Black)
               empfindlichkeit,            // wie schnell es verfällt
               standardKaffee?→ }
Ansatz       { kaffee→, profil→, angesetzt, fertigAb, menge, rest, status }
Person       { vorname, nachname?, notiz, aktiv, standard: bool,   // K17
               // alle drei abgeleitet, nie gepflegt:
               favoriten[], koffeinAnteil, extraShotAnteil }

Durchgang    { geraet→, kaffee→, charge→, profil→,        // K19
               shot?→,                     // was das Gerät in einem Zug bedient
               positionen[→],              // ein bis drei Getränke (K18)
               urteilGemeinsam: bool,      // K26 — Standard an
               erledigt: bool }
Position     { person→, getraenk→, kaffee→,
               koffein:'normal'|'entkoffeiniert',
               modifikatoren[],            // heute nur 'extra-shot'
               durchgang?→ }
Bestellung   { ts, positionen[→], durchgaenge[→],
               dauerGeschaetzt, verschnitt,          // in g
               status }
             // K57 K58 — kein Urteil, kein Abschluss. Bewertet wird
             // ausschließlich über die Historie.
```

#### Was die Gestaltung am Modell geändert hat

- **Das Vokabular heißt jetzt Input, Output, Preinfusion** K5. Aus `dose` wird `input`, aus `yield` wird `output`. Nicht Kosmetik: *Dose* und *Yield* sind Barista-Jargon, *Input* und *Output* sagen dasselbe ohne Vorwissen — und sie ordnen sich von selbst. Die feste Reihenfolge **Output → Preinfusion → Zeit** gilt überall, wo Werte nebeneinander stehen.
- **`spielraum` ist neu und ändert, was „Abweichung" heißt** K6 K34 K56. Bisher war jeder Unterschied zwischen Ziel und Ist eine Abweichung. Das ist falsch: zwei Sekunden und vier Zehntel Gramm sind Streuung, kein Befund. Die App meldet erst außerhalb des Spielraums — und dann als Satz, nicht als Zahl. Vorgabe Zeit ± 2 s, Output ± 0,4 g, Durchlaufzeit ± 5 s; Input und Mahlgrad haben keinen, weil du sie einstellst statt sie zu messen. Je Größe am Profil pflegbar, Startvorschlag aus der eigenen Streuung.
- **`Bruehgeraet.fuehrungswert`** K7. Ein Wert je Gerät steht groß, der Rest begleitet: Siebträger *Output*, Pour Over *Durchlaufzeit*, Moka **keiner**. Beim Moka gibt es nichts zu führen — die Menge kommt aus der Kanne, die Zeit steuerst du nicht.
- **`Durchgang` ist das neue Kernobjekt** K18 K19 K20. Ein Durchgang ist, *was ein Gerät in einem Zug bedient*: ein Shot oder ein Aufguss, ein bis drei Getränke, ein Urteil als Standard. Damit ist der geteilte Bezug nicht mehr ein Sonderfall am Shot, sondern die Regel: zwei Cappuccino aus dem Doppelsieb sind ein Durchgang mit zwei Positionen. Ein zweites Getränk kommt nur dazu, wenn es denselben Shot und dieselbe Bohne braucht — ein Bohnenwechsel ist ein neuer Durchgang.
- **`staerke` sitzt am Befund, nicht am Shot** K1. Ein Shot kann gleichzeitig *leicht sauer* und *deutlich dünn* sein. Eine Stärke für alle Symptome war eine Vereinfachung, die sich beim Ausfüllen sofort gerächt hat.
- **`Kaffee.geeignetFuer` und `Getraenk.zubereitung`** K46. Die Kopplung zwischen Bohne und Rezept hat zwei Seiten, und beide gehören dorthin, wo man sie pflegt: die Bohne weiß, wofür sie taugt, das Getränk bringt seine Zubereitung mit. Die Bohnenliste in der Bestellung ist die **Schnittmenge** daraus — mal Koffein, mal `aktiv`. Das ersetzt `bestFit` als Vorschlagsfeld: aus einem Rat wird ein Filter.
- **`Charge` wird ein eigenes Objekt** K61, mit Nummer, Röstdatum und „leer". Ohne Packungsgröße — die wurde nie gepflegt und hat nie eine Frage beantwortet. Jeder Shot zeigt auf seine Charge; damit wird der Chargenwechsel im Verlauf eine senkrechte Linie statt einer Notiz.
- **`Tasting.groessen` statt `achsen` und `skalen`** K52. Sechs Größen in einem Objekt. Welche bipolar ist und welche einseitig, bleibt bekannt — es bestimmt die Form der Treppe und die Berechnung der Balance. Es teilt den Bogen nur nicht mehr in zwei Blöcke.
- **Balance, Komplexität und Gesamt werden nicht gespeichert** K38 K54. Sie werden bei jeder Anzeige gerechnet — aus dem Abstand zur Mitte, aus der Zahl der Aromen, aus dem Shot-Urteil. Ein gerechneter Wert ist deshalb kein eigener Herkunftszustand, sondern trägt den **gefüllten Punkt** wie ein gemessener: er ist so sicher wie seine Eingaben.
- **`aromen` ohne `wheelRef`** K55. Beide Sets leben in denselben neun SCA-Kategorien; Le Nez trägt zusätzlich seine Fläschchennummer. Damit entfällt das Rückgrat-Konstrukt aus Fassung 3 — es gibt keine zwei Sprachen mehr, die aufeinander abgebildet werden müssten, sondern eine Ordnung mit zwei Beschriftungen.
- **Zwei Setup-Schalter für Begründungen** K24 K31. Die Zeile *„7 von 8 zuletzt"* ist standardmäßig an, aber getrennt abschaltbar für Koffein und Bohne. Wer den Grund kennt, will ihn nicht jedes Mal lesen.
- **`Ablauf` bleibt, wandert aber ganz hinter die Oberfläche** K48. Rüstzeiten, Ressourcen und Phasen tragen weiterhin die geschätzte Dauer und die Bündelung. Sie erscheinen an keiner Stelle im Bild.

> **Was aus Fassung 7 unverändert gilt**
>
> Profil hängt am Setup, Ziel und Ist sind getrennt, Shots sind erstklassige Datensätze, Kaffee-Eigenschaften sind Felder statt Prosa, `herkunft` ist eine Liste und deckt damit Blends mit ab, `Getraenk.aktiv` blendet aus statt zu löschen, `reihenfolge` trägt den Unterschied zwischen Long Black und Americano, `rpm` bleibt die zweite Mahlachse neben `mg`, `Symptom` ist eine Tabelle statt einer Konstante, `Ansatz` trägt Cold Brew, und `Shot.umgebung` bleibt gestrichen.

#### Das Kaffeeblatt K51 K61

Wenn die Eigenschaften erst einmal Felder sind, stellt sich sofort die Frage, wie sie dastehen. Die Gestaltung hat sie beantwortet, und die Antwort gehört ins Konzept, weil sie mitbestimmt, welche Felder überhaupt gebraucht werden:

- **Die Eigenschaften stehen direkt unter dem Titel**, nicht in einem Block weiter unten. Sie sind das, was man beim Öffnen wissen will.
- **Der Untertitel trägt nur den Röster** — eine Zeile, ein Name. Alles andere ist Eigenschaft, nicht Kopf.
- **Röstgrad als Bohnen, Bewertung als Sterne.** Zwei Größen, die man vergleicht, ohne zu lesen. Beide brauchen dafür eine feste Stufenzahl im Modell, keinen Freitext.
- **Anbauhöhe mit Tausenderpunkt** — *1.450 m*, nicht *1450 m*. Klein, aber es entscheidet, ob eine Zahl als Höhe oder als laufende Nummer gelesen wird.

Am selben Blatt wird auch die **Charge** angelegt K61: Nummer, Röstdatum, und ein Schalter, der die vorherige als leer markiert. Nicht in den Einstellungen, nicht in einem eigenen Bereich — dort, wo man ohnehin steht, wenn man die Tüte aufmacht.

#### Migration aus Notion

| Notion | Ziel | Anmerkung |
| --- | --- | --- |
| Kaffees-DB-Zeile | Kaffee | direkt |
| `## Varianten` → `###` | Profil | Setup wird aus dem MG-Wertebereich erschlossen: 3,x → Sculptor, 60–70 → K6 |
| `## Dial-in Log` | Shot | **beide** Formate lesen (`###` und `####`) — repariert Befund 1 rückwirkend |
| `## Aufguss` | `Gussplan.bausteine` | Das Notion-Format `[50g \| 30s] Bloom: …` ist bereits ein Baustein — Menge, Dauer, Rolle, Text. Übersetzt sich eins zu eins |
| `Erkenntnisse` | `Kaffee.erkenntnisse[0]` | als ein datierter Alteintrag, nicht zerlegt |
| `Tasting-Text` | Kaffee | direkt |
| — | Herkunft, Aufbereitung, Botanik, Röstgrad, Decaf | existiert in Notion nicht. Nachpflegen von Hand — bei acht Kaffees eine Viertelstunde |

Beim Import läuft ein Prüflauf, der jeden nicht eindeutig zuordenbaren Datensatz meldet, statt ihn stillschweigend fallen zu lassen. Bei acht Kaffees kannst du das Ergebnis einmal komplett durchsehen — danach ist der Bestand sauber.

## Dial-in und Alltagskorrektur

Zwei Modi, ein Eingabeweg. Der Unterschied ist nicht die Bedienung, sondern was die App aus der Eingabe schließt.

Du hast den Kern selbst benannt: ein Dial-in ist eine *Suche* — ein neuer Kaffee, du weißt noch nicht, wo der Punkt liegt. Die tägliche Anpassung ist etwas anderes: der Punkt ist bekannt, aber er *wandert*, weil die Bohne mit Temperatur, Luftfeuchte und Alter arbeitet. Beim Einfrieren wandert er langsamer, bei offener Packung schneller. Deswegen willst du dafür kein neues Dial-in fahren.

|  | Dial-in | Alltagskorrektur |
| --- | --- | --- |
| Auslöser | du startest ihn explizit | passiert einfach, ohne Ankündigung |
| Frage | „wo ist der Punkt?" | „wo ist der Punkt *heute*?" |
| Schrittweite | groß, exploriert bewusst | ein Schritt, nie mehr |
| Vorschlag der App | schlägt aktiv den nächsten Testpunkt vor | schlägt nur vor, wenn du meldest dass etwas nicht stimmt |
| Aufwand | Tasting erwünscht | ein bis drei Taps, kein Formular |
| Ergebnis | ein eingefahrenes Profil | das Profil verschiebt sich um einen Schritt |

#### Deine offene Frage: wird die Alltagskorrektur als Shot geloggt?

**Ja — aber sie darf dich nichts kosten.** Das ist der einzige Weg, auf dem die Drift überhaupt sichtbar wird, und die Drift ist die interessanteste Kurve, die diese App produzieren kann. Der Preis dafür muss aber genau ein Tap sein, sonst machst du es nach einer Woche nicht mehr. So sieht das aus:

> **Bildschirm-Skizze**
>
> **Nach dem Shot · immer sichtbar**
>
> Wie war er?
>
> [daneben] · **[okay]** · [sehr gut] · [Referenz]

Ein Tap. Damit ist der Shot geloggt — mit Ist-Werten, Zeitstempel, Profil, Setup und Kaffee. Bei *okay* oder besser ist hier Schluss.

Hast du vor dem Bezug am Mahlgrad gedreht, steht der neue Wert ohnehin schon im Shot. Ist das Urteil *sehr gut* oder *Referenz* und weicht der Ist-Wert vom Profil ab, fragt die App genau eine Sache nach:

> **Bildschirm-Skizze**
>
> **3,70 statt 3,65 — und er war sehr gut.**
>
> Als neuen Ausgangswert übernehmen? **[Ja]** [Nein]

Das *ist* die Alltagskorrektur. Kein eigener Modus, kein eigener Screen — ein Tap im Anschluss an einen ohnehin geloggten Shot.

#### Wie die Werte dastehen K3 K5 K6

Drei Entscheidungen aus der Gestaltung ändern, wie die Shot-Erfassung aussieht — und alle drei nehmen Arbeit weg.

- **Das Ziel steht im Gruppenkopf, nicht in einer eigenen Zeile** K3. Vorher standen Ziel und Ist nebeneinander, und man las zwei Spalten. Jetzt trägt der Kopf das Ziel, und darunter stehen die Ist-Werte — *mit dem Ziel vorbelegt*. Wer nichts geändert hat, tippt nichts. Wer am Mahlgrad gedreht hat, überschreibt einen Wert.
- **Die Reihenfolge ist Output → Preinfusion → Zeit** K5, überall wo Werte nebeneinander stehen. Sie folgt dem, was du zuerst abliest.
- **Abweichung gibt es erst außerhalb des Spielraums** K6 — und dann als Satz, nicht als Zahl.

> **Der Spielraum ist die wichtigste dieser drei**
>
> Bisher war jeder Unterschied zwischen Ziel und Ist eine Abweichung. Das stimmt nicht: **zwei Sekunden und vier Zehntel Gramm sind Streuung, kein Befund.** Eine App, die sie meldet, erzeugt jeden Tag ein kleines Alarmsignal ohne Inhalt — und trainiert dir an, Meldungen zu überlesen.
>
> Vorgabe: Zeit ± 2 s · Output ± 0,4 g · Durchlaufzeit ± 5 s. **Input und Mahlgrad haben keinen**, weil du sie einstellst statt sie zu messen — dort ist jede Änderung Absicht. Je Größe am Profil pflegbar, in Schritten der Größe, mit einem Startvorschlag aus deiner eigenen Streuung.

#### Die Quittung K4

Der Alltagspfad endet dort, wo er anfing: in der Bar. Oben steht eine Zeile, die sagt, was gerade passiert ist — **höchstens eine**, und eine neue ersetzt die alte. Sie bleibt bis zum nächsten Öffnen oder bis zum nächsten Shot.

Das ist bewusst schwach dosiert. Eine Liste der letzten fünf Shots wäre eine Historie an der falschen Stelle; eine Meldung, die von selbst verschwindet, hätte man verpasst. Eine Zeile, die stehen bleibt, bis etwas Neues passiert, ist genau die Menge Rückmeldung, die ein Vorgang braucht, der zwei Taps dauert.

#### Wann die App nicht vorbelegt K12

Vorbelegte Antworten sind bequem, aber sie haben eine Grenze, und die verläuft an der Rezeptur. **Fragen ohne Eingriff werden vorbelegt** — Koffein, Kännchen, Bohnenvorschlag. Wenn du dort durchtippst, passiert nichts Ungewolltes.

**Fragen, die ein Rezept ändern, werden nie vorbelegt.** „Als neuen Ausgangswert übernehmen?" hat keine Voreinstellung, und der Diagnosevorschlag auch nicht. Eine vorbelegte Rezepturänderung ist eine Änderung, die man versehentlich bestätigt — und die man Wochen später als unerklärliche Drift wiederfindet.

#### Wer bewertet, und wann K26 K32 K57

Ein Durchgang trägt **ein Urteil als Standard**, auch wenn drei Getränke daraus entstehen — es ist ja ein Bezug, den man beurteilt. Ein Schalter „einzeln bewerten" trennt es auf, wenn du für zwei Tassen wirklich verschiedene Urteile hast.

Und: **in der Bestellung wird gar nicht bewertet.** Das Urteil entsteht im Alltagspfad oder nachträglich über die Historie am einzelnen Shot. Der Grund steht im Bestellungs-Abschnitt — wenn fünf Getränke fertig sind und Leute warten, ist der schlechteste Moment für ein Urteil.

#### Wenn es daneben war

Erst dann öffnet sich mehr. Das ist die Espresso-Diagnostik, und dein Einwand dazu war richtig: die Eingabe muss auswählbar sein, sonst ist sie nicht verwertbar. So stelle ich sie mir konkret vor:

> **Bildschirm-Skizze**
>
> **Schritt 2 · nur bei „daneben"**
>
> Was stört?
>
> **[deutlich zu sauer]** · [zu bitter] · **[leicht dünn]** · [flach] · [adstringent] · [brandig] · [salzig] · [zu stark]
>
> **Lauf**
>
> **[lief zu schnell]** · [lief zu langsam] · [ungleichmäßig]
>
> **Unterextraktion.**
>
> Mahlgrad 3,75 → 3,65 · zwei Schritte feiner **[Übernehmen]** [Später]

*Mehrfachauswahl ist erlaubt — „zu sauer" plus „dünn" ist eine andere Diagnose als „zu sauer" allein.*

> **Die Stärke sitzt am Befund K1 K53**
>
> Fassung 7 hatte eine Stärkefrage für den ganzen Shot — *leicht* oder *deutlich* als dritte Zeile. Das war eine Vereinfachung, die sich beim ersten Ausfüllen rächt: ein Shot kann gleichzeitig **leicht sauer und deutlich dünn** sein, und genau diese Kombination ist die interessante.
>
> Die Stärke steckt deshalb im Chip. Ein Tippen öffnet *leicht* und *deutlich*, die Wahl klappt zu, der Chip heißt danach „deutlich zu sauer". Zweites Tippen öffnet erneut, drittes nimmt zurück. Keine zusätzliche Zeile, kein zusätzlicher Tap im Normalfall — und das Regelwerk bekommt eine deutlich schärfere Eingabe.

Der Vorschlag bleibt am Shot, bis der nächste Shot läuft K10. Du kannst ihn also stehen lassen, den Kaffee trinken, nachdenken und ihn erst danach übernehmen — oder ihn mit „Später" liegen lassen, ohne dass er verschwindet. Was ihn beendet, ist immer der nächste Bezug.

#### Wenn die Auswahl nicht reicht

Sie wird irgendwann nicht reichen, das ist sicher. Deswegen gibt es `etwas anderes …` als Freitext. In Fassung 2 stand dort sinngemäß „wenn es dreimal auftaucht, fällt es auf" — und dein Einwand ist berechtigt: **auffallen soll es nicht mir, sondern der App.** Das geht vollständig ohne Sprachmodell, und zwar so:

```
1  normalisieren   klein, Umlaute auflösen, Satzzeichen weg,
                   Endungen kappen  →  „zu Holzig!" · „holzige"  →  holzig
2  zählen          je normalisiertem Begriff, über alle Shots
3  schwelle        ab 3 Vorkommen  →  offene Beobachtung
4  vorlegen        gesammelt in den Einstellungen, nicht als Störung
                   mitten im Shot
```

Schritt 1 ist bewusst grob. Ein richtiger Stemmer wäre Overengineering für einen Wortschatz von vielleicht dreißig Begriffen; das Kappen von Endungen fängt „holzig / holzige / holziger" zuverlässig ein, und was es nicht fängt, siehst du in der Liste nebeneinander und fasst es mit einem Tap zusammen.

Die eigentliche Frage ist deine: *was passiert dann damit?* Drei Wege, aufsteigend nach Aufwand — und ich schlage vor, sie in genau dieser Reihenfolge zu bauen:

#### a · Chip in der App anlegen  ·  *Paket 04 · sofort*

Symptome sind eine Tabelle, kein Code. Aus einer offenen Beobachtung wird mit einem Tap ein eigener Chip, der ab sofort in der Auswahl steht — und die App hängt ihn rückwirkend an die Shots, aus denen er entstanden ist. Kostet fast nichts, weil das Datenmodell es ohnehin hergibt. **Ehrlicherweise dazu:** ein selbst angelegter Chip ist zunächst nur ein Etikett. Er wird sauber erfasst und ausgewertet, aber er erzeugt keine Diagnose — dafür braucht es Weg b.

#### b · Regel dazu bauen  ·  *Paket 04 · klein halten*

Ein Chip wird nützlich, wenn ein Vorschlag daran hängt. Der Regeleditor darf deshalb genau drei Felder haben — *welcher Parameter*, *in welche Richtung*, *wie viele Schritte*. Also: „holzig + deutlich → KT, runter, 2". Mehr nicht. Alles darüber hinaus wäre eine Programmiersprache in einem Formular, und dann ist Weg c besser.

#### c · Werkstattbericht exportieren  ·  *Paket 04 · fällt nebenbei ab*

Ein Tap erzeugt einen fertigen Textblock: die offenen Begriffe mit Häufigkeit, die zugehörigen Shots mit Parametern und Urteil, dein aktueller Chip- und Regelbestand. Den wirfst du in einen Claude-Chat und bekommst einen Regelvorschlag zurück, den du über Weg b einträgst. **Das kostet nichts**, weil es derselbe Kontext-Baukasten ist, der für die LLM-Naht ohnehin gebaut wird — hier nur anders gefiltert.

> **Was ich dabei nicht verspreche**
>
> Freitext gibt es nur bei *daneben*, und das ist selten. Bis ein Begriff dreimal steht, können Monate vergehen. Die Automatik ist deshalb kein Motor, sondern ein Sicherheitsnetz: sie stellt sicher, dass dir nichts entgeht, ersetzt aber nicht dein Gefühl dafür, dass ein Chip fehlt. Genau deshalb ist Weg c der wichtigere von den dreien — er funktioniert auch bei *einem* Vorkommen, wenn du es selbst bemerkst.

> **Bildschirm-Skizze**
>
> **Einstellungen · Offene Beobachtungen**
>
> **„holzig" · 4 × seit Mai**
>
> Shots 31, 34, 39, 42 — alle Espresso Entcoffeiniert, alle bei KT 121. **[Als Chip anlegen]** [Zusammenfassen mit …] [Bericht] *[ignorieren]*

Dieselbe Mechanik läuft über den Aroma-Freitext im Tasting. Ein *ignorieren* ist endgültig und zählt den Begriff nicht mehr — sonst fragt die App ewig nach.

#### Die Regeln dahinter

| Auswahl | Diagnose | Vorschlag |
| --- | --- | --- |
| zu sauer + dünn + lief zu schnell | Unterextraktion | Mahlgrad feiner, Schrittweite nach Stärke |
| zu sauer + salzig | starke Unterextraktion | deutlich feiner, KT +1 |
| zu bitter + adstringent + lief zu langsam | Überextraktion | Mahlgrad gröber, KT prüfen |
| flach, sonst nichts auffällig | Extraktion ok, Konzentration zu niedrig | Output −2 g oder Input +0,5 g |
| ungleichmäßig | Verteilung / Channeling | Puck-Prep, WDT — **kein** Mahlgradwechsel |
| brandig + zu stark | KT zu hoch für diese Röstung | KT −1 bis −2, Mahlgrad lassen |
| läuft schneller als die eigene Historie, Urteil ok | Drift oder neue Charge | einen Schritt feiner — als Alltagskorrektur, nicht als Dial-in |

Die letzte Zeile ist die Brücke zwischen beiden Modi: Sie feuert ohne dass du etwas meldest, allein weil die App die Laufzeit dieses Profils über Wochen kennt.

#### Die Totzonen-Karte K40

Das ist der Teil, der aus *deinen* Daten kommt. Die App kennt für jeden Kaffee alle bisher gefahrenen Mahlgrade samt Urteil. Bereiche, die mehrfach schlecht abschnitten, werden markiert — und nicht mehr vorgeschlagen.

> **Aus deinem Log · Espresso Entcoffeiniert**
>
> Du hast den Bereich **MG 3,75–3,90** dreimal getestet: Shot 4, Shot 7, Shot 12. Ergebnisse: *„aromatisch flach"*, *„toter Bereich bestätigt"*, *„Röstaromen dominant, Aroma 4/10"*. Die Erkenntnis steht heute als Fließtext im Feld `Erkenntnisse` — die App kann damit nichts anfangen. Mit strukturierten Shots hätte sie den toten Bereich nach Shot 7 selbst erkannt und dir Shot 12 erspart.

Gezeichnet wird das nicht als eigene Karte, sondern als **ein schraffierter Streifen in der Verlaufskurve** K40. Die Kurve trägt ohnehin schon Mahlgrad und Urteil über die Zeit; ein toter Bereich ist dort kein zweites Bild, sondern ein Band, durch das die Linie nicht mehr laufen soll. Was er bedeutet, steht als Satz darunter, nicht als Legende daneben.

Dazu die zweite Störgröße aus deinem Log: **die Charge.** Dreimal steht sinngemäß „neue Packung, läuft schneller". Mit Röstdatum und Chargennummer am Kaffee kann die App beim Wechsel von sich aus sagen: *„Neue Charge — die letzten beiden Male lief sie 4–6 s schneller. Starte einen Schritt feiner."*

## Warum kein Timer

Du hast gefragt, ob ich das noch mal beleuchte. Ergebnis: **der Timer fliegt raus, und zwar ganz — nicht als abschaltbare Option.**

Die Begründung ist nicht Geschmack, sondern dass er in deinem Ablauf keine Aufgabe hat. Am Siebträger fährst du nach Auswaage; die Zeit liest du an der Maschine ab und trägst sie als Ergebnis nach. Beim Pour Over ist die Zeit tatsächlich die Führungsgröße — aber sie steht auf der Waage, direkt neben dem Gewicht, das du ohnehin ansiehst. Ein zweites Gerät mit derselben Zahl auf einem Display, das ich erst entsperren muss, macht den Ablauf schlechter statt besser.

Dazu kommt das, was du über Bestellungen gesagt hast und was ich ernst nehme: **eine mitlaufende Uhr erzeugt Druck.** Bei einem Countdown, der sichtbar abläuft, arbeitest du gegen die App statt mit ihr. Genau das ist die Sorte Overengineering, die dazu führt, dass eine App nach drei Wochen nicht mehr aufgemacht wird.

Ein optionaler Schalter in den Setups wäre der bequeme Kompromiss, aber der falsche: Er müsste gebaut, gestaltet, getestet und dokumentiert werden, für eine Funktion, die nach deiner eigenen Beschreibung ausgeschaltet bliebe. Wenn sich das im Betrieb ändert — beim Pour Over ist es am ehesten denkbar — bauen wir ihn dann. Das Datenmodell hindert daran nichts.

> **Was an seine Stelle tritt**
>
> Zeit erscheint an genau zwei Stellen: als **Ergebniswert** im Shot, den du nach dem Bezug einträgst — und als **Vorabschätzung** einer Bestellung, bevor sie losgeht. Beide sind Zahlen zum Ansehen, keine Zahlen, die laufen.

## Pour Over: der Gussplan

Espresso ist eine Parameterzeile. Pour Over ist eine Abfolge — und du fährst inzwischen auch die Drehzahl passend dazu. Beides braucht eine Form, die flexibel genug ist und trotzdem in zehn Sekunden zu lesen.

Bisher stand im Modell nur `aufguss[]` als Platzhalter. Deine Anmerkung macht daraus eine eigene Struktur, und du hast die Anforderung selbst formuliert: *praktikabel, flexibel — aber vor allem intuitiv und einfach.* Drei Wege dorthin:

#### Freitext

Ein Textfeld pro Profil, du schreibst rein, was du machst. Maximal flexibel, null Aufwand, sofort da. Der Preis: nichts davon ist auswertbar. Die Frage *„fahre ich bei den Naturals eigentlich anderen Bloom als bei den Washed?"* bleibt für immer unbeantwortbar, weil es keine Felder gibt, über die man sie stellen könnte. Und die Zielsetzung der ganzen App ist, genau solche Fragen beantwortbar zu machen.

#### Striktes Formular

Feste Felder: Bloom-Menge, Bloom-Dauer, Anzahl Güsse, Menge je Guss. Perfekt auswertbar, schnell auszufüllen — und zu eng, sobald du etwas machst, das nicht vorgesehen war. Ein Rezept mit Bypass oder einem zweiten Rao Spin passt nicht rein, und dann schreibst du es doch wieder in ein Notizfeld daneben. Damit hat man beide Nachteile.

#### Bausteine mit Notizzeile  ·  *Empfehlung*

Ein Plan ist eine **Liste aus typisierten Schritten**. Jeder Baustein hat wenige, klar benannte Felder — und zusätzlich eine freie Zeile für das, was kein Feld abdeckt. Damit ist das Gerüst auswertbar und der Rest trotzdem sagbar. Neue Bausteine kommen später dazu, ohne dass alte Pläne ungültig werden.

**Und es ist kein Neubau:** dein Notion-Format `[50g | 30s] Bloom: Beschreibung` ist bereits genau das — Menge, Dauer, Rolle, Freitext. Die Migration ist eine Übersetzung, keine Neueingabe.

#### Die Bausteine

Recherchiert entlang dessen, was in der Pour-Over-Praxis tatsächlich als eigene Handlung beschrieben wird — und bewusst kurz gehalten. Sechs Typen decken praktisch jedes veröffentlichte Rezept ab:

| Baustein | Felder | Wofür |
| --- | --- | --- |
| **Vorbereiten** | Filter spülen ja/nein · Gefäß vorwärmen ja/nein | Einmal am Anfang. Zählt nicht zum Brühwasser. |
| **Bloom** | Menge (absolut oder × Input) · Dauer | Entgasen und gleichmäßig durchfeuchten. In fast jedem Rezept der erste Schritt. |
| **Guss** | Zielmenge · Dauer *oder* Gießgeschwindigkeit · Muster · Temperatur abweichend? | Der Arbeitsbaustein. Mehrfach hintereinander ergibt Pulse-Pouring, einmal groß ergibt einen kontinuierlichen Guss. |
| **Agitation** | Art: Schwenken · Rao Spin · Rühren · Klopfen | Eigener Schritt, weil er eigene Wirkung und eigene Risiken hat — nicht als Häkchen am Guss versteckt. |
| **Warten** | bis Menge durchgelaufen *oder* feste Dauer | Drawdown. Die Stelle, an der der Plan auf die Realität wartet. |
| **Bypass** | Menge · Temperatur | Wasser nach dem Brühen zugeben. Selten, aber wenn es fehlt, ist das Modell falsch. |

Beim *Muster* reichen drei Werte, die tatsächlich unterscheidbar sind: **Zentrum**, **Spirale**, **außen halten**. Feiner wird es nicht, weil feiner nicht mehr reproduzierbar ist — und alles, was du zusätzlich sagen willst, geht in die Notizzeile.

#### Zwei Kleinigkeiten, die den Unterschied machen

- **Kumulativ oder je Guss — umschaltbar.** Manche Rezepte sagen „gieße auf 150 g", andere „gib 50 g dazu". Wenn die App nur eine Konvention kennt, rechnest du beim Abtippen jedes fremden Rezepts im Kopf um, und genau dort passieren Fehler. Ein Schalter über der Liste zeigt dieselben Bausteine in beiden Lesarten. Gespeichert wird intern nur eine.
- **Die Summe steht immer da.** Über der Liste: Input, Gesamtwasser, Verhältnis — mitlaufend berechnet. Damit merkst du beim Tippen, wenn ein Guss zu groß geraten ist, statt es an der Waage zu merken.

> **Bildschirm-Skizze**
>
> **Gussplan · V60 02 · 18 g · 300 g · 1:16,7**
>
> **Vorbereiten**
>
> Filter spülen · Kanne vorwärmen
>
> **Bloom · 50 g · 30 s**
>
> bis alles feucht ist, dann schwenken
>
> **Agitation · Schwenken**
>
> sanft, nur bis der Kuchen flach liegt
>
> **Guss · auf 150 g · Spirale · 30 s**
>
> **Guss · auf 300 g · Zentrum · 30 s**
>
> am Ende außen nachziehen
>
> **Agitation · Rao Spin**
>
> **Warten**
>
> bis durchgelaufen — Ziel gesamt 2:45
>
> *[+ Guss]* · *[+ Agitation]* · *[+ Warten]* · *[+ Bypass]*

*Sieben Zeilen, jede in einem Blick lesbar. Ein neuer Plan startet mit Bloom + zwei Güssen + Warten — das ist für die meisten Fälle schon fertig und kostet keinen Tap.*

#### Wie der Editor sich bedient K16 K39 K44

Die Bausteinliste ist dasselbe Muster wie die Rüstzeiten, und die Gestaltung hat vier Dinge daran festgelegt:

- **Die App ordnet immer vor, Ziehen ist trotzdem jederzeit möglich.** Nicht entweder-oder: eine sinnvolle Reihenfolge steht sofort da, und wer sie ändern will, zieht. Der Griff sitzt rechts, am Daumen; die ganze Zeile ist Ziehfläche.
- **Zeilen sind Felder, nicht Text.** Sie sehen tippbar aus, weil sie es sind. Die Summen — Input, Gesamtwasser, Verhältnis — laufen ruhig darüber mit.
- **Bearbeiten und Löschen im Blatt am unteren Rand**, immer am Daumen erreichbar. **Keine Wischgeste**: einen Gussplan-Schritt versehentlich wegzuwischen ist genau die Sorte Verlust, die man erst mitten im Aufguss bemerkt.
- **Der Lesart-Umschalter** zwischen *„auf 360 g"* und *„+ 50 g"* ist dasselbe Bauteil wie der Umschalter zwischen den Aromensets: zwei gleich große Felder, zwei Wörter. Er wechselt die Sprache derselben Daten, nicht ihren Umfang — gespeichert wird eine Lesart.

> **Korrektur gegenüber Fassung 3**
>
> In Fassung 3 stand hier ein Abschnitt *„Die Drehzahl gehört dazu"*, der RPM und Gussplan zu einem Paar erklärt hat. **Das war falsch**, und du hast es klar gesagt: die Drehzahl hat mit dem Gießen nichts zu tun. Sie steht deshalb nicht mehr in diesem Abschnitt, sondern im nächsten — beim Mahlen, wo sie hingehört.

## Die Drehzahl

Du hast mir die Einordnung überlassen. Hier ist sie — und sie hat genau eine Konsequenz, die etwas kostet.

**RPM ist eine zweite Mahlachse.** Sie sitzt neben dem Mahlgrad, nicht neben dem Gussplan. Was sie verändert, ist die Partikelverteilung bei *gleicher* Mahlgradeinstellung — vor allem der Feinanteil und die Breite der Verteilung. Ob das Wasser danach durch einen Puck gepresst oder über einen Filterkuchen gegossen wird, ist ihr gleichgültig.

Dass du am Pour Over eine andere Drehzahl fährst als am Siebträger, passt genau dazu: **nicht der Aufguss verlangt eine andere Drehzahl, sondern das andere Mahlbild.** Espresso und Filter wollen unterschiedliche Verteilungen, und die Drehzahl ist neben dem Mahlgrad der zweite Hebel dafür. Im Modell ändert sich dadurch nichts — `rpm` stand immer schon in `Profil.ziel`, direkt neben `mg`. Da ist es richtig.

> **Die Konsequenz, die tatsächlich etwas ändert**
>
> Weil Drehzahl und Mahlgrad *zusammen* das Mahlbild ergeben, gilt eine Dial-in-Erkenntnis immer nur für das Paar aus beiden. Konkret: die **Totzonen-Karte ist je Drehzahl gültig.** Dein toter Bereich MG 3,75–3,90 gilt bei 1200 rpm — bei 900 rpm ist er womöglich ein anderer, und die App darf ihn dort nicht als bekannt behandeln.
>
> Deshalb behandelt sie eine Drehzahländerung innerhalb eines Profils wie eine dial-in-relevante Änderung: sie sagt *„Drehzahl geändert — die Mahlgrad-Historie dieses Profils gilt dafür nicht"* statt stillschweigend weiterzuvergleichen. Das ist kein Umbau, sondern eine Zeile in der Auswertung — aber ohne sie würde die App irgendwann eine Erkenntnis behaupten, die sie nicht hat.

Praktisch trifft dich das selten, weil Espresso und Pour Over ohnehin verschiedene Profile sind und die Trennung dort von selbst passiert. Relevant wird es nur, wenn du *innerhalb* des Espresso an der Drehzahl drehst — und genau dann ist der Hinweis das, was du willst.

> **Wo ich bewusst nichts behaupte**
>
> Die Sculptor-Serie erlaubt etwa 800–1400 rpm, und die Drehzahl verändert bei gleichem Mahlgrad die Partikelverteilung — so weit ist es unstrittig. **In welche Richtung, ist es nicht:** für die 078S wird berichtet, dass niedrigere Drehzahl *mehr* Feinanteil erzeugt, für die 078 mit anderem Mahlwerk das Gegenteil. Welche Richtung für deine 076S gilt, weiß ich nicht — und ich baue keine Regel, die es behauptet.
>
> Stattdessen: die App loggt RPM wie jeden anderen Parameter und zeigt dir irgendwann *deine* Korrelation — „bei 900 rpm lief derselbe Mahlgrad im Schnitt 12 s länger durch". Das ist langsamer als eine eingebaute Regel, aber es ist wahr. Wenn sich aus deinen Daten eine klare Richtung ergibt, wird daraus ein Vorschlag — dann aber mit deiner Historie als Beleg.

#### Und wenn keine Drehzahl da ist

Weil der Pour Over eventuell auf die K6 wandert: **eine Handmühle hat keine Drehzahl**, und ein leeres RPM-Feld im Profil wäre kein Zustand, sondern eine offene Frage. Das Feld erscheint deshalb nur, wenn die gebundene Mühle es hat — das steuert `Muehle.rpmEinstellbar`, das im Modell bereits vorgesehen ist.

Der zweite Teil davon ist wichtiger: derselbe Kaffee kann dann **zwei Pour-Over-Profile** haben, eines an der Sculptor und eines an der K6. Deren Mahlgrade sind nicht ineinander umrechenbar — 3,7 und 65 Klicks sind verschiedene Welten. Das ist exakt Befund 2, und die Setup-Bindung löst ihn hier ein zweites Mal: die App vergleicht die beiden Profile nie miteinander, sondern jedes mit seiner eigenen Historie.

## Die Bestellung

Das interessanteste Problem der App — und die Gestaltung hat es anders beantwortet, als dieses Konzept es fünf Fassungen lang beschrieben hatte.

> **Was hier gestrichen ist K48**
>
> Bis Fassung 7 stand an dieser Stelle ein Ressourcenplan: vier Spuren für Mühle, Brühgruppe, Dampflanze und dich, ein Ablaufdiagramm, Rüstzeiten mit Phasen und Bündeln, benannte Standzeiten, eine Regel „Standzeit benennen". **Nichts davon erscheint in der Oberfläche.** Keine Ressourcen, keine Rüstzeiten, keine Standzeiten, kein Aufräumen als Position.
>
> Der Grund ist nicht, dass die Rechnung falsch war — sie stimmt und sie bleibt. Der Grund ist, dass sie *dir* nichts sagt, während du an der Maschine stehst. Eine Spur für die Dampflanze beantwortet keine Frage, die du in dem Moment hast. Du willst wissen, was als Nächstes dran ist.

Was bleibt, ist das Rechenmodell dahinter. Die Rüstzeiten tragen weiterhin die **geschätzte Dauer**, und die Bündelung entscheidet weiterhin, wie viele Bezüge eine Bestellung braucht. Beides ist Physik deiner Küche und ändert sich nicht dadurch, dass es niemand anschaut: zwei Cappuccino mit derselben Bohne kommen aus einem Bezug, mit verschiedenen Bohnen aus zweien, und das ist ein Unterschied von Minuten. Die App rechnet ihn — sie erzählt ihn nur nicht mehr.

#### Der Durchgang K18 K19 K20

An die Stelle der Handgriffe tritt ein einziger Begriff. Ein **Durchgang ist, was ein Gerät in einem Zug bedient**: ein Shot oder ein Aufguss, dazu ein bis drei Getränke, jedes mit eigener Person.

Das ist mehr als eine Umbenennung. Der Durchgang ist die Ebene, auf der man in der Küche tatsächlich denkt — nicht „Position 3 von 5", sondern „diesen Bezug, und daraus werden zwei Cappuccino". Damit ist der geteilte Doppelsieb-Bezug kein Sonderfall mehr, den ein Feld am Shot abbildet, sondern der Normalfall des Modells.

> **Die Regel, die daraus folgt**
>
> Ein zweites Getränk kommt nur in denselben Durchgang, wenn es **denselben Shot und dieselbe Bohne** braucht. Ein Bohnenwechsel ist damit definitionsgemäß ein neuer Durchgang — und die Frage, ob gebündelt werden darf, stellt sich nie, weil sie in der Struktur schon beantwortet ist.

#### Aufnehmen K14 K25 K28 K45 K46

Person, Getränk, Koffein, Bohne — in dieser Reihenfolge, und die Reihenfolge ist der Punkt.

- **Person** steht als Feld mit „wechseln". Standard ist Julian, überall umstellbar. Die Liste sortiert sich nach Historie und zeigt *keine Zahlen* — wer oben steht, steht oben, das reicht. Eine Suchzeile legt neue Personen direkt an; mehr als vier Namen braucht die Liste nie.
- **Getränk** als Rangliste ohne Score, in der Reihenfolge dieser Person. Es bringt seine Zubereitung mit.
- **Koffein vor der Bohne** K45 — und das ist die eigentliche Änderung. Bisher war Koffein eine Rückfrage *nach* dem Bohnenvorschlag, die den Vorschlag im Zweifel wieder umwarf. Jetzt ist es ein Filter davor: erst entscheidet sich koffeinhaltig oder nicht, dann wird gezeigt, was übrig bleibt. Die Frage entfällt ganz, wenn die Historie eindeutig ist.
- **Bohne als Schnittmenge** K46 aus *geeignet für* × Koffein × aktiv. Die Kopfzeile nennt den Filter — *„Bohne · 3 von 8"* — damit sichtbar ist, dass gefiltert wurde und nicht etwa fünf Bohnen fehlen.

Aufgenommene Positionen liegen in einer Falte oben und bleiben änderbar: Getränk, Bohne und Person K60. Jede Änderung lässt den Plan neu rechnen.

#### Der Plan K47 K42

Vier Dinge, mehr nicht:

1. Die **geschätzte Dauer** als großer Wert — mit Tilde, gedämpft, gestricheltem Ring und Einheit. Eine Schätzung, die aussieht wie eine.
2. Die **Bezüge** als Zeilen, *alle zugeklappt*. Aufklappen zeigt die Aufteilung und bietet „auftrennen" an.
3. Der **Verschnitt** als Angebot, nicht als Warnung.
4. „Abarbeiten".

**Keine Ansagen.** Kein „500er Kännchen nehmen", keine Standzeit, kein „Espresso zuletzt", keine Rückfrage nach der Bohne. Fassung 6 hatte für diese Ansagen argumentiert — *„eine App, die das verschweigt, verliert dein Vertrauen beim ersten lauwarmen Cappuccino."* Am Bild hat sich das Gegenteil gezeigt: ein Plan, der bei jeder Bestellung drei Hinweise gibt, wird nach einer Woche überblättert, und dann geht auch der Hinweis unter, der zählt.

> **Was aus „ehrlich statt glatt" geworden ist**
>
> Das Prinzip bleibt, es verengt sich. Ehrlichkeit heißt jetzt: **die App behauptet keine Genauigkeit, die sie nicht hat** — geschätzte Dauer als Schätzung gezeichnet, Herkunftszeichen an jedem Wert, Verschnitt offen ausgewiesen. Sie erklärt nicht mehr ungefragt ihren eigenen Ablauf. Der Weg dorthin war schon in Fassung 4 angelegt, als die Standzeit-Warnung bei Milchgetränken entfiel, weil sie folgenlos war.

#### Verschnitt K59 K21

Bleibt bei ungerader Anzahl ein halber Bezug übrig, führt das Angebot in ein Blatt mit drei Wegen — und der mittlere ist neu:

| Weg | Was passiert | Urteil |
| --- | --- | --- |
| **Extra Shot** | Modifikator an einer bestehenden Position; die Ausgleichszutat wird um seine Menge reduziert | kein eigenes |
| **Eigene Position** | vollwertig, mit Person und Getränk — der halbe Bezug wird ein zweites Getränk | eigenes |
| **Verwerfen** | der Rest geht in den Ausguss, der Verschnitt wird mitgerechnet | — |

Der zweite Weg fehlte bisher. Er ist der naheliegendste von allen: wenn ohnehin ein halber Bezug übrig ist und jemand danebensteht, wird daraus ein Getränk und keine Zugabe.

Angeboten wird das **am Fuß des Plans, nicht als Warnung** K21 K42: eine ruhige Zeile in Feldhöhe, *„Double Shot sinnvoll verwenden"*. Sie steht nur da, solange etwas zu holen ist — sobald der halbe Bezug verbraucht oder der Wert von Hand überschrieben ist, verschwindet sie ersatzlos. Kein Ausrufezeichen, keine Farbe, keine zweite Rückfrage.

#### Abarbeiten K2 K22 K37 K48 K49

Eine Fläche je Durchgang, in derselben Form wie der Alltagspfad: Ziel im Gruppenkopf, Führungswert groß, die Einstellwerte darunter. Ein Ring am Wert heißt *noch das Ziel*, ein gefüllter Punkt heißt *überschrieben*. Darunter liegt „danach" als ruhige Liste, oben die Falte mit dem Erledigten. Am Fuß steht *weiter · <nächster>*.

**Abgehakt wird nur auf Durchgangs- und Positionsebene** K2 K37. Handgriffe hakt niemand ab — sie sind Modell, keine Oberfläche. Kommt mitten in der Bestellung eine Position dazu, wird alles Offene neu geplant; Erledigtes bleibt stehen K49.

> **Kein Urteil in der Bestellung K57 K58 K50**
>
> Der größte Verzicht. Fassung 7 endete die Bestellung mit einem Personengitter, in dem man für jede Tasse ein Urteil abgeben konnte. Das ist weg — es gibt **keinen Abschluss-Bildschirm** und kein Gitter. Bewertet wird ausschließlich über die Historie, am einzelnen Shot.
>
> Der Grund liegt in der Situation: Wenn die Bestellung fertig ist, stehen fünf Getränke auf dem Tresen und Leute warten. Das ist der schlechteste denkbare Moment für ein Urteil — man tippt irgendetwas, damit der Bildschirm weggeht. Ein Urteil, das später am Shot entsteht, ist eines, das etwas wert ist. Der Begriff heißt übrigens durchgehend **Bestellung**, nicht „Runde".

#### Was der Planer weiterhin rechnet

Unsichtbar, aber vorhanden:

| Regel | Wofür sie noch da ist |
| --- | --- |
| Bezüge bündeln | Je zwei Halb-Bezug-Getränke mit derselben Bohne und demselben Profil teilen sich einen Bezug; eines übrig ergibt Verschnitt. Bestimmt die Zahl der Durchgänge. |
| Mühlenwechsel minimieren | Bestimmt die Reihenfolge der Durchgänge und den größten Teil der geschätzten Dauer. |
| Empfindlichstes zuletzt | Espresso pur verfällt am schnellsten. Wirkt auf die Reihenfolge, wird aber nicht mehr begründet. |
| Lange Pole zuerst | Pour Over und Moka sind überwiegend Wartezeit an einer Ressource, die sonst nichts blockiert. |
| Kännchen wählen | Wird gerechnet, damit die Dauer stimmt — aber nicht mehr angesagt. |

## Die Verkostung

Der Bogen hängt am Shot, ist im Alltagspfad unsichtbar und wird über Historie oder Dial-in erreicht. Die Gestaltung hat aus zwei Sorten von Skala eine Form gemacht — und damit die Begründung von Fassung 6 eingelöst, statt sie zu erklären.

Der ursprüngliche Einwand steht unverändert: Säure kann gleichzeitig gut oder schlecht und intensiv oder flach sein. Ein Wert von eins bis zehn kann das nicht. Die Antwort war, für jede Größe die richtige Art von Skala zu wählen — bipolar mit Zielmitte für Säure, Bitterkeit und Körper, einseitig steigend für Aroma-Intensität, Süße und Nachklang.

> **Die Treppe K52**
>
> Beide Arten bekommen dieselbe Form: fünf Stäbe, deren **Höhe die Entfernung vom Ziel** zeigt. Bei den bipolaren Größen liegt die Mitte am niedrigsten und die Ränder stehen hoch — die Form ist eine Mulde. Bei den einseitigen steigt sie gleichmäßig nach rechts. Gefüllt wird von der Mitte bis zur Wahl beziehungsweise von links bis zur Wahl.
>
> Damit *sieht* man den Unterschied zwischen „Mitte ist Ziel" und „mehr ist mehr", statt ihn erklärt zu bekommen. Die Art steht nur noch als kleine Angabe im Kopf. Und weil die Form die Arbeit macht, brauchen die sechs Größen keine Gruppen mehr: **sie stehen gleichrangig untereinander.** Die Trennung in „Achsen" und „Skalen" war eine Sortierhilfe für den Autor dieses Konzepts, kein Gewinn für den, der den Bogen ausfüllt.

| Größe | Art | Die fünf Wörter |
| --- | --- | --- |
| Säure | bipolar | flach · zurückhaltend · **saftig** · lebhaft · spitz |
| Körper | bipolar | wässrig · schlank · **rund** · satt · schwer |
| Bitterkeit | bipolar | fehlt · **dezent** · präsent · kräftig · beißend |
| Aroma-Intensität | einseitig | kaum · verhalten · klar · ausgeprägt · intensiv |
| Süße | einseitig | keine · angedeutet · spürbar · deutlich · üppig |
| Nachklang | einseitig | weg · kurz · trägt · lang · sehr lang |

Fünf benannte Stufen, keine zehn — die Begründung von Fassung 6 gilt weiter: niemand unterscheidet zuverlässig eine Sechs von einer Sieben, und derselbe Kaffee bekäme an zwei Tagen zwei Zahlen, die die Auswertung als Signal läse. *Abgang* heißt weiterhin **Nachklang**, weil gefragt ist, wie lange er bleibt, nicht wie gut das Ende war.

#### Auffälligkeiten — jetzt mit Stärke K53

Defekte haben keine sinnvolle Zwischenstufe, hieß es in Fassung 6: papierig ist papierig, nicht „Papier 6 von 10". **Das war zu absolut.** Zwischen einem Hauch Papier und einem Kaffee, der ungenießbar ist, liegt genau der Unterschied, der zählt — und er entscheidet, ob man etwas ändert.

Die Chips tragen die Stärke deshalb in sich: ein Tippen öffnet *leicht* und *deutlich*, die Wahl klappt zu, und der Chip heißt danach **„deutlich papierig"**. Ein zweites Tippen öffnet die Stärke erneut, ein drittes nimmt zurück. Kein zweiter Regler, keine zweite Zeile — die Stärke sitzt am Befund, wo sie hingehört K1. Dieselbe Mechanik trägt die Symptome in der Diagnostik.

#### Was gerechnet wird K38 K54

Balance, Komplexität und Gesamteindruck werden nicht gefragt. Sie stehen am Ende des Bogens auf einer ruhigen Fläche:

- **Balance** aus dem mittleren Abstand der drei bipolaren Größen zu ihrer Mitte.
- **Komplexität** aus der Zahl der gefundenen Aromen.
- **Gesamt** aus dem Shot-Urteil — *daneben · okay · sehr gut · Referenz*. Es gibt keine zweite Note.

Ein gerechneter Wert braucht dafür **kein eigenes Herkunftszeichen**. Er trägt den gefüllten Punkt wie ein gemessener, weil er genau so sicher ist wie seine Eingaben. Ein viertes Zeichen hätte eine Unsicherheit behauptet, die es nicht gibt — es bleibt bei dreien: gefüllt für gemessen oder gerechnet, Ring für übernommen, gestrichelter Ring für geschätzt.

#### Aromen K36 K39 K55

Drill-down über drei Ebenen, kein radiales Rad — die Entscheidung aus Fassung 3 hat sich am Bild bestätigt. Neu ist, wie Le Nez du Café hineinpasst.

> **Das Rückgrat-Konstrukt entfällt**
>
> Fassung 3 hatte zwei getrennte Aromensets vorgesehen — das Flavor Wheel als „Rückgrat", Le Nez daneben, jeder Le-Nez-Eintrag mit einem Verweis auf den nächstliegenden Knoten im Rad, damit die Historie zusammenbleibt. Das war eine Übersetzung zwischen zwei Sprachen, und sie war unnötig.
>
> **Le Nez lebt in denselben neun SCA-Kategorien** K55. Es gibt keine zwei Ordnungen, sondern eine mit zwei Beschriftungen. Die Fläschchennummer steht in einer festen Spalte daneben — sie ist der eigentliche Gewinn des Koffers, weil sie nachprüfbar macht, was du gerochen hast. Kein Radverweis im Bild; die Zuordnung liegt im Hintergrund und hält die Historie zusammen, ohne sie zu erklären.

Der Umschalter zwischen beiden Sets ist derselbe wie im Gussplan-Editor: zwei gleich große Felder, zwei Wörter K39. Er wechselt die *Sprache* derselben Daten, nicht ihren Umfang. Und keine Farbcodierung K36 — ein Akzent bleibt ein Akzent, auch im Aromarad.

Zur Größe des Koffers: **60 Aromen** in der großen Ausgabe, 36 in der „Révélation". Die Nummern und ihre Kategoriezuordnung lieferst du beim Bauen; die Zahlen in den Entwürfen sind Beispiele.

#### Der Weg durch den Bogen

Der Kopf nennt den Shot — *„Dial-in, Shot 3 von 5"*. Das ist kein Schmuck: im Dial-in wird der Bogen mehrfach ausgefüllt, und **dass am Ende keine Auffälligkeit mehr steht, ist das Ergebnis.** Dann in dieser Reihenfolge:

1. Sechs Treppen
2. Auffälligkeiten als Chips mit Stärke
3. Aromen als Drill-down, Gewähltes sammelt sich am Fuß
4. Gerechnetes auf ruhiger Fläche
5. „Verkostung speichern"

> **Zwei Tiefen, unverändert**
>
> Der volle Bogen ist für echte Verkostungen. Für den Alltag reicht das Urteil aus der Shot-Erfassung — *daneben · okay · sehr gut · Referenz* — plus bei Bedarf die Symptom-Chips. Derselbe Datensatz, nur flacher gefüllt, und beides landet in derselben Auswertung. Ein voller Bogen, den du nach dem dritten Tag nicht mehr ausfüllst, wäre der eigentliche Verlust.

#### Übungsmodus  ·  *bestätigt · Paket 05*

Die App kennt die Fläschchennummern. Sie zieht eine Zufallsnummer, du tippst deinen Tipp, sie deckt auf — und führt die Trefferquote je Aroma fort. Damit übst du bevorzugt, was du zuletzt *nicht* getroffen hast, und es entsteht nebenbei eine ehrliche Auskunft darüber, welchen deiner Verkostungsnotizen du trauen kannst.

## Getränke

Neun zum Start — Cold Brew ist wieder dabei. Jedes ist eine Komposition aus Basis, Ergänzung, Gefäß, Mengen und Reihenfolge. Und keines davon steht im Code.

#### Deine Frage: Code oder Baukasten?

Du wolltest wissen, ob neue Getränke „übers Coding rein müssen" oder ob du sie in der App anlegen kannst. **Baukasten in der App**, und zwar ohne Zögern — aus drei Gründen, die alle in dieselbe Richtung zeigen.

Erstens ist ein Getränk in diesem Modell *reine Daten*. Es hat keine eigene Logik: keine Sonderfälle, keine Bedingungen, kein Verhalten. Ein Cappuccino unterscheidet sich von einem Flat White durch Zahlen und ein Wort — Milchmenge, Gefäßgröße, Textur. Was reine Daten sind, im Code festzuhalten, ist eine Entscheidung, die man nur bereut.

Zweitens ist der Aufwand fast keiner. Das Formular für „Getränk bearbeiten" muss ohnehin existieren, weil du Mengen und Gefäße pflegen willst. Ein *neues* Getränk anzulegen ist dasselbe Formular mit leeren Feldern — der Zusatzaufwand ist ein Knopf.

Drittens, und das ist der eigentliche Punkt: **jedes im Code festgeschriebene Getränk ist ein Grund, mich zu fragen.** Wenn du in zwei Jahren einen Cortado trinken willst, soll das dreißig Sekunden dauern und keine Session.

> **Wie es einfach bleibt, obwohl es alles kann**
>
> Der Fallstrick eines Baukastens ist, dass ein Formular, das jedes Getränk ausdrücken kann, für das simpelste Getränk zu groß wird. Die Lösung ist nicht weniger Felder, sondern ein besserer Startpunkt: **ein neues Getränk beginnt immer als Kopie eines vorhandenen.** „Wie Cappuccino, aber…" — dann sind es zwei Zahlen statt zwölf Feldern, und die Reihenfolge, das Gefäß und die Empfindlichkeit stimmen schon. Das ist auch die Art, wie man über Getränke tatsächlich denkt.

#### Die neun zum Start — mit Mengen

Du hattest recht, dass Milliliter fehlen. Ohne sie kann der Planer weder das Kännchen wählen noch prüfen, ob überhaupt alles ins Gefäß passt. **Die folgenden Zahlen sind Vorschläge von mir, keine Messungen von dir** — bitte einmal überfliegen und korrigieren, das ist einer der offenen Punkte unten.

| Getränk | Zubereitung | Basis | Milch | Gefäß | Mengen |
| --- | --- | --- | --- | --- | --- |
| Espresso | Siebträger | ganzer Bezug | — | 80 ml | 1 · 2 |
| Doppio | Siebträger | ganzer Bezug | — | 100 ml | 1 |
| Espresso Macchiato | Siebträger | halber Bezug | 30 ml | 80 ml | 1 · 2 |
| Cappuccino | Siebträger | halber Bezug | 130 ml | 180 ml | 1 · 2 |
| Latte Macchiato | Siebträger | halber Bezug | 220 ml | 300 ml | 1 · 2 |
| Long Black | Siebträger | ganzer Bezug | — | 200 ml | 1 |
| Pour Over | V60 · Gussplan | ein Aufguss | — | 350 ml | 1 · 2 |
| Moka | Bialetti 1er / 3er | eine Kanne | — | 60 / 130 ml | 1 · 3 |
| Cold Brew | aus dem Vorrat | einschenken | optional | 300 ml | 1 |

Die Milchspalte zeigt den Normalfall. Fest gespeichert ist aber nicht diese Menge, sondern die **Füllmenge** des fertigen Getränks — die Milch füllt auf, was der Kaffee übrig lässt. Warum das so herum besser ist, steht unten beim Extra Shot.

Zwei Spalten sind aus der Gestaltung dazugekommen. **Zubereitung** K46 ist die Rezeptseite der Kopplung zwischen Bohne und Getränk: das Getränk bringt mit, wie es gemacht wird, die Bohne weiß, wofür sie taugt. Die Bohnenliste in der Bestellung ist die Schnittmenge — das ersetzt `bestFit` als bloßen Vorschlag.

**Mengen** K8 stehen nicht am Getränk, sondern folgen aus dem Gerät: einmal geht immer, zweimal am Doppelsieb, dreimal an der 3er-Bialetti, Pour Over bis zwei Tassen. In der Bar sind das eigene Knöpfe je Zeile — der Getränkename öffnet das Getränk, die Knöpfe starten K14. Damit ist die häufigste Handlung ein Tap und keine Auswahl.

**Der Bezugsanteil ist die entscheidende Spalte** — an ihr hängt die Bündelungsregel. „Halber Bezug" heißt: zwei solche Getränke mit derselben Bohne teilen sich ein Doppelsieb. „Ganzer Bezug" heißt: das Getränk bekommt das Sieb allein.

> **Deine Antwort macht den Planer einfacher, nicht komplizierter**
>
> *„Im Zweifel wird Doppio bezogen und ein Shot weggeleert."* Damit ist die einzige wirklich blockierende Frage beantwortet — und zwar so, dass der Planer **nie fragen muss**. Die Regel lautet schlicht: *je zwei Halb-Bezug-Getränke mit derselben Bohne ergeben einen Bezug, ein übrig bleibendes ergibt ebenfalls einen — mit Verschnitt.* Kein Sonderfall, keine Rückfrage, keine Einstellung.
>
> Drei Cappuccino sind also zwei Bezüge und ein halber Shot in den Ausguss. Das ist keine Panne, sondern deine bewusste Entscheidung, und die App behandelt sie auch so: **sie warnt nicht, sie rechnet mit.**

Ein kleiner Nebeneffekt, der die Sache verdient: weil der Verschnitt im Modell steht, stimmt der **Bohnenverbrauch**. Wer nur Tassen zählt, unterschätzt bei ungerader Anzahl systematisch — bei einem Input von 18 g sind das 9 g pro Fall. Über eine Packung summiert sich das sichtbar, und die Frage *„wie weit komme ich mit 250 g?"* wird sonst dauerhaft falsch beantwortet. Der Planer zeigt es beiläufig mit: *„3 Cappuccino · 2 Bezüge · 9 g Verschnitt"*.

#### Der Extra Shot

Du willst einen klassischen Cappuccino wählen und optional einen Extra Shot dazunehmen. Die entscheidende Frage dabei ist nicht, *ob* das geht, sondern **wo es hingehört** — und die naheliegende Antwort ist die falsche.

#### Als eigenes Getränk

„Cappuccino" und „Cappuccino mit Extra Shot" als zwei Einträge. Funktioniert sofort, aber zerlegt alles, was auf Getränken aufbaut: der Ranking-Score teilt sich auf zwei Zeilen, Max' Favorit ist plötzlich mal das eine und mal das andere, und der Baukasten füllt sich mit Varianten desselben Getränks. Bei drei möglichen Zusätzen hättest du acht Cappuccino-Einträge.

#### Als Modifikator an der Bestellposition  ·  *Empfehlung*

Das Getränk bleibt ein Cappuccino. Der Extra Shot hängt an der *Position* in der Bestellung — also an der Entscheidung von heute, nicht an der Definition des Getränks. Max' Favorit bleibt „Cappuccino", der Ranking-Score bleibt einer, und der Extra Shot ist ein Tap beim Bestellen.

Im Modell ist das ein Feld an der Position. Bewusst als **Liste**, nicht als Ja-Nein-Schalter:

```
positionen[{ person→, getraenk→, kaffee→, koffein,
             modifikatoren[ 'extra-shot' ], … }]
```

Gebaut wird nur `extra-shot`. Die Liste kostet nichts und sorgt dafür, dass ein späteres *Hafermilch* oder *entkoffeinierter Extra Shot* ein Datensatz ist und kein Umbau. Das ist der einzige Zusatzaufwand, den ich hier eingehe — mehr Modifikatoren jetzt zu erfinden, wäre geraten statt gebraucht.

#### Was der Extra Shot mit der Bündelung macht

Hier wird es interessant, und zwar rechnerisch. Ein Cappuccino ist ein *halber* Bezug. Mit Extra Shot ist er ein **ganzer** — und damit verschwindet der Verschnitt:

| Runde | Bezüge | Verschnitt | Was der Planer sagt |
| --- | --- | --- | --- |
| 1 × Cappuccino | 1 | 9 g | *„Extra Shot dazu? Sonst geht ein halber Bezug weg."* |
| 1 × Cappuccino **+ Extra Shot** | 1 | — | nichts. Es passt auf |
| 2 × Cappuccino | 1 | — | gebündelt, wie gehabt |
| 3 × Cappuccino | 2 | 9 g | *„Auf einem ein Extra Shot? Dann bleibt nichts übrig."* |
| 2 × Cappuccino, einer **mit Extra Shot** | 2 | 9 g | unvermeidbar — 1½ Bezüge gibt es nicht |

Die letzte Zeile ist die ehrliche: der Extra Shot löst den Verschnitt nur bei *ungerader* Anzahl auf. Bei gerader Anzahl erzeugt er ihn sogar. Die App rechnet es aus und sagt es — sie redet dir den Extra Shot nicht ein, wenn er nichts spart.

#### Der Extra Shot verdrängt, er addiert nicht

Ein Extra Shot sind rund 20 g zusätzliche Flüssigkeit. In deiner 180-ml-Tasse konkurriert er direkt mit den 130 ml Milch. Ich hatte dafür eine Rückfrage vorgesehen — *„passt nicht, Milch reduzieren oder größere Tasse?"*. Deine Antwort ist besser und macht die Rückfrage überflüssig: **die Milch wird einfach um die Menge des Extra Shots reduziert.** Das Getränk bleibt gleich groß, nur das Verhältnis verschiebt sich — was ja genau der Punkt eines Extra Shots ist.

> **Die Konstante ist die Füllmenge, nicht die Milchmenge**
>
> Damit das nicht nur für den Extra Shot gilt, sondern immer, dreht sich eine Kleinigkeit im Modell um. Bisher stand die Milchmenge als feste Zahl am Getränk. Künftig ist die feste Zahl die **Füllmenge** — wie voll die Tasse am Ende ist — und die ausgleichende Zutat füllt auf, was der Kaffee übrig lässt:
>
> ```
> Milch  =  Füllmenge  −  Σ Shots
> ```
>
> Eingegeben wird trotzdem wie gehabt: du trägst 130 ml Milch ein, die App merkt sich daraus die Füllmenge von 150 ml. Der Weg für dich ändert sich also nicht — nur das, was konstant gehalten wird.
>
> Der Gewinn ist, dass derselbe Mechanismus auch alles andere abfängt: **änderst du den Output eines Profils von 40 auf 44 g, passt sich die Milch von selbst an.** Der Extra Shot ist dann kein Sonderfall mehr, sondern nur die größte Variante desselben Falls.

| Getränk | gleicht aus mit | Füllmenge | normal | mit Extra Shot |
| --- | --- | --- | --- | --- |
| Cappuccino | Milch | 150 ml | 130 ml Milch | 110 ml Milch |
| Latte Macchiato | Milch | 240 ml | 220 ml Milch | 200 ml Milch |
| Long Black | heißes Wasser | 160 ml | 120 ml Wasser | 100 ml Wasser |
| Espresso Macchiato | Milch | 50 ml | 30 ml Milch | **geht nicht** |
| Espresso · Doppio | — nichts | — | — | Tasse muss reichen |

Zwei Zeilen darin sind die interessanten. **Espresso Macchiato** hat nur 30 ml Milch — minus 20 blieben 10 ml, und das ist kein Macchiato mehr, sondern ein Espresso mit Tropfen. Jedes Getränk bekommt deshalb eine **Mindestmenge** für seine ausgleichende Zutat; wird sie unterschritten, bietet die App den Extra Shot dort gar nicht erst an. Genau hier lebt die Rückfrage weiter, die sonst überall entfällt — aber nur im Ausnahmefall, statt jedes Mal.

**Espresso und Doppio** haben nichts zum Ausgleichen. Dort wächst das Getränk tatsächlich, und die einzige Grenze ist das Tassenvolumen — 40 g plus 20 g in einer 80-ml-Tasse geht auf. Die Füllstands-Prüfung bleibt also im Modell, sie greift nur noch selten.

> **Eine Folge für den Planer**
>
> Weniger Milch je Tasse heißt auch: die Kännchenrechnung ändert sich mit. Zwei Cappuccino, einer davon mit Extra Shot, brauchen 130 + 110 = **240 ml** statt 260 — immer noch mehr als die 210 ml, die ins 350er passen, also bleibt es beim 500er. Bei drei Portionen kann so ein Extra Shot aber durchaus den Ausschlag geben. Die App rechnet es jedes Mal neu, statt die Ansage am Getränk festzuschreiben.

Zwei Kleinigkeiten noch, beide ohne Aufwand: Der Extra Shot **erbt Bohne und Koffein-Einstellung** der Position — sonst wären es zwei Fragen für einen Wunsch. Und weil er an der Position hängt, zählt derselbe Decay-Zähler wie bei der Koffein-Präferenz auch ihn mit: wer meistens einen Extra Shot nimmt, bekommt ihn vorbelegt. Dieselbe Mechanik, ein Feld mehr.

#### Cold Brew — wieder drin, aber an anderer Stelle

Ich hatte ihn in Fassung 2 gestrichen; du hast widersprochen, und das war richtig. Er passt allerdings nicht in dieselbe Form wie die anderen acht, und das ist der eigentlich interessante Teil:

- **Cold Brew ist kein Schritt in einer Bestellung, sondern ein Vorrat.** Zwölf bis achtzehn Stunden Ziehzeit lassen sich nicht choreografieren. Das Modell bekommt dafür `Ansatz`: angesetzt am, fertig ab, Menge, Rest. In der Bestellung ist Cold Brew dann das schnellste Getränk überhaupt — einschenken, zwanzig Sekunden.
- **Der Planer warnt, statt zu scheitern.** Ist kein Ansatz fertig, sagt die App das beim Aufnehmen der Bestellung — nicht mitten im Ablauf. Und wenn der Rest nicht für alle Positionen reicht, ebenfalls.
- **Die Zeitachse ist eine andere.** Espresso zählt Sekunden, Cold Brew Stunden. Velora löst genau das heute schon mit `zeitDisp` und `cbZeitDisp` — die neue App speichert intern immer Sekunden und formatiert nach Größenordnung. Ein Feld, keine Sonderfälle.
- **Und es bleibt beim „kein Timer".** Ein sechzehnstündiger Ansatz braucht keinen Countdown, sondern einen Zeitpunkt: *„fertig ab heute 18:40"*. Das ist konsistent mit der Timer-Entscheidung und nicht die Ausnahme davon.

Du hast gesagt, ich soll Standardwerte annehmen, weil du noch keine hast. Hier sind sie — **jeder einzelne ausdrücklich als Startwert, nicht als Empfehlung aus deiner Praxis:**

| Parameter | Startwert | Warum dieser |
| --- | --- | --- |
| Verhältnis | 1:15 | **Trinkfertig**, nicht als Konzentrat. Spart den Verdünnungsschritt und damit einen ganzen Bedienweg. Die Alternative 1:8 mit Verdünnen steht als zweiter Wert bereit |
| Ziehzeit | 16 h | Mitte des üblichen Bereichs. Passt außerdem zum Alltag: abends ansetzen, mittags fertig |
| Ort | Kühlschrank | Bei Raumtemperatur zieht es schneller, aber die Spanne zwischen „gut" und „bitter" wird enger |
| Mahlgrad | grob | **Der einzige Wert, den ich nicht beziffern will.** Deutlich gröber als dein Moka-Bereich von 65 Klicks — die konkrete Zahl liefert dein erster Ansatz, nicht meine Schätzung |
| Gerät | Karaffe | Läuft mit allem, was du hast. Mit French Press entfällt das Filtern als eigener Schritt |
| Filtern | ja | Bei der Karaffe ein eigener Handgriff nach der Ziehzeit |

Ein Wert, der daraus folgt und den man leicht übersieht: **der Kaffeesatz behält Wasser.** Bei rund dem Doppelten seines Eigengewichts kommen aus 60 g Kaffee und 900 g Wasser etwa 780 ml heraus, nicht 900 — also gut zweieinhalb Gläser. Die App rechnet den Ertrag deshalb aus Input und Verhältnis *abzüglich* Absorption, sonst verspricht der Vorrat mehr, als er hergibt.

Alle sechs Werte stehen im Profil und sind in der App änderbar. Wenn dein erster Ansatz zu dünn ist, verschiebst du eine Zahl — das ist genau der Dial-in-Weg, den die App für Espresso ohnehin kann.

#### Was je Gerät gilt K7 K30 K34 K56

Aus der Gestaltung kommt eine Unterscheidung, die das Konzept bisher nicht gemacht hat: **jedes Gerät hat genau einen Führungswert** — den einen Wert, der groß steht, während der Rest ihn begleitet.

| Gerät | Führungswert | Was sonst gilt |
| --- | --- | --- |
| Siebträger | **Output** | Der Wert, auf den du fährst. Input und Mahlgrad stellst du ein, Zeit und Preinfusion begleiten. |
| Pour Over | **Durchlaufzeit** | Ein Durchgang für höchstens zwei Tassen. Verhältnis steht als Meta, die Füllmenge wird auf die Tassen geteilt. Der Gussplan ist im Zubereitungsweg erreichbar, aber **nur ansehbar** — tippbar ist allein „Plan ändern". |
| Moka | **keiner** | Es gibt nichts zu führen: die Menge kommt aus der Kanne, die Zeit steuerst du nicht. **Keine Plattenzeit, kein Wasserfeld** — beides wurde nie gepflegt und hat nie eine Frage beantwortet. |
| Cold Brew | **keiner** | Vorrat mit Fertig-Zeitpunkt. In der Bestellung das schnellste Getränk überhaupt. |

Der ruhige Gussplan ist die wichtigste dieser Zeilen. Beim Zubereiten will man ihn *lesen*, nicht bearbeiten — eine versehentlich verschobene Zeile mitten im Aufguss wäre der teuerste Fehlgriff, den die App zulässt. Bearbeitet wird er dort, wo dafür Ruhe ist.

#### Was sonst daran hängt

- **Moka ist ein Getränk mit zwei Geräten**, und die Wahl richtet sich nach der Tassenzahl, nicht nach dem Kaffee. Eine Tasse → 1er, mehrere → 3er. Änderbar, und der Planer merkt es sich pro Person, wenn es immer dieselbe ist.
- **Füllstands-Prüfung.** Weil Mengen im Modell stehen, kann die App rechnen: Shot plus Milch plus Wasser gegen das Gefäßvolumen. Passt es nicht, sagt sie es beim Anlegen des Getränks — nicht beim Überlaufen.
- **Ein- und ausblenden statt löschen.** Das Getränk verschwindet aus der Auswahl, seine Historie und sein Ranking-Score bleiben. Wieder einblenden und es steht sofort wieder da, wo es hingehört.
- **Keine Personenzuordnung je Tasse außerhalb der Bestellung** K34. Machst du zwei Cappuccino nebenbei, ohne eine Bestellung aufzunehmen, fragt niemand, wer welchen bekommt. Personen hängen an der Bestellposition — überall sonst wären sie Bürokratie.

## Ranking & Personen

Du willst „am häufigsten getrunken oben", aber alte Getränke sollen herauswachsen. Das ist ein **exponentiell abklingender Zähler** — kein Sortieren nach absoluter Summe.

```
score = Σ  2^( −Δt / H )        Δt = Tage seit dem Log
                                H  = Halbwertszeit = 60 Tage

inkrementell, bei jedem neuen Log:
score ← score · 2^( −Δt / H )  +  1
```

Eine Zahl pro Getränk, in konstanter Zeit aktualisierbar — die Historie muss dafür nie durchlaufen werden. Mit deinen 60 Tagen sieht das praktisch so aus:

| Verlauf | Logs | Score | Platz |
| --- | --- | --- | --- |
| 5 × in der letzten Woche | 5 | 4,81 | oben |
| 10 × vor drei Monaten, seitdem nicht mehr | 10 | 3,54 | Mitte |
| 3 × in der letzten Woche | 3 | 2,90 | knapp darunter |

60 Tage ist eine ruhige Einstellung: eine einzelne intensive Woche kippt die Reihenfolge nicht sofort, aber eine ganze Saison verschwindet über den Winter von selbst. Die mittlere Zeile zeigt, wie träge das ist — zehn Logs von vor drei Monaten halten sich noch vor drei frischen. Erst bei fünf frischen dreht es. Falls dir das im Betrieb zu zäh vorkommt, ist die Halbwertszeit eine Zahl in den Einstellungen; bei 30 Tagen fiele die alte Zeile auf 1,25 und läge sofort hinten.

**Personenfavoriten sind dieselbe Formel**, nur auf eine Person gefiltert. Sobald du in der Bestellung eine Person antippst, stehen ihre Getränke in ihrer Reihenfolge da. Nichts davon wird gepflegt — es entsteht aus dem Loggen, das du ohnehin machst. Bei einer neu angelegten Person gibt es naturgemäß noch keine Historie; dort greift die allgemeine Rangfolge, bis sich eine eigene gebildet hat.

#### Der zweite Favorit: Koffein

Du hast es genau richtig beschrieben — und die Pointe steckt in einem Nebensatz von dir: *„das ist nicht speziell auf den Cappuccino bezogen, sondern wenn er die meisten seiner Getränke entkoffeiniert trinkt."* Das heißt: **Koffein ist keine Eigenschaft des Getränks, sondern der Person.** Max trinkt Cappuccino *und* er trinkt entkoffeiniert — zwei unabhängige Vorlieben, die sich zu *„Max, wieder Cappuccino? Wieder entkoffeiniert?"* zusammensetzen.

Gezählt wird über die **letzten 20 Positionen** dieser Person K56 — nicht über die Decay-Formel und nicht über alles. Ein festes Fenster ist hier das Richtige: Koffein ist eine Gewohnheit, die sich ändert, und wer vor einem Jahr koffeinhaltig getrunken hat, sagt nichts darüber, was er heute will. Zwanzig Positionen sind genug für einen stabilen Anteil und kurz genug, um einer Umstellung innerhalb weniger Wochen zu folgen.

Dieselbe Schwelle und dasselbe Fenster gelten für jede vorbelegte Frage — Kännchen, Bohnenvorschlag, Extra Shot.

| Anteil über die letzten 20 Positionen | Was die App tut |
| --- | --- |
| ≥ 60 % | fragt *„wieder entkoffeiniert?"* — mit **Ja** vorbelegt |
| 40 – 60 % | fragt, aber **ohne Vorbelegung** — hier zu raten wäre schlechter als zu fragen |
| ≤ 40 % | fragt **gar nicht**. Umstellen geht über einen kleinen Schalter an der Position |

Die mittlere Zeile ist mir die wichtigste. Eine App, die bei 50/50 rät, liegt die Hälfte der Zeit falsch und wird zur Fehlerquelle — und ausgerechnet dieser Fehler ist teuer, weil er erst beim Trinken auffällt und dann ein ganzes Getränk kostet. Nicht zu raten ist an der Stelle die bessere Funktion.

**Die Koffein-Frage kommt vor der Bohne und filtert sie** K45 K46. Fassung 7 hatte sie danach gestellt — und damit den gerade gemachten Bohnenvorschlag im Zweifel wieder umgeworfen. Jetzt entscheidet sich erst koffeinhaltig oder nicht, dann zeigt die Liste, was übrig bleibt: die Schnittmenge aus *geeignet für* × Koffein × aktiv, mit dem Filter in der Kopfzeile — *„Bohne · 3 von 8"*.

> **Bildschirm-Skizze**
>
> **Bestellung · Person gewählt**
>
> Max
>
> **[Cappuccino]** · [Espresso] · [Latte Macchiato] · *[anderes …]*
>
> **Bohne**
>
> **[Espresso Entcoffeiniert]** · *[wechseln …]*
>
> **Wieder entkoffeiniert?**
>
> 7 von 8 zuletzt **[Ja]** [Nein]

Zwei Taps für eine Position, beide vorbelegt — und die Begründung *„7 von 8 zuletzt"* steht daneben, damit du siehst, worauf sich die App stützt, statt ihr glauben zu müssen.

#### Die Personenliste K17 K25 K28

- **Standard ist Julian**, überall umstellbar. Der häufigste Fall braucht keinen Tap.
- **Sortiert nach Historie, ohne Zahlen.** Wer oben steht, steht oben — der Score, der die Reihenfolge macht, gehört nicht ins Bild. In der Auswertung darf derselbe Rang mit Balken und Zahl erscheinen; im Alltag ist er Rauschen.
- **Die Suchzeile legt an.** Wer nicht in der Liste ist, wird beim Tippen zum neuen Eintrag — Vorname genügt. Kein eigener Weg „Person anlegen".
- **Höchstens vier Namen** sichtbar, dazu „+ jemand anders". Eine Küche hat selten mehr Leute gleichzeitig, und eine lange Liste macht die häufigen Fälle langsamer.

#### Begründungen abschaltbar K24 K31

Die Zeile *„7 von 8 zuletzt"* ist das, was eine Vorbelegung von einer Behauptung unterscheidet — sie zeigt, worauf die App sich stützt. Standardmäßig ist sie an.

Aber sie ist auch eine Zeile, die man nach dem zwanzigsten Mal nicht mehr liest. Deshalb **zwei getrennte Schalter** in den Einstellungen: einer für Koffein, einer für die Bohne. Getrennt, weil man die eine Begründung kennt und die andere vielleicht nicht — und „aus" entfernt die Zeile ganz, statt sie zu verkleinern.

> **Bewusst nicht gebaut: Tageszeit**
>
> Es liegt nahe, dass Koffein bei manchen Leuten von der Uhrzeit abhängt — abends entkoffeiniert, morgens nicht. Die App könnte das lernen. **Ich lasse es zunächst weg**, weil es die Historie halbiert: pro Person und Tageshälfte braucht es doppelt so viele Datenpunkte, bis der Anteil belastbar ist, und bei Gästen mit drei Besuchen im Jahr kommt der nie zustande. Sollte sich in deinen Daten später ein klares Muster zeigen, ist es eine Filterzeile mehr — kein Umbau.

## Daten, Backup, Ausfallsicherheit

> **Abbildung** — Datenfluss: Bedienung schreibt in IndexedDB als Wahrheit, von dort läuft ein entkoppelter Snapshot ins Cloud-Backup und ein manueller Export in eine Datei. Notion fließt einmalig über die Migration hinein.
>
> **Die Wahrheit liegt auf dem Gerät.** Der Weg zum Cloud-Backup ist bewusst entkoppelt: fällt er aus, merkst du beim Loggen nichts. Der Export in eine Datei funktioniert immer — auch wenn der Cloud-Dienst irgendwann eingestellt wird. Notion fließt genau einmal hinein und wird danach nicht mehr gebraucht.

Deine Backup-Anforderung wird auf **zwei unabhängigen Wegen** erfüllt, weil ein einzelner Weg immer einen Anbieter voraussetzt, der in fünf Jahren noch existiert:

- **Automatischer Snapshot in die Cloud**, nach jeder Änderung verzögert ausgelöst. Kandidaten mit kostenfreier Stufe: Supabase, Cloudflare D1, Firebase. Die genauen Limits prüfe ich vor der Umsetzung — *ein Punkt gehört jetzt schon auf den Tisch:* manche kostenfreien Stufen pausieren Projekte bei Inaktivität. Bei täglicher Nutzung ist das unkritisch, aber es ist ein Auswahlkriterium.
- **Manueller Export als Datei** — ein Tap, vollständiger Bestand, kein Backend beteiligt. Der Weg, der auch dann noch funktioniert, wenn alles andere weg ist.

Die Datenmenge ist unkritisch: fünf Shots am Tag ergeben rund 1.800 Datensätze im Jahr, also wenige hundert Kilobyte. Es gibt keinen Grund, jemals etwas zu löschen.

## Die LLM-Naht

Gebaut wird zunächst nichts. Vorbereitet wird eine einzige Stelle, damit ein späterer Ausbau kein Umbau ist:

```
vorschlag(kontext)  →  { text, begruendung, quelle: 'regel' | 'llm' }
```

Jeder Vorschlag der App — nächster Dial-in-Schritt, Reihenfolge einer Bestellung, Verdichtung von Erkenntnissen — geht durch diese Funktion. Dahinter liegt zunächst nur das Regelwerk. Der **Kontext-Baukasten**, der aus Kaffee, Shots und Tastings ein kompaktes Objekt schnürt, wird ohnehin gebraucht: das Regelwerk liest daraus, und derselbe Kontext ist es, den du per Knopfdruck in die Zwischenablage bekommst, um ihn in einen Claude-Chat zu werfen. Dieser Weg kostet nichts und existiert in Ansätzen bereits in `tasting.js`.

Kommt später ein API-Aufbau dazu, ändert sich genau eine Implementierung hinter `vorschlag()`. Und davor bekommst du Modellwahl und gerechnete Monatskosten vorgelegt — nicht danach.

> **Vorgemerkt, nicht beschlossen · kostenrelevant**
>
> Aus der Gestaltung kam ein Gedanke, der über den Kopierweg hinausgeht: der **Werkstattbericht aus Paket 04** — die gesammelten offenen Beobachtungen mit ihren Shots — könnte per Schnittstelle an ein Modell gehen, und die Rückgabe landet als *Erkenntnis* am Kaffee, mit Herkunft **übernommen**. Das ist elegant, weil die Herkunftskennzeichnung genau dafür schon existiert: ein Rat von außen sieht anders aus als eine eigene Messung.
>
> **Es ist aber laufender Aufwand**, und damit fällt es unter deine Kostenregel. Ich schreibe es hier als Vormerkung auf, nicht als Architektur. Gebaut wird es erst, wenn Modellwahl, Auslösefrequenz und gerechnete Monatskosten auf dem Tisch lagen und du zugestimmt hast. Bis dahin bleibt der Weg der, der nichts kostet: Bericht in die Zwischenablage, Antwort von Hand als Erkenntnis eintragen.

## Navigation

Fünf Bereiche, und ein Schnellpfad, der über allem steht. Die **Historie** ist neu und kein Archiv: seit die Bestellung nicht mehr bewertet K57, ist sie der Ort, an dem Urteile entstehen.

| Bereich | Wofür |
| --- | --- |
| **Bar** · Start | Bestellung aufnehmen, laufende Liste, Schnellzugriff auf dein Getränk |
| **Kaffees** | Bestand, Eigenschaften, Chargen, Dial-in-Status, Profile samt Gussplan, Verlaufskurve, Erkenntnisse, laufende Cold-Brew-Ansätze |
| **Historie** | Jeder Shot einzeln, mit Verkostung und Urteil. **Der einzige Ort, an dem bewertet wird** — nachträglich, einzeln, ohne Zeitdruck K32 K57 |
| **Getränke** | Anlegen als Kopie, bearbeiten, ein- und ausblenden, Mengen, Gefäße und Reihenfolgen |
| **Einstellungen** | Setups, Mühlen, Maschinen samt Temperatur-Referenz, Zubehör, Rüstzeiten und ihre Bündel, Spielräume, Personen, Aromaset, Begründungsschalter, offene Beobachtungen, Backup |

> **Der Maßstab für den Alltag**
>
> **Zwei Taps bis geloggt.** App auf → dein Getränk steht wegen des Decay-Rankings ganz oben → antippen, Shot läuft → *„Wie war er?"* antippen, fertig. Alles andere in der App darf tiefer liegen. Dieser eine Pfad nicht — an ihm entscheidet sich, ob du die App in drei Monaten noch benutzt.

## Umsetzung

Neun Pakete. Paket 01 ist abgeschlossen — die Gestaltung ist durch, ihre einundsechzig Punkte stehen in diesem Dokument.

Du hattest recht mit dem Einwand — und ich hatte in Fassung 1 unrecht. Ein Design-Pass am Ende ist kein Design, sondern Kosmetik auf fertigen Bildschirmen: die Struktur steht dann schon, und was das Design daran ändern will, kostet Umbau. Umgekehrt kann Design auch nicht ganz am Anfang stehen, denn es braucht etwas zu gestalten. **Der richtige Platz ist dazwischen: nach dem Datenmodell, vor der ersten Zeile Anwendungscode.** Zu diesem Zeitpunkt ist klar, welche Objekte es gibt und welche Wege du durch sie nimmst — und noch nichts davon ist in Markup gegossen.

#### Paket 00 — Fundament

Repo, Toolchain, Deployment — und der Name, der bis dahin entschieden sein muss, weil er ab hier in Repo, Manifest und Icon hängt. Dazu eine eigene `CLAUDE.md` mit den projektspezifischen Regeln.

Die **sieben Anthropic-Strategien blockieren dieses Paket nicht mehr**, wie du gesagt hast: sie betreffen die Arbeitsweise, nicht die Struktur. Die `CLAUDE.md` bekommt einen benannten Platzhalter dafür. **Spätester Termin ist der Beginn von Paket 02** — dort entsteht die erste Zeile Anwendungscode, und ab da würden sie nachträglich gelten statt von Anfang an.

*Danach: die Regeln stehen, bevor Code entsteht.*

#### Paket 01 — Design abgeschlossen

Sechs Sitzungen: zwölf namenlose Richtungen, daraus die Haltung *Laborbuch*, ein Tokenblatt für beide Themes, fünfzehn Muster, der Alltagspfad, die dichten Bildschirme und die Zustände. Ergebnis sind ein Übergabeprotokoll mit Tokens, Systemregeln und allen Mustern — und einundsechzig Punkte, die dieses Konzept ändern.

*Danach: es ist entschieden, wie die App aussieht und sich anfühlt, bevor irgendetwas gebaut ist. Eingelöst.*

#### Paket 01b — Das Musterblatt

Die fünfzehn Muster als Bauteile, alle auf einer Seite, beide Themes, geöffnet auf dem echten Telefon. Erst danach der erste Bildschirm.

Das ist das Code-Gegenstück zur Schlussprüfung aus Sitzung 3: dort standen alle Muster untereinander, damit sichtbar wird, ob sie eine Familie sind. Im Code gilt dasselbe — Token-, Abstands- und Trefferflächenfehler fängt man einmal statt fünfzehnmal, und danach ist jeder Bildschirm eine Komposition.

*Danach: die Bauteile stehen und sind am Gerät geprüft.*

#### Paket 02 — Datenschicht & Migration

IndexedDB, Import aus Notion inklusive der verschütteten Shots, Prüflauf, Export, Cloud-Backup.

*Danach: dein kompletter Bestand liegt strukturiert und gesichert in der neuen App.*

#### Paket 03 — Kaffees, Profile, Shots

Bestandsliste mit den strukturierten Eigenschaften, Filter und Sortierung darüber, Profile mit Setup-Bindung, Shot-Erfassung, „Wie war er?", Alltagskorrektur. Dazu die **Temperatur-Referenztabelle** und der **Gussplan-Editor** — beide sind Profil-nah und gehören hierher, nicht in ein späteres Paket.

*Danach: das Kernproblem ist gelöst — loggen ist ein Tap und geht nichts mehr verloren.*

#### Paket 04 — Dial-in-Diagnostik

Symptom-Chips, Regelwerk, Vorschläge mit Übernehmen, Totzonen-Karte, Chargenwechsel-Hinweis, Drift-Verlauf. Dazu die **offenen Beobachtungen**: Zählung der Freitexte, eigene Chips, der kleine Regeleditor und der Werkstattbericht zum Herauskopieren.

*Danach: die App denkt beim Dial-in mit, statt nur zu protokollieren — und meldet selbst, wenn ihr Vokabular nicht reicht.*

#### Paket 05 — Tasting

Achsen, die drei verbliebenen Skalen, berechnete Balance und Komplexität, Fehlerliste, Aromarad in drei Ebenen als Drill-down, **Umschalter auf Le Nez du Café** samt Zuordnung zum Rad, Bindung an den Shot, Auswertung gegen Parameter. Zum Schluss der **Übungsmodus** mit Trefferstatistik je Aroma.

Dazu die **Historie** — jeder Shot einzeln, mit nachträglichem Urteil. Sie ist Voraussetzung dafür, dass die Bestellung nicht bewertet K57, und gehört deshalb vor Paket 06.

*Danach: Verkostungen bleiben erhalten und werden auswertbar — in der Sprache, in der du übst. Und es gibt einen Ort, an dem Urteile in Ruhe entstehen.*

#### Paket 06 — Getränke, Personen, Bestellung

Der **Getränke-Baukasten** mit Mengen und „neu als Kopie", Ein- und Ausblenden, Cold-Brew-Ansätze, Personenverwaltung mit Suchzeile und Inline-Anlage, der bündelbare Rüstzeiten-Vorrat als Rechenmodell, der Planer mit Bezugsbündelung — und die Bestellung als **Kette aus Durchgängen**: aufnehmen mit Koffein-Filter, Plan ohne Ansagen, Verschnitt mit drei Wegen, abarbeiten ohne Urteil.

*Danach: Gästebetrieb funktioniert.*

#### Paket 07 — Ranking & Politur

Decay-Score mit 60 Tagen, Personenfavoriten, **Koffein-Präferenz**, Zwei-Tap-Schnellpfad. Danach ein Durchgang mit Claude Design gegen das *Gebaute* — nicht als Design-Nachtrag, sondern als Abgleich zwischen Entwurf und Realität.

*Danach: die App passt sich an, ohne dass du sie pflegst — und sieht so gut aus, wie sie funktioniert.*

Ein neuntes Paket — die LLM-Anbindung — steht erst zur Debatte, wenn der Rest im Alltag steht und du die Kosten gesehen hast.

## Entschieden

Was aus vier Runden Rückmeldung und sechs Gestaltungssitzungen feststeht. Nichts davon ist noch offen.

#### Aus deinen Rückmeldungen

| Punkt | Ergebnis |
| --- | --- |
| Siebe | einer, immer Doppelsieb — daraus folgt der geteilte Bezug |
| Einzelner Cappuccino | Doppio beziehen, Rest wegleeren oder als Extra Shot verwenden |
| Standzeit bei Milch | unkritisch — und inzwischen ganz aus der Oberfläche |
| Milchkännchen | 350 ml Standard, 500 ml groß, Füllfaktor 60 % |
| Cooling Flush | 3 s, immer |
| Drehzahl | zweite Mahlachse, nichts mit dem Gießen; Feld optional |
| Temperaturtabelle | existiert, wird befüllt statt gemessen |
| Cold Brew | bleibt, als Vorrat mit Fertig-Zeitpunkt |
| Umgebungsdaten | nein — ein Wetterdienst misst außen, die Mühle steht innen |
| Extra Shot | Modifikator an der Position; verdrängt die Ausgleichszutat |
| Name | Brühwerk |

#### Aus der Gestaltung

| Punkt | Ergebnis | K |
| --- | --- | --- |
| Haltung | **Laborbuch.** Sprache führt, Werte begleiten. Nichts läuft, nichts drängt, keine Uhr | — |
| Bestellung | Kette aus **Durchgängen**; Ressourcen, Rüstzeiten und Standzeiten nur im Modell | K48 |
| Bewerten | nicht in der Bestellung — ausschließlich über die Historie | K57 |
| Verkostung | sechs gleichrangige Treppen; Höhe zeigt die Entfernung vom Ziel | K52 |
| Auffälligkeiten | tragen doch eine Stärke — im Chip, nicht als Zeile | K53 |
| Aromen | ein Drill-down, zwei Beschriftungen; kein Rückgrat-Konstrukt | K55 |
| Herkunft | drei Zeichen; Gerechnetes trägt den gefüllten Punkt | K54 |
| Vokabular | Input · Output · Preinfusion, in dieser Reihenfolge | K5 |
| Genauigkeit | Spielraum je Größe; Abweichung erst außerhalb, dann als Satz | K6 |
| Führung | ein Führungswert je Gerät; Moka keiner | K7 |
| Bohnenwahl | Koffein filtert vor der Bohne; die Liste ist eine Schnittmenge | K45 K46 |
| Vorbelegung | nie bei Rezepturänderungen; Schwellen 60/40 über 20 Positionen | K12 K56 |

#### Geklärt, ohne Folge fürs Konzept

Zehn der einundsechzig Punkte sind in der Gestaltung entschieden worden, ohne dass sich am Konzept etwas ändert. Sie stehen hier, damit die Liste vollständig bleibt und niemand sie später für vergessen hält — ihr Ort ist die Übergabe, nicht dieses Papier.

| Was | Wo es steht | K |
| --- | --- | --- |
| Dunkle Token der zweiten Fläche | Farbwerte in der Übergabe; helles Feld bleibt erlaubt | K9 |
| Zahleneingabe | Systemtastatur als Zahlenfeld, Wert vorbelegt und markiert | K11 |
| Ziehen in Listen | Griff rechts für den Daumen, die ganze Zeile ist Ziehfläche | K23 |
| Fußzeilen | sind Felder in Feldhöhe mit „›“, keine Knöpfe | K27 |
| Textfelder bei Fokus | wandern ins obere Drittel, damit die Tastatur nichts verdeckt | K33 |
| Jetzt-Zeile | Muster ist da, wird von keinem Bildschirm gebraucht | K41 |
| Vier Punkte sind im Verlauf der Sitzungen von späteren abgelöst worden: K15 → K21 · K29 → K34 · K35 → K53 · K43 → K55 |  |  |

## Was noch offen ist

Zwei Lieferungen und eine Gestaltungsrunde. Am Konzept ist nichts mehr offen.

**Die sieben Anthropic-Strategien — bis Beginn Paket 02**

Der einzige Punkt, der von außen kommen muss. Paket 00 trägt einen benannten Platzhalter; spätestens bevor die erste Zeile Anwendungscode entsteht, gehören sie in die `CLAUDE.md` des neuen Repos.

**Le-Nez-Nummern und ihre Kategoriezuordnung — bis Paket 05**

Sechzig Aromen mit Fläschchennummer, eingeordnet in die neun SCA-Kategorien. Die Zahlen in den Entwürfen sind Beispiele — die echte Liste kommt vom Karton.

**Die restlichen Bildschirme — Gestaltung, nicht Konzept**

Die Gestaltung hat die dichten Bildschirme und den Alltagspfad abgedeckt. Offen ist die Fehlliste, und **ein Eintrag darauf ist keine Kür**: die *Historie und Auswertung*. Seit K57 jede Bewertung dorthin verlegt, ist sie ein Kernbildschirm und Voraussetzung für Paket 05. Die übrigen — Dial-in am Getränk, Kaffee-Pflege, Übungsmodus, Erkenntnis anlegen, Setups, Personenpflege — sind Kompositionen aus vorhandenen Mustern.

#### Nachpflegbar im Betrieb, mit Startwerten belegt

| Was | Startwert |
| --- | --- |
| Temperatur-Referenz | Kessel − 27 K, Herkunft *geschätzt*, gedämpft dargestellt |
| Cold-Brew-Profil | 1:15 · 16 h · Kühlschrank · grob |
| Milliliter der Getränke | 130 ml Milch im Cappuccino usw. |
| Spielräume | Zeit ± 2 s · Output ± 0,4 g · Durchlaufzeit ± 5 s |

> **Damit ist das Konzept fertig**
>
> Acht Fassungen, vier Runden Rückmeldung, sechs Gestaltungssitzungen, einundsechzig eingearbeitete Punkte. Was jetzt noch fehlt, sind Daten und eine Datei — nichts, worüber noch zu entscheiden wäre.
