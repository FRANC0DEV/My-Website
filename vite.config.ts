import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import webfontDownload from "vite-plugin-webfont-dl";
import { visualizer } from "rollup-plugin-visualizer";
export default defineConfig({
  plugins: [
    tailwindcss(),
    webfontDownload(),
    visualizer({
      open: true,
      filename: "dist/stats.html",
      gzipSize: true,
      brotliSize: true,
    }),
  ],
});
