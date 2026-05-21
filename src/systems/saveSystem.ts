import type { GameSave } from "../types";
import { createDefaultLootFilter, createDefaultSave, createDefaultMaterials, ensureCharacterRuntimeFields } from "./characterSystem";
import { CURRENT_SEASON_ID, createSeasonState } from "../data/seasons";

const DB_NAME = "voidscar-ascension";
const STORE = "saves";
const KEY = "main";
const LOCAL_KEY = "voidscar-ascension-save";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function loadSave(): Promise<GameSave> {
  try {
    const db = await openDb();
    const saved = await new Promise<GameSave | undefined>((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(KEY);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    if (saved) return normalizeSave(saved);
  } catch {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (raw) return normalizeSave(JSON.parse(raw) as GameSave);
  }
  return createDefaultSave();
}

export async function saveGame(save: GameSave) {
  const payload = { ...save, lastSavedAt: Date.now() };
  localStorage.setItem(LOCAL_KEY, JSON.stringify(payload));
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(payload, KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(payload));
  }
}

export async function exportSave(save: GameSave) {
  return JSON.stringify(save, null, 2);
}

export function importSave(raw: string) {
  return normalizeSave(JSON.parse(raw) as GameSave);
}

function normalizeSave(save: GameSave): GameSave {
  const characters = (save.characters ?? []).map(ensureCharacterRuntimeFields);
  const currentCharacter = characters.find((character) => character.id === save.currentCharacterId);
  const idleCharacter = characters.find((character) => character.id === save.idleFarmConfig?.characterId);
  const seasons = normalizeSeasons(save);
  return {
    ...createDefaultSave(),
    ...save,
    settings: { ...createDefaultSave().settings, ...save.settings },
    seasons,
    characters,
    currentCharacterId: currentCharacter ? currentCharacter.id : undefined,
    inventory: save.inventory ?? [],
    materials: { ...createDefaultMaterials(), ...(save.materials ?? {}) },
    unlocked: {
      completedDungeons: save.unlocked?.completedDungeons ?? [],
      highestRiftTier: save.unlocked?.highestRiftTier ?? 0,
    },
    combatReports: save.combatReports ?? [],
    lootFilters: save.lootFilters?.length ? save.lootFilters : [createDefaultLootFilter()],
    idleFarmConfig: idleCharacter?.status === "active" && idleCharacter.seasonId === CURRENT_SEASON_ID ? save.idleFarmConfig : undefined,
  };
}

function normalizeSeasons(save: GameSave) {
  const current = createSeasonState();
  const existing = save.seasons ?? [];
  const hasCurrent = existing.some((season) => season.id === CURRENT_SEASON_ID);
  return [
    ...(hasCurrent ? [] : [current]),
    ...existing.map((season) => (season.id === CURRENT_SEASON_ID ? { ...current, ...season, status: "active" as const } : { ...season, status: "ended" as const })),
  ];
}
