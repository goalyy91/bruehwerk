/**
 * Die Datenblaetter zu den Le-Nez-du-Cafe-Flaeschchen — deutsche Fassung.
 *
 * Herkunft: das Begleitmaterial des Sets, Blatt fuer Blatt eingescannt. Der
 * Text hier ist eine **sinngemaesse deutsche Nachformulierung**, kein
 * uebersetzter Nachdruck: Fachwoerter bekommen einen erklaerenden Halbsatz,
 * den das Original nicht hat, Layout-bedingte Wiederholungen fallen weg, und
 * "negative aroma" wird zur *Auffaelligkeit* statt zum "Fehler"
 * (Sprachtabelle in CLAUDE.md). Fuer den privaten Gebrauch in dieser
 * Ein-Personen-App ist das unproblematisch — waere die App je zu
 * veroeffentlichen, ist genau diese Datei der Teil, der herausgenommen
 * gehoert.
 *
 * Diese Datei ist der **Ursprung der Le-Nez-Flaeschchenliste**, nicht ein
 * Anhang dazu: aromen.ts baut AROMASET_LENEZ daraus (Nummer, Name,
 * Kategorie stehen auf jedem Blatt). Ein neues Haeppchen Scans aendert
 * ausschliesslich diese Datei — keinen Bildschirm, kein Schema, keine
 * Migration. Die Datenblaetter gehen bewusst **nicht** in die IndexedDB:
 * statischer Text, der mit dem Code kommt, braucht keine Ablage und kein
 * Backup.
 *
 * `kategorieId` muss eine der neun SCA-Kategorien aus aromen.ts treffen —
 * aroma-datenblaetter.test.ts prueft das, sonst entstuende bei einem
 * Tippfehler still eine zehnte Kategorie.
 */

/** Ein Querverweis aus dem Kasten "Related Aromas". */
export interface Verwandtes {
  readonly nummer: number;
  /**
   * Das Wort, wie es auf *diesem* Blatt gedruckt steht. Es traegt den
   * Verweis, solange Nr. `nummer` selbst noch nicht erfasst ist — ein
   * nacktes "Nr. 23" waere waehrend der langen Erfassungsphase wertlos.
   * Ist das Zielblatt da, gewinnt dessen deutscher Name.
   */
  readonly original: string;
}

export interface Abschnitt {
  /** Leer erlaubt: einleitender Absatz ohne eigene Ueberschrift. */
  readonly titel: string;
  readonly text: readonly string[];
}

export interface AromaDatenblatt {
  /** Flaeschchennummer, 1..60 — die Nummer im Kreis oben rechts. */
  readonly nummer: number;
  readonly name: string;
  /** Der englische Name des Originalblatts — so steht er auf dem Flaeschchen. */
  readonly nameOriginal: string;
  /** Id einer Kategorie aus AROMASET_SCA (aromen.ts). */
  readonly kategorieId: string;
  readonly kategorieLabel: string;
  /** Die grossen Absaetze unter "DESCRIPTION". */
  readonly beschreibung: readonly string[];
  /** Taxonomie, Chemie, Geschichte, Herstellung — je Blatt verschieden. */
  readonly abschnitte: readonly Abschnitt[];
  /** Alles unterhalb der "IN COFFEE"-Linie — fuer eine Kaffee-App die Haelfte, auf die es ankommt. */
  readonly imKaffee: readonly Abschnitt[];
  readonly verwandte: readonly Verwandtes[];
}

