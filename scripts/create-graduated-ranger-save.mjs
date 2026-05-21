import { webcrypto } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";

const ARCHIVE_PREFIX = "VOIDSCAR-SEEKER-1";
const ARCHIVE_SECRET = "voidscar-ascension-local-character-archive-v1";
const CURRENT_VERSION = "0.2.0";
const CURRENT_SEASON_ID = "dao_era_1_ember_tribulation";
const exportedAt = Date.now();

const stats = {
  maxHp: 110,
  hpRegen: 1,
  attackPower: 14,
  armor: 10,
  fireResist: 0,
  iceResist: 0,
  lightningResist: 0,
  poisonResist: 0,
  shadowResist: 0,
  critChance: 0.08,
  critDamage: 1.5,
  attackSpeed: 1,
  castSpeed: 1,
  moveSpeed: 1,
  cooldownReduction: 0,
  resourceMax: 100,
  resourceRegen: 7,
  damageBonus: 0,
  eliteDamageBonus: 0,
  bossDamageBonus: 0,
  meleeDamageBonus: 0,
  rangedDamageBonus: 0,
  aoeDamageBonus: 0,
  dotDamageBonus: 0,
  summonDamageBonus: 0,
  healingBonus: 0,
  shieldBonus: 0,
};

const sigils = [
  ["sigil_ember_burst", "劫火爆裂", "劫火裁决伤害每级 +12%", "damage", 5, 5],
  ["sigil_soul_burn", "焚魂印", "精英和 Boss 受到劫火灼身时，额外受到每级 +2% 伤害", "damage", 5, 5],
  ["sigil_chain_ember", "余焰连珠", "暴击有 4%/级 概率弹射劫火，最多命中 3 个敌人", "damage", 5, 5],
  ["sigil_overheat", "火劫过载", "核心技能伤害 +5%/级，但资源消耗 +3%/级", "damage", 5, 5],
  ["sigil_ember_execute", "焚灭诀", "对生命低于 30% 的敌人，劫火伤害 +8%/级", "damage", 5, 5],
  ["sigil_boss_brand", "劫主烙印", "Boss 阶段劫火值获取 +6%/级", "damage", 5, 5],
  ["sigil_flame_crit", "火种会心", "劫火灼身目标受到暴击率 +1%/级", "damage", 5, 5],
  ["sigil_xuangang_guard", "玄罡护体", "生命低于 45% 时获得护盾，护盾值为最大生命 6%/级", "defense", 5, 5],
  ["sigil_suppress_fiend", "镇煞法印", "精英和 Boss 对你造成的伤害 -2.5%/级", "defense", 5, 5],
  ["sigil_still_mind", "静心守一", "站定 2 秒后获得减伤 1.5%/级", "defense", 5, 5],
  ["sigil_domain_guide", "洞天指引", "击杀怪物获得副本进度 +2%/级", "utility", 5, 5],
  ["sigil_spirit_expedition", "神游收益", "神游历练收益 +3%/级", "utility", 5, 5],
  ["sigil_loot_sense", "灵宝感应", "高品质掉落权重 +1.5%/级", "utility", 5, 5],
  ["sigil_stable_route", "稳定神游", "神游历练失败率 -2%/级", "utility", 5, 5],
  ["sigil_ember_income", "残烬采撷", "劫火残烬获取 +4%/级", "utility", 5, 5],
  ["sigil_tianji_loop", "天机轮转", "每次触发劫火裁决，随机减少一个非基础技能 15% 剩余冷却", "utility", 1, 1],
].map(([id, name, description, category, level, maxLevel]) => ({
  id,
  seasonId: CURRENT_SEASON_ID,
  name,
  description,
  category,
  onlineEffectId: id,
  offlineEffectId: category === "utility" ? "idle_or_efficiency_bonus" : category === "defense" ? "survival_bonus" : "damage_bonus",
  level,
  maxLevel,
  costPerLevel: maxLevel === 1 ? 120 : 60,
}));

