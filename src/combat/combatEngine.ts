import { eliteAffixes, familyTrashNames, getDungeon, riftPower } from "../data/dungeons";
import { getSkill } from "../data/skills";
import type { Character, CombatReport, Dungeon, Item, RewardBundle, Skill } from "../types";
import { getEffectiveStats } from "../systems/characterSystem";
import { decideNextSkill } from "../systems/skillRuleSystem";
import { clamp, pick, uid } from "../systems/id";
import type { CombatActor, CombatSession, CombatStatusEffect, FloatingText, SkillEffect, Vector2 } from "./combatTypes";

const ARENA = 560;

export function createCombatSession(options: {
  character: Character;
  inventory: Item[];
  dungeonId?: string;
  riftTier?: number;
}): CombatSession {
  const stats = getEffectiveStats(options.character, options.inventory);
  const dungeon = options.riftTier ? undefined : getDungeon(options.dungeonId ?? "dust_archive");
  const tier = options.riftTier ?? 0;
  const contentName = tier ? `归墟天阶 ${tier} 层` : dungeon!.name;
  const bossName = tier ? pick(["归墟火煞", "玄阴劫主", "天雷残灵", "血符魔尊", "无相剑魂"]) : dungeon!.bossName;
  const player: CombatActor = {
    id: "player",
    name: options.character.name,
    type: "player",
    hp: stats.maxHp,
    maxHp: stats.maxHp,
    resource: stats.resourceMax,
    maxResource: stats.resourceMax,
    shield: 0,
    attack: stats.attackPower,
    armor: stats.armor,
    level: options.character.level,
    position: { x: ARENA / 2, y: ARENA / 2 },
    radius: 18,
    speed: 92 * stats.moveSpeed,
    attackCooldown: 1000,
    attackTimer: 0,
    statusEffects: [],
  };
  return {
    id: uid("combat"),
    state: "running",
    contentName,
    dungeon,
    riftTier: options.riftTier,
    character: options.character,
    effectiveStats: stats,
    player,
    monsters: [],
    summons: [],
    floats: [],
    effects: [],
    cooldowns: {},
    lastCastAt: {},
    progress: 0,
    milestones: {},
    spawnTimer: 0,
    elapsedMs: 0,
    kills: 0,
    eliteKills: 0,
    deaths: 0,
    bossName,
    stats: {
      totalDamage: 0,
      totalHealing: 0,
      damageTaken: 0,
      shieldAbsorbed: 0,
      skills: {},
      summonDamage: {},
    },
  };
}

export function tickCombat(session: CombatSession, deltaMs: number): CombatSession {
  if (session.state !== "running" && session.state !== "bossSpawned") return session;
  const next = cloneSession(session);
  next.elapsedMs += deltaMs;
  next.spawnTimer -= deltaMs;
  next.player.resource = clamp(next.player.resource + (next.player.maxResource * 0.035 * deltaMs) / 1000, 0, next.player.maxResource);
  updateStatusEffects(next, deltaMs);
  decayCooldowns(next, deltaMs);
  if (next.progress < 100 && next.spawnTimer <= 0) {
    spawnMonster(next, "trash");
    if (Math.random() > 0.68) spawnMonster(next, Math.random() > 0.55 ? "ranged" : "shieldBearer");
    next.spawnTimer = Math.max(520, 1300 - (next.riftTier ?? 0) * 8);
  }
  [25, 50, 75].forEach((milestone) => {
    if (!next.milestones[milestone] && next.progress >= milestone) {
      next.milestones[milestone] = true;
      spawnMonster(next, "elite");
    }
  });
  if (!next.milestones[100] && next.progress >= 100) {
    next.milestones[100] = true;
    next.state = "bossSpawned";
    spawnMonster(next, "boss");
  }
  moveMonsters(next, deltaMs);
  separateCombatants(next);
  updateSummons(next, deltaMs);
  castPlayerSkill(next);
  resolveMonsterAttacks(next, deltaMs);
  cleanup(next);
  if (next.player.hp <= 0) {
    next.deaths = 1;
    next.state = "failed";
  }
  const bossAlive = next.monsters.some((monster) => monster.monsterType === "boss");
  if (next.milestones[100] && !bossAlive) {
    next.state = "success";
  }
  return next;
}

