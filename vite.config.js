import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { VitePWA } from "vite-plugin-pwa";
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "pwa-gabarito",
        short_name: "Teste",
        description: "Aplicativo de teste PWA funcionando offline",
        start_url: ".",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#000000",
        icons: [
          {
            src: "icon/web-app-manifest-192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "icon/web-app-manifest-512x512.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,jpg,svg}"], // Arquivos para cache
        skipWaiting: true, // Força o novo SW a assumir o controle
        clientsClaim: true, // Atualiza clientes imediatamente
        maximumFileSizeToCacheInBytes: 50 * 1024 * 1024, // Atualiza clientes imediatamente
      },
    }),    
  ],
});


