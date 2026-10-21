# TSMC 職缺智慧搜尋平台 (TSMC Job Finder)

專為應徵 **台積電 (TSMC)** 之模組副工程師 (MAE)、設備副工程師、生產線/實驗室技術員，以及**跨領域／非本科系**求職者打造的職缺篩選與分析檢索系統。特別鎖定**桃園、新竹、苗栗**三大核心廠區。

---

## 🌟 核心特色

1. **桃竹苗核心廠區快速篩選**
   - **新竹科學園區**：竹科晶圓 12 廠、20 廠先進奈米製程及研發總部。
   - **苗栗竹南園區**：AP6 先進封裝測試廠（3D Fabric 核心聚落）。
   - **桃園龍潭園區**：AP3 先進封裝與覆晶測試廠。
   - 支援單選或多選標籤切換。

2. **MAE 與「非本科友善」條件指標**
   - **非本科系專屬標註**：針對「科系不拘」、「接受跨領域轉職」與「含完整在職培訓」之職缺進行綠色友善標章識別。
   - **一鍵快速篩選**：點擊即可立即篩出「MAE ＋ 非本科可投遞」的目標清單。

3. **非理工／文法商背景應徵攻略指南**
   - 內建非本科轉職 TSMC 的實務突破策略，說明 MAE 職務在動手維修、輪班配合度、SOP 工安紀律方面的核心考量。

4. **收藏與投遞無縫串接**
   - **一鍵直達官網**：每個職缺卡片均提供 TSMC 官方投遞頁面連結。
   - **我的最愛收藏**：透過瀏覽器 `LocalStorage` 本地保存，無需登入即可跨次追蹤。

5. **自動排程爬蟲與資料校對引擎**
   - 提供職缺更新時間戳記與即時校對同步機制，支援排程更新職缺庫。

---

## 🛠️ 技術棧

- **前端**：React 19 + Vite 6
- **樣式**：Tailwind CSS v4
- **圖示**：Lucide React
- **資料與爬蟲引擎**：Node.js ESM + TSMC 職缺正規化資料庫

---

## 🚀 快速開始

### 1. 安裝環境需求
- Node.js (建議 v18 以上版本)
- npm 或 pnpm

### 2. 複製儲存庫與安裝依賴
```bash
git clone https://github.com/lohas821019/tsmc-job-finder.git
cd tsmc-job-finder
npm install
```

### 3. 啟動本機開發伺服器
```bash
npm run dev
```
啟動成功後，使用瀏覽器開啟：[http://localhost:5173/](http://localhost:5173/)

### 4. 建置生產環境版本 (Production Build)
```bash
npm run build
```
產出的靜態檔案將位於 `dist/` 目錄，可直接部署於 Vercel、Netlify 或 GitHub Pages。

### 5. 執行職缺資料同步／爬蟲校驗
```bash
npm run crawl
```

---

## 📂 專案結構

```text
tsmc-job-finder/
├── src/
│   ├── data/
│   │   └── jobs.js        # 桃竹苗 TSMC 職缺資料庫與科系條件模型
│   ├── App.jsx            # 主應用程式介面 (搜尋列、多維篩選、收藏夾、求職指南)
│   ├── main.jsx           # React 入口點
│   └── index.css          # Tailwind CSS 核心樣式設定
├── crawler.js             # 職缺同步與校驗排程引擎
├── index.html             # HTML 模板
├── vite.config.js         # Vite 與 Tailwind 外掛配置
└── package.json           # 專案依賴與腳本定義
```

---

## 📝 授權條款

MIT License
