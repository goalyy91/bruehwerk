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
