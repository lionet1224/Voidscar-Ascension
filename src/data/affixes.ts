import type { CharacterStats, ClassId, EquipmentSlot, ItemAffix, ItemRarity } from "../types";
import { affixDefinitions, baseItemNames, classAffixDefinitions, legendaryItems, seasonAffixDefinitions, seasonalRelics, typedSlot } from "./seasonDataPack";

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

export const baseNames: Record<EquipmentSlot, string[]> = baseItemNames;

export const prefixes: ItemAffix[] = [
  ...affixDefinitions.filter((definition) => definition.pool === "prefix").map(toAffix),
  ...classAffixDefinitions.map((definition) =>
    toAffix({
      ...definition,
    }),
  ),
  ...seasonAffixDefinitions.map(([id, name, effect, stat, value]) =>
    toAffix({
      id,
      name,
      effect,
      stat,
      value,
      tags: ["season", "ember"],
    }),
  ),
];

export const suffixes: ItemAffix[] = affixDefinitions.filter((definition) => definition.pool === "suffix").map(toAffix);

export const legendaryPowers: { id: string; name: string; slot: EquipmentSlot; classId: ClassId; affix: ItemAffix }[] = legendaryItems.flatMap(
  ([id, name, slot, classId, description, stat, value]) => {
    const classes: ClassId[] = classId === "all" ? ["warrior", "ranger", "mage"] : [classId as ClassId];
    return classes.map((entryClassId) => ({
      id,
      name,
      slot: typedSlot(slot),
      classId: entryClassId,
      affix: toAffix({
        id,
        name,
        effect: description,
        stat,
        value,
        tags: ["legendary", entryClassId],
      }),
    }));
  },
);

export const seasonalPowers: { id: string; name: string; slot: EquipmentSlot; affix: ItemAffix }[] = seasonalRelics.map(([id, name, slot, description, stat, value]) => ({
  id,
  name,
  slot: typedSlot(slot),
  affix: toAffix({
    id,
    name,
    effect: description,
    stat,
    value,
    tags: ["seasonalUnique", "ember"],
  }),
}));

function toAffix(definition: {
  id: string;
  name: string;
  effect: string;
  stat: keyof CharacterStats | string;
  value: number;
  tags: readonly string[];
}): ItemAffix {
  return {
    id: definition.id,
    name: definition.name,
    description: definition.effect,
    statModifiers: expandStat(definition.stat as keyof CharacterStats, definition.value),
    tags: [...definition.tags],
    value: Math.max(6, Math.round(typeof definition.value === "number" && definition.value < 1 ? definition.value * 140 : definition.value * 0.8)),
  };
}

function expandStat(stat: keyof CharacterStats, value: number): Partial<CharacterStats> {
  if (stat === "fireResist") {
    return {
      fireResist: value,
      iceResist: value * 0.65,
      lightningResist: value * 0.65,
      poisonResist: value * 0.65,
      shadowResist: value * 0.65,
    };
  }
  return { [stat]: value };
}
