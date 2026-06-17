import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "characters-file-sync",
      configureServer(server) {
        server.middlewares.use("/api/characters", (req, res) => {
          const filePath = path.join(server.config.root, "src/data/characters/characters.json");

          if (req.method === "GET") {
            try {
              const data = fs.readFileSync(filePath, "utf-8");
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.end(data);
            } catch {
              res.statusCode = 404;
              res.end();
            }
            return;
          }

          if (req.method !== "POST") {
            res.statusCode = 405;
            res.end();
            return;
          }

          let body = "";
          req.on("data", (chunk: Buffer) => { body += chunk.toString(); });
          req.on("end", () => {
            fs.mkdirSync(path.dirname(filePath), { recursive: true });
            fs.writeFileSync(filePath, body, "utf-8");
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end("{\"ok\":true}");
          });
        });
      },
    },
  ],
});
