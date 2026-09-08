/**
 * Cloud-Backup — der zweite, entkoppelte Sicherungsweg neben dem manuellen
 * Datei-Export (siehe CLAUDE.md "Datenquelle"). IndexedDB bleibt die
 * Wahrheit; die Cloud ist nur ein Spiegel, den man auch abschalten oder
 * verlieren könnte, ohne dass die App aufhört zu funktionieren.
 *
 * Kein Firestore, keine Sammlungen pro Datensatz: hochgeladen wird genau das
 * eine JSON-Objekt, das daten/export.ts::exportiere() ohnehin schon baut —
 * dieselbe Form wie die manuell exportierte Datei, nur automatisch in eine
 * Firebase-Cloud-Storage-Datei statt in einen Download geschrieben.
 * Wiederherstellen läuft über exportiere()s Gegenstück, importiere() —
 * beide unverändert, beide schon getestet.
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

const KONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

/** true, sobald alle fünf Werte gesetzt sind — sonst bleibt Cloud-Backup unsichtbar. */
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

/** Eine Datei je Konto — der eigene uid ist der Dateiname, keine zweite Ablage-Struktur nötig. */
function pfadFuer(uid: string): string {
  return `sicherungen/${uid}.json`;
}

export async function hochladen(uid: string, inhaltJson: string): Promise<void> {
  const authP = holeAuth();
  if (!authP) return;
  const [auth, { getStorage, ref, uploadString }] = await Promise.all([authP, import('firebase/storage')]);
  const dateiRef = ref(getStorage(auth.app), pfadFuer(uid));
  await uploadString(dateiRef, inhaltJson, 'raw', { contentType: 'application/json' });
}

export async function herunterladen(uid: string): Promise<string> {
  const authP = holeAuth();
  if (!authP) throw new Error('Cloud-Backup ist nicht eingerichtet.');
  const [auth, { getStorage, ref, getBytes }] = await Promise.all([authP, import('firebase/storage')]);
  const dateiRef = ref(getStorage(auth.app), pfadFuer(uid));
  const bytes = await getBytes(dateiRef);
  return new TextDecoder().decode(bytes);
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
