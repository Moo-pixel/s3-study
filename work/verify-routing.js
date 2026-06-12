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
].forEach(file => {
  vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), ctx, { filename: file });
});

function crossesPole(a, b) {
  const px = ctx.LAYOUT.pole.x;
  return (a.x < px && b.x > px) || (a.x > px && b.x < px);
}

const failures = [];
for (let q = 1; q <= 6; q++) {
  ctx.initLayout(q);
  const usedLv = new Set();
  const chosen = [];
  const byId = id => ctx.nodes.find(n => n.id === id);

  ctx.getStandardWires(q).forEach(w => {
    if (!w.toRow) return;
    const src = byId(w.from);
    const tap = ctx.pickBestLvTap({
      from: src,
      row: w.toRow,
      nodes: ctx.nodes,
      usedLv,
      existingConns: chosen,
    });
    if (!tap) {
      failures.push(`Q${q}: ${w.from} 找不到 ${ctx.rowDisplayName(w.toRow)} 接點`);
      return;
    }
    if (usedLv.has(tap.id)) {
      failures.push(`Q${q}: ${tap.id} 被重複選用`);
    }
    if (src.type === "tr_lv" && crossesPole(src, tap)) {
      failures.push(`Q${q}: ${w.from} → ${tap.id} 跨過中間電桿，違反就近原則`);
    }
    usedLv.add(tap.id);
    chosen.push({ n1: src, n2: tap });
  });
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("OK: 六題低壓標準答案選點皆可用、不重複，且變壓器往低壓線不跨中間電桿。");
