import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { readFileSync } from 'fs'
import { sentryVitePlugin } from '@sentry/vite-plugin'
import { VitePWA } from 'vite-plugin-pwa'

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'))
const sentryAuthToken = process.env.SENTRY_AUTH_TOKEN
const sentryOrg = process.env.SENTRY_ORG
const sentryProject = process.env.SENTRY_PROJECT
const sentryEnabled = Boolean(sentryAuthToken && sentryOrg && sentryProject)

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifestFilename: 'manifest.json',
      includeAssets: ['favicon.png', 'icon-512.png', 'robots.txt'],
      manifest: {
        id: '/',
        name: 'D.I.G.E. - Dijiang Integrated Generator Efficiency',
        short_name: 'D.I.G.E.',
        description: 'Thermal Pool power generation optimizer for Arknights: Endfield.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        display_override: ['standalone', 'minimal-ui'],
        background_color: '#1a1a2e',
        theme_color: '#1a1a2e',
        orientation: 'any',
        lang: 'zh-CN',
        dir: 'ltr',
        categories: ['games', 'utilities'],
        icons: [
          {
            src: '/favicon.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        navigateFallback: '/index.html',
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,json}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
      devOptions: {
        enabled: false,
      },
    }),
    sentryEnabled
      ? sentryVitePlugin({
          org: sentryOrg,
          project: sentryProject,
          authToken: sentryAuthToken,
          release: { name: pkg.version },
        })
      : null,
  ].filter(Boolean),
  build: {
    sourcemap: true,
  },
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
})
