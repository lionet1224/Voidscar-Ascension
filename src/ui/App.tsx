import { useEffect, useRef, useState } from "react";
import {
  Activity,
  BarChart3,
  BriefcaseBusiness,
  FlaskConical,
  Home,
  Layers,
  NotebookText,
  PackageOpen,
  Save,
  Settings,
  Sparkles,
  Swords,
  Zap,
} from "lucide-react";
import { gameConfig } from "../data/gameConfig";
import { CURRENT_SEASON_ID, CURRENT_VERSION, currentSeasonDefinition } from "../data/seasons";
import { createCombatSession, makeCombatReport, tickCombat } from "../combat/combatEngine";
import type { CombatSession } from "../combat/combatTypes";
import type { GameSave, IdleClaimSummary } from "../types";
import { addExp, getCharacterInventory, getCurrentCharacter } from "../systems/characterSystem";
import { loadSave, saveGame } from "../systems/saveSystem";
import { applyLoot, generateLoot } from "../systems/lootSystem";
import { formatNumber } from "../systems/id";
import { settleIdle } from "../systems/idleFarmSystem";
import { Metric } from "./components/common";
import { CharacterTopSummary, FloatingBattlePanel } from "./components/AppChrome";
import { IdleClaimModal, PatchModal } from "./components/AppModals";
import { useFloatingTooltipPosition } from "./hooks/useFloatingTooltipPosition";
import type { PageId, PageProps } from "./pageTypes";
import {
  BattlePage,
  CharacterPage,
  DatabasePage,
  DungeonPage,
  HomePage,
  InventoryPage,
  PatchNotesPage,
  ReportsPage,
  RiftPage,
  SeasonPage,
  SettingsPage,
  SkillsPage,
} from "./pages";

const navItems: { id: PageId; label: string; icon: typeof Home }[] = [
  { id: "home", label: gameConfig.commandName, icon: Home },
  { id: "characters", label: "应劫者", icon: BriefcaseBusiness },
  { id: "battle", label: "秘境推演", icon: Swords },
  { id: "skills", label: "战诀", icon: Zap },
  { id: "inventory", label: "法器", icon: PackageOpen },
  { id: "dungeons", label: "洞天秘境", icon: Layers },
  { id: "rift", label: "归墟天阶", icon: Activity },
  { id: "season", label: "道纪", icon: Sparkles },
  { id: "reports", label: "道痕记录", icon: BarChart3 },
  { id: "patch", label: "天机札记", icon: NotebookText },
  { id: "settings", label: "命盘设置", icon: Settings },
];

const devNavItems: { id: PageId; label: string; icon: typeof Home }[] = import.meta.env.DEV
  ? [...navItems, { id: "database", label: "数据库", icon: FlaskConical }]
  : navItems;

const pages: Record<PageId, (props: PageProps) => React.ReactNode> = {
  home: HomePage,
  characters: CharacterPage,
  battle: BattlePage,
  skills: SkillsPage,
  inventory: InventoryPage,
  dungeons: DungeonPage,
  rift: RiftPage,
  season: SeasonPage,
  reports: ReportsPage,
  patch: PatchNotesPage,
  settings: SettingsPage,
  database: DatabasePage,
};