export const DATENBLAETTER: readonly AromaDatenblatt[] = [
  {
    nummer: 21,
    name: 'Buttersäure',
    nameOriginal: 'Butyric Acid',
    kategorieId: 'sauer-fermentiert',
    kategorieLabel: 'Sauer / Fermentiert',
    beschreibung: [
      'Buttersäure riecht kräftig und durchdringend sauer — schweißig, käsig, nach ranziger Butter.',
      'Die Säure steckt im Milchfett und ebenso in Käsesorten wie Grana Padano und Parmigiano Reggiano. Weil die beteiligten Bakterien Zucker und Pektine verstoffwechseln, läuft eine Kette chemischer Umwandlungen ab, die zuerst zu Essigsäure und dann zu Buttersäure führt.',
    ],
    abschnitte: [
      {
        titel: 'Taxonomie',
        text: [
          'Buttersäure entsteht bei der Gärung durch mehrere streng anaerobe Bakterien — solche, die nur ohne Sauerstoff leben —, überwiegend aus der Gattung Clostridium.',
        ],
      },
      {
        titel: 'Chemie',
        text: [
          'Chemisch ist sie eine flüchtige, unverzweigte Carbonsäure. Die Aromenindustrie nutzt sie, um butterartige Noten in Lebensmitteln zu erzeugen; ihre Ester dienen verbreitet als Zusatz, der Fruchtnoten verstärkt. Außerdem steckt sie in der Herstellung des Kunststoffs Celluloseacetatbutyrat (CAB), der wegen seiner UV-Beständigkeit vielseitig eingesetzt wird.',
        ],
      },
    ],
    imKaffee: [
      {
        titel: '',
        text: [
          'Das WCR Sensory Lexicon beschreibt die Note im Kaffee als „sauer, nach fermentierten Milchprodukten, wie bei gereiftem Käse (Parmesan)“. Buttersäure gilt im Kaffee fast immer als Auffälligkeit und kann das Qualitätspotenzial deutlich herunterziehen.',
        ],
      },
      {
        titel: 'Nachernte-Verarbeitung',
        text: [
          'Bei gewaschener Aufbereitung gehört ein Fermentationsschritt zum Standard, nass oder trocken. In dieser spontan ablaufenden Gärung bilden Mikroorganismen mehrere Säuren, darunter Milch-, Essig- und Buttersäure. Grob gilt: je länger die Gärung, desto mehr Säure, desto saurer das Aroma, desto niedriger der pH-Wert im gärenden Kaffee.',
          'Man geht davon aus, dass Buttersäure bei übermäßiger Gärung entsteht — dafür spricht, dass sie vor allem in Kaffees mit langer Fermentationszeit auftaucht. Sie ist damit ein Zeichen für eine aus dem Ruder gelaufene Aufbereitung.',
        ],
      },
    ],
    verwandte: [
      { nummer: 23, original: 'Kaffeekirschen-Fruchtfleisch' },
      { nummer: 22, original: 'weinig' },
      { nummer: 43, original: 'Butter' },
    ],
  },

  {
    nummer: 39,
    name: 'Teer',
    nameOriginal: 'Tar',
    kategorieId: 'sonstiges',
    kategorieLabel: 'Sonstiges',
    beschreibung: [
      'Teer riecht stechend, holzig oder harzig. Der Geruch erinnert an eine Sauna, ein Lagerfeuer, an Tabak oder an eine Straßenbaustelle. Er kann scharf, rauchig, ölig oder beißend wirken.',
      'Teer ist eine schwere, dunkle, dickflüssige Masse aus Holz, Kohle oder anderem organischem Material. Er entsteht, wenn dieses Material unter starker Hitze und wenig Sauerstoff zersetzt wird — Pyrolyse nennt man das. Ob Teer harzig riecht, hängt davon ab, ob und welches Holz im Spiel war; am häufigsten sind Kiefer, Wacholder und Birke.',
    ],
    abschnitte: [
      {
        titel: 'Herstellung',
        text: [
          'Harziger Teer entsteht bei Trockendestillation über 300 °C. Holzteer wird seit Jahrhunderten zum Kleben, Abdichten und zum Schutz von Holz verwendet, vor allem im Schiffbau und auf Dächern. Ein paar medizinische Anwendungen haben sich bis heute gehalten.',
        ],
      },
      {
        titel: 'Chemie',
        text: [
          'Teer besteht aus vielen komplexen Zersetzungsprodukten des Holzes. Die wichtigsten Stoffgruppen sind Terpenharze, Phenole, polyzyklische aromatische Kohlenwasserstoffe und Terpene; dazu kommen Säuren, neutrale Kohlenwasserstoffe und Diterpene. Unter den Kohlenwasserstoffen sind Benzol, Toluol und Xylol die wichtigsten, unter den Alkoholen Phenole und Kresole.',
          'Grob gilt: je heißer der Prozess, desto mehr Kohlenwasserstoffe und Phenole entstehen.',
        ],
      },
    ],
    imKaffee: [
      {
        titel: 'Röstung',
        text: [
          'Beim Rösten zersetzt sich Zellulose zwischen 200 und 300 °C. Vor allem dort, wo die Bohne direkten Kontakt zum Metall der Trommel hat, führt die geleitete Hitze zu unerwünschten Reaktionen: Ansengen und beginnende Verkohlung. Das trifft meist nur die Außenseite der Bohne, in extremen Fällen die ganze. Es wird vermutet, dass sich dabei Teerreste in der Rösttrommel absetzen, die dann auf spätere Chargen übergehen.',
          'So geröstet steigt der Pyridin-Gehalt, und Pyridin riecht unangenehm bitter und organisch. Phenole und Pyridin gelten als verlässliche Marker für angesengte Röstung. Phenole wie 4-Methylphenol und 4-Ethylguajakol — beschrieben als teerig, würzig und medizinisch — finden sich in geröstetem Kaffee, besonders in überrösteten Robustas. Auch Pyrrole, die beim Rösten entstehen, tragen zu dieser Note bei.',
          'Je nach angestrebter Röstung und Markt kann ein wenig Teer durchaus erwünscht sein. Wie bei vielen Aromen gilt: eine kleine Menge reicht weit. Dominieren Teer und Verwandtes, verdecken sie, was der Kaffee eigentlich kann. Zusammen mit holzigen, süßen oder kräuterartigen Noten kann Teer harmonisch wirken, vor allem bei Robusta. Indonesische Kaffees gelten oft als harzig-teerig — das dürfte allerdings weniger an der Herkunft liegen als daran, dass dort gern dunkel geröstet wird.',
        ],
      },
    ],
    verwandte: [
      { nummer: 40, original: 'Gummi' },
      { nummer: 41, original: 'Tabak' },
      { nummer: 42, original: 'rauchig' },
    ],
  },

  {
    nummer: 40,
    name: 'Gummi',
    nameOriginal: 'Rubber',
    kategorieId: 'sonstiges',
    kategorieLabel: 'Sonstiges',
    beschreibung: [
      'Gummi riecht unverwechselbar: muffig, dunkel, erdig, rauchig und beißend.',
      'Gummi ist ein hochelastischer Stoff, weich und zugleich zäh. Diese Mischung macht ihn zum Dichten, Verbinden und Dämpfen brauchbar. Er wird natürlich gewonnen oder synthetisch hergestellt und steckt in Dichtungen, Riemen, Bodenbelägen und Reifen — der größte Teil der Weltproduktion geht in Autoreifen.',
    ],
    abschnitte: [
      {
        titel: 'Taxonomie',
        text: [
          'Der wichtigste natürliche Rohstoff stammt vom Kautschukbaum Hevea brasiliensis, der im brasilianischen Amazonasgebiet heimisch ist.',
        ],
      },
      {
        titel: 'Geschichte',
        text: [
          'Schon vor über 3.000 Jahren nutzten mesoamerikanische Kulturen den Stoff. Entdecker brachten ihn als Kuriosum nach Europa. Der englische Name „rubber“ soll im 18. Jahrhundert entstanden sein — nach einer der ersten Verwendungen: Bleistiftstriche vom Papier zu radieren. In den 1830er-Jahren entwickelte Goodyear die Vulkanisation, und damit begann die industrielle Massenproduktion. Größter Erzeuger von Naturkautschuk ist heute mit Abstand Thailand, gefolgt von Indonesien und Vietnam.',
        ],
      },
      {
        titel: 'Gewinnung',
        text: [
          'Die innere Rinde des Baums bildet Latexmilch; wird sie verletzt, tritt die Milch aus und lässt sich sammeln. Gewerblich ritzt man die Rinde in dünnen Spänen an — „Anzapfen“ —, ohne den Baum zu schädigen. Die Milch wird gesammelt, getrocknet und dann dorthin verschifft, wo Produkte daraus entstehen. Während des Trocknens arbeiten Mikroorganismen im Rohstoff mit und beeinflussen seine spätere Chemie und Qualität.',
          'Industriell folgt zwingend die Vulkanisation: Unter Hitze oder Druck kommt Schwefel dazu, was den Gummi härter und haltbarer macht. Synthetischer Gummi entsteht dagegen aus Erdöl — Polyisopren, Neopren und Nitril sind solche Sorten, meist widerstandsfähiger und langlebiger als Naturkautschuk.',
        ],
      },
      {
        titel: 'Chemie',
        text: [
          'Der typische Geruch kommt aus der Latexmilch, die vor allem aus Polyisopren besteht, einem Polymer aus den Rindengefäßen des Baums. Bei der Verarbeitung zu Industriegummi, ob aus Latex oder aus Erdöl, entsteht eine große Vielfalt an Duftstoffen: der Geruch, den jeder von Autoreifen und Gummibändern kennt. Wie stark er ausfällt, hängt vom Trocknungsverfahren und von der Qualität ab — je schlechter der Gummi, desto strenger der Geruch.',
          'Zu den auffälligen Stoffen gehören Essig-, Butter- und Isovaleriansäure sowie aromatische Verbindungen wie Xylole und Phenole. Das Terpen Isopren ist Bestandteil des Naturkautschuks. Dazu kommen zahlreiche Carbonsäuren, Aldehyde, Ketone und Alkohole, Fettsäureester und Trimethylamin. Autoreifen verdanken ihren Geruch Benzothiazol, Sulfiden, Naphthalin, Styrol und Kresolen.',
        ],
      },
    ],
    imKaffee: [
      {
        titel: '',
        text: [
          'Das WCR Sensory Lexicon beschreibt Gummi als „dunkel, schwer, leicht scharf und stechend — der Geruch von Gummi selbst“.',
          'Im Kaffee sind mehrere Stoffe bekannt, die eine Gummi-Note tragen können. Schwefelhaltige Verbindungen, vor allem Methylthiazole, gelten als Verursacher des unangenehmen Geruchs nach verbranntem Gummi. Styrol — oft als „chemisch“ beschrieben und auch im Gummi enthalten — wurde sowohl in rohem als auch in geröstetem Kaffee nachgewiesen. Benzothiophen, ein natürlicher Bestandteil von Teer, tritt im Kaffee als gummiartig, erdig oder verbrannt in Erscheinung. Dazu kommen verschiedene Ketone, Lactone und Thiazole aus der Röstung, die erdige und beißende Gummi-Noten beisteuern.',
          'Kaffee sollte nicht nach Gummi schmecken. Wo er es tut, steckt meist ranzige, zu alte, zu dunkel geröstete oder schlicht schlechte Ware dahinter. Untersuchungen zeigen, dass sowohl Röstgrad als auch Brühtemperatur die Gummi-Wahrnehmung beeinflussen: Hohe Temperatur begünstigt sie — beim Rösten wie beim Brühen. Und wenig überraschend sinkt die Beliebtheit eines Kaffees, sobald Gummi wahrnehmbar wird.',
        ],
      },
    ],
    verwandte: [
      { nummer: 42, original: 'rauchig' },
      { nummer: 39, original: 'Teer' },
      { nummer: 38, original: 'medizinisch' },
      { nummer: 36, original: 'muffig-erdig' },
    ],
  },
];

