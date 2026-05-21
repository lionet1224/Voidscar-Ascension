import type { Skill, SkillTag } from "../types";
import { resourceNames } from "../data/classes";

export const skillTagLabels: Record<SkillTag, string> = {
  melee: "近战",
  ranged: "远程",
  aoe: "范围",
  singleTarget: "单体",
  physical: "兵刃",
  fire: "火焰",
  ice: "冰霜",
  lightning: "雷法",
  poison: "毒伤",
  arcane: "星术",
  dot: "持续",
  control: "控制",
  summon: "御灵",
  shield: "护盾",
  heal: "回生",
};

const skillDescriptions: Record<string, string> = {
  warrior_slash: "挥出破煞剑光斩击近前目标，命中后凝聚剑意。",
  warrior_ground_slam: "重斩地脉，在前方小范围震开群敌，并令命中的劫煞短暂眩晕。",
  warrior_whirlwind: "展开旋罡剑阵，持续绞杀周围敌人，是剑修清场的主力战诀。",
  warrior_charge: "御剑突进至敌阵锋线，对路径终点附近目标造成兵刃伤害，并打乱敌群阵形。",
  warrior_shout: "长啸引动护身剑罡，立刻获得护盾并回复剑意。",
  warrior_execute: "凝意斩魄，对单个目标释放高倍率斩击，常在劫主残血阶段收束杀机。",
  warrior_banner: "立下镇岳剑旗，剑旗在持续期间周期性震荡附近敌人。",
  ranger_quickshot: "连续射出符箭攻击远处目标，命中可留下灵识标记，施放时回复灵息。",
  ranger_piercing_arrow: "射出穿云灵矢贯穿敌阵，对一条线附近的目标造成兵刃伤害。",
  ranger_poison_trap: "布下毒藤符阵，符阵持续缠绕范围内敌人并施加中毒。",
  ranger_shadow_step: "踏影后撤，暂避围压并重整射位。",
  ranger_arrow_rain: "向目标区域降下万羽箭雨，多次压制范围内敌人。",
  ranger_burst_knife: "掷出裂影飞刃，在目标附近爆开，对小范围敌人造成爆发伤害。",
  ranger_wolf: "缔结玄狼灵契，召来灵兽协同追击单个目标。",
  mage_spark: "掷出星火符灼击远处目标，并缓慢回复灵力。",
  mage_fireblast: "引爆劫焰，在目标区域造成火焰爆裂，并点燃命中的敌人。",
  mage_frost_ring: "在身周展开霜封阵，冻结近身敌人并造成冰霜伤害。",
  mage_chain_lightning: "牵引天雷在敌群间跃迁，命中后施加感电。",
  mage_arcane_missiles: "凝聚星辉飞符追击目标，专压高威胁单体。",
  mage_shield: "展开护体灵幕，以灵力化幕吸收即将到来的伤害。",
  mage_meteor: "召下陨星轰击目标区域，造成巨额火焰伤害并留下燃烧。",
  mage_mirror: "分出一道化影协同施法，持续期间以星术攻击附近敌人。",
};

export function formatSkillTags(tags: SkillTag[]) {
  return tags.map((tag) => skillTagLabels[tag]).join(" / ");
}

export function describeSkill(skill: Skill) {
  return skillDescriptions[skill.id] ?? "应劫者将此诀纳入命盘，按战诀规则自动施展。";
}

export function skillFormula(skill: Skill, rank = 1) {
  const currentRank = Math.max(1, rank);
  const resourceText = skillResourceEffect(skill);
  if (skill.id === "warrior_shout") return joinEffectLines(["当前效果：获得最大生命 28% 的护盾，持续 5 秒。", resourceText]);
  if (skill.id === "mage_shield") return joinEffectLines(["当前效果：获得最大生命 42% 的护盾，持续 7 秒。", resourceText]);
  if (skill.id === "ranger_shadow_step") return joinEffectLines(["当前效果：不造成伤害，拉开与近身敌人的距离。", resourceText]);
  if (skill.type === "summon") {
    const pulse = currentMultiplier(skill.damageMultiplier * 0.55, currentRank);
    const duration = skill.durationMs ? `${(skill.durationMs / 1000).toFixed(0)} 秒` : "数秒";
    return joinEffectLines([
      `当前伤害：召唤物每次攻击造成 ${pulse}% 攻击强度伤害，持续 ${duration}。`,
      resourceText,
      extraSkillEffect(skill),
    ]);
  }
  const multiplier = currentMultiplier(skill.damageMultiplier, currentRank);
  const scope = skill.tags.includes("aoe") ? `范围 ${skill.radius ?? skill.range} 内敌人` : "单个目标";
  return joinEffectLines([
    `当前伤害：对${scope}造成 ${multiplier}% 攻击强度伤害。`,
    resourceText,
    extraSkillEffect(skill),
  ]);
}

function currentMultiplier(multiplier: number, rank: number) {
  return Math.round(multiplier * (1 + (rank - 1) * 0.14) * 100);
}

function skillResourceEffect(skill: Skill) {
  const resourceName = resourceNames[skill.classId];
  if (skill.resourceCost > 0) return `资源：消耗 ${skill.resourceCost} 点${resourceName}。${resourceMeaning(skill.classId)}`;
  if (skill.resourceGain) return `资源：施放时回复 ${skill.resourceGain} 点${resourceName}。${resourceMeaning(skill.classId)}`;
  return "";
}

function resourceMeaning(classId: Skill["classId"]) {
  if (classId === "warrior") return "剑意是剑修释放核心、爆发和剑旗战诀所需的战斗资源。";
  if (classId === "ranger") return "灵息是灵弓释放核心、陷阱和御灵战诀所需的战斗资源。";
  return "灵力是术修释放法术、护体和分神战诀所需的战斗资源。";
}

function extraSkillEffect(skill: Skill) {
  const statusLines: string[] = skill.statusEffectIds?.map(statusEffectText) ?? [];
  if (skill.id === "ranger_quickshot") {
    statusLines.push("命中特效：35% 概率附加灵识标记，持续 6 秒；带标记的目标会被灵弓优先锁定，并可触发相关法器与词缀。");
  }
  if (skill.tags.includes("lightning")) {
    statusLines.push("命中特效：附加感电，持续 3.6 秒。");
  }
  return statusLines.join(" ");
}

function statusEffectText(id: string) {
  if (id === "stun") return "命中特效：眩晕 1.1 秒。";
  if (id === "poison") return "命中特效：中毒 5.2 秒，每秒造成约 28% 攻击强度的毒伤。";
  if (id === "burn") return "命中特效：燃烧 4.2 秒，每 0.9 秒造成约 35% 攻击强度的火焰伤害。";
  if (id === "freeze") return "命中特效：冰冻 1.5 秒。";
  return "命中特效：附加异常状态。";
}

function joinEffectLines(lines: Array<string | undefined>) {
  return lines.filter(Boolean).join(" ");
}
