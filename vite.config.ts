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
      // Favicons und das Apple-Icon werden aus dem HTML verlinkt, nicht aus
      // dem Code importiert — ohne diese Liste kennt der Service Worker sie
      // nicht und sie fehlten offline.
      includeAssets: [
        'icons/favicon.ico',
        'icons/favicon-16x16.png',
        'icons/favicon-32x32.png',
        'icons/apple-touch-icon.png',
      ],
      manifest: {
        name: 'Brühwerk',
        short_name: 'Brühwerk',
        description: 'Ein Laborbuch für Kaffee.',
        lang: 'de',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        // Die Fläche des Icons selbst (dessen Eckpixel, gemessen), damit der
        // Startbildschirm keine sichtbare Kante um das Icon zeigt.
        background_color: '#23140d',
        // Rückmeldung 2026-09-08: im hellen Modus war die Systemleiste
        // schwarz. Als installierte App nimmt Android die Farbe beim Start
        // aus dem Manifest — und die kann nur einen Wert haben, während
        // Brühwerk hell und dunkel kennt. Deshalb steht hier die helle
        // Grundfläche (tokens.css --h-grund): sie passt zum Systemthema,
        // in dem die App meistens läuft. Den Rest erledigt
        // <meta name="theme-color">, das Rahmen.svelte bei jedem
        // Themenwechsel auf die tatsächlich gemalte Fläche nachzieht.
        //
        // Weglassen ist keine Option: vite-plugin-pwa setzt dann seine
        // eigene Vorgabe ein (#42b883, ein Grün) — nachgesehen im gebauten
        // Manifest, nicht vermutet.
        theme_color: '#f1ebe1',
        orientation: 'portrait',
        // Julians Icon-Paket aus public/icons (README.txt dort). "any" trägt
        // den Schriftzug, "maskable" nur die Tasse: Android schneidet das
        // Icon in seine eigene Form, und ein Wort am Rand wäre das erste,
        // was dabei wegfällt.
        icons: [
          { src: '/icons/bruehwerk-app-icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/bruehwerk-app-icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/bruehwerk-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
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
        // Was nur im Ordner liegt, muss nicht mit aufs Telefon: die
        // 1024er-Fassung verlinkt nichts (sie ist die Quelle für die
        // kleineren), und die README ist Papier für Menschen. Zusammen
        // 172 kB, die sonst bei jedem Update mit heruntergeladen würden.
        globIgnores: ['**/icons/*-1024.png', '**/icons/README.txt'],
        // Jeder Pfad, den die App kennt, ist eine Route ohne eigene Datei
        // (vercel.json rewritet alles auf index.html). Ohne diesen Fallback
        // wäre offline nur "/" erreichbar, ein Neuladen auf
        // /kaffees/xy dagegen ein 404.
        navigateFallback: '/index.html',
      },
    }),
  ],
});
