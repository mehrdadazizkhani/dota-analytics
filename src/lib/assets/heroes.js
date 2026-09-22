const HERO_CDN_URL = "https://cdn.stratz.com/images/dota2/heroes";

export function getHeroAsset(hero, type = "portrait") {
  if (!hero?.shortName) {
    return "";
  }

  const suffixes = {
    icon: "_icon.png",
    portrait: "_vert.png",
    landscape: "_horz.png",
    model: "_model.png",
  };

  const suffix = suffixes[type];

  if (!suffix) {
    return "";
  }

  return `${HERO_CDN_URL}/${hero.shortName}${suffix}`;
}
