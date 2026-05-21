import type { IdleClaimSummary } from "../../types";
import { CURRENT_VERSION } from "../../data/seasons";
import { patchNotes } from "../../data/patchNotes";
import { formatDuration, formatNumber } from "../../systems/id";

export function PatchModal({ onClose }: { onClose: () => void }) {
  const note = patchNotes[0];
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>{note.version} · {note.title}</h2>
        <p>{note.highlights.join(" / ")}</p>
        <button className="primary" onClick={onClose}>进入 {CURRENT_VERSION}</button>
      </div>
    </div>
  );
}

export function IdleClaimModal({ claim, onClose }: { claim: IdleClaimSummary; onClose: () => void }) {
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>神游历练已结算</h2>
        <div className="table-like">
          <div><span>离线时间</span><strong>{formatDuration(claim.offlineSeconds)}</strong></div>
          <div><span>有效收益</span><strong>{formatDuration(claim.cappedSeconds)}</strong></div>
          <div><span>内容</span><strong>{claim.contentName}</strong></div>
          <div><span>完成/失败</span><strong>{claim.completedRuns} / {claim.failedRuns}</strong></div>
          <div><span>经验</span><strong>{formatNumber(claim.exp)}</strong></div>
          <div><span>灵石</span><strong>{formatNumber(claim.gold)}</strong></div>
          <div><span>劫火残烬</span><strong>{formatNumber(claim.embers)}</strong></div>
          <div><span>保留/分解</span><strong>{claim.itemIds.length} / {claim.salvagedCount}</strong></div>
        </div>
        {claim.capped && <p className="warning">神游历练最多累计 24 小时，超出部分未获得收益。</p>}
        <button className="primary" onClick={onClose}>领取</button>
      </div>
    </div>
  );
}