/** Wie viele Flaeschchen das Set insgesamt hat — die 60 des Le-Nez-Kartons. */
export const FLAESCHCHEN_GESAMT = 60;

const NACH_NUMMER = new Map(DATENBLAETTER.map((b) => [b.nummer, b] as const));

/** Das Datenblatt zu einer Flaeschchennummer, oder undefined (noch nicht erfasst). */
export function datenblattZu(nummer: number): AromaDatenblatt | undefined {
  return NACH_NUMMER.get(nummer);
}

/**
 * Der Kurzindex aller 60 Flaeschchen — Nummer, Name, Kategorie. Herkunft: die
 * gedruckten Uebersichtsseiten des Kartons (neun Seiten, je Seite eine
 * SCA-Kategorie mit Symbolen und Nummern), nicht die ausfuehrlichen
 * Datenblaetter. Deshalb kennt dieser Index alle 60 Namen, waehrend
 * DATENBLAETTER weiter Stueck fuer Stueck waechst.
 *
 * Zwei getrennte Listen mit unterschiedlichem Tempo, bewusst nicht eine: Der
 * Kurzindex war an einem Nachmittag fotografiert und uebertragen, die
 * Volltexte (Beschreibung, Chemie, "Related Aromas") kommen ueber Monate.
 * `daten/aromen.ts` baut AROMASET_LENEZ aus dieser Liste, nicht mehr aus
 * DATENBLAETTER — ein Flaeschchen ohne Volltextblatt heisst jetzt mit
 * seinem echten Namen, nicht mehr "Nr. N (noch nicht erfasst)".
 */