export default function App() {
  useFloatingTooltipPosition();
  const [save, setSave] = useState<GameSave>();
  const [page, setPage] = useState<PageId>("home");
  const [idleClaim, setIdleClaim] = useState<IdleClaimSummary>();
  const [patchOpen, setPatchOpen] = useState(false);
  const battleSessionRef = useRef<CombatSession | undefined>(undefined);
  const [selectedActorId, setSelectedActorId] = useState("player");
  const saveRef = useRef<GameSave | undefined>(undefined);
  const completedCombatIds = useRef(new Set<string>());
  const activeCharacter = save ? getCurrentCharacter(save) : undefined;
  const activeInventory = save && activeCharacter ? getCharacterInventory(save, activeCharacter) : [];
  const activeSeason = save?.seasons.find((season) => season.id === CURRENT_SEASON_ID);

  useEffect(() => {
    loadSave().then((loaded) => {
      let next = loaded;
      let claim: IdleClaimSummary | undefined;
      if (loaded.idleFarmConfig) {
        const settled = settleIdle(loaded, loaded.idleFarmConfig);
        next = settled.save;
        claim = settled.summary;
      }
      setSave(next);
      setIdleClaim(claim);
      setPatchOpen(next.settings.lastSeenPatchVersion !== CURRENT_VERSION);
    });
  }, []);

  useEffect(() => {
    if (!save?.settings.autoSaveEnabled) return;
    const handle = window.setTimeout(() => saveGame(save), 250);
    return () => window.clearTimeout(handle);
  }, [save]);

  useEffect(() => {
    saveRef.current = save;
  }, [save]);

  const mutate = (updater: (draft: GameSave) => GameSave) => {
    setSave((current) => (current ? updater(current) : current));
  };

  const settleCombat = (finalSession: CombatSession) => {
    if (completedCombatIds.current.has(finalSession.id)) return;
    completedCombatIds.current.add(finalSession.id);
    setSave((current) => {
      if (!current) return current;
      const character = current.characters.find((entry) => entry.id === finalSession.character.id);
      if (!character) return current;
      const success = finalSession.state === "success";
      const riftTier = finalSession.riftTier ?? 0;
      const dungeonId = finalSession.dungeon?.id;
      const contentLevel = riftTier ? character.level : (finalSession.dungeon?.recommendedLevel[1] ?? character.level);
      const drops = success ? generateLoot(character, contentLevel, riftTier, 3 + Math.floor(riftTier / 10)) : [];
      const filter = current.lootFilters[0];
      const inventory = getCharacterInventory(current, character);
      const loot = applyLoot(character.materials, character, drops, filter);
      const gold = success ? Math.floor(80 + character.level * 22 + riftTier * 30) : 15;
      const rewards = {
        exp: success ? Math.floor(120 + character.level * 35 + riftTier * 40) : 25,
        gold,
        embers: success ? 8 + Math.floor((riftTier || 1) * 0.8) : 1,
        materials: { ...loot.materials, gold: (loot.materials.gold ?? 0) + gold },
        itemIds: loot.kept.map((item) => item.id),
        salvagedCount: loot.salvagedCount,
      };
      const report = makeCombatReport(finalSession, rewards);
      const updatedCharacter = addExp(character, rewards.exp);
      const completedDungeons = !riftTier && dungeonId && success
        ? Array.from(new Set([...(character.completedDungeons ?? []), dungeonId]))
        : character.completedDungeons;
      return {
        ...current,
        characters: current.characters.map((entry) =>
          entry.id === character.id
            ? {
                ...updatedCharacter,
                inventory: [...inventory, ...loot.kept],
                materials: rewards.materials,
                completedDungeons,
                seasonEmbers: character.seasonEmbers + rewards.embers,
                highestRiftTier: riftTier && success ? Math.max(entry.highestRiftTier, riftTier) : entry.highestRiftTier,
                stableIdleRiftTier: riftTier && success ? Math.max(0, Math.max(entry.highestRiftTier, riftTier) - 2) : entry.stableIdleRiftTier,
                totalPlayTimeSeconds: entry.totalPlayTimeSeconds + Math.floor(finalSession.elapsedMs / 1000),
              }
            : entry,
        ),
        combatReports: [report, ...current.combatReports].slice(0, 40),
      };
    });
  };

  useEffect(() => {
    let last = performance.now();
    const handle = window.setInterval(() => {
      const now = performance.now();
      const speed = saveRef.current?.settings.battleSpeed ?? 1;
      const maxCatchUpMs = document.hidden ? 240 : 48;
      let remaining = Math.min(maxCatchUpMs, (now - last) * speed);
      last = now;
      const current = battleSessionRef.current;
      if (!current || (current.state !== "running" && current.state !== "bossSpawned")) return;
      let next = current;
      while (remaining > 0 && (next.state === "running" || next.state === "bossSpawned")) {
        const step = Math.min(document.hidden ? 80 : 24, remaining);
        next = tickCombat(next, step);
        remaining -= step;
      }
      battleSessionRef.current = next;
      if ((next.state === "success" || next.state === "failed") && !completedCombatIds.current.has(next.id)) {
        settleCombat(next);
      }
    }, 16);
    return () => window.clearInterval(handle);
  }, []);

  if (!save) {
    return <div className="boot">正在加载本地存档...</div>;
  }

  const pageProps: PageProps = {
    save,
    mutate,
    setPage,
    getBattleSession: () => battleSessionRef.current,
    setBattleSession: (session?: CombatSession) => {
      battleSessionRef.current = session;
    },
    selectedActorId,
    setSelectedActorId,
  };

  if (!activeCharacter) {
    return (
      <div className="entry-shell">
        <CharacterPage {...pageProps} />
        {patchOpen && (
          <PatchModal
            onClose={() => {
              mutate((draft) => ({ ...draft, settings: { ...draft.settings, lastSeenPatchVersion: CURRENT_VERSION } }));
              setPatchOpen(false);
            }}
          />
        )}
      </div>
    );
  }

  const Page = pages[page === "characters" ? "home" : page];
  const activeNavItems = devNavItems.filter((item) => item.id !== "characters");

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">墟</div>
          <div>
            <strong>{gameConfig.name}</strong>
            <span>{gameConfig.commandName}</span>
          </div>
        </div>
        <nav>
          {activeNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <button className={page === item.id ? "nav-item active" : "nav-item"} key={item.id} onClick={() => setPage(item.id)}>
                <Icon size={17} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>
      <main className="workspace">
        <header className="topbar">
          <div>
            <strong>{activeSeason?.name ?? currentSeasonDefinition.name}</strong>
            <span>{gameConfig.worldName}</span>
          </div>
          <div className="topbar-metrics">
            <CharacterTopSummary character={activeCharacter} inventory={activeInventory} />
            <Metric label="灵石" value={formatNumber(activeCharacter.materials.gold ?? 0)} />
            <Metric label="劫火残烬" value={formatNumber(activeCharacter.seasonEmbers ?? 0)} />
            <button onClick={() => mutate((draft) => ({ ...draft, currentCharacterId: undefined }))}>退出应劫者</button>
            <button className="icon-btn" title="保存" onClick={() => saveGame(save)}>
              <Save size={17} />
            </button>
          </div>
        </header>
        <Page {...pageProps} />
      </main>
      {patchOpen && (
        <PatchModal
          onClose={() => {
            mutate((draft) => ({ ...draft, settings: { ...draft.settings, lastSeenPatchVersion: CURRENT_VERSION } }));
            setPatchOpen(false);
          }}
        />
      )}
      {idleClaim && <IdleClaimModal claim={idleClaim} onClose={() => setIdleClaim(undefined)} />}
      {page !== "battle" && <FloatingBattlePanel getBattleSession={() => battleSessionRef.current} setPage={setPage} />}
    </div>
  );
}
