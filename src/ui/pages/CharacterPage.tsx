import { useState, type ReactNode } from "react";
import { Archive, Download, Trash2, Upload } from "lucide-react";
import { classNames } from "../../data/classes";
import type { ClassId } from "../../types";
import { createCharacter, ensureCharacterRuntimeFields, isCurrentSeasonCharacter } from "../../systems/characterSystem";
import { exportCharacterArchive, importCharacterArchive } from "../../systems/characterArchiveSystem";
import type { PageProps } from "../pageTypes";

export function CharacterPage({ save, mutate, setPage, clearRuntimeState }: PageProps) {
  const [name, setName] = useState("");
  const [classId, setClassId] = useState<ClassId>("warrior");
  const [archiveText, setArchiveText] = useState("");
  const [archiveStatus, setArchiveStatus] = useState("");
  const [importOpen, setImportOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const canCreate = save.characters.length < 10;
  const create = () => {
    if (!canCreate) return;
    const character = createCharacter(name, classId);
    clearRuntimeState();
    mutate((draft) => ({
      ...draft,
      currentCharacterId: character.id,
      characters: [...draft.characters, character],
    }));
    setName("");
    setPage("home");
  };
  const exportOne = async (characterId: string) => {
    try {
      setArchiveText(await exportCharacterArchive(save, characterId));
      setArchiveStatus("已生成加密归档。");
      setExportOpen(true);
    } catch (error) {
      setArchiveStatus(error instanceof Error ? error.message : "导出失败。");
    }
  };
  const importOne = async () => {
    if (!canCreate) {
      setArchiveStatus("命盘席位已满，无法导入。");
      return;
    }
    try {
      const imported = await importCharacterArchive(archiveText);
      const character = ensureCharacterRuntimeFields(imported.character);
      mutate((draft) => ({
        ...draft,
        characters: [...draft.characters, character],
        combatReports: [...imported.reports.map((report) => ({ ...report, characterId: character.id })), ...draft.combatReports],
      }));
      setArchiveStatus(`已导入 ${character.name}。`);
      setImportOpen(false);
      setArchiveText("");
    } catch (error) {
      setArchiveStatus(error instanceof Error ? error.message : "导入失败。");
    }
  };
  const removeOne = (characterId: string) => {
    const character = save.characters.find((entry) => entry.id === characterId);
    if (!character) return;
    if (!window.confirm(`删除「${character.name}」？该操作会同时删除该角色的道痕记录。`)) return;
    if (save.currentCharacterId === characterId) clearRuntimeState();
    mutate((draft) => ({
      ...draft,
      currentCharacterId: draft.currentCharacterId === characterId ? undefined : draft.currentCharacterId,
      characters: draft.characters.filter((entry) => entry.id !== characterId),
      combatReports: draft.combatReports.filter((report) => report.characterId !== characterId),
      idleFarmConfig: draft.idleFarmConfig?.characterId === characterId ? undefined : draft.idleFarmConfig,
    }));
    setArchiveStatus(`已删除 ${character.name}。`);
  };
  return (
    <div className="page-stack">
      <section className="panel">
        <div className="page-title-row">
          <h1>应劫者</h1>
          <div className="card-actions">
            <button disabled={!canCreate} onClick={() => {
              setArchiveText("");
              setArchiveStatus("");
              setImportOpen(true);
            }}><Upload size={16} /> 导入角色</button>
            <span className="muted">{save.characters.length}/10</span>
          </div>
        </div>
        <div className="character-create-row">
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="应劫者名" />
          <select value={classId} onChange={(event) => setClassId(event.target.value as ClassId)}>
            <option value="warrior">{classNames.warrior}</option>
            <option value="ranger">{classNames.ranger}</option>
            <option value="mage">{classNames.mage}</option>
          </select>
          <button className="primary" disabled={!canCreate} onClick={create}>唤醒当纪应劫者</button>
        </div>
      </section>
      {archiveStatus && <section className="panel compact-panel"><span className="muted">{archiveStatus}</span></section>}
      <section className="list-grid">
        {save.characters.map((character) => (
          <article className="item-card" key={character.id}>
            <div>
              <h3>{character.name}</h3>
              <p>{classNames[character.classId]} · 等级 {character.level} · {isCurrentSeasonCharacter(character) ? "当纪可用" : "旧纪道影（只读）"}</p>
            </div>
            <div className="card-actions">
              <button onClick={() => {
                if (save.currentCharacterId !== character.id) clearRuntimeState();
                mutate((draft) => ({ ...draft, currentCharacterId: character.id }));
                setPage("home");
              }}>{isCurrentSeasonCharacter(character) ? "进入命盘" : "查看道影"}</button>
              <button
                disabled={!isCurrentSeasonCharacter(character)}
                onClick={() => {
                  if (save.currentCharacterId === character.id) clearRuntimeState();
                  mutate((draft) => ({
                    ...draft,
                    characters: draft.characters.map((entry) =>
                      entry.id === character.id ? { ...entry, status: "archived", archivedAt: Date.now() } : entry,
                    ),
                  }));
                }}
              >
                <Archive size={15} /> 归档
              </button>
              <button onClick={() => exportOne(character.id)}><Download size={15} /> 导出</button>
              <button disabled={!isCurrentSeasonCharacter(character)} onClick={() => removeOne(character.id)}><Trash2 size={15} /> 删除</button>
            </div>
          </article>
        ))}
      </section>
      {importOpen && (
        <ArchiveModal
          title="导入角色"
          value={archiveText}
          onChange={setArchiveText}
          onClose={() => setImportOpen(false)}
          actions={<button className="primary" disabled={!archiveText.trim() || !canCreate} onClick={importOne}>导入</button>}
        />
      )}
      {exportOpen && (
        <ArchiveModal
          title="导出角色"
          value={archiveText}
          readonly
          onChange={setArchiveText}
          onClose={() => setExportOpen(false)}
          actions={<button onClick={() => navigator.clipboard?.writeText(archiveText)}>复制</button>}
        />
      )}
    </div>
  );
}

function ArchiveModal({
  title,
  value,
  readonly,
  actions,
  onChange,
  onClose,
}: {
  title: string;
  value: string;
  readonly?: boolean;
  actions: ReactNode;
  onChange: (value: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="modal-backdrop">
      <div className="modal archive-modal">
        <div className="modal-head">
          <h2>{title}</h2>
          <button onClick={onClose}>关闭</button>
        </div>
        <textarea
          className="archive-textarea"
          readOnly={readonly}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="归档文本"
        />
        <div className="card-actions">{actions}</div>
      </div>
    </div>
  );
}
