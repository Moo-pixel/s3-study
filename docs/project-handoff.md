# s3-study 專案交接文件

專案名稱：`s3-study`

用途：乙級室內配線術科第三站（外線作業）六題模擬訓練系統。

目前狀態：

- 桌機版：`desktop.html`
- 手機版：`mobile.html`
- 答案規格集中：`js/answer-spec.js`
- 標準答案顯示：由 `answer-spec.js` 轉出
- 配線審查：由 `answer-spec.js` 驅動
- 回歸測試：放在 `work/`

目前建議使用版本：

```text
desktop.html?v=19
mobile.html?v=19
```

---

## 1. 專案架構

```text
s3-study/
├── index.html
├── desktop.html
├── mobile.html
├── css/
│   ├── desktop.css
│   └── mobile.css
├── js/
│   ├── quiz-data.js
│   ├── answer-spec.js
│   ├── standard-wires.js
│   ├── check-rules.js
│   ├── route-picker.js
│   ├── hit-test.js
│   ├── node-map.js
│   ├── layout-desktop.js
│   ├── layout-mobile.js
│   └── app.js
├── docs/
│   ├── check-principles.md
│   └── project-handoff.md
├── work/
│   ├── verify-answer-spec.js
│   ├── verify-check-rules.js
│   ├── verify-edit-after-review.js
│   ├── verify-primary-sequence.js
│   ├── verify-review-hints.js
│   ├── verify-review.js
│   ├── verify-routing.js
│   ├── verify-mobile-layout.js
│   └── verify-training-principle.js
└── legacy/
```

---

## 2. 主要檔案職責

### `quiz-data.js`

負責題目顯示資料：

- 題目名稱
- 右側考生施作說明
- 低壓線文字標籤
- 材料數量

注意：  
這裡的文字只負責顯示，不應作為審查規則來源。

---

### `answer-spec.js`

這是目前最重要的檔案。

功能：

- 定義六題的正確答案規格
- 固定哪些線是必要線
- 定義哪些線必須直接接
- 定義哪些低壓線只看功能線，不看固定接點

目前使用三種資料函式：

```js
W(id, section, from, to, desc, g)
```

代表必要線路，只要相通即可。

```js
D(id, section, from, to, desc, g)
```

代表必要線路，而且必須直接接。

```js
R(id, section, from, toRow, desc, g)
```

代表接到某一條低壓功能線，不限制固定 C 型環位置。

---

### `standard-wires.js`

負責將 `answer-spec.js` 的答案規格轉成畫面可繪製的標準答案線。

原則：

- 不在這裡定義正確答案
- 不在這裡寫審查邏輯
- 只做資料轉換

---

### `check-rules.js`

負責配線審查。

審查來源是 `answer-spec.js`。

主要檢查：

- 高壓幹線是否先直接接到熔絲鏈 CO
- CO 電源側是否直接分接 LA
- LA 接地是否串接到 99
- CO 負載側是否直接分兩條到變壓器
- 變壓器 H 端是否相通到指定點
- 變壓器 X 端是否相通並接到對應低壓線
- 外殼 G 是否接到 45
- 外殼接地是否混接到 48
- 低壓 C 型環是否重複使用
- 線徑是否正確

---

### `route-picker.js`

負責標準答案顯示時，低壓 C 型環位置的選擇。

審查時不使用固定點。

選點原則：

- 距離 X 端最近
- 不重複使用同一個 C 型環
- 儘量不跨中間電桿
- 儘量降低線路重疊

---

### `layout-desktop.js`

桌機版設備座標。

包含：

- 高壓線 A/B/C
- 電線桿與橫桿
- LA / CO
- 變壓器箱體
- H / X / G 端子
- 低壓四條線與 C 型環位置

---

### `layout-mobile.js`

手機版設備座標。

手機版採用大畫布，不直接縮小桌機版：

```text
canvas: 1080 x 1180
```

手機版特色：

- 畫布可左右滑動
- 接點半徑放大
- 上方固定題目與操作工具列
- 下方顯示說明與審查結果

---

### `node-map.js`

依據 layout 建立所有節點。

節點包含：

- 高壓線節點
- LA 節點
- CO 節點
- 接地口 99 / 45 / 48
- 變壓器 H / X / G
- 低壓 C 型環節點

手機版會使用：

```js
LAYOUT.nodeRadius || 7
```

因此手機版可放大接點。

---

### `app.js`

主程式。

功能：

