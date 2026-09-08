/**
 * Id-Erzeugung — `crypto.randomUUID()` ist nur in sicheren Kontexten
 * verfuegbar (HTTPS oder `localhost`). Getestet ueber die LAN-IP des
 * Entwicklungsservers (`http://<ip>:5173`, kein sicherer Kontext) scheitert
 * `crypto.randomUUID()` dort mit einer unbehandelten Ausnahme — lautlos,
 * weil der Aufruf ueberall ausserhalb eines try/catch direkt beim
 * Objekt-Bau steht (`id: crypto.randomUUID()`). Erklaert zwei scheinbar
 * unabhaengige Fehlberichte (Charge anlegen, Shot speichern) mit derselben
 * Ursache — Redesign v2, Etappe 2, Rueckmeldung 2026-09-04.
 *
 * `crypto.getRandomValues()` bleibt dagegen ueberall verfuegbar, auch in
 * unsicheren Kontexten — daraus laesst sich eine UUID v4 von Hand
 * zusammensetzen. `neueId()` ersetzt `crypto.randomUUID()` app-weit.
 */
export function neueId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID();
    } catch {
      // unsicherer Kontext — faellt durch auf die manuelle Erzeugung unten.
    }
  }

  const bytes = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    crypto.getRandomValues(bytes);
  } else {
    // Letzter Ausweg, falls auch getRandomValues fehlt (z. B. sehr alter
    // Browser) — schwaecher zufaellig, aber die App bleibt bedienbar statt
    // an einer ID-Erzeugung zu scheitern.
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  bytes[6] = (bytes[6]! & 0x0f) | 0x40; // Version 4
  bytes[8] = (bytes[8]! & 0x3f) | 0x80; // Variante 10

  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
