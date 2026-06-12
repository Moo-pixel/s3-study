const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");

function makeContext() {
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
  return ctx;
}

function audit(q, edges) {
  const ctx = makeContext();
  ctx.initLayout(q);
  const byId = id => ctx.nodes.find(n => n.id === id);
  ctx.conns = edges.map(([a, b, g = 22]) => ({ n1: byId(a), n2: byId(b), g }));
  return ctx.runModularRules({
    nodes: ctx.nodes,
    conns: ctx.conns,
    presets: ctx.presets,
    quizId: q,
    sp: ctx.SP[q],
  });
}

const failures = [];

let result = audit(1, [
  [1, 10, 14],
  [10, 104, 14],
]);
if (!result.errors.some(msg => msg.includes("應直接接 1 ↔ 104"))) {
  failures.push("高壓活線夾先接LA再接CO，未被判錯。");
}

result = audit(1, [
  [1, 104, 22],
  [104, 10, 22],
]);
if (!result.errors.some(msg => msg.includes("線徑錯誤") && msg.includes("104 ↔ 10"))) {
  failures.push("LA分接線使用22mm²時，未被判線徑錯誤。");
}

result = audit(1, [
  [107, 201],
  [107, 204],
]);
if (!result.errors.some(msg => msg.includes("CO負載側(107)不可直接分出"))) {
  failures.push("CO負載側直接分兩條到H端，未被判工法錯誤。");
}

result = audit(1, [
  [203, 48],
]);
if (!result.errors.some(msg => msg.includes("外殼接地") && msg.includes("48"))) {
  failures.push("外殼G接到48，未被判接地混接。");
}

result = audit(1, [
  [45, 48],
]);
if (!result.errors.some(msg => msg.includes("外殼接地") && msg.includes("48"))) {
  failures.push("45接到48，未被判接地混接。");
}

result = audit(1, [
  [304, 405],
]);
if (result.errors.some(msg => msg.includes("304 未接到被接地線"))) {
  failures.push("低壓同功能線任意C型環被誤判，應允許非固定點。");
}

result = audit(3, [
  [108, 202],
  [202, 204],
]);
if (result.errors.some(msg => msg.includes("B相CO負載側接TR2 H1"))) {
  failures.push("第三題高壓套管串接被誤判，108→202→204 應可接受。");
}

result = audit(3, [
  [304, 305],
  [304, 411],
]);
if (result.errors.some(msg => msg.includes("Delta A相輸出"))) {
  failures.push("第三題低壓Delta頂點同點相通被誤判，304↔305後接A相應可接受。");
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("OK: 核心審查反例通過，高壓順序、線徑、CO分接、接地混接、低壓功能判斷皆符合原則。");
