import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';
import {apiRouter} from './src/server/api';

export default defineConfig(() => {
  const isGitHubPages = process.env.GITHUB_ACTIONS === 'true';
  const base = isGitHubPages ? '/Amanah/' : '/';

  return {
    base,
    plugins: [
      {
        name: 'vite-plugin-ws-fallback',
        enforce: 'pre' as const,
        configureServer(server) {
          if (!server.ws) {
            (server as any).ws = {
              send: () => {},
              on: () => {},
              off: () => {},
              close: () => {},
              clients: new Set(),
            };
          }
          server.middlewares.use('/api', apiRouter as any);
        },
      },
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: null,
        includeAssets: ['icon.svg', 'apple-touch-icon.png`, 'pwa-192x192.png`, 'pwa-512x512.png`, 'pwa-maskable-512x512.png'],
        manifest: {
          id: base,
          name: 'Amanah',
          short_name: 'Amanah',
          description: 'Private, calm personal growth and halal-future companion app — Becoming better, one day at a time.',
          theme_color: '#283A2E',
          background_color: '#F9F8F6',
          display: 'standalone',
          orientation: 'portrait',
          start_url: base,
          scope: base,
          prefer_related_applications: false,
          icons: [
            {
              src: `${base}pwa-192x192.png`,
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: `${base}pwa-512x512.png`,
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: `${base}pwa-maskable-512x512.png`,
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2,jpg}'],
          navigateFallback: `${base}index.html`,
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: false,
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      allowedHosts: ['sb-550cjjbhqc81.vercel.run'],
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

