import { eliteAffixes, familyTrashNames, getDungeon, getRiftBoss, getRiftModifiers, monsterScaling, monsterTemplates, riftPower } from "../data/dungeons";
import { emberMechanic } from "../data/seasonDataPack";
import { getSkill } from "../data/skills";
import type { Character, CombatReport, Dungeon, Item, RewardBundle, Skill } from "../types";
import { getEffectiveStats, getEquippedItems } from "../systems/characterSystem";
import { decideNextSkill } from "../systems/skillRuleSystem";
import { clamp, pick, uid } from "../systems/id";
import { createItem, rarityColor } from "../systems/lootSystem";
import type { CombatActor, CombatSession, CombatStatusEffect, FloatingText, SkillEffect, Vector2 } from "./combatTypes";

const ARENA = 560;
const PLAYER_EDGE_MARGIN = 86;

export function createCombatSession(options: {
  character: Character;
  inventory: Item[];
  dungeonId?: string;
  riftTier?: number;
}): CombatSession {
  const stats = getEffectiveStats(options.character, options.inventory);
  const equipped = getEquippedItems(options.character, options.inventory);
  const dungeon = options.riftTier ? undefined : getDungeon(options.dungeonId ?? "domain_qinglan_bamboo");
  const tier = options.riftTier ?? 0;
  const contentName = tier ? `归墟天阶 ${tier} 层` : dungeon!.name;
  const riftBoss = tier ? getRiftBoss(tier) : undefined;
  const activeModifiers = tier ? getRiftModifiers(tier) : [];
  const bossName = riftBoss?.name ?? dungeon!.bossName;
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
    equippedPowerIds: equipped.flatMap((item) => [item.legendaryPower?.id, item.seasonalPower?.id]).filter(Boolean) as string[],
    player,
    monsters: [],
    summons: [],
    floats: [],
    effects: [],
    droppedItems: [],
    cooldowns: {},
    lastCastAt: {},
    progress: 0,
    emberValue: 0,
    emberHeat: 0,
    riftModifiers: activeModifiers.map((modifier) => modifier.name),
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
  const resourcePerSecond = next.player.maxResource * 0.018 + next.effectiveStats.resourceRegen * 0.55;
  next.player.resource = clamp(next.player.resource + (resourcePerSecond * deltaMs) / 1000, 0, next.player.maxResource);
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
  movePlayer(next, deltaMs);
  moveMonsters(next, deltaMs);
  separateCombatants(next);
  updateSummons(next, deltaMs);
  castPlayerSkill(next);
  resolveMonsterAttacks(next, deltaMs);
  maybeTriggerEmberJudgement(next);
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
    summonCountForSkill: (skillId) => countSummons(session, skillId),
    summonLimit: (candidate) => getSummonLimit(session, candidate),
    shieldPercent: (player.shield / player.maxHp) * 100,
    progress: session.progress,
    cooldownReady: (skillId) => (session.cooldowns[skillId] ?? 0) <= 0,
    canCast: (candidate) =>
      (session.cooldowns[candidate.id] ?? 0) <= 0 &&
      player.resource >= getSkillResourceCost(session, candidate) &&
      (candidate.type !== "summon" || countSummons(session, candidate.id) < getSummonLimit(session, candidate)) &&
      (candidate.range === 0 || Boolean(target)),
    now: session.elapsedMs,
    lastCastAt: session.lastCastAt,
  });
  const resourceCost = skill ? getSkillResourceCost(session, skill) : 0;
  if (!skill || (session.cooldowns[skill.id] ?? 0) > 0 || player.resource < resourceCost) return;
  if (skill.range > 0 && target && distance(player.position, target.position) > skill.range + 70) return;
  session.cooldowns[skill.id] = getSkillCooldown(session, skill);
  session.lastCastAt[skill.id] = session.elapsedMs;
  player.resource = clamp(player.resource - resourceCost + (skill.resourceGain ?? 0), 0, player.maxResource);
  recordCast(session, skill, resourceCost);
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
  if (skill.type === "mobility") {
    performMobilitySkill(session, skill, target);
    return;
  }
  const targets =
    skill.id === "ranger_quickshot" && hasEquippedPower(session, "leg_archer_arrow_fan")
      ? chooseNearbyTargets(session, target, 4, 160)
      : skill.tags.includes("aoe")
        ? session.monsters.filter((monster) => distance(monster.position, target?.position ?? player.position) <= (skill.radius ?? 120))
        : target
          ? [target]
          : [];
  const quickshotScale = skill.id === "ranger_quickshot" && hasEquippedPower(session, "leg_archer_arrow_fan") ? 0.78 : 1;
  applySkillDamage(session, skill, targets, undefined, session.player.position, { damageScale: quickshotScale });
  if (skill.id === "ranger_piercing_arrow" && hasEquippedPower(session, "leg_archer_return_arrow") && targets.length) {
    applySkillDamage(session, skill, targets, undefined, targets[0].position, { damageScale: 0.62, label: "返矢", skipStatus: true });
  }
}

