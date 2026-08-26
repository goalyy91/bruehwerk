<script lang="ts">
  // Die Bar — Start. K4: hoechstens eine Quittungszeile, die stehen
  // bleibt, bis der naechste Shot laeuft oder die App neu geoeffnet wird.
  // Der Zwei-Tap-Schnellpfad (Decay-Ranking) ist Paket 07 — bis dahin fuehrt
  // "Bestellung aufnehmen" immer durch Person -> Getraenk -> Koffein ->
  // Bohne -> Plan -> Abarbeiten (Paket 06).
  //
  // Paket 4: Kopfzeile im gross-Modus, wie alle Root-Tab-Screens ohne
  // Rueckweg (Handoff: "Titel 32/600").

  import { bestand, schreiben } from '../bestand.svelte';
  import Kopfzeile from '../../muster/Kopfzeile.svelte';
  import Knopf from '../../muster/Knopf.svelte';
  import type { Bestellung } from '../../daten/schema';

  let { onOeffnenBestellung }: { onOeffnenBestellung: () => void } = $props();

  const letzterShot = $derived(
    bestand.shots.length === 0 ? undefined : [...bestand.shots].sort((a, b) => b.ts - a.ts)[0],
  );
  const kaffeeName = $derived(bestand.kaffees.find((k) => k.id === letzterShot?.kaffeeId)?.name);
  const offeneBestellung = $derived(bestand.offeneBestellung());

  let fehler = $state('');

  async function bestellungStarten() {
    if (offeneBestellung) {
      onOeffnenBestellung();
      return;
    }
    fehler = '';
    const neu: Bestellung = {
      id: crypto.randomUUID(),
      ts: Date.now(),
      positionIds: [],
      durchgangIds: [],
      dauerGeschaetzt: 0,
      verschnitt: 0,
      status: 'offen',
    };
    try {
      await schreiben('bestellung', neu);
      onOeffnenBestellung();
    } catch (e) {
      fehler = e instanceof Error ? e.message : String(e);
    }
  }
</script>

<Kopfzeile titel="Bar" gross />

{#if letzterShot && kaffeeName}
  <p class="quittung">{kaffeeName} · {letzterShot.urteil}</p>
{:else}
  <p class="hinweis">Noch kein Shot geloggt. Loggen geht ab einem Kaffee mit Profil — unter „Kaffees".</p>
{/if}

{#if fehler}<p class="fehler">{fehler}</p>{/if}

<div class="knopfreihe">
  <Knopf stufe="primaer" onKlick={bestellungStarten}>
    {offeneBestellung ? 'Bestellung fortsetzen' : 'Bestellung aufnehmen'}
  </Knopf>
</div>

<style>
  .quittung {
    font-size: var(--fs-satz);
    color: var(--satz);
  }
  .hinweis {
    font-size: var(--fs-meta);
    color: var(--gedaempft);
  }
  .fehler {
    color: var(--kritisch);
    font-size: var(--fs-satz);
  }
  .knopfreihe {
    margin-top: var(--r5);
  }
</style>
