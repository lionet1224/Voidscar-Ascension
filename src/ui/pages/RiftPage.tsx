import { eliteAffixes, riftPower } from "../../data/dungeons";
import { getCurrentCharacter, isCurrentSeasonCharacter } from "../../systems/characterSystem";
import { formatNumber } from "../../systems/id";
import { NoCharacter } from "../components/common";
import type { PageProps } from "../pageTypes";

export function RiftPage({ save, mutate, setPage }: PageProps) {
  const character = getCurrentCharacter(save);
  if (!character) return <NoCharacter />;
  const stable = Math.max(0, character.highestRiftTier - 2);
  const canUnlock = character.level >= 30 || character.completedDungeons.includes("domain_broken_sword_barrow");
  const playable = isCurrentSeasonCharacter(character);
  return (
    <div className="page-grid">
      <section className="panel hero-panel">
        <div>
          <span className="eyebrow">终局玩法</span>
          <h1>归墟天阶</h1>
          <p>最高 {character.highestRiftTier} 层 · 稳定神游 {stable} 层 · 下一层推荐战力 {formatNumber(riftPower(character.highestRiftTier + 1))}</p>
        </div>
        <button className="primary" disabled={!canUnlock || !playable} onClick={() => setPage("battle")}>挑战下一层</button>
      </section>
      <section className="panel">
        <h2>神游历练</h2>
        <p className="muted">神游只允许推演稳定层，不能创造新纪录，最多累计 24 小时收益。</p>
        <div className="drop-details">
          <div><span>高层追加</span><strong>{eliteAffixes.slice(0, 5).join(" / ")}</strong></div>
          <div><span>主要奖励</span><strong>天阶法宝、道纪遗宝、归墟残片、劫火种</strong></div>
        </div>
        <button
          disabled={stable <= 0 || !playable}
          onClick={() =>
            mutate((draft) => ({
              ...draft,
              idleFarmConfig: {
                enabled: true,
                characterId: character.id,
                dungeonType: "rift",
                riftTier: stable,
                skillProfileId: character.skillLoadout.activeProfileId,
                lootFilterId: draft.lootFilters[0].id,
                autoSalvage: true,
                autoSalvageRarityBelow: "rare",
                keepLegendary: true,
                keepSeasonItems: true,
                startedAt: Date.now(),
                lastClaimAt: Date.now(),
              },
            }))
          }
        >
          设置为神游层 {stable}
        </button>
      </section>
      <section className="panel">
        <h2>机制解锁</h2>
        <div className="table-like">
          {[1, 5, 10, 15, 20, 30, 40, 50, 60, 80, 100].map((tier) => (
            <div key={tier}><span>{tier} 层</span><strong>{tier >= 60 ? "精英 3 煞印" : tier >= 20 ? "精英 2 煞印" : tier >= 5 ? "精英煞印" : "普通劫煞"}</strong></div>
          ))}
        </div>
      </section>
    </div>
  );
}
