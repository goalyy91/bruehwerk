import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import {
  einrichten,
  sichern,
  zurueckholen,
  ueberschreiben,
  tokenErsetzen,
  zusammenfuehren,
  abholen,
  zustandLesen,
  wartetSeit,
  cloudLesen,
  CloudFehler,
  WARTET_AB_MS,
  type Umgebung,
} from './cloud';
import { alle, schreiben, loeschen } from './ablage';
import { _datenbankZuruecksetzen } from './db';
import { schnappschuesse } from './schnappschuss';
import { MUEHLE_SCULPTOR, MUEHLE_K6 } from './stammdaten';

/**
 * Ein GitHub-Repo im Speicher, das sich an den entscheidenden Stellen wie die
 * echte Contents-API verhält: sha-Prüfung beim Schreiben (409), 404 für eine
 * fehlende Datei, 401 für einen falschen Token, Inhalt als Base64.
 */
function falschesGithub(optionen: { token?: string; repo?: string } = {}) {
  const token = optionen.token ?? 'gut';
  const repo = optionen.repo ?? 'julian/bruehwerk-daten';
  let datei: { sha: string; inhalt: string } | undefined;
  let zaehler = 0;
  const commits: string[] = [];
  let schreibversuche = 0;
  const antwort = (status: number, koerper?: unknown) =>
    new Response(koerper === undefined ? null : JSON.stringify(koerper), { status, headers: { 'Content-Type': 'application/json' } });

  const fetchFn = (async (eingabe: RequestInfo | URL, init?: RequestInit) => {
    const url = String(eingabe);
    const kopf = new Headers(init?.headers);
    if (kopf.get('Authorization') !== `Bearer ${token}`) return antwort(401, { message: 'Bad credentials' });
    if (url === `https://api.github.com/repos/${repo}`) return antwort(200, { full_name: repo });
    if (!url.startsWith(`https://api.github.com/repos/${repo}/contents/`)) return antwort(404, {});
    if ((init?.method ?? 'GET') === 'GET') {
      if (!datei) return antwort(404, { message: 'Not Found' });
      if (kopf.get('Accept') === 'application/vnd.github.raw+json') return new Response(datei.inhalt, { status: 200 });
      const b64 = btoa(String.fromCharCode(...new TextEncoder().encode(datei.inhalt)));
      return antwort(200, { sha: datei.sha, encoding: 'base64', content: b64 });
    }
    schreibversuche++;
    const koerper = JSON.parse(String(init?.body)) as { sha?: string; content: string; message: string };
    if (datei && koerper.sha !== datei.sha) return antwort(409, { message: 'sha mismatch' });
    if (!datei && koerper.sha) return antwort(422, { message: 'sha given for new file' });
    const bytes = Uint8Array.from(atob(koerper.content), (c) => c.charCodeAt(0));
    datei = { sha: `sha${++zaehler}`, inhalt: new TextDecoder().decode(bytes) };
    commits.push(koerper.message);
    return antwort(200, { content: { sha: datei.sha } });
  }) as typeof fetch;

  return {
    fetchFn,
    commits,
    get datei() {
      return datei;
    },
    get schreibversuche() {
      return schreibversuche;
    },
    /** Ein anderes Gerät schreibt dazwischen. */
    fremdSchreiben(inhalt: string) {
      datei = { sha: `sha${++zaehler}`, inhalt };
    },
  };
}

function umgebung(fetchFn: typeof fetch, uhr = { t: 1_700_000_000_000 }): Umgebung & { uhr: { t: number } } {
  const ablage = new Map<string, string>();
  return {
    fetch: fetchFn,
    speicher: {
      getItem: (k) => ablage.get(k) ?? null,
      setItem: (k, v) => void ablage.set(k, v),
      removeItem: (k) => void ablage.delete(k),
    },
    jetzt: () => uhr.t,
    uhr,
  };
}

const ZUGANG = { repo: 'julian/bruehwerk-daten', token: 'gut' };

beforeEach(async () => {
  await _datenbankZuruecksetzen();
});

