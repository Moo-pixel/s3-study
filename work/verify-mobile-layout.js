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
  "js/layout-mobile.js",
  "js/node-map.js",
  "js/answer-spec.js",
  "js/standard-wires.js",
  "js/route-picker.js",
  "js/check-rules.js",
].forEach(file => {
  vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), ctx, { filename: file });
});

const canvas = { width: 1080, height: 1180 };
const failures = [];

function boxesOverlap(boxes) {
  const w = ctx.LAYOUT.tr.width;
  return boxes.some((a, i) => boxes.slice(i + 1).some(b => Math.abs(a.cx - b.cx) < w + 20));
}

for (let q = 1; q <= 6; q++) {
  ctx.initLayout(q);
  const sp = ctx.SP[q];
  const boxes = ctx.transformerBoxes(sp);
  if (boxesOverlap(boxes)) failures.push(`Q${q}: 變壓器箱體重疊`);

  ctx.nodes.forEach(n => {
    if (n.x < 0 || n.x > canvas.width || n.y < 0 || n.y > canvas.height) {
      failures.push(`Q${q}: 節點 ${n.id} 超出手機畫布 (${n.x},${n.y})`);
    }
    if (n.r < 10) failures.push(`Q${q}: 節點 ${n.id} 半徑未放大`);
  });

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
      const tap = ctx.pickBestLvTap({
        from: byId(w.from),
        row: w.toRow,
        nodes: ctx.nodes,
        usedLv,
        existingConns: ctx.conns,
      });
      if (!tap) failures.push(`Q${q}: ${w.id} 找不到 ${w.toRow} 接點`);
      else add(w.from, tap.id, w.g || 22);
    } else add(w.from, w.to, w.g || 22);
  });

  const result = ctx.runModularRules({
    nodes: ctx.nodes,
    conns: ctx.conns,
    presets: ctx.presets,
    quizId: q,
    sp,
  });
  if (result.errors.length) failures.push(`Q${q}: 手機標準答案審查不合格\n${result.errors.join("\n")}`);
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("OK: 手機布局節點在畫布內、變壓器不重疊，六題標準答案審查皆合格。");
