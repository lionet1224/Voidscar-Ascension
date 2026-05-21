import { rarityLabels, slotLabels } from "../../data/affixes";
import type { ItemDatabaseEntry } from "../../data/itemDatabase";
import { itemScore, rarityColor } from "../../systems/lootSystem";
import type { Item } from "../../types";

export function ItemTooltip({ item, databaseItem, compareTo }: { item?: Item; databaseItem?: ItemDatabaseEntry; compareTo?: Item }) {
  if (databaseItem) return <DatabaseItemTooltip item={databaseItem} />;
  if (!item) return null;
  const score = itemScore(item);
  const compareScore = compareTo ? itemScore(compareTo) : undefined;
  const delta = compareScore === undefined ? undefined : score - compareScore;
  const affixes = [...item.prefixes, ...item.suffixes];
  return (
    <div className="item-tooltip">
      <div className="tooltip-head">
        <strong>{item.name}</strong>
        <span style={{ color: rarityColor(item.rarity) }}>{rarityLabels[item.rarity]}</span>
      </div>
      <div className="tooltip-grid">
        <span>部位</span><b>{slotLabels[item.slot]}</b>
        <span>装等</span><b>{item.itemLevel}</b>
        <span>评分</span><b>{score}{delta !== undefined && <em className={delta >= 0 ? "positive" : "negative"}>{delta >= 0 ? ` +${delta}` : ` ${delta}`}</em>}</b>
        <span>强化</span><b>+{item.upgradeLevel}</b>
      </div>
      <div className="tooltip-section">
        <span>基础属性</span>
        {Object.entries(item.implicitStats).map(([key, value]) => <p key={key}>{statLabel(key)} +{formatStatValue(value)}</p>)}
      </div>
      {affixes.length > 0 && (
        <div className="tooltip-section">
          <span>词缀</span>
          {affixes.map((affix) => <p key={affix.id}>{affix.name}：{affix.description}</p>)}
        </div>
      )}
      {item.legendaryPower && <p className="legend-line">{item.legendaryPower.name}：{item.legendaryPower.description}</p>}
      {item.seasonalPower && <p className="legend-line">{item.seasonalPower.name}：{item.seasonalPower.description}</p>}
      {compareTo && (
        <div className="compare-box">
          <span>当前佩戴</span>
          <strong>{compareTo.name}</strong>
          <p>评分 {compareScore} · {delta !== undefined && (delta >= 0 ? "提升" : "降低")} {Math.abs(delta ?? 0)}</p>
        </div>
      )}
    </div>
  );
}

function DatabaseItemTooltip({ item }: { item: ItemDatabaseEntry }) {
  return (
    <div className="item-tooltip preview-tooltip">
      <div className="tooltip-head">
        <strong>{item.name}</strong>
        <span style={{ color: rarityColor(item.rarity) }}>{rarityLabels[item.rarity]}</span>
      </div>
      <p className="tooltip-description">{item.description}</p>
      <div className="tooltip-grid">
        <span>来源</span><b>{item.sourceName}</b>
        <span>部位</span><b>{slotLabels[item.slot]}</b>
        <span>装等</span><b>{item.itemLevelRange}</b>
      </div>
      <div className="tooltip-section">
        <span>基础属性</span>
        {item.stats.map((stat) => <p key={stat}>{stat}</p>)}
      </div>
      <div className="tooltip-section">
        <span>核心词缀</span>
        {item.affixes.map((affix) => <p key={affix}>{affix}</p>)}
      </div>
      <p className="legend-line">{item.mechanism}</p>
    </div>
  );
}

function statLabel(key: string) {
  return {
    attackPower: "攻击",
    armor: "护甲",
    maxHp: "生命",
    moveSpeed: "移速",
    resourceRegen: "灵元回复",
    critChance: "暴击",
    damageBonus: "伤害",
  }[key] ?? key;
}

function formatStatValue(value: unknown) {
  if (typeof value !== "number") return String(value);
  if (Math.abs(value) < 1) return `${Math.round(value * 100)}%`;
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}
