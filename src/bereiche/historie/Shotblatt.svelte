<script lang="ts">
  // Shotblatt — Paket 05, K32/K57: der einzige Ort, an dem ein Urteil
  // nachtraeglich entsteht oder sich aendert, ohne Zeitdruck. Deshalb ist
  // "Wie war er?" (Urteil.svelte mit `start`) die dominante Primaeraktion
  // dieses Bildschirms (ux-regeln.md Regel 3) — alles andere ist Kontext
  // dafuer oder fuehrt zum vollen Verkostungsbogen.
  //
  // Ist-Werte als Parameterkachel-Raster (eingestellt) + Werteliste
  // (gemessen) — dieselbe Aufteilung wie ShotErfassung.svelte, nur lesend.

  import { bestand, schreiben } from '../bestand.svelte';
  import { berechneGesamt } from '../../domain/tasting';
  import Kopfzeile from '../../muster/Kopfzeile.svelte';
  import Parameterkachel from '../../muster/Parameterkachel.svelte';
  import Werteliste from '../../muster/Werteliste.svelte';
  import Urteil from '../../muster/Urteil.svelte';

  let { shotId, onZurueck, onOeffnenVerkostung }: { shotId: string; onZurueck: () => void; onOeffnenVerkostung: () => void } = $props();

  const shot = $derived(bestand.shots.find((s) => s.id === shotId));
  const kaffee = $derived(shot ? bestand.kaffees.find((k) => k.id === shot.kaffeeId) : undefined);
  const profil = $derived(shot ? bestand.profile.find((p) => p.id === shot.profilId) : undefined);
  const bruehgeraet = $derived(profil ? bestand.bruehgeraetVon(profil.setupId) : undefined);
  const muehle = $derived(profil ? bestand.muehleVon(profil.setupId) : undefined);
  const tasting = $derived(bestand.tastingVon(shotId));

  function befundLabel(symptomId: string): string {
    return bestand.symptome.find((s) => s.id === symptomId)?.label ?? symptomId;
  }

  let fehler = $state('');

  async function urteilGeaendert(stufe: 'daneben' | 'okay' | 'sehr gut' | 'Referenz') {
    if (!shot) return;
    const urteil = stufe === 'Referenz' ? 'referenz' : stufe;
    try {
      await schreiben('shot', { ...shot, urteil });
    } catch (e) {
      fehler = e instanceof Error ? e.message : String(e);
    }
  }
</script>

<Kopfzeile titel="Shot" {onZurueck} />

