export const GET_HEROES = `
  query GetHeroes {
    constants {
      heroes {
        id
        name
        displayName
        shortName
      }
    }
  }
`;

export const GET_HERO = `
  query GetHero($heroId: Short!) {
    constants {
      hero(id: $heroId) {
        id
        name
        displayName
        shortName
        aliases
      }
    }
  }
`;
