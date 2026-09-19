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

    const data = await response.json();

    if (!response.ok) {
      console.error("STRATZ API error:", response.status, data);

      return res.status(response.status).json({
        error: "STRATZ API request failed",
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("STRATZ proxy error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}
