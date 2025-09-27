#!/usr/bin/env node

/**
 * Webhook 測試腳本
 * 用於測試 webhook 通知功能
 */

const fs = require('fs');
const path = require('path');

// 導入 webhook 模組
const { generateSlackPayload, generateDiscordPayload, generateCustomPayload } = require('./webhook-notify.js');

console.log('🧪 Webhook 測試腳本');
console.log('==================\n');

// 測試數據
const testData = {
  siteName: '測試網站',
  siteUrl: 'https://example.com',
  status: 'up',
  responseTime: '250',
  uptime: '99.95%',
  lastChecked: new Date().toISOString()
};

console.log('📋 測試數據:');
console.log(`網站名稱: ${testData.siteName}`);
console.log(`網站 URL: ${testData.siteUrl}`);
console.log(`狀態: ${testData.status}`);
console.log(`響應時間: ${testData.responseTime}ms`);
console.log(`運行時間: ${testData.uptime}`);
console.log(`檢查時間: ${testData.lastChecked}\n`);

// 測試 Slack 格式
console.log('🔵 Slack 格式測試:');
try {
  const slackPayload = generateSlackPayload();
  console.log('✅ Slack payload 生成成功');
  console.log('📄 Payload 內容:');
  console.log(JSON.stringify(JSON.parse(slackPayload), null, 2));
} catch (error) {
  console.log('❌ Slack payload 生成失敗:', error.message);
}

console.log('\n' + '='.repeat(50) + '\n');

// 測試 Discord 格式
console.log('🟣 Discord 格式測試:');
try {
  const discordPayload = generateDiscordPayload();
  console.log('✅ Discord payload 生成成功');
  console.log('📄 Payload 內容:');
  console.log(JSON.stringify(JSON.parse(discordPayload), null, 2));
} catch (error) {
  console.log('❌ Discord payload 生成失敗:', error.message);
}

console.log('\n' + '='.repeat(50) + '\n');

// 測試自定義格式
console.log('⚙️ 自定義格式測試:');
try {
  const customPayload = generateCustomPayload();
  console.log('✅ 自定義 payload 生成成功');
  console.log('📄 Payload 內容:');
  console.log(JSON.stringify(JSON.parse(customPayload), null, 2));
} catch (error) {
  console.log('❌ 自定義 payload 生成失敗:', error.message);
}

console.log('\n' + '='.repeat(50) + '\n');

// 測試 API 檔案讀取
console.log('📁 API 檔案讀取測試:');
const apiPaths = ['api/our-api', 'api/moa-api', 'api/notify-api'];

apiPaths.forEach(apiPath => {
  const uptimeFile = path.join(apiPath, 'uptime.json');
  const responseTimeFile = path.join(apiPath, 'response-time.json');
  
  console.log(`\n檢查 ${apiPath}:`);
  
  try {
    if (fs.existsSync(uptimeFile)) {
      const uptimeData = JSON.parse(fs.readFileSync(uptimeFile, 'utf8'));
      console.log(`  ✅ uptime.json 存在: ${uptimeData.message}`);
    } else {
      console.log(`  ❌ uptime.json 不存在`);
    }
    
    if (fs.existsSync(responseTimeFile)) {
      const responseTimeData = JSON.parse(fs.readFileSync(responseTimeFile, 'utf8'));
      console.log(`  ✅ response-time.json 存在: ${responseTimeData.message}`);
    } else {
      console.log(`  ❌ response-time.json 不存在`);
    }
  } catch (error) {
    console.log(`  ❌ 讀取檔案失敗: ${error.message}`);
  }
});

console.log('\n🎉 測試完成！');
console.log('\n📝 下一步:');
console.log('1. 設定 WEBHOOK_URL 和 WEBHOOK_TYPE 環境變數');
console.log('2. 執行: WEBHOOK_URL=your_url WEBHOOK_TYPE=slack node scripts/webhook-notify.js');
console.log('3. 檢查 GitHub Actions 中的 Webhook Notification 工作流程');
