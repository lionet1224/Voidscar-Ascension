import type { ClassId, EquipmentSlot, ItemRarity } from "../types";

export const seasonPackMeta = {
  version: "Season Data Pack v1.0",
  seasonName: "第一道纪：劫火初燃",
  englishName: "Dao Era 1: Ember Tribulation",
  defaultLengthDays: 56,
  scalableLengthDays: [30, 60, 90],
  levelCap: 60,
  wudaoCap: 100,
  riftTierCap: 120,
} as const;

export const seasonScaling = {
  30: {
    exp: 1.6,
    emberRemnant: 1.5,
    legendaryDrop: 1.25,
    upgradeMaterials: 1.35,
    riftFirstClear: 1.5,
    wudaoExpRequirement: 0.7,
  },
  60: {
    exp: 1,
    emberRemnant: 1,
    legendaryDrop: 1,
    upgradeMaterials: 1,
    riftFirstClear: 1,
    wudaoExpRequirement: 1,
  },
  90: {
    exp: 0.85,
    emberRemnant: 0.9,
    legendaryDrop: 0.9,
    upgradeMaterials: 0.9,
    wudaoExpRequirement: 1.25,
    weeklyReward: 1.25,
  },
} as const;

export const realmMilestones = [
  { levelRange: [1, 10] as const, realm: "炼气", unlock: "基础技能、青岚竹海" },
  { levelRange: [11, 20] as const, realm: "筑基", unlock: "装备词缀、黑水古渡" },
  { levelRange: [21, 30] as const, realm: "金丹", unlock: "战诀高级条件、断剑荒冢" },
  { levelRange: [31, 40] as const, realm: "元婴", unlock: "归墟天阶、赤炼丹窟" },
  { levelRange: [41, 50] as const, realm: "化神", unlock: "天阶词缀、星陨玄宫" },
  { levelRange: [51, 60] as const, realm: "归墟", unlock: "道纪遗宝、赤霄遗址、天阶 60+" },
];

export const wudaoNodes = [
  { id: "wudao_life", name: "生命悟道", maxLevel: 20, effect: "生命上限 +1.5%/点" },
  { id: "wudao_fiend_break", name: "破煞悟道", maxLevel: 20, effect: "对精英和 Boss 伤害 +1.2%/点" },
  { id: "wudao_resist", name: "御法悟道", maxLevel: 20, effect: "全抗性 +1%/点" },
  { id: "wudao_resource", name: "灵源悟道", maxLevel: 20, effect: "资源回复 +1.5%/点" },
  { id: "wudao_idle", name: "神游悟道", maxLevel: 20, effect: "神游历练收益 +1%/点" },
];

export function levelExp(level: number) {
  return Math.floor(120 * Math.pow(level, 2.15));
}

export function paragonExp(wudaoLevel: number) {
  return Math.floor(9000 * Math.pow(wudaoLevel, 1.25));
}

export const currencies = [
  { id: "spirit_stone", name: "灵石", source: "所有玩法", use: "基础强化、重铸、购买基础材料" },
  { id: "ember_remnant", name: "劫火残烬", source: "道纪玩法、归墟天阶、神游历练", use: "升级道纪法印、兑换赛季材料" },
  { id: "black_iron", name: "玄铁", source: "分解凡器、灵器", use: "法器 +1 到 +4" },
  { id: "spirit_jade", name: "灵玉", source: "分解玄器、地阶法器", use: "法器 +5 到 +7" },
  { id: "star_sand", name: "星砂", source: "星陨玄宫、归墟天阶 30+", use: "高阶强化、重铸" },
  { id: "artifact_core", name: "器魂", source: "分解天阶法宝", use: "法宝强化、传奇效果铭刻" },
  { id: "voidscar_shard", name: "归墟残片", source: "归墟天阶 50+", use: "终局强化、重铸高阶词缀" },
  { id: "fireseed", name: "劫火种", source: "赤霄遗址、劫主 Boss", use: "道纪遗宝升级" },
  { id: "dao_seal_dust", name: "法印尘", source: "每周任务、心魔试炼", use: "重置道纪法印、解锁法印页" },
];

export const salvageYields: Record<ItemRarity, Record<string, [number, number]>> = {
  normal: { spirit_stone: [20, 50], black_iron: [1, 2] },
  magic: { spirit_stone: [40, 90], black_iron: [2, 4] },
  rare: { spirit_stone: [90, 180], spirit_jade: [1, 2] },
  epic: { spirit_stone: [180, 400], spirit_jade: [2, 5], star_sand: [0, 1] },
  legendary: { spirit_stone: [600, 1200], artifact_core: [1, 1], star_sand: [2, 5] },
  seasonalUnique: { artifact_core: [2, 2], fireseed: [1, 1] },
};

export const emberMechanic = {
  id: "ember_judgement",
  name: "劫火裁决",
  maxEmberValue: 100,
  gains: {
    trashKill: 2,
    specialKill: 3,
    eliteKill: 20,
    bossTenPercentHp: 8,
  },
  judgement: {
    radius: 420,
    damageMultiplier: 3.5,
    statusId: "ember_burn",
    statusDurationSeconds: 6,
    vulnerability: 0.08,
  },
  burnStatus: {
    id: "ember_burn",
    name: "劫火灼身",
    tickDamageMultiplier: 0.4,
    tickSeconds: 1,
    maxStacks: 3,
    vulnerability: 0.08,
  },
  heatCap: 10,
} as const;

export const emberHeatTiers = [
  { heat: 1, effect: "劫火裁决伤害 +10%" },
  { heat: 2, effect: "怪物伤害 +3%，奖励 +3%" },
  { heat: 3, effect: "劫火裁决范围 +10%" },
  { heat: 4, effect: "怪物生命 +4%，奖励 +4%" },
  { heat: 5, effect: "精英出现后额外携带 1 个小怪随从" },
  { heat: 6, effect: "6 层后每层怪物伤害 +2%，奖励 +2%" },
];

export const sigilLevelCosts = [60, 120, 220, 380, 600];

export const seasonSigils = [
  { id: "sigil_ember_burst", route: "ember", category: "damage", name: "劫火爆裂", maxLevel: 5, effect: "劫火裁决伤害每级 +12%" },
  { id: "sigil_soul_burn", route: "ember", category: "damage", name: "焚魂印", maxLevel: 5, effect: "精英和 Boss 受到劫火灼身时，额外受到每级 +2% 伤害" },
  { id: "sigil_chain_ember", route: "ember", category: "damage", name: "余焰连珠", maxLevel: 5, effect: "暴击有 4%/级 概率弹射劫火，最多命中 3 个敌人" },
  { id: "sigil_overheat", route: "ember", category: "damage", name: "火劫过载", maxLevel: 5, effect: "核心技能伤害 +5%/级，但资源消耗 +3%/级" },
  { id: "sigil_ember_execute", route: "ember", category: "damage", name: "焚灭诀", maxLevel: 5, effect: "对生命低于 30% 的敌人，劫火伤害 +8%/级" },
  { id: "sigil_boss_brand", route: "ember", category: "damage", name: "劫主烙印", maxLevel: 5, effect: "Boss 阶段劫火值获取 +6%/级" },
  { id: "sigil_burning_ground", route: "ember", category: "damage", name: "焚地余烬", maxLevel: 5, effect: "劫火裁决后留下 2 秒火域，每级火域伤害 +20%" },
  { id: "sigil_flame_crit", route: "ember", category: "damage", name: "火种会心", maxLevel: 5, effect: "劫火灼身目标受到暴击率 +1%/级" },
  { id: "sigil_ash_refund", route: "ember", category: "damage", name: "灰烬回流", maxLevel: 5, effect: "击杀劫火灼身敌人返还资源 1.5%/级" },
  { id: "sigil_ember_judgement", route: "ember", category: "damage", name: "核心：天火裁决", maxLevel: 1, core: true, effect: "劫火裁决满热度时额外召下一道天火，对 Boss 造成 500% 攻击强度伤害" },
  { id: "sigil_xuangang_guard", route: "xuangang", category: "defense", name: "玄罡护体", maxLevel: 5, effect: "生命低于 45% 时获得护盾，护盾值为最大生命 6%/级，30 秒冷却" },
  { id: "sigil_suppress_fiend", route: "xuangang", category: "defense", name: "镇煞法印", maxLevel: 5, effect: "精英和 Boss 对你造成的伤害 -2.5%/级" },
  { id: "sigil_warm_rebirth", route: "xuangang", category: "defense", name: "余温回生", maxLevel: 5, effect: "击杀劫火灼身敌人回复最大生命 0.8%/级" },
  { id: "sigil_still_mind", route: "xuangang", category: "defense", name: "静心守一", maxLevel: 5, effect: "站定 2 秒后获得减伤 1.5%/级，移动后持续 1 秒" },
  { id: "sigil_ward_reflect", route: "xuangang", category: "defense", name: "罡盾反震", maxLevel: 5, effect: "护盾吸收伤害时，对附近敌人造成吸收值 8%/级 的伤害" },
  { id: "sigil_resist_fire", route: "xuangang", category: "defense", name: "离火不侵", maxLevel: 5, effect: "火抗 +4%/级，受到持续伤害 -2%/级" },
  { id: "sigil_last_breath", route: "xuangang", category: "defense", name: "残命守印", maxLevel: 5, effect: "每场战斗第一次濒死时回复最大生命 5%/级" },
  { id: "sigil_summon_guard", route: "xuangang", category: "defense", name: "护灵结界", maxLevel: 5, effect: "召唤物受到伤害 -4%/级" },
  { id: "sigil_elite_break", route: "xuangang", category: "defense", name: "破煞护心", maxLevel: 5, effect: "精英出现后 8 秒内获得减伤 3%/级" },
  { id: "sigil_xuangang_domain", route: "xuangang", category: "defense", name: "核心：玄罡法域", maxLevel: 1, core: true, effect: "生命低于 50% 时展开 8 秒法域，玩家和召唤物减伤 20%，60 秒冷却" },
  { id: "sigil_domain_guide", route: "tianji", category: "utility", name: "洞天指引", maxLevel: 5, effect: "击杀怪物获得副本进度 +2%/级" },
  { id: "sigil_resource_return", route: "tianji", category: "utility", name: "灵元回流", maxLevel: 5, effect: "核心技能有 3%/级 概率返还 50% 资源" },
  { id: "sigil_wind_step", route: "tianji", category: "utility", name: "御风疾行", maxLevel: 5, effect: "击杀后移动速度 +4%/级，持续 2 秒" },
  { id: "sigil_spirit_expedition", route: "tianji", category: "utility", name: "神游收益", maxLevel: 5, effect: "神游历练收益 +3%/级" },
  { id: "sigil_loot_sense", route: "tianji", category: "utility", name: "灵宝感应", maxLevel: 5, effect: "高品质掉落权重 +1.5%/级" },
  { id: "sigil_fast_clear", route: "tianji", category: "utility", name: "速清推演", maxLevel: 5, effect: "非 Boss 阶段攻击速度和施法速度 +1.5%/级" },
  { id: "sigil_report_insight", route: "tianji", category: "utility", name: "道痕洞察", maxLevel: 5, effect: "道痕记录中给出更多修行提示；同时装备评分精度提高" },
  { id: "sigil_stable_route", route: "tianji", category: "utility", name: "稳定神游", maxLevel: 5, effect: "神游历练失败率 -2%/级" },
  { id: "sigil_ember_income", route: "tianji", category: "utility", name: "残烬采撷", maxLevel: 5, effect: "劫火残烬获取 +4%/级" },
  { id: "sigil_tianji_loop", route: "tianji", category: "utility", name: "核心：天机轮转", maxLevel: 1, core: true, effect: "每次触发劫火裁决，随机减少一个非基础技能 15% 剩余冷却" },
] as const;

