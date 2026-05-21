import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const roots = ["src/data", "src/ui"];
const extensions = new Set([".ts", ".tsx"]);

const forbidden = [
  { pattern: "开发数据库", reason: "玩家界面不能出现开发工具称呼，应改为图鉴、命盘、札记等世界观内说法。" },
  { pattern: "仅本地开发模式", reason: "不要向玩家暴露运行环境或开发模式。" },
  { pattern: "推荐 BD", reason: "BD 是开发/社区黑话，应改为流派、修行思路、战诀搭配。" },
  { pattern: "BD 建议", reason: "BD 是开发/社区黑话，应改为修行提示或流派参悟。" },
  { pattern: "开发者", reason: "玩家文案不要提开发者视角。" },
  { pattern: "Codex", reason: "玩家文案不要提开发工具或实现来源。" },
  { pattern: "MVP", reason: "玩家文案不要出现开发阶段术语。" },
  { pattern: "数据包", reason: "玩家文案不要出现内容生产术语，应改为赛季、道纪、札记。" },
  { pattern: "接入", reason: "玩家文案不要描述工程接入，应描述玩法开放或机制生效。" },
  { pattern: "构筑覆盖", reason: "玩家文案不要像功能清单，应改为流派可选择、修行方向。" },
  { pattern: "道痕建议", reason: "玩家文案应使用道痕记录、修行提示等自然说法。" },
  { pattern: "debug", reason: "玩家文案不要出现调试术语。" },
  { pattern: "TODO", reason: "玩家文案不要出现待办标记。" },
];

const itemLoreForbidden = [
  { pattern: "适合", reason: "法器说明应写成世界观内的器物来历，不要直接指导用途。" },
  { pattern: "用于", reason: "法器说明应避免功能说明口吻，改成器铭、传承、来历或异象。" },
  { pattern: "服务于", reason: "法器说明不要暴露设计目的，应保留沉浸感。" },
  { pattern: "过渡", reason: "法器说明不要使用养成阶段术语。" },
  { pattern: "胚子", reason: "法器说明不要使用刷装黑话。" },
  { pattern: "构筑", reason: "法器说明不要使用攻略黑话，应改为流派、道脉、修行方向。" },
  { pattern: "玩法", reason: "法器说明不要解释玩法，应写器物本身。" },
  { pattern: "功能性", reason: "法器说明不要像产品说明，应写世界观表达。" },
];

const offenders = [];

for (const file of roots.flatMap(walk)) {
  if (!extensions.has(file.slice(file.lastIndexOf(".")))) continue;
  const source = readFileSync(file, "utf8");
  const lines = source.split(/\r?\n/);
  lines.forEach((line, index) => {
    forbidden.forEach(({ pattern, reason }) => {
      if (line.includes(pattern)) {
        offenders.push({ file, line: index + 1, pattern, reason, text: line.trim() });
      }
    });
    if (file.endsWith("src/data/itemDatabase.ts")) {
      itemLoreForbidden.forEach(({ pattern, reason }) => {
        if (line.includes(pattern)) {
          offenders.push({ file, line: index + 1, pattern, reason, text: line.trim() });
        }
      });
    }
  });
}

if (offenders.length) {
  console.error("玩家可见文案检查失败：发现可能穿帮的开发向表达。");
  offenders.forEach((entry) => {
    console.error(`\n${entry.file}:${entry.line}`);
    console.error(`  命中：${entry.pattern}`);
    console.error(`  原因：${entry.reason}`);
    console.error(`  内容：${entry.text}`);
  });
  process.exit(1);
}

function walk(root) {
  const entries = readdirSync(root);
  return entries.flatMap((entry) => {
    const path = join(root, entry);
    const stat = statSync(path);
    return stat.isDirectory() ? walk(path) : [path];
  });
}
