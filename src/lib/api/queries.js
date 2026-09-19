export const GET_HEROES = `
  query GetHeroes {
    constants {
      heroes {
        id
        name
        displayName
        shortName

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
