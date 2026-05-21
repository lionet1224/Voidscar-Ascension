import { equipmentSlots, slotLabels } from "../../data/affixes";
import type { Character, Item } from "../../types";
import { getCharacterInventory, getCurrentCharacter } from "../../systems/characterSystem";
import { itemScore, rarityColor, salvageItem } from "../../systems/lootSystem";
import { ItemTooltip } from "../components/ItemTooltip";
import { NoCharacter } from "../components/common";
import type { PageProps } from "../pageTypes";

export function InventoryPage({ save, mutate }: PageProps) {
  const character = getCurrentCharacter(save);
  if (!character) return <NoCharacter />;
  const inventory = getCharacterInventory(save, character);
  const equip = (item: Item) => {
    mutate((draft) => ({
      ...draft,
      characters: draft.characters.map((entry) => (entry.id === character.id ? { ...entry, equipment: { ...entry.equipment, [item.slot]: item.id } } : entry)),
    }));
  };
  const salvage = (item: Item) => {
    mutate((draft) => {
      const current = draft.characters.find((entry) => entry.id === character.id);
      if (!current) return draft;
      const gained = salvageItem(item);
      const materials = { ...current.materials };
      Object.entries(gained).forEach(([key, value]) => (materials[key] = (materials[key] ?? 0) + value));
      return {
        ...draft,
        characters: draft.characters.map((entry) => ({
          ...entry,
          materials: entry.id === character.id ? materials : entry.materials,
          inventory: entry.id === character.id ? entry.inventory.filter((owned) => owned.id !== item.id) : entry.inventory,
          equipment: entry.id === character.id ? Object.fromEntries(Object.entries(entry.equipment).map(([slot, id]) => [slot, id === item.id ? null : id])) as Character["equipment"] : entry.equipment,
        })),
      };
    });
  };
  return (
    <div className="inventory-layout">
      <section className="panel">
        <h2>法器栏</h2>
        <div className="equipment-grid">
          {equipmentSlots.map((slot) => {
            const item = inventory.find((entry) => entry.id === character.equipment[slot]);
            return (
              <div className="equipment-slot item-hover-scope" key={slot}>
                <span>{slotLabels[slot]}</span>
                <strong>{item?.name ?? "空"}</strong>
                {item && <ItemTooltip item={item} />}
              </div>
            );
          })}
        </div>
      </section>
      <section className="panel">
        <h2>背包</h2>
        <div className="item-list">
          {inventory.map((item) => (
            <article className="loot-row item-hover-scope" key={item.id} style={{ borderLeftColor: rarityColor(item.rarity) }}>
              <div>
                <strong>{item.name}</strong>
                <p>{slotLabels[item.slot]} · 装等 {item.itemLevel} · 评分 {itemScore(item)} · {item.prefixes.concat(item.suffixes).map((affix) => affix.name).join(" / ")}</p>
              </div>
              <button onClick={() => equip(item)}>佩戴</button>
              <button onClick={() => salvage(item)}>分解</button>
              <ItemTooltip item={item} compareTo={inventory.find((entry) => entry.id === character.equipment[item.slot])} />
            </article>
          ))}
          {!inventory.length && <p className="muted">还没有法器。完成秘境推演后会获得掉落。</p>}
        </div>
      </section>
    </div>
  );
}
