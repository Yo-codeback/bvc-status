#!/usr/bin/env node

/**
 * 測試智慧監控腳本
 * 用於驗證狀態變化檢測和通知功能
 */

const fs = require('fs');
const { detectStatusChange, readStatusHistory, saveStatusHistory } = require('./webhook-notify.js');

/**
 * 模擬測試環境變數
 */
function setupTestEnvironment() {
  process.env.SITE_NAME = 'test_site';
  process.env.SITE_URL = 'https://example.com';
  process.env.SITE_STATUS = 'up';
  process.env.RESPONSE_TIME = '150';
  process.env.UPTIME = '99.9%';
  process.env.LAST_CHECKED = new Date().toISOString();
  process.env.STATUS_HISTORY_FILE = 'test-status-history.json';
  process.env.WEBHOOK_URL = 'https://hooks.slack.com/services/TEST/WEBHOOK';
  process.env.WEBHOOK_TYPE = 'discord';
}

/**
 * 清理測試檔案
 */
function cleanupTestFiles() {
  const testFile = process.env.STATUS_HISTORY_FILE;
  if (fs.existsSync(testFile)) {
    fs.unlinkSync(testFile);
    console.log(`🧹 清理測試檔案: ${testFile}`);
  }
}

/**
 * 測試狀態變化檢測
 */
function testStatusChangeDetection() {
  console.log('\n🧪 測試狀態變化檢測...');
  
  // 測試第一次檢查（應該觸發通知）
  console.log('\n1. 第一次檢查（up 狀態）:');
  let statusChange = detectStatusChange('up');
  console.log('結果:', statusChange);
  console.log('預期: changed=true, previousStatus=undefined, isRecovery=false, isOutage=false');
  
  // 測試相同狀態（不應該觸發通知）
  console.log('\n2. 相同狀態檢查（up 狀態）:');
  statusChange = detectStatusChange('up');
  console.log('結果:', statusChange);
  console.log('預期: changed=false');
  
  // 測試狀態變化（up -> down）
  console.log('\n3. 狀態變化檢查（up -> down）:');
  statusChange = detectStatusChange('down');
  console.log('結果:', statusChange);
  console.log('預期: changed=true, previousStatus=up, isRecovery=false, isOutage=true');
  
  // 測試恢復（down -> up）
  console.log('\n4. 服務恢復檢查（down -> up）:');
  statusChange = detectStatusChange('up');
  console.log('結果:', statusChange);
  console.log('預期: changed=true, previousStatus=down, isRecovery=true, isOutage=false');
}

/**
 * 測試狀態歷史檔案操作
 */
function testStatusHistoryOperations() {
  console.log('\n🧪 測試狀態歷史檔案操作...');
  
  // 測試讀取空歷史
  console.log('\n1. 讀取空歷史檔案:');
  const emptyHistory = readStatusHistory();
  console.log('結果:', emptyHistory);
  console.log('預期: 空物件 {}');
  
  // 測試保存和讀取
  console.log('\n2. 保存和讀取歷史:');
  const testHistory = {
    test_site: {
      status: 'up',
      lastChecked: new Date().toISOString(),
      responseTime: '150',
      uptime: '99.9%',
      timestamp: Date.now()
    }
  };
  
  saveStatusHistory(testHistory);
  const readHistory = readStatusHistory();
  console.log('保存的歷史:', testHistory);
  console.log('讀取的歷史:', readHistory);
  console.log('預期: 兩個物件應該相同');
}

/**
 * 主測試函數
 */
function runTests() {
  console.log('🚀 開始智慧監控測試...');
  
  try {
    // 設定測試環境
    setupTestEnvironment();
    
    // 執行測試
    testStatusHistoryOperations();
    testStatusChangeDetection();
    
    console.log('\n✅ 所有測試完成！');
    
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
  testStatusHistoryOperations
};
