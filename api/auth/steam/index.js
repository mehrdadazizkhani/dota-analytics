function getBaseUrl(req) {
  const protocol =
    req.headers["x-forwarded-proto"] ||
    (req.headers.host?.startsWith("localhost") ? "http" : "https");

  return `${protocol}://${req.headers.host}`;
}

export default function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  const baseUrl = getBaseUrl(req);
  const returnTo = `${baseUrl}/api/auth/steam/callback`;

  const params = new URLSearchParams({
    "openid.ns": "http://specs.openid.net/auth/2.0",
    "openid.mode": "checkid_setup",
    "openid.return_to": returnTo,
    "openid.realm": `${baseUrl}/`,
    "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
    "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select",
  });

  const authUrl = `https://steamcommunity.com/openid/login?${params.toString()}`;

  res.status(200);
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");

  return res.end(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="referrer" content="no-referrer" />
    <title>Dota Analytics — Steam Login</title>

    <style>
      :root {
        color-scheme: dark;
        font-family:
          Inter,
          ui-sans-serif,
          system-ui,
          -apple-system,
          BlinkMacSystemFont,
          "Segoe UI",
          sans-serif;
      }

      * {
        box-sizing: border-box;
      }

      html,
      body {
        width: 100%;
        height: 100%;
        margin: 0;
      }

      body {
        display: grid;
        place-items: center;
        background:
          radial-gradient(
            circle at 50% 40%,
            rgba(255, 255, 255, 0.055),
            transparent 32%
          ),
          #050505;
        color: #ffffff;
      }

      .container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;
        text-align: center;
      }

      .mark {
        width: 42px;
        height: 42px;
        border: 2px solid rgba(255, 255, 255, 0.12);
        border-top-color: rgba(255, 255, 255, 0.85);
        border-radius: 999px;
        animation: spin 0.9s linear infinite;
      }

      .title {
        margin: 0;
        font-size: 14px;
        font-weight: 600;
        letter-spacing: 0.02em;
      }

      .description {
        margin: -10px 0 0;
        color: rgba(255, 255, 255, 0.42);
        font-size: 12px;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
    </style>
  </head>

  <body>
    <main class="container">
      <div class="mark" aria-hidden="true"></div>

      <h1 class="title">Connecting to Steam</h1>

      <p class="description">
        Redirecting securely to Steam...
      </p>
    </main>

    <script>
      window.location.replace(${JSON.stringify(authUrl)});
    </script>

    <noscript>
      <p>JavaScript is required to continue.</p>
    </noscript>
  </body>
</html>`);
}
