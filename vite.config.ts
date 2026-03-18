/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Battle Math - Math Game for Kids',
        short_name: 'BattleMath',
        description:
          'A fun math game for kids! Defeat enemies by solving math problems.',
        theme_color: '#FFD93D',
        background_color: '#FF8C00',
        display: 'standalone',
        start_url: '/battlemath/',
        scope: '/battlemath/',
        icons: [
          {
            src: 'favicon.ico',
            sizes: '64x64 32x32 24x24 16x16',
            type: 'image/x-icon',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,jpg,mp3,svg}'],
      },
    }),
  ],
  base: '/battlemath/',
  build: {
    outDir: 'build',
  },
  resolve: {
    alias: {
      'react-native': 'react-native-web',
    },
    extensions: ['.web.tsx', '.web.ts', '.web.js', '.tsx', '.ts', '.js'],
  },
  server: {
    port: 3000,
    open: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  },
});
