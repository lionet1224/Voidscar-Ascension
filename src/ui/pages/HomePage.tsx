import { BriefcaseBusiness, CirclePlay, Zap } from "lucide-react";
import { classNames } from "../../data/classes";
import { gameConfig } from "../../data/gameConfig";
import { getSkill } from "../../data/skills";
import type { Character, CombatReport, Item } from "../../types";
import {
  calculateCharacterPower,
  getCharacterInventory,
  getCharacterReports,
  getCurrentCharacter,
  getEffectiveStats,
  isCurrentSeasonCharacter,
} from "../../systems/characterSystem";
import { formatDuration, formatNumber } from "../../systems/id";
import { NoCharacter, Stat } from "../components/common";
import { AttributeTooltip, SkillTooltip } from "../components/InfoTooltip";
import { ReportSummary } from "../components/ReportSummary";
import type { PageProps } from "../pageTypes";

export function HomePage({ save, setPage }: PageProps) {
  const character = getCurrentCharacter(save);
  if (!character) {
    return (
      <section className="empty-state">
        <BriefcaseBusiness size={42} />
        <h1>唤醒应劫者</h1>
        <p>{gameConfig.worldName}灵脉崩坏，归墟复现旧劫。先选择修行流派，再编排战诀入秘境镇煞。</p>
        <button className="primary" onClick={() => setPage("characters")}>唤醒应劫者</button>
      </section>
    );
  }
  const inventory = getCharacterInventory(save, character);
  const reports = getCharacterReports(save, character);
  const latest = reports[0];
  const power = calculateCharacterPower(character, inventory);
  const stable = Math.max(0, character.highestRiftTier - 2);
  const playable = isCurrentSeasonCharacter(character);
  return (
    <div className="page-grid">
      <section className="panel hero-panel">
        <div>
          <span className="eyebrow">当前应劫者</span>
          <h1>{character.name}</h1>
          <p>{classNames[character.classId]} · 等级 {character.level} · 战力 {formatNumber(power)} · {playable ? "当纪应劫者" : "旧纪道影"}</p>
          {!playable && <p className="muted">该角色来自旧赛季，已归档为只读道影。你可以回看装备、战诀、最高层和道痕记录，但不能修改或继续游玩。</p>}
        </div>
        <div className="hero-actions">
          <button className="primary" disabled={!playable} onClick={() => setPage("battle")}><CirclePlay size={17} /> 开始推演</button>
          <button onClick={() => setPage("skills")}><Zap size={17} /> {playable ? "编排战诀" : "查看战诀"}</button>
        </div>
      </section>
      <section className="panel stat-grid">
        <Stat title="最高天阶" value={`${character.highestRiftTier} 层`} />
        <Stat title="稳定神游层" value={`${stable} 层`} />
        <Stat title="法器数量" value={`${inventory.length} 件`} />
        <Stat title="道痕记录" value={`${reports.length} 份`} />
      </section>
      <CharacterSheet character={character} inventory={inventory} reports={reports} />
      <section className="panel">
        <h2>推荐操作</h2>
        <ul className="action-list">
          <li>神游历练建议选择最高通关层 - 2，当前可设为 {stable} 层。</li>
          <li>若护体战诀触发太晚，建议把生命条件设到 70%。</li>
          <li>保留和主力战诀同名的法器词缀，通常能更快形成流派。</li>
        </ul>
      </section>
      <section className="panel">
        <h2>最近道痕</h2>
        {latest ? <ReportSummary report={latest} /> : <p className="muted">还没有道痕记录。完成一次秘境推演后会生成统计。</p>}
      </section>
    </div>
  );
}

