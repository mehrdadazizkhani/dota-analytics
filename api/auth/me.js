import crypto from "node:crypto";

function parseCookies(cookieHeader = "") {
  const cookies = {};

  for (const part of cookieHeader.split(";")) {
    const [key, ...valueParts] = part.trim().split("=");

    if (!key) {
      continue;
    }

    cookies[key] = valueParts.join("=");
  }

  return cookies;
}

function verifySession(session) {
  if (!session) {
    return null;
  }

  const [encodedPayload, signature] = session.split(".");

  if (!encodedPayload || !signature) {
    return null;
  }

  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error("AUTH_SECRET is not configured.");
  }

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(encodedPayload)
    .digest("base64url");

  const signaturesMatch =
    signature.length === expectedSignature.length &&
    crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature),
    );

  if (!signaturesMatch) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    );

    if (!payload.steamId || !payload.createdAt) {
      return null;
    }

    const maxAge = 7 * 24 * 60 * 60 * 1000;

    if (Date.now() - payload.createdAt > maxAge) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

function getAccountId(steamId) {
  const steamId64 = BigInt(steamId);
  const steamId64Base = BigInt("76561197960265728");

  return (steamId64 - steamId64Base).toString();
}

export default function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const cookies = parseCookies(req.headers.cookie);
    const session = verifySession(cookies.dota_session);

    if (!session) {
      return res.status(200).json({
        authenticated: false,
      });
    }

    const accountId = getAccountId(session.steamId);

    return res.status(200).json({
      authenticated: true,
      accountId,
    });
  } catch (error) {
    console.error("Auth session error:", error);

    return res.status(500).json({
      error: "Authentication check failed.",
    });
  }
}
