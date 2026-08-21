<script module lang="ts">
  export type WertelisteZeile = {
    label: string;
    wert: number | string;
    einheit?: string;
    /** Fehlt onAendern, ist die Zeile reine Anzeige (kein Eingabefeld). */
    onAendern?: (wert: number) => void;
    /** z. B. "≈ 94 °C Gruppe" oder "außerhalb der Messreihe". */
    hinweis?: string;
  };
</script>

<script lang="ts">
  // Werteliste — Ergaenzung zum Musterblatt (Korrekturrunde, Punkt 6+Nachzug).
  // Fuer Werte, die weder einen Ist-gegen-Ziel-Vergleich noch ein
  // Herkunftszeichen brauchen (dafuer ist IstGegenZiel.svelte gebaut, K3)
  // und bei denen kein Feld wichtiger ist als ein anderes — ein Rezept
  // (Profilblatt "Ziel") oder eingestellte Werte ohne Spielraum (Input,
  // Mahlgrad in der Shot-Erfassung). Gleiche Grid-Mechanik wie
  // IstGegenZiel.svelte (feste Spalten, display:contents je Zeile), aber
  // ohne Fuehrungswert-Typografie und ohne Zeichen-Spalte.
  //
  // `hinweis` ist bewusst ein fertiger Text, keine Domain-Logik hier: die
  // Rechnung (z. B. Kessel -> Gruppentemperatur) gehoert in den Aufrufer,
  // dieses Muster zeigt nur an.

  let { zeilen }: { zeilen: WertelisteZeile[] } = $props();

  function zahl(e: Event): number {
    return Number((e.currentTarget as HTMLInputElement).value.replace(',', '.'));
  }
</script>

<div class="werteliste">
  {#each zeilen as zeile (zeile.label)}
    <div class="zeile">
      <span class="label">{zeile.label}</span>
      {#if zeile.onAendern}
        <input
          class="wert"
          type="text"
          inputmode="decimal"
          value={zeile.wert}
          onchange={(e) => zeile.onAendern?.(zahl(e))}
        />
      {:else}
        <span class="wert-text">{zeile.wert}</span>
      {/if}
      <span class="einheit">{zeile.einheit ?? ''}</span>
    </div>
    {#if zeile.hinweis}
      <div class="hinweis">{zeile.hinweis}</div>
    {/if}
  {/each}
</div>

<style>
  .werteliste {
    display: grid;
    grid-template-columns: var(--eigenschaftslabel) 1fr auto;
    align-items: center;
    column-gap: var(--r2);
    row-gap: var(--r3);
    padding: var(--r4);
    background: var(--feld);
    border: 1px solid var(--feld-rahmen);
  }
  .zeile {
    display: contents;
  }
  .label {
    font-size: var(--fs-satz);
    color: var(--satz);
  }
  .wert,
  .wert-text {
    justify-self: end;
    font-variant-numeric: var(--zahl-features);
    font-size: var(--fs-satz);
    color: var(--tinte);
  }
  .wert {
    width: 80px;
    font-family: var(--schrift);
    background: var(--h-papier);
    border: 1px solid var(--feld-rahmen);
    padding: var(--r1) var(--r2);
  }
  .einheit {
    font-size: var(--fs-meta);
    color: var(--gedaempft);
  }
  .hinweis {
    grid-column: 2 / -1;
    text-align: right;
    font-size: var(--fs-meta);
    color: var(--gedaempft);
  }
</style>
