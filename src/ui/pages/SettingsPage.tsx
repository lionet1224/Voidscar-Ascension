import { useState } from "react";
import { Download, Upload } from "lucide-react";
import { rarityLabels } from "../../data/affixes";
import { exportSave, importSave } from "../../systems/saveSystem";
import type { ItemRarity } from "../../types";
import type { PageProps } from "../pageTypes";

const rarityOrder: ItemRarity[] = ["normal", "magic", "rare", "epic", "legendary", "seasonalUnique"];

export function SettingsPage({ save, mutate }: PageProps) {
  const [raw, setRaw] = useState("");
  const filter = save.lootFilters[0];
  const updateFilter = (patch: Partial<typeof filter>) => {
    mutate((draft) => ({
      ...draft,
      lootFilters: draft.lootFilters.map((entry, index) => (index === 0 ? { ...entry, ...patch } : entry)),
    }));
  };
  const toggleRarity = (rarity: ItemRarity) => {
    const keep = new Set(filter.keepRarities);
    if (keep.has(rarity)) keep.delete(rarity);
    else keep.add(rarity);
    updateFilter({ keepRarities: rarityOrder.filter((entry) => keep.has(entry)) });
  };
  return (
    <div className="page-stack">
      <section className="panel">
        <h1>命盘设置</h1>
        <div className="settings-grid">
          <label><input type="checkbox" checked={save.settings.autoSaveEnabled} onChange={(event) => mutate((draft) => ({ ...draft, settings: { ...draft.settings, autoSaveEnabled: event.target.checked } }))} /> 自动保存</label>
          <label><input type="checkbox" checked={save.settings.floatingTextEnabled} onChange={(event) => mutate((draft) => ({ ...draft, settings: { ...draft.settings, floatingTextEnabled: event.target.checked } }))} /> 伤害飘字</label>
          <label>推演速度
            <select value={save.settings.battleSpeed} onChange={(event) => mutate((draft) => ({ ...draft, settings: { ...draft.settings, battleSpeed: Number(event.target.value) as 1 | 1.5 | 2 } }))}>
              <option value={1}>1x</option>
              <option value={1.5}>1.5x</option>
              <option value={2}>2x</option>
            </select>
          </label>
        </div>
      </section>
      <section className="panel">
        <h2>拾取与分解</h2>
        <p className="muted">战斗中掉落的法器会在每轮推演结束后按这里的规则收入背包；未保留的法器会自动化为材料。</p>
        <div className="settings-grid">
          <label>最低装等
            <input
              type="number"
              min={0}
              value={filter.minItemPowerToKeep}
              onChange={(event) => updateFilter({ minItemPowerToKeep: Number(event.target.value) })}
            />
          </label>
          <label><input type="checkbox" checked={filter.keepClassItemsOnly} onChange={(event) => updateFilter({ keepClassItemsOnly: event.target.checked })} /> 只保留本职业可用法器</label>
          <label><input type="checkbox" checked={filter.alwaysKeepLegendary} onChange={(event) => updateFilter({ alwaysKeepLegendary: event.target.checked })} /> 天阶法宝必定保留</label>
          <label><input type="checkbox" checked={filter.alwaysKeepSeasonalUnique} onChange={(event) => updateFilter({ alwaysKeepSeasonalUnique: event.target.checked })} /> 道纪遗宝必定保留</label>
        </div>
        <div className="rarity-toggle-row">
          {rarityOrder.map((rarity) => (
            <label className="toggle" key={rarity}>
              <input type="checkbox" checked={filter.keepRarities.includes(rarity)} onChange={() => toggleRarity(rarity)} />
              {rarityLabels[rarity]}
            </label>
          ))}
        </div>
      </section>
      <section className="panel">
        <h2>命盘存档</h2>
        <div className="form-row">
          <button onClick={async () => setRaw(await exportSave(save))}><Download size={16} /> 导出</button>
          <button onClick={() => mutate(() => importSave(raw))}><Upload size={16} /> 导入</button>
        </div>
        <textarea value={raw} onChange={(event) => setRaw(event.target.value)} placeholder="导出的存档文本会显示在这里，也可以粘贴后导入。" />
      </section>
    </div>
  );
}