export interface ScaZuordnung {
  /** Id einer Gruppe aus AROMASET_SCA (aromen.ts), z. B. "beere". */
  readonly gruppeId: string;
  /**
   * Id eines Aromas in dieser Gruppe — nur gesetzt, wenn das Le-Nez-Aroma
   * dort einen echten Zwilling hat. Ein Le-Nez-Aroma ohne SCA-Zwilling
   * (z. B. Leder, Kartoffel) traegt hoechstens die Gruppe, nie eine
   * erfundene Aroma-Id.
   */
  readonly aromaId?: string;
}

export interface Flaeschchen {
  /** Flaeschchennummer, 1..60 — dieselbe Nummer wie in DATENBLAETTER. */
  readonly nummer: number;
  readonly name: string;
  readonly nameOriginal: string;
  /** Id einer Kategorie aus AROMASET_SCA — identisch mit AromaDatenblatt.kategorieId. */
  readonly kategorieId: string;
  readonly kategorieLabel: string;
  /** Le-Nez-eigene Untergruppe innerhalb der Kategorie, nicht die SCA-Gruppe. */
  readonly gruppeId: string;
  readonly gruppeLabel: string;
  /**
   * Verweis auf denselben Geruch im SCA-Set, K55: "die Zuordnung liegt im
   * Hintergrund und haelt die Historie zusammen, ohne sie zu erklaeren" —
   * deshalb hier und nicht als sichtbarer Radverweis. Fehlt bei einem
   * Aroma ganz ohne Entsprechung.
   *
   * Diese Zuordnung ist eine Einschaetzung, kein Beleg — wie die deutsche
   * SCA-Uebertragung selbst (aromen.ts) ist sie ungeprueft. Ein Test kann
   * nur pruefen, dass jede genannte Id existiert, nicht, dass sie stimmt.
   */
  readonly sca?: ScaZuordnung;
}

