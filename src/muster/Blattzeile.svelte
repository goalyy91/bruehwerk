<script lang="ts">
  // Blattzeile — Redesign v2, Etappe 8 Block D, Geschwister von Blattliste.svelte
  // (siehe dort für die Herkunft). Deckt den wiederkehrenden einfachen Fall:
  // Name, optionale Meta-Zeile darunter, trailing Chevron oder Akzent-Text.
  // Zeilen mit eigenem Innenleben (Kontextmenü, Aufklapp-Formular — Personen,
  // Beobachtungen, Temperatur-Referenz) bauen das bewusst weiterhin lokal,
  // siehe docs/design/offene-punkte-redesign.md Abschnitt 30.
  //
  // `akzent` und `chevron` sind unabhängig, keine Kombination aus einer
  // festen Liste — das stand schon so im Code, bevor es dieses Muster gab:
  // eine Einstellungen-Zeile ("Geräte verwalten") navigiert UND ist
  // Akzent-Text (Einstieg in einen ganzen Unterbereich); eine Geräte-Zeile
  // ("Muehle X") navigiert, ist aber normaler Text (ein Gegenstand, kein
  // Weg); "+ Setup" ist Akzent-Text OHNE Chevron (Anlegen, keine Navigation).

  let {
    label,
    meta,
    akzent = false,
    chevron = true,
    betont = false,
    gedaempft = false,
    onKlick,
  }: {
    label: string;
    meta?: string;
    akzent?: boolean;
    chevron?: boolean;
    betont?: boolean;
    gedaempft?: boolean;
    onKlick: () => void;
  } = $props();
</script>

<button type="button" class="zeile" onclick={onKlick}>
  <span class="haupt">
    <span class="label" class:akzent class:betont class:gedaempft>{label}</span>
    {#if meta}<span class="meta">{meta}</span>{/if}
  </span>
  {#if chevron}<span class="chevron" aria-hidden="true">›</span>{/if}
</button>

<style>
  .zeile {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--r3);
    min-height: var(--blattzeile);
    border: none;
    background: transparent;
    font-family: var(--schrift);
    text-align: left;
    cursor: pointer;
  }
  .haupt {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  .label {
    font-size: var(--fs-bedienwort);
    color: var(--tinte);
  }
  /* Rückmeldung 2026-09-08: jeder akzent-Aufruf ist eine Handlung oder ein
     Einstieg in einen Bereich ("Datei exportieren", "Geräte verwalten",
     "+ Setup"), nie ein Objektname — nach der Projektregel "Serif trägt
     den Inhalt, Sans nur den Apparat" (bisher hier nicht befolgt, geerbt
     von .zeile). Nicht-akzent-Zeilen (Objektnamen wie "Mühle X") bleiben
     serif, .zeile setzt sie weiterhin. */
  .label.akzent {
    color: var(--akzent);
    font-family: var(--schrift-sans);
  }
  .label.betont {
    font-weight: var(--gw-titel);
  }
  .label.gedaempft {
    color: var(--gedaempft);
  }
  .meta {
    font-family: var(--schrift-sans);
    font-size: var(--fs-meta);
    color: var(--gedaempft);
  }
  .chevron {
    flex: none;
    color: var(--spur);
    font-size: var(--fs-bedienwort);
  }
</style>