export function makeCombatReport(session: CombatSession, rewards: RewardBundle): CombatReport {
  const actorSkills = Object.fromEntries(
    Object.values(session.stats.skills).map((entry) => [
      entry.skill.id,
      {
        skillId: entry.skill.id,
        skillName: entry.skill.name,
        skillIcon: entry.skill.icon,
        casts: entry.casts,
        hits: entry.hits,
        crits: entry.crits,
        totalDamage: Math.floor(entry.totalDamage),
        maxDamage: Math.floor(entry.maxDamage),
        averageDamage: entry.hits ? Math.floor(entry.totalDamage / entry.hits) : 0,
        totalHealing: Math.floor(entry.totalHealing),
        totalShield: Math.floor(entry.totalShield),
        resourceSpent: Math.floor(entry.resourceSpent),
        resourceGained: Math.floor(entry.resourceGained),
      },
    ]),
  );
  return {
    id: uid("report"),
    characterId: session.character.id,
    contentName: session.contentName,
    riftTier: session.riftTier,
    result: session.state === "success" ? "success" : "failed",
    durationMs: session.elapsedMs,
    deaths: session.deaths,
    kills: session.kills,
    eliteKills: session.eliteKills,
    bossName: session.bossName,
    totalDamage: Math.floor(session.stats.totalDamage),
    totalHealing: Math.floor(session.stats.totalHealing),
    damageTaken: Math.floor(session.stats.damageTaken),
    shieldAbsorbed: Math.floor(session.stats.shieldAbsorbed),
    actors: {
      player: {
        actorId: "player",
        actorName: session.character.name,
        actorType: "player",
        totalDamage: Math.floor(session.stats.totalDamage),
        totalHealing: Math.floor(session.stats.totalHealing),
        damageTaken: Math.floor(session.stats.damageTaken),
        shieldAbsorbed: Math.floor(session.stats.shieldAbsorbed),
        kills: session.kills,
        skills: actorSkills,
      },
      ...Object.fromEntries(
        Object.entries(session.stats.summonDamage).map(([name, damage]) => [
          name,
          {
            actorId: name,
            actorName: name,
            actorType: name.includes("符阵") ? "trap" : name.includes("剑旗") ? "totem" : name.includes("化影") ? "mirror" : "summon",
            totalDamage: Math.floor(damage),
            totalHealing: 0,
            damageTaken: 0,
            shieldAbsorbed: 0,
            kills: 0,
            skills: {},
          },
        ]),
      ),
    },
    rewards,
    createdAt: Date.now(),
  };
}

function castPlayerSkill(session: CombatSession) {
  const player = session.player;
  const nearby = session.monsters.filter((monster) => distance(monster.position, player.position) <= 220);
  const target = chooseTarget(session);
  const skill = decideNextSkill({
    character: session.character,
    hpPercent: (player.hp / player.maxHp) * 100,
    resourcePercent: (player.resource / player.maxResource) * 100,
    enemyCountNearby: nearby.length,
    eliteExists: session.monsters.some((monster) => monster.monsterType === "elite"),
    bossExists: session.monsters.some((monster) => monster.monsterType === "boss"),
    targetHpPercent: target ? (target.hp / target.maxHp) * 100 : 100,
    summonCount: session.summons.length,
    shieldPercent: (player.shield / player.maxHp) * 100,
    progress: session.progress,
    cooldownReady: (skillId) => (session.cooldowns[skillId] ?? 0) <= 0,
    canCast: (candidate) => (session.cooldowns[candidate.id] ?? 0) <= 0 && player.resource >= candidate.resourceCost && (candidate.range === 0 || Boolean(target)),
    now: session.elapsedMs,
    lastCastAt: session.lastCastAt,
  });
  if (!skill || (session.cooldowns[skill.id] ?? 0) > 0 || player.resource < skill.resourceCost) return;
  if (skill.range > 0 && target && distance(player.position, target.position) > skill.range + 70) return;
  session.cooldowns[skill.id] = skill.cooldownMs * (1 - getEffectiveCooldownReduction(session));
  session.lastCastAt[skill.id] = session.elapsedMs;
  player.resource = clamp(player.resource - skill.resourceCost + (skill.resourceGain ?? 0), 0, player.maxResource);
  recordCast(session, skill);
  if (skill.type === "defense" && skill.damageMultiplier === 0) {
    const shield = player.maxHp * (skill.id === "mage_shield" ? 0.42 : 0.28);
    player.shield += shield;
    if (skill.resourceGain) float(session, player.position, skill.icon, `+${skill.resourceGain}`, "resource", skill.resourceGain);
    float(session, player.position, skill.icon, `+${Math.floor(shield)}`, "shield", shield);
    addStatus(player, createStatus(skill.id === "mage_shield" ? "element_shield" : "blood_shout", skill, player.maxHp * 0.02));
    addEffect(session, {
      kind: "ring",
      from: player.position,
      to: player.position,
      color: "#38bdf8",
      radius: player.radius + 38,
      width: 5,
      durationMs: 760,
    });
    recordShield(session, skill, shield);
    return;
  }
  if (skill.type === "summon") {
    summonActor(session, skill);
    addStatus(player, createStatus("summon_ready", skill, 0));
    return;
  }
  const targets = skill.tags.includes("aoe")
    ? session.monsters.filter((monster) => distance(monster.position, target?.position ?? player.position) <= (skill.radius ?? 120))
    : target
      ? [target]
      : [];
  applySkillDamage(session, skill, targets);
}

