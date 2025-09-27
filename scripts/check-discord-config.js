#!/usr/bin/env node

/**
 * Discord 設定檢查腳本
 * 檢查 Discord webhook 設定是否正確
 */

const https = require('https');
const http = require('http');

// 配置
const config = {
  webhookUrl: process.env.WEBHOOK_URL || 'https://discord.com/api/webhooks/YOUR_WEBHOOK_URL',
  webhookType: process.env.WEBHOOK_TYPE || 'discord'
};

/**
 * 檢查 Discord webhook URL 格式
 */
function checkWebhookUrlFormat() {
  console.log('🔍 檢查 Discord Webhook URL 格式...');
  
  if (!config.webhookUrl) {
    console.log('❌ WEBHOOK_URL 環境變數未設定');
    return false;
  }

  if (!config.webhookUrl.includes('discord.com/api/webhooks/')) {
    console.log('❌ Webhook URL 格式不正確');
    console.log('   預期格式: https://discord.com/api/webhooks/WEBHOOK_ID/WEBHOOK_TOKEN');
    console.log(`   實際格式: ${config.webhookUrl}`);
    return false;
  }

  // 檢查是否包含 webhook ID 和 token
  const webhookParts = config.webhookUrl.split('/');
  const webhookId = webhookParts[webhookParts.length - 2];
  const webhookToken = webhookParts[webhookParts.length - 1];

  if (!webhookId || webhookId.length < 10) {
    console.log('❌ Webhook ID 格式不正確');
    return false;
  }

  if (!webhookToken || webhookToken.length < 10) {
    console.log('❌ Webhook Token 格式不正確');
    return false;
  }

  console.log('✅ Discord Webhook URL 格式正確');
  console.log(`   Webhook ID: ${webhookId.substring(0, 10)}...`);
  console.log(`   Webhook Token: ${webhookToken.substring(0, 10)}...`);
  return true;
}

/**
 * 測試 Discord webhook 連接
 */
async function testDiscordConnection() {
  console.log('\n🌐 測試 Discord Webhook 連接...');
  
  const testPayload = JSON.stringify({
    content: '🤖 Discord Webhook 連接測試 - 如果你看到這則訊息，表示設定正確！'
  });

  const url = new URL(config.webhookUrl);
  const options = {
    hostname: url.hostname,
    port: url.port || (url.protocol === 'https:' ? 443 : 80),
    path: url.pathname + url.search,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(testPayload)
    }
  };

  return new Promise((resolve, reject) => {
    const client = url.protocol === 'https:' ? https : http;
    const req = client.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log('✅ Discord Webhook 連接測試成功');
          console.log(`   HTTP 狀態碼: ${res.statusCode}`);
          resolve(true);
        } else {
          console.log('❌ Discord Webhook 連接測試失敗');
          console.log(`   HTTP 狀態碼: ${res.statusCode}`);
          console.log(`   回應內容: ${data}`);
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      console.log('❌ Discord Webhook 連接測試失敗');
      console.log(`   錯誤訊息: ${error.message}`);
      resolve(false);
    });

    req.write(testPayload);
    req.end();
  });
}

/**
 * 顯示設定摘要
 */
function showConfigurationSummary() {
  console.log('\n📋 Discord 設定摘要:');
  console.log(`   Webhook URL: ${config.webhookUrl.substring(0, 50)}...`);
  console.log(`   Webhook 類型: ${config.webhookType}`);
  console.log(`   站點數量: 3 (our-api, moa-api, notify-api)`);
  console.log(`   檢查頻率: 每 5 分鐘`);
  console.log(`   通知類型: 只在狀態變化時通知`);
}

/**
 * 顯示 GitHub Secrets 設定指南
 */
function showGitHubSecretsGuide() {
  console.log('\n🔧 GitHub Secrets 設定指南:');
  console.log('1. 前往你的 GitHub 儲存庫');
  console.log('2. 點擊 Settings > Secrets and variables > Actions');
  console.log('3. 確保以下 secrets 已設定:');
  console.log('   - WEBHOOK_URL: 你的 Discord webhook URL');
  console.log('   - WEBHOOK_TYPE: discord (可選，預設為 discord)');
  console.log('4. 如果沒有設定，點擊 "New repository secret" 來添加');
}

/**
 * 主函數
 */
async function main() {
  try {
    console.log('🚀 開始 Discord 設定檢查...\n');

    // 檢查 URL 格式
    const urlFormatOk = checkWebhookUrlFormat();
    
    if (!urlFormatOk) {
      console.log('\n💡 設定建議:');
      showGitHubSecretsGuide();
      return;
    }

    // 顯示設定摘要
    showConfigurationSummary();

    // 測試連接
    const connectionOk = await testDiscordConnection();

    if (connectionOk) {
      console.log('\n🎉 Discord 設定完全正確！');
      console.log('✅ 你的智慧監控系統已經準備就緒');
      console.log('📅 下次 GitHub Actions 執行時就會開始發送通知');
      
      console.log('\n💡 測試建議:');
      console.log('1. 可以手動觸發 GitHub Actions 工作流程來測試');
      console.log('2. 或運行 node scripts/test-discord-webhook.js 來發送測試通知');
    } else {
      console.log('\n⚠️ Discord 設定有問題');
      console.log('💡 請檢查:');
      console.log('1. Webhook URL 是否正確');
      console.log('2. Discord webhook 是否仍然有效');
      console.log('3. 是否有網路連接問題');
    }

  } catch (error) {
    console.error('❌ 檢查過程中發生錯誤:', error.message);
    process.exit(1);
  }
}

// 如果直接執行此腳本
if (require.main === module) {
  main();
}

module.exports = {
  main,
  checkWebhookUrlFormat,
  testDiscordConnection
};
