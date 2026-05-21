import { prefixes, rarityLabels, slotLabels, suffixes } from "../../data/affixes";
import type { ItemDatabaseEntry } from "../../data/itemDatabase";
import { legendaryItems, seasonalRelics } from "../../data/seasonDataPack";
import { upgradeBonus } from "../../systems/characterSystem";
import { itemScore, rarityColor } from "../../systems/lootSystem";
import type { CharacterStats, Item, ItemAffix, ItemRarity } from "../../types";

const affixLookup = new Map([...prefixes, ...suffixes].map((affix) => [affix.name, affix]));
interface DatabaseSpecial {
  kind: "天阶法宝特效" | "道纪遗宝特效";
  name: string;
  description: string;
  stat: string;
  value: number;
}

const databaseSpecials = new Map<string, DatabaseSpecial>(
  [
    ...legendaryItems.map(([id, name, , , description, stat, value]) => [id, { kind: "天阶法宝特效", name, description, stat, value }] as const),
    ...seasonalRelics.map(([id, name, , description, stat, value]) => [id, { kind: "道纪遗宝特效", name, description, stat, value }] as const),
  ],
);

export function ItemTooltip({ item, databaseItem, compareTo }: { item?: Item; databaseItem?: ItemDatabaseEntry; compareTo?: Item }) {
  if (databaseItem) return <DatabaseItemTooltip item={databaseItem} />;
  if (!item) return null;
  const score = itemScore(item);
  const compareScore = compareTo ? itemScore(compareTo) : undefined;
  const delta = compareScore === undefined ? undefined : score - compareScore;
  const affixes = [...item.prefixes, ...item.suffixes];
  const currentUpgradeBonus = upgradeBonus(item.upgradeLevel);
  const nextUpgradeBonus = upgradeBonus(item.upgradeLevel + 1);
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
      {item.legendaryPower && (
        <div className="tooltip-section power-explain">
          <span>天阶法宝特效</span>
          <AffixLine affix={item.legendaryPower} tone="legendary" />
        </div>
      )}
      {item.seasonalPower && (
        <div className="tooltip-section power-explain seasonal-power">
          <span>道纪遗宝特效</span>
          <AffixLine affix={item.seasonalPower} tone="seasonal" />
        </div>
      )}
      {!item.legendaryPower && !item.seasonalPower && (
        <div className="tooltip-section compact-mechanism">
          <span>器机</span>
          <p>{itemMechanism(item)}</p>
        </div>
      )}
      {affixes.length > 0 && (
        <div className="tooltip-section affix-explain-list">
          <span>词缀</span>
          {affixes.map((affix) => <AffixLine key={affix.id} affix={affix} />)}
        </div>
      )}
      <div className="tooltip-section compact-stats">
        <span>基础</span>
        <p>
          {Object.entries(item.implicitStats)
            .map(([key, value]) => `${statLabel(key)} ${formatSignedStat(key, value)}`)
            .join(" / ")}
        </p>
      </div>
      <div className="tooltip-section compact-stats">
        <span>强化增幅</span>
        <p>
          基础属性 +{Math.round(currentUpgradeBonus * 100)}%
          {item.upgradeLevel >= 10 ? "，已臻满阶" : `，下阶 +${Math.round(nextUpgradeBonus * 100)}%`}
        </p>
      </div>
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
  const special = databaseSpecials.get(item.id);
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
        {item.affixes.map((affixName) => {
          const affix = affixLookup.get(affixName);
          return affix ? <AffixLine key={affixName} affix={affix} /> : <p key={affixName}>{affixName}</p>;
        })}
      </div>
      {special && (
        <div className={`tooltip-section power-explain ${item.rarity === "seasonalUnique" ? "seasonal-power" : ""}`}>
          <span>{special.kind}</span>
          <div className={`affix-line ${item.rarity === "seasonalUnique" ? "seasonal" : "legendary"}`}>
            <strong>{special.name}</strong>
            <p>{special.description}</p>
            <small>{statLabel(special.stat)} {formatSignedStat(special.stat, special.value)}</small>
          </div>
        </div>
      )}
      <div className="tooltip-section">
        <span>{item.rarity === "legendary" ? "天阶器铭" : item.rarity === "seasonalUnique" ? "道纪器铭" : "器铭"}</span>
        <p>{item.mechanism}</p>
      </div>
    </div>
  );
}

function AffixLine({ affix, tone }: { affix: ItemAffix; tone?: "legendary" | "seasonal" }) {
  const statText = formatAffixStats(affix);
  return (
    <div className={`affix-line ${tone ?? ""}`}>
      <strong>{affix.name}</strong>
      <p>{affix.description.replace(/[。.]$/, "")}</p>
      {statText && <small>{statText}</small>}
    </div>
  );
}