describe('Einrichten', () => {
  it('leere Cloud: sichert sofort und gibt automatisches Sichern frei', async () => {
    const gh = falschesGithub();
    const u = umgebung(gh.fetchFn);
    await schreiben('muehle', MUEHLE_SCULPTOR);

    const e = await einrichten(ZUGANG, u);

    expect(e.art).toBe('gesichert');
    expect(zustandLesen(u).freigegeben).toBe(true);
    expect(zustandLesen(u).sha).toBe('sha1');
    const stand = await cloudLesen(ZUGANG, u);
    expect(stand?.datei.sammlungen.muehle).toHaveLength(1);
  });

  it('falscher Token: CloudFehler "zugang", nichts gespeichert', async () => {
    const u = umgebung(falschesGithub().fetchFn);
    await expect(einrichten({ ...ZUGANG, token: 'falsch' }, u)).rejects.toMatchObject({ art: 'zugang' });
    expect(zustandLesen(u).zugang).toBeUndefined();
  });

  it('unbekanntes Repo: CloudFehler "repo"', async () => {
    const u = umgebung(falschesGithub().fetchFn);
    await expect(einrichten({ ...ZUGANG, repo: 'julian/gibtsnicht' }, u)).rejects.toMatchObject({ art: 'repo' });
  });

  it('Schutzregel 1: liegt schon ein Stand in der Cloud, sichert ein neues Geraet NICHT automatisch', async () => {
    const gh = falschesGithub();
    // Erstes Geraet mit Daten
    const telefon = umgebung(gh.fetchFn);
    await schreiben('muehle', MUEHLE_SCULPTOR);
    await einrichten(ZUGANG, telefon);

    // Zweites Geraet: leer
    await _datenbankZuruecksetzen();
    const tablet = umgebung(gh.fetchFn);
    const e = await einrichten(ZUGANG, tablet);

    expect(e.art).toBe('entscheiden');
    expect(zustandLesen(tablet).freigegeben).toBe(false);
    const vorher = gh.schreibversuche;
    await schreiben('muehle', MUEHLE_K6);
    await sichern(tablet);
    expect(gh.schreibversuche).toBe(vorher); // nicht einmal versucht
    expect(gh.commits).toHaveLength(1); // nur die erste Sicherung des Telefons
  });
});

describe('Zurueckholen', () => {
  it('spielt den Cloud-Stand ein, legt vorher eine Geraete-Sicherung an und gibt danach frei', async () => {
    const gh = falschesGithub();
    const telefon = umgebung(gh.fetchFn);
    await schreiben('muehle', MUEHLE_SCULPTOR);
    await schreiben('muehle', MUEHLE_K6);
    await einrichten(ZUGANG, telefon);

    await _datenbankZuruecksetzen();
    const tablet = umgebung(gh.fetchFn);
    await einrichten(ZUGANG, tablet);
    await zurueckholen(tablet);

    expect(await alle('muehle')).toHaveLength(2);
    expect((await schnappschuesse())[0]?.anlass).toBe('vor dem Zurückholen aus der Cloud');
    expect(zustandLesen(tablet).freigegeben).toBe(true);

    // Danach sichert das Tablet auf dem Stand des Telefons auf, ohne Konflikt.
    await loeschen('muehle', MUEHLE_K6.id);
    await sichern(tablet);
    expect(zustandLesen(tablet).konflikt).toBeFalsy();
    expect((await cloudLesen(ZUGANG, tablet))?.datei.sammlungen.muehle).toHaveLength(1);
  });
});

