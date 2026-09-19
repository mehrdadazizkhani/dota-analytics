import { GraphQLClient } from "graphql-request";
import { GET_HEROES } from "./queries";

const STRATZ_API_URL = "https://api.stratz.com/graphql";

const stratzClient = new GraphQLClient(STRATZ_API_URL, {
  headers: {
    Authorization: `Bearer ${import.meta.env.VITE_STRATZ_API_KEY}`,
  },
});

export async function getHeroes() {
  const data = await stratzClient.request(GET_HEROES);

  return data.constants.heroes;
}
