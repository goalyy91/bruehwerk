/**
 * Cloud-Backup — der zweite, entkoppelte Sicherungsweg neben dem manuellen
 * Datei-Export (siehe CLAUDE.md "Datenquelle"). IndexedDB bleibt die
 * Wahrheit; die Cloud ist nur ein Spiegel, den man auch abschalten oder
 * verlieren könnte, ohne dass die App aufhört zu funktionieren.
 *
 * Firestore, nicht Cloud Storage: Cloud Storage für Firebase verlangt seit
 * 3.2.2026 zwingend den kostenpflichtigen Blaze-Tarif (eine hinterlegte
 * Zahlungsmethode), selbst wenn die tatsächliche Nutzung innerhalb der
 * Gratis-Kontingente bleibt. Firestore bleibt auf dem kostenlosen
 * Spark-Tarif nutzbar, ganz ohne Zahlungsmethode — Fund 2026-09-09, noch vor
 * der ersten Einrichtung. Abgelegt wird trotzdem keine "Datenbank" im
 * eigentlichen Sinn, sondern EIN Dokument pro Konto mit dem kompletten
 * Bestand als JSON-Text — dieselbe Form wie die manuell exportierte Datei
 * (daten/export.ts::exportiere()), nur automatisch statt per Download.
 * Wiederherstellen läuft über deren Gegenstück, importiere() — beide
 * unverändert, beide schon getestet.
 *
 * Ein Firestore-Dokument ist auf ~1 MiB begrenzt — für einen einzelnen
 * Nutzer noch für Jahre reichlich (Stand 2026-09: einige Dutzend Shots
 * ergeben wenige KB JSON), aber kein Zustand, der sich beliebig weiter
 * füllen lässt. Wird das je eng, ist die Lösung eine Aufteilung auf mehrere
 * Dokumente (eine je Sammlung) — heute bewusst nicht gebaut, weil es dafür
 * noch keinen echten Anlass gibt.
 *
 * Anmeldung ist "Mit Google", einmalig — bewusst kein anonymes Konto: eine
 * anonyme Firebase-Sitzung läge im selben Browser-Speicher, den ein
 * Chrome-"Verlauf löschen" mitlöscht (der Fund, der das hier ausgelöst hat).
 * Nach so einem Löschen wäre die Cloud-Sicherung sonst unerreichbar, obwohl
 * sie noch da wäre — mit Google-Anmeldung nicht, die hängt nicht am
 * Browser-Speicher.
 *
 * `VITE_FIREBASE_*`-Variablen fehlen, solange kein Firebase-Projekt
 * eingerichtet ist (.env, nicht eingecheckt) — cloudVerfuegbar() ist dann
 * false, und jede andere Funktion hier ist ein kontrolliertes No-Op/Fehler.
 * Kein Zustand, in dem ein fehlendes Projekt irgendetwas blockiert.
 *
 * Das Firebase-SDK wird ausschliesslich per dynamischem import() geladen,
 * nie ueber einen statischen Modul-Import oben in der Datei — sonst haette
 * jede App, auch ohne eingerichtetes Firebase-Projekt, das komplette SDK
 * mitgeladen (gemessener Befund: +38 KB gzip im Hauptbundle). So bleibt der
 * Code fuer alle, die Cloud-Backup nie einrichten oder nutzen, komplett
 * ungeladen — cloudVerfuegbar() entscheidet, bevor ueberhaupt ein
 * import() versucht wird.
 */

export interface CloudNutzer {
  readonly uid: string;
  readonly email: string | null;
}

/**
 * Kein storageBucket mehr — das war nur fuer Cloud Storage noetig (siehe
 * oben, verworfen). Firestore braucht nichts weiter als die App-Config.
 */
const KONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

/** true, sobald alle vier Werte gesetzt sind — sonst bleibt Cloud-Backup unsichtbar. */
export function cloudVerfuegbar(): boolean {
  return Object.values(KONFIG).every((wert) => !!wert);
}

let authPromise: Promise<import('firebase/auth').Auth> | undefined;