function applySkillDamage(
  session: CombatSession,
  skill: Skill,
  targets: CombatActor[],
  sourceName?: string,
  sourcePosition = session.player.position,
  options: { damageScale?: number; label?: string; skipStatus?: boolean } = {},
) {
  if (targets.length) addSkillEffect(session, skill, sourcePosition, targets[0].position, targets.length > 1 ? skill.radius : undefined);
  targets.forEach((monster) => {
    const crit = Math.random() < getEffectiveCrit(session);
    const statusBonus =
      (monster.statusEffects.some((status) => status.id === "mark") && skill.classId === "ranger" ? 0.18 : 0) +
      (monster.statusEffects.some((status) => status.id === "mark") && monster.monsterType === "boss" && hasEquippedPower(session, "leg_archer_boss_mark") ? 0.18 : 0) +
      (monster.statusEffects.some((status) => status.id === "ember_burn") ? 0.08 : 0) +
      (monster.statusEffects.some((status) => status.id === "shock") && skill.tags.includes("aoe") ? 0.12 : 0);
    const tagBonus =
      (skill.tags.includes("melee") ? getEffectiveDamageBonus(session, "meleeDamageBonus") : 0) +
      (skill.tags.includes("ranged") ? getEffectiveDamageBonus(session, "rangedDamageBonus") : 0) +
      (skill.tags.includes("aoe") ? getEffectiveDamageBonus(session, "aoeDamageBonus") : 0) +
      (skill.tags.includes("dot") ? getEffectiveDamageBonus(session, "dotDamageBonus") : 0) +
      (monster.monsterType === "elite" ? getEffectiveDamageBonus(session, "eliteDamageBonus") : 0) +
      (monster.monsterType === "boss" ? getEffectiveDamageBonus(session, "bossDamageBonus") : 0);
    const rank = Math.max(1, session.character.skillRanks[skill.id] ?? 1);
    const base = session.player.attack * skill.damageMultiplier * (1 + (rank - 1) * 0.14) * (sourceName ? 0.55 : 1) * (options.damageScale ?? 1);
    const damage = Math.max(1, base * (1 + getEffectiveDamageBonus(session, "damageBonus") + tagBonus + statusBonus) * (crit ? getEffectiveCritDamage(session) : 1) - monster.armor * 0.22);
    monster.hp -= damage;
    if (monster.monsterType === "boss") session.emberValue += damage >= monster.maxHp * 0.1 ? emberMechanic.gains.bossTenPercentHp : emberMechanic.gains.bossTenPercentHp * 0.08;
    if (!options.skipStatus) applySkillStatuses(monster, skill, session);
    float(session, monster.position, skill.icon, `${options.label ?? ""}${crit ? "!" : ""}${Math.floor(damage)}`, crit ? "crit" : "damage", damage);
    recordHit(session, skill, damage, crit);
    if (crit && skill.classId === "ranger" && hasEquippedPower(session, "leg_archer_focus_quiver")) restoreResource(session, 8, "聚息");
    if (skill.id === "ranger_quickshot" && hasEquippedPower(session, "leg_archer_arrow_fan")) session.emberValue += 1.2;
    if (sourceName) session.stats.summonDamage[sourceName] = (session.stats.summonDamage[sourceName] ?? 0) + damage;
  });
}

function summonActor(session: CombatSession, skill: Skill) {
  if (countSummons(session, skill.id) >= getSummonLimit(session, skill)) return;
  const offset = { x: Math.random() * 60 - 30, y: Math.random() * 60 - 30 };
  const name = skill.id === "warrior_banner" ? "镇岳剑旗" : skill.id === "ranger_poison_trap" ? "毒藤符阵" : skill.id === "mage_mirror" ? "分神化影" : "玄狼灵契";
  const summonDamage = session.effectiveStats.summonDamageBonus;
  const summonHaste = clamp(summonDamage * 0.22, 0, 0.4);
  session.summons.push({
    id: uid("summon"),
    name,
    type: "summon",
    hp: session.player.maxHp * 0.35,
    maxHp: session.player.maxHp * 0.35,
    resource: 0,
    maxResource: 0,
    shield: 0,
    attack: session.player.attack * (skill.id === "ranger_wolf" ? 0.95 : 0.72) * (1 + summonDamage),
    armor: session.player.armor * 0.4,
    level: session.player.level,
    position: { x: session.player.position.x + offset.x, y: session.player.position.y + offset.y },
    radius: skill.id === "warrior_banner" ? 13 : 10,
    speed: skill.id === "warrior_banner" || skill.id === "ranger_poison_trap" ? 0 : 110,
    attackCooldown: (skill.id === "warrior_banner" ? 850 : 700) * (1 - summonHaste),
    attackTimer: 0,
    ownerActorId: "player",
    sourceSkillId: skill.id,
    durationMs: (skill.durationMs ?? 8000) * getSummonDurationMultiplier(session, skill),
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
      if (skill.id === "ranger_poison_trap" && hasEquippedPower(session, "leg_archer_poison_cloud")) {
        applySkillDamage(session, skill, targets, summon.name, summon.position, { damageScale: 0.42, label: "毒雾" });
      }
      if (hasEquippedPower(session, "season_relic_ember_wolf_charm") && targets.some((target) => target.statusEffects.some((status) => status.id === "ember_burn"))) {
        applySkillDamage(session, skill, targets, summon.name, summon.position, { damageScale: 0.35, label: "火狼", skipStatus: true });
      }
      if (skill.id === "ranger_wolf" && hasEquippedPower(session, "leg_archer_double_wolf") && Math.random() < 0.28) {
        targets.forEach((target) => addStatus(target, createStatus("mark", skill, 0)));
        restoreResource(session, 3, "狼契");
      }
    }
  });
}

