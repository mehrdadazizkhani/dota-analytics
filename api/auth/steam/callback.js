import crypto from "node:crypto";

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

  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error("AUTH_SECRET is not configured.");
  }

  const signature = crypto
    .createHmac("sha256", secret)
    .update(encodedPayload)
    .digest("base64url");

  return `${encodedPayload}.${signature}`;
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const query = new URLSearchParams(req.url.split("?")[1] || "");

    const mode = query.get("openid.mode");
    const claimedId = query.get("openid.claimed_id");

    if (mode !== "id_res") {
      return res.status(400).json({
        error: "Invalid Steam OpenID response.",
      });
    }

    if (!claimedId) {
      return res.status(400).json({
        error: "Steam claimed ID is missing.",
      });
    }

    const steamIdMatch = claimedId.match(
      /^https?:\/\/steamcommunity\.com\/openid\/id\/(\d+)$/,
    );

    if (!steamIdMatch) {
      return res.status(400).json({
        error: "Invalid Steam claimed ID.",
      });
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

      return res.status(502).json({
        error: "Steam authentication verification failed.",
      });
    }

    if (!verificationText.includes("is_valid:true")) {
      return res.status(401).json({
        error: "Steam authentication could not be verified.",
      });
    }

    const session = createSession(steamId);

    res.setHeader(
      "Set-Cookie",
      `dota_session=${session}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800${
        req.headers.host?.startsWith("localhost") ? "" : "; Secure"
      }`,
    );

    const baseUrl = getBaseUrl(req);

    return res.redirect(302, `${baseUrl}/`);
  } catch (error) {
    console.error("Steam authentication error:", error);

    return res.status(500).json({
      error: "Steam authentication failed.",
    });
  }
}
