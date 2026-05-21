import { getDungeon } from "../../data/dungeons";
import { slotLabels } from "../../data/affixes";
import { getDungeonLootGroups } from "../../data/itemDatabase";
import { rarityColor } from "../../systems/lootSystem";
import { familyLabels } from "../labels";
import { ItemTooltip } from "./ItemTooltip";

export function DungeonLootModal({ dungeonId, onClose }: { dungeonId: string; onClose: () => void }) {
  const dungeon = getDungeon(dungeonId);
  const groups = getDungeonLootGroups(dungeonId);
  return (
    <div className="modal-backdrop">
      <div className="modal loot-modal">
        <div className="modal-head">
          <div>
            <span className="eyebrow">{familyLabels[dungeon.family]}</span>
            <h2>{dungeon.name}掉落</h2>
            <p className="muted">按掉落来源归类。悬停法器可查看属性、词缀和机制。</p>
          </div>
          <button onClick={onClose}>关闭</button>
        </div>
        <div className="loot-source-list">
          {groups.map((group) => (
            <section className="loot-source-group" key={group.sourceName}>
              <div className="loot-source-head">
                <strong>{group.sourceName}</strong>
                <span>{group.sourceType}</span>
              </div>
              <div className="loot-preview-grid">
                {group.items.map((item) => (
                  <article className="loot-preview-item item-hover-scope" key={item.id} style={{ borderLeftColor: rarityColor(item.rarity) }}>
                    <strong>{item.name}</strong>
                    <span>{slotLabels[item.slot]} · Lv.{item.itemLevelRange}</span>
                    <ItemTooltip databaseItem={item} />
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
