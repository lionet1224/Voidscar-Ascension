import { useState } from "react";
import { equipmentSlots, slotLabels } from "../../data/affixes";
import type { Character, Item } from "../../types";
import { getCharacterInventory, getCurrentCharacter, isCurrentSeasonCharacter, upgradeBonus } from "../../systems/characterSystem";
import { itemScore, rarityColor, salvageItem } from "../../systems/lootSystem";
import { ItemTooltip } from "../components/ItemTooltip";
import { NoCharacter } from "../components/common";
import type { PageProps } from "../pageTypes";

const materialLabels: Record<string, string> = {
  spirit_stone: "灵石",
  black_iron: "玄铁",
  spirit_jade: "灵玉",
  star_sand: "星砂",
  artifact_core: "器魂",
  voidscar_shard: "归墟残片",
  fireseed: "劫火种",
};

const upgradeCosts: Record<number, Record<string, number>> = {
  0: { black_iron: 2, spirit_stone: 120 },
  1: { black_iron: 4, spirit_stone: 220 },
  2: { black_iron: 7, spirit_stone: 360 },
  3: { black_iron: 10, spirit_stone: 520 },
  4: { spirit_jade: 6, spirit_stone: 780 },
  5: { spirit_jade: 10, spirit_stone: 1050 },
  6: { spirit_jade: 14, star_sand: 6, spirit_stone: 1400 },
  7: { star_sand: 12, artifact_core: 1, spirit_stone: 1900 },
  8: { star_sand: 20, artifact_core: 2, voidscar_shard: 8, spirit_stone: 2600 },
  9: { artifact_core: 3, voidscar_shard: 16, fireseed: 1, spirit_stone: 3600 },
};

