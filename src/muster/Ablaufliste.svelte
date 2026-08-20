<script lang="ts">
  // Muster 8 · Abhakbare Ablaufliste (Übergabe, Abschnitt 2 · K2 K37 K62 K78).
  // Abgehakt werden nur Getränke, Positionen oder Durchgänge — nie
  // Handgriffe. Erledigtes fällt in eine Falte oben. Zustände: offen (Ring
  // rechts) · erledigt (in der Falte, Zählung im Kopf) · aktiv (volle
  // Fläche, Fastway-Form — hier vereinfacht als Hervorhebung) · leer
  // (Erststart-Kette: drei Zeilen, keine Zählung, kein Fortschritt).

  import { untrack } from 'svelte';

  type Zeile = { id: string; label: string; erledigt?: boolean };

  let {
    variant = 'standard',
    zeilen,
    aktivId,
  }: {
    variant?: 'standard' | 'erststart';
    zeilen: Zeile[];
    aktivId?: string;
  } = $props();

  // zeilen dient nur als Anfangsbestand — die Erledigt-Zustände lebt
  // danach in der Komponente. untrack() macht das Nur-einmal-lesen explizit.
  const status = $state<Record<string, boolean>>(
    untrack(() => Object.fromEntries(zeilen.map((z) => [z.id, z.erledigt ?? false]))),
  );
  let falteOffen = $state(false);

  function abhaken(id: string) {
    status[id] = !status[id];
  }

  const offeneZeilen = $derived(zeilen.filter((z) => !status[z.id]));
  const erledigteZeilen = $derived(zeilen.filter((z) => status[z.id]));
</script>

{#if variant === 'erststart'}
  <div class="erststart">
    {#each zeilen as zeile (zeile.id)}
      <div class="erststart-zeile">
        <span class="label">{zeile.label}</span>
        <span class="ring"></span>
      </div>
    {/each}
  </div>
{:else if zeilen.length === 0}
  <div class="leer">kein Punkt</div>
{:else}
  <div class="liste">
    {#if erledigteZeilen.length > 0}
      <button type="button" class="falte" onclick={() => (falteOffen = !falteOffen)}>
        erledigt · {erledigteZeilen.length}
      </button>
      {#if falteOffen}
        {#each erledigteZeilen as zeile (zeile.id)}
          <div class="zeile erledigt" onclick={() => abhaken(zeile.id)} role="button" tabindex="0" onkeydown={(e) => e.key === 'Enter' && abhaken(zeile.id)}>
            <span class="label">{zeile.label}</span>
            <span class="haken">✓</span>
          </div>
        {/each}
      {/if}
    {/if}
    {#each offeneZeilen as zeile (zeile.id)}
      <div class="zeile" class:aktiv={zeile.id === aktivId}>
        <span class="label">{zeile.label}</span>
        <button type="button" class="ring-knopf" onclick={() => abhaken(zeile.id)} aria-label="abhaken">
          <span class="ring"></span>
        </button>
      </div>
    {/each}
  </div>
{/if}

<style>
  .liste {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }
  .zeile {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 64px;
    padding: 0 var(--r4);
    background: var(--feld);
  }
  .zeile.aktiv {
    background: var(--feld);
    box-shadow: inset 2px 0 0 0 var(--akzent);
  }
  .zeile.erledigt {
    background: var(--ruhig);
    color: var(--gedaempft);
    cursor: pointer;
  }
  .label {
    font-size: var(--fs-satz);
    color: inherit;
  }
  .ring-knopf {
    width: var(--treffer);
    height: var(--treffer);
    border: none;
    background: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .ring {
    display: inline-block;
    width: var(--zeichen);
    height: var(--zeichen);
    border: 1px solid var(--gedaempft);
    border-radius: 50%;
  }
  .haken {
    color: var(--akzent);
  }
  .falte {
    min-height: 48px;
    padding: 0 var(--r4);
    border: none;
    background: var(--ruhig);
    color: var(--gedaempft);
    font-family: var(--schrift);
    font-size: var(--fs-meta);
    text-align: left;
    cursor: pointer;
  }
  .leer {
    padding: var(--r4);
    color: var(--gedaempft);
    font-size: var(--fs-satz);
  }

  .erststart {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }
  .erststart-zeile {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 64px;
    padding: 0 var(--r4);
    background: var(--feld);
  }
</style>
