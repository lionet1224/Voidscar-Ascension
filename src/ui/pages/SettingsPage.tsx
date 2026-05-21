import { useState } from "react";
import { Download, Upload } from "lucide-react";
import { exportSave, importSave } from "../../systems/saveSystem";
import type { PageProps } from "../pageTypes";

export function SettingsPage({ save, mutate }: PageProps) {
  const [raw, setRaw] = useState("");
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
