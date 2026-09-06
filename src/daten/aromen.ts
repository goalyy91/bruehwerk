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
 * AROMASET_LENEZ wird seit 2026-09-06 **aus den Datenblaettern gebaut**
 * (aroma-datenblaetter.ts): auf jedem eingescannten Blatt stehen Nummer,
 * Name und Kategorie, also ist das Blatt der Ursprung und nicht eine
 * Beschreibung neben einer zweiten, handgepflegten Liste. Vorher stand hier
 * eine erfundene Kategorienverteilung mit 60 "(Platzhalter)"-Labels; sie ist
 * ersatzlos weg, weil geratene Daten schlechter sind als sichtbar fehlende.
 *
 * Ein noch nicht erfasstes Flaeschchen heisst "Nr. N (noch nicht erfasst)"
 * und sammelt sich in einer eigenen Kategorie gleichen Namens — kein
 * Screenshot und kein Bericht kann das mit echten Daten verwechseln. Das Set
 * bleibt `platzhalter: true`, bis alle 60 Blaetter da sind.
 *
 * Die Ids bleiben `flaeschchen-N`, also an die Nummer gebunden und nicht an
 * den Namen: ein Haeppchen neuer Blaetter macht damit bestehende
 * Uebungsmodus-Datensaetze (daten/schema/uebung.ts) nicht ungueltig, weil
 * sich die Nummer-zu-Flaeschchen-Zuordnung nie aendert — nur die Beschriftung
 * kommt hinzu.
 */
import type { Aromaset } from './schema';
import { DATENBLAETTER, FLAESCHCHEN_GESAMT, datenblattZu } from './aroma-datenblaetter';

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

/** Die Kategorie, in der alles landet, wozu noch kein Datenblatt vorliegt. */
const NICHT_ERFASST_ID = 'nicht-erfasst';
const NICHT_ERFASST_LABEL = 'Noch nicht erfasst';

/** Id eines Flaeschchens — an die Nummer gebunden, nie an den Namen (siehe Kopfkommentar). */
export function flaeschchenId(nummer: number): string {
  return `flaeschchen-${nummer}`;
}

/**
 * Baut die neun (bzw. bis zur vollstaendigen Erfassung zehn) Kategorien aus
 * den vorliegenden Datenblaettern. Die Reihenfolge der Kategorien folgt der
 * ersten erfassten Nummer, damit die Liste bei jedem Haeppchen stabil waechst
 * statt sich umzusortieren; "Noch nicht erfasst" steht immer am Ende.
 */
function lenezKategorien(): Aromaset['kategorien'] {
  const kategorien: Aromaset['kategorien'] = [];
  const nachId = new Map<string, Aromaset['kategorien'][number]>();

  for (let nummer = 1; nummer <= FLAESCHCHEN_GESAMT; nummer++) {
    const blatt = datenblattZu(nummer);
    const id = blatt?.kategorieId ?? NICHT_ERFASST_ID;
    const label = blatt?.kategorieLabel ?? NICHT_ERFASST_LABEL;

    let kategorie = nachId.get(id);
    if (!kategorie) {
      kategorie = { id, label, gruppen: [{ id: `${id}-flaeschchen`, label: 'Fläschchen', aromen: [] }] };
      nachId.set(id, kategorie);
      kategorien.push(kategorie);
    }
    kategorie.gruppen[0]!.aromen.push({
      id: flaeschchenId(nummer),
      label: blatt ? blatt.name : `Nr. ${nummer} (noch nicht erfasst)`,
      nummer,
    });
  }

  // "Noch nicht erfasst" ans Ende, egal bei welcher Nummer die Luecke begann.
  const offen = kategorien.findIndex((k) => k.id === NICHT_ERFASST_ID);
  if (offen >= 0) kategorien.push(...kategorien.splice(offen, 1));
  return kategorien;
}

export const AROMASET_LENEZ: Aromaset = {
  id: 'aromaset-lenez',
  name: 'Le Nez du Café',
  quelle:
    DATENBLAETTER.length === FLAESCHCHEN_GESAMT
      ? 'Le Nez du Café — Begleitmaterial, deutsche Fassung'
      : `${DATENBLAETTER.length} von ${FLAESCHCHEN_GESAMT} Datenblättern erfasst — der Rest wird nachgetragen`,
  vialNummern: true,
  platzhalter: DATENBLAETTER.length < FLAESCHCHEN_GESAMT,
  kategorien: lenezKategorien(),
};

export const AROMASETS: readonly Aromaset[] = [AROMASET_SCA, AROMASET_LENEZ];
