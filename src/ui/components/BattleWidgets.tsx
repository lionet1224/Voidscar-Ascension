import { useEffect, useRef, type CSSProperties } from "react";
import type { CombatActor, CombatSession, SkillEffect } from "../../combat/combatTypes";
import { getSkill } from "../../data/skills";
import { formatNumber } from "../../systems/id";
import { battleStateLabels } from "../labels";
import { SkillTooltip } from "./InfoTooltip";

export function BattleCanvas({
  getSession,
  onSelectActor,
}: {
  getSession: () => CombatSession | undefined;
  onSelectActor: (actorId: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const getSessionRef = useRef(getSession);
  getSessionRef.current = getSession;

  useEffect(() => {
    let frame = 0;
    const render = () => {
      const current = getSessionRef.current();
      if (current) {
        drawCombat(canvasRef.current, current);
      } else {
        drawEmpty(canvasRef.current);
      }
      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={560}
      height={560}
      className="battle-canvas"
      onClick={(event) => {
        const current = getSessionRef.current();
        if (!current || !canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * canvasRef.current.width;
        const y = ((event.clientY - rect.top) / rect.height) * canvasRef.current.height;
        onSelectActor(pickActorAt(current, x, y));
      }}
    />
  );
}

export function ActorStatusPanel({ actor }: { actor?: CombatActor }) {
  if (!actor) return null;
  const visibleStatuses = actor.statusEffects.slice(0, 8);
  const hiddenStatusCount = Math.max(0, actor.statusEffects.length - visibleStatuses.length);
  return (
    <div className="actor-status">
      <div className="actor-status-head">
        <strong>{actor.type === "player" ? "应劫者状态" : actor.name}</strong>
        <span>等级 {actor.level}</span>
      </div>
      <div className="mini-bars">
        <div><span>生命</span><b>{Math.max(0, Math.ceil(actor.hp))}/{Math.ceil(actor.maxHp)}</b></div>
        {actor.type === "player" && <div><span>灵元</span><b>{Math.floor(actor.resource)}/{Math.floor(actor.maxResource)}</b></div>}
        {actor.shield > 0 && <div><span>护盾</span><b>{Math.floor(actor.shield)}</b></div>}
      </div>
      <div className="status-list">
        {actor.statusEffects.length ? (
          <>
            {visibleStatuses.map((status) => (
              <div className="status-chip" key={`${status.id}-${status.sourceSkillId ?? status.sourceName}`} style={{ borderLeftColor: statusColor(status.type) }}>
                <strong>{status.name}{status.stacks > 1 ? ` x${status.stacks}` : ""}</strong>
                <span>{status.description}</span>
                <small>来源：{status.sourceName} · 剩余 {Math.ceil(status.remainingMs / 1000)}秒</small>
              </div>
            ))}
            {hiddenStatusCount > 0 && <p className="muted">另有 {hiddenStatusCount} 个状态正在生效。</p>}
          </>
        ) : (
          <p className="muted">没有增益或异常状态。点击画布上的劫煞可查看它身上的状态。</p>
        )}
      </div>
    </div>
  );
}

export function SkillBreakdown({ session }: { session: CombatSession }) {
  const entries = Object.values(session.stats.skills).sort((a, b) => b.totalDamage - a.totalDamage);
  return (
    <div className="breakdown">
      {entries.map((entry) => (
        <div className="item-hover-scope" tabIndex={0} key={entry.skill.id}>
          <span>{entry.skill.icon} {entry.skill.name}</span>
          <strong>{formatNumber(entry.totalDamage)}</strong>
          <SkillTooltip skill={entry.skill} rank={session.character.skillRanks[entry.skill.id] ?? 1} casts={entry.casts} />
        </div>
      ))}
    </div>
  );
}

export function SkillCooldownBar({ session }: { session?: CombatSession }) {
  if (!session) return <p className="muted skill-cooldown-empty">开始推演后，已装备战诀会在这里显示释放与冷却。</p>;
  const skills = session.character.skillLoadout.skillIds
    .slice(0, 5)
    .map((id) => getSkill(id))
    .filter((skill): skill is NonNullable<ReturnType<typeof getSkill>> => skill !== undefined);
  return (
    <div className="skill-cooldown-list" aria-label="战诀冷却">
      {skills.map((skill) => {
        const remaining = Math.max(0, session.cooldowns[skill.id] ?? 0);
        const lastCastAt = session.lastCastAt[skill.id];
        const elapsedSinceCast = lastCastAt === undefined ? undefined : session.elapsedMs - lastCastAt;
        const totalCooldown = remaining > 0 && elapsedSinceCast !== undefined ? Math.max(1, remaining + elapsedSinceCast) : Math.max(1, skill.cooldownMs);
        const progress = remaining > 0 ? Math.max(0, Math.min(1, 1 - remaining / totalCooldown)) : 1;
        const justCast = elapsedSinceCast !== undefined && elapsedSinceCast < 650;
        const state = justCast ? "casting" : remaining > 0 ? "cooling" : "ready";
        const label = justCast ? "释放" : remaining > 0 ? `${(remaining / 1000).toFixed(1)}秒` : "可释放";
        return (
          <div
            className={`skill-cooldown ${state} item-hover-scope`}
            key={skill.id}
            tabIndex={0}
            style={{ "--cooldown-deg": `${Math.round(progress * 360)}deg`, "--cooldown-scale": progress } as CSSProperties}
          >
            <span className="skill-cooldown-icon">{skill.icon}</span>
            <span className="skill-cooldown-name">{skill.name}</span>
            <strong>{label}</strong>
            <i />
            <SkillTooltip skill={skill} rank={session.character.skillRanks[skill.id] ?? 1} casts={session.stats.skills[skill.id]?.casts ?? 0} />
          </div>
        );
      })}
    </div>
  );
}

export function getSelectedActor(session: CombatSession, actorId: string) {
  return [session.player, ...session.summons, ...session.monsters].find((actor) => actor.id === actorId) ?? session.player;
}

function pickActorAt(session: CombatSession, x: number, y: number) {
  const actors = [session.player, ...session.summons, ...session.monsters];
  const hit = actors.find((actor) => Math.hypot(actor.position.x - x, actor.position.y - y) <= actor.radius + 12);
  return hit?.id ?? "player";
}

function drawCombat(canvas: HTMLCanvasElement | null, session: CombatSession) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#f6f8fb";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#d8e0eb";
  for (let i = 0; i <= 560; i += 40) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 560);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(560, i);
    ctx.stroke();
  }
  session.monsters.forEach((actor) => {
    ctx.beginPath();
    ctx.fillStyle = actor.monsterType === "boss" ? "#b91c1c" : actor.monsterType === "elite" ? "#c2410c" : "#334155";
    ctx.arc(actor.position.x, actor.position.y, actor.radius, 0, Math.PI * 2);
    ctx.fill();
    const w = actor.radius * 2.2;
    ctx.fillStyle = "#fee2e2";
    ctx.fillRect(actor.position.x - w / 2, actor.position.y - actor.radius - 15, w, 4);
    ctx.fillStyle = "#dc2626";
    ctx.fillRect(actor.position.x - w / 2, actor.position.y - actor.radius - 15, w * Math.max(0, actor.hp / actor.maxHp), 4);
    ctx.fillStyle = "#0f172a";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`${actor.name} ${actor.level}级`, actor.position.x, actor.position.y - actor.radius - 20);
    drawStatusPips(ctx, actor);
  });
  session.summons.forEach((actor) => {
    ctx.beginPath();
    const isDecoy = actor.sourceSkillId === "ranger_shadow_step";
    ctx.fillStyle = isDecoy ? "rgba(99, 102, 241, 0.42)" : "#0f766e";
    ctx.arc(actor.position.x, actor.position.y, actor.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = isDecoy ? "#6366f1" : "#ccfbf1";
    ctx.lineWidth = isDecoy ? 3 : 2;
    ctx.stroke();
    if (isDecoy) {
      ctx.fillStyle = "#3730a3";
      ctx.font = "11px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("影身", actor.position.x, actor.position.y - actor.radius - 8);
    }
  });
  drawEffects(ctx, session);
  drawPlayer(ctx, session);
  session.floats.forEach((entry) => {
    const t = (session.elapsedMs - entry.createdAt) / entry.durationMs;
    ctx.globalAlpha = Math.max(0, 1 - t);
    ctx.fillStyle = entry.type === "crit" ? "#b45309" : entry.type === "shield" ? "#0369a1" : entry.type === "resource" ? "#7c3aed" : "#991b1b";
    ctx.font = entry.type === "crit" ? "bold 16px sans-serif" : "13px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`${entry.icon} ${entry.text}`, entry.x, entry.y - t * 34);
    ctx.globalAlpha = 1;
  });
  ctx.fillStyle = "#dbeafe";
  ctx.fillRect(18, 528, 524, 12);
  ctx.fillStyle = session.state === "bossSpawned" ? "#b91c1c" : "#2563eb";
  ctx.fillRect(18, 528, 524 * (session.progress / 100), 12);
  ctx.fillStyle = "#0f172a";
  ctx.font = "12px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(`${session.contentName} · ${Math.floor(session.progress)}% · ${battleStateLabels[session.state]}`, 20, 518);
}

function drawStatusPips(ctx: CanvasRenderingContext2D, actor: CombatActor) {
  actor.statusEffects.slice(0, 5).forEach((status, index) => {
    ctx.beginPath();
    ctx.fillStyle = statusColor(status.type);
    ctx.arc(actor.position.x - 14 + index * 7, actor.position.y + actor.radius + 8, 3, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawEffects(ctx: CanvasRenderingContext2D, session: CombatSession) {
  session.effects.forEach((effect) => {
    const t = Math.max(0, Math.min(1, (session.elapsedMs - effect.createdAt) / effect.durationMs));
    const alpha = 1 - t;
    ctx.save();
    ctx.globalAlpha = alpha;
    if (effect.kind === "bolt") drawBolt(ctx, effect, t);
    if (effect.kind === "line") drawLine(ctx, effect, t);
    if (effect.kind === "orb") drawOrb(ctx, effect, t);
    if (effect.kind === "ring") drawRing(ctx, effect, t);
    if (effect.kind === "slash") drawSlash(ctx, effect, t);
    ctx.restore();
  });
}

function drawLine(ctx: CanvasRenderingContext2D, effect: SkillEffect, t: number) {
  const head = pointOnLine(effect.from, effect.to, Math.min(1, t * 2.4));
  ctx.strokeStyle = effect.color;
  ctx.lineWidth = effect.width;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(effect.from.x, effect.from.y);
  ctx.lineTo(head.x, head.y);
  ctx.stroke();
}

function drawBolt(ctx: CanvasRenderingContext2D, effect: SkillEffect, t: number) {
  const segments = 5;
  const dx = effect.to.x - effect.from.x;
  const dy = effect.to.y - effect.from.y;
  const length = Math.hypot(dx, dy) || 1;
  const nx = -dy / length;
  const ny = dx / length;
  ctx.strokeStyle = effect.color;
  ctx.lineWidth = effect.width + 1;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(effect.from.x, effect.from.y);
  for (let i = 1; i < segments; i += 1) {
    const p = i / segments;
    const jitter = Math.sin((p + t) * 40) * 8;
    ctx.lineTo(effect.from.x + dx * p + nx * jitter, effect.from.y + dy * p + ny * jitter);
  }
  ctx.lineTo(effect.to.x, effect.to.y);
  ctx.stroke();
  ctx.strokeStyle = "rgba(255,255,255,0.8)";
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawOrb(ctx: CanvasRenderingContext2D, effect: SkillEffect, t: number) {
  const p = pointOnLine(effect.from, effect.to, Math.min(1, t * 2.2));
  const impact = t > 0.6 ? (t - 0.6) / 0.4 : 0;
  ctx.fillStyle = effect.color;
  ctx.beginPath();
  ctx.arc(p.x, p.y, effect.radius * (1 - impact * 0.4), 0, Math.PI * 2);
  ctx.fill();
  if (impact > 0) {
    ctx.strokeStyle = effect.color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(effect.to.x, effect.to.y, effect.radius + impact * 32, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawRing(ctx: CanvasRenderingContext2D, effect: SkillEffect, t: number) {
  const radius = Math.max(8, effect.radius * (0.35 + t * 0.75));
  ctx.strokeStyle = effect.color;
  ctx.lineWidth = effect.width;
  ctx.beginPath();
  ctx.arc(effect.to.x, effect.to.y, radius, 0, Math.PI * 2);
  ctx.stroke();
}

function drawSlash(ctx: CanvasRenderingContext2D, effect: SkillEffect, t: number) {
  const angle = Math.atan2(effect.to.y - effect.from.y, effect.to.x - effect.from.x);
  const radius = Math.max(30, effect.radius * 0.65);
  ctx.strokeStyle = effect.color;
  ctx.lineWidth = effect.width + 2;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(effect.from.x, effect.from.y, radius, angle - 0.85 + t * 0.25, angle + 0.85 + t * 0.25);
  ctx.stroke();
}

function pointOnLine(from: { x: number; y: number }, to: { x: number; y: number }, t: number) {
  return {
    x: from.x + (to.x - from.x) * t,
    y: from.y + (to.y - from.y) * t,
  };
}

function drawPlayer(ctx: CanvasRenderingContext2D, session: CombatSession) {
  const player = session.player;
  const hpRatio = Math.max(0, player.hp / player.maxHp);
  const resourceRatio = Math.max(0, player.resource / player.maxResource);
  ctx.save();
  ctx.beginPath();
  ctx.fillStyle = "rgba(255,255,255,0.96)";
  ctx.arc(player.position.x, player.position.y, player.radius + 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.strokeStyle = "#dc2626";
  ctx.lineWidth = 3;
  ctx.arc(player.position.x, player.position.y, player.radius + 7, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * hpRatio);
  ctx.stroke();
  if (player.shield > 0) {
    ctx.beginPath();
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2;
    ctx.arc(player.position.x, player.position.y, player.radius + 11, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.fillStyle = "#1d4ed8";
  ctx.arc(player.position.x, player.position.y, player.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 12px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("我", player.position.x, player.position.y);
  ctx.restore();

  drawStatusBar(ctx, 18, 18, 168, "生命", hpRatio, "#dc2626", `${Math.ceil(player.hp)}/${Math.ceil(player.maxHp)}`);
  drawStatusBar(ctx, 18, 46, 168, "灵元", resourceRatio, "#2563eb", `${Math.floor(player.resource)}/${Math.floor(player.maxResource)}`);
  if (player.shield > 0) {
    drawStatusBar(ctx, 18, 74, 168, "护盾", Math.min(1, player.shield / player.maxHp), "#0891b2", `${Math.floor(player.shield)}`);
  }
}

function drawStatusBar(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, label: string, ratio: number, color: string, value: string) {
  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.88)";
  ctx.fillRect(x - 8, y - 8, width + 16, 24);
  ctx.fillStyle = "#e2e8f0";
  ctx.fillRect(x, y, width, 8);
  ctx.fillStyle = color;
  ctx.fillRect(x, y, width * ratio, 8);
  ctx.fillStyle = "#0f172a";
  ctx.font = "11px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(label, x, y + 20);
  ctx.textAlign = "right";
  ctx.fillText(value, x + width, y + 20);
  ctx.restore();
}

function statusColor(type: string) {
  return {
    buff: "#2563eb",
    debuff: "#9333ea",
    dot: "#dc2626",
    control: "#0891b2",
    shield: "#0284c7",
    mark: "#f59e0b",
  }[type] ?? "#64748b";
}

function drawEmpty(canvas: HTMLCanvasElement | null) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#f6f8fb";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#64748b";
  ctx.font = "16px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("等待战诀推演开始", canvas.width / 2, canvas.height / 2);
}
