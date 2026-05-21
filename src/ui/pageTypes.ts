import type { CombatSession } from "../combat/combatTypes";
import type { GameSave } from "../types";

export type PageId = "home" | "characters" | "battle" | "skills" | "inventory" | "dungeons" | "rift" | "season" | "reports" | "patch" | "settings" | "database";

export interface PageProps {
  save: GameSave;
  mutate: (updater: (draft: GameSave) => GameSave) => void;
  setPage: (page: PageId) => void;
  getBattleSession: () => CombatSession | undefined;
  setBattleSession: (session?: CombatSession) => void;
  selectedActorId: string;
  setSelectedActorId: (actorId: string) => void;
}
