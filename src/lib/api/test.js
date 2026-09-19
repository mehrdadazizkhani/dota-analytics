import { getHeroes } from "./stratz";

export async function testStratz() {
  const heroes = await getHeroes();

  console.log("STRATZ heroes:", heroes);

  return heroes;
}
