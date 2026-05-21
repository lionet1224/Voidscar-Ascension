import type { ClassId, EquipmentSlot, ItemAffix, ItemRarity } from "../types";

export const rarityLabels: Record<ItemRarity, string> = {
  normal: "凡器",
  magic: "灵器",
  rare: "玄器",
  epic: "地阶法器",
  legendary: "天阶法宝",
  seasonalUnique: "道纪遗宝",
};

export const rarityRank: Record<ItemRarity, number> = {
  normal: 0,
  magic: 1,
  rare: 2,
  epic: 3,
  legendary: 4,
  seasonalUnique: 5,
};

export const slotLabels: Record<EquipmentSlot, string> = {
  weapon: "主手法器",
  offhand: "副手符印",
  helmet: "道冠",
  chest: "法袍 / 玄甲",
  gloves: "护腕",
  pants: "下裳",
  boots: "云履",
  amulet: "玉佩",
  ring1: "灵戒一",
  ring2: "灵戒二",
};

export const equipmentSlots = Object.keys(slotLabels) as EquipmentSlot[];

export const baseNames: Record<EquipmentSlot, string[]> = {
  weapon: ["飞剑", "灵弓", "法印", "符剑"],
  offhand: ["符印", "灵箓", "剑匣", "护身玉"],
  helmet: ["道冠", "青纱冠", "玄纹冠"],
  chest: ["法袍", "玄甲", "云纹衣"],
  gloves: ["护腕", "符箓腕", "凝灵护手"],
  pants: ["下裳", "玄纹袴", "灵丝下装"],
  boots: ["云履", "踏风履", "镇岳靴"],
  amulet: ["玉佩", "劫火佩", "归墟玉"],
  ring1: ["灵戒", "赤霄戒"],
  ring2: ["灵戒", "赤霄戒"],
};

export const prefixes: ItemAffix[] = [
  { id: "sharp", name: "破煞", description: "通用伤害提高", statModifiers: { damageBonus: 0.08 }, tags: ["physical"], value: 8 },
  { id: "breaker", name: "镇煞", description: "对精英劫煞伤害提高", statModifiers: { eliteDamageBonus: 0.14 }, tags: ["elite"], value: 12 },
  { id: "rage", name: "御剑", description: "剑意回复提高", statModifiers: { resourceRegen: 1.8 }, tags: ["warrior"], value: 10 },
  { id: "slam", name: "裂岳", description: "裂岳斩伤害提高", statModifiers: { aoeDamageBonus: 0.11 }, tags: ["warrior_ground_slam"], value: 10 },
  { id: "whirl", name: "旋罡", description: "旋罡剑阵伤害提高", statModifiers: { meleeDamageBonus: 0.1 }, tags: ["warrior_whirlwind"], value: 10 },
  { id: "hunter_shadow", name: "影弦", description: "对标记目标伤害提高", statModifiers: { rangedDamageBonus: 0.1 }, tags: ["ranger"], value: 10 },
  { id: "pierce", name: "穿云", description: "穿云灵矢伤害提高", statModifiers: { rangedDamageBonus: 0.11 }, tags: ["ranger_piercing_arrow"], value: 10 },
  { id: "toxic", name: "毒藤", description: "毒伤和符阵伤害提高", statModifiers: { dotDamageBonus: 0.14 }, tags: ["poison"], value: 11 },
  { id: "fire", name: "星火", description: "火焰道法伤害提高", statModifiers: { damageBonus: 0.09 }, tags: ["fire"], value: 9 },
  { id: "frost", name: "霜华", description: "冰霜和控制效果提高", statModifiers: { damageBonus: 0.08 }, tags: ["ice"], value: 8 },
  { id: "storm", name: "玄雷", description: "雷法伤害提高", statModifiers: { damageBonus: 0.1 }, tags: ["lightning"], value: 10 },
  { id: "focus", name: "聚灵", description: "灵力回复提高", statModifiers: { resourceRegen: 2.2 }, tags: ["mage"], value: 11 },
  { id: "starfall", name: "星陨", description: "陨星术伤害提高", statModifiers: { aoeDamageBonus: 0.12 }, tags: ["mage_meteor"], value: 11 },
  { id: "mirror", name: "镜像", description: "召唤物伤害提高", statModifiers: { summonDamageBonus: 0.13 }, tags: ["summon"], value: 12 },
  { id: "ember", name: "劫火", description: "劫火残烬获取提高", statModifiers: {}, tags: ["season"], value: 8 },
  { id: "ashen", name: "归墟", description: "道纪法印伤害提高", statModifiers: { damageBonus: 0.1 }, tags: ["season"], value: 10 },
  { id: "charred", name: "玄罡", description: "道纪护盾效果提高", statModifiers: { shieldBonus: 0.12 }, tags: ["season"], value: 10 },
];

