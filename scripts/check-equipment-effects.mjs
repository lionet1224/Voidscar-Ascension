import { readFileSync } from "node:fs";

const seasonData = readFileSync("src/data/seasonDataPack.ts", "utf8");
const combatEngine = readFileSync("src/combat/combatEngine.ts", "utf8");
const effectRuntimeSources = [
  combatEngine,
  readFileSync("src/systems/lootSystem.ts", "utf8"),
  readFileSync("src/systems/characterSystem.ts", "utf8"),
  readFileSync("src/systems/idleFarmSystem.ts", "utf8"),
].join("\n");

const expectedIds = [
  ...extractIds(seasonData, "legendaryItems"),
  ...extractIds(seasonData, "seasonalRelics"),
];
const implementedBlock = combatEngine.match(/implementedEquipmentEffects\s*=\s*\[([\s\S]*?)\]\s+as const/)?.[1] ?? "";
const implementedIds = new Set([...implementedBlock.matchAll(/"(leg_[^"]+|season_relic_[^"]+)"/g)].map((match) => match[1]));
const missing = expectedIds.filter((id) => !implementedIds.has(id));
const extra = [...implementedIds].filter((id) => !expectedIds.includes(id));
const markerOnly = expectedIds.filter((id) => countOccurrences(effectRuntimeSources, id) < 2);

if (missing.length || extra.length || markerOnly.length) {
  if (missing.length) {
    console.error("装备特效缺少战斗/结算实现标记：");
    missing.forEach((id) => console.error(`  - ${id}`));
  }
  if (extra.length) {
    console.error("装备特效实现标记不在赛季装备表中：");
    extra.forEach((id) => console.error(`  - ${id}`));
  }
  if (markerOnly.length) {
    console.error("装备特效只有实现标记，没有在运行时代码中出现：");
    markerOnly.forEach((id) => console.error(`  - ${id}`));
  }
  process.exit(1);
}

function extractIds(source, exportName) {
  const block = source.match(new RegExp(`export const ${exportName} = \\[([\\s\\S]*?)\\] as const;`))?.[1] ?? "";
  return [...block.matchAll(/\[\s*"([^"]+)"/g)].map((match) => match[1]);
}

function countOccurrences(source, needle) {
  return source.split(needle).length - 1;
}