function applySkillDamage(session: CombatSession, skill: Skill, targets: CombatActor[], sourceName?: string, sourcePosition = session.player.position) {
  if (targets.length) addSkillEffect(session, skill, sourcePosition, targets[0].position, targets.length > 1 ? skill.radius : undefined);
  targets.forEach((monster) => {
    const crit = Math.random() < getEffectiveCrit(session);
    const tagBonus =
      (skill.tags.includes("melee") ? getEffectiveDamageBonus(session, "meleeDamageBonus") : 0) +
      (skill.tags.includes("ranged") ? getEffectiveDamageBonus(session, "rangedDamageBonus") : 0) +
      (skill.tags.includes("aoe") ? getEffectiveDamageBonus(session, "aoeDamageBonus") : 0) +
      (skill.tags.includes("dot") ? getEffectiveDamageBonus(session, "dotDamageBonus") : 0) +
      (monster.monsterType === "elite" ? getEffectiveDamageBonus(session, "eliteDamageBonus") : 0) +
      (monster.monsterType === "boss" ? getEffectiveDamageBonus(session, "bossDamageBonus") : 0);
    const rank = Math.max(1, session.character.skillRanks[skill.id] ?? 1);
    const base = session.player.attack * skill.damageMultiplier * (1 + (rank - 1) * 0.14) * (sourceName ? 0.55 : 1);
    const damage = Math.max(1, base * (1 + getEffectiveDamageBonus(session, "damageBonus") + tagBonus) * (crit ? 1.75 : 1) - monster.armor * 0.22);
    monster.hp -= damage;
    applySkillStatuses(monster, skill, session);
    float(session, monster.position, skill.icon, `${crit ? "!" : ""}${Math.floor(damage)}`, crit ? "crit" : "damage", damage);
    recordHit(session, skill, damage, crit);
    if (sourceName) session.stats.summonDamage[sourceName] = (session.stats.summonDamage[sourceName] ?? 0) + damage;
  });
}

function summonActor(session: CombatSession, skill: Skill) {
  const offset = { x: Math.random() * 60 - 30, y: Math.random() * 60 - 30 };
  const name = skill.id === "warrior_banner" ? "镇岳剑旗" : skill.id === "ranger_poison_trap" ? "毒藤符阵" : skill.id === "mage_mirror" ? "分神化影" : "玄狼灵契";
  session.summons.push({
    id: uid("summon"),
    name,
    type: "summon",
    hp: session.player.maxHp * 0.35,
    maxHp: session.player.maxHp * 0.35,
    resource: 0,
    maxResource: 0,
    shield: 0,
    attack: session.player.attack * (skill.id === "ranger_wolf" ? 0.95 : 0.72),
    armor: session.player.armor * 0.4,
    level: session.player.level,
    position: { x: session.player.position.x + offset.x, y: session.player.position.y + offset.y },
    radius: skill.id === "warrior_banner" ? 13 : 10,
    speed: skill.id === "warrior_banner" || skill.id === "ranger_poison_trap" ? 0 : 110,
    attackCooldown: skill.id === "warrior_banner" ? 850 : 700,
    attackTimer: 0,
    ownerActorId: "player",
    sourceSkillId: skill.id,
    durationMs: skill.durationMs ?? 8000,
    pulseTimer: 300,
    statusEffects: [createStatus("summoned", skill, 0)],
  });
  float(session, session.player.position, skill.icon, name, "shield", 0);
  addEffect(session, {
    kind: "ring",
    from: session.player.position,
    to: session.player.position,
    color: skill.id === "ranger_poison_trap" ? "#16a34a" : "#0f766e",
    radius: skill.radius ?? 80,
    width: 3,
    durationMs: 760,
  });
}

