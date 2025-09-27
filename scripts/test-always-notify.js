#!/usr/bin/env node

/**
 * 測試每次檢查都發送通知功能
 */

const { detectStatusChange, generateDiscordPayload } = require('./webhook-notify.js');

// 設定測試環境變數
function setupTestEnvironment() {
  process.env.SITE_NAME = '測試站點';
  process.env.SITE_URL = 'https://example.com';
  process.env.SITE_STATUS = 'up';
  process.env.RESPONSE_TIME = '150';
  process.env.UPTIME = '99.9%';
  process.env.LAST_CHECKED = new Date().toISOString();
  process.env.STATUS_HISTORY_FILE = 'test-status-history.json';
  process.env.NOTIFY_ON_CHECK = 'true';
  process.env.WEBHOOK_TYPE = 'discord';
}

/**
 * 測試狀態變化檢測
 */
function testStatusChangeDetection() {
  console.log('\n🧪 測試狀態變化檢測（啟用每次檢查通知）...');
  
  // 測試第一次檢查（應該觸發通知）
  console.log('\n1. 第一次檢查（up 狀態）:');
  let statusChange = detectStatusChange('up');
  console.log('結果:', statusChange);
  console.log('預期: changed=true, previousStatus=undefined');
  
  // 測試相同狀態（應該觸發通知，因為啟用了每次檢查通知）
  console.log('\n2. 相同狀態檢查（up 狀態，啟用每次檢查通知）:');
  statusChange = detectStatusChange('up');
  console.log('結果:', statusChange);
  console.log('預期: changed=false, 但會因為 NOTIFY_ON_CHECK=true 而發送通知');
  
  // 測試狀態變化（up -> down）
  console.log('\n3. 狀態變化檢查（up -> down）:');
  statusChange = detectStatusChange('down');
  console.log('結果:', statusChange);
  console.log('預期: changed=true, previousStatus=up, isOutage=true');
  
  // 測試相同異常狀態（應該觸發通知）
  console.log('\n4. 相同異常狀態檢查（down 狀態，啟用每次檢查通知）:');
  statusChange = detectStatusChange('down');
  console.log('結果:', statusChange);
  console.log('預期: changed=false, 但會因為 NOTIFY_ON_CHECK=true 而發送通知');
  
  // 測試恢復（down -> up）
  console.log('\n5. 服務恢復檢查（down -> up）:');
  statusChange = detectStatusChange('up');
  console.log('結果:', statusChange);
  console.log('預期: changed=true, previousStatus=down, isRecovery=true');
}

/**
 * 測試 Discord payload 生成
 */
function testDiscordPayloadGeneration() {
  console.log('\n🧪 測試 Discord payload 生成...');
  
  // 測試例行檢查通知
  console.log('\n1. 例行檢查通知（狀態無變化）:');
  const routineCheck = {
    changed: false,
    previousStatus: 'up',
    currentStatus: 'up',
    isRecovery: false,
    isOutage: false
  };
  
  const payload = generateDiscordPayload(routineCheck);
  if (payload) {
    const parsedPayload = JSON.parse(payload);
    console.log('✅ 成功生成例行檢查通知 payload');
    console.log('訊息:', parsedPayload.embeds[0].description);
    console.log('頁腳:', parsedPayload.embeds[0].footer.text);
  } else {
    console.log('❌ 未能生成例行檢查通知 payload');
  }
  
  // 測試服務恢復通知
  console.log('\n2. 服務恢復通知:');
  const recoveryCheck = {
    changed: true,
    previousStatus: 'down',
    currentStatus: 'up',
    isRecovery: true,
    isOutage: false
  };
  
  const recoveryPayload = generateDiscordPayload(recoveryCheck);
  if (recoveryPayload) {
    const parsedPayload = JSON.parse(recoveryPayload);
    console.log('✅ 成功生成服務恢復通知 payload');
    console.log('訊息:', parsedPayload.embeds[0].description);
    console.log('頁腳:', parsedPayload.embeds[0].footer.text);
  } else {
    console.log('❌ 未能生成服務恢復通知 payload');
  }
}

/**
 * 清理測試檔案
 */
function cleanupTestFiles() {
  const testFile = process.env.STATUS_HISTORY_FILE;
  const fs = require('fs');
  if (fs.existsSync(testFile)) {
    fs.unlinkSync(testFile);
    console.log(`🧹 清理測試檔案: ${testFile}`);
  }
}

/**
 * 主測試函數
 */
function runTests() {
  console.log('🚀 開始測試每次檢查都發送通知功能...');
  
  try {
    // 設定測試環境
    setupTestEnvironment();
    
    // 執行測試
    testStatusChangeDetection();
    testDiscordPayloadGeneration();
    
    console.log('\n✅ 所有測試完成！');
    console.log('\n💡 功能說明:');
    console.log('- 啟用 NOTIFY_ON_CHECK=true 後，即使狀態沒有變化也會發送通知');
    console.log('- 狀態變化時會發送特殊通知（恢復、異常、變化）');
    console.log('- 例行檢查會發送 "例行檢查完成" 通知');
    
  } catch (error) {
    console.error('❌ 測試過程中發生錯誤:', error.message);
    console.error(error.stack);
  } finally {
    // 清理測試檔案
    cleanupTestFiles();
  }
}

// 如果直接執行此腳本
if (require.main === module) {
  runTests();
}

module.exports = {
  runTests,
  testStatusChangeDetection,
  testDiscordPayloadGeneration
};
