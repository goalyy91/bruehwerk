<script lang="ts">
  // Cloud-Sicherung (14.11.2026) — Bildschirm zu daten/cloud.ts.
  //
  // UX: vier Zustände, je eine Primäraktion (ux-regeln R3):
  //   nicht eingerichtet  → verbinden
  //   neues Gerät, Cloud hat schon einen Stand → auf dieses Gerät holen
  //   Konflikt (anderes Gerät hat gesichert)   → zusammenführen
  //   läuft               → keine Primäraktion; es gibt nichts zu tun
  // Alles, was Daten ersetzt, braucht einen zweiten Tap ("wirklich?") —
  // dasselbe Muster wie Sicherungen.svelte.
  //
  // Design: nur vorhandene Muster — Kopfzeile, Blattliste mit Formularzeilen,
  // Blattzeile, Knopf. Kein neues Muster.

  import {
    zustandLesen,
    zustandBeobachten,
    statusSatz,
    einrichten,
    zurueckholen,
    ueberschreiben,
    sichern,
    trennen,
    tokenErsetzen,
    zusammenfuehren,
    cloudLesen,
    CloudFehler,
    type CloudZustand,
    type CloudStand,
  } from '../../daten/cloud';
  import { ImportFehler } from '../../daten/export';
  import { bestand } from '../bestand.svelte';
  import Kopfzeile from '../../muster/Kopfzeile.svelte';
  import Blattliste from '../../muster/Blattliste.svelte';
  import Blattzeile from '../../muster/Blattzeile.svelte';
  import Knopf from '../../muster/Knopf.svelte';

  let { onZurueck }: { onZurueck: () => void } = $props();

  let zustand = $state<CloudZustand>(zustandLesen());
  $effect(() => zustandBeobachten((z) => (zustand = z)));

  let repo = $state('');
  let token = $state('');
  let beschaeftigt = $state(false);
  let fehler = $state<string | undefined>(undefined);
  let meldung = $state<string | undefined>(undefined);
  let bestaetigen = $state<'ueberschreiben' | 'zurueckholen' | 'trennen' | undefined>(undefined);
  let cloudStand = $state<CloudStand | undefined>(undefined);

  /** Was in der Cloud liegt — nur gebraucht, solange eine Entscheidung offen ist. */
  $effect(() => {
    const z = zustand;
    if (!z.zugang || (z.freigegeben && !z.konflikt)) {
      cloudStand = undefined;
      return;
    }
    void cloudLesen(z.zugang)
      .then((s) => (cloudStand = s))
      .catch(() => (cloudStand = undefined));
  });

  function wann(ts: number): string {
    const d = new Date(ts);
    return `${d.toLocaleDateString('de-DE')} ${d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}`;
  }

  function umfang(s: CloudStand): string {
    const n = s.datei.sammlungen;
    return `${n.shot?.length ?? 0} Shots · ${n.kaffee?.length ?? 0} Kaffees · ${n.uebungsantwort?.length ?? 0} Aroma-Antworten`;
  }

  function fehlerText(e: unknown): string {
    if (e instanceof ImportFehler) return `Der Cloud-Stand passt nicht zum Schema — nichts geschrieben: ${e.einzelfehler.map((f) => `${f.sammlung}[${f.index}]`).join(', ')}`;
    if (e instanceof CloudFehler || e instanceof Error) return e.message;
    return String(e);
  }

  async function ausfuehren(tat: () => Promise<unknown>, erfolg?: string) {
    beschaeftigt = true;
    fehler = undefined;
    meldung = undefined;
    bestaetigen = undefined;
    try {
      await tat();
      if (erfolg) meldung = erfolg;
    } catch (e) {
      fehler = fehlerText(e);
    } finally {
      beschaeftigt = false;
    }
  }

  function verbinden() {
    void ausfuehren(async () => {
      const ergebnis = await einrichten({ repo, token });
      token = '';
      if (ergebnis.art === 'gesichert') meldung = 'Verbunden und gesichert. Ab jetzt automatisch.';
    });
  }

  function holen() {
    if (zustand.freigegeben && bestaetigen !== 'zurueckholen') {
      bestaetigen = 'zurueckholen';
      return;
    }
    void ausfuehren(async () => {
      await zurueckholen();
      await bestand.laden();
      await sichern();
    }, 'Cloud-Stand übernommen.');
  }

  function konfliktLoesen() {
    void ausfuehren(async () => {
      await zusammenfuehren();
      await bestand.laden();
    }, 'Zusammengeführt und gesichert.');
  }

  function cloudUeberschreiben() {
    if (bestaetigen !== 'ueberschreiben') {
      bestaetigen = 'ueberschreiben';
      return;
    }
    void ausfuehren(() => ueberschreiben(), 'Cloud mit diesem Gerät überschrieben.');
  }

  function verbindungTrennen() {
    if (bestaetigen !== 'trennen') {
      bestaetigen = 'trennen';
      return;
    }
    trennen();
    bestaetigen = undefined;
    meldung = 'Getrennt. Die Datei in der Cloud bleibt liegen.';
  }

  let tokenFeldOffen = $state(false);
  let neuerToken = $state('');

  function neuenTokenUebernehmen() {
    void ausfuehren(async () => {
      await tokenErsetzen(neuerToken);
      neuerToken = '';
      tokenFeldOffen = false;
    }, 'Neuer Token gilt. Gesichert.');
  }

  const commitsUrl = $derived(zustand.zugang ? `https://github.com/${zustand.zugang.repo}/commits` : undefined);