const affixes = {
  guixu: affix("pre_guixu", "归墟", "归墟天阶内伤害 +5-14%", { damageBonus: 0.09 }, ["rift"]),
  yuhuo: affix("pre_yuhuo", "劫火", "劫火裁决伤害 +10-25%", { damageBonus: 0.14 }, ["season", "ember"]),
  huixin: affix("pre_huixin", "会心", "暴击率 +3-8%", { critChance: 0.05 }, ["crit"]),
  liesha: affix("pre_hunt_elite", "猎煞", "对精英伤害 +8-20%", { eliteDamageBonus: 0.14 }, ["elite"]),
  pozhijing: affix("pre_pojing", "破境", "对 Boss 伤害 +8-20%", { bossDamageBonus: 0.14 }, ["boss"]),
  summon: affix("pre_summon", "御灵", "召唤物伤害 +8-20%", { summonDamageBonus: 0.14 }, ["summon"]),
  wolfCount: affix("archer_wolf_count", "双狼契", "玄狼数量 +1，召唤物伤害 -15%", { summonDamageBonus: 0.14 }, ["summon", "ranger"]),
  dot: affix("pre_dot", "蚀骨", "持续伤害 +8-20%", { dotDamageBonus: 0.14 }, ["dot"]),
  aoe: affix("pre_aoe", "广法", "范围伤害 +8-18%", { aoeDamageBonus: 0.12 }, ["aoe"]),
  swift: affix("pre_fastattack", "迅击", "攻击速度 +5-12%", { attackSpeed: 0.08 }, ["speed"]),
  cdr: affix("pre_cdr", "归息", "冷却缩减 +4-10%", { cooldownReduction: 0.06 }, ["skill"]),
  resist: affix("pre_resist_all", "五行", "全抗性 +4-10%", { fireResist: 0.06, iceResist: 0.039, lightningResist: 0.039, poisonResist: 0.039, shadowResist: 0.039 }, ["resist"]),
  hp: affix("pre_max_hp", "护命", "生命上限 +6-16%", { maxHp: 42 }, ["defense"]),
  armor: affix("pre_armor", "玄甲", "护甲 +8-20%", { armor: 18 }, ["defense"]),
  guiYi: affix("suf_guiyi", "之归一", "全伤害 +4-10%", { damageBonus: 0.07 }, ["damage"]),
  huiXiang: affix("suf_huixiang", "之回响", "技能重复概率 +2-6%", { damageBonus: 0.06 }, ["trigger"]),
  lieShaS: affix("suf_liesha", "之猎煞", "击杀精英后 8 秒伤害 +8-18%", { eliteDamageBonus: 0.12 }, ["elite"]),
  poJingS: affix("suf_pojing", "之破境", "Boss 伤害 +8-20%", { bossDamageBonus: 0.13 }, ["boss"]),
  shenYouS: affix("suf_shenyou", "之神游", "神游收益 +3-10%", { resourceRegen: 1.4 }, ["idle"]),
  huiYuanS: affix("suf_huiyuan", "之回元", "资源回复 +6-14%", { resourceRegen: 2 }, ["resource"]),
  petS: affix("suf_pet", "之灵契", "召唤物持续时间 +10-30%，玄狼灵契上限 +1", { summonDamageBonus: 0.12 }, ["summon"]),
  trapS: affix("suf_trap", "之伏阵", "陷阱持续时间 +10-25%", { dotDamageBonus: 0.1 }, ["trap"]),
  shieldS: affix("suf_barrier", "之结界", "护盾持续时间 +10-25%", { shieldBonus: 0.13 }, ["shield"]),
  speedS: affix("suf_jifeng", "之疾风", "移动速度 +5-12%", { moveSpeed: 0.08 }, ["speed"]),
  lifeS: affix("suf_huming", "之护命", "生命 +6-16%", { maxHp: 42 }, ["defense"]),
  armorS: affix("suf_xuanjia", "之玄甲", "护甲 +8-20%", { armor: 18 }, ["defense"]),
};

