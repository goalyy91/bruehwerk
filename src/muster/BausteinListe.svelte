<script lang="ts">
  // Muster 9 · Baustein-Liste (Übergabe, Abschnitt 2 · K16 K69).
  // Typisierte Zeile: Typspalte 98 px fest, Kopfwert 19 px, Notizzeile
  // 13 px, Meta rechts. Bündel = Ebene mit Kopfzeile und Summe,
  // „auftrennen“ am Kopf, zugeklappt als Default. Trägt Gussplan und
  // Wartung.
  //
  // Ziehen ist im Musterblatt bewusst nicht nachgebildet (kein Drag & Drop
  // hier) — der Zustand „angehoben“ ist als Klick-Demo gezeigt, damit das
  // Aussehen geprüft werden kann. Das echte Ziehen kommt mit dem ersten
  // Bildschirm, der dieses Muster trägt (Gussplan-Editor, Paket 03).

  type Zeile = { id: string; typ: string; kopfwert: string; notiz?: string; meta?: string };
  type Buendel = { titel: string; summe: string; zeilen: Zeile[] };

  let {
    zeilen,
    buendel,
  }: {
    zeilen?: Zeile[];
    buendel?: Buendel;
  } = $props();

  let angehobenId = $state<string | undefined>(undefined);
  let buendelOffen = $state(false);
</script>

{#if buendel}
  <div class="ebene">
    <button type="button" class="buendelkopf" onclick={() => (buendelOffen = !buendelOffen)}>
      <span class="titel">{buendel.titel}</span>
      <span class="summe">{buendel.summe}</span>
      {#if buendelOffen}<span class="auftrennen">auftrennen</span>{/if}
    </button>
    {#if buendelOffen}
      <div class="liste">
        {#each buendel.zeilen as zeile (zeile.id)}
          <div
            class="zeile"
            class:angehoben={angehobenId === zeile.id}
            onclick={() => (angehobenId = angehobenId === zeile.id ? undefined : zeile.id)}
            role="button"
            tabindex="0"
            onkeydown={(e) => e.key === 'Enter' && (angehobenId = angehobenId === zeile.id ? undefined : zeile.id)}
          >
            <span class="typ">{zeile.typ}</span>
            <div class="inhalt">
              <span class="kopfwert">{zeile.kopfwert}</span>
              {#if zeile.notiz || zeile.meta}
                <div class="unterzeile">
                  <span class="notiz">{zeile.notiz ?? ''}</span>
                  {#if zeile.meta}<span class="meta">{zeile.meta}</span>{/if}
                </div>
              {/if}
            </div>
            <span class="griff" aria-hidden="true"><span></span><span></span><span></span></span>
          </div>
        {/each}
      </div>
    {/if}
  </div>
{:else if zeilen}
  <div class="liste">
    {#each zeilen as zeile (zeile.id)}
      <div
        class="zeile"
        class:angehoben={angehobenId === zeile.id}
        onclick={() => (angehobenId = angehobenId === zeile.id ? undefined : zeile.id)}
        role="button"
        tabindex="0"
        onkeydown={(e) => e.key === 'Enter' && (angehobenId = angehobenId === zeile.id ? undefined : zeile.id)}
      >
        <span class="typ">{zeile.typ}</span>
        <div class="inhalt">
          <span class="kopfwert">{zeile.kopfwert}</span>
          {#if zeile.notiz || zeile.meta}
            <div class="unterzeile">
              <span class="notiz">{zeile.notiz ?? ''}</span>
              {#if zeile.meta}<span class="meta">{zeile.meta}</span>{/if}
            </div>
          {/if}
        </div>
        <span class="griff" aria-hidden="true"><span></span><span></span><span></span></span>
      </div>
    {/each}
  </div>
{/if}

<style>
  .ebene {
    display: flex;
    flex-direction: column;
  }
  .buendelkopf {
    display: flex;
    align-items: center;
    gap: var(--r3);
    min-height: 56px;
    padding: 0 var(--r4);
    border: 1px solid var(--feld-rahmen);
    background: var(--feld);
    color: var(--tinte);
    font-family: var(--schrift);
    cursor: pointer;
  }
  .buendelkopf .titel {
    flex: 1;
    text-align: left;
    font-size: var(--fs-satz);
    font-weight: var(--gw-titel);
  }
  .buendelkopf .summe {
    font-size: var(--fs-satz);
    color: var(--gedaempft);
  }
  .buendelkopf .auftrennen {
    font-size: var(--fs-meta);
    color: var(--akzent);
  }
  .liste {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }
  .zeile {
    display: flex;
    align-items: center;
    gap: var(--r3);
    min-height: 56px;
    padding: 0 var(--r4);
    background: var(--feld);
    border: 1px solid var(--feld-rahmen);
    cursor: grab;
  }
  .zeile.angehoben {
    box-shadow: inset 0 0 0 1px var(--akzent);
    transform: translateX(8px);
  }
  .typ {
    flex: none;
    width: var(--typspalte);
    font-size: var(--fs-meta);
    color: var(--gedaempft);
  }
  .inhalt {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }
  .kopfwert {
    font-size: var(--fs-urteil);
    color: var(--tinte);
  }
  .unterzeile {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--r2);
  }
  .notiz {
    font-size: var(--fs-meta);
    color: var(--gedaempft);
  }
  .meta {
    flex: none;
    font-size: var(--fs-meta);
    color: var(--gedaempft);
  }
  .griff {
    flex: none;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .griff span {
    display: block;
    width: 14px;
    height: 2px;
    background: var(--gedaempft);
  }
</style>
