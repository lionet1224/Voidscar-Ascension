import { baseNames, equipmentSlots, legendaryPowers, prefixes, rarityLabels, rarityRank, seasonalPowers, suffixes } from "../data/affixes";
import { dropTables, itemPowerBands, salvageYields } from "../data/seasonDataPack";
import type { Character, EquipmentSlot, Item, ItemAffix, ItemRarity, LootFilter } from "../types";
import { pick, uid } from "./id";

export function generateLoot(character: Character, contentLevel: number, riftTier = 0, count = 3): Item[] {
  return Array.from({ length: count }, () => createItem(character, contentLevel, riftTier));
}

export function createItem(character: Character, contentLevel: number, riftTier = 0): Item {
  const rarity = rollRarity(riftTier, contentLevel);
  const slot = pick(equipmentSlots);
  const baseName = pick(baseNames[slot]);
  const itemPowerBand = getItemPowerBand(contentLevel, riftTier);
  const itemLevel = Math.max(1, Math.min(60, contentLevel + Math.floor(Math.random() * 5) + Math.floor(riftTier * 0.1)));
  const power = Math.floor(itemPowerBand.min + Math.random() * (itemPowerBand.max - itemPowerBand.min) + rarityRank[rarity] * 18);
  const prefixCount = rarity === "normal" ? 0 : rarity === "magic" ? 1 : rarity === "rare" ? 2 : 3;
  const suffixCount = rarity === "normal" ? 0 : rarity === "magic" ? 1 : rarity === "rare" ? 2 : 2;
  const rolledPrefixes = rollAffixes(prefixes, prefixCount);
  const rolledSuffixes = rollAffixes(suffixes, suffixCount);
  const legendPool = legendaryPowers.filter((power) => power.classId === character.classId && power.slot === slot);
  const legend = rarity === "legendary" ? pick(legendPool.length ? legendPool : legendaryPowers.filter((power) => power.classId === character.classId)) : undefined;
  const relicPool = seasonalPowers.filter((power) => power.slot === slot);
  const relic = rarity === "seasonalUnique" ? pick(relicPool.length ? relicPool : seasonalPowers) : undefined;
  const seasonalPower: ItemAffix | undefined = relic?.affix;
  const name =
    rarity === "seasonalUnique"
      ? `${rarityLabels[rarity]} · ${relic?.name ?? `赤霄劫火${baseName}`}`
      : rarity === "legendary" && legend
        ? `${rarityLabels[rarity]} · ${legend.name}`
        : `${rarityLabels[rarity]} · ${rolledPrefixes[0]?.name ?? ""} ${baseName} ${rolledSuffixes[0]?.name ?? ""}`.replace(/\s+/g, " ").trim();
  return {
    id: uid("item"),
    characterId: character.id,
    name,
    baseName: rarity === "legendary" && legend ? legend.name : rarity === "seasonalUnique" && relic ? relic.name : baseName,
    rarity,
    itemLevel,
    power,
    slot: rarity === "legendary" && legend ? legend.slot : rarity === "seasonalUnique" && relic ? relic.slot : slot,
    classRestriction: slot === "weapon" && Math.random() > 0.45 ? character.classId : undefined,
    implicitStats: implicitFor(rarity === "legendary" && legend ? legend.slot : rarity === "seasonalUnique" && relic ? relic.slot : slot, power),
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
  const yields = salvageYields[item.rarity];
  return Object.fromEntries(
    Object.entries(yields).map(([material, [min, max]]) => [material, randomInt(min, max)]),
  );
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
  const table = riftTier
    ? dropTables.find((entry) => riftTier >= entry.minTier && riftTier <= entry.maxTier) ?? dropTables[dropTables.length - 1]
    : dropTables[0];
  const weights = Object.entries(table.weights) as [ItemRarity, number][];
  const earlyWeights: [ItemRarity, number][] =
    !riftTier && contentLevel <= 10
      ? [
          ["normal", 55],
          ["magic", 32],
          ["rare", 13],
        ]
      : weights;
  const total = earlyWeights.reduce((sum, [, weight]) => sum + weight, 0);
  let roll = Math.random() * total;
  for (const [rarity, weight] of earlyWeights) {
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

function getItemPowerBand(contentLevel: number, riftTier: number) {
  const source = riftTier
    ? riftTier <= 30
      ? "归墟天阶 1-30"
      : riftTier <= 60
        ? "归墟天阶 31-60"
        : riftTier <= 90
          ? "归墟天阶 61-90"
          : "归墟天阶 91-120"
    : contentLevel <= 10
      ? "1-10 级秘境"
      : contentLevel <= 20
        ? "11-20 级秘境"
        : contentLevel <= 30
          ? "21-30 级秘境"
          : contentLevel <= 40
            ? "31-40 级秘境"
            : contentLevel <= 50
              ? "41-50 级秘境"
              : "51-60 级秘境";
  return itemPowerBands.find((band) => band.source === source) ?? itemPowerBands[0];
}

function randomInt(min: number, max: number) {
  return Math.floor(min + Math.random() * (max - min + 1));
}
