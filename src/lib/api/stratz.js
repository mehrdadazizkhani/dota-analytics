import { GraphQLClient } from "graphql-request";

const STRATZ_API_URL = "https://api.stratz.com/graphql";

const stratzClient = new GraphQLClient(STRATZ_API_URL, {
  headers: {
    Authorization: `Bearer ${import.meta.env.VITE_STRATZ_API_KEY}`,
  },
});

export async function getHeroes() {
  const data = await stratzClient.request(`
    query GetHeroes {
      constants {
        heroes {
          name
        }
      }
    }
  `);

  return data.constants.heroes;
}
