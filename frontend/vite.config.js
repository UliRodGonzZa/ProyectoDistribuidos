import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: [
      'defdc9dc-df0e-4023-a47a-41f630ee7650.preview.emergentagent.com',
      '.emergentagent.com',
      'localhost'
    ]
  }
})
