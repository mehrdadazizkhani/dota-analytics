import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

import stratzHandler from "./api/stratz.js";
import steamHandler from "./api/auth/steam/index.js";
import steamCallbackHandler from "./api/auth/steam/callback.js";

function createResponse(res) {
  return {
    status(code) {
      res.statusCode = code;
      return this;
    },

    setHeader(name, value) {
      res.setHeader(name, value);
      return this;
    },

    json(data) {
      res.statusCode ||= 200;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(data));
    },

    redirect(statusCode, location) {
      res.statusCode = statusCode;
      res.setHeader("Location", location);
      res.end();
    },
  };
}

async function parseBody(req) {
  if (req.method !== "POST") {
    return undefined;
  }

  let body = "";

  for await (const chunk of req) {
    body += chunk;
  }

  return body ? JSON.parse(body) : {};
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  process.env.STRATZ_API_KEY = env.STRATZ_API_KEY;
  process.env.AUTH_SECRET = env.AUTH_SECRET;

  return {
    plugins: [
      react(),
      tailwindcss(),

      {
        name: "local-api-adapter",

        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            const url = new URL(req.url || "/", `http://${req.headers.host}`);

            let handler;

            if (url.pathname === "/api/stratz") {
              handler = stratzHandler;
            }

            if (url.pathname === "/api/auth/steam") {
              handler = steamHandler;
            }

            if (url.pathname === "/api/auth/steam/callback") {
              handler = steamCallbackHandler;
            }

            if (!handler) {
              next();
              return;
            }

            try {
              const request = Object.create(req);

              request.body = await parseBody(req);

              const response = createResponse(res);

              await handler(request, response);
            } catch (error) {
              console.error("Local API adapter error:", error);

              if (!res.headersSent) {
                res.statusCode = 500;
                res.setHeader("Content-Type", "application/json");
                res.end(
                  JSON.stringify({
                    error: "Internal server error",
                  }),
                );
              }
            }
          });
        },
      },
    ],
  };
});
