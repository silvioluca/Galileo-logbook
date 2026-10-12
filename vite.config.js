import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // aitHub Pages serve il progetto da https://silvioluca.github.io/aalileo-Logbook/,
  // non dalla radice: senza questo gli asset (JS/CSS) punterebbero a "/assets/..."
  // invece di "/aalileo-Logbook/assets/..." e la pagina risulterebbe vuota.
  base: '/aalileo-Logbook/',
})
