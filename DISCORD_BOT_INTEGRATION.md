# Discord Bot 整合說明

## 🎯 功能概述

新的監控系統現在整合了 **Webhook + Discord Bot** 的雙重通知機制：

1. **Webhook 通知** - 快速、簡潔的狀態變化通知
2. **Discord Bot 通知** - 詳細、豐富的狀態報告（短暫上線）

## 🤖 Bot 功能特色

### 短暫上線機制
- Bot 只在 GitHub Actions 執行時短暫上線
- 發送詳細狀態報告後自動下線
- 節省資源，無需長期運行

### 詳細狀態報告
- **整體狀態概覽** - 所有服務的綜合狀態
- **個別服務詳情** - 每個 API 的詳細資訊
- **統計摘要** - 正常/緩慢/異常服務數量
- **視覺化嵌入** - 使用 Discord 嵌入格式

### 智慧告警
- **緊急告警** - 當檢測到服務異常時發送額外告警
- **狀態分級** - 根據嚴重程度使用不同顏色
- **時間戳記** - 精確的檢查時間記錄

## 📋 設定步驟

### 1. GitHub Secrets 設定

確保在 GitHub 儲存庫中設定以下 secrets：

```
bot_token: 你的_Discord_Bot_Token
NOTIFICATION_DISCORD_SMART: 你的_Webhook_URL (可選)
```

### 2. Discord Bot 設定

1. 前往 [Discord Developer Portal](https://discord.com/developers/applications)
2. 創建新應用程式或選擇現有應用程式
3. 在 "Bot" 頁面複製 Token
4. 確保 Bot 有以下權限：
   - `Send Messages`
   - `Embed Links`
   - `Read Message History`

### 3. 頻道權限設定

確保 Bot 在頻道 `1421404291444510783` 中有：
- 查看頻道權限
- 發送訊息權限
- 嵌入連結權限

## 🔄 執行流程

### 每 5 分鐘自動執行

1. **Webhook 通知階段**
   - 執行智慧監控腳本
   - 發送簡潔的狀態變化通知
   - 記錄狀態歷史

2. **Discord Bot 階段**
   - Bot 短暫上線
   - 讀取所有監控數據
   - 生成詳細狀態報告
   - 發送到指定頻道
   - Bot 自動下線

## 📊 通知範例

### 正常狀態報告
```
✅ 服務狀態正常

整體狀態: 🟢 所有服務正常
檢查時間: 2025-01-27 14:30:00

our_api 主要資料 (資料來源)
狀態: 🟢 正常運行
響應時間: 150ms
運行時間: 99.9%

moa_api 農業部資料 (副資料來源)
狀態: 🟡 運行緩慢
響應時間: 12000ms
運行時間: 98.5%

notify_api 通知頁面 (通知內容)
狀態: 🟢 正常運行
響應時間: 200ms
運行時間: 100%

📊 統計摘要
🟢 正常: 2 個
🟡 緩慢: 1 個
🔴 異常: 0 個
```

### 異常狀態告警
```
🚨 服務狀態異常

整體狀態: 🔴 部分服務異常
檢查時間: 2025-01-27 14:30:00

[詳細狀態報告...]

🚨 緊急告警
檢測到服務異常，請立即檢查！

🔴 our_api 主要資料 (資料來源)
狀態: 服務異常
響應時間: 0ms
```

## 🧪 測試功能

### 手動測試
```bash
# 設定環境變數
export bot_token="你的_bot_token"

# 執行測試
node scripts/test-discord-bot.js
```

### GitHub Actions 測試
1. 前往 Actions 標籤
2. 選擇 "Smart Status Change Notifications (Webhook + Bot)"
3. 點擊 "Run workflow" 手動觸發

## 📁 檔案結構

```
scripts/
├── discord-bot-notify.js      # Bot 通知主腳本
├── test-discord-bot.js        # Bot 測試腳本
├── smart-monitor.js           # 智慧監控腳本
└── webhook-notify.js          # Webhook 通知腳本

.github/workflows/
└── webhook-always-notify.yml  # 整合工作流程

package.json                   # 更新依賴 (discord.js)
```

## 🔧 自定義設定

### 修改頻道 ID
在 `scripts/discord-bot-notify.js` 中修改：
```javascript
const channelId = '1421404291444510783'; // 改為你的頻道 ID
```

### 調整通知頻率
在 `.github/workflows/webhook-always-notify.yml` 中修改：
```yaml
schedule:
  - cron: "*/5 * * * *"  # 改為你想要的頻率
```

### 自定義嵌入格式
在 `scripts/discord-bot-notify.js` 中的 `createStatusEmbed` 函數中修改嵌入格式。

## 🚨 故障排除

### 常見問題

1. **Bot 無法上線**
   - 檢查 `bot_token` 是否正確設定
   - 確認 Bot 權限是否足夠
   - 查看 GitHub Actions 日誌

2. **無法發送訊息到頻道**
   - 檢查頻道 ID 是否正確
   - 確認 Bot 是否有頻道權限
   - 檢查頻道是否存在

3. **沒有收到通知**
   - 檢查 GitHub Actions 是否正常執行
   - 查看工作流程日誌
   - 確認 secrets 設定正確

### 日誌檢查
GitHub Actions 日誌會顯示：
- Bot 上線狀態
- 監控數據檢查結果
- 訊息發送狀態
- Bot 下線狀態

## 🎉 優勢

### 與純 Webhook 比較

| 功能 | Webhook | Webhook + Bot |
|------|---------|---------------|
| 通知速度 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| 資訊豐富度 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 視覺效果 | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| 資源使用 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| 互動性 | ⭐ | ⭐⭐⭐⭐⭐ |

### 主要優勢
- **詳細報告** - 提供完整的服務狀態概覽
- **視覺化** - 使用 Discord 嵌入格式，資訊更清晰
- **智慧告警** - 根據狀態嚴重程度發送不同級別的告警
- **資源節省** - Bot 只在需要時短暫上線
- **雙重保障** - Webhook + Bot 確保通知不會遺漏

---

**整合完成！** 🎊

您的監控系統現在具備了 Webhook + Discord Bot 的雙重通知機制，既能快速通知狀態變化，又能提供詳細的狀態報告。
