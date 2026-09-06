<script lang="ts">
  // Blattliste — Redesign v2, Etappe 8 Block D. Das Handoff nennt sie beim
  // Namen (docs/design/redesign-v1-handoff.md, Abschnitt 6: Komponenten-
  // Mapping für Kaffeeblatt/Einstellungen/Geräte), gebaut wurde sie nie —
  // sieben Dateien bauten "Blatt mit Zeilen" seither wortgleich selbst nach
  // (docs/design/offene-punkte-redesign.md, Abschnitt 30). Nur der äußere
  // Rahmen: Blattfläche, Radius, Haarlinie zwischen den Kindern, der
  // Redesign-v2-Schatten, den Bar/Kaffeeblatt/Bestellungs-Ablauf schon
  // haben und die übrige App bisher nicht.
  //
  // Bewusst nur der Rahmen, keine feste Zeilenform: manche Aufrufer setzen
  // Blattzeile.svelte hinein (die einfache Name+Chevron/Akzent-Zeile),
  // andere (Personen, Beobachtungen, Temperatur-Referenz) haben eigenes
  // Zeileninnenleben — Kontextmenü, Aufklapp-Formular, Herkunftszeichen —
  // und bleiben dabei, nur der Rahmen um sie herum wird gemeinsam.
  //
  // Direkte Kind-Elemente kriegen ihre Trennlinie über einen globalen
  // Selektor (":global(* + *)") — Svelte scoped sonst nur, was diese
  // Komponente selbst schreibt, nicht den Inhalt eines Snippets.

  import type { Snippet } from 'svelte';

  let { children }: { children: Snippet } = $props();
</script>

<div class="blattliste">
  {@render children()}
</div>

<style>
  .blattliste {
    background: var(--blatt);
    border-radius: var(--r-blatt);
    padding: 0 var(--r4);
    box-shadow: 0 8px 22px -14px var(--schatten);
    display: flex;
    flex-direction: column;
  }
  .blattliste > :global(* + *) {
    border-top: 1px solid var(--linie);
  }
</style>
