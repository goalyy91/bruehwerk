<script lang="ts">
  // Aromadatenblatt — die Leseansicht zu einem Le-Nez-Flaeschchen
  // (daten/aroma-datenblaetter.ts). Nachbau des gedruckten Blattes, nicht
  // dessen Abbild: Kategorie als Versalzeile, Name gross, Nummer im Ring,
  // englischer Originalname darunter — dieselbe Kopf-Anordnung wie auf dem
  // Papier, nur in einer Spalte statt zwei, weil ein zweispaltiges Blatt am
  // Telefon nur mit Zoomen lesbar waere.
  //
  // Reine Anzeige, kein eigener Zustand: der Uebungsmodus haelt fest,
  // welches Blatt offen ist, und bekommt ueber onVerweis die Nummer, wenn
  // ein Querverweis angetippt wird. Damit bleibt der Rueckweg in *einer*
  // Hand (siehe Kopfzeile.svelte-Kommentar zu den zwei Navigations-Ebenen).
  //
  // Kein neues Muster in src/muster/ (ux-regeln R6): ein Datenblatt ist ein
  // Bildschirm, kein wiederverwendbarer Baustein. Chips.svelte scheidet fuer
  // die Querverweise aus — das ist ein Auswahlmuster mit Staerkegrad, keine
  // Verweisliste.
  import Kopfzeile from '../../muster/Kopfzeile.svelte';
  import { datenblattZu, type AromaDatenblatt } from '../../daten/aroma-datenblaetter';

  let {
    blatt,
    onZurueck,
    onVerweis,
  }: {
    blatt: AromaDatenblatt;
    onZurueck: () => void;
    onVerweis: (nummer: number) => void;
  } = $props();

  // Ein Querverweis ist nur begehbar, wenn das Zielblatt schon erfasst ist.
  // Solange nicht, traegt das auf diesem Blatt gedruckte Wort den Verweis —
  // ein nacktes "Nr. 23" waere waehrend der Erfassungsphase wertlos.
  const verweise = $derived(
    blatt.verwandte.map((v) => {
      const ziel = datenblattZu(v.nummer);
      return { nummer: v.nummer, label: ziel?.name ?? v.original, begehbar: ziel !== undefined };
    }),
  );
</script>

<Kopfzeile titel="Datenblatt" {onZurueck} />

