/**
 * Die zwei Aromen-Sets — K55, "Die Verkostung" in docs/konzept.md. Beide
 * leben in denselben neun SCA-Kategorien, mit zwei Beschriftungen statt
 * eines Rueckgrat-Konstrukts.
 *
 * AROMASET_SCA traegt echten, dokumentierten Bestand — die neun Kategorien
 * und ihre Untergruppen des SCA/WCR Coffee Taster's Flavor Wheel, ins
 * Deutsche uebertragen. Die deutsche Uebertragung ist eine grobe erste
 * Fassung und gehoert einmal gegen ein Referenzposter geprueft (wie
 * CLAUDE.md es fuer die Milliliter-Angaben der Getraenke schon vormerkt) —
 * an der Kategoriestruktur selbst aendert eine Pruefung nichts.
 *
 * AROMASET_LENEZ ist ausdruecklich PLATZHALTER (Rueckfrage 2026-08-26): die
 * 60 echten Fläschchennummern und ihre Zuordnung kommen erst vom Karton
 * (siehe CLAUDE.md "Offen — noch nicht geliefert"). Jedes Blatt-Aroma
 * traegt "(Platzhalter)" im Label selbst — nicht nur als Meta-Zeile
 * daneben —, damit auch ein Screenshot oder ein Bericht ausserhalb der App
 * nicht mit echten Daten verwechselt werden kann. Sobald die echte Liste
 * vorliegt, ersetzt sie ausschliesslich den Inhalt dieser einen Konstante;
 * bestehende Uebungsmodus-Datensaetze (daten/schema/uebung.ts) werden dabei
 * sinnlos und sollten von Hand geloescht werden (Einstellungen > Backup),
 * weil sich die Nummer-zu-Aroma-Zuordnung mit dem Austausch aendert.
 */
import type { Aromaset } from './schema';

