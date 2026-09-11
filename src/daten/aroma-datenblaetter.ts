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
