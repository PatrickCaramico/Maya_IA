import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Em dev, o frontend chama "/api/..." e o Vite redireciona pro
      // backend seguro (server/index.js) rodando na porta 8787.
      // Em produção, sirva o backend no mesmo domínio sob /api.
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true
      }
    }
  }
})
