<script lang="ts">
  // Profilblatt — K7 (Fuehrungswert je Geraet), Setup-Bindung (Befund 2:
  // "MG 65" ist nur mit Muehle eindeutig), K54 (Kessel/Gruppe als doppelte
  // Einheit), Spielraum je Groesse. Gussplan-Editor folgt in Etappe C.

  import { bestand, schreiben } from '../bestand.svelte';
  import { kesselZuGruppe } from '../../domain/temperatur';
  import { EINHEIT, type GemesseneGroesse } from '../../domain/spielraum';
  import AuswahlListe from '../../muster/AuswahlListe.svelte';
  import Kopfzeile from '../../muster/Kopfzeile.svelte';
  import Werteliste, { type WertelisteZeile } from '../../muster/Werteliste.svelte';
  import Knopf from '../../muster/Knopf.svelte';
  import GussplanEditor from './GussplanEditor.svelte';
  import type { Profil } from '../../daten/schema';

  // Shot loggen ist seit dem Navigations-Umbau (UX-1) eine eigene Route
  // (Rahmen.svelte rendert dort direkt ShotErfassung) statt eines lokal
  // umgeschalteten Zustands hier — damit schliesst die Zurueck-Geste die
  // Erfassung, statt die App zu verlassen.
  let { profilId, onZurueck, onOeffnenShot }: {
    profilId: string;
    onZurueck: () => void;
    onOeffnenShot: () => void;
  } = $props();

  const profil = $derived(bestand.profile.find((p) => p.id === profilId));
  const bruehgeraet = $derived(profil ? bestand.bruehgeraetVon(profil.setupId) : undefined);
  const muehle = $derived(profil ? bestand.muehleVon(profil.setupId) : undefined);
  const setup = $derived(profil ? bestand.setups.find((s) => s.id === profil.setupId) : undefined);

  const gruppenTemperatur = $derived(
    profil?.ziel.kt !== undefined && bruehgeraet
      ? kesselZuGruppe(bruehgeraet.tempReferenz, profil.ziel.kt)
      : undefined,
  );

  // Kesseltemperatur-Hinweis als fertiger Text statt DoppelteEinheit: die
  // Komponente zeigt ihren "fuehrendWert" selbst nochmal gross an — neben
  // einem Eingabefeld fuer denselben Wert waere das derselbe Wert doppelt
  // auf dem Bildschirm (gefundener Bug, offene-punkte-ux.md Nachzug).
  const ktHinweis = $derived.by(() => {
    if (gruppenTemperatur?.bekannt) {
      const wert = gruppenTemperatur.herkunft === 'geschaetzt'
        ? Math.round(gruppenTemperatur.wert).toString()
        : gruppenTemperatur.wert.toFixed(1);
      return `≈ ${wert} °C Gruppe`;
    }
    return profil?.ziel.kt !== undefined ? 'außerhalb der Messreihe' : undefined;
  });

  let speicherFehler = $state<string | undefined>(undefined);

  async function zielSpeichern<K extends keyof Profil['ziel']>(feld: K, wert: Profil['ziel'][K]) {
    if (!profil) return;
    speicherFehler = undefined;
    try {
      await schreiben('profil', { ...profil, ziel: { ...profil.ziel, [feld]: wert } });
    } catch (fehler) {
      speicherFehler = fehler instanceof Error ? fehler.message : String(fehler);
    }
  }

  async function spielraumSpeichern(groesse: GemesseneGroesse, wert: number) {
    if (!profil) return;
    speicherFehler = undefined;
    try {
      await schreiben('profil', { ...profil, spielraum: { ...profil.spielraum, [groesse]: wert } });
    } catch (fehler) {
      speicherFehler = fehler instanceof Error ? fehler.message : String(fehler);
    }
  }

  let setupWahlOffen = $state(false);

  async function setupWechseln(neueSetupId: string) {
    if (!profil) return;
    speicherFehler = undefined;
    try {
      await schreiben('profil', { ...profil, setupId: neueSetupId });
    } catch (fehler) {
      speicherFehler = fehler instanceof Error ? fehler.message : String(fehler);
    }
  }

  // Punkt 6 der Korrekturrunde: Werteliste statt handgebautem Grid — alle
  // Werte gleich gross, kein Herkunftszeichen (hier wird nichts gemessen,
  // nur das Rezept gepflegt).
  const zielZeilen = $derived.by((): WertelisteZeile[] => {
    if (!profil) return [];
    const zeilen: WertelisteZeile[] = [
      { label: 'Input', wert: profil.ziel.input, einheit: 'g', onAendern: (w) => zielSpeichern('input', w) },
      {
        label: 'Mahlgrad',
        wert: profil.ziel.mg,
        einheit: muehle?.skala.typ === 'klicks' ? 'Klicks' : undefined,
        onAendern: (w) => zielSpeichern('mg', w),
      },
    ];
    if (muehle?.rpmEinstellbar) {
      zeilen.push({ label: 'Drehzahl', wert: profil.ziel.rpm ?? '', einheit: 'rpm', onAendern: (w) => zielSpeichern('rpm', w) });
    }
    if (bruehgeraet?.ktEinstellbar) {
      zeilen.push({
        label: 'Kesseltemperatur',
        wert: profil.ziel.kt ?? '',
        einheit: '°C',
        onAendern: (w) => zielSpeichern('kt', w),
        hinweis: ktHinweis,
      });
    }
    zeilen.push(
      { label: 'Output', wert: profil.ziel.output, einheit: 'g', onAendern: (w) => zielSpeichern('output', w) },
      { label: 'Preinfusion', wert: profil.ziel.pre ?? '', einheit: 's', onAendern: (w) => zielSpeichern('pre', w) },
      {
        label: bruehgeraet?.fuehrungswert === 'durchlaufzeit' ? 'Durchlaufzeit' : 'Zeit',
        wert: profil.ziel.zeit,
        einheit: 's',
        onAendern: (w) => zielSpeichern('zeit', w),
      },
    );
    return zeilen;
  });

  const GROESSE_LABEL: Record<GemesseneGroesse, string> = {
    zeit: 'Zeit ±',
    output: 'Output ±',
    durchlaufzeit: 'Durchlaufzeit ±',
  };

  // Regel 6/12: zweite Werteliste statt eigenem Grid-CSS (wie schon fuer
  // "Ziel" oben) — und ausgeschriebene Labels statt der rohen Enum-Schluessel
  // ("zeit", "durchlaufzeit").
  const spielraumZeilen = $derived.by((): WertelisteZeile[] => {
    if (!profil) return [];
    return (['zeit', 'output', 'durchlaufzeit'] as const).map((groesse) => ({
      label: GROESSE_LABEL[groesse],
      wert: profil.spielraum[groesse],
      einheit: EINHEIT[groesse],
      onAendern: (w: number) => spielraumSpeichern(groesse, w),
    }));
  });
