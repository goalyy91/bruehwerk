import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { VitePWA } from 'vite-plugin-pwa';

/**
 * PWA-Hülle (2026-09-08, vor dem Echtbetrieb). Bis dahin war Brühwerk trotz
 * des Untertitels "PWA, offline-first" keine: kein Manifest, kein Service
 * Worker, kein Icon. Die *Daten* lagen offline, die *App* nicht — ohne Netz
 * blieb der Bildschirm leer, was in einer Küche ohne Empfang genau der Fall
 * ist, für den sie gebaut ist.
 *
 * `registerType: 'prompt'` (Rückmeldung 2026-09-08): die App fragt, statt
 * im Hintergrund zu tauschen. Zwei Gründe, und der zweite ist der wichtige.
 * Erstens tauscht ein stilles Update den Boden unter einer halb ausgefüllten
 * Shot-Erfassung. Zweitens legt Brühwerk vor jeder Aktualisierung eine
 * Sicherung an (daten/schnappschuss.ts) — dafür braucht es einen Moment, in
 * dem feststeht, dass gleich aktualisiert wird.
 *
 * Nicht verwechseln mit "eine alte Fassung festhalten": lehnt man ab, fragt
 * die App beim nächsten Start wieder. Steckenbleiben kann sie nicht.
 */
export default defineConfig({
  plugins: [
    svelte(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'Brühwerk',
        short_name: 'Brühwerk',
        description: 'Ein Laborbuch für Kaffee.',
        lang: 'de',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        // Die Grundfläche des dunklen Themes (tokens.css --d-grund): der
        // Startbildschirm soll nicht weiß aufblitzen, bevor die App steht.
        background_color: '#17140f',
        theme_color: '#17140f',
        orientation: 'portrait',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
          // maskable: Android schneidet das Icon in seine eigene Form. Das
          // Zeichen sitzt mit 60 % Durchmesser mittig, also innerhalb der
          // Schutzzone — dieselbe Datei taugt für beides.
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Kein skipWaiting: die neue Fassung wartet, bis sie bestätigt wird —
        // genau darum geht es beim Prompt. updateSW(true) im
        // Aktualisierung.svelte schickt das SKIP_WAITING dann von Hand.
        clientsClaim: true,
        // Die Schriften sind mit ~300 kB der größte Brocken und werden
        // offline gebraucht — ohne sie fällt die Anzeigenschrift zurück und
        // die App sieht ohne Netz anders aus als mit.
        globPatterns: ['**/*.{js,css,html,woff2,png,svg,ico}'],
        // Jeder Pfad, den die App kennt, ist eine Route ohne eigene Datei
        // (vercel.json rewritet alles auf index.html). Ohne diesen Fallback
        // wäre offline nur "/" erreichbar, ein Neuladen auf
        // /kaffees/xy dagegen ein 404.
        navigateFallback: '/index.html',
      },
    }),
  ],
});