function CharacterSheet({ character, inventory, reports }: { character: Character; inventory: Item[]; reports: CombatReport[] }) {
  const stats = getEffectiveStats(character, inventory);
  const totalKills = reports.reduce((sum, report) => sum + report.kills, 0);
  const totalDeaths = reports.reduce((sum, report) => sum + report.deaths, 0);
  const eliteKills = reports.reduce((sum, report) => sum + report.eliteKills, 0);
  const totalDamage = reports.reduce((sum, report) => sum + report.totalDamage, 0);
  const damageTaken = reports.reduce((sum, report) => sum + report.damageTaken, 0);
  const bossWins = reports.filter((report) => report.result === "success").length;
  const equippedSkills = character.skillLoadout.skillIds.map((skillId) => getSkill(skillId)).filter(Boolean);
  const learnedSkills = Object.entries(character.skillRanks)
    .filter(([, rank]) => rank > 0)
    .map(([skillId, rank]) => ({ skill: getSkill(skillId), rank }))
    .filter((entry) => entry.skill);

  return (
    <section className="panel character-sheet">
      <div className="sheet-head">
        <div>
          <span className="eyebrow">应劫者档案</span>
          <h2>{character.name}</h2>
          <p>{classNames[character.classId]} · 等级 {character.level} · {character.status === "active" ? "当纪应劫者" : "旧纪道影"}</p>
        </div>
        <div className="sheet-summary">
          <Stat title="累计击杀" value={formatNumber(totalKills)} />
          <Stat title="死亡次数" value={formatNumber(totalDeaths)} />
          <Stat title="精英击杀" value={formatNumber(eliteKills)} />
          <Stat title="通关次数" value={formatNumber(bossWins)} />
        </div>
      </div>
      <div className="sheet-grid">
        <div>
          <h3>基础属性</h3>
          <div className="attribute-grid">
            {characterAttributeRows(stats).map((row) => (
              <div className="attribute-row item-hover-scope" tabIndex={0} key={row.label}>
                <span>{row.label}</span>
                <strong>{row.value}</strong>
                <AttributeTooltip label={row.label} value={row.value} />
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3>战斗履历</h3>
          <div className="table-like compact">
            <div><span>最高归墟天阶</span><strong>{character.highestRiftTier} 层</strong></div>
            <div><span>稳定神游层</span><strong>{character.stableIdleRiftTier} 层</strong></div>
            <div><span>已镇压洞天</span><strong>{character.completedDungeons.length} 个</strong></div>
            <div><span>总伤害</span><strong>{formatNumber(totalDamage)}</strong></div>
            <div><span>总承伤</span><strong>{formatNumber(damageTaken)}</strong></div>
            <div><span>推演时长</span><strong>{formatDuration(character.totalPlayTimeSeconds)}</strong></div>
            <div><span>神游时长</span><strong>{formatDuration(character.totalIdleSeconds)}</strong></div>
          </div>
        </div>
        <div>
          <h3>已装备战诀</h3>
          <div className="skill-chip-list">
            {equippedSkills.map((skill) => skill && (
              <span className="item-hover-scope" tabIndex={0} key={skill.id}>
                {skill.icon} {skill.name} {character.skillRanks[skill.id] ?? 0} 重
                <SkillTooltip skill={skill} rank={character.skillRanks[skill.id] ?? 0} />
              </span>
            ))}
          </div>
          <h3>已修技能</h3>
          <div className="skill-chip-list">
            {learnedSkills.map(({ skill, rank }) => skill && (
              <span className="item-hover-scope" tabIndex={0} key={skill.id}>
                {skill.icon} {skill.name} {rank} 重
                <SkillTooltip skill={skill} rank={rank} />
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function characterAttributeRows(stats: ReturnType<typeof getEffectiveStats>) {
  return [
    ["生命", stats.maxHp], ["生命回复", stats.hpRegen], ["攻击", stats.attackPower], ["护甲", stats.armor],
    ["暴击率", stats.critChance], ["暴击伤害", stats.critDamage], ["攻速", stats.attackSpeed], ["施法速度", stats.castSpeed],
    ["移动速度", stats.moveSpeed], ["冷却缩减", stats.cooldownReduction], ["资源上限", stats.resourceMax], ["资源回复", stats.resourceRegen],
    ["全伤害", stats.damageBonus], ["精英伤害", stats.eliteDamageBonus], ["劫主伤害", stats.bossDamageBonus], ["近战伤害", stats.meleeDamageBonus],
    ["远程伤害", stats.rangedDamageBonus], ["范围伤害", stats.aoeDamageBonus], ["持续伤害", stats.dotDamageBonus], ["召唤伤害", stats.summonDamageBonus],
    ["治疗加成", stats.healingBonus], ["护盾加成", stats.shieldBonus], ["火抗", stats.fireResist], ["冰抗", stats.iceResist],
    ["雷抗", stats.lightningResist], ["毒抗", stats.poisonResist], ["影抗", stats.shadowResist],
  ].map(([label, value]) => ({ label: String(label), value: formatAttributeValue(Number(value)) }));
}

function formatAttributeValue(value: number) {
  if (!Number.isFinite(value)) return "0";
  if (Math.abs(value) < 1) return `${Math.round(value * 100)}%`;
  return Number.isInteger(value) ? formatNumber(value) : value.toFixed(1);
}
