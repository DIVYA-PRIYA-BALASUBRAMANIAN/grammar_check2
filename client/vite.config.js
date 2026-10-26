import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'window',
  },
  server: {
    proxy: {
      '/uploads': {
        target: 'http://localhost:8080',
        changeOrigin: true
      },
      '/apitxt-proxy': {
        target: 'https://apitxt.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/apitxt-proxy/, '')
      }
    }
  }
})
