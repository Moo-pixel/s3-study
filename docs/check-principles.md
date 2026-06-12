# 第三站審查原則

本文件整理程式審查邏輯的基準。修改標準答案、畫線、布局前，先確認是否違反以下規則。

## 1. 固定設備線必須直接接

必須直接接的固定設備線包含：

- 高壓活線夾
- 熔絲鏈 CO 電源側 / 負載側
- 避雷器 LA 高壓端 / 接地端

這些線不只看電氣連通，必須直接接到指定端子。

正確：

```text
高壓活線夾 -> CO 電源側 -> LA 高壓端
```

錯誤：

```text
高壓活線夾 -> LA 高壓端 -> CO 電源側
```

原因：台灣考場規定高壓先進熔絲鏈，再由 CO 電源側分接避雷器，避免避雷器故障導致整區斷電。

## 1.1 變壓器 H / X 端允許串接

變壓器高壓套管 H 端、低壓 X 端屬於端子串接關係，不限制先接哪一端，只要符合題意且端點相通即可。

例如第三題 Delta：

```text
108 -> 202 -> 204
```

可視為 B 相 CO 負載側已接到 TR2 H1，前提是 `202 ↔ 204` 存在。

低壓 Delta 頂點也相同：

```text
304 ↔ 305
304 或 305 任一端接到 A 相低壓線
```

皆可接受。

## 1.2 練習時只有 X2-X3 視為已接好

本系統採用考場風險訓練原則：考生對崗位最後接線狀態負責。除了各變壓器內部 `X2-X3` 銅片短接以外，所有關鍵線都必須由考生自己畫出並確認。

即使題庫提到第三題、 第六題部分高壓線可能已接妥，練習系統仍不可把 CO 負載側至 H 端或高壓 Delta 套管跳線自動視為合格。

## 2. 低壓 C 型環看功能線，不看固定點

低壓線允許考生在同一條低壓線的合理位置壓接 C 型環。審查時只判斷是否接到正確功能線：

- 被接地線
- A 相低壓線
- B 相低壓線
- C 相低壓線

標準答案顯示會選最近、不重複、少交叉的位置，但審查不可要求固定點號。

## 3. CO 負載側不可直接分兩條到變壓器

熔絲鏈負載側只能出一條主線。若需分接，應先到變壓器 H 端，再由套管分接。

## 4. 接地系統不可混接

外殼接地口 45 與系統被接地口 48 不可互接。

錯誤：

```text
TR 外殼 G -> 48
45 -> 48
```

## 5. 線徑

- LA 相關線：14mm²
- 其他標準必要線：22mm²

線徑錯誤要直接標示在線上。

## 6. 回歸測試

每次修改至少執行：

```text
node s3-study/work/verify-answer-spec.js
node s3-study/work/verify-check-rules.js
node s3-study/work/verify-edit-after-review.js
node s3-study/work/verify-primary-sequence.js
node s3-study/work/verify-review-hints.js
node s3-study/work/verify-review.js
node s3-study/work/verify-routing.js
node s3-study/work/verify-mobile-layout.js
node s3-study/work/verify-training-principle.js
```
