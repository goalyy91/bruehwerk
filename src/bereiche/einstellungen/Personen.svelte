<script lang="ts">
  // Personen — Paket 06, "Die Personenliste" (konzept.md:1037-1042). Die
  // Suchzeile legt an (kein eigener "Person anlegen"-Weg), Vorname genuegt.
  // Standard ist Julian, ueberall umstellbar — nur eine Person kann
  // gleichzeitig Standard sein.
  //
  // Bewusst KEIN "hoechstens vier + jemand anders"-Deckel hier: das gilt
  // fuer den Personen-Picker WAEHREND einer Bestellung (konzept.md:1042,
  // Etappe E), nicht fuer diese Verwaltungsseite — hier will man
  // typischerweise alle sehen und pflegen (Kontext vor Vollstaendigkeit,
  // ux-regeln.md Regel 9, in die andere Richtung gelesen).
  //
  // Kleine Felder, sofortiges Schreiben statt Entwurf+Speichern-Knopf —
  // dasselbe Muster wie die Schalter in Einstellungen.svelte, weil hier
  // nichts groesser ist als ein Schalter oder ein kurzes Textfeld.

  import { bestand, schreiben } from '../bestand.svelte';
  import Kopfzeile from '../../muster/Kopfzeile.svelte';
  import Suchfeld from '../../muster/Suchfeld.svelte';
  import Schalter from '../../muster/Schalter.svelte';
  import type { Person } from '../../daten/schema';

  let { onZurueck }: { onZurueck: () => void } = $props();

  let suchtext = $state('');
  let bearbeiteId = $state<string | undefined>(undefined);
  let fehler = $state('');

  const gefiltert = $derived(
    bestand.personen.filter((p) => `${p.vorname} ${p.nachname ?? ''}`.toLowerCase().includes(suchtext.trim().toLowerCase())),
  );
  const gibtExaktenTreffer = $derived(
    bestand.personen.some((p) => p.vorname.toLowerCase() === suchtext.trim().toLowerCase()),
  );

  async function anlegen() {
    const vorname = suchtext.trim();
    if (!vorname) return;
    fehler = '';
    try {
      const neu: Person = {
        id: crypto.randomUUID(),
        vorname,
        aktiv: true,
        standard: bestand.personen.length === 0,
        favoriten: [],
        koffeinAnteil: 0,
        extraShotAnteil: 0,
      };
      await schreiben('person', neu);
      suchtext = '';
    } catch (e) {
      fehler = e instanceof Error ? e.message : String(e);
    }
  }

  async function feldAendern<K extends keyof Person>(person: Person, feld: K, wert: Person[K]) {
    fehler = '';
    try {
      await schreiben('person', { ...person, [feld]: wert });
    } catch (e) {
      fehler = e instanceof Error ? e.message : String(e);
    }
  }

  /** Nur eine Person kann gleichzeitig Standard sein — der Wechsel schreibt zwei Datensaetze. */
  async function standardSetzen(person: Person) {
    fehler = '';
    try {
      const bisheriger = bestand.personen.find((p) => p.standard && p.id !== person.id);
      if (bisheriger) await schreiben('person', { ...bisheriger, standard: false });
      await schreiben('person', { ...person, standard: true });
    } catch (e) {
      fehler = e instanceof Error ? e.message : String(e);
    }
  }
</script>

<Kopfzeile titel="Personen" {onZurueck} />

<div class="suchzeile">
  <Suchfeld wert={suchtext} onWert={(w) => (suchtext = w)} platzhalter="Suchen oder anlegen …" />
</div>

{#if fehler}<p class="fehler">{fehler}</p>{/if}

<div class="panel">
  {#each gefiltert as person (person.id)}
    <div class="eintrag">
      <button type="button" class="zeile" onclick={() => (bearbeiteId = bearbeiteId === person.id ? undefined : person.id)}>
        <span class="haupt">
          <span class="name" class:gedaempft={!person.aktiv}>{person.vorname}{person.nachname ? ` ${person.nachname}` : ''}</span>
          {#if person.standard}<span class="meta">Standard</span>{/if}
        </span>
        <span class="chevron" class:offen={bearbeiteId === person.id} aria-hidden="true">›</span>
      </button>
      {#if bearbeiteId === person.id}
        <div class="details">
          <div class="formularzeile">
            <span class="formularzeile-label">Nachname</span>
            <input
              class="eingabefeld-text"
              type="text"
              value={person.nachname ?? ''}
              onchange={(e) => feldAendern(person, 'nachname', e.currentTarget.value.trim() || undefined)}
            />
          </div>
          <div class="formularzeile">
            <span class="formularzeile-label">Notiz</span>
            <input
              class="eingabefeld-text"
              type="text"
              value={person.notiz ?? ''}
              onchange={(e) => feldAendern(person, 'notiz', e.currentTarget.value.trim() || undefined)}
            />
          </div>
          <div class="formularzeile">
            <Schalter label="Standard" an={person.standard} onWahl={(a) => (a ? standardSetzen(person) : undefined)} />
          </div>
          <div class="formularzeile">
            <Schalter label="aktiv" an={person.aktiv} onWahl={(a) => feldAendern(person, 'aktiv', a)} />
          </div>
        </div>
      {/if}
    </div>
  {/each}

  {#if suchtext.trim() && !gibtExaktenTreffer}
    <button type="button" class="anlegen-zeile" onclick={anlegen}>+ „{suchtext.trim()}“ anlegen</button>
  {/if}

  {#if gefiltert.length === 0 && !suchtext.trim()}
    <p class="hinweis">Noch niemand angelegt — Suchzeile tippen legt an.</p>
  {/if}
</div>

<style>
  .suchzeile {
    margin-bottom: var(--r4);
  }
  .fehler {
    color: var(--kritisch);
    font-size: var(--fs-satz);
    margin: 0 0 var(--r3);
  }
  .panel {
    background: var(--blatt);
    border-radius: var(--r-blatt);
    padding: 0 var(--r4);
    display: flex;
    flex-direction: column;
  }
  .eintrag:not(:first-child) {
    border-top: 1px solid var(--linie);
  }
  .zeile {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--r3);
    min-height: 60px;
    border: none;
    background: transparent;
    font-family: var(--schrift);
    text-align: left;
    cursor: pointer;
  }
  .haupt {
    display: flex;
    align-items: baseline;
    gap: var(--r2);
  }
  .name {
    font-size: var(--fs-bedienwort);
    color: var(--tinte);
  }
  .name.gedaempft {
    color: var(--gedaempft);
  }
  .meta {
    font-family: var(--schrift-sans);
    font-size: var(--fs-meta);
    color: var(--gedaempft);
  }
  .chevron {
    color: var(--spur);
    font-size: var(--fs-bedienwort);
    transition: transform var(--t-auswahl) var(--e-rein);
  }
  .chevron.offen {
    transform: rotate(90deg);
  }
  .details {
    padding-bottom: var(--r3);
  }
  .anlegen-zeile {
    width: 100%;
    min-height: 56px;
    border: none;
    background: transparent;
    color: var(--akzent);
    font-family: var(--schrift);
    font-size: var(--fs-bedienwort);
    text-align: left;
    cursor: pointer;
  }
  .hinweis {
    color: var(--gedaempft);
    font-size: var(--fs-satz);
    padding: var(--r4) 0;
    margin: 0;
  }
</style>
