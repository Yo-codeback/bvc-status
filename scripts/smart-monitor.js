#!/usr/bin/env node

/**
 * 智慧狀態監控腳本
 * 監控多個 API 端點，只在狀態變化時發送通知
 */

const fs = require('fs');
const path = require('path');
const { main: sendWebhookNotification } = require('./webhook-notify.js');

// 監控的 API 端點配置
const monitoredSites = [
  {
    name: 'our_api 主要資料 (資料來源)',
    url: 'https://bvc-api.deno.dev',
    apiPath: 'api/our-api'
  },
  {
    name: 'moa_api 農業部資料 (副資料來源)',
    url: 'https://data.moa.gov.tw/Service/OpenData/FromM/FarmTransData.aspx',
    apiPath: 'api/moa-api'
  },
  {
    name: 'notify_api 通知頁面 (通知內容)',
    url: 'https://bvcaanotify.deno.dev',
    apiPath: 'api/notify-api'
  }
];

/**
 * 讀取 JSON 檔案
 */
function readJsonFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  } catch (error) {
    console.warn(`無法讀取檔案 ${filePath}:`, error.message);
  }
  return null;
}

/**
 * 判斷服務狀態
 */
function determineServiceStatus(responseTimeData, uptimeData) {
  // 優先使用明確的 status 欄位
  if (responseTimeData.status) {
    return responseTimeData.status;
  }
  if (uptimeData.status) {
    return uptimeData.status;
  }
  
  // 根據顏色和運行時間綜合判斷狀態
  const responseColor = responseTimeData.color;
  const uptimeColor = uptimeData.color;
  const uptimeValue = parseFloat(uptimeData.message.replace('%', ''));
  
  // 如果運行時間顯示紅色，則為異常
  if (uptimeColor === 'red') {
    return 'down';
  }
  
  // 如果運行時間很高（>95%），即使響應時間慢也認為是正常的（只是慢）
  if (uptimeValue > 95) {
    if (responseColor === 'red') {
      return 'slow'; // 慢但可用
    }
    return 'up';
  }
  
  // 如果響應時間顯示紅色且運行時間不高，則為異常
  if (responseColor === 'red') {
    return 'down';
  }
  
  // 如果響應時間顯示橙色或黃色，可能是慢但可用
  if (responseColor === 'orange' || responseColor === 'yellow') {
    return 'slow';
  }
  
  // 默認為正常
  return 'up';
}

/**
 * 解析響應時間
 */
function parseResponseTime(responseTimeMessage) {
  try {
    return responseTimeMessage.replace(' ms', '').replace(' ms', '');
  } catch (error) {
    return '0';
  }
}

/**
 * 檢查單個站點
 */
async function checkSingleSite(site) {
  try {
    console.log(`\n🔍 檢查 ${site.name}...`);
    
    // 檢查檔案是否存在
    const responseTimeFile = `${site.apiPath}/response-time.json`;
    const uptimeFile = `${site.apiPath}/uptime.json`;
    
    if (!fs.existsSync(responseTimeFile) || !fs.existsSync(uptimeFile)) {
      console.log(`⚠️ ${site.name} 數據檔案不存在，跳過檢查`);
      return;
    }

    // 讀取數據
    const responseTimeData = readJsonFile(responseTimeFile);
    const uptimeData = readJsonFile(uptimeFile);

    if (!responseTimeData || !uptimeData) {
      console.log(`⚠️ ${site.name} 無法讀取數據，跳過檢查`);
      return;
    }

    // 解析數據
    const responseTime = parseResponseTime(responseTimeData.message);
    const uptime = uptimeData.message;
    const status = determineServiceStatus(responseTimeData, uptimeData);
    
    console.log(`📊 ${site.name} 狀態: ${status}, 響應時間: ${responseTime}ms, 運行時間: ${uptime}`);

    // 設定環境變數並呼叫 webhook 通知腳本
    process.env.SITE_NAME = site.name;
    process.env.SITE_URL = site.url;
    process.env.SITE_STATUS = status;
    process.env.RESPONSE_TIME = responseTime;
    process.env.UPTIME = uptime;
    process.env.LAST_CHECKED = new Date().toISOString();
    process.env.STATUS_HISTORY_FILE = `${site.apiPath}/status-history.json`;

    // 呼叫 webhook 通知腳本
    await sendWebhookNotification();
    
  } catch (error) {
    console.error(`❌ 檢查 ${site.name} 時發生錯誤:`, error.message);
  }
}

/**
 * 主函數
 */
async function main() {
  try {
    console.log('🚀 開始智慧狀態監控...');
    console.log(`📡 監控 ${monitoredSites.length} 個 API 端點`);
    console.log(`🔧 Webhook 類型: ${process.env.WEBHOOK_TYPE || 'discord'}`);

    // 檢查每個站點
    for (const site of monitoredSites) {
      await checkSingleSite(site);
      
      // 稍微延遲避免過於頻繁的檢查
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n🎉 智慧監控檢查完成！');
  } catch (error) {
    console.error('❌ 智慧監控過程中發生錯誤:', error.message);
    process.exit(1);
  }
}

// 如果直接執行此腳本
if (require.main === module) {
  main();
}

module.exports = {
  main,
  checkSingleSite,
  determineServiceStatus,
  parseResponseTime
};
