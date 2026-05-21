import type { ClassId, Skill, SkillCastRule } from "../types";

export interface SkillTreeNode {
  skillId: string;
  levelRequirement: number;
  maxRank: number;
  prerequisites: string[];
  branch: "入门" | "核心" | "护体" | "爆发" | "召唤";
  upgradeText: string;
}

export const skills: Skill[] = [
  {
    id: "warrior_slash",
    classId: "warrior",
    name: "破锋剑",
    icon: "⚔",
    type: "basic",
    tags: ["melee", "physical", "singleTarget"],
    cooldownMs: 800,
    resourceCost: 0,
    resourceGain: 8,
    damageMultiplier: 1,
    range: 70,
  },
  {
    id: "warrior_ground_slam",
    classId: "warrior",
    name: "裂岳斩",
    icon: "⛰",
    type: "core",
    tags: ["melee", "aoe", "physical", "control"],
    cooldownMs: 3000,
    resourceCost: 30,
    damageMultiplier: 2.4,
    range: 115,
    radius: 105,
    statusEffectIds: ["stun"],
  },
  {
    id: "warrior_whirlwind",
    classId: "warrior",
    name: "旋罡剑阵",
    icon: "🌪",
    type: "core",
    tags: ["melee", "aoe", "physical"],
    cooldownMs: 1200,
    resourceCost: 22,
    damageMultiplier: 1.8,
    range: 125,
    radius: 125,
  },
  {
    id: "warrior_charge",
    classId: "warrior",
    name: "御剑突进",
    icon: "🛡",
    type: "mobility",
    tags: ["melee", "physical", "control"],
    cooldownMs: 8000,
    resourceCost: 0,
    resourceGain: 10,
    damageMultiplier: 1.3,
    range: 260,
    radius: 75,
  },
  {
    id: "warrior_shout",
    classId: "warrior",
    name: "长啸凝罡",
    icon: "📣",
    type: "defense",
    tags: ["shield", "heal"],
    cooldownMs: 14000,
    resourceCost: 0,
    resourceGain: 35,
    damageMultiplier: 0,
    range: 0,
    durationMs: 5000,
  },
  {
    id: "warrior_execute",
    classId: "warrior",
    name: "斩魄诀",
    icon: "🪓",
    type: "ultimate",
    tags: ["melee", "physical", "singleTarget"],
    cooldownMs: 6000,
    resourceCost: 40,
    damageMultiplier: 4.2,
    range: 85,
  },
  {
    id: "warrior_banner",
    classId: "warrior",
    name: "镇岳剑旗",
    icon: "🚩",
    type: "summon",
    tags: ["summon", "aoe", "physical"],
    cooldownMs: 20000,
    resourceCost: 35,
    damageMultiplier: 0.95,
    range: 0,
    radius: 135,
    durationMs: 9000,
  },
  {
    id: "ranger_quickshot",
    classId: "ranger",
    name: "连珠符箭",
    icon: "🏹",
    type: "basic",
    tags: ["ranged", "physical", "singleTarget"],
    cooldownMs: 600,
    resourceCost: 0,
    resourceGain: 6,
    damageMultiplier: 0.9,
    range: 260,
  },
  {
    id: "ranger_piercing_arrow",
    classId: "ranger",
    name: "穿云灵矢",
    icon: "➶",
    type: "core",
    tags: ["ranged", "physical", "aoe"],
    cooldownMs: 2000,
    resourceCost: 28,
    damageMultiplier: 2,
    range: 330,
    radius: 90,
  },
  {
    id: "ranger_poison_trap",
    classId: "ranger",
    name: "毒藤符阵",
    icon: "☠",
    type: "summon",
    tags: ["poison", "dot", "summon", "aoe"],
    cooldownMs: 8000,
    resourceCost: 25,
    damageMultiplier: 1.35,
    range: 80,
    radius: 120,
    durationMs: 8000,
    statusEffectIds: ["poison"],
  },
  {
    id: "ranger_shadow_step",
    classId: "ranger",
    name: "踏影步",
    icon: "👣",
    type: "mobility",
    tags: ["control"],
    cooldownMs: 10000,
    resourceCost: 0,
    damageMultiplier: 0,
    range: 0,
  },
  {
    id: "ranger_arrow_rain",
    classId: "ranger",
    name: "万羽落",
    icon: "🌧",
    type: "core",
    tags: ["ranged", "aoe", "physical"],
    cooldownMs: 12000,
    resourceCost: 45,
    damageMultiplier: 3.4,
    range: 310,
    radius: 150,
    durationMs: 4200,
  },
  {
    id: "ranger_burst_knife",
    classId: "ranger",
    name: "裂影飞刃",
    icon: "🔪",
    type: "ultimate",
    tags: ["ranged", "aoe", "physical"],
    cooldownMs: 5000,
    resourceCost: 35,
    damageMultiplier: 3,
    range: 230,
    radius: 115,
  },
  {
    id: "ranger_wolf",
    classId: "ranger",
    name: "玄狼灵契",
    icon: "🐺",
    type: "summon",
    tags: ["summon", "physical", "singleTarget"],
    cooldownMs: 18000,
    resourceCost: 30,
    damageMultiplier: 1.1,
    range: 0,
    durationMs: 14000,
  },
  {
    id: "mage_spark",
    classId: "mage",
    name: "星火符",
    icon: "✨",
    type: "basic",
    tags: ["ranged", "fire", "singleTarget"],
    cooldownMs: 700,
    resourceCost: 0,
    resourceGain: 4,
    damageMultiplier: 0.95,
    range: 270,
  },
  {
    id: "mage_fireblast",
    classId: "mage",
    name: "劫焰爆",
    icon: "🔥",
    type: "core",
    tags: ["fire", "aoe", "dot"],
    cooldownMs: 3000,
    resourceCost: 35,
    damageMultiplier: 2.8,
    range: 260,
    radius: 125,
    statusEffectIds: ["burn"],
  },
  {
    id: "mage_frost_ring",
    classId: "mage",
    name: "霜封阵",
    icon: "❄",
    type: "defense",
    tags: ["ice", "aoe", "control"],
    cooldownMs: 9000,
    resourceCost: 30,
    damageMultiplier: 1.2,
    range: 0,
    radius: 165,
    statusEffectIds: ["freeze"],
  },
  {
    id: "mage_chain_lightning",
    classId: "mage",
    name: "引雷诀",
    icon: "⚡",
    type: "core",
    tags: ["lightning", "aoe", "ranged"],
    cooldownMs: 2500,
    resourceCost: 32,
    damageMultiplier: 2.3,
    range: 300,
    radius: 140,
  },
  {
    id: "mage_arcane_missiles",
    classId: "mage",
    name: "星辉飞符",
    icon: "🔮",
    type: "core",
    tags: ["arcane", "ranged", "singleTarget"],
    cooldownMs: 6000,
    resourceCost: 40,
    damageMultiplier: 3.6,
    range: 310,
    durationMs: 2500,
  },
  {
    id: "mage_shield",
    classId: "mage",
    name: "护体灵幕",
    icon: "🛡",
    type: "defense",
    tags: ["shield"],
    cooldownMs: 14000,
    resourceCost: 25,
    damageMultiplier: 0,
    range: 0,
    durationMs: 7000,
  },
  {
    id: "mage_meteor",
    classId: "mage",
    name: "陨星术",
    icon: "☄",
    type: "ultimate",
    tags: ["fire", "aoe"],
    cooldownMs: 18000,
    resourceCost: 70,
    damageMultiplier: 5.8,
    range: 320,
    radius: 180,
    statusEffectIds: ["burn"],
  },
  {
    id: "mage_mirror",
    classId: "mage",
    name: "分神化影",
    icon: "👁",
    type: "summon",
    tags: ["summon", "arcane"],
    cooldownMs: 25000,
    resourceCost: 55,
    damageMultiplier: 0.8,
    range: 0,
    durationMs: 12000,
  },
];

