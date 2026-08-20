/**
 * Der Prueflauf — der Punkt, an dem sich die Migration entscheidet.
 *
 * Jeder nicht eindeutig zuordenbare Datensatz wird gemeldet, nicht
 * stillschweigend fallen gelassen. Ergebnis ist ein Bericht, kein Abbruch.
 *
 * Bewusster Scope-Schnitt: dieser Prueflauf klassifiziert und zaehlt — er
 * schreibt keine fertigen Profil/Shot-Datensaetze in die Ablage. Ein Profil
 * oder ein Shot braucht ein Setup, ein Setup einen Ablauf (Ruestzeiten); die
 * Setup-Bindung ist laut docs/konzept.md "Umsetzung" ausdruecklich
 * Paket-03-Scope ("Profile mit Setup-Bindung"). Erst dort ist bekannt,
 * *welches* Setup ein migrierter Datensatz bekommt. Was Paket 02 sicher
 * liefert: Kaffee und Charge lassen sich schreiben (siehe migriereKaffee),
 * die Muehlen-Erkennung je Profil/Shot steht als Klartext-Befund fest, und
 * jede Unklarheit ist im Bericht sichtbar statt geraten.
 */
import { parseKaffeeSeite, type ProfilEntwurf, type ShotEntwurf } from './notion';

export type { ProfilEntwurf, ShotEntwurf };

export interface SeedSeite {
  readonly id: string;
  readonly titel: string;
  readonly properties: Readonly<Record<string, unknown>>;
  readonly inhalt: string;
}

export type MuehlenKandidat = 'sculptor' | 'k6';

export interface MuehlenBefund {
  readonly muehle: MuehlenKandidat | null;
  /** Der MG-Wert, wie er in Notion stand — null, wenn gar kein MG-Parameter vorkam. */
  readonly mgRoh: string | null;
}

export interface ProfilBefund extends MuehlenBefund {
  readonly varianteName: string;
  readonly standard: boolean;
}

export interface ShotBefund extends MuehlenBefund {
  readonly gruppe: string;
  readonly nummer: number;
}

export interface KaffeeBefund {
  readonly titel: string;
  readonly roester?: string;
  readonly entkoffeiniert: boolean;
  readonly bewertung?: number;
  readonly profile: readonly ProfilBefund[];
  readonly shots: readonly ShotBefund[];
}

export interface OffenerPunkt {
  readonly quelle: string;
  readonly was: string;
  readonly warum: string;
}

export interface PruefBericht {
  readonly kaffees: readonly KaffeeBefund[];
  readonly offen: readonly OffenerPunkt[];
  readonly zahlen: { readonly kaffees: number; readonly profile: number; readonly shots: number; readonly offen: number };
}

/**
 * Migrationsregel aus docs/konzept.md "Migration aus Notion":
 * 3,x -> Sculptor, 60-70 -> K6 (der dokumentierte Moka-Bereich, nicht die
 * volle K6-Skala). Alles ausserhalb — auch der K6-Pour-Over-Bereich
 * (100+ Clicks, siehe "Art Kaffee") — ist per Zahlenbereich nicht
 * eindeutig und landet im Bericht statt geraten zu werden.
 */
function erkenneMuehle(mgRoh: string | undefined): MuehlenBefund {
  if (mgRoh === undefined) return { muehle: null, mgRoh: null };
  const zahl = ersteZahl(mgRoh);
  if (zahl === null) return { muehle: null, mgRoh };
  if (zahl >= 3.6 && zahl <= 4.0) return { muehle: 'sculptor', mgRoh };
  if (zahl >= 60 && zahl <= 70) return { muehle: 'k6', mgRoh };
  return { muehle: null, mgRoh };
}

/** Liest die fuehrende Zahl aus Text wie "3,9", "30", "~18g" oder "unbekannt/sehr fein (…)". */
function ersteZahl(text: string): number | null {
  const treffer = /-?\d+(?:[.,]\d+)?/.exec(text);
  if (!treffer) return null;
  const zahl = Number(treffer[0].replace(',', '.'));
  return Number.isFinite(zahl) ? zahl : null;
}

function sterneOderZahl(wert: unknown): number | undefined {
  if (typeof wert === 'number') return wert;
  if (typeof wert !== 'string' || wert.length === 0) return undefined;
  if (/^⭐+$/u.test(wert)) return [...wert].length;
  const zahl = Number(wert);
  return Number.isFinite(zahl) ? zahl : undefined;
}

function profilBefund(e: ProfilEntwurf): ProfilBefund {
  const { muehle, mgRoh } = erkenneMuehle(e.parameter['MG']);
  return { varianteName: e.varianteName, standard: e.standard, muehle, mgRoh };
}

function shotBefund(e: ShotEntwurf): ShotBefund {
  const { muehle, mgRoh } = erkenneMuehle(e.parameter['MG']);
  return { gruppe: e.gruppe, nummer: e.nummer, muehle, mgRoh };
}

export function pruefeSeiten(seiten: readonly SeedSeite[]): PruefBericht {
  const kaffees: KaffeeBefund[] = [];
  const offen: OffenerPunkt[] = [];
  let profilAnzahl = 0;
  let shotAnzahl = 0;

  for (const seite of seiten) {
    const entwurf = parseKaffeeSeite(seite.inhalt);
    const roester = typeof seite.properties['Röster'] === 'string' ? (seite.properties['Röster'] as string) : undefined;
    if (!roester) {
      offen.push({ quelle: seite.titel, was: 'Kaffee ohne Röster', warum: 'Property "Röster" fehlt oder ist leer' });
    }

    const profile = entwurf.profile.map(profilBefund);
    const shots = entwurf.shots.map(shotBefund);
    profilAnzahl += profile.length;
    shotAnzahl += shots.length;

    for (const p of profile) {
      if (p.muehle === null) {
        offen.push({
          quelle: `${seite.titel} / Variante "${p.varianteName}"`,
          was: p.mgRoh === null ? 'kein MG-Parameter' : `MG ${p.mgRoh} außerhalb beider Setup-Bereiche`,
          warum: 'Setup-Zuordnung braucht 3,60–4,00 (Sculptor) oder 60–70 (K6, Moka-Bereich)',
        });
      }
    }
    for (const s of shots) {
      if (s.muehle === null) {
        offen.push({
          quelle: `${seite.titel} / ${s.gruppe || '(ohne Gruppe)'} Shot ${s.nummer}`,
          was: s.mgRoh === null ? 'kein MG-Parameter oder nicht als Zahl lesbar' : `MG ${s.mgRoh} außerhalb beider Setup-Bereiche`,
          warum: 'Setup-Zuordnung braucht 3,60–4,00 (Sculptor) oder 60–70 (K6, Moka-Bereich)',
        });
      }
    }

    kaffees.push({
      titel: seite.titel,
      roester,
      entkoffeiniert: /decaf|entcoffeiniert/i.test(seite.titel),
      bewertung: sterneOderZahl(seite.properties['Bewertung']),
      profile,
      shots,
    });
  }

  return {
    kaffees,
    offen,
    zahlen: { kaffees: kaffees.length, profile: profilAnzahl, shots: shotAnzahl, offen: offen.length },
  };
}
