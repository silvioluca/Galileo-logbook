import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages serve il progetto da https://silvioluca.github.io/Galileo-logbook/,
  // non dalla radice: senza questo gli asset (JS/CSS) punterebbero a "/assets/..."
  // invece di "/Galileo-logbook/assets/..." e la pagina risulterebbe vuota.
  base: '/Galileo-logbook/',
})