const powers = {
  weapon: affix("leg_archer_arrow_fan", "千羽弓", "连珠符箭额外发射扇形小箭，但单箭伤害降低", { rangedDamageBonus: 0.14 }, ["legendary", "ranger"]),
  offhand: affix("leg_archer_focus_quiver", "聚息箭囊", "暴击回复灵息，且提高下一次核心技能伤害", { critChance: 0.05 }, ["legendary", "ranger"]),
  chest: affix("leg_guardian_robes", "守御法袍", "召唤物存在时玩家减伤 +10%，召唤物减伤 +20%", { summonDamageBonus: 0.12 }, ["legendary", "ranger"]),
  gloves: affix("leg_archer_poison_cloud", "毒藤残阵", "毒藤符阵触发后留下毒雾区域", { dotDamageBonus: 0.18 }, ["legendary", "ranger"]),
  boots: affix("leg_archer_shadow_guard", "踏影护符", "踏影步后留下影身吸引怪物 2 秒", { moveSpeed: 0.08 }, ["legendary", "ranger"]),
  amulet: affix("season_relic_ember_wolf_charm", "火狼灵符", "召唤物命中劫火灼身敌人时造成额外火伤", { summonDamageBonus: 0.18 }, ["seasonalUnique", "ember"]),
  ring1: affix("leg_archer_boss_mark", "劫主猎令", "Boss 被标记时，玄狼和玩家对其伤害提高", { bossDamageBonus: 0.16 }, ["legendary", "ranger"]),
  ring2: affix("season_relic_ember_ring", "劫火归元戒", "击杀劫火灼身敌人回复资源并获得少量生命", { resourceRegen: 2.6 }, ["seasonalUnique", "ember"]),
  helmet: affix("season_relic_tribulation_crown", "劫火道冠", "劫火热度达到 5 层后，暴击率和冷却恢复提高", { critChance: 0.06 }, ["seasonalUnique", "ember"]),
};

const characterId = id("char_grad_ranger");
const items = [
  item("weapon", "legendary", "天阶法宝 · 千羽弓", "千羽弓", 1150, { attackPower: 164 }, [affixes.guixu, affixes.huixin, affixes.swift], [affixes.guiYi, affixes.huiXiang], powers.weapon),
  item("offhand", "legendary", "天阶法宝 · 聚息箭囊", "聚息箭囊", 1138, { resourceRegen: 44 }, [affixes.cdr, affixes.summon, affixes.yuhuo], [affixes.huiYuanS, affixes.huiXiang], powers.offhand),
  item("helmet", "seasonalUnique", "道纪遗宝 · 劫火道冠", "劫火道冠", 1142, { armor: 163, maxHp: 380 }, [affixes.resist, affixes.hp, affixes.guixu], [affixes.lifeS, affixes.armorS], powers.helmet),
  item("chest", "legendary", "天阶法宝 · 守御法袍", "守御法袍", 1145, { armor: 164, maxHp: 382 }, [affixes.hp, affixes.resist, affixes.summon], [affixes.lifeS, affixes.shieldS], powers.chest),
  item("gloves", "legendary", "天阶法宝 · 毒藤残阵", "毒藤残阵", 1132, { armor: 161, maxHp: 377 }, [affixes.dot, affixes.aoe, affixes.swift], [affixes.trapS, affixes.guiYi], powers.gloves),
  item("pants", "epic", "地阶法器 · 五行下裳之护命", "下裳", 1112, { armor: 158, maxHp: 370 }, [affixes.resist, affixes.hp, affixes.armor], [affixes.lifeS, affixes.armorS]),
  item("boots", "legendary", "天阶法宝 · 踏影护符", "踏影护符", 1128, { armor: 112, moveSpeed: 0.04 }, [affixes.guixu, affixes.resist, affixes.swift], [affixes.speedS, affixes.guiYi], powers.boots),
  item("amulet", "seasonalUnique", "道纪遗宝 · 火狼灵符", "火狼灵符", 1150, { critChance: 0.12, damageBonus: 0.1 }, [affixes.summon, affixes.wolfCount, affixes.yuhuo], [affixes.petS, affixes.shenYouS], powers.amulet),
  item("ring1", "legendary", "天阶法宝 · 劫主猎令", "劫主猎令", 1144, { critChance: 0.12, damageBonus: 0.1 }, [affixes.pozhijing, affixes.huixin, affixes.liesha], [affixes.poJingS, affixes.lieShaS], powers.ring1),
  item("ring2", "seasonalUnique", "道纪遗宝 · 劫火归元戒", "劫火归元戒", 1140, { critChance: 0.12, damageBonus: 0.1 }, [affixes.yuhuo, affixes.guixu, affixes.huixin], [affixes.huiYuanS, affixes.guiYi], powers.ring2),
];