- 題目切換
- 畫面繪製
- 使用者接線
- 顯示標準答案
- 顯示固定 X2-X3 銅片內短
- 配線審查入口
- 刪線與選取線

目前 `app.js` 已經不應再寫新的審查規則。  
新的審查規則應寫在 `check-rules.js`。

---

## 3. 審查核心原則

### 3.1 高壓側順序

台灣考場規則：

```text
高壓活線夾 -> 熔絲鏈 CO 電源側 -> 避雷器 LA 高壓端
```

不可接成：

```text
高壓活線夾 -> 避雷器 LA -> 熔絲鏈 CO
```

原因：

雖然實務上避雷器先接也可能有保護效果，但考場要求高壓先進熔絲鏈，避免避雷器故障導致整區斷電。

程式判斷：

- 活線夾到 CO：必須直接接，22mm²
- CO 到 LA：必須直接接，14mm²

---

### 3.2 熔絲鏈 CO 負載側

熔絲鏈負載側只能出一條主線。

禁止：

```text
CO負載側 -> TR1
CO負載側 -> TR2
```

正確：

```text
CO負載側 -> 某一個變壓器 H 端
再由變壓器套管端子串接
```

程式判斷：

- 同一個 CO 負載側若直接接出兩條以上到 `tr_hv`，判錯。

---

### 3.3 變壓器 H 端

變壓器高壓套管允許串接。

不限制先接哪一個 H，只要符合題意且相通即可。

例如第三題 / 第六題 Delta 高壓：

```text
108 -> 202 -> 204
```

可視為 B 相 CO 已接到 TR2 H1，前提是 `202 ↔ 204` 存在。

因此：

- 高壓幹線與 CO / LA：直接檢查
- 變壓器 H 套管：相通檢查

---

### 3.4 變壓器 X 端

X 端允許串接，不限制先接哪一端。

但必須符合各題題意：

- 該短接的 X 必須相通
- 該接到 N / A / B / C 的功能線必須正確

例如第三題 Delta：

```text
304 ↔ 305
304 或 305 任一端接到 A 相低壓線皆可
```

---

### 3.5 低壓 C 型環

實際考場不指定 C 型環固定位置。

因此審查只看功能線：

- `row1`：被接地線
- `row2`：A 相低壓線
- `row3`：B 相低壓線
- `row4`：C 相低壓線

考生可接在同一條線上的任一合理 C 型環。

標準答案顯示會選一個推薦位置，但審查不可鎖死該位置。

---

### 3.6 接地

接地分兩種，不可混接：

```text
外殼接地：G -> 45
系統被接地：低壓被接地線 -> 48
```

禁止：

```text
G -> 48
45 -> 48
```

程式判斷：

- 若 45 與 48 相通，判定錯誤
- 若任何 TR 外殼 G 與 48 相通，判定錯誤

---

### 3.7 線徑

目前規則：

```text
LA 相關線：14mm²
其他標準必要線：22mm²
```

程式會將線徑錯誤列為明顯錯誤，並標示錯誤線。

### 3.8 第三、六題高壓預配線仍須自行確認

題庫實作說明提到第三題、 第六題「熔絲鏈開關負載側至變壓器一次側引線已接妥」。但練習系統仍要求考生自行接線與自我檢查，原因如下：

實際考場可能發生前一位考生或現場服務員拆線、復原時，不小心拆掉部分已配妥線路，且事後無從考證。下一位考生若因平常練習時總認為第三、六題高壓已配妥而未檢查，監評老師仍可能認定「崗位現況應由考生自行確認」，最後以高壓接線不符合題意判定不合格，申訴也不一定成立。

因此本系統的訓練原則是：

- 練習時只有各變壓器內部 `X2-X3` 銅片短接視為已接好。
- 除 `X2-X3` 內部銅片外，所有關鍵線都必須由考生自己畫出並確認。
- 第三題、 第六題的 CO 負載側至變壓器 H 端，以及高壓 Delta 套管跳線，都不可顯示成已配妥線，也不可自動視為合格。
- 這是刻意偏向考場風險訓練，而不是單純依題庫文字假設現場永遠已正確配妥。

---
## 4. 六題接線方法整理

以下為目前 `answer-spec.js` 使用的核心接線規格。

---

### 試題一：V-V 3φ3W 220V

高壓：

