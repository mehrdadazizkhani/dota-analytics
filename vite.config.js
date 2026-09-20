import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import crypto from "node:crypto";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  function getBaseUrl(req) {
    const protocol =
      req.headers["x-forwarded-proto"] ||
      (req.headers.host?.startsWith("localhost") ? "http" : "https");

    return `${protocol}://${req.headers.host}`;
  }

  function createSession(steamId) {
    const payload = JSON.stringify({
      steamId,
      createdAt: Date.now(),
    });

    const encodedPayload = Buffer.from(payload).toString("base64url");

    const secret = env.AUTH_SECRET;

    if (!secret) {
      throw new Error("AUTH_SECRET is not configured.");
    }

    const signature = crypto
      .createHmac("sha256", secret)
      .update(encodedPayload)
      .digest("base64url");

    return `${encodedPayload}.${signature}`;
  }

  return {
    plugins: [
      react(),
      tailwindcss(),

      {
        name: "local-api",

        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            const requestUrl = req.url || "";

            /*
             * STRATZ
             */

            if (requestUrl.startsWith("/api/stratz")) {
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

                const responseText = await response.text();

                let data;

                try {
                  data = JSON.parse(responseText);
                } catch {
                  console.error(
                    "STRATZ returned a non-JSON response:",
                    response.status,
                    responseText,
                  );

                  res.statusCode = response.status;

                  res.setHeader("Content-Type", "application/json");

                  res.end(
                    JSON.stringify({
                      error: "STRATZ returned a non-JSON response.",
                      status: response.status,
                      details: responseText,
                    }),
                  );

                  return;
                }

                res.statusCode = response.status;

                res.setHeader("Content-Type", "application/json");

                res.end(JSON.stringify(data));

                return;
              } catch (error) {
                console.error("Local STRATZ proxy error:", error);

                res.statusCode = 500;

                res.setHeader("Content-Type", "application/json");

                res.end(
                  JSON.stringify({
                    error: "Internal server error",
                  }),
                );

                return;
              }
            }

            /*
             * STEAM LOGIN
             */

            if (requestUrl === "/api/auth/steam" && req.method === "GET") {
              const baseUrl = getBaseUrl(req);

              const returnTo = `${baseUrl}/api/auth/steam/callback`;

              const params = new URLSearchParams({
                "openid.ns": "http://specs.openid.net/auth/2.0",
                "openid.mode": "checkid_setup",
                "openid.return_to": returnTo,
                "openid.realm": `${baseUrl}/`,
                "openid.identity":
                  "http://specs.openid.net/auth/2.0/identifier_select",
                "openid.claimed_id":
                  "http://specs.openid.net/auth/2.0/identifier_select",
              });

              const authUrl = `https://steamcommunity.com/openid/?${params.toString()}`;

              res.statusCode = 302;

              res.setHeader("Location", authUrl);

              res.end();

              return;
            }

            /*
             * STEAM CALLBACK
             */

            if (
              requestUrl.startsWith("/api/auth/steam/callback") &&
              req.method === "GET"
            ) {
              try {
                const url = new URL(requestUrl, `http://${req.headers.host}`);

                const query = url.searchParams;

                const mode = query.get("openid.mode");

                const claimedId = query.get("openid.claimed_id");

                if (mode !== "id_res") {
                  res.statusCode = 400;

                  res.setHeader("Content-Type", "application/json");

                  res.end(
                    JSON.stringify({
                      error: "Invalid Steam OpenID response.",
                    }),
                  );

                  return;
                }

                if (!claimedId) {
                  res.statusCode = 400;

                  res.setHeader("Content-Type", "application/json");

                  res.end(
                    JSON.stringify({
                      error: "Steam claimed ID is missing.",
                    }),
                  );

                  return;
                }

                const steamIdMatch = claimedId.match(
                  /^https?:\/\/steamcommunity\.com\/openid\/id\/(\d+)$/,
                );

                if (!steamIdMatch) {
                  res.statusCode = 400;

                  res.setHeader("Content-Type", "application/json");

                  res.end(
                    JSON.stringify({
                      error: "Invalid Steam claimed ID.",
                    }),
                  );

                  return;
                }

                const steamId = steamIdMatch[1];

                const verifyParams = new URLSearchParams();

                for (const [key, value] of query.entries()) {
                  if (key === "openid.mode") {
                    verifyParams.set("openid.mode", "check_authentication");
                  } else {
                    verifyParams.append(key, value);
                  }
                }

                const verificationResponse = await fetch(
                  "https://steamcommunity.com/openid/",
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/x-www-form-urlencoded",
                    },
                    body: verifyParams.toString(),
                  },
                );

                const verificationText = await verificationResponse.text();

                if (!verificationResponse.ok) {
                  console.error(
                    "Steam OpenID verification failed:",
                    verificationResponse.status,
                    verificationText,
                  );

                  res.statusCode = 502;

                  res.setHeader("Content-Type", "application/json");

                  res.end(
                    JSON.stringify({
                      error: "Steam authentication verification failed.",
                    }),
                  );

                  return;
                }

                if (!verificationText.includes("is_valid:true")) {
                  res.statusCode = 401;

                  res.setHeader("Content-Type", "application/json");

                  res.end(
                    JSON.stringify({
                      error: "Steam authentication could not be verified.",
                    }),
                  );

                  return;
                }

                const session = createSession(steamId);

                res.setHeader(
                  "Set-Cookie",
                  `dota_session=${session}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`,
                );

                res.statusCode = 302;

                res.setHeader("Location", `${getBaseUrl(req)}/`);

                res.end();

                return;
              } catch (error) {
                console.error("Steam authentication error:", error);

                res.statusCode = 500;

                res.setHeader("Content-Type", "application/json");

                res.end(
                  JSON.stringify({
                    error: "Steam authentication failed.",
                  }),
                );

                return;
              }
            }

            next();
          });
        },
      },
    ],
  };
});