const equipment = Object.fromEntries(items.map((entry) => [entry.slot, entry.id]));
for (const slot of ["weapon", "offhand", "helmet", "chest", "gloves", "pants", "boots", "amulet", "ring1", "ring2"]) equipment[slot] ??= null;

const character = {
  id: characterId,
  name: "赤霄穿云 · 毕业灵弓",
  classId: "ranger",
  seasonId: CURRENT_SEASON_ID,
  status: "active",
  level: 60,
  exp: 0,
  stats,
  equipment,
  skillLoadout: {
    skillIds: ["ranger_quickshot", "ranger_piercing_arrow", "ranger_poison_trap", "ranger_arrow_rain", "ranger_wolf"],
    activeProfileId: "graduate_ranger",
  },
  skillRanks: {
    ranger_quickshot: 5,
    ranger_piercing_arrow: 5,
    ranger_poison_trap: 5,
    ranger_shadow_step: 3,
    ranger_arrow_rain: 5,
    ranger_burst_knife: 5,
    ranger_wolf: 3,
  },
  skillProfiles: [
    {
      id: "graduate_ranger",
      name: "穿云火狼终局循环",
      rules: [
        rule("ranger_wolf", 94, [{ type: "summonCountBelow", operator: "<", value: 1 }], 18000, { reserveForBoss: true }),
        rule("ranger_arrow_rain", 88, [{ type: "enemyCountNearby", operator: ">=", value: 2, radius: 300 }, { type: "resourceAbove", operator: ">=", value: 35 }], 12000),
        rule("ranger_piercing_arrow", 80, [{ type: "enemyCountNearby", operator: ">=", value: 1, radius: 330 }, { type: "resourceAbove", operator: ">=", value: 18 }], 2000),
        rule("ranger_poison_trap", 74, [{ type: "enemyCountNearby", operator: ">=", value: 2, radius: 160 }, { type: "resourceAbove", operator: ">=", value: 20 }], 8000),
        rule("ranger_quickshot", 10, [{ type: "always" }], 600),
      ],
    },
  ],
  targeting: {
    priorities: ["marked", "boss", "elite", "healer", "ranged", "lowestHp"],
    preferClusteredEnemies: true,
    clusterRadius: 210,
    ignoreLowValueTrashWhenEliteExists: true,
  },
  movement: {
    strategy: "kite",
    preferredRange: 250,
    dangerAvoidanceWeight: 0.85,
    eliteChaseWeight: 0.55,
  },
  inventory: items,
  materials: {
    gold: 0,
    spirit_stone: 880000,
    ember_remnant: 36000,
    black_iron: 2600,
    spirit_jade: 1800,
    star_sand: 720,
    artifact_core: 90,
    voidscar_shard: 260,
    fireseed: 36,
    dao_seal_dust: 60,
  },
  completedDungeons: [
    "domain_qinglan_bamboo",
    "domain_blackwater_ferry",
    "domain_broken_sword_barrow",
    "domain_crimson_alchemy",
    "domain_starfall_palace",
    "domain_chixiao_ruins",
    "domain_artifact_tomb",
    "domain_spirit_mine",
    "domain_inner_demon",
  ],
  seasonEmbers: 36000,
  seasonPowers: sigils,
  highestRiftTier: 120,
  stableIdleRiftTier: 118,
  createdAt: exportedAt,
  totalPlayTimeSeconds: 56 * 24 * 3600,
  totalIdleSeconds: 24 * 3600 * 18,
};

