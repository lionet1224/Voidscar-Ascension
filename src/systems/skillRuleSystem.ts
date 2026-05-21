import { getActiveProfile } from "./characterSystem";
import { clamp } from "./id";
import { getSkill } from "../data/skills";
import type { Character, Skill, SkillCastRule, SkillCondition } from "../types";

export interface RuleContext {
  character: Character;
  hpPercent: number;
  resourcePercent: number;
  enemyCountNearby: number;
  eliteExists: boolean;
  bossExists: boolean;
  targetHpPercent: number;
  summonCount: number;
  summonCountForSkill: (skillId: string) => number;
  summonLimit: (skill: Skill) => number;
  shieldPercent: number;
  progress: number;
  cooldownReady: (skillId: string) => boolean;
  canCast: (skill: Skill) => boolean;
  now: number;
  lastCastAt: Record<string, number>;
}

export function decideNextSkill(context: RuleContext): Skill | null {
  const profile = getActiveProfile(context.character);
  const equipped = new Set(context.character.skillLoadout.skillIds.slice(0, 5));
  const rules = profile.rules
    .filter((rule) => rule.mode === "auto" && equipped.has(rule.skillId) && (context.character.skillRanks[rule.skillId] ?? 0) > 0)
    .sort((a, b) => b.priority - a.priority);
  for (const rule of rules) {
    const skill = getSkill(rule.skillId);
    if (!skill || !context.canCast(skill)) continue;
    const lastCast = context.lastCastAt[rule.skillId];
    if (rule.minIntervalMs && lastCast !== undefined && context.now - lastCast < rule.minIntervalMs) continue;
    if (matchAnyConditionGroup(rule, context, skill)) return skill;
  }
  return getBasicSkill(context.character);
}

export function getBasicSkill(character: Character) {
  return character.skillLoadout.skillIds.map((id) => getSkill(id)).find((skill) => skill?.type === "basic") ?? null;
}

function matchAnyConditionGroup(rule: SkillCastRule, context: RuleContext, skill: Skill) {
  if (!rule.conditionGroups.length) return true;
  return rule.conditionGroups.some((group) => group.conditions.every((condition) => matchCondition(condition, context, skill)));
}

function matchCondition(condition: SkillCondition, context: RuleContext, skill: Skill) {
  switch (condition.type) {
    case "always":
      return true;
    case "resourceAbove":
      return compare(context.resourcePercent, Number(condition.value ?? 0), condition.operator ?? ">=");
    case "resourceBelow":
      return compare(context.resourcePercent, Number(condition.value ?? 0), condition.operator ?? "<=");
    case "hpAbove":
      return compare(context.hpPercent, Number(condition.value ?? 0), condition.operator ?? ">=");
    case "hpBelow":
      return compare(context.hpPercent, Number(condition.value ?? 0), condition.operator ?? "<=");
    case "enemyCountNearby":
      return compare(context.enemyCountNearby, Number(condition.value ?? 1), condition.operator ?? ">=");
    case "eliteExists":
      return context.eliteExists;
    case "bossExists":
      return context.bossExists;
    case "targetHpBelow":
      return compare(context.targetHpPercent, Number(condition.value ?? 35), condition.operator ?? "<=");
    case "summonCountBelow":
      return compare(context.summonCountForSkill(skill.id), Math.max(Number(condition.value ?? 1), context.summonLimit(skill)), condition.operator ?? "<");
    case "shieldBelow":
      return compare(context.shieldPercent, Number(condition.value ?? 20), condition.operator ?? "<=");
    case "cooldownReady":
      return context.cooldownReady(String(condition.value ?? ""));
    case "progressAbove":
      return compare(context.progress, Number(condition.value ?? 0), condition.operator ?? ">=");
    case "progressBelow":
      return compare(context.progress, Number(condition.value ?? 100), condition.operator ?? "<=");
    default:
      return true;
  }
}

function compare(left: number, right: number, operator: string) {
  const a = clamp(left, -999999, 999999);
  switch (operator) {
    case ">":
      return a > right;
    case "<":
      return a < right;
    case "<=":
      return a <= right;
    case "==":
      return a === right;
    case "!=":
      return a !== right;
    case ">=":
    default:
      return a >= right;
  }
}
