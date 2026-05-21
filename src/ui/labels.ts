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
  new: "新增",
  balance: "平衡",
  fix: "修复",
  system: "系统",
};

export const familyLabels = {
  paper: "妖兽",
  rust: "器傀",
  darkScreen: "阴魂",
  electric: "劫煞",
};
