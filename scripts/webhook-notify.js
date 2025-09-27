#!/usr/bin/env node

/**
 * Upptime Webhook 通知腳本
 * 用於在每次監測後發送 webhook 通知
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// 配置
const config = {
  webhookUrl: process.env.WEBHOOK_URL || 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK',
  webhookType: process.env.WEBHOOK_TYPE || 'slack', // slack, discord, custom
  siteName: process.env.SITE_NAME || 'Unknown Site',
  siteUrl: process.env.SITE_URL || '',
  status: process.env.SITE_STATUS || 'up', // up, down
  responseTime: process.env.RESPONSE_TIME || '0',
  lastChecked: process.env.LAST_CHECKED || new Date().toISOString(),
  uptime: process.env.UPTIME || '0%'
};

/**
 * 發送 Slack webhook
 */
async function sendSlackWebhook(payload) {
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
 * 發送自定義 webhook
 */
async function sendCustomWebhook(payload) {
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
 * 生成 Slack 格式的 payload
 */
function generateSlackPayload() {
  const isUp = config.status === 'up';
  const statusEmoji = isUp ? '🟢' : '🔴';
  const statusText = isUp ? '正常運行' : '服務異常';
  const color = isUp ? 'good' : 'danger';

  return JSON.stringify({
    attachments: [{
      color: color,
      title: `${statusEmoji} ${config.siteName} - ${statusText}`,
      title_link: config.siteUrl,
      fields: [
        {
          title: '狀態',
          value: statusText,
          short: true
        },
        {
          title: '響應時間',
          value: `${config.responseTime}ms`,
          short: true
        },
        {
          title: '運行時間',
          value: config.uptime,
          short: true
        },
        {
          title: '最後檢查',
          value: new Date(config.lastChecked).toLocaleString('zh-TW'),
          short: true
        }
      ],
      footer: 'Upptime 監控系統',
      ts: Math.floor(Date.now() / 1000)
    }]
  });
}

/**
 * 生成 Discord 格式的 payload
 */
function generateDiscordPayload() {
  const isUp = config.status === 'up';
  const statusEmoji = isUp ? '🟢' : '🔴';
  const statusText = isUp ? '正常運行' : '服務異常';
  const color = isUp ? 0x00ff00 : 0xff0000;

  return JSON.stringify({
    embeds: [{
      title: `${statusEmoji} ${config.siteName} - ${statusText}`,
      url: config.siteUrl,
      color: color,
      fields: [
        {
          name: '狀態',
          value: statusText,
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
          name: '最後檢查',
          value: new Date(config.lastChecked).toLocaleString('zh-TW'),
          inline: true
        }
      ],
      footer: {
        text: 'Upptime 監控系統'
      },
      timestamp: new Date(config.lastChecked).toISOString()
    }]
  });
}

/**
 * 生成自定義格式的 payload
 */
function generateCustomPayload() {
  return JSON.stringify({
    site: {
      name: config.siteName,
      url: config.siteUrl,
      status: config.status,
      responseTime: parseInt(config.responseTime),
      uptime: config.uptime,
      lastChecked: config.lastChecked,
      timestamp: Date.now()
    },
    notification: {
      type: config.status === 'up' ? 'status_up' : 'status_down',
      message: `${config.siteName} 服務狀態: ${config.status === 'up' ? '正常' : '異常'}`,
      severity: config.status === 'up' ? 'info' : 'warning'
    }
  });
}

/**
 * 主函數
 */
async function main() {
  try {
    console.log(`開始發送 webhook 通知...`);
    console.log(`網站: ${config.siteName}`);
    console.log(`狀態: ${config.status}`);
    console.log(`響應時間: ${config.responseTime}ms`);

    let payload;
    let sendFunction;

    switch (config.webhookType.toLowerCase()) {
      case 'slack':
        payload = generateSlackPayload();
        sendFunction = sendSlackWebhook;
        break;
      case 'discord':
        payload = generateDiscordPayload();
        sendFunction = sendDiscordWebhook;
        break;
      case 'custom':
      default:
        payload = generateCustomPayload();
        sendFunction = sendCustomWebhook;
        break;
    }

    await sendFunction(payload);
    console.log('✅ Webhook 通知發送成功');
  } catch (error) {
    console.error('❌ Webhook 通知發送失敗:', error.message);
    process.exit(1);
  }
}

// 如果直接執行此腳本
if (require.main === module) {
  main();
}

module.exports = {
  main,
  generateSlackPayload,
  generateDiscordPayload,
  generateCustomPayload,
  sendSlackWebhook,
  sendDiscordWebhook,
  sendCustomWebhook
};