export type MonsterFamilyId = "beast" | "ghost" | "demonic" | "construct" | "fiend";

export const monsterFamilyLabels: Record<MonsterFamilyId, string> = {
  beast: "妖兽",
  ghost: "阴魂",
  demonic: "魔修",
  construct: "器傀",
  fiend: "劫煞",
};

export const domains = [
  { id: "domain_qinglan_bamboo", name: "青岚竹海", recommendedLevel: [1, 10] as const, unlock: "初始", family: "beast", bossId: "boss_bamboo_king", bossName: "青竹妖王", basePower: 85, baseClearTime: 175, rewardTags: ["基础法器", "玄铁"] },
  { id: "domain_blackwater_ferry", name: "黑水古渡", recommendedLevel: [10, 20] as const, unlock: "通关青岚竹海", family: "ghost", bossId: "boss_drowned_ferryman", bossName: "溺魂渡主", basePower: 185, baseClearTime: 195, rewardTags: ["灵器", "灵玉"] },
  { id: "domain_broken_sword_barrow", name: "断剑荒冢", recommendedLevel: [20, 30] as const, unlock: "20 级", family: "ghost", bossId: "boss_sword_wraith", bossName: "断剑怨灵", basePower: 340, baseClearTime: 215, rewardTags: ["玄器", "职业词缀"] },
  { id: "domain_crimson_alchemy", name: "赤炼丹窟", recommendedLevel: [30, 40] as const, unlock: "30 级", family: "demonic", bossId: "boss_alchemy_fiend", bossName: "赤炼丹魔", basePower: 560, baseClearTime: 235, rewardTags: ["地阶法器", "劫火残烬"] },
  { id: "domain_starfall_palace", name: "星陨玄宫", recommendedLevel: [40, 50] as const, unlock: "40 级", family: "construct", bossId: "boss_starfall_lord", bossName: "星陨宫主", basePower: 900, baseClearTime: 255, rewardTags: ["星砂", "天阶法宝概率"] },
  { id: "domain_chixiao_ruins", name: "赤霄遗址", recommendedLevel: [50, 60] as const, unlock: "50 级 + 星陨玄宫通关", family: "fiend", bossId: "boss_chixiao_lord", bossName: "赤霄劫君", basePower: 1350, baseClearTime: 285, rewardTags: ["劫火种", "道纪遗宝概率"] },
];

export const materialDomains = [
  { id: "domain_artifact_tomb", name: "炼器冢", recommendedLevel: [25, 60] as const, unlock: "25 级", family: "construct", bossId: "boss_ancient_array", bossName: "古阵天傀", basePower: 430, baseClearTime: 230, rewardTags: ["玄铁", "灵玉", "器魂碎片"], rule: "怪物高护甲，强化材料权重提高" },
  { id: "domain_spirit_mine", name: "灵石矿脉", recommendedLevel: [15, 60] as const, unlock: "15 级", family: "beast", bossId: "boss_bamboo_king", bossName: "青竹妖王", basePower: 240, baseClearTime: 190, rewardTags: ["大量灵石"], rule: "怪物数量多，灵石收益显著提高" },
  { id: "domain_inner_demon", name: "心魔试炼", recommendedLevel: [35, 60] as const, unlock: "35 级", family: "fiend", bossId: "boss_formless_sword", bossName: "无相剑魂", basePower: 680, baseClearTime: 245, rewardTags: ["法印尘", "战诀演练"], rule: "Boss 映照应劫者弱点，适合磨炼战诀" },
];

export const allDomains = [...domains, ...materialDomains];

export const monsterTemplates = [
  { id: "mob_bamboo_imp", name: "竹妖小灵", family: "beast", type: "trash", baseHp: 65, baseDamage: 8, baseArmor: 2, moveSpeed: 78, attackRange: 26, progressValue: 1, mechanics: ["快速靠近", "数量多"] },
  { id: "mob_vine_lasher", name: "毒藤妖", family: "beast", type: "charger", baseHp: 120, baseDamage: 12, baseArmor: 4, moveSpeed: 82, attackRange: 30, progressValue: 2, mechanics: ["短距离突进", "附加中毒"] },
  { id: "mob_wind_fox", name: "赤狐妖", family: "beast", type: "ranged", baseHp: 90, baseDamage: 10, baseArmor: 3, moveSpeed: 86, attackRange: 205, progressValue: 2, mechanics: ["保持距离", "发射风刃"] },
  { id: "mob_wolf_fiend", name: "玄狼妖", family: "beast", type: "charger", baseHp: 150, baseDamage: 16, baseArmor: 5, moveSpeed: 92, attackRange: 30, progressValue: 3, mechanics: ["冲锋", "优先低血量目标"] },
  { id: "mob_bamboo_guard", name: "青竹卫", family: "beast", type: "shieldBearer", baseHp: 260, baseDamage: 18, baseArmor: 12, moveSpeed: 54, attackRange: 34, progressValue: 4, mechanics: ["给附近小怪护盾"] },
  { id: "mob_bamboo_shaman", name: "竹海妖巫", family: "beast", type: "healer", baseHp: 170, baseDamage: 10, baseArmor: 5, moveSpeed: 50, attackRange: 190, progressValue: 4, mechanics: ["治疗低血怪物"] },
  { id: "mob_water_ghost", name: "水鬼", family: "ghost", type: "trash", baseHp: 80, baseDamage: 9, baseArmor: 3, moveSpeed: 68, attackRange: 26, progressValue: 1, mechanics: ["死亡后留下减速水迹"] },
  { id: "mob_drowned_soul", name: "溺魂", family: "ghost", type: "trash", baseHp: 110, baseDamage: 11, baseArmor: 4, moveSpeed: 64, attackRange: 28, progressValue: 2, mechanics: ["攻击降低玩家治疗效果"] },
  { id: "mob_grave_wraith", name: "荒冢怨灵", family: "ghost", type: "ranged", baseHp: 130, baseDamage: 14, baseArmor: 5, moveSpeed: 52, attackRange: 210, progressValue: 3, mechanics: ["远程阴气弹", "附加减速"] },
  { id: "mob_sword_spirit", name: "剑魂", family: "ghost", type: "charger", baseHp: 160, baseDamage: 18, baseArmor: 8, moveSpeed: 88, attackRange: 32, progressValue: 3, mechanics: ["直线突进", "暴击率较高"] },
  { id: "mob_bone_puppet", name: "尸傀", family: "ghost", type: "shieldBearer", baseHp: 280, baseDamage: 20, baseArmor: 15, moveSpeed: 38, attackRange: 34, progressValue: 4, mechanics: ["高生命", "移动慢"] },
  { id: "mob_soul_binder", name: "缚魂师", family: "ghost", type: "summoner", baseHp: 200, baseDamage: 12, baseArmor: 6, moveSpeed: 48, attackRange: 190, progressValue: 5, mechanics: ["周期性召唤水鬼或怨灵"] },
  { id: "mob_blood_cultist", name: "血符魔修", family: "demonic", type: "ranged", baseHp: 140, baseDamage: 18, baseArmor: 6, moveSpeed: 52, attackRange: 210, progressValue: 3, mechanics: ["远程血符", "附加流血"] },
  { id: "mob_fire_alchemist", name: "火丹魔", family: "demonic", type: "bomber", baseHp: 120, baseDamage: 22, baseArmor: 4, moveSpeed: 76, attackRange: 28, progressValue: 3, mechanics: ["低血量冲向玩家自爆"] },
  { id: "mob_soul_eater", name: "噬魂术士", family: "demonic", type: "ranged", baseHp: 190, baseDamage: 20, baseArmor: 7, moveSpeed: 48, attackRange: 215, progressValue: 4, mechanics: ["攻击削减资源回复"] },
  { id: "mob_pill_puppet", name: "药傀", family: "demonic", type: "trash", baseHp: 220, baseDamage: 17, baseArmor: 10, moveSpeed: 54, attackRange: 30, progressValue: 3, mechanics: ["死亡时释放毒雾"] },
  { id: "mob_crimson_mage", name: "赤炼法师", family: "demonic", type: "summoner", baseHp: 240, baseDamage: 22, baseArmor: 8, moveSpeed: 46, attackRange: 205, progressValue: 5, mechanics: ["召唤火灵", "制造火域"] },
  { id: "mob_blood_banner", name: "血幡使", family: "demonic", type: "healer", baseHp: 260, baseDamage: 18, baseArmor: 9, moveSpeed: 44, attackRange: 190, progressValue: 5, mechanics: ["给魔修回血和增伤"] },
  { id: "mob_sword_puppet", name: "剑傀", family: "construct", type: "trash", baseHp: 210, baseDamage: 18, baseArmor: 12, moveSpeed: 52, attackRange: 32, progressValue: 3, mechanics: ["高护甲", "近战攻击"] },
  { id: "mob_array_golem", name: "阵傀", family: "construct", type: "shieldBearer", baseHp: 360, baseDamage: 22, baseArmor: 18, moveSpeed: 36, attackRange: 34, progressValue: 5, mechanics: ["周期性给自己和小怪护盾"] },
  { id: "mob_star_puppet", name: "星陨傀儡", family: "construct", type: "ranged", baseHp: 240, baseDamage: 25, baseArmor: 10, moveSpeed: 44, attackRange: 220, progressValue: 4, mechanics: ["远程星光弹"] },
  { id: "mob_thunder_core", name: "雷核傀", family: "construct", type: "bomber", baseHp: 180, baseDamage: 30, baseArmor: 8, moveSpeed: 62, attackRange: 30, progressValue: 4, mechanics: ["死亡后释放雷爆"] },
  { id: "mob_ancient_guard", name: "古阵守卫", family: "construct", type: "charger", baseHp: 420, baseDamage: 32, baseArmor: 20, moveSpeed: 58, attackRange: 34, progressValue: 6, mechanics: ["慢速冲锋", "击退"] },
  { id: "mob_mirror_construct", name: "镜阵傀", family: "construct", type: "summoner", baseHp: 300, baseDamage: 18, baseArmor: 12, moveSpeed: 44, attackRange: 195, progressValue: 5, mechanics: ["复制一个低血量幻影"] },
  { id: "mob_fire_fiend", name: "火煞", family: "fiend", type: "trash", baseHp: 190, baseDamage: 24, baseArmor: 8, moveSpeed: 68, attackRange: 30, progressValue: 3, mechanics: ["附加劫火灼身"] },
  { id: "mob_thunder_fiend", name: "雷煞", family: "fiend", type: "ranged", baseHp: 170, baseDamage: 26, baseArmor: 6, moveSpeed: 58, attackRange: 220, progressValue: 3, mechanics: ["远程雷链", "可弹射召唤物"] },
  { id: "mob_ice_fiend", name: "冰煞", family: "fiend", type: "ranged", baseHp: 220, baseDamage: 20, baseArmor: 9, moveSpeed: 46, attackRange: 205, progressValue: 4, mechanics: ["周期性减速或短暂冰冻"] },
  { id: "mob_blood_fiend", name: "血煞", family: "fiend", type: "charger", baseHp: 260, baseDamage: 28, baseArmor: 10, moveSpeed: 82, attackRange: 32, progressValue: 4, mechanics: ["造成伤害时回血"] },
  { id: "mob_void_fiend", name: "归墟煞", family: "fiend", type: "elite", baseHp: 420, baseDamage: 36, baseArmor: 16, moveSpeed: 60, attackRange: 36, progressValue: 6, mechanics: ["高层常见", "随机附带 1 个小机制"] },
  { id: "mob_ember_wraith", name: "劫火残影", family: "fiend", type: "ranged", baseHp: 300, baseDamage: 34, baseArmor: 11, moveSpeed: 56, attackRange: 215, progressValue: 5, mechanics: ["火焰投射", "死亡留下火域"] },
] as const;

