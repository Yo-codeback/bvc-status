#!/usr/bin/env node

/**
 * 增強版 Discord Webhook 測試腳本
 * 展示各種 embed 格式的 Discord 通知
 */

const https = require('https');
const http = require('http');

// 配置
const config = {
  webhookUrl: process.env.WEBHOOK_URL || process.env.NOTIFICATION_DISCORD_WEBHOOK_URL || 'https://discord.com/api/webhooks/YOUR_WEBHOOK_URL',
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
 * 生成服務恢復通知（增強版 embed）
 */
function generateRecoveryEmbed() {
  return JSON.stringify({
    embeds: [{
      title: `🎉 服務恢復正常！`,
      description: `${config.siteName} 已重新上線並正常運行`,
      url: config.siteUrl,
      color: 0x00ff00, // 綠色
      thumbnail: {
        url: 'https://raw.githubusercontent.com/upptime/upptime.js.org/master/static/img/icon.svg'
      },
      fields: [
        {
          name: '🏷️ 服務名稱',
          value: config.siteName,
          inline: true
        },
        {
          name: '🌐 服務網址',
          value: `[點擊訪問](${config.siteUrl})`,
          inline: true
        },
        {
          name: '⚡ 響應時間',
          value: `${config.responseTime}ms`,
          inline: true
        },
        {
          name: '📈 運行時間',
          value: config.uptime,
          inline: true
        },
        {
          name: '🕒 檢查時間',
          value: new Date().toLocaleString('zh-TW'),
          inline: true
        },
        {
          name: '📊 狀態變化',
          value: '🔴 異常 → 🟢 正常',
          inline: true
        }
      ],
      footer: {
        text: 'Upptime 監控系統 - 服務恢復通知',
        icon_url: 'https://raw.githubusercontent.com/upptime/upptime.js.org/master/static/img/icon.svg'
      },
      timestamp: new Date().toISOString()
    }]
  });
}

/**
 * 生成服務異常通知（增強版 embed）
 */
function generateOutageEmbed() {
  return JSON.stringify({
    embeds: [{
      title: `🚨 服務異常警報！`,
      description: `${config.siteName} 目前無法訪問，需要立即關注`,
      url: config.siteUrl,
      color: 0xff0000, // 紅色
      thumbnail: {
        url: 'https://raw.githubusercontent.com/upptime/upptime.js.org/master/static/img/icon.svg'
      },
      fields: [
        {
          name: '🏷️ 服務名稱',
          value: config.siteName,
          inline: true
        },
        {
          name: '🌐 服務網址',
          value: `[點擊檢查](${config.siteUrl})`,
          inline: true
        },
        {
          name: '⚡ 響應時間',
          value: `${config.responseTime}ms`,
          inline: true
        },
        {
          name: '📈 運行時間',
          value: config.uptime,
          inline: true
        },
        {
          name: '🕒 檢查時間',
          value: new Date().toLocaleString('zh-TW'),
          inline: true
        },
        {
          name: '📊 狀態變化',
          value: '🟢 正常 → 🔴 異常',
          inline: true
        }
      ],
      footer: {
        text: 'Upptime 監控系統 - 服務異常通知',
        icon_url: 'https://raw.githubusercontent.com/upptime/upptime.js.org/master/static/img/icon.svg'
      },
      timestamp: new Date().toISOString()
    }]
  });
}

/**
 * 生成例行檢查通知（增強版 embed）
 */
function generateRoutineCheckEmbed() {
  return JSON.stringify({
    embeds: [{
      title: `📊 例行檢查完成`,
      description: `${config.siteName} 運行狀況良好`,
      url: config.siteUrl,
      color: 0x0099ff, // 藍色
      thumbnail: {
        url: 'https://raw.githubusercontent.com/upptime/upptime.js.org/master/static/img/icon.svg'
      },
      fields: [
        {
          name: '🏷️ 服務名稱',
          value: config.siteName,
          inline: true
        },
        {
          name: '🌐 服務網址',
          value: `[點擊訪問](${config.siteUrl})`,
          inline: true
        },
        {
          name: '⚡ 響應時間',
          value: `${config.responseTime}ms`,
          inline: true
        },
        {
          name: '📈 運行時間',
          value: config.uptime,
          inline: true
        },
        {
          name: '🕒 檢查時間',
          value: new Date().toLocaleString('zh-TW'),
          inline: true
        },
        {
          name: '✅ 狀態',
          value: '🟢 正常運行',
          inline: true
        }
      ],
      footer: {
        text: 'Upptime 監控系統 - 例行檢查通知',
        icon_url: 'https://raw.githubusercontent.com/upptime/upptime.js.org/master/static/img/icon.svg'
      },
      timestamp: new Date().toISOString()
    }]
  });
}

/**
 * 生成狀態變化通知（增強版 embed）
 */
function generateStatusChangeEmbed() {
  return JSON.stringify({
    embeds: [{
      title: `🔄 狀態變化通知`,
      description: `${config.siteName} 狀態已發生變化`,
      url: config.siteUrl,
      color: 0xffa500, // 橙色
      thumbnail: {
        url: 'https://raw.githubusercontent.com/upptime/upptime.js.org/master/static/img/icon.svg'
      },
      fields: [
        {
          name: '🏷️ 服務名稱',
          value: config.siteName,
          inline: true
        },
        {
          name: '🌐 服務網址',
          value: `[點擊檢查](${config.siteUrl})`,
          inline: true
        },
        {
          name: '⚡ 響應時間',
          value: `${config.responseTime}ms`,
          inline: true
        },
        {
          name: '📈 運行時間',
          value: config.uptime,
          inline: true
        },
        {
          name: '🕒 檢查時間',
          value: new Date().toLocaleString('zh-TW'),
          inline: true
        },
        {
          name: '📊 當前狀態',
          value: config.status === 'up' ? '🟢 正常運行' : '🔴 服務異常',
          inline: true
        }
      ],
      footer: {
        text: 'Upptime 監控系統 - 狀態變化通知',
        icon_url: 'https://raw.githubusercontent.com/upptime/upptime.js.org/master/static/img/icon.svg'
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
    console.log('🚀 開始測試增強版 Discord Embed 通知...');
    console.log(`📡 Webhook URL: ${config.webhookUrl.substring(0, 50)}...`);
    console.log(`🏷️ 站點名稱: ${config.siteName}`);

    if (!config.webhookUrl.includes('discord.com/api/webhooks/')) {
      console.log('⚠️ 警告: Webhook URL 看起來不是 Discord 格式');
    }

    // 測試不同的 embed 格式
    const testCases = [
      { name: '服務恢復通知', payload: generateRecoveryEmbed() },
      { name: '服務異常通知', payload: generateOutageEmbed() },
      { name: '例行檢查通知', payload: generateRoutineCheckEmbed() },
      { name: '狀態變化通知', payload: generateStatusChangeEmbed() }
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

    console.log('\n🎉 增強版 Discord Embed 測試完成！');
    console.log('💡 請檢查你的 Discord 頻道是否收到了美觀的 embed 通知');

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
  generateRecoveryEmbed,
  generateOutageEmbed,
  generateRoutineCheckEmbed,
  generateStatusChangeEmbed
};