describe('Sichern', () => {
  it('ohne Aenderung kein neuer Commit, mit Aenderung einer', async () => {
    const gh = falschesGithub();
    const u = umgebung(gh.fetchFn);
    await einrichten(ZUGANG, u);
    expect(gh.commits).toHaveLength(1);

    await sichern(u);
    expect(gh.commits).toHaveLength(1);

    await schreiben('muehle', MUEHLE_K6);
    await sichern(u);
    expect(gh.commits).toHaveLength(2);
  });

  it('Schutzregel 2: hat ein anderes Geraet gesichert, wird nicht ueberschrieben — Zustand "konflikt"', async () => {
    const gh = falschesGithub();
    const u = umgebung(gh.fetchFn);
    await einrichten(ZUGANG, u);
    gh.fremdSchreiben('{"schemaVersion":1,"erzeugtAm":1,"sammlungen":{}}');

    await schreiben('muehle', MUEHLE_K6);
    await sichern(u);

    expect(zustandLesen(u).konflikt).toBe(true);
    expect(gh.datei?.inhalt).toContain('"sammlungen":{}'); // fremder Stand unangetastet

    // Solange der Konflikt steht, versucht die App es nicht weiter.
    const vorher = gh.schreibversuche;
    await schreiben('muehle', MUEHLE_SCULPTOR);
    await sichern(u);
    expect(gh.schreibversuche).toBe(vorher);
    expect(gh.commits).toHaveLength(1);

    // Bewusst ueberschreiben loest ihn.
    await ueberschreiben(u);
    expect(zustandLesen(u).konflikt).toBe(false);
    expect((await cloudLesen(ZUGANG, u))?.datei.sammlungen.muehle).toHaveLength(2);
  });

  it('Konflikt zusammenfuehren: Neues von dort kommt dazu, die Aenderung hier bleibt', async () => {
    const gh = falschesGithub();
    const telefon = umgebung(gh.fetchFn);
    await schreiben('muehle', MUEHLE_SCULPTOR);
    await einrichten(ZUGANG, telefon);

    // Tablet holt, legt eine neue Muehle an und sichert
    const telefonBestand = await alle('muehle');
    await _datenbankZuruecksetzen();
    const tablet = umgebung(gh.fetchFn);
    await einrichten(ZUGANG, tablet);
    await zurueckholen(tablet);
    await schreiben('muehle', MUEHLE_K6);
    await sichern(tablet);

    // Telefon (eigener Bestand) aendert dieselbe Muehle und laeuft in den Konflikt
    await _datenbankZuruecksetzen();
    for (const m of telefonBestand) await schreiben('muehle', m);
    await schreiben('muehle', { ...MUEHLE_SCULPTOR, name: 'am Telefon umbenannt' });
    await sichern(telefon);
    expect(zustandLesen(telefon).konflikt).toBe(true);

    await zusammenfuehren(telefon);

    const hier = await alle('muehle');
    expect(hier.map((m) => m.id).sort()).toEqual([MUEHLE_K6.id, MUEHLE_SCULPTOR.id].sort());
    expect(hier.find((m) => m.id === MUEHLE_SCULPTOR.id)?.name).toBe('am Telefon umbenannt');
    const cloud = (await cloudLesen(ZUGANG, telefon))!.datei.sammlungen.muehle;
    expect(cloud.find((m) => m.id === MUEHLE_SCULPTOR.id)?.name).toBe('am Telefon umbenannt');
    expect(cloud).toHaveLength(2);
    expect(zustandLesen(telefon).konflikt).toBe(false);
  });

  it('wirft nie — ein Netzfehler landet im Zustand', async () => {
    const gh = falschesGithub();
    const u = umgebung(gh.fetchFn);
    await einrichten(ZUGANG, u);
    const offline = umgebung((async () => {
      throw new TypeError('Failed to fetch');
    }) as typeof fetch);
    // gleicher Speicher wie u, nur ohne Netz
    const ohneNetz: Umgebung = { ...u, fetch: offline.fetch };

    await schreiben('muehle', MUEHLE_K6);
    await expect(sichern(ohneNetz)).resolves.toBeUndefined();
    expect(zustandLesen(u).letzterFehler).toBe('Keine Verbindung zu GitHub.');
  });

  it('Umlaute und grosse Bestaende kommen unversehrt an', async () => {
    const gh = falschesGithub();
    const u = umgebung(gh.fetchFn);
    await schreiben('muehle', { ...MUEHLE_K6, name: 'Mühle „Größe“ ☕' });
    await einrichten(ZUGANG, u);
    const stand = await cloudLesen(ZUGANG, u);
    expect(stand?.datei.sammlungen.muehle[0]?.name).toBe('Mühle „Größe“ ☕');
  });
});

