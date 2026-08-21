<script lang="ts">
  // Schalter — Ergaenzung zum Musterblatt (Paket 03, Korrekturrunde).
  // Ein Kippschalter aus --spur/--akzent statt einer nativen Checkbox —
  // kein OS-Kaestchen bricht mit der Laborbuch-Optik. Fuer Ja/Nein-
  // Einstellungen ausserhalb des Alltagspfads (Filter, Formulare); im
  // Alltagspfad selbst uebernehmen VorbelegteFrage/LesartUmschalter diese
  // Rolle mit ihrer jeweils eigenen Bedeutung — der Schalter tritt ihnen
  // nicht in den Weg, er fuellt nur die Luecke, die beide bewusst nicht
  // abdecken (reine Einstellungen ohne Anteils-Begruendung oder
  // Lesart-Bedeutung).

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
    width: 44px;
    height: 26px;
    background: var(--spur);
    border-radius: 13px;
    transition: background var(--t-auswahl) var(--e-rein);
  }
  .schalter.an {
    background: var(--akzent);
  }
  .knopf {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--h-papier);
    transition: transform var(--t-auswahl) var(--e-rein);
  }
  .schalter.an .knopf {
    transform: translateX(18px);
  }
</style>
