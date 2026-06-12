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
  DH: { classList: { remove() {} } },
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

function expectedRowTargets(q) {
  ctx.initLayout(q);
  const byId = id => ctx.nodes.find(n => n.id === id);
  const usedLv = new Set();
  const existingConns = [];
  const targets = new Map();

  ctx.getStandardWires(q).forEach(w => {
    const src = byId(w.from);
    if (!src) return;
    if (w.toRow) {
      const tap = ctx.pickBestLvTap({
        from: src,
        row: w.toRow,
        nodes: ctx.nodes,
        usedLv,
        existingConns,
      });
      if (tap) {
        targets.set(w.id, { from: w.from, to: tap.id });
        usedLv.add(tap.id);
        existingConns.push({ n1: src, n2: tap, g: w.g || 22 });
      }
      return;
    }
    const dst = byId(w.to);
    if (dst) existingConns.push({ n1: src, n2: dst, g: w.g || 22 });
  });

  return targets;
}

const failures = [];

for (let q = 1; q <= 6; q++) {
  ctx.initLayout(q);
  const expected = expectedRowTargets(q);
  const result = ctx.runModularRules({
    nodes: ctx.nodes,
    conns: [],
    presets: ctx.presets,
    quizId: q,
    sp: ctx.SP[q],
  });

  ctx.getAnswerWires(q).filter(w => w.toRow).forEach(w => {
    const target = expected.get(w.id);
    if (!target) {
      failures.push(`Q${q}: ${w.id} 找不到標準答案低壓提示目標。`);
      return;
    }
    const hasHint = result.hints.some(h => h.n1.id === target.from && h.n2.id === target.to);
    if (!hasHint) {
      const actual = result.hints
        .filter(h => h.n1.id === target.from)
        .map(h => h.n2.id)
        .join(",") || "(none)";
      failures.push(`Q${q}: ${w.id} 白色提示應到 ${target.to}，實際為 ${actual}。`);
    }
  });
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("OK: 六題審查白色低壓提示線皆使用標準答案的就近選點。");
