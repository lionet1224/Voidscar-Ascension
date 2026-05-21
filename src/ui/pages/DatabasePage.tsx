import { useState } from "react";
import { classNames } from "../../data/classes";
import { monsterTemplates } from "../../data/dungeons";
import { rarityLabels, slotLabels } from "../../data/affixes";
import { itemDatabase } from "../../data/itemDatabase";
import { currentSeasonDefinition } from "../../data/seasons";
import { getClassSkills } from "../../data/skills";
import { rarityColor } from "../../systems/lootSystem";
import { ItemTooltip } from "../components/ItemTooltip";
import { familyLabels, skillTypeLabels } from "../labels";

export function DatabasePage() {
  const [tab, setTab] = useState<"skills" | "items" | "monsters" | "seasons">("skills");
  return (
    <div className="page-stack">
      <section className="panel page-title-row">
        <div>
          <h1>开发数据库</h1>
          <p>仅本地开发模式显示，用来检查配置数据是否完整。</p>
        </div>
        <div className="segmented">
          <button className={tab === "skills" ? "active" : ""} onClick={() => setTab("skills")}>战诀</button>
          <button className={tab === "items" ? "active" : ""} onClick={() => setTab("items")}>法器</button>
          <button className={tab === "monsters" ? "active" : ""} onClick={() => setTab("monsters")}>劫煞</button>
          <button className={tab === "seasons" ? "active" : ""} onClick={() => setTab("seasons")}>道纪</button>
        </div>
      </section>
      {tab === "skills" && (
        <section className="database-grid">
          {getClassSkills("warrior").concat(getClassSkills("ranger"), getClassSkills("mage")).map((skill) => (
            <article className="database-card" key={skill.id}>
              <h3>{skill.icon} {skill.name}</h3>
              <p>{classNames[skill.classId]} · {skillTypeLabels[skill.type]} · 冷却 {(skill.cooldownMs / 1000).toFixed(1)}秒</p>
              <span>{skill.tags.join(" / ")}</span>
            </article>
          ))}
        </section>
      )}
      {tab === "items" && (
        <section className="database-grid">
          {itemDatabase.map((item) => (
            <article className="database-card item-hover-scope" key={item.id} style={{ borderLeftColor: rarityColor(item.rarity) }}>
              <h3>{item.name}</h3>
              <p>{slotLabels[item.slot]} · Lv.{item.itemLevelRange} · {rarityLabels[item.rarity]}</p>
              <span>{item.sourceName} · {item.sourceType}</span>
              <small>{item.mechanism}</small>
              <ItemTooltip databaseItem={item} />
            </article>
          ))}
        </section>
      )}
      {tab === "monsters" && (
        <section className="database-grid">
          {monsterTemplates.map((monster) => (
            <article className="database-card" key={monster.id}>
              <h3>{monster.name}</h3>
              <p>{familyLabels[monster.family]} · {monster.type} · 进度 {monster.progressValue}</p>
              <span>生命 {monster.baseHp} / 伤害 {monster.baseDamage} / 护甲 {monster.baseArmor}</span>
              <small>{monster.tags.join(" / ")}</small>
            </article>
          ))}
        </section>
      )}
      {tab === "seasons" && (
        <section className="database-grid">
          {[...currentSeasonDefinition.mechanics, ...currentSeasonDefinition.activities].map((entry) => (
            <article className="database-card" key={entry.id}>
              <h3>{entry.name}</h3>
              <p>{entry.description}</p>
              <span>{"trigger" in entry ? `${entry.trigger}：${entry.effect}` : entry.rewardTags.join(" / ")}</span>
            </article>
          ))}
          {currentSeasonDefinition.equipmentMechanics.map((entry) => (
            <article className="database-card legendary-db" key={entry.id}>
              <h3>{entry.name}</h3>
              <p>{entry.description}</p>
              <span>{entry.affixTags.join(" / ")}</span>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
