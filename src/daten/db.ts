/**
 * IndexedDB als Wahrheit (siehe CLAUDE.md "Datenquelle"). Schreiben ist
 * sofort und offline; es gibt keinen Zustand, in dem ein Netzfehler das
 * Loggen blockiert — diese Datei stellt dafuer die Verbindung her, mehr
 * nicht. Lesen/Schreiben mit Validierung steht in ablage.ts.
 */
import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type {
  Setup,
  Muehle,
  Bruehgeraet,
  Zubehoer,
  Ablauf,
  Kaffee,
  Charge,
  Profil,
  Gussplan,
  Shot,
  Symptom,
  Tasting,
  Aromaset,
  Getraenk,
  Ansatz,
  Person,
  Durchgang,
  Position,
  Bestellung,
  AppEinstellungen,
} from './schema';

const DB_NAME = 'bruehwerk';
/**
 * Version 2 fuegt den Store 'einstellungen' hinzu (Korrekturrunde, Teil 1).
 * upgrade() legt Stores deshalb nur noch an, wenn sie fehlen — sonst wuerde
 * ein Versionssprung auf einer bereits bestehenden DB an einem erneuten
 * createObjectStore() fuer 'setup' etc. krachen.
 */
const DB_VERSION = 2;

/**
 * Der Store-Katalog steht als eine Konstante da, nicht verstreut — Paket 03
 * bis 07 lesen Namen und Indizes von hier, nie als Freitext-String.
 */
export const SAMMLUNGEN = [
  'setup',
  'muehle',
  'bruehgeraet',
  'zubehoer',
  'ablauf',
  'kaffee',
  'charge',
  'profil',
  'gussplan',
  'shot',
  'symptom',
  'tasting',
  'aromaset',
  'getraenk',
  'ansatz',
  'person',
  'durchgang',
  'position',
  'bestellung',
  'einstellungen',
] as const;
export type Sammlung = (typeof SAMMLUNGEN)[number];

export interface BruehwerkSchema extends DBSchema {
  setup: { key: string; value: Setup };
  muehle: { key: string; value: Muehle };
  bruehgeraet: { key: string; value: Bruehgeraet };
  zubehoer: { key: string; value: Zubehoer };
  ablauf: { key: string; value: Ablauf };
  kaffee: { key: string; value: Kaffee };
  charge: { key: string; value: Charge; indexes: { 'by-kaffee': string } };
  profil: { key: string; value: Profil; indexes: { 'by-kaffee': string } };
  gussplan: { key: string; value: Gussplan };
  shot: {
    key: string;
    value: Shot;
    indexes: { 'by-kaffee': string; 'by-ts': number; 'by-profil': string };
  };
  symptom: { key: string; value: Symptom };
  tasting: { key: string; value: Tasting; indexes: { 'by-shot': string } };
  aromaset: { key: string; value: Aromaset };
  getraenk: { key: string; value: Getraenk };
  ansatz: { key: string; value: Ansatz; indexes: { 'by-kaffee': string } };
  person: { key: string; value: Person };
  durchgang: { key: string; value: Durchgang };
  position: {
    key: string;
    value: Position;
    indexes: { 'by-person': string; 'by-durchgang': string };
  };
  bestellung: { key: string; value: Bestellung; indexes: { 'by-ts': number } };
  einstellungen: { key: string; value: AppEinstellungen };
}

export type BruehwerkDB = IDBPDatabase<BruehwerkSchema>;

/** Der Store-Value-Typ einer Sammlung — die eine Quelle, die db.ts und ablage.ts teilen. */
export type WertVon<S extends Sammlung> = BruehwerkSchema[S]['value'];

let verbindung: Promise<BruehwerkDB> | undefined;

/**
 * Oeffnet die Datenbank genau einmal pro Prozess und reicht dieselbe
 * Verbindung weiter — wiederholtes openDB() waere unnoetig und idb serialisiert
 * parallele Upgrades ohnehin nicht sauber.
 */
