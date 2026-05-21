import { baseNames, equipmentSlots, legendaryPowers, prefixes, rarityLabels, rarityRank, suffixes } from "../data/affixes";
import type { Character, EquipmentSlot, Item, ItemAffix, ItemRarity, LootFilter } from "../types";
import { pick, uid } from "./id";

const rarityWeightsNormal: [ItemRarity, number][] = [
  ["normal", 45],
  ["magic", 30],
  ["rare", 18],
  ["epic", 6],
  ["legendary", 1],
  ["seasonalUnique", 0.2],
];

const rarityWeightsRift30: [ItemRarity, number][] = [
  ["normal", 10],
  ["magic", 25],
  ["rare", 35],
  ["epic", 22],
  ["legendary", 7],
  ["seasonalUnique", 1],
];

const rarityWeightsRift60: [ItemRarity, number][] = [
  ["normal", 0],
  ["magic", 12],
  ["rare", 38],
  ["epic", 35],
  ["legendary", 13],
  ["seasonalUnique", 2],
];

export function generateLoot(character: Character, contentLevel: number, riftTier = 0, count = 3): Item[] {
  return Array.from({ length: count }, () => createItem(character, contentLevel, riftTier));
}

export function createItem(character: Character, contentLevel: number, riftTier = 0): Item {
  const rarity = rollRarity(riftTier, contentLevel);
  const slot = pick(equipmentSlots);
  const baseName = pick(baseNames[slot]);
  const itemLevel = Math.max(1, contentLevel + Math.floor(Math.random() * 5) + Math.floor(riftTier * 0.35));
  const power = Math.floor(itemLevel * 8 + rarityRank[rarity] * 22 + Math.random() * 18);
  const prefixCount = rarity === "normal" ? 0 : rarity === "magic" ? 1 : rarity === "rare" ? 2 : 3;
  const suffixCount = rarity === "normal" ? 0 : rarity === "magic" ? 1 : rarity === "rare" ? 2 : 2;
  const rolledPrefixes = rollAffixes(prefixes, prefixCount);
  const rolledSuffixes = rollAffixes(suffixes, suffixCount);
  const legend = rarity === "legendary" ? pick(legendaryPowers.filter((power) => power.classId === character.classId) || legendaryPowers) : undefined;
  const seasonalPower: ItemAffix | undefined =
    rarity === "seasonalUnique"
      ? {
          id: "seasonal_ash_ring",
          name: "赤霄劫火",
          description: "劫火裁决伤害和劫火残烬收益提高。",
          statModifiers: { damageBonus: 0.16, shieldBonus: 0.1 },
          tags: ["season"],
          value: 34,
        }
      : undefined;
  const name =
    rarity === "seasonalUnique"
      ? `${rarityLabels[rarity]} · 赤霄劫火${baseName}`
      : `${rarityLabels[rarity]} · ${rolledPrefixes[0]?.name ?? ""} ${baseName} ${rolledSuffixes[0]?.name ?? ""}`.replace(/\s+/g, " ").trim();
  return {
    id: uid("item"),
    characterId: character.id,
    name,
    baseName,
    rarity,
    itemLevel,
    power,
    slot,
    classRestriction: slot === "weapon" && Math.random() > 0.45 ? character.classId : undefined,
    implicitStats: implicitFor(slot, power),
    prefixes: rolledPrefixes,
    suffixes: rolledSuffixes,
    legendaryPower: legend?.slot === slot ? legend.affix : rarity === "legendary" ? legend?.affix : undefined,
    seasonalPower,
    upgradeLevel: 0,
    createdAt: Date.now(),
  };
}

export function itemScore(item: Item) {
  const affixScore = [...item.prefixes, ...item.suffixes].reduce((sum, affix) => sum + affix.value, 0);
  return Math.floor(item.power * 0.4 + affixScore * 2.4 + (item.legendaryPower?.value ?? 0) * 3 + (item.seasonalPower?.value ?? 0) * 3);
}

