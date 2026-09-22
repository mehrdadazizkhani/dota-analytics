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

        guild {
          guild {
            name
            tag
          }
        }

        proSteamAccount {
          name
          realName
          isPro
          totalEarnings
          position

          team {
            id
            tag
          }
        }
      }
    }
  }
`;

export const GET_PLAYER_OVERVIEW = `
  query GetPlayerOverview($steamAccountId: Long!) {
    player(steamAccountId: $steamAccountId) {
      matchCount
      winCount
      firstMatchDate

      team {
        team {
          id
          name
          logo
        }
      }

      heroesPerformance(
        take: 5
        request: { orderBy: ASC }
      ) {
        winCount
        kDA
        matchCount

        hero {
          id
          shortName
          displayName
        }
      }
    }
  }
`;

export const GET_PLAYER_MATCHES = `
  query GetPlayerMatches(
    $steamAccountId: Long!
    $request: PlayerMatchesRequestType!
  ) {
    player(steamAccountId: $steamAccountId) {
      matches(request: $request) {
        id
        durationSeconds
        startDateTime
        actualRank
        lobbyType
        bottomLaneOutcome
        midLaneOutcome
        topLaneOutcome

        league {
          id
          displayName
        }

        players(steamAccountId: $steamAccountId) {
          kills
          deaths
          assists
          partyId
          lane
          position
          imp
          isVictory
          award

          hero {
            displayName
            shortName
          }
        }
      }
    }
  }
`;

export const GET_DRAFT_DATA = (bracket) => `
  query GetDraftData {
    heroStats {
      stats(bracketBasicIds: ${bracket}) {
        heroId
        winCount
        disableCount
        stunCount
        kDAAverage
        killContributionAverage
      }

      matchUp(bracketBasicIds: ${bracket}) {
        heroId

        with {
          heroId1
          heroId2
          winRateHeroId1
          winRateHeroId2
          matchCount
          winCount
          winsAverage
          synergy
        }

        vs {
          heroId1
          heroId2
          winRateHeroId1
          winRateHeroId2
          matchCount
          winCount
          winsAverage
          synergy
        }

        matchCountWith
        matchCountVs
      }
    }
  }
`;
