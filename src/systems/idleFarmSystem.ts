import { getDungeon, riftPower } from "../data/dungeons";
import type { Character, GameSave, IdleClaimSummary, IdleFarmConfig, RewardBundle } from "../types";
import { addExp, calculateCharacterPower, getCharacterInventory } from "./characterSystem";
import { clamp, uid } from "./id";
import { applyLoot, generateLoot } from "./lootSystem";

const MAX_IDLE_SECONDS = 24 * 60 * 60;

export function settleIdle(save: GameSave, config: IdleFarmConfig, now = Date.now()) {
  const character = save.characters.find((entry) => entry.id === config.characterId);
  if (!character || !config.enabled) return { save, summary: undefined };
  const offlineSeconds = Math.max(0, Math.floor((now - config.lastClaimAt) / 1000));
  if (offlineSeconds < 60) return { save, summary: undefined };
  const cappedSeconds = Math.min(offlineSeconds, MAX_IDLE_SECONDS);
  const content = getIdleContent(character, config);
  const inventory = getCharacterInventory(save, character);
  const power = calculateCharacterPower(character, inventory);
  const recommendedPower = content.recommendedPower;
  const powerRatio = power / recommendedPower;
  const survivalRate = clamp(0.15 + powerRatio * 0.75, 0.05, 0.98);
  const clearTime = content.baseClearTime / clamp(powerRatio, 0.5, 2.5);
  const possibleRuns = Math.floor(cappedSeconds / clearTime);
  const completedRuns = Math.floor(possibleRuns * survivalRate);
  const failedRuns = possibleRuns - completedRuns;
  const dropCount = Math.min(80, Math.max(0, Math.floor(completedRuns * 0.35)));
  const generated = generateLoot(character, character.level, config.riftTier ?? 0, dropCount);
  const filter = save.lootFilters.find((entry) => entry.id === config.lootFilterId) ?? save.lootFilters[0];
  const loot = applyLoot(character.materials, character, generated, filter);
  const rewards: RewardBundle = {
    exp: Math.floor(content.expPerRun * completedRuns),
    gold: Math.floor(content.goldPerRun * completedRuns),
    embers: Math.floor(content.embersPerRun * completedRuns),
    materials: loot.materials,
    itemIds: loot.kept.map((item) => item.id),
    salvagedCount: loot.salvagedCount,
  };
  const updatedCharacter: Character = {
    ...addExp(character, rewards.exp),
    inventory: [...inventory, ...loot.kept],
    materials: { ...loot.materials, gold: (loot.materials.gold ?? 0) + rewards.gold },
    seasonEmbers: character.seasonEmbers + rewards.embers,
    totalIdleSeconds: character.totalIdleSeconds + cappedSeconds,
  };
  const updatedSave: GameSave = {
    ...save,
    characters: save.characters.map((entry) => (entry.id === character.id ? updatedCharacter : entry)),
    idleFarmConfig: { ...config, lastClaimAt: now },
  };
  const summary: IdleClaimSummary = {
    ...rewards,
    offlineSeconds,
    cappedSeconds,
    contentName: content.name,
    completedRuns,
    failedRuns,
    capped: offlineSeconds > MAX_IDLE_SECONDS,
  };
  return { save: updatedSave, summary };
}

export function getIdleContent(character: Character, config: IdleFarmConfig) {
  if (config.dungeonType === "rift") {
    const tier = Math.min(config.riftTier ?? 1, character.stableIdleRiftTier);
    return {
      name: `归墟天阶 ${tier} 层`,
      recommendedPower: riftPower(tier),
      baseClearTime: 245,
      expPerRun: Math.floor(120 + tier * 28 * Math.pow(1.05, tier)),
      goldPerRun: Math.floor(60 + tier * 18 * Math.pow(1.06, tier)),
      embersPerRun: Math.floor(4 + tier * 0.65),
    };
  }
  const dungeon = getDungeon(config.dungeonId ?? "dust_archive");
  return {
    name: dungeon.name,
    recommendedPower: dungeon.basePower,
    baseClearTime: 210,
    expPerRun: dungeon.basePower * 2,
    goldPerRun: dungeon.basePower,
    embersPerRun: 3,
  };
}