export const suffixes: ItemAffix[] = [
  { id: "wall", name: "之玄甲", description: "护甲提高", statModifiers: { armor: 12 }, tags: ["defense"], value: 9 },
  { id: "unyielding", name: "之护命", description: "生命上限提高", statModifiers: { maxHp: 24 }, tags: ["defense"], value: 10 },
  { id: "rewarm", name: "之回元", description: "生命回复提高", statModifiers: { hpRegen: 2 }, tags: ["heal"], value: 8 },
  { id: "stride", name: "之疾风", description: "移动速度提高", statModifiers: { moveSpeed: 0.08 }, tags: ["speed"], value: 8 },
  { id: "haste", name: "之迅行", description: "攻击速度提高", statModifiers: { attackSpeed: 0.08 }, tags: ["speed"], value: 8 },
  { id: "clarity", name: "之聚灵", description: "资源回复提高", statModifiers: { resourceRegen: 1.8 }, tags: ["resource"], value: 9 },
  { id: "cooldown", name: "之凝诀", description: "冷却缩减", statModifiers: { cooldownReduction: 0.05 }, tags: ["skill"], value: 10 },
  { id: "ward", name: "之守御", description: "护盾值提高", statModifiers: { shieldBonus: 0.1 }, tags: ["shield"], value: 9 },
  { id: "greed", name: "之纳珍", description: "灵石和材料收益提高", statModifiers: {}, tags: ["loot"], value: 7 },
  { id: "cleanup", name: "之洞玄", description: "秘境进度获取提高", statModifiers: {}, tags: ["progress"], value: 9 },
  { id: "echo", name: "之回响", description: "战诀有概率重复一次低伤害版本", statModifiers: { damageBonus: 0.06 }, tags: ["trigger"], value: 11 },
  { id: "rift", name: "之归墟", description: "归墟天阶奖励提高", statModifiers: {}, tags: ["rift"], value: 9 },
  { id: "hunt", name: "之猎煞", description: "击杀精英劫煞后获得增益", statModifiers: { eliteDamageBonus: 0.08 }, tags: ["elite"], value: 10 },
  { id: "watch", name: "之守望", description: "召唤物持续时间提高", statModifiers: { summonDamageBonus: 0.08 }, tags: ["summon"], value: 8 },
];

export const legendaryPowers: { name: string; slot: EquipmentSlot; classId: ClassId; affix: ItemAffix }[] = [
  { name: "旋罡剑心", slot: "weapon", classId: "warrior", affix: { id: "legend_whirl_core", name: "旋罡剑心", description: "旋罡剑阵每命中 8 次触发额外剑气", statModifiers: { meleeDamageBonus: 0.16 }, tags: ["warrior_whirlwind"], value: 28 } },
  { name: "镇岳余威", slot: "offhand", classId: "warrior", affix: { id: "legend_banner", name: "镇岳余威", description: "镇岳剑旗消失时释放剑罡冲击", statModifiers: { summonDamageBonus: 0.18 }, tags: ["warrior_banner"], value: 28 } },
  { name: "玄狼双契", slot: "amulet", classId: "ranger", affix: { id: "legend_wolf", name: "玄狼双契", description: "玄狼灵契最大数量 +1", statModifiers: { summonDamageBonus: 0.2 }, tags: ["ranger_wolf"], value: 30 } },
  { name: "穿云回矢", slot: "weapon", classId: "ranger", affix: { id: "legend_pierce", name: "穿云回矢", description: "穿云灵矢到达终点后折返一次", statModifiers: { rangedDamageBonus: 0.18 }, tags: ["ranger_piercing_arrow"], value: 30 } },
  { name: "雷引天书", slot: "weapon", classId: "mage", affix: { id: "legend_chain", name: "雷引天书", description: "引雷诀额外弹射 2 次", statModifiers: { aoeDamageBonus: 0.18 }, tags: ["mage_chain_lightning"], value: 30 } },
  { name: "劫焰残符", slot: "gloves", classId: "mage", affix: { id: "legend_fireblast", name: "劫焰残符", description: "劫焰爆留下燃烧区域", statModifiers: { dotDamageBonus: 0.18 }, tags: ["mage_fireblast"], value: 30 } },
];
