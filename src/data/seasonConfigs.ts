import type { SeasonDefinition, SeasonPower } from "../types";
import { buildGuides, emberMechanic, finalBoss, seasonChapters, seasonPackMeta, seasonSigils } from "./seasonDataPack";

export const CURRENT_SEASON_ID = "dao_era_1_ember_tribulation";
export const CURRENT_VERSION = "0.2.0";

const sigilPowers: SeasonPower[] = seasonSigils.map((sigil) => ({
  id: sigil.id,
  seasonId: CURRENT_SEASON_ID,
  name: sigil.name,
  description: sigil.effect,
  category: sigil.category,
  onlineEffectId: sigil.id,
  offlineEffectId: sigil.route === "tianji" ? "idle_or_efficiency_bonus" : sigil.route === "xuangang" ? "survival_bonus" : "damage_bonus",
  level: 0,
  maxLevel: sigil.maxLevel,
  costPerLevel: "core" in sigil && sigil.core ? 120 : 60,
}));

export const seasonDefinitions: Record<string, SeasonDefinition> = {
  [CURRENT_SEASON_ID]: {
    id: CURRENT_SEASON_ID,
    name: seasonPackMeta.seasonName,
    shortName: "劫火初燃",
    theme: "劫火、赤霄宗、归墟道痕、神游历练",
    currencyName: "劫火残烬",
    description: "南离火脉崩坏，赤霄宗旧址在归墟中重现。积累劫火值触发劫火裁决，在风险递增的劫火热度中刷装、冲层并镇压赤霄旧祖。",
    mechanics: [
      {
        id: emberMechanic.id,
        name: emberMechanic.name,
        description: "击杀怪物、击杀精英、命中 Boss 会积累劫火值，满 100 后自动爆发。",
        trigger: "小怪 +2，特殊怪 +3，精英 +20，Boss 每损失 10% 生命 +8",
        effect: "对 420 范围敌人造成 350% 攻击强度火焰伤害，并附加 6 秒劫火灼身。",
      },
      {
        id: "ember_heat",
        name: "劫火热度",
        description: "每次触发劫火裁决，本场战斗获得 1 层热度，速刷收益和风险同步提高。",
        trigger: "每次劫火裁决",
        effect: "最高 10 层；奖励提高，怪物伤害、生命和精英压力逐步提高。",
      },
      {
        id: "chixiao_final_oath",
        name: finalBoss.name,
        description: "归墟天阶 100 层后开放的第一道纪终极挑战。",
        trigger: finalBoss.unlock,
        effect: "三阶段考验清怪、机制目标和劫火裁决节奏，首次击败高概率获得道纪遗宝。",
      },
    ],
    equipmentMechanics: [
      {
        id: "seasonal_unique",
        name: "道纪遗宝",
        itemRarity: "seasonalUnique",
        description: "第一道纪专属法器，固定效果围绕劫火裁决、劫火灼身、热度和赤霄旧祖挑战。",
        affixTags: ["劫火", "归墟", "赤霄"],
      },
      {
        id: "legendary_pool",
        name: "天阶法宝",
        itemRarity: "legendary",
        description: "48 件通用和职业天阶法宝支撑多种修行流派成形。",
        affixTags: ["剑修", "灵弓", "术修", "通用"],
      },
      {
        id: "season_affixes",
        name: "道纪词缀池",
        itemRarity: "epic",
        description: "20 条赛季词缀补强劫火值获取、裁决伤害、神游收益和终极 Boss 表现。",
        affixTags: ["劫火裁决", "劫火灼身", "神游", "赤霄誓火"],
      },
    ],
    activities: [
      {
        id: "domain_cycle",
        name: "洞天秘境",
        description: "6 个普通秘境覆盖 1-60 级成长，25/50/75% 出精英，100% 出 Boss。",
        unlockHint: "青岚竹海初始开放，后续随等级与通关推进。",
        rewardTags: ["法器", "强化材料", "劫火残烬", "劫火种"],
      },
      {
        id: "voidscar_ascent",
        name: "归墟天阶",
        description: "1-120 层终局冲层，按层数提升怪物成长、天阶词缀、煞印数量和掉落品质。",
        unlockHint: "30 级、通关断剑荒冢、拥有完整战诀配置。",
        rewardTags: ["天阶法宝", "道纪遗宝", "归墟残片", "法印尘"],
      },
      {
        id: "spirit_expedition",
        name: "神游历练",
        description: "最多累计 24 小时收益，只能刷已通关稳定层，并生成简化道痕记录。",
        unlockHint: "拥有可神游内容后开放。",
        rewardTags: ["离线经验", "法器", "劫火残烬", "自动分解材料"],
      },
      {
        id: "season_chapters",
        name: "赛季章节",
        description: `${seasonChapters.length} 章目标引导应劫者从初入归墟推进到天阶 100 与赤霄旧祖。`,
        unlockHint: "创建应劫者后开放。",
        rewardTags: ["战诀预设槽", "保底箱", "称号", "终极奖励箱"],
      },
      {
        id: "build_guides",
        name: "流派参悟",
        description: `${buildGuides.length} 套流派思路覆盖速刷、高层镇煞、劫主爆发、御灵召唤和神游历练。`,
        unlockHint: "在道痕记录与万象图鉴中逐步参悟。",
        rewardTags: ["战诀重点", "核心法宝", "核心词缀", "推荐法印"],
      },
    ],
    powers: sigilPowers,
  },
};

export const currentSeasonDefinition = seasonDefinitions[CURRENT_SEASON_ID];