export function getSkill(skillId: string) {
  return skills.find((skill) => skill.id === skillId);
}

export function getClassSkills(classId: ClassId) {
  return skills.filter((skill) => skill.classId === classId);
}

export function getDefaultSkillIds(classId: ClassId) {
  const classSkills = getClassSkills(classId);
  const basic = classSkills.find((skill) => skill.type === "basic")!;
  return [basic.id];
}

export const skillTreeNodes: SkillTreeNode[] = [
  { skillId: "warrior_slash", levelRequirement: 1, maxRank: 5, prerequisites: [], branch: "入门", upgradeText: "每级提高基础剑伤与剑意回复。" },
  { skillId: "warrior_ground_slam", levelRequirement: 3, maxRank: 5, prerequisites: ["warrior_slash"], branch: "核心", upgradeText: "每级提高范围伤害，满级眩晕时间增加。" },
  { skillId: "warrior_whirlwind", levelRequirement: 6, maxRank: 5, prerequisites: ["warrior_ground_slam"], branch: "核心", upgradeText: "每级提高剑阵伤害，满级扩大剑阵范围。" },
  { skillId: "warrior_charge", levelRequirement: 8, maxRank: 3, prerequisites: ["warrior_slash"], branch: "护体", upgradeText: "每级降低冷却并提高剑意获取。" },
  { skillId: "warrior_shout", levelRequirement: 10, maxRank: 3, prerequisites: ["warrior_charge"], branch: "护体", upgradeText: "每级提高护盾与持续时间。" },
  { skillId: "warrior_execute", levelRequirement: 14, maxRank: 5, prerequisites: ["warrior_ground_slam"], branch: "爆发", upgradeText: "每级提高低血目标伤害，满级击杀返还剑意。" },
  { skillId: "warrior_banner", levelRequirement: 18, maxRank: 3, prerequisites: ["warrior_shout"], branch: "召唤", upgradeText: "每级提高剑旗持续时间和脉冲伤害。" },
  { skillId: "ranger_quickshot", levelRequirement: 1, maxRank: 5, prerequisites: [], branch: "入门", upgradeText: "每级提高符箭伤害与灵息回复。" },
  { skillId: "ranger_piercing_arrow", levelRequirement: 3, maxRank: 5, prerequisites: ["ranger_quickshot"], branch: "核心", upgradeText: "每级提高穿透伤害，满级额外穿透目标。" },
  { skillId: "ranger_poison_trap", levelRequirement: 6, maxRank: 5, prerequisites: ["ranger_piercing_arrow"], branch: "核心", upgradeText: "每级提高毒伤，满级毒阵持续更久。" },
  { skillId: "ranger_shadow_step", levelRequirement: 8, maxRank: 3, prerequisites: ["ranger_quickshot"], branch: "护体", upgradeText: "每级降低冷却并提高脱战距离。" },
  { skillId: "ranger_arrow_rain", levelRequirement: 10, maxRank: 5, prerequisites: ["ranger_piercing_arrow"], branch: "爆发", upgradeText: "每级提高范围伤害，满级持续时间增加。" },
  { skillId: "ranger_burst_knife", levelRequirement: 14, maxRank: 5, prerequisites: ["ranger_arrow_rain"], branch: "爆发", upgradeText: "每级提高爆裂范围和暴击收益。" },
  { skillId: "ranger_wolf", levelRequirement: 18, maxRank: 3, prerequisites: ["ranger_poison_trap"], branch: "召唤", upgradeText: "每级提高玄狼伤害与持续时间。" },
  { skillId: "mage_spark", levelRequirement: 1, maxRank: 5, prerequisites: [], branch: "入门", upgradeText: "每级提高星火伤害与灵力回复。" },
  { skillId: "mage_fireblast", levelRequirement: 3, maxRank: 5, prerequisites: ["mage_spark"], branch: "核心", upgradeText: "每级提高劫焰伤害，满级燃烧可叠加。" },
  { skillId: "mage_frost_ring", levelRequirement: 6, maxRank: 3, prerequisites: ["mage_spark"], branch: "护体", upgradeText: "每级提高冻结范围和护身收益。" },
  { skillId: "mage_chain_lightning", levelRequirement: 8, maxRank: 5, prerequisites: ["mage_fireblast"], branch: "核心", upgradeText: "每级提高雷法伤害，满级额外弹射。" },
  { skillId: "mage_arcane_missiles", levelRequirement: 10, maxRank: 5, prerequisites: ["mage_chain_lightning"], branch: "核心", upgradeText: "每级提高飞符数量和单体伤害。" },
  { skillId: "mage_shield", levelRequirement: 12, maxRank: 3, prerequisites: ["mage_frost_ring"], branch: "护体", upgradeText: "每级提高护盾量和持续时间。" },
  { skillId: "mage_meteor", levelRequirement: 16, maxRank: 5, prerequisites: ["mage_fireblast"], branch: "爆发", upgradeText: "每级提高星陨伤害，满级追加小型星陨。" },
  { skillId: "mage_mirror", levelRequirement: 20, maxRank: 3, prerequisites: ["mage_arcane_missiles"], branch: "召唤", upgradeText: "每级提高分神持续时间和复制效率。" },
];

