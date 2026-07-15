import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Set BASE_URL env var for subpath deploys (e.g. GitHub Pages project repos)
  // Default '/' works for custom domains like vikco.qzz.io
  base: process.env.BASE_URL || '/',
})
