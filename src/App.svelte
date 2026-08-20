<script lang="ts">
  import { planeBezuege, type Position } from './domain/plan';

  // Platzhalter-Bildschirm. Er existiert, damit `vite build` etwas zu bauen
  // hat und die Naht zwischen domain/ und der Oberflaeche einmal belegt ist.
  // Der erste echte Bildschirm kommt nach Paket 01b — dem Musterblatt.

  const positionen: Position[] = [
    { id: 'p1', getraenkId: 'cappuccino', kaffeeId: 'entcoffeiniert', profilId: 'espresso', anteilBezug: 'halb', modifikatoren: [] },
    { id: 'p2', getraenkId: 'cappuccino', kaffeeId: 'entcoffeiniert', profilId: 'espresso', anteilBezug: 'halb', modifikatoren: [] },
    { id: 'p3', getraenkId: 'cappuccino', kaffeeId: 'entcoffeiniert', profilId: 'espresso', anteilBezug: 'halb', modifikatoren: [] },
  ];

  const plan = planeBezuege(positionen, new Map([['espresso', 18]]));
</script>

<main>
  <h1>Brühwerk</h1>
  <p class="unterzeile">Ein Laborbuch für Kaffee</p>

  <section>
    <p>
      3 Cappuccino · {plan.durchgaenge.length} Bezüge · {plan.verschnittGramm} g Verschnitt
    </p>
  </section>
</main>

<style>
  :global(body) {
    margin: 0;
    background: #181510;
    color: #e8e2d6;
    font: 16px/1.5 system-ui, sans-serif;
  }

  main {
    padding: max(1.5rem, env(safe-area-inset-top)) 1.5rem
      max(1.5rem, env(safe-area-inset-bottom));
  }

  h1 {
    margin: 0;
    font-size: 1.5rem;
    letter-spacing: 0.01em;
  }

  .unterzeile {
    margin: 0.25rem 0 2rem;
    color: #9a9184;
  }

  section {
    padding: 1rem;
    background: #221f1a;
    border: 1px solid #3d382f;
    border-radius: 0.5rem;
  }

  section p {
    margin: 0;
  }
</style>