export const AROMASET_SCA: Aromaset = {
  id: 'aromaset-sca',
  name: 'SCA Flavor Wheel',
  quelle: 'SCA / World Coffee Research Sensory Lexicon (deutsche Übertragung, ungeprüft)',
  vialNummern: false,
  platzhalter: false,
  kategorien: [
    {
      id: 'fruchtig',
      label: 'Fruchtig',
      gruppen: [
        {
          id: 'beere',
          label: 'Beere',
          aromen: [
            { id: 'brombeere', label: 'Brombeere' },
            { id: 'himbeere', label: 'Himbeere' },
            { id: 'blaubeere', label: 'Blaubeere' },
            { id: 'erdbeere', label: 'Erdbeere' },
          ],
        },
        {
          id: 'trockenfrucht',
          label: 'Trockenfrucht',
          aromen: [
            { id: 'rosine', label: 'Rosine' },
            { id: 'backpflaume', label: 'Backpflaume' },
          ],
        },
        {
          id: 'sonstige-frucht',
          label: 'Sonstige Frucht',
          aromen: [
            { id: 'kokosnuss', label: 'Kokosnuss' },
            { id: 'kirsche', label: 'Kirsche' },
            { id: 'ananas', label: 'Ananas' },
            { id: 'traube', label: 'Traube' },
            { id: 'apfel', label: 'Apfel' },
            { id: 'pfirsich', label: 'Pfirsich' },
            { id: 'birne', label: 'Birne' },
          ],
        },
        {
          id: 'zitrusfrucht',
          label: 'Zitrusfrucht',
          aromen: [
            { id: 'grapefruit', label: 'Grapefruit' },
            { id: 'orange', label: 'Orange' },
            { id: 'zitrone', label: 'Zitrone' },
            { id: 'limette', label: 'Limette' },
          ],
        },
      ],
    },
    {
      id: 'sauer-fermentiert',
      label: 'Sauer / Fermentiert',
      gruppen: [
        {
          id: 'sauer',
          label: 'Sauer',
          aromen: [
            { id: 'saeuerlich-aromatisch', label: 'säuerlich-aromatisch' },
            { id: 'essigsaeure', label: 'Essigsäure' },
            { id: 'zitronensaeure', label: 'Zitronensäure' },
            { id: 'apfelsaeure', label: 'Apfelsäure' },
          ],
        },
        {
          id: 'alkohol-fermentiert',
          label: 'Alkoholisch / Fermentiert',
          aromen: [
            { id: 'weinig', label: 'weinig' },
            { id: 'whiskey', label: 'Whiskey' },
            { id: 'fermentiert', label: 'fermentiert' },
            { id: 'ueberreif', label: 'überreif' },
          ],
        },
      ],
    },
    {
      id: 'gruen-pflanzlich',
      label: 'Grün / Pflanzlich',
      gruppen: [
        {
          id: 'gruen-pflanzlich-gruppe',
          label: 'Grün / Pflanzlich',
          aromen: [
            { id: 'unreif', label: 'unreif' },
            { id: 'erbsenschote', label: 'Erbsenschote' },
            { id: 'frisch', label: 'frisch' },
            { id: 'dunkelgruen', label: 'dunkelgrün' },
            { id: 'heuartig', label: 'heuartig' },
            { id: 'krautig', label: 'krautig' },
          ],
        },
        {
          id: 'sonstiges-gruen',
          label: 'Sonstiges',
          aromen: [
            { id: 'olivenoel', label: 'Olivenöl' },
            { id: 'roh', label: 'roh' },
            { id: 'bohnig', label: 'bohnig' },
          ],
        },
      ],
    },
    {
      id: 'sonstiges',
      label: 'Sonstiges',
      gruppen: [
        {
          id: 'papierig-muffig',
          label: 'Papierig / Muffig',
          aromen: [
            { id: 'altbacken', label: 'altbacken' },
            { id: 'pappe', label: 'Pappe' },
            { id: 'papierig', label: 'papierig' },
            { id: 'holzig', label: 'holzig' },
            { id: 'schimmelig', label: 'schimmelig' },
            { id: 'staubig-muffig', label: 'staubig-muffig' },
            { id: 'erdig-muffig', label: 'erdig-muffig' },
            { id: 'tierisch', label: 'tierisch' },
            { id: 'phenolisch', label: 'phenolisch' },
          ],
        },
        {
          id: 'chemisch',
          label: 'Chemisch',
          aromen: [
            { id: 'bitter', label: 'bitter' },
            { id: 'salzig', label: 'salzig' },
            { id: 'medizinisch', label: 'medizinisch' },
            { id: 'petroleum', label: 'Petroleum' },
            { id: 'gummi', label: 'Gummi' },
          ],
        },
      ],
    },
    {
      id: 'roestig',
      label: 'Röstig',
      gruppen: [
        {
          id: 'tabak',
          label: 'Tabak',
          aromen: [
            { id: 'pfeifentabak', label: 'Pfeifentabak' },
            { id: 'tabak', label: 'Tabak' },
          ],
        },
        {
          id: 'verbrannt',
          label: 'Verbrannt',
          aromen: [
            { id: 'beissend', label: 'beißend' },
            { id: 'aschig', label: 'aschig' },
            { id: 'rauchig', label: 'rauchig' },
            { id: 'dunkel-geroestet', label: 'dunkel geröstet' },
          ],
        },
        {
          id: 'getreide',
          label: 'Getreide',
          aromen: [
            { id: 'getreidig', label: 'getreidig' },
            { id: 'malzig', label: 'malzig' },
          ],
        },
      ],
    },
    {
      id: 'gewuerze',
      label: 'Gewürze',
      gruppen: [
        {
          id: 'scharf',
          label: 'Scharf',
          aromen: [{ id: 'scharf-wuerzig', label: 'scharf-würzig' }, { id: 'pfeffer', label: 'Pfeffer' }],
        },
        {
          id: 'braune-gewuerze',
          label: 'Braune Gewürze',
          aromen: [
            { id: 'anis', label: 'Anis' },
            { id: 'muskat', label: 'Muskat' },
            { id: 'zimt', label: 'Zimt' },
            { id: 'nelke', label: 'Nelke' },
          ],
        },
      ],
    },
    {
      id: 'nussig-kakao',
      label: 'Nussig / Kakao',
      gruppen: [
        {
          id: 'nussig',
          label: 'Nussig',
          aromen: [
            { id: 'erdnuss', label: 'Erdnuss' },
            { id: 'haselnuss', label: 'Haselnuss' },
            { id: 'mandel', label: 'Mandel' },
          ],
        },
        {
          id: 'kakao',
          label: 'Kakao',
          aromen: [
            { id: 'schokolade', label: 'Schokolade' },
            { id: 'zartbitterschokolade', label: 'Zartbitterschokolade' },
          ],
        },
      ],
    },
    {
      id: 'suess',
      label: 'Süß',
      gruppen: [
        {
          id: 'brauner-zucker',
          label: 'Brauner Zucker',
          aromen: [
            { id: 'melasse', label: 'Melasse' },
            { id: 'ahornsirup', label: 'Ahornsirup' },
            { id: 'karamellisiert', label: 'karamellisiert' },
            { id: 'honig', label: 'Honig' },
          ],
        },
        {
          id: 'vanille',
          label: 'Vanille',
          aromen: [{ id: 'vanille', label: 'Vanille' }, { id: 'vanillin', label: 'Vanillin' }],
        },
        {
          id: 'suesse-allgemein',
          label: 'Süße allgemein',
          aromen: [{ id: 'suess-allgemein', label: 'süß allgemein' }, { id: 'suess-aromatisch', label: 'süß-aromatisch' }],
        },
      ],
    },
    {
      id: 'blumig',
      label: 'Blumig',
      gruppen: [
        {
          id: 'blumig-gruppe',
          label: 'Blumig',
          aromen: [
            { id: 'kamille', label: 'Kamille' },
            { id: 'rose', label: 'Rose' },
            { id: 'jasmin', label: 'Jasmin' },
          ],
        },
        {
          id: 'schwarztee',
          label: 'Schwarztee',
          aromen: [{ id: 'schwarzer-tee', label: 'schwarzer Tee' }],
        },
      ],
    },
  ],
};

