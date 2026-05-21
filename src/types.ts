export type ClassId = "warrior" | "ranger" | "mage";
export type CharacterStatus = "active" | "archived";
export type EquipmentSlot =
  | "weapon"
  | "offhand"
  | "helmet"
  | "chest"
  | "gloves"
  | "pants"
  | "boots"
  | "amulet"
  | "ring1"
  | "ring2";

export type ItemRarity =
  | "normal"
  | "magic"
  | "rare"
  | "epic"
  | "legendary"
  | "seasonalUnique";

export interface CharacterStats {
  maxHp: number;
  hpRegen: number;
  attackPower: number;
  armor: number;
  fireResist: number;
  iceResist: number;
  lightningResist: number;
  poisonResist: number;
  shadowResist: number;
  critChance: number;
  critDamage: number;
  attackSpeed: number;
  castSpeed: number;
  moveSpeed: number;
  cooldownReduction: number;
  resourceMax: number;
  resourceRegen: number;
  damageBonus: number;
  eliteDamageBonus: number;
  bossDamageBonus: number;
  meleeDamageBonus: number;
  rangedDamageBonus: number;
  aoeDamageBonus: number;
  dotDamageBonus: number;
  summonDamageBonus: number;
  healingBonus: number;
  shieldBonus: number;
}

export type SkillTag =
  | "melee"
  | "ranged"
  | "aoe"
  | "singleTarget"
  | "physical"
  | "fire"
  | "ice"
  | "lightning"
  | "poison"
  | "arcane"
  | "dot"
  | "control"
  | "summon"
  | "shield"
  | "heal";

export interface Skill {
  id: string;
  classId: ClassId;
  name: string;
  icon: string;
  type: "basic" | "core" | "defense" | "mobility" | "summon" | "ultimate";
  tags: SkillTag[];
  cooldownMs: number;
  resourceCost: number;
  resourceGain?: number;
  damageMultiplier: number;
  range: number;
  radius?: number;
  durationMs?: number;
  statusEffectIds?: string[];
}

export type SkillConditionType =
  | "always"
  | "resourceAbove"
  | "resourceBelow"
  | "hpAbove"
  | "hpBelow"
  | "enemyCountNearby"
  | "eliteExists"
  | "bossExists"
  | "targetHpBelow"
  | "targetHasStatus"
  | "targetMissingStatus"
  | "selfHasBuff"
  | "selfMissingBuff"
  | "summonCountBelow"
  | "shieldBelow"
  | "cooldownReady"
  | "timeEvery"
  | "progressAbove"
  | "progressBelow";

export interface SkillCondition {
  type: SkillConditionType;
  operator?: ">=" | "<=" | ">" | "<" | "==" | "!=";
  value?: number | string;
  radius?: number;
  statusId?: string;
  buffId?: string;
}

export interface SkillConditionGroup {
  logic: "AND";
  conditions: SkillCondition[];
}

export interface SkillCastRule {
  skillId: string;
  enabled: boolean;
  priority: number;
  mode: "auto" | "disabled";
  conditionGroups: SkillConditionGroup[];
  minIntervalMs?: number;
  reserveForElite?: boolean;
  reserveForBoss?: boolean;
}

export interface SkillProfile {
  id: string;
  name: string;
  rules: SkillCastRule[];
}

export interface SkillLoadout {
  skillIds: string[];
  activeProfileId: string;
}

export interface TargetingConfig {
  priorities: string[];
  preferClusteredEnemies: boolean;
  clusterRadius: number;
  ignoreLowValueTrashWhenEliteExists: boolean;
}

export interface MovementAIConfig {
  strategy: "standStill" | "kite" | "keepMediumRange" | "chaseElite" | "avoidDanger";
  preferredRange: number;
  dangerAvoidanceWeight: number;
  eliteChaseWeight: number;
}

export interface Character {
  id: string;
  name: string;
  classId: ClassId;
  seasonId: string;
  status: CharacterStatus;
  level: number;
  exp: number;
  stats: CharacterStats;
  equipment: Record<EquipmentSlot, string | null>;
  skillLoadout: SkillLoadout;
  skillProfiles: SkillProfile[];
  skillRanks: Record<string, number>;
  targeting: TargetingConfig;
  movement: MovementAIConfig;
  inventory: Item[];
  materials: Record<string, number>;
  completedDungeons: string[];
  seasonEmbers: number;
  seasonPowers: SeasonPower[];
  highestRiftTier: number;
  stableIdleRiftTier: number;
  createdAt: number;
  archivedAt?: number;
  totalPlayTimeSeconds: number;
  totalIdleSeconds: number;
}

export interface ItemAffix {
  id: string;
  name: string;
  description: string;
  statModifiers: Partial<CharacterStats>;
  tags: string[];
  value: number;
}

export interface Item {
  id: string;
  characterId?: string;
  name: string;
  baseName: string;
  rarity: ItemRarity;
  itemLevel: number;
  power: number;
  slot: EquipmentSlot;
  classRestriction?: ClassId;
  implicitStats: Partial<CharacterStats>;
  prefixes: ItemAffix[];
  suffixes: ItemAffix[];
  legendaryPower?: ItemAffix;
  seasonalPower?: ItemAffix;
  upgradeLevel: number;
  createdAt: number;
}

