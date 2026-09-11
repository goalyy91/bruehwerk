/**
 * Svelte-Action: scrollt ihr Element beim Erscheinen sanft in den
 * sichtbaren Bereich. Fuer Formularschritte, die progressiv auftauchen
 * (Bestellung: Koffein -> Bohne -> Extra Shot) — ohne das musste man nach
 * jeder Auswahl von Hand nachscrollen (Rueckmeldung 2026-09-11: "wenn der
 * Weg nach unten laenger wird, muss ich jedes Mal runterscrollen").
 *
 * An einen `{#if}`-Block gebunden (`<div use:insBildRuecken>`) feuert sie
 * bei jedem Neu-Mounten erneut, weil Svelte den Knoten dann frisch erzeugt
 * — genau das gewuenschte Verhalten fuer einen Schritt, der fuer die
 * naechste Position erneut auftaucht. `block: 'nearest'` ruehrt nichts an,
 * wenn das Element schon sichtbar ist (z. B. beim ersten Feld eines
 * Bildschirms).
 */
export function insBildRuecken(node: HTMLElement) {
  requestAnimationFrame(() => {
    node.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  });
}
