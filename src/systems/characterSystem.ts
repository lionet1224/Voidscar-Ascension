import { classBaseStats, defaultMovement, defaultTargeting } from "../data/classes";
import { equipmentSlots } from "../data/affixes";
import { CURRENT_SEASON_ID, CURRENT_VERSION, createSeasonState, currentSeasonDefinition } from "../data/seasons";
import { defaultRulesFor, getClassSkills, getDefaultSkillIds } from "../data/skills";
import type { Character, CharacterStats, ClassId, EquipmentSlot, GameSave, Item, LootFilter } from "../types";
import { uid } from "./id";

export function createDefaultSave(): GameSave {
  return {
    version: CURRENT_VERSION,
    playerId: uid("player"),
    settings: {
      lastSeenPatchVersion: "",
      autoSaveEnabled: true,
      floatingTextEnabled: true,
      reducedMotion: false,
      numberFormat: "short",
      battleSpeed: 1,
      theme: "system",
    },
    seasons: [createSeasonState()],
    characters: [],
    inventory: [],
    materials: {
      scrapIron: 0,
      magicDust: 0,
      riftShard: 0,
      legendaryEmber: 0,
      ashCore: 0,
    },
    unlocked: {
      completedDungeons: [],
      highestRiftTier: 0,
    },
    combatReports: [],
    lootFilters: [createDefaultLootFilter()],
    lastSavedAt: Date.now(),
  };
}

export function createDefaultLootFilter(): LootFilter {
  return {
    id: "default",
    name: "默认拾取",
    keepRarities: ["epic", "legendary", "seasonalUnique"],
    autoSalvageBelowRarity: "rare",
    minItemPowerToKeep: 0,
    keepAffixIds: [],
    keepClassItemsOnly: true,
    alwaysKeepLegendary: true,
    alwaysKeepSeasonalUnique: true,
  };
}

export function createDefaultMaterials() {
  return {
    gold: 0,
    scrapIron: 0,
    magicDust: 0,
    riftShard: 0,
    legendaryEmber: 0,
    ashCore: 0,
  };
}

export function createCharacter(name: string, classId: ClassId): Character {
  const skillIds = getDefaultSkillIds(classId);
  const basicSkillId = skillIds[0];
  const equipment = equipmentSlots.reduce(
    (acc, slot) => {
      acc[slot] = null;
      return acc;
    },
    {} as Record<EquipmentSlot, string | null>,
  );
  return {
    id: uid("char"),
    name: name.trim() || `${className(classId)}应劫者`,
    classId,
    seasonId: CURRENT_SEASON_ID,
    status: "active",
    level: 1,
    exp: 0,
    stats: { ...classBaseStats[classId] },
    equipment,
    skillLoadout: {
      skillIds: [basicSkillId],
      activeProfileId: "default",
    },
    skillRanks: {
      [basicSkillId]: 1,
    },
    skillProfiles: [
      {
        id: "default",
        name: "默认自动循环",
        rules: defaultRulesFor(classId),
      },
    ],
    targeting: defaultTargeting[classId],
    movement: defaultMovement[classId],
    inventory: [],
    materials: createDefaultMaterials(),
    completedDungeons: [],
    seasonEmbers: 0,
    seasonPowers: currentSeasonDefinition.powers.map((power) => ({ ...power })),
    highestRiftTier: 0,
    stableIdleRiftTier: 0,
    createdAt: Date.now(),
    totalPlayTimeSeconds: 0,
    totalIdleSeconds: 0,
  };
}

export function className(classId: ClassId) {
  return classId === "warrior" ? "剑修" : classId === "ranger" ? "灵弓" : "术修";
}

export function getCurrentCharacter(save: GameSave) {
  return save.characters.find((character) => character.id === save.currentCharacterId);
}

export function getActiveProfile(character: Character) {
  return character.skillProfiles.find((profile) => profile.id === character.skillLoadout.activeProfileId) ?? character.skillProfiles[0];
}

