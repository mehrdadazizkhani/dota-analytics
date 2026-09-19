const ATTRIBUTE_CDN_URL =
  "https://cdn.stratz.com/images/dota2/primary_attributes";

const ATTRIBUTE_ASSETS = {
  STRENGTH: "str.png",
  AGILITY: "agi.png",
  INTELLIGENCE: "int.png",
  UNIVERSAL: "all.png",
};

export function getAttributeAsset(attribute) {
  const fileName = ATTRIBUTE_ASSETS[attribute];

  if (!fileName) {
    return "";
  }

  return `${ATTRIBUTE_CDN_URL}/${fileName}`;
}
