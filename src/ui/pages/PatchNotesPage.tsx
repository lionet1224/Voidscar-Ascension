import { patchNotes } from "../../data/patchNotes";
import { patchCategoryLabels } from "../labels";

export function PatchNotesPage() {
  return (
    <div className="page-stack">
      {patchNotes.map((note) => (
        <section className="panel" key={note.version}>
          <h2>{note.version} · {note.title}</h2>
          <p className="muted">{note.date}</p>
          <ul className="action-list">{note.highlights.map((item) => <li key={item}>{item}</li>)}</ul>
          {note.changes.map((change) => (
            <div key={change.category}>
              <h3>{patchCategoryLabels[change.category]}</h3>
              <ul>{change.items.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
