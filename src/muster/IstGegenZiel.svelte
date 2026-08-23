<script lang="ts">
  // Muster 5 · Ist gegen Ziel (Übergabe, Abschnitt 2 · K3 K5 K6).
  // Ziel im Gruppenkopf (11 px Versalien), Ist-Werte mit dem Ziel vorbelegt.
  // Reihenfolge Output → Preinfusion → Zeit. Alle Werte 19 px rechtsbündig
  // in fester Spalte — als CSS-Grid über alle Zeilen, damit die Spalte
  // unabhängig von den einzelnen Zeileninhalten bündig bleibt.
  //
  // Visueller Redesign-Reset (Handoff 3.9, Fassung „Finalisierung"): der
  // Führungswert bekommt keine Sonderauszeichnung mehr — kein 44-px-Sprung,
  // kein gefüllter Kreis, kein Wort. Er steht als gewöhnlicher erster
  // Zielwert da; fachlich bleibt er führend, visuell ist er es nicht mehr
  // (Designprinzip 9 des Handoffs).
  //
  // Zustände je Zeile: vorbelegt (Ring) · überschrieben (gefüllter Punkt) ·
  // außerhalb des Spielraums (Abweichung als Satz) · außerhalb der
  // Messreihe (halbes Zeichen, kein Vorschlag) K67 K75.

  import { untrack } from 'svelte';

  type Zeile = {
    // 'Durchlaufzeit' ergaenzt fuer Pour-Over-Geraete mit Fuehrungswert
    // 'durchlaufzeit' (K7) — ShotErfassung.svelte beschriftet die dritte
    // Zeile je nach Bruehgeraet, dieselbe Logik wie Profilblatt.svelte.
    label: 'Output' | 'Preinfusion' | 'Zeit' | 'Durchlaufzeit';
    einheit: string;
    ziel: number;
    spielraum: number;
    messreihe?: { min: number; max: number };
  };

  let {
    titel,
    zeilen,
    onAenderung,
  }: { titel: string; zeilen: Zeile[]; onAenderung?: (werte: readonly number[]) => void } = $props();

  // zeilen liefert nur die Startbelegung (K3: Ist mit dem Ziel vorbelegt);
  // danach lebt der Zustand in der Komponente. untrack() macht das
  // Nur-einmal-lesen explizit.
  const ist = $state<number[]>(untrack(() => zeilen.map((z) => z.ziel)));
  const beruehrt = $state<boolean[]>(untrack(() => zeilen.map(() => false)));

  // Optionaler Auswaertsweg fuer echte Bildschirme (Shot-Erfassung, Paket
  // 03): die Musterblatt-Demo braucht ihn nicht, deshalb bleibt er ein Prop
  // statt eines Pflichtfelds.
  $effect(() => {
    onAenderung?.(ist);
  });

  function aendern(i: number, wert: string) {
    const zahl = Number(wert.replace(',', '.'));
    if (Number.isNaN(zahl)) return;
    ist[i] = zahl;
    beruehrt[i] = true;
  }

  function ausserhalbSpielraum(zeile: Zeile, wert: number): boolean {
    return Math.abs(wert - zeile.ziel) > zeile.spielraum;
  }

  function ausserhalbMessreihe(zeile: Zeile, wert: number): boolean {
    if (!zeile.messreihe) return false;
    return wert < zeile.messreihe.min || wert > zeile.messreihe.max;
  }
</script>

<div class="feld">
  <div class="gruppenkopf">{titel}</div>
  {#each zeilen as zeile, i (zeile.label)}
    {@const wert = ist[i] ?? zeile.ziel}
    {@const beruehrtI = beruehrt[i] ?? false}
    {@const ausserMessreihe = ausserhalbMessreihe(zeile, wert)}
    <div class="zeile">
      <span
        class="zeichen"
        class:halb={ausserMessreihe}
        class:voll={beruehrtI && !ausserMessreihe}
        class:ring={!beruehrtI}
      ></span>
      <span class="label">{zeile.label}</span>
      <input
        class="wert zahl"
        type="text"
        inputmode="decimal"
        value={wert}
        onchange={(e) => aendern(i, e.currentTarget.value)}
      />
      <span class="einheit">{zeile.einheit}</span>
    </div>
    {#if ausserMessreihe}
      <div class="satz">
        außerhalb der Messreihe · {zeile.messreihe?.min} bis {zeile.messreihe?.max} {zeile.einheit} ·
        Vorschlag entfällt
      </div>
    {:else if beruehrtI && ausserhalbSpielraum(zeile, wert)}
      <div class="satz">
        {wert > zeile.ziel ? 'mehr' : 'weniger'} als das Ziel, außerhalb des Spielraums (± {zeile.spielraum} {zeile.einheit})
      </div>
    {/if}
  {/each}
</div>

<style>
  .feld {
    display: grid;
    grid-template-columns: auto 1fr auto auto;
    align-items: center;
    column-gap: var(--r2);
    row-gap: var(--r2);
    padding: var(--r4);
    background: var(--blatt);
    border-radius: var(--r-karte);
  }
  .gruppenkopf {
    grid-column: 1 / -1;
    font-family: var(--schrift-sans);
    font-size: var(--fs-label);
    letter-spacing: var(--label-spacing);
    text-transform: uppercase;
    color: var(--gedaempft);
  }
  .zeile {
    display: contents;
  }
  .label {
    line-height: 1;
    font-size: var(--fs-bedienwort);
    color: var(--satz);
  }
  .wert {
    justify-self: end;
    width: 4ch;
    line-height: 1;
    text-align: right;
    border: none;
    border-radius: var(--r-wertfeld);
    background: var(--vertiefung);
    padding: var(--r1) var(--r2);
    font-family: var(--schrift);
    font-size: var(--fs-wert);
    color: var(--tinte);
  }
  .einheit {
    justify-self: end;
    line-height: 1;
    font-family: var(--schrift-sans);
    font-size: var(--fs-meta);
    color: var(--gedaempft);
  }
  .satz {
    grid-column: 1 / -1;
    font-size: var(--fs-satz);
    color: var(--satz);
    padding-left: calc(var(--zeichen) + var(--r2));
  }

  .zeichen {
    align-self: center;
    flex: none;
    width: var(--zeichen);
    height: var(--zeichen);
    border-radius: 50%;
  }
  .zeichen.ring {
    border: 1px solid var(--gedaempft);
  }
  .zeichen.voll {
    background: var(--tinte);
  }
  .zeichen.halb {
    border: 1px solid var(--achtung);
    background: linear-gradient(90deg, var(--achtung) 50%, transparent 50%);
  }
</style>
