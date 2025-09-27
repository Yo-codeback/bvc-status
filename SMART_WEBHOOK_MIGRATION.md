# 智慧監控 Webhook 遷移指南

## 變更摘要

智慧監控系統已遷移到新的 Discord webhook，使用專門的秘密變數。

### 🔄 變更內容

| 項目 | 舊設定 | 新設定 |
|------|--------|--------|
| Secret 名稱 | `NOTIFICATION_DISCORD_WEBHOOK_URL` | `NOTIFICATION_DISCORD_SMART` |
| 用途 | Upptime 標準通知 | 智慧監控專用通知 |
| 通知頻率 | 狀態變化時 | 每次檢查都發送 |
| 功能 | 基本狀態通知 | 智慧狀態檢測 + 例行檢查 |

### 📁 修改的檔案

1. **`.github/workflows/webhook-always-notify.yml`**
   - 更新 `WEBHOOK_URL` 環境變數來源
   - 從 `${{ secrets.NOTIFICATION_DISCORD_WEBHOOK_URL }}` 改為 `${{ secrets.NOTIFICATION_DISCORD_SMART }}`

2. **新增檔案**：
   - `WEBHOOK_CONFIG.md` - Webhook 配置說明
   - `scripts/test-smart-webhook.js` - 智慧監控 webhook 測試腳本
   - `SMART_WEBHOOK_MIGRATION.md` - 本遷移指南

### 🔧 設定步驟

#### 1. 創建新的 Discord Webhook

1. 前往你的 Discord 伺服器
2. 右鍵點擊想要接收智慧監控通知的頻道
3. 選擇「編輯頻道」>「整合」>「建立 Webhook」
4. 複製 Webhook URL

#### 2. 設定 GitHub Secret

1. 前往你的 GitHub 儲存庫
2. 點擊 Settings > Secrets and variables > Actions
3. 點擊 "New repository secret"
4. 設定以下內容：
   - **名稱**: `NOTIFICATION_DISCORD_SMART`
   - **值**: 你的 Discord webhook URL

#### 3. 測試設定

運行測試腳本驗證設定：

```bash
# 設定環境變數並測試
$env:NOTIFICATION_DISCORD_SMART="你的_webhook_url"; node scripts/test-smart-webhook.js
```

### 📊 兩個 Webhook 的用途

#### 原有 Webhook (`NOTIFICATION_DISCORD_WEBHOOK_URL`)
- **用途**: Upptime 標準通知
- **觸發條件**: 狀態變化時
- **通知類型**: 基本的上線/下線通知
- **頻率**: 只在狀態改變時

#### 新智慧監控 Webhook (`NOTIFICATION_DISCORD_SMART`)
- **用途**: 智慧監控專用通知
- **觸發條件**: 每次檢查都發送
- **通知類型**: 
  - 狀態變化通知
  - 服務恢復通知
  - 服務異常通知
  - 例行檢查通知
  - 運行緩慢通知
- **頻率**: 每 5 分鐘

### 🎯 智慧監控功能

新的智慧監控系統提供以下功能：

1. **智能狀態檢測**：
   - 正常運行 (🟢)
   - 運行緩慢 (🟡) - 響應時間慢但運行時間高
   - 服務異常 (🔴)

2. **狀態變化追蹤**：
   - 為每個 API 端點維護獨立的狀態歷史
   - 檢測狀態變化並發送相應通知

3. **多種通知類型**：
   - 🎉 服務恢復通知
   - 🚨 服務異常通知
   - ⚠️ 狀態變化通知
   - 📊 例行檢查通知

4. **美觀的 Discord Embed**：
   - 使用 Discord embed 格式
   - 包含詳細的服務資訊
   - 支援圖示和顏色編碼

### 🧪 測試方法

#### 1. 測試智慧監控 Webhook

```bash
node scripts/test-smart-webhook.js
```

#### 2. 測試完整系統

```bash
# 手動觸發 GitHub Actions
# 或運行完整的智慧監控腳本
node scripts/smart-monitor.js
```

#### 3. 檢查通知

確認 Discord 頻道收到以下類型的通知：
- 系統啟動通知
- 例行檢查通知
- 狀態變化通知（如果有變化）

### 🚨 故障排除

#### 問題 1: 沒有收到通知

**解決方案**：
1. 檢查 `NOTIFICATION_DISCORD_SMART` 是否正確設定
2. 確認 webhook URL 格式正確
3. 檢查 Discord 頻道權限

#### 問題 2: GitHub Actions 失敗

**解決方案**：
1. 檢查 GitHub Actions 執行日誌
2. 確認所有必要的檔案都已提交
3. 驗證環境變數設定

#### 問題 3: 通知格式不正確

**解決方案**：
1. 運行測試腳本檢查 webhook 格式
2. 確認 Discord webhook 設定正確
3. 檢查腳本是否有語法錯誤

### 📈 監控的 API 端點

智慧監控系統會監控以下端點：

1. **our_api** - 主要資料來源
   - URL: https://bvc-api.deno.dev
   - 狀態: 通常為正常

2. **moa_api** - 農業部資料來源
   - URL: https://data.moa.gov.tw/Service/OpenData/FromM/FarmTransData.aspx
   - 狀態: 通常為運行緩慢（響應時間長但可用）

3. **notify_api** - 通知頁面
   - URL: https://bvcaanotify.deno.dev
   - 狀態: 通常為正常

### 🎉 完成檢查清單

- [ ] 創建新的 Discord webhook
- [ ] 設定 `NOTIFICATION_DISCORD_SMART` GitHub Secret
- [ ] 測試智慧監控 webhook
- [ ] 手動觸發 GitHub Actions 工作流程
- [ ] 確認收到智慧監控通知
- [ ] 檢查所有 API 端點狀態

---

## 總結

智慧監控系統已成功遷移到新的 webhook，現在使用 `NOTIFICATION_DISCORD_SMART` 秘密變數。這個變更提供了更豐富的監控功能和更頻繁的狀態更新，讓你能更好地了解你的 API 服務狀況。

🎉 **遷移完成！** 你的智慧監控系統現在使用專門的 Discord webhook 了！