function spawnMonster(session: CombatSession, type: CombatActor["monsterType"]) {
  const angle = Math.random() * Math.PI * 2;
  const radius = ARENA / 2 + 30;
  const family = session.dungeon?.family ?? pick(["beast", "ghost", "demonic", "construct", "fiend"] as const);
  const tier = session.riftTier ?? 0;
  const scaling = monsterScaling(tier);
  const localScale = session.riftTier ? 1 : 1 + session.character.level * 0.08;
  const template = pickMonsterTemplate(family, type);
  const hpBase = type === "boss" ? template.baseHp * 5 : type === "elite" ? template.baseHp * 2.6 : template.baseHp;
  const damageBase = type === "boss" ? template.baseDamage * 2.2 : type === "elite" ? template.baseDamage * 1.45 : template.baseDamage;
  const eliteMarkNames = type === "elite" ? pickEliteMarks(tier) : [];
  const name = type === "boss" ? session.bossName : type === "elite" ? `${eliteMarkNames.map((mark) => mark.split("煞印")[0]).join("·")} ${template.name}` : template.name;
  const modifierRisk = (session.riftModifiers?.length ?? 0) * 0.04;
  session.monsters.push({
    id: uid("monster"),
    name,
    type: "monster",
    monsterType: type,
    eliteAffixes: type === "elite" ? eliteMarkNames : undefined,
    hp: hpBase * localScale * scaling.hp * (1 + modifierRisk),
    maxHp: hpBase * localScale * scaling.hp * (1 + modifierRisk),
    resource: 0,
    maxResource: 0,
    shield: type === "shieldBearer" ? hpBase * localScale * scaling.hp * 0.25 : 0,
    attack: damageBase * (session.riftTier ? scaling.damage : 1 + session.character.level * 0.045) * (1 + session.emberHeat * 0.02),
    armor: template.baseArmor * (type === "boss" ? 2.8 : type === "elite" ? 1.8 : 1) * scaling.armor,
    level: Math.max(1, session.character.level + Math.floor(tier / 4)),
    position: { x: ARENA / 2 + Math.cos(angle) * radius, y: ARENA / 2 + Math.sin(angle) * radius },
    radius: type === "boss" ? 32 : type === "elite" ? 24 : 15,
    speed: getMonsterMoveSpeed(type, template.moveSpeed ?? 64) * scaling.moveSpeed,
    attackCooldown: getMonsterAttackCooldown(type, template.attackRange),
    attackTimer: 600,
    statusEffects: type === "elite" && name.includes("玄甲") ? [createStatus("hard_shell", undefined, 0)] : [],
  });
}

function pickMonsterTemplate(family: NonNullable<CombatActor["monsterType"]> extends never ? never : ReturnType<typeof getDungeon>["family"], type: CombatActor["monsterType"]) {
  if (type === "boss") {
    return monsterTemplates.find((monster) => monster.type === "boss" && monster.family === family) ?? monsterTemplates.find((monster) => monster.type === "boss")!;
  }
  if (type === "elite") {
    return monsterTemplates.find((monster) => monster.family === family && monster.type !== "boss" && monster.type !== "healer") ?? monsterTemplates[0];
  }
  return monsterTemplates.find((monster) => monster.family === family && monster.type === type) ?? monsterTemplates.find((monster) => monster.family === family && monster.type === "trash") ?? monsterTemplates[0];
}

function pickEliteMarks(tier: number) {
  const available = eliteAffixes.filter((_, index) => {
    if (tier >= 70) return true;
    if (tier >= 40) return index < 16;
    if (tier >= 20) return index < 8;
    return index < 2;
  });
  const count = tier >= 61 ? 3 : tier >= 20 ? 2 : 1;
  return Array.from({ length: count }, () => pick(available));
}