function updateSummons(session: CombatSession, deltaMs: number) {
  session.summons.forEach((summon) => {
    summon.durationMs = (summon.durationMs ?? 0) - deltaMs;
    summon.attackTimer -= deltaMs;
    const skill = getSkill(summon.sourceSkillId ?? "");
    if (!skill || summon.attackTimer > 0) return;
    const target = chooseTarget(session, summon.position);
    if (!target) return;
    if (summon.speed > 0) moveToward(summon, target.position, deltaMs);
    const radius = skill.id === "warrior_banner" || skill.id === "ranger_poison_trap" ? skill.radius ?? 120 : 65;
    const targets = session.monsters.filter((monster) => distance(monster.position, summon.position) <= radius).slice(0, skill.id === "ranger_wolf" ? 1 : 5);
    if (targets.length) {
      summon.attackTimer = summon.attackCooldown;
      applySkillDamage(session, skill, targets, summon.name, summon.position);
    }
  });
}

function spawnMonster(session: CombatSession, type: CombatActor["monsterType"]) {
  const angle = Math.random() * Math.PI * 2;
  const radius = ARENA / 2 + 30;
  const family = session.dungeon?.family ?? pick(["paper", "rust", "darkScreen", "electric"] as const);
  const tier = session.riftTier ?? 0;
  const scale = session.riftTier ? Math.pow(1.12, tier) : 1 + session.character.level * 0.08;
  const hpBase = type === "boss" ? 520 : type === "elite" ? 240 : 68;
  const damageBase = type === "boss" ? 16 : type === "elite" ? 11 : 5.5;
  const name = type === "boss" ? session.bossName : type === "elite" ? `${pick(eliteAffixes)} ${pick(familyTrashNames[family])}` : pick(familyTrashNames[family]);
  session.monsters.push({
    id: uid("monster"),
    name,
    type: "monster",
    monsterType: type,
    eliteAffixes: type === "elite" ? [name.split(" ")[0]] : undefined,
    hp: hpBase * scale,
    maxHp: hpBase * scale,
    resource: 0,
    maxResource: 0,
    shield: type === "shieldBearer" ? hpBase * scale * 0.25 : 0,
    attack: damageBase * (session.riftTier ? Math.pow(1.09, tier) : 1 + session.character.level * 0.045),
    armor: (type === "boss" ? 18 : type === "elite" ? 10 : 4) * (session.riftTier ? Math.pow(1.06, tier) : 1),
    level: Math.max(1, session.character.level + Math.floor(tier / 4)),
    position: { x: ARENA / 2 + Math.cos(angle) * radius, y: ARENA / 2 + Math.sin(angle) * radius },
    radius: type === "boss" ? 32 : type === "elite" ? 24 : 15,
    speed: type === "boss" ? 34 : type === "ranged" ? 42 : type === "elite" ? 58 : 68,
    attackCooldown: type === "boss" ? 1000 : type === "elite" ? 900 : 1200,
    attackTimer: 600,
    statusEffects: type === "elite" && name.includes("玄甲") ? [createStatus("hard_shell", undefined, 0)] : [],
  });
}

function updateStatusEffects(session: CombatSession, deltaMs: number) {
  const actors = [session.player, ...session.monsters, ...session.summons];
  actors.forEach((actor) => {
    actor.statusEffects.forEach((status) => {
      status.remainingMs -= deltaMs;
      if (!status.tickIntervalMs || !status.damagePerTick || actor.hp <= 0) return;
      status.tickTimerMs = (status.tickTimerMs ?? status.tickIntervalMs) - deltaMs;
      if (status.tickTimerMs > 0) return;
      status.tickTimerMs += status.tickIntervalMs;
      actor.hp -= status.damagePerTick;
      float(session, actor.position, status.name[0] ?? "", `${Math.floor(status.damagePerTick)}`, "damage", status.damagePerTick);
      const sourceSkill = status.sourceSkillId ? getSkill(status.sourceSkillId) : undefined;
      if (sourceSkill) recordHit(session, sourceSkill, status.damagePerTick, false);
    });
    actor.statusEffects = actor.statusEffects.filter((status) => status.remainingMs > 0);
  });
}

