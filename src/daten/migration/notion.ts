/**
 * Der Notion-Parser — reine Funktion, kein IndexedDB, kein Netz. Markdown-Text
 * einer Kaffee-Seite rein, Entwurfsobjekte raus. Interpretation (Setup aus
 * dem MG-Wertebereich erschliessen, Zuordnung zu Zod-Objekten, was offen
 * bleibt) passiert in pruefung.ts — dieser Parser trifft keine Annahmen ueber
 * Zahlenbereiche, nur ueber die Textstruktur.
 *
 * Befund 1 (siehe CLAUDE.md "Was die Migration reparieren muss"): 14
 * Dial-in-Shots standen als `### Shot 1…14`, die App schrieb sie spaeter als
 * `####`. Der alte Parser las, sobald ein `####` einmal vorkam, jedes `###`
 * als Variantennamen — die 14 Shots waren unsichtbar.
 *
 * Die Reparatur ist NICHT "nimm die tiefste vorkommende Ebene als
 * Shot-Ebene" — das waere an der echten Seite "Espresso Entcoffeiniert"
 * falsch (dort stehen `#### Shot 1` UND `### Shot 1..14` nebeneinander, weil
 * ein Format das andere abloeste, ohne die alten Eintraege umzuschreiben).
 * Die tragfaehige Regel ist namensbasiert: **jede Ueberschrift, deren Text
 * mit "Shot <Zahl>" beginnt, ist ein Shot — unabhaengig von ihrer Ebene.**
 * Jede andere Ueberschrift innerhalb von "## Dial-in Log" ist ein
 * Gruppen-/Variantenwrapper, dem die folgenden Shots zugeordnet werden, bis
 * die naechste Gruppenueberschrift kommt.
 */

export interface ProfilEntwurf {
  varianteName: string;
  standard: boolean;
  laufend: boolean;
  abgeschlossen: boolean;
  /** Roh, unausgewertet: { Dose: "17.8g", MG: "3.9", ... }. Nur erkannte Schluessel. */
  parameter: Record<string, string>;
  /** Tokens der Parameterzeile, die keinem bekannten Schluessel zugeordnet werden konnten. */
  frei: string[];
  hinweise?: string;
}

export interface ShotEntwurf {
  /** Naechstliegende Gruppen-/Variantenueberschrift, oder '' wenn Shots direkt unter "## Dial-in Log" stehen. */
  gruppe: string;
  nummer: number;
  /** Klammerzusatz an der Ueberschrift, z. B. "alte Skala – ungueltig" oder "KINGrinder K6". */
  notiz?: string;
  parameter: Record<string, string>;
  frei: string[];
  aenderung?: string;
  ergebnis?: string;
}

export interface GussBausteinEntwurf {
  /** Roh, z. B. "50g" oder "–". */
  menge: string;
  /** Roh, z. B. "30s", "warten" oder "–". */
  dauer: string;
  rolle: string;
  text: string;
}

export interface KaffeeSeiteEntwurf {
  profile: ProfilEntwurf[];
  shots: ShotEntwurf[];
  gussbausteine: GussBausteinEntwurf[];
}

/** Bekannte Parameter-Schluessel aus den Notion-Zeilen. Alles andere landet in `frei`. */
const BEKANNTE_SCHLUESSEL = ['Dose', 'MG', 'RPM', 'KT', 'BT', 'Yield', 'Zeit', 'Pre', 'Preinfusion', 'FD', 'DLZ'];
const SCHLUESSEL_MUSTER = new RegExp(`^(${BEKANNTE_SCHLUESSEL.join('|')})\\b[:\\s]*(.+)$`, 'i');

const SHOT_MUSTER = /^Shot\s+(\d+)\s*(?:\(([^)]*)\))?\s*$/i;

/** Notion escaped `|`, `[`, `]` in Fliesstext — hier einmal fuer die ganze Seite aufgeloest. */
function entkommentieren(text: string): string {
  return text.replace(/\\([|[\]])/g, '$1');
}

function abschnitt(md: string, name: string): string | null {
  const re = new RegExp(`^##\\s+${name}\\s*$`, 'm');
  const treffer = re.exec(md);
  if (!treffer) return null;
  const rest = md.slice(treffer.index + treffer[0].length);
  const naechster = /^##\s+/m.exec(rest);
  return (naechster ? rest.slice(0, naechster.index) : rest).trim();
}

interface Ueberschrift {
  ebene: number;
  titel: string;
  zeilenEnde: number;
  index: number;
}

function ueberschriften(text: string): Ueberschrift[] {
  const out: Ueberschrift[] = [];
  const re = /^(#{3,4})[ \t]+(.+)$/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const zeile3 = m[1];
    const zeile4 = m[2];
    if (!zeile3 || zeile4 === undefined) continue;
    const zeilenEnde = text.indexOf('\n', m.index);
    out.push({
      ebene: zeile3.length,
      titel: zeile4.trim(),
      index: m.index,
      zeilenEnde: zeilenEnde === -1 ? text.length : zeilenEnde,
    });
  }
  return out;
}

function koerperVon(text: string, hs: readonly Ueberschrift[], i: number): string {
  const h = hs[i];
  if (!h) return '';
  const start = h.zeilenEnde;
  const naechste = hs[i + 1];
  const end = naechste ? naechste.index : text.length;
  return text.slice(start, end).trim();
}