function maybeTriggerEmberJudgement(session: CombatSession) {
  if (session.emberValue < emberMechanic.maxEmberValue) return;
  session.emberValue -= emberMechanic.maxEmberValue;
  session.emberHeat = Math.min(emberMechanic.heatCap, session.emberHeat + 1);
  const radius = emberMechanic.judgement.radius * (session.emberHeat >= 3 ? 1.1 : 1);
  const damage = session.player.attack * emberMechanic.judgement.damageMultiplier * (1 + session.emberHeat * 0.1);
  const targets = session.monsters.filter((monster) => distance(monster.position, session.player.position) <= radius);
  targets.forEach((monster) => {
    monster.hp -= damage;
    addStatus(monster, createStatus("ember_burn", undefined, session.player.attack * emberMechanic.burnStatus.tickDamageMultiplier));
    float(session, monster.position, "火", `${Math.floor(damage)}`, "crit", damage);
  });
  session.stats.totalDamage += damage * targets.length;
  addEffect(session, {
    kind: "ring",
    from: session.player.position,
    to: session.player.position,
    color: "#f97316",
    radius,
    width: 6,
    durationMs: 920,
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

function movePlayer(session: CombatSession, deltaMs: number) {
  const player = session.player;
  const movement = session.character.movement;
  if (movement.strategy === "standStill" || !session.monsters.length) return;
  const target = chooseTarget(session);
  const nearest = [...session.monsters].sort((a, b) => distance(a.position, player.position) - distance(b.position, player.position))[0];
  if (!target || !nearest) return;

  const nearbyThreats = session.monsters.filter((monster) => distance(monster.position, player.position) <= 150);
  const dangerCenter = nearbyThreats.length
    ? averagePosition(nearbyThreats.map((monster) => monster.position))
    : nearest.position;
  const targetDistance = distance(player.position, target.position);
  const nearestDistance = distance(player.position, nearest.position);
  const preferred = movement.preferredRange;
  const bossThreat = session.monsters.find((monster) => monster.monsterType === "boss");
  const pinnedByBoss = Boolean(bossThreat && nearestDistance < preferred * 1.05 && isNearWall(player.position, PLAYER_EDGE_MARGIN + 18));
  let desired: Vector2 | undefined;
  let reason: NonNullable<CombatSession["movementIntent"]>["reason"] = "retreat";

  const existingIntent = session.movementIntent;
  if (
    existingIntent &&
    existingIntent.expiresAt > session.elapsedMs &&
    distance(player.position, existingIntent.target) > 18 &&
    !pinnedByBoss
  ) {
    desired = existingIntent.target;
    reason = existingIntent.reason;
  } else if (movement.strategy === "kite" || movement.strategy === "avoidDanger") {
    if (pinnedByBoss) {
      desired = kiteEscapePoint(player.position, bossThreat!.position, dangerCenter, 170);
      reason = "orbit";
    } else if (nearestDistance < preferred * 0.82 || nearbyThreats.length >= 3) {
      desired = kiteEscapePoint(player.position, nearest.position, dangerCenter, 135);
      reason = isNearWall(player.position, PLAYER_EDGE_MARGIN) ? "orbit" : "retreat";
    } else if (targetDistance > preferred * 1.45 && nearestDistance > preferred * 0.98) {
      desired = target.position;
      reason = "advance";
    }
  } else if (movement.strategy === "keepMediumRange") {
    if (pinnedByBoss) {
      desired = kiteEscapePoint(player.position, bossThreat!.position, dangerCenter, 150);
      reason = "orbit";
    } else if (nearestDistance < preferred * 0.68) {
      desired = kiteEscapePoint(player.position, nearest.position, dangerCenter, 105);
      reason = isNearWall(player.position, PLAYER_EDGE_MARGIN) ? "orbit" : "retreat";
    } else if (targetDistance > preferred * 1.3 && nearestDistance > preferred * 0.9) {
      desired = target.position;
      reason = "advance";
    }
  } else if (movement.strategy === "chaseElite") {
    if (targetDistance > preferred) desired = target.position;
    else if (nearestDistance < 42) desired = kiteEscapePoint(player.position, nearest.position, dangerCenter, 58);
    reason = targetDistance > preferred ? "advance" : "retreat";
  }

  desired = smoothDestination(player.position, desired);
  if (!desired || distance(player.position, desired) < 14) {
    session.movementIntent = undefined;
    return;
  }
  if (!existingIntent || existingIntent.expiresAt <= session.elapsedMs || distance(existingIntent.target, desired) > 46 || pinnedByBoss) {
    session.movementIntent = {
      target: desired,
      expiresAt: session.elapsedMs + (reason === "orbit" ? 900 : 650),
      reason,
    };
  }
  const before = { ...player.position };
  moveToward(player, desired, deltaMs, movement.strategy === "chaseElite" ? preferred : 0);
  if (distance(before, player.position) <= 0.4) return;
  addStatus(player, createStatus("moving_flow", undefined, 0));
  if (hasEquippedPower(session, "season_relic_void_ember_boots")) burnTrail(session, before);
}

function performMobilitySkill(session: CombatSession, skill: Skill, target?: CombatActor) {
  const player = session.player;
  const threat = target ?? chooseTarget(session);
  const destination = threat ? pointAway(player.position, threat.position, skill.id === "ranger_shadow_step" ? 150 : 95) : { x: ARENA / 2, y: ARENA / 2 };
  const before = { ...player.position };
  moveToward(player, destination, 1000, 0);
  addStatus(player, createStatus("moving_flow", skill, 0));
  if (skill.id === "ranger_shadow_step") addStatus(player, createStatus("shadow_step_guard", skill, 0));
  if (hasEquippedPower(session, "leg_archer_shadow_guard")) {
    addEffect(session, {
      kind: "ring",
      from: before,
      to: before,
      color: "#64748b",
      radius: 46,
      width: 4,
      durationMs: 1800,
    });
    session.monsters.forEach((monster) => {
      if (distance(monster.position, before) <= 120) addStatus(monster, createStatus("shadow_decoy", skill, 0));
    });
  }
  if (hasEquippedPower(session, "season_relic_void_ember_boots")) burnTrail(session, before);
  float(session, player.position, skill.icon, "踏影", "shield", 0);
}

function moveMonsters(session: CombatSession, deltaMs: number) {
  session.monsters.forEach((monster) => {
    if (monster.statusEffects.some((status) => status.id === "freeze" || status.id === "stun")) return;
    const desiredRange =
      monster.monsterType === "ranged" || monster.monsterType === "healer" || monster.monsterType === "summoner"
        ? 190
        : monster.monsterType === "boss"
          ? 92
          : monster.radius + session.player.radius + 16;
    if (distance(monster.position, session.player.position) <= desiredRange) return;
    const controlFactor = monster.statusEffects.some((status) => status.id === "shadow_decoy") ? 0.45 : 1;
    moveToward(monster, session.player.position, deltaMs * controlFactor, desiredRange);
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
    const range =
      monster.monsterType === "ranged" || monster.monsterType === "healer" || monster.monsterType === "summoner"
        ? 210
        : monster.monsterType === "boss"
          ? 104
          : monster.radius + session.player.radius + 12;
    if (monster.attackTimer <= 0 && distance(monster.position, session.player.position) <= range) {
      monster.attackTimer = monster.attackCooldown;
      const guardianReduction = hasEquippedPower(session, "leg_guardian_robes") && session.summons.length ? 0.9 : 1;
      const movingReduction = session.player.statusEffects.some((status) => status.id === "moving_flow") && hasEquippedPower(session, "leg_void_boots") ? 0.85 : 1;
      const shadowReduction = session.player.statusEffects.some((status) => status.id === "shadow_step_guard") ? 0.82 : 1;
      const damage = Math.max(1, (monster.attack - session.player.armor * 0.16) * guardianReduction * movingReduction * shadowReduction);
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
    rollMonsterDrop(session, monster);
    session.kills += 1;
    const progressValue = monster.monsterType === "boss" ? 0 : monster.monsterType === "elite" ? 8 : monster.monsterType === "ranged" || monster.monsterType === "summoner" || monster.monsterType === "healer" ? 3 : 2.4;
    if (monster.monsterType === "elite") session.eliteKills += 1;
    if (monster.monsterType !== "boss") session.progress = clamp(session.progress + progressValue, 0, 100);
    if (monster.monsterType === "elite") session.emberValue += emberMechanic.gains.eliteKill;
    else if (monster.monsterType !== "boss") session.emberValue += monster.monsterType === "ranged" || monster.monsterType === "summoner" || monster.monsterType === "healer" ? emberMechanic.gains.specialKill : emberMechanic.gains.trashKill;
    if (monster.statusEffects.some((status) => status.id === "ember_burn") && hasEquippedPower(session, "season_relic_ember_ring")) {
      restoreResource(session, 14, "归元");
      const healing = session.player.maxHp * 0.015;
      session.player.hp = clamp(session.player.hp + healing, 0, session.player.maxHp);
      session.stats.totalHealing += healing;
      float(session, session.player.position, "戒", `+${Math.floor(healing)}`, "heal", healing);
    }
    return false;
  });
  session.summons = session.summons.filter((summon) => (summon.durationMs ?? 1) > 0 && summon.hp > 0);
  session.floats = session.floats.filter((entry) => session.elapsedMs - entry.createdAt < entry.durationMs).slice(-42);
  session.effects = session.effects.filter((entry) => session.elapsedMs - entry.createdAt < entry.durationMs).slice(-64);
}

function rollMonsterDrop(session: CombatSession, monster: CombatActor) {
  const tier = session.riftTier ?? 0;
  const contentLevel = tier ? session.character.level : (session.dungeon?.recommendedLevel[1] ?? session.character.level);
  const isBoss = monster.monsterType === "boss";
  const isElite = monster.monsterType === "elite";
  const isSpecial = monster.monsterType === "ranged" || monster.monsterType === "summoner" || monster.monsterType === "healer" || monster.monsterType === "shieldBearer" || monster.monsterType === "bomber";
  const tierBonus = Math.min(0.18, tier * 0.0015);
  const chance = isBoss ? 1 : isElite ? 0.72 + tierBonus : isSpecial ? 0.16 + tierBonus * 0.6 : 0.08 + tierBonus * 0.4;
  if (Math.random() > chance) return;
  const count = isBoss ? 2 + Math.floor(tier / 30) : isElite && Math.random() < 0.18 + tierBonus ? 2 : 1;
  for (let index = 0; index < count; index += 1) {
    const item = createItem(session.character, contentLevel, tier);
    session.droppedItems.push(item);
    float(session, monster.position, "✦", item.baseName, "resource", item.power);
    addEffect(session, {
      kind: "ring",
      from: monster.position,
      to: monster.position,
      color: rarityColor(item.rarity),
      radius: monster.radius + 18,
      width: 3,
      durationMs: 900,
    });
  }
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
  if (id === "ember_burn") return { ...base, name: "劫火灼身", type: "dot", description: "每秒受到劫火伤害，受到玩家与召唤物伤害提高。", durationMs: 6000, remainingMs: 6000, tickIntervalMs: 1000, tickTimerMs: 1000, damagePerTick: Math.max(2, damageSeed) };
  if (id === "poison") return { ...base, name: "中毒", type: "dot", description: "持续受到毒素伤害。", durationMs: 5200, remainingMs: 5200, tickIntervalMs: 1000, tickTimerMs: 1000, damagePerTick: Math.max(2, damageSeed * 0.8) };
  if (id === "freeze") return { ...base, name: "冰冻", type: "control", description: "短时间无法移动，受到的冰霜伤害提高。", durationMs: 1500, remainingMs: 1500 };
  if (id === "stun") return { ...base, name: "眩晕", type: "control", description: "短时间无法攻击。", durationMs: 1100, remainingMs: 1100 };
  if (id === "shock") return { ...base, name: "感电", type: "debuff", description: "受到雷电和范围伤害提高。", durationMs: 3600, remainingMs: 3600 };
  if (id === "mark") return { ...base, name: "灵识标记", type: "mark", description: "灵弓会优先攻击，受到灵弓伤害提高。", durationMs: 6000, remainingMs: 6000 };
  if (id === "moving_flow") return { ...base, name: "流风步", type: "buff", description: "正在移动，移动类法宝可借势生效。", durationMs: 650, remainingMs: 650 };
  if (id === "shadow_step_guard") return { ...base, name: "踏影护身", type: "buff", description: "踏影后短暂降低受到的伤害。", durationMs: 3000, remainingMs: 3000 };
  if (id === "shadow_decoy") return { ...base, name: "影身牵制", type: "debuff", description: "被影身扰乱，行动节奏下降。", durationMs: 2000, remainingMs: 2000 };
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

function recordCast(session: CombatSession, skill: Skill, resourceCost = skill.resourceCost) {
  const entry = ensureSkillStats(session, skill);
  entry.casts += 1;
  entry.resourceSpent += resourceCost;
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

function burnTrail(session: CombatSession, position: Vector2) {
  const damage = session.player.attack * 0.28;
  const targets = session.monsters.filter((monster) => distance(monster.position, position) <= 72);
  targets.forEach((monster) => {
    monster.hp -= damage;
    addStatus(monster, createStatus("ember_burn", undefined, session.player.attack * 0.12));
    float(session, monster.position, "火", `${Math.floor(damage)}`, "damage", damage);
  });
  if (targets.length) session.stats.totalDamage += damage * targets.length;
  addEffect(session, {
    kind: "ring",
    from: position,
    to: position,
    color: "#fb923c",
    radius: 72,
    width: 2,
    durationMs: 520,
  });
}

function averagePosition(points: Vector2[]) {
  return {
    x: points.reduce((sum, point) => sum + point.x, 0) / Math.max(1, points.length),
    y: points.reduce((sum, point) => sum + point.y, 0) / Math.max(1, points.length),
  };
}

function pointAway(from: Vector2, threat: Vector2, distanceValue: number) {
  const dx = from.x - threat.x;
  const dy = from.y - threat.y;
  const length = Math.hypot(dx, dy) || 1;
  return {
    x: clamp(from.x + (dx / length) * distanceValue, 24, ARENA - 24),
    y: clamp(from.y + (dy / length) * distanceValue, 24, ARENA - 24),
  };
}

function kiteEscapePoint(current: Vector2, threat: Vector2, dangerCenter: Vector2, distanceValue: number) {
  const away = pointAway(current, dangerCenter, distanceValue);
  if (!isNearWall(current, PLAYER_EDGE_MARGIN) && !wouldHitWall(away, 34)) return away;
  const tangentA = tangentPoint(current, threat, distanceValue, 1);
  const tangentB = tangentPoint(current, threat, distanceValue, -1);
  const centerBias = pointOnLine(current, { x: ARENA / 2, y: ARENA / 2 }, 0.48);
  return [tangentA, tangentB, centerBias, away].sort((a, b) => escapeScore(b, threat) - escapeScore(a, threat))[0];
}

function tangentPoint(current: Vector2, threat: Vector2, distanceValue: number, direction: 1 | -1) {
  const dx = current.x - threat.x;
  const dy = current.y - threat.y;
  const length = Math.hypot(dx, dy) || 1;
  const tx = (-dy / length) * direction;
  const ty = (dx / length) * direction;
  const center = { x: ARENA / 2, y: ARENA / 2 };
  const centerDx = center.x - current.x;
  const centerDy = center.y - current.y;
  return {
    x: clamp(current.x + tx * distanceValue + centerDx * 0.24, 28, ARENA - 28),
    y: clamp(current.y + ty * distanceValue + centerDy * 0.24, 28, ARENA - 28),
  };
}

function smoothDestination(current: Vector2, desired?: Vector2) {
  if (!desired) return undefined;
  const edge = edgePressure(current);
  const center = { x: ARENA / 2, y: ARENA / 2 };
  const centerWeight = edge > 0 ? Math.min(0.62, edge * 0.7) : 0.08;
  const blended = {
    x: desired.x * (1 - centerWeight) + center.x * centerWeight,
    y: desired.y * (1 - centerWeight) + center.y * centerWeight,
  };
  return { x: clamp(blended.x, 28, ARENA - 28), y: clamp(blended.y, 28, ARENA - 28) };
}

function escapeScore(point: Vector2, threat: Vector2) {
  const wallRoom = Math.min(point.x, point.y, ARENA - point.x, ARENA - point.y);
  return wallRoom * 2 + distance(point, threat) * 0.35 - distance(point, { x: ARENA / 2, y: ARENA / 2 }) * 0.15;
}

function edgePressure(point: Vector2) {
  const room = Math.min(point.x, point.y, ARENA - point.x, ARENA - point.y);
  return clamp((PLAYER_EDGE_MARGIN - room) / PLAYER_EDGE_MARGIN, 0, 1);
}

function isNearWall(point: Vector2, margin: number) {
  return point.x < margin || point.x > ARENA - margin || point.y < margin || point.y > ARENA - margin;
}

function wouldHitWall(point: Vector2, margin: number) {
  return point.x <= margin || point.x >= ARENA - margin || point.y <= margin || point.y >= ARENA - margin;
}

function getMonsterMoveSpeed(type: CombatActor["monsterType"], templateSpeed: number) {
  const multiplier = {
    boss: 0.72,
    elite: 1.02,
    ranged: 0.76,
    charger: 1.18,
    healer: 0.62,
    shieldBearer: 0.55,
    summoner: 0.64,
    bomber: 1.12,
    trash: 0.94,
  }[type ?? "trash"];
  return templateSpeed * multiplier;
}

function getMonsterAttackCooldown(type: CombatActor["monsterType"], attackRange?: number) {
  if (type === "boss") return 1120;
  if (type === "elite") return 980;
  if (type === "ranged") return attackRange && attackRange > 215 ? 1320 : 1220;
  if (type === "healer" || type === "summoner") return 1480;
  if (type === "bomber") return 860;
  if (type === "charger") return 1040;
  if (type === "shieldBearer") return 1380;
  return 1220;
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

function pointOnLine(from: Vector2, to: Vector2, t: number) {
  return {
    x: from.x + (to.x - from.x) * t,
    y: from.y + (to.y - from.y) * t,
  };
}

function getEffectiveDamageBonus(session: CombatSession, key: "damageBonus" | "meleeDamageBonus" | "rangedDamageBonus" | "aoeDamageBonus" | "dotDamageBonus" | "eliteDamageBonus" | "bossDamageBonus") {
  return session.effectiveStats[key];
}

function getEffectiveCooldownReduction(session: CombatSession) {
  return clamp(session.effectiveStats.cooldownReduction, 0, 0.72);
}

function getEffectiveCrit(session: CombatSession) {
  return clamp(session.effectiveStats.critChance, 0, 0.65);
}

function getEffectiveCritDamage(session: CombatSession) {
  return clamp(session.effectiveStats.critDamage, 1.25, 2.8);
}

function getSkillResourceCost(session: CombatSession, skill: Skill) {
  let cost = skill.resourceCost;
  if (!cost) return 0;
  if (hasEquippedPower(session, "leg_resource_wheel") && session.player.resource / session.player.maxResource < 0.3) cost *= 0.72;
  if (hasEquippedPower(session, "leg_archer_focus_quiver") && skill.classId === "ranger" && skill.type === "core") cost *= 0.86;
  if (hasEquippedPower(session, "season_relic_ember_ring") && skill.classId === "ranger") cost *= 0.92;
  return Math.max(1, Math.floor(cost));
}

function getSkillCooldown(session: CombatSession, skill: Skill) {
  let cooldown = skill.cooldownMs * (1 - getEffectiveCooldownReduction(session));
  if (hasEquippedPower(session, "leg_archer_focus_quiver") && skill.classId === "ranger" && skill.type === "core") cooldown *= 0.82;
  if (hasEquippedPower(session, "season_relic_tribulation_crown") && session.emberHeat >= 5) cooldown *= 0.78;
  return Math.max(260, cooldown);
}

function restoreResource(session: CombatSession, amount: number, label: string) {
  if (amount <= 0) return;
  const before = session.player.resource;
  session.player.resource = clamp(session.player.resource + amount, 0, session.player.maxResource);
  const gained = session.player.resource - before;
  if (gained <= 0) return;
  float(session, session.player.position, "", `${label}+${Math.floor(gained)}`, "resource", gained);
}

function chooseNearbyTargets(session: CombatSession, target: CombatActor | undefined, count: number, radius: number) {
  if (!target) return [];
  const near = session.monsters
    .filter((monster) => monster.id === target.id || distance(monster.position, target.position) <= radius)
    .sort((a, b) => distance(a.position, target.position) - distance(b.position, target.position));
  return near.slice(0, count);
}

function countSummons(session: CombatSession, skillId: string) {
  return session.summons.filter((summon) => summon.sourceSkillId === skillId).length;
}

function getSummonLimit(session: CombatSession, skill: Skill) {
  if (skill.type !== "summon") return 0;
  let limit = 1;
  if (skill.id === "ranger_wolf") {
    if (hasEquippedPower(session, "leg_archer_double_wolf")) limit += 1;
    if (hasEquippedAffix(session, "archer_wolf_count") || hasEquippedAffix(session, "suf_pet")) limit += 1;
  }
  if (skill.id === "mage_mirror" && hasEquippedPower(session, "leg_mage_mirror_gem")) limit += 1;
  if (skill.id === "warrior_banner" && hasEquippedAffix(session, "sword_banner_duration")) limit += 1;
  return clamp(limit, 1, 3);
}

function getSummonDurationMultiplier(session: CombatSession, skill: Skill) {
  let multiplier = 1;
  if (skill.id === "ranger_wolf" && hasEquippedPower(session, "leg_archer_double_wolf")) multiplier += 0.35;
  if (skill.id === "ranger_wolf" && hasEquippedAffix(session, "suf_pet")) multiplier += 0.25;
  if (skill.id === "mage_mirror" && hasEquippedPower(session, "leg_mage_mirror_gem")) multiplier += 0.25;
  if (skill.id === "warrior_banner" && hasEquippedAffix(session, "sword_banner_duration")) multiplier += 0.25;
  return multiplier;
}

function equippedItems(session: CombatSession) {
  return getEquippedItems(session.character, session.character.inventory);
}

function hasEquippedPower(session: CombatSession, powerId: string) {
  return session.equippedPowerIds.includes(powerId) || equippedItems(session).some((item) => item.legendaryPower?.id === powerId || item.seasonalPower?.id === powerId);
}

function hasEquippedAffix(session: CombatSession, affixId: string) {
  return equippedItems(session).some((item) => [...item.prefixes, ...item.suffixes].some((affix) => affix.id === affixId));
}

function cloneSession(session: CombatSession): CombatSession {
  return {
    ...session,
    player: cloneActor(session.player),
    monsters: session.monsters.map(cloneActor),
    summons: session.summons.map(cloneActor),
    floats: session.floats.map((entry) => ({ ...entry })),
    effects: session.effects.map((entry) => ({ ...entry, from: { ...entry.from }, to: { ...entry.to } })),
    droppedItems: (session.droppedItems ?? []).map((item) => ({ ...item, implicitStats: { ...item.implicitStats }, prefixes: [...item.prefixes], suffixes: [...item.suffixes] })),
    movementIntent: session.movementIntent ? { ...session.movementIntent, target: { ...session.movementIntent.target } } : undefined,
    equippedPowerIds: [...session.equippedPowerIds],
    cooldowns: { ...session.cooldowns },
    lastCastAt: { ...session.lastCastAt },
    milestones: { ...session.milestones },
    riftModifiers: session.riftModifiers ? [...session.riftModifiers] : undefined,
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
