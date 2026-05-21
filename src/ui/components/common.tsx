import { BriefcaseBusiness } from "lucide-react";

export function NoCharacter() {
  return <section className="empty-state"><BriefcaseBusiness size={38} /><h1>还没有当前应劫者</h1><p>先在应劫者页唤醒或选择一位应劫者。</p></section>;
}

export function Metric({ label, value }: { label: string; value: string }) {
  return <div className="metric"><span>{label}</span><strong>{value}</strong></div>;
}

export function Stat({ title, value }: { title: string; value: string }) {
  return <div className="stat"><span>{title}</span><strong>{value}</strong></div>;
}
