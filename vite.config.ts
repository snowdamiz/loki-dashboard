import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || 'https://loki-late-paper-3992.fly.dev')
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://loki-late-paper-3992.fly.dev',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