</script>

{#if !profil}
  <Kopfzeile titel="Profil" onZurueck={onZurueck} />
  <p class="hinweis">Profil nicht gefunden.</p>
{:else}
  <Kopfzeile titel={profil.name} {onZurueck} />
  <div class="knopfreihe">
    <Knopf stufe="primaer" onKlick={onOeffnenShot}>Shot loggen</Knopf>
  </div>

  <p class="setup">{setup?.name ?? 'Setup unbekannt'} · {profil.modus === 'dialin' ? 'Dial-in' : 'eingefahren'}</p>

  <section class="ziel">
    <h2>Ziel</h2>
    <!-- Punkt 6 der Korrekturrunde: geteiltes Muster statt handgebautem
         Grid (muster/Werteliste.svelte) — kein Herkunftszeichen (hier wird
         nichts gemessen, nur das Rezept gepflegt) und keine
         Führungswert-Emphase: das Rezept zeigt alle Werte gleich groß, die
         Größenbetonung gehört ausschließlich in den Live-Kontext
         (ShotErfassung.svelte, dort über IstGegenZiel bereits vorhanden). -->
    <Werteliste zeilen={zielZeilen} />
  </section>

  <section class="spielraum">
    <h2>Spielraum</h2>
    <p class="hinweis-klein">Input und Mahlgrad haben keinen — dort ist jede Änderung Absicht.</p>
    <Werteliste zeilen={spielraumZeilen} />
  </section>

  {#if bruehgeraet?.typ === 'pourover'}
    <GussplanEditor {profilId} />
  {/if}

  <!-- Tiefer gelegt (Regel 2/4): reine Korrekturfunktion fuer eine falsch
       zugeordnete Migration (Teil D), keine Alltagsaktion. -->
  <section class="setup-wahl">
    <button type="button" class="aufklappbar" aria-expanded={setupWahlOffen} onclick={() => (setupWahlOffen = !setupWahlOffen)}>
      <span>Setup ändern</span>
      <span class="pfeil" class:offen={setupWahlOffen} aria-hidden="true">▾</span>
    </button>
    {#if setupWahlOffen}
      <AuswahlListe
        optionen={bestand.setups.map((s) => ({ wert: s.id, label: s.name }))}
        wert={profil.setupId}
        onWahl={setupWechseln}
      />
    {/if}
  </section>

  {#if speicherFehler}
    <p class="fehler">Nicht gespeichert: {speicherFehler} — nochmal versuchen.</p>
  {/if}
{/if}

<style>
  .knopfreihe {
    margin-bottom: var(--r4);
  }
  .setup {
    font-size: var(--fs-meta);
    color: var(--gedaempft);
    margin: 0 0 var(--r4);
  }
  h2 {
    font-size: var(--fs-label);
    letter-spacing: var(--label-spacing);
    text-transform: uppercase;
    color: var(--gedaempft);
    font-weight: var(--gw-text);
    margin: var(--r5) 0 var(--r2);
  }
  .setup-wahl {
    margin-top: var(--r5);
  }
  .aufklappbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    min-height: var(--treffer);
    padding: 0;
    border: none;
    background: transparent;
    color: var(--gedaempft);
    font-family: var(--schrift);
    font-size: var(--fs-meta);
    text-align: left;
    cursor: pointer;
  }
  .aufklappbar .pfeil {
    transition: transform var(--t-auswahl) var(--e-rein);
  }
  .aufklappbar .pfeil.offen {
    transform: rotate(180deg);
  }
  .hinweis,
  .hinweis-klein {
    color: var(--gedaempft);
    font-size: var(--fs-meta);
  }
  .fehler {
    color: var(--kritisch);
    font-size: var(--fs-satz);
    margin-top: var(--r3);
  }
</style>
