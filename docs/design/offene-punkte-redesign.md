# Offene Punkte — Visueller Redesign-Reset

Stand: 2026-08-23, nach Abschluss Paket 3 (Profil und Shot-Logging) auf
Branch `design/redesign-v1`.

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

**Zweck:** Screens, die in Paket 4 erst noch umgebaut werden, sollten schon
jetzt die neue Farbwelt zeigen, ohne dass ihre Struktur vorzeitig angefasst
wird. Nach Paket 3 vollständig umgestellt (keine Alias-Nutzung mehr):
`KaffeeListe.svelte`, `Kaffeeblatt.svelte`, `Profilblatt.svelte`,
`ShotErfassung.svelte`. Noch offen (alle Paket 4): `Einstellungen.svelte`,
`KaffeeBearbeiten.svelte`, `KaffeeNeu.svelte`, `GussplanEditor.svelte`,
`Geraete.svelte`, `Bruehgeraetblatt.svelte`, `Muehleblatt.svelte`,
`Setupblatt.svelte`, `*Ansicht.svelte`, `TempReferenz(Screen).svelte`,
`Migration.svelte`, `Bar.svelte`.

**Wenn ein dieser Screens umgebaut ist:** dort direkt `--blatt`/`--vertiefung`/
`--linie` referenzieren statt der Alt-Namen. Wenn **kein** Verbraucher eines
Alias mehr übrig ist, gehört der Alias aus `tokens.css` entfernt (Paket 5,
Konsistenzprüfung) — er bleibt sonst als stille Falle stehen, die neuer Code
aus Versehen wieder benutzt.

Ebenfalls noch offen: `--radius-feld` (0) und `--radius-chip` (2px) existieren
**nicht mehr** als Tokens (ersatzlos entfernt, nicht aliasiert). Nur noch eine
Fundstelle nutzt sie: `Einstellungen.svelte` (`.karte`) — fällt unauffällig
auf Radius 0 zurück (der alte Wert von `--radius-feld`), bis sie in Paket 4
auf die neue Radius-Familie (`--r-blatt` 20 · `--r-karte` 18 · `--r-kachel` 16
· `--r-pille` 999 · `--r-wertfeld` 4) umgestellt wird. `KaffeeListe.svelte`
ist seit Paket 2 erledigt (schwebender Knopf jetzt `border-radius: 50%` mit
`--fuellung`).

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

## 8. Neues Muster für „Blatt mit navigierbaren Zeilen“ — weiterhin offen, jetzt zweimal gebraucht

Elf Screens bauen ihre Listenzeilen von Hand — `Kaffeeblatt.svelte` ist jetzt
eines davon (Profile/Bohne-Falte/Chargen als lokales
`.panel`/`.listenzeile`/`.chargenzeile`-CSS, siehe Kopfkommentar dort). Kein
zentrales Muster dafür existiert. Ich habe **bewusst kein neues Muster
gebaut** (das wäre eine Architekturentscheidung ohne Rückfrage gewesen),
sondern lokal implementiert — faithful zur Designreferenz, aber eine echte
Duplikationsstelle für Paket 4 (Geräte-Blätter brauchen exakt dasselbe Bild:
Zeile, rundes Badge/kein Badge, Meta rechts, „›“). Spätestens dort lohnt sich
die Frage neu: gemeinsames `Blattliste.svelte`-Muster einführen (nach
`ux-regeln.md` Regel 6 erst nach Prüfung, ob eines der 22+2 vorhandenen
Muster mit kleiner Anpassung reicht — tut es hier nicht, keins deckt "Zeile
mit optionalem rundem Icon-Badge + Meta + Chevron" ab) oder weiter lokal
duplizieren. Bitte vor Paket 4 entscheiden statt es ein drittes Mal
stillschweigend zu kopieren.

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
- Source Sans 3 als Apparatschrift installiert und eingebunden
  (`@fontsource-variable/source-sans-3`).
- `npm test` (vitest inkl. `tokens.test.ts`/`schichten.test.ts`, svelte-check,
  vite build) grün nach Paket 1, 2 und 3 (359 Tests, 0 svelte-check-Fehler).