export const familyTrashNames = Object.fromEntries(
  (Object.keys(monsterFamilyLabels) as MonsterFamilyId[]).map((family) => [
    family,
    monsterTemplates.filter((monster) => monster.family === family && monster.type !== "elite").map((monster) => monster.name),
  ]),
) as Record<MonsterFamilyId, string[]>;

export const monsterTypeWeights = [
  { type: "trash", weight: 45 },
  { type: "ranged", weight: 18 },
  { type: "charger", weight: 12 },
  { type: "shieldBearer", weight: 8 },
  { type: "healer", weight: 6 },
  { type: "summoner", weight: 6 },
  { type: "bomber", weight: 5 },
] as const;

export const eliteMarks = [
  { id: "mark_haste", name: "急行煞印", minTier: 5, effect: "移动速度 +25%，攻击速度 +20%" },
  { id: "mark_armor", name: "玄甲煞印", minTier: 5, effect: "获得最大生命 25% 护盾" },
  { id: "mark_fire_ring", name: "火环煞印", minTier: 10, effect: "每 8 秒释放火环" },
  { id: "mark_ice_prison", name: "冰牢煞印", minTier: 10, effect: "每 10 秒减速附近单位 40%，持续 3 秒" },
  { id: "mark_thunder_chain", name: "雷链煞印", minTier: 15, effect: "攻击弹射到召唤物或玩家" },
  { id: "mark_blood_sacrifice", name: "血祭煞印", minTier: 15, effect: "造成伤害 12% 转化为治疗" },
  { id: "mark_split_soul", name: "分魂煞印", minTier: 20, effect: "死亡后分裂 2 个分魂" },
  { id: "mark_summon_beast", name: "召妖煞印", minTier: 20, effect: "每 12 秒召唤 2 个小怪" },
  { id: "mark_shield_breaker", name: "破盾煞印", minTier: 25, effect: "对护盾目标伤害 +35%" },
  { id: "mark_poison", name: "腐毒煞印", minTier: 25, effect: "攻击附加中毒，持续 6 秒" },
  { id: "mark_guardian", name: "护卫煞印", minTier: 30, effect: "周围小怪获得 20% 减伤" },
  { id: "mark_resource_bind", name: "缚灵煞印", minTier: 30, effect: "命中后资源回复 -20%，持续 4 秒" },
  { id: "mark_mirror", name: "镜影煞印", minTier: 35, effect: "每 15 秒制造一个低血量镜像" },
  { id: "mark_bomber", name: "爆裂煞印", minTier: 35, effect: "每死亡一个随从，精英释放小爆炸" },
  { id: "mark_curse", name: "心魔煞印", minTier: 40, effect: "周期性降低玩家暴击率和命中" },
  { id: "mark_fortress", name: "固守煞印", minTier: 40, effect: "站定时减伤 30%，移动时消失" },
  { id: "mark_pursuit", name: "追魂煞印", minTier: 45, effect: "锁定玩家，忽略召唤物仇恨" },
  { id: "mark_healing_aura", name: "回生煞印", minTier: 45, effect: "附近怪物每秒回血 2%" },
  { id: "mark_void_zone", name: "归墟煞印", minTier: 50, effect: "周期性生成禁区，玩家站内持续掉血" },
  { id: "mark_silence", name: "禁法煞印", minTier: 55, effect: "每 14 秒沉默高优先级技能 2 秒" },
  { id: "mark_enrage", name: "狂煞印", minTier: 60, effect: "生命低于 40% 后伤害 +40%" },
  { id: "mark_anti_summon", name: "猎灵煞印", minTier: 60, effect: "对召唤物伤害 +60%" },
  { id: "mark_elite_guard", name: "煞卫印", minTier: 70, effect: "出现时携带两个护卫，护卫存活时精英减伤" },
  { id: "mark_threefold", name: "三相煞印", minTier: 80, effect: "每 20 秒在火、冰、雷机制中切换" },
] as const;

export const riftTierBands = [
  { range: [1, 10] as const, name: "浅层归墟", recommendedPower: [1000, 3000] as const, rule: "基础怪物，无天阶词缀" },
  { range: [11, 30] as const, name: "中层归墟", recommendedPower: [3000, 12000] as const, rule: "精英 1-2 个煞印" },
  { range: [31, 60] as const, name: "深层归墟", recommendedPower: [12000, 45000] as const, rule: "天阶词缀 1-2 个，Boss 二阶段" },
  { range: [61, 90] as const, name: "禁忌归墟", recommendedPower: [45000, 120000] as const, rule: "精英 3 个煞印，Boss 专属机制增强" },
  { range: [91, 120] as const, name: "无尽归墟", recommendedPower: [120000, 300000] as const, rule: "天阶词缀 3 个，奖励显著提高" },
  { range: [121, 999] as const, name: "无底归墟", recommendedPower: [300000, 999999] as const, rule: "无限扩展，仅用于冲榜/自我挑战" },
];

export const riftModifiers = [
  { id: "mod_burning_sky", name: "劫火焚天", minTier: 15, rewardMultiplier: 1.08, effect: "场上周期性落下火焰，造成持续伤害" },
  { id: "mod_cold_void", name: "玄阴冷雾", minTier: 15, rewardMultiplier: 1.07, effect: "玩家移动速度 -12%，怪物冰霜伤害 +15%" },
  { id: "mod_thunder_pulse", name: "天雷脉冲", minTier: 20, rewardMultiplier: 1.09, effect: "每 8 秒出现雷电脉冲，伤害玩家和召唤物" },
  { id: "mod_poison_miasma", name: "毒瘴弥天", minTier: 20, rewardMultiplier: 1.08, effect: "怪物死亡后留下毒雾 3 秒" },
  { id: "mod_elite_pack", name: "煞将增援", minTier: 25, rewardMultiplier: 1.1, effect: "精英刷新时额外生成随从" },
  { id: "mod_fast_fiends", name: "急行妖潮", minTier: 25, rewardMultiplier: 1.1, effect: "怪物刷新速度 +15%，移动速度 +10%" },
  { id: "mod_ranged_pressure", name: "远煞压制", minTier: 30, rewardMultiplier: 1.09, effect: "远程怪权重 +40%" },
  { id: "mod_summoner_tide", name: "召妖泛滥", minTier: 35, rewardMultiplier: 1.1, effect: "召唤型怪物权重 +35%" },
  { id: "mod_resource_drain", name: "缚灵归墟", minTier: 35, rewardMultiplier: 1.12, effect: "玩家资源回复 -15%" },
  { id: "mod_thick_armor", name: "玄甲妖群", minTier: 40, rewardMultiplier: 1.1, effect: "怪物护甲 +25%" },
  { id: "mod_glass_path", name: "破命天阶", minTier: 40, rewardMultiplier: 1.15, effect: "玩家伤害 +18%，受到伤害 +18%" },
  { id: "mod_rich_vein", name: "灵脉显化", minTier: 45, rewardMultiplier: 1.18, effect: "掉落 +15%，怪物生命 +20%" },
  { id: "mod_boss_fury", name: "劫主狂怒", minTier: 50, rewardMultiplier: 1.14, effect: "Boss 生命低于 35% 后伤害 +30%" },
  { id: "mod_echo_split", name: "分魂回响", minTier: 50, rewardMultiplier: 1.12, effect: "精英死亡后生成 2 个分魂" },
  { id: "mod_no_healing_zone", name: "枯灵禁域", minTier: 55, rewardMultiplier: 1.15, effect: "玩家治疗效果 -20%" },
  { id: "mod_summon_hunter", name: "猎灵煞影", minTier: 55, rewardMultiplier: 1.1, effect: "怪物优先攻击召唤物" },
  { id: "mod_cooldown_lock", name: "乱法天痕", minTier: 60, rewardMultiplier: 1.15, effect: "技能冷却恢复速度 -10%" },
  { id: "mod_overflow_ember", name: "劫火过盛", minTier: 60, rewardMultiplier: 1.18, effect: "劫火热度奖励提高，但每层热度怪物伤害额外 +1%" },
  { id: "mod_shadow_blind", name: "暗幕遮天", minTier: 65, rewardMultiplier: 1.12, effect: "玩家命中率和暴击率 -5%" },
  { id: "mod_double_elite", name: "双煞临门", minTier: 70, rewardMultiplier: 1.2, effect: "75% 节点出现 2 个精英" },
  { id: "mod_boss_guardian", name: "劫主护卫", minTier: 75, rewardMultiplier: 1.18, effect: "Boss 出现时携带护卫，护卫存活时 Boss 减伤" },
  { id: "mod_low_lantern", name: "命灯微弱", minTier: 80, rewardMultiplier: 1.16, effect: "玩家最大生命 -12%" },
  { id: "mod_voidscar_wound", name: "归墟伤痕", minTier: 90, rewardMultiplier: 1.22, effect: "战斗越久怪物伤害越高，每分钟 +5%" },
  { id: "mod_three_trials", name: "三劫同临", minTier: 100, rewardMultiplier: 1.35, effect: "随机复制另外 2 个词缀，但奖励大幅提高" },
] as const;

