import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "apple-touch-icon.png"],
      manifest: {
        name: "QuiVoteQuoi",
        short_name: "QuiVoteQuoi",
        description:
          "Découvre ta proximité avec les groupes politiques de l'Assemblée nationale sur la base de leurs votes réels, pas de leurs programmes.",
        lang: "fr",
        start_url: "/",
        scope: "/",
        display: "standalone",
        theme_color: "#000091",
        background_color: "#f6f6f3",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        // Précache les assets buildés (JS/CSS/HTML) par défaut. Les JSON de données (lois,
        // résumés, groupes) sont chargés à l'exécution depuis /data/ : mis en cache ici pour un
        // fonctionnement hors ligne après une première visite, avec revalidation en arrière-plan
        // dès que le réseau est disponible pour refléter une future mise à jour du pipeline.
        runtimeCaching: [
          {
            urlPattern: /\/data\/.*\.json$/,
            handler: "StaleWhileRevalidate",
            options: { cacheName: "quivotequoi-data" },
          },
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts",
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ],
});
