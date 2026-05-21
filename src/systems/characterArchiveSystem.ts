import { CURRENT_VERSION } from "../data/seasons";
import type { Character, CombatReport, GameSave, Item } from "../types";
import { uid } from "./id";

const ARCHIVE_PREFIX = "VOIDSCAR-SEEKER-1";
const ARCHIVE_SECRET = "voidscar-ascension-local-character-archive-v1";

interface CharacterArchivePayload {
  version: string;
  exportedAt: number;
  character: Character;
  reports: CombatReport[];
}

interface EncryptedEnvelope {
  compressed: boolean;
  data: string;
}

export async function exportCharacterArchive(save: GameSave, characterId: string) {
  const character = save.characters.find((entry) => entry.id === characterId);
  if (!character) throw new Error("未找到应劫者。");
  const payload: CharacterArchivePayload = {
    version: CURRENT_VERSION,
    exportedAt: Date.now(),
    character,
    reports: save.combatReports.filter((report) => report.characterId === characterId),
  };
  const rawBytes = new TextEncoder().encode(JSON.stringify(payload));
  const compressed = await compressBytes(rawBytes);
  const envelope: EncryptedEnvelope = {
    compressed: compressed.compressed,
    data: toBase64Url(compressed.bytes),
  };
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await archiveKey();
  const cipher = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(JSON.stringify(envelope))));
  return `${ARCHIVE_PREFIX}.${toBase64Url(iv)}.${toBase64Url(cipher)}`;
}

export async function importCharacterArchive(token: string) {
  const parts = token.trim().split(".");
  if (parts.length !== 3 || parts[0] !== ARCHIVE_PREFIX) {
    throw new Error("导入文本不是有效的应劫者归档。");
  }
  const [, ivRaw, cipherRaw] = parts;
  const key = await archiveKey();
  const envelopeBytes = await crypto.subtle.decrypt({ name: "AES-GCM", iv: fromBase64Url(ivRaw) }, key, fromBase64Url(cipherRaw));
  const envelope = JSON.parse(new TextDecoder().decode(envelopeBytes)) as EncryptedEnvelope;
  const bytes = envelope.compressed ? await decompressBytes(fromBase64Url(envelope.data)) : fromBase64Url(envelope.data);
  const payload = JSON.parse(new TextDecoder().decode(bytes)) as CharacterArchivePayload;
  if (!payload.character?.id || !payload.character?.name) {
    throw new Error("归档内容缺少应劫者数据。");
  }
  return rekeyImportedArchive(payload);
}

function rekeyImportedArchive(payload: CharacterArchivePayload) {
  const oldCharacterId = payload.character.id;
  const newCharacterId = uid("char");
  const itemIdMap = new Map<string, string>();
  const inventory = (payload.character.inventory ?? []).map((item) => {
    const nextId = uid("item");
    itemIdMap.set(item.id, nextId);
    return { ...item, id: nextId, characterId: newCharacterId } satisfies Item;
  });
  const equipment = Object.fromEntries(
    Object.entries(payload.character.equipment).map(([slot, itemId]) => [slot, itemId ? itemIdMap.get(itemId) ?? null : null]),
  ) as Character["equipment"];
  const character: Character = {
    ...payload.character,
    id: newCharacterId,
    name: `${payload.character.name} · 导入`,
    inventory,
    equipment,
    createdAt: Date.now(),
  };
  const reports = payload.reports.map((report) => ({
    ...report,
    id: uid("report"),
    characterId: newCharacterId,
    rewards: {
      ...report.rewards,
      itemIds: report.rewards.itemIds.map((id) => itemIdMap.get(id) ?? id),
    },
  }));
  return { character, reports, originalCharacterId: oldCharacterId };
}

async function archiveKey() {
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(ARCHIVE_SECRET));
  return crypto.subtle.importKey("raw", hash, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}

async function compressBytes(bytes: Uint8Array) {
  if (!("CompressionStream" in globalThis)) return { bytes, compressed: false };
  const stream = new Blob([toArrayBuffer(bytes)]).stream().pipeThrough(new CompressionStream("gzip"));
  return { bytes: new Uint8Array(await new Response(stream).arrayBuffer()), compressed: true };
}

async function decompressBytes(bytes: Uint8Array) {
  if (!("DecompressionStream" in globalThis)) {
    throw new Error("当前浏览器不支持解压该归档。");
  }
  const stream = new Blob([toArrayBuffer(bytes)]).stream().pipeThrough(new DecompressionStream("gzip"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

function toArrayBuffer(bytes: Uint8Array) {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

function toBase64Url(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}