export const riftBossPool = [
  { id: "boss_bamboo_king", name: "青竹妖王", family: "beast", role: "召唤压制", mechanics: ["高层召唤竹海妖巫", "藤蔓束缚", "青竹卫"] },
  { id: "boss_drowned_ferryman", name: "溺魂渡主", family: "ghost", role: "持续削弱", mechanics: ["黑水区域更多", "降低治疗", "召唤水鬼"] },
  { id: "boss_sword_wraith", name: "断剑怨灵", family: "ghost", role: "单体爆发", mechanics: ["高层断剑斩可连发", "剑魂随从", "高暴击"] },
  { id: "boss_alchemy_fiend", name: "赤炼丹魔", family: "demonic", role: "火焰持续", mechanics: ["药傀爆炸更频繁", "火域", "自爆怪"] },
  { id: "boss_starfall_lord", name: "星陨宫主", family: "construct", role: "护盾雷法", mechanics: ["星辉护盾更厚", "雷链", "星陨术"] },
  { id: "boss_voidfire_fiend", name: "归墟火煞", family: "fiend", role: "赛季伤害", mechanics: ["劫火热度越高越强", "火域", "劫火灼身"] },
  { id: "boss_xuanyin_lord", name: "玄阴劫主", family: "fiend", role: "控制", mechanics: ["大范围冰封和减速"] },
  { id: "boss_thunder_remnant", name: "天雷残灵", family: "fiend", role: "远程弹射", mechanics: ["雷链针对召唤物"] },
  { id: "boss_blood_talisman", name: "血符魔尊", family: "demonic", role: "吸血持续", mechanics: ["给玩家叠流血", "自身回血"] },
  { id: "boss_formless_sword", name: "无相剑魂", family: "ghost", role: "机动爆发", mechanics: ["会模仿玩家技能标签"] },
  { id: "boss_ancient_array", name: "古阵天傀", family: "construct", role: "护盾机制", mechanics: ["护盾阶段需要击杀阵眼"] },
  { id: "boss_chixiao_ancestor", name: "赤霄旧祖", family: "fiend", role: "赛季终极", mechanics: ["三阶段", "劫火", "召唤", "斩杀机制"] },
] as const;

export const finalBoss = {
  id: "boss_chixiao_ancestor",
  name: "赤霄旧祖",
  unlock: "归墟天阶 100 层首通，赤霄遗址通关 10 次",
  phases: [
    { name: "赤霄剑火", hpBelow: 100, mechanics: ["远程劫火斩", "召唤赤霄剑影", "考验稳定清怪能力"] },
    { name: "焚宗旧梦", hpBelow: 66, mechanics: ["场上出现 3 个残阵", "残阵存在时 Boss 获得减伤", "机制目标优先更容易通过"] },
    { name: "天劫归墟", hpBelow: 33, mechanics: ["每 15 秒触发一次小型劫火裁决", "玩家劫火裁决会短暂削弱 Boss", "考验战诀配置、防御触发和爆发保留"] },
  ],
  drops: ["赤霄劫火佩", "焚天命盘碎片", "赤霄旧祖称号", "高概率道纪遗宝"],
};

export const riftFirstClearRewards = [
  { tier: 10, rewards: "劫火残烬 300，灵玉 20" },
  { tier: 20, rewards: "随机地阶法器 1 件，劫火残烬 500" },
  { tier: 30, rewards: "天阶法宝保底 1 件，法印尘 5" },
  { tier: 40, rewards: "星砂 40，劫火残烬 800" },
  { tier: 50, rewards: "器魂 3，归墟残片 10" },
  { tier: 60, rewards: "道纪遗宝保底 1 件" },
  { tier: 70, rewards: "天阶法宝 2 件，归墟残片 20" },
  { tier: 80, rewards: "法印尘 15，劫火种 2" },
  { tier: 90, rewards: "道纪遗宝 1 件，器魂 5" },
  { tier: 100, rewards: "称号「归墟问道」，限定外观文本，天阶法宝 3 件" },
  { tier: 110, rewards: "劫火种 5，道纪遗宝概率箱 1" },
  { tier: 120, rewards: "称号「镇墟者」，赛季终极箱 1" },
];

export const dropTables = [
  { id: "normal_domain", name: "普通秘境", minTier: 0, maxTier: 0, weights: { normal: 42, magic: 31, rare: 19, epic: 6.5, legendary: 1.2, seasonalUnique: 0.3 } },
  { id: "rift_1_30", name: "归墟天阶 1-30", minTier: 1, maxTier: 30, weights: { normal: 18, magic: 30, rare: 34, epic: 15, legendary: 2.5, seasonalUnique: 0.5 } },
  { id: "rift_31_60", name: "归墟天阶 31-60", minTier: 31, maxTier: 60, weights: { normal: 6, magic: 22, rare: 38, epic: 27, legendary: 6, seasonalUnique: 1 } },
  { id: "rift_61_90", name: "归墟天阶 61-90", minTier: 61, maxTier: 90, weights: { normal: 0, magic: 12, rare: 35, epic: 39, legendary: 12, seasonalUnique: 2 } },
  { id: "rift_91_120", name: "归墟天阶 91-120", minTier: 91, maxTier: 120, weights: { normal: 0, magic: 5, rare: 28, epic: 47, legendary: 17, seasonalUnique: 3 } },
] as const;

export const itemPowerBands = [
  { source: "1-10 级秘境", min: 1, max: 120 },
  { source: "11-20 级秘境", min: 100, max: 240 },
  { source: "21-30 级秘境", min: 220, max: 380 },
  { source: "31-40 级秘境", min: 360, max: 520 },
  { source: "41-50 级秘境", min: 500, max: 680 },
  { source: "51-60 级秘境", min: 650, max: 800 },
  { source: "归墟天阶 1-30", min: 650, max: 850 },
  { source: "归墟天阶 31-60", min: 800, max: 950 },
  { source: "归墟天阶 61-90", min: 900, max: 1050 },
  { source: "归墟天阶 91-120", min: 1000, max: 1150 },
] as const;

export const baseItemNames: Record<EquipmentSlot, string[]> = {
  weapon: ["铁剑", "青锋", "玄铁剑", "重剑", "飞剑", "斩煞剑", "镇岳剑", "归墟剑", "短弓", "灵弓", "符弓", "影弦弓", "穿云弓", "玄狼弓", "猎煞弓", "归墟弓", "木符", "法印", "灵杖", "星盘", "雷符", "火符", "玄冰印", "归墟法印"],
  offhand: ["剑鞘", "符印", "法镜", "灵囊", "阵盘", "玉简", "命灯", "灵珠"],
  helmet: ["道冠", "青纱冠", "玄纹冠", "五行道冠"],
  chest: ["布衣", "法袍", "玄甲", "护心镜"],
  gloves: ["护腕", "符箓腕", "凝灵护手"],
  pants: ["下裳", "玄纹袴", "灵丝下装"],
  boots: ["云履", "踏风履", "镇岳靴"],
  amulet: ["玉佩", "命符", "魂珠", "护符", "火玉", "星坠", "归墟印"],
  ring1: ["灵戒", "赤霄戒", "命戒"],
  ring2: ["灵戒", "赤霄戒", "命戒"],
};

