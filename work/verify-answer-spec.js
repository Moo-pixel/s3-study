const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const ctx = { console, window: {} };
ctx.window = ctx;
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root, "js/answer-spec.js"), "utf8"), ctx, {
  filename: "js/answer-spec.js",
});

function edgeKey(a, b) {
  return [a, b].sort((x, y) => x - y).join("-");
}

const mustHave = {
  1: {
    direct: [[304, 305], [107, 201], [108, 202], [202, 204], [109, 205], [203, 206], [206, 45]],
    row: [[304, "row1"], [301, "row2"], [308, "row3"], [48, "row1"]],
  },
  2: {
    direct: [[304, 305], [107, 201], [108, 202], [202, 204], [109, 205], [203, 206], [206, 45]],
    row: [[303, "row1"], [301, "row2"], [305, "row3"], [308, "row4"], [48, "row1"]],
  },
  3: {
    direct: [[202, 204], [205, 207], [208, 201], [304, 305], [308, 309], [312, 301], [203, 206], [206, 209], [209, 45]],
    row: [[301, "row1"], [305, "row2"], [309, "row3"], [48, "row1"]],
  },
  4: {
    direct: [[304, 305], [107, 201], [109, 204], [203, 206], [206, 45]],
    row: [[303, "row1"], [301, "row2"], [305, "row3"], [308, "row4"], [48, "row1"]],
  },
  5: {
    direct: [[304, 305], [107, 201], [109, 204], [203, 206], [206, 45]],
    row: [[304, "row1"], [301, "row2"], [308, "row3"], [48, "row1"]],
  },
  6: {
    direct: [[202, 204], [205, 207], [208, 201], [304, 308], [308, 312], [203, 206], [206, 209], [209, 45]],
    row: [[312, "row1"], [301, "row2"], [305, "row3"], [309, "row4"], [48, "row1"]],
  },
};

const failures = [];
for (let q = 1; q <= 6; q++) {
  const spec = ctx.getAnswerSpec(q);
  if (!spec) {
    failures.push(`Q${q}: 缺少答案規格`);
    continue;
  }
  const wires = ctx.getAnswerWires(q);
  const ids = new Set();
  const direct = new Set();
  const rows = new Set();

  wires.forEach(w => {
    if (!w.id) failures.push(`Q${q}: 有必要線路缺少 id`);
    if (!w.desc) failures.push(`Q${q}: ${w.id || "(no id)"} 缺少文字說明`);
    if (ids.has(w.id)) failures.push(`Q${q}: 重複 wire id ${w.id}`);
    ids.add(w.id);
    if (w.toRow) rows.add(`${w.from}->${w.toRow}`);
    else direct.add(edgeKey(w.from, w.to));
    if ((w.section === "primary" || w.section === "la-ground") && w.g === 14 && !w.desc.includes("避雷器")) {
      failures.push(`Q${q}: ${w.id} 為14mm²但說明未標示避雷器用途`);
    }
  });

  mustHave[q].direct.forEach(([a, b]) => {
    if (!direct.has(edgeKey(a, b))) failures.push(`Q${q}: 必要直連缺少 ${a}<->${b}`);
  });
  mustHave[q].row.forEach(([from, row]) => {
    if (!rows.has(`${from}->${row}`)) failures.push(`Q${q}: 必要低壓功能缺少 ${from}->${row}`);
  });

  [107, 108, 109].forEach(co => {
    const directToH = wires.filter(w =>
      (w.from === co || w.to === co) &&
      [201, 202, 204, 205, 207, 208].includes(w.from === co ? w.to : w.from)
    );
    if (directToH.length > 1) {
      failures.push(`Q${q}: CO負載側 ${co} 規格直接分出 ${directToH.length} 條到H端，違反一條主線原則`);
    }
  });

  wires
    .filter(w => w.section === "primary" && (w.id.includes("hot-co") || w.id.includes("co-la")))
    .forEach(w => {
      if (!w.direct) failures.push(`Q${q}: ${w.id} 必須標記 direct，固定高壓順序不可只看相通`);
    });
  wires
    .filter(w => w.section === "primary-load" || w.section === "low-voltage")
    .forEach(w => {
      if (!w.toRow && w.direct) failures.push(`Q${q}: ${w.id} 不應標記 direct，變壓器H/X串接只看相通`);
    });
  wires
    .filter(w => w.section === "la-ground")
    .forEach(w => {
      if (!w.direct) failures.push(`Q${q}: ${w.id} 避雷器接地串接必須直接呈現`);
    });
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("OK: answer-spec 六題必要線路完整，且CO負載側未直接分兩條到H端。");
