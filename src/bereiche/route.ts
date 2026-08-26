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
  | { name: 'historieShot'; shotId: string }
  | { name: 'verkostung'; shotId: string }
  | { name: 'getraenke' }
  | { name: 'kaffees' }
  | { name: 'kaffeeNeu' }
  | { name: 'kaffee'; kaffeeId: string }
  | { name: 'kaffeeBearbeiten'; kaffeeId: string }
  | { name: 'profil'; kaffeeId: string; profilId: string }
  | { name: 'shot'; kaffeeId: string; profilId: string }
  | { name: 'einstellungen' }
  | { name: 'geraete' }
  | { name: 'musterblatt' }
  | { name: 'beobachtungen' }
  | { name: 'muehle'; id: string }
  | { name: 'muehleNeu' }
  | { name: 'muehleBearbeiten'; id: string }
  | { name: 'bruehgeraet'; id: string }
  | { name: 'bruehgeraetNeu' }
  | { name: 'bruehgeraetBearbeiten'; id: string }
  | { name: 'tempReferenz' }
  | { name: 'setup'; id: string }
  | { name: 'setupNeu' }
  | { name: 'setupBearbeiten'; id: string }
  | { name: 'uebung' };

export const START: Route = { name: 'bar' };

export function zuPfad(route: Route): string {
  switch (route.name) {
    case 'bar':
      return '/bar';
    case 'historie':
      return '/historie';
    case 'historieShot':
      return `/historie/${route.shotId}`;
    case 'verkostung':
      return `/historie/${route.shotId}/verkostung`;
    case 'getraenke':
      return '/getraenke';
    case 'kaffees':
      return '/kaffees';
    case 'kaffeeNeu':
      return '/kaffees/neu';
    case 'kaffee':
      return `/kaffees/${route.kaffeeId}`;
    case 'kaffeeBearbeiten':
      return `/kaffees/${route.kaffeeId}/bearbeiten`;
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
    case 'beobachtungen':
      return '/einstellungen/beobachtungen';
    case 'muehle':
      return `/einstellungen/geraete/muehle/${route.id}`;
    case 'muehleNeu':
      return '/einstellungen/geraete/muehle/neu';
    case 'muehleBearbeiten':
      return `/einstellungen/geraete/muehle/${route.id}/bearbeiten`;
    case 'bruehgeraet':
      return `/einstellungen/geraete/bruehgeraet/${route.id}`;
    case 'bruehgeraetNeu':
      return '/einstellungen/geraete/bruehgeraet/neu';
    case 'bruehgeraetBearbeiten':
      return `/einstellungen/geraete/bruehgeraet/${route.id}/bearbeiten`;
    case 'setup':
      return `/einstellungen/geraete/setup/${route.id}`;
    case 'setupNeu':
      return '/einstellungen/geraete/setup/neu';
    case 'setupBearbeiten':
      return `/einstellungen/geraete/setup/${route.id}/bearbeiten`;
    case 'tempReferenz':
      return '/einstellungen/geraete/bruehgeraet/temperatur';
    case 'uebung':
      return '/einstellungen/uebung';
  }
}