export const affixDefinitions = [
  { id: "pre_posha", pool: "prefix", name: "破煞", slots: ["weapon", "amulet", "ring1", "ring2"], effect: "对劫煞伤害 +8-18%", stat: "eliteDamageBonus", value: 0.12, tags: ["fiend"] },
  { id: "pre_fengrui", pool: "prefix", name: "锋锐", slots: ["weapon"], effect: "物理伤害 +8-18%", stat: "meleeDamageBonus", value: 0.12, tags: ["physical"] },
  { id: "pre_lingyan", pool: "prefix", name: "灵焰", slots: ["weapon", "offhand"], effect: "火焰伤害 +8-18%", stat: "damageBonus", value: 0.11, tags: ["fire"] },
  { id: "pre_xuanlei", pool: "prefix", name: "玄雷", slots: ["weapon", "offhand"], effect: "雷法伤害 +8-18%", stat: "aoeDamageBonus", value: 0.11, tags: ["lightning"] },
  { id: "pre_shuanghua", pool: "prefix", name: "霜华", slots: ["weapon", "offhand"], effect: "冰霜伤害 +8-18%", stat: "damageBonus", value: 0.1, tags: ["ice", "control"] },
  { id: "pre_duyan", pool: "prefix", name: "毒魇", slots: ["weapon", "amulet", "ring1", "ring2"], effect: "毒伤 +8-18%", stat: "dotDamageBonus", value: 0.12, tags: ["poison"] },
  { id: "pre_juling", pool: "prefix", name: "聚灵", slots: ["offhand", "amulet", "ring1", "ring2"], effect: "资源回复 +6-14%", stat: "resourceRegen", value: 2.2, tags: ["resource"] },
  { id: "pre_yufeng", pool: "prefix", name: "御风", slots: ["boots", "amulet", "ring1", "ring2"], effect: "移动速度 +5-12%", stat: "moveSpeed", value: 0.08, tags: ["speed"] },
  { id: "pre_liehun", pool: "prefix", name: "裂魂", slots: ["weapon"], effect: "暴击伤害 +10-25%", stat: "critDamage", value: 0.18, tags: ["crit"] },
  { id: "pre_huixin", pool: "prefix", name: "会心", slots: ["weapon", "ring1", "ring2"], effect: "暴击率 +3-8%", stat: "critChance", value: 0.05, tags: ["crit"] },
  { id: "pre_zhenhun", pool: "prefix", name: "镇魂", slots: ["weapon", "amulet", "ring1", "ring2"], effect: "对被控制敌人伤害 +10-22%", stat: "damageBonus", value: 0.11, tags: ["control"] },
  { id: "pre_hunt_elite", pool: "prefix", name: "猎煞", slots: ["weapon", "ring1", "ring2"], effect: "对精英伤害 +8-20%", stat: "eliteDamageBonus", value: 0.13, tags: ["elite"] },
  { id: "pre_pojing", pool: "prefix", name: "破境", slots: ["weapon", "amulet"], effect: "对 Boss 伤害 +8-20%", stat: "bossDamageBonus", value: 0.13, tags: ["boss"] },
  { id: "pre_dongxuan", pool: "prefix", name: "洞玄", slots: ["amulet", "ring1", "ring2"], effect: "副本进度获取 +3-8%", stat: "damageBonus", value: 0.05, tags: ["progress"] },
  { id: "pre_shenyou", pool: "prefix", name: "神游", slots: ["amulet", "ring1", "ring2"], effect: "神游历练收益 +3-10%", stat: "resourceRegen", value: 1.5, tags: ["idle"] },
  { id: "pre_huixiang", pool: "prefix", name: "回响", slots: ["weapon", "offhand"], effect: "技能有 2-6% 概率重复低伤害版本", stat: "damageBonus", value: 0.06, tags: ["trigger"] },
  { id: "pre_yuhuo", pool: "prefix", name: "劫火", slots: ["weapon", "amulet", "ring1", "ring2"], effect: "劫火裁决伤害 +10-25%", stat: "damageBonus", value: 0.14, tags: ["season", "ember"] },
  { id: "pre_guixu", pool: "prefix", name: "归墟", slots: ["weapon", "offhand", "helmet", "chest", "gloves", "pants", "boots", "amulet", "ring1", "ring2"], effect: "归墟天阶内伤害 +5-14%", stat: "damageBonus", value: 0.09, tags: ["rift"] },
  { id: "pre_summon", pool: "prefix", name: "御灵", slots: ["offhand", "amulet"], effect: "召唤物伤害 +8-20%", stat: "summonDamageBonus", value: 0.14, tags: ["summon"] },
  { id: "pre_fastcast", pool: "prefix", name: "疾咒", slots: ["weapon", "offhand"], effect: "施法速度 +5-12%", stat: "castSpeed", value: 0.08, tags: ["speed"] },
  { id: "pre_fastattack", pool: "prefix", name: "迅击", slots: ["weapon", "gloves"], effect: "攻击速度 +5-12%", stat: "attackSpeed", value: 0.08, tags: ["speed"] },
  { id: "pre_healing", pool: "prefix", name: "回春", slots: ["helmet", "chest", "amulet", "ring1", "ring2"], effect: "治疗效果 +6-15%", stat: "healingBonus", value: 0.1, tags: ["heal"] },
  { id: "pre_shield", pool: "prefix", name: "灵幕", slots: ["chest", "offhand", "amulet"], effect: "护盾效果 +8-18%", stat: "shieldBonus", value: 0.13, tags: ["shield"] },
  { id: "pre_resist_all", pool: "prefix", name: "五行", slots: ["helmet", "chest", "gloves", "pants", "boots", "amulet", "ring1", "ring2"], effect: "全抗性 +4-10%", stat: "fireResist", value: 0.06, tags: ["resist"] },
  { id: "pre_max_hp", pool: "prefix", name: "护命", slots: ["helmet", "chest", "gloves", "pants", "boots"], effect: "生命上限 +6-16%", stat: "maxHp", value: 42, tags: ["defense"] },
  { id: "pre_armor", pool: "prefix", name: "玄甲", slots: ["helmet", "chest", "gloves", "pants", "boots"], effect: "护甲 +8-20%", stat: "armor", value: 18, tags: ["defense"] },
  { id: "pre_cdr", pool: "prefix", name: "归息", slots: ["offhand", "ring1", "ring2"], effect: "冷却缩减 +4-10%", stat: "cooldownReduction", value: 0.06, tags: ["skill"] },
  { id: "pre_dot", pool: "prefix", name: "蚀骨", slots: ["weapon", "amulet", "ring1", "ring2"], effect: "持续伤害 +8-20%", stat: "dotDamageBonus", value: 0.14, tags: ["dot"] },
  { id: "pre_aoe", pool: "prefix", name: "广法", slots: ["weapon", "offhand"], effect: "范围伤害 +8-18%", stat: "aoeDamageBonus", value: 0.12, tags: ["aoe"] },
  { id: "pre_single", pool: "prefix", name: "凝杀", slots: ["weapon", "ring1", "ring2"], effect: "单体伤害 +8-18%", stat: "bossDamageBonus", value: 0.11, tags: ["singleTarget"] },
  { id: "suf_huming", pool: "suffix", name: "之护命", slots: ["helmet", "chest", "gloves", "pants", "boots", "amulet", "ring1", "ring2"], effect: "生命 +6-16%", stat: "maxHp", value: 42, tags: ["defense"] },
  { id: "suf_xuanjia", pool: "suffix", name: "之玄甲", slots: ["helmet", "chest", "gloves", "pants", "boots"], effect: "护甲 +8-20%", stat: "armor", value: 18, tags: ["defense"] },
  { id: "suf_huiyuan", pool: "suffix", name: "之回元", slots: ["amulet", "ring1", "ring2", "offhand"], effect: "资源回复 +6-14%", stat: "resourceRegen", value: 2, tags: ["resource"] },
  { id: "suf_jifeng", pool: "suffix", name: "之疾风", slots: ["boots", "ring1", "ring2"], effect: "移动速度 +5-12%", stat: "moveSpeed", value: 0.08, tags: ["speed"] },
  { id: "suf_pojing", pool: "suffix", name: "之破境", slots: ["weapon", "amulet"], effect: "Boss 伤害 +8-20%", stat: "bossDamageBonus", value: 0.13, tags: ["boss"] },
  { id: "suf_zhenhun", pool: "suffix", name: "之镇魂", slots: ["weapon", "ring1", "ring2"], effect: "控制目标伤害 +10-22%", stat: "damageBonus", value: 0.11, tags: ["control"] },
  { id: "suf_juling", pool: "suffix", name: "之聚灵", slots: ["amulet", "ring1", "ring2"], effect: "最大资源 +8-20%", stat: "resourceMax", value: 18, tags: ["resource"] },
  { id: "suf_guiyi", pool: "suffix", name: "之归一", slots: ["weapon", "offhand", "helmet", "chest", "gloves", "pants", "boots", "amulet", "ring1", "ring2"], effect: "全伤害 +4-10%", stat: "damageBonus", value: 0.07, tags: ["damage"] },
  { id: "suf_huixiang", pool: "suffix", name: "之回响", slots: ["weapon", "offhand"], effect: "技能重复概率 +2-6%", stat: "damageBonus", value: 0.06, tags: ["trigger"] },
  { id: "suf_liesha", pool: "suffix", name: "之猎煞", slots: ["weapon", "ring1", "ring2"], effect: "击杀精英后 8 秒伤害 +8-18%", stat: "eliteDamageBonus", value: 0.12, tags: ["elite"] },
  { id: "suf_dongxuan", pool: "suffix", name: "之洞玄", slots: ["amulet", "ring1", "ring2"], effect: "副本进度获取 +3-8%", stat: "damageBonus", value: 0.05, tags: ["progress"] },
  { id: "suf_shenyou", pool: "suffix", name: "之神游", slots: ["amulet", "ring1", "ring2"], effect: "神游收益 +3-10%", stat: "resourceRegen", value: 1.4, tags: ["idle"] },
  { id: "suf_shouyu", pool: "suffix", name: "之守御", slots: ["offhand", "amulet"], effect: "召唤物生命 +10-25%", stat: "summonDamageBonus", value: 0.1, tags: ["summon"] },
  { id: "suf_qingying", pool: "suffix", name: "之轻影", slots: ["boots", "chest"], effect: "受到远程伤害 -5-12%", stat: "armor", value: 10, tags: ["defense"] },
  { id: "suf_jingxin", pool: "suffix", name: "之静心", slots: ["helmet", "amulet"], effect: "站定减伤 +4-10%", stat: "armor", value: 12, tags: ["defense"] },
  { id: "suf_yaoguang", pool: "suffix", name: "之曜光", slots: ["amulet", "ring1", "ring2"], effect: "抗性 +4-10%", stat: "fireResist", value: 0.06, tags: ["resist"] },
  { id: "suf_lingquan", pool: "suffix", name: "之灵泉", slots: ["ring1", "ring2"], effect: "每秒回复生命 +20-80", stat: "hpRegen", value: 3, tags: ["heal"] },
  { id: "suf_xueran", pool: "suffix", name: "之血燃", slots: ["weapon"], effect: "低生命时伤害 +8-18%", stat: "damageBonus", value: 0.12, tags: ["lowHp"] },
  { id: "suf_chongzhen", pool: "suffix", name: "之重振", slots: ["chest", "amulet"], effect: "濒死回复效果 +8-20%", stat: "healingBonus", value: 0.14, tags: ["heal"] },
  { id: "suf_poison_res", pool: "suffix", name: "之避毒", slots: ["helmet", "chest", "gloves", "pants", "boots"], effect: "毒抗 +8-20%", stat: "poisonResist", value: 0.12, tags: ["resist"] },
  { id: "suf_fire_res", pool: "suffix", name: "之避火", slots: ["helmet", "chest", "gloves", "pants", "boots"], effect: "火抗 +8-20%", stat: "fireResist", value: 0.12, tags: ["resist"] },
  { id: "suf_ice_res", pool: "suffix", name: "之避寒", slots: ["helmet", "chest", "gloves", "pants", "boots"], effect: "冰抗 +8-20%", stat: "iceResist", value: 0.12, tags: ["resist"] },
  { id: "suf_light_res", pool: "suffix", name: "之避雷", slots: ["helmet", "chest", "gloves", "pants", "boots"], effect: "雷抗 +8-20%", stat: "lightningResist", value: 0.12, tags: ["resist"] },
  { id: "suf_shadow_res", pool: "suffix", name: "之净魂", slots: ["helmet", "chest", "gloves", "pants", "boots"], effect: "阴影抗性 +8-20%", stat: "shadowResist", value: 0.12, tags: ["resist"] },
  { id: "suf_gold", pool: "suffix", name: "之纳财", slots: ["amulet", "ring1", "ring2"], effect: "灵石获取 +5-15%", stat: "resourceRegen", value: 1, tags: ["loot"] },
  { id: "suf_material", pool: "suffix", name: "之采撷", slots: ["amulet", "ring1", "ring2"], effect: "材料获取 +4-12%", stat: "resourceRegen", value: 1, tags: ["loot"] },
  { id: "suf_pet", pool: "suffix", name: "之灵契", slots: ["amulet", "ring1", "ring2"], effect: "召唤物持续时间 +10-30%，玄狼灵契上限 +1", stat: "summonDamageBonus", value: 0.12, tags: ["summon"] },
  { id: "suf_trap", pool: "suffix", name: "之伏阵", slots: ["gloves", "ring1", "ring2"], effect: "陷阱持续时间 +10-25%", stat: "dotDamageBonus", value: 0.1, tags: ["trap"] },
  { id: "suf_barrier", pool: "suffix", name: "之结界", slots: ["chest", "offhand"], effect: "护盾持续时间 +10-25%", stat: "shieldBonus", value: 0.13, tags: ["shield"] },
  { id: "suf_execute", pool: "suffix", name: "之斩灭", slots: ["weapon"], effect: "对低生命目标伤害 +8-20%", stat: "bossDamageBonus", value: 0.12, tags: ["execute"] },
] as const;