describe('Abholen — das zweite Geraet bekommt den Stand des ersten', () => {
  /** Telefon und Tablet sind eingerichtet und auf demselben Stand; die DB gehoert jeweils dem aktiven Geraet. */
  async function zweiGeraete() {
    const gh = falschesGithub();
    const telefon = umgebung(gh.fetchFn);
    await schreiben('muehle', MUEHLE_SCULPTOR);
    await einrichten(ZUGANG, telefon);
    const telefonBestand = await alle('muehle');

    await _datenbankZuruecksetzen();
    const tablet = umgebung(gh.fetchFn);
    await einrichten(ZUGANG, tablet);
    await zurueckholen(tablet);
    await sichern(tablet);
    const tabletBestand = await alle('muehle');
    return { gh, telefon, tablet, telefonBestand, tabletBestand };
  }
  async function aufGeraet(bestandListe: Awaited<ReturnType<typeof alle<'muehle'>>>) {
    await _datenbankZuruecksetzen();
    for (const m of bestandListe) await schreiben('muehle', m);
  }

  it('Telefon sichert Neues, Tablet ohne eigene Aenderung holt es still', async () => {
    const { gh, telefon, tablet, telefonBestand, tabletBestand } = await zweiGeraete();

    await aufGeraet(telefonBestand);
    // Telefon: der Zustand kennt noch den Stand vor dem Tablet — erst abholen, dann aendern
    expect(await abholen(telefon)).toBe('geholt');
    await schreiben('muehle', MUEHLE_K6);
    await sichern(telefon);
    const commitsNachTelefon = gh.commits.length;

    await aufGeraet(tabletBestand);
    expect(await abholen(tablet)).toBe('geholt');
    expect((await alle('muehle')).map((m) => m.id)).toContain(MUEHLE_K6.id);
    expect(zustandLesen(tablet).konflikt).toBeFalsy();

    // Kein unnoetiger Commit: der geholte Stand ist der Cloud-Stand.
    await sichern(tablet);
    expect(gh.commits.length).toBe(commitsNachTelefon);
    // Und beim naechsten Mal ist nichts mehr zu holen.
    expect(await abholen(tablet)).toBe('aktuell');
  });

  it('Tablet mit eigenem Ungesichertem holt NICHT still, sondern meldet Konflikt', async () => {
    const { telefon, tablet, telefonBestand, tabletBestand } = await zweiGeraete();

    await aufGeraet(telefonBestand);
    await abholen(telefon);
    await schreiben('muehle', MUEHLE_K6);
    await sichern(telefon);

    await aufGeraet(tabletBestand);
    await schreiben('muehle', { ...MUEHLE_SCULPTOR, name: 'am Tablet geaendert' });
    expect(await abholen(tablet)).toBe('konflikt');
    expect((await alle('muehle')).find((m) => m.id === MUEHLE_SCULPTOR.id)?.name).toBe('am Tablet geaendert');
    expect((await alle('muehle')).some((m) => m.id === MUEHLE_K6.id)).toBe(false);
  });

  it('ohne Netz: Ergebnis "fehler", nichts geaendert, wirft nicht', async () => {
    const { tablet } = await zweiGeraete();
    const ohneNetz: Umgebung = { ...tablet, fetch: (async () => { throw new TypeError('Failed to fetch'); }) as typeof fetch };
    await expect(abholen(ohneNetz)).resolves.toBe('fehler');
  });

  it('nicht eingerichtet oder nicht freigegeben: tut nichts', async () => {
    const u = umgebung(falschesGithub().fetchFn);
    expect(await abholen(u)).toBe('aus');
  });
});

describe('Token ersetzen', () => {
  it('abgelaufener Token: neuer Token fuer dasselbe Repo, danach wird sofort gesichert', async () => {
    const gh = falschesGithub();
    const u = umgebung(gh.fetchFn);
    await einrichten(ZUGANG, u);
    // dasselbe Repo, nur akzeptiert es ab jetzt einen anderen Token
    const nurNeu: Umgebung = { ...u, fetch: ((eingabe: RequestInfo | URL, init?: RequestInit) => {
      const kopf = new Headers(init?.headers);
      if (kopf.get('Authorization') !== 'Bearer neu') return Promise.resolve(new Response('{}', { status: 401 }));
      kopf.set('Authorization', 'Bearer gut');
      return gh.fetchFn(eingabe, { ...init, headers: kopf });
    }) as typeof fetch };

    await schreiben('muehle', MUEHLE_K6);
    await sichern(nurNeu);
    expect(zustandLesen(u).letzterFehler).toMatch(/Token/);

    await expect(tokenErsetzen('falsch', nurNeu)).rejects.toMatchObject({ art: 'zugang' });
    await tokenErsetzen('neu', nurNeu);
    expect(zustandLesen(u).letzterFehler).toBeUndefined();
    expect(zustandLesen(u).zugang?.token).toBe('neu');
    expect(gh.commits).toHaveLength(2);
  });
});

describe('wartetSeit — die Meldung in der Bar', () => {
  const T = 1_700_000_000_000;
  it('ohne Zugang nie', () => {
    expect(wartetSeit({ freigegeben: false }, T)).toBeUndefined();
  });
  it('kurz nach einem Fehler noch nicht, nach drei Tagen ohne gelungene Sicherung schon', () => {
    const z = { zugang: ZUGANG, freigegeben: true, eingerichtetAm: T, letzteSicherungAm: T, letzterFehler: 'x' };
    expect(wartetSeit(z, T + WARTET_AB_MS - 1)).toBeUndefined();
    expect(wartetSeit(z, T + WARTET_AB_MS)).toBe(T);
  });
  it('nie gelungen: zaehlt ab der Einrichtung (z. B. Entscheidung auf dem neuen Geraet offen)', () => {
    const z = { zugang: ZUGANG, freigegeben: false, eingerichtetAm: T };
    expect(wartetSeit(z, T + WARTET_AB_MS)).toBe(T);
  });
});

describe('CloudFehler', () => {
  it('ist ein Error mit Art', () => {
    const f = new CloudFehler('netz', 'x');
    expect(f).toBeInstanceOf(Error);
    expect(f.art).toBe('netz');
  });
});