export function oeffneDB(name: string = DB_NAME): Promise<BruehwerkDB> {
  if (!verbindung) {
    verbindung = openDB<BruehwerkSchema>(name, DB_VERSION, {
      upgrade(db) {
        const hat = (name: Sammlung) => db.objectStoreNames.contains(name);

        if (!hat('setup')) db.createObjectStore('setup', { keyPath: 'id' });
        if (!hat('muehle')) db.createObjectStore('muehle', { keyPath: 'id' });
        if (!hat('bruehgeraet')) db.createObjectStore('bruehgeraet', { keyPath: 'id' });
        if (!hat('zubehoer')) db.createObjectStore('zubehoer', { keyPath: 'id' });
        if (!hat('ablauf')) db.createObjectStore('ablauf', { keyPath: 'id' });
        if (!hat('kaffee')) db.createObjectStore('kaffee', { keyPath: 'id' });

        if (!hat('charge')) {
          const charge = db.createObjectStore('charge', { keyPath: 'id' });
          charge.createIndex('by-kaffee', 'kaffeeId');
        }

        if (!hat('profil')) {
          const profil = db.createObjectStore('profil', { keyPath: 'id' });
          profil.createIndex('by-kaffee', 'kaffeeId');
        }

        if (!hat('gussplan')) db.createObjectStore('gussplan', { keyPath: 'id' });

        if (!hat('shot')) {
          const shot = db.createObjectStore('shot', { keyPath: 'id' });
          shot.createIndex('by-kaffee', 'kaffeeId');
          shot.createIndex('by-ts', 'ts');
          shot.createIndex('by-profil', 'profilId');
        }

        if (!hat('symptom')) db.createObjectStore('symptom', { keyPath: 'id' });

        if (!hat('tasting')) {
          const tasting = db.createObjectStore('tasting', { keyPath: 'id' });
          tasting.createIndex('by-shot', 'shotId');
        }

        if (!hat('aromaset')) db.createObjectStore('aromaset', { keyPath: 'id' });
        if (!hat('getraenk')) db.createObjectStore('getraenk', { keyPath: 'id' });

        if (!hat('ansatz')) {
          const ansatz = db.createObjectStore('ansatz', { keyPath: 'id' });
          ansatz.createIndex('by-kaffee', 'kaffeeId');
        }

        if (!hat('person')) db.createObjectStore('person', { keyPath: 'id' });
        if (!hat('durchgang')) db.createObjectStore('durchgang', { keyPath: 'id' });

        if (!hat('position')) {
          const position = db.createObjectStore('position', { keyPath: 'id' });
          position.createIndex('by-person', 'personId');
          position.createIndex('by-durchgang', 'durchgangId');
        }

        if (!hat('bestellung')) {
          const bestellung = db.createObjectStore('bestellung', { keyPath: 'id' });
          bestellung.createIndex('by-ts', 'ts');
        }

        if (!hat('einstellungen')) db.createObjectStore('einstellungen', { keyPath: 'id' });
      },
    });
  }
  return verbindung;
}

/**
 * Nur fuer Tests: schliesst die offene Verbindung, loescht die Datenbank
 * komplett und erzwingt eine frische Verbindung bei der naechsten
 * oeffneDB(). Ohne das Loeschen wuerde fake-indexeddb Daten ueber
 * Testfaelle hinweg im Prozess behalten, weil derselbe DB_NAME wieder
 * geoeffnet wird.
 */
export async function _datenbankZuruecksetzen(name: string = DB_NAME): Promise<void> {
  if (verbindung) {
    (await verbindung).close();
  }
  verbindung = undefined;
  await new Promise<void>((resolve, reject) => {
    const anfrage = indexedDB.deleteDatabase(name);
    anfrage.onsuccess = () => resolve();
    anfrage.onerror = () => reject(anfrage.error);
    anfrage.onblocked = () => resolve(); // im Test unkritisch, keine zweite Verbindung offen
  });
}

/** Nur fuer Tests: erzwingt eine frische Verbindung bei der naechsten oeffneDB(), ohne die Datenbank zu loeschen. */
export function _verbindungZuruecksetzen(): void {
  verbindung = undefined;
}
