#!/usr/bin/env node

/**
 * 測試智慧監控 Webhook 設定
 * 使用新的 NOTIFICATION_DISCORD_SMART secret
 */

const https = require('https');
const http = require('http');

// 配置
const config = {
  webhookUrl: process.env.NOTIFICATION_DISCORD_SMART || 'https://discord.com/api/webhooks/YOUR_SMART_WEBHOOK_URL',
  siteName: '智慧監控系統測試',
  siteUrl: 'https://example.com'
};

/**
 * 發送 Discord webhook
 */
async function sendDiscordWebhook(payload) {
  const url = new URL(config.webhookUrl);
  const options = {
    hostname: url.hostname,
    port: url.port || (url.protocol === 'https:' ? 443 : 80),
    path: url.pathname + url.search,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  };

  return new Promise((resolve, reject) => {
    const client = url.protocol === 'https:' ? https : http;
    const req = client.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

/**
 * 生成智慧監控系統介紹通知
 */
function generateSystemIntroNotification() {
  return JSON.stringify({
    embeds: [{
      title: `🤖 智慧監控系統已啟動`,
      description: `新的智慧監控系統已成功配置並開始運行`,
      color: 0x0099ff, // 藍色
      thumbnail: {
        url: 'https://raw.githubusercontent.com/upptime/upptime.js.org/master/static/img/icon.svg'
      },
      fields: [
        {
          name: '🏷️ 系統名稱',
          value: '智慧狀態監控系統',
          inline: true
        },
        {
          name: '🔧 Webhook Secret',
          value: 'NOTIFICATION_DISCORD_SMART',
          inline: true
        },
        {
          name: '📊 監控對象',
          value: '3 個 API 端點',
          inline: true
        },
        {
          name: '⏰ 檢查頻率',
          value: '每 5 分鐘',
          inline: true
        },
        {
          name: '📢 通知類型',
          value: '每次檢查都發送',
          inline: true
        },
        {
          name: '🎯 智慧功能',
          value: '狀態變化檢測',
          inline: true
        }
      ],
      footer: {
        text: 'Upptime 智慧監控系統 - 系統啟動通知',
        icon_url: 'https://raw.githubusercontent.com/upptime/upptime.js.org/master/static/img/icon.svg'
      },
      timestamp: new Date().toISOString()
    }]
  });
}

/**
 * 生成測試通知
 */
function generateTestNotification() {
  return JSON.stringify({
    embeds: [{
      title: `🧪 智慧監控系統測試`,
      description: `測試新的智慧監控 webhook 設定`,
      color: 0x00ff00, // 綠色
      fields: [
        {
          name: '✅ 設定狀態',
          value: '智慧監控 webhook 已成功配置',
          inline: true
        },
        {
          name: '🔗 Webhook Secret',
          value: 'NOTIFICATION_DISCORD_SMART',
          inline: true
        },
        {
          name: '📅 測試時間',
          value: new Date().toLocaleString('zh-TW'),
          inline: true
        }
      ],
      footer: {
        text: 'Upptime 智慧監控系統 - 測試通知',
        icon_url: 'https://raw.githubusercontent.com/upptime/upptime.js.org/master/static/img/icon.svg'
      },
      timestamp: new Date().toISOString()
    }]
  });
}

/**
 * 檢查 webhook URL 格式
 */
function checkWebhookFormat() {
  console.log('🔍 檢查智慧監控 Webhook URL 格式...');
  console.log(`📡 URL: ${config.webhookUrl}`);
  
  if (!config.webhookUrl) {
    console.log('❌ NOTIFICATION_DISCORD_SMART 環境變數未設定');
    return false;
  }

  if (!config.webhookUrl.includes('discord.com/api/webhooks/')) {
    console.log('❌ Webhook URL 格式不正確');
    console.log('   預期格式: https://discord.com/api/webhooks/WEBHOOK_ID/WEBHOOK_TOKEN');
    return false;
  }

  console.log('✅ 智慧監控 Webhook URL 格式正確');
  return true;
}

/**
 * 主函數
 */
async function main() {
  try {
    console.log('🚀 開始測試智慧監控 Webhook 設定...\n');

    // 檢查 URL 格式
    const formatOk = checkWebhookFormat();
    
    if (!formatOk) {
      console.log('\n💡 設定建議:');
      console.log('1. 在 GitHub Secrets 中設定 NOTIFICATION_DISCORD_SMART');
      console.log('2. 確保 webhook URL 格式正確');
      console.log('3. 重新運行此測試腳本');
      return;
    }

    // 測試不同的通知類型
    const testCases = [
      { name: '系統介紹通知', payload: generateSystemIntroNotification() },
      { name: '測試通知', payload: generateTestNotification() }
    ];

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      console.log(`\n📤 發送 ${testCase.name}...`);
      
      try {
        await sendDiscordWebhook(testCase.payload);
        console.log(`✅ ${testCase.name} 發送成功`);
        
        // 在測試案例之間添加延遲
        if (i < testCases.length - 1) {
          console.log('⏳ 等待 3 秒後發送下一個測試...');
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      } catch (error) {
        console.error(`❌ ${testCase.name} 發送失敗:`, error.message);
      }
    }

    console.log('\n🎉 智慧監控 Webhook 測試完成！');
    console.log('💡 請檢查你的 Discord 頻道是否收到了智慧監控通知');
    console.log('\n📋 下一步:');
    console.log('1. 確認 Discord 通知已收到');
    console.log('2. 手動觸發 GitHub Actions 工作流程');
    console.log('3. 檢查智慧監控系統是否正常運行');

  } catch (error) {
    console.error('❌ 測試過程中發生錯誤:', error.message);
    process.exit(1);
  }
}

// 如果直接執行此腳本
if (require.main === module) {
  main();
}

module.exports = {
  main,
  sendDiscordWebhook,
  checkWebhookFormat,
  generateSystemIntroNotification,
  generateTestNotification
};
