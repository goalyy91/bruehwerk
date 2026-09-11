<script module lang="ts">
  // Profil-Icon — Redesign v2. Sieben Varianten aus der freigegebenen
  // Icon-Bibliothek (Artifact "profil-icons.html", Rückmeldungsrunde
  // 2026-09-04): vier Zubereitungsarten (Siebträger/Moka/Pour Over/
  // Cold Brew) und drei Tassen-Füllstände (Ristretto/Espresso/Lungo) für
  // Siebträger-Getränke, die sich vor allem über die Menge unterscheiden.
  // Reines Aussehen, kein Zustand — wie Bohnen.svelte/Sterne.svelte.
  //
  // Farbe kommt von aussen (currentColor) — der Aufrufer setzt sie über
  // die umgebende Fläche (Badge/Kachel), wie bei den übrigen Icon-Mustern.

  export type ProfilIconTyp = 'siebtraeger' | 'moka' | 'pourover' | 'coldbrew' | 'ristretto' | 'espresso' | 'lungo';

  /** Reihenfolge in der Auswahlzeile beim Profil-Anlegen/-Bearbeiten. Stand
   *  bis 2026-09-11 doppelt: einmal privat in Kaffeeblatt.svelte (Anlegen),
   *  jetzt hier zentral, weil ProfilBearbeiten.svelte dieselbe Auswahlzeile
   *  ein zweites Mal braucht (Regel 12, Konsistenz vor Einzelloesung). */
  export const PROFIL_ICON_OPTIONEN: readonly ProfilIconTyp[] = [
    'siebtraeger',
    'moka',
    'pourover',
    'coldbrew',
    'ristretto',
    'espresso',
    'lungo',
  ];
  /** Geräte-Icons brauchen mehr Fläche als die Tassen-Füllstände, um in der
   *  56-px-Kachel nicht "dünn" zu wirken (Rückmeldung zur Icon-Bibliothek). */
  export function profilIconGroesse(icon: ProfilIconTyp): number {
    return icon === 'ristretto' || icon === 'espresso' || icon === 'lungo' ? 26 : 30;
  }
  /** Vorbelegung aus dem Gerät — espresso heißt hier "siebtraeger" (das
   *  Icon zeigt den Portafilter, nicht die Zubereitungsart-Bezeichnung). */
  export function standardIconVon(typ: 'espresso' | 'moka' | 'pourover' | 'coldbrew' | undefined): ProfilIconTyp {
    if (typ === 'espresso') return 'siebtraeger';
    return typ ?? 'siebtraeger';
  }
</script>

<script lang="ts">
  let { icon, groesse = 24 }: { icon: ProfilIconTyp; groesse?: number } = $props();
</script>

<svg
  viewBox="0 0 24 24"
  width={groesse}
  height={groesse}
  fill="none"
  stroke="currentColor"
  stroke-width="1.4"
  stroke-linejoin="round"
  stroke-linecap="round"
  aria-hidden="true"
>
  {#if icon === 'siebtraeger'}
    <rect x="1.5" y="10.2" width="11" height="3.6" rx="1.8" />
    <path d="M13 8h8.5l-2 8.5h-4.5z" />
    <path d="M17 17.6c.9 1.1.9 2.3 0 3.1-.9-.8-.9-2 0-3.1z" />
  {:else if icon === 'moka'}
    <circle cx="12" cy="3.6" r="1.1" />
    <path d="M7 6.2h10l-2.1 6.6h-5.8z" />
    <path d="M9.7 6.9v5.2M14.3 6.9v5.2" stroke-width="0.95" />
    <path d="M8.9 12.8h6.2l2.7 8.3H6.2z" />
    <path d="M9.3 13.4v7.1M14.7 13.4v7.1" stroke-width="0.95" />
    <path d="M16.4 6.6l5.8 2.9" stroke-width="1.3" />
  {:else if icon === 'pourover'}
    <path d="M5.5 5h13l-2.8 11.2h-7.4z" />
    <path d="M6.4 8.4h11.2M7.2 11.3h9.6M8 14.2h8" stroke-width="0.9" />
    <path d="M6.5 17.8h11v1.1a.9.9 0 0 1-.9.9H7.4a.9.9 0 0 1-.9-.9z" />
    <path d="M17.5 6c2.4-.4 4 .9 3.6 3-.3 1.6-2.1 2.4-3.6 1.6" stroke-width="1.2" />
  {:else if icon === 'coldbrew'}
    <path d="M6 5h12v3l1 1v11a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V9l1-1z" />
    <path d="M6 9h12" stroke-width="1.1" />
  {:else if icon === 'ristretto'}
    <path d="M6 7h12v11a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3z" />
    <path d="M6.6 18h10.8" stroke-width="1.1" />
    <path d="M7 18.4h10v.6a3 3 0 0 1-3 3H10a3 3 0 0 1-3-3z" fill="currentColor" stroke="none" />
  {:else if icon === 'espresso'}
    <path d="M6 7h12v11a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3z" />
    <path d="M6.4 14.2h11.2" stroke-width="1.1" />
    <path d="M6.6 14.6h10.8v3.4a3 3 0 0 1-3 3H9.6a3 3 0 0 1-3-3z" fill="currentColor" stroke="none" />
  {:else if icon === 'lungo'}
    <path d="M6 7h12v11a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3z" />
    <path d="M6.2 10.5h11.6" stroke-width="1.1" />
    <path d="M6.3 10.9h11.4v6.1a3 3 0 0 1-3 3H9.3a3 3 0 0 1-3-3z" fill="currentColor" stroke="none" />
  {/if}
</svg>
