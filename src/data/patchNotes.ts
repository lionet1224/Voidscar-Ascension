import type { PatchNote } from "../types";

export const patchNotes: PatchNote[] = [
  {
    version: "0.1.0",
    title: "第一道纪：劫火初燃开启",
    date: "2026-05-21",
    highlights: ["开放剑修、灵弓、术修", "开放洞天秘境、归墟天阶、神游历练", "开放战诀树、法器词缀和道痕记录"],
    changes: [
      { category: "new", items: ["新增天机命盘式主界面和本地存档。", "新增战诀推演画布，支持 25/50/75 精英劫煞和 100% 劫主。", "新增法器掉落、自动分解和天阶法宝效果。"] },
      { category: "system", items: ["新增最多 24 小时神游历练结算。", "新增道纪法印和旧纪道影状态。"] },
    ],
  },
];