function moveMonsters(session: CombatSession, deltaMs: number) {
  session.monsters.forEach((monster) => {
    const desiredRange = monster.monsterType === "ranged" ? 190 : monster.radius + session.player.radius + 16;
    if (distance(monster.position, session.player.position) <= desiredRange) return;
    moveToward(monster, session.player.position, deltaMs, desiredRange);
  });
}

function separateCombatants(session: CombatSession) {
  session.monsters.forEach((monster) => {
    pushAwayFrom(monster, session.player.position, monster.radius + session.player.radius + 14, 1);
  });
  for (let i = 0; i < session.monsters.length; i += 1) {
    for (let j = i + 1; j < session.monsters.length; j += 1) {
      const a = session.monsters[i];
      const b = session.monsters[j];
      const minDistance = a.radius + b.radius + 8;
      const dx = b.position.x - a.position.x;
      const dy = b.position.y - a.position.y;
      const length = Math.hypot(dx, dy) || 1;
      if (length >= minDistance) continue;
      const push = (minDistance - length) * 0.5;
      a.position.x = clamp(a.position.x - (dx / length) * push, 18, ARENA - 18);
      a.position.y = clamp(a.position.y - (dy / length) * push, 18, ARENA - 18);
      b.position.x = clamp(b.position.x + (dx / length) * push, 18, ARENA - 18);
      b.position.y = clamp(b.position.y + (dy / length) * push, 18, ARENA - 18);
    }
  }
}

function resolveMonsterAttacks(session: CombatSession, deltaMs: number) {
  session.monsters.forEach((monster) => {
    monster.attackTimer -= deltaMs;
    const range = monster.monsterType === "ranged" ? 210 : monster.radius + session.player.radius + 12;
    if (monster.attackTimer <= 0 && distance(monster.position, session.player.position) <= range) {
      monster.attackTimer = monster.attackCooldown;
      const damage = Math.max(1, monster.attack - session.player.armor * 0.16);
      const absorbed = Math.min(session.player.shield, damage);
      session.player.shield -= absorbed;
      session.player.hp -= damage - absorbed;
      session.stats.damageTaken += damage - absorbed;
      session.stats.shieldAbsorbed += absorbed;
      float(session, session.player.position, "", `-${Math.floor(damage)}`, "damage", damage);
    }
  });
}

function cleanup(session: CombatSession) {
  session.monsters = session.monsters.filter((monster) => {
    if (monster.hp > 0) return true;
    session.kills += 1;
    const progressValue = monster.monsterType === "boss" ? 0 : monster.monsterType === "elite" ? 8 : 2.4;
    if (monster.monsterType === "elite") session.eliteKills += 1;
    if (monster.monsterType !== "boss") session.progress = clamp(session.progress + progressValue, 0, 100);
    return false;
  });
  session.summons = session.summons.filter((summon) => (summon.durationMs ?? 1) > 0 && summon.hp > 0);
  session.floats = session.floats.filter((entry) => session.elapsedMs - entry.createdAt < entry.durationMs).slice(-42);
  session.effects = session.effects.filter((entry) => session.elapsedMs - entry.createdAt < entry.durationMs).slice(-64);
}

function applySkillStatuses(target: CombatActor, skill: Skill, session: CombatSession) {
  skill.statusEffectIds?.forEach((statusId) => addStatus(target, createStatus(statusId, skill, session.player.attack * 0.35)));
  if (skill.tags.includes("lightning")) addStatus(target, createStatus("shock", skill, 0));
  if (skill.id === "ranger_quickshot" && Math.random() > 0.65) addStatus(target, createStatus("mark", skill, 0));
}

function addStatus(actor: CombatActor, status: CombatStatusEffect) {
  const existing = actor.statusEffects.find((entry) => entry.id === status.id);
  if (existing) {
    existing.remainingMs = status.durationMs;
    existing.stacks = Math.min(5, existing.stacks + 1);
    return;
  }
  actor.statusEffects.push(status);
}

