import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath } from 'node:url'

const stub = fileURLToPath(new URL('./src/stubs/Empty.jsx', import.meta.url))

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    tailwindcss(),
    // PWA sirf full build mein
    mode !== 'demo' &&
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon-180x180.png'],
        manifest: {
          name: 'Invoice & Client Tracker',
          short_name: 'Invoices',
          description: 'Track clients, invoices and payments. No subscription.',
          theme_color: '#0F766E',
          background_color: '#F3F5F8',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          icons: [
            { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
            { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
            { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
          navigateFallback: '/index.html',
        },
      }),
  ].filter(Boolean),
  define: {
    __APP_MODE__: JSON.stringify(mode === 'demo' ? 'demo' : 'full'),
  },
  resolve: {
    alias:
      mode === 'demo'
        ? [{ find: /^\.\/pages\/(GetPaid|Payments|Reports|Backup)$/, replacement: stub }]
        : [],
  },
}))