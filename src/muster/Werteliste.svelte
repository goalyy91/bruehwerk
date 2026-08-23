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
  //
  // Visueller Redesign-Reset (Handoff 3.8 "Eingabefeld Wert"): Panel jetzt
  // Blattfläche, Wertfeld Vertiefung mit Radius 4 statt eckigem Vollrahmen.
  //
  // Paket 3: Profilblatt/ShotErfassung zeigen ihre Ziel-/Einstellwerte jetzt
  // über Parameterkachel.svelte (Handoff Abschnitt 6) statt hier — Werteliste
  // bleibt zuständig für Profilblatt "Spielraum" und die reinen Text-Zeilen
  // im Kaffeeblatt (Bohne-Details). Maße auf die Spielraum-Referenz gezogen
  // (Radius 20, Polster 14/18, Wertfeld 76×, Wert 17/500) — Bohne-Details
  // nutzt weiterhin `.wert-text` unveraendert bei 19/500.

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
    padding: 14px var(--r4);
    background: var(--blatt);
    border-radius: var(--r-blatt);
  }
  .zeile {
    display: contents;
  }
  .label {
    font-size: var(--fs-bedienwort);
    color: var(--satz);
  }
  .wert,
  .wert-text {
    justify-self: end;
    font-variant-numeric: var(--zahl-features);
    font-weight: var(--gw-zahl);
    color: var(--tinte);
  }
  .wert-text {
    font-size: var(--fs-wert);
  }
  .wert {
    width: 76px;
    font-size: 17px;
    font-family: var(--schrift);
    background: var(--vertiefung);
    border: none;
    border-radius: var(--r-wertfeld);
    padding: 7px 12px;
    text-align: right;
  }
  .einheit {
    font-family: var(--schrift-sans);
    font-size: var(--fs-meta);
    color: var(--gedaempft);
  }
  .hinweis {
    grid-column: 2 / -1;
    text-align: right;
    font-family: var(--schrift-sans);
    font-size: var(--fs-meta);
    color: var(--gedaempft);
  }
</style>
