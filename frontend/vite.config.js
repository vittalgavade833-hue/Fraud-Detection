import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/Fraud-Detection/',
  plugins: [react(), tailwindcss()],
  server: { port: 3000, proxy: { '/api': 'http://localhost:5000' } },
})
