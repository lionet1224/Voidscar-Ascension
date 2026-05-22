import { useEffect, useState } from "react";
import { CirclePlay } from "lucide-react";
import { allDungeons } from "../../data/dungeons";
import { rarityLabels } from "../../data/affixes";
import { createCombatSession } from "../../combat/combatEngine";
import type { CombatSession } from "../../combat/combatTypes";
import { getCharacterInventory, getCurrentCharacter, isCurrentSeasonCharacter } from "../../systems/characterSystem";
import { clampRiftTier, getMaxChallengeRiftTier, getUnlockedDungeons, isDungeonUnlocked } from "../../systems/contentUnlockSystem";
import { formatNumber } from "../../systems/id";
import { rarityColor } from "../../systems/lootSystem";
import { ItemTooltip } from "../components/ItemTooltip";
import { BattleCanvas, ActorStatusPanel, SkillBreakdown, SkillCooldownBar, getSelectedActor } from "../components/BattleWidgets";
import { NoCharacter, Stat } from "../components/common";
import { battleStateLabels } from "../labels";
import type { PageProps } from "../pageTypes";

export function BattlePage({ save, getBattleSession, setBattleSession, selectedActorId, setSelectedActorId }: PageProps) {
  const character = getCurrentCharacter(save);
  const [mode, setMode] = useState<"normal" | "rift">("normal");
  const [dungeonId, setDungeonId] = useState(allDungeons[0].id);
  const [riftTier, setRiftTier] = useState(Math.max(1, (character?.highestRiftTier ?? 0) + 1));
  const [session, setSessionView] = useState<CombatSession | undefined>(() => getBattleSession());

  useEffect(() => {
    setSessionView(getBattleSession());
    const handle = window.setInterval(() => setSessionView(getBattleSession()), 500);
    return () => window.clearInterval(handle);
  }, [getBattleSession]);

  useEffect(() => {
    if (!character) return;
    const unlocked = getUnlockedDungeons(character);
    if (unlocked.length && !unlocked.some((dungeon) => dungeon.id === dungeonId)) setDungeonId(unlocked[0].id);
    setRiftTier(clampRiftTier(character, riftTier));
  }, [character?.id, character?.level, character?.completedDungeons.join(","), character?.highestRiftTier]);

  if (!character) return <NoCharacter />;
  const playable = isCurrentSeasonCharacter(character);
  const unlockedDungeons = getUnlockedDungeons(character);
  const selectedDungeon = allDungeons.find((dungeon) => dungeon.id === dungeonId) ?? unlockedDungeons[0] ?? allDungeons[0];
  const canRunDungeon = isDungeonUnlocked(character, selectedDungeon);
  const maxRiftTier = getMaxChallengeRiftTier(character);
  const selectedRiftTier = clampRiftTier(character, riftTier);
  const start = () => {
    if (!playable || (mode === "normal" && !canRunDungeon) || (mode === "rift" && maxRiftTier <= 0)) return;
    setSelectedActorId("player");
    const next = createCombatSession({ character, inventory: getCharacterInventory(save, character), dungeonId: selectedDungeon.id, riftTier: mode === "rift" ? selectedRiftTier : undefined });
    setBattleSession(next);
    setSessionView(next);
  };
  return (
    <div className="battle-layout">
      <section className="panel battle-panel">
        <div className="battle-toolbar">
          <div className="segmented">
            <button className={mode === "normal" ? "active" : ""} onClick={() => setMode("normal")}>洞天秘境</button>
            <button className={mode === "rift" ? "active" : ""} onClick={() => setMode("rift")}>归墟天阶</button>
          </div>
          {mode === "normal" ? (
            <select value={dungeonId} onChange={(event) => setDungeonId(event.target.value)}>
              {unlockedDungeons.map((dungeon) => <option key={dungeon.id} value={dungeon.id}>{dungeon.kind === "material" ? "材料 · " : ""}{dungeon.name}</option>)}
            </select>
          ) : (
            <input type="number" min={1} max={maxRiftTier || 1} value={selectedRiftTier} onChange={(event) => setRiftTier(clampRiftTier(character, Number(event.target.value)))} />
          )}
          <button className="primary" disabled={!playable || (mode === "normal" && !canRunDungeon) || (mode === "rift" && maxRiftTier <= 0)} onClick={start}><CirclePlay size={17} /> 开始</button>
        </div>
        {!playable && <p className="muted">旧纪道影不能进入秘境、天阶或神游，只能回看历史信息。</p>}
        {mode === "rift" && maxRiftTier <= 0 && <p className="muted">归墟天阶需要达到 30 级并通关断剑荒冢。</p>}
        <BattleCanvas getSession={getBattleSession} onSelectActor={setSelectedActorId} />
        <SkillCooldownBar session={session} />
      </section>
      <section className="panel live-stats">
        <h2>实时统计</h2>
        {session ? (
          <>
            <Stat title="状态" value={battleStateLabels[session.state]} />
            <Stat title="进度" value={`${Math.floor(session.progress)}%`} />
            <Stat title="击杀" value={`${session.kills}`} />
            <Stat title="本轮经验" value={formatNumber(session.expEarned)} />
            <Stat title="总伤害" value={formatNumber(session.stats.totalDamage)} />
            <section className="live-drop-list">
              <div className="live-drop-head">
                <strong>本次掉落</strong>
                <span>{session.droppedItems.length} 件</span>
              </div>
              {session.droppedItems.length ? (
                session.droppedItems.slice(-6).reverse().map((item) => (
                  <article className="live-drop-item item-hover-scope" key={item.id} style={{ borderLeftColor: rarityColor(item.rarity) }}>
                    <span>{item.name}</span>
                    <small>{rarityLabels[item.rarity]} · 装等 {item.itemLevel}</small>
                    <ItemTooltip item={item} />
                  </article>
                ))
              ) : (
                <p className="muted">击败劫煞时会即时掷出法器，结算时统一收入背包或自动分解。</p>
              )}
            </section>
            <ActorStatusPanel actor={getSelectedActor(session, selectedActorId)} />
            <SkillBreakdown session={session} />
          </>
        ) : (
          <p className="muted">启动推演后这里会显示秒伤、战诀占比、召唤物贡献和承伤。</p>
        )}
      </section>
    </div>
  );
}