```text
A活線夾 -> A CO電源側
A CO電源側 -> A LA高壓端
B活線夾 -> B CO電源側
B CO電源側 -> B LA高壓端
C活線夾 -> C CO電源側
C CO電源側 -> C LA高壓端

A LA接地 -> B LA接地 -> C LA接地 -> 99

A CO負載側 -> TR1 H1
B CO負載側 -> TR1 H2
TR1 H2 -> TR2 H1
C CO負載側 -> TR2 H2
```

接地：

```text
TR1 G -> TR2 G -> 45
```

低壓：

```text
TR1 X4 ↔ TR2 X1
共用點 -> 被接地線
TR1 X1 -> A相低壓線
TR2 X4 -> B相低壓線
被接地線 -> 48
```

---

### 試題二：V-V 3φ4W 110/220V

高壓同試題一。

接地：

```text
TR1 G -> TR2 G -> 45
```

低壓：

```text
TR1 X4 ↔ TR2 X1
TR1 X2/X3 工作中性點 -> 被接地線
TR1 X1 -> A相低壓線
TR1 X4 / TR2 X1 共同點 -> B相低壓線
TR2 X4 -> C相低壓線
被接地線 -> 48
```

---

### 試題三：Delta-Delta 3φ3W 220V

高壓：

```text
A活線夾 -> A CO電源側 -> A LA
B活線夾 -> B CO電源側 -> B LA
C活線夾 -> C CO電源側 -> C LA

A LA接地 -> B LA接地 -> C LA接地 -> 99

A CO負載側 -> TR1 H1
B CO負載側 -> TR2 H1
C CO負載側 -> TR3 H1

TR1 H2 ↔ TR2 H1
TR2 H2 ↔ TR3 H1
TR3 H2 ↔ TR1 H1
```

注意：

變壓器 H 端允許串接，所以 `B CO負載側 -> TR1 H2 -> TR2 H1` 可接受，前提是相通正確。

接地：

```text
TR1 G -> TR2 G -> TR3 G -> 45
```

低壓 Delta：

```text
TR1 X4 ↔ TR2 X1
TR2 X4 ↔ TR3 X1
TR3 X4 ↔ TR1 X1

TR3 X4 / TR1 X1 頂點 -> 被接地線
TR1 X4 / TR2 X1 頂點 -> A相低壓線
TR2 X4 / TR3 X1 頂點 -> B相低壓線
被接地線 -> 48
```

---

### 試題四：開Y-V 3φ4W 110/220V

高壓：

```text
A活線夾 -> A CO電源側 -> A LA
C活線夾 -> C CO電源側 -> C LA
A LA接地 -> C LA接地 -> 99

A CO負載側 -> TR1 H1
C CO負載側 -> TR2 H1
```

接地：

```text
TR1 G ↔ TR2 G
TR2 G -> 45
```

低壓：

```text
TR1 X4 ↔ TR2 X1
TR1 X2/X3 工作中性點 -> 被接地線
TR1 X1 -> A相低壓線
TR1 X4 / TR2 X1 共同點 -> B相低壓線
TR2 X4 -> C相低壓線
被接地線 -> 48
```

---

### 試題五：開Y-V 3φ3W 220V

高壓與試題四相同。

接地：

```text
TR1 G ↔ TR2 G
TR2 G -> 45
```

低壓：

```text
TR1 X4 ↔ TR2 X1
共用點 -> 被接地線
TR1 X1 -> A相低壓線
TR2 X4 -> B相低壓線
被接地線 -> 48
```

---

### 試題六：Delta-Y 3φ4W 220/380V

高壓 Delta：

```text
A活線夾 -> A CO電源側 -> A LA
B活線夾 -> B CO電源側 -> B LA
C活線夾 -> C CO電源側 -> C LA

A LA接地 -> B LA接地 -> C LA接地 -> 99

A CO負載側 -> TR1 H1
B CO負載側 -> TR2 H1
C CO負載側 -> TR3 H1

TR1 H2 ↔ TR2 H1
TR2 H2 ↔ TR3 H1
TR3 H2 ↔ TR1 H1
```

H 端同樣允許串接，只要相通。

接地：

```text
TR1 G -> TR2 G -> TR3 G -> 45
```

低壓 Y：

```text
TR1 X4 ↔ TR2 X4 ↔ TR3 X4
Y中性點 -> 被接地線
TR1 X1 -> A相低壓線
TR2 X1 -> B相低壓線
TR3 X1 -> C相低壓線
被接地線 -> 48
```

---

## 5. 標準答案顯示與審查的差異

標準答案顯示：

- 會選擇一組推薦接線
- 優先短線
- 優先不交叉
- 優先不共用 C 型環
- 優先符合考場施工習慣

