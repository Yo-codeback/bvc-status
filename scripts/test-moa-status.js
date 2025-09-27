#!/usr/bin/env node

/**
 * 測試 moa_api 狀態判斷修復
 */

const fs = require('fs');

// 模擬 moa_api 的數據
const mockMoaApiData = {
  responseTimeData: {
    "schemaVersion": 1,
    "label": "response time",
    "message": "12737 ms",
    "color": "red"
  },
  uptimeData: {
    "schemaVersion": 1,
    "label": "uptime",
    "message": "99.03%",
    "color": "brightgreen"
  }
};

/**
 * 判斷服務狀態（從 smart-monitor.js 複製的邏輯）
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
  
  console.log(`📊 分析數據:`);
  console.log(`   響應時間顏色: ${responseColor}`);
  console.log(`   運行時間顏色: ${uptimeColor}`);
  console.log(`   運行時間數值: ${uptimeValue}%`);
  
  // 如果運行時間顯示紅色，則為異常
  if (uptimeColor === 'red') {
    console.log(`   判斷結果: 運行時間顯示紅色 → down`);
    return 'down';
  }
  
  // 如果運行時間很高（>95%），即使響應時間慢也認為是正常的（只是慢）
  if (uptimeValue > 95) {
    if (responseColor === 'red') {
      console.log(`   判斷結果: 運行時間高(${uptimeValue}%)但響應時間慢 → slow`);
      return 'slow'; // 慢但可用
    }
    console.log(`   判斷結果: 運行時間高(${uptimeValue}%)且響應時間正常 → up`);
    return 'up';
  }
  
  // 如果響應時間顯示紅色且運行時間不高，則為異常
  if (responseColor === 'red') {
    console.log(`   判斷結果: 響應時間紅色且運行時間不高 → down`);
    return 'down';
  }
  
  // 如果響應時間顯示橙色或黃色，可能是慢但可用
  if (responseColor === 'orange' || responseColor === 'yellow') {
    console.log(`   判斷結果: 響應時間橙色/黃色 → slow`);
    return 'slow';
  }
  
  // 默認為正常
  console.log(`   判斷結果: 默認 → up`);
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
 * 主測試函數
 */
function main() {
  console.log('🧪 測試 moa_api 狀態判斷修復...\n');
  
  console.log('📋 moa_api 原始數據:');
  console.log(`   響應時間: ${mockMoaApiData.responseTimeData.message} (${mockMoaApiData.responseTimeData.color})`);
  console.log(`   運行時間: ${mockMoaApiData.uptimeData.message} (${mockMoaApiData.uptimeData.color})`);
  
  console.log('\n🔍 狀態判斷過程:');
  const status = determineServiceStatus(mockMoaApiData.responseTimeData, mockMoaApiData.uptimeData);
  const responseTime = parseResponseTime(mockMoaApiData.responseTimeData.message);
  
  console.log(`\n✅ 最終結果:`);
  console.log(`   狀態: ${status}`);
  console.log(`   響應時間: ${responseTime}ms`);
  console.log(`   運行時間: ${mockMoaApiData.uptimeData.message}`);
  
  // 顯示預期的 Discord 通知內容
  console.log(`\n📱 預期的 Discord 通知:`);
  if (status === 'slow') {
    console.log(`   🟡 moa_api 農業部資料 (副資料來源) - 運行緩慢`);
    console.log(`   📊 例行檢查完成 - moa_api 農業部資料 (副資料來源) 運行緩慢但可用`);
    console.log(`   當前狀態: 運行緩慢`);
    console.log(`   響應時間: ${responseTime}ms`);
    console.log(`   運行時間: ${mockMoaApiData.uptimeData.message}`);
  } else if (status === 'up') {
    console.log(`   🟢 moa_api 農業部資料 (副資料來源) - 正常運行`);
    console.log(`   📊 例行檢查完成 - moa_api 農業部資料 (副資料來源) 運行正常`);
  } else {
    console.log(`   🔴 moa_api 農業部資料 (副資料來源) - 服務異常`);
  }
  
  console.log('\n🎉 測試完成！');
}

// 如果直接執行此腳本
if (require.main === module) {
  main();
}

module.exports = {
  main,
  determineServiceStatus,
  parseResponseTime
};