/** Unbekannte oder verstuemmelte Pfade landen auf START — kein Absturz, kein Raten. */
export function ausPfad(pfad: string): Route {
  const t = pfad.split('/').filter(Boolean);

  if (t.length === 1 && t[0] === 'bar') return { name: 'bar' };
  if (t.length === 1 && t[0] === 'getraenke') return { name: 'getraenke' };

  if (t[0] === 'historie') {
    if (t.length === 1) return { name: 'historie' };
    if (t.length === 2) return { name: 'historieShot', shotId: t[1]! };
    if (t.length === 3 && t[2] === 'verkostung') return { name: 'verkostung', shotId: t[1]! };
  }

  if (t[0] === 'kaffees') {
    if (t.length === 1) return { name: 'kaffees' };
    if (t.length === 2 && t[1] === 'neu') return { name: 'kaffeeNeu' };
    // Ab hier ist die jeweilige Laenge geprueft — die Indizes sind also
    // belegt, auch wenn TypeScript das bei Array-Zugriff nicht selbst sieht.
    if (t.length === 2) return { name: 'kaffee', kaffeeId: t[1]! };
    if (t.length === 3 && t[2] === 'bearbeiten') return { name: 'kaffeeBearbeiten', kaffeeId: t[1]! };
    if (t.length === 4 && t[2] === 'profil') return { name: 'profil', kaffeeId: t[1]!, profilId: t[3]! };
    if (t.length === 5 && t[2] === 'profil' && t[4] === 'shot') {
      return { name: 'shot', kaffeeId: t[1]!, profilId: t[3]! };
    }
  }

  if (t[0] === 'einstellungen') {
    if (t.length === 1) return { name: 'einstellungen' };
    if (t.length === 2 && t[1] === 'musterblatt') return { name: 'musterblatt' };
    if (t.length === 2 && t[1] === 'beobachtungen') return { name: 'beobachtungen' };
    if (t.length === 2 && t[1] === 'uebung') return { name: 'uebung' };
    if (t.length === 2 && t[1] === 'geraete') return { name: 'geraete' };
    if (t.length === 4 && t[1] === 'geraete' && t[2] === 'bruehgeraet' && t[3] === 'temperatur') {
      return { name: 'tempReferenz' };
    }
    if (t.length === 4 && t[1] === 'geraete') {
      const typ = t[2];
      if (t[3] === 'neu') {
        if (typ === 'muehle') return { name: 'muehleNeu' };
        if (typ === 'bruehgeraet') return { name: 'bruehgeraetNeu' };
        if (typ === 'setup') return { name: 'setupNeu' };
      } else {
        const id = t[3]!;
        if (typ === 'muehle') return { name: 'muehle', id };
        if (typ === 'bruehgeraet') return { name: 'bruehgeraet', id };
        if (typ === 'setup') return { name: 'setup', id };
      }
    }
    if (t.length === 5 && t[1] === 'geraete' && t[4] === 'bearbeiten') {
      const typ = t[2];
      const id = t[3]!;
      if (typ === 'muehle') return { name: 'muehleBearbeiten', id };
      if (typ === 'bruehgeraet') return { name: 'bruehgeraetBearbeiten', id };
      if (typ === 'setup') return { name: 'setupBearbeiten', id };
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
    case 'historieShot':
      return { name: 'historie' };
    case 'verkostung':
      return { name: 'historieShot', shotId: route.shotId };
    case 'kaffeeNeu':
      return { name: 'kaffees' };
    case 'kaffee':
      return { name: 'kaffees' };
    case 'kaffeeBearbeiten':
      return { name: 'kaffee', kaffeeId: route.kaffeeId };
    case 'profil':
      return { name: 'kaffee', kaffeeId: route.kaffeeId };
    case 'shot':
      return { name: 'profil', kaffeeId: route.kaffeeId, profilId: route.profilId };
    case 'geraete':
    case 'musterblatt':
    case 'beobachtungen':
    case 'uebung':
      return { name: 'einstellungen' };
    case 'muehle':
    case 'muehleNeu':
    case 'bruehgeraet':
    case 'bruehgeraetNeu':
    case 'setup':
    case 'setupNeu':
      return { name: 'geraete' };
    case 'muehleBearbeiten':
      return { name: 'muehle', id: route.id };
    case 'bruehgeraetBearbeiten':
      return { name: 'bruehgeraet', id: route.id };
    case 'setupBearbeiten':
      return { name: 'setup', id: route.id };
    case 'tempReferenz':
      // Traegt keine id (siehe route.ts-Kopfkommentar zur Route) — dieser
      // Fall greift nur, wenn navigation.zurueck() ohne eigene
      // Verlaufstiefe auskommen muss (z. B. Direktlink auf diese Route).
      // Der normale Weg (ueber die Zeile im Formular) laeuft ueber
      // history.back() und landet unabhaengig davon richtig.
      return { name: 'geraete' };
  }
}

export function tabVon(route: Route): Bereich {
  switch (route.name) {
    case 'bar':
      return 'bar';
    case 'historie':
    case 'historieShot':
    case 'verkostung':
      return 'historie';
    case 'getraenke':
      return 'getraenke';
    case 'kaffees':
    case 'kaffeeNeu':
    case 'kaffee':
    case 'kaffeeBearbeiten':
    case 'profil':
    case 'shot':
      return 'kaffees';
    case 'einstellungen':
    case 'geraete':
    case 'musterblatt':
    case 'beobachtungen':
    case 'muehle':
    case 'muehleNeu':
    case 'muehleBearbeiten':
    case 'bruehgeraet':
    case 'bruehgeraetNeu':
    case 'bruehgeraetBearbeiten':
    case 'setup':
    case 'setupNeu':
    case 'setupBearbeiten':
    case 'tempReferenz':
    case 'uebung':
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
