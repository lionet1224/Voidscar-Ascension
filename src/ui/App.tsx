import { useEffect, useRef, useState } from "react";
import {
  Activity,
  BarChart3,
  BriefcaseBusiness,
  CircleHelp,
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
import { addExp, createDefaultLootFilter, getCharacterInventory, getCurrentCharacter } from "../systems/characterSystem";
import { loadSave, saveGame } from "../systems/saveSystem";
import { applyLoot } from "../systems/lootSystem";
import { formatNumber } from "../systems/id";
import { settleIdle } from "../systems/idleFarmSystem";
import { Metric } from "./components/common";
import { CharacterTopSummary, FloatingBattlePanel } from "./components/AppChrome";
import { IdleClaimModal, PatchModal, TutorialModal } from "./components/AppModals";
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
  StartScreen,
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
  ? [...navItems, { id: "database", label: "万象图鉴", icon: FlaskConical }]
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
  const [entryMode, setEntryMode] = useState<"start" | "characters">("start");
  const [idleClaim, setIdleClaim] = useState<IdleClaimSummary>();
  const [patchOpen, setPatchOpen] = useState(false);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const battleSessionRef = useRef<CombatSession | undefined>(undefined);
  const [selectedActorId, setSelectedActorId] = useState("player");
  const saveRef = useRef<GameSave | undefined>(undefined);
  const completedCombatIds = useRef(new Set<string>());
  const previousCharacterIdRef = useRef<string | undefined>(undefined);
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
      setPatchOpen(false);
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

  const clearRuntimeState = () => {
    battleSessionRef.current = undefined;
    setSelectedActorId("player");
  };

  useEffect(() => {
    const characterId = save?.currentCharacterId;
    if (previousCharacterIdRef.current === characterId) return;
    previousCharacterIdRef.current = characterId;
    clearRuntimeState();
  }, [save?.currentCharacterId]);

  const mutate = (updater: (draft: GameSave) => GameSave) => {
    setSave((current) => (current ? updater(current) : current));
  };

  const settleCombat = (finalSession: CombatSession) => {
    if (completedCombatIds.current.has(finalSession.id)) return;
    completedCombatIds.current.add(finalSession.id);
    let restartSession: CombatSession | undefined;
    setSave((current) => {
      if (!current) return current;
      const character = current.characters.find((entry) => entry.id === finalSession.character.id);
      if (!character) return current;
      const success = finalSession.state === "success";
      const riftTier = finalSession.riftTier ?? 0;
      const dungeonId = finalSession.dungeon?.id;
      const filter = current.lootFilters[0] ?? createDefaultLootFilter();
      const inventory = getCharacterInventory(current, character);
      const loot = applyLoot(character.materials, character, finalSession.droppedItems ?? [], filter);
      const gold = success ? Math.floor(80 + character.level * 22 + riftTier * 30) : 15;
      const rewards = {
        exp: finalSession.expEarned,
        gold,
        embers: success ? 8 + Math.floor((riftTier || 1) * 0.8) : 1,
        materials: { ...loot.materials, gold: (loot.materials.gold ?? 0) + gold, spirit_stone: (loot.materials.spirit_stone ?? 0) + gold },
        itemIds: loot.kept.map((item) => item.id),
        salvagedCount: loot.salvagedCount,
      };
      const report = makeCombatReport(finalSession, rewards);
      const updatedCharacter = addExp(character, rewards.exp);
      const nextInventory = [...inventory, ...loot.kept];
      const completedDungeons = !riftTier && dungeonId && success
        ? Array.from(new Set([...(character.completedDungeons ?? []), dungeonId]))
        : character.completedDungeons;
      const nextCharacter = {
        ...updatedCharacter,
        inventory: nextInventory,
        materials: rewards.materials,
        completedDungeons,
        seasonEmbers: character.seasonEmbers + rewards.embers,
        highestRiftTier: riftTier && success ? Math.max(character.highestRiftTier, riftTier) : character.highestRiftTier,
        stableIdleRiftTier: riftTier && success ? Math.max(0, Math.max(character.highestRiftTier, riftTier) - 2) : character.stableIdleRiftTier,
        totalPlayTimeSeconds: character.totalPlayTimeSeconds + Math.floor(finalSession.elapsedMs / 1000),
      };
      restartSession = createCombatSession({
        character: nextCharacter,
        inventory: nextInventory,
        dungeonId,
        riftTier: riftTier || undefined,
      });
      battleSessionRef.current = restartSession;
      return {
        ...current,
        characters: current.characters.map((entry) =>
          entry.id === character.id
            ? nextCharacter
            : entry,
        ),
        combatReports: [report, ...current.combatReports].slice(0, 40),
      };
    });
    if (restartSession) {
      battleSessionRef.current = restartSession;
      setSelectedActorId("player");
    }
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
    clearRuntimeState,
    selectedActorId,
    setSelectedActorId,
  };

  if (!activeCharacter) {
    return (
      <div className="entry-shell">
        {entryMode === "start" ? (
          <StartScreen
            characterCount={save.characters.length}
            onStart={() => setEntryMode("characters")}
            onPatchNotes={() => setPatchOpen(true)}
            onTutorial={() => setTutorialOpen(true)}
          />
        ) : (
          <div className="entry-character-shell">
            <button className="entry-back" onClick={() => setEntryMode("start")}>返回首页</button>
            <CharacterPage {...pageProps} />
          </div>
        )}
        {patchOpen && (
          <PatchModal
            onClose={() => {
              mutate((draft) => ({ ...draft, settings: { ...draft.settings, lastSeenPatchVersion: CURRENT_VERSION } }));
              setPatchOpen(false);
            }}
          />
        )}
        {tutorialOpen && <TutorialModal onClose={() => setTutorialOpen(false)} />}
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
            <Metric label="灵石" value={formatNumber((activeCharacter.materials.gold ?? 0) + (activeCharacter.materials.spirit_stone ?? 0))} />
            <Metric label="劫火残烬" value={formatNumber(activeCharacter.seasonEmbers ?? 0)} />
            <button onClick={() => setTutorialOpen(true)}><CircleHelp size={17} /> 新手指引</button>
            <button onClick={() => {
              clearRuntimeState();
              mutate((draft) => ({ ...draft, currentCharacterId: undefined }));
            }}>退出应劫者</button>
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
      {tutorialOpen && <TutorialModal onClose={() => setTutorialOpen(false)} />}
      {page !== "battle" && <FloatingBattlePanel getBattleSession={() => battleSessionRef.current} setPage={setPage} />}
    </div>
  );
}
