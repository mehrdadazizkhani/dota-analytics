export const GET_HEROES = `
  query GetHeroes {
    constants {
      heroes {
        id
        name
        displayName
        shortName
        aliases
        roles {
          roleId
        }
        stats {
          complexity
          attackType
          primaryAttribute
          primaryAttributeEnum
        }
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
        roles {
          roleId
          level
        }
        abilities {
          slot
          abilityId
        }
        talents {
          abilityId
          slot
        }
        stats {
          enabled
          heroUnlockOrder
          team
          attackType
          startingArmor
          startingMagicArmor
          startingDamageMin
          startingDamageMax
          attackRate
          attackAnimationPoint
          attackAcquisitionRange
          attackRange
          primaryAttribute
          strengthBase
          strengthGain
          intelligenceBase
          intelligenceGain
          agilityBase
          agilityGain
          hpRegen
          mpRegen
          moveSpeed
          moveTurnRate
          hpBarOffset
          visionDaytimeRange
          visionNighttimeRange
          complexity
          primaryAttributeEnum
        }
      }
    }
  }
`;

export const GET_HERO_META = `
  query GetHeroMeta {
    heroStats {
      winDay(take: 8) {
        heroId
        winCount
        matchCount
      }
    }
  }
`;

export const GET_PLAYER = `
  query GetPlayer($steamAccountId: Long!) {
    player(steamAccountId: $steamAccountId) {
      steamAccount {
        id
        name
        avatar
        isDotaPlusSubscriber
        seasonRank
        seasonLeaderboardRank
      }
    }
  }
`;
