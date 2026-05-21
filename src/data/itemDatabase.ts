import type { EquipmentSlot, ItemRarity } from "../types";
import { allDungeons, familyTrashNames, getDungeon } from "./dungeons";
import { slotLabels } from "./affixes";
import { domains, legendaryItems, seasonalRelics, typedSlot } from "./seasonDataPack";

export interface ItemDatabaseEntry {
  id: string;
  dungeonId: string;
  sourceName: string;
  sourceType: string;
  name: string;
  rarity: ItemRarity;
  slot: EquipmentSlot;
  itemLevelRange: string;
  stats: string[];
  affixes: string[];
  mechanism: string;
  description: string;
}

export interface ItemDatabaseGroup {
  sourceName: string;
  sourceType: string;
  items: ItemDatabaseEntry[];
}

const dungeonFeatureDrops: ItemDatabaseEntry[] = domains.flatMap((domain, index) => {
  const levelRange = `${domain.recommendedLevel[0]}-${domain.recommendedLevel[1]}`;
  const familyNames = familyTrashNames[domain.family as keyof typeof familyTrashNames];
  const domainPower = 1 + index;
  return [
    entry({
      dungeonId: domain.id,
      sourceName: familyNames.slice(0, 2).join(" / "),
      sourceType: "小怪掉落",
      id: `${domain.id}_weapon`,
      name: `${domain.name.replace(/[遗址玄宫丹窟荒冢古渡竹海]/g, "").slice(0, 2) || domain.name.slice(0, 2)}镇煞法器`,
      rarity: index <= 1 ? "magic" : index <= 3 ? "rare" : "epic",
      slot: "weapon",
      itemLevelRange: levelRange,
      stats: [`攻击 +${4 + domainPower * 5}-${10 + domainPower * 8}`],
      affixes: index >= 3 ? ["劫火", "破境", "之归一"] : ["破煞", "会心", "之疾风"],
      mechanism: domainWeaponInscription(domain.name),
      description: domainWeaponLore(domain.name, domain.bossName),
    }),
    entry({
      dungeonId: domain.id,
      sourceName: familyNames.slice(2, 4).join(" / "),
      sourceType: "精英掉落",
      id: `${domain.id}_armor`,
      name: `${domain.name.slice(0, 2)}护命玄装`,
      rarity: index <= 2 ? "rare" : "epic",
      slot: index % 2 ? "chest" : "gloves",
      itemLevelRange: levelRange,
      stats: [`生命 +${18 + domainPower * 16}-${36 + domainPower * 24}`, `护甲 +${8 + domainPower * 7}-${20 + domainPower * 10}`],
      affixes: ["护命", "玄甲", "之守御"],
      mechanism: domainArmorInscription(domain.name),
      description: domainArmorLore(domain.name),
    }),
    entry({
      dungeonId: domain.id,
      sourceName: domain.bossName,
      sourceType: "劫主掉落",
      id: `${domain.id}_boss_trinket`,
      name: `${domain.bossName.replace("主", "").replace("王", "")}遗佩`,
      rarity: index <= 1 ? "rare" : index <= 3 ? "epic" : "legendary",
      slot: "amulet",
      itemLevelRange: levelRange,
      stats: [`伤害 +${3 + domainPower}-${7 + domainPower * 2}%`, `资源回复 +${1 + index}-${3 + index}`],
      affixes: index >= 4 ? ["归墟", "劫火", "之神游"] : ["聚灵", "洞玄", "之破境"],
      mechanism: bossTrinketInscription(domain.bossName),
      description: `封存${domain.bossName}残魂的玉佩，仍会对归墟裂隙产生反应。`,
    }),
  ];
});

const legendaryDatabaseEntries: ItemDatabaseEntry[] = legendaryItems.map(([id, name, slot, classId]) =>
  entry({
    dungeonId: "rift_ascent",
    sourceName: classId === "all" ? "归墟天阶 Boss 池" : `${classLabel(classId)}天阶池`,
    sourceType: "天阶法宝",
    id,
    name,
    rarity: "legendary",
    slot: typedSlot(slot),
    itemLevelRange: "650-1150",
    stats: defaultStatsForSlot(typedSlot(slot), "legendary"),
    affixes: classId === "all" ? ["归墟", "之归一", "之回响"] : [`${classLabel(classId)}全法`, "劫火", "之破境"],
    mechanism: legendaryInscription(name, classId),
    description: legendaryLore(name, classId),
  }),
);

const relicDatabaseEntries: ItemDatabaseEntry[] = seasonalRelics.map(([id, name, slot]) =>
  entry({
    dungeonId: "season_relics",
    sourceName: "赤霄遗址 / 赤霄旧祖 / 天阶 60+",
    sourceType: "道纪遗宝",
    id,
    name,
    rarity: "seasonalUnique",
    slot: typedSlot(slot),
    itemLevelRange: "800-1150",
    stats: defaultStatsForSlot(typedSlot(slot), "seasonalUnique"),
    affixes: ["劫火", "归墟", "赤霄誓火"],
    mechanism: relicInscription(name),
    description: relicLore(name),
  }),
);

