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
 * `registerType: 'autoUpdate'` mit skipWaiting/clientsClaim ist Absicht: ein
 * Service Worker, der eine alte Fassung festhält, bis der Nutzer irgendwo
 * "neu laden" drückt, ist schlimmer als keiner — dann steckt eine App für
 * eine Person auf einem Telefon monatelang auf einem Stand fest, ohne dass
 * man sieht, warum.
 */
export default defineConfig({
  plugins: [
    svelte(),
    VitePWA({
      registerType: 'autoUpdate',
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
        skipWaiting: true,
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
