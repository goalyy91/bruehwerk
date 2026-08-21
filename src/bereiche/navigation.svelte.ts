/**
 * Der reaktive Verlauf — Gegenstueck zu bestand.svelte.ts, nur fuer "wo bin
 * ich" statt "was ist gespeichert". Der Browser-Verlauf ist die Wahrheit,
 * genau wie IndexedDB die Wahrheit fuer Daten ist: jeder Bildschirmwechsel
 * ist ein echter history-Eintrag, kein Zustand nur im Speicher. Damit
 * funktionieren die Android-Geste, der System-Zurueck-Knopf und der
 * Zurueck-Pfeil ueber denselben Weg.
 *
 * Lebt bewusst in bereiche/, nicht in daten/ — aus demselben Grund wie
 * bestand.svelte.ts (kein Svelte in daten/).
 */
import { ausPfad, elternVon, wurzelVon, zuPfad, START, type Bereich, type Route } from './route';

interface VerlaufsZustand {
  tiefe?: number;
}

function aktuellerPfad(): string {
  return decodeURIComponent(location.hash.slice(1));
}

class Navigation {
  aktuell = $state<Route>(START);

  /** Vom Rahmen gesetzt (bind:this auf den Scroll-Container .inhalt). */
  scrollContainer: HTMLElement | undefined;

  // Wie viele Eintraege WIR selbst auf den Stapel gelegt haben. Nur wenn
  // > 0 fuehrt zurueck() zu history.back() — sonst gibt es nichts, wohin
  // der Browser zurueckgehen koennte (z. B. direkt nach einem Neuladen),
  // und wir setzen stattdessen den Pfad auf das Eltern-Blatt.
  #tiefe = 0;
  #scrollpositionen = new Map<string, number>();

  /** Einmal beim App-Start aufrufen. Gibt die Aufraeumfunktion zurueck. */
  starten(): () => void {
    this.aktuell = location.hash ? ausPfad(aktuellerPfad()) : START;
    if (!location.hash) {
      history.replaceState({ tiefe: 0 } satisfies VerlaufsZustand, '', `#${zuPfad(this.aktuell)}`);
    } else {
      this.#tiefe = this.#tiefeAusZustand();
    }

    const horcher = () => {
      this.#tiefe = this.#tiefeAusZustand();
      // Nie history.state blind uebernehmen — der Pfad wird immer neu
      // geparst, auch wenn state() beschaedigt oder fremd ist.
      this.aktuell = location.hash ? ausPfad(aktuellerPfad()) : START;
      this.#stelleScrollWieder();
    };
    window.addEventListener('popstate', horcher);
    return () => window.removeEventListener('popstate', horcher);
  }

  /** Eine Ebene tiefer — neuer Verlaufseintrag. */
  gehe(route: Route): void {
    this.#merkeScroll();
    this.#tiefe += 1;
    history.pushState({ tiefe: this.#tiefe } satisfies VerlaufsZustand, '', `#${zuPfad(route)}`);
    this.aktuell = route;
    this.#stelleScrollWieder();
  }

  /** Ersetzt den aktuellen Eintrag, ohne einen neuen anzulegen (K12-artig:
   *  ein leeres Anlege-Formular soll beim Zurueckgehen nicht wiederkommen). */
  ersetze(route: Route): void {
    history.replaceState({ tiefe: this.#tiefe } satisfies VerlaufsZustand, '', `#${zuPfad(route)}`);
    this.aktuell = route;
  }

  /** Eine Ebene zurueck — Geste, System-Knopf und Pfeil rufen alle das hier auf. */
  zurueck(): void {
    this.#merkeScroll();
    if (this.#tiefe > 0) {
      history.back();
      return;
    }
    // Kein eigener Verlauf hinter uns (z. B. direkt auf einem tiefen Blatt
    // geladen) — auf das Eltern-Blatt springen, ohne die App zu verlassen.
    this.ersetze(elternVon(this.aktuell) ?? START);
    this.#stelleScrollWieder();
  }

  /** Tab-Wechsel in der unteren Leiste — auf die Wurzel des Bereichs. */
  tabWechsel(bereich: Bereich): void {
    const wurzel = wurzelVon(bereich);
    if (this.aktuell.name === wurzel.name) return;
    this.gehe(wurzel);
  }

  #tiefeAusZustand(): number {
    const zustand = history.state as VerlaufsZustand | null;
    return typeof zustand?.tiefe === 'number' ? zustand.tiefe : 0;
  }

  #merkeScroll(): void {
    if (this.scrollContainer) this.#scrollpositionen.set(zuPfad(this.aktuell), this.scrollContainer.scrollTop);
  }

  #stelleScrollWieder(): void {
    const ziel = this.#scrollpositionen.get(zuPfad(this.aktuell)) ?? 0;
    requestAnimationFrame(() => {
      if (this.scrollContainer) this.scrollContainer.scrollTop = ziel;
    });
  }
}

export const navigation = new Navigation();
