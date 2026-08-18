import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import svgr from 'vite-plugin-svgr'

// https://vite.dev/config/
export default defineConfig({
  base: '/statpitch/',
  plugins: [
    react(),
    tailwindcss(),
    // Icons in this app always sit next to a text label, so they are decorative by default.
    svgr({ svgrOptions: { svgProps: { 'aria-hidden': 'true', focusable: 'false' } } }),
  ],
})