const classAffixRows: Record<ClassId, [string, string, string, string, keyof import("../types").CharacterStats, number][]> = {
  warrior: [
    ["sword_intent_gain", "剑意涌动", "剑意获取 +8-20%", "warrior", "resourceRegen", 2.4],
    ["sword_array_damage", "旋罡增幅", "旋罡剑阵伤害 +10-25%", "warrior_whirlwind", "meleeDamageBonus", 0.16],
    ["sword_array_cost", "旋罡节流", "旋罡剑阵剑意消耗 -5-15%", "warrior_whirlwind", "resourceRegen", 1.8],
    ["sword_split_mountain", "裂岳余威", "裂岳斩伤害 +10-25%", "warrior_ground_slam", "aoeDamageBonus", 0.16],
    ["sword_banner_duration", "剑旗长明", "镇岳剑旗持续时间 +10-25%", "warrior_banner", "summonDamageBonus", 0.12],
    ["sword_banner_damage", "剑旗镇煞", "镇岳剑旗伤害 +10-25%", "warrior_banner", "summonDamageBonus", 0.16],
    ["sword_soulcleaver", "斩魄破境", "斩魄诀对 Boss 伤害 +12-28%", "warrior_execute", "bossDamageBonus", 0.18],
    ["sword_charge_reset", "御剑回身", "御剑突进命中精英后冷却 -10-25%", "warrior_charge", "cooldownReduction", 0.06],
    ["sword_cry_shield", "凝罡护体", "长啸凝罡护盾 +10-25%", "warrior_shout", "shieldBonus", 0.16],
    ["sword_melee_reduce", "近身不破", "受到近战伤害 -5-15%", "warrior", "armor", 18],
    ["sword_bleed", "剑痕流血", "近战技能附加流血 4-10%", "warrior", "dotDamageBonus", 0.1],
    ["sword_elite_fury", "见煞生威", "精英出现后剑意回复 +10-25%", "warrior", "eliteDamageBonus", 0.12],
    ["sword_execute_refund", "斩魄回气", "斩魄诀击杀返还剑意 10-30", "warrior_execute", "resourceRegen", 2],
    ["sword_stand_ground", "镇岳不移", "站定时近战伤害 +5-15%", "warrior", "meleeDamageBonus", 0.1],
    ["sword_all_skills", "剑修全法", "剑修技能伤害 +4-10%", "warrior", "damageBonus", 0.07],
  ],
  ranger: [
    ["archer_focus_gain", "灵息回流", "灵息获取 +8-20%", "ranger", "resourceRegen", 2.4],
    ["archer_cloudpiercer", "穿云增幅", "穿云灵矢伤害 +10-25%", "ranger_piercing_arrow", "rangedDamageBonus", 0.16],
    ["archer_cloudpiercer_pierce", "灵矢贯穿", "穿云灵矢额外贯穿 +1", "ranger_piercing_arrow", "rangedDamageBonus", 0.12],
    ["archer_trap_damage", "毒藤增幅", "毒藤符阵伤害 +10-25%", "ranger_poison_trap", "dotDamageBonus", 0.16],
    ["archer_trap_radius", "伏阵扩张", "陷阱范围 +10-25%", "ranger_poison_trap", "aoeDamageBonus", 0.12],
    ["archer_wolf_damage", "玄狼利爪", "玄狼灵契伤害 +10-25%", "ranger_wolf", "summonDamageBonus", 0.16],
    ["archer_wolf_count", "双狼契", "玄狼数量 +1，召唤物伤害 -15%", "ranger_wolf", "summonDamageBonus", 0.14],
    ["archer_arrow_rain", "万羽增幅", "万羽落伤害 +10-25%", "ranger_arrow_rain", "aoeDamageBonus", 0.16],
    ["archer_mark_damage", "猎煞标记", "标记目标受到灵弓伤害 +8-20%", "ranger_mark", "rangedDamageBonus", 0.13],
    ["archer_shadowstep", "踏影护身", "踏影步后 3 秒减伤 +8-20%", "ranger_step", "armor", 14],
    ["archer_crit_focus", "会心聚息", "暴击回复灵息 2-6", "ranger", "critChance", 0.04],
    ["archer_ranged_speed", "影弦疾射", "远程攻速 +5-12%", "ranger", "attackSpeed", 0.08],
    ["archer_poison_dot", "毒藤蚀骨", "毒伤 +8-20%", "ranger_poison_trap", "dotDamageBonus", 0.14],
    ["archer_boss_mark", "劫主猎痕", "Boss 被标记时受到伤害 +5-15%", "ranger_mark", "bossDamageBonus", 0.1],
    ["archer_all_skills", "灵弓全法", "灵弓技能伤害 +4-10%", "ranger", "damageBonus", 0.07],
  ],
  mage: [
    ["mage_mana_regen", "灵力泉涌", "灵力回复 +8-20%", "mage", "resourceRegen", 2.4],
    ["mage_starfire", "星火增幅", "星火符伤害 +10-25%", "mage_starfire", "damageBonus", 0.12],
    ["mage_flame_burst", "劫焰增幅", "劫焰爆伤害 +10-25%", "mage_fireblast", "aoeDamageBonus", 0.16],
    ["mage_flame_dot", "焚魂余焰", "燃烧伤害 +8-20%", "mage_fireblast", "dotDamageBonus", 0.14],
    ["mage_frostseal", "霜封扩域", "霜封阵范围 +10-25%", "mage_frost_nova", "aoeDamageBonus", 0.12],
    ["mage_frost_damage", "冰裂增幅", "对冻结目标伤害 +8-20%", "mage_frost_nova", "damageBonus", 0.1],
    ["mage_thunderlink", "引雷增幅", "引雷诀伤害 +10-25%", "mage_chain_lightning", "aoeDamageBonus", 0.16],
    ["mage_thunder_bounce", "雷引连弹", "引雷诀额外弹射 +1", "mage_chain_lightning", "aoeDamageBonus", 0.12],
    ["mage_astral_missiles", "星辉飞符增幅", "星辉飞符伤害 +10-25%", "mage_missiles", "damageBonus", 0.12],
    ["mage_ward_shield", "护体灵幕增幅", "护盾值 +10-25%", "mage_shield", "shieldBonus", 0.16],
    ["mage_starfall", "陨星增幅", "陨星术伤害 +10-25%", "mage_meteor", "aoeDamageBonus", 0.18],
    ["mage_mirror_duration", "分神长存", "分神化影持续时间 +10-25%", "mage_mirror", "summonDamageBonus", 0.1],
    ["mage_mirror_damage", "分神共鸣", "分神化影伤害 +10-25%", "mage_mirror", "summonDamageBonus", 0.16],
    ["mage_resource_on_burn", "焚魂回灵", "击杀燃烧敌人回复灵力 3-8", "mage_fireblast", "resourceRegen", 2],
    ["mage_all_skills", "术修全法", "术修技能伤害 +4-10%", "mage", "damageBonus", 0.07],
  ],
};

export const classAffixDefinitions = Object.entries(classAffixRows).flatMap(([classId, rows]) =>
  rows.map(([id, name, effect, tag, stat, value]) => ({ id, classId: classId as ClassId, name, effect, stat, value, tags: [tag] })),
);

export const seasonAffixDefinitions = [
  ["season_ember_gain", "残烬感应", "劫火残烬获取 +5-15%", "resourceRegen", 1.5],
  ["season_ember_damage", "劫火增幅", "劫火裁决伤害 +10-25%", "damageBonus", 0.16],
  ["season_ember_range", "劫火扩散", "劫火裁决范围 +8-20%", "aoeDamageBonus", 0.12],
  ["season_ember_heat", "热度掌控", "劫火热度奖励 +3-10%，额外风险 -1%", "damageBonus", 0.09],
  ["season_burn_damage", "灼身加剧", "劫火灼身伤害 +10-25%", "dotDamageBonus", 0.16],
  ["season_burn_vulnerable", "焚魂易伤", "劫火灼身易伤 +2-6%", "eliteDamageBonus", 0.08],
  ["season_fireseed_drop", "火种采撷", "劫火种掉落权重 +5-15%", "resourceRegen", 1.2],
  ["season_sigil_cost", "法印精修", "道纪法印升级消耗 -3-8%", "resourceRegen", 1],
  ["season_trial_reward", "道纪试炼", "每周任务奖励 +5-15%", "resourceRegen", 1.2],
  ["season_ember_boss", "劫主焚印", "Boss 战劫火值获取 +8-20%", "bossDamageBonus", 0.14],
  ["season_ember_elite", "煞将焚印", "精英击杀劫火值 +8-20%", "eliteDamageBonus", 0.14],
  ["season_spirit_exp", "神游劫火", "神游历练残烬收益 +5-15%", "resourceRegen", 1.5],
  ["season_low_hp_fire", "残命劫焰", "低生命时劫火裁决充能速度 +10-25%", "damageBonus", 0.12],
  ["season_summon_fire", "灵契劫火", "召唤物命中可获得少量劫火值", "summonDamageBonus", 0.12],
  ["season_cooldown_fire", "火印归息", "劫火裁决后技能冷却恢复速度 +5-15%，持续 4 秒", "cooldownReduction", 0.06],
  ["season_shield_fire", "火幕护身", "触发劫火裁决后获得小护盾", "shieldBonus", 0.12],
  ["season_dot_fire", "余烬绵延", "劫火灼身持续时间 +1-3 秒", "dotDamageBonus", 0.12],
  ["season_clear_fire", "焚路前行", "劫火灼身敌人死亡时额外进度 +1-3%", "damageBonus", 0.07],
  ["season_double_judgement", "双重裁决", "劫火裁决有 3-8% 概率二次触发，二次伤害 40%", "damageBonus", 0.12],
  ["season_final_oath", "赤霄誓火", "赤霄遗址和终极 Boss 中伤害 +5-15%", "bossDamageBonus", 0.12],
] as const;

