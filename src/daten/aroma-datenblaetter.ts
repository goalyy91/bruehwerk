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

  {
    nummer: 16,
    name: 'Apfel',
    nameOriginal: 'Apple',
    kategorieId: 'fruchtig',
    kategorieLabel: 'Fruchtig',
    beschreibung: [
      'Apfel riecht warm, fruchtig, knackig und leicht süß — ein Duft, der eine weiche, saftige Textur verspricht.',
      'Der Geruch kann an einen klaren Herbsttag erinnern, an warmen Apfelkuchen oder an eine Küche, in der gerade Apfelmus köchelt. Genauso gut weckt er Assoziationen an Sommerwürste, Apfeltaschen, Weißwein oder kleine Fruchtsaft-Trinkpäckchen.',
    ],
    abschnitte: [
      {
        titel: 'Taxonomie',
        text: ['Die Frucht des Baums Malus domestica.'],
      },
      {
        titel: 'Die Pflanze',
        text: [
          'Dieser Laubbaum trägt eine fleischige Kernfrucht in vielen Formen und Größen, meist rundlich, die beim Reifen rot, gelb oder rosa wird. Die Blüten müssen fremdbestäubt werden, im kommerziellen Anbau übernehmen das fast immer Honigbienen. Es gibt Tausende Apfelsorten, die Vorfahren des Baums stammen vermutlich aus dem Gebirge Zentralasiens. Kultiviert wird der Baum seit bis zu 10.000 Jahren, und er reiste mit Händlern, Entdeckern und Bauern um die ganze Welt.',
        ],
      },
      {
        titel: 'Geschichte',
        text: [
          'Der Apfel gehört zu den vielleicht berüchtigtsten Früchten überhaupt: Er steht für Wissen, Unsterblichkeit, Versuchung, Gesundheit und den Sündenfall — in der Bibel überredet Eva Adam, von ihm zu essen. Nachdem er sich so seinen Platz in der Geschichte gesichert hatte, schrieben die Griechen über den Apfel als Symbol für Liebe und Sexualität. In heidnischen Traditionen steht er für Fruchtbarkeit.',
        ],
      },
      {
        titel: 'Chemie',
        text: [
          'Im Aromaprofil des Apfels wurden mehr als 300 flüchtige Verbindungen gemessen, darunter Alkohole, Aldehyde, Ester und Ketone. Untersuchungen legen allerdings nahe, dass nur wenige davon spürbar zum Geruch beitragen. Aldehyde dominieren, während die Frucht reift, Alkohole entwickeln sich mit ihr weiter. Acetaldehyd, Hexanal und trans-2-Hexenal stehen für die grünen, unreifen Noten. Ester bilden das endgültige Aroma des reifen Apfels: Bei reifen Äpfeln machen Alkohole je nach Sorte 6 bis 16 Prozent der gesamten flüchtigen Stoffe aus, Ester dagegen 80 bis 98 Prozent. Butylacetat, Hexylacetat, Ethylacetat, 2-Methylbutylacetat und Ethyl-2-methylbutanoat sind wegen ihres hohen Anteils und ihrer Wirkung auf die verschiedenen Apfelaromen die wichtigsten Ester. Wie viel davon entsteht, hängt von genetischen Faktoren, dem Anbau, dem Reifegrad bei der Ernte und den Lagerbedingungen ab.',
        ],
      },
    ],
    imKaffee: [
      {
        titel: '',
        text: [
          'Das WCR Sensory Lexicon beschreibt Apfel als „eine süße, leichte, fruchtige, etwas blumige Note, die man üblicherweise mit frischen oder verarbeiteten Äpfeln verbindet“. Das klingt vage, doch tatsächlich lassen sich im Kaffee sowohl der Duft frischer als auch der gekochter Äpfel wiederfinden. Apfelaroma und -geschmack im Kaffee werden oft mit einer Art knackiger, apfelsäure-betonter Säure in Verbindung gebracht. Ebenso kann die Note an warmes Gebäck oder Backwaren wie Apfelkuchen erinnern. Viele Kaffees weltweit werden gerade für die Apfel-Qualität ihres Aromas geschätzt.',
        ],
      },
      {
        titel: 'Nachernte-Verarbeitung',
        text: [
          'Die Verbindung zu einer klaren, knackigen Textur und Säure wird oft für ostafrikanische Kaffees verwendet. Traditionell fand sich Apfelaroma häufig in gewaschenen Milds aus Kolumbien und Mittelamerika — Apfelnoten werden generell am ehesten mit dem Profil gewaschener, sauberer Kaffees assoziiert. Tatsächlich sind 3-Methylbutanal, Benzaldehyd, Acetaldehyd und Ethylacetat allesamt mit der gewaschenen Aufbereitung in Verbindung gebracht worden. 3-Methylbutanal und Acetaldehyd insbesondere gelten als jene Stoffe, die nach Apfel riechen. Diese Aldehyde entstehen Berichten zufolge hauptsächlich als Zwischenprodukte der Fermentation durch Hefen und Milchsäurebakterien. Ethylacetat ist als kennzeichnender Stoff für Ananas bekannt und kann in geringerer Konzentration bestimmten Apfelnoten ähneln.',
          'Mit den Fortschritten der Nachernte-Verarbeitung weltweit lässt sich diese fruchtige Eigenschaft heute in vielen Kaffeearten entdecken. Ein Apfelaroma kann natürlich auch in natural aufbereiteten Kaffees vorkommen, wird dort aber meist von auffälligeren, reifen Fruchtnoten wie Erdbeere, Ananas oder sogar Backpflaume überdeckt. Allgemein gilt: Je länger die Fermentation, desto mehr fruchtige Noten treten hervor und desto dominanter werden sie im Kaffee. Bestimmte Hefen wie Pichia und Candida sind dafür bekannt, fruchtige Ester zu erzeugen, während sie das Fruchtfleisch der Kaffeekirsche verstoffwechseln.',
        ],
      },
    ],
    verwandte: [
      { nummer: 12, original: 'Ananas' },
      { nummer: 49, original: 'Zimt' },
      { nummer: 48, original: 'Muskatnuss' },
    ],
  },

  {
    nummer: 17,
    name: 'Pfirsich',
    nameOriginal: 'Peach',
    kategorieId: 'fruchtig',
    kategorieLabel: 'Fruchtig',
    beschreibung: [
      'Pfirsich riecht nach weicher Frucht, saftiger Säure und blumigen Noten. Dazu kann ein holziger oder grüner Zug kommen.',
      'Das Aroma kann an sommerliche Hitze erinnern, an andere Früchte wie Litschi oder Birne, oder an einen Cobbler, eine Torte oder anderes Gebäck. Als hoch verderbliche Frucht zählt der Pfirsich zu den saftigsten, weichsten und empfindlichsten Köstlichkeiten überhaupt.',
    ],
    abschnitte: [
      {
        titel: 'Taxonomie',
        text: [
          'Die Frucht des Baums Prunus persica. Er gehört zur Familie der Rosengewächse (Rosaceae), zu der unter anderem auch Mandel, Apfel, Himbeere, Birne und Kirsche zählen.',
        ],
      },
      {
        titel: 'Die Pflanze',
        text: [
          'Der Pfirsichbaum ist ein niedriger, breit wachsender Laubbaum von bis zu 6 Metern Höhe, mit glatter Rinde und ovalen Blättern. Ein einziges Gen unterscheidet ihn von seinem genetischen Geschwister, der Nektarine, der die feinen Härchen fehlen, die dem Pfirsich seine charakteristisch flaumige Schale geben. Die Blüten sind klein, vielblättrig, rosa, rosé oder ins Rote spielend. Die runde Frucht ist eine flaumige Steinfrucht mit einem holzigen Kern, der den Samen umschließt. Sie ist außen pink, rot oder orange, innen gelb- oder orangefleischig. Als klimakterische Frucht — eine, die nach der Ernte noch nachreift — reift sie schnell nach, wird dabei weich und ist entsprechend schwer zu lagern und zu transportieren. Nach Apfel und Birne ist der Pfirsich die drittwichtigste Baumfrucht gemäßigter Klimazonen. Er ist anfällig für Schädlinge und Krankheiten und braucht jährlichen Rückschnitt und gute Pflege, um gut zu tragen. In Plantagen tragen die Bäume üblicherweise 10 bis 20 Jahre lang.',
        ],
      },
      {
        titel: 'Geschichte',
        text: [
          'Der Pfirsich stammt aus China und verbreitete sich vor etwa 3.000 Jahren über ganz Asien. Über alte Handelsrouten gelangte er in den Nahen Osten und den Mittelmeerraum und schließlich nach Europa. Spanische Entdecker brachten ihn nach Amerika — bereits um 1600 war er in Mexiko nachgewiesen.',
        ],
      },
      {
        titel: 'Chemie',
        text: [
          'Die besondere, weiche Frische des Pfirsicharomas setzt sich aus Lactonen, Aldehyden, Alkoholen, Estern und Terpenoiden zusammen. Das Lacton γ-Decalacton gilt als einer der wichtigsten Bausteine des Pfirsicharomas und wird von der Aromen- und Duftstoffindustrie genutzt, um den natürlichen Duft nachzubilden. Fruchtige Ester wie Ethylacetat, Hexenylacetat, Ethylbutanoat und Butylacetat erzeugen das einladende Fruchtbukett. Wichtige Aldehyde wie (E)-2-Hexenol, (Z)-3-Hexenal und (E)-2-Hexenal steuern grüne, grasige und holzige Noten bei, die das Aroma abrunden. Linalool, eines der bedeutendsten enthaltenen Terpene, bringt die blumige Seite ein.',
        ],
      },
    ],
    imKaffee: [
      {
        titel: '',
        text: [
          'Das WCR Sensory Lexicon beschreibt Pfirsich als „die blumige, parfümierte, fruchtige, süße, leicht saure Note, die man mit Pfirsichen verbindet“. Im Kaffee wirkt der Duft von Pfirsich warm, weich und saftig. Er findet sich in vielen Kaffees, über viele Sorten hinweg, bei gewaschener wie bei weniger traditioneller Verarbeitung. Pfirsich lässt sich außerdem mit der Textur oder dem Mundgefühl eines Kaffees verbinden — besonders dann, wenn ein Kaffee als weich oder samtig empfunden wird.',
        ],
      },
      {
        titel: 'Pflanze',
        text: [
          'Vermutlich spielt die Genetik eine Rolle bei der Entstehung dieser Note: Bestimmte Sorten, etwa Gesha oder wilde äthiopische Kaffees mit einer besonders blumigen, angenehmen Säure, nehmen oft ebenfalls eine Pfirsich-Qualität an. Blumigkeit gepaart mit mittelstarker Säure lässt den Verkoster vermutlich an einen weichen Pfirsich denken.',
        ],
      },
      {
        titel: 'Nachernte-Verarbeitung',
        text: [
          'Auch die Verarbeitung kann zu einem pfirsichartigen Aroma im Kaffee führen, besonders bei anaerober Fermentation. Milchsäurebakterien und Hefen, die in sauerstoffarmer Umgebung begünstigt werden, hinterlassen dabei eine einladende Vielfalt an Stoffwechselprodukten, die dieses saftige, süße Fruchtaroma mit sich bringen können.',
        ],
      },
    ],
    verwandte: [
      { nummer: 16, original: 'Apfel' },
      { nummer: 13, original: 'Mango' },
      { nummer: 8, original: 'Erdbeere' },
      { nummer: 11, original: 'Kirsche' },
      { nummer: 1, original: 'Honig' },
      { nummer: 3, original: 'Rose' },
    ],
  },

  {
    nummer: 18,
    name: 'Orange',
    nameOriginal: 'Orange',
    kategorieId: 'fruchtig',
    kategorieLabel: 'Fruchtig',
    beschreibung: [
      'Orange riecht warm und zitrisch, mit Noten von Blüten, Vanille und Jasmin. Die Schale wirkt im Gegensatz zur Frucht intensiver und kann schon eine adstringierende oder bittere Note ankündigen.',
      'Orangenaroma gilt, verglichen mit anderen Zitrusfrüchten, als eher süß. Ihre Größe und saftige Textur machen Orangen weltweit beliebt. Anders als andere Zitrusfrüchte werden sie durchaus pur gegessen, dienen aber ebenso als Zutat für süße wie herzhafte Gerichte. Der Geruch kann an Orangensaft erinnern, an Orangenhähnchen, an eine Mimosa (Sekt mit Orangensaft), an Marmelade oder an einen umgestürzten Kuchen.',
    ],
    abschnitte: [
      {
        titel: 'Taxonomie',
        text: [
          'Orangen sind die Frucht des Baums Citrus sinensis. Botanisch vermutlich eine Kreuzung aus Mandarine und Pomelo.',
        ],
      },
      {
        titel: 'Chemie',
        text: [
          'Die Schale trägt ein konzentriertes Aroma, intensiver und bitterer als das der süßen Frucht und ihres Safts. Bekannte Duftstoffe darin sind Limonen, Linalool, Ethylbutyrat, Octanal und Decanal, dazu weitere Alkohole, Aldehyde und Ester — viele davon allen Zitrusfrüchten gemeinsam. Reif werden Methanol, Ethanol und Acetaldehyd zu wichtigen Geschmacksstoffen im Saft. Der Geschmack von Orangensaft setzt sich außerdem aus Zitronensäure, Fruktose und Glukose zusammen, die zusammen das runde Orangenaroma ergeben.',
        ],
      },
    ],
    imKaffee: [
      {
        titel: '',
        text: [
          'Das WCR Sensory Lexicon beschreibt Orange als „die zitrische, süße, blumige, leicht saure Note, die man mit Orangen verbindet, mitunter mit bitteren, schaligen und adstringierenden Zügen“. Im Kaffee wirkt eine Orangen-Note vergleichsweise süß, verglichen mit der herberen, saureren und holzigeren Limette oder Zitrone. Traditionell war diese Zitrusnote verbreitet in gewaschenen Kaffees aus Mittelamerika, ausgeglichen durch Schokoladennoten. Die Kombination Schokolade-Orange ist bis heute ein gängiges Marketing-Etikett für solche unkomplizierten, ausgewogenen Kaffees.',
          'Für Verkoster wird die Orangen-Note meist in (Orangen-)Schale oder Blüte unterschieden — vermutlich abhängig von der insgesamt wahrgenommenen Intensität. Ist der Duft leicht und zart, wird eher eine blumige Note beschrieben. Tritt Orange dagegen kräftig und durchdringend auf, wird eher von Orangenschale gesprochen. Süß gegen kiefrig-terpenartig — diese Unterscheidung ergibt sowohl chemisch als auch in der Kaffeemischung Sinn.',
        ],
      },
      {
        titel: 'Die Pflanze und Nachernte-Verarbeitung',
        text: [
          'Die typischen Zitrusterpene Limonen, Linalool und Geraniole finden sich alle auch im Kaffee. Wie sie mit den übrigen Bestandteilen der komplexen Mischung zusammenwirken, ist nicht abschließend geklärt — bekannt ist aber ein Zusammenhang mit der genetischen Sorte und der Art der Nachernte-Verarbeitung.',
        ],
      },
    ],
    verwandte: [
      { nummer: 19, original: 'Zitrone' },
      { nummer: 20, original: 'Limette' },
      { nummer: 4, original: 'Jasmin' },
      { nummer: 60, original: 'Vanille' },
    ],
  },

  {
    nummer: 19,
    name: 'Zitrone',
    nameOriginal: 'Lemon',
    kategorieId: 'fruchtig',
    kategorieLabel: 'Fruchtig',
    beschreibung: [
      'Zitrone riecht scharf, herb, saftig und säuerlich. Die Schale hat ein eigenes Aroma — ihre harzigen, holzigen Öle können einen ganzen Raum durchduften.',
      'Der charakteristische Geschmack des Zitronensafts kommt von einer Mischung mehrerer Säuren. Als adstringierende Zitrusfrucht wird Zitrone kaum pur gegessen. Verbreitet ist sie in Limonade, Limoncello, Cocktails oder zu Cremes für Desserts verarbeitet. Auch zum Marinieren von Fisch und Geflügel dient sie. Die Schale findet sich häufig beim Backen und in Cocktails wieder.',
    ],
    abschnitte: [
      {
        titel: 'Taxonomie',
        text: [
          'Die Frucht des Baums Citrus limon aus der Familie der Rautengewächse (Rutaceae).',
        ],
      },
      {
        titel: 'Die Pflanze',
        text: [
          'Die Zitrone ist ein immergrüner Strauch oder kleiner Baum. Wo genau er ursprünglich herstammt, ist unklar — vermutlich aus Asien. Er wächst heute in tropischen und subtropischen Regionen weltweit. Kultivierte Zitronenbäume werden meist auf andere Zitruspflanzen veredelt, um Gesundheit und Ertrag zu verbessern. Sie blühen das ganze Jahr über, und die Früchte lassen sich 6- bis 10-mal jährlich ernten. Eine ausgewachsene, im Anbau erzeugte Frucht misst etwa 5 Zentimeter im Durchmesser. Die dicke, schwammige, genoppte Schale trägt den schönen Namen „Zest“ und ist für ihren kräftigen Beitrag zu vielen Produkten bekannt. Das fleischige Innere ist in Segmente geteilt, gefüllt mit saftigen Kammern. Ein durchschnittlicher Baum in einer Plantage bringt es auf rund 1.500 Zitronen im Jahr.',
        ],
      },
      {
        titel: 'Chemie',
        text: [
          'Zitrone ist, so fruchtig sie auch riecht, chemisch vor allem von einer Gruppe von Terpenen geprägt. Terpenoide — meist kiefrig und harzig — erzeugen den harzigen, lang anhaltenden, hellen und zugleich bitteren Duft, den man mit Zitronenschale verbindet. Dazu zählen Citral, Neral, Geranial und Limonen. Im Saft selbst stecken zusätzlich fruchtige Ester und Aldehyde sowie Zitronen- und Ascorbinsäure, die den Mund zusammenziehen und den Speichelfluss anregen.',
        ],
      },
    ],
    imKaffee: [
      {
        titel: '',
        text: [
          'Das WCR Sensory Lexicon beschreibt Zitrone als „die zitrische, saure, adstringierende, leicht süße, schalige und etwas blumige Note, die man mit Zitrone verbindet“. Traditionell gilt Zitronensäure im Kaffee als seltenes, besonderes Merkmal. Bleibt der Zitronenton auch beim Abkühlen der Tasse bestehen, gilt das besonders oft als Zeichen für hohe Qualität. Bestimmte Kaffees wie äthiopischer Yirgacheffe und Panama-Gesha zeigen genau diese blumig-zitronigen Noten. Zitrone findet sich auch in gewaschenen mittelamerikanischen Kaffees oder in kolumbianischen Milds. Manche Robustas, etwa aus Indien, werden ebenfalls mit einer zitronigen Frische beschrieben. Ein feiner, lang anhaltender Zitronenton gilt in jedem Kaffee als echte Auszeichnung.',
        ],
      },
      {
        titel: 'Pflanze',
        text: [
          'Ein Teil des Zitronenaromas im Kaffee stammt nachweislich aus der Genetik der Pflanze selbst. Limonen, Pinen und weitere Terpene gelten gezielt als Kennzeichen hochwertiger Kaffees — die genetische Ausstattung mancher Sorten führt dazu, dass sie diese Stoffe bilden. Zwei Aldehyde, Nonanal und Decanal, sind im Kaffee als Beitrag zu einer zitronenartigen Note identifiziert; beide finden sich auch schon im grünen, ungerösteten Kaffee.',
        ],
      },
      {
        titel: 'Nachernte-Verarbeitung',
        text: [
          'Moderne Fortschritte in der Nachernte-Verarbeitung haben zitronigen Kaffees weltweit zu mehr Aufmerksamkeit verholfen. Vor allem anaerobe Verfahren führen zu einem kräftigen Zitronenaroma. Lange Fermentationen, anaerobe Bedingungen und die kohlensäuregestützte Mazeration (Carbonic Maceration) erzeugen deutlich säurebetontere, hellere, zitronenartigere Kaffees, wie man sie zunehmend im Handel findet. Auch hier gilt: Bestimmte Mikroorganismen, darunter Hefen, erzeugen nachweislich zitronige Aromen, während sie das Fruchtfleisch der Kaffeekirsche verstoffwechseln.',
        ],
      },
    ],
    verwandte: [
      { nummer: 18, original: 'Orange' },
      { nummer: 20, original: 'Limette' },
      { nummer: 4, original: 'Jasmin' },
      { nummer: 30, original: 'Kiefer' },
    ],
  },

  {
    nummer: 20,
    name: 'Limette',
    nameOriginal: 'Lime',
    kategorieId: 'fruchtig',
    kategorieLabel: 'Fruchtig',
    beschreibung: [
      'Limette riecht grün, grasig, frisch, harzig, herb und zitrisch. Im Geschmack ist die Frucht sauer, scharf und adstringierend — sie zieht den Mund zusammen —, weshalb man sie kaum pur isst.',
      'Wie andere Zitrusfrüchte wird Limette vor allem in der Küche verwendet. Die Schale ist für ihre besonders intensiven Aromastoffe bekannt: Dreht man sie, treten die Öldrüsen leicht aus. Limetten enthalten im Vergleich zu Zitronen mehr Säure und zugleich mehr Zucker. Sie gehören zu vielen Küchen weltweit, allen voran der mexikanischen und der thailändischen — die Kaffir-Limette ist dort ein traditioneller Bestandteil, oft getrocknet verwendet. Der Saft dient als Marinade für Avocado, Fleisch und Fisch, Frucht und Schale häufig als Garnitur. Der Geruch kann an ein süßes Mixgetränk erinnern, an ein scharfes Curry, an Guacamole, an eine Süßspeise oder an Gin Tonic.',
    ],
    abschnitte: [
      {
        titel: 'Taxonomie',
        text: [
          'Die Limette ist eine Frucht der Gattung Citrus. Zu ihr zählen mehrere Arten, darunter Citrus latifolia (die Persische Limette), Citrus aurantifolia (Key- oder Mexikanische Limette), Citrus hystrix (Kaffir- oder Makrut-Limette) und weitere.',
        ],
      },
      {
        titel: 'Die Pflanze',
        text: [
          'Limetten sind eng mit Zitronen verwandt, manche Arten sind sogar Kreuzungen aus beiden. Der Baum stammt ursprünglich aus Südostasien, ist immergrün, trägt kleine weiße Blüten und Früchte von 3 bis 4 Zentimetern Durchmesser. Die Schale ist dünner als bei anderen Zitrusfrüchten, hat aber dieselbe genoppte Struktur und dieselben flüchtigen Öle. Wie andere Zitrusgewächse blüht die Limette das ganze Jahr über und lässt sich mehrfach im Jahr ernten. Sie gedeiht leicht in tropischem und subtropischem Klima weltweit. Limettenöl findet sich häufig in Reinigungsmitteln, Kosmetik und Parfüm.',
        ],
      },
      {
        titel: 'Chemie',
        text: [
          'Geschmacklich dominieren Ascorbinsäure (Vitamin C) und Essigsäure, beide in hoher Konzentration. Wie bei Zitrone und Orange setzt sich das Aroma vor allem aus Terpen-Kohlenwasserstoffen, Aldehyden, Alkoholen, Estern und Ketonen zusammen. Zu den wichtigen Aromastoffen zählen Limonen, Citral, Pinen und Myrcen — sie erzeugen die zitrischen und holzigen Noten.',
        ],
      },
    ],
    imKaffee: [
      {
        titel: '',
        text: [
          'Das WCR Sensory Lexicon beschreibt Limette als „die zitrische, saure, adstringierende, bittere, grüne, schalige, scharfe und leicht blumige Note, die man mit Limetten verbindet“. Im Kaffee wirkt eine Limetten-Note meist dunkler und grasiger als Zitrone oder Orange. Traditionell ist dieses Zitrusaroma ein verbreitetes Merkmal gewaschener Kaffees aus Mittelamerika und Kolumbien, oft im Ausgleich mit Schokoladennoten. Es hängt vermutlich eng mit einer guten Säurequalität zusammen. Wie bei Zitrone gilt: Bleibt die Limetten-Säure auch beim Abkühlen der Tasse erhalten, spricht das seit Langem für einen hochwertigen Kaffee. Besondere Kaffees wie die Panama-Gesha- und äthiopische Sorten zeigen oft blumige und zitrische Noten, die sie als herausragend auszeichnen.',
        ],
      },
      {
        titel: 'Nachernte-Verarbeitung',
        text: [
          'Mit den Fortschritten in der Kaffeeverarbeitung sind Zitrusnoten, Limette eingeschlossen, in der Tasse häufiger und dominanter geworden. Das gilt besonders für Kaffees, die mit Mikroorganismen beimpft oder unter anaeroben Bedingungen fermentiert wurden. Bestimmte Mikroorganismen, darunter Hefen, erzeugen nachweislich Zitrusaromen, während sie das Fruchtfleisch der Kaffeekirsche verstoffwechseln.',
        ],
      },
    ],
    verwandte: [
      { nummer: 19, original: 'Zitrone' },
      { nummer: 18, original: 'Orange' },
      { nummer: 25, original: 'Frisches Gras' },
    ],
  },

  {
    nummer: 36,
    name: 'Muffig/Erdig',
    nameOriginal: 'Musty/Earthy',
    kategorieId: 'sonstiges',
    kategorieLabel: 'Sonstiges',
    beschreibung: [
      'Dieses Aroma vermittelt feuchte oder frisch umgegrabene Erde. Es riecht süßlich und entsteht beim Abbau organischer Substanz im Boden.',
      'Dieser Geruch findet sich in vielen Lebensmitteln und Getränken. Viele davon kommen unmittelbar aus dem Boden, etwa Rote Bete. Andere haben eine Alterung oder Fermentation durchlaufen, etwa bestimmte Teesorten. Bei manchen Produkten, etwa Bier, gilt eine muffig-erdige Note als Fehlton. Verursacht wird der Geruch von Mikroorganismen, die in der jeweiligen Umgebung arbeiten.',
    ],
    abschnitte: [
      {
        titel: 'Chemie',
        text: [
          'Die Hauptverantwortlichen für dieses Aroma sind Geosmin und 2-Methylisoborneol. Beide entstehen, wenn Bakterien und Pilze totes organisches Material abbauen.',
          'Geosmin — griechisch wörtlich „Erdgeruch“ — wurde vor mehr als 100 Jahren erstmals beschrieben, chemisch aber erst Mitte des 20. Jahrhunderts identifiziert. Im Boden bilden Bakterien der Gattung Streptomyces diese Verbindung, im Wasser vor allem Cyanobakterien. Auch verschiedene andere Organismen können sie als Stoffwechselprodukt erzeugen, darunter weitere Bakterien, Pilze, Pflanzen und sogar Insekten. Geosmin gilt als Ursache vieler sensorischer Mängel in Trinkwasser sowie in Obst und Gemüse wie Trauben, Pilzen, Karotten, Spinat und Roter Bete. Die menschliche Nase reagiert außerordentlich empfindlich darauf — der Geruchsschwellenwert liegt bei nur 6 bis 10 Nanogramm pro Liter. Das ist mit ein Grund, warum Geosmin so häufig für Produktfehler verantwortlich gemacht wird.',
          'Auch die Verbindung 2-Methylisoborneol (MIB) trägt zu einer muffig-erdigen Note bei — ebenfalls mit einem niedrigen Geruchsschwellenwert. In hoher Konzentration wirkt sie holzig, teerig oder sogar schimmlig. Terrasol (2-Ethylfenchol) verströmt bei seinem Auftreten ebenfalls einen kräftigen Geruch nach nasser Erde, manchmal auch nach Regen, Kiefer oder anderem Holz, nach Pilzen oder nach Patschuli. Als Fehlton ist es bei Bier, Wein, Tee und Wasser bekannt.',
        ],
      },
    ],
    imKaffee: [
      {
        titel: '',
        text: [
          'Das WCR Sensory Lexicon beschreibt diese Note als „die etwas süße, schwere Note, die man mit verrottender Vegetation und feuchter, schwarzer Erde verbindet“.',
        ],
      },
      {
        titel: 'Nachernte-Verarbeitung',
        text: [
          'Man ging früher davon aus, dass muffig-erdige Aromen im Kaffee allein aus der natural-Aufbereitung stammen, wegen der räumlichen Nähe des Kaffees zum Boden. Ein besseres Verständnis der Mikrobiologie des Kaffees und seiner Umgebung hat inzwischen gezeigt, dass Bakterien und Pilze mehrfach Gelegenheit haben, mit dem Kaffee in Kontakt zu kommen — meist während der Verarbeitungs- und Trocknungsphase, wenn noch genug Wasser oder Feuchtigkeit vorhanden ist, um mikrobielles Leben zu tragen. Dürfen diese Mikroorganismen zu lange gedeihen, hört die kräftige muffig-erdige Note auf, ein feines Aroma zu sein, und wird schnell zu einem überwältigenden negativen Charakterzug.',
          'Traditionell gelten Kaffeeprofile aus Indonesien, Papua-Neuguinea und Indien als reich an muffig-erdigem Charakter. Auch Robustas zeigen ähnliche Noten, vermutlich wegen der traditionellen Verarbeitungsmethode und dem dabei angewandten Sorgfaltsgrad. Manche natural aufbereitete Kaffees, etwa aus Äthiopien, können dieses Aroma ebenfalls zeigen. Ob die Note als positiv oder negativ wahrgenommen wird, entscheidet vor allem ihre Balance mit den übrigen Eigenschaften eines Kaffees. Weil die Kaffeequalität weltweit gestiegen ist, kommt diese Auffälligkeit heute seltener vor. Gleichzeitig werden manche Kaffees gerade für ihre erwartete Erdigkeit geschätzt, etwa manche aus Indonesien, wo sie zu einem positiven Unterscheidungsmerkmal am Markt werden kann.',
        ],
      },
    ],
    verwandte: [
      { nummer: 35, original: 'Schimmlig/Feucht' },
      { nummer: 32, original: 'Kartoffel' },
      { nummer: 34, original: 'Holzig' },
      { nummer: 30, original: 'Kiefer' },
    ],
  },

  {
    nummer: 37,
    name: 'Leder',
    nameOriginal: 'Leather',
    kategorieId: 'sonstiges',
    kategorieLabel: 'Sonstiges',
    beschreibung: [
      'Leder hat ein unverwechselbares, wiedererkennbares Aroma: erdig, kräftig, manchmal holzig und warm. Der Geruch kann an einen Bauernhof mit Tieren denken lassen, an Schuhe, an einen Kleiderschrank, an Satteltaschen oder an eine denkwürdige, gereifte Flasche Wein.',
      'Der Geruch von Leder beeinflusst nachweislich Kaufentscheidungen bei bestimmten Produkten wie Autos, Möbeln und Schuhen.',
    ],
    abschnitte: [
      {
        titel: 'Der Prozess',
        text: [
          'Leder ist eine behandelte und konservierte Tierhaut, mit mehreren verschiedenen Chemikalien verarbeitet. Ein Verfahren namens Gerben konserviert sie und macht sie geschmeidig und flexibel. Der Name kommt daher, dass ursprünglich natürliche Pflanzengerbstoffe aus Baumrinde und Blättern verwendet wurden. Moderne Verfahren nutzen unter anderem Säuren, Eisen, Zink, Chrom, Zeolithe und Kalk. Eine Tierhaut gilt erst nach dem Gerben als Leder.',
        ],
      },
      {
        titel: 'Geschichte',
        text: [
          'Menschen gerben Häute seit mehr als 7.000 Jahren, um sie haltbar zu machen — schon in der Steinzeit wurde Leder zu Kleidung, Schuhen und Unterkünften verarbeitet. Im europäischen Mittelalter verbesserte sich das Verfahren und verbreitete sich weiter.',
        ],
      },
      {
        titel: 'Chemie',
        text: [
          'Der typische Ledergeruch setzt sich aus einer großen Mischung zusammen, darunter Phenole, Aldehyde, Lactone und Benzole. Zu den nennenswerten Phenolen zählen Vanillin, 4-Ethylphenol, Benzothiazol und 3-Methylphenol. Aldehyde steuern die würzige Seite des Aromas bei: 2-Nonenal riecht grasig-fettig-tierisch, Hexanal grasig, Octanal fruchtig, Nonanal sowohl blumig als auch fruchtig. Dazu kommt 2,4,6-Tribromanisol, ein erdig-muffiges Benzol-Derivat, das im Ledergeruch häufig vorkommt.',
        ],
      },
    ],
    imKaffee: [
      {
        titel: '',
        text: [
          'Leder kann im Kaffee je nach Qualität und Intensität des Aromas positiv oder negativ wirken. Tritt es stark, durchdringend und überwältigend auf, gilt es als Auffälligkeit. Wirkt es dagegen reichhaltig, warm und gut eingebunden, gilt es als positive Eigenschaft. Man findet es in indonesischen, äthiopischen Harrar-, kongolesischen (DRC) und jemenitischen Kaffees. Bei feinen Robusta-Kaffees gilt Leder oft sogar als Qualitätsmerkmal.',
        ],
      },
      {
        titel: 'Nachernte-Verarbeitung',
        text: [
          'Die Nachernte-Verarbeitung beeinflusst dieses Aroma im Kaffee zweifellos: Viele natural aufbereitete Kaffees entwickeln Lederaromen zusammen mit dunklen Frucht- und weinigen Noten bei längerer Trocknung oder Fermentation. Der genaue Weg dorthin ist unklar, vermutlich ein Zusammenspiel mikrobieller Stoffwechselprodukte, die beim Rösten dann miteinander reagieren.',
        ],
      },
      {
        titel: 'Röstung',
        text: [
          'Auch das Röstprofil beeinflusst ledrige und ähnliche Noten. Viele Phenole entstehen erst während des Röstens, und die meisten tragen in geringer Konzentration positiv zum bekannten Röstaroma bei. Andere dagegen, in höherer Konzentration — etwa die Methylphenole, die beim Überrösten entstehen —, werden mit ledrigen und medizinischen Noten in Verbindung gebracht. Hohe Temperaturen zersetzen das Lignin in den Zellwänden der Kaffeebohne (Pyrolyse) und bilden dabei phenolische Verbindungen. Auch Chlorogensäuren wandeln sich in verschiedene Phenole um, etwa Guajacol und Vanillin, sowie in Methylphenole und Kresol, die zur ledrigen Note beitragen. Beim Rösten entstehende Pyrazine können diesen Geruch zusätzlich verstärken.',
        ],
      },
    ],
    verwandte: [
      { nummer: 38, original: 'Medizinisch' },
      { nummer: 36, original: 'Muffig/Erdig' },
      { nummer: 50, original: 'Gewürznelke' },
      { nummer: 60, original: 'Vanille' },
      { nummer: 41, original: 'Tabak' },
    ],
  },

  {
    nummer: 38,
    name: 'Medizinisch',
    nameOriginal: 'Medicinal',
    kategorieId: 'sonstiges',
    kategorieLabel: 'Sonstiges',
    beschreibung: [
      'Ein beißender, chemischer, plastikartiger, jodartiger Geruch, mitunter mit einer würzigen Note.',
      'Der Geruch ähnelt dem eines Lagerfeuers, eines Krankenhauses oder von verbranntem Plastik. In vielen Produkten ist er eine klare Auffälligkeit — auch bei Kaffee, Oliven, Softdrinks, Saft, Wein und Bier.',
    ],
    abschnitte: [
      {
        titel: 'Chemie',
        text: [
          'Die charakteristische Mischung aus rauchigen Noten (Guajacol), einem jodartigen Zug und harten phenolischen Tönen (Kresol) prägt den medizinischen Geruch. Diese phenolischen Verbindungen — Verbindungen mit einem aromatischen Ring und einer oder mehreren Hydroxylgruppen (OH) — dominieren das Aroma so sehr, dass es fast überall, wo es auftritt, als Auffälligkeit gilt.',
          'Zu den phenolischen Verbindungen zählen unter anderem Phenolsäuren, Flavonoide, Tannine, Cumarine, Lignane, Chinone, Stilbene und Curcuminoide. Sie entstehen als sekundäre Stoffwechselprodukte in Pflanzen und kommen dort weit verbreitet vor. Phenole können auch von Mikroorganismen erzeugt werden, darunter Hefen und Milchsäurebakterien. Je nach Konzentration bringen sie ganz unterschiedliche Noten mit sich: süß, gekocht, würzig und nelkenartig als positive Töne, rauchig-medizinisch, jodartig oder nach Pflaster als Auffälligkeiten. Zugleich wirken sie als Antioxidantien.',
        ],
      },
    ],
    imKaffee: [
      {
        titel: '',
        text: [
          'Das WCR Sensory Lexicon beschreibt medizinisch als „eine saubere, sterile Note, wie man sie von antiseptischen Produkten wie Pflastern, Alkohol und Jod kennt“. In hoher Intensität ist eine medizinische Note in der Kaffeebranche als Phenol-Fehlton bekannt.',
        ],
      },
      {
        titel: 'Nachernte-Verarbeitung',
        text: [
          'Ohne Zweifel sind Phenole, die während bestimmter Schritte der Kaffeeverarbeitung und Nachernte-Behandlung von Mikroorganismen gebildet werden, für diesen Fehlton verantwortlich — er kann den Kaffee bis zur Ablehnung medizinisch schmecken lassen. Phenole gehören zu den Kernbestandteilen mangelhaften Kaffees. Studien zeigen, dass die Menge phenolischer Verbindungen im grünen Kaffee eng mit der Fermentationsdauer zusammenhängt. Ebenso spricht einiges dafür, dass Chlorogensäuren — die Vorläufer der phenolischen Verbindungen — stark vom Reifegrad der Kaffeekirschen und von der gewählten Nachernte-Methode abhängen. Welche genauen Bedingungen, Mikroben und weiteren Faktoren letztlich zum Phenol-Fehlton führen, ist allerdings noch nicht abschließend geklärt.',
        ],
      },
      {
        titel: 'Röstung',
        text: [
          'Auch das Röstprofil beeinflusst ledrige und ähnliche Noten. Viele Phenole entstehen erst während des Röstens, und die meisten tragen in geringer Konzentration positiv zum bekannten Röstaroma bei. Andere dagegen, in höherer Konzentration — etwa die Methylphenole, die beim Überrösten entstehen —, werden mit ledrigen und medizinischen Noten in Verbindung gebracht. Hohe Temperaturen zersetzen das Lignin in den Zellwänden der Kaffeebohne (Pyrolyse) und bilden dabei phenolische Verbindungen. Auch Chlorogensäuren wandeln sich in verschiedene Phenole um, etwa Guajacol und Vanillin, sowie in Methylphenole und Kresol, die zur ledrigen Note beitragen. Beim Rösten entstehende Pyrazine können diesen Geruch zusätzlich verstärken.',
        ],
      },
    ],
    verwandte: [
      { nummer: 35, original: 'Schimmlig/Feucht' },
      { nummer: 40, original: 'Gummi' },
      { nummer: 37, original: 'Leder' },
    ],
  },

  {
    nummer: 56,
    name: 'Schokolade',
    nameOriginal: 'Chocolate',
    kategorieId: 'nussig-kakao',
    kategorieLabel: 'Nussig / Kakao',
    beschreibung: [
      'Milchschokolade enthält Kakaobutter, Zucker, Milchpulver, Lecithin und Kakao. Sie hat ein intensives, anhaltendes Aroma und einen süßen, milchigen Geschmack mit einem leicht bitteren Akzent vom Kakao.',
      'Das Schokoladenaroma lässt sich als süß, erdig, nussig und röstig beschreiben, mit fruchtigen und blumigen Untertönen. Eine gute Milchschokolade sollte glänzen, nach Vanille und Milch riechen, und der Kakao selbst sollte den Ton angeben. Sie bricht knackig, schmilzt dabei aber rasch im Mund. Schokolade zählt zu den beliebtesten Süßwaren der Welt, und viele verbinden ihren Duft mit Geborgenheit, mit schönen Erinnerungen und mit üppigem Genuss.',
      'Milchschokolade enthält außerdem Milchkonzentrate und wirkt, verglichen mit der Zartbitter-Variante, cremiger, butterartiger und karamelliger. Schokoladenaromen finden sich in heißen Getränken, Schokoriegeln und aufwendigen Desserts wieder.',
    ],
    abschnitte: [
      {
        titel: 'Taxonomie',
        text: ['Die Süßware, hergestellt aus dem fermentierten, gerösteten Samen von Theobroma cacao.'],
      },
      {
        titel: 'Die Pflanze',
        text: ['Siehe Zartbitterschokolade (Nr. 55).'],
      },
      {
        titel: 'Geschichte',
        text: ['Siehe Zartbitterschokolade (Nr. 55).'],
      },
      {
        titel: 'Herstellung',
        text: [
          'Wie Kaffee wird auch Kakao oft auf einem anderen Kontinent angebaut und verarbeitet, als er später verzehrt wird. Die Verarbeitung ähnelt der von Kaffee: Auch hier dreht sich alles um den Samen einer Frucht, der aus dem Fruchtfleisch gelöst und für die weitere Verarbeitung getrocknet werden muss.',
          'Die Fermentation ist entscheidend dafür, dass überhaupt ein Schokoladengeschmack entsteht. Nach der Ernte werden Samen und Fruchtfleisch aus den Kakaoschoten geschabt und fermentiert, meist in Kisten oder Körben. Je nach Sorte dauert das 2 bis 8 Tage. Feine Kakaosorten werden kurz fermentiert (2 bis 4 Tage), Massenware (Handelskakao) dagegen länger (5 bis 7 Tage). Die erste Phase wird von anaeroben Hefen bestimmt und dauert bis zu 36 Stunden. In der zweiten Phase übernehmen Milchsäurebakterien, die von Stunde 48 bis 96 dominieren. In der dritten Phase schließlich, wenn mehr Luft an die Masse kommt, übernehmen Essigsäurebakterien — dabei steigt die Temperatur der gärenden Masse durch chemische Reaktionen auf über 50 °C, was den Keimling im Samen abtötet. Während der Fermentation bilden sich Geschmacksvorstufen, die erst beim Rösten in ihre eigentliche Form verwandelt werden. Nach abgeschlossener Fermentation werden die Samen gewaschen und auf einen Feuchtigkeitsgehalt von 6 bis 8 Prozent getrocknet.',
          'Sind die „Bohnen“ an ihrem Verarbeitungsort angekommen, werden sie geröstet. Das Rösten von Kakaobohnen läuft langsamer und schonender ab als bei Kaffee, bei 120 bis 140 °C für rund 30 Minuten. Anschließend werden die Bohnen gebrochen und von Schale und Keimling befreit — übrig bleiben die Nibs. Die Nibs werden zu einer homogenen Paste oder Kakaomasse gemahlen. In den letzten Schritten, Raffinieren und Conchieren, wird das Produkt weiter fein gemahlen und zu einer glatten Paste homogenisiert. Zucker, Milch und weitere Zutaten kommen beim Raffinieren dazu. Die meisten Schokoladen werden außerdem temperiert — erhitzt, abgekühlt und wieder erwärmt —, damit sie glatt und glänzend bleiben. Erst temperiert lässt sich Schokolade in Formen gießen. Milchschokolade enthält mindestens 20 bis 25 Prozent Kakao; Kakaobutter, Zucker, Milchpulver und Lecithin sorgen zugleich für Geschmack und Textur.',
        ],
      },
      {
        titel: 'Chemie',
        text: [
          '(Mehr zur Chemie siehe Zartbitterschokolade, Nr. 55.) Das Schokoladenaroma entsteht beim Rösten der fermentierten Kakaosamen. Der Duft ist eine komplexe Mischung aus mehr als 600 chemischen Verbindungen, von denen viele erst durch Maillard-Reaktionen beim Rösten entstehen. Insbesondere Methylbutanal und ein ganzes Bukett von Pyrazinen erzeugen den süßen, nussigen, erdigen, röstigen Duft, den wir kennen und mögen.',
        ],
      },
    ],
    imKaffee: [
      {
        titel: '',
        text: [
          'Das WCR Sensory Lexicon beschreibt Schokolade als „eine Mischung aus Kakao, einschließlich Kakaobutter und Dunkelröst-Aromen in unterschiedlicher Intensität“. Sie fällt unter die Kategorie Kakao: „eine braune, süße, staubige, muffige, oft bittere Note, die man mit der Kakaobohne, Kakaopulver und Schokoriegeln verbindet“.',
        ],
      },
      {
        titel: 'Röstung',
        text: [
          'Das Rösten gehört sowohl bei Schokolade als auch bei Kaffee zu den wichtigsten Verarbeitungsschritten, weil dabei Maillard-Reaktionen ablaufen. Wegen dieser gemeinsamen Reaktionskette teilen sich beide Produkte einen Teil ihrer Chemie, darunter Pyrrole, Pyrazine, Aldehyde und Furane. Sogar Vanillin, Linalool und andere karamellig-fruchtige Noten überschneiden sich zwischen beiden. Kein Wunder also, dass Schokolade zu den grundlegenden Geschmacks- und Aromaeigenschaften vieler Kaffees zählt. Eine Schokoladen-Basis gilt als eines der Kennzeichen eines soliden, hochwertigen Kaffees.',
        ],
      },
    ],
    verwandte: [
      { nummer: 55, original: 'Zartbitterschokolade' },
      { nummer: 59, original: 'Karamellisiert' },
      { nummer: 60, original: 'Vanille' },
      { nummer: 10, original: 'Backpflaume' },
    ],
  },

  {
    nummer: 57,
    name: 'Brauner Zucker',
    nameOriginal: 'Brown Sugar',
    kategorieId: 'suess',
    kategorieLabel: 'Süß',
    beschreibung: [
      'Ein kräftiger, dunkler, süßer, karamellisierter Duft mit einem Hauch Muskatnuss oder Anis.',
      'Brauner Zucker wird Gebäck zugesetzt, um zusätzlichen Geschmack und Feuchtigkeit zu bringen. Er kann an weiche Kekse, Lebkuchen, Haferbrei, gebackene Bohnen, ein Grillfest oder sogar an einen Bauernhof erinnern. Im Handel gibt es ihn in zwei Fassungen — hell und dunkel —, mit unterschiedlich konzentriertem Geschmack und Aroma.',
    ],
    abschnitte: [
      {
        titel: 'Taxonomie',
        text: ['Brauner Zucker besteht meist aus Rohrzucker der Pflanze Saccharum officinarum, dem Zuckerrohr.'],
      },
      {
        titel: 'Geschichte',
        text: [
          'Unverarbeiteter Rohzucker ist seit dem Altertum in Gebrauch und stammt vermutlich aus Indien und China, im südwestlichen Asien. Der süße Stoff reiste um die Welt, und bis zum 14. Jahrhundert versuchten Europäer bereits, Zuckerrohr in Griechenland anzubauen. Nach der Ankunft in Amerika erwies sich das karibische Klima jedoch als deutlich geeigneter: Im 18. Jahrhundert wurden Kuba, Jamaika und Barbados zu den führenden Erzeugern — ermöglicht durch den atlantischen Sklavenhandel. Brauner Zucker selbst ist eine amerikanische Erfindung und wird vor allem in Nordamerika verwendet. Im 19. Jahrhundert war „brauner Zucker“ schlicht die Bezeichnung für unverarbeiteten Rohrzucker, dunkler und bernsteinfarbener als weißer Zucker. Heute kennt man diese Formen als Turbinado-, Muscovado- und Demerara-Zucker. Brauner Zucker im heutigen Sinn entsteht dagegen gezielt durch Zugabe von Melasse.',
        ],
      },
      {
        titel: 'Herstellung',
        text: [
          'Zucker entsteht durch Kochen und Kristallisieren des Safts aus Zuckerrohr. Bei der thermischen Verarbeitung und dem Eindampfen sind Karamellisierung und Maillard-Reaktionen unvermeidlich. Der übrig bleibende, konzentrierte Sirup aus der Verarbeitung von weißem Zucker (Saccharose) ist die Melasse — sie dient sowohl zur Rum-Herstellung als auch zum Kochen. Brauner Zucker ist im Grunde aromatisierter weißer Zucker: Melasse wird gezielt wieder zugesetzt, um Farbe, Geschmack und Feuchtigkeit zu erhöhen. Heller brauner Zucker enthält etwa 3,5 Prozent Melasse, dunkler dagegen mit 6,5 Prozent deutlich mehr.',
        ],
      },
      {
        titel: 'Chemie',
        text: [
          'Das Aroma von braunem Zucker ist eine Mischung aus Ketonen, Pyrazinen, Alkanen, Phenolen und Alkoholen, die den karamellisierten, süßen und fruchtigen Duft ergeben. Sie entstehen durch Karamellisierung und Maillard-Reaktionen während der Zuckerverarbeitung. Besonders wichtige Moleküle sind Furfural, 2-Methylpyrazin, 2,5-Dimethylpyrazin, 2-Furanmethanol, 2-Methylpropansäure und Propansäure. Auch Nonanal, Furfural, Decanal und Maltol tragen dazu bei.',
          'Cyclotene wird in der Aromen- und Duftstoffindustrie häufig verwendet, um einen Braunzucker-Duft zu erzeugen. Es kommt in Kakao, Kaffee, Bockshornklee, Lakritz, Malz, Mandeln und praktisch allen gerösteten, zuckerhaltigen Produkten vor.',
        ],
      },
    ],
    imKaffee: [
      {
        titel: '',
        text: [
          'Das WCR Sensory Lexicon beschreibt braunen Zucker als „einen kräftigen, vollen, runden, süßen Gesamteindruck mit einem gewissen Grad an Dunkelheit“. Braune-Zucker-Süße wirkt im Kaffee positiv und kann zu einem hochwertigen Kaffee beitragen, solange sie mit den übrigen Eigenschaften im Gleichgewicht steht. Diese Süße neigt dazu, andere Aromen zu verstärken und auszugleichen, etwa Bitterkeit, Würze, krautige oder erdige Noten.',
        ],
      },
      {
        titel: 'Röstung',
        text: [
          'Viele Bestandteile des Melasse- und Braunzucker-Aromas ähneln denen, die auch beim Kaffeerösten entstehen, oder sind sogar identisch mit ihnen. Da beim Rösten jede Art von Süße entsteht — darunter Ketone, Pyrazine, Alkane, Phenole und Alkohole —, ist der Gesamteindruck das Ergebnis einer Vielzahl chemischer Veränderungen über mehrere Stoffklassen hinweg. Die Braunzucker-Note wird meist mit stärker gerösteten Kaffees in Verbindung gebracht. Diese Süße, auf der dunkleren Seite, verleiht einer Röstung eine positive Eigenschaft, ganz ähnlich wie Ahornsirup und Karamell. Vanillin, Maltol, Cyclotene und das „Ahornlacton“ Methylcyclopentenolon sind all diesen Noten gemeinsam und entstehen bei der Pyrolyse von Kohlenhydraten während der Röstung. Cyclotene — ein Stoff, dem ein karamellisierter, würziger, angebrannter Duft zugeschrieben wird und der ebenfalls in braunem Zucker vorkommt — findet sich in geröstetem Kaffee und geht mit in den Aufguss über.',
        ],
      },
    ],
    verwandte: [
      { nummer: 59, original: 'Karamellisiert' },
      { nummer: 58, original: 'Ahornsirup' },
      { nummer: 1, original: 'Honig' },
      { nummer: 60, original: 'Vanille' },
      { nummer: 47, original: '(Stern-)Anis' },
    ],
  },

  {
    nummer: 58,
    name: 'Ahornsirup',
    nameOriginal: 'Maple Syrup',
    kategorieId: 'suess',
    kategorieLabel: 'Süß',
    beschreibung: [
      'Ahornsirup riecht süß, holzig, braun und kräftig, mit einem Hauch Vanille, Nüssen und gelegentlich Blüten. Der Duft kann Erinnerungen an Pancakes, an den Frühling, an Schneeschmelze oder an Rauch wecken.',
    ],
    abschnitte: [
      {
        titel: 'Taxonomie',
        text: [
          'Ein Sirup, gewonnen aus dem Saft von Acer saccharum, dem Zuckerahorn. Zwar stammt der Großteil des Sirups von dieser Art, gelegentlich werden aber auch andere Ahornarten dafür verwendet.',
        ],
      },
      {
        titel: 'Die Pflanze',
        text: [
          'Acer saccharum ist ein langlebiger, sommergrüner Laubbaum, heimisch in den Wäldern Ost-Kanadas und der USA. Ein Bestand solcher Bäume heißt „Sugarbush“. Der Baum braucht einen harten Winter, um in die Ruhephase zu gehen — nur so kann sein Samen später richtig keimen. Bekannt ist die Art nicht nur für die Sirupgewinnung, sondern auch für ihr auffälliges, leuchtend rotes Herbstlaub.',
        ],
      },
      {
        titel: 'Geschichte',
        text: [
          'Dieser süße Sirup wurde zuerst von den indigenen Völkern Nordost-Nordamerikas hergestellt. Frühe europäische Siedler übernahmen die Technik und nutzten sie, um festen Zucker als Alternative zum importierten Zucker aus den Tropen zu gewinnen. Bis heute bleibt die Herstellung fast ausschließlich auf Ost-Kanada und den Norden der USA beschränkt.',
        ],
      },
      {
        titel: 'Herstellung',
        text: [
          'Ahornsirup entsteht, indem man den Saft des Zuckerahorns konzentriert. Im Frühling gefriert der zuckerreiche Saft — er wird durch das Xylem, das wasserleitende Gewebe des Baums, transportiert — nachts in den dünnen Ästen und taut morgens in der Wärme wieder auf. Dadurch entsteht eine Bewegung durch den Baum, weil die Schwerkraft am überschüssigen Saft zieht; möglich wird das durch den besonderen Aufbau der Xylemzellen im Ahorn. Je nach Wetterlage dauert die Saft-Erntesaison jedes Jahr etwa sechs Wochen, während der Frühjahrs-Tauphase. Wie genau sich Frost und Tauwetter Tag für Tag abwechseln, bestimmt Menge und Länge dieser Saison.',
          'Während dieser Zeit wird der Saft aus ausgewachsenen Bäumen angezapft. Kochendes Eindampfen konzentriert ihn langsam zu dem dickflüssigen Sirup, den wir kennen. Der fertige Sirup hat eine Stärke von 66 Grad Brix (ein Maß für den Zuckergehalt). Ein durchschnittlicher Baum liefert an einem Tag bis zu 50 Liter Saft — daraus werden am Ende etwa 1,5 Liter Ahornsirup, denn rund 98 Prozent des Saftes müssen verdampfen, bis das fertige Produkt entsteht.',
        ],
      },
      {
        titel: 'Chemie',
        text: [
          'Der Saft des Ahorns besteht fast vollständig aus Saccharose, dazu Mineralien und Wasser. Weil Ahornsirup verarbeitet wird, begünstigen Hitze und Kochen beim Einkochen sowohl Maillard-Reaktionen als auch Karamellisierung. Am Ende enthält der Sirup eine Mischung aus phenolischen Verbindungen (etwa Vanillin und Quebecol), Pyrazinen, Hexanolen, Säuren — vor allem Apfelsäure —, Alkoholen, Ketonen und Aldehyden.',
        ],
      },
    ],
    imKaffee: [
      {
        titel: '',
        text: [
          'Das WCR Sensory Lexicon beschreibt Ahornsirup als „eine holzige, süße, karamellisierte, braune, leicht grüne Note, die man mit Ahornsirup verbindet“. Im Kaffee wirkt Ahornsirup-Aroma oft weich und dezent, verleiht aber eine an Saccharose erinnernde, holzige Süße.',
        ],
      },
      {
        titel: 'Röstung',
        text: [
          'Das unverwechselbare Ahornsirup-Aroma entsteht, genau wie das Röstaroma von Kaffee, aus Maillard-Reaktionen und Karamellisierung. Zweifellos gibt es ein ganzes Bukett bräunungsbedingter Aromastoffe, die zu einer Ahornsirup-Note beitragen können. Der Furan-Stoff 5-Methylfurfural riecht würzig, nach Ahorn und nach Holz. Insbesondere das Keton Cyclotene wurde im Kaffee als Träger eines ahornartigen Aromas identifiziert. Auch Methylcyclopentenolon — manchmal „Ahornlacton“ genannt — findet sich im Kaffee und gilt ebenfalls als kräftiger Ahorn- und Karamellduftstoff; es entsteht bekanntermaßen bei der Pyrolyse pflanzlicher Zellwände.',
        ],
      },
    ],
    verwandte: [
      { nummer: 57, original: 'Brauner Zucker' },
      { nummer: 59, original: 'Karamellisiert' },
      { nummer: 1, original: 'Honig' },
      { nummer: 60, original: 'Vanille' },
      { nummer: 34, original: 'Holzig' },
      { nummer: 28, original: 'Heuartig' },
      { nummer: 52, original: 'Haselnuss' },
    ],
  },

  {
    nummer: 22,
    name: 'Weinig',
    nameOriginal: 'Winey',
    kategorieId: 'sauer-fermentiert',
    kategorieLabel: 'Sauer / Fermentiert',
    beschreibung: [
      'Das Aroma von Rotwein ist vielfältig und hängt von Rebsorte, Terroir und önologischer Praxis ab. Allgemein ist Rotwein fruchtig, mit dunklen Fruchtnoten wie Kirsche, Beeren, Backpflaume oder Rosine.',
      'Je nach Reifung kann Rotwein Noten von Eukalyptus, Röstaromen, Tabak, Schokolade oder Vanille zeigen. Er kann würzig wie Pfeffer riechen oder holzig wie Tabak. Der Duft kann an einen unfertigen Keller erinnern, an ein Lieblingsessen, an ein besonderes Glas mit einem Freund, an ein gegrilltes Steak oder an selbst gemachte Konfitüre. Archäologische Funde belegen Weinherstellung seit mehr als 7.000 Jahren, in der Region des südlichen Kaukasus zwischen Schwarzem und Kaspischem Meer.',
    ],
    abschnitte: [
      {
        titel: 'Taxonomie',
        text: ['Der vergorene Saft der Rebe Vitis vinifera.'],
      },
      {
        titel: 'Die Pflanze',
        text: [
          'Die sommergrüne, verholzende Rebe ist für ihren Saft berühmt. Sie hat eine schuppige Rinde, handförmig gelappte Blätter und wird meist auf unter 2 Meter zurückgeschnitten. Die Frucht ist eine Beere, die Traube, grün, rot oder violett. Weinreben werden vegetativ vermehrt, durch Stecklinge oder Veredelung — deshalb sind die vielen Rebsorten seit Hunderten, wenn nicht Tausenden von Jahren sortenrein geblieben.',
        ],
      },
      {
        titel: 'Herstellung',
        text: [
          'Die Trauben werden zerdrückt oder gepresst, der Saft vor der Abfüllung fermentiert und gereift. Die eigentliche Kunst der Weinherstellung liegt in der Fermentation: Die Art der Gärung, ob geimpft oder nicht, und weitere Faktoren steuert der Winzer, um den Wein zum gewünschten Profil zu führen. Der Wein wird anschließend vom Trubsatz — der Bodensatz der Beerenreste, die Geläger — durch Abstich, Filtration oder Schönung getrennt. Die Reifung, in Fässern, Stahl, Beton, Flaschen oder einer Kombination davon, verändert Geschmack und Aroma zusätzlich. Am Ende zeigt sich die Kreativität des Winzers in der Verschnitt-Kunst, wenn mehrere Sorten oder Partien zu einem harmonischen Getränk zusammengeführt werden.',
        ],
      },
      {
        titel: 'Chemie',
        text: [
          'Weinaromen sind endlos vielfältig und füllen ganze Bücher, Fachzeitschriften und wissenschaftliche Studien. Zu sagen, ein Kaffee habe eine Weinnote, ist vermutlich ebenso vereinfachend wie zu sagen, ein Wein habe eine Kaffeenote. Wer die Welt des Weins erkunden will, findet dafür ein eigenes Le-Nez-du-Vin-Aromaset. Im Wein stammen Blüten- und Zitrusnoten von Terpenen wie Linalool, Limonen und Citronellol. Aldehyde wie Vanillin und Furfural bringen warme, röstige, holzige Noten. Pyrazine können an grüne Paprika erinnern. Ester und Ketone wirken fruchtig, blumig und buttrig. Manche dieser Verbindungen entstehen im Zusammenhang mit alkoholischer oder malolaktischer Gärung, andere durch das Zusammenspiel von Hefen mit Aminosäuren, wieder andere sind enzymabhängig. Und schließlich nehmen Weine beim Reifen je nach Gefäß weitere Aromakomponenten auf, etwa Phenole aus dem Eichenfass.',
        ],
      },
    ],
    imKaffee: [
      {
        titel: '',
        text: [
          'Das WCR Sensory Lexicon beschreibt weinig als „die scharfe, durchdringende, leicht fruchtige, alkoholartige Note, die man mit Wein verbindet“. Ein reichhaltiger, weiniger Kaffee mit ausgeglichenen Schokoladen- oder Kräuternoten gilt als besonderer Kaffee. Die Chemie von Rotwein und bestimmten Kaffees überschneidet sich stark, Parallelen lassen sich leicht ziehen.',
        ],
      },
      {
        titel: 'Nachernte-Verarbeitung',
        text: [
          'Fruchtig-weinige Aromen entstehen durch die Fermentation während der Nachernte-Verarbeitung. Die mikrobielle Aktivität hängt stark von der Verarbeitungsmethode ab und erzeugt die chemischen Stoffwechselprodukte, die zu den vertrauten Aromen führen. Traditionell galt natural aufbereiteter Kaffee — die ganze Frucht trocknet auf dem Samen, bevor sie geschält und gemahlen wird — als der zuverlässigste Weg zu einem weinigen Kaffee. Regionen, die naturals produzieren, etwa Äthiopien, Jemen und Brasilien, waren die Hauptquelle für Kaffees mit weiniger Note.',
          'Der weltweite Kaffeemarkt hat sich seit den frühen 2000er-Jahren in Sachen Aromaprofile und naturals stark gewandelt. Natural aufbereitete Kaffees haben sich seither qualitativ deutlich verbessert und wurden entsprechend akzeptierter und geschätzter. Zwei Jahrzehnte später gibt es weinige Kaffees aus fast allen Anbauregionen der Welt. Die kräftigen, fruchtig-weinigen Noten von naturals haben schon immer die Aufmerksamkeit von Konsumenten auf sich gezogen, die ihr Verständnis und ihre Erfahrung mit Kaffee erweitern wollten. Der Zustrom neuer, experimenteller Verarbeitungsmethoden — darunter Honey-Prozesse und anaerobe Fermentation — kann ebenfalls zu weinigen Noten führen.',
          'Taucht eine weinige Note in einem gewaschenen Kaffee auf, lohnt genaueres Hinsehen: Sie kann durch mangelhafte Verarbeitung oder Schwierigkeiten in der Aufbereitung entstehen und auf Unregelmäßigkeiten hindeuten. Wird ein gewaschener Kaffee nicht vollständig fermentiert und ordentlich gewaschen, bevor er trocknet, fermentiert das restliche Fruchtfleisch beim Trocknen und bei der Lagerung weiter — und hinterlässt unerwartete oder schwankende Weinnoten.',
        ],
      },
    ],
    verwandte: [
      { nummer: 11, original: 'Kirsche' },
      { nummer: 10, original: 'Backpflaume' },
      { nummer: 9, original: 'Rosine' },
      { nummer: 23, original: 'Kaffeefruchtfleisch' },
      { nummer: 21, original: 'Buttersäure' },
    ],
  },

  {
    nummer: 23,
    name: 'Kaffeefruchtfleisch',
    nameOriginal: 'Coffee Pulp',
    kategorieId: 'sauer-fermentiert',
    kategorieLabel: 'Sauer / Fermentiert',
    beschreibung: [
      'Kaffeefruchtfleisch ist der süße, fermentierte, trocknende, stechende Duft von gärendem Kaffee-Fruchtfleischabfall. Er ist sauer, weinig, reif und intensiv fruchtig.',
      'Er kann direkt zur Waschstation zurückversetzen, an schwipsig-alkoholische Noten oder an Kompost erinnern. Auf der positiven Seite kann er blumig und nach reifen Früchten duften — Jasmin, Ananas, Apfel und die frische Kaffeekirsche selbst. Manchmal erinnert er an eine schöne Flasche Beaujolais. Dieses Aroma lässt sich als ein Kontinuum von Fruchtigkeit verstehen, dessen Intensität je nach Person positiv oder negativ wirkt.',
    ],
    abschnitte: [
      {
        titel: 'Taxonomie',
        text: ['Das verworfene, fruchtige Fleisch der Gattung Coffea.'],
      },
      {
        titel: 'Herstellung',
        text: [
          'Bei der Nachernte-Verarbeitung wird das Fruchtfleisch (Mesokarp) auf mechanischem oder biologischem Weg vom Kaffeesamen gelöst. Geschieht das, durchläuft der Kaffee entweder die gewaschene oder die Honey-Aufbereitung. Trocknet dagegen die ganze Frucht auf dem Samen, ist er natural aufbereitet und wird erst später durch eine Schälmaschine vom Fruchtfleisch befreit. Beim mechanischen Entpulpen werden Schale und der Großteil des Mesokarps abgerissen, indem die Kirschen durch eine rotierende Trommel, ein Sieb oder eine Scheibe gepresst werden. Wie viel Fruchtfleisch dabei zum Trocknen auf dem Pergament verbleibt, ist der entscheidende Faktor dafür, wie stark die mikrobielle Aktivität auf diesem Kaffee ausfällt.',
        ],
      },
      {
        titel: 'Chemie',
        text: [
          'Intensiv fruchtige, fermentierte Aromen prägen diesen Duft. Der Geruch reifer Frucht baut sich aus mehreren Produkten der Fermentation und des mikrobiellen Stoffwechsels auf, darunter Acetaldehyd (reifer Apfel), Ethylacetat (Ananas), Isobutanol (süß), Isobutylacetat (fruchtig-süß) und Ethyl-3-hexenoat (grün, fruchtig, Rum). Mit steigender Intensität kommen Isoamylalkohol (Banane, fermentiert) und Isoamylacetat (Banane, Birne) dazu und bringen reife, warme Fruchtnoten ein. Diese fruchtigen Noten können durch moschusartig-käsige Aromen ergänzt oder ausgeglichen werden, etwa durch 2-Methylbuttersäure, die natürlich in Kaffee, Kakao und Wein vorkommt und nach fruchtigem Käse riechen kann. Ihr Isomer, die 3-Methylbuttersäure (Isovaleriansäure), hat ebenfalls einen käsig-schweißigen, fermentierten Geruch. Im Extremfall riecht das Ganze nach Ethanol und Buttersäure: Ethanol ist ein Hauptprodukt der Fermentation im Kaffeefruchtfleisch, Buttersäure steuert den überreifen, fauligen Unterton zum extremen Kaffeefruchtfleisch-Aroma bei.',
        ],
      },
    ],
    imKaffee: [
      {
        titel: '',
        text: [
          'Das Aroma von Kaffeefruchtfleisch kann aus einem durchschnittlichen Kaffee einen besonderen machen. Im Übermaß ist es aber ein Warnsignal: In hoher Intensität führt es zum Ferment-Fehlton. Die Grenze zwischen fruchtigem Kaffeefruchtfleisch und Ferment-Fehlton ist vielleicht umstritten und sollte nicht im Auge des Betrachters liegen, sondern aus der Absicht der Verarbeitung heraus beurteilt werden. Hat ein Erzeuger einen intensiven Kaffeefruchtfleisch-Charakter absichtlich herbeigeführt, ist das eine völlig andere Situation als ein Zufall, eine nachlässige Verarbeitung oder ein unerwartetes Ergebnis durch schlechte Praxis, schlechtes Wetter oder höhere Gewalt. Gefällt es einem, umso besser — gefällt es nicht, geht man einfach weiter.',
        ],
      },
      {
        titel: 'Nachernte-Verarbeitung',
        text: [
          'Ein Kaffeefruchtfleisch-Aroma im Kaffee ist vollständig ein Ergebnis der Nachernte-Verarbeitung. Ob mild, mittel oder stark ausgeprägt — dieses Merkmal ist immer ein Produkt der Fermentation. Gewaschene, auf dem Pergament getrocknete Kaffees haben traditionell den niedrigsten Anteil dieses Aromas. Kaffees, die mit Mucilage (Schleimschicht) getrocknet werden — mechanisch entschleimt oder als Honey — haben einen höheren Anteil. Natural aufbereitete, mit der ganzen Frucht getrocknete Kaffees haben den höchsten. Jede zusätzliche Fermentation — etwa eine anaerobe oder in einem geschlossenen System in der ganzen Kirsche — bringt zusätzliches Kaffeefruchtfleisch-Aroma ins Endprodukt. Fermentation in geringem Maß kann durchaus als Säure und Frucht geschätzt werden. Jeder Kaffee hat seinen Markt, und jeder Erzeuger hat das Recht, für seinen Markt zu produzieren.',
        ],
      },
    ],
    verwandte: [
      { nummer: 11, original: 'Kirsche' },
      { nummer: 12, original: 'Ananas' },
      { nummer: 16, original: 'Apfel' },
      { nummer: 22, original: 'Weinig' },
      { nummer: 21, original: 'Buttersäure' },
      { nummer: 1, original: 'Honig' },
      { nummer: 4, original: 'Jasmin' },
    ],
  },

  {
    nummer: 24,
    name: 'Erbsenschote',
    nameOriginal: 'Peapod',
    kategorieId: 'gruen-pflanzlich',
    kategorieLabel: 'Grün / Pflanzlich',
    beschreibung: [
      'Erbsenschote hat ein unverwechselbares, pflanzliches Aroma: erdig, frisch, grün und süß. Der Geruch lässt sich auch als „erbsig“, kartoffelartig, muffig oder krautig beschreiben.',
      'In der Fachliteratur zu Erbsen und Hülsenfrüchten gilt eine bohnige Note als Auffälligkeit. Für viele weckt der Duft frischer Erbsenschoten eine kräftige Erinnerung — an fruchtbare Gartenerde oder an deftige Hausmannskost. Erbsen werden weltweit angebaut und gegessen und sind für ihre guten Nährwerte bekannt, unter anderem als Eiweiß- und Ballaststoffquelle. Man bekommt sie frisch, aus der Dose oder tiefgekühlt, getrocknete Erbsen landen häufig in Suppen.',
    ],
    abschnitte: [
      {
        titel: 'Taxonomie',
        text: ['Die Frucht der Pflanze Pisum sativum, der Gartenerbse.'],
      },
      {
        titel: 'Die Pflanze',
        text: [
          'Die Erbse gehört zur Familie der Fabaceae (Hülsenfrüchtler), die dem Boden auf natürliche Weise Stickstoff zuführen. Sie ist einjährig und wird als Kaltzeit-Kultur in vielen Teilen der Welt angebaut. Die Frucht der Erbse ist eine Hülse mit 5 bis 10 Samen — den Erbsen.',
        ],
      },
      {
        titel: 'Geschichte',
        text: [
          'Erbsen stammen ursprünglich aus dem Nahen Osten, aus der Gegend des heutigen Türkei und Irak. Die Domestizierung der Wildform fiel vermutlich mit dem Beginn des Ackerbaus überhaupt zusammen.',
        ],
      },
      {
        titel: 'Chemie',
        text: [
          'Rohe Erbsen beziehungsweise Erbsenschoten unterscheiden sich chemisch deutlich von verarbeiteten, getrockneten, gerösteten, blanchierten oder gebackenen Erbsenprodukten. Die chemische Mischung des Erbsenschoten-Aromas in der Natur besteht überwiegend aus Alkanalen, Ketonen, Alkoholen und Pyrazinen. Nennenswerte Stoffe sind Nonanal, Hexanal und 3-Alkyl-2-methoxypyrazine, die zur grünen, frisch-grasigen, pflanzlichen Note beitragen. Dazu kommt 2-Isopropyl-3-methoxypyrazin (IPMP), das eine unverwechselbare pflanzliche Note ähnlich grüner Paprika beisteuert. Dieselben Verbindungen finden sich in vielen grünen Gemüsen und Pflanzen wieder, darunter Trauben, Wein und Kaffee.',
        ],
      },
    ],
    imKaffee: [
      {
        titel: '',
        text: [
          'Das WCR Sensory Lexicon beschreibt Erbsenschote als „eine grüne, süße, bohnige, frische, rohe und muffig-erdige Note“.',
        ],
      },
      {
        titel: 'Pflanze',
        text: [
          'Das Erbsenschoten-Aroma trägt zum Geruch von rohem, grünem Kaffee bei. Die Alkylpyrazine 3-Isopropyl-2-methoxypyrazin und 2-Isopropyl-3-methoxypyrazin (IPMP) verleihen eine erbsig-pflanzliche, an grüne Paprika erinnernde Note und gelten als wichtige Duftstoffe im rohen Kaffee.',
        ],
      },
      {
        titel: 'Röstung',
        text: [
          'Diese Verbindungen bauen sich beim Rösten im Allgemeinen ab — je länger die Röstentwicklung, desto weniger grüne, grasige, „erbsige“ und paprikaartige Noten bleiben übrig. Hell gerösteter Kaffee kann noch nach Erbsenschote duften. Als negativ gilt diese Note, wenn eine Röstung unterentwickelt ist und sie zusammen mit anderen grün-pflanzlichen Aromen dominiert.',
        ],
      },
    ],
    verwandte: [
      { nummer: 25, original: 'Frisches Gras' },
      { nummer: 27, original: 'Grüne Paprika' },
      { nummer: 36, original: 'Muffig/Erdig' },
      { nummer: 32, original: 'Kartoffel' },
    ],
  },

  {
    nummer: 25,
    name: 'Frisches Gras',
    nameOriginal: 'Grass (Fresh)',
    kategorieId: 'gruen-pflanzlich',
    kategorieLabel: 'Grün / Pflanzlich',
    beschreibung: [
      'Der Duft von Gras wird als frisch, grün, blättrig und roh beschrieben, mitunter sogar fruchtig und blumig. Viele Lebensmittel und Getränke, vor allem Obst und Gemüse, können eine grasige Note zeigen.',
      'Grüner Tee, Olivenöl und manche Mezcals sind für ihren frischen Grasduft bekannt. Manche Gräser setzen bei Beschädigung sogenannte grüne Blattduftstoffe frei — eine Gruppe pflanzlicher Signalstoffe, die typischerweise ausgeschüttet werden, wenn Pflanzen angegriffen werden oder unter Stress stehen. Wird das Gras verletzt oder geschnitten, werden diese Stoffe freigesetzt: Die Zellschäden setzen Enzyme frei, die lange Fettsäureketten aufspalten. Die Pflanze nutzt das zu ihrem eigenen Vorteil, um Insekten und Tiere zu beeinflussen. Erhitzen deaktiviert die Enzyme und löst Reaktionen in anderen Molekülen aus, sodass die frische, grüne Note verblasst und andere Aromen stärker hervortreten.',
    ],
    abschnitte: [
      {
        titel: 'Taxonomie',
        text: [
          'Gras ist eine Gruppe von Blütenpflanzen aus den großen Familien der Süßgräser (Poaceae) und Gramineae. Dazu zählen Getreide wie Mais, Weizen, Gerste und Reis, Bambus und die Gräser natürlicher Graslandschaften.',
        ],
      },
      {
        titel: 'Die Pflanze',
        text: [
          'Botanisch gehören Gräser zu den einkeimblättrigen Pflanzen — sie wachsen aus dem Samen mit nur einem ersten Blatt. Gräser haben lange Blätter oder Halme, dünne, gerade Wurzeln, einen runden Stängel und eine Blütenähre. Viele sind auf schnelles Wachstum in voller Sonne eingestellt und nutzen den C4-Photosyntheseweg zur Energiegewinnung. Rasenmischungen enthalten je nach Klima etwa Kentucky-Rispengras, Weidelgras, Bermudagras, Kikuyugras, Durban-Gras, Manila-Gras, japanisches Rasengras oder Schwingel — sie wachsen weltweit, je nach Klimazone. Dazu kommen Tausende Wildgräser in Steppen, Savannen und anderen Graslandschaften.',
        ],
      },
      {
        titel: 'Chemie',
        text: [
          'Die grasige Note wird chemisch von den Aldehyden Hexanal, cis-3-Hexanal und cis-3-Hexen-1-ol geprägt — sie gelten als Kennzeichen des Duftes von frisch geschnittenem Gras. Diese Verbindung findet sich auch in Erdbeeren, Tomaten, Himbeeren und vielen anderen Pflanzen. Der Alkohol 1-Hexanol trägt ebenfalls zum Duft von frischem Gras bei. Untersuchungen deuten darauf hin, dass cis-3-Hexen-1-ol die Akzeptanz von grünem Tee, Fruchtsaft und anderen Lebensmitteln bei Konsumenten mindern kann. Trans-2-Hexenal ist eine der Verbindungen, die für diese Wirkung verantwortlich sind, und verleiht eine grün-grasige Note. Obwohl diese Stoffe als geruchlich niedrigschwellig gelten, unterscheidet sich die Fähigkeit, sie wahrzunehmen, von Mensch zu Mensch stark.',
        ],
      },
    ],
    imKaffee: [
      {
        titel: '',
        text: [
          'Das WCR Sensory Lexicon beschreibt „frisch“ als „eine grüne Note, die man mit frisch geschnittenem Gras und Blattgrün verbindet, gekennzeichnet durch einen süßen, durchdringenden Charakter“. Das schließt geschnittenes Gras ein, fasst aber eine größere Kategorie frischer, grüner Düfte zusammen. Im Unterschied zu heuartig hat Gras einen frischen, blättrigen Duft.',
        ],
      },
      {
        titel: 'Pflanze',
        text: [
          'Die grasige Note ist einer der wesentlichen grünen Charakterzüge des rohen Kaffeesamens. Hexanol gilt als wichtiger flüchtiger Bestandteil von grünem Arabica-Kaffee. Hexanal wurde ebenfalls als Duftstoff in grünem Robusta-Kaffee nachgewiesen, während dieser trocknet.',
        ],
      },
      {
        titel: 'Nachernte-Verarbeitung',
        text: [
          'Fruchtige und grüne Aromen werden häufig mit diesen Hexanol- und Hexanal-Verbindungen in Verbindung gebracht. Untersuchungen legen nahe, dass sie in gewaschen aufbereitetem Kaffee im Vergleich zu naturals relativ hoch konzentriert sind.',
        ],
      },
      {
        titel: 'Röstung',
        text: [
          'Die grasigen Noten im grünen Kaffee, die von Aldehyden und Alkoholen getragen werden, wandeln sich beim Rösten normalerweise um. Hell gerösteter Kaffee enthält den höchsten Hexanal-Anteil, der mit fortschreitender Röstung abgebaut wird. Die grasige Note ist eines der wichtigsten Kennzeichen des insgesamt grünen Eindrucks, den ein Kaffee hinterlässt, wenn er beim Rösten nicht richtig entwickelt wurde.',
        ],
      },
    ],
    verwandte: [
      { nummer: 28, original: 'Heuartig' },
      { nummer: 26, original: 'Gurke' },
      { nummer: 24, original: 'Erbsenschote' },
    ],
  },

  {
    nummer: 27,
    name: 'Grüne Paprika',
    nameOriginal: 'Green (Bell) Pepper',
    kategorieId: 'gruen-pflanzlich',
    kategorieLabel: 'Grün / Pflanzlich',
    beschreibung: [
      'Grüne Paprika bringt einen pflanzlichen Geschmack und Duft mit, der sich deutlich von der typischen Würze der Chilifamilie unterscheidet. Das Aroma ist grün, erdig, frisch, grasig und süß.',
      'Es kann auch blumige, krautige und Gurken-Noten enthalten. In Lebensmitteln und Getränken wirken diese Verbindungen sehr stark auf den sensorischen Eindruck — sie sind also selbst in kleinsten Mengen äußerst wirksam. Wegen dieser Intensität ist die Note der grünen Paprika breit erforscht worden: bei Paprika selbst, bei Trauben und Wein, bei Erdnüssen, anderen Gemüsen und ihren Ölen sowie bei Kaffee.',
    ],
    abschnitte: [
      {
        titel: 'Taxonomie',
        text: [
          'Grüne Paprika gehört zu einer Gruppe süßer Paprikasorten aus Capsicum annuum var. annuum (Grossum-Gruppe). Sie zählen zur Familie der Nachtschattengewächse (Solanaceae).',
        ],
      },
      {
        titel: 'Die Pflanze',
        text: [
          'Die Pflanze ist von Natur aus eine tropische Staude, wird aber meist als einjähriges Gemüse angebaut. Paprika stammt ursprünglich aus Mittel- und Südamerika und trägt Früchte in vielen Farben.',
        ],
      },
      {
        titel: 'Geschichte',
        text: [
          'Diese süßen Paprika wurden in Mexiko schon seit Jahrtausenden angebaut, bevor Europäer sie nach Spanien brachten. Von dort verbreiteten sie sich über den Mittelmeerraum und die ganze Welt und gehören heute fest zu vielen unterschiedlichen Küchen.',
        ],
      },
      {
        titel: 'Chemie',
        text: [
          'Chemisch werden die Pyrazine, insbesondere die Methoxypyrazine, mit grünen und erdigen Düften in Verbindung gebracht. Obwohl Pyrazine sonst mit dem Rösten und Röstaromen assoziiert werden, stammen die alkylierten Methoxypyrazine hier direkt aus der Pflanze und dem grünen Samen selbst. Diese Verbindungen verleihen vielen Gemüsesorten und Weinen einen unverwechselbaren Duft. In der Natur werden sie nicht nur von Pflanzen gebildet, sondern auch von Mikroorganismen, Insekten und Wirbellosen — oft als chemisches Kommunikationsmittel, um zu warnen, sich zu verteidigen oder anzulocken.',
          'Die Verbindung 2-Isobutyl-3-methoxypyrazin wurde als erste als Schlüsselsubstanz für das Aroma der grünen Paprika identifiziert. Das häufigste Pyrazin in Paprika ist 3-Isobutyl-2-methoxypyrazin (IBMP); Pflanzen bilden es als Nebenprodukt der Atmung. Auch 3-Isopropyl-2-methoxypyrazin (IPMP) gilt als mitverantwortlich für das Aroma von Gartenerbsen und grüner Paprika.',
        ],
      },
    ],
    imKaffee: [
      {
        titel: '',
        text: [
          'Eine Note nach grüner Paprika kann in Kaffee angenehm und vielschichtig wirken und würzige, süße oder Schokoladennoten in einem besonderen Kaffee ausbalancieren. Manche der beteiligten Verbindungen tragen aber auch zu bekannten Auffälligkeiten bei. Insbesondere 2-Methoxy-3-sec-butylpyrazin, das in grünem Kaffee nachgewiesen wurde, kann zu einer grünen Gemüsenote wie grüner Paprika beitragen — es ist aber ebenso Bestandteil der Auffälligkeit muffig-erdig.',
        ],
      },
      {
        titel: 'Pflanze',
        text: [
          'Das Grüne-Paprika-Aroma ist ein wesentlicher Bestandteil von rohem, grünem Kaffee. Die Alkylpyrazine 3-Isopropyl-2-methoxypyrazin (IPMP) und 2-Isopropyl-3-methoxypyrazin verleihen eine erbsig-grüne Paprikanote und gelten als wichtige Duftstoffe im Kaffee. Diese Verbindungen bauen sich beim Rösten ab — je länger die Röstentwicklung, desto weniger grüne, grasige, „erbsige“ und paprikaartige Noten bleiben übrig.',
          'Die Verbindung 3-Isobutyl-2-methoxypyrazin (IBMP), eine der Kennverbindungen für die grüne Paprikanote in Pflanzen, gilt zugleich als Auffälligkeit: Sie trägt zum Rio-Fehlton bei und ist auch für den Kartoffel-Fehler mitverantwortlich. Dieselben Verbindungen können aber auch — ganz ohne Fehlton — für eine pflanzliche, an grüne Paprika oder „Erbsen“ erinnernde Kaffeenote sorgen.',
        ],
      },
    ],
    verwandte: [
      { nummer: 24, original: 'Erbsenschote' },
      { nummer: 25, original: 'Frisches Gras' },
      { nummer: 9, original: 'Rosine' },
      { nummer: 35, original: 'Schimmlig/Feucht' },
      { nummer: 36, original: 'Muffig/Erdig' },
      { nummer: 32, original: 'Kartoffel' },
    ],
  },

  {
    nummer: 28,
    name: 'Heuartig',
    nameOriginal: 'Hay-like',
    kategorieId: 'gruen-pflanzlich',
    kategorieLabel: 'Grün / Pflanzlich',
    beschreibung: [
      'Geschnittenes Heu hat ein süßes Aroma, beschrieben als trocken, pudrig, vanillig, fruchtig, grün, erdig und krautig.',
      'Minderwertiges Heu kann feucht-muffig riechen, wenn Feuchtigkeit den Ballen schadet. Viele pflanzliche Produkte können heuartige Aromen zeigen, darunter Olivenöl, Seetang, Tee, Brokkoli, Basilikum, Pilze, Wein, Reis und andere Kräuter. Auch Milchprodukte wie Milch, Butter und Käse können je nach Futter der Milchtiere eine heuartige Note annehmen. Im echten Heu verblasst das Aroma, während die Bestandteile aushärten und trocknen. Da Aromastoffe flüchtiger sind als Wasser, verdunstet mit jedem Trocknungsprozess, der den Großteil des Wassers verdampft, auch ein Teil des Geschmacks.',
    ],
    abschnitte: [
      {
        titel: 'Die Pflanze',
        text: [
          'In vielen Teilen der Welt, wo das Klima Weidehaltung erschwert, ist Heu die wichtigste oder einzige Quelle für Ballaststoffe, Energie, Eiweiß, Vitamine und Mineralstoffe, die Nutztiere über den Winter brauchen. Heu wird geschnitten, getrocknet und gepresst, meist als Mischung wilder und angebauter Gräser und Kräuter — darunter Bermudagras, Liebesgras oder Rohrschwingel, Luzerne und Klee. Der Geruch von Heu hängt vom Reifegrad beim Schnitt und vom Feuchtigkeitsgehalt beim Pressen ab. Frisch geschnittenes Heu, frei von Gerüchen, die auf schlechte Handhabung hindeuten, gilt als das begehrteste.',
        ],
      },
      {
        titel: 'Chemie',
        text: [
          'Weil in geschnittenem Heu viele verschiedene Gras- und Kräuterarten stecken, tragen zahlreiche Verbindungen zu seinem natürlichen Duft bei. Um diesen künstlich nachzubilden, greift man unter anderem auf Phosgen zurück, das für einen unverwechselbaren muffig-heuartigen Duft bekannt ist. Dieses Gas — auch als chemische Waffe bekannt und streng reguliert — wird von der Duftstoffindustrie in sicheren Mengen genutzt, um einen trockenen, heuartigen Duft zu erzeugen. Eine weitere Substanz, die den Geruch von Heu nachahmt, ist Cumarin, ein Benzopyron-Molekül. Es wird von vielen Pflanzen als Schutz gegen Fraßfeinde gebildet und stammt großteils aus der Tonkabohne, dem Samen des Hülsenfrucht-Baums Dipteryx odorata (brasilianischer Teak), der in Südamerika wächst. Cumarin hat einen süßen Duft, ähnlich dem von Vanille.',
        ],
      },
    ],
    imKaffee: [
      {
        titel: '',
        text: [
          'Das WCR Sensory Lexicon beschreibt heuartig als „die leicht süße, trockene, staubige Note mit einem leicht grünen Charakter, die man mit trockenen Gräsern verbindet“.',
        ],
      },
      {
        titel: 'Pflanze',
        text: [
          'Wie Gras ist auch Heu ein häufiger Bestandteil des Aromas von grünem Kaffee. Heuartige Düfte wurden sogar im Kaffeefruchtfleisch nachgewiesen.',
        ],
      },
      {
        titel: 'Röstung',
        text: [
          'Viele Verbindungen, die zu einer heuartigen Note beitragen, sind bekannte Produkte der Maillard-Reaktion und anderer Vorgänge beim Rösten. Furane, Hydroxymethylfurfural, Furfural und weitere Stoffe wurden im Kaffee nachgewiesen. Auch Pyrrole tragen zu dieser warmen, heuartigen Note bei. Ethenon wurde in geröstetem Robusta-Kaffee mit einem süßen, nach frisch gemähtem Heu duftenden Aroma in Verbindung gebracht. Heuartige Aromen können außerdem ein Kennzeichen gealterten, gerösteten Kaffees sein, bei Robusta wie bei Arabica — wobei Robustas diese Note typischerweise stärker zeigen.',
        ],
      },
    ],
    verwandte: [
      { nummer: 25, original: 'Frisches Gras' },
      { nummer: 34, original: 'Holzig' },
      { nummer: 29, original: 'Thymian' },
      { nummer: 60, original: 'Vanille' },
    ],
  },

  {
    nummer: 29,
    name: 'Thymian',
    nameOriginal: 'Thyme',
    kategorieId: 'gruen-pflanzlich',
    kategorieLabel: 'Grün / Pflanzlich',
    beschreibung: [
      'Thymian riecht krautig, würzig, minzig, holzig und pfeffrig. Seltener wird er als süß, ledrig oder leicht zitrisch beschrieben.',
    ],
    abschnitte: [
      {
        titel: 'Taxonomie',
        text: ['Die häufigste Thymianart ist Thymus vulgaris.'],
      },
      {
        titel: 'Die Pflanze',
        text: [
          'Thymian ist eine krautige, ausdauernde Pflanze, die im Mittelmeerraum heimisch ist. Er gehört zur Familie der Lippenblütler (Lamiaceae), die rund 400 Arten umfasst — viele davon aromatisch, darunter Rosmarin, Minze, Oregano, Lavendel und Salbei.',
        ],
      },
      {
        titel: 'Geschichte',
        text: [
          'Thymian wurde schon im alten Ägypten und im antiken Griechenland geschätzt, sowohl in der Küche als auch für aromatische und medizinische Zwecke. Thymianöl gilt bis heute für seine starken antimikrobiellen und antioxidativen Eigenschaften.',
        ],
      },
      {
        titel: 'Chemie',
        text: [
          'Viele Vertreter dieser Pflanzenfamilie bilden flüchtige Stoffe als Abwehrmittel. Diese haben einen starken Geruch und Geschmack, weshalb in der Küche schon eine kleine Menge viel bewirkt. Die durchdringenden, intensiven Aromen dieser Pflanzen stammen von Terpenen, Phenolen und Alkoholen — vor allem von Thymol (nach dem Thymian-Duft benannt), Carvacrol, Linalool, Gamma-Terpineol, Geraniol und Sabinenhydrat.',
        ],
      },
    ],
    imKaffee: [
      {
        titel: '',
        text: [
          'Kaffees aus aller Welt können krautige, an Thymian erinnernde Düfte zeigen. Diese Aromen wirken meist kräftig und harzig, und Thymian lässt sich leicht innerhalb solcher krautig-holziger Düfte ausmachen. Am bekanntesten sind die krautigen Noten, die in indonesischem Arabica von Java geschätzt werden. Bestimmte mittelamerikanische Kaffees, etwa aus Guatemala, können besonders krautige Aromen zeigen, die gelegentlich an Thymian erinnern. Vom afrikanischen Kontinent kann natural aufbereiteter äthiopischer Harrar ebenfalls einen würzig-krautigen Duft haben, der eher ins Blumige und Fruchtige spielt.',
        ],
      },
      {
        titel: 'Pflanze',
        text: [
          'Bestimmte Verbindungen, die krautige Thymian-Aromen prägen, wurden gezielt in grünem Kaffee nachgewiesen. Die Verbindung γ-Terpinen wurde in Robusta-Kaffee aus Vietnam identifiziert. Das Monoterpenoid Linalool ist bekanntermaßen sowohl in Robusta- als auch in Arabica-Kaffee weit verbreitet.',
        ],
      },
      {
        titel: 'Röstung',
        text: [
          'Manche krautigen und würzigen Aromen im Kaffee, darunter Thymian, entstehen vermutlich erst beim Rösten. Pyrazine, die während der Röstung gebildet werden, gelten allgemein als Träger würzig-krautiger Aromen. Diese Verbindungen können zu einer Thymian-Note beitragen.',
        ],
      },
    ],
    verwandte: [
      { nummer: 34, original: 'Holzig' },
      { nummer: 30, original: 'Kiefer' },
      { nummer: 31, original: 'Zeder' },
      { nummer: 28, original: 'Heuartig' },
      { nummer: 37, original: 'Leder' },
      { nummer: 46, original: 'Pfeffer' },
    ],
  },

  {
    nummer: 30,
    name: 'Kiefer',
    nameOriginal: 'Pine',
    kategorieId: 'gruen-pflanzlich',
    kategorieLabel: 'Grün / Pflanzlich',
    beschreibung: [
      'Der warme, frische, feine Duft eines Kiefernwaldes prägt sich oft unvergesslich ein. Ob es der Wald selbst ist, ein Weihnachtsbaum oder ein Lagerfeuer — die angenehme Assoziation mit dem Kiefernduft steht außer Frage.',
      'Ähnlich wie Zeder, Holzig und Thymian kann der Duft der Kiefer frisch, aber auch fruchtig, klar und süß sein. Er gilt gemeinhin als natürlich, angenehm und harmonisch und hat nachweislich eine entspannende Wirkung. Manchmal wird er auch als harzig beschrieben, vermutlich wegen der Verbindung zwischen Kiefer und dem Harz desselben Baums. Man vermutet, dass Kiefern diese verlockenden, angenehmen Düfte entwickeln, um Bestäuber anzulocken — schließlich bilden Nadelbäume keine Blüten.',
    ],
    abschnitte: [
      {
        titel: 'Taxonomie',
        text: [
          '„Kiefer“ steht für viele Nadelbaumarten der Gattung Pinus. In dieser Gattung gibt es mehr als 120 Arten, die vor allem auf der Nordhalbkugel vorkommen.',
        ],
      },
      {
        titel: 'Die Pflanze',
        text: [
          'Kiefern sind harzige, langlebige Nadelbäume. Die höchste Art, die Ponderosa-Kiefer, kann bis zu 80 Meter hoch werden. Die Langlebige Kiefer (Bristlecone Pine) gilt als eine der ältesten, am längsten lebenden Pflanzen der Welt. Statt Blüten bilden Kiefern einhäusige Zapfen zur Fortpflanzung.',
        ],
      },
      {
        titel: 'Chemie',
        text: [
          'Der verlockende Duft eines Kiefernwaldes entsteht aus einem beachtlichen Bukett unterschiedlicher chemischer Verbindungen — dessen Komplexität lässt sich weder kurz zusammenfassen noch ist sie wissenschaftlich vollständig erschlossen. Eine ganze Reihe von Monoterpenen erinnert an Nadelbäume. Pinen ist das häufigste davon und wird von den Bäumen an die Luft abgegeben — deshalb duften solche Wälder so intensiv. Diese Verbindung kann sich in andere mit blumigerem Duft umwandeln, was zum angenehmen Waldbukett beiträgt. Weitere Terpene im Kiefernduft sind Limonen, Myrcen, Camphen und Phellandren. Limonen bilden sowohl Nadelbäume als auch manche essbare Bäume, Früchte und Kräuter. Camphen kommt in verschiedenen ätherischen Ölen vor, etwa in Kiefer, Zypresse, Bergamotte und Muskatnuss, und trägt dort einen großen Teil der Schlüsselaromen bei. Phellandren ist kennzeichnend für den besonderen Duft der Küstenkiefer, die im Westen Nordamerikas heimisch ist. Bornylacetat, ein Ester, trägt zu einem frischen, klaren Kiefernduft bei und wird in Parfüms, Lufterfrischern, Reinigungsmitteln und Kosmetik verwendet, auch medizinisch. Sogar das beliebte Vanillin ist Teil der Kiefernduft-Mischung und trägt vermutlich zu ihrer Süße bei.',
        ],
      },
    ],
    imKaffee: [
      {
        titel: '',
        text: [
          'Eine Kiefernnote in Kaffee wahrzunehmen ist bemerkenswert und interessant — oft ein Hinweis auf etwas Besonderes. Warum genau sich ein kiefernartiger Duft in einem Kaffee findet, ist nicht ganz geklärt. Es gibt aber einige bestimmte Verbindungen im Kaffee, die bekanntermaßen mit einer Kiefernnote zusammenhängen.',
        ],
      },
      {
        titel: 'Pflanze',
        text: [
          'Vor allem Limonen und andere Terpene gelten als wichtiger Beitrag zum Arabica-Aroma der Gesha-Genotypen. Kiefernaromen finden sich auch in anderen besonderen Arabica-Kaffees, etwa im wilden Kaffee aus dem Harenna-Wald in Äthiopien. Robustas aus aller Welt werden häufig als holzig beschrieben, seltener aber als kiefernartig. Holzig, im Unterschied zu waldig oder nach Wald, kann sich vom frischen, würzigen, blumigen Duft der Kiefer unterscheiden. Besonders bestimmte indonesische Robustas werden für ihre kiefernartigen Düfte geschätzt. Die Herkunft dieser Kiefernduftstoffe im Kaffee liegt zweifellos teilweise im rohen Samen selbst: Pinen, Myrcen und Limonen wurden in der roten Kaffeekirsche sowohl von Robusta als auch von Arabica nachgewiesen.',
        ],
      },
      {
        titel: 'Röstung',
        text: [
          'Diese Kiefernduftstoffe entstehen teilweise auch erst beim Rösten. Die harzig-holzige Qualität der Kiefer erinnert an andere Produkte des Röstens. Monoterpene bilden sich bekanntermaßen in der frühen Röstphase (unter 160 °C). Maltol, ein Produkt der Maillard-Reaktion, das meist mit Karamellaromen assoziiert wird, findet sich auch in Rinde und Nadeln von Kiefern und lässt sich regelmäßig im Kaffee schmecken.',
        ],
      },
    ],
    verwandte: [
      { nummer: 31, original: 'Zeder' },
      { nummer: 34, original: 'Holzig' },
      { nummer: 29, original: 'Thymian' },
    ],
  },

  {
    nummer: 31,
    name: 'Zeder',
    nameOriginal: 'Cedar',
    kategorieId: 'gruen-pflanzlich',
    kategorieLabel: 'Grün / Pflanzlich',
    beschreibung: [
      'Zeder ist bekannt für ihr würziges, harziges, duftendes Holz.',
      'Ihr Aroma kann an Bleistiftspäne, frisches Holz, einen Kleiderschrank oder einen erdigen Wald erinnern. Interessanterweise hat sich gezeigt, dass Zedernduft eine entspannende Wirkung hat, und das Öl gilt als antiseptisch und pilzhemmend.',
    ],
    abschnitte: [
      {
        titel: 'Taxonomie',
        text: ['Zeder ist der gebräuchliche Name für eine Gattung des Baums Cedrus innerhalb der Familie der Kieferngewächse.'],
      },
      {
        titel: 'Die Pflanze',
        text: [
          'Ein Nadelbaum, heimisch im Himalaya und im Mittelmeerraum. Cedrus atlantica, ein großer Baum aus Marokko und Algerien, trägt einen für die Gattung typischen Duft.',
        ],
      },
      {
        titel: 'Chemie',
        text: [
          'Die nach der Zeder benannte Verbindung Cedrol, ein Sesquiterpen-Alkohol, hat einen leicht holzigen Duft. Zu den gängigen Stoffen im Zedernholzöl zählen Cedrol, Cedren, Himachalan, α-Atlanton und Thujopsen. Manche Verbindungen aus der Gruppe der Sesquiterpenoide teilen eine holzige Qualität, darunter die baumspezifischen Himachalene, Santalole und Santalen. Zedernholzöl wird häufig in Shampoos und Seifen eingesetzt, um andere Düfte zu verstärken. Cedren und Cedrol sind dabei die gängigsten Stoffe, die Produkten gezielt einen holzigen Zedernduft verleihen. Im natürlichen Zedernduft tragen jedoch noch viele weitere Verbindungen zum Bukett bei.',
        ],
      },
    ],
    imKaffee: [
      {
        titel: '',
        text: [
          'Zedernnoten in Kaffee können je nach Balance der übrigen Aromen und ihrer Intensität positiv oder negativ wirken. Robustas, darunter die Conilon-Sorte, werden oft für holzige Nuancen genannt. Holzig kommt manchmal von einem Eindruck, der eher auf geringe Qualität oder Handelsware hindeutet. Im Gegensatz dazu kann Zeder auch fruchtige, blumige Züge zeigen, die als besonderer, leicht würziger Duft positiv auffallen. Welche genaue chemische Zusammensetzung zu Zedernnoten im Kaffee führt, ist bislang nicht vollständig geklärt.',
        ],
      },
      {
        titel: 'Röstung',
        text: [
          'Das Pyrazin Chinoxalin wurde im Kaffee nachgewiesen und mit einem zedernholzig-buttrigen Duft in Verbindung gebracht. Diese Noten entstehen vermutlich beim Rösten, wenn Noten von Zeder, Tabak und anderen eher harzigen oder verbrannten Düften gebildet werden. Cedrol wurde in anderen Nutzpflanzen als Produkt der Maillard-Reaktion identifiziert und wurde auch in Kaffeeblatt-Tee und Kaffee-Kombucha nachgewiesen.',
        ],
      },
    ],
    verwandte: [
      { nummer: 34, original: 'Holzig' },
      { nummer: 30, original: 'Kiefer' },
    ],
  },

  {
    nummer: 32,
    name: 'Kartoffel',
    nameOriginal: 'Potato',
    kategorieId: 'gruen-pflanzlich',
    kategorieLabel: 'Grün / Pflanzlich',
    beschreibung: [
      'Der scharfe, erdige, muffige Duft der Kartoffel kann an das Ausgraben einer Knolle aus dem Erdboden erinnern.',
      'Er wird als roher, geschälter Kartoffelgeruch beschrieben. Diese erdig-grüne Note findet sich auch in Erbsenschoten und ist bei vielen anderen Pflanzen bekannt. Die Kartoffel wurde vor bis zu 10.000 Jahren domestiziert und wird heute weltweit als Grundnahrungsmittel vieler Kulturen angebaut.',
    ],
    abschnitte: [
      {
        titel: 'Taxonomie',
        text: [
          'Die stärkehaltige Knolle der Pflanze Solanum tuberosum, ursprünglich beheimatet in der Andenregion Perus und Boliviens. Sie gehört zur Familie der Nachtschattengewächse (Solanaceae) — zusammen mit Tabak, grüner Paprika und Tomate.',
        ],
      },
      {
        titel: 'Die Pflanze',
        text: [
          'Die Pflanze ist mehrjährig, und die Knollen, die unterirdisch aus den Wurzeln wachsen, sind das stärke- und nährstoffreiche Gemüse. Die Knolle kommt in vielen Farben, Formen und Größen vor und trägt Poren, die als Augen bekannt sind.',
        ],
      },
      {
        titel: 'Chemie',
        text: [
          'Der rohe Geruch wird von einer chemischen Stoffgruppe namens Methoxypyrazine geprägt. Methoxypyrazine sind für ihren niedrigen Geruchsschwellenwert bekannt — Menschen erkennen selbst kleinste Mengen davon. Es handelt sich um Verbindungen, die aus Aminosäuren entstehen und typischerweise subtile erdige Aromen mit sich bringen. Sie können entstehen, wenn Bodenbakterien in die Knolle einwandern. Dieselben Stoffe stecken, als unerwünschte Note nach grüner Paprika oder Spargel, auch in manchen Sauvignon-Blanc- und Cabernet-Sauvignon-Weinen, wo sie von Rebstielen oder Beerenschalen stammen. Viele weitere Verbindungen tragen zum Aroma der gekochten Kartoffel bei, darunter Methionin, ein Produkt der Maillard-Reaktion.',
        ],
      },
    ],
    imKaffee: [
      {
        titel: '',
        text: [
          'Kartoffel ist im Kaffee ein schwer fassbarer und äußerst zerstörerischer Fehlton, der vor allem die Region der ostafrikanischen Großen Seen betrifft. Der Fehler mag nur wenige Kaffeesamen betreffen, wirkt sich aber deutlich auf die Qualität der gesamten Partie aus.',
        ],
      },
      {
        titel: 'Pflanze',
        text: [
          'Der Kartoffel-Fehlton hängt mit Insektenschäden durch die Antestia-Wanze (Antestiopsis orbitalis) zusammen. Diese Stinkwanzen ernähren sich von der Kaffeekirsche und schädigen dabei den Samen. Dieser Schädling befällt afrikanischen Kaffee seit mehr als einem Jahrhundert. In Jahren mit starkem Antestia-Befall wurden Schäden an bis zu 40 Prozent der Kaffeekirschen gemeldet. Antestia befällt Kaffeekirschen in unterschiedlichen Reifestadien sowie andere Teile der Kaffeepflanze.',
          'Antestia-Wanzen verbreiten mikrobielle Erreger, die zwei bestimmte Verbindungen bilden, 3-Isopropyl-2-methoxypyrazin und 2-Isobutyl-3-methoxypyrazin, die teilweise für den Fehlton verantwortlich sind. Die Gattung Pantoea aus der Familie der Enterobacteriaceae wurde als bakterieller Verursacher identifiziert, der zum Kartoffelgeschmack-Fehler im Kaffee beiträgt. Diese fakultativ anaeroben Bakterien bilden typischerweise Milchsäure und andere Stoffwechselprodukte. Es gibt Hinweise darauf, dass die Stressreaktion der Pflanze auf den Antestia-Befall zusätzlich biochemische Veränderungen im Samen auslöst, die zum Fehlton beitragen. Eine Studie aus dem Jahr 2024 verzeichnete mehr als 30 beteiligte Verbindungen beim Kartoffel-Fehlton, darunter solche, die möglicherweise mit einer Fraßreaktion der Pflanze zusammenhängen.',
          'Der charakteristische, schmutzig-rohe Kartoffelgeruch lässt sich sowohl im grünen als auch im gerösteten Kaffee erkennen. Eine der Schwierigkeiten bei der Bekämpfung dieses Fehltons ist sein scheinbar zufälliges Auftreten nach der Verarbeitung. Beschädigte, verfärbte Samen und Schwimmer lassen sich beim Sortieren zwar sorgfältig aussortieren, das garantiert aber keinen kartoffelfreien Kaffee. Der Fehlton ist äußerst zerstörerisch, weil er den wirtschaftlichen Ertrag der Erzeuger deutlich mindert. Ein Stigma gegenüber Kaffee aus der betroffenen Region hat diesen wirtschaftlichen Schaden weiter verstärkt — unabhängig davon, ob ein einzelner Kaffee betroffen ist, zögern internationale Käufer, für Kaffees aus der Region Aufpreise zu zahlen.',
        ],
      },
    ],
    verwandte: [
      { nummer: 27, original: 'Grüne Paprika' },
      { nummer: 24, original: 'Erbsenschote' },
      { nummer: 36, original: 'Muffig/Erdig' },
      { nummer: 35, original: 'Schimmlig/Feucht' },
    ],
  },

  {
    nummer: 33,
    name: 'Pappe',
    nameOriginal: 'Cardboard',
    kategorieId: 'sonstiges',
    kategorieLabel: 'Sonstiges',
    beschreibung: [
      'Pappe riecht holzig, süß, muffig, abgestanden, manchmal tierisch oder ledrig, manchmal auch nach Vanille.',
    ],
    abschnitte: [
      {
        titel: 'Herstellung',
        text: [
          'Pappe ist ein verarbeitetes Holzprodukt, für dessen Herstellung mehrere Schritte und Industrieanlagen nötig sind. Sie kann aus neuem oder recyceltem Papier entstehen, ebenso aus anderen Holzprodukten, Weich- oder Hartholz. Zuerst wird Papier oder Holz zu Faserbrei verarbeitet. Dieser wird zu großen Bögen gepresst und getrocknet. Um die Bögen zu wellen, laufen sie durch eine Wellmaschine, wo sie erhitzt und gepresst werden, sodass wellenförmige Schichten entstehen — das erhöht Stabilität und Dämmwirkung. Diese Schichten werden mit Deckflächen verklebt, wofür Klebstoffe und Leime nötig sind. Als wichtiges Verpackungsmaterial wird Pappe für viele Produkte genutzt, auch für Lebensmittel und Getränke. Bei Verzehrbarem ist es jedoch grundsätzlich unerwünscht, einen der Verpackung ähnelnden Geruch wahrzunehmen.',
        ],
      },
      {
        titel: 'Chemie',
        text: [
          'Der Geruch von Pappe gilt als Kennzeichen von Altbackenheit in vielen Lebensmitteln und Getränken. Getreide, Mehl, Brot, Cerealien, Bier und sogar Milch können mit der Zeit einen Pappgeruch entwickeln. Allgemein gilt: Werden langkettige Aldehyde Licht oder Sauerstoff ausgesetzt, zerfallen sie zu kurzkettigen Aldehyden, die nach Pappe riechen. Mehr als 35 Duftstoffe wurden in Pappe nachgewiesen. In der Regel dominieren dabei Aldehyde und phenolische Verbindungen. Vanillin, (E)- und (Z)-Non-2-enal, (R,S)-γ-Nonalacton, 2-Methoxyphenol und 3-Propylphenol gehören zu den wichtigsten identifizierten Verbindungen. Die süßen und muffigen Noten von Pappe treten dabei vergleichsweise schwach auf, verglichen mit den holzigen Düften.',
        ],
      },
    ],
    imKaffee: [
      {
        titel: '',
        text: [
          'Das WCR Sensory Lexicon beschreibt Pappe als „die Note, die man mit Pappe oder Papierverpackung verbindet“. Ein Pappgeruch im Kaffee gilt nie als positive Eigenschaft.',
        ],
      },
      {
        titel: 'Pflanze und Nachernte-Verarbeitung',
        text: [
          'Ähnlich wie holzige Düfte kann ein Pappgeruch entstehen, wenn der grüne Kaffeesamen beschädigt ist oder gealtert. Wird Kaffee schlecht verarbeitet oder getrocknet und dabei durch Pilzbefall oder Hitze geschädigt, leidet die Unversehrtheit des Kaffeesamens — das lässt sich oft am Erscheinungsbild oder in der Tasse als holzige Aromen erkennen. Diese Aromen werden durch (E)-2-Nonenal verursacht, das bei der Oxidation ungesättigter Fettsäuren wie Linolsäure entsteht, einer wichtigen Fettsäure in den Lipiden des Kaffees. Chemisch wurde diese Verbindung im grünen Kaffee als Bestandteil des komplexen Rio-Fehltons identifiziert, der schimmelig-feucht riecht. Vor dem Rösten kann sich, zusammen mit holzigen Noten, ein Pappgeruch durch unsachgemäße oder zu lange Lagerung von grünem Kaffee bilden.',
        ],
      },
      {
        titel: 'Röstung',
        text: ['Nach dem Rösten kann der Pappgeruch mit zunehmendem Alter als Zeichen von Altbackenheit noch zunehmen.'],
      },
    ],
    verwandte: [
      { nummer: 34, original: 'Holzig' },
      { nummer: 35, original: 'Schimmlig/Feucht' },
      { nummer: 31, original: 'Zeder' },
      { nummer: 37, original: 'Leder' },
      { nummer: 60, original: 'Vanille' },
    ],
  },

  {
    nummer: 34,
    name: 'Holzig',
    nameOriginal: 'Woody',
    kategorieId: 'sonstiges',
    kategorieLabel: 'Sonstiges',
    beschreibung: [
      'Holzig umfasst eine äußerst vielfältige Gruppe von Aromen. Frisch, trocken, scharf oder kräftig, würzig oder stumpf — je nach Person wird jedes davon mit Holz in Verbindung gebracht. Es kann minzig und grün sein, erdig und warm, moschusartig und süß.',
      'Zu holzig zählen Zeder, Eiche, Sandelholz, Kiefer und jedes andere frische oder trockene Holz. Der Duft kann an ein Eichenfass denken lassen, an ein Sitzungszimmer, an ein Postamt oder an einen Campingausflug. Holzig liegt wirklich im Kopf des Betrachters.',
      'Ein Schreiner kann den unterschiedlichen Duft vieler Holzarten unterscheiden — Fichte, Teak, Zebranoholz, Ebenholz, Kiefer, Redwood, Eiche, Koa, Walnuss, Eukalyptus und Rosenholz. Er oder sie findet diese Holzdüfte überall wieder. Für die meisten Menschen, die nicht beruflich mit Holz, Zimmerei oder verwandten Branchen zu tun haben, bildet sich die Erfahrung mit Holzduft wohl eher im Wald selbst.',
    ],
    abschnitte: [
      {
        titel: 'Chemie',
        text: [
          'Der holzige Duft kann chemisch stark variieren und umfasst eine komplexe Mischung aus Hunderten von Verbindungen. Holzig von Nadelbäumen wirkt meist stark aromatisch und frisch, vor allem durch Pinen (siehe Kiefer) und Kampfer, ein Terpen mit menthol-ähnlichem, würzigem Duft. In frischem Holz tragen Vetiverylacetat und Hexanal zu einer grasig-holzigen Note bei. Blumige oder zitrische Noten in frischem Holz gehen auf die duftenden Terpene Limonen und Germacren zurück. Eine scharfe, saure Note in frischem Holz kann direkt vom Alkohol Methanol oder von Essigsäure stammen, wie man sie in frischer Eiche findet.',
          'Ob frisch oder getrocknet, macht im Bukett einen großen Unterschied. In Eichenholz wurden mehr als 95 Duftstoffe eigens nachgewiesen, darunter zahlreiche Terpene, Aldehyde, Säuren und Lactone. Aromen, die an trockenes Holz erinnern, sind unter anderem süßes, warmes, geröstetes Furfural. Sandelholz wird meist als süß, warm, bernsteinartig, ledrig und sogar cremig beschrieben — Schlüsselverbindung seines charakteristischen Dufts ist das Terpen α-Santalol. Weitere warme, holzige Aromen bringt Tobacarol mit, eine weiche, warme, würzige, an Muskatnuss und Tabak erinnernde Verbindung. Trockene, süße, warme Holznoten können von Cedrylacetat, Cedrol und Vetiverol stammen. Das Terpen Caryophyllen ist ebenfalls für ein würzig-krautig-holziges Aroma bekannt.',
        ],
      },
    ],
    imKaffee: [
      {
        titel: '',
        text: [
          'Das WCR Sensory Lexicon beschreibt holzig als „die süße, braune, muffige, dunkle Note, die man mit der Rinde eines Baums verbindet“. Diese besondere Ausprägung von Holzig gilt als nussig, warm, leicht süß. Zweifellos gibt es im Kaffee mehr Spielarten von Holzig, als diese Definition abdeckt. Dennoch gibt es klare Beispiele, wo genau dieser Charakter von Holzig im Kaffee auftritt. Am bekanntesten ist das typische Profil eines sumatranischen Arabica aus Indonesien, der holzig und würzig ist und ein schweres Mundgefühl hat. Robustas aus aller Welt sind für ihre holzigen Eigenschaften bekannt. Je nach Art und Intensität kann Holzigkeit ausgewogen und positiv oder rau und adstringierend wirken. Bei Conilon-Kaffees wirkt die holzige Nuance typischerweise als raue, adstringierende Wahrnehmung mit krautigen Noten.',
        ],
      },
      {
        titel: 'Pflanze',
        text: [
          'Ein wesentlicher Ursprung von Holzigkeit im Kaffee ist der Alterungsprozess des grünen Kaffees. Unsachgemäß oder zu lange gelagerte Kaffees werden mit der Zeit holzig. Unter ungünstigen Bedingungen gelagerter Kaffee kann schnell an Qualität verlieren und diese am Ende ruinieren. Diese Eigenschaft zeigt sich dann als trockenes Holz, Eichenfass, totes Holz oder Pappgeruch. Man geht allgemein davon aus, dass dies durch den Zerfall der Zellstruktur im Samen verursacht wird. Diese Art von Holzig wird mit dem Aldehyd trans-2-Nonenal in Verbindung gebracht, einer schalen, papierartig-holzigen Note. Diese Verbindung ist ein Oxidationsprodukt ungesättigter Fettsäuren und gilt weithin als verantwortlich für den charakteristischen holzigen Duft, der in lange gelagertem Kaffee bestehen bleibt.',
        ],
      },
      {
        titel: 'Nachernte-Verarbeitung',
        text: [
          'Bei natural aufbereiteten Robustas können unter weniger als idealen Verarbeitungs- oder Trocknungsbedingungen negative, gummi- und holzartige Noten entstehen. Vermutlich verursacht durch eine Schädigung des grünen Samens, die zu einem Verlust organischer Substanz führt — ausgelöst durch Pilzbefall oder unsachgemäße Trocknung.',
        ],
      },
      {
        titel: 'Röstung',
        text: [
          'Warme, süße, holzige Aromen, wie in der WCR-Definition oben beschrieben, entstehen auch beim Rösten. Pyrazine sind ein wichtiger Bestandteil des Röstaromas vieler Lebensmittel, auch von Kaffee, und entstehen durch Maillard-Reaktionen. Das Keton Cyclotene ist für ein süßes, karamellartig-holziges Aroma bekannt und entsteht durch die Pyrolyse von Lignocellulose beim Rösten. M-Kresol und 1-Methylpyrrol tragen dunkle, warme, nussig-holzige Aromen bei. Wird die Röstung dunkel, führt der Abbau von Chlorogensäuren zur Bildung von Phenolen, darunter auch holzige Duftstoffe. Flüchtige Phenole wie Guajacol tragen zu gerösteten, holzigen, rauchigen und aschigen Noten bei.',
        ],
      },
    ],
    verwandte: [
      { nummer: 33, original: 'Pappe' },
      { nummer: 31, original: 'Zeder' },
      { nummer: 30, original: 'Kiefer' },
      { nummer: 28, original: 'Heuartig' },
    ],
  },

  {
    nummer: 35,
    name: 'Schimmlig/Feucht',
    nameOriginal: 'Moldy/Damp',
    kategorieId: 'sonstiges',
    kategorieLabel: 'Sonstiges',
    beschreibung: [
      'Dieser Duft ist ein muffiger, dumpfer Geruch, schimmelartig beschrieben, der an einen unfertigen Keller erinnert.',
      'Es ist eine allgemeine Auffälligkeit in vielen Lebensmitteln und Getränken, besonders bekannt in der Weinbranche für den „Korkfehler“, der durch kontaminierte Korken in Wein entsteht. Ein starker Korkfehler verströmt einen unangenehmen Duft, der an einen muffigen Keller erinnert. Beschreibungen des Korkfehlers reichen bis ins frühe 20. Jahrhundert zurück, die dafür verantwortliche Verbindung wurde aber erst in den 1980er-Jahren identifiziert.',
    ],
    abschnitte: [
      {
        titel: 'Chemie',
        text: [
          'Dieser Fehlton besteht vor allem aus TCA (2,4,6-Trichloranisol) und entsteht durch Pilzbefall. Andere Chloranisole und Chlorphenole können in Wein ebenfalls dazu beitragen. Neuere Untersuchungen zeigen, dass Geosmin und MIB (2-Methylisoborneol) erdige Noten beisteuern können, während Guajacol und Pyrazine einen phenolischen oder medizinischen Zug beitragen können. Menschen reagieren bemerkenswert empfindlich auf TCA — der Geruchsschwellenwert liegt bei nur 0,03 bis 1–2 Nanogramm pro Liter. Unterschiede in der Empfindlichkeit gelten als genetisch bedingt, auch wenn Training sie nachweislich verbessern kann.',
          'TCA ist ein tückisches Molekül, das die eigene Wahrnehmung stören kann: Schon eine winzige Menge unterdrückt deutlich die Übertragungsströme, die zum Riechzentrum im Gehirn führen. Untersuchungen zu diesem Thema fanden heraus, dass diese Unterdrückung dazu führt, dass Menschen insgesamt weniger Geschmack und Aroma wahrnehmen. Das erklärt, warum TCA schon in geringer Konzentration Aromen und Geschmack dämpfen oder abstumpfen und einen Wein fade und uninteressant wirken lassen kann. TCA gilt als einer der bedeutendsten Kontaminanten in vielen Lebensmitteln und Getränken, etwa Wein, Bier, Milch, Wasser, Trockenobst, Eiern, Whisky, Kakaopulver, Sake, Meeresfrüchten und Kaffee.',
          'Das biochemische Verständnis dieses Fehltons ist noch nicht vollständig geklärt. Anerkannt ist, dass er hauptsächlich durch Kontamination mit Mikroorganismen entsteht — Pilze wie Penicillium, Aspergillus, Actinomyces und Streptomyces bilden TCA als Stoffwechselprodukt, wenn bestimmte chlorierte Substrate verfügbar sind. Beim Wein trägt manchmal schon der Korkbaum selbst diese Verbindung in sich, aus der Umwelt aufgenommen, noch bevor die Korken hergestellt werden. Seit der Zusammenhang mit dem Fehler bekannt ist, wurde das aber fast vollständig beseitigt. Der Fehlton kann grundsätzlich an mehreren Stellen der Weinherstellung, Reifung und Abfüllung entstehen, sobald die Mikroorganismen unter den richtigen Bedingungen vorhanden sind.',
        ],
      },
    ],
    imKaffee: [
      {
        titel: '',
        text: [
          'Das WCR Sensory Lexicon beschreibt schimmlig/feucht als „die Note, die man mit feuchten, geschlossenen Räumen oder Kellern verbindet — kann muffig, scharf und leicht grün sein“. Im Kaffee ist sie gut als muffiger, kellerartiger Geruch beschrieben.',
        ],
      },
      {
        titel: 'Nachernte-Verarbeitung',
        text: [
          'Im Kaffee wird dieser Fehlton oft mit einem medizinischen, jodartigen oder Phenol-Fehlton vermengt. Tatsächlich ähneln sich schimmlig-feuchte Auffälligkeiten und können zusammen mit anderen Problemen auftreten, doch Aromaprofil und Wirkung unterscheiden sich. Manche nennen das den Rio-Fehlton. Der Rio-Fehlton besteht nicht nur aus muffigen Düften, sondern auch aus einem starken jodartigen, medizinischen Geruch — das Ergebnis unterschiedlicher Stoffgruppen. Der Name „Rio“ geht auf die Region in Brasilien zurück, die einst mit diesem Fehlton verflucht war. Der Fehlton existierte allerdings schon immer auch in anderen Anbauländern. Der Rio-Fehlton ist im Kaffee heute deutlich seltener als noch vor 20 Jahren, weil sich Qualität und Sorgfalt in der Kaffeeverarbeitung weltweit verbessert haben.',
          'Der muffig-erdige Fehlton im Kaffee entsteht Untersuchungen zufolge vor allem durch 2-Methylisoborneol (MIB), 2,4,6-Trichloranisol (TCA) und Geosmin. Vermutlich verursacht durch unsachgemäße Trocknungsbedingungen, die bestimmten Pilzen wie Aspergillus erlauben zu gedeihen und Fehltöne zu erzeugen.',
        ],
      },
    ],
    verwandte: [
      { nummer: 36, original: 'Muffig/Erdig' },
      { nummer: 24, original: 'Erbsenschote' },
      { nummer: 32, original: 'Kartoffel' },
    ],
  },

  {
    nummer: 1,
    name: 'Honig',
    nameOriginal: 'Honey',
    kategorieId: 'blumig',
    kategorieLabel: 'Blumig',
    beschreibung: [
      'Honig trägt den Duft der flüchtigen Blütenaromen weiter.',
      'Sein Hauptaroma ist blumig, kann aber auch fruchtig, heuartig, würzig wie Zimt, krautig, karamellig, wachsartig oder buttrig sein. Merriam-Websters Wörterbuch definiert Honig, den von Bienen erzeugten Stoff, als „ein süßes, zähflüssiges Material, gewonnen aus dem Nektar von Blüten im Honigsack verschiedener Bienenarten“.',
    ],
    abschnitte: [
      {
        titel: 'Geschichte',
        text: [
          'Die Westliche Honigbiene Apis mellifera stammt ursprünglich aus Asien oder Afrika, hat sich aber weit über ihr natürliches Verbreitungsgebiet hinaus ausgebreitet und lebt heute auf jedem Kontinent außer der Antarktis. Menschen betreiben seit Tausenden von Jahren weltweit Bienenzucht, um Honig zu gewinnen. Honig wurde im alten Ägypten, in Griechenland, Rom und China verzehrt und diente auch als Heilmittel gegen Krankheiten sowie zur Wundheilung.',
        ],
      },
      {
        titel: 'Herstellung',
        text: [
          'Bienen sammeln Pollen und Nektar von Blüten und wandeln sie in Honig um, den sie in ihren Waben lagern, um die wachsende Brut des Volkes zu ernähren. In freier Wildbahn haben Honigbienen meist ein großes Streifgebiet und sammeln Pollen von vielen verschiedenen Pflanzenarten. Je nachdem, welche Blüten besucht wurden, kann der Honig ganz unterschiedliche flüchtige Aromen tragen. Bekannte, im Handel erhältliche Honigsorten sind unter anderem Orangenblüten-, Manuka-, Akazien-, Kastanien- und Lindenhonig. Honig galt lange als Speise der Götter, und seine Herstellung, sein Duft und seine Eigenschaften werden seit Jahrtausenden mit Romantik, Genuss und Luxus in Verbindung gebracht.',
        ],
      },
      {
        titel: 'Chemie',
        text: [
          'Der Gehalt des Honigs hängt eng mit seiner botanischen Herkunft und der Region zusammen, aus der er stammt. Flüchtige Verbindungen stammen im Allgemeinen aus der Pflanze selbst, aus der Umwandlung pflanzlicher Stoffe durch den Stoffwechsel der Biene, aus Erhitzung oder Handhabung bei Verarbeitung und Lagerung, oder aus mikrobieller beziehungsweise umweltbedingter Kontamination. Honig besteht überwiegend aus Fruktose und Glukose, dazu weitere Kohlenhydrate, Wasser, Enzyme, Amino- und organische Säuren, Mineralien, Wachse und Aromastoffe. Mehr als 300 flüchtige Verbindungen wurden in Honigen aus aller Welt identifiziert. Je nach Honig kann der charakteristische Duft von einer einzigen dominanten Aromaverbindung stammen oder aus dem Zusammenspiel vieler Verbindungen entstehen.',
          'Zu den wichtigsten chemischen Gruppen, die zum Honigaroma beitragen, zählen Alkohole, Säuren, Ketone, Kohlenwasserstoffe, Ester, Aldehyde, Furane, Terpene und Lactone. Phenylacetaldehyd, ein Aldehyd, hat den charakteristischen honigartigen Duft, der von der Duftstoffindustrie genutzt wird. Weitere bemerkenswerte Verbindungen in Honig sind Benzaldehyd (süß, mandelartig), Nonanal und Nonanol (nach Zitrus, blumig und grün riechend), Linalool (ähnlich blumig und zitrisch) sowie Furfural (fruchtig, nach Kirsche riechend). Honig spiegelt die Blütennoten der Pflanzen wider, aus denen er entstanden ist.',
        ],
      },
    ],
    imKaffee: [
      {
        titel: '',
        text: [
          'Das WCR Sensory Lexicon beschreibt Honig als „eine süße, hellbraune, leicht würzige Note, die man mit Honig verbindet“. Viele verschiedene Kaffees können Honignoten zeigen, was zweifellos mit der Zahl und Vielfalt der chemischen Verbindungen zusammenhängt, die zum Honig selbst beitragen. Honigartige Aromen können im grünen Samen, während der Nachernte-Verarbeitung oder beim Rösten entstehen, je nachdem, um welche Verbindung es sich handelt.',
          'Viele Kaffees mit ausgeprägten blumigen Noten haben das Potenzial, eine honigartige Süße zu zeigen. Das kommt bei Arabica häufiger vor als bei Robusta. Dieses Potenzial hängt stark mit der menschlichen Assoziation zwischen Honig und Blumen zusammen, die je nach individueller Erinnerung unterschiedlich ausfällt.',
        ],
      },
      {
        titel: 'Pflanze',
        text: [
          'Äthiopische Kaffees werden oft für ihre von Natur aus blumigen Bouquets erkannt, vermutlich wegen der großen genetischen Vielfalt in diesem Ursprungszentrum der Arabica-Pflanze. Phenylethylalkohol hat einen süßen, blumigen, honigartigen Duft und gilt als wichtige Verbindung im äthiopischen Kaffee. Phenylacetaldehyd und Benzolessigsäure, beide mit Honigaromen assoziiert, wurden ebenfalls in äthiopischem Kaffee nachgewiesen. Das Keton β-Damascenon und 2-Phenylethanol haben blumige Honignoten und wurden sowohl in grünem als auch in geröstetem Kaffee gefunden.',
        ],
      },
      {
        titel: 'Nachernte-Verarbeitung',
        text: [
          'Es wird vermutet, dass bestimmte Schritte der Nachernte-Verarbeitung das Honigaroma im Kaffee beeinflussen. Während der Fermentation nimmt die Honig-Eigenschaft mit der Beimpfung von Saccharomyces-cerevisiae-Hefen zu. Phenylessigsäure, ein blumig-honigartiges Aroma, wird mit dieser Hefe in Verbindung gebracht.',
        ],
      },
      {
        titel: 'Röstung',
        text: [
          'Schließlich können Honignoten auch während des Röstens entstehen. Das Aldehyd Phenylacetaldehyd riecht im Kaffee nach Honig und Blüten und kann je nach Zeit- und Temperaturverlauf beim Rösten sowohl entstehen als auch wieder verloren gehen. Es bildet sich während der Strecker-Abbaureaktion, einem Teil der Maillard-Reaktionen.',
        ],
      },
    ],
    verwandte: [
      { nummer: 28, original: 'Heuartig' },
      { nummer: 4, original: 'Jasmin' },
      { nummer: 60, original: 'Vanille' },
      { nummer: 25, original: 'Frisches Gras' },
      { nummer: 59, original: 'Karamellisiert' },
      { nummer: 43, original: 'Butter' },
    ],
  },

  {
    nummer: 2,
    name: 'Schwarzer Tee',
    nameOriginal: 'Black tea',
    kategorieId: 'blumig',
    kategorieLabel: 'Blumig',
    beschreibung: [
      'Schwarzer Tee hat ein süßes, erdiges Aroma, das Honig-, Malz-, Kartoffel-, Blüten- und Fruchtnoten enthalten kann. Je nach Tee kann er krautig oder rauchig sein.',
      'Geschmack und Aroma von Tee kommen von der Pflanze selbst, von der Verarbeitung und von Qualität und Alter des Tees. Das Teearoma wird stark von der Teesorte geprägt. Rollen, Trocknen und Oxidation erlauben eine spontane Fermentation der Blätter, wodurch der kräftige Geschmack und das charakteristische Aroma entstehen. Manche Schwarztees werden so weit getrocknet, dass es fast einer Röstung gleichkommt — das bringt zusätzliche Aromen hervor.',
    ],
    abschnitte: [
      {
        titel: 'Taxonomie',
        text: ['Schwarzer Tee besteht aus den verarbeiteten Blättern des Strauchs Camellia sinensis.'],
      },
      {
        titel: 'Die Pflanze',
        text: [
          'Schwarzer Tee stammt ursprünglich aus China und gilt, nach Wasser, oft als das weltweit meistgetrunkene Getränk.',
        ],
      },
      {
        titel: 'Chemie',
        text: [
          'In schwarzem Tee wurden Hunderte flüchtiger Verbindungen identifiziert, dominiert von Estern und Alkoholen. Manche entstehen durch Oxidation und enzymatische Umwandlung bei der Teeblattverarbeitung, andere durch Maillard-Reaktionen. Aldehyde wie Hexanal bilden die grünen, frischen Noten. Alkohole tragen blumige und zitrische Noten bei. Geraniol — benannt nach der Blüte der Geranie — hat einen warmen, rosenartigen Duft. Linalool wird oft als lavendelartig beschrieben, kann aber auch zitrisch wirken. Nerolidol schließlich ist ein Alkohol, der schwarzem Tee eine holzig-rindenartige Note verleiht. Blumige Ketone, darunter Damascenon und Ionon, tragen zu den rosen- und blumenartigen, tabakähnlichen Aromen bei. Bei einer derart komplexen Mischung aus Genetik, Verarbeitung und kulturellen Praktiken lässt sich die Vielfalt und Menge im schwarzen Tee nicht auf wenige Verbindungen reduzieren. Wie Kaffee ist auch Tee eine ganze Welt für sich — und eine sehr geschätzte.',
        ],
      },
    ],
    imKaffee: [
      {
        titel: '',
        text: [
          'Das WCR Sensory Lexicon beschreibt schwarzen Tee als „eine etwas braune, muffige Note nach getrockneter Pflanze und getrockneter Rinde, die man mit der Oxidation von Teeblättern verbindet“. Manche Kaffeeverkoster beschreiben teeartig eher als Textur denn als Aroma. Vielleicht ist es ebenso vereinfachend, ein Kaffeearoma als schwarzen Tee zu beschreiben, wie eine Kaffeenote im Wein zu finden.',
        ],
      },
      {
        titel: 'Pflanze und Nachernte-Verarbeitung',
        text: [
          'Eine große Kombination von Chemie führt vermutlich zur Wahrnehmung von schwarzem Tee im Kaffee. Viele der wichtigsten Verbindungsgruppen im schwarzen Tee kommen auch im Kaffee vor. Wie beim Tee finden sich grüne und holzig-krautige Noten im grünen Kaffee. Fruchtige und blumige Ketone, Alkohole und Ester sind oft Produkte der Fermentation während der Nachernte-Verarbeitung des Kaffees. Linalool wurde in vielen Arabica-Kaffees nachgewiesen, sowohl grün als auch geröstet, und wird als holzig, blumig, sogar zitrisch beschrieben. Beta-Damascenon, eine holzig-blumige Note, wurde in erheblichen Mengen in Robusta-Kaffees festgestellt.',
        ],
      },
      {
        titel: 'Röstung',
        text: [
          'Malzige, süße und karamellisierte Noten, wie sie im Tee vorkommen, können in beiden Produkten durch Maillard-Reaktionen entstehen. Die genaue Kombination davon und ihre Assoziation mit schwarzem Tee ist vermutlich ein Produkt der jeweils eigenen Erfahrung. Kaffees vom afrikanischen Kontinent, reich an fruchtigen Noten, etwa aus Kenia oder Burundi, können einen kräftigen Schwarztee-Duft zeigen. Andere blütenbetonte Kaffees, etwa äthiopischer Yirgacheffe, können ebenfalls einen Schwarztee-Charakter annehmen.',
        ],
      },
    ],
    verwandte: [
      { nummer: 1, original: 'Honig' },
      { nummer: 3, original: 'Rose' },
      { nummer: 60, original: 'Vanille' },
      { nummer: 45, original: 'Malz' },
      { nummer: 59, original: 'Karamellisiert' },
      { nummer: 42, original: 'Rauchig' },
      { nummer: 18, original: 'Orange' },
    ],
  },

  {
    nummer: 3,
    name: 'Rose',
    nameOriginal: 'Rose',
    kategorieId: 'blumig',
    kategorieLabel: 'Blumig',
    beschreibung: [
      'Der Duft der Rose wird oft als weich und blumig beschrieben. Rosen sind süß, moschusartig, holzig und blumig mit einer grünen Frische. Sie können scharf oder harzig, würzig, fruchtig oder waldig wirken.',
    ],
    abschnitte: [
      {
        titel: 'Taxonomie',
        text: [
          'Es gibt verschiedene Arten der Gattung Rosa in der Familie der Rosengewächse. Innerhalb der etwa 100 Rosa-Arten gibt es bis zu 20.000 Kultursorten.',
        ],
      },
      {
        titel: 'Die Pflanze',
        text: [
          'Die Rose, oft die Königin der Blumenwelt genannt, ist die Blüte einer verholzenden, langlebigen, ausdauernden Pflanze. Die wilden Blüten haben typischerweise fünf Blütenblätter in Rosa, Rot oder Weiß, mit einigen Ausnahmen. Rosen bilden Samenkörper, sogenannte Hagebutten, die eine ausgezeichnete Vitamin-C-Quelle sind.',
        ],
      },
      {
        titel: 'Geschichte',
        text: [
          'Die Vorfahren der Pflanze, die wir heute als Rose kennen, stammen aus China, wo Menschen schon vor rund 5.000 Jahren begannen, Gartenrosen zu kultivieren. Die Blüte der Rosa-Pflanze verströmt einen markanten Duft, und das Rosenbukett gehört zu den bekanntesten blumigen Gerüchen überhaupt. Seit der Antike wird aus Rosen Rosenöl oder Rosenwasser gewonnen, um ihren Duft festzuhalten, und sie dienten kosmetischen, kulinarischen, medizinischen und religiösen Zwecken.',
        ],
      },
      {
        titel: 'Chemie',
        text: [
          'Der wiedererkennbare Rosenduft entsteht überwiegend durch monoterpene Alkohole wie Geraniol, Citronellol, Eugenol, Linalool sowie das Benzenoid Phenylethanol. Von diesen sind Geraniol, Linalool und Phenylethanol vor allem blumig, Citronellol verströmt Zitrusnoten, und Eugenol trägt eine nelkenartige Würze bei. Mehr als 400 Verbindungen tragen insgesamt zum Rosenaroma bei, doch 2-Phenylethanol gilt als die häufigste zugrunde liegende flüchtige Verbindung, die für den unverwechselbaren Rosenduft verantwortlich ist.',
        ],
      },
    ],
    imKaffee: [
      {
        titel: '',
        text: [
          'Das WCR Sensory Lexicon beschreibt Rose als „einen süßen, weichen, leicht muffig-staubigen Blütenduft, den man mit frischen oder getrockneten Rosen verbindet“. Rose ist eine besondere blumige Qualität, die angenehm wirkt, mit einer begleitenden Säure, die an eine Hagebutte erinnern kann.',
        ],
      },
      {
        titel: 'Pflanze',
        text: [
          'Man weiß, dass diese Verbindungen sich beim Reifen der Frucht bilden beziehungsweise vermehren, weshalb sie möglicherweise auch schon im Samen bei der Ernte vorhanden sind. Linalool und Geraniol wurden in Kaffees unterschiedlichster Herkunft nachgewiesen. Terpene gelten bekanntermaßen als bedeutender Beitrag zur Kaffeequalität. Monoterpene sind flüchtige Verbindungen, die von der Blüte über die Frucht bis zum Samen des Kaffees vorkommen und den Röstprozess überstehen.',
        ],
      },
      {
        titel: 'Nachernte-Verarbeitung',
        text: [
          'Während der Nachernte-Verarbeitung des Kaffees tragen Mikroorganismen als Fermentations-Stoffwechselprodukte weitere dieser erwünschten Aromastoffe bei. Monoterpen-Alkohole sind auch bekannte Produkte von Hefen, darunter die Gattung Saccharomyces, die bei der Kaffee-Nachernte-Verarbeitung verbreitet ist. Die Zugabe dieser Hefen erhöht nachweislich direkt die Menge an 2-Phenylethylacetat, dem Rosenduftstoff. Die Hefearten Pichia und Kloeckera wurden gezielt dafür identifiziert, 2-Phenylethanol zu bilden, die Verbindung mit dem eindeutigsten Rosenaroma.',
        ],
      },
      {
        titel: 'Röstung',
        text: [
          'Nach dem Rösten des Kaffees bleibt ein Großteil dieser Aromastoffe erhalten und übersteht auch den Aufguss. Diese Verbindungen, die blumige und Rosennoten beisteuern, können die Qualität des Aufgusses erheblich beeinflussen und sind in vielen Märkten gefragt.',
        ],
      },
    ],
    verwandte: [
      { nummer: 4, original: 'Jasmin' },
      { nummer: 1, original: 'Honig' },
      { nummer: 34, original: 'Holzig' },
    ],
  },

  {
    nummer: 4,
    name: 'Jasmin',
    nameOriginal: 'Jasmine',
    kategorieId: 'blumig',
    kategorieLabel: 'Blumig',
    beschreibung: [
      'Der Duft von Jasmin ist einzigartig und unverwechselbar, mit einem reichen, blumigen Aroma, das süß, würzig und moschusartig ist.',
    ],
    abschnitte: [
      {
        titel: 'Taxonomie',
        text: [
          'Die Gattung Jasminum gehört zur Familie der Ölbaumgewächse (Oleaceae) und umfasst viele Arten, darunter J. officinale, den gewöhnlichen Jasmin.',
        ],
      },
      {
        titel: 'Die Pflanze',
        text: [
          'Diese Gattung ist für ihre süßen, zarten Blüten bekannt, die einen betörenden Duft verströmen. Die Blüten sind typischerweise weiß und fünfblättrig. Die Pflanze ist eine kräftig wachsende Kletterpflanze. Der blumige Duft wird bekanntermaßen stärker, wenn die Pflanze in eine Umgebung kommt, in der die Temperatur nachts absinkt.',
        ],
      },
      {
        titel: 'Geschichte',
        text: [
          'Wo genau Jasmin ursprünglich herstammt, ist unbekannt — die Pflanze wird aber seit langer Zeit in ganz Asien genutzt. Jasminöl dient seit Jahrhunderten als Parfüm und für medizinische Zwecke. Die Art J. sambac wird traditionell verwendet, um Jasmintee in China zu aromatisieren, und J. grandiflorum sowie J. sambac werden seit Jahrhunderten in Indien genutzt.',
        ],
      },
      {
        titel: 'Chemie',
        text: [
          'Die Blüte der Jasminpflanze verströmt eine Mischung aus Alkoholen, Aldehyden, Ketonen, Estern, Phenolen und Alkenen. Benzylalkohol trägt wesentlich zum frischen, blumigen Duft bei. Linalool sorgt für die typische blumig-würzige Note. Indol macht bis zu 10 Prozent des typischen Jasminaromas aus und steuert die krautige, „schmutzige“ Blütennote bei, die zusätzlich von Kresolen beeinflusst wird. Der Duft dieser Blüte ist so eigen und wiedererkennbar, dass Verbindungen wie Jasmon und Jasminaldehyd bekannt sind und in der Duftstoffindustrie gezielt genutzt werden, um den charakteristischen Duft nachzubilden. Interessanterweise stammt die Verbindung Jasminaldehyd dabei aus Rizinusöl, nicht aus der Pflanze selbst.',
        ],
      },
    ],
    imKaffee: [
      {
        titel: '',
        text: [
          'Das WCR Sensory Lexicon beschreibt Jasmin als „eine intensive, leicht durchdringende, süße, blumige Note mit einem unterliegenden grünen, muffig-staubigen Zug“. Diese moschusartige Blütennote wird oft mit den Blüten der Kaffeepflanze selbst verglichen, die ein ähnliches Aromabukett tragen. Jasmin-Duftstoffe wurden sowohl in grünem als auch in geröstetem Kaffee nachgewiesen. Methyl-2-phenylacetat ist eine wichtige, im Kaffee identifizierte Verbindung, die für eine Jasminnote verantwortlich ist.',
        ],
      },
      {
        titel: 'Pflanze',
        text: [
          'Blütennoten, besonders Jasmin, sind in vielen Märkten äußerst begehrt. Blumige Aromen deuten meist auf einen zarten oder weichen Kaffee hin. Ein äthiopischer Yirgacheffe ist ein klassisches Beispiel für einen Kaffee mit ausgeprägter Jasminnote, oft verbunden mit ähnlichen blumigen Noten. Andere blumige Kaffees, etwa Gesha aus Panama, Guatemala oder Kolumbien, werden häufig mit dieser Art von Blütenduft beschrieben. Andere Kaffees, etwa aus Kenia, Burundi und Ruanda, können fruchtig sein und blumige Noten wie Jasmin anklingen lassen. Manche krautigen Kaffees mit moschusartig-würzigen Noten schließlich können ebenfalls an Jasmin erinnern.',
        ],
      },
    ],
    verwandte: [
      { nummer: 1, original: 'Honig' },
      { nummer: 3, original: 'Rose' },
      { nummer: 2, original: 'Schwarzer Tee' },
      { nummer: 60, original: 'Vanille' },
    ],
  },

  {
    nummer: 5,
    name: 'Himbeere',
    nameOriginal: 'Raspberry',
    kategorieId: 'fruchtig',
    kategorieLabel: 'Fruchtig',
    beschreibung: [
      'Himbeer-Aroma ist weich, süß und saftig, hell, blumig und herb-säuerlich. Es findet sich häufig in Desserts, Eis, Konfitüren und Gelees.',
    ],
    abschnitte: [
      {
        titel: 'Taxonomie',
        text: ['Die aggregierten Beeren des Strauchs Rubus idaeus, ein Mitglied der Familie der Rosengewächse.'],
      },
      {
        titel: 'Die Pflanze',
        text: [
          'Die ausdauernde Pflanze bildet dornige Ruten, die zweijährig Früchte tragen. Im Anbau werden die Ruten jedes Jahr zurückgeschnitten, damit die Pflanze erneut trägt. Die Ruten können mehr als 2 Meter hoch werden. Die Pflanze hat weiße oder rosa, fünfblättrige Blüten und trägt saftige Früchte. Die Frucht wird meist Beere genannt, ist aber genau genommen ein aggregiertes Steinfruchtgebilde aus vielen kleinen Steinfrüchtchen, von denen jede einen einzigen Samen enthält. Eine Himbeere kann aus bis zu 100 solcher Steinfrüchtchen bestehen und bis zu 5 Gramm wiegen. Ein Strauch kann Hunderte Beeren im Jahr liefern. Es ist eine flüchtige Frucht mit kurzer Saison: Einmal gepflückt, hält eine Beere nur etwa einen Tag, bevor sie Schimmel und anderen hungrigen Mikroben zum Opfer fällt.',
        ],
      },
      {
        titel: 'Chemie',
        text: [
          'Das Duftprofil der roten Himbeere wird von Norisoprenoiden, Lactonen, Carbonylverbindungen, Estern und Alkoholen dominiert. Zu den am häufigsten nachgewiesenen Verbindungen zählen Ketone wie Ionone (die nach Rose und Veilchen riechen) und das sogenannte Himbeerketon. Dem Namen nach gilt Himbeerketon offensichtlich als die charakteristische Verbindung des Himbeeraromas. Das Aldehyd Benzaldehyd riecht nussig-fruchtig, ähnlich wie Mandel. Hexanal riecht grasig, grün und frisch. Die Terpene α-Pinen, β-Caryophyllen, β-Myrcen, Linalool, Geraniol und trans-β-Ocimen steuern holzige, blumige und würzige Noten bei. Zu den Estern zählen Ethylacetat und Ethylheptanoat, dazu der Alkohol 2-Methylbutanol.',
        ],
      },
    ],
    imKaffee: [
      {
        titel: '',
        text: [
          'Das WCR Sensory Lexicon beschreibt Himbeere als „die leicht süße, fruchtige, blumige, leicht saure und muffige Note, die man mit Himbeeren verbindet“. Es gibt eine gute Überschneidung zwischen den Aldehyden, Ketonen, Alkoholen und Estern, die den Duft der Himbeere ausmachen, und denen im Kaffee. All diese Verbindungsarten lassen sich leicht in Kaffees aus aller Welt nachweisen — vermutlich ein Ergebnis von Genetik, Umwelt und menschlichem Einfluss auf diese Kaffees.',
        ],
      },
      {
        titel: 'Nachernte-Verarbeitung',
        text: [
          'Traditionelle Kaffee-Aromaprofile kannten solch helle, rote Fruchtnoten nicht, bis sich der natural-Prozess weiterentwickelte. Seit den frühen 2000er-Jahren haben Qualität und Akzeptanz von naturals den Markt vorangetrieben, und mit ihnen kam eine Welle heller, saftiger Fruchtnoten. Himbeerketon selbst wurde im Kaffee identifiziert, und es wurde vermutet, dass es zu einem insgesamt fruchtigen Charakter beiträgt, besonders bei äthiopischem Kaffee. Furanon, dem eine Himbeernote zugeschrieben wird, wurde in fertig aufgegossenem Kaffee nachgewiesen, die Herkunft dieser Verbindung ist aber unbekannt. Das genaue Rezept dafür bleibt bislang offen — jeder Prozess, der die Fermentation dazu bringt, fruchtige Eigenschaften zu verstärken, hat das Potenzial, eine Himbeernote zu erzeugen.',
        ],
      },
    ],
    verwandte: [
      { nummer: 8, original: 'Erdbeere' },
      { nummer: 6, original: 'Blaubeere' },
      { nummer: 3, original: 'Rose' },
    ],
  },

  {
    nummer: 6,
    name: 'Blaubeere',
    nameOriginal: 'Blueberry',
    kategorieId: 'fruchtig',
    kategorieLabel: 'Fruchtig',
    beschreibung: [
      'Der Duft dieser dunkelblauen Beeren ist süß, sauer und wird oft als teeartig und blumig beschrieben.',
    ],
    abschnitte: [
      {
        titel: 'Taxonomie',
        text: [
          'Eine Frucht aus einer Untergruppe kultivierter Pflanzen der Gattung Vaccinium. Diese Gattung umfasst Hunderte Arten, heimisch von den Tropen bis in die Arktis, darunter Blaubeeren, Preiselbeeren, Moosbeeren und andere. Die Sektion Vaccinium sect. Cyanococcus ist die als Blaubeeren bekannte Gruppe, mit Hochbusch- und Niedrigbuschtypen.',
        ],
      },
      {
        titel: 'Die Pflanze',
        text: [
          'Die Blaubeere ist ein weit verbreiteter, ausdauernder Strauch. Ursprünglich war die Gattung überwiegend zirkumpolar verbreitet, heimisch in Nordamerika. Sie wird meist in halbwildem Anbau kultiviert. Die Hochbusch-Typen wurden im 20. Jahrhundert vom US-Landwirtschaftsministerium (USDA) gezüchtet.',
        ],
      },
      {
        titel: 'Chemie',
        text: [
          'In Blaubeeren wurden bis zu 200 flüchtige organische Verbindungen nachgewiesen, die alle zum Aroma beitragen können. 1937 beschrieb Frederick Colville, der erste dokumentierte Blaubeer-Züchter, frühe Sorten als „köstlich und aromatisch im Geschmack“. Die chemische Zusammensetzung des Blaubeeraromas ist komplex und umfasst Terpene, Ester, Alkohole und Aldehyde, die typischerweise fruchtige, blumige Noten zu Lebensmitteln und Getränken beitragen. Linalool wurde in vielen Studien als bedeutender Beitrag zum besonderen blumigen Aroma der Blaubeere identifiziert. Forscher haben eine Gruppe von acht terpenoiden, flüchtigen Stoffen identifiziert (p-Cymol, Myrtenal, Linalool, L-Carvenol, Geranylaceton, Geranylacetat, D-Limonen und β-Myrcen), die die wichtigsten chemischen Verbindungen dieses Aromas ausmachen.',
        ],
      },
    ],
    imKaffee: [
      {
        titel: '',
        text: [
          'Das WCR Sensory Lexicon beschreibt Blaubeere als „die leicht dunkle, fruchtige, süße, leicht saure, muffig-staubige, blumige Note, die man mit Blaubeeren verbindet“. Wegen ihrer ausgeprägten, hochintensiven Fruchtnote in der Tasse ist Blaubeere oft ein Aroma, das auch Neulinge in der Kaffeewelt sofort wiedererkennen. Das macht es leicht erkennbar und wertvoll innerhalb der komplexen Aromamischung des Kaffees.',
        ],
      },
      {
        titel: 'Pflanze',
        text: [
          'Kultivierte Blaubeersorten haben ähnliche Noten und Intensitäten wie jene im Kaffeearoma. Insbesondere Blaubeere gehört zu den unverwechselbarsten Aromen, die in äthiopischen Kaffees vorkommen. Charakteristisch für die Region Harrar (Oromia) in Äthiopien, kann diese Note auch in anderen äthiopischen Kaffees oder weltweit angebauten äthiopischen Sorten auftreten. Dieses Aroma ist Bestandteil des weinigen Charakters, der für das typische Mokka-Profil steht. Linalool, ebenfalls in Blaubeeren enthalten, gilt als eine der wichtigsten flüchtigen Aromaverbindungen im Harrar-Kaffee.',
        ],
      },
      {
        titel: 'Nachernte-Verarbeitung',
        text: [
          'Traditionell werden Harrar-Kaffees wegen des Klimas in der Region natural aufbereitet — der Kaffee wächst und trocknet dort typischerweise in voller Sonne. Dunkle Fruchtnoten wie Blaubeere sind bei natural aufbereiteten Kaffees typisch, wegen der Vielfalt der Fermentationsreaktionen, die zur Chemie so verarbeiteter Kaffees beitragen und zu einer Bandbreite an fruchtigen und weinigen Aromen führen können.',
        ],
      },
    ],
    verwandte: [
      { nummer: 2, original: 'Schwarzer Tee' },
      { nummer: 5, original: 'Himbeere' },
    ],
  },

  {
    nummer: 7,
    name: 'Schwarze Johannisbeere',
    nameOriginal: 'Black Currant',
    kategorieId: 'fruchtig',
    kategorieLabel: 'Fruchtig',
    beschreibung: [
      'Schwarze Johannisbeeren haben ein scharfes, herbes, moschusartig-schwefeliges dunkles Fruchtaroma, das etwas an Trauben erinnern kann.',
      'Diese Beeren werden häufig zu Konfitüren, Sirupen und Likören verarbeitet. Manchmal stecken sie auch in der Füllung von Gebäck wie Mince Pies. Der Duft kann an eine gehaltvolle Flasche Pinot Noir oder Burgunder erinnern.',
    ],
    abschnitte: [
      {
        titel: 'Taxonomie',
        text: ['Die Frucht des Strauchs Ribes nigrum, auch als Cassis bekannt.'],
      },
      {
        titel: 'Die Pflanze',
        text: [
          'Ein sommergrüner Strauch, weit verbreitet in Europa und Asien angebaut. Der Strauch hat kurze Triebe und behaarte, mit Drüsen besetzte Blätter. Die Sträucher werden etwa 1,5 Meter hoch und bilden mehrere Stämme. Aus den Blüten entstehen lange, herabhängende Fruchtstände, die Johannisbeeren genannt werden. Die schwarze, runde Frucht ist botanisch eine echte Beere. Sie ist reich an Vitamin C, Anthocyanen und Antioxidantien.',
        ],
      },
      {
        titel: 'Geschichte',
        text: [
          'Während des Zweiten Weltkriegs ermutigte die britische Regierung Hobbygärtner, wegen ihres Vitamin-C-Gehalts schwarze Johannisbeeren anzupflanzen und zu essen. In den USA war die Frucht bis ins frühe 20. Jahrhundert beliebt, wurde dann aber für die Verbreitung des Weymouthskiefern-Blasenrosts verantwortlich gemacht und landesweit verboten. Das Bundesverbot wurde 1966 aufgehoben, blieb aber in vielen Bundesstaaten bis in die frühen 2000er-Jahre in Kraft.',
        ],
      },
      {
        titel: 'Chemie',
        text: [
          'Das unverwechselbare Bukett der schwarzen Johannisbeere ist eine Mischung aus fruchtigen Estern, schwefelhaltigen Verbindungen wie Thiolen sowie holzig-grünen Terpenen. Wichtige fruchtige Ester sind Ethylbutyrat, Hexylacetat und Methylbenzoat. Das Aldehyd Hexanal steuert den grünen, grasigen Charakter bei. Pinen, Terpineol und 3-Caren tragen zur holzigen Note bei. Die eigentlichen Stars sind aber die Thiole, die den moschusartig-fruchtigen Ton liefern, den Fans der Frucht so schätzen. Dazu zählen 1-Methoxy-3-methyl-3-mercaptobutan, 2-Methoxy-4-methyl-4-butanthiol und 4-Thio-4-methylpentan-2-on, alle mit starkem Eigengeruch. Manche dieser schwefelhaltigen Verbindungen gelten als „katzenartig“, wegen ihrer Ähnlichkeit zum Geruch von Katzenurin.',
        ],
      },
    ],
    imKaffee: [
      {
        titel: '',
        text: [
          'Die häufigsten Kaffees, die mit einer Schwarze-Johannisbeere-Note in Verbindung gebracht werden, stammen aus den ostafrikanischen Anbauregionen. Kenianische Kaffees werden traditionell für ihre saftigen, hellen Johannisbeer-Noten geschätzt. Kaffees aus Ruanda, Burundi, Tansania und Äthiopien können ebenfalls Aromen dunkler Beeren zeigen, die sich der schwarzen Johannisbeere zuordnen lassen. Kaffees mit dunklen Fruchtnoten, etwa aus dem Jemen, können ebenfalls eine Johannisbeer-Note zeigen, das ist aber nicht garantiert.',
          'Fruchtige, schwefelhaltige Thiole ähnlich denen in schwarzen Johannisbeeren wurden auch im Kaffee identifiziert. So können etwa 2,4-Dimethyloxazol und 1-Butanol in geringer Konzentration moschusartig und johannisbeerartig wirken. Das durchdringende 3-Mercapto-3-methylbutylformat wird als katzenartig und johannisbeerartig beschrieben. Diese Verbindungen können auch eine grüne, johannisbeerartige Note verleihen — 3-Mercapto-3-methylbutylformat wurde in geröstetem Kaffee nachgewiesen.',
          'Zwar wurde gezeigt, dass manche dieser schwefelhaltigen Verbindungen bei dunkler Röstung verbrennen, doch sie sind überhaupt nur durch ein komplexes Netz aus Vorstufen vorhanden, das bei der Kaffeegenetik beginnt, von der Umwelt beeinflusst und während der Nachernte-Verarbeitung umgewandelt wird. Das besondere Aroma der schwarzen Johannisbeere ist in Kaffees aus unterschiedlichsten Anbauregionen möglich (auch außerhalb Afrikas), verarbeitet in unterschiedlichen Stilen (gewaschen, eingeweicht oder nicht, natural) und passend geröstet. Das gehört zu jener Magie — oder jenem Unbekannten — des Kaffees, die uns immer wieder entgeht und die Suche danach am Laufen hält.',
        ],
      },
    ],
    verwandte: [
      { nummer: 22, original: 'Weinig' },
      { nummer: 10, original: 'Backpflaume' },
    ],
  },

  {
    nummer: 8,
    name: 'Erdbeere',
    nameOriginal: 'Strawberry',
    kategorieId: 'fruchtig',
    kategorieLabel: 'Fruchtig',
    beschreibung: [
      'Das Erdbeer-Aroma ist süß, herb, blumig und wird oft als weich beschrieben.',
      'Diese vielgeliebte Frucht wird frisch genossen und in unzähligen Gebäcken und Desserts verarbeitet. Ihr Duft kann an Eiscreme oder frische Sahne erinnern, an eine Sommertorte, ein Trifle oder eine Konfitüre. Der Anbau der Erdbeere begann im 18. Jahrhundert in Europa, wilde Erdbeeren wurden aber schon Jahrhunderte zuvor genossen. In vielen Anbaugebieten ist die Saison kurz und die Frucht empfindlich und flüchtig — das Aroma verändert sich während der Nachreifung nach der Ernte dramatisch, weshalb im kommerziellen Umfeld mit der Nachernte-Verarbeitung besonders sorgfältig umgegangen werden muss.',
    ],
    abschnitte: [
      {
        titel: 'Taxonomie',
        text: [
          'Die Frucht der Gattung Fragaria. Es gibt weltweit etwa 23 Arten wilder und kultivierter Erdbeeren. Die häufigste Wildart ist F. vesca, die meistangebaute Gartenerdbeere ist die Hybride F. × ananassa.',
        ],
      },
      {
        titel: 'Die Pflanze',
        text: [
          'Die Erdbeere ist eine reizvolle, niedrig wachsende, krautige Pflanze. Ihre behaarten Blätter sind zusammengesetzt aus drei gesägten Blättchen. Die süßen Blüten sind zart, weiß und blühen in kleinen Büscheln. Die Frucht der Erdbeere ist streng genommen gar keine Beere, sondern eine sogenannte Sammelnussfrucht. Der rote, fleischige Teil, den wir essen, ist eigentlich der vergrößerte Blütenboden, der zahlreiche Nüsschen trägt — das sind die „Samen“, die man außen sieht. Ein solches Nüsschen ist die eigentliche Frucht der Erdbeere und enthält jeweils einen einzigen Embryo. Die Erdbeere ist heimisch in den gemäßigten Zonen der Nordhalbkugel und wird heute weltweit angebaut.',
        ],
      },
      {
        titel: 'Chemie',
        text: [
          'Aroma und Geschmack der Erdbeere werden von einer großen Zahl flüchtiger Verbindungen bestimmt, deren Bildung von vielen Faktoren abhängt: Sorte, Reifegrad und Nachernte-Behandlung. Hunderte Duftstoffe sind daran beteiligt, darunter Ester, Aldehyde, Alkohole, Terpene, Ketone, Säuren und Lactone. Zu den wichtigen kennzeichnenden flüchtigen Verbindungen der Erdbeere zählen Ester wie Methylbutanoat, Ethylbutanoat, Ethylhexanoat und 2-Methylbutanoat. Diese fruchtigen Verbindungen sind auch Teil der Banane- und Mango-Aromen sowie anderer Früchte. Süße, karamellisierte Aromen aus Furanonen spielen ebenfalls eine große Rolle, darunter 2,5-Dimethyl-4-hydroxy-3(2H)-furanon und 4-Methoxy-2,5-dimethyl-3(2H)-furanon. Terpenoide wie Linalool und Nerolidol steuern holzig-blumige Düfte bei. Die Komplexität dieses Aromas entspricht zweifellos seinem eloquenten Bukett, das die Welt verzaubert hat.',
        ],
      },
    ],
    imKaffee: [
      {
        titel: '',
        text: [
          'Das WCR Sensory Lexicon beschreibt Erdbeere als „die etwas süße, leicht saure, blumige, fruchtige, oft weinige Note, die man mit Erdbeeren verbindet“. Ein heller, intensiv fruchtiger Kaffee mit Erdbeernoten ist ein besonderes, seltenes sensorisches Erlebnis. Wie bei vielen kräftig blumigen und fruchtigen Kaffees lässt sich erwarten, dass diese Aromen entweder ein Produkt von Pflanze und Umwelt oder der Nachernte-Verarbeitung sind (oder beides). Eine Erdbeernote im Kaffee wird vermutlich sowohl von flüchtigen Säuren als auch vom vollständigen Zusammenspiel fruchtiger und blumiger Verbindungen beeinflusst, die zusammen eine der roten Beere ähnliche Mischung ergeben.',
        ],
      },
      {
        titel: 'Pflanze',
        text: [
          'Es gibt bestimmte Kaffeesorten und -regionen, bei denen man eher blumige und fruchtige Kaffees erwartet. Gesha und äthiopische wilde (Heirloom-)Sorten werden manchmal mit Erdbeernoten beschrieben. Wie genau diese schwer fassbare Wechselwirkung zwischen Genetik und Umwelt zustande kommt, ist unbekannt — man ist aber dankbar dafür. Auch viele Kaffees aus Mittel- und Südamerika können Erdbeere hervorrufen, was vermutlich eher mit Verarbeitungsentscheidungen zu tun hat.',
        ],
      },
      {
        titel: 'Nachernte-Verarbeitung',
        text: [
          'Traditionell sind natural aufbereitete Kaffees die fruchtigsten am Markt und deshalb auch am ehesten mit Erdbeer-Duft und -Aroma verbunden. Kaffees, die mit anaerober Fermentation verarbeitet wurden, können Erdbeer-Düfte zeigen. Grundsätzlich lässt sich jeder Kaffee mit Nachernte-Verarbeitungsmethoden in Richtung blumig und fruchtig treiben, doch welche genaue Mischung flüchtiger Verbindungen sich am Ende zu Erdbeere summiert, ist noch keine verlässliche Wissenschaft. Erdbeernoten in einem Kaffee zu erzeugen, ähnelt dem Prozess, mit dem man Ananas-, Beeren- oder Blütennoten anstrebt. Es konsistent hinzubekommen und das Risiko dieser Prozesse zu beherrschen, dürfte aber die eigentliche Herausforderung sein.',
        ],
      },
    ],
    verwandte: [
      { nummer: 17, original: 'Pfirsich' },
      { nummer: 12, original: 'Ananas' },
      { nummer: 13, original: 'Mango' },
      { nummer: 5, original: 'Himbeere' },
      { nummer: 3, original: 'Rose' },
    ],
  },

  {
    nummer: 9,
    name: 'Rosine',
    nameOriginal: 'Raisin',
    kategorieId: 'fruchtig',
    kategorieLabel: 'Fruchtig',
    beschreibung: [
      'Der intensive, süße, dunkel-fruchtige Duft von Rosinen macht sie zu einem beliebten Snack und einer häufigen Zutat in Kuchen, Salaten, süßem Gebäck, Brot und Backwaren.',
    ],
    abschnitte: [
      {
        titel: 'Taxonomie',
        text: ['Die getrocknete Frucht verschiedener Sorten der Weinrebe Vitis vinifera.'],
      },
      {
        titel: 'Die Pflanze',
        text: [
          'Sultana, auch als Thompson Seedless bekannt, ist die beliebteste Rebsorte für Rosinen. Diese Rebe wächst meist nur in heißen Klimazonen, weil Hitze sowohl für einen guten Fruchtansatz als auch für das Trocknen der Beeren nötig ist. Die Beeren sind grün, groß und bestehen überwiegend aus wassergefüllten Zellen, geschützt von einer wachsartigen Schale.',
        ],
      },
      {
        titel: 'Geschichte',
        text: [
          'Die Geschichte der Rosinenherstellung ist zweifellos eng mit der Weinherstellung verknüpft. Rosinentrauben wurden schon vor 4.000 Jahren in Persien und Ägypten angebaut. Trocknen gehört zu den ältesten Methoden der Lebensmittelkonservierung überhaupt. Nachdem die Spanier Weinreben nach Nordamerika brachten, entstanden ab Mitte des 19. Jahrhunderts im heißen Wüstenklima Kaliforniens die ersten dort produzierten Rosinen.',
        ],
      },
      {
        titel: 'Herstellung',
        text: [
          'Zuerst müssen die Trauben geerntet und getrocknet werden. Manchmal bleiben sie dafür an der Rebe hängen, meist aber werden sie geschnitten und auf Tabletts im Feld getrocknet. Rosinen können in der Sonne oder maschinell getrocknet werden. Die Sonnentrocknung dauert je nach Klima nur drei Tage oder bis zu drei Wochen. Ziel ist es, den Feuchtigkeitsgehalt der Rosinen auf unter 13 Prozent zu senken — das hemmt das Wachstum von Mikroorganismen, verlangsamt den enzymatischen Abbau und verhindert, dass der Keimling austreibt. Schnelleres Trocknen führt meist zu höherer Rosinenqualität, weshalb entsprechende Techniken entwickelt wurden. Manche Erzeuger überziehen die Schale trocknender Rosinen mit alkalischen Ölemulsionen oder anderen Beschichtungen, etwa Kaliumcarbonat, um den Wasserverlust durch die Beerenschale zu erleichtern. Nach dem Trocknen müssen die Rosinen gereinigt, entstielt, entkernt und für den Verkauf vorbereitet werden.',
        ],
      },
      {
        titel: 'Chemie',
        text: [
          'Das Aroma von Rosinen ist eine sensorische Kerneigenschaft, die maßgeblich beeinflusst, wie gern Konsumenten sie mögen. Rund 120 Verbindungen machen ihren Duft aus, darunter Aldehyde, Ester, Säuren, Alkohole, Ketone, Terpene und Furane. Es gibt zwei Hauptwege, wie Rosinen ihr Aroma entwickeln: enzymatisch durch Oxidation, oder durch Maillard-Reaktionen. Das meiste davon geschieht beim Trocknen — je schneller getrocknet wird, desto weniger Bräunung entsteht. Trocknungsverfahren mit hoher Temperatur führen zu mehr gerösteten und fettigen Aromen. Trocknung bei niedrigerer Temperatur dagegen erhält vergleichsweise blumige und grüne Noten.',
          'Manche Aromen entstehen beim Trocknen durch Lipidoxidation, die über den enzymatischen Abbau ungesättigter Fettsäuren abläuft. Das Enzym Polyphenoloxidase (PPO) ist hauptsächlich dafür verantwortlich, dass sich beim Trocknen der braune Farbstoff verstärkt. Aromastoffe, die dabei entstehen, sind unter anderem aliphatische Säuren und Aldehyde wie Hexanal, Nonanal und 1-Octen-3-ol sowie Heptan-, Octan- und Nonansäure. Diese Verbindungen bringen bekanntermaßen grüne, scharfe und blumige Noten mit sich.',
          'Beim Trocknen von Rosinen laufen außerdem Maillard-Reaktionen ab. Sie erzeugen eine ganze Reihe von Aromastoffen, die den typischen Rosinenduft aufbauen. Pyrazine und Furane steuern geröstete, fruchtige und blumige Noten bei, etwa 2,3-Butandion, 5-Hydroxymethyl-2-furaldehyd, 2-Ethyl-6-methylpyrazin, Pyrazin, 3-Ethyl-2,5-dimethylpyrazin, Furfural, Benzaldehyd, Benzylalkohol und Phenylacetaldehyd. Diese Verbindungen bringen den süßen, karamellisierten Duft in die Rosine. Diese Reaktionen fallen bei sonnengetrockneten Rosinen deutlich stärker aus als bei maschinell getrockneten.',
        ],
      },
    ],
    imKaffee: [
      {
        titel: '',
        text: [
          'Das WCR Sensory Lexicon beschreibt Rosine als „die konzentrierte, süße, leicht saure, braune, fruchtige, blumige Note, die charakteristisch für getrocknete Trauben ist“. Der Rosinenduft im Kaffee ähnelt dem von Backpflaume und anderem Trockenobst. Man begegnet einem fruchtigen, reichen Rosinenaroma in vielen Kaffeearten. Feine Robustas werden für ihren Rosinencharakter geschätzt, den man sowohl in gewaschenen als auch in natural aufbereiteten Kaffees findet.',
        ],
      },
      {
        titel: 'Nachernte-Verarbeitung',
        text: [
          'Fruchtige, fermentationsbetonte Kaffees, besonders naturals, können Rosine in Duft und Aroma zeigen. Das Kontinuum von Frucht über dunkle Frucht bis hin zu getrockneter, weiniger Frucht ist bekanntermaßen ein Ergebnis von Fermentationsart und -dauer, und Rosine ist in vielen natural aufbereiteten Kaffees deutlich zu erkennen.',
        ],
      },
      {
        titel: 'Röstung',
        text: [
          'Maillard-Reaktionen spielen sowohl bei Kaffee als auch bei Rosinen eine Rolle, weshalb sich manche der braunen, karamellisierten Aromen zweifellos überschneiden. Zusammen mit fruchtigen Noten im Kaffee lässt sich das leicht als Rosine interpretieren. Furane und Furanone entstehen beim Rösten und riechen typischerweise süß, buttrig, brotartig oder nach brauner Würze. Auch Aldehyde bilden sich, darunter Nonanal und Linalool, die zu holzigen und blumigen Aromen beitragen.',
        ],
      },
    ],
    verwandte: [
      { nummer: 10, original: 'Backpflaume' },
      { nummer: 22, original: 'Weinig' },
      { nummer: 7, original: 'Schwarze Johannisbeere' },
      { nummer: 1, original: 'Honig' },
      { nummer: 59, original: 'Karamellisiert' },
      { nummer: 16, original: 'Apfel' },
    ],
  },

  {
    nummer: 10,
    name: 'Backpflaume',
    nameOriginal: 'Prune',
    kategorieId: 'fruchtig',
    kategorieLabel: 'Fruchtig',
    beschreibung: [
      'Getrocknete Pflaumen, also Backpflaumen, haben ein fruchtiges, erdiges, tiefes, intensives Aroma, das sogar würzige oder blumige Anklänge haben kann.',
      'Trotz ihres Aussehens werden sie für ihre reichen, saftigen Fruchtaromen geschätzt und sind eine beliebte Zutat in Konfitüren, Säften und marokkanischen Tajines. Sie werden in Konfekt und Kuchen eingebacken und geben dort eine süße, erdige, würzige Note ab, die die Süße von Desserts ausgleicht. Der Duft kann an Fruchtkonfitüren, einen kräftigen Rotwein oder einen Früchtekuchen erinnern. Er passt gut zu Schokolade.',
    ],
    abschnitte: [
      {
        titel: 'Taxonomie',
        text: ['Die getrocknete Frucht der Pflaume, Prunus domestica.'],
      },
      {
        titel: 'Die Pflanze',
        text: [
          'Zwei grundlegend verschiedene Pflaumentypen, für unterschiedliche Zwecke gezüchtet, haben ihren Ursprung in verschiedenen Weltregionen. Prunus domestica, der eurasische Baum, stammt aus der Gegend des Kaukasus, nahe dem Kaspischen Meer. Die Frucht dieser eurasischen Pflaume ist purpurblau-oval mit fleischigem, halb steinlösendem Fruchtfleisch. Die meisten Pflaumen für Backpflaumen sind sogenannte Freestone-Sorten, deren Kern sich leicht aus der Frucht lösen lässt. Die anderen, aus Asien stammenden Pflaumentypen werden für den Frischverzehr gezüchtet und haben eine andere Abstammungslinie, teils verbunden mit Luther Burbank und anderen Züchtern in den USA. Diese sind größer, runder, gelb bis rot bis violett gefärbt und haben einen steinklebenden Kern, der sich schwerer lösen lässt. Pflaumen werden heute in den gemäßigten Zonen beider Erdhalbkugeln angebaut.',
          'Pflaumen sind eine klimakterische Frucht — sie verderben nach der Reife rasch und sind deshalb schwer zu handhaben. Vor der Entwicklung moderner Transporttechniken lag die Lösung für dieses Lager- und Transportproblem vermutlich im Trocknen — daher die Backpflaume. Die Sorten d\'Agen, Hungarian, Italian und Sugar werden wegen ihres hohen Zuckergehalts für Backpflaumen verwendet, besonders beliebt in Kalifornien und Frankreich.',
        ],
      },
      {
        titel: 'Herstellung',
        text: [
          'Nach der Ernte werden die Pflaumen gewaschen und anschließend in Heißluft-Tunneltrocknern bei 85 bis 90 °C für 18 Stunden getrocknet, wobei ihr Feuchtigkeitsgehalt von etwa 75 auf 20 Prozent sinkt. Die Lufttemperatur ist dabei bewusst schonend gewählt, um extreme Farbveränderungen oder verbrannte Aromen zu vermeiden.',
        ],
      },
      {
        titel: 'Chemie',
        text: [
          'Die Chemie der Backpflaume unterscheidet sich stark von der einer Pflaume, die keine solche Verarbeitung durchlaufen hat. Der Trocknungsprozess verändert die in der Frucht vorhandenen flüchtigen Verbindungen ebenso wie die Zuckerarten erheblich. Manche Aromen der frischen Frucht gehen verloren, während neue durch Hitze und Trocknung entstehen.',
          'Maillard-Reaktionen spielen für das besondere Backpflaumen-Aroma eine große Rolle. Während der Verarbeitung lässt die Hitze Zucker und Aminosäuren miteinander reagieren und Bräunungsstoffe sowie eine ganze Reihe weiterer flüchtiger Verbindungen bilden. Furfural, Methyl-5-furan, Acetylfuran, Acetyl-2-pyrrol und Hydroxymethylfurfural entstehen alle auf diesem Weg. Eine der wirkungsvollsten Aromaverbindungen in Backpflaumen ist Benzaldehyd, das vermutlich während der Verarbeitung durch den Abbau von Amygdalin bei Erhitzung entsteht. Diese fruchtig-nussige Verbindung ist auch charakteristisch für Mandeln. Eine Vielzahl weiterer Verbindungen trägt zum Aroma bei, darunter blumige Noten wie β-Ionon, holziges Linalool und Nonanal, Methylcinnamat sowie γ-Decalacton.',
        ],
      },
    ],
    imKaffee: [
      {
        titel: '',
        text: [
          'Das WCR Sensory Lexicon beschreibt Backpflaume als „den süßen, leicht braunen, blumigen, muffigen und überreifen Eindruck dunkler Frucht, den man mit getrockneten Pflaumen verbindet“. Im Kaffee begegnet einem oft ein warmes, reichhaltiges Backpflaumen-Aroma, in vielen Kaffeearten. Feine Robustas werden für ihren Backpflaumen-Charakter geschätzt, den man sowohl in gewaschenen als auch in natural aufbereiteten Kaffees findet.',
        ],
      },
      {
        titel: 'Nachernte-Verarbeitung',
        text: [
          'Fruchtige, fermentationsbetonte Kaffees, besonders naturals, können Backpflaume in Duft und Aroma zeigen. Das Kontinuum von Frucht über dunkle Frucht bis hin zu getrockneter, weiniger Frucht ist bekanntermaßen ein Ergebnis von Fermentationsart und -dauer, und Backpflaume ist in vielen natural aufbereiteten Kaffees deutlich zu erkennen. Studien haben den natural-Prozess mit erhöhten Pyrazin-Werten im Kaffee in Verbindung gebracht, die nussige, erdige und süße Aromen beitragen können.',
        ],
      },
      {
        titel: 'Röstung',
        text: [
          'Maillard-Reaktionen spielen sowohl bei Kaffee als auch bei Backpflaumen eine Rolle, weshalb sich manche der braunen, karamellisierten Aromen zweifellos überschneiden. Furane und Furanone, die beim Rösten entstehen, überschneiden sich mit dem typischen Backpflaumen-Aroma und riechen süß, buttrig, brotartig oder nach brauner Würze. Auch Aldehyde bilden sich, darunter Nonanal und Linalool, die zu holzigen Aromen beitragen, sowie Benzaldehyd, das mandelartig (und vielleicht auch backpflaumenartig) riecht.',
        ],
      },
    ],
    verwandte: [
      { nummer: 9, original: 'Rosine' },
      { nummer: 11, original: 'Kirsche' },
      { nummer: 7, original: 'Schwarze Johannisbeere' },
      { nummer: 22, original: 'Weinig' },
      { nummer: 3, original: 'Rose' },
    ],
  },

  {
    nummer: 11,
    name: 'Kirsche',
    nameOriginal: 'Cherry',
    kategorieId: 'fruchtig',
    kategorieLabel: 'Fruchtig',
    beschreibung: [
      'Die Süßkirsche ist eine milde, herbe Frucht. Das Aroma ist fruchtig, dunkel und leicht säuerlich, mit Noten von Vanille und Rose.',
    ],
    abschnitte: [
      {
        titel: 'Taxonomie',
        text: [
          'Die Frucht der Untergattung Cerasus innerhalb der Gattung Prunus. Süßkirschen gehören zur Art Prunus avium. Kirschen zählen zur Familie der Rosengewächse, zu der auch viele andere Früchte gehören, darunter Apfel, Pfirsich, Himbeere, Erdbeere, Birne und Aprikose.',
        ],
      },
      {
        titel: 'Die Pflanze',
        text: [
          'Der Kirschbaum stammt aus der Region zwischen Kaspischem und Schwarzem Meer sowie aus Asien und wächst in gemäßigten Klimazonen. Es gibt im Wesentlichen drei kommerziell angebaute Kirschbaum-Typen: süß, sauer und Kreuzungen aus beiden. Der Baum hat unverwechselbare, ovale, gesägte Blätter mit zugespitzter Spitze. Die Rinde ist glatt, purpurbraun gefärbt, mit auffälligen waagerechten Korkporen. Die Süßkirsche selbst ist eine fleischige Steinfrucht an einem langen Stiel, herzförmig, etwa 2 Zentimeter im Durchmesser. Beliebte Sorten sind „Bing“, „Rainier“ und „Queen Anne“, die Farbe reicht von Gelb bis Dunkelrot.',
        ],
      },
      {
        titel: 'Chemie',
        text: [
          'Das Kirscharoma umfasst eine große Zahl organischer Verbindungen, darunter Aldehyde, Alkohole, Ester, Säuren und Terpene. Das typische Kirscharoma wird von Benzaldehyd dominiert, einem süßen, leicht bitteren Mandelduft. Benzylalkohol trägt ebenfalls einen süßen, blumigen Duft bei. Weitere nennenswerte Verbindungen sind Linalool mit blumig-holzigem Duft. Eugenol kann eine leicht würzige, nelkenartige Note beisteuern. Hexanal und Hexanol tragen grüne, krautig-grasige Noten bei, und Phenylacetaldehyd sorgt für eine grüne, süße, blumig-honigartige Note.',
        ],
      },
    ],
    imKaffee: [
      {
        titel: '',
        text: [
          'Das WCR Sensory Lexicon beschreibt Kirsche als „die saure, fruchtige, leicht bittere, blumige Note, die man mit Kirschen verbindet“. Der dunkle, süße Duft der Kirsche ist eine unverwechselbare Note in jedem Kaffee und verleiht ihm eine Tiefe und Süße, die in vielen Märkten geschätzt wird. Ostafrikanische und afrikanische Kaffees aus Äthiopien, Kenia und Burundi zeigen dieses Merkmal häufig. Welche Art von Wechselwirkung zwischen Genetik und Umwelt das verursacht, ist noch nicht geklärt.',
        ],
      },
      {
        titel: 'Nachernte-Verarbeitung',
        text: [
          'Klar ist, dass sich intensive, dunkle Fruchtaromen wie Kirsche mit fruchtbetonten Verarbeitungsmethoden erzeugen lassen. Natural aufbereitete äthiopische Kaffees können ein beerenartiges Aroma besitzen, das auch Kirsche einschließt. Anaerobe Fermentationsmethoden, gefolgt von einer Trocknungstechnik mit Frucht auf dem Pergament, sind dafür am wahrscheinlichsten verantwortlich. Milchsäurebakterien erhöhen nachweislich die Menge an Benzaldehyd und Phenylacetaldehyd im Kaffee — beide finden sich in vielen Verarbeitungsarten, einschließlich gewaschener und anaerob fermentierter Kaffees.',
        ],
      },
    ],
    verwandte: [
      { nummer: 17, original: 'Pfirsich' },
      { nummer: 16, original: 'Apfel' },
      { nummer: 5, original: 'Himbeere' },
      { nummer: 3, original: 'Rose' },
      { nummer: 1, original: 'Honig' },
      { nummer: 53, original: 'Mandel' },
    ],
  },

  {
    nummer: 12,
    name: 'Ananas',
    nameOriginal: 'Pineapple',
    kategorieId: 'fruchtig',
    kategorieLabel: 'Fruchtig',
    beschreibung: [
      'Ananas hat ein süßes, saftiges, moschusartig-fruchtiges Aroma mit Noten von Honig oder sogar Kokosnuss.',
      'Ananas hat ein ausgesprochen apfelartiges Aroma, das sowohl süß als auch sauer wirkt, mit kräftiger Fruchtnote, Vanille, Gewürznelke und karamellisierter Süße. Reif entwickelt sie eine alkoholisch-sherryartige Qualität.',
    ],
    abschnitte: [
      {
        titel: 'Taxonomie',
        text: ['Die große, aromatische Frucht der Pflanze Ananas comosus.'],
      },
      {
        titel: 'Die Pflanze',
        text: [
          'Ananas ist eine niedrig wachsende, tropische Pflanze aus der Familie der Bromeliengewächse. Sie ist eine ausdauernde, einkeimblättrige Pflanze und wird 1 bis 2 Meter hoch. Ihre stacheligen, dicken, langen Blätter bilden eine dichte Rosette, aus der die große, fleischige Frucht mit einer Blattkrone obenauf wächst. Die Pflanze bildet einen Blütenstand, bei dem jede Blüte eine eigene kleine Frucht bildet — der gesamte Fruchtstand reift zu einer einzigen Masse heran, der Ananas. Diese ungewöhnliche Formation heißt botanisch Sammelfrucht, bei der die Einzelfrüchtchen in zwei ineinandergreifenden Spiralen angeordnet sind. In der Wildnis wird die Blüte meist von Kolibris bestäubt, in der kommerziellen Kultivierung ist Bestäubung aber unerwünscht, weil sie Samen bildet, welche die Fruchtqualität mindern.',
          'Die Pflanze stammt ursprünglich aus Südamerika, wird heute aber auch in Asien, Brasilien, Costa Rica und Hawaii angebaut. Es gibt derzeit mehr als 100 Ananassorten weltweit. Eine der beliebtesten ist als Cayenne oder Smooth Cayenne bekannt.',
        ],
      },
      {
        titel: 'Geschichte',
        text: [
          'Die Analyse alter mesoamerikanischer Sprachen deutet darauf hin, dass die Ananas schon vor mehr als 3.000 Jahren als wichtige Handelsfrucht über einen ganzen Kontinent hinweg gehandelt wurde. Dieser Schätzung nach wurde sie vermutlich erstmals vor 6.000 bis 10.000 Jahren kultiviert. Nach Europa brachte sie kein Geringerer als Christoph Kolumbus, der ihr Ende des 15. Jahrhunderts in der Karibik begegnete. Die Spanier führten sie in der Folge auf den Philippinen, in Hawaii und Guam ein. Im 18. und 19. Jahrhundert genoss die Ananas einen luxuriösen Status, der ihr weit verbreitetes Auftauchen als Motiv in der dekorativen Kunst befeuerte. Als der Welthandel in den folgenden Jahrhunderten aber leichter und schneller wurde, verlor die Ananas ihren Nimbus und ist heute, unabhängig von der Jahreszeit, ein gewöhnlicher Anblick in jedem Supermarkt der nördlichen Erdhalbkugel.',
        ],
      },
      {
        titel: 'Chemie',
        text: [
          'In der Ananas wurden Hunderte flüchtige Verbindungen identifiziert, doch nur ein kleiner Teil davon trägt zu ihrem einzigartigen Aroma bei. Ihr faszinierender Duft entsteht aus einer komplexen Mischung fruchtiger Ester, durchdringender Schwefelverbindungen, Anklängen von Vanille oder Gewürznelke sowie mehreren sauerstoffhaltigen Kohlenstoffringen, die karamellige, moschusartige Qualitäten hervorrufen. Das chemische Bukett umfasst Alkohole, Aldehyde, Ester, Ketone, Lactone, Terpene und Terpenoide, Kohlenwasserstoffe und weitere Stoffe. Das charakteristische Ananasaroma entsteht unter anderem durch Carbonsäureester wie Ethyl-3-(methylthio)propanoat und Methyl-3-(methylthio)propanoat. Weitere wichtige Ester sind Ethylhexenoat, Methylhexanoat, Furaneol und Methyl-2-methylbutyrat. Nennenswerte Lactone sind δ-Octalacton und δ-Decalacton, die Kokosnuss- und Pfirsicharomen beisteuern.',
        ],
      },
    ],
    imKaffee: [
      {
        titel: '',
        text: [
          'Das WCR Sensory Lexicon beschreibt Ananas als „die süße, leicht scharfe, fruchtige Note, die man mit Ananas verbindet“. Traditionell war es üblich, Ananas-Säure und -Süße in Kaffees aus Kolumbien wie auch aus Äthiopien zu finden. Diese Kaffees erwerben dieses Aroma zweifellos auf unterschiedlichen Wegen: Äthiopische naturals haben einen großen genetischen Einfluss auf den Geschmack, während kolumbianische Kaffees traditionell gewaschen und von der standardisierten, von der FNC (Federación Nacional de Cafeteros de Colombia) geregelten Sorte sind. Wo auch immer Ananas auftritt, verleiht sie eine besondere Eigenschaft, die weltweit geschätzt wird.',
        ],
      },
      {
        titel: 'Nachernte-Verarbeitung',
        text: [
          'Zweifellos sind Verarbeitungsentscheidungen, besonders Fermentationen, für dieses Aroma im Kaffee verantwortlich. Mit mehr Fermentation entstehen mehr fruchtige Ester und andere Stoffwechselprodukte von Mikroorganismen. Welche genauen Verbindungen ein Ananasaroma im Kaffee verleihen, ist zweifellos eine komplexe Mischung, doch einige bestimmte Noten wurden gezielt als fruchtähnlich identifiziert. Zum Beispiel haben bestimmte Ester wie Propylpropanoat ein blumig-ananasartiges Aroma. Pentatonsäure verleiht einen apfel- oder ananasartigen Duft, während 2-Butensäure eine karamellisierte Ananas-Süße beitragen kann. Furaneol wurde nachweislich als Beitrag zu Ananasaromen in Honey-Kaffees identifiziert. Ananasnoten werden häufig bei anaerob verarbeiteten Kaffees beschrieben, einschließlich solcher mit einer Phase kohlensäuregestützter Mazeration (Carbonic Maceration). Kaffees aus aller Welt, verarbeitet mit allen Arten von Fermentation, haben das Potenzial, dieses wirklich aufregende Aroma zu zeigen.',
        ],
      },
    ],
    verwandte: [
      { nummer: 16, original: 'Apfel' },
      { nummer: 13, original: 'Mango' },
      { nummer: 14, original: 'Melone' },
      { nummer: 15, original: 'Banane' },
      { nummer: 19, original: 'Zitrone' },
      { nummer: 1, original: 'Honig' },
      { nummer: 59, original: 'Karamellisiert' },
    ],
  },

  {
    nummer: 13,
    name: 'Mango',
    nameOriginal: 'Mango',
    kategorieId: 'fruchtig',
    kategorieLabel: 'Fruchtig',
    beschreibung: [
      'Mango hat einen Duft, der saftig, süß und blumig ist, mit einem Honigaroma und Noten von Gras, Apfel, Kiefer oder Kräutern.',
      'Sie wird roh, geschnitten oder als Dessert gegessen und lässt sich zu Pickles, Konfitüren, Chutneys und anderen Konserven verarbeiten. In der thailändischen Küche ist Mango mit klebrigem Reis beliebt. In Indien und Sri Lanka wird sie in Currygerichten verwendet und mit Joghurt als Getränk. In Mittelamerika findet sie sich in lokalen Salaten und Ceviche und wird frisch mit Chili-Limetten-Pulver gegessen. Sie wird auch gekocht und in verschiedenen Desserts gebacken, etwa Puddings, Kuchen, Cremes und Smoothies. Ihr Duft kann viele schöne Erinnerungen wecken.',
    ],
    abschnitte: [
      {
        titel: 'Taxonomie',
        text: [
          'Mangos sind die Frucht des Baums Mangifera indica, aus der Familie der Sumachgewächse (Anacardiaceae), zu der auch Cashew, Sumach, Marula, Pistazie, Giftefeu und Gifteiche gehören.',
        ],
      },
      {
        titel: 'Die Pflanze',
        text: [
          'Der Mangobaum ist tief verwurzelt, langlebig und immergrün, wird bis zu 27 Meter hoch und 24 Meter breit. Er ist heimisch in Süd- und Südostasien. Ausgewachsene Äste tragen Hunderte kleiner weißer Blüten, bestäubt von Bienen, Fliegen oder Wespen — nur relativ wenige sind weiblich und tragen Frucht. Die Frucht ist botanisch eine Steinfrucht. Reife Früchte wiegen bis zu 1,3 Kilogramm, sind länglich, gelb oder rot, mit glatter, fester Schale. Das Fruchtfleisch ist blassgelb oder orange und faserig. Ein einzelner, kommerziell angebauter Baum kann mehr als 40 Jahre lang Früchte tragen.',
        ],
      },
      {
        titel: 'Geschichte',
        text: [
          'Der Mangobaum stammt vermutlich aus der Indo-Burma-Malaiischen Region Asiens. In Indien spielt Mango eine heilige Rolle und wird dort seit mehr als 4.000 Jahren kultiviert. In alten Ayurveda-Texten gilt Mango als Aphrodisiakum. Sie reiste mit Reisenden von Asien in den Nahen Osten, nach Ostafrika und Südamerika, beginnend vor fast 2.000 Jahren. Es gibt Belege für den Mangobaum in China ab dem 7. Jahrhundert. Später, ab dem 15. Jahrhundert, verbreiteten portugiesische und spanische Kolonialisten sie über die ganze tropische und subtropische Welt. Sie brachten Mango erstmals aus Goa (einem indischen Bundesstaat, früher portugiesische Kolonie) nach Afrika, im 16. Jahrhundert, und verschifften sie auf portugiesischen Schiffen von Südafrika nach Brasilien bis zum frühen 18. Jahrhundert. Von Brasilien aus verbreitete sie sich weiter in die Karibik.',
        ],
      },
      {
        titel: 'Chemie',
        text: [
          'Der Duft der Mango zeigt an, wie gut ihre Qualität ist, und trägt maßgeblich zu ihrer weltweiten Beliebtheit bei. Der unverwechselbare Duft dieser Frucht ist eine große chemische Mischung aus flüchtigen Alkoholen, Terpenen, Estern, Aldehyden und Ketonen, unter anderem. Terpen-Kohlenwasserstoffe gelten als die wichtigste Gruppe der Mango-Duftstoffe, darunter δ-3-Caren, Limonen, Terpinolen, Myrcen, Ocimen und α-Phellandren. Diese Terpene verleihen der Mango ihren moschusartigen, zitrischen, süßen, holzigen oder harzigen Duft. Fruchtige Ester bauen das saftig-sirupartige Aroma auf, darunter Ethylacetat, Ethylbutanoat und Methylbutyrat, oft beschrieben als nach Apfel und Ananas riechend. Lactone wie γ- und δ-Octalactone bringen einen fruchtigen, pfirsich- und kokosnussartigen Duft ein. Die Komplexität dieses Aromas und seine Variation zwischen den Sorten der Frucht sind erheblich.',
        ],
      },
    ],
    imKaffee: [
      {
        titel: '',
        text: [
          'Eine Mango-Note im Kaffee hat meist eine kräftige, intensiv fruchtige Süße, die honigartig und sirupartig wirkt.',
        ],
      },
      {
        titel: 'Pflanze und Nachernte-Verarbeitung',
        text: [
          'Mango-Aromen finden sich nur in den fruchtbetontesten Kaffees, etwa solchen, die natural oder anaerob verarbeitet wurden. Natural aufbereitete Kaffees aus Äthiopien und experimentell verarbeitete Kaffees können eine reiche, sirupartige Mango-Süße und -Säure haben. Kolumbien gilt als Vorreiter bei Innovationen in der Nachernte-Verarbeitung und hat viele experimentelle, anaerobe und andere neue Verarbeitungsmethoden hervorgebracht, die zu Kaffees mit solchen Fruchtnoten wie Mango führen.',
          'Wichtig zu wissen: Diese Verarbeitungsmethoden stehen oft nur den fortschrittlichsten Kaffee-Erzeugern zur Verfügung. Die Risiken bei der Anpassung an neue Techniken tragen meist jene Erzeuger und Verarbeiter, die einen guten, verlässlichen Markt haben, der hohe Aufpreise zahlt, und die den Raum zum Experimentieren, den Zugang zu Informationen und das Kapital für Infrastruktur-Investitionen haben — sie sind es, die den Weg bereiten. Wo auch immer diese Innovatoren zu Hause sind, dort liegt die Speerspitze der Kaffee-Aromagestaltung.',
        ],
      },
    ],
    verwandte: [
      { nummer: 16, original: 'Apfel' },
      { nummer: 17, original: 'Pfirsich' },
      { nummer: 1, original: 'Honig' },
      { nummer: 4, original: 'Jasmin' },
      { nummer: 3, original: 'Rose' },
      { nummer: 30, original: 'Kiefer' },
      { nummer: 25, original: 'Frisches Gras' },
    ],
  },

  {
    nummer: 14,
    name: 'Melone',
    nameOriginal: 'Melon',
    kategorieId: 'fruchtig',
    kategorieLabel: 'Fruchtig',
    beschreibung: [
      'Je nach Sorte kann Melone ähnlich riechen wie Banane oder Ananas. Oder sie kann grasig, grün und frisch duften. Andere Sorten erinnern an dunklere Frucht, pfirsichartig mit cremigen, buttrigen oder karamellisierten Düften. Manchmal riecht Melone auch moschusartig oder nach Honig.',
      'Die Beliebtheit dieser Frucht hängt zweifellos mit ihrem charakteristischen Duft zusammen. Melonen sind für ihren leichten, kühlen, hellen und fruchtigen Duft bekannt.',
    ],
    abschnitte: [
      {
        titel: 'Taxonomie',
        text: ['Die Frucht von Cucumis melo, einer einjährigen Ranke aus der Familie der Kürbisgewächse.'],
      },
      {
        titel: 'Die Pflanze',
        text: [
          'Melonen brauchen Wärme und Bestäubung. Botanisch ist die Melone eine Beere, deren Größe, Form und Farbe je nach Sorte variiert. Melonen lassen sich in zwei Gruppen einteilen, die sich teils über den Duft definieren: die eine weniger aromatisch, meist glattschalig, langsam reifend; die andere aromatisch, mit rauer, genetzter Schale, schnell reifend. Die aromatischen Melonen sind allgemein als Netzmelonen (Muskmelons) bekannt. Sie sind rund und von Natur aus reich an Wasser und Zucker. Zu den gängigen Sorten zählen Netzmelonen, Cantaloupe, Honigmelone, Schlangenmelone, Mango-Melone und asiatische Einlegemelonen.',
        ],
      },
      {
        titel: 'Geschichte',
        text: [
          'Woher die Pflanze ursprünglich stammt, ist unklar — eine Hypothese besagt Afrika. Man geht davon aus, dass Melonen ursprünglich im Iran kultiviert wurden, wo sie bis heute in großen Mengen angebaut werden.',
        ],
      },
      {
        titel: 'Chemie',
        text: [
          'Untersuchungen haben in verschiedenen Melonensorten mehr als 300 unterschiedliche flüchtige Verbindungen nachgewiesen, wobei eine einzelne Sorte mehr als 100 Aromastoffe zeigen kann. Ein großer Teil der beitragenden Verbindungen sind Ester, Aldehyde und Alkohole. Wichtige Ester sind Ethylbutanoat, Ethylbutyrat, Propylacetat und Propylpropanoat. Diese Ester verleihen süße, fruchtige Noten wie Ananas, Erdbeere und sogar reichhaltiges Karamell. Der frische, gurkenartige Duft mancher Melonen ist bekanntermaßen mit dem Aldehyd 2-Nonenal verbunden. Benzaldehyd und Phenylacetaldehyd sind weitere wichtige Aldehyde, die typischerweise blumig und fruchtig riechen, manchmal wie Aprikose. Nonenal kann grasig oder grün wirken, auf moschusartige Weise. Alkohole wie 2-Methyl-1-butanol, 1-Hexanol, 1-Octanol, (Z)-3-Hexen-1-ol und Nonadienal stehen für einige der grünen, grasigen, frischen, wässrigen Aromen, die für Melonen typisch sind.',
        ],
      },
    ],
    imKaffee: [
      {
        titel: 'Nachernte-Verarbeitung',
        text: [
          'Fruchtige Verbindungen wie die der Melone sind im Kaffee generell ein Produkt der Fermentation während der Nachernte-Verarbeitung. Es wurde gezeigt, dass, ähnlich wie die fruchtigen Noten der Melone, Ester von Hefen im Kaffee gebildet werden. Mikroben sind außerdem dafür bekannt, Alkohole, Ketone und Ester zu erzeugen, besonders — aber nicht nur — in natural aufbereitetem Kaffee. Diese fruchtigen Noten im Kaffee reichen von Melone und Ananas bis zu Banane, die alle potenziell zu einem melonenartigen Aroma beitragen können. Duftende Alkohole wie 1-Octanol und 1-Hexanol wurden in grünem Kaffee als grüne, fettige, kokosnussartige Aromen identifiziert, die auch in Melonen häufig vorkommen. Diese Bestandteile liegen in grünem Kaffee oft in höherer Menge vor, bauen sich aber beim Rösten ab. Hellere Röstprofile bewahren tendenziell mehr dieser Aromen in der Tasse.',
        ],
      },
      {
        titel: 'Röstung',
        text: [
          'Aldehyde im Kaffee entstehen meist erst beim Rösten und entwickeln Süße und fruchtige Noten durch den Abbau von Aminosäuren. Das kann zu karamellisierten, buttrigen und pfirsichartigen Noten beitragen, ähnlich wie bei bestimmten Melonensorten. Ketone, deren Menge beim Rösten zunimmt, wirken typischerweise buttrig, angetrieben von Diacetyl und ähnlichen Verbindungen. Das Zusammenspiel dieser Aromen kann zweifellos einen melonenartigen Duft in vielen Kaffees aufbauen.',
        ],
      },
    ],
    verwandte: [
      { nummer: 26, original: 'Gurke' },
      { nummer: 15, original: 'Banane' },
      { nummer: 12, original: 'Ananas' },
      { nummer: 43, original: 'Butter' },
      { nummer: 59, original: 'Karamellisiert' },
      { nummer: 1, original: 'Honig' },
      { nummer: 60, original: 'Vanille' },
    ],
  },

  {
    nummer: 15,
    name: 'Banane',
    nameOriginal: 'Banana',
    kategorieId: 'fruchtig',
    kategorieLabel: 'Fruchtig',
    beschreibung: [
      'Bananen haben Aromen, die süß, holzig, vanillig und blumig sind, können aber grüne Noten zeigen, besonders bevor sie vollständig reif sind.',
    ],
    abschnitte: [
      {
        titel: 'Taxonomie',
        text: [
          'Bananen sind die Frucht einer Pflanze der Gattung Musa. Die meisten heute kultivierten Bananen stammen von M. acuminata (Dessertbanane), M. balbisiana (Kochbanane/Plantain) und ihren Kreuzungen. Es gibt Berichten zufolge mehr als 1.000 Bananensorten weltweit, doch die meisten weltweit verkauften Bananen gehören zu einer einzigen Sorte, der Cavendish.',
        ],
      },
      {
        titel: 'Die Pflanze',
        text: [
          'Die Gattung Musa ist in Südostasien heimisch. Obwohl sie baumähnlich aussieht, ist sie eigentlich eine große krautige Pflanze, die aus einer Knolle und einem Scheinstamm aus vielen Blattstielen wächst. Der Blütenstand muss nicht bestäubt werden, um Früchte zu bilden. Die Früchte wachsen aufwärts in Büscheln von 10 bis 20 Stück nahe der Spitze der Pflanze. Weil die fleischige Banane aus einer einzelnen Blüte und einem einzelnen Fruchtknoten entsteht, gilt sie botanisch als Beere. Die Frucht ist unterschiedlich groß, farbig und fest, meist länglich und gebogen, mit weichem, stärkereichem Fruchtfleisch unter einer Schale, die beim Reifen die Farbe wechselt. In der Wildnis enthält die Frucht mehrere schwarze Samen, die aber in den kultivierten Sorten weggezüchtet wurden. Die Frucht enthält viel Vitamin A und C, Mineralstoffe wie Phosphor, Calcium und Kalium sowie Kohlenhydrate.',
        ],
      },
      {
        titel: 'Geschichte',
        text: [
          'Die Gattung Musa wurde vermutlich erstmals vor rund 4.000 Jahren in der Gegend von Papua-Neuguinea kultiviert. Die Pflanze verbreitete sich in der Region und schließlich bis nach Afrika und in den Rest Asiens. Spanier und Portugiesen brachten die Frucht in verschiedene Kolonien und bauten sie dort in Plantagen an. Globale Handelsrouten verbreiteten die beliebte Frucht weiter. Lange nachdem sich Europäer für diese und andere tropische Arten zu begeistern begannen, wurde die Cavendish-Banane im 19. Jahrhundert in Gewächshäusern in England gezüchtet.',
          'Bis Mitte des 20. Jahrhunderts stammten die meisten Bananen von der Sorte „Gross Michel“, die in Ostafrika gezüchtet worden war. In den 1950er-Jahren wurde diese Sorte jedoch fast vollständig durch die Panamakrankheit vernichtet, verursacht durch den Pilz Fusarium oxysporum. Von da an gewann die Cavendish-Banane zunehmend an Bedeutung. Durch die Monokultur-Anbauweise der Banane, gepaart mit den seit Jahrhunderten genutzten klonalen Vermehrungstechniken, trägt die Banane heute ein deutliches genetisches Risiko. Viele Wissenschaftler glauben, es sei nur eine Frage der Zeit, bis ein neuer Pilz oder eine andere Krankheit auch die Cavendish-Banane schwer trifft.',
        ],
      },
      {
        titel: 'Chemie',
        text: [
          'Das Aroma der Bananenfrucht wird von duftenden Estern dominiert. Isoamylacetat gilt oft als der wichtigste Aroma-Ester der Banane. Auch Amylbutyrat, Amylacetate, Ethylacetat, Ethylbutyrat und Hexanal tragen wesentlich zum Aroma bei. Weitere flüchtige Verbindungen wie Alkohole, Säuren, Ketone und Aldehyde steuern ebenfalls zum Duft bei.',
        ],
      },
    ],
    imKaffee: [
      {
        titel: '',
        text: [
          'Der unverwechselbare Bananenduft ist im Kaffee ungewöhnlich. Tritt er in Balance auf, kann er deshalb eine vorteilhafte fruchtige Eigenschaft sein. Wirkt der Bananenduft dagegen schwipsig-alkoholisch, überwältigend und überreif, kann er für manche Märkte zu intensiv sein.',
        ],
      },
      {
        titel: 'Nachernte-Verarbeitung',
        text: [
          'Bananenaromen finden sich gelegentlich in natural aufbereitetem Kaffee. So sind manche feinen Robusta-Kaffees, die auf diese Weise verarbeitet wurden, für ihre positiven Bananennoten bekannt.',
          'Intensive Fruchtnoten, darunter auch Banane, werden häufig zur Beschreibung anaerober Fermentationen verwendet, manchmal gefolgt von natural-Trocknung. Die sauerstoffarme Umgebung begünstigt nicht das Wachstum fadenbildender Pilze wie Aspergillus und Penicillium, was den Stoffwechsel sauerstoffarm liebender Bakterien und toleranter Hefen begünstigt. Verfahren mit ganzer Frucht oder kohlensäuregestützter Mazeration (Carbonic Maceration) unter Sauerstoffmangel fördern bestimmte Mikroorganismen (darunter Milchsäurebakterien) und damit bestimmte Stoffwechselprodukte, die in den Kaffeesamen gelangen. Gleichzeitig kann die Umgebung um den Kaffeesamen dessen Stoffwechselprozesse verändern und so Geschmacks- und Aromavorstufen weiter beeinflussen. Solche Kaffees zeigen tendenziell besonders intensive fruchtige Eigenschaften. Auch co-fermentierte Kaffees gelten als besonders fruchtig und enthalten oft Aromen von Früchten, die in der Nähe oder unter ähnlichen Umweltbedingungen wachsen, etwa Banane.',
        ],
      },
    ],
    verwandte: [
      { nummer: 13, original: 'Mango' },
      { nummer: 12, original: 'Ananas' },
      { nummer: 16, original: 'Apfel' },
      { nummer: 57, original: 'Brauner Zucker' },
      { nummer: 1, original: 'Honig' },
    ],
  },

  {
    nummer: 41,
    name: 'Tabak',
    nameOriginal: 'Tobacco',
    kategorieId: 'roestig',
    kategorieLabel: 'Röstig',
    beschreibung: [
      'Tabak riecht süß, nach Ahorn, verbrannt, braun-röstig, holzig, würzig, bitter, krautig, blumig-ledrig, fleischig, nussig, nach Tee und Honig.',
      'Typische Duftbeschreibungen für Tabak sind nussig, heuartig, teeartig, nelkig, rosinenartig, schokoladig, vanillig, karamellig sowie rauchig oder verbrannt.',
    ],
    abschnitte: [
      {
        titel: 'Taxonomie',
        text: [
          'Kultivierter Tabak ist eine einjährige, krautige Pflanze der Gattung Nicotiana. Die am häufigsten angebaute Art dieser Gattung ist Nicotiana tabacum. Die meisten Tabaksorten sind aus dieser Art gezüchtet und als Virginia-Tabak bekannt.',
        ],
      },
      {
        titel: 'Die Pflanze',
        text: [
          'Heimisch in Mittelamerika, wird die Pflanze weltweit für ihre duftenden Blätter angebaut, die von Hand gepflückt, in einem Fermentationsprozess getrocknet und zu Handelstabak verarbeitet werden. Die größten Tabakerzeuger sind China, Indien, Brasilien, Indonesien, die USA, Simbabwe und Argentinien.',
        ],
      },
      {
        titel: 'Herstellung',
        text: [
          'Die Blätter dieser Pflanze werden von Hand gepflückt und im Fermentationsprozess getrocknet. Erst nach der Verarbeitung entsteht beim Rauchen des Tabaks der komplexe Duft.',
        ],
      },
      {
        titel: 'Chemie',
        text: [
          'In Tabak und seinem Rauch wurden Tausende chemische Verbindungen identifiziert. Zu den flüchtigen und aromatischen Verbindungen zählen Aldehyde, Ketone, Alkohole, Ester und Alkene. Carbonyl-Duftstoffe wie Aldehyde, Ketone und Chinone haben einen wichtigen Einfluss auf Qualität und Geschmack von Tabak. Rauchige Noten wie Benzaldehyd können fruchtig riechen. Ähnlich wie bei Kaffee lässt sich die Qualität von Tabak sensorisch beurteilen und mit den physikalischen und chemischen Eigenschaften des Rohprodukts in Verbindung bringen. Viele flüchtige Verbindungen überschneiden sich zwischen Tabak und geröstetem Kaffee, darunter Alkohole, Aldehyde, Chlorogensäuren, Ketone, Lipide und Furane.',
        ],
      },
    ],
    imKaffee: [
      {
        titel: '',
        text: [
          'Das WCR Sensory Lexicon beschreibt Tabak als „die braune, leicht süße, leicht durchdringende Note, die man mit ausgereiftem Tabak verbindet“. Sie unterscheidet sich deutlich von aschigen, verbrannten, beißenden Aromen, die im Rauch oder beim Verbrennen des Produkts auftreten.',
          'Kaffees aus Indonesien (Sumatra) und der Demokratischen Republik Kongo (DRC) sind bekannt dafür, typischerweise Tabaknoten zu zeigen. Das traditionelle brasilianische Arabica-Profil enthielt diesen Duft oft. Auch Robusta-Kaffees sind für einen angenehmen Tabakduft bekannt. Wie bei vielen Gerüchen lässt sich diese Note als positiv oder negativ interpretieren, je nach Intensität, Balance mit anderen Noten und dem Gesamteindruck des Kaffees.',
        ],
      },
      {
        titel: 'Röstung',
        text: [
          'Viele der Verbindungen im Kaffee, die an Tabak denken lassen, entstehen vermutlich während des Röstens. Die würzig-süßen Noten von Aldehyden und Pyrazinen bilden sich bekanntermaßen durch Maillard-Reaktionen. Ein süßer, krautiger Duft, ähnlich dem Tabakgeruch, wurde als Produkt der Pyrolyse von Trigonellin beim Rösten identifiziert.',
        ],
      },
    ],
    verwandte: [
      { nummer: 60, original: 'Vanille' },
      { nummer: 28, original: 'Heuartig' },
      { nummer: 50, original: 'Gewürznelke' },
      { nummer: 58, original: 'Ahornsirup' },
      { nummer: 34, original: 'Holzig' },
      { nummer: 37, original: 'Leder' },
      { nummer: 39, original: 'Teer' },
    ],
  },

  {
    nummer: 42,
    name: 'Rauchig',
    nameOriginal: 'Smoky',
    kategorieId: 'roestig',
    kategorieLabel: 'Röstig',
    beschreibung: [
      'Rauchige Aromen riechen typischerweise holzig, scharf, beißend, harzig oder mitunter schwefelig, ähnlich wie Teer. Rauch ist ein kräftiger, durchdringender Duft und kann sehr bestimmte Erinnerungen wecken — an Lagerfeuer, Kamine, geräuchertes Fleisch, Fisch, Käse und andere Lebensmittel.',
      'Seit die ersten Menschen mit Feuer kochten, gehört der Duft von Rauch zu unserem Wortschatz und unserer Ernährung. Viele Kulturen nutzen bis heute Räuchermethoden, um bestimmte Lebensmittel haltbar zu machen — der Duft hat sich bis in die moderne Küche gehalten. Lebensmittel, die gegrillt, angekohlt oder über offener Flamme zubereitet werden, nehmen rauchige Aromen auf. Das Verbrennen, oder Pyrolyse, von Holz beeinflusst, welche Verbindungen entstehen — und damit Geschmack und Qualität des sensorischen Ergebnisses. Ob ein Rauchduft angenehm oder abstoßend wirkt, hängt von Intensität und genauer Art des Rauchs ab.',
    ],
    abschnitte: [
      {
        titel: 'Chemie',
        text: [
          'Rauchig ist ein weites Feld — es beschreibt allgemein den Duft, den Holz und Holzprodukte beim Verbrennen erzeugen. Beim Verbrennen von Holz zerfallen Bestandteile wie Cellulose, Hemicellulose und Lignin durch Pyrolyse und bilden Rauch. Rauch selbst kann aber aus der Verbrennung vieler Stoffe entstehen und ist deshalb nicht auf Holz beschränkt.',
          'Holzrauch ist eine komplexe Mischung aus Verbindungen, manche davon flüchtig, darunter Phenole, Aldehyde, Furane, Terpene, weitere flüchtige organische Verbindungen und polyzyklische aromatische Kohlenwasserstoffe. Je nach Quelle wurden mehr als 400 Verbindungen in Holzrauch oder Raucharoma identifiziert. Wie viel davon entsteht, hängt vom verbrennenden Stoff, der Temperatur, dem Feuchtigkeitsgehalt des Holzes und der beim Verbrennen vorhandenen Sauerstoffmenge ab. Die Pyrolyse von Cellulose beim Verbrennen ergibt Aldehyde und aliphatische Säuren. Hemicellulose zerfällt zu Aldehyden, Carbonylverbindungen und Furanen, die dem Rauch seine charakteristischen Aromen verleihen. Verbrennendes Lignin bildet phenolische Verbindungen wie das würzige Eugenol, das süße Guajacol und die unangenehmen Kresole.',
        ],
      },
    ],
    imKaffee: [
      {
        titel: '',
        text: [
          'Das WCR Sensory Lexicon beschreibt rauchig als „eine scharfe, durchdringende Note, die ein Produkt der Verbrennung von Holz, Blättern oder eines nicht-natürlichen Produkts ist“.',
        ],
      },
      {
        titel: 'Röstung',
        text: [
          'Das Rösten prägt die endgültigen Eigenschaften des Kaffees, doch unsachgemäßes, fehlerhaftes oder sonst zu heißes Rösten kann mehrere unerwünschte Fehltöne und potenziell negative Aromen entstehen lassen. Bestimmte Verbindungen wurden gezielt mit Röstproblemen in Verbindung gebracht. Insbesondere 4-Ethyl-2-methoxyphenol und Phenol werden mit angesengten und dunklen Auffälligkeiten assoziiert, die als rauchig und würzig beschrieben werden. Andere Verbindungen wie Pyridin, Pyrazine und Difurfurylether nehmen bei solchen fehlerhaften Röstungen deutlich zu. Dunklere Röstungen verleihen dem Kaffee vermutlich mehr rauchige Aromen und erhöhen die Zahl potenziell schädlicher Verbindungen.',
          'Bei der Bewertung der Kaffee-Eigenschaften selbst gilt rauchig nicht als Eigenschaft des Kaffees, sondern als aromatischer Fehlton. Diese Note findet sich meist in verbrannten, überrösteten Kaffees. Besonders unglücklich ist das bei Kaffee, der nicht ordentlich probegeröstet wurde. Stellt ein Verkoster eine rauchige Note fest, sollte idealerweise eine neue Probe geröstet und verkostet werden, um das volle Potenzial dieses Kaffees zu erkennen.',
          'Für die Produktionsröstung mag es Zeit und Ort für rauchige Aromen im Kaffee geben, die in bestimmten Märkten gewünscht sind. Das sollte eine Röstentscheidung jedes Unternehmens sein, abhängig von Kundenwünschen und -erwartungen. Für die professionelle sensorische Bewertung von Kaffee sollten rauchige Noten aber nie vorhanden sein.',
        ],
      },
    ],
    verwandte: [
      { nummer: 34, original: 'Holzig' },
      { nummer: 39, original: 'Teer' },
      { nummer: 40, original: 'Gummi' },
    ],
  },

  {
    nummer: 43,
    name: 'Butter',
    nameOriginal: 'Butter',
    kategorieId: 'roestig',
    kategorieLabel: 'Röstig',
    beschreibung: [
      'Die genaue Aromazusammensetzung von Butter hängt vom Futter des Tieres, der Herstellungssaison, dem Herstellungsverfahren und den Lagerbedingungen ab. Das Aroma von Butter sollte frisch, süß, reich, cremig, warm und leicht geröstet sein. Es kann nussig, blumig oder fruchtig wirken und an Toast, Buttergebäck, Zuckermais oder Kochen erinnern.',
      'Butter, die geschlagene süße Sahne von Kühen, ist ein vielseitiges und bedeutendes Lebensmittel weltweit, vor allem als Fett zum Kochen genutzt. Ihr Aroma stammt aus der milden Fermentation der Sahne und der süßen Zucker in der Milch. Butter kann süß, gesalzen, ungesalzen und kultiviert sein. Ihre physikalischen Eigenschaften erlauben es ihr, über einen weiten Temperaturbereich fest zu bleiben und dennoch vollständig im Mund zu schmelzen. Sie hat eine relativ hohe oxidative Stabilität, wodurch sie höhere Hitze verträgt als manche Öle.',
    ],
    abschnitte: [
      {
        titel: 'Geschichte',
        text: [
          'Butter zählt wahrscheinlich zu den ältesten Milchprodukten überhaupt. Schätzungen datieren die erste Butter auf die Jungsteinzeit in Afrika, vor bis zu 10.000 Jahren. Diese frühen Buttersorten stammten vermutlich nicht von Kühen, sondern von anderen domestizierten Tieren wie Schafen oder Ziegen. Man geht davon aus, dass die alten Sumerer in Mesopotamien Butter als Opfergabe für ihre Götter nutzten. In Irland verwendete man vor mehr als 3.500 Jahren Torfmoore, um Butter zu kühlen und zu lagern — solche Ablagerungen werden gelegentlich noch heute entdeckt.',
        ],
      },
      {
        titel: 'Herstellung',
        text: [
          'Die Hauptschritte der Butterherstellung sind Vorbereitung der Sahne, Sahnereifung, Emulsion und Mischen. Zuerst wird die Sahne von der Milch getrennt. Findet eine Pasteurisierung statt, geschieht sie vor der Reifung der Sahne, wenn diese schnell abgekühlt wird, damit sich Fettkristalle bilden, die später die Streichfähigkeit der Butter beeinflussen. Der gesamte Vorgang aus Vorbereiten, Pasteurisieren, Kühlen und Reifen dauert etwa 12 Stunden, die Reifung kann aber länger fortgesetzt werden. Findet eine Kultivierung statt, werden als Nächstes Starterkulturen — meist die Gattung Lactococcus — der Sahne zugesetzt. Zum Schluss kommt die Sahne in eine Buttermaschine, die den Rahm von den festen Bestandteilen trennt. Diese festen Bestandteile werden gespült, geformt, gegebenenfalls gesalzen und gekühlt, bevor sie verpackt werden. Butter ist eigens mit einem Milchfettgehalt von mehr als 80 Prozent definiert. Wie viel Fett die Milch enthält, hängt stark vom Futter der Kühe und ihrem Laktationsstadium ab.',
        ],
      },
      {
        titel: 'Chemie',
        text: [
          'Viele kennen die intensive buttrige Verbindung Diacetyl, doch in Butter wurden mehr als 200 flüchtige Aromastoffe identifiziert. Süßrahmbutter ist typischerweise von Lactonen geprägt, mit fruchtigen und cremigen Noten, sowie von Schwefelverbindungen. Die wichtigen Duftstoffe kultivierter (fermentierter) Butter sind Diacetyl, Buttersäure (käsig riechend) und δ-Decalacton (angenehm nussig-fruchtig). Sie entstehen durch die Fermentation von Milchsäurebakterien. Weitere Aldehyde bilden sich als Hitzeprodukte während der Butterherstellung, etwa durch Maillard-Reaktionen: 2-Methyl- und 3-Methylbutanal. Andere Aldehyde bringen eine grasige, frisch-grüne Komponente ein, etwa Hexanal und Nonanal.',
        ],
      },
    ],
    imKaffee: [
      {
        titel: '',
        text: [
          'Ein intensives Butteraroma ist ein besonderer, ungewöhnlicher Duft im Kaffee. Als leichte, mit anderen Charakterzügen ausgeglichene Note findet sich Butter aber in vielen Kaffees weltweit, sowohl bei Arabica als auch bei Robusta. Der Butterduft kann eine Mischung aus Verbindungen sein, darunter viele, die auch im Milchprodukt selbst vorkommen, wie Ketone, Säuren und Aldehyde. Die Bestandteile dieses Aromas finden sich schon im grünen Kaffee und entstehen zusätzlich während des Röstens.',
        ],
      },
      {
        titel: 'Röstung',
        text: [
          'Diacetyl ist von Natur aus im grünen Kaffee vorhanden, entsteht aber überwiegend erst beim Rösten. Ketone, besonders aromatische, und Diketone wie Diacetyl sind in erhitzten Fetten weit verbreitet. Diese Verbindung bildet sich bis zu einem gewissen Grad beim Rösten, doch mit fortschreitender Röstung wandelt sie sich um, und mehr verbrannte, schwefelige Noten dominieren. Deshalb begegnet man dem Aroma seltener in dunkel gerösteten Kaffees, und deshalb zeigen hellere, eher toast- und getreideartig schmeckende Kaffees ebenfalls Butteraromen. Es gibt auch Hinweise, dass Diacetyl von der Röstung bis in den fertigen Aufguss gelangt.',
          'Beim Kaffeerösten entstehen weitere Verbindungen, die eine Butternote beeinflussen können. Buttersäure wurde im Kaffee nachgewiesen und entsteht während Maillard-Reaktionen. Diese Verbindung trägt zur blumig-käsigen Seite des Butteraromas bei und findet sich auch in Blauschimmelkäse. Gesättigte Lactone wie γ-Butyrolacton sind im Kaffee weit verbreitet und nehmen mit dem Röstgrad zu — sie haben einen süßen, buttrigen, gerösteten Duft. Furane als Ester tragen vermutlich zu den fruchtig-blumig-gerösteten Noten der Butter bei. Pyrrole und Pyridine, wie sie bekanntermaßen beim Rösten entstehen, tragen zum röstig-warmen Butteraroma bei.',
        ],
      },
    ],
    verwandte: [
      { nummer: 44, original: 'Toast' },
      { nummer: 25, original: 'Frisches Gras' },
    ],
  },

  {
    nummer: 44,
    name: 'Toast',
    nameOriginal: 'Toast',
    kategorieId: 'roestig',
    kategorieLabel: 'Röstig',
    beschreibung: [
      'Toast hat ein süßes, braunes, nussiges, getreideartiges Aroma, wie man es von einem Toaster kennt, vom Frühstück, vom liebsten Brot, vom Grill oder von Butter. Das warme, wohlige Knuspern von getoastetem Brot wird weltweit geschätzt.',
    ],
    abschnitte: [
      {
        titel: 'Chemie',
        text: [
          'Brot und seine Bräunung beim Backen und Toasten sind ein Paradebeispiel dafür, wie Maillard-Reaktionen ablaufen. Immer wenn Hitze ein Lebensmittel braun werden lässt, sind Maillard-Reaktionen am Werk und erzeugen eine Fülle schmackhafter, angenehmer Geschmacks- und Aromastoffe. Unter Hitze ordnen diese Reaktionen Aminosäuren (Proteine) und Kohlenhydrate (reduzierende Zucker) neu an. Das Bukett eines Maillard-Reaktionsprodukts umfasst Furane, Furanone, Acetylpyrrolin und Pyrazine, neben vielen weiteren Verbindungen. Je dunkler das Toastbrot, desto intensiver das Aroma — bis irgendwann verbranntere, aschige oder rauchige Düfte dominieren.',
        ],
      },
    ],
    imKaffee: [
      {
        titel: 'Röstung',
        text: [
          'Jedes Kaffeearoma trägt eine dominierende Röst-Note in sich, dazu gehört auch das toastige Aroma. Das Rösten ist ein notwendiger Schritt, um Kaffee überhaupt genießbar zu machen, und erzeugt zugleich den Großteil von Geschmack und Aroma im Kaffee. Der grüne Samen und die auf ihn angewandten Nachernte-Verarbeitungsmethoden bestimmen dabei die chemische Zusammensetzung des Samens, die wiederum die konkreten Reaktionen beim Rösten bestimmt — auch wenn dieser Zusammenhang wissenschaftlich noch am Anfang steht. Zwar könnte theoretisch jeder geröstete Kaffee Toast-Aromen zeigen, doch nur gelegentlich findet sich ein Kaffee, der getoastetem oder gegrilltem Brot wirklich nahekommt. Robusta-Kaffees, oder nicht ausreichend geröstete Robustas, können viele Getreidenoten zeigen, darunter Korn, Malz und Toast. Eine Toast-Note gilt allgemein als positiver Charakterzug, außer sie dominiert in einem gegrillten, rauchigen, verbrannten Aroma.',
          'Maillard-Reaktionen während des Zuckerabbaus beeinflussen Aroma, Geschmack und Farbbildung. Saccharose, der häufigste freie Zucker im grünen Kaffee, muss erst in Glukose und Fruktose zerlegt werden, um Maillard-Reaktionen einzugehen. Die dabei entstehenden flüchtigen Stoffe umfassen Pyridine, Pyrazine, Ketone, Oxazole, Thiazole, Pyrrole, Terpene, Furane und viele weitere. Viele davon tragen zum charakteristischen Röstgeruch bei, darunter auch Toast.',
        ],
      },
    ],
    verwandte: [
      { nummer: 60, original: 'Vanille' },
      { nummer: 43, original: 'Butter' },
      { nummer: 45, original: 'Malz' },
      { nummer: 41, original: 'Tabak' },
      { nummer: 42, original: 'Rauchig' },
    ],
  },

  {
    nummer: 45,
    name: 'Malz',
    nameOriginal: 'Malt',
    kategorieId: 'roestig',
    kategorieLabel: 'Röstig',
    beschreibung: [
      'Malz riecht süß und getreideartig, mit Noten von Honig, Keks, Karamell und mitunter leicht fermentiert, schokoladig oder sogar rauchig.',
      'Malz bezeichnet jede Art Getreide, die zum Keimen gebracht wurde — ein Vorgang, der auch Mälzen genannt wird. Zwar lässt sich jedes Getreide dafür verwenden, doch Gerste ist mit Abstand am häufigsten, während Roggen, Weizen, Reis und Mais deutlich seltener zu Malz verarbeitet werden. Gemälztes Getreide ist vielseitig und findet sich in Milchshakes, Bonbons, Backwaren, Whisky und Bagels. Der Großteil des weltweit erzeugten Malzes dient aber ausschließlich der Bierherstellung.',
    ],
    abschnitte: [
      {
        titel: 'Geschichte',
        text: [
          'Den alten Ägyptern wird zugeschrieben, den Mälzungsprozess als einen der Schritte der Bierherstellung entwickelt zu haben. Mit Malz gebrautes Bier war fester Bestandteil vieler früher Gesellschaften, und Bier diente auch als Opfergabe für die Götter.',
        ],
      },
      {
        titel: 'Herstellung',
        text: [
          'Die erste Stufe des Mälzens heißt Einweichen: Dabei wird das Getreide gewaschen und mit Wasser und Sauerstoff zum Keimen gebracht. Das geschieht, indem das Getreide in Wasser eingeweicht und anschließend eine Trockenphase eingelegt wird, in der das Korn das Wasser aufnimmt. Dieser Vorgang wird meist mehrfach wiederholt. Das aufgenommene Wasser setzt den Keimungsprozess und die Enzymbildung in Gang. In der zweiten Stufe geht die Keimung weiter: Wurzeln treten aus dem Korn aus, und Triebe wachsen aus der äußeren Spelze. Dieser Vorgang dauert normalerweise vier bis sechs Tage und ergibt sogenanntes Grünmalz. Zum Schluss wird das Keimen durch Hitze im sogenannten Darren gestoppt. Das Korn welkt und röstet dann, wodurch es offiziell zu Malz wird. Die gezielten Abweichungen in diesem Schritt erzeugen die große Bandbreite an Malzfarben und -aromen, mit denen Brauer ihre einzigartigen Biere gestalten.',
        ],
      },
      {
        titel: 'Chemie',
        text: [
          'Beim Darren wird Malz ähnlich geröstet wie Kaffee. Sowohl Karamellisierung als auch Maillard-Reaktionen bestimmen dabei Geschmack, Aroma und Farbbildung des Malzes. Das Endergebnis hängt von der Ausgangsqualität des Getreides, dem genauen Mälzungsprozess, dem Feuchtigkeitsgehalt des Malzes und der Darrtemperatur ab. Dabei bilden sich Furane, Aldehyde, Pyrrole und Pyrazine, die die typischen nussigen, gerösteten, malzigen Noten verleihen. Besonders wichtig sind 2-Methylbutanal (nussig), 3-Methylbutanal (malzig) und 2-Methylpropanal (grün, malzig). Maltol, eine nach Karamell duftende Verbindung, entsteht durch Maillard-Reaktionen beim Rösten. Auch fruchtige Noten entwickeln sich, etwa durch 3-Methylbutanal, das Malz eine pfirsichartige, säuerliche Note verleiht.',
        ],
      },
    ],
    imKaffee: [
      {
        titel: '',
        text: [
          'Das WCR Sensory Lexicon beschreibt Malz als „die hellbraune, staubige, muffige, süße, saure und/oder leicht fermentierte Note, die man mit Getreide verbindet“. Ein Malzaroma lässt sich in vielen Kaffees finden, wenn sie auf eine bestimmte Art geröstet werden, die die warmen, körnigen Noten von Gerstenmalz hervorbringt.',
        ],
      },
      {
        titel: 'Röstung',
        text: [
          'Wegen der Ähnlichkeit zwischen Kaffee- und Malzröstung — und weil der Großteil der Aromastoffe beider Produkte durch Maillard-Reaktionen entsteht — überschneiden sich viele Verbindungen in diesen gerösteten Produkten. Weil körnige oder malzige Aromen bei längerer Röstzeit und höheren Temperaturen eher verschwinden oder überdeckt werden, finden sich Malznoten vermutlich häufiger in hell gerösteten Kaffees. Viele derselben Ester und Phenole, die zu blumigen, fruchtigen, holzigen und würzigen Düften in Malz beitragen, wirken auch hier mit.',
          'Es ist bekannt, dass 2-Methylpropanal, 2-Methylbutanal und 3-Methylbutanal prägende Bestandteile des Röstaromas von Kaffee sind und in vielen Kaffees vorkommen. Diese nussigen, röstigen, malzigen Noten sind dieselben Verbindungen, die auch gemälztes Getreide auszeichnen — wenig überraschend angesichts der Ähnlichkeit der beiden Getreidearten (Gerste und Kaffee) und der Verfahren, die sie teilen.',
          'Eine weitere wichtige Verbindung, die geröstetes Malz und Kaffee gemeinsam haben, ist Maltol. Dieses Phenol entsteht durch den Zuckerabbau beim Rösten und trägt eine süße, geröstete Note bei. Es gibt Hinweise, dass Robusta typischerweise eine höhere Konzentration dieser Verbindung aufweist als Arabica. Maltol wurde als wichtiger Aromastoff in philippinischem Robusta-Kaffee identifiziert und trägt auch zum fertigen Aufguss bei.',
        ],
      },
    ],
    verwandte: [
      { nummer: 44, original: 'Toast' },
      { nummer: 41, original: 'Tabak' },
      { nummer: 42, original: 'Rauchig' },
      { nummer: 59, original: 'Karamellisiert' },
      { nummer: 1, original: 'Honig' },
    ],
  },

  {
    nummer: 46,
    name: 'Pfeffer',
    nameOriginal: 'Pepper',
    kategorieId: 'gewuerze',
    kategorieLabel: 'Gewürze',
    beschreibung: [
      'Pfeffer ist für seinen trigeminalen Kribbeleffekt bekannt — der eigentliche Duft aber ist scharf, holzig, frisch, harzig und warm. Je nach Sorte und Verarbeitung kann er blumig, fruchtig oder muffig wirken.',
    ],
    abschnitte: [
      {
        titel: 'Taxonomie',
        text: ['Piper nigrum, der schwarze Pfeffer, ist die am häufigsten kultivierte Art in der Familie der Pfeffergewächse (Piperaceae).'],
      },
      {
        titel: 'Die Pflanze',
        text: [
          'Heimisch in der Malabar-Region Indiens, wird schwarzer Pfeffer für seine Frucht angebaut. Er ist eine verholzende, blühende Kletterpflanze, wird bis zu 4 Meter hoch und blüht in Ähren. Ihre kleinen Früchte, botanisch Steinfrüchte, bilden diese Ähren und sind als Pfefferkörner bekannt. Jedes Pfefferkorn ist etwa 5 Millimeter groß und enthält einen einzigen Samen. Die Reben werden oft im Mischanbau kultiviert, weil sie gut an Bäumen oder anderen mehrjährigen Kulturen wie Kaffee emporklettern. Die getrocknete Frucht der Pfefferpflanze gilt als das wichtigste und meistkonsumierte Gewürz der Welt.',
        ],
      },
      {
        titel: 'Geschichte',
        text: [
          'Pfeffer wird in Indien seit Jahrtausenden angebaut und in der Küche verwendet. Im Altertum war Pfeffer so kostbar, dass er als Zahlungsmittel für Steuern, Mitgiften und Pacht diente. Laut der Ernährungs- und Landwirtschaftsorganisation der Vereinten Nationen (FAO) waren Vietnam, Brasilien, Indonesien und Indien 2022 die größten Pfeffer-Erzeuger.',
        ],
      },
      {
        titel: 'Herstellung',
        text: [
          'Pfefferkörner werden geerntet, während die Frucht noch grün ist, dann fermentieren gelassen und in der Sonne getrocknet, bis sie dunkelbraun oder schwarz werden. Dieser Farbwechsel der frischen, grünen Frucht entsteht durch die enzymatische Oxidation von Ethanolglykosid, ausgelöst durch eine in der frischen Frucht vorhandene Oxidase (Polyphenoloxidase, PPO). Das Trocknen läuft weiter, bis die Pfefferkörner einen Feuchtigkeitsgehalt von unter 10 Prozent erreichen. Ähnlich wie beim Trocknen von Kaffee können die Umstände beim Trocknen — Wetter, Methode, Wenden der Pfefferkörner, mikrobielle Aktivität — die Qualität des Endprodukts erheblich beeinflussen.',
        ],
      },
      {
        titel: 'Chemie',
        text: [
          'Der scharfe Biss des Pfefferaromas geht überwiegend auf das Alkaloid Piperin zurück. Sein durchdringend-scharfer, brennender Duft kann Nase und Mund reizen — ähnlich wie, aber etwa hundertmal schwächer als, das Capsaicin in Chilischoten. Viele weitere Verbindungen tragen zum Pfefferaroma bei. Wichtige Substanzen sind die kiefernartig duftenden Terpene (S)-α-Phellandren (eukalyptusartig), α- und β-Pinen (kiefernartig), Myrcen (pfeffrig, erdig, würzig), Limonen (kiefer- und zitronenartig) und Linalool (blumig, zitrisch, süß, frisch). Die Aldehyde Methylpropanal sowie 2- und 3-Methylbutanal verleihen blumige, nussige, sogar kakaoartige Aromen. Die muffigeren, blumigen Noten gehen auf Butter- und Methylbuttersäure zurück, die einen fruchtig-blumig-cremigen Geruch haben können.',
        ],
      },
    ],
    imKaffee: [
      {
        titel: '',
        text: [
          'Das WCR Sensory Lexicon beschreibt Pfeffer als „die würzige, durchdringende, muffige und holzige Note, die charakteristisch für gemahlenen schwarzen Pfeffer ist“. Erdige, krautige, würzige Kaffees zeigen oft eine Pfeffernote, darunter solche aus Indonesien, Indien und Äthiopien. Indonesische Kaffees können krautige, erdige und pfeffrige Aromen haben. Indische Kaffees, einschließlich Monsooned-Kaffee, gelten als würzig und fruchtig, mit Noten von Gewürznelke, Muskatnuss und schwarzem Pfeffer. Äthiopischer Harrar ist für seine kräftigen, würzigen, blumigen Noten bekannt, darunter Pfeffer, Zimt und Blaubeere. Auch mittelamerikanische Kaffees, etwa aus Guatemala, können würzig wirken und nach Gewürz und Schokolade riechen.',
        ],
      },
      {
        titel: 'Nachernte-Verarbeitung',
        text: [
          'Natural, wet-hulled und Monsooned-Kaffees entwickeln am ehesten Aromen dunkler Frucht und Würze. Die Nachernte-Verarbeitung beeinflusst dieses Aroma im Kaffee zweifellos, denn viele natural aufbereitete Kaffees bauen bei längerer Trocknung oder Fermentation würzige Noten zusammen mit dunkler Frucht auf. Der genaue Weg dorthin ist unklar, vermutlich ein Ergebnis mikrobieller Stoffwechselprodukte und ihres Zusammenspiels beim Rösten.',
        ],
      },
      {
        titel: 'Röstung',
        text: [
          'Das Röstprofil kann Pfeffer und ähnliche Aromen ebenfalls beeinflussen und hervorbringen. Bestimmte würzige Noten sind bekanntermaßen ein Ergebnis der Pyrolyse beim Rösten. Manche der wichtigen Aromaverbindungen in schwarzem Pfeffer, besonders die würzigen Terpene, finden sich auch in geröstetem Kaffee. Myrcen zum Beispiel könnte sich beim Abbau von Terpenoiden während des Röstens bilden, da es ein Pyrolyseprodukt von β-Pinen ist. Linalool und Limonen finden sich ebenfalls häufig in geröstetem Kaffee und gelten allgemein als positive Qualitätsmerkmale. Keine dieser Verbindungen steht für sich allein in einem Kaffee — sie sind Teil einer chemischen Suppe, die zu einem Aroma wird, das größer ist als die Summe ihrer Teile. Limonen für sich allein würde nie nach Pfeffer riechen. Der Ursprung des würzigen, schwarzen-Pfeffer-Aromas im Kaffee liegt zweifellos in einer Vielzahl von Faktoren, die bis zur Rösterei zurückreichen. Das eigentliche Maß liegt in der Tasse und im Kopf des Verkosters, der sich an schwarzen Pfeffer erinnert fühlt.',
        ],
      },
    ],
    verwandte: [
      { nummer: 34, original: 'Holzig' },
      { nummer: 30, original: 'Kiefer' },
      { nummer: 50, original: 'Gewürznelke' },
      { nummer: 42, original: 'Rauchig' },
    ],
  },

  {
    nummer: 47,
    name: '(Stern-)Anis',
    nameOriginal: '(Star) Anise',
    kategorieId: 'gewuerze',
    kategorieLabel: 'Gewürze',
    beschreibung: [
      'Anis hat einen trockenen, süßen, holzigen Duft. Er riecht nach Lakritz und Fenchel und wirkt leicht blumig.',
      'Sternanis ist Zutat der traditionellen chinesischen Fünf-Gewürze-Mischung. In Indien ist er wichtiger Bestandteil von Garam Masala. Er steckt in mehreren vietnamesischen Signaturgerichten, etwa in der Pho-Bo-Suppe. Sein Duft kann an Lakritz, Backwaren, Zahnpasta, chinesische oder vietnamesische Küche sowie an Konfekt und Bonbons erinnern.',
    ],
    abschnitte: [
      {
        titel: 'Taxonomie',
        text: ['Der getrocknete Samenstand der Pflanze Illicium verum.'],
      },
      {
        titel: 'Die Pflanze',
        text: [
          'Das Gewürz, das wir als Sternanis kennen, ist die getrocknete Frucht und der Samenstand eines kleinen bis mittelgroßen, immergrünen Baums. Die rotbraune Frucht besteht aus sechs bis acht Fruchtblättern, die sternförmig angeordnet sind. Sie ist heimisch in Südchina und Nordvietnam, wird aber auch in Japan, Indien, Laos, Kambodscha und Vietnam angebaut. Sternanis ist mit dem Kraut Anis nur entfernt verwandt. Die Frucht wird vor der Reife gepflückt und anschließend getrocknet. Das ätherische Öl des Gewürzes sitzt in der Fruchtschale, nicht im Samen. In der Aromatherapie wird Sternanis genutzt, um Husten, Koliken, Krämpfe, Schluckauf und Verdauungsbeschwerden zu lindern. Er hat kräftige antimikrobielle, antioxidative und insektizide Eigenschaften.',
        ],
      },
      {
        titel: 'Geschichte',
        text: [
          'In der traditionellen chinesischen Medizin gilt Sternanis als wärmendes Yang, das eine Erkältung vertreiben und den Fluss des Chi regulieren soll, um Schmerzen oder eine Erkältung zu lindern.',
        ],
      },
      {
        titel: 'Chemie',
        text: [
          'Sternanis, Anis und Fenchel bilden alle einen großen Anteil an (E)-Anethol und weiteren Verbindungen und teilen sich deshalb ähnliche Aromen. Die Hauptverbindung, die für mehr als 70 Prozent der flüchtigen Stoffe in Sternanis verantwortlich ist, ist (E)-Anethol. Anethol gilt als eine sehr süße Verbindung. Als Anis-Kampfer bekannt, ist diese Verbindung gut löslich in Ethanol. Weitere, weniger dominante Verbindungen sind α-Pinen, Camphen, β-Pinen, Linalool, cis-Anethol, trans-Anethol, Safrol, Anisaldehyd und Acetoanisol. Sie bringen zitrische, nussige, blumige, medizinische und karamellisierte Noten in das Aroma ein.',
        ],
      },
    ],
    imKaffee: [
      {
        titel: '',
        text: [
          'Das WCR Sensory Lexicon beschreibt Anis als „eine durchdringende, süße, braune, karamellisierte Note, die petroleumartige, medizinische und blumige Züge enthalten kann“. Jeder Kaffee mit braunen Gewürznoten hat das Potenzial, eine anisartige Qualität zu zeigen, je nach Wahrnehmung des Verkosters. Indonesische, besonders sumatranische Kaffees sind für würzige Noten bekannt, darunter Lakritz und Anis.',
        ],
      },
      {
        titel: 'Röstung',
        text: [
          'Wie bei vielen braunen Gewürzen entwickelt sich das Aroma von (Stern-)Anis im Kaffee erst beim Rösten. Anethol, oder Anis-Kampfer, wurde im Kaffee als Produkt des Röstens identifiziert — dunklere, weiter entwickelte Röstungen zeigen dabei höhere Mengen als hellere. Diese eindeutig anisartige Verbindung wurde auch direkt im Aroma von aufgegossenem äthiopischem Kaffee nachgewiesen. Die untergeordneten Bestandteile des Anisaromas, etwa Pinen, Linalool und Limonen, wurden ebenfalls im Kaffee identifiziert. Anisaldehyd wurde im Kaffee als süß, holzig und anisartig identifiziert.',
        ],
      },
    ],
    verwandte: [
      { nummer: 50, original: 'Gewürznelke' },
      { nummer: 49, original: 'Zimt' },
      { nummer: 60, original: 'Vanille' },
      { nummer: 34, original: 'Holzig' },
      { nummer: 46, original: 'Pfeffer' },
    ],
  },

  {
    nummer: 48,
    name: 'Muskatnuss',
    nameOriginal: 'Nutmeg',
    kategorieId: 'gewuerze',
    kategorieLabel: 'Gewürze',
    beschreibung: [
      'Dieses Gewürz hat einen unverwechselbar scharfen, warmen, süßen Geschmack und wird in vielen Backwaren verwendet. Sein einzigartiges Aroma trägt holzige Noten von Zimt, Pfeffer, Kiefer und Erde.',
      'Das Pulver wird häufig in Saucen, Desserts, Fleischgerichten und saisonalen Getränken wie Eierlikör verwendet. In Indonesien und Indien wird die ganze Muskatfrucht samt Samen für viele Gerichte genutzt. Weltweit ist sie eine beliebte Zutat in herbstlichen und winterlichen Getränken, auch in Lattes. Ihr Duft kann an ein tröstliches Gericht erinnern, an ein warmes Feuer oder an einen klaren Herbsttag auf dem Kürbisfeld.',
    ],
    abschnitte: [
      {
        titel: 'Taxonomie',
        text: ['Das Gewürz Muskatnuss ist der getrocknete Kern des Samens vom Baum Myristica fragrans.'],
      },
      {
        titel: 'Die Pflanze',
        text: [
          'Heimisch in Indonesien und verbreitet von Indien bis Australien, kann dieser Baum bis zu 10 Meter hoch werden. Die Frucht ist eine gelbe Steinfrucht mit fleischiger Fruchtwand, die sich bei Reife in zwei Hälften spaltet und damit signalisiert, dass der Samen im Inneren erntereif ist. Der Samen ist von einer tiefroten, netzartigen Hülle umgeben — dem Samenmantel, der als eigenständiges Gewürz namens Macis verarbeitet und verkauft wird. Der Samen trocknet innerhalb der Kerne, bis er exportfertig ist.',
        ],
      },
      {
        titel: 'Geschichte',
        text: [
          'Es gibt Belege, dass die Indonesier Muskatnuss seit mehr als 3.500 Jahren in ihrer Küche verwenden. Muskatnuss wurde fast ausschließlich auf den Banda-Inseln Indonesiens angebaut, bevor sie nach Indien gebracht wurde. Als die ersten europäischen Händler im 16. Jahrhundert eintrafen, überzog eine Reihe unglücklicher Kolonisierungskonflikte die Inseln und ihre Bewohner. Zuerst kontrollierten die Portugiesen den Muskatnuss-Handel über Jahrhunderte, bis hin zum Völkermord, um ihr Monopol auf das Gewürz zu sichern. Sowohl die Niederländer als auch die Briten wollten leider ebenfalls am Muskatnuss-Geschäft teilhaben und führten Krieg um die Inseln, in dem die Portugiesen die Kontrolle verloren. Um die Kämpfe zu beenden, tauschten die Niederländer ihre Kolonie Neu-Amsterdam (die heutige Insel Manhattan, New York) in der Neuen Welt gegen die britische Zusicherung ein, die Kontrolle über die Banda-Inseln und den Muskatnuss-Handel zu behalten. Dieser kurzsichtige Tausch sicherte ihre Muskatnuss-Macht nur für weitere hundert Jahre — dann übernahmen die Briten die Kontrolle über die Inseln und begannen sofort, Muskatnuss in andere britische Kolonien zu verpflanzen, darunter Grenada, das die Pflanze bis heute anbaut. Die Banda-Inseln und ihre indigene Bevölkerung wurden kolonisiert und versklavt — zuerst von den Portugiesen, dann von den Niederländern, den Briten und wieder den Niederländern —, bevor sie nach dem Zweiten Weltkrieg ihre Unabhängigkeit zurückerlangten.',
        ],
      },
      {
        titel: 'Chemie',
        text: [
          'Muskatnuss verdankt ihren charakteristischen Duft einer Kombination aus Pinen, Camphen, Dipenten, monoterpenen Kohlenwasserstoffen, Estern, Sesquiterpenen, Alkenen und weiteren Verbindungen. Sabinen hat einen warmen, pfeffrigen, holzigen, krautigen Duft. Myristicin, Limonen, Cineol, Safrol, Sabinen, Pinen und Terpineol steuern zusammen ein Bukett fruchtiger, blumiger, erdiger, warmer Aromen bei. Myristicin bringt eine würzige Note mit sich, der auch psychoaktive Wirkungen nachgesagt werden. Safrol ist der Hauptduftstoff der Sassafraswurzel, die traditionell zur Herstellung von Sassafras-Limonade diente, heute als Root Beer bekannt.',
        ],
      },
    ],
    imKaffee: [
      {
        titel: '',
        text: [
          'Das WCR Sensory Lexicon beschreibt Muskatnuss als „eine feuchte, braune, holzige, durchdringende, petroleumartige, schwere Note mit einem leicht zitronigen Zug“. Muskatnuss gehört zur Gruppe der „braunen Gewürze“, die allgemein Backgewürze umfasst. Sie wird häufig mit Kaffee assoziiert — nicht nur wegen der Tradition, sie über Lattes und Cappuccinos zu streuen, sondern auch wegen der warmen, würzigen Noten, die beim Rösten entstehen. Es gibt keine starke Verbindung zwischen der eigentümlichen Chemie der Muskatnuss und der des Kaffees, doch das heißt nicht, dass wir sie nicht wahrnehmen können.',
        ],
      },
      {
        titel: 'Pflanze',
        text: [
          'Grüner Kaffee und Muskatnuss teilen tatsächlich einiges an Chemie. Ob das bedeutet, dass sie ähnlich riechen, oder der Grund dafür ist, dass sie ähnlich riechen können, ist noch nicht geklärt. Ethylacetat zum Beispiel ist ein Alkohol, das beiden Produkten gemeinsam ist. Aldehyde und Terpenoide wie Vanillin kommen in beiden Pflanzen vor. Ester und monoterpene Kohlenwasserstoffe wie Pinen finden sich sowohl in grünem Kaffee als auch in Muskatnuss. Es gibt zudem bestimmte Verbindungen mit dem Potenzial, einen muskatnussartigen Duft abzugeben, die im Kaffee identifiziert wurden — wie genau sie mit der komplexen Mischung zusammenwirken und ob sie es überhaupt bis in die Tasse schaffen, ist aber weitgehend unbekannt.',
        ],
      },
      {
        titel: 'Röstung',
        text: [
          'Ähnlich könnten verschiedene beim Rösten entstehende Verbindungen einen Muskatnuss-Duft beeinflussen — direkte Zusammenhänge sind allerdings nicht bekannt. Zum Beispiel kommen viele Aldehyde und Kohlenwasserstoffe in beiden Pflanzen vor. Die genaue Mischung dieser Stoffe und wie sie beim Brühen und Verkosten zusammenwirken, gehört zu jenem Geheimnis, das uns alle immer wieder auf die nächste Tasse hoffen lässt.',
        ],
      },
    ],
    verwandte: [
      { nummer: 49, original: 'Zimt' },
      { nummer: 34, original: 'Holzig' },
      { nummer: 50, original: 'Gewürznelke' },
      { nummer: 47, original: 'Anis' },
      { nummer: 46, original: 'Pfeffer' },
      { nummer: 60, original: 'Vanille' },
    ],
  },

  {
    nummer: 49,
    name: 'Zimt',
    nameOriginal: 'Cinnamon',
    kategorieId: 'gewuerze',
    kategorieLabel: 'Gewürze',
    beschreibung: [
      'Dieses Gewürz hat einen zarten Duft. Ceylon-Zimt gilt als besonders fein und vielschichtig im Geschmack. Sein Duft ist blumig, zitrisch, würzig, reich und erdig, während Cassia-Zimt eher bitter, herb und scharf wirkt. Der Duft kann an süßes, klebriges Gebäck erinnern, an ein warmes Currygericht oder an ein scharfes Sichuan-Chili-Gericht.',
      'Heute wird Zimt nicht nur in süßen, sondern auch in herzhaften Gerichten geschätzt und findet sich in vielen Küchen und Kulturen.',
    ],
    abschnitte: [
      {
        titel: 'Taxonomie',
        text: [
          'Das Gewürz stammt aus der Rinde verschiedener Arten der Gattung Cinnamomum, darunter C. verum (Ceylon), C. cassia, C. loureirii (Saigon) und der indonesische C. burmanni (Korinje). Die Gattung umfasst 250 Arten.',
        ],
      },
      {
        titel: 'Die Pflanze',
        text: [
          'Zimt ist ein kleiner, immergrüner Baum, der bis zu 15 Meter hoch wird und in Südostasien, China und Australien verbreitet ist. Die stark aromatische Rinde ist etwa 10 Millimeter dick, an jungen Zweigen glatt und hellbraun, an ausgewachsenen Bäumen rau und dunkel. Ceylon-Zimt, angebaut in Sri Lanka, gilt als der „echte“ Zimt. Die anderen Arten werden im Handel meist als Cassia-Zimt verkauft, ohne dass das üblicherweise gesondert gekennzeichnet wird.',
          'Zimt ist für eine breite Palette gesundheitlicher Wirkungen bekannt. Er dient als Zutat in der ayurvedischen Medizin — zum Beispiel, um ein saisonal aus dem Gleichgewicht geratenes Vata-Dosha zu behandeln, das mit der Herbstsaison verbunden wird. Die Rinde wirkt schleimlösend. Sie gilt außerdem als antioxidativ, entzündungshemmend, antibiotisch, antimikrobiell und antidiabetisch. Forschung deutet darauf hin, dass Zimt den Stoffwechsel ankurbeln, oxidative Schäden an Zellen verhindern und sogar kognitivem Abbau und Krebs entgegenwirken kann.',
        ],
      },
      {
        titel: 'Geschichte',
        text: [
          'Zimt ist seit langem ein immens beliebtes Gewürz in Küche und Medizin. Seine Nutzung reicht fast 5.000 Jahre zurück. Zimt begleitete Zivilisationen von China bis zu den alten Römern, Ägyptern und Griechen und wird sogar in der Bibel erwähnt. Die Suche nach Zimt führte viele europäische Entdecker in neue Länder, auch nach Amerika.',
          'Vor der Kolonialzeit handelte Ceylon (das heutige Sri Lanka) mit Zimt innerhalb der Region und bis in den Nahen Osten und nach Ägypten. Die Portugiesen schlossen Anfang des 16. Jahrhunderts Geschäfte mit der lokalen Herrscherschicht, was schließlich noch vor Ende des Jahrhunderts zur vollständigen portugiesischen Kolonialisierung der Insel führte. Andere europäische Nationen ließen sich vom aufregenden Gewürz locken: Die Niederländer übernahmen im späten 17. Jahrhundert über die Niederländische Ostindien-Kompanie die Kontrolle, gefolgt von den Briten, die im späten 18. Jahrhundert die Macht übernahmen. All diesen Kolonialmächten war klar: Mit dieser kleinen Insel kamen Ruhm und Reichtum aus der Rinde jenes Baums, der die Welt in seinen Bann zog.',
        ],
      },
      {
        titel: 'Herstellung',
        text: [
          'Die Rinde des Baums liefert den größten Teil des als Gewürz verwendeten Zimts, doch auch Blätter, Wurzeln, Blüten und Früchte wurden genutzt, um aromatische Öle zu gewinnen. Bevor sich Röhren von einem C.-verum-Baum ernten lassen, muss er ausgereift sein, was etwa 24 Jahre dauern kann. Bei der Ernte werden meist nur ein oder zwei Triebe des Baums gleichzeitig geschnitten, um seine Gesundheit zu erhalten — einzelne Bäume werden typischerweise alle zwei bis drei Jahre geerntet. Der Vorgang umfasst mehrere Schritte: Ernten der Triebe, Reinigen und Waschen, Schaben, Reiben, Schälen, Trocknen und das Formen der Röhren. Diese Röhren rollen sich zu den Zimtstangen, die im Ganzen verkauft werden.',
        ],
      },
      {
        titel: 'Chemie',
        text: [
          'Untersuchungen zeigen, dass der dominante Geschmack von Zimt von einer einzigen Verbindung kommt: Zimtaldehyd, das mehr als 75 Prozent des Ölgehalts der Rinde ausmacht. Es ist ein Flavonoid (Phenylpropanoid), das natürlich in Bäumen vorkommt und eine Vorstufe von Lignin ist. Die häufigsten weiteren aromatischen Verbindungen sind Eugenol, Zimtylacetat, Caryophyllen und Linalool.',
        ],
      },
    ],
    imKaffee: [
      {
        titel: '',
        text: [
          'Das WCR Sensory Lexicon beschreibt diese Note als „eine süße, braune, leicht holzige, leicht durchdringende, würzige Note“. Wie bei Muskatnuss finden sich die genauen Verbindungen, die das einzigartige Zimtaroma ausmachen — allen voran Zimtaldehyd —, nicht im Kaffee. Es gibt aber eine Reihe von Verbindungen, die sich Gewürz und Kaffee teilen, darunter Ester, phenolische Verbindungen und Kohlenwasserstoffe — auch wenn das nicht zwangsläufig dazu führt, dass ein Kaffee nach Zimt riecht.',
        ],
      },
      {
        titel: 'Röstung',
        text: [
          'Beim Rösten entstehende Verbindungen, die sich als holzig und würzig beschreiben lassen, tragen zweifellos zur Wahrnehmung von Zimt in manchen Kaffees bei. Viele Furane bilden sich durch das Erhitzen von Glukose. Das Furan 2-Furanmethanol wird mit einem Duft ähnlich Zimt oder Eukalyptus beschrieben. Furfural hat einen getreideartigen, zimtähnlichen Duft, der sich beim Rösten bis zu 230 °C bilden kann, sich bei höheren Temperaturen aber wieder abbaut. Furfuryl, ein Produkt des Polysaccharid-Abbaus beim Rösten, wird als süß, karamellig und getreideartig beschrieben und kann manchmal nach Zimt riechen.',
        ],
      },
    ],
    verwandte: [
      { nummer: 48, original: 'Muskatnuss' },
      { nummer: 34, original: 'Holzig' },
      { nummer: 60, original: 'Vanille' },
      { nummer: 50, original: 'Gewürznelke' },
      { nummer: 47, original: 'Anis' },
      { nummer: 1, original: 'Honig' },
    ],
  },

  {
    nummer: 50,
    name: 'Gewürznelke',
    nameOriginal: 'Clove',
    kategorieId: 'gewuerze',
    kategorieLabel: 'Gewürze',
    beschreibung: [
      'Der Duft ist warm, würzig und holzig und kann Noten von Pfeffer und Zimt haben. Er kann an ein Weihnachtsessen erinnern, an Zigaretten, Glühwein, Orangen, Softdrinks oder einen Pumpkin-Spice-Latte.',
    ],
    abschnitte: [
      {
        titel: 'Taxonomie',
        text: ['Die getrockneten Blütenknospen des Baums Syzygium aromaticum.'],
      },
      {
        titel: 'Die Pflanze',
        text: [
          'Der Baum ist heimisch auf den Molukken in Indonesien, auch als Gewürzinseln bekannt. Dieser immergrüne, tropische Baum aus der Familie der Myrtengewächse kann bis zu 12 Meter hoch werden und mehr als 100 Jahre alt. Die Blüte beginnt meist fünf Jahre nach dem Pflanzen. Die wichtigsten Anbauländer für Gewürznelken sind Indonesien, Indien, Malaysia, Sri Lanka, Madagaskar und Tansania.',
          'Gewürznelken werden seit dem Altertum medizinisch genutzt und haben ihre Wurzeln in der ayurvedischen Medizin, wo sie gegen Magenbeschwerden eingesetzt werden und das Pitta-Dosha erhöhen sollen. Wie wichtig Gewürznelken als medizinische Pflanze sind, zeigt die große Bandbreite pharmakologischer Wirkungen, die sich aus ihrer traditionellen Anwendung über Jahrhunderte ableiten lassen und die moderne wissenschaftliche Methoden inzwischen untersucht haben. Gewürznelken wurden nachweislich antioxidativ, antibakteriell, pilzhemmend, antiviral und krebshemmend nachgewiesen.',
          'Gewürznelken werden vielfach in Tees, Fleischgerichten, Backwaren, Glühwein und eingelegten Speisen verwendet. Sie sind eine Schlüsselzutat der chinesischen Fünf-Gewürze-Mischung und stecken auch in Zahnpasta, Kaugummi und anderen Konsumgütern.',
        ],
      },
      {
        titel: 'Geschichte',
        text: [
          'Gewürznelken zählten zu den frühesten Gewürzen, die in der asiatischen Region gehandelt wurden. Um die Nachfrage anzukurbeln und die Preise hochzuhalten, unternahmen die Niederländer erhebliche Anstrengungen, Gewürznelken von allen bis auf zwei kleinen Inseln auszurotten. Später schmuggelten die Franzosen sie in die Neue Welt und brachen damit das Monopol, wodurch sich der Handel weltweit ausbreitete.',
        ],
      },
      {
        titel: 'Herstellung',
        text: [
          'Die kleinen Blütenknospen des Baums dienen der Gewürzherstellung. Junge Blütenknospen sind blass und wechseln allmählich über Grün zu Rot — dann sind sie erntereif. Sie werden sorgfältig von Hand geerntet. Nach der Ernte werden die Knospen von Hand von den Stielen getrennt und zum Trocknen auf Matten ausgebreitet. Das Trocknen kann vier bis fünf Tage dauern. Gut getrocknete Knospen sind hart, knackig, dunkelbraun und haben einen Feuchtigkeitsgehalt von unter 12 Prozent — so lassen sie sich ein bis zwei Jahre in Säcken lagern. Ein einzelner ausgewachsener Baum kann jährlich 34 Kilogramm getrocknete Knospen liefern.',
        ],
      },
      {
        titel: 'Chemie',
        text: [
          'Gewürznelken enthalten bis zu 20 Prozent ätherische Öle, hauptsächlich bestehend aus dem Phenol Eugenol. Benzylalkohol trägt ebenfalls zum Duft bei, der als süß, blumig und feucht-holzig bekannt ist.',
        ],
      },
    ],
    imKaffee: [
      {
        titel: '',
        text: [
          'Das WCR Sensory Lexicon beschreibt Gewürznelke als „eine süße, braune, würzige, durchdringende, blumige, zitrische, medizinische und leicht minzige Note“. Gewürznelken und ähnliche Gewürze sind bekanntlich gute Begleiter zu Kaffee, doch einen Kaffee mit einer ausgeprägten Nelkennote zu finden ist selten. Die fast minzige Würze der Gewürznelke ist ein herausstechender Charakterzug, der sich in bemerkenswert holzigen, erdigen, würzigen Kaffees zeigen kann, etwa aus Indonesien oder Indien. In solchen Kaffees kann eine Nelkennote ein Highlight und ein erwünschtes Merkmal sein, wenn sie mit den übrigen Eigenschaften im Gleichgewicht steht.',
        ],
      },
      {
        titel: 'Röstung',
        text: [
          'Phenole — darunter, aber nicht nur, Eugenol — sind ein bedeutendes Ergebnis des Röstprozesses. Eugenol wurde im Kaffee identifiziert, auch wenn seine genaue Herkunft dort ungeklärt ist. Als bedeutendes Phenol im Kaffee wird vermutet, dass Eugenol durch die Pyrolyse von Melanoidin-Verbindungen, durch alkalische Fusion oder durch Abbau in Glycerin entsteht — oder durch eine Kombination davon. Diese Verbindung findet sich auch im Kaffeeaufguss, ihre Extraktion hängt aber von der Wasserhärte ab.',
        ],
      },
    ],
    verwandte: [
      { nummer: 49, original: 'Zimt' },
      { nummer: 48, original: 'Muskatnuss' },
      { nummer: 47, original: 'Anis' },
      { nummer: 34, original: 'Holzig' },
      { nummer: 46, original: 'Pfeffer' },
      { nummer: 41, original: 'Tabak' },
    ],
  },

  {
    nummer: 51,
    name: 'Erdnuss',
    nameOriginal: 'Peanut',
    kategorieId: 'nussig-kakao',
    kategorieLabel: 'Nussig / Kakao',
    beschreibung: [
      'Erdnüsse haben ein fettiges, geröstetes, süßes, nussiges Aroma, das manchmal nach Toast, Butter oder sogar Malz riecht.',
      'Sie sind ein nährstoffreicher, schmackhafter Snack für sich, finden sich in Erdnussbutter, in frittierten herzhaften Gerichten, in einem Sandwich mit Konfitüre und in verschiedenen regionalen Street-Food-Gerichten weltweit. Erdnüsse werden für den einzigartigen, angenehmen Geschmack geschätzt, der sich beim Rösten entwickelt.',
    ],
    abschnitte: [
      {
        titel: 'Taxonomie',
        text: ['Die Nuss der Pflanze Arachis hypogaea aus der Familie der Hülsenfrüchtler (Fabaceae).'],
      },
      {
        titel: 'Die Pflanze',
        text: [
          'Die Erdnuss ist die unterirdische Frucht einer krautigen Hülsenfrucht, heimisch in den Anden Südamerikas. Als Hülsenfrucht steht sie in Symbiose mit Bakterien, die es der Pflanze erlauben, Stickstoff aus der Luft zu binden und dem Boden zuzuführen. Eine ungewöhnliche Nuss, denn ihre Hülsen und Nüsse wachsen unter der Erde. Tatsächlich ist die Erdnuss gar keine echte Nuss, sondern ein Samen in einer Hülse, der sich als schmackhaft erweist, wenn er gereift und geröstet wird.',
        ],
      },
      {
        titel: 'Geschichte',
        text: [
          'So alt wie die Landwirtschaft selbst, hat die Erdnuss eine Rolle in der Weltgeschichte gespielt — als Hauptfigur von Handel, Sklaverei und Kolonisierung. Die Menschen der Andenregion in Bolivien kultivierten Erdnüsse bereits vor mehr als 7.000 Jahren. Nachdem die kolonisierenden Portugiesen Ende des 15. Jahrhunderts auf die Pflanze in Amerika stießen, begannen sie, Erdnüsse in Westafrika anzubauen. Erdnüsse wurden häufig versklavten Menschen auf ihrer langen Überfahrt nach Amerika zu essen gegeben. Von Westafrika aus reisten Erdnüsse auf Sklavenschiffen in die USA, wo sie angepflanzt und weiterhin überwiegend von versklavten Menschen gegessen wurden. Erst mit dem Bürgerkrieg wurden weiße US-Amerikaner im Süden mit diesem Nahrungsmittel vertraut. Anfang des 20. Jahrhunderts erforschte und bewarb der amerikanische Wissenschaftler George Washington Carver die Erdnuss im gesamten Süden und legte sogar vor dem Kongress Zeugnis über den Nutzen dieser Pflanze ab.',
        ],
      },
      {
        titel: 'Herstellung',
        text: [
          'Nach dem Trocknen auf einen Feuchtigkeitsgehalt von etwa 10 Prozent werden rohe Erdnüsse gewaschen, um Erde zu entfernen, und dann in einem Heizgerät getrocknet. Anschließend können die Erdnüsse in der Schale trocken geröstet werden, bei 160 bis 200 °C für 1 bis 1,5 Stunden.',
        ],
      },
      {
        titel: 'Chemie',
        text: [
          'Erdnüsse sind ein reichhaltiges Lebensmittel mit mehr als 200 aromaaktiven Verbindungen. Der Großteil der wirkungsvollen flüchtigen Verbindungen entsteht während des Röstens, wenn Maillard-Reaktionen, Strecker-Abbau, Karamellisierung und Lipidoxidation gleichzeitig ablaufen. Bei Maillard-Reaktionen entstehen Furane, Thiazole, Thiophene, Pyrrole, Pyridine und Pyrazine. Karamellisierung erzeugt Furan-Derivate. Pyrazine gelten typischerweise als eine der charakteristischsten Verbindungen des Erdnussgeschmacks. Weil Erdnüsse zu fast 50 Prozent aus Fett bestehen, erzeugt die Lipidoxidation aliphatische Aldehyde, Ketone und Alkohole. Es gibt eine ganze Reihe von Fehltönen und Fehlaromen, die bei unsachgemäß gerösteten oder gelagerten Erdnüssen auftreten, darunter harsche, grasartige Aldehyde, fruchtige Alkohole sowie Pappe- und Fisch-artige Oxidationsprodukte.',
        ],
      },
    ],
    imKaffee: [
      {
        titel: '',
        text: [
          'Das WCR Sensory Lexicon beschreibt Erdnuss als „eine süße, hellbraune, ölige, etwas muffig-staubige, bohnige Note, die leicht adstringierend sein kann“. Erdnuss ist im Kaffee ein leicht erkennbares Aroma. In geringer Intensität und im Gleichgewicht mit Süße kann Erdnuss eine erwünschte Eigenschaft sein. Bei hoher Konzentration oder wenn sie dominiert, kann ein Erdnussgeruch einen Kaffee jedoch negativ überlagern. In gehobenen wie kommerziellen Robustas ist Erdnuss ein verbreiteter Duft und Geschmack. Kombiniert mit Schokolade- und würzigen Noten kann Erdnuss unauffällig, grundlegend oder Teil des allgemeinen Kaffeearomas sein, das in den Hintergrund einer Beschreibung tritt. Wird dagegen von einem Kaffee erwartet, einen gewaschenen Milds- oder gewaschenen Verarbeitungsstil zu verkörpern, kann Erdnuss diesem Profil eher abträglich sein. Es gibt eine ganze Reihe komplexer, ineinandergreifender Faktoren, die einen Kaffee nach Erdnuss riechen lassen können — Genetik, Fruchtreife, Verarbeitung, Alter des grünen Kaffees, Röstentwicklung und Nachröst-Alterung. Traditionelle brasilianische Kaffees, besonders Pulped Naturals (Honeys), sind für eine süße Erdnuss-Eigenschaft bekannt, abhängig vom Anteil der auf dem Pergament verbliebenen Mucilage sowie vom Röstprofil.',
        ],
      },
      {
        titel: 'Röstung',
        text: [
          'Das Rösten selbst erzeugt viele chemische Verbindungen, die denen in gerösteten Erdnüssen ähneln. Kaffee enthält Pyrazin, Pyrrol, Oxazol und Thiazol, die alle als geröstete Erdnuss-artige Aromen identifiziert wurden. Pyrazine sind typischerweise in geringer Konzentration erwünscht, werden bei hoher Konzentration aber zunehmend bitter. Ein Erdnuss-Aroma im Kaffee ist oft ein Symptom unzureichender Röstentwicklung. Eine unterentwickelte Röstung lässt sich leicht an einem kräftigen Erdnussgeruch erkennen. Besonders bei gewaschenen Kaffees, bei denen man andere aromatische Noten dominieren erwartet, wird das als qualitätsmindernd wahrgenommen. Ähnlich verhält es sich, wenn Nachröst-Alterung einen Kaffee beeinträchtigt: Lipide oxidieren und erzeugen einige derselben Pappe- und Fisch-artigen Fehlaromen, die auch bei Erdnüssen auftreten.',
        ],
      },
    ],
    verwandte: [
      { nummer: 54, original: 'Walnuss' },
      { nummer: 52, original: 'Haselnuss' },
      { nummer: 53, original: 'Mandel' },
      { nummer: 59, original: 'Karamellisiert' },
      { nummer: 45, original: 'Malz' },
    ],
  },

  {
    nummer: 52,
    name: 'Haselnuss',
    nameOriginal: 'Hazelnut',
    kategorieId: 'nussig-kakao',
    kategorieLabel: 'Nussig / Kakao',
    beschreibung: [
      'Der Duft von Haselnüssen lässt sich als reich, nussig, erdig, süß, fruchtig und zart beschreiben. Haselnüsse bewegen sich wegen ihrer fettigen, buttrigen Beschaffenheit oft zwischen süß und herzhaft.',
      'Sie können auch etwas holzig oder sogar scharf und bitter wirken. Sie passen gut zu bitteren Gemüsesorten wie Kohl, Lauch und Endivie. Haselnüsse haben eine lange gemeinsame Geschichte mit Schokolade in Keksen, Kuchen, Torten und Süßigkeiten. Der Duft gerösteter Haselnüsse kann an einen Weihnachtsmarkt erinnern, an eine reichhaltige Torte oder an einen köstlichen Schokoladenaufstrich.',
    ],
    abschnitte: [
      {
        titel: 'Taxonomie',
        text: ['Die Nuss des Baums Corylus, mit den Arten avellana, colurna, maxima und americana.'],
      },
      {
        titel: 'Die Pflanze',
        text: [
          'Diese Gattung gehört zur Familie der Birkengewächse (Betulaceae), die essbare Nüsse hervorbringt. In Europa werden sie auch Lambertsnüsse oder Zellernüsse genannt. Ein kleiner, sommergrüner Baum mit weichem Holz, dessen Blätter behaart und gesägt sind. In der Natur wächst er als vielstämmiger Strauch, im kommerziellen Anbau dagegen als einstämmiger Baum bis zu 6 Meter Höhe. Der Baum bildet sowohl männliche Kätzchen als auch weibliche Blüten und trägt eine rundliche Nuss von etwa 1 bis 4 Zentimetern Durchmesser.',
        ],
      },
      {
        titel: 'Herstellung',
        text: [
          'Haselnüsse werden meist mechanisch vom Baum oder vom Boden geerntet, bevor sie enthülst werden. Nach dem Enthülsen werden die Nüsse, noch in ihrer Schale, üblicherweise getrocknet und desinfiziert, um sie lagerfähig zu machen. Das Trocknen geschieht in der Sonne oder maschinell bei 30 bis 40 °C. Danach werden sie nach Größe sortiert und ganz mit Schale verkauft. Um die Schalen kommerziell zu entfernen, müssen sie geknackt oder zerkleinert werden, um die essbaren Kerne freizulegen. Anschließend werden die Nüsse geröstet, in speziellen Röhrenöfen mit Drehbewegung. Beim Rösten werden die Nüsse üblicherweise unter Luftstrom auf 100 bis 160 °C erhitzt, für 10 bis 60 Minuten. Der Hauptzweck des Röstens ist es, Geschmack, Farbe, Knusprigkeit und die knackige Textur des Produkts zu verbessern.',
        ],
      },
      {
        titel: 'Chemie',
        text: [
          'In Haselnüssen stecken viele flüchtige Aromaverbindungen, doch nur ein ausgewählter Kern davon baut den charakteristischen Haselnussduft auf. Weil rohe Haselnüsse geschmacklich eher fad sind, gilt das Rösten allgemein als der Haupttreiber für Geschmack und Aroma der Nuss. Rösten erhöht nachweislich die Menge an Pyrazinen, Pyrrolen, Terpenen, Aldehyden und Ketonen in Haselnüssen. Unter den Ketonen sticht eine Verbindung namens 5-Methyl-(E)-2-hepten-4-on hervor, auch als Filberton bekannt, die mit dem Rösten zunimmt. Filberton — der Name kommt vom englischen „filbert“ für Haselnuss — trägt den charakteristischen Duft gerösteter Haselnüsse bei.',
        ],
      },
    ],
    imKaffee: [
      {
        titel: '',
        text: [
          'Das WCR Sensory Lexicon beschreibt Haselnuss als „eine holzige, braune, süße, muffig-erdige, leicht zederartige Note, die blumige, bohnige, ölige, adstringierende und bittere Geschmacksnoten enthalten kann“. Im Kaffee gehört Haselnuss zu den eher fruchtigen, blumigen, muffigen Nüssen, die als positive Eigenschaft auftreten. Sie ist vielleicht die zarteste und blumigste unter den Nüssen. Man findet sie in blumigen Kaffees aus aller Welt, besonders aus Äthiopien, Panama und Mittelamerika.',
        ],
      },
      {
        titel: 'Pflanze und Nachernte-Verarbeitung',
        text: [
          'Haselnuss scheint bis zu einem gewissen Grad von wilder (Heirloom-)Kaffeegenetik beeinflusst zu sein. Das erklärt, warum äthiopische und von Gesha abstammende Kaffees aus Panama für diese Qualität bekannt sind. Andere Kaffees können durch ein komplexes Zusammenspiel von Genetik und Umwelt beeinflusst sein, zusammen mit der Verarbeitung. Unter den mittelamerikanischen Kaffees werden solche aus Costa Rica und Guatemala häufig mit Haselnuss-Eigenschaften beschrieben. Diese traditionell gewaschenen Kaffees sind weniger fruchtig als andere Verarbeitungsmethoden und lassen süßere, kräftigere Schokoladen- und Nussaromen hervortreten. In anderen Teilen der Welt findet sich Haselnuss auch in manchen erdigen, muffigen, von braunen Gewürzen geprägten Kaffees aus Indonesien. Letztlich ist die Präsenz von Haselnuss, weil nussige Eigenschaften in vielen Kaffees allgegenwärtig sind, eine Frage der Balance der Eigenschaften in jedem einzelnen Kaffee.',
        ],
      },
      {
        titel: 'Röstung',
        text: [
          'Das Rösten ermöglicht und erzeugt einen Großteil der nussigen Grundnote in jedem Kaffee. Das Rösten selbst erzeugt viele chemische Verbindungen, die denen in gerösteten Haselnüssen ähneln. Kaffee enthält Pyrazin, Pyrrol, Oxazol, Pyridin und Thiazol, die alle als geröstete Aromen identifiziert wurden. Besonders Pyrazine wurden dafür identifiziert, dem Kaffee eine Haselnuss-Note zu verleihen. Bestimmte aromatische Kohlenwasserstoffe im Kaffee, etwa Benzole, können sich als muffig-nussiges Aroma ähnlich Haselnuss zeigen. Pyrazine sind typischerweise in geringer Konzentration erwünscht, werden aber bei hoher Konzentration zunehmend bitter. Wie bei Haselnüssen bringt eine zu weit getriebene Röstung mehr bittere, holzige Charakterzüge hervor.',
        ],
      },
    ],
    verwandte: [
      { nummer: 53, original: 'Mandel' },
      { nummer: 51, original: 'Erdnuss' },
      { nummer: 54, original: 'Walnuss' },
      { nummer: 43, original: 'Butter' },
      { nummer: 56, original: 'Schokolade' },
      { nummer: 55, original: 'Zartbitterschokolade' },
      { nummer: 31, original: 'Zeder' },
    ],
  },

  {
    nummer: 53,
    name: 'Mandel',
    nameOriginal: 'Almond',
    kategorieId: 'nussig-kakao',
    kategorieLabel: 'Nussig / Kakao',
    beschreibung: [
      'Mandeln haben eines der fruchtigeren Nussaromen.',
      'Ihr Aroma riecht nach Frucht, Zartbitterschokolade, Kirsche und Toast; geröstet wird es nussig, holzig, sogar erdig. Mandeln werden weltweit roh oder geröstet als Snack genossen. Der Duft kann an Marzipan, Kirschen, Obsttörtchen oder Kuchen erinnern.',
    ],
    abschnitte: [
      {
        titel: 'Taxonomie',
        text: ['Nüsse des Baums Prunus amygdalus (oder P. dulcis).'],
      },
      {
        titel: 'Die Pflanze',
        text: [
          'Dieser Laubbaum wird bis zu 4,5 Meter hoch. Er ist heimisch in Armenien, sein bevorzugtes Klima ist mediterran, mit kühlem Winter. Im Frühling blühen weiße oder rosa, duftende Blüten. Sie müssen von Insekten fremdbestäubt werden, im kommerziellen Anbau werden dafür Bienen eingesetzt. Daraus entstehen Früchte (Steinfrüchte), ähnlich wie bei anderen Prunus-Arten, etwa der Pflaume. Zwar bildet der Baum keine echte Nuss, doch im Inneren, in der Fruchtwand des Samens, sitzt ein Samen, der umgangssprachlich als Nuss bekannt ist. Ist die Frucht reif, spaltet sich die Hülle von der Schale, bevor diese vom Baum fällt.',
        ],
      },
      {
        titel: 'Herstellung',
        text: [
          'Nach der Ernte werden Mandeln zunächst von Verunreinigungen befreit, bevor sie enthülst werden, um die schützende Fruchtwand zu entfernen. Anschließend durchlaufen sie eine Reihe von Scherwalzen, um die Schalen zu entfernen. Die Kerne (Mandeln) werden dann auf Dichtetischen und mit Schwerkraft-Sortierern getrennt. An diesem Punkt sind die Mandeln entweder verkaufsfertig oder bereit für die Röstung. Eine Trockenröstung nutzt typischerweise Temperaturen von 130 bis 150 °C, manche Mandeln werden aber auch in Öl geröstet. Eine Luftröstung bei niedriger bis mittlerer Temperatur von 130 bis 145 °C hilft, die Mikrostruktur der Mandel zu erhalten und die Haltbarkeit des Produkts zu maximieren. Bei niedrigeren Rösttemperaturen sind längere Zeiten nötig, bei höheren kürzere.',
        ],
      },
      {
        titel: 'Chemie',
        text: [
          'Beim Rösten entwickelt sich das Mandelaroma durch Lipidoxidation, Zuckerpyrolyse und Maillard-Reaktionen. Diese erzeugen malzige, geröstete, schokoladige, nussige Geschmacksnoten, während sich Pyrazine, Furane, Alkohole, Pyrrole, Ketone, Aldehyde und aromatische Kohlenwasserstoffe bilden. Pyrazine entstehen während der Maillard-Reaktion. Pyrazine, verzweigte Aldehyde und Ketone bilden sich bei diesen Bräunungsreaktionen. Furanhaltige Verbindungen, die aus dem Abbau von Zuckern entstehen, sowie Alkohole und Aldehyde, die sich durch Lipidoxidation bilden, tragen ebenfalls bei. Dazu zählt Benzaldehyd, einer der bemerkenswertesten und stärksten Beiträge zum Mandelaroma. Bei sehr intensiver Röstung nimmt die Benzaldehyd-Intensität jedoch ab.',
        ],
      },
    ],
    imKaffee: [
      {
        titel: '',
        text: [
          'Das WCR Sensory Lexicon beschreibt die Mandel-Eigenschaft als „eine süße, hellbraune, holzige und buttrige Note mit blumigen und fruchtigen Zügen, die Rose, Kirsche und Aprikose einschließen können. Sie ist außerdem adstringierend und kann leicht rauchig sein“. In Kaffees mit fruchtigen Kirschnoten wird eine Nussigkeit vermutlich als Mandel wahrgenommen, einfach wegen der Ähnlichkeit der Aromachemie zwischen beiden. So können viele Kaffees mit Steinobstnoten an Mandel denken lassen.',
        ],
      },
      {
        titel: 'Röstung',
        text: [
          'Der Röstprozess ermöglicht und erzeugt einen Großteil der nussigen Grundnote in jedem Kaffee. Das Rösten selbst erzeugt viele chemische Verbindungen, die denen in gerösteten Mandeln ähneln. Kaffee enthält Pyrazin, Pyrrol, Oxazol, Pyridin und Thiazol, die alle als geröstete Aromen identifiziert wurden. Bestimmte aromatische Aldehyde im Kaffee, darunter Benzaldehyd, können als fruchtig-nussiges, an Mandel erinnerndes Aroma auftreten. Besonders dunklere Röstungen erzeugen zusammen mit einem fruchtigen Kaffee wahrscheinlich Mandelaromen.',
        ],
      },
    ],
    verwandte: [
      { nummer: 52, original: 'Haselnuss' },
      { nummer: 54, original: 'Walnuss' },
      { nummer: 56, original: 'Schokolade' },
      { nummer: 45, original: 'Malz' },
      { nummer: 57, original: 'Brauner Zucker' },
      { nummer: 11, original: 'Kirsche' },
      { nummer: 3, original: 'Rose' },
    ],
  },

  {
    nummer: 54,
    name: 'Walnuss',
    nameOriginal: 'Walnut',
    kategorieId: 'nussig-kakao',
    kategorieLabel: 'Nussig / Kakao',
    beschreibung: [
      'Der Duft der Walnuss ist muffig, nussig, süß, erdig, blumig, manchmal harzig wie Kiefer oder mit einer scharfen Adstringenz.',
      'Walnüsse werden eingelegt, in Honig eingeweicht oder in Gebäck wie Baklava gebacken, ebenso als texturgebende Note zu vielen herzhaften Gerichten gegeben, darunter Fleisch und Gemüse. Die Walnuss spielt eine große Rolle in der Küche des Kaukasus, wo sie traditionell in Eintöpfe, Fleischgerichte, Saucen und Desserts eingearbeitet wird.',
    ],
    abschnitte: [
      {
        titel: 'Taxonomie',
        text: [
          'Nüsse des Baums Juglans regia, bekannt als Echte Walnuss oder Persische Walnuss. Andere Arten werden zwar angebaut, aber meist nicht kommerziell produziert.',
        ],
      },
      {
        titel: 'Die Pflanze',
        text: [
          'Dieser langlebige Laubbaum treibt spät aus und belaubt sich auf der Nordhalbkugel typischerweise erst spät im Frühling. Der Baum braucht lange, bis er ausgereift ist — die ersten Früchte entstehen frühestens mit 15 Jahren. Die Frucht ist eine sogenannte Scheinfrucht: Sie entwickelt sich nicht nur aus dem Fruchtknoten, sondern auch aus anderen Teilen der Blüte. Die Frucht hat eine grüne, steinfruchtartige Hülle, und darin die Fruchtwand beziehungsweise Schale, die den Samen umschließt, der als Nuss gegessen wird. Die Schale hat meist zwei oder drei Segmente. Der Samen ist von einer Samenhaut umgeben und wird als Kern bezeichnet.',
        ],
      },
      {
        titel: 'Geschichte',
        text: [
          'Um die Walnuss ranken sich viele Geschichten — man geht davon aus, dass sie die älteste vom Menschen kultivierte Baumnuss ist; sie trat vermutlich erstmals in der Jungsteinzeit auf, vor 4.000 bis 6.000 Jahren. Die Verbreitung der Walnuss in Europa ist das Ergebnis menschlicher Ausbreitung in den 5.000 Jahren nach dem letzten Kälte-Maximum der Eiszeit. Griechen und Römer verbreiteten den Baum schließlich über ganz Europa, und von dort gelangte die Walnuss durch Handel und Kolonisierung in die ganze Welt. Bis Mitte des 19. Jahrhunderts wurde die Walnuss bereits im Central Valley in Kalifornien angebaut.',
        ],
      },
      {
        titel: 'Herstellung',
        text: [
          'Kommerziell werden sowohl geschälte als auch ungeschälte Walnüsse verkauft. Nach dem Schälen lassen sich Walnüsse roh oder geröstet essen. Wie bei anderen Nüssen verbessert das Rösten Aroma, Geschmack und Textur der Walnuss, und Konsumenten schätzen dieses intuitive Qualitätsmaß. Geröstet wird meist mit heißer Luft.',
        ],
      },
      {
        titel: 'Chemie',
        text: [
          'Das charakteristische Aroma frischer Walnüsse wird durch eine Mischung aus 3-Hydroxy-4,5-dimethyl-2(5H)-furanon (Sotolon) und (2E,4E,6Z)-Nona-2,4,6-trienal geprägt. Nach dem Rösten enthalten Walnüsse typischerweise eine Mischung aus Aldehyden, Ketonen, Alkoholen, Pyrazinen und Furanen sowie Säuren. Aldehyde wie Hexanal, Heptanal und Octanal entstehen vor allem durch Lipidoxidation. Alkohole bilden sich beim Abbau dieser Aldehyde und tragen grüne Noten bei. Ketone entstehen beim Abbau von Zuckern während der Röstung, und Furane sowie Pyrazine entstehen ebenfalls beim Rösten und sind die Hauptquelle des Walnussaromas. Die Verbindung 2-Ethyl-5-methylpyrazin wurde als besonders wirksame Verbindung in Walnüssen identifiziert.',
        ],
      },
    ],
    imKaffee: [
      {
        titel: '',
        text: [
          'Diese Note ist im Kaffee scharf, auffällig und etwas ungewöhnlich. Der erdig-nussige Geruch geht meist mit einem trockenen Mundgefühl einher und ist deshalb ein retronasaler Geruch — man nimmt ihn eher beim Schlucken über den Rachen wahr als direkt über die Nase. Die Adstringenz mancher Kaffees kann den bitteren Tanninen der Walnuss-Samenhaut ähneln. Diese Eigenschaft wirkt normalerweise nicht überwältigend, kann aber zusammen mit starker Bitterkeit zu einer unangenehmen Kombination führen. Gut ausbalanciert mit erdigen, schokoladigen oder krautigen Noten kann Walnuss einen Kaffee in einer feinen Nussigkeit verankern, die weltweit geschätzt wird. Walnuss findet sich vor allem in Kaffees aus Indonesien und benachbarten Anbaugebieten, in feinen Robustas und in zarten mittelamerikanischen Kaffees.',
        ],
      },
      {
        titel: 'Röstung',
        text: [
          'Chemisch erzeugt der Röstprozess bei Walnüssen und Kaffee ähnliche Aromen. Furane und Pyrazine machen einen erheblichen Teil des Röstaromas von Kaffee aus und ebenso die geröstete Nussigkeit der Walnuss. Tatsächlich wurde das kennzeichnende Walnuss-Lacton Sotolon auch im Kaffee nachgewiesen, als Produkt der Maillard-Reaktionen — dort kann es einen süßen, karamellisierten, bockshornkleeartigen oder sogar an Ahorn erinnernden Duft verleihen.',
        ],
      },
    ],
    verwandte: [
      { nummer: 52, original: 'Haselnuss' },
      { nummer: 45, original: 'Malz' },
      { nummer: 43, original: 'Butter' },
      { nummer: 60, original: 'Vanille' },
      { nummer: 34, original: 'Holzig' },
      { nummer: 30, original: 'Kiefer' },
      { nummer: 31, original: 'Zeder' },
    ],
  },

  {
    nummer: 55,
    name: 'Zartbitterschokolade',
    nameOriginal: 'Dark Chocolate',
    kategorieId: 'nussig-kakao',
    kategorieLabel: 'Nussig / Kakao',
    beschreibung: [
      'Verglichen mit gewöhnlicher Schokolade oder Milchschokolade ist Zartbitterschokolade intensiver, mit einem angenehm bitteren, gerösteten Aroma. Hochwertige Zartbitterschokolade kann blumige, zitrische und tabakartige Noten zeigen.',
      'Schokolade ist, ähnlich wie Weinig, eine Eigenschaft, die eine ganze eigene Welt umfasst. Zartbitterschokolade enthält bis zu 80 Prozent Kakaomasse, der Rest ist meist Kakaobutter. Die meisten gesundheitlichen Vorzüge, die Schokolade zugeschrieben werden, hängen mit dem Verzehr der dunklen Sorte zusammen.',
    ],
    abschnitte: [
      {
        titel: 'Taxonomie',
        text: [
          'Die Süßware aus dem Samen von Theobroma cacao, dem Kakaobaum. Der lateinische Name Theobroma bedeutet „Speise der Götter“.',
        ],
      },
      {
        titel: 'Die Pflanze',
        text: [
          'Kakao ist ein immergrüner Baum, heimisch im Amazonas-Regenwald. Blüten und Früchte des Baums wachsen direkt aus Stamm und älteren Ästen — ein ungewöhnliches botanisches Phänomen namens Kauliflorie. Ein einzelner Baum kann im Jahr bis zu 250.000 Blüten bilden. Die winzigen, zarten weißen Blüten halten nur einen einzigen Tag. In ihrer natürlichen Umgebung müssen sie von Gnitzen bestäubt werden, winzigen Mücken, die Pollen zwischen den Blüten übertragen. Im Anbau werden die Blüten von Hand bestäubt, mit Pinzetten. Die Frucht, Kakaoschote genannt, ist 15 bis 30 Zentimeter lang und reift zu einer orangen Farbe. Die Schote enthält meist 20 bis 60 Samen, eingebettet in weißes Fruchtfleisch. Der Samen ist oval und abgeflacht, etwa 2 Zentimeter lang und 1 Zentimeter breit.',
        ],
      },
      {
        titel: 'Geschichte',
        text: [
          'Der Kakaobaum wurde erstmals vor mehr als 5.000 Jahren für seinen Samen kultiviert, in der Gegend des heutigen Ecuador. Frühe mesoamerikanische Kulturen — Olmeken, Azteken und Maya — schmolzen Kakao zu einem bitteren Getränk ein. Die Schoten und ihre Produkte waren wirtschaftlich und politisch bedeutsam, der Samen ein zentrales Handelsgut und diente auch als Zahlungsmittel. Für diese Kulturen spielte Schokolade eine herausragende Rolle bei Ritualen, Festen und dem Konsum der Elite. Es gibt keine Belege für süße, heiße Schokoladengetränke, bevor mexikanische Nonnen in Oaxaca im 16. Jahrhundert davon berichteten, sie zu trinken.',
          'Als die Spanier im 16. Jahrhundert auf die Azteken trafen und sie eroberten, brachten sie auch die Schokolade auf den europäischen Kontinent. Irgendwann danach fügten Entdecker und Händler dem Getränk Zucker und Zimt hinzu, was seine Beliebtheit steigerte. Die Nachfrage in Europa explodierte, und die Spanier versklavten bis ins späte 19. Jahrhundert Menschen, um Kakao zu produzieren. Wegen ihrer frühen Kolonisierung Amerikas hielt Spanien über viele Jahre ein Monopol auf Schokolade. Nur der wohlhabendste, elitärste spanische Adel konnte sich diesen teuren Import leisten. Andere Kolonialmächte — die Briten, Niederländer und Franzosen — begannen, in den von ihnen gehaltenen Ländern eigene Kakaoplantagen anzulegen, um ihren eigenen Bedarf zu decken. Im späten 17. Jahrhundert wurde es beliebter, Milch zur Schokolade zuzugeben. Mitte des 18. Jahrhunderts, mit dem Aufkommen der Industriellen Revolution, entwickelte die Schokoladenindustrie zahlreiche Erfindungen, um Schokolade schneller und mit weniger Handarbeit herzustellen. Die Fähigkeit, Schokolade in großen Mengen herzustellen, erlaubte es der breiten Bevölkerung, diese Köstlichkeit zu genießen.',
        ],
      },
      {
        titel: 'Herstellung',
        text: ['Siehe Schokolade (Nr. 56).'],
      },
      {
        titel: 'Chemie',
        text: [
          'Das typische Schokoladenaroma hängt von einem hohen Anteil an Kakaopulver ab. Zartbitterschokolade und Kakaopulver enthalten mehrere hundert flüchtige Bestandteile, darunter Pyrazine, Thiazole, Oxazole, Pyrrol-Derivate, Pyridine, Aldehyde und Furane. In einer Studie zu Zartbitterschokolade wurden 2-Methoxyphenol, 3-Methylbuttersäure, Vanillin und Linalool als die Verbindungen mit dem größten Einfluss auf ein positives Aroma identifiziert.',
        ],
      },
    ],
    imKaffee: [
      {
        titel: '',
        text: [
          'Das WCR Sensory Lexicon beschreibt Zartbitterschokolade als „eine hochintensive Mischung aus Kakao und Kakaobutter, die dunkel-röstige, würzige, verbrannte und muffige Noten mit erhöhter Adstringenz und Bitterkeit enthalten kann“.',
        ],
      },
      {
        titel: 'Nachernte-Verarbeitung und Röstung',
        text: [
          'Ein Zartbitterschokoladen-Aroma im Kaffee wäre ein durchdringender, bitterer Geruch, ähnlich bitterer Backschokolade oder feinem Konfekt. Wegen des Koffeins und der natürlichen Bitterkeit im Kaffee wird ein Schokoladenduft eher mit der dunkleren Sorte assoziiert. Grundsätzlich kann jeder Kaffee, jede Verarbeitung und jede Röstung Schokoladennoten zeigen, doch am ehesten begegnet man ihnen in hochintensiven Kaffees. Manche davon sind intensiv fruchtige Kaffees, etwa natural aufbereitete. Andere sind intensiv geröstete Kaffees, mit mehr Pyrazinen und bitter-röstigen Noten, die eher als Zartbitterschokolade auftreten. Arabicas aus Mittelamerika werden häufig mit diesen Aromen assoziiert. Auch feine Robustas können Schokoladennoten zeigen.',
        ],
      },
    ],
    verwandte: [
      { nummer: 56, original: 'Schokolade' },
      { nummer: 59, original: 'Karamellisiert' },
      { nummer: 10, original: 'Backpflaume' },
      { nummer: 41, original: 'Tabak' },
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