export function InventoryPage({ save, mutate }: PageProps) {
  const [selectedItemId, setSelectedItemId] = useState<string>();
  const character = getCurrentCharacter(save);
  if (!character) return <NoCharacter />;
  const inventory = getCharacterInventory(save, character);
  const readonly = !isCurrentSeasonCharacter(character);
  const equippedItemIds = new Set(Object.values(character.equipment).filter(Boolean));
  const backpackItems = inventory.filter((item) => !equippedItemIds.has(item.id));
  const selectedItem = inventory.find((item) => item.id === selectedItemId) ?? inventory.find((item) => equippedItemIds.has(item.id)) ?? inventory[0];
  const selectedCost = selectedItem ? upgradeCosts[selectedItem.upgradeLevel] : undefined;
  const canAffordSelected = selectedCost ? canAfford(character, selectedCost) : false;
  const equip = (item: Item) => {
    if (readonly) return;
    mutate((draft) => ({
      ...draft,
      characters: draft.characters.map((entry) => (entry.id === character.id ? { ...entry, equipment: { ...entry.equipment, [item.slot]: item.id } } : entry)),
    }));
  };
  const salvage = (item: Item) => {
    if (readonly) return;
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
  const upgrade = (item: Item) => {
    if (readonly || item.upgradeLevel >= 10) return;
    const cost = upgradeCosts[item.upgradeLevel];
    if (!cost || !canAfford(character, cost)) return;
    mutate((draft) => {
      const current = draft.characters.find((entry) => entry.id === character.id);
      if (!current) return draft;
      const materials = { ...current.materials };
      Object.entries(cost).forEach(([key, value]) => (materials[key] = Math.max(0, (materials[key] ?? 0) - value)));
      const upgradeOwned = (owned: Item) => (owned.id === item.id ? { ...owned, upgradeLevel: Math.min(10, owned.upgradeLevel + 1) } : owned);
      return {
        ...draft,
        inventory: draft.inventory.map(upgradeOwned),
        characters: draft.characters.map((entry) =>
          entry.id === character.id
            ? {
                ...entry,
                materials,
                inventory: entry.inventory.map(upgradeOwned),
              }
            : entry,
        ),
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
              <div
                className={`equipment-slot item-hover-scope ${item && selectedItem?.id === item.id ? "selected" : ""}`}
                key={slot}
                onClick={() => item && setSelectedItemId(item.id)}
              >
                <span>{slotLabels[slot]}</span>
                <strong>{item?.name ?? "空"}</strong>
                {item && <em className="upgrade-badge">+{item.upgradeLevel}</em>}
                {item && <ItemTooltip item={item} />}
              </div>
            );
          })}
        </div>
      </section>
      <section className="panel enhance-panel">
        <h2>炼器强化</h2>
        {selectedItem ? (
          <>
            <div className="enhance-target item-hover-scope" style={{ borderLeftColor: rarityColor(selectedItem.rarity) }}>
              <div>
                <strong>{selectedItem.name}</strong>
                <p>{slotLabels[selectedItem.slot]} · 装等 {selectedItem.itemLevel} · 评分 {itemScore(selectedItem)}</p>
              </div>
              <span className="upgrade-badge large">+{selectedItem.upgradeLevel}</span>
              <ItemTooltip item={selectedItem} />
            </div>
            <div className="enhance-meter">
              <span>当前基础属性增幅</span>
              <strong>{formatPercent(upgradeBonus(selectedItem.upgradeLevel))}</strong>
              <span>{selectedItem.upgradeLevel >= 10 ? "已臻满阶" : `下阶 ${formatPercent(upgradeBonus(selectedItem.upgradeLevel + 1))}`}</span>
            </div>
            {selectedCost ? (
              <div className="material-cost-list">
                {Object.entries(selectedCost).map(([id, amount]) => {
                  const owned = character.materials[id] ?? 0;
                  return (
                    <span className={`cost-chip ${owned < amount ? "missing" : ""}`} key={id}>
                      {materialLabels[id] ?? id} {owned}/{amount}
                    </span>
                  );
                })}
              </div>
            ) : (
              <p className="muted">此法器已经强化至十重，器纹圆满。</p>
            )}
            <button className="primary" disabled={readonly || !selectedCost || !canAffordSelected} onClick={() => upgrade(selectedItem)}>
              {readonly ? "旧纪道影不可改动" : selectedItem.upgradeLevel >= 10 ? "已达满阶" : `强化至 +${selectedItem.upgradeLevel + 1}`}
            </button>
          </>
        ) : (
          <p className="muted">选择一件法器后，可在此消耗炼器材料提升基础属性。</p>
        )}
      </section>
      <section className="panel">
        <h2>背包</h2>
        {readonly && <p className="muted">旧纪道影为只读状态，法器只能回看，不能佩戴、分解或改动。</p>}
        <div className="item-list">
          {backpackItems.map((item) => (
            <article
              className={`loot-row ${selectedItem?.id === item.id ? "selected" : ""}`}
              key={item.id}
              style={{ borderLeftColor: rarityColor(item.rarity) }}
              onClick={() => setSelectedItemId(item.id)}
            >
              <div className="item-hover-scope">
                <div className="item-row-title">
                  <strong>{item.name}</strong>
                  <span className="upgrade-badge">+{item.upgradeLevel}</span>
                </div>
                <p>{slotLabels[item.slot]} · 装等 {item.itemLevel} · 评分 {itemScore(item)} · {item.prefixes.concat(item.suffixes).map((affix) => affix.name).join(" / ")}</p>
                <ItemTooltip item={item} compareTo={inventory.find((entry) => entry.id === character.equipment[item.slot])} />
              </div>
              <button disabled={readonly} onClick={(event) => { event.stopPropagation(); equip(item); }}>佩戴</button>
              <button disabled={readonly} onClick={(event) => { event.stopPropagation(); salvage(item); }}>分解</button>
            </article>
          ))}
          {!backpackItems.length && (
            <p className="muted">
              {inventory.length ? "背包中没有闲置法器。已佩戴的法器会收在法器栏中。" : "还没有法器。击败秘境或天阶中的劫煞时，就有机会掉落法器。"}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

function canAfford(character: Character, cost: Record<string, number>) {
  return Object.entries(cost).every(([key, value]) => (character.materials[key] ?? 0) >= value);
}

function formatPercent(value: number) {
  return `+${Math.round(value * 100)}%`;
}
