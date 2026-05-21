import type { EquipmentSlot, ItemRarity } from "../types";
import { familyTrashNames, getDungeon } from "./dungeons";

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

export const itemDatabase: ItemDatabaseEntry[] = [
  makeEntry("dust_archive", 0, 1, "小怪掉落", "qinglan_bamboo_sword", "青岚竹影剑", "normal", "weapon", "1-8", ["攻击 +4-8"], ["破煞", "之疾风"], "前期基础主手，用来稳定提升破锋剑伤害。", "竹海灵气凝成的轻剑，适合刚被天机命盘唤醒的应劫者。"),
  makeEntry("dust_archive", 0, 1, "小怪掉落", "qinglan_wind_boots", "青岚踏风履", "magic", "boots", "3-10", ["护甲 +5-10", "移速 +3%-5%"], ["之疾风", "之护命"], "提高走位容错，适合刚进入秘境时使用。", "鞋底刻有细小风纹，能在竹海风脉间借力。"),
  makeEntry("dust_archive", 2, "boss", "精英与劫主掉落", "venom_bamboo_bracer", "毒藤缚灵腕", "magic", "gloves", "6-10", ["护甲 +7-14"], ["毒藤", "之玄甲"], "命中后有机会补充持续伤害词缀，适合灵弓过渡。", "护腕内缠有毒藤妖残须，灵弓修士能借它延长毒性。"),
  makeEntry("dust_archive", "boss", "boss", "精英与劫主掉落", "bamboo_king_robe", "青竹妖王法袍", "rare", "chest", "8-12", ["生命 +18-32", "护甲 +10-18"], ["之护命", "之回元"], "青岚竹海首领掉落，偏生存，低级洞天不会掉落天阶法宝。", "青竹妖王残留妖力编成的法袍，可以稳定初期防线。"),

  makeEntry("dropped_meeting", 0, 1, "小怪掉落", "blackwater_talisman", "黑水镇魂符", "magic", "offhand", "10-18", ["灵元回复 +1-2"], ["之回元", "之聚灵"], "副手过渡法器，帮助核心战诀循环。", "符纸边缘常年潮湿，能镇住低阶溺魂的阴气。"),
  makeEntry("dropped_meeting", 0, 1, "小怪掉落", "drowned_boots", "溺魂渡水履", "rare", "boots", "12-20", ["护甲 +12-22", "移速 +4%-7%"], ["霜华", "之疾风"], "面对阴魂减速时更稳。", "渡水履能短暂隔绝黑水阴寒，适合持续神游历练。"),
  makeEntry("dropped_meeting", "boss", "boss", "劫主掉落", "ferryman_seal", "渡主引魂印", "rare", "offhand", "16-22", ["灵元回复 +2-3", "伤害 +3%-5%"], ["影弦", "之聚灵"], "适合灵弓和术修提高资源续航。", "溺魂渡主用来牵引亡魂的符印，被命盘重炼后可稳定灵元。"),
  makeEntry("dropped_meeting", "boss", "boss", "劫主掉落", "blackwater_amulet", "黑水沉魂佩", "epic", "amulet", "18-24", ["暴击 +2%-4%", "伤害 +3%-6%"], ["霜华", "之镇魂"], "黑水古渡高价值掉落，但不会出现天阶法宝。", "佩中封存一缕渡口寒潮，适合围绕控制和爆发构筑。"),

  makeEntry("rust_pantry", 0, 1, "小怪掉落", "barrow_sword_box", "荒冢剑匣", "rare", "offhand", "20-28", ["灵元回复 +2-4", "护甲 +10-18"], ["御剑", "之玄甲"], "剑修过渡副手，强化剑意与防护。", "剑匣内无剑，却能收束荒冢残存剑意。"),
  makeEntry("rust_pantry", 0, 1, "小怪掉落", "corpse_puppet_guard", "尸傀玄腕", "epic", "gloves", "24-32", ["护甲 +18-30"], ["裂岳", "之守御"], "适合裂岳镇煞流的中期核心护腕。", "尸傀外壳被拆解成护腕，沉重但极稳。"),
  makeEntry("rust_pantry", "boss", "boss", "劫主掉落", "sword_wraith_blade", "断剑怨灵残锋", "epic", "weapon", "28-34", ["攻击 +18-32"], ["旋罡", "镇煞", "之猎煞"], "断剑荒冢首领掉落，可作为旋罡剑阵流起点。", "断剑怨灵执念凝成的残锋，剑气带有荒冢寒意。"),
  makeEntry("rust_pantry", "boss", "boss", "劫主掉落", "soulcleaver_ring", "斩魄怨印戒", "legendary", "ring1", "30-36", ["暴击 +3%-5%", "伤害 +5%-8%"], ["御剑", "之破境"], "低概率首领专属天阶胚子，从这个洞天开始才可能出现。", "戒面如断剑截面，能让斩魄诀更容易撕开劫煞神魂。"),

  makeEntry("black_screen_bay", 2, "火丹魔", "精英与魔修掉落", "crimson_bracer", "赤炼符火腕", "epic", "gloves", "30-40", ["护甲 +20-34", "伤害 +4%-7%"], ["星火", "劫火", "之回响"], "火系战诀过渡核心，强化劫焰爆和持续燃烧。", "赤炼丹窟的炉火烙进护腕，适合劫焰焚魂流。"),
  makeEntry("black_screen_bay", "火丹魔", "火丹魔", "精英与魔修掉落", "alchemy_ring", "火丹聚灵戒", "rare", "ring1", "30-38", ["灵元回复 +2-4", "暴击 +2%-3%"], ["聚灵", "之回元"], "提高术修循环稳定性。", "丹魔失败火丹凝成的灵戒，能把散逸热息转回灵元。"),
  makeEntry("black_screen_bay", "boss", "boss", "劫主掉落", "trib_flame_seal", "劫焰残符", "legendary", "gloves", "36-44", ["护甲 +24-40", "持续伤害 +6%-10%"], ["星火", "劫火", "之回响"], "劫焰爆留下燃烧区域，是劫焰焚魂流的关键掉落。", "赤炼丹魔体内残符，能让劫焰在地面继续燃烧。"),
  makeEntry("black_screen_bay", "boss", "boss", "劫主掉落", "chixiao_ember_relic", "赤霄劫火佩", "seasonalUnique", "amulet", "38-46", ["伤害 +6%-10%", "护盾 +6%-10%"], ["归墟", "玄罡"], "道纪遗宝，强化劫火裁决和劫火残烬收益。", "第一道纪的赤霄宗遗物，内部仍有劫火残烬跳动。"),

  makeEntry("lightless_server", 0, 1, "小怪与精英掉落", "starfall_focus", "星陨聚灵印", "epic", "offhand", "40-50", ["灵元回复 +3-5", "伤害 +5%-8%"], ["玄雷", "星陨", "聚灵"], "术修高阶副手，提高引雷诀和陨星术循环。", "星陨玄宫阵眼碎片炼成的符印，能牵引星雷余辉。"),
  makeEntry("lightless_server", "古阵傀儡", "古阵傀儡", "小怪与精英掉落", "palace_guard_charm", "玄宫守御玉", "legendary", "amulet", "44-54", ["护盾 +8%-12%", "生命 +32-58"], ["之守御", "之归墟"], "高层生存法宝胚子，适合归墟天阶推进。", "古阵傀儡胸口的守阵玉，被取下后仍能自行凝盾。"),
  makeEntry("lightless_server", "boss", "boss", "劫主掉落", "thunder_grimoire", "雷引天书", "legendary", "weapon", "48-58", ["攻击 +32-54", "范围伤害 +8%-12%"], ["玄雷", "之回响"], "引雷诀额外弹射，是引雷连锁流关键法宝。", "星陨宫主遗留的雷法天书，翻页时会听见雷声。"),
  makeEntry("lightless_server", "boss", "boss", "劫主掉落", "voidscar_jade", "归墟星陨玉", "seasonalUnique", "amulet", "50-60", ["伤害 +8%-14%", "劫火残烬 +8%-12%"], ["归墟", "劫火", "星陨"], "道纪遗宝，兼顾终局收益与爆发。", "玉中映着归墟天阶的倒影，越靠近高层越灼热。"),
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

function makeEntry(
  dungeonId: string,
  sourceA: number | string,
  sourceB: number | string,
  sourceType: string,
  id: string,
  name: string,
  rarity: ItemRarity,
  slot: EquipmentSlot,
  itemLevelRange: string,
  stats: string[],
  affixes: string[],
  mechanism: string,
  description: string,
): ItemDatabaseEntry {
  return {
    id,
    dungeonId,
    sourceName: makeSourceName(dungeonId, sourceA, sourceB),
    sourceType,
    name,
    rarity,
    slot,
    itemLevelRange,
    stats,
    affixes,
    mechanism,
    description,
  };
}

function makeSourceName(dungeonId: string, sourceA: number | string, sourceB: number | string) {
  const dungeon = getDungeon(dungeonId);
  const trash = familyTrashNames[dungeon.family];
  const seen = new Set<string>();
  return [sourceA, sourceB]
    .map((source) => {
      if (source === "boss") return dungeon.bossName;
      if (typeof source === "number") return trash[source];
      return source;
    })
    .filter((source) => {
      if (!source || seen.has(source)) return false;
      seen.add(source);
      return true;
    })
    .join(" / ");
}
