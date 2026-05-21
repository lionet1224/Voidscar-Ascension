import type { BattleState } from "../combat/combatTypes";
import type { PatchNote, Skill } from "../types";

export const skillTypeLabels: Record<Skill["type"], string> = {
  basic: "基础",
  core: "核心",
  defense: "防御",
  mobility: "位移",
  summon: "召唤",
  ultimate: "爆发",
};

export const battleStateLabels: Record<BattleState, string> = {
  idle: "待机",
  preparing: "准备中",
  running: "战斗中",
  paused: "已暂停",
  bossSpawned: "劫主出现",
  success: "成功",
  failed: "失败",
  settling: "结算中",
};

export const seasonCategoryLabels = {
  damage: "劫火",
  defense: "玄罡",
  utility: "天机",
};

export const patchCategoryLabels: Record<PatchNote["changes"][number]["category"], string> = {
  new: "本期开放",
  balance: "赛季机制",
  fix: "修复说明",
  system: "命盘记录",
};

export const familyLabels = {
  beast: "妖兽",
  ghost: "阴魂",
  demonic: "魔修",
  construct: "器傀",
  fiend: "劫煞",
};

export const monsterTypeLabels = {
  trash: "近战小怪",
  elite: "精英",
  boss: "劫主",
  ranged: "远程",
  charger: "突进",
  healer: "回生",
  shieldBearer: "护盾",
  summoner: "召唤",
  bomber: "自爆",
  control: "控制",
  eliteCandidate: "精英候选",
};
