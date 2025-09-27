# Webhook 通知設定指南

這個文件說明如何設定 Upptime 監控系統的 webhook 通知功能。

## 功能說明

本系統會在每次監測檢查後發送 webhook 通知，包括：
- ✅ 服務正常運行時的通知
- ❌ 服務異常時的通知
- 📊 包含響應時間、運行時間等詳細資訊

## 支援的通知平台

1. **Slack** - 推薦使用
2. **Discord**
3. **自定義 webhook** - 可發送到任何支援 HTTP POST 的端點

## 設定步驟

### 1. 獲取 Webhook URL

#### Slack 設定
1. 前往 [Slack API](https://api.slack.com/apps)
2. 創建新的 App 或選擇現有的 App
3. 在 "Incoming Webhooks" 中啟用並創建 webhook URL
4. 複製 webhook URL

#### Discord 設定
1. 在 Discord 伺服器中，前往頻道設定
2. 選擇 "整合" → "Webhook"
3. 創建新的 webhook 並複製 URL

### 2. 設定 GitHub Secrets

在您的 GitHub 儲存庫中設定以下 Secrets：

1. 前往 `Settings` → `Secrets and variables` → `Actions`
2. 添加以下 secrets：

| Secret 名稱 | 說明 | 範例 |
|------------|------|------|
| `WEBHOOK_URL` | 您的 webhook URL | `https://hooks.slack.com/services/...` |
| `WEBHOOK_TYPE` | Webhook 類型 | `slack`、`discord` 或 `custom` |

### 3. 啟用工作流程

系統會自動執行以下工作流程：
- `Webhook Notification` - 每5分鐘發送一次通知
- 與現有的 `Uptime CI` 同步執行

## 通知訊息格式

### Slack 格式範例
```
🟢 our_api 主要資料 (資料來源) - 正常運行
狀態: 正常運行
響應時間: 551ms
運行時間: 99.93%
檢查時間: 2024/1/1 下午12:00:00
```

### Discord 格式範例
```
🟢 our_api 主要資料 (資料來源) - 正常運行
狀態: 正常運行
響應時間: 551ms
運行時間: 99.93%
檢查時間: 2024/1/1 下午12:00:00
```

## 自定義設定

### 修改通知頻率
編輯 `.github/workflows/webhook-notify-simple.yml` 中的 cron 設定：
```yaml
schedule:
  - cron: "*/5 * * * *"  # 每5分鐘
  - cron: "*/10 * * * *" # 每10分鐘
  - cron: "0 * * * *"    # 每小時
```

### 自定義通知內容
編輯 `scripts/webhook-notify.js` 中的訊息模板：
```javascript
function generateSlackPayload() {
  // 修改這裡的訊息格式
}
```

### 只通知異常狀態
修改 `.upptimerc.yml` 設定：
```yaml
notifications:
  webhook:
    notify-on-check: false  # 不在每次檢查時通知
    notify-on-change: true  # 只在狀態變化時通知
```

## 測試通知

### 手動觸發測試
1. 前往 GitHub Actions 頁面
2. 選擇 "Webhook Notification" 工作流程
3. 點擊 "Run workflow" 手動執行

### 檢查通知狀態
在 GitHub Actions 日誌中查看：
- ✅ 成功發送通知
- ⚠️ 未設定 WEBHOOK_URL
- ❌ 發送失敗

## 故障排除

### 常見問題

1. **通知沒有收到**
   - 檢查 WEBHOOK_URL 是否正確設定
   - 確認 webhook URL 仍然有效
   - 查看 GitHub Actions 日誌

2. **通知格式錯誤**
   - 確認 WEBHOOK_TYPE 設定正確
   - 檢查目標平台是否支援該格式

3. **通知太頻繁**
   - 調整 cron 設定減少頻率
   - 設定 `notify-on-check: false`

### 日誌檢查
在 GitHub Actions 中查看 "Webhook Notification" 工作流程的執行日誌，會顯示：
- 每個網站的檢查結果
- webhook 發送狀態
- 錯誤訊息（如果有）

## 安全注意事項

1. **保護 Webhook URL**
   - 不要在程式碼中硬編碼 webhook URL
   - 使用 GitHub Secrets 安全儲存
   - 定期輪換 webhook URL

2. **限制存取**
   - 設定適當的 webhook 權限
   - 考慮使用驗證 token

## 支援的網站

目前監控的網站：
- `our_api` - 主要資料來源 (https://bvc-api.deno.dev)
- `moa_api` - 農業部資料 (https://data.moa.gov.tw/Service/OpenData/FromM/FarmTransData.aspx)
- `notify_api` - 通知頁面 (https://bvcaanotify.deno.dev)

每個網站都會發送獨立的通知訊息。
