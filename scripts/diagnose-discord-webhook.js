#!/usr/bin/env node

/**
 * Discord Webhook 診斷腳本
 * 檢查 Discord webhook URL 格式和有效性
 */

const https = require('https');
const http = require('http');

// 配置
const config = {
  webhookUrl: process.env.WEBHOOK_URL || process.env.NOTIFICATION_DISCORD_WEBHOOK_URL || 'https://discord.com/api/webhooks/YOUR_WEBHOOK_URL',
  webhookType: process.env.WEBHOOK_TYPE || 'discord'
};

/**
 * 檢查 Discord webhook URL 格式
 */
function checkDiscordWebhookFormat() {
  console.log('🔍 檢查 Discord Webhook URL 格式...');
  console.log(`📡 URL: ${config.webhookUrl}`);
  
  if (!config.webhookUrl) {
    console.log('❌ Webhook URL 未設定');
    console.log('💡 請檢查環境變數 WEBHOOK_URL 或 NOTIFICATION_DISCORD_WEBHOOK_URL');
    return false;
  }

  // 檢查基本格式
  if (!config.webhookUrl.startsWith('https://discord.com/api/webhooks/')) {
    console.log('❌ Discord Webhook URL 格式不正確');
    console.log('   預期格式: https://discord.com/api/webhooks/WEBHOOK_ID/WEBHOOK_TOKEN');
    console.log(`   實際格式: ${config.webhookUrl}`);
    return false;
  }

  // 解析 URL 組件
  try {
    const url = new URL(config.webhookUrl);
    const pathParts = url.pathname.split('/').filter(part => part);
    
    if (pathParts.length < 4) {
      console.log('❌ Discord Webhook URL 路徑不完整');
      return false;
    }
    
    const webhookId = pathParts[2];
    const webhookToken = pathParts[3];
    
    console.log(`✅ Webhook ID: ${webhookId}`);
    console.log(`✅ Webhook Token: ${webhookToken.substring(0, 10)}...`);
    
    // 檢查 ID 和 Token 格式
    if (webhookId.length < 10) {
      console.log('❌ Webhook ID 太短，可能不正確');
      return false;
    }
    
    if (webhookToken.length < 10) {
      console.log('❌ Webhook Token 太短，可能不正確');
      return false;
    }
    
    console.log('✅ Discord Webhook URL 格式正確');
    return true;
    
  } catch (error) {
    console.log(`❌ URL 解析錯誤: ${error.message}`);
    return false;
  }
}

/**
 * 測試 Discord webhook 連接
 */
async function testDiscordWebhook() {
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
        console.log(`📊 HTTP 狀態碼: ${res.statusCode}`);
        console.log(`📄 回應內容: ${data}`);
        
        if (res.statusCode === 204) {
          console.log('✅ Discord Webhook 連接測試成功 (HTTP 204)');
          resolve(true);
        } else if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log('✅ Discord Webhook 連接測試成功');
          resolve(true);
        } else {
          console.log('❌ Discord Webhook 連接測試失敗');
          
          // 分析常見錯誤
          if (res.statusCode === 404) {
            console.log('💡 錯誤分析: HTTP 404');
            console.log('   - Webhook URL 可能已失效');
            console.log('   - Webhook ID 或 Token 可能不正確');
            console.log('   - Discord 頻道或伺服器可能已被刪除');
          } else if (res.statusCode === 401) {
            console.log('💡 錯誤分析: HTTP 401');
            console.log('   - Webhook Token 可能不正確');
            console.log('   - Webhook 可能已被禁用');
          } else if (res.statusCode === 403) {
            console.log('💡 錯誤分析: HTTP 403');
            console.log('   - 沒有權限訪問此 webhook');
            console.log('   - Bot 可能已被移除');
          }
          
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
 * 顯示 Discord Webhook 設定指南
 */
function showDiscordSetupGuide() {
  console.log('\n🔧 Discord Webhook 設定指南:');
  console.log('1. 前往你的 Discord 伺服器');
  console.log('2. 右鍵點擊你想要接收通知的頻道');
  console.log('3. 選擇「編輯頻道」');
  console.log('4. 點擊「整合」標籤');
  console.log('5. 點擊「建立 Webhook」');
  console.log('6. 複製 Webhook URL');
  console.log('7. 在 GitHub Secrets 中設定為 NOTIFICATION_DISCORD_WEBHOOK_URL');
  console.log('\n📋 Webhook URL 格式應該是:');
  console.log('   https://discord.com/api/webhooks/123456789012345678/abcdefghijklmnopqrstuvwxyz1234567890');
}

/**
 * 顯示 GitHub Secrets 設定指南
 */
function showGitHubSecretsGuide() {
  console.log('\n🔧 GitHub Secrets 設定指南:');
  console.log('1. 前往你的 GitHub 儲存庫');
  console.log('2. 點擊 Settings > Secrets and variables > Actions');
  console.log('3. 確認以下 secret 已正確設定:');
  console.log('   - NOTIFICATION_DISCORD_WEBHOOK_URL: 你的 Discord webhook URL');
  console.log('   - WEBHOOK_TYPE: discord (可選)');
  console.log('4. 如果沒有設定，點擊 "New repository secret" 來添加');
}

/**
 * 主函數
 */
async function main() {
  try {
    console.log('🚀 開始 Discord Webhook 診斷...\n');

    // 檢查 URL 格式
    const formatOk = checkDiscordWebhookFormat();
    
    if (!formatOk) {
      console.log('\n💡 設定建議:');
      showDiscordSetupGuide();
      showGitHubSecretsGuide();
      return;
    }

    // 測試連接
    const connectionOk = await testDiscordWebhook();

    if (connectionOk) {
      console.log('\n🎉 Discord Webhook 設定完全正確！');
      console.log('✅ 你的智慧監控系統已經準備就緒');
    } else {
      console.log('\n⚠️ Discord Webhook 設定有問題');
      console.log('\n💡 解決方案:');
      showDiscordSetupGuide();
      showGitHubSecretsGuide();
      
      console.log('\n🔍 常見問題:');
      console.log('1. Webhook URL 可能已失效 - 重新創建 Discord webhook');
      console.log('2. Webhook ID 或 Token 可能不正確 - 檢查複製的 URL');
      console.log('3. Discord 頻道或伺服器可能已被刪除 - 檢查 Discord 設定');
    }

  } catch (error) {
    console.error('❌ 診斷過程中發生錯誤:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// 如果直接執行此腳本
if (require.main === module) {
  main();
}

module.exports = {
  main,
  checkDiscordWebhookFormat,
  testDiscordWebhook
};
