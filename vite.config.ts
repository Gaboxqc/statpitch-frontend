/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import svgr from 'vite-plugin-svgr'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  /**
   * The session cookie is host-only and `SameSite=Lax`, so it is sent only on
   * requests the browser considers same-site. In production that holds —
   * `gabrielmayorga.dev` serves the app and `api.gabrielmayorga.dev` the API,
   * one registrable domain. `localhost` is a different site entirely, so a
   * direct call from the dev server would authenticate as nobody.
   *
   * Proxying through Vite makes the call same-origin instead: the cookie is
   * reissued for `localhost` (the Domain attribute is stripped below) and CORS
   * stops applying, which also means response headers arrive whether or not
   * the API remembered to expose them.
   *
   * Set VITE_API_PROXY_TARGET to the API origin and point VITE_API_URL at
   * `/api/statpitch` to turn it on. Unset, nothing here changes.
   */
  const proxyTarget = env.VITE_API_PROXY_TARGET

  return {
    base: '/statpitch/',
    plugins: [
      react(),
      tailwindcss(),
      // Icons in this app always sit next to a text label, so they are decorative by default.
      svgr({ svgrOptions: { svgProps: { 'aria-hidden': 'true', focusable: 'false' } } }),
    ],
    server: proxyTarget
      ? {
          proxy: {
            '/api': {
              target: proxyTarget,
              changeOrigin: true,
              rewrite: (path: string) => path.replace(/^\/api/, ''),
              cookieDomainRewrite: '',
            },
          },
        }
      : undefined,
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      css: false,
      coverage: { provider: 'v8', include: ['src/**/*.{ts,tsx}'] },
    },
  }
})