export interface LootFilter {
  id: string;
  name: string;
  keepRarities: ItemRarity[];
  autoSalvageBelowRarity: ItemRarity;
  minItemPowerToKeep: number;
  keepAffixIds: string[];
  keepClassItemsOnly: boolean;
  alwaysKeepLegendary: boolean;
  alwaysKeepSeasonalUnique: boolean;
}

export interface SeasonPower {
  id: string;
  seasonId: string;
  name: string;
  description: string;
  category: "damage" | "defense" | "utility";
  onlineEffectId: string;
  offlineEffectId: string;
  level: number;
  maxLevel: number;
  costPerLevel: number;
}

export interface SeasonMechanic {
  id: string;
  name: string;
  description: string;
  trigger: string;
  effect: string;
}

export interface SeasonEquipmentMechanic {
  id: string;
  name: string;
  itemRarity: ItemRarity;
  description: string;
  affixTags: string[];
}

export interface SeasonActivity {
  id: string;
  name: string;
  description: string;
  unlockHint: string;
  rewardTags: string[];
}

export interface SeasonDefinition {
  id: string;
  name: string;
  shortName: string;
  theme: string;
  currencyName: string;
  description: string;
  mechanics: SeasonMechanic[];
  equipmentMechanics: SeasonEquipmentMechanic[];
  activities: SeasonActivity[];
  powers: SeasonPower[];
}

export interface Dungeon {
  id: string;
  name: string;
  recommendedLevel: [number, number];
  family: "paper" | "rust" | "darkScreen" | "electric";
  bossName: string;
  basePower: number;
}

export interface MonsterTemplate {
  id: string;
  name: string;
  family: "paper" | "rust" | "darkScreen" | "electric";
  type: "trash" | "ranged" | "charger" | "summoner" | "healer" | "shieldBearer" | "bomber" | "elite" | "boss";
  baseHp: number;
  baseDamage: number;
  baseArmor: number;
  progressValue: number;
  tags: string[];
}

export interface SkillCombatStats {
  skillId: string;
  skillName: string;
  skillIcon: string;
  casts: number;
  hits: number;
  crits: number;
  totalDamage: number;
  maxDamage: number;
  averageDamage: number;
  totalHealing: number;
  totalShield: number;
  resourceSpent: number;
  resourceGained: number;
}

export interface ActorCombatStats {
  actorId: string;
  actorName: string;
  actorType: "player" | "summon" | "trap" | "totem" | "mirror";
  totalDamage: number;
  totalHealing: number;
  damageTaken: number;
  shieldAbsorbed: number;
  kills: number;
  skills: Record<string, SkillCombatStats>;
}

export interface CombatReport {
  id: string;
  characterId: string;
  contentName: string;
  riftTier?: number;
  result: "success" | "failed";
  durationMs: number;
  deaths: number;
  kills: number;
  eliteKills: number;
  bossName: string;
  totalDamage: number;
  totalHealing: number;
  damageTaken: number;
  shieldAbsorbed: number;
  actors: Record<string, ActorCombatStats>;
  rewards: RewardBundle;
  createdAt: number;
}

export interface RewardBundle {
  exp: number;
  gold: number;
  embers: number;
  materials: Record<string, number>;
  itemIds: string[];
  salvagedCount: number;
}

export interface IdleFarmConfig {
  enabled: boolean;
  characterId: string;
  dungeonType: "normal" | "rift";
  dungeonId?: string;
  riftTier?: number;
  skillProfileId: string;
  lootFilterId: string;
  autoSalvage: boolean;
  autoSalvageRarityBelow: ItemRarity;
  keepLegendary: boolean;
  keepSeasonItems: boolean;
  startedAt: number;
  lastClaimAt: number;
}

export interface IdleClaimSummary extends RewardBundle {
  offlineSeconds: number;
  cappedSeconds: number;
  contentName: string;
  completedRuns: number;
  failedRuns: number;
  capped: boolean;
}

export interface PlayerSettings {
  lastSeenPatchVersion: string;
  autoSaveEnabled: boolean;
  floatingTextEnabled: boolean;
  reducedMotion: boolean;
  numberFormat: "short" | "full";
  battleSpeed: 1 | 1.5 | 2;
  theme: "light" | "dark" | "system";
}

export interface SeasonState {
  id: string;
  name: string;
  englishName: string;
  status: "active" | "ended";
  embers: number;
  powers: SeasonPower[];
}

export interface GameSave {
  version: string;
  playerId: string;
  currentCharacterId?: string;
  settings: PlayerSettings;
  seasons: SeasonState[];
  characters: Character[];
  inventory: Item[];
  materials: Record<string, number>;
  unlocked: {
    completedDungeons: string[];
    highestRiftTier: number;
  };
  combatReports: CombatReport[];
  lootFilters: LootFilter[];
  idleFarmConfig?: IdleFarmConfig;
  lastSavedAt: number;
}

export interface PatchNote {
  version: string;
  title: string;
  date: string;
  highlights: string[];
  changes: {
    category: "new" | "balance" | "fix" | "system";
    items: string[];
  }[];
}
