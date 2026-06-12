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
  RES: null,
  DH: { classList: { remove(){} } },
};
ctx.window = ctx;
vm.createContext(ctx);

[
  "js/quiz-data.js",
  "js/layout-desktop.js",
  "js/node-map.js",
  "js/answer-spec.js",
  "js/standard-wires.js",
  "js/route-picker.js",
  "js/check-rules.js",
].forEach(file => {
  vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), ctx, { filename: file });
});

const failures = [];
for (let q = 1; q <= 6; q++) {
  ctx.initLayout(q);
  const usedLv = new Set();
  const byId = id => ctx.nodes.find(n => n.id === id);
  const add = (a, b, g = 22) => {
    const n1 = byId(a);
    const n2 = byId(b);
    if (!n1 || !n2) failures.push(`Q${q}: 找不到節點 ${a}<->${b}`);
    else {
      ctx.conns.push({ n1, n2, g });
      if (n1.type === "lv_grid") usedLv.add(n1.id);
      if (n2.type === "lv_grid") usedLv.add(n2.id);
    }
  };

  ctx.getStandardWires(q).forEach(w => {
    if (w.toRow) {
      const src = byId(w.from);
      const tap = ctx.pickBestLvTap({
        from: src,
        row: w.toRow,
        nodes: ctx.nodes,
        usedLv,
        existingConns: ctx.conns,
      });
      if (!tap) failures.push(`Q${q}: ${w.id} 找不到 ${w.toRow} 接點`);
      else add(w.from, tap.id, w.g || 22);
    } else {
      add(w.from, w.to, w.g || 22);
    }
  });

  const result = ctx.runModularRules({
    nodes: ctx.nodes,
    conns: ctx.conns,
    presets: ctx.presets,
    quizId: q,
    sp: ctx.SP[q],
  });
  if (result.errors.length) {
    failures.push(`Q${q}: 標準答案審查不合格\n${result.errors.join("\n")}`);
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("OK: 六題標準答案由 answer-spec 產生後，check-rules 審查皆合格。");
