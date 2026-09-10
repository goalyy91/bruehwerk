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
 * AROMASET_LENEZ wird seit 2026-09-09 **aus dem Kurzindex gebaut**
 * (aroma-datenblaetter.ts::FLAESCHCHEN): die neun gedruckten Uebersichts-
 * seiten des Kartons nennen zu allen 60 Flaeschchen Nummer, Name und
 * Kategorie, unabhaengig davon, wie viele ausfuehrliche Datenblaetter
 * (DATENBLAETTER) schon abgetippt sind. Vorher war DATENBLAETTER zugleich
 * der Ursprung dieser Liste, und ein Flaeschchen ohne Volltextblatt hiess
 * deshalb "Nr. N (noch nicht erfasst)" — mit dem Kurzindex ist das nicht
 * mehr noetig, alle 60 Namen sind echt.
 *
 * Die Ids bleiben `flaeschchen-N`, also an die Nummer gebunden und nicht an
 * den Namen: ein Haeppchen neuer Volltextblaetter macht damit bestehende
 * Uebungsmodus-Datensaetze (daten/schema/uebung.ts) nicht ungueltig, weil
 * sich die Nummer-zu-Flaeschchen-Zuordnung nie aendert.
 */
import type { Aromaset } from './schema';
import { DATENBLAETTER, FLAESCHCHEN, FLAESCHCHEN_GESAMT, flaeschchenZu } from './aroma-datenblaetter';

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

/** Id eines Flaeschchens — an die Nummer gebunden, nie an den Namen (siehe Kopfkommentar). */
export function flaeschchenId(nummer: number): string {
  return `flaeschchen-${nummer}`;
}

/**
 * Baut Kategorien und Le-Nez-eigene Untergruppen aus dem Kurzindex
 * (FLAESCHCHEN). Die Reihenfolge folgt der Nummerierung des Kartons — Blumig
 * zuerst (Nr. 1), Süß zuletzt (Nr. 60) —, nicht der Reihenfolge im SCA-Set.
 */
function lenezKategorien(): Aromaset['kategorien'] {
  const kategorien: Aromaset['kategorien'] = [];
  const kategorieNachId = new Map<string, Aromaset['kategorien'][number]>();
  const gruppeNachSchluessel = new Map<string, Aromaset['kategorien'][number]['gruppen'][number]>();

  for (const f of FLAESCHCHEN) {
    let kategorie = kategorieNachId.get(f.kategorieId);
    if (!kategorie) {
      kategorie = { id: f.kategorieId, label: f.kategorieLabel, gruppen: [] };
      kategorieNachId.set(f.kategorieId, kategorie);
      kategorien.push(kategorie);
    }

    const gruppenSchluessel = `${f.kategorieId}/${f.gruppeId}`;
    let gruppe = gruppeNachSchluessel.get(gruppenSchluessel);
    if (!gruppe) {
      gruppe = { id: f.gruppeId, label: f.gruppeLabel, aromen: [] };
      gruppeNachSchluessel.set(gruppenSchluessel, gruppe);
      kategorie.gruppen.push(gruppe);
    }

    gruppe.aromen.push({ id: flaeschchenId(f.nummer), label: f.name, nummer: f.nummer });
  }
  return kategorien;
}

export const AROMASET_LENEZ: Aromaset = {
  id: 'aromaset-lenez',
  name: 'Le Nez du Café',
  quelle:
    DATENBLAETTER.length === FLAESCHCHEN_GESAMT
      ? 'Le Nez du Café — Begleitmaterial, deutsche Fassung'
      : `Le Nez du Café — Namen vollständig, ${DATENBLAETTER.length} von ${FLAESCHCHEN_GESAMT} Datenblättern mit Volltext`,
  vialNummern: true,
  // Nicht mehr platzhalter: der Kurzindex traegt alle 60 echten Namen. Was
  // noch waechst, ist der Volltext (DATENBLAETTER) — das sagt die quelle-Zeile.
  platzhalter: false,
  kategorien: lenezKategorien(),
};

export const AROMASETS: readonly Aromaset[] = [AROMASET_SCA, AROMASET_LENEZ];

const SCA_LABEL_NACH_AROMA_ID = new Map(
  AROMASET_SCA.kategorien.flatMap((k) => k.gruppen.flatMap((g) => g.aromen.map((a) => [a.id, a.label] as const))),
);

/**
 * Das kanonische Label eines Aroma-Eintrags fuer setuebergreifendes Zaehlen
 * (domain/auswertung.ts::haeufigsteAromen). Ein Le-Nez-Flaeschchen mit
 * bekanntem SCA-Zwilling (aroma-datenblaetter.ts::Flaeschchen.sca) zaehlt
 * unter dessen SCA-Label — "Heidelbeere" und "Blaubeere" sind sonst zwei
 * verschiedene Zeilen in derselben Auswertung. Ohne Zwilling (oder bei einem
 * SCA-Eintrag selbst) zaehlt weiterhin das letzte Pfadglied.
 */
export function kanonischesAromaLabel(eintrag: { readonly pfad: readonly string[]; readonly nummer?: number }): string {
  if (eintrag.nummer !== undefined) {
    const scaAromaId = flaeschchenZu(eintrag.nummer)?.sca?.aromaId;
    const scaLabel = scaAromaId ? SCA_LABEL_NACH_AROMA_ID.get(scaAromaId) : undefined;
    if (scaLabel) return scaLabel;
  }
  return eintrag.pfad[eintrag.pfad.length - 1] ?? '';
}