{#if !shot}
  <p class="hinweis">Shot nicht gefunden.</p>
{:else}
  <h1>{kaffee?.name ?? 'Unbekannter Kaffee'}</h1>
  <p class="meta">{profil?.name} · {new Date(shot.ts).toLocaleDateString('de-DE')} {new Date(shot.ts).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}</p>

  <div class="urteil-block">
    <p class="frage-objekt">Wie war er?</p>
    <Urteil start={berechneGesamt(shot.urteil) as 'daneben' | 'okay' | 'sehr gut' | 'Referenz'} onWahl={(s) => void urteilGeaendert(s)} />
    {#if fehler}<p class="fehler">{fehler}</p>{/if}
  </div>

  <div class="block">
    <p class="gruppenkopf">Parameter</p>
    <div class="parameter-raster">
      <Parameterkachel symbol="input" label="Input" wert={shot.ist.input} einheit="g" />
      <Parameterkachel symbol="mahlgrad" label="Mahlgrad" wert={shot.ist.mg} einheit={muehle?.skala.typ === 'klicks' ? 'Klicks' : undefined} />
      {#if shot.ist.rpm !== undefined}
        <Parameterkachel symbol="drehzahl" label="Drehzahl" wert={shot.ist.rpm} einheit="rpm" />
      {/if}
      {#if shot.ist.kt !== undefined}
        <Parameterkachel symbol="kessel" label="Kessel" wert={shot.ist.kt} einheit="°C" />
      {/if}
    </div>
  </div>

  <div class="block">
    <p class="gruppenkopf">Ergebnis</p>
    <Werteliste
      zeilen={[
        { label: 'Output', wert: shot.ist.output, einheit: 'g' },
        { label: 'Preinfusion', wert: shot.ist.pre ?? '—', einheit: 's' },
        { label: bruehgeraet?.fuehrungswert === 'durchlaufzeit' ? 'Durchlaufzeit' : 'Zeit', wert: shot.ist.zeit, einheit: 's' },
      ]}
    />
  </div>

  {#if shot.befunde.length > 0 || shot.vorschlag}
    <div class="block gedaempft-block">
      <p class="gruppenkopf">Dial-in</p>
      {#if shot.befunde.length > 0}
        <p class="befunde">{shot.befunde.map((b) => `${b.staerke} ${befundLabel(b.symptomId)}`).join(' · ')}</p>
      {/if}
      {#if shot.vorschlag}
        <p class="vorschlag">
          {shot.vorschlag.diagnose}{#if shot.vorschlag.empfehlungstext} — {shot.vorschlag.empfehlungstext}{/if}
          <span class="vorschlag-zustand">· {shot.vorschlag.zustand}</span>
        </p>
      {/if}
    </div>
  {/if}

  <button type="button" class="verkostung-zeile" onclick={onOeffnenVerkostung}>
    <span class="haupt">
      <span class="name">Verkostung</span>
      {#if tasting}
        <span class="meta-klein">Gesamt {berechneGesamt(shot.urteil)}</span>
      {:else}
        <span class="meta-klein">noch kein Bogen ausgefüllt</span>
      {/if}
    </span>
    <span class="chevron" aria-hidden="true">›</span>
  </button>

  {#if shot.freitext}
    <p class="freitext">„{shot.freitext}“</p>
  {/if}
{/if}

<style>
  h1 {
    font-size: var(--fs-objekt);
    font-weight: var(--gw-text);
    letter-spacing: -0.01em;
    margin: 0;
  }
  .meta {
    font-family: var(--schrift-sans);
    font-size: var(--fs-meta);
    color: var(--gedaempft);
    margin: 0 0 var(--r5);
  }
  .urteil-block {
    margin-bottom: var(--r5);
  }
  .frage-objekt {
    font-size: var(--fs-objekt);
    letter-spacing: -0.01em;
    color: var(--tinte);
    margin: 0 0 var(--r3);
  }
  .block {
    margin-bottom: var(--r5);
  }
  .gruppenkopf {
    font-family: var(--schrift-sans);
    font-size: var(--fs-gruppenkopf);
    letter-spacing: var(--label-spacing);
    text-transform: uppercase;
    color: var(--gedaempft);
    margin: 0 0 var(--r-kachelabstand);
  }
  .parameter-raster {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--r2);
  }
  .gedaempft-block .befunde,
  .gedaempft-block .vorschlag {
    font-size: var(--fs-satz);
    color: var(--gedaempft);
    margin: 0 0 var(--r2);
  }
  .vorschlag-zustand {
    font-size: var(--fs-meta);
  }
  .verkostung-zeile {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--r3);
    min-height: 60px;
    padding: 0 var(--r4);
    border: none;
    background: var(--blatt);
    border-radius: var(--r-blatt);
    font-family: var(--schrift);
    text-align: left;
    cursor: pointer;
    margin-bottom: var(--r4);
  }
  .haupt {
    display: flex;
    flex-direction: column;
  }
  .name {
    font-size: var(--fs-bedienwort);
    color: var(--tinte);
  }
  .meta-klein {
    font-family: var(--schrift-sans);
    font-size: var(--fs-meta);
    color: var(--gedaempft);
  }
  .chevron {
    color: var(--spur);
    font-size: var(--fs-bedienwort);
  }
  .freitext {
    font-size: var(--fs-satz);
    color: var(--satz);
    font-style: italic;
  }
  .hinweis {
    color: var(--gedaempft);
    font-size: var(--fs-satz);
  }
  .fehler {
    color: var(--kritisch);
    font-size: var(--fs-satz);
  }
</style>
