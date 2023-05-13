import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/lobbies': {
        target: 'http://backend:3000/join',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/lobbies/, ''),
      },
      '/game': {
        target: 'http://localhost:3000/game.html',
        changeOrigin: true
      }
    }
    }
})
