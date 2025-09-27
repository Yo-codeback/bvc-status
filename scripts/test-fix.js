#!/usr/bin/env node

/**
 * 測試修復後的 webhook-notify.js
 */

// 設定測試環境變數
process.env.SITE_NAME = '測試站點 - 農產分析 API';
process.env.SITE_URL = 'https://bvc-api.deno.dev';
process.env.SITE_STATUS = 'up';
process.env.RESPONSE_TIME = '150';
process.env.UPTIME = '99.9%';
process.env.LAST_CHECKED = new Date().toISOString();
process.env.STATUS_HISTORY_FILE = 'test-status-history.json';
process.env.NOTIFY_ON_CHECK = 'true';
process.env.WEBHOOK_TYPE = 'discord';

// 測試 getConfig 函數
const { generateDiscordPayload, detectStatusChange } = require('./webhook-notify.js');

console.log('🧪 測試修復後的配置讀取...');

// 測試狀態變化檢測
console.log('\n1. 測試狀態變化檢測:');
const statusChange = detectStatusChange('up');
console.log('結果:', statusChange);

// 測試 Discord payload 生成
console.log('\n2. 測試 Discord payload 生成:');
const payload = generateDiscordPayload(statusChange);
if (payload) {
  const parsedPayload = JSON.parse(payload);
  console.log('✅ 成功生成 payload');
  console.log('標題:', parsedPayload.embeds[0].title);
  console.log('描述:', parsedPayload.embeds[0].description);
  console.log('網站名稱應該顯示:', process.env.SITE_NAME);
} else {
  console.log('❌ 未能生成 payload');
}

// 清理測試檔案
const fs = require('fs');
const testFile = process.env.STATUS_HISTORY_FILE;
if (fs.existsSync(testFile)) {
  fs.unlinkSync(testFile);
  console.log(`\n🧹 清理測試檔案: ${testFile}`);
}

console.log('\n✅ 測試完成！');
