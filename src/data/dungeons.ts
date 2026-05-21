import type { Dungeon, MonsterFamilyId, MonsterTemplate } from "../types";
import {
  allDomains,
  domains,
  eliteMarks,
  familyTrashNames as seasonFamilyTrashNames,
  materialDomains,
  monsterTemplates as seasonMonsterTemplates,
  riftBossPool,
  riftModifiers,
  riftTierBands,
} from "./seasonDataPack";

export const dungeons: Dungeon[] = domains.map((domain) => ({
  id: domain.id,
  name: domain.name,
  recommendedLevel: [...domain.recommendedLevel] as [number, number],
  family: domain.family as MonsterFamilyId,
  bossName: domain.bossName,
  basePower: domain.basePower,
  kind: "normal",
  unlockHint: domain.unlock,
  rewardTags: [...domain.rewardTags],
  baseClearTime: domain.baseClearTime,
}));

export const materialDungeons: Dungeon[] = materialDomains.map((domain) => ({
  id: domain.id,
  name: domain.name,
  recommendedLevel: [...domain.recommendedLevel] as [number, number],
  family: domain.family as MonsterFamilyId,
  bossName: domain.bossName,
  basePower: domain.basePower,
  kind: "material",
  unlockHint: domain.unlock,
  rewardTags: [...domain.rewardTags],
  baseClearTime: domain.baseClearTime,
}));

export const allDungeons: Dungeon[] = [...dungeons, ...materialDungeons];

export const familyTrashNames: Record<MonsterFamilyId, string[]> = seasonFamilyTrashNames;

export const eliteAffixes = eliteMarks.map((mark) => mark.name);

export const monsterTemplates: MonsterTemplate[] = [
  ...seasonMonsterTemplates.map((monster) => ({
    id: monster.id,
    name: monster.name,
    family: monster.family as MonsterFamilyId,
    type: monster.type,
    baseHp: monster.baseHp,
    baseDamage: monster.baseDamage,
    baseArmor: monster.baseArmor,
    moveSpeed: monster.moveSpeed,
    attackRange: monster.attackRange,
    progressValue: monster.progressValue,
    tags: [...monster.mechanics],
  })),
  ...domains.map((domain) => {
    const boss = riftBossPool.find((entry) => entry.id === domain.bossId);
    return {
      id: domain.bossId,
      name: domain.bossName,
      family: domain.family as MonsterFamilyId,
      type: "boss" as const,
      baseHp: Math.floor(domain.basePower * 5.4),
      baseDamage: Math.floor(domain.basePower / 18),
      baseArmor: Math.floor(domain.basePower / 9),
      moveSpeed: 34,
      attackRange: 48,
      progressValue: 0,
      tags: [...(boss?.mechanics ?? ["劫主"])],
    };
  }),
];

export function getDungeon(id: string) {
  return allDungeons.find((dungeon) => dungeon.id === id) ?? dungeons[0];
}

export function getRiftTierBand(tier: number) {
  return riftTierBands.find((band) => tier >= band.range[0] && tier <= band.range[1]) ?? riftTierBands[0];
}

export function getRiftModifiers(tier: number) {
  const available = riftModifiers.filter((modifier) => tier >= modifier.minTier);
  const count = tier >= 100 ? 3 : tier >= 61 ? 2 + Number(Math.random() > 0.35) : tier >= 31 ? 1 + Number(Math.random() > 0.55) : tier >= 15 ? 1 : 0;
  return shuffle(available).slice(0, count);
}

export function getRiftBoss(tier: number) {
  const pool = tier >= 100 ? riftBossPool : riftBossPool.filter((boss) => boss.id !== "boss_chixiao_ancestor");
  return pool[Math.floor(Math.random() * pool.length)] ?? riftBossPool[0];
}

export function monsterScaling(tier: number) {
  return {
    hp: Math.pow(1.075, tier),
    damage: Math.pow(1.045, tier),
    armor: Math.pow(1.03, tier),
    moveSpeed: 1 + Math.min(tier * 0.0015, 0.18),
  };
}

export function riftPower(tier: number) {
  const band = getRiftTierBand(tier);
  const [startTier, endTier] = band.range;
  const [startPower, endPower] = band.recommendedPower;
  const t = Math.min(1, Math.max(0, (tier - startTier) / Math.max(1, endTier - startTier)));
  return Math.floor(startPower + (endPower - startPower) * t);
}

export function riftRewardGrowth(tier: number) {
  return {
    spiritStone: Math.floor(120 * Math.pow(1.055, tier)),
    exp: Math.floor(160 * Math.pow(1.05, tier)),
    itemPowerBonus: Math.floor(tier * 3.2),
    emberRemnant: Math.floor(8 + tier * 0.8),
  };
}

function shuffle<T>(entries: readonly T[]) {
  const next = [...entries];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}