export const legendaryItems = [
  ["leg_echo_loop", "天机回响环", "ring1", "all", "技能命中有概率重复一次，重复伤害 35%", "damageBonus", 0.1],
  ["leg_void_boots", "归墟云履", "boots", "all", "移动后 2 秒内受到伤害 -15%，适合风筝", "moveSpeed", 0.08],
  ["leg_stable_lantern", "命灯不灭", "amulet", "all", "每场战斗第一次死亡改为回复 30% 生命，冷却一场", "maxHp", 60],
  ["leg_elite_hunter", "猎煞玉令", "amulet", "all", "击杀精英后 12 秒内伤害 +20%", "eliteDamageBonus", 0.2],
  ["leg_resource_wheel", "灵源轮", "offhand", "all", "资源低于 30% 时回复速度 +40%", "resourceRegen", 3],
  ["leg_guardian_robes", "守御法袍", "chest", "all", "召唤物存在时玩家减伤 +10%，召唤物减伤 +20%", "summonDamageBonus", 0.12],
  ["leg_boss_bane", "破境指环", "ring1", "all", "Boss 生命低于 35% 时玩家伤害 +25%", "bossDamageBonus", 0.22],
  ["leg_cooldown_scroll", "归息玉简", "offhand", "all", "使用防御技能后，随机非防御技能冷却 -20%", "cooldownReduction", 0.08],
  ["leg_status_sigil", "镇魂印", "offhand", "all", "对被控制敌人伤害 +25%，控制结束后造成一次小爆发", "damageBonus", 0.12],
  ["leg_salvage_charm", "炼器护符", "amulet", "all", "神游历练自动分解收益 +20%", "resourceRegen", 1.8],
  ["leg_five_resist", "五行道冠", "helmet", "all", "全抗性 +18%，受到持续伤害 -12%", "fireResist", 0.18],
  ["leg_progress_charm", "洞玄灵佩", "amulet", "all", "击杀怪物进度 +10%，但怪物生命 +8%", "damageBonus", 0.08],
  ["leg_sword_array_heart", "旋罡剑心", "weapon", "warrior", "旋罡剑阵每命中 8 次触发额外剑气", "meleeDamageBonus", 0.18],
  ["leg_sword_banner_echo", "镇岳余威", "offhand", "warrior", "镇岳剑旗消失时释放剑罡冲击", "summonDamageBonus", 0.18],
  ["leg_sword_mountain_scar", "裂岳剑痕", "gloves", "warrior", "裂岳斩留下持续 4 秒剑痕", "aoeDamageBonus", 0.18],
  ["leg_sword_unbroken", "不灭剑罡", "chest", "warrior", "长啸凝罡额外提供护盾", "shieldBonus", 0.18],
  ["leg_sword_soul_mark", "斩魄印", "ring1", "warrior", "斩魄诀击杀敌人后刷新 35% 冷却", "bossDamageBonus", 0.18],
  ["leg_sword_charge_line", "御剑长虹", "boots", "warrior", "御剑突进路径留下剑气，造成持续伤害", "dotDamageBonus", 0.14],
  ["leg_sword_intent_core", "剑意炉", "amulet", "warrior", "剑意上限 +30，核心技能伤害 +12%", "resourceMax", 30],
  ["leg_sword_low_hp", "残命剑骨", "chest", "warrior", "生命低于 40% 时剑修技能伤害 +25%，受到伤害 -10%", "damageBonus", 0.18],
  ["leg_sword_elite_shout", "煞临长啸", "helmet", "warrior", "精英出现时自动触发一次弱化长啸凝罡", "shieldBonus", 0.12],
  ["leg_sword_double_slash", "双锋归一", "weapon", "warrior", "破锋剑有概率追加第二击，并额外获得剑意", "meleeDamageBonus", 0.16],
  ["leg_archer_return_arrow", "穿云回矢", "weapon", "ranger", "穿云灵矢到达终点后折返一次", "rangedDamageBonus", 0.18],
  ["leg_archer_poison_cloud", "毒藤残阵", "gloves", "ranger", "毒藤符阵触发后留下毒雾区域", "dotDamageBonus", 0.18],
  ["leg_archer_double_wolf", "玄狼双契", "amulet", "ranger", "玄狼灵契最大数量 +1", "summonDamageBonus", 0.2],
  ["leg_archer_rain_echo", "万羽余落", "ring1", "ranger", "万羽落结束后继续造成 3 秒残留伤害", "aoeDamageBonus", 0.16],
  ["leg_archer_mark_hunt", "猎煞印", "offhand", "ranger", "击杀标记目标后自动标记新目标", "rangedDamageBonus", 0.12],
  ["leg_archer_shadow_guard", "踏影护符", "boots", "ranger", "踏影步后留下影身吸引怪物 2 秒", "moveSpeed", 0.08],
  ["leg_archer_focus_quiver", "聚息箭囊", "offhand", "ranger", "暴击回复灵息，且提高下一次核心技能伤害", "critChance", 0.05],
  ["leg_archer_trap_chain", "连环伏阵", "gloves", "ranger", "陷阱触发后有概率在附近生成小陷阱", "dotDamageBonus", 0.14],
  ["leg_archer_boss_mark", "劫主猎令", "ring1", "ranger", "Boss 被标记时，玄狼和玩家对其伤害提高", "bossDamageBonus", 0.16],
  ["leg_archer_arrow_fan", "千羽弓", "weapon", "ranger", "连珠符箭额外发射扇形小箭，但单箭伤害降低", "rangedDamageBonus", 0.14],
  ["leg_mage_thunder_book", "雷引天书", "weapon", "mage", "引雷诀额外弹射 2 次", "aoeDamageBonus", 0.18],
  ["leg_mage_flame_field", "劫焰残符", "gloves", "mage", "劫焰爆留下燃烧区域", "dotDamageBonus", 0.18],
  ["leg_mage_frost_crack", "霜封裂印", "ring1", "mage", "霜封阵冻结结束后造成冰裂伤害", "aoeDamageBonus", 0.14],
  ["leg_mage_mirror_gem", "分神法镜", "amulet", "mage", "分神化影可以复制基础技能", "summonDamageBonus", 0.16],
  ["leg_mage_starfall_echo", "星坠回响", "weapon", "mage", "陨星术有概率追加一颗小星陨", "aoeDamageBonus", 0.18],
  ["leg_mage_ward_cycle", "灵幕轮转", "offhand", "mage", "护体灵幕存在时冷却恢复速度 +15%", "cooldownReduction", 0.08],
  ["leg_mage_burn_return", "焚魂回灵佩", "amulet", "mage", "燃烧敌人死亡时回复灵力并缩短劫焰爆冷却", "resourceRegen", 2.5],
  ["leg_mage_frost_thunder", "霜雷同律", "ring1", "mage", "引雷诀命中冻结目标时触发小范围雷爆", "aoeDamageBonus", 0.16],
  ["leg_mage_missile_storm", "飞符风暴", "weapon", "mage", "星辉飞符数量 +3，但单发伤害降低", "damageBonus", 0.14],
  ["leg_mage_low_mana", "枯灵星盘", "offhand", "mage", "灵力低于 25% 时基础技能伤害和回灵提高", "resourceRegen", 2],
] as const;

export const seasonalRelics = [
  ["season_relic_chixiao_pendant", "赤霄劫火佩", "amulet", "劫火裁决有 20% 概率不清空全部劫火值，而是保留 25 点", "damageBonus", 0.18],
  ["season_relic_ember_ring", "劫火归元戒", "ring1", "击杀劫火灼身敌人回复资源并获得少量生命", "resourceRegen", 2.6],
  ["season_relic_fireseed_blade", "火种飞剑", "weapon", "劫火灼身敌人受到玩家核心技能伤害提高", "damageBonus", 0.18],
  ["season_relic_burning_banner", "赤霄焚旗", "offhand", "劫火裁决后召唤短暂火旗攻击附近敌人", "summonDamageBonus", 0.18],
  ["season_relic_ash_robe", "余烬法袍", "chest", "受到致命伤害时消耗当前劫火值，按劫火值回复生命", "maxHp", 70],
  ["season_relic_tribulation_crown", "劫火道冠", "helmet", "劫火热度达到 5 层后，暴击率和冷却恢复提高", "critChance", 0.06],
  ["season_relic_void_ember_boots", "归墟火履", "boots", "移动会留下短暂火痕，神游历练收益 +8%", "moveSpeed", 0.08],
  ["season_relic_soul_burning_seal", "焚魂法印", "offhand", "Boss 每损失 20% 生命，自动施加劫火灼身", "bossDamageBonus", 0.18],
  ["season_relic_ember_wolf_charm", "火狼灵符", "amulet", "召唤物命中劫火灼身敌人时造成额外火伤", "summonDamageBonus", 0.18],
  ["season_relic_thunder_ember_ring", "雷火同源戒", "ring1", "雷法命中劫火灼身目标时触发小型火雷爆", "aoeDamageBonus", 0.16],
  ["season_relic_frost_ember_mirror", "冰火玄镜", "offhand", "冻结敌人后，下一次劫火伤害提高", "damageBonus", 0.14],
  ["season_relic_final_oath", "赤霄旧誓", "amulet", "赤霄旧祖挑战中劫火裁决伤害 +35%，其他内容中 +15%", "bossDamageBonus", 0.2],
] as const;

