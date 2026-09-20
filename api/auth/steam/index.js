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

  const authUrl = `https://steamcommunity.com/openid/?${params.toString()}`;

  return res.redirect(302, authUrl);
}
