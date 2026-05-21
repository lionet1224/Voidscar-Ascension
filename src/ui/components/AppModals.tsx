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

export function TutorialModal({ onClose }: { onClose: () => void }) {
  const steps = [
    ["唤醒应劫者", "选择剑修、灵弓或术修。每个流派都有独立资源、战诀节奏和法器偏好。"],
    ["编排战诀", "在战诀页提升技能、装备最多 5 个主动战诀，并设置释放优先级。防御技能建议先设在生命 70% 左右触发。"],
    ["进入秘境推演", "洞天秘境按进度推进，25%、50%、75% 会出现精英，100% 迎战劫主。击败怪物时就会即时掉落法器。"],
    ["整理法器", "法器可佩戴、分解和强化。悬停法器、属性或战诀，可以查看作用说明与伤害公式。"],
    ["挑战归墟天阶", "30 级后解锁归墟天阶。层数越高，煞印和天阶词缀越凶险，天阶法宝与道纪遗宝也越值得期待。"],
    ["安排神游历练", "离线前设置稳定层神游。神游不会突破最高层，最多累计 24 小时收益。"],
  ];
  return (
    <div className="modal-backdrop">
      <div className="modal tutorial-modal">
        <div className="modal-head">
          <div>
            <span className="eyebrow">玄曜界入门</span>
            <h2>新手指引</h2>
            <p>从唤醒应劫者到刷装冲层，按这个顺序走就不会迷路。</p>
          </div>
          <button onClick={onClose}>关闭</button>
        </div>
        <div className="tutorial-steps">
          {steps.map(([title, description], index) => (
            <section className="tutorial-step" key={title}>
              <strong>{index + 1}</strong>
              <div>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            </section>
          ))}
        </div>
        <button className="primary" onClick={onClose}>开始问道</button>
      </div>
    </div>
  );
}
