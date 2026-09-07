<script lang="ts">
  // Schalter — Ergaenzung zum Musterblatt (Paket 03, Korrekturrunde).
  // Ein Kippschalter statt einer nativen Checkbox — kein OS-Kaestchen bricht
  // mit der Laborbuch-Optik. Fuer Ja/Nein-Einstellungen ausserhalb des
  // Alltagspfads (Filter, Formulare); im Alltagspfad selbst uebernehmen
  // VorbelegteFrage/LesartUmschalter diese Rolle mit ihrer jeweils eigenen
  // Bedeutung — der Schalter tritt ihnen nicht in den Weg, er fuellt nur die
  // Luecke, die beide bewusst nicht abdecken (reine Einstellungen ohne
  // Anteils-Begruendung oder Lesart-Bedeutung).
  //
  // Visueller Redesign-Reset (Handoff 3.8 "Schalter"): 52×32, Knopf 26; an =
  // Füllfläche mit hellem/dunklem Knopf je Theme (--auf-fuellung), aus =
  // Vertiefung.

  let {
    label,
    an,
    onWahl,
  }: {
    label: string;
    an: boolean;
    onWahl: (an: boolean) => void;
  } = $props();
</script>

<button type="button" class="schalter-zeile" onclick={() => onWahl(!an)} aria-pressed={an}>
  <span class="label">{label}</span>
  <span class="schalter" class:an>
    <span class="knopf"></span>
  </span>
</button>

<style>
  .schalter-zeile {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--r3);
    min-height: var(--treffer);
    width: 100%;
    border: none;
    background: none;
    padding: 0;
    font-family: var(--schrift);
    cursor: pointer;
    text-align: left;
  }
  .label {
    font-size: var(--fs-satz);
    color: var(--satz);
  }
  .schalter {
    flex-shrink: 0;
    position: relative;
    width: var(--schalter-breite);
    height: var(--schalter-hoehe);
    background: var(--vertiefung);
    border-radius: var(--r-pille);
    transition: background var(--t-auswahl) var(--e-rein);
  }
  .schalter.an {
    background: var(--fuellung);
  }
  .knopf {
    position: absolute;
    top: 3px;
    left: 3px;
    width: var(--schalter-knopf);
    height: var(--schalter-knopf);
    border-radius: 50%;
    background: var(--blatt);
    /* Der Schlagschatten ist das, was einen Schalter ueberhaupt lesbar macht —
       nicht die Farbe der Bahn. Jedes native System zeichnet ihn so; selbst
       dort liegt die Aus-Bahn nur knapp ueber dem Grund. Ohne ihn war der
       Knopf hier ein weisser Punkt im Nichts (und im dunklen Theme sogar
       dunkler als seine eigene Bahn). Deshalb zusaetzlich die Haarlinie:
       sie traegt den Rand dort, wo der Schatten zu wenig hergibt. */
    box-shadow:
      0 1px 3px rgba(0, 0, 0, 0.28),
      0 0 0 0.5px rgba(0, 0, 0, 0.06);
    transition: transform var(--t-auswahl) var(--e-rein);
  }
  .schalter.an .knopf {
    background: var(--auf-fuellung);
    /* Etappe 9, Block D: der Weg haengt an Pillenbreite und Knopfgroesse und
       stand vorher als nackte 20 hier — jetzt als Token neben den beiden
       Maszen, damit er beim naechsten Umbau nicht stehen bleibt und der
       Knopf aus der Pille laeuft. */
    transform: translateX(var(--schalter-weg));
  }
</style>
