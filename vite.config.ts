import { execSync } from "node:child_process";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";

function getCommitSha(command: string) {
  if (command !== "build") return "dev";
  try {
    return execSync("git rev-parse --short HEAD").toString().trim();
  } catch {
    return "unknown";
  }
}

export default defineConfig(({ command }) => ({
  define: {
    __COMMIT_SHA__: JSON.stringify(getCommitSha(command)),
  },
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
}));
