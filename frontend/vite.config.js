import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy REST API
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      // Proxy Socket.IO (if using same server)
      '/socket.io': {
        target: 'http://localhost:3000',
        ws: true,
      },
    },
  },
})