export const FLAESCHCHEN: readonly Flaeschchen[] = [
  // Floral — eine Gruppe, vier Flaeschchen.
  { nummer: 1, name: 'Honig', nameOriginal: 'Honey', kategorieId: 'blumig', kategorieLabel: 'Blumig', gruppeId: 'blumig-gruppe', gruppeLabel: 'Blumig', sca: { gruppeId: 'brauner-zucker', aromaId: 'honig' } },
  { nummer: 2, name: 'Schwarzer Tee', nameOriginal: 'Black tea', kategorieId: 'blumig', kategorieLabel: 'Blumig', gruppeId: 'blumig-gruppe', gruppeLabel: 'Blumig', sca: { gruppeId: 'schwarztee', aromaId: 'schwarzer-tee' } },
  { nummer: 3, name: 'Rose', nameOriginal: 'Rose', kategorieId: 'blumig', kategorieLabel: 'Blumig', gruppeId: 'blumig-gruppe', gruppeLabel: 'Blumig', sca: { gruppeId: 'blumig-gruppe', aromaId: 'rose' } },
  { nummer: 4, name: 'Jasmin', nameOriginal: 'Jasmine', kategorieId: 'blumig', kategorieLabel: 'Blumig', gruppeId: 'blumig-gruppe', gruppeLabel: 'Blumig', sca: { gruppeId: 'blumig-gruppe', aromaId: 'jasmin' } },

  // Fruity — fuenf Untergruppen statt einer flachen 16er-Liste.
  { nummer: 5, name: 'Himbeere', nameOriginal: 'Raspberry', kategorieId: 'fruchtig', kategorieLabel: 'Fruchtig', gruppeId: 'beere', gruppeLabel: 'Beere', sca: { gruppeId: 'beere', aromaId: 'himbeere' } },
  { nummer: 6, name: 'Blaubeere', nameOriginal: 'Blueberry', kategorieId: 'fruchtig', kategorieLabel: 'Fruchtig', gruppeId: 'beere', gruppeLabel: 'Beere', sca: { gruppeId: 'beere', aromaId: 'blaubeere' } },
  { nummer: 7, name: 'Schwarze Johannisbeere', nameOriginal: 'Black Currant', kategorieId: 'fruchtig', kategorieLabel: 'Fruchtig', gruppeId: 'beere', gruppeLabel: 'Beere', sca: { gruppeId: 'beere' } },
  { nummer: 8, name: 'Erdbeere', nameOriginal: 'Strawberry', kategorieId: 'fruchtig', kategorieLabel: 'Fruchtig', gruppeId: 'beere', gruppeLabel: 'Beere', sca: { gruppeId: 'beere', aromaId: 'erdbeere' } },
  { nummer: 9, name: 'Rosine', nameOriginal: 'Raisin', kategorieId: 'fruchtig', kategorieLabel: 'Fruchtig', gruppeId: 'trockenfrucht', gruppeLabel: 'Trockenfrucht', sca: { gruppeId: 'trockenfrucht', aromaId: 'rosine' } },
  { nummer: 10, name: 'Backpflaume', nameOriginal: 'Prune', kategorieId: 'fruchtig', kategorieLabel: 'Fruchtig', gruppeId: 'trockenfrucht', gruppeLabel: 'Trockenfrucht', sca: { gruppeId: 'trockenfrucht', aromaId: 'backpflaume' } },
  { nummer: 11, name: 'Kirsche', nameOriginal: 'Cherry', kategorieId: 'fruchtig', kategorieLabel: 'Fruchtig', gruppeId: 'kernobst-steinobst', gruppeLabel: 'Kernobst/Steinobst', sca: { gruppeId: 'sonstige-frucht', aromaId: 'kirsche' } },
  { nummer: 12, name: 'Ananas', nameOriginal: 'Pineapple', kategorieId: 'fruchtig', kategorieLabel: 'Fruchtig', gruppeId: 'tropisch', gruppeLabel: 'Tropisch', sca: { gruppeId: 'sonstige-frucht', aromaId: 'ananas' } },
  { nummer: 13, name: 'Mango', nameOriginal: 'Mango', kategorieId: 'fruchtig', kategorieLabel: 'Fruchtig', gruppeId: 'tropisch', gruppeLabel: 'Tropisch', sca: { gruppeId: 'sonstige-frucht' } },
  { nummer: 14, name: 'Melone', nameOriginal: 'Melon', kategorieId: 'fruchtig', kategorieLabel: 'Fruchtig', gruppeId: 'tropisch', gruppeLabel: 'Tropisch', sca: { gruppeId: 'sonstige-frucht' } },
  { nummer: 15, name: 'Banane', nameOriginal: 'Banana', kategorieId: 'fruchtig', kategorieLabel: 'Fruchtig', gruppeId: 'tropisch', gruppeLabel: 'Tropisch', sca: { gruppeId: 'sonstige-frucht' } },
  { nummer: 16, name: 'Apfel', nameOriginal: 'Apple', kategorieId: 'fruchtig', kategorieLabel: 'Fruchtig', gruppeId: 'kernobst-steinobst', gruppeLabel: 'Kernobst/Steinobst', sca: { gruppeId: 'sonstige-frucht', aromaId: 'apfel' } },
  { nummer: 17, name: 'Pfirsich', nameOriginal: 'Peach', kategorieId: 'fruchtig', kategorieLabel: 'Fruchtig', gruppeId: 'kernobst-steinobst', gruppeLabel: 'Kernobst/Steinobst', sca: { gruppeId: 'sonstige-frucht', aromaId: 'pfirsich' } },
  { nummer: 18, name: 'Orange', nameOriginal: 'Orange', kategorieId: 'fruchtig', kategorieLabel: 'Fruchtig', gruppeId: 'zitrus', gruppeLabel: 'Zitrus', sca: { gruppeId: 'zitrusfrucht', aromaId: 'orange' } },
  { nummer: 19, name: 'Zitrone', nameOriginal: 'Lemon', kategorieId: 'fruchtig', kategorieLabel: 'Fruchtig', gruppeId: 'zitrus', gruppeLabel: 'Zitrus', sca: { gruppeId: 'zitrusfrucht', aromaId: 'zitrone' } },
  { nummer: 20, name: 'Limette', nameOriginal: 'Lime', kategorieId: 'fruchtig', kategorieLabel: 'Fruchtig', gruppeId: 'zitrus', gruppeLabel: 'Zitrus', sca: { gruppeId: 'zitrusfrucht', aromaId: 'limette' } },

  // Sour/Fermented — bereits als Volltext-Blatt erfasst (Nr. 21), Namen decken sich.
  { nummer: 21, name: 'Buttersäure', nameOriginal: 'Butyric Acid', kategorieId: 'sauer-fermentiert', kategorieLabel: 'Sauer / Fermentiert', gruppeId: 'sauer-fermentiert-gruppe', gruppeLabel: 'Sauer / Fermentiert', sca: { gruppeId: 'sauer' } },
  { nummer: 22, name: 'Weinig', nameOriginal: 'Winey', kategorieId: 'sauer-fermentiert', kategorieLabel: 'Sauer / Fermentiert', gruppeId: 'sauer-fermentiert-gruppe', gruppeLabel: 'Sauer / Fermentiert', sca: { gruppeId: 'alkohol-fermentiert', aromaId: 'weinig' } },
  { nummer: 23, name: 'Kaffeefruchtfleisch', nameOriginal: 'Coffee Pulp', kategorieId: 'sauer-fermentiert', kategorieLabel: 'Sauer / Fermentiert', gruppeId: 'sauer-fermentiert-gruppe', gruppeLabel: 'Sauer / Fermentiert', sca: { gruppeId: 'alkohol-fermentiert', aromaId: 'fermentiert' } },

  // Green/Vegetative — zwei Untergruppen nach den gedruckten Zeilen.
  { nummer: 24, name: 'Erbsenschote', nameOriginal: 'Peapod', kategorieId: 'gruen-pflanzlich', kategorieLabel: 'Grün / Pflanzlich', gruppeId: 'frisch-gruen', gruppeLabel: 'Frisch/Grün', sca: { gruppeId: 'gruen-pflanzlich-gruppe', aromaId: 'erbsenschote' } },
  { nummer: 25, name: 'Frisches Gras', nameOriginal: 'Grass (Fresh)', kategorieId: 'gruen-pflanzlich', kategorieLabel: 'Grün / Pflanzlich', gruppeId: 'frisch-gruen', gruppeLabel: 'Frisch/Grün', sca: { gruppeId: 'gruen-pflanzlich-gruppe', aromaId: 'frisch' } },
  { nummer: 26, name: 'Gurke', nameOriginal: 'Cucumber', kategorieId: 'gruen-pflanzlich', kategorieLabel: 'Grün / Pflanzlich', gruppeId: 'frisch-gruen', gruppeLabel: 'Frisch/Grün', sca: { gruppeId: 'gruen-pflanzlich-gruppe' } },
  { nummer: 27, name: 'Grüne Paprika', nameOriginal: 'Green (Bell) Pepper', kategorieId: 'gruen-pflanzlich', kategorieLabel: 'Grün / Pflanzlich', gruppeId: 'frisch-gruen', gruppeLabel: 'Frisch/Grün', sca: { gruppeId: 'gruen-pflanzlich-gruppe', aromaId: 'dunkelgruen' } },
  { nummer: 28, name: 'Heuartig', nameOriginal: 'Hay-like', kategorieId: 'gruen-pflanzlich', kategorieLabel: 'Grün / Pflanzlich', gruppeId: 'frisch-gruen', gruppeLabel: 'Frisch/Grün', sca: { gruppeId: 'gruen-pflanzlich-gruppe', aromaId: 'heuartig' } },
  { nummer: 29, name: 'Thymian', nameOriginal: 'Thyme', kategorieId: 'gruen-pflanzlich', kategorieLabel: 'Grün / Pflanzlich', gruppeId: 'kraeuter-holzig', gruppeLabel: 'Kräuter/Holzig', sca: { gruppeId: 'gruen-pflanzlich-gruppe', aromaId: 'krautig' } },
  { nummer: 30, name: 'Kiefer', nameOriginal: 'Pine', kategorieId: 'gruen-pflanzlich', kategorieLabel: 'Grün / Pflanzlich', gruppeId: 'kraeuter-holzig', gruppeLabel: 'Kräuter/Holzig', sca: { gruppeId: 'gruen-pflanzlich-gruppe' } },
  { nummer: 31, name: 'Zeder', nameOriginal: 'Cedar', kategorieId: 'gruen-pflanzlich', kategorieLabel: 'Grün / Pflanzlich', gruppeId: 'kraeuter-holzig', gruppeLabel: 'Kräuter/Holzig', sca: { gruppeId: 'gruen-pflanzlich-gruppe' } },
  { nummer: 32, name: 'Kartoffel', nameOriginal: 'Potato', kategorieId: 'gruen-pflanzlich', kategorieLabel: 'Grün / Pflanzlich', gruppeId: 'kraeuter-holzig', gruppeLabel: 'Kräuter/Holzig', sca: { gruppeId: 'sonstiges-gruen' } },

  // Other — zwei Untergruppen, deckungsgleich mit den SCA-Untergruppen "Sonstiges".
  { nummer: 33, name: 'Pappe', nameOriginal: 'Cardboard', kategorieId: 'sonstiges', kategorieLabel: 'Sonstiges', gruppeId: 'papierig-muffig', gruppeLabel: 'Papierig/Muffig', sca: { gruppeId: 'papierig-muffig', aromaId: 'pappe' } },
  { nummer: 34, name: 'Holzig', nameOriginal: 'Woody', kategorieId: 'sonstiges', kategorieLabel: 'Sonstiges', gruppeId: 'papierig-muffig', gruppeLabel: 'Papierig/Muffig', sca: { gruppeId: 'papierig-muffig', aromaId: 'holzig' } },
  { nummer: 35, name: 'Schimmlig/Feucht', nameOriginal: 'Moldy/Damp', kategorieId: 'sonstiges', kategorieLabel: 'Sonstiges', gruppeId: 'papierig-muffig', gruppeLabel: 'Papierig/Muffig', sca: { gruppeId: 'papierig-muffig', aromaId: 'schimmelig' } },
  { nummer: 36, name: 'Muffig/Erdig', nameOriginal: 'Musty/Earthy', kategorieId: 'sonstiges', kategorieLabel: 'Sonstiges', gruppeId: 'papierig-muffig', gruppeLabel: 'Papierig/Muffig', sca: { gruppeId: 'papierig-muffig', aromaId: 'erdig-muffig' } },
  { nummer: 37, name: 'Leder', nameOriginal: 'Leather', kategorieId: 'sonstiges', kategorieLabel: 'Sonstiges', gruppeId: 'papierig-muffig', gruppeLabel: 'Papierig/Muffig', sca: { gruppeId: 'papierig-muffig', aromaId: 'tierisch' } },
  { nummer: 38, name: 'Medizinisch', nameOriginal: 'Medicinal', kategorieId: 'sonstiges', kategorieLabel: 'Sonstiges', gruppeId: 'chemisch', gruppeLabel: 'Chemisch', sca: { gruppeId: 'chemisch', aromaId: 'medizinisch' } },
  { nummer: 39, name: 'Teer', nameOriginal: 'Tar', kategorieId: 'sonstiges', kategorieLabel: 'Sonstiges', gruppeId: 'chemisch', gruppeLabel: 'Chemisch', sca: { gruppeId: 'chemisch' } },
  { nummer: 40, name: 'Gummi', nameOriginal: 'Rubber', kategorieId: 'sonstiges', kategorieLabel: 'Sonstiges', gruppeId: 'chemisch', gruppeLabel: 'Chemisch', sca: { gruppeId: 'chemisch', aromaId: 'gummi' } },

  // Roasted — eine Gruppe, fuenf Flaeschchen.
  { nummer: 41, name: 'Tabak', nameOriginal: 'Tobacco', kategorieId: 'roestig', kategorieLabel: 'Röstig', gruppeId: 'roestig-gruppe', gruppeLabel: 'Röstig', sca: { gruppeId: 'tabak', aromaId: 'tabak' } },
  { nummer: 42, name: 'Rauchig', nameOriginal: 'Smoky', kategorieId: 'roestig', kategorieLabel: 'Röstig', gruppeId: 'roestig-gruppe', gruppeLabel: 'Röstig', sca: { gruppeId: 'verbrannt', aromaId: 'rauchig' } },
  { nummer: 43, name: 'Butter', nameOriginal: 'Butter', kategorieId: 'roestig', kategorieLabel: 'Röstig', gruppeId: 'roestig-gruppe', gruppeLabel: 'Röstig' },
  { nummer: 44, name: 'Toast', nameOriginal: 'Toast', kategorieId: 'roestig', kategorieLabel: 'Röstig', gruppeId: 'roestig-gruppe', gruppeLabel: 'Röstig', sca: { gruppeId: 'getreide', aromaId: 'getreidig' } },
  { nummer: 45, name: 'Malz', nameOriginal: 'Malt', kategorieId: 'roestig', kategorieLabel: 'Röstig', gruppeId: 'roestig-gruppe', gruppeLabel: 'Röstig', sca: { gruppeId: 'getreide', aromaId: 'malzig' } },

  // Spices — eine Gruppe, fuenf Flaeschchen.
  { nummer: 46, name: 'Pfeffer', nameOriginal: 'Pepper', kategorieId: 'gewuerze', kategorieLabel: 'Gewürze', gruppeId: 'gewuerze-gruppe', gruppeLabel: 'Gewürze', sca: { gruppeId: 'scharf', aromaId: 'pfeffer' } },
  { nummer: 47, name: '(Stern-)Anis', nameOriginal: '(Star) Anise', kategorieId: 'gewuerze', kategorieLabel: 'Gewürze', gruppeId: 'gewuerze-gruppe', gruppeLabel: 'Gewürze', sca: { gruppeId: 'braune-gewuerze', aromaId: 'anis' } },
  { nummer: 48, name: 'Muskatnuss', nameOriginal: 'Nutmeg', kategorieId: 'gewuerze', kategorieLabel: 'Gewürze', gruppeId: 'gewuerze-gruppe', gruppeLabel: 'Gewürze', sca: { gruppeId: 'braune-gewuerze', aromaId: 'muskat' } },
  { nummer: 49, name: 'Zimt', nameOriginal: 'Cinnamon', kategorieId: 'gewuerze', kategorieLabel: 'Gewürze', gruppeId: 'gewuerze-gruppe', gruppeLabel: 'Gewürze', sca: { gruppeId: 'braune-gewuerze', aromaId: 'zimt' } },
  { nummer: 50, name: 'Gewürznelke', nameOriginal: 'Clove', kategorieId: 'gewuerze', kategorieLabel: 'Gewürze', gruppeId: 'gewuerze-gruppe', gruppeLabel: 'Gewürze', sca: { gruppeId: 'braune-gewuerze', aromaId: 'nelke' } },

  // Nutty/Cocoa — eine Gruppe, sechs Flaeschchen.
  { nummer: 51, name: 'Erdnuss', nameOriginal: 'Peanut', kategorieId: 'nussig-kakao', kategorieLabel: 'Nussig / Kakao', gruppeId: 'nussig-kakao-gruppe', gruppeLabel: 'Nussig/Kakao', sca: { gruppeId: 'nussig', aromaId: 'erdnuss' } },
  { nummer: 52, name: 'Haselnuss', nameOriginal: 'Hazelnut', kategorieId: 'nussig-kakao', kategorieLabel: 'Nussig / Kakao', gruppeId: 'nussig-kakao-gruppe', gruppeLabel: 'Nussig/Kakao', sca: { gruppeId: 'nussig', aromaId: 'haselnuss' } },
  { nummer: 53, name: 'Mandel', nameOriginal: 'Almond', kategorieId: 'nussig-kakao', kategorieLabel: 'Nussig / Kakao', gruppeId: 'nussig-kakao-gruppe', gruppeLabel: 'Nussig/Kakao', sca: { gruppeId: 'nussig', aromaId: 'mandel' } },
  { nummer: 54, name: 'Walnuss', nameOriginal: 'Walnut', kategorieId: 'nussig-kakao', kategorieLabel: 'Nussig / Kakao', gruppeId: 'nussig-kakao-gruppe', gruppeLabel: 'Nussig/Kakao', sca: { gruppeId: 'nussig' } },
  { nummer: 55, name: 'Zartbitterschokolade', nameOriginal: 'Dark Chocolate', kategorieId: 'nussig-kakao', kategorieLabel: 'Nussig / Kakao', gruppeId: 'nussig-kakao-gruppe', gruppeLabel: 'Nussig/Kakao', sca: { gruppeId: 'kakao', aromaId: 'zartbitterschokolade' } },
  { nummer: 56, name: 'Schokolade', nameOriginal: 'Chocolate', kategorieId: 'nussig-kakao', kategorieLabel: 'Nussig / Kakao', gruppeId: 'nussig-kakao-gruppe', gruppeLabel: 'Nussig/Kakao', sca: { gruppeId: 'kakao', aromaId: 'schokolade' } },

  // Sweet — eine Gruppe, vier Flaeschchen.
  { nummer: 57, name: 'Brauner Zucker', nameOriginal: 'Brown Sugar', kategorieId: 'suess', kategorieLabel: 'Süß', gruppeId: 'suess-gruppe', gruppeLabel: 'Süß', sca: { gruppeId: 'brauner-zucker', aromaId: 'melasse' } },
  { nummer: 58, name: 'Ahornsirup', nameOriginal: 'Maple Syrup', kategorieId: 'suess', kategorieLabel: 'Süß', gruppeId: 'suess-gruppe', gruppeLabel: 'Süß', sca: { gruppeId: 'brauner-zucker', aromaId: 'ahornsirup' } },
  { nummer: 59, name: 'Karamellisiert', nameOriginal: 'Caramelized', kategorieId: 'suess', kategorieLabel: 'Süß', gruppeId: 'suess-gruppe', gruppeLabel: 'Süß', sca: { gruppeId: 'brauner-zucker', aromaId: 'karamellisiert' } },
  { nummer: 60, name: 'Vanille', nameOriginal: 'Vanilla', kategorieId: 'suess', kategorieLabel: 'Süß', gruppeId: 'suess-gruppe', gruppeLabel: 'Süß', sca: { gruppeId: 'vanille', aromaId: 'vanille' } },
];

const FLAESCHCHEN_NACH_NUMMER = new Map(FLAESCHCHEN.map((f) => [f.nummer, f] as const));

/** Der Kurzindex-Eintrag zu einer Flaeschchennummer. */
export function flaeschchenZu(nummer: number): Flaeschchen | undefined {
  return FLAESCHCHEN_NACH_NUMMER.get(nummer);
}
