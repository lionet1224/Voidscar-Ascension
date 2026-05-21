import { useEffect, useState } from "react";
import { classNames } from "../../data/classes";
import type { CombatSession } from "../../combat/combatTypes";
import type { Character, Item } from "../../types";
import { calculateCharacterPower, expToNext } from "../../systems/characterSystem";
import { formatNumber } from "../../systems/id";
import { battleStateLabels } from "../labels";
import type { PageId } from "../pageTypes";

export function CharacterTopSummary({ character, inventory }: { character: Character; inventory: Item[] }) {
  const nextExp = expToNext(character.level);
  const expPercent = Math.min(100, Math.floor((character.exp / nextExp) * 100));
  const power = calculateCharacterPower(character, inventory);
  return (
    <div className="top-character-card">
      <div>
        <strong>{character.name}</strong>
        <span>{classNames[character.classId]} · Lv.{character.level} · 战力 {formatNumber(power)}</span>
      </div>
      <div className="top-exp">
        <i style={{ width: `${expPercent}%` }} />
      </div>
      <small>{formatNumber(character.exp)} / {formatNumber(nextExp)} 经验</small>
    </div>
  );
}

export function FloatingBattlePanel({ getBattleSession, setPage }: { getBattleSession: () => CombatSession | undefined; setPage: (page: PageId) => void }) {
  const [session, setSession] = useState<CombatSession | undefined>(() => getBattleSession());
  useEffect(() => {
    const handle = window.setInterval(() => setSession(getBattleSession()), 300);
    return () => window.clearInterval(handle);
  }, [getBattleSession]);
  if (!session || (session.state !== "running" && session.state !== "bossSpawned")) return null;
  const hpPercent = Math.max(0, Math.min(100, (session.player.hp / session.player.maxHp) * 100));
  const resourcePercent = Math.max(0, Math.min(100, (session.player.resource / session.player.maxResource) * 100));
  return (
    <aside className="floating-battle-panel">
      <div>
        <strong>{session.contentName}</strong>
        <span>{battleStateLabels[session.state]} · {Math.floor(session.progress)}% · 击杀 {session.kills}</span>
      </div>
      <div className="mini-bar hp"><i style={{ width: `${hpPercent}%` }} /></div>
      <div className="mini-bar resource"><i style={{ width: `${resourcePercent}%` }} /></div>
      <button onClick={() => setPage("battle")}>查看推演</button>
    </aside>
  );
}