</script>

<Kopfzeile titel="Cloud-Sicherung" {onZurueck} />

{#if !zustand.zugang}
  <p class="erklaerung">
    Sichert alles automatisch in ein privates GitHub-Repo — kurz nach jeder
    Änderung. Auf einem neuen Gerät holst du den Stand von dort zurück.
  </p>
  <ol class="schritte">
    <li>Auf GitHub ein <strong>privates</strong> Repo anlegen, z. B. <code>bruehwerk-daten</code>.</li>
    <li>
      Settings → Developer settings → Fine-grained tokens: nur dieses Repo,
      Recht <em>Contents: Read and write</em>.
    </li>
    <li>Beides hier eintragen.</li>
  </ol>
  <Blattliste>
    <div class="formularzeile">
      <span class="formularzeile-label">Repo</span>
      <input class="eingabefeld-text" type="text" placeholder="besitzer/bruehwerk-daten" autocapitalize="off" autocomplete="off" spellcheck="false" bind:value={repo} />
    </div>
    <div class="formularzeile">
      <span class="formularzeile-label">Token</span>
      <input class="eingabefeld-text" type="password" placeholder="github_pat_…" autocomplete="off" spellcheck="false" bind:value={token} />
    </div>
  </Blattliste>
  <div class="knopfreihe">
    <Knopf stufe="primaer" onKlick={verbinden} deaktiviert={beschaeftigt || !repo.trim() || !token.trim()}>
      {beschaeftigt ? 'verbinde …' : 'verbinden'}
    </Knopf>
  </div>
  <p class="nachsatz">
    Der Token bleibt nur auf diesem Gerät, nie in einer Export-Datei. Wird
    hier alles gelöscht, trägst du ihn einmal neu ein.
  </p>
{:else if !zustand.freigegeben || zustand.konflikt}
  <p class="satz">
    {#if zustand.konflikt}
      Ein anderes Gerät hat inzwischen gesichert. Bis du entscheidest, sichert
      dieses Gerät nicht weiter — lokal ist nichts verloren.
    {:else}
      In der Cloud liegt schon ein Stand. Bevor dieses Gerät sichert:
      welcher soll gelten?
    {/if}
  </p>
  {#if cloudStand}
    <p class="nachsatz">Cloud-Stand vom {wann(cloudStand.datei.erzeugtAm)} · {umfang(cloudStand)}</p>
  {/if}
  <div class="knopfreihe">
    <Knopf stufe="primaer" onKlick={zustand.konflikt ? konfliktLoesen : holen} deaktiviert={beschaeftigt}>
      {zustand.konflikt ? 'zusammenführen' : 'auf dieses Gerät holen'}
    </Knopf>
    <Knopf stufe="still" onKlick={cloudUeberschreiben} deaktiviert={beschaeftigt}>
      {bestaetigen === 'ueberschreiben' ? 'wirklich überschreiben?' : 'Cloud mit diesem Gerät überschreiben'}
    </Knopf>
  </div>
  <p class="nachsatz">
    {#if zustand.konflikt}
      Zusammenführen nimmt aus der Cloud alles dazu, was hier fehlt; ist ein
      Eintrag auf beiden Seiten verschieden, gilt der von diesem Gerät.
    {:else}
      Holen nimmt alles aus der Cloud dazu; ist ein Eintrag auf beiden Seiten
      verschieden, gilt der aus der Cloud.
    {/if}
    Vorher legt die App eine Sicherung auf diesem Gerät an.
    Überschreiben ersetzt den Cloud-Stand — der alte bleibt in der
    Versionsgeschichte des Repos.
  </p>
{:else}
  <p class="satz">{statusSatz(zustand, Date.now())}</p>
  {#if zustand.letzterFehler && (!zustand.letzteSicherungAm || (zustand.letzterFehlerAm ?? 0) > zustand.letzteSicherungAm)}
    <p class="nachsatz">Zuletzt: {zustand.letzterFehler}</p>
  {/if}
  <Blattliste>
    <Blattzeile label="jetzt sichern" akzent chevron={false} onKlick={() => void ausfuehren(() => sichern(), 'Gesichert.')} />
    <Blattzeile
      label={bestaetigen === 'zurueckholen' ? 'wirklich zurückholen?' : 'aus der Cloud zurückholen'}
      akzent
      chevron={false}
      onKlick={holen}
    />
    <Blattzeile label="Token ersetzen" meta={zustand.letzterFehler?.includes('Token') ? 'abgelaufen? hier erneuern' : undefined} akzent chevron={false} onKlick={() => (tokenFeldOffen = !tokenFeldOffen)} />
    {#if commitsUrl}
      <Blattzeile label="Versionen auf GitHub" meta={zustand.zugang.repo} akzent onKlick={() => window.open(commitsUrl, '_blank', 'noopener')} />
    {/if}
    <Blattzeile
      label={bestaetigen === 'trennen' ? 'wirklich trennen?' : 'trennen'}
      gedaempft
      chevron={false}
      onKlick={verbindungTrennen}
    />
  </Blattliste>
  {#if tokenFeldOffen}
    <Blattliste>
      <div class="formularzeile">
        <span class="formularzeile-label">Neuer Token</span>
        <input class="eingabefeld-text" type="password" placeholder="github_pat_…" autocomplete="off" spellcheck="false" bind:value={neuerToken} />
      </div>
    </Blattliste>
    <div class="knopfreihe">
      <Knopf stufe="primaer" onKlick={neuenTokenUebernehmen} deaktiviert={beschaeftigt || !neuerToken.trim()}>übernehmen</Knopf>
    </div>
  {/if}
{/if}

{#if meldung}<p class="nachsatz">{meldung}</p>{/if}
{#if fehler}<p class="fehler">{fehler}</p>{/if}

<style>
  .erklaerung,
  .satz {
    font-family: var(--schrift-sans);
    font-size: var(--fs-satz);
    color: var(--tinte);
    margin: 0 0 var(--r3);
  }
  .schritte {
    font-family: var(--schrift-sans);
    font-size: var(--fs-meta);
    color: var(--gedaempft);
    margin: 0 0 var(--r3);
    padding-left: var(--r4);
  }
  .schritte li {
    margin-bottom: var(--r1);
  }
  .nachsatz {
    font-family: var(--schrift-sans);
    font-size: var(--fs-meta);
    color: var(--gedaempft);
    margin: var(--r3) 0;
  }
  .knopfreihe {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--r2);
    margin-top: var(--r3);
  }
  .fehler {
    color: var(--kritisch);
    font-size: var(--fs-satz);
    margin-top: var(--r3);
  }
</style>