審查：

- 不強迫低壓 C 型環固定點
- 不強迫 H / X 端先接哪一個
- 會強迫高壓活線夾先到 CO
- 會強迫 CO 電源側再分接 LA
- 會強迫 CO 負載側不可直接分兩條到變壓器
- 會強迫接地系統不可混接

---

## 6. 測試與驗證

所有重要修改後建議執行：

```powershell
node .\s3-study\work\verify-answer-spec.js
node .\s3-study\work\verify-check-rules.js
node .\s3-study\work\verify-edit-after-review.js
node .\s3-study\work\verify-primary-sequence.js
node .\s3-study\work\verify-review-hints.js
node .\s3-study\work\verify-review.js
node .\s3-study\work\verify-routing.js
node .\s3-study\work\verify-mobile-layout.js
node .\s3-study\work\verify-training-principle.js
```

各測試用途：

### `verify-answer-spec.js`

檢查六題必要線是否完整。

防止：

- 第二題漏 `304 ↔ 305`
- 第三題漏 Delta 閉合線
- 第六題漏 Y 中性點

---

### `verify-check-rules.js`

檢查核心審查反例。

目前包含：

- 高壓先接 LA 再回 CO，要判錯
- LA 分接線徑錯，要判錯
- CO 負載側直接分兩條到 H，要判錯
- 外殼 G / 45 接到 48，要判錯
- 低壓同功能線任一 C 型環，不可誤判
- 第三題 H 串接不可誤判
- 第三題低壓 Delta 頂點不可誤判

---

### `verify-edit-after-review.js`

檢查審查後仍可編輯與刪除既有連線。

目的：

- 刪線後不殘留白色提示線
- 刪線後不殘留錯誤節點 / 錯誤線標記
- 刪線後舊審查結果不繼續顯示

---

### `verify-primary-sequence.js`

專門檢查：

```text
活線夾 -> CO -> LA
```

不可倒接。

---

### `verify-review-hints.js`

專門檢查審查後白色低壓提示線。

目的：

- 白色提示線不可固定拉到該功能列第一個 C 型環
- 必須使用與標準答案顯示相同的就近選點
- 六題所有低壓功能線提示都要與 `route-picker.js` 的結果一致

---

### `verify-review.js`

將六題標準答案由 `answer-spec.js` 產生，再交給 `check-rules.js` 審查。

目的：

確保標準答案本身不會被審查判錯。

---

### `verify-routing.js`

檢查標準答案顯示時低壓 C 型環選點。

目的：

- 不重複
- 不跨中間電桿
- 優先就近

---

### `verify-mobile-layout.js`

檢查手機版：

- 節點在畫布內
- 變壓器不重疊
- 六題標準答案審查合格

---

### `verify-training-principle.js`

檢查訓練原則不可被改壞。

目的：

- 只有 `X2-X3` 銅片內短視為預設接好
- 不再顯示 Q3/Q6 高壓 Delta 跳線為考場配妥
- Q3/Q6 高壓 Delta 跳線仍列在答案規格，必須由考生自行確認

---

## 7. 移植到新專案建議

若要轉移到新專案，建議先搬以下檔案：

```text
js/quiz-data.js
js/answer-spec.js
js/standard-wires.js
js/check-rules.js
js/route-picker.js
js/hit-test.js
js/node-map.js
js/layout-desktop.js
js/layout-mobile.js
js/app.js
css/desktop.css
css/mobile.css
desktop.html
mobile.html
docs/check-principles.md
docs/project-handoff.md
work/*.js
```

移植順序：

1. 先讓 `desktop.html` 能正常開啟
2. 確認 `answer-spec.js` 載入在 `standard-wires.js` 與 `check-rules.js` 前面
3. 執行所有 `work/verify-*.js`
4. 再處理 UI 或 layout
5. 最後才調整畫線美觀

---

## 8. 開發注意事項

不要再把正確答案直接寫進：

- `app.js`
- `standard-wires.js`
- `layout-*.js`
- `quiz-data.js`

正確答案只能放在：

```text
js/answer-spec.js
```

審查規則只能放在：

```text
js/check-rules.js
```

畫面座標只能放在：

```text
js/layout-desktop.js
js/layout-mobile.js
```

低壓標準答案選點只能放在：

```text
js/route-picker.js
```

這樣才能避免「改畫面造成審查錯」、「改審查造成標準答案漏線」、「改一題影響其他題」。


