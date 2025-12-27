import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from "vite-plugin-singlefile"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // viteSingleFile(), // Desactivado para evitar problemas en móviles con archivos grandes
  ],
  base: '/mirada_de_luz/',
  server: {
    proxy: {
      '/api': 'http://localhost:3000'
    }
  }
})
