# Webhook 配置說明

## 智慧監控系統 Webhook 設定

### 新的 Webhook 配置

智慧監控系統現在使用專門的 Discord webhook：

**Secret 名稱**: `NOTIFICATION_DISCORD_SMART`
**用途**: 智慧狀態監控通知（每次檢查都會發送）
**功能**: 
- 狀態變化通知
- 服務恢復通知
- 服務異常通知
- 例行檢查通知

### GitHub Secrets 設定

請在 GitHub 儲存庫的 Settings > Secrets and variables > Actions 中設定：

```
NOTIFICATION_DISCORD_SMART: 你的智慧監控 Discord webhook URL
```

### 與原有 Webhook 的區別

| Webhook | Secret 名稱 | 用途 | 觸發條件 |
|---------|-------------|------|----------|
| 原有 | `NOTIFICATION_DISCORD_WEBHOOK_URL` | Upptime 標準通知 | 狀態變化時 |
| 新增 | `NOTIFICATION_DISCORD_SMART` | 智慧監控通知 | 每次檢查都發送 |

### 設定步驟

1. **創建新的 Discord Webhook**：
   - 前往你的 Discord 伺服器
   - 右鍵點擊想要接收智慧監控通知的頻道
   - 選擇「編輯頻道」>「整合」>「建立 Webhook」
   - 複製 Webhook URL

2. **設定 GitHub Secret**：
   - 前往 GitHub 儲存庫
   - Settings > Secrets and variables > Actions
   - 點擊 "New repository secret"
   - 名稱：`NOTIFICATION_DISCORD_SMART`
   - 值：你的 Discord webhook URL

3. **測試設定**：
   - 手動觸發 GitHub Actions 工作流程
   - 檢查是否收到智慧監控通知

### 通知範例

智慧監控系統會發送以下類型的通知：

#### 例行檢查通知
```
🟢 our_api 主要資料 (資料來源) - 正常運行
📊 例行檢查完成 - our_api 主要資料 (資料來源) 運行正常
```

#### 服務恢復通知
```
🟢 moa_api 農業部資料 (副資料來源) - 正常運行
🎉 服務恢復正常！moa_api 農業部資料 (副資料來源) 已重新上線
```

#### 運行緩慢通知
```
🟡 moa_api 農業部資料 (副資料來源) - 運行緩慢
📊 例行檢查完成 - moa_api 農業部資料 (副資料來源) 運行緩慢但可用
```

#### 服務異常通知
```
🔴 notify_api 通知頁面 (通知內容) - 服務異常
🚨 服務異常！notify_api 通知頁面 (通知內容) 目前無法訪問
```

### 故障排除

如果沒有收到通知：

1. **檢查 Secret 設定**：
   - 確認 `NOTIFICATION_DISCORD_SMART` 已正確設定
   - 確認 webhook URL 格式正確

2. **檢查 GitHub Actions 日誌**：
   - 前往 Actions 標籤
   - 查看 "Smart Status Change Notifications" 工作流程執行日誌

3. **測試 Webhook**：
   - 運行測試腳本驗證設定
   - 檢查 Discord 頻道權限

### 測試腳本

可以使用以下腳本測試新的 webhook 設定：

```bash
# 測試智慧監控 webhook
$env:NOTIFICATION_DISCORD_SMART="你的_webhook_url"; node scripts/enhanced-discord-webhook.js
```
