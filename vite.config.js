import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: "local-stratz-api",

        configureServer(server) {
          server.middlewares.use("/api/stratz", async (req, res) => {
            if (req.method !== "POST") {
              res.statusCode = 405;
              res.setHeader("Content-Type", "application/json");

              res.end(
                JSON.stringify({
                  error: "Method not allowed",
                }),
              );

              return;
            }

            try {
              let body = "";

              for await (const chunk of req) {
                body += chunk;
              }

              const { query, variables } = JSON.parse(body || "{}");

              if (!query) {
                res.statusCode = 400;
                res.setHeader("Content-Type", "application/json");

                res.end(
                  JSON.stringify({
                    error: "GraphQL query is required",
                  }),
                );

                return;
              }

              const response = await fetch("https://api.stratz.com/graphql", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${env.STRATZ_API_KEY.trim()}`,
                  "User-Agent": "STRATZ_API",
                },
                body: JSON.stringify({
                  query,
                  variables,
                }),
              });

              const data = await response.json();

              res.statusCode = response.status;

              res.setHeader("Content-Type", "application/json");

              res.end(JSON.stringify(data));
            } catch (error) {
              console.error("Local STRATZ proxy error:", error);

              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json");

              res.end(
                JSON.stringify({
                  error: "Internal server error",
                }),
              );
            }
          });
        },
      },
    ],
  };
});
