import type { SeasonDefinition, SeasonPower } from "../types";

export const CURRENT_SEASON_ID = "s1_ashen_pact";
export const CURRENT_VERSION = "0.1.0";

const ashenPowers: SeasonPower[] = [
  { id: "ashen_burst", seasonId: CURRENT_SEASON_ID, name: "劫火爆裂", description: "击杀一定数量敌人后触发范围爆炸。", category: "damage", onlineEffectId: "kill_explosion", offlineEffectId: "damage_bonus", level: 0, maxLevel: 5, costPerLevel: 50 },
  { id: "burning_mark", seasonId: CURRENT_SEASON_ID, name: "焚魂印", description: "精英和劫主周期性受到燃烧。", category: "damage", onlineEffectId: "elite_burn", offlineEffectId: "boss_bonus", level: 0, maxLevel: 5, costPerLevel: 60 },
  { id: "ember_chain", seasonId: CURRENT_SEASON_ID, name: "余焰连珠", description: "暴击时弹射劫火。", category: "damage", onlineEffectId: "crit_chain", offlineEffectId: "crit_bonus", level: 0, maxLevel: 5, costPerLevel: 65 },
  { id: "core_overload", seasonId: CURRENT_SEASON_ID, name: "火劫过载", description: "核心战诀伤害提高，但资源消耗提高。", category: "damage", onlineEffectId: "resource_overload", offlineEffectId: "power_bonus", level: 0, maxLevel: 5, costPerLevel: 80 },
  { id: "charred_shield", seasonId: CURRENT_SEASON_ID, name: "玄罡护体", description: "低生命时获得护盾。", category: "defense", onlineEffectId: "low_hp_shield", offlineEffectId: "survival_bonus", level: 0, maxLevel: 5, costPerLevel: 50 },
  { id: "ash_cloak", seasonId: CURRENT_SEASON_ID, name: "镇煞法印", description: "降低精英和劫主伤害。", category: "defense", onlineEffectId: "elite_dr", offlineEffectId: "survival_bonus", level: 0, maxLevel: 5, costPerLevel: 55 },
  { id: "rewarm", seasonId: CURRENT_SEASON_ID, name: "余温回生", description: "击杀燃烧敌人时回复生命。", category: "defense", onlineEffectId: "burn_heal", offlineEffectId: "death_reduction", level: 0, maxLevel: 5, costPerLevel: 60 },
  { id: "scorched_stance", seasonId: CURRENT_SEASON_ID, name: "静心守一", description: "站定一段时间后获得减伤。", category: "defense", onlineEffectId: "stand_dr", offlineEffectId: "survival_bonus", level: 0, maxLevel: 5, costPerLevel: 70 },
  { id: "rift_guidance", seasonId: CURRENT_SEASON_ID, name: "洞天指引", description: "洞天秘境进度获取提高。", category: "utility", onlineEffectId: "progress_bonus", offlineEffectId: "run_speed", level: 0, maxLevel: 5, costPerLevel: 45 },
  { id: "ash_refund", seasonId: CURRENT_SEASON_ID, name: "灵元回流", description: "核心战诀有概率返还资源。", category: "utility", onlineEffectId: "resource_refund", offlineEffectId: "power_bonus", level: 0, maxLevel: 5, costPerLevel: 55 },
  { id: "warm_speed", seasonId: CURRENT_SEASON_ID, name: "御风疾行", description: "击杀后短暂提高移动速度。", category: "utility", onlineEffectId: "kill_speed", offlineEffectId: "run_speed", level: 0, maxLevel: 5, costPerLevel: 50 },
  { id: "cleanup_profit", seasonId: CURRENT_SEASON_ID, name: "神游收益", description: "神游历练获得额外劫火残烬。", category: "utility", onlineEffectId: "ember_bonus", offlineEffectId: "ember_bonus", level: 0, maxLevel: 5, costPerLevel: 65 },
];

export const seasonDefinitions: Record<string, SeasonDefinition> = {
  [CURRENT_SEASON_ID]: {
    id: CURRENT_SEASON_ID,
    name: "第一道纪：劫火初燃",
    shortName: "劫火初燃",
    theme: "劫火、赤霄宗、归墟道痕、神游历练",
    currencyName: "劫火残烬",
    description: "南离火脉崩坏，赤霄宗旧址在归墟中重现。收集劫火残烬，修复天机命盘，镇压劫火源头。",
    mechanics: [
      { id: "ash_judgement", name: "劫火裁决", description: "击杀劫煞积累劫火，满值后自动爆发。", trigger: "击杀与精英击杀", effect: "对周围敌人造成火焰伤害并短暂标记劫主。" },
      { id: "ember_contract", name: "命盘推演", description: "连续镇煞会提高天机命盘推演精度。", trigger: "连续击杀", effect: "提高劫火残烬掉落和清图速度，但略微提高承伤。" },
    ],
    equipmentMechanics: [
      { id: "seasonal_unique", name: "道纪遗宝", itemRarity: "seasonalUnique", description: "当前道纪专属法器，带劫火词条和玄罡护体联动。", affixTags: ["劫火", "归墟", "玄罡"] },
      { id: "ash_affixes", name: "劫火词缀池", itemRarity: "epic", description: "法器可出现劫火、归墟、聚灵等道纪前缀。", affixTags: ["劫火", "归墟", "聚灵"] },
    ],
    activities: [
      { id: "ash_rift", name: "劫火秘境", description: "归墟天阶中的道纪变体，精英劫煞更密集，残烬收益更高。", unlockHint: "完成赤炼丹窟后解锁。", rewardTags: ["劫火残烬", "劫火核心", "道纪遗宝"] },
      { id: "contract_tasks", name: "天机委托", description: "围绕战诀、法器和镇煞效率的小目标，提供道纪材料。", unlockHint: "创建应劫者后开放。", rewardTags: ["劫火残烬", "魔尘", "归墟晶片"] },
    ],
    powers: ashenPowers,
  },
};

export const currentSeasonDefinition = seasonDefinitions[CURRENT_SEASON_ID];