export function shouldKeepItem(item: Item, filter: LootFilter, character: Character) {
  if (filter.alwaysKeepLegendary && item.rarity === "legendary") return true;
  if (filter.alwaysKeepSeasonalUnique && item.rarity === "seasonalUnique") return true;
  if (filter.keepClassItemsOnly && item.classRestriction && item.classRestriction !== character.classId) return false;
  if (item.power >= filter.minItemPowerToKeep && filter.keepRarities.includes(item.rarity)) return true;
  const affixIds = new Set([...item.prefixes, ...item.suffixes].map((affix) => affix.id));
  return filter.keepAffixIds.some((id) => affixIds.has(id));
}

export function salvageItem(item: Item) {
  if (item.rarity === "seasonalUnique") return { ashCore: 1 };
  if (item.rarity === "legendary") return { legendaryEmber: 1 };
  if (item.rarity === "epic") return { riftShard: 2 };
  if (item.rarity === "rare" || item.rarity === "magic") return { magicDust: item.rarity === "rare" ? 3 : 1 };
  return { scrapIron: 2 };
}

export function applyLoot(materialState: Record<string, number>, character: Character, items: Item[], filter: LootFilter) {
  const kept: Item[] = [];
  const materials = { ...materialState };
  let salvagedCount = 0;
  items.forEach((item) => {
    if (shouldKeepItem(item, filter, character)) {
      kept.push(item);
    } else {
      salvagedCount += 1;
      const gained = salvageItem(item);
      Object.entries(gained).forEach(([key, value]) => {
        materials[key] = (materials[key] ?? 0) + value;
      });
    }
  });
  return { kept, materials, salvagedCount };
}

export function rarityColor(rarity: ItemRarity) {
  return {
    normal: "#8b929e",
    magic: "#3282f6",
    rare: "#a87915",
    epic: "#9b4bd8",
    legendary: "#c65f18",
    seasonalUnique: "#b82c48",
  }[rarity];
}

function rollRarity(riftTier: number, contentLevel: number) {
  const weights = riftTier >= 60
    ? rarityWeightsRift60
    : riftTier >= 30
      ? rarityWeightsRift30
      : contentLevel <= 10
        ? [
            ["normal", 55],
            ["magic", 32],
            ["rare", 13],
          ] satisfies [ItemRarity, number][]
        : contentLevel <= 20
          ? [
              ["normal", 28],
              ["magic", 40],
              ["rare", 27],
              ["epic", 5],
            ] satisfies [ItemRarity, number][]
          : contentLevel <= 30
            ? [
                ["magic", 28],
                ["rare", 50],
                ["epic", 21.5],
                ["legendary", 0.5],
              ] satisfies [ItemRarity, number][]
            : rarityWeightsNormal;
  const total = weights.reduce((sum, [, weight]) => sum + weight, 0);
  let roll = Math.random() * total;
  for (const [rarity, weight] of weights) {
    roll -= weight;
    if (roll <= 0) return rarity;
  }
  return "normal";
}

function rollAffixes(pool: ItemAffix[], count: number) {
  const available = [...pool];
  return Array.from({ length: count }, () => {
    const affix = pick(available);
    available.splice(available.indexOf(affix), 1);
    return affix;
  }).filter(Boolean);
}

function implicitFor(slot: EquipmentSlot, power: number) {
  if (slot === "weapon") return { attackPower: Math.floor(power / 7) };
  if (slot === "offhand") return { resourceRegen: Math.max(1, Math.floor(power / 35)) };
  if (slot === "amulet" || slot === "ring1" || slot === "ring2") return { critChance: Math.min(0.12, power / 3000), damageBonus: Math.min(0.1, power / 4000) };
  if (slot === "boots") return { armor: Math.floor(power / 10), moveSpeed: 0.04 };
  return { armor: Math.floor(power / 7), maxHp: Math.floor(power / 3) };
}