export type LegendaryItemRow = typeof legendaryItems[number];
export type SeasonalRelicRow = typeof seasonalRelics[number];

export function typedSlot(slot: string) {
  return slot as EquipmentSlot;
}

export function typedClass(classId: string) {
  return classId === "all" ? "warrior" : (classId as ClassId);
}

export const buildGuides = [
  { id: "bd_sword_array", classId: "warrior", name: "旋罡剑阵流", role: "速刷、神游稳定", coreSkills: ["旋罡剑阵", "破锋剑", "长啸凝罡", "镇岳剑旗"], coreItems: ["旋罡剑心", "镇岳余威", "不灭剑罡"], affixes: ["旋罡增幅", "旋罡节流", "剑意涌动", "洞玄", "劫火增幅"], sigils: ["劫火爆裂", "灰烬回流", "洞天指引", "神游收益"], rule: "敌人数量 >= 3 时释放旋罡剑阵；生命 <= 60% 时释放长啸凝罡" },
  { id: "bd_sword_control", classId: "warrior", name: "裂岳镇煞流", role: "高层控制", coreSkills: ["裂岳斩", "镇岳剑旗", "长啸凝罡", "御剑突进"], coreItems: ["裂岳剑痕", "不灭剑罡", "镇魂印"], affixes: ["裂岳余威", "镇魂", "玄甲", "护命", "冷却缩减"], sigils: ["玄罡护体", "镇煞法印", "破煞护心", "玄罡法域"], rule: "精英存在时释放裂岳斩；敌人密集时释放镇岳剑旗" },
  { id: "bd_sword_boss", classId: "warrior", name: "斩魄破境流", role: "Boss 爆发", coreSkills: ["斩魄诀", "破锋剑", "长啸凝罡", "御剑突进"], coreItems: ["斩魄印", "破境指环", "剑意炉"], affixes: ["斩魄破境", "破境", "斩灭", "会心", "暴伤"], sigils: ["焚魂印", "焚灭诀", "劫主烙印", "天火裁决"], rule: "目标生命 <= 35% 时释放斩魄诀；Boss 出现时保留剑意" },
  { id: "bd_sword_low_hp", classId: "warrior", name: "残命剑罡流", role: "极限高层生存", coreSkills: ["长啸凝罡", "旋罡剑阵", "镇岳剑旗", "裂岳斩"], coreItems: ["残命剑骨", "命灯不灭", "五行道冠"], affixes: ["护命", "玄甲", "全抗", "低生命伤害", "护盾"], sigils: ["玄罡护体", "残命守印", "玄罡法域", "余温回生"], rule: "生命 <= 70% 提前开防御；Boss 狂暴阶段保留长啸凝罡" },
  { id: "bd_archer_crit", classId: "ranger", name: "千羽聚息流", role: "多发速刷、灵息循环", coreSkills: ["连珠符箭", "穿云灵矢", "万羽落", "毒藤符阵"], coreItems: ["千羽弓", "聚息箭囊", "劫火归元戒"], affixes: ["会心", "迅击", "归息", "回响", "劫火"], sigils: ["余焰连珠", "洞天指引", "御风疾行", "灵元回流"], rule: "连珠符箭化为多发压制；暴击与劫火击杀不断回补灵息，穿云灵矢低门槛循环释放" },
  { id: "bd_archer_trap", classId: "ranger", name: "毒雾伏阵流", role: "高层控场、持续腐蚀", coreSkills: ["毒藤符阵", "万羽落", "玄狼灵契", "连珠符箭"], coreItems: ["毒藤残阵", "连环伏阵", "守御法袍"], affixes: ["毒藤增幅", "蚀骨", "之伏阵", "广法", "神游"], sigils: ["镇煞法印", "神游收益", "稳定神游", "焚魂印"], rule: "怪群靠近时铺下毒藤与毒雾，玄狼牵制首领，守御法袍维持高层容错" },
  { id: "bd_archer_wolf", classId: "ranger", name: "火狼猎劫流", role: "召唤、Boss、劫火联动", coreSkills: ["玄狼灵契", "连珠符箭", "穿云灵矢", "毒藤符阵"], coreItems: ["火狼灵符", "劫主猎令", "劫火归元戒"], affixes: ["御灵", "灵契", "破境", "会心", "劫火"], sigils: ["护灵结界", "灵契劫火", "焚魂印", "劫主烙印"], rule: "玄狼常驻撕咬劫火灼身目标，标记首领后玩家与玄狼同时爆发，击杀灼身敌人回补灵息" },
  { id: "bd_archer_rain", classId: "ranger", name: "万羽天幕流", role: "大范围清场、热度冲层", coreSkills: ["万羽落", "连珠符箭", "穿云灵矢", "毒藤符阵"], coreItems: ["万羽余落", "千羽弓", "洞玄灵佩"], affixes: ["万羽增幅", "广法", "洞玄", "御风", "迅击"], sigils: ["洞天指引", "劫火爆裂", "余焰连珠", "御风疾行"], rule: "千羽多发先铺标记与劫火，怪群成形后万羽落接残留箭雨推进进度" },
  { id: "bd_mage_lightning", classId: "mage", name: "引雷连锁流", role: "速刷、中层天阶", coreSkills: ["引雷诀", "星火符", "霜封阵", "护体灵幕"], coreItems: ["雷引天书", "霜雷同律", "灵幕轮转"], affixes: ["引雷增幅", "雷引连弹", "玄雷", "法力回复", "冷却"], sigils: ["余焰连珠", "天机轮转", "洞天指引", "灵元回流"], rule: "敌人数量 >= 2 且灵力 >= 30 时释放引雷诀" },
  { id: "bd_mage_burn", classId: "mage", name: "劫焰焚魂流", role: "持续伤害、高血量 Boss", coreSkills: ["劫焰爆", "陨星术", "星火符", "分神化影"], coreItems: ["劫焰残符", "焚魂回灵佩", "赤霄劫火佩"], affixes: ["劫焰增幅", "燃烧伤害", "持续伤害", "劫火增幅"], sigils: ["焚魂印", "焚地余烬", "焚灭诀", "天火裁决"], rule: "目标没有燃烧时释放劫焰爆；Boss 出现时保留陨星术" },
  { id: "bd_mage_frost", classId: "mage", name: "霜封控场流", role: "高层生存控制", coreSkills: ["霜封阵", "引雷诀", "护体灵幕", "星辉飞符"], coreItems: ["霜封裂印", "灵幕轮转", "镇魂印"], affixes: ["霜封扩域", "冰裂增幅", "护盾", "冷却", "全抗"], sigils: ["玄罡护体", "镇煞法印", "玄罡法域", "静心守一"], rule: "周围敌人 >= 3 时释放霜封阵；生命 <= 75% 时释放护体灵幕" },
  { id: "bd_mage_starfall", classId: "mage", name: "星陨爆发流", role: "Boss 爆发、精英节点", coreSkills: ["陨星术", "劫焰爆", "星火符", "护体灵幕"], coreItems: ["星坠回响", "破境指环", "劫焰残符"], affixes: ["陨星增幅", "破境", "会心", "暴伤", "火焰伤害"], sigils: ["劫主烙印", "焚灭诀", "火种会心", "天火裁决"], rule: "Boss 存在或精英聚集时释放陨星术；灵力不足时暂停核心技能" },
] as const;

export const seasonChapters = [
  { chapter: 1, name: "初入归墟", phase: "1-10 级", rewards: ["灵石", "玄铁", "基础法器"], tasks: ["创建 1 名应劫者", "通关青岚竹海", "装备 4 件法器", "触发 3 次劫火裁决", "完成 1 次神游历练领取"] },
  { chapter: 2, name: "筑基试炼", phase: "10-20 级", rewards: ["灵器箱", "劫火残烬"], tasks: ["通关黑水古渡", "分解 10 件法器", "强化任意法器到 +3"] },
  { chapter: 3, name: "战诀初成", phase: "20-30 级", rewards: ["战诀预设槽 +1", "灵玉"], tasks: ["通关断剑荒冢", "配置 4 个战诀规则", "击败 3 个精英"] },
  { chapter: 4, name: "问道天阶", phase: "解锁归墟天阶", rewards: ["地阶法器箱", "法印尘"], tasks: ["达到 30 级", "通关断剑荒冢", "完成归墟天阶 1 层", "配置 6 个技能战诀规则", "分解 20 件法器", "强化任意法器到 +5"] },
  { chapter: 5, name: "劫火渐盛", phase: "天阶 30", rewards: ["天阶法宝保底箱"], tasks: ["通关归墟天阶 30 层", "触发 50 次劫火裁决", "升级任意法印到 5 级"] },
  { chapter: 6, name: "赤霄遗址", phase: "50 级", rewards: ["劫火种", "道纪法印重置道具"], tasks: ["达到 50 级", "通关赤霄遗址", "获得 1 件天阶法宝"] },
  { chapter: 7, name: "镇压劫主", phase: "天阶 60", rewards: ["道纪遗宝概率箱"], tasks: ["通关归墟天阶 60 层", "完成 5 次材料秘境", "强化任意法宝到 +8"] },
  { chapter: 8, name: "问鼎归墟", phase: "天阶 100", rewards: ["赛季称号", "终极奖励箱"], tasks: ["通关归墟天阶 100 层", "击败赤霄旧祖", "获得 1 件道纪遗宝", "任意法宝强化到 +10", "完成悟道等级 50", "完成 20 次神游历练领取"] },
] as const;

export const dailyTasks = [
  { name: "完成 3 次洞天秘境", rewards: ["灵石", "劫火残烬"] },
  { name: "完成 2 次归墟天阶", rewards: ["劫火残烬", "星砂"] },
  { name: "分解 20 件法器", rewards: ["玄铁", "灵玉"] },
  { name: "触发 10 次劫火裁决", rewards: ["劫火残烬"] },
  { name: "领取 1 次神游历练", rewards: ["神游宝箱"] },
] as const;

export const weeklyTasks = [
  { name: "通关 20 次归墟天阶", rewards: ["天阶法宝概率箱"] },
  { name: "击败 10 个 Boss", rewards: ["法印尘", "星砂"] },
  { name: "完成 5 次材料秘境", rewards: ["强化材料箱"] },
  { name: "通关当前最高层 - 5 以内的天阶 5 次", rewards: ["归墟残片"] },
  { name: "完成一次赤霄旧祖挑战", rewards: ["道纪遗宝概率箱"] },
] as const;
