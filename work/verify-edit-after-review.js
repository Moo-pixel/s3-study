const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const callbacks = [];
const drawCtx = new Proxy({}, {
  get(_target, prop) {
    if (prop === "measureText") return text => ({ width: String(text).length * 7 });
    return () => {};
  },
  set() { return true; },
});
const canvas = {
  width: 980,
  height: 860,
  getBoundingClientRect() { return { left: 0, top: 0, width: 980, height: 860 }; },
  getContext() { return drawCtx; },
  addEventListener() {},
};
const elements = {};
function element(id) {
  if (!elements[id]) {
    elements[id] = {
      id,
      style: {},
      classList: { add() {}, remove() {}, toggle() {} },
      innerText: "",
      innerHTML: "",
    };
  }
  return elements[id];
}
elements.wireCanvas = canvas;
["res", "dh", "pbtn", "qtitle", "qguide"].forEach(id => { elements[id] = element(id); });
for (let i = 1; i <= 6; i++) elements[`qb${i}`] = element(`qb${i}`);

const ctx = {
  console,
  window: {},
  document: {
    getElementById(id) { return elements[id] || element(id); },
    addEventListener(type, callback) {
      if (type === "DOMContentLoaded") callbacks.push(callback);
    },
  },
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
  "js/hit-test.js",
  "js/app.js",
].forEach(file => {
  vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), ctx, { filename: file });
});
callbacks.forEach(callback => callback());

const result = vm.runInContext(`
function clickNode(id){
  const n = nodes.find(node => node.id === id);
  onMD({ clientX: n.x, clientY: n.y });
}
function selectAndDeleteFirstWire(){
  const c = conns[0];
  const pts = wireSamplePoints(c.n1, c.n2);
  const candidates = [bzMid(c.n1, c.n2), pts[Math.floor(pts.length / 2)], ...pts.filter((_, i) => i % 5 === 0)];
  for (const p of candidates) {
    selC = null;
    selN = null;
    onMD({ clientX: p.x, clientY: p.y });
    if (selC) {
      onMD({ clientX: p.x, clientY: p.y });
      return true;
    }
  }
  return false;
}
clickNode(1);
clickNode(104);
checkWiring();
const beforeDelete = { conns: conns.length, hints: hintConns.length, errN: errN.size, resVisible: RES.style.display };
const deleted = selectAndDeleteFirstWire();
const afterDelete = { conns: conns.length, hints: hintConns.length, errN: errN.size, errC: errC.size, resVisible: RES.style.display };
JSON.stringify({ beforeDelete, deleted, afterDelete });
`, ctx);

const parsed = JSON.parse(result);
const failures = [];
if (parsed.beforeDelete.conns !== 1) failures.push("測試線未建立。");
if (parsed.beforeDelete.hints === 0) failures.push("審查後未產生缺線提示，測試無法覆蓋殘留提示。");
if (!parsed.deleted) failures.push("審查後無法選取並刪除既有連線。");
if (parsed.afterDelete.conns !== 0) failures.push("審查後刪線未移除 conns 內的連線。");
if (parsed.afterDelete.hints !== 0) failures.push("審查後刪線仍殘留白色提示線。");
if (parsed.afterDelete.errN !== 0 || parsed.afterDelete.errC !== 0) failures.push("審查後刪線仍殘留錯誤標記。");
if (parsed.afterDelete.resVisible !== "none") failures.push("審查後刪線仍顯示舊審查結果。");

if (failures.length) {
  console.error(failures.join("\n"));
  console.error(JSON.stringify(parsed, null, 2));
  process.exit(1);
}

console.log("OK: 審查後編輯/刪除連線會清除舊審查提示，不會留下看似刪不掉的線。");
