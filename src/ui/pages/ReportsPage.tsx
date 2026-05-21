import { getCharacterReports, getCurrentCharacter } from "../../systems/characterSystem";
import { NoCharacter } from "../components/common";
import { ReportSummary } from "../components/ReportSummary";
import type { PageProps } from "../pageTypes";

export function ReportsPage({ save }: PageProps) {
  const character = getCurrentCharacter(save);
  if (!character) return <NoCharacter />;
  const reports = getCharacterReports(save, character);
  return (
    <div className="page-stack">
      {reports.map((report) => (
        <section className="panel" key={report.id}>
          <ReportSummary report={report} detailed />
        </section>
      ))}
      {!reports.length && <section className="panel"><p className="muted">还没有报告。战斗结算后会在这里保存历史统计。</p></section>}
    </div>
  );
}
