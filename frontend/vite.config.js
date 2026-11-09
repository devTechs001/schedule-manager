import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: 'generateSW',
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,webp}'],
        // The HTML shell must never be served stale: it references hashed
        // chunk names, and a cached shell + dropped chunks is exactly what
        // leaves the app stuck on its loading screen after a deploy.
        navigateFallback: '/index.html',
        // Drop precaches from previous builds immediately.
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            // Hashed build output is immutable — cache-first is safe and fast.
            urlPattern: /\/assets\/.*\.(?:js|css|woff2|webp|png|svg)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'app-static',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/(api\.|www\.)?your-api-domain\.com/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 5 * 60, // 5 minutes
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/(.*\.)?your-image-domain\.com/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
      manifest: {
        name: 'AI Schedule Manager',
        short_name: 'Schedule Manager',
        description: 'AI-powered schedule management application',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'public/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'public/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@assets': resolve(__dirname, './src/assets'),
      '@components': resolve(__dirname, './src/components'),
      '@contexts': resolve(__dirname, './src/contexts'),
      '@hooks': resolve(__dirname, './src/hooks'),
      '@pages': resolve(__dirname, './src/pages'),
      '@services': resolve(__dirname, './src/services'),
      '@styles': resolve(__dirname, './src/styles'),
      '@utils': resolve(__dirname, './src/utils'),
    },
  },
  css: {
    postcss: './postcss.config.js',
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: false,
    // Live-preview / sandbox hosts (e.g. *.e2b.app) are proxied to this dev
    // server, so they must not be rejected by the host allow-list.
    allowedHosts: true,
    hmr: {
      protocol: process.env.VITE_HMR_PROTOCOL || undefined,
      clientPort: process.env.VITE_HMR_PORT ? Number(process.env.VITE_HMR_PORT) : undefined,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        ws: true,
      },
    },
  },
  // GitHub Pages base path configuration
  base: process.env.VITE_BASE_PATH || '/',
})
