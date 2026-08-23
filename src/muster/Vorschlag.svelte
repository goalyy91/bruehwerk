<script lang="ts">
  // Muster 4 · Vorschlag mit Übernehmen (Übergabe, Abschnitt 2).
  // Volle Form: Diagnose als Titel mit Zustandszeichen, eine Zeile
  // „Mahlgrad 3,65 → 3,60 · ein Schritt feiner, weil …“, Herkunft als Meta,
  // Knöpfe Übernehmen + Später. Dünne Form: 48 px, ein Satz, ohne Wert,
  // ohne „Später“ — für Angebote am Fuß (K21, K69).
  //
  // Zustände: offen · übernommen (Wert wechselt auf gefülltes Zeichen) ·
  // abgelehnt (gedämpfte Zeile mit Datum und Ring, „doch übernehmen“
  // bleibt; kehrt nicht ohne neue Daten zurück K68 K76) · fehlt mit
  // Begründung (außerhalb der Messreihe K67 K75).
  //
  // Visueller Redesign-Reset: Panel auf Blattfläche, „Übernehmen“ als
  // Füllflächen-Knopf statt hartem Akzent-Button mit fest hellem Text.

  import { untrack } from 'svelte';

  type Zustand = 'offen' | 'uebernommen' | 'abgelehnt' | 'fehlt';

  // Paket 04: kontrollierte Fassung (ux-regeln R6) — die drei Callbacks
  // lassen einen Aufrufer tatsaechlich etwas tun (Profil-Ziel schreiben,
  // Shot.vorschlag.zustand persistieren), statt dass der Klick nur die
  // eigene Optik umschaltet. Der interne zustand bleibt fuer die sofortige
  // visuelle Rueckmeldung bestehen, unabhaengig vom Speichern.
  let {
    form = 'voll',
    diagnose,
    empfehlung,
    herkunft,
    start = 'offen',
    begruendungFehlt,
    datum,
    onUebernehmen,
    onSpaeter,
    onDochUebernehmen,
  }: {
    form?: 'voll' | 'duenn';
    diagnose: string;
    empfehlung?: string;
    herkunft?: string;
    start?: Zustand;
    begruendungFehlt?: string;
    datum?: string;
    onUebernehmen?: () => void;
    onSpaeter?: () => void;
    onDochUebernehmen?: () => void;
  } = $props();

  let zustand = $state<Zustand>(untrack(() => start));

  function uebernehmen() {
    zustand = 'uebernommen';
    onUebernehmen?.();
  }
  function spaeter() {
    // bleibt „offen“ — der Vorschlag bleibt am Shot stehen (K10)
    onSpaeter?.();
  }
  function dochUebernehmen() {
    zustand = 'uebernommen';
    onDochUebernehmen?.();
  }
</script>

{#if form === 'duenn'}
  <div class="duenn" class:abgelehnt={zustand === 'abgelehnt'}>
    <span class="zeichen" class:voll={zustand === 'uebernommen'}></span>
    <span class="satz">{diagnose}</span>
    {#if zustand === 'offen'}
      <button type="button" class="uebernehmen-schmal" onclick={uebernehmen}>Übernehmen</button>
    {:else if zustand === 'abgelehnt'}
      <button type="button" class="doch" onclick={dochUebernehmen}>doch übernehmen</button>
    {/if}
  </div>
{:else}
  <div class="voll" class:abgelehnt={zustand === 'abgelehnt'}>
    <div class="titel-zeile">
      <span class="zeichen" class:voll={zustand === 'uebernommen'}></span>
      <span class="titel">{diagnose}</span>
    </div>

    {#if zustand === 'fehlt'}
      <div class="satz">{begruendungFehlt ?? 'außerhalb der Messreihe · kein Vorschlag'}</div>
    {:else}
      {#if empfehlung}<div class="satz">{empfehlung}</div>{/if}
      {#if herkunft}<div class="meta">{herkunft}</div>{/if}

      {#if zustand === 'offen'}
        <div class="knoepfe">
          <button type="button" class="uebernehmen" onclick={uebernehmen}>Übernehmen</button>
          <button type="button" class="spaeter" onclick={spaeter}>Später</button>
        </div>
      {:else if zustand === 'uebernommen'}
        <div class="meta">übernommen</div>
      {:else if zustand === 'abgelehnt'}
        <div class="meta">
          {#if datum}{datum} · {/if}<button type="button" class="doch" onclick={dochUebernehmen}>doch übernehmen</button>
        </div>
      {/if}
    {/if}
  </div>
{/if}

<style>
  .voll {
    display: flex;
    flex-direction: column;
    gap: var(--r2);
    padding: var(--r4);
    background: var(--blatt);
    border-radius: var(--r-kachel);
  }
  .voll.abgelehnt {
    background: var(--vertiefung);
    color: var(--gedaempft);
  }
  .titel-zeile {
    display: flex;
    align-items: center;
    gap: var(--r2);
  }
  .titel {
    font-size: var(--fs-urteil);
    font-weight: var(--gw-titel);
    color: var(--tinte);
  }
  .abgelehnt .titel {
    color: var(--gedaempft);
    font-weight: var(--gw-text);
  }
  .satz {
    font-size: var(--fs-satz);
    color: var(--satz);
  }
  .meta {
    font-size: var(--fs-meta);
    color: var(--gedaempft);
  }
  .knoepfe {
    display: flex;
    gap: var(--r2);
  }
  .uebernehmen,
  .spaeter,
  .doch {
    min-height: var(--treffer);
    padding: 0 var(--r3);
    border: none;
    border-radius: var(--r-pille);
    font-family: var(--schrift);
    font-size: var(--fs-satz);
    cursor: pointer;
  }
  .uebernehmen {
    background: var(--fuellung);
    color: var(--auf-fuellung);
  }
  .spaeter {
    background: none;
    color: var(--gedaempft);
  }
  .doch {
    background: none;
    color: var(--akzent);
    padding: 0;
    min-height: auto;
  }

  .zeichen {
    display: inline-block;
    width: var(--zeichen);
    height: var(--zeichen);
    border: 1px solid var(--achtung);
    border-radius: 50%;
    background: linear-gradient(90deg, var(--achtung) 50%, transparent 50%);
    flex: none;
  }
  .zeichen.voll {
    background: var(--tinte);
    border-color: var(--tinte);
  }

  .duenn {
    display: flex;
    align-items: center;
    gap: var(--r2);
    min-height: var(--angebot-duenn);
    padding: 0 var(--r3);
    border-radius: var(--r-kachel);
    background: var(--blatt);
  }
  .duenn.abgelehnt {
    background: var(--vertiefung);
    color: var(--gedaempft);
  }
  .duenn .satz {
    flex: 1;
  }
  .uebernehmen-schmal {
    min-height: var(--treffer);
    padding: 0 var(--r3);
    border: none;
    border-radius: var(--r-pille);
    background: var(--fuellung);
    color: var(--auf-fuellung);
    font-family: var(--schrift);
    font-size: var(--fs-meta);
    cursor: pointer;
  }
</style>
