import type { CombatReport } from "../../types";
import { formatNumber } from "../../systems/id";
import { Stat } from "./common";

export function ReportSummary({ report, detailed = false }: { report: CombatReport; detailed?: boolean }) {
  const skills = Object.values(report.actors.player?.skills ?? {}).sort((a, b) => b.totalDamage - a.totalDamage);
  return (
    <div className="report">
      <div className="report-head">
        <div>
          <h3>{report.contentName}</h3>
          <p>{report.result === "success" ? "成功" : "失败"} · 用时 {Math.floor(report.durationMs / 1000)} 秒 · 劫主：{report.bossName}</p>
        </div>
        <strong>{formatNumber(report.totalDamage)}</strong>
      </div>
      <div className="stat-grid small">
        <Stat title="击杀" value={`${report.kills}`} />
        <Stat title="精英劫煞" value={`${report.eliteKills}`} />
        <Stat title="承伤" value={formatNumber(report.damageTaken)} />
        <Stat title="掉落" value={`${report.rewards.itemIds.length} 件`} />
      </div>
      {detailed && (
        <div className="breakdown">
          {skills.map((skill) => (
            <div key={skill.skillId}>
              <span>{skill.skillIcon} {skill.skillName} · {skill.casts} 次</span>
              <strong>{formatNumber(skill.totalDamage)}</strong>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
