/**
 * Die Adressen der App — reines TypeScript, ohne Svelte, damit ohne
 * Bildschirm testbar (tests/schichten.test.ts wuerde ein Svelte-Import hier
 * ohnehin verbieten).
 *
 * Jede Route ist ein Hash-Pfad (`#/kaffees/<id>/profil/<id>`). zuPfad und
 * ausPfad sind zueinander invers fuer jede gueltige Route — das haelt
 * route.test.ts nach. elternVon bildet die Baumstruktur ab, tabVon ordnet
 * jede Route ihrem Bereich in der unteren Leiste zu.
 */

export type Bereich = 'bar' | 'kaffees' | 'historie' | 'getraenke' | 'einstellungen';

export type Route =
  | { name: 'bar' }
  | { name: 'historie' }
  | { name: 'getraenke' }
  | { name: 'kaffees' }
  | { name: 'kaffeeNeu' }
  | { name: 'kaffee'; kaffeeId: string }
  | { name: 'profil'; kaffeeId: string; profilId: string }
  | { name: 'shot'; kaffeeId: string; profilId: string }
  | { name: 'einstellungen' }
  | { name: 'geraete' }
  | { name: 'musterblatt' }
  | { name: 'muehle'; id?: string }
  | { name: 'bruehgeraet'; id?: string }
  | { name: 'setup'; id?: string };

export const START: Route = { name: 'bar' };

export function zuPfad(route: Route): string {
  switch (route.name) {
    case 'bar':
      return '/bar';
    case 'historie':
      return '/historie';
    case 'getraenke':
      return '/getraenke';
    case 'kaffees':
      return '/kaffees';
    case 'kaffeeNeu':
      return '/kaffees/neu';
    case 'kaffee':
      return `/kaffees/${route.kaffeeId}`;
    case 'profil':
      return `/kaffees/${route.kaffeeId}/profil/${route.profilId}`;
    case 'shot':
      return `/kaffees/${route.kaffeeId}/profil/${route.profilId}/shot`;
    case 'einstellungen':
      return '/einstellungen';
    case 'geraete':
      return '/einstellungen/geraete';
    case 'musterblatt':
      return '/einstellungen/musterblatt';
    case 'muehle':
      return `/einstellungen/geraete/muehle/${route.id ?? 'neu'}`;
    case 'bruehgeraet':
      return `/einstellungen/geraete/bruehgeraet/${route.id ?? 'neu'}`;
    case 'setup':
      return `/einstellungen/geraete/setup/${route.id ?? 'neu'}`;
  }
}

/** Unbekannte oder verstuemmelte Pfade landen auf START — kein Absturz, kein Raten. */
export function ausPfad(pfad: string): Route {
  const t = pfad.split('/').filter(Boolean);

  if (t.length === 1 && t[0] === 'bar') return { name: 'bar' };
  if (t.length === 1 && t[0] === 'historie') return { name: 'historie' };
  if (t.length === 1 && t[0] === 'getraenke') return { name: 'getraenke' };

  if (t[0] === 'kaffees') {
    if (t.length === 1) return { name: 'kaffees' };
    if (t.length === 2 && t[1] === 'neu') return { name: 'kaffeeNeu' };
    // Ab hier ist die jeweilige Laenge geprueft — die Indizes sind also
    // belegt, auch wenn TypeScript das bei Array-Zugriff nicht selbst sieht.
    if (t.length === 2) return { name: 'kaffee', kaffeeId: t[1]! };
    if (t.length === 4 && t[2] === 'profil') return { name: 'profil', kaffeeId: t[1]!, profilId: t[3]! };
    if (t.length === 5 && t[2] === 'profil' && t[4] === 'shot') {
      return { name: 'shot', kaffeeId: t[1]!, profilId: t[3]! };
    }
  }

  if (t[0] === 'einstellungen') {
    if (t.length === 1) return { name: 'einstellungen' };
    if (t.length === 2 && t[1] === 'musterblatt') return { name: 'musterblatt' };
    if (t.length === 2 && t[1] === 'geraete') return { name: 'geraete' };
    if (t.length === 4 && t[1] === 'geraete') {
      const id = t[3] === 'neu' ? undefined : t[3];
      if (t[2] === 'muehle') return { name: 'muehle', id };
      if (t[2] === 'bruehgeraet') return { name: 'bruehgeraet', id };
      if (t[2] === 'setup') return { name: 'setup', id };
    }
  }

  return START;
}

/** undefined = Tab-Wurzel, es gibt kein Eltern-Blatt mehr. */
export function elternVon(route: Route): Route | undefined {
  switch (route.name) {
    case 'bar':
    case 'historie':
    case 'getraenke':
    case 'kaffees':
    case 'einstellungen':
      return undefined;
    case 'kaffeeNeu':
    case 'kaffee':
      return { name: 'kaffees' };
    case 'profil':
      return { name: 'kaffee', kaffeeId: route.kaffeeId };
    case 'shot':
      return { name: 'profil', kaffeeId: route.kaffeeId, profilId: route.profilId };
    case 'geraete':
    case 'musterblatt':
      return { name: 'einstellungen' };
    case 'muehle':
    case 'bruehgeraet':
    case 'setup':
      return { name: 'geraete' };
  }
}

export function tabVon(route: Route): Bereich {
  switch (route.name) {
    case 'bar':
      return 'bar';
    case 'historie':
      return 'historie';
    case 'getraenke':
      return 'getraenke';
    case 'kaffees':
    case 'kaffeeNeu':
    case 'kaffee':
    case 'profil':
    case 'shot':
      return 'kaffees';
    case 'einstellungen':
    case 'geraete':
    case 'musterblatt':
    case 'muehle':
    case 'bruehgeraet':
    case 'setup':
      return 'einstellungen';
  }
}

export function wurzelVon(bereich: Bereich): Route {
  switch (bereich) {
    case 'bar':
      return { name: 'bar' };
    case 'historie':
      return { name: 'historie' };
    case 'getraenke':
      return { name: 'getraenke' };
    case 'kaffees':
      return { name: 'kaffees' };
    case 'einstellungen':
      return { name: 'einstellungen' };
  }
}