function itemLore(item: Item) {
  const slotName = slotLabels[item.slot];
  if (item.seasonalPower) {
    return `${item.baseName}染有第一道纪的赤霄余烬，${slotName}之上有火纹自生自灭。执此遗宝时，仿佛能听见旧宗门在天劫中立誓的回声。`;
  }
  if (item.legendaryPower) {
    return `${item.baseName}曾随天阶高修越过归墟裂痕，器身仍留有星火与煞风磨出的暗纹。灵光不喧，却自有镇压旧劫的威仪。`;
  }
  if (item.rarity === "epic") {
    return `${item.baseName}由地脉玄光温养而成，${slotName}内侧刻有细若游丝的道篆。每逢劫火近身，篆纹便会泛起沉静金辉。`;
  }
  if (item.rarity === "rare") {
    return `${item.baseName}经煞气与灵泉反复洗炼，器骨坚凝，光色深藏。旧匠在边缘处留下一笔无名符痕，似在提醒后来者勿忘来路。`;
  }
  if (item.rarity === "magic") {
    return `${item.baseName}虽非名门重宝，却已有灵韵初醒。其上微光如晨雾绕竹，伴随应劫者踏入第一段归墟长夜。`;
  }
  return `${item.baseName}质朴无华，仍存一线可炼之灵。凡器入手，亦是问道开端。`;
}

function itemMechanism(item: Item) {
  if (item.seasonalPower) {
    return `道纪遗宝已生赤霄器机，除自身词缀外，还会展开专属遗宝特效；其力量围绕劫火裁决、劫火灼身与归墟天阶而动。`;
  }
  if (item.legendaryPower) {
    return `天阶法宝拥有独立法宝特效，除词缀加成外，还会改变某一类战斗节奏、保命手段或核心战诀的威力。`;
  }
  if (item.rarity === "epic") {
    return `地阶法器可承载更多高阶词缀，器身灵纹稳定，强化后基础属性提升更明显，是踏入高层归墟前的重要根基。`;
  }
  if (item.rarity === "rare") {
    return `玄器已具多重灵纹，词缀会共同决定它偏向破境、守御、回灵、神游或召唤等方向。`;
  }
  if (item.rarity === "magic") {
    return `灵器拥有初醒灵纹，通常提供一到两项明确加成，可用来补足当前最缺的属性。`;
  }
  return `凡器尚未形成稳定器机，主要提供基础属性，可作为前期过渡与炼器材料。`;
}

function formatAffixStats(affix: ItemAffix) {
  const entries = Object.entries(affix.statModifiers).filter(([, value]) => typeof value === "number" && value !== 0);
  if (!entries.length) return "";
  return entries.map(([key, value]) => `${statLabel(key)} ${formatSignedStat(key, value)}`).join(" / ");
}

function statLabel(key: string) {
  const labels: Record<keyof CharacterStats, string> = {
    attackPower: "攻击",
    armor: "护甲",
    maxHp: "生命",
    hpRegen: "生命回复",
    moveSpeed: "移速",
    resourceRegen: "灵元回复",
    resourceMax: "灵元上限",
    critChance: "暴击",
    critDamage: "暴击伤害",
    attackSpeed: "攻击速度",
    castSpeed: "施法速度",
    cooldownReduction: "冷却缩减",
    damageBonus: "伤害",
    eliteDamageBonus: "对精英伤害",
    bossDamageBonus: "对首领伤害",
    meleeDamageBonus: "近战伤害",
    rangedDamageBonus: "远程伤害",
    aoeDamageBonus: "范围伤害",
    dotDamageBonus: "持续伤害",
    summonDamageBonus: "召唤伤害",
    healingBonus: "治疗效果",
    shieldBonus: "护盾效果",
    fireResist: "火抗",
    iceResist: "冰抗",
    lightningResist: "雷抗",
    poisonResist: "毒抗",
    shadowResist: "阴影抗性",
  };
  return labels[key as keyof CharacterStats] ?? key;
}

function formatSignedStat(key: string, value: unknown) {
  if (typeof value !== "number") return `+${String(value)}`;
  const sign = value >= 0 ? "+" : "";
  return `${sign}${formatStatValue(key, value)}`;
}

function formatStatValue(key: string, value: unknown) {
  if (typeof value !== "number") return String(value);
  if (percentStats.has(key as keyof CharacterStats)) return `${Math.round(value * 100)}%`;
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

const percentStats = new Set<keyof CharacterStats>([
  "fireResist",
  "iceResist",
  "lightningResist",
  "poisonResist",
  "shadowResist",
  "critChance",
  "critDamage",
  "attackSpeed",
  "castSpeed",
  "moveSpeed",
  "cooldownReduction",
  "damageBonus",
  "eliteDamageBonus",
  "bossDamageBonus",
  "meleeDamageBonus",
  "rangedDamageBonus",
  "aoeDamageBonus",
  "dotDamageBonus",
  "summonDamageBonus",
  "healingBonus",
  "shieldBonus",
]);
