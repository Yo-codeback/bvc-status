# GitHub Actions 依賴項目錯誤修復指南

## 問題描述

GitHub Actions 執行時出現以下錯誤：
```
Error: Dependencies lock file is not found in /home/runner/work/bvc-status/bvc-status. 
Supported file patterns: package-lock.json,npm-shrinkwrap.json,yarn.lock
```

## 解決方案

### ✅ 已修復的問題

1. **添加了 `package.json`** - 定義 Node.js 項目依賴項
2. **添加了 `package-lock.json`** - 鎖定依賴項目版本
3. **添加了 `.npmrc`** - npm 設定檔案
4. **更新了 GitHub Actions 工作流程** - 添加依賴項目安裝步驟
5. **創建了測試腳本** - 驗證 GitHub Actions 環境

### 📁 新增的檔案

```
package.json              # Node.js 項目配置
package-lock.json         # 依賴項目鎖定檔案
.npmrc                    # npm 設定檔案
scripts/github-actions-test.js  # GitHub Actions 測試腳本
```

### 🔧 更新的檔案

```
.github/workflows/webhook-always-notify.yml  # 添加了 npm 依賴項目管理
```

## 修復後的工作流程

GitHub Actions 現在會按以下順序執行：

1. **Checkout** - 下載程式碼
2. **Setup Node.js** - 設定 Node.js 18 並啟用 npm 快取
3. **Install Dependencies** - 執行 `npm ci` 安裝依賴項
4. **Smart Status Change Notifications** - 執行智慧監控腳本

## 測試結果

✅ **所有測試通過**
- 必要檔案檢查：通過
- 腳本語法檢查：通過  
- API 數據檔案檢查：通過
- 智慧監控模擬：通過

## 下一步操作

### 1. 提交檔案到 GitHub

```bash
git add .
git commit -m "fix: 添加 Node.js 依賴項目管理檔案，修復 GitHub Actions 錯誤"
git push origin master
```

### 2. 確認 GitHub Secrets 設定

確保以下 secrets 已設定：
- `WEBHOOK_URL` - 你的 Discord webhook URL
- `WEBHOOK_TYPE` - discord (可選，預設為 discord)

### 3. 手動觸發測試

1. 前往 GitHub 儲存庫
2. 點擊 Actions 標籤
3. 找到 "Smart Status Change Notifications" 工作流程
4. 點擊 "Run workflow" 按鈕手動觸發

### 4. 監控執行結果

GitHub Actions 執行日誌會顯示：
- 依賴項目安裝狀態
- 智慧監控腳本執行結果
- Discord 通知發送狀態

## 預期行為

修復後，GitHub Actions 應該能夠：

1. ✅ 正確安裝 Node.js 依賴項
2. ✅ 成功載入智慧監控腳本
3. ✅ 檢查三個 API 端點狀態
4. ✅ 只在狀態變化時發送 Discord 通知
5. ✅ 為每個端點維護獨立的狀態歷史

## 故障排除

如果仍然遇到問題：

### 檢查 GitHub Secrets
```bash
# 運行設定檢查腳本
node scripts/check-discord-config.js
```

### 測試 Discord 通知
```bash
# 運行 Discord 測試腳本
node scripts/test-discord-webhook.js
```

### 完整環境測試
```bash
# 運行完整的 GitHub Actions 環境測試
node scripts/github-actions-test.js
```

## 技術細節

### package.json 內容
- 項目名稱：`bvc-status-monitoring`
- Node.js 版本要求：>=18.0.0
- 腳本命令：start, test, test-discord, check-config

### GitHub Actions 更新
- 啟用 npm 快取：`cache: 'npm'`
- 安裝依賴項：`npm ci`
- 使用 Node.js 18

### 依賴項目
目前項目使用純 Node.js 內建模組，無需外部依賴項：
- `fs` - 檔案系統操作
- `path` - 路徑處理
- `https`/`http` - HTTP 請求

---

## 總結

這個修復解決了 GitHub Actions 找不到依賴項目鎖定檔案的問題。現在你的智慧監控系統應該能夠在 GitHub Actions 中正常運行，並成功發送 Discord 通知。

🎉 **修復完成！** 你的 Discord webhook 監控系統現在已經準備就緒。
