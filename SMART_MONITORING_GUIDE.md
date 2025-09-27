# 智慧狀態監控系統使用指南

## 概述

這個智慧監控系統已經升級，現在能夠：

- ✅ **只在狀態變化時發送通知** - 避免重複通知
- 🎉 **服務恢復通知** - 當服務從異常恢復正常時發送特別通知
- 🚨 **服務異常通知** - 當服務從正常變為異常時發送警報
- 📊 **狀態歷史追蹤** - 為每個 API 端點維護獨立的狀態歷史

## 主要功能

### 1. 智慧狀態檢測

系統會自動檢測以下狀態變化：

- **首次檢查** - 第一次監控某個服務時會發送通知
- **服務異常** - 從正常變為異常時發送警報
- **服務恢復** - 從異常恢復正常時發送慶祝通知
- **狀態變化** - 其他狀態變化時發送一般通知

### 2. 支援的通知類型

#### Discord 通知
- 🟢 綠色嵌入框表示服務正常
- 🔴 紅色嵌入框表示服務異常
- 🎉 特殊恢復通知訊息

#### Slack 通知
- ✅ 成功顏色表示服務正常
- ❌ 危險顏色表示服務異常
- 📊 詳細的狀態資訊欄位

#### 自定義 Webhook
- JSON 格式的結構化數據
- 包含完整的狀態變化資訊

### 3. 監控的 API 端點

系統目前監控以下三個 API 端點：

1. **our_api** - 主要資料來源 (bvc-api.deno.dev)
2. **moa_api** - 農業部資料來源 (data.moa.gov.tw)
3. **notify_api** - 通知頁面 (bvcaanotify.deno.dev)

## 檔案結構

```
scripts/
├── webhook-notify.js          # 核心 webhook 通知腳本（已升級）
├── smart-monitor.js           # 智慧監控主腳本（新增）
└── test-smart-monitor.js      # 測試腳本（新增）

.github/workflows/
└── webhook-always-notify.yml  # GitHub Actions 工作流程（已更新）

api/
├── our-api/
│   ├── response-time.json
│   ├── uptime.json
│   └── status-history.json    # 狀態歷史檔案（自動生成）
├── moa-api/
│   └── ... (相同結構)
└── notify-api/
    └── ... (相同結構)
```

## 設定說明

### 環境變數

在 GitHub Secrets 中設定：

- `WEBHOOK_URL` - Discord/Slack webhook URL
- `WEBHOOK_TYPE` - webhook 類型 (discord/slack/custom)

### 工作流程設定

GitHub Actions 工作流程每 5 分鐘執行一次，與 Upptime 檢查同步。

## 通知範例

### 服務恢復通知

```
🎉 服務恢復正常！our_api 主要資料 (資料來源) 已重新上線

當前狀態: 正常運行
響應時間: 150ms
運行時間: 99.9%
檢查時間: 2025-09-27 14:11:38
之前狀態: 異常
```

### 服務異常通知

```
🚨 服務異常！moa_api 農業部資料 (副資料來源) 目前無法訪問

當前狀態: 服務異常
響應時間: 0ms
運行時間: 98.5%
檢查時間: 2025-09-27 14:11:38
之前狀態: 正常
```

## 測試

運行測試腳本來驗證系統功能：

```bash
node scripts/test-smart-monitor.js
```

測試會驗證：
- 狀態變化檢測邏輯
- 狀態歷史檔案操作
- 各種狀態變化場景

## 手動測試

你也可以手動測試單個站點的監控：

```bash
# 設定環境變數
export SITE_NAME="測試站點"
export SITE_URL="https://example.com"
export SITE_STATUS="up"
export RESPONSE_TIME="150"
export UPTIME="99.9%"
export WEBHOOK_URL="你的_webhook_url"
export WEBHOOK_TYPE="discord"

# 執行通知腳本
node scripts/webhook-notify.js
```

## 優勢

### 與之前的系統比較

| 功能 | 舊系統 | 新系統 |
|------|--------|--------|
| 通知頻率 | 每次檢查都通知 | 只在狀態變化時通知 |
| 通知類型 | 通用通知 | 智慧分類通知 |
| 狀態追蹤 | 無 | 完整狀態歷史 |
| 恢復通知 | 無 | 特別的恢復慶祝通知 |
| 重複通知 | 有 | 無 |

### 減少通知噪音

- ❌ 舊系統：每 5 分鐘發送一次通知（即使狀態沒變）
- ✅ 新系統：只在狀態實際變化時發送通知

### 更好的用戶體驗

- 🎉 服務恢復時有特別的慶祝訊息
- 🚨 服務異常時有明確的警報訊息
- 📊 包含狀態變化前後的對比資訊

## 故障排除

### 常見問題

1. **沒有收到通知**
   - 檢查 `WEBHOOK_URL` 是否正確設定
   - 確認 GitHub Actions 工作流程是否正常運行

2. **收到太多通知**
   - 這表示狀態可能不穩定，檢查 API 端點狀況
   - 查看狀態歷史檔案了解狀態變化模式

3. **測試失敗**
   - 運行 `node scripts/test-smart-monitor.js` 檢查功能
   - 確認所有依賴檔案都存在

### 日誌檢查

GitHub Actions 的執行日誌會顯示：
- 每個站點的檢查結果
- 狀態變化檢測結果
- 通知發送狀態

## 進階設定

### 自定義監控站點

編輯 `scripts/smart-monitor.js` 中的 `monitoredSites` 陣列來添加或修改監控的站點。

### 自定義通知訊息

編輯 `scripts/webhook-notify.js` 中的 payload 生成函數來自定義通知格式。

---

## 總結

新的智慧監控系統提供了更精準、更友好的監控體驗。通過只在狀態變化時發送通知，大大減少了通知噪音，同時通過特別的恢復通知，讓用戶能更好地了解服務狀態的變化。
