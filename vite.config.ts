import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";

export default defineConfig({
  plugins: [wasm(), topLevelAwait(), react()],
  worker: {
    format: "es",
    plugins: () => [wasm(), topLevelAwait()],
  },
  optimizeDeps: {
    // The Automerge WASM module must not be pre-bundled, or it gets duplicated.
    exclude: ["@automerge/automerge-wasm", "@automerge/automerge"],
  },
  server: {
    proxy: {
      "/api": "http://localhost:3000",
      "/sync": { target: "ws://localhost:3000", ws: true },
    },
  },
});
