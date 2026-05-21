import type { Skill } from "../../types";
import { resourceNames } from "../../data/classes";
import { skillTypeLabels } from "../labels";
import { describeSkill, formatSkillTags, skillFormula } from "../skillText";

interface AttributeInfo {
  title: string;
  description: string;
  formula?: string;
}

const attributeInfo: Record<string, AttributeInfo> = {
  生命: {
    title: "生命",
    description: "应劫者可承受的伤害总量。生命归零时，本次推演失败或记录一次死亡。",
  },
  生命回复: {
    title: "生命回复",
    description: "持续恢复生命，主要提高长时间推演与神游历练的稳定性。",
  },
  攻击: {
    title: "攻击",
    description: "所有直接伤害战诀的基础来源。",
    formula: "战诀基础伤害 = 攻击 × 当前战诀倍率。",
  },
  护甲: {
    title: "护甲",
    description: "降低受到的普通攻击伤害。高层归墟中，护甲能明显缓解小怪和精英的持续压迫。",
    formula: "怪物普攻伤害会受到护甲削减，剩余伤害由护盾优先吸收。",
  },
  暴击率: {
    title: "暴击率",
    description: "战诀命中时触发暴击的概率。暴击会显著提高当次伤害。",
  },
  暴击伤害: {
    title: "暴击伤害",
    description: "暴击后的伤害倍率。暴击率越高，这项属性的收益越稳定。",
  },
  攻速: {
    title: "攻速",
    description: "影响偏攻击型战诀和普攻节奏，适合依赖频繁命中的修行流派。",
  },
  施法速度: {
    title: "施法速度",
    description: "影响法术型战诀的施展节奏，让术修更快完成循环。",
  },
  移动速度: {
    title: "移动速度",
    description: "影响走位、拉扯和神游清图效率，也能帮助躲开部分范围威胁。",
  },
  冷却缩减: {
    title: "冷却缩减",
    description: "缩短战诀冷却，让核心技能、防御技能和爆发技能更频繁进入可用状态。",
  },
  资源上限: {
    title: "资源上限",
    description: "提高剑意、灵息或灵力的最大储量，便于保留资源等待精英或劫主阶段。",
  },
  资源回复: {
    title: "资源回复",
    description: "提高战斗中资源恢复速度，也会影响部分神游历练结算。",
  },
  全伤害: {
    title: "全伤害",
    description: "提高大多数来自应劫者的伤害，是最通用的输出属性。",
  },
  精英伤害: {
    title: "精英伤害",
    description: "提高对精英劫煞的伤害，能缩短 25%、50%、75% 节点的压力时间。",
  },
  劫主伤害: {
    title: "劫主伤害",
    description: "提高对 Boss 和劫主的伤害，适合冲层和终极挑战。",
  },
  近战伤害: {
    title: "近战伤害",
    description: "提高带有近战标签的战诀伤害，常见于剑修战诀。",
  },
  远程伤害: {
    title: "远程伤害",
    description: "提高带有远程标签的战诀伤害，常见于灵弓和术修战诀。",
  },
  范围伤害: {
    title: "范围伤害",
    description: "提高带有范围标签的战诀伤害，适合清理密集怪群。",
  },
  持续伤害: {
    title: "持续伤害",
    description: "提高燃烧、中毒等持续伤害效果，适合拖长战线的流派。",
  },
  召唤伤害: {
    title: "召唤伤害",
    description: "提高剑旗、玄狼、分神化影等召唤物造成的伤害。",
  },
  治疗加成: {
    title: "治疗加成",
    description: "提高生命回复和治疗类效果，在高层归墟中能增加容错。",
  },
  护盾加成: {
    title: "护盾加成",
    description: "提高护盾类战诀和法宝效果的吸收量。",
  },
  火抗: {
    title: "火抗",
    description: "降低火焰与劫火类伤害。赤炼丹窟、赤霄遗址和劫火天阶中更重要。",
  },
  冰抗: {
    title: "冰抗",
    description: "降低冰霜伤害，并缓解玄阴、霜封类威胁。",
  },
  雷抗: {
    title: "雷抗",
    description: "降低雷法伤害，面对雷链、天雷脉冲和星陨玄宫时更重要。",
  },
  毒抗: {
    title: "毒抗",
    description: "降低毒伤压力，适合应对毒藤、药傀和毒瘴词缀。",
  },
  影抗: {
    title: "影抗",
    description: "降低阴魂、归墟与暗幕类伤害，适合黑水古渡和高层天阶。",
  },
};

export function AttributeTooltip({ label, value }: { label: string; value: string }) {
  const info = attributeInfo[label] ?? {
    title: label,
    description: "该属性会影响应劫者在推演、神游和归墟天阶中的表现。",
  };
  return (
    <div className="item-tooltip info-tooltip">
      <div className="tooltip-head">
        <strong>{info.title}</strong>
        <span>{value}</span>
      </div>
      <p className="tooltip-description">{info.description}</p>
      {info.formula && <p className="legend-line">{info.formula}</p>}
    </div>
  );
}

export function SkillTooltip({ skill, rank, casts }: { skill: Skill; rank?: number; casts?: number }) {
  return (
    <div className="item-tooltip info-tooltip skill-info-tooltip">
      <div className="tooltip-head">
        <strong>{skill.icon} {skill.name}</strong>
        <span>{skillTypeLabels[skill.type]}</span>
      </div>
      <p className="tooltip-description">{describeSkill(skill)}</p>
      <p className="legend-line">{skillFormula(skill, rank || 1)}</p>
      <div className="tooltip-grid">
        <span>标签</span><b>{formatSkillTags(skill.tags)}</b>
        <span>冷却</span><b>{(skill.cooldownMs / 1000).toFixed(1)} 秒</b>
        <span>资源</span><b>{skill.resourceCost ? `消耗 ${skill.resourceCost} ${resourceNames[skill.classId]}` : `${resourceNames[skill.classId]} +${skill.resourceGain ?? 0}`}</b>
        {rank !== undefined && <><span>境界</span><b>{rank} 重</b></>}
        {casts !== undefined && <><span>释放</span><b>{casts} 次</b></>}
      </div>
    </div>
  );
}
