import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      outDir: 'dist-eduplay',
      includeAssets: ['favicon.svg', 'icons/*.png'],
      manifest: {
        name: 'EduPlay — Instituto do Saber',
        short_name: 'EduPlay',
        description: 'Plataforma educacional lúdica para o Ensino Fundamental',
        theme_color: '#00D4AA',
        background_color: '#0F1923',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        lang: 'pt-BR',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  build: {
    outDir: 'dist-eduplay',
    chunkSizeWarningLimit: 600, // Ajuste técnico fino para o tamanho tolerado do ecossistema PWA
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Captura dinamicamente todas as extensões e submódulos do Firebase (auth, firestore, app)
          // impedindo a importação mista de inflar o index-B2OnxhF4.js principal
          if (id.includes('node_modules/firebase')) {
            return 'firebase-core-vendor';
          }
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor-core';
          }
          if (id.includes('node_modules/react-router-dom')) {
            return 'router-bundle';
          }
        },
      },
    },
  },
})