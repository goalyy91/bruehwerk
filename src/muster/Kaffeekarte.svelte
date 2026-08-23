<script lang="ts">
  // Kaffeekarte — neu im visuellen Redesign-Reset (Handoff Abschnitt 5:
  // "Kaffeekarte — Trägerform der Kaffeeliste", Abschnitt 6 "Kaffeeliste").
  // Gleiche Felder, gleiche Reihenfolge wie vorher (Name, Röster, Röstgrad,
  // Bewertung) — nur die Trägerform wechselt von einer Zeile mit
  // Haarlinie zu einer eigenständigen Karte auf Blattfläche mit größerem
  // Abstand zur nächsten Karte, damit keine Stapel-Optik entsteht
  // (Designprinzip 5: "Karten ohne Standard-Card-Look").
  //
  // K79: Röstgrad bleibt fünf Bohnen ohne Wort, Bewertung bleibt fünf
  // Sterne — unverändert aus Bohnen.svelte/Sterne.svelte übernommen, nur
  // neu gerahmt. Bewusst keine zusätzlichen Felder (letzter Shot, Charge,
  // Restmenge) — das ist laut Handoff Abschnitt 8 ausdrücklich eine
  // UX-Audit-Frage, keine Aufgabe dieses Bausteins.

  import Bohnen from './Bohnen.svelte';
  import Sterne from './Sterne.svelte';

  let {
    name,
    roester,
    roestgrad,
    bewertung,
    onOeffnen,
  }: {
    name: string;
    roester: string;
    roestgrad?: number;
    bewertung?: number;
    onOeffnen: () => void;
  } = $props();
</script>

<button type="button" class="karte" onclick={onOeffnen}>
  <span class="kopf">
    <span class="name">{name}</span>
    <span class="roester">{roester}</span>
  </span>
  <span class="meta">
    <Bohnen stufe={roestgrad} mitWort={false} />
    <span class="fuell"></span>
    <Sterne wert={bewertung} />
  </span>
</button>

<style>
  .karte {
    display: flex;
    flex-direction: column;
    gap: var(--r-kartenabstand);
    width: 100%;
    padding: var(--r4) var(--kartenpolster-quer);
    background: var(--blatt);
    border: none;
    border-radius: var(--r-karte);
    text-align: left;
    font-family: var(--schrift);
    cursor: pointer;
  }
  .kopf {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }
  .name {
    font-size: var(--fs-bedienwort);
    line-height: 1.3;
    color: var(--tinte);
  }
  .roester {
    font-family: var(--schrift-sans);
    font-size: var(--fs-meta);
    color: var(--gedaempft);
  }
  .meta {
    display: flex;
    align-items: center;
    gap: var(--r3);
    padding-top: 13px;
    border-top: 1px solid var(--linie);
  }
  .fuell {
    flex: 1;
  }
</style>
