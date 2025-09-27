#!/usr/bin/env node

/**
 * Upptime Webhook 通知腳本
 * 用於檢測狀態變化並發送 webhook 通知
 * 支援每次檢查都發送通知，或只在狀態變化時發送
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

/**
 * 獲取配置（每次調用時動態讀取環境變數）
 */
function getConfig() {
  return {
    webhookUrl: process.env.WEBHOOK_URL || 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK',
    webhookType: process.env.WEBHOOK_TYPE || 'slack', // slack, discord, custom
    siteName: process.env.SITE_NAME || 'Unknown Site',
    siteUrl: process.env.SITE_URL || '',
    status: process.env.SITE_STATUS || 'up', // up, down
    responseTime: process.env.RESPONSE_TIME || '0',
    lastChecked: process.env.LAST_CHECKED || new Date().toISOString(),
    uptime: process.env.UPTIME || '0%',
    // 新增：狀態歷史檔案路徑
    statusHistoryFile: process.env.STATUS_HISTORY_FILE || 'status-history.json',
    // 新增：是否每次檢查都發送通知
    notifyOnCheck: process.env.NOTIFY_ON_CHECK === 'true' || false
  };
}

/**
 * 讀取狀態歷史檔案
 */
function readStatusHistory() {
  const config = getConfig();
  try {
    if (fs.existsSync(config.statusHistoryFile)) {
      const data = fs.readFileSync(config.statusHistoryFile, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.warn('無法讀取狀態歷史檔案:', error.message);
  }
  return {};
}

/**
 * 保存狀態歷史檔案
 */
function saveStatusHistory(history) {
  const config = getConfig();
  try {
    fs.writeFileSync(config.statusHistoryFile, JSON.stringify(history, null, 2));
  } catch (error) {
    console.error('無法保存狀態歷史檔案:', error.message);
  }
}

/**
 * 檢測狀態是否發生變化
 */
function detectStatusChange(currentStatus) {
  const config = getConfig();
  const history = readStatusHistory();
  const siteKey = config.siteName;
  
  // 獲取上次的狀態
  const lastStatus = history[siteKey]?.status;
  const lastChecked = history[siteKey]?.lastChecked;
  
  // 如果是第一次檢查或狀態發生變化，則需要發送通知
  const statusChanged = lastStatus !== currentStatus;
  
  // 更新歷史記錄
  history[siteKey] = {
    status: currentStatus,
    lastChecked: config.lastChecked,
    responseTime: config.responseTime,
    uptime: config.uptime,
    timestamp: Date.now()
  };
  
  saveStatusHistory(history);
  
  return {
    changed: statusChanged,
    previousStatus: lastStatus,
    currentStatus: currentStatus,
    isRecovery: lastStatus === 'down' && currentStatus === 'up',
    isOutage: lastStatus === 'up' && currentStatus === 'down'
  };
}

/**
 * 發送 Slack webhook
 */
async function sendSlackWebhook(payload) {
  const config = getConfig();
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
  const config = getConfig();
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
  const config = getConfig();
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
function generateSlackPayload(statusChange) {
  const config = getConfig();
  const isUp = config.status === 'up';
  const statusEmoji = isUp ? '🟢' : '🔴';
  const statusText = isUp ? '正常運行' : '服務異常';
  const color = isUp ? 'good' : 'danger';
  
  // 根據狀態變化類型生成不同的訊息
  let notificationMessage;
  let footerText;
  
  if (statusChange.isRecovery) {
    notificationMessage = `🎉 服務恢復正常！${config.siteName} 已重新上線`;
    footerText = 'Upptime 監控系統 - 服務恢復通知';
  } else if (statusChange.isOutage) {
    notificationMessage = `🚨 服務異常！${config.siteName} 目前無法訪問`;
    footerText = 'Upptime 監控系統 - 服務異常通知';
  } else if (statusChange.changed) {
    notificationMessage = isUp 
      ? `✅ 狀態變化 - ${config.siteName} 現在正常運行`
      : `⚠️ 狀態變化 - ${config.siteName} 服務異常`;
    footerText = 'Upptime 監控系統 - 狀態變化通知';
  } else {
    // 如果沒有變化，不應該發送通知
    return null;
  }

  const fields = [
    {
      title: '當前狀態',
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
      title: '檢查時間',
      value: new Date(config.lastChecked).toLocaleString('zh-TW'),
      short: true
    }
  ];

  // 如果有之前的狀態，添加狀態變化資訊
  if (statusChange.previousStatus) {
    const previousStatusText = statusChange.previousStatus === 'up' ? '正常' : '異常';
    fields.push({
      title: '之前狀態',
      value: previousStatusText,
      short: true
    });
  }

  return JSON.stringify({
    attachments: [{
      color: color,
      title: `${statusEmoji} ${config.siteName} - ${statusText}`,
      title_link: config.siteUrl,
      text: notificationMessage,
      fields: fields,
      footer: footerText,
      ts: Math.floor(Date.now() / 1000)
    }]
  });
}

/**
 * 生成 Discord 格式的 payload
 */
function generateDiscordPayload(statusChange) {
  const config = getConfig();
  const isUp = config.status === 'up';
  const isSlow = config.status === 'slow';
  const isDown = config.status === 'down';
  
  let statusEmoji, statusText, color;
  if (isUp) {
    statusEmoji = '🟢';
    statusText = '正常運行';
    color = 0x00ff00; // 綠色
  } else if (isSlow) {
    statusEmoji = '🟡';
    statusText = '運行緩慢';
    color = 0xffa500; // 橙色
  } else {
    statusEmoji = '🔴';
    statusText = '服務異常';
    color = 0xff0000; // 紅色
  }
  
  // 根據狀態變化類型生成不同的訊息
  let notificationMessage;
  let footerText;
  
  if (statusChange.isRecovery) {
    if (isSlow) {
      notificationMessage = `🔄 服務恢復但運行緩慢 - ${config.siteName} 已重新上線但響應較慢`;
    } else {
      notificationMessage = `🎉 服務恢復正常！${config.siteName} 已重新上線`;
    }
    footerText = 'Upptime 監控系統 - 服務恢復通知';
  } else if (statusChange.isOutage) {
    notificationMessage = `🚨 服務異常！${config.siteName} 目前無法訪問`;
    footerText = 'Upptime 監控系統 - 服務異常通知';
  } else if (statusChange.changed) {
    if (isUp) {
      notificationMessage = `✅ 狀態變化 - ${config.siteName} 現在正常運行`;
    } else if (isSlow) {
      notificationMessage = `⚠️ 狀態變化 - ${config.siteName} 現在運行緩慢`;
    } else {
      notificationMessage = `⚠️ 狀態變化 - ${config.siteName} 服務異常`;
    }
    footerText = 'Upptime 監控系統 - 狀態變化通知';
  } else if (statusChange.changed === false && statusChange.isRecovery === false && statusChange.isOutage === false) {
    // 狀態沒有變化，但需要發送例行檢查通知
    if (isUp) {
      notificationMessage = `📊 例行檢查完成 - ${config.siteName} 運行正常`;
    } else if (isSlow) {
      notificationMessage = `📊 例行檢查完成 - ${config.siteName} 運行緩慢但可用`;
    } else {
      notificationMessage = `📊 例行檢查完成 - ${config.siteName} 服務異常`;
    }
    footerText = 'Upptime 監控系統 - 例行檢查通知';
  } else {
    // 如果沒有變化且未啟用每次檢查通知，不應該發送通知
    return null;
  }

  const fields = [
    {
      name: '當前狀態',
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
      name: '檢查時間',
      value: new Date(config.lastChecked).toLocaleString('zh-TW'),
      inline: true
    }
  ];

  // 如果有之前的狀態，添加狀態變化資訊
  if (statusChange.previousStatus) {
    const previousStatusText = statusChange.previousStatus === 'up' ? '正常' : '異常';
    fields.push({
      name: '之前狀態',
      value: previousStatusText,
      inline: true
    });
  }

  return JSON.stringify({
    embeds: [{
      title: `${statusEmoji} ${config.siteName} - ${statusText}`,
      url: config.siteUrl,
      description: notificationMessage,
      color: color,
      thumbnail: {
        url: isUp 
          ? 'https://raw.githubusercontent.com/upptime/upptime.js.org/master/static/img/icon.svg' // 正常狀態圖示
          : 'https://raw.githubusercontent.com/upptime/upptime.js.org/master/static/img/icon.svg' // 異常狀態圖示
      },
      fields: fields,
      footer: {
        text: footerText,
        icon_url: 'https://raw.githubusercontent.com/upptime/upptime.js.org/master/static/img/icon.svg'
      },
      timestamp: new Date(config.lastChecked).toISOString()
    }]
  });
}

/**
 * 生成自定義格式的 payload
 */
function generateCustomPayload(statusChange) {
  const config = getConfig();
  const isUp = config.status === 'up';
  
  // 根據狀態變化類型生成不同的訊息
  let notificationMessage;
  let notificationType;
  let severity;
  
  if (statusChange.isRecovery) {
    notificationMessage = `🎉 服務恢復正常！${config.siteName} 已重新上線`;
    notificationType = 'service_recovery';
    severity = 'success';
  } else if (statusChange.isOutage) {
    notificationMessage = `🚨 服務異常！${config.siteName} 目前無法訪問`;
    notificationType = 'service_outage';
    severity = 'error';
  } else if (statusChange.changed) {
    notificationMessage = isUp 
      ? `✅ 狀態變化 - ${config.siteName} 現在正常運行`
      : `⚠️ 狀態變化 - ${config.siteName} 服務異常`;
    notificationType = 'status_change';
    severity = isUp ? 'info' : 'warning';
  } else {
    // 如果沒有變化，不應該發送通知
    return null;
  }

  return JSON.stringify({
    site: {
      name: config.siteName,
      url: config.siteUrl,
      status: config.status,
      responseTime: parseInt(config.responseTime),
      uptime: config.uptime,
      lastChecked: config.lastChecked,
      timestamp: Date.now(),
      previousStatus: statusChange.previousStatus
    },
    notification: {
      type: notificationType,
      message: notificationMessage,
      severity: severity,
      checkType: 'status_change_monitoring',
      statusChange: {
        changed: statusChange.changed,
        isRecovery: statusChange.isRecovery,
        isOutage: statusChange.isOutage
      }
    }
  });
}

/**
 * 主函數
 */
async function main() {
  try {
    const config = getConfig();
    console.log(`開始檢查狀態變化...`);
    console.log(`網站: ${config.siteName}`);
    console.log(`當前狀態: ${config.status}`);
    console.log(`響應時間: ${config.responseTime}ms`);

    // 檢測狀態變化
    const statusChange = detectStatusChange(config.status);
    
    console.log(`狀態變化檢測結果:`, {
      changed: statusChange.changed,
      previousStatus: statusChange.previousStatus,
      currentStatus: statusChange.currentStatus,
      isRecovery: statusChange.isRecovery,
      isOutage: statusChange.isOutage
    });

    // 決定是否發送通知
    const shouldNotify = statusChange.changed || config.notifyOnCheck;
    
    if (!shouldNotify) {
      console.log('📊 狀態無變化且未啟用每次檢查通知，跳過通知');
      return;
    }
    
    if (!statusChange.changed && config.notifyOnCheck) {
      console.log('📊 狀態無變化，但啟用了每次檢查通知');
    }

    // 根據狀態變化類型選擇通知類型
    let notificationType;
    if (statusChange.isRecovery) {
      notificationType = '服務恢復';
    } else if (statusChange.isOutage) {
      notificationType = '服務異常';
    } else {
      notificationType = '狀態變化';
    }

    console.log(`📢 檢測到 ${notificationType}，準備發送通知...`);

    let payload;
    let sendFunction;

    switch (config.webhookType.toLowerCase()) {
      case 'slack':
        payload = generateSlackPayload(statusChange);
        sendFunction = sendSlackWebhook;
        break;
      case 'discord':
        payload = generateDiscordPayload(statusChange);
        sendFunction = sendDiscordWebhook;
        break;
      case 'custom':
      default:
        payload = generateCustomPayload(statusChange);
        sendFunction = sendCustomWebhook;
        break;
    }

    // 檢查是否生成了有效的 payload
    if (!payload) {
      console.log('⚠️ 未生成有效 payload，跳過通知');
      return;
    }

    await sendFunction(payload);
    console.log(`✅ ${notificationType} 通知發送成功`);
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
  sendCustomWebhook,
  detectStatusChange,
  readStatusHistory,
  saveStatusHistory
};
