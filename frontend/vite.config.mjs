// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Ajuste o IP da sua máquina se quiser HMR no celular
const LAN_HOST = process.env.LAN_HOST || '192.168.40.139';
const isDev = process.env.NODE_ENV !== 'production';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Em dev, recomendo desabilitar SW para não interferir nas requests da API
      devOptions: { enabled: false },
      manifest: {
        name: 'MobSupply CRM',
        short_name: 'MobSupply',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#2563eb',
        icons: [
          { src: '/pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      // Se quiser manter SW em dev, troque devOptions.enabled para true e use NetworkOnly para /api:
      // workbox: {
      //   runtimeCaching: [
      //     {
      //       urlPattern: ({ url }) => url.pathname.startsWith('/api'),
      //       handler: 'NetworkOnly',
      //     },
      //   ],
      // },
    }),
  ],

  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: false,
    cors: true,
    // HMR no celular (opcional)
    hmr: { host: LAN_HOST },

    // Proxy de DEV: celular acessa o Vite (IP:5173) e o Vite repassa /api para o backend local
    proxy: {
      '/api': {
        target: 'http://localhost:3333', // backend na MESMA máquina do Vite
        changeOrigin: true,
        secure: false,
        // explícito, mas opcional: mantém o prefixo /api
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
    },
  },

  // Build padrão
  build: {
    sourcemap: isDev ? true : false,
  },
});