export function mergeStats(base: CharacterStats, items: Item[]) {
  const stats: CharacterStats = { ...base };
  const apply = (mods: Partial<CharacterStats>, multiplier = 1) => {
    (Object.keys(mods) as (keyof CharacterStats)[]).forEach((key) => {
      stats[key] += (mods[key] ?? 0) * multiplier;
    });
  };
  items.forEach((item) => {
    const bonus = 1 + upgradeBonus(item.upgradeLevel);
    apply(item.implicitStats, bonus);
    item.prefixes.forEach((affix) => apply(affix.statModifiers));
    item.suffixes.forEach((affix) => apply(affix.statModifiers));
    if (item.legendaryPower) apply(item.legendaryPower.statModifiers);
    if (item.seasonalPower) apply(item.seasonalPower.statModifiers);
  });
  return stats;
}

export function getEquippedItems(character: Character, inventory: Item[]) {
  const ids = new Set(Object.values(character.equipment).filter(Boolean));
  return inventory.filter((item) => ids.has(item.id));
}

export function getEffectiveStats(character: Character, inventory: Item[]) {
  return mergeStats(classBaseStats[character.classId], getEquippedItems(character, inventory));
}

export function calculateCharacterPower(character: Character, inventory: Item[]) {
  const stats = getEffectiveStats(character, inventory);
  const itemPower = getEquippedItems(character, inventory).reduce((sum, item) => sum + item.power + item.upgradeLevel * 12, 0);
  const skillCount = Object.values(character.skillRanks).reduce((sum, rank) => sum + rank, 0);
  return Math.floor(
    stats.maxHp * 0.7 +
      stats.attackPower * 12 +
      stats.armor * 2.2 +
      stats.resourceRegen * 6 +
      stats.critChance * 140 +
      stats.damageBonus * 220 +
      itemPower * 0.9 +
      character.level * 18 +
      skillCount * 4,
  );
}

export function getCharacterInventory(save: GameSave, character: Character) {
  const ownItems = character.inventory ?? [];
  const legacyItems = save.inventory.filter((item) => item.characterId === character.id);
  return ownItems.length ? ownItems : legacyItems;
}

export function getCharacterReports(save: GameSave, character: Character) {
  return save.combatReports.filter((report) => report.characterId === character.id);
}

export function ensureCharacterRuntimeFields(character: Character): Character {
  return {
    ...character,
    inventory: character.inventory ?? [],
    materials: { ...createDefaultMaterials(), ...(character.materials ?? {}) },
    completedDungeons: character.completedDungeons ?? [],
    seasonEmbers: character.seasonEmbers ?? 0,
    seasonPowers: character.seasonPowers ?? currentSeasonDefinition.powers.map((power) => ({ ...power })),
  };
}

export function getTotalSkillPoints(character: Character) {
  return Math.max(1, character.level + 1);
}

export function getSpentSkillPoints(character: Character) {
  return Object.values(character.skillRanks).reduce((sum, rank) => sum + rank, 0);
}

export function getAvailableSkillPoints(character: Character) {
  return Math.max(0, getTotalSkillPoints(character) - getSpentSkillPoints(character));
}

export function expToNext(level: number) {
  return Math.floor(80 * Math.pow(1.18, level - 1));
}

export function addExp(character: Character, exp: number) {
  let next = { ...character, exp: character.exp + exp };
  while (next.exp >= expToNext(next.level) && next.level < 60) {
    next = {
      ...next,
      exp: next.exp - expToNext(next.level),
      level: next.level + 1,
    };
  }
  return next;
}

export function upgradeBonus(level: number) {
  const table = [0, 0.03, 0.06, 0.09, 0.12, 0.16, 0.2, 0.25, 0.3, 0.36, 0.45];
  return table[Math.max(0, Math.min(10, level))];
}
