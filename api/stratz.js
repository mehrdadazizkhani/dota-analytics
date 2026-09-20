import crypto from "node:crypto";

const cache = globalThis.__DOTA_ANALYTICS_STRATZ_CACHE__ || new Map();

const pendingRequests =
  globalThis.__DOTA_ANALYTICS_STRATZ_PENDING__ || new Map();

globalThis.__DOTA_ANALYTICS_STRATZ_CACHE__ = cache;
globalThis.__DOTA_ANALYTICS_STRATZ_PENDING__ = pendingRequests;

const CACHE_TTL = {
  heroes: 60 * 60 * 1000,
  meta: 10 * 60 * 1000,
  default: 60 * 1000,
};

const MAX_RETRIES = 3;
const RETRY_DELAYS = [500, 1000, 2000];

function getCacheKey(query, variables) {
  const hash = crypto.createHash("sha256");

  hash.update(query);
  hash.update(JSON.stringify(variables || {}));

  return hash.digest("hex");
}

function getCacheTtl(query) {
  if (query.includes("GetHeroes")) {
    return CACHE_TTL.heroes;
  }

  if (query.includes("GetHeroMeta")) {
    return CACHE_TTL.meta;
  }

  return CACHE_TTL.default;
}

function getCached(cacheKey) {
  const entry = cache.get(cacheKey);

  if (!entry) {
    return null;
  }

  if (Date.now() >= entry.expiresAt) {
    cache.delete(cacheKey);
    return null;
  }

  return entry.data;
}

function setCached(cacheKey, data, ttl) {
  cache.set(cacheKey, {
    data,
    expiresAt: Date.now() + ttl,
  });
}

function isRetryableStatus(status) {
  return status === 429 || status >= 500;
}

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const data = await parseStratzResponse(response);

if (data?.__nonJsonResponse) {
  console.error(
    "STRATZ returned a non-JSON response:",
    response.status,
    data.text,
  );

  throw new Error(
    `STRATZ returned a non-JSON response with status ${response.status}: ${data.text.slice(
      0,
      500,
    )}`,
  );
}

async function fetchFromStratz(query, variables) {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      const response = await fetch("https://api.stratz.com/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.STRATZ_API_KEY}`,
          "User-Agent": "STRATZ_API",
        },
        body: JSON.stringify({
          query,
          variables,
        }),
      });

      const data = await parseStratzResponse(response);

      if (data?.__nonJsonResponse) {
        console.error(
          "STRATZ returned a non-JSON response:",
          response.status,
          data.text,
        );

        throw new Error(
          `STRATZ returned a non-JSON response with status ${response.status}: ${data.text.slice(
            0,
            500,
          )}`,
        );
      }

      if (response.ok) {
        return data;
      }

      if (!isRetryableStatus(response.status)) {
        console.error("STRATZ API request failed:", response.status, data);

        throw new Error(
          `STRATZ API request failed with status ${response.status}`,
        );
      }

      if (attempt === MAX_RETRIES) {
        console.error(
          "STRATZ API request failed after retries:",
          response.status,
          data,
        );

        throw new Error(
          `STRATZ API request failed with status ${response.status}`,
        );
      }

      await wait(RETRY_DELAYS[attempt]);
    } catch (error) {
      if (
        error.message?.startsWith("STRATZ API request failed with status") ||
        error.message?.startsWith("STRATZ returned a non-JSON response")
      ) {
        throw error;
      }

      if (attempt === MAX_RETRIES) {
        console.error("STRATZ network error:", error);

        throw new Error("STRATZ API network request failed");
      }

      await wait(RETRY_DELAYS[attempt]);
    }
  }

  throw new Error("STRATZ API request failed");
}

async function getStratzData(query, variables, cacheKey) {
  const pendingRequest = pendingRequests.get(cacheKey);

  if (pendingRequest) {
    return pendingRequest;
  }

  const request = fetchFromStratz(query, variables)
    .then((data) => {
      if (!data.errors?.length) {
        const ttl = getCacheTtl(query);

        setCached(cacheKey, data, ttl);
      }

      return data;
    })
    .finally(() => {
      pendingRequests.delete(cacheKey);
    });

  pendingRequests.set(cacheKey, request);

  return request;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const { query, variables } = req.body || {};

    if (!query) {
      return res.status(400).json({
        error: "GraphQL query is required",
      });
    }

    const cacheKey = getCacheKey(query, variables);

    const cachedData = getCached(cacheKey);

    if (cachedData) {
      res.setHeader("X-Cache", "HIT");

      return res.status(200).json(cachedData);
    }

    const wasPending = pendingRequests.has(cacheKey);

    const data = await getStratzData(query, variables, cacheKey);

    if (data.errors?.length) {
      return res.status(200).json(data);
    }

    res.setHeader("X-Cache", wasPending ? "DEDUPED" : "MISS");

    return res.status(200).json(data);
  } catch (error) {
    console.error("STRATZ proxy error:", error);

    return res.status(502).json({
      error: error.message || "STRATZ API request failed",
    });
  }
}
