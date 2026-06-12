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

function runWith(conns) {
  ctx.initLayout(1);
  const byId = id => ctx.nodes.find(n => n.id === id);
  ctx.conns = conns.map(([a, b, g = 22]) => ({ n1: byId(a), n2: byId(b), g }));
  return ctx.runModularRules({
    nodes: ctx.nodes,
    conns: ctx.conns,
    presets: ctx.presets,
    quizId: 1,
    sp: ctx.SP[1],
  });
}

const wrong = runWith([
  [1, 10, 14],   // 錯：高壓先接避雷器
  [10, 104, 14], // 再回到CO，電氣連通但考場順序錯
]);

if (!wrong.errors.some(msg => msg.includes("1 ↔ 104") && msg.includes("應直接接"))) {
  console.error("高壓活線夾未直接進CO時，審查沒有抓到錯誤。");
  console.error(wrong.errors.join("\n"));
  process.exit(1);
}

const wrongLa = runWith([
  [1, 104, 22],
  [104, 13, 14],
  [13, 10, 14],
]);

if (!wrongLa.errors.some(msg => msg.includes("104 ↔ 10") && msg.includes("應直接接"))) {
  console.error("CO未直接分接至LA高壓端時，審查沒有抓到錯誤。");
  console.error(wrongLa.errors.join("\n"));
  process.exit(1);
}

const correct = runWith([
  [1, 104, 22],
  [104, 10, 14],
]);

if (correct.errors.some(msg => msg.includes("1 ↔ 104") || msg.includes("104 ↔ 10"))) {
  console.error("正確順序：活線夾→CO→LA，卻被審查誤判。");
  console.error(correct.errors.join("\n"));
  process.exit(1);
}

console.log("OK: 高壓側順序規則已固定：活線夾必須直接接CO，CO再分接LA。");
