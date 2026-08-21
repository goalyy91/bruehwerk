<script lang="ts">
  // Geraete — reine Anzeige, kein eigener Navigations-Zustand mehr (Teil 5
  // der Korrekturrunde). Zwei Bildschirme mit je eigenem Zurueck-Button
  // uebereinander kamen genau daher, dass diese Komponente frueher eine
  // eigene Navigations-Ebene neben Einstellungen.svelte fuehrte.
  // Einstellungen.svelte ist jetzt der einzige Navigations-Eigentuemer fuer
  // den gesamten Geraete-Teilbaum, so wie Kaffees.svelte es fuer
  // Kaffee/Profil bereits richtig macht.

  import { bestand, loeschen } from '../bestand.svelte';

  let {
    onOeffnenMuehle,
    onOeffnenBruehgeraet,
    onOeffnenSetup,
  }: {
    onOeffnenMuehle: (id?: string) => void;
    onOeffnenBruehgeraet: (id?: string) => void;
    onOeffnenSetup: (id?: string) => void;
  } = $props();

  // Kein stilles Kaskadenloeschen (offene-punkte-ux.md Punkt 1): eine Muehle
  // oder ein Bruehgeraet, das noch in einem Setup steckt, wuerde
  // bestand.muehleVon()/bruehgeraetVon() sonst plötzlich undefined liefern.
  // Ein Setup, das noch in einem Profil steckt, ist ebenso geschuetzt.
  async function muehleLoeschen(id: string, name: string) {
    const anzahl = bestand.setups.filter((s) => s.muehleId === id).length;
    if (anzahl > 0) {
      alert(`„${name}“ wird noch von ${anzahl} Setup${anzahl === 1 ? '' : 's'} benutzt und kann nicht gelöscht werden.`);
      return;
    }
    if (!confirm(`„${name}“ wirklich löschen?`)) return;
    await loeschen('muehle', id);
  }

  async function bruehgeraetLoeschen(id: string, name: string) {
    const anzahl = bestand.setups.filter((s) => s.bruehgeraetId === id).length;
    if (anzahl > 0) {
      alert(`„${name}“ wird noch von ${anzahl} Setup${anzahl === 1 ? '' : 's'} benutzt und kann nicht gelöscht werden.`);
      return;
    }
    if (!confirm(`„${name}“ wirklich löschen?`)) return;
    await loeschen('bruehgeraet', id);
  }

  async function setupLoeschen(id: string, name: string) {
    const anzahl = bestand.profile.filter((p) => p.setupId === id).length;
    if (anzahl > 0) {
      alert(`„${name}“ wird noch von ${anzahl} Profil${anzahl === 1 ? '' : 'en'} benutzt und kann nicht gelöscht werden.`);
      return;
    }
    if (!confirm(`„${name}“ wirklich löschen?`)) return;
    await loeschen('setup', id);
  }
</script>

{#snippet loeschenSymbol()}
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">
    <path d="M5 7h14M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-9 0 1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" />
  </svg>
{/snippet}

<h2>Mühlen</h2>
<ul class="liste">
  {#each bestand.muehlen as m (m.id)}
    <li class="zeilen-gruppe">
      <button type="button" class="zeile" onclick={() => onOeffnenMuehle(m.id)}>{m.name}</button>
      <button type="button" class="loeschen" onclick={() => muehleLoeschen(m.id, m.name)} aria-label="Mühle löschen">
        {@render loeschenSymbol()}
      </button>
    </li>
  {/each}
</ul>
<button type="button" class="fusszeile" onclick={() => onOeffnenMuehle()}>+ Mühle</button>

<h2>Brühgeräte</h2>
<ul class="liste">
  {#each bestand.bruehgeraete as b (b.id)}
    <li class="zeilen-gruppe">
      <button type="button" class="zeile" onclick={() => onOeffnenBruehgeraet(b.id)}>{b.name}</button>
      <button type="button" class="loeschen" onclick={() => bruehgeraetLoeschen(b.id, b.name)} aria-label="Brühgerät löschen">
        {@render loeschenSymbol()}
      </button>
    </li>
  {/each}
</ul>
<button type="button" class="fusszeile" onclick={() => onOeffnenBruehgeraet()}>+ Brühgerät</button>

<h2>Setups</h2>
<ul class="liste">
  {#each bestand.setups as s (s.id)}
    <li class="zeilen-gruppe">
      <button type="button" class="zeile" onclick={() => onOeffnenSetup(s.id)}>{s.name}</button>
      <button type="button" class="loeschen" onclick={() => setupLoeschen(s.id, s.name)} aria-label="Setup löschen">
        {@render loeschenSymbol()}
      </button>
    </li>
  {/each}
</ul>
<button type="button" class="fusszeile" onclick={() => onOeffnenSetup()}>+ Setup</button>

<style>
  h2 {
    font-size: var(--fs-label);
    letter-spacing: var(--label-spacing);
    text-transform: uppercase;
    color: var(--gedaempft);
    font-weight: var(--gw-text);
    margin: var(--r5) 0 var(--r2);
  }
  .liste {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .zeilen-gruppe {
    display: flex;
    align-items: center;
    gap: var(--r1);
  }
  .zeile {
    flex: 1;
    min-width: 0;
    display: block;
    min-height: var(--treffer);
    padding: var(--r2) 0;
    border: none;
    border-bottom: 1px solid var(--linie-zart);
    background: transparent;
    font-family: var(--schrift);
    font-size: var(--fs-satz);
    color: var(--tinte);
    text-align: left;
    cursor: pointer;
  }
  .loeschen {
    flex-shrink: 0;
    width: var(--treffer);
    height: var(--treffer);
    margin-right: calc(var(--r2) * -1);
    border: none;
    background: none;
    color: var(--gedaempft);
    cursor: pointer;
  }
  .loeschen svg {
    width: 20px;
    height: 20px;
  }
  .fusszeile {
    display: block;
    width: 100%;
    min-height: 40px;
    margin-top: var(--r2);
    background: none;
    border: none;
    color: var(--akzent);
    font-family: var(--schrift);
    font-size: var(--fs-meta);
    text-align: left;
    cursor: pointer;
  }
</style>
