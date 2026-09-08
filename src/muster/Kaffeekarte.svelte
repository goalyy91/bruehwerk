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
  import AktivKnopf from './AktivKnopf.svelte';

  let {
    name,
    roester,
    roestgrad,
    bewertung,
    aktiv = true,
    onOeffnen,
    onAktivWechseln,
  }: {
    name: string;
    roester: string;
    roestgrad?: number;
    bewertung?: number;
    /** Fehlt onAktivWechseln, erscheint kein Augen-Symbol (Musterblatt-Demo braucht keins). */
    aktiv?: boolean;
    onOeffnen: () => void;
    onAktivWechseln?: () => void;
  } = $props();
</script>

<div class="karte-huelle">
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
  {#if onAktivWechseln}
    <!-- Rückmeldung 2026-09-08: aktiv/inaktiv direkt von der Liste aus,
         ohne erst die Karte zu öffnen. Absolut positioniert als
         Geschwister von .karte, nicht darin verschachtelt — ein Tap aufs
         Auge trifft damit nie den darunterliegenden Karten-Button, kein
         stopPropagation nötig. Bewusst kein Wischen (ux-regeln.md, K44) —
         ein stilles, immer sichtbares Symbol statt einer Geste. -->
    <div class="auge">
      <AktivKnopf {aktiv} onKlick={() => onAktivWechseln()} />
    </div>
  {/if}
</div>

<style>
  .karte-huelle {
    position: relative;
  }
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
  .auge {
    position: absolute;
    top: 6px;
    right: 6px;
  }
  .kopf {
    display: flex;
    flex-direction: column;
    gap: 3px;
    /* Platz fuer das Auge-Symbol in der Ecke, damit der Name nicht darunter
       verschwindet. */
    padding-right: calc(var(--r-knopf-rund) + var(--r1));
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