const reports = [
  {
    id: id("report_grad"),
    characterId,
    contentName: "归墟天阶",
    riftTier: 120,
    result: "success",
    durationMs: 214000,
    deaths: 0,
    kills: 426,
    eliteKills: 6,
    bossName: "赤霄旧祖",
    totalDamage: 98200000,
    totalHealing: 460000,
    damageTaken: 390000,
    shieldAbsorbed: 220000,
    actors: {},
    rewards: {
      exp: 0,
      gold: 0,
      embers: 720,
      materials: { voidscar_shard: 12, fireseed: 2, star_sand: 28 },
      itemIds: items.slice(0, 3).map((entry) => entry.id),
      salvagedCount: 18,
    },
    createdAt: exportedAt,
  },
];

const payload = { version: CURRENT_VERSION, exportedAt, character, reports };
const token = await encryptArchive(payload);
await mkdir("exports", { recursive: true });
await writeFile("exports/graduated-ranger-archive.txt", token, "utf8");
await writeFile("exports/graduated-ranger-payload.json", JSON.stringify(payload, null, 2), "utf8");
console.log(token);

function affix(id, name, description, statModifiers, tags) {
  const score = Object.values(statModifiers).reduce((sum, value) => sum + (typeof value === "number" && Math.abs(value) < 1 ? value * 140 : Number(value) * 0.8), 0);
  return {
    id,
    name,
    description,
    statModifiers,
    tags,
    value: Math.max(6, Math.round(score)),
  };
}

function item(slot, rarity, name, baseName, power, implicitStats, prefixes, suffixes, specialPower) {
  const entry = {
    id: id(`item_${slot}`),
    characterId,
    name,
    baseName,
    rarity,
    itemLevel: 60,
    power,
    slot,
    classRestriction: slot === "weapon" ? "ranger" : undefined,
    implicitStats,
    prefixes,
    suffixes,
    upgradeLevel: 10,
    createdAt: exportedAt,
  };
  if (rarity === "seasonalUnique") entry.seasonalPower = specialPower;
  if (rarity === "legendary") entry.legendaryPower = specialPower;
  return entry;
}

function rule(skillId, priority, conditions, minIntervalMs, extra = {}) {
  return {
    skillId,
    enabled: true,
    priority,
    mode: "auto",
    conditionGroups: [{ logic: "AND", conditions }],
    minIntervalMs,
    ...extra,
  };
}

function id(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}_${exportedAt.toString(36)}`;
}

async function encryptArchive(rawPayload) {
  const envelope = {
    compressed: false,
    data: toBase64Url(new TextEncoder().encode(JSON.stringify(rawPayload))),
  };
  const iv = webcrypto.getRandomValues(new Uint8Array(12));
  const key = await archiveKey();
  const cipher = new Uint8Array(await webcrypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(JSON.stringify(envelope))));
  return `${ARCHIVE_PREFIX}.${toBase64Url(iv)}.${toBase64Url(cipher)}`;
}

async function archiveKey() {
  const hash = await webcrypto.subtle.digest("SHA-256", new TextEncoder().encode(ARCHIVE_SECRET));
  return webcrypto.subtle.importKey("raw", hash, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}

function toBase64Url(bytes) {
  return Buffer.from(bytes).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