function createStatus(id: string, skill?: Skill, damageSeed = 0): CombatStatusEffect {
  const sourceName = skill?.name ?? "词缀";
  const base = {
    id,
    sourceName,
    sourceSkillId: skill?.id,
    stacks: 1,
  };
  if (id === "burn") return { ...base, name: "燃烧", type: "dot", description: "持续受到火焰伤害。", durationMs: 4200, remainingMs: 4200, tickIntervalMs: 900, tickTimerMs: 900, damagePerTick: Math.max(2, damageSeed) };
  if (id === "poison") return { ...base, name: "中毒", type: "dot", description: "持续受到毒素伤害。", durationMs: 5200, remainingMs: 5200, tickIntervalMs: 1000, tickTimerMs: 1000, damagePerTick: Math.max(2, damageSeed * 0.8) };
  if (id === "freeze") return { ...base, name: "冰冻", type: "control", description: "短时间无法移动，受到的冰霜伤害提高。", durationMs: 1500, remainingMs: 1500 };
  if (id === "stun") return { ...base, name: "眩晕", type: "control", description: "短时间无法攻击。", durationMs: 1100, remainingMs: 1100 };
  if (id === "shock") return { ...base, name: "感电", type: "debuff", description: "受到雷电和范围伤害提高。", durationMs: 3600, remainingMs: 3600 };
  if (id === "mark") return { ...base, name: "灵识标记", type: "mark", description: "灵弓会优先攻击，受到灵弓伤害提高。", durationMs: 6000, remainingMs: 6000 };
  if (id === "element_shield") return { ...base, name: "护体灵幕", type: "shield", description: "灵幕优先吸收伤害。", durationMs: skill?.durationMs ?? 7000, remainingMs: skill?.durationMs ?? 7000 };
  if (id === "blood_shout") return { ...base, name: "长啸凝罡", type: "buff", description: "获得剑意和短暂防护。", durationMs: skill?.durationMs ?? 5000, remainingMs: skill?.durationMs ?? 5000 };
  if (id === "summon_ready") return { ...base, name: "召唤协同", type: "buff", description: "召唤物正在协同作战。", durationMs: skill?.durationMs ?? 8000, remainingMs: skill?.durationMs ?? 8000 };
  if (id === "summoned") return { ...base, name: "召唤物", type: "buff", description: "由应劫者战诀召唤，持续时间结束后消失。", durationMs: skill?.durationMs ?? 8000, remainingMs: skill?.durationMs ?? 8000 };
  return { ...base, name: "玄甲煞印", type: "buff", description: "获得额外防护。", durationMs: 999999, remainingMs: 999999 };
}

function chooseTarget(session: CombatSession, from = session.player.position) {
  if (!session.monsters.length) return undefined;
  const bosses = session.monsters.filter((monster) => monster.monsterType === "boss");
  const elites = session.monsters.filter((monster) => monster.monsterType === "elite");
  const pool = bosses.length ? bosses : elites.length ? elites : session.monsters;
  return [...pool].sort((a, b) => distance(a.position, from) - distance(b.position, from))[0];
}

function decayCooldowns(session: CombatSession, deltaMs: number) {
  Object.keys(session.cooldowns).forEach((key) => {
    session.cooldowns[key] = Math.max(0, session.cooldowns[key] - deltaMs);
  });
}

function recordCast(session: CombatSession, skill: Skill) {
  const entry = ensureSkillStats(session, skill);
  entry.casts += 1;
  entry.resourceSpent += skill.resourceCost;
  entry.resourceGained += skill.resourceGain ?? 0;
}

function recordHit(session: CombatSession, skill: Skill, damage: number, crit: boolean) {
  const entry = ensureSkillStats(session, skill);
  entry.hits += 1;
  entry.crits += crit ? 1 : 0;
  entry.totalDamage += damage;
  entry.maxDamage = Math.max(entry.maxDamage, damage);
  session.stats.totalDamage += damage;
}

function recordShield(session: CombatSession, skill: Skill, amount: number) {
  const entry = ensureSkillStats(session, skill);
  entry.totalShield += amount;
}

function ensureSkillStats(session: CombatSession, skill: Skill) {
  session.stats.skills[skill.id] ??= {
    skill,
    casts: 0,
    hits: 0,
    crits: 0,
    totalDamage: 0,
    maxDamage: 0,
    totalHealing: 0,
    totalShield: 0,
    resourceSpent: 0,
    resourceGained: 0,
  };
  return session.stats.skills[skill.id];
}

function float(session: CombatSession, position: Vector2, icon: string, text: string, type: FloatingText["type"], amount: number) {
  session.floats.push({
    id: uid("float"),
    x: position.x + Math.random() * 18 - 9,
    y: position.y + Math.random() * 18 - 9,
    icon,
    text,
    amount,
    type,
    createdAt: session.elapsedMs,
    durationMs: 900,
  });
}