function tagsAbtrennen(titel: string): { basis: string; standard: boolean; laufend: boolean; abgeschlossen: boolean } {
  const tags = new Set<string>();
  const basis = titel
    .replace(/\[([^\]]+)\]/g, (_voll, inhalt: string) => {
      tags.add(inhalt.trim());
      return '';
    })
    .trim();
  return {
    basis,
    standard: tags.has('Standard'),
    laufend: tags.has('Laufend'),
    abgeschlossen: tags.has('Abgeschlossen'),
  };
}

function parameterListe(zeile: string): { parameter: Record<string, string>; frei: string[] } {
  const parameter: Record<string, string> = {};
  const frei: string[] = [];
  for (const rohToken of zeile.split('|')) {
    const token = rohToken.trim();
    if (!token) continue;
    const treffer = SCHLUESSEL_MUSTER.exec(token);
    if (treffer && treffer[1] && treffer[2] !== undefined) {
      parameter[normSchluessel(treffer[1])] = treffer[2].trim();
    } else {
      frei.push(token);
    }
  }
  return { parameter, frei };
}

function normSchluessel(roh: string): string {
  const treffer = BEKANNTE_SCHLUESSEL.find((k) => k.toLowerCase() === roh.toLowerCase());
  return treffer ?? roh;
}

function zeilenOhneLeere(text: string): string[] {
  return text
    .split('\n')
    .map((z) => z.trim())
    .filter(Boolean);
}

function parseVarianten(text: string | null): ProfilEntwurf[] {
  if (!text) return [];
  const hs = ueberschriften(text).filter((h) => h.ebene === 3);
  return hs.map((h, i) => {
    const { basis, standard, laufend, abgeschlossen } = tagsAbtrennen(h.titel);
    const zeilen = zeilenOhneLeere(koerperVon(text, hs, i));
    const hinweiseZeile = zeilen.find((z) => z.startsWith('Hinweise:'));
    const parameterZeile = zeilen.find((z) => z !== hinweiseZeile);
    const { parameter, frei } = parameterZeile ? parameterListe(parameterZeile) : { parameter: {}, frei: [] };
    return {
      varianteName: basis,
      standard,
      laufend,
      abgeschlossen,
      parameter,
      frei,
      hinweise: hinweiseZeile?.replace(/^Hinweise:\s*/, ''),
    };
  });
}

function parseDialInLog(text: string | null): ShotEntwurf[] {
  if (!text) return [];
  const hs = ueberschriften(text);
  const shots: ShotEntwurf[] = [];
  let gruppe = '';
  for (let i = 0; i < hs.length; i++) {
    const h = hs[i];
    if (!h) continue;
    const treffer = SHOT_MUSTER.exec(h.titel);
    if (!treffer) {
      // Kein "Shot N" — also eine Gruppen-/Variantenueberschrift (z. B.
      // "Bialetti", "Espresso", "Bialetti 1er"). Gilt fuer alle folgenden
      // Shots, bis die naechste Gruppenueberschrift kommt.
      gruppe = h.titel;
      continue;
    }
    const nummerText = treffer[1];
    if (nummerText === undefined) continue;
    const zeilen = zeilenOhneLeere(koerperVon(text, hs, i));
    const parameterZeile = zeilen.find((z) => z.startsWith('Parameter:'));
    const aenderungZeile = zeilen.find((z) => z.startsWith('Änderung:'));
    const ergebnisZeile = zeilen.find((z) => z.startsWith('Ergebnis:'));
    const { parameter, frei } = parameterZeile
      ? parameterListe(parameterZeile.replace(/^Parameter:\s*/, ''))
      : { parameter: {}, frei: [] };
    shots.push({
      gruppe,
      nummer: Number(nummerText),
      notiz: treffer[2]?.trim(),
      parameter,
      frei,
      aenderung: aenderungZeile?.replace(/^Änderung:\s*/, ''),
      ergebnis: ergebnisZeile?.replace(/^Ergebnis:\s*/, ''),
    });
  }
  return shots;
}

const BAUSTEIN_MUSTER = /^\[([^|\]]*)\|([^\]]*)\]\s*(.*)$/;
/** Kurzes Wort gefolgt von ": " am Anfang des Rests gilt als Rolle — sonst ist der ganze Rest der Text. */
const ROLLE_MUSTER = /^([\wÄÖÜäöüß][\wÄÖÜäöüß ]{0,24}):\s(.*)$/;

function parseAufguss(text: string | null): GussBausteinEntwurf[] {
  if (!text) return [];
  const bausteine: GussBausteinEntwurf[] = [];
  for (const zeile of zeilenOhneLeere(text)) {
    const treffer = BAUSTEIN_MUSTER.exec(zeile);
    if (!treffer) continue;
    const menge = treffer[1]?.trim() ?? '';
    const dauer = treffer[2]?.trim() ?? '';
    const rest = (treffer[3] ?? '').trim();
    const rolleTreffer = ROLLE_MUSTER.exec(rest);
    bausteine.push({
      menge,
      dauer,
      rolle: rolleTreffer?.[1]?.trim() ?? '',
      text: rolleTreffer ? (rolleTreffer[2]?.trim() ?? '') : rest,
    });
  }
  return bausteine;
}

export function parseKaffeeSeite(markdown: string): KaffeeSeiteEntwurf {
  const text = entkommentieren(markdown);
  return {
    profile: parseVarianten(abschnitt(text, 'Varianten')),
    shots: parseDialInLog(abschnitt(text, 'Dial-in Log')),
    gussbausteine: parseAufguss(abschnitt(text, 'Aufguss')),
  };
}
