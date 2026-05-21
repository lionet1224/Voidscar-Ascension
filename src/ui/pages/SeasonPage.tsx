import { currentSeasonDefinition } from "../../data/seasons";
import { getCurrentCharacter } from "../../systems/characterSystem";
import { formatNumber } from "../../systems/id";
import { Metric, NoCharacter } from "../components/common";
import { seasonCategoryLabels } from "../labels";
import type { PageProps } from "../pageTypes";

export function SeasonPage({ save, mutate }: PageProps) {
  const character = getCurrentCharacter(save);
  if (!character) return <NoCharacter />;
  return (
    <div className="page-stack">
      <section className="panel hero-panel">
        <div>
          <span className="eyebrow">{currentSeasonDefinition.shortName}</span>
          <h1>{currentSeasonDefinition.name}</h1>
          <p>{currentSeasonDefinition.description}</p>
        </div>
        <Metric label="劫火残烬" value={formatNumber(character.seasonEmbers)} />
      </section>
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
      <section className="power-grid">
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
                disabled={power.level >= power.maxLevel || character.seasonEmbers < power.costPerLevel}
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
