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