export function getClassSkillTree(classId: ClassId) {
  const classSkillIds = new Set(getClassSkills(classId).map((skill) => skill.id));
  return skillTreeNodes.filter((node) => classSkillIds.has(node.skillId));
}

export function getSkillTreeNode(skillId: string) {
  return skillTreeNodes.find((node) => node.skillId === skillId);
}

export function defaultRulesFor(classId: ClassId): SkillCastRule[] {
  return getClassSkills(classId).map((skill) => {
    const skillId = skill.id;
    const isDefense = skill.type === "defense";
    const isSummon = skill.type === "summon";
    const isUltimate = skill.type === "ultimate";
    const isBasic = skill.type === "basic";
    return {
      skillId,
      enabled: true,
      mode: "auto",
      priority: isDefense ? 100 : isSummon ? 90 : isUltimate ? 85 : isBasic ? 10 : 60,
      minIntervalMs: skill.cooldownMs,
      conditionGroups: [
        {
          logic: "AND",
          conditions: isDefense
            ? [{ type: "hpBelow", operator: "<=", value: 70 }]
            : isSummon
              ? [{ type: "summonCountBelow", operator: "<", value: 1 }]
              : isUltimate
                ? [{ type: "bossExists" }]
                : isBasic
                  ? [{ type: "always" }]
                  : [{ type: "enemyCountNearby", operator: ">=", value: skill.tags.includes("aoe") ? 2 : 1, radius: skill.range }],
        },
      ],
    };
  });
}
