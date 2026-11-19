import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'

const stub = fileURLToPath(new URL('./src/stubs/Empty.jsx', import.meta.url))

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
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