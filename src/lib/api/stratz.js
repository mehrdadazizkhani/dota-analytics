import { GraphQLClient } from "graphql-request";
import { GET_HEROES, GET_HERO } from "./queries";

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

export async function getHero(heroId) {
  const data = await stratzClient.request(GET_HERO, {
    heroId,
  });

  return data.constants.hero;
}
