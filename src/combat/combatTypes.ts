import type { Character, CharacterStats, Dungeon, Item, RewardBundle, Skill } from "../types";

export type BattleState = "idle" | "preparing" | "running" | "paused" | "bossSpawned" | "success" | "failed" | "settling";

export interface Vector2 {
  x: number;
  y: number;
}

export interface CombatActor {
  id: string;
  name: string;
  type: "player" | "monster" | "summon";
  monsterType?: "trash" | "elite" | "boss" | "ranged" | "charger" | "healer" | "shieldBearer" | "summoner" | "bomber";
  eliteAffixes?: string[];
  hp: number;
  maxHp: number;
  resource: number;
  maxResource: number;
  shield: number;
  attack: number;
  armor: number;
  level: number;
  position: Vector2;
  radius: number;
  speed: number;
  attackCooldown: number;
  attackTimer: number;
  ownerActorId?: string;
  sourceSkillId?: string;
  durationMs?: number;
  pulseTimer?: number;
  statusEffects: CombatStatusEffect[];
}

export interface CombatStatusEffect {
  id: string;
  name: string;
  type: "buff" | "debuff" | "dot" | "control" | "shield" | "mark";
  description: string;
  sourceName: string;
  sourceSkillId?: string;
  remainingMs: number;
  durationMs: number;
  stacks: number;
  tickIntervalMs?: number;
  tickTimerMs?: number;
  damagePerTick?: number;
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  icon: string;
  text: string;
  amount: number;
  type: "damage" | "crit" | "heal" | "shield" | "resource";
  createdAt: number;
  durationMs: number;
}

export interface SkillEffect {
  id: string;
  kind: "line" | "bolt" | "orb" | "ring" | "slash";
  from: Vector2;
  to: Vector2;
  color: string;
  radius: number;
  width: number;
  createdAt: number;
  durationMs: number;
}

export interface CombatSession {
  id: string;
  state: BattleState;
  contentName: string;
  dungeon?: Dungeon;
  riftTier?: number;
  character: Character;
  effectiveStats: CharacterStats;
  equippedPowerIds: string[];
  player: CombatActor;
  monsters: CombatActor[];
  summons: CombatActor[];
  floats: FloatingText[];
  effects: SkillEffect[];
  droppedItems: Item[];
  movementIntent?: {
    target: Vector2;
    expiresAt: number;
    reason: "retreat" | "advance" | "orbit";
  };
  cooldowns: Record<string, number>;
  lastCastAt: Record<string, number>;
  powerFlags: Record<string, boolean>;
  powerCounters: Record<string, number>;
  progress: number;
  emberValue: number;
  emberHeat: number;
  riftModifiers?: string[];
  milestones: Record<number, boolean>;
  spawnTimer: number;
  elapsedMs: number;
  kills: number;
  eliteKills: number;
  deaths: number;
  bossName: string;
  stats: {
    totalDamage: number;
    totalHealing: number;
    damageTaken: number;
    shieldAbsorbed: number;
    skills: Record<string, {
      skill: Skill;
      casts: number;
      hits: number;
      crits: number;
      totalDamage: number;
      maxDamage: number;
      totalHealing: number;
      totalShield: number;
      resourceSpent: number;
      resourceGained: number;
    }>;
    summonDamage: Record<string, number>;
  };
  rewards?: RewardBundle;
}