const materialDomainEntries: ItemDatabaseEntry[] = allDungeons
  .filter((dungeon) => dungeon.kind === "material")
  .map((dungeon) =>
    entry({
      dungeonId: dungeon.id,
      sourceName: dungeon.bossName,
      sourceType: "材料秘境",
      id: `${dungeon.id}_cache`,
      name: `${dungeon.name}秘藏`,
      rarity: "epic",
      slot: "offhand",
      itemLevelRange: `${dungeon.recommendedLevel[0]}-${dungeon.recommendedLevel[1]}`,
      stats: ["资源回复 +3-6", "护盾 +6%-12%"],
      affixes: ["聚灵", "之采撷", "之结界"],
      mechanism: materialCacheInscription(dungeon.name),
      description: materialCacheLore(dungeon.name, dungeon.bossName),
    }),
  );

export const itemDatabase: ItemDatabaseEntry[] = [
  ...dungeonFeatureDrops,
  ...materialDomainEntries,
  ...legendaryDatabaseEntries,
  ...relicDatabaseEntries,
];

export function getItemDefinition(itemId: string) {
  return itemDatabase.find((item) => item.id === itemId);
}

export function getDungeonLootGroups(dungeonId: string): ItemDatabaseGroup[] {
  const map = new Map<string, ItemDatabaseGroup>();
  itemDatabase
    .filter((item) => item.dungeonId === dungeonId)
    .forEach((item) => {
      const key = `${item.sourceName}::${item.sourceType}`;
      const group = map.get(key) ?? { sourceName: item.sourceName, sourceType: item.sourceType, items: [] };
      group.items.push(item);
      map.set(key, group);
    });
  return [...map.values()];
}

function entry(value: ItemDatabaseEntry) {
  return value;
}

function classLabel(classId: string) {
  if (classId === "warrior") return "剑修";
  if (classId === "ranger") return "灵弓";
  if (classId === "mage") return "术修";
  return "通用";
}

function defaultStatsForSlot(slot: EquipmentSlot, rarity: ItemRarity) {
  const high = rarity === "seasonalUnique";
  if (slot === "weapon") return [`攻击 +${high ? "58-92" : "42-78"}`, `伤害 +${high ? "10%-16%" : "7%-12%"}`];
  if (slot === "offhand") return [`资源回复 +${high ? "5-8" : "4-6"}`, `冷却缩减 +${high ? "6%-10%" : "4%-8%"}`];
  if (slot === "amulet" || slot === "ring1" || slot === "ring2") return [`暴击 +${high ? "5%-8%" : "3%-6%"}`, `伤害 +${high ? "8%-14%" : "5%-10%"}`];
  if (slot === "boots") return [`护甲 +${high ? "48-82" : "34-64"}`, "移动速度 +6%-12%"];
  return [`生命 +${high ? "80-140" : "56-110"}`, `护甲 +${high ? "42-78" : "30-62"}`];
}

function domainWeaponLore(domainName: string, bossName: string) {
  return `此器出自${domainName}裂隙深处，刃脊映有${bossName}残影。灵纹明灭之间，似有旧纪天火在器骨中低鸣。`;
}

function domainWeaponInscription(domainName: string) {
  return `器铭：入${domainName}者，当以心为锋，以痕为引；一念不坠，万煞自开。`;
}

function domainArmorLore(domainName: string) {
  return `玄装由${domainName}残存地脉与煞印碎屑同炼而成。衣甲内侧有细密星篆，触之微温，如古修临战前留下的护身誓言。`;
}

function domainArmorInscription(domainName: string) {
  return `器铭：${domainName}风火不息，披此玄纹者，可听见山河旧誓仍在胸前回响。`;
}

function bossTrinketInscription(bossName: string) {
  return `器铭：${bossName}虽灭，其执念未散；佩之如临旧梦，归墟潮声夜夜叩心。`;
}

function legendaryLore(name: string, classId: string) {
  const school = classLabel(classId);
  if (classId === "all") return `${name}本为天阶旧宝，曾悬于归墟裂隙之上镇压万煞。其光不烈，却能照见灵脉深处的断痕。`;
  return `${name}为${school}先贤遗留之宝，器中藏有一缕未散道意。每逢劫火照影，便会显出旧日开宗时的锋芒。`;
}

function legendaryInscription(name: string, classId: string) {
  const school = classLabel(classId);
  return classId === "all"
    ? `器铭：${name}不问主人来处，只认归墟之前仍敢执灯之人。`
    : `器铭：${school}道脉不绝，${name}一响，群山与星火皆为见证。`;
}

function relicLore(name: string) {
  return `${name}为第一道纪遗宝，赤霄宗覆灭之夜曾沐天火而不毁。器内残焰不似凡火，更像一段拒绝熄灭的誓约。`;
}

function relicInscription(name: string) {
  return `器铭：${name}承赤霄余烬而生，若归墟再开，愿以此火照见旧劫真名。`;
}

function materialCacheLore(dungeonName: string, bossName: string) {
  return `${dungeonName}秘藏以残阵封存，外壁刻有${bossName}守印。匣中灵光沉静，像被岁月压在炉底的星砂。`;
}

function materialCacheInscription(dungeonName: string) {
  return `器铭：${dungeonName}有藏，非贪者所得；须以定心叩阵，方见炉火回明。`;
}
