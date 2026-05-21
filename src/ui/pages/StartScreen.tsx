import { BookOpenText, CircleHelp, CirclePlay, ScrollText } from "lucide-react";
import { gameConfig } from "../../data/gameConfig";
import { CURRENT_VERSION, currentSeasonDefinition } from "../../data/seasons";
import { patchNotes } from "../../data/patchNotes";

export function StartScreen({
  characterCount,
  onStart,
  onPatchNotes,
  onTutorial,
}: {
  characterCount: number;
  onStart: () => void;
  onPatchNotes: () => void;
  onTutorial: () => void;
}) {
  const latestPatch = patchNotes[0];
  return (
    <main className="start-screen">
      <div className="start-vignette" />
      <section className="start-content" aria-label="游戏首页">
        <div className="start-brand">
          <div className="start-logo-mark">墟</div>
          <div>
            <span>{gameConfig.worldName}</span>
            <h1>{gameConfig.name}</h1>
            <strong>Voidscar Ascension</strong>
          </div>
        </div>

        <div className="start-copy">
          <span className="start-season">{currentSeasonDefinition.name}</span>
          <p>劫火初燃，归墟复现。编排战诀、刷取法宝、神游历练，在第一道纪的天阶尽头镇压赤霄旧祖。</p>
        </div>

        <div className="start-actions">
          <button className="start-primary" onClick={onStart}>
            <CirclePlay size={20} />
            {characterCount > 0 ? "开始游戏" : "创建应劫者"}
          </button>
          <button className="start-secondary" onClick={onPatchNotes}>
            <ScrollText size={18} />
            更新日志
          </button>
          <button className="start-secondary" onClick={onTutorial}>
            <CircleHelp size={18} />
            新手指引
          </button>
        </div>

        <div className="start-status">
          <div>
            <span>版本</span>
            <strong>{CURRENT_VERSION}</strong>
          </div>
          <div>
            <span>存档</span>
            <strong>{characterCount ? `${characterCount} 名应劫者` : "尚未创建"}</strong>
          </div>
          <div>
            <span>最新札记</span>
            <strong>{latestPatch.version}</strong>
          </div>
        </div>
      </section>

      <aside className="start-patch-card">
        <div className="start-patch-card-head">
          <BookOpenText size={20} />
          <div>
            <span>天机札记</span>
            <h2>历代更新</h2>
          </div>
        </div>
        <div className="start-patch-list">
          {patchNotes.map((note) => (
            <article className="start-patch-entry" key={note.version}>
              <small>{note.date} · {note.version}</small>
              <strong>{note.title}</strong>
              <p>{note.highlights.join(" / ")}</p>
            </article>
          ))}
        </div>
      </aside>
    </main>
  );
}
