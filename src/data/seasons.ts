import type { SeasonState } from "../types";
import { CURRENT_SEASON_ID, CURRENT_VERSION, currentSeasonDefinition } from "./seasonConfigs";

export { CURRENT_SEASON_ID, CURRENT_VERSION, currentSeasonDefinition };

export function createSeasonState(): SeasonState {
  return {
    id: CURRENT_SEASON_ID,
    name: currentSeasonDefinition.name,
    englishName: currentSeasonDefinition.name,
    status: "active",
    embers: 0,
    powers: currentSeasonDefinition.powers.map((power) => ({ ...power })),
  };
}