/** Sieben Fläschchen je Kategorie, letzte drei Kategorien mit sechs — Summe 60. */
const LENEZ_VERTEILUNG: readonly { kategorieId: string; kategorieLabel: string; anzahl: number }[] = [
  { kategorieId: 'fruchtig', kategorieLabel: 'Fruchtig', anzahl: 7 },
  { kategorieId: 'sauer-fermentiert', kategorieLabel: 'Sauer / Fermentiert', anzahl: 7 },
  { kategorieId: 'gruen-pflanzlich', kategorieLabel: 'Grün / Pflanzlich', anzahl: 6 },
  { kategorieId: 'sonstiges', kategorieLabel: 'Sonstiges', anzahl: 6 },
  { kategorieId: 'roestig', kategorieLabel: 'Röstig', anzahl: 7 },
  { kategorieId: 'gewuerze', kategorieLabel: 'Gewürze', anzahl: 6 },
  { kategorieId: 'nussig-kakao', kategorieLabel: 'Nussig / Kakao', anzahl: 7 },
  { kategorieId: 'suess', kategorieLabel: 'Süß', anzahl: 7 },
  { kategorieId: 'blumig', kategorieLabel: 'Blumig', anzahl: 7 },
];

let naechsteNummer = 1;
const LENEZ_KATEGORIEN: Aromaset['kategorien'] = LENEZ_VERTEILUNG.map(({ kategorieId, kategorieLabel, anzahl }) => ({
  id: kategorieId,
  label: kategorieLabel,
  gruppen: [
    {
      id: `${kategorieId}-flaeschchen`,
      label: 'Fläschchen',
      aromen: Array.from({ length: anzahl }, () => {
        const nummer = naechsteNummer++;
        return { id: `flaeschchen-${nummer}`, label: `Nr. ${nummer} (Platzhalter)`, nummer };
      }),
    },
  ],
}));

export const AROMASET_LENEZ: Aromaset = {
  id: 'aromaset-lenez',
  name: 'Le Nez du Café',
  quelle: 'Platzhalter — echte Fläschchenliste steht noch aus, wird nachgereicht',
  vialNummern: true,
  platzhalter: true,
  kategorien: LENEZ_KATEGORIEN,
};

export const AROMASETS: readonly Aromaset[] = [AROMASET_SCA, AROMASET_LENEZ];
