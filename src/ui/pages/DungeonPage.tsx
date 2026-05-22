import { useState } from "react";
import { allDungeons, familyTrashNames, getDungeon } from "../../data/dungeons";
import { getCurrentCharacter } from "../../systems/characterSystem";
import { isDungeonUnlocked } from "../../systems/contentUnlockSystem";
import { DungeonLootModal } from "../components/DungeonLootModal";
import { familyLabels } from "../labels";
import type { PageProps } from "../pageTypes";

export function DungeonPage({ save, setPage }: PageProps) {
  const character = getCurrentCharacter(save);
  const completed = new Set(character?.completedDungeons ?? []);
  const [lootDungeonId, setLootDungeonId] = useState<string>();
  const lootDungeon = lootDungeonId ? getDungeon(lootDungeonId) : undefined;
  return (
    <>
      <section className="dungeon-grid">
        {allDungeons.map((dungeon) => {
          const unlocked = character ? isDungeonUnlocked(character, dungeon) : false;
          return (
          <article className={`dungeon-card ${unlocked ? "" : "locked"}`} key={dungeon.id}>
            <div className="dungeon-card-head">
              <div>
                <span className="eyebrow">{familyLabels[dungeon.family]}</span>
                <h3>{dungeon.name}</h3>
                <p>推荐等级 {dungeon.recommendedLevel[0]}-{dungeon.recommendedLevel[1]} · 劫主：{dungeon.bossName}</p>
                {dungeon.rewardTags && <p className="muted">{dungeon.rewardTags.join(" / ")}</p>}
              </div>
              <span className={completed.has(dungeon.id) ? "badge ok" : "badge"}>{completed.has(dungeon.id) ? "已通关" : unlocked ? "可挑战" : "未解锁"}</span>
            </div>
            <div className="monster-strip">
              {familyTrashNames[dungeon.family].slice(0, 4).map((name) => <span key={name}>{name}</span>)}
            </div>
            <div className="card-actions">
              <button onClick={() => setLootDungeonId(dungeon.id)}>查看掉落</button>
              <button disabled={!unlocked} onClick={() => setPage("battle")}>前往战斗</button>
            </div>
          </article>
          );
        })}
      </section>
      {lootDungeon && <DungeonLootModal dungeonId={lootDungeon.id} onClose={() => setLootDungeonId(undefined)} />}
    </>
  );
}