function addSkillEffect(session: CombatSession, skill: Skill, from: Vector2, to: Vector2, radius?: number) {
  const element = skill.tags.includes("lightning")
    ? "lightning"
    : skill.tags.includes("fire")
      ? "fire"
      : skill.tags.includes("ice")
        ? "ice"
        : skill.tags.includes("poison")
          ? "poison"
          : skill.tags.includes("arcane")
            ? "arcane"
            : skill.tags.includes("melee")
              ? "melee"
              : "physical";
  const color = {
    lightning: "#facc15",
    fire: "#ef4444",
    ice: "#38bdf8",
    poison: "#22c55e",
    arcane: "#8b5cf6",
    melee: "#f97316",
    physical: "#64748b",
  }[element];
  const kind: SkillEffect["kind"] =
    element === "lightning"
      ? "bolt"
      : element === "fire"
        ? "orb"
        : skill.id === "warrior_whirlwind" || (skill.tags.includes("aoe") && !skill.tags.includes("melee"))
          ? "ring"
          : skill.tags.includes("melee")
            ? "slash"
            : "line";
  addEffect(session, {
    kind,
    from,
    to,
    color,
    radius: radius ?? skill.radius ?? (kind === "orb" ? 11 : 80),
    width: skill.tags.includes("aoe") ? 4 : 3,
    durationMs: kind === "orb" ? 700 : kind === "ring" ? 760 : 620,
  });
}

function addEffect(session: CombatSession, effect: Omit<SkillEffect, "id" | "createdAt">) {
  session.effects.push({
    ...effect,
    id: uid("effect"),
    from: { ...effect.from },
    to: { ...effect.to },
    createdAt: session.elapsedMs,
  });
}

function moveToward(actor: CombatActor, target: Vector2, deltaMs: number, stopDistance = 0) {
  const dx = target.x - actor.position.x;
  const dy = target.y - actor.position.y;
  const length = Math.hypot(dx, dy) || 1;
  const step = Math.min((actor.speed * deltaMs) / 1000, Math.max(0, length - stopDistance));
  actor.position.x = clamp(actor.position.x + (dx / length) * step, 18, ARENA - 18);
  actor.position.y = clamp(actor.position.y + (dy / length) * step, 18, ARENA - 18);
}

function pushAwayFrom(actor: CombatActor, point: Vector2, minDistance: number, weight: number) {
  const dx = actor.position.x - point.x;
  const dy = actor.position.y - point.y;
  const length = Math.hypot(dx, dy) || 1;
  if (length >= minDistance) return;
  const push = (minDistance - length) * weight;
  actor.position.x = clamp(actor.position.x + (dx / length) * push, 18, ARENA - 18);
  actor.position.y = clamp(actor.position.y + (dy / length) * push, 18, ARENA - 18);
}

function distance(a: Vector2, b: Vector2) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function getEffectiveDamageBonus(session: CombatSession, key: "damageBonus" | "meleeDamageBonus" | "rangedDamageBonus" | "aoeDamageBonus" | "dotDamageBonus" | "eliteDamageBonus" | "bossDamageBonus") {
  return session.effectiveStats[key];
}

function getEffectiveCooldownReduction(session: CombatSession) {
  return clamp(session.effectiveStats.cooldownReduction, 0, 0.45);
}

function getEffectiveCrit(session: CombatSession) {
  return clamp(session.effectiveStats.critChance, 0, 0.65);
}

function cloneSession(session: CombatSession): CombatSession {
  return {
    ...session,
    player: cloneActor(session.player),
    monsters: session.monsters.map(cloneActor),
    summons: session.summons.map(cloneActor),
    floats: session.floats.map((entry) => ({ ...entry })),
    effects: session.effects.map((entry) => ({ ...entry, from: { ...entry.from }, to: { ...entry.to } })),
    cooldowns: { ...session.cooldowns },
    lastCastAt: { ...session.lastCastAt },
    milestones: { ...session.milestones },
    stats: {
      ...session.stats,
      skills: { ...session.stats.skills },
      summonDamage: { ...session.stats.summonDamage },
    },
  };
}

function cloneActor(actor: CombatActor): CombatActor {
  return {
    ...actor,
    position: { ...actor.position },
    statusEffects: actor.statusEffects.map((status) => ({ ...status })),
  };
}
