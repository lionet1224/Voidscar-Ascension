import type { Dungeon, MonsterTemplate } from "../types";

export const dungeons: Dungeon[] = [
  {
    id: "dust_archive",
    name: "青岚竹海",
    recommendedLevel: [1, 10],
    family: "paper",
    bossName: "青竹妖王",
    basePower: 85,
  },
  {
    id: "dropped_meeting",
    name: "黑水古渡",
    recommendedLevel: [10, 20],
    family: "darkScreen",
    bossName: "溺魂渡主",
    basePower: 185,
  },
  {
    id: "rust_pantry",
    name: "断剑荒冢",
    recommendedLevel: [20, 30],
    family: "rust",
    bossName: "断剑怨灵",
    basePower: 340,
  },
  {
    id: "black_screen_bay",
    name: "赤炼丹窟",
    recommendedLevel: [30, 40],
    family: "darkScreen",
    bossName: "赤炼丹魔",
    basePower: 560,
  },
  {
    id: "lightless_server",
    name: "星陨玄宫",
    recommendedLevel: [40, 50],
    family: "electric",
    bossName: "星陨宫主",
    basePower: 900,
  },
];

export const familyTrashNames = {
  paper: ["竹妖", "赤狐妖", "毒藤妖", "低阶劫煞"],
  rust: ["剑魂", "尸傀", "亡修", "剑冢孤魂"],
  darkScreen: ["水鬼", "溺魂", "阴煞", "荒渡怨灵"],
  electric: ["星灵", "雷煞", "古阵傀儡", "星火残灵"],
};

export const eliteAffixes = ["急行煞印", "玄甲煞印", "火环煞印", "冰牢煞印", "雷链煞印", "血祭煞印", "分魂煞印", "召妖煞印", "破盾煞印", "腐毒煞印", "护卫煞印", "缚灵煞印"];

export const monsterTemplates: MonsterTemplate[] = [
  { id: "bamboo_imp", name: "竹妖", family: "paper", type: "trash", baseHp: 68, baseDamage: 5, baseArmor: 3, progressValue: 2.4, tags: ["妖兽", "成群"] },
  { id: "fox_spirit", name: "赤狐妖", family: "paper", type: "charger", baseHp: 82, baseDamage: 6, baseArmor: 4, progressValue: 2.6, tags: ["妖兽", "快速"] },
  { id: "bamboo_king", name: "青竹妖王", family: "paper", type: "boss", baseHp: 520, baseDamage: 16, baseArmor: 18, progressValue: 0, tags: ["藤蔓束缚", "召唤"] },
  { id: "water_ghost", name: "水鬼", family: "darkScreen", type: "trash", baseHp: 72, baseDamage: 8, baseArmor: 4, progressValue: 2.6, tags: ["阴魂", "减速"] },
  { id: "drowned_soul", name: "溺魂", family: "darkScreen", type: "ranged", baseHp: 92, baseDamage: 9, baseArmor: 6, progressValue: 2.8, tags: ["阴魂", "持续伤害"] },
  { id: "drowned_ferryman", name: "溺魂渡主", family: "darkScreen", type: "boss", baseHp: 590, baseDamage: 17, baseArmor: 16, progressValue: 0, tags: ["黑水区域", "召唤"] },
  { id: "sword_soul", name: "剑魂", family: "rust", type: "trash", baseHp: 112, baseDamage: 7, baseArmor: 9, progressValue: 2.2, tags: ["阴魂", "高护甲"] },
  { id: "corpse_puppet", name: "尸傀", family: "rust", type: "shieldBearer", baseHp: 126, baseDamage: 8, baseArmor: 12, progressValue: 2.2, tags: ["器傀", "高血量"] },
  { id: "broken_sword_wraith", name: "断剑怨灵", family: "rust", type: "boss", baseHp: 680, baseDamage: 18, baseArmor: 24, progressValue: 0, tags: ["高暴击", "剑魂"] },
  { id: "fire_alchemist", name: "火丹魔", family: "electric", type: "ranged", baseHp: 86, baseDamage: 10, baseArmor: 5, progressValue: 2.7, tags: ["魔修", "火焰"] },
  { id: "alchemy_fiend", name: "赤炼丹魔", family: "electric", type: "boss", baseHp: 820, baseDamage: 21, baseArmor: 20, progressValue: 0, tags: ["劫火", "药傀引爆"] },
  { id: "star_construct", name: "古阵傀儡", family: "electric", type: "summoner", baseHp: 78, baseDamage: 7, baseArmor: 4, progressValue: 2.5, tags: ["器傀", "召唤"] },
  { id: "starfall_lord", name: "星陨宫主", family: "electric", type: "boss", baseHp: 980, baseDamage: 24, baseArmor: 22, progressValue: 0, tags: ["雷法", "星陨"] },
];

export function getDungeon(id: string) {
  return dungeons.find((dungeon) => dungeon.id === id) ?? dungeons[0];
}

export function riftPower(tier: number) {
  return 150 * Math.pow(1.11, tier);
}
