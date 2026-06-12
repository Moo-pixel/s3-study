const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");

const ctx = {
  console,
  window: {},
  nodes: [],
  conns: [],
  presets: [],
  selN: null,
  selC: null,
  errN: new Set(),
  errC: new Set(),
  hintConns: [],
  RES: { style: {} },
  DH: { classList: { remove() {} } },
};
ctx.window = ctx;
vm.createContext(ctx);
[
  "js/quiz-data.js",
  "js/layout-desktop.js",
  "js/node-map.js",
  "js/answer-spec.js",
].forEach(file => {
  vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), ctx, { filename: file });
});

const failures = [];

for (let q = 1; q <= 6; q++) {
  ctx.initLayout(q);
  const nonCopperPresets = ctx.presets.filter(c => !c.copper);
  if (nonCopperPresets.length) {
    failures.push(`Q${q}: 除 X2-X3 內部銅片外，不可再有考場配妥預設線。`);
  }
}

[
  ["desktop.html", "顯示考場配妥"],
  ["desktop.html", "灰虛線"],
  ["mobile.html", "顯示考場配妥"],
  ["mobile.html", "考場配妥"],
  ["mobile.html", "灰虛線"],
].forEach(([file, text]) => {
  const content = fs.readFileSync(path.join(root, file), "utf8");
  if (content.includes(text)) failures.push(`${file}: 不應再出現「${text}」。`);
});

[
  [3, "q3-delta-h-tr1-tr2"],
  [3, "q3-delta-h-tr2-tr3"],
  [3, "q3-delta-h-tr3-tr1"],
  [6, "q6-delta-h-tr1-tr2"],
  [6, "q6-delta-h-tr2-tr3"],
  [6, "q6-delta-h-tr3-tr1"],
].forEach(([q, id]) => {
  if (!ctx.getAnswerWireIds(q).includes(id)) {
    failures.push(`Q${q}: 高壓 Delta 跳線 ${id} 必須由考生練習確認。`);
  }
});

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("OK: 訓練原則已固定，只有 X2-X3 視為預設接好，其餘關鍵線都須自行確認。");