/** Laedt das Firebase-SDK nur beim ersten tatsaechlichen Gebrauch, nie vorher. */
function holeAuth(): Promise<import('firebase/auth').Auth> | undefined {
  if (!cloudVerfuegbar()) return undefined;
  if (!authPromise) {
    authPromise = Promise.all([import('firebase/app'), import('firebase/auth')]).then(
      ([{ initializeApp }, { getAuth }]) => getAuth(initializeApp(KONFIG as Record<string, string>)),
    );
  }
  return authPromise;
}

/**
 * Meldet einen Callback für Anmeldungs-Änderungen an und gibt die
 * Abmelde-Funktion zurück — dasselbe Rückgabemuster wie
 * navigation.starten() in bereiche/navigation.svelte.ts. Ohne konfiguriertes
 * Projekt wird der Callback einmalig mit `undefined` aufgerufen, das
 * Firebase-SDK bleibt dabei komplett ungeladen.
 */
export function aufAnmeldungHoeren(callback: (nutzer: CloudNutzer | undefined) => void): () => void {
  const authP = holeAuth();
  if (!authP) {
    callback(undefined);
    return () => {};
  }
  let abmelden: (() => void) | undefined;
  let abgebrochen = false;
  void Promise.all([authP, import('firebase/auth')]).then(([auth, { onAuthStateChanged }]) => {
    if (abgebrochen) return;
    abmelden = onAuthStateChanged(auth, (user) => callback(user ? { uid: user.uid, email: user.email } : undefined));
  });
  return () => {
    abgebrochen = true;
    abmelden?.();
  };
}

export async function anmelden(): Promise<void> {
  const authP = holeAuth();
  if (!authP) throw new Error('Cloud-Backup ist nicht eingerichtet.');
  const [auth, { GoogleAuthProvider, signInWithPopup }] = await Promise.all([authP, import('firebase/auth')]);
  await signInWithPopup(auth, new GoogleAuthProvider());
}

export async function abmelden(): Promise<void> {
  const authP = holeAuth();
  if (!authP) return;
  const [auth, { signOut }] = await Promise.all([authP, import('firebase/auth')]);
  await signOut(auth);
}

/** Eine Sammlung "sicherungen", ein Dokument je Konto (uid als Dokument-Id). */
const SAMMLUNG_NAME = 'sicherungen';

export async function hochladen(uid: string, inhaltJson: string): Promise<void> {
  const authP = holeAuth();
  if (!authP) return;
  const [auth, { getFirestore, doc, setDoc }] = await Promise.all([authP, import('firebase/firestore')]);
  const ref = doc(getFirestore(auth.app), SAMMLUNG_NAME, uid);
  await setDoc(ref, { inhalt: inhaltJson, aktualisiertAm: Date.now() });
}

export async function herunterladen(uid: string): Promise<string> {
  const authP = holeAuth();
  if (!authP) throw new Error('Cloud-Backup ist nicht eingerichtet.');
  const [auth, { getFirestore, doc, getDoc }] = await Promise.all([authP, import('firebase/firestore')]);
  const ref = doc(getFirestore(auth.app), SAMMLUNG_NAME, uid);
  const schnappschuss = await getDoc(ref);
  const daten = schnappschuss.data();
  if (!daten || typeof daten.inhalt !== 'string') throw new Error('Keine Cloud-Sicherung gefunden.');
  return daten.inhalt;
}

/**
 * Mehrere schnelle anstossen()-Aufrufe innerhalb von wartezeitMs lösen nur
 * EINEN auftrag()-Lauf aus, mit den Argumenten des letzten Aufrufs — bei
 * mehreren Shots kurz hintereinander wird also nicht bei jedem einzelnen
 * hochgeladen, sondern einmal, nachdem es sich beruhigt hat. Generisch statt
 * Firebase-spezifisch, damit die Verzögerungslogik selbst ohne echtes
 * Firebase-Projekt testbar ist.
 */
export function debounce<Args extends unknown[]>(
  auftrag: (...args: Args) => void,
  wartezeitMs: number,
): (...args: Args) => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  return (...args: Args) => {
    if (timer !== undefined) clearTimeout(timer);
    timer = setTimeout(() => auftrag(...args), wartezeitMs);
  };
}
