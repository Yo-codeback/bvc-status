#!/usr/bin/env node

/**
 * Discord Webhook 測試腳本
 * 用於測試 Discord 通知功能
 */

const https = require('https');
const http = require('http');

// 配置
const config = {
  webhookUrl: process.env.WEBHOOK_URL || 'https://discord.com/api/webhooks/YOUR_WEBHOOK_URL',
  siteName: process.env.SITE_NAME || '測試站點',
  siteUrl: process.env.SITE_URL || 'https://example.com',
  status: process.env.SITE_STATUS || 'up',
  responseTime: process.env.RESPONSE_TIME || '150',
  uptime: process.env.UPTIME || '99.9%'
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
 * 生成服務恢復通知
 */
function generateRecoveryNotification() {
  return JSON.stringify({
    embeds: [{
      title: `🟢 ${config.siteName} - 正常運行`,
      url: config.siteUrl,
      description: `🎉 服務恢復正常！${config.siteName} 已重新上線`,
      color: 0x00ff00, // 綠色
      fields: [
        {
          name: '當前狀態',
          value: '正常運行',
          inline: true
        },
        {
          name: '響應時間',
          value: `${config.responseTime}ms`,
          inline: true
        },
        {
          name: '運行時間',
          value: config.uptime,
          inline: true
        },
        {
          name: '檢查時間',
          value: new Date().toLocaleString('zh-TW'),
          inline: true
        },
        {
          name: '之前狀態',
          value: '異常',
          inline: true
        }
      ],
      footer: {
        text: 'Upptime 監控系統 - 服務恢復通知'
      },
      timestamp: new Date().toISOString()
    }]
  });
}

/**
 * 生成服務異常通知
 */
function generateOutageNotification() {
  return JSON.stringify({
    embeds: [{
      title: `🔴 ${config.siteName} - 服務異常`,
      url: config.siteUrl,
      description: `🚨 服務異常！${config.siteName} 目前無法訪問`,
      color: 0xff0000, // 紅色
      fields: [
        {
          name: '當前狀態',
          value: '服務異常',
          inline: true
        },
        {
          name: '響應時間',
          value: `${config.responseTime}ms`,
          inline: true
        },
        {
          name: '運行時間',
          value: config.uptime,
          inline: true
        },
        {
          name: '檢查時間',
          value: new Date().toLocaleString('zh-TW'),
          inline: true
        },
        {
          name: '之前狀態',
          value: '正常',
          inline: true
        }
      ],
      footer: {
        text: 'Upptime 監控系統 - 服務異常通知'
      },
      timestamp: new Date().toISOString()
    }]
  });
}

/**
 * 生成正常運行通知
 */
function generateNormalNotification() {
  return JSON.stringify({
    embeds: [{
      title: `🟢 ${config.siteName} - 正常運行`,
      url: config.siteUrl,
      description: `✅ 狀態變化 - ${config.siteName} 現在正常運行`,
      color: 0x00ff00, // 綠色
      fields: [
        {
          name: '當前狀態',
          value: '正常運行',
          inline: true
        },
        {
          name: '響應時間',
          value: `${config.responseTime}ms`,
          inline: true
        },
        {
          name: '運行時間',
          value: config.uptime,
          inline: true
        },
        {
          name: '檢查時間',
          value: new Date().toLocaleString('zh-TW'),
          inline: true
        }
      ],
      footer: {
        text: 'Upptime 監控系統 - 狀態變化通知'
      },
      timestamp: new Date().toISOString()
    }]
  });
}

/**
 * 主函數
 */
async function main() {
  try {
    console.log('🚀 開始 Discord Webhook 測試...');
    console.log(`📡 Webhook URL: ${config.webhookUrl.substring(0, 50)}...`);
    console.log(`🏷️ 站點名稱: ${config.siteName}`);
    console.log(`🌐 站點 URL: ${config.siteUrl}`);
    console.log(`📊 狀態: ${config.status}`);
    console.log(`⚡ 響應時間: ${config.responseTime}ms`);
    console.log(`📈 運行時間: ${config.uptime}`);

    if (!config.webhookUrl.includes('discord.com/api/webhooks/')) {
      console.log('⚠️ 警告: Webhook URL 看起來不是 Discord 格式');
    }

    // 測試不同的通知類型
    const testCases = [
      { name: '服務恢復通知', payload: generateRecoveryNotification() },
      { name: '服務異常通知', payload: generateOutageNotification() },
      { name: '正常運行通知', payload: generateNormalNotification() }
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

    console.log('\n🎉 Discord Webhook 測試完成！');
    console.log('💡 請檢查你的 Discord 頻道是否收到了測試訊息');

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
  generateRecoveryNotification,
  generateOutageNotification,
  generateNormalNotification
};
