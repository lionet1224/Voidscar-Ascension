import { useState } from "react";
import { resourceNames } from "../../data/classes";
import { getClassSkillTree, getSkill } from "../../data/skills";
import type { SkillCastRule, SkillConditionType } from "../../types";
import {
  getActiveProfile,
  getAvailableSkillPoints,
  getCurrentCharacter,
  getSpentSkillPoints,
  getTotalSkillPoints,
} from "../../systems/characterSystem";
import { NoCharacter } from "../components/common";
import { skillTypeLabels } from "../labels";
import type { PageProps } from "../pageTypes";

export function SkillsPage({ save, mutate }: PageProps) {
  const character = getCurrentCharacter(save);
  const [advanced, setAdvanced] = useState(false);
  if (!character) return <NoCharacter />;
  const profile = getActiveProfile(character);
  const rulesBySkill = new Map(profile.rules.map((rule) => [rule.skillId, rule]));
  const tree = getClassSkillTree(character.classId);
  const totalPoints = getTotalSkillPoints(character);
  const spentPoints = getSpentSkillPoints(character);
  const availablePoints = getAvailableSkillPoints(character);

  const updateRule = (skillId: string, patch: Partial<SkillCastRule>) => {
    mutate((draft) => ({
      ...draft,
      characters: draft.characters.map((entry) => {
        if (entry.id !== character.id) return entry;
        return {
          ...entry,
          skillProfiles: entry.skillProfiles.map((skillProfile) =>
            skillProfile.id === entry.skillLoadout.activeProfileId
              ? { ...skillProfile, rules: skillProfile.rules.map((rule) => (rule.skillId === skillId ? { ...rule, ...patch } : rule)) }
              : skillProfile,
          ),
        };
      }),
    }));
  };

  const setRank = (skillId: string, delta: 1 | -1) => {
    mutate((draft) => ({
      ...draft,
      characters: draft.characters.map((entry) => {
        if (entry.id !== character.id) return entry;
        const node = tree.find((item) => item.skillId === skillId);
        if (!node) return entry;
        const currentRank = entry.skillRanks[skillId] ?? 0;
        const nextRank = currentRank + delta;
        const hasPrereqs = node.prerequisites.every((id) => (entry.skillRanks[id] ?? 0) > 0);
        if (delta > 0 && (nextRank > node.maxRank || entry.level < node.levelRequirement || !hasPrereqs || getAvailableSkillPoints(entry) <= 0)) return entry;
        if (delta < 0 && nextRank < (node.prerequisites.length ? 0 : 1)) return entry;
        const dependentStillInvested = tree.some((item) => item.prerequisites.includes(skillId) && (entry.skillRanks[item.skillId] ?? 0) > 0);
        if (delta < 0 && nextRank === 0 && dependentStillInvested) return entry;
        const skillRanks = { ...entry.skillRanks, [skillId]: nextRank };
        const skillLoadout = nextRank === 0 ? { ...entry.skillLoadout, skillIds: entry.skillLoadout.skillIds.filter((id) => id !== skillId) } : entry.skillLoadout;
        return { ...entry, skillRanks, skillLoadout };
      }),
    }));
  };

  const toggleEquip = (skillId: string) => {
    mutate((draft) => ({
      ...draft,
      characters: draft.characters.map((entry) => {
        if (entry.id !== character.id || (entry.skillRanks[skillId] ?? 0) <= 0) return entry;
        const equipped = entry.skillLoadout.skillIds.includes(skillId);
        if (equipped && entry.skillLoadout.skillIds.length <= 1) return entry;
        if (!equipped && entry.skillLoadout.skillIds.length >= 5) return entry;
        return {
          ...entry,
          skillLoadout: {
            ...entry.skillLoadout,
            skillIds: equipped ? entry.skillLoadout.skillIds.filter((id) => id !== skillId) : [...entry.skillLoadout.skillIds, skillId],
          },
        };
      }),
    }));
  };

  return (
    <div className="page-stack">
      <section className="panel page-title-row">
        <div>
          <h1>战诀</h1>
          <p>技能点 {spentPoints}/{totalPoints} · 可用 {availablePoints} · 最多装备 5 个主动战诀。</p>
        </div>
        <label className="toggle"><input type="checkbox" checked={advanced} onChange={(event) => setAdvanced(event.target.checked)} /> 高级条件</label>
      </section>
      <section className="skill-tree-grid">
        {tree.map((node) => {
          const skill = getSkill(node.skillId);
          if (!skill) return null;
          const rank = character.skillRanks[skill.id] ?? 0;
          const equipped = character.skillLoadout.skillIds.includes(skill.id);
          const rule = rulesBySkill.get(skill.id);
          const condition = rule?.conditionGroups[0]?.conditions[0];
          const locked = character.level < node.levelRequirement || node.prerequisites.some((id) => (character.skillRanks[id] ?? 0) <= 0);
          return (
            <article className={`skill-node-card ${rank > 0 ? "learned" : ""} ${locked ? "locked" : ""}`} key={skill.id}>
              <div className="skill-node-head">
                <div>
                  <h3>{skill.icon} {skill.name}</h3>
                  <p>{skillTypeLabels[skill.type]} · {skill.tags.join(" / ")}</p>
                </div>
                <strong>Lv.{rank}/{node.maxRank}</strong>
              </div>
              <p>{resourceNames[character.classId]} {skill.resourceCost ? `消耗 ${skill.resourceCost}` : `获取 ${skill.resourceGain ?? 0}`} · 冷却 {(skill.cooldownMs / 1000).toFixed(1)}秒</p>
              <div className="node-actions">
                <button disabled={locked || rank <= (node.prerequisites.length ? 0 : 1)} onClick={() => setRank(skill.id, -1)}>-</button>
                <button disabled={locked || availablePoints <= 0 || rank >= node.maxRank} onClick={() => setRank(skill.id, 1)}>+</button>
                <button disabled={rank <= 0} onClick={() => toggleEquip(skill.id)}>{equipped ? "卸下" : "装备"}</button>
              </div>
              <div className="rule-strip">
                <label><span>启用</span><input type="checkbox" checked={rule?.enabled ?? false} onChange={(event) => updateRule(skill.id, { enabled: event.target.checked })} /></label>
                <label><span>优先级</span><input type="number" value={rule?.priority ?? 10} onChange={(event) => updateRule(skill.id, { priority: Number(event.target.value) })} /></label>
              </div>
              {advanced && (
                <div className="rule-strip">
                  <label>
                    <span>触发</span>
                    <select
                      value={condition?.type ?? "always"}
                      onChange={(event) =>
                        updateRule(skill.id, {
                          conditionGroups: [{ logic: "AND", conditions: [{ ...(condition ?? { type: "always" }), type: event.target.value as SkillConditionType }] }],
                        })
                      }
                    >
                      <option value="always">总是</option>
                      <option value="resourceAbove">资源高于</option>
                      <option value="hpBelow">生命低于</option>
                      <option value="enemyCountNearby">附近敌人数</option>
                      <option value="eliteExists">精英劫煞存在</option>
                      <option value="bossExists">劫主存在</option>
                      <option value="summonCountBelow">召唤物不足</option>
                      <option value="shieldBelow">护盾低于</option>
                    </select>
                  </label>
                  <label>
                    <span>数值</span>
                    <input
                      type="number"
                      value={Number(condition?.value ?? 0)}
                      onChange={(event) =>
                        updateRule(skill.id, {
                          conditionGroups: [{ logic: "AND", conditions: [{ ...(condition ?? { type: "always" }), value: Number(event.target.value) }] }],
                        })
                      }
                    />
                  </label>
                </div>
              )}
            </article>
          );
        })}
      </section>
    </div>
  );
}
