import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { cloudflare } from "@cloudflare/vite-plugin";
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(), 
    cloudflare(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'logo.png'],
      filename: 'manifest.json',
      manifestFilename: 'manifest.json',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      },
      manifest: {
        name: 'MyCallDriver - Professional Driver Booking',
        short_name: 'MyCallDriver',
        description: 'Professional driver booking made easy',
        theme_color: '#003B71',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        orientation: 'portrait-primary',
        categories: ['travel', 'transportation'],
        lang: 'en',
        icons: [
          {
            src: '/logo.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        shortcuts: [
          {
            name: 'Book Now',
            short_name: 'Book',
            description: 'Quick booking',
            url: '/dashboard/book',
            icons: [{ src: '/logo.png', sizes: '96x96' }]
          },
          {
            name: 'Guest Booking',
            short_name: 'Guest',
            description: 'Book without account',
            url: '/?mode=guest',
            icons: [{ src: '/logo.png', sizes: '96x96' }]
          }
        ]
      }
    })
  ]
});
