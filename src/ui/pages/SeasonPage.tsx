import { currentSeasonDefinition } from "../../data/seasons";
import { getCurrentCharacter, isCurrentSeasonCharacter } from "../../systems/characterSystem";
import { formatNumber } from "../../systems/id";
import { Metric, NoCharacter } from "../components/common";
import { seasonCategoryLabels } from "../labels";
import type { PageProps } from "../pageTypes";

export function SeasonPage({ save, mutate }: PageProps) {
  const character = getCurrentCharacter(save);
  if (!character) return <NoCharacter />;
  const playable = isCurrentSeasonCharacter(character);
  const characterSeason = save.seasons.find((season) => season.id === character.seasonId);
  return (
    <div className="page-stack">
      <section className="panel hero-panel">
        <div>
          <span className="eyebrow">{playable ? currentSeasonDefinition.shortName : "旧纪道影"}</span>
          <h1>{playable ? currentSeasonDefinition.name : characterSeason?.name ?? character.seasonId}</h1>
          <p>{playable ? currentSeasonDefinition.description : "该应劫者来自旧赛季，当前仅保留归档资料、历史法印、战诀、法器和道痕记录，不再参与当前道纪成长。"}</p>
        </div>
        <Metric label="劫火残烬" value={formatNumber(character.seasonEmbers)} />
      </section>
      {playable ? (
        <section className="panel season-config-grid">
          <div>
            <h2>道纪机制</h2>
            {currentSeasonDefinition.mechanics.map((entry) => (
              <article className="config-row" key={entry.id}>
                <strong>{entry.name}</strong>
                <p>{entry.description}</p>
                <span>{entry.trigger}：{entry.effect}</span>
              </article>
            ))}
          </div>
          <div>
            <h2>道纪遗宝</h2>
            {currentSeasonDefinition.equipmentMechanics.map((entry) => (
              <article className="config-row" key={entry.id}>
                <strong>{entry.name}</strong>
                <p>{entry.description}</p>
                <span>{entry.affixTags.join(" / ")}</span>
              </article>
            ))}
          </div>
          <div>
            <h2>道纪玩法</h2>
            {currentSeasonDefinition.activities.map((entry) => (
              <article className="config-row" key={entry.id}>
                <strong>{entry.name}</strong>
                <p>{entry.description}</p>
                <span>{entry.unlockHint}</span>
              </article>
            ))}
          </div>
        </section>
      ) : (
        <section className="panel season-config-grid">
          <div>
            <h2>归档赛季</h2>
            <article className="config-row">
              <strong>{characterSeason?.name ?? character.seasonId}</strong>
              <p>赛季 ID：{character.seasonId}</p>
              <span>状态：只读归档</span>
            </article>
          </div>
          <div>
            <h2>保留资料</h2>
            <article className="config-row">
              <strong>旧纪道影</strong>
              <p>等级、装备、战诀、法印、最高天阶和道痕记录均保留展示。</p>
              <span>秘境、天阶、神游、装备与战诀修改均已禁用。</span>
            </article>
          </div>
          <div>
            <h2>历史法印</h2>
            <article className="config-row">
              <strong>{character.seasonPowers.length} 个节点</strong>
              <p>仅显示该角色存档中保存的法印节点，不自动套用当前赛季法印树。</p>
              <span>新赛季数据不会改写旧法印。</span>
            </article>
          </div>
        </section>
      )}
      <section className="power-grid">
        {!playable && (
          <article className="power-node">
            <div>
              <span className="badge">旧纪道影</span>
              <h3>只读归档</h3>
              <p>旧赛季角色不能升级当前道纪法印，也不会被新赛季数值继续改写。</p>
            </div>
          </article>
        )}
        {character.seasonPowers.map((power) => (
          <article className="power-node" key={power.id}>
            <div>
              <span className={`badge ${power.category}`}>{seasonCategoryLabels[power.category]}</span>
              <h3>{power.name}</h3>
              <p>{power.description}</p>
            </div>
            <div className="node-actions">
              <strong>{power.level}/{power.maxLevel}</strong>
              <button
                disabled={!playable || power.level >= power.maxLevel || character.seasonEmbers < power.costPerLevel}
                onClick={() =>
                  mutate((draft) => ({
                    ...draft,
                    characters: draft.characters.map((entry) =>
                      entry.id === character.id
                        ? {
                            ...entry,
                            seasonEmbers: entry.seasonEmbers - power.costPerLevel,
                            seasonPowers: entry.seasonPowers.map((node) => (node.id === power.id ? { ...node, level: node.level + 1 } : node)),
                          }
                        : entry,
                    ),
                  }))
                }
              >
                升级 {power.costPerLevel}
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