<article class="blatt">
  <header class="kopf">
    <div class="benennung">
      <p class="kategorie">{blatt.kategorieLabel}</p>
      <h2 class="name">{blatt.name}</h2>
      <p class="original">{blatt.nameOriginal}</p>
    </div>
    <span class="nummer" aria-label="Fläschchen {blatt.nummer}">{blatt.nummer}</span>
  </header>

  <section class="abschnitt">
    <h3 class="kopfzeile-abschnitt">Beschreibung</h3>
    {#each blatt.beschreibung as absatz, i (i)}
      <p class={i === 0 ? 'anriss' : 'text'}>{absatz}</p>
    {/each}
  </section>

  {#each blatt.abschnitte as abschnitt (abschnitt.titel)}
    <section class="abschnitt">
      {#if abschnitt.titel}<h3 class="kopfzeile-abschnitt">{abschnitt.titel}</h3>{/if}
      {#each abschnitt.text as absatz, i (i)}
        <p class="text">{absatz}</p>
      {/each}
    </section>
  {/each}

  {#if verweise.length > 0}
    <section class="abschnitt">
      <h3 class="kopfzeile-abschnitt">Verwandte Aromen</h3>
      <ul class="verweise">
        {#each verweise as verweis (verweis.nummer)}
          <li>
            {#if verweis.begehbar}
              <button type="button" class="verweis" onclick={() => onVerweis(verweis.nummer)}>
                {verweis.label} <span class="verweis-nummer">{verweis.nummer}</span>
              </button>
            {:else}
              <span class="verweis tot">
                {verweis.label} <span class="verweis-nummer">{verweis.nummer}</span>
              </span>
            {/if}
          </li>
        {/each}
      </ul>
    </section>
  {/if}

  <div class="im-kaffee">
    <h3 class="kopfzeile-kaffee">Im Kaffee</h3>
    {#each blatt.imKaffee as abschnitt, k (k)}
      <section class="abschnitt">
        {#if abschnitt.titel}<h4 class="kopfzeile-abschnitt">{abschnitt.titel}</h4>{/if}
        {#each abschnitt.text as absatz, i (i)}
          <p class="text">{absatz}</p>
        {/each}
      </section>
    {/each}
  </div>
</article>

<style>
  .blatt {
    padding-bottom: var(--r7);
  }
  .kopf {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--r3);
    padding-bottom: var(--r4);
    border-bottom: 1px solid var(--spur);
    margin-bottom: var(--r5);
  }
  .benennung {
    min-width: 0;
  }
  .kategorie {
    font-family: var(--schrift-sans);
    font-size: var(--fs-gruppenkopf);
    letter-spacing: var(--label-spacing);
    text-transform: uppercase;
    color: var(--gedaempft);
    margin: 0 0 var(--r2);
  }
  .name {
    font-size: var(--fs-blattitel);
    font-weight: var(--gw-titel);
    line-height: 1.12;
    letter-spacing: -0.02em;
    color: var(--tinte);
    margin: 0;
  }
  .original {
    font-size: var(--fs-satz);
    font-style: italic;
    color: var(--gedaempft);
    margin: var(--r1) 0 0;
  }
  /* Die Nummer im Ring — das Erkennungszeichen des gedruckten Blattes. */
  .nummer {
    flex-shrink: 0;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--akzent);
    border-radius: 50%;
    color: var(--akzent);
    font-size: var(--fs-wert);
    font-variant-numeric: var(--zahl-features);
    font-weight: var(--gw-zahl);
  }

  .abschnitt {
    margin-bottom: var(--r5);
  }
  .kopfzeile-abschnitt {
    font-family: var(--schrift-sans);
    font-size: var(--fs-gruppenkopf);
    letter-spacing: var(--label-spacing);
    text-transform: uppercase;
    color: var(--tinte);
    margin: 0 0 var(--r2);
  }
  .anriss {
    font-size: var(--fs-objekt);
    line-height: 1.35;
    color: var(--tinte);
    margin: 0 0 var(--r3);
  }
  .text {
    font-size: var(--fs-satz);
    line-height: 1.55;
    color: var(--satz);
    margin: 0 0 var(--r3);
  }
  .text:last-child {
    margin-bottom: 0;
  }

  .verweise {
    display: flex;
    flex-wrap: wrap;
    gap: var(--r2);
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .verweis {
    display: inline-flex;
    align-items: center;
    gap: var(--r1);
    padding: 7px var(--r3);
    border: none;
    border-radius: var(--r-pille);
    background: var(--vertiefung);
    color: var(--akzent);
    font-family: var(--schrift);
    font-size: var(--fs-satz);
    cursor: pointer;
  }
  /* Noch nicht erfasst: steht da, ist aber kein Weg — deshalb ohne Fläche,
     ohne Akzentfarbe und ohne Zeiger, statt eines toten Knopfes. */
  .verweis.tot {
    background: none;
    color: var(--gedaempft);
    cursor: default;
    padding-left: 0;
  }
  .verweis-nummer {
    font-family: var(--schrift-sans);
    font-size: var(--fs-meta);
    font-variant-numeric: var(--zahl-features);
    color: var(--gedaempft);
  }

  /* "IN COFFEE" ist auf dem Papier die Trennlinie zwischen dem Stoff
     allgemein und dem Stoff im Kaffee — für eine Kaffee-App die Hälfte, auf
     die es ankommt. Deshalb hier dieselbe Zäsur wie im Druck. */
  .im-kaffee {
    padding-top: var(--r5);
    border-top: 1px solid var(--spur);
  }
  .kopfzeile-kaffee {
    font-size: var(--fs-objekt);
    font-weight: var(--gw-titel);
    color: var(--tinte);
    margin: 0 0 var(--r4);
  }
</style>
