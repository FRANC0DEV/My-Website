import { defineConfig, type Plugin } from "vite";
import tailwindcss from "@tailwindcss/vite";
import webfontDownload from "vite-plugin-webfont-dl";
import { visualizer } from "rollup-plugin-visualizer";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const partialsDir = fileURLToPath(new URL("./src/partials", import.meta.url));
const includePattern = /<!--#include\s+partial="([^"]+)"\s*-->/g;

/**
 * Inlines `<!--#include partial="name.html"-->` markers with the contents of
 * src/partials/name.html at dev and build time. This keeps index.html small
 * while the final served HTML stays complete (SEO-friendly, no client-side
 * rendering involved). A full page reload is triggered on partial changes;
 * the next request re-reads them from disk via transformIndexHtml.
 */
function htmlPartials(): Plugin {
  return {
    name: "html-partials",
    enforce: "pre",
    transformIndexHtml: {
      order: "pre",
      handler(html: string) {
        let result = html;
        for (let depth = 0; depth < 5; depth++) {
          includePattern.lastIndex = 0;
          const hasInclude = includePattern.test(result);
          if (!hasInclude) break;
          result = result.replace(includePattern, (_match, name: string) =>
            fs.readFileSync(path.join(partialsDir, name), "utf-8"),
          );
        }
        return result;
      },
    },
    // Hot-reload the page when any partial file changes so the dev server
    // re-runs transformIndexHtml and picks up the new contents.
    handleHotUpdate({ file, server }) {
      if (file.startsWith(partialsDir)) {
        server.ws.send({ type: "full-reload" });
        return [];
      }
    },
  };
}

export default defineConfig({
  base: "/My-Website",
  plugins: [
    htmlPartials(),
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
