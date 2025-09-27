# Webhook 通知系統實作總結

## 🎯 實作目標
為 Upptime 監控系統添加 webhook 通知功能，讓系統在每次監測檢查後都發送通知（包括正常和異常狀態）。

## 📁 新增檔案

### 1. 核心腳本
- `scripts/webhook-notify.js` - 主要的 webhook 發送腳本
- `scripts/test-webhook.js` - 測試腳本

### 2. GitHub Actions 工作流程
- `.github/workflows/webhook-notify-simple.yml` - 簡化的 webhook 通知工作流程

### 3. 配置文件
- `.upptimerc.yml` - 更新了 Upptime 配置，添加 webhook 通知設定

### 4. 說明文件
- `WEBHOOK_SETUP.md` - 詳細的設定指南
- `WEBHOOK_IMPLEMENTATION_SUMMARY.md` - 本總結文件

## 🔧 功能特色

### ✅ 已實作功能
1. **多平台支援**
   - Slack 通知
   - Discord 通知
   - 自定義 webhook 格式

2. **完整監控覆蓋**
   - our_api 主要資料 (資料來源)
   - moa_api 農業部資料 (副資料來源)
   - notify_api 通知頁面 (通知內容)

3. **豐富的通知內容**
   - 服務狀態（正常/異常）
   - 響應時間
   - 運行時間百分比
   - 最後檢查時間

4. **自動化執行**
   - 每5分鐘自動執行
   - 與現有 Uptime CI 同步
   - 支援手動觸發

## 🚀 設定步驟

### 1. GitHub Secrets 設定
需要在 GitHub 儲存庫中設定以下 secrets：
- `WEBHOOK_URL`: 您的 webhook URL
- `WEBHOOK_TYPE`: 通知類型 (slack/discord/custom)

### 2. 獲取 Webhook URL

#### Slack 設定
1. 前往 [Slack API](https://api.slack.com/apps)
2. 創建新 App 或選擇現有 App
3. 啟用 "Incoming Webhooks"
4. 創建 webhook URL

#### Discord 設定
1. 在 Discord 伺服器中前往頻道設定
2. 選擇 "整合" → "Webhook"
3. 創建新 webhook 並複製 URL

### 3. 測試功能
```bash
# 執行測試腳本
node scripts/test-webhook.js

# 手動測試 webhook 發送
WEBHOOK_URL=your_url WEBHOOK_TYPE=slack node scripts/webhook-notify.js
```

## 📊 通知訊息範例

### Slack 格式
```
🟢 our_api 主要資料 (資料來源) - 正常運行
狀態: 正常運行
響應時間: 551ms
運行時間: 99.93%
檢查時間: 2024/1/1 下午12:00:00
```

### Discord 格式
```
🟢 our_api 主要資料 (資料來源) - 正常運行
狀態: 正常運行
響應時間: 551ms
運行時間: 99.93%
檢查時間: 2024/1/1 下午12:00:00
```

## 🔄 執行流程

1. **自動觸發**: 每5分鐘執行一次
2. **讀取數據**: 從 `api/*/` 目錄讀取監控數據
3. **生成通知**: 根據配置生成對應格式的通知
4. **發送 webhook**: 發送到指定的 webhook URL
5. **記錄結果**: 在 GitHub Actions 日誌中記錄執行結果

## 🛠️ 技術細節

### 使用的技術
- Node.js (內建模組: fs, path, https, http)
- GitHub Actions
- JSON 數據處理
- HTTP POST 請求

### 檔案結構
```
├── scripts/
│   ├── webhook-notify.js      # 主腳本
│   └── test-webhook.js        # 測試腳本
├── .github/workflows/
│   └── webhook-notify-simple.yml  # 工作流程
├── .upptimerc.yml             # Upptime 配置
└── WEBHOOK_SETUP.md           # 設定指南
```

## ✅ 測試結果

測試腳本執行成功，確認：
- ✅ 所有 API 檔案存在且可讀取
- ✅ Slack 格式 payload 生成正常
- ✅ Discord 格式 payload 生成正常
- ✅ 自定義格式 payload 生成正常
- ✅ 檔案讀取功能正常

### 實際數據
- our-api: 99.97% 運行時間, 585ms 響應時間
- moa-api: 99.03% 運行時間, 12737ms 響應時間
- notify-api: 100% 運行時間, 262ms 響應時間

## 🎉 完成狀態

- [x] 理解現有 Upptime 監控系統
- [x] 設計 webhook 通知機制
- [x] 實作多平台 webhook 發送功能
- [x] 創建 GitHub Actions 工作流程
- [x] 撰寫詳細的設定指南
- [x] 測試所有功能
- [x] 創建總結文件

## 📝 後續建議

1. **設定 webhook URL**: 根據 `WEBHOOK_SETUP.md` 指南設定實際的 webhook
2. **監控執行狀況**: 定期檢查 GitHub Actions 日誌
3. **自定義調整**: 可根據需求調整通知頻率或格式
4. **安全性**: 定期輪換 webhook URL 確保安全

## 🔗 相關資源

- [Upptime 官方文件](https://upptime.js.org/docs/configuration)
- [Slack Webhook API](https://api.slack.com/messaging/webhooks)
- [Discord Webhook API](https://discord.com/developers/docs/resources/webhook)
- [GitHub Actions 文件](https://docs.github.com/en/actions)

---

**實作完成！** 🎊

您的 Upptime 監控系統現在具備了完整的 webhook 通知功能，會在每次監測後發送通知，無論服務狀態正常還是異常。
