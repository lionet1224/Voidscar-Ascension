import { allDungeons, dungeons, materialDungeons } from "../data/dungeons";
import { seasonPackMeta } from "../data/seasonDataPack";
import type { Character, Dungeon } from "../types";

export const RIFT_TIER_CAP = seasonPackMeta.riftTierCap;

export function isRiftUnlocked(character: Character) {
  return character.level >= 30 && character.completedDungeons.includes("domain_broken_sword_barrow");
}

export function getMaxChallengeRiftTier(character: Character) {
  if (!isRiftUnlocked(character)) return 0;
  return Math.min(RIFT_TIER_CAP, character.highestRiftTier + 1);
}

export function clampRiftTier(character: Character, tier: number) {
  const max = getMaxChallengeRiftTier(character);
  return Math.max(1, Math.min(max || 1, Math.floor(Number.isFinite(tier) ? tier : 1)));
}

export function isDungeonUnlocked(character: Character, dungeon: Dungeon) {
  if (dungeon.kind === "material") return isMaterialDungeonUnlocked(character, dungeon);
  const index = dungeons.findIndex((entry) => entry.id === dungeon.id);
  if (index <= 0) return true;
  const previous = dungeons[index - 1];
  return character.completedDungeons.includes(previous.id);
}

export function getUnlockedDungeons(character: Character) {
  return allDungeons.filter((dungeon) => isDungeonUnlocked(character, dungeon));
}

function isMaterialDungeonUnlocked(character: Character, dungeon: Dungeon) {
  const index = materialDungeons.findIndex((entry) => entry.id === dungeon.id);
  if (index < 0) return false;
  return character.level >= dungeon.recommendedLevel[0];
}
