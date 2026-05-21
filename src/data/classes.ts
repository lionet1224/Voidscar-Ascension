import type { CharacterStats, ClassId, MovementAIConfig, TargetingConfig } from "../types";

export const classNames: Record<ClassId, string> = {
  warrior: "剑修",
  ranger: "灵弓",
  mage: "术修",
};

export const resourceNames: Record<ClassId, string> = {
  warrior: "剑意",
  ranger: "灵息",
  mage: "灵力",
};

const baseShared = {
  hpRegen: 1,
  fireResist: 0,
  iceResist: 0,
  lightningResist: 0,
  poisonResist: 0,
  shadowResist: 0,
  critDamage: 1.5,
  attackSpeed: 1,
  castSpeed: 1,
  moveSpeed: 1,
  cooldownReduction: 0,
  damageBonus: 0,
  eliteDamageBonus: 0,
  bossDamageBonus: 0,
  meleeDamageBonus: 0,
  rangedDamageBonus: 0,
  aoeDamageBonus: 0,
  dotDamageBonus: 0,
  summonDamageBonus: 0,
  healingBonus: 0,
  shieldBonus: 0,
};

export const classBaseStats: Record<ClassId, CharacterStats> = {
  warrior: {
    ...baseShared,
    maxHp: 160,
    attackPower: 12,
    armor: 20,
    critChance: 0.05,
    resourceMax: 100,
    resourceRegen: 2,
  },
  ranger: {
    ...baseShared,
    maxHp: 110,
    attackPower: 14,
    armor: 10,
    critChance: 0.08,
    resourceMax: 100,
    resourceRegen: 7,
  },
  mage: {
    ...baseShared,
    maxHp: 95,
    attackPower: 16,
    armor: 7,
    critChance: 0.06,
    resourceMax: 120,
    resourceRegen: 9,
  },
};

export const defaultTargeting: Record<ClassId, TargetingConfig> = {
  warrior: {
    priorities: ["elite", "boss", "nearest", "healer", "shieldBearer"],
    preferClusteredEnemies: false,
    clusterRadius: 160,
    ignoreLowValueTrashWhenEliteExists: false,
  },
  ranger: {
    priorities: ["marked", "ranged", "healer", "elite", "lowestHp"],
    preferClusteredEnemies: false,
    clusterRadius: 180,
    ignoreLowValueTrashWhenEliteExists: true,
  },
  mage: {
    priorities: ["cluster", "elite", "ranged", "healer", "boss"],
    preferClusteredEnemies: true,
    clusterRadius: 220,
    ignoreLowValueTrashWhenEliteExists: true,
  },
};

export const defaultMovement: Record<ClassId, MovementAIConfig> = {
  warrior: {
    strategy: "chaseElite",
    preferredRange: 55,
    dangerAvoidanceWeight: 0.25,
    eliteChaseWeight: 0.8,
  },
  ranger: {
    strategy: "kite",
    preferredRange: 230,
    dangerAvoidanceWeight: 0.75,
    eliteChaseWeight: 0.45,
  },
  mage: {
    strategy: "keepMediumRange",
    preferredRange: 180,
    dangerAvoidanceWeight: 0.65,
    eliteChaseWeight: 0.35,
  },
};
