#!/usr/bin/env node

/**
 * GitHub Actions 測試腳本
 * 模擬在 GitHub Actions 環境中運行智慧監控
 */

const fs = require('fs');
const path = require('path');

// 模擬 GitHub Actions 環境變數
function setupGitHubActionsEnvironment() {
  console.log('🔧 設定 GitHub Actions 模擬環境...');
  
  // 設定環境變數
  process.env.WEBHOOK_URL = process.env.WEBHOOK_URL || 'https://discord.com/api/webhooks/TEST/TEST';
  process.env.WEBHOOK_TYPE = process.env.WEBHOOK_TYPE || 'discord';
  
  console.log(`📡 WEBHOOK_URL: ${process.env.WEBHOOK_URL.substring(0, 50)}...`);
  console.log(`🔧 WEBHOOK_TYPE: ${process.env.WEBHOOK_TYPE}`);
}

// 檢查必要的檔案是否存在
function checkRequiredFiles() {
  console.log('\n📁 檢查必要檔案...');
  
  const requiredFiles = [
    'package.json',
    'package-lock.json',
    'scripts/smart-monitor.js',
    'scripts/webhook-notify.js',
    '.github/workflows/webhook-always-notify.yml'
  ];
  
  const missingFiles = [];
  
  for (const file of requiredFiles) {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file}`);
    } else {
      console.log(`❌ ${file} - 檔案不存在`);
      missingFiles.push(file);
    }
  }
  
  if (missingFiles.length > 0) {
    console.log(`\n⚠️ 缺少 ${missingFiles.length} 個必要檔案`);
    return false;
  }
  
  console.log('\n✅ 所有必要檔案都存在');
  return true;
}

// 檢查 Node.js 腳本語法
function checkScriptSyntax() {
  console.log('\n🔍 檢查 Node.js 腳本語法...');
  
  const scripts = [
    'scripts/smart-monitor.js',
    'scripts/webhook-notify.js'
  ];
  
  for (const script of scripts) {
    try {
      // 嘗試載入腳本來檢查語法
      require(path.resolve(script));
      console.log(`✅ ${script} - 語法正確`);
    } catch (error) {
      console.log(`❌ ${script} - 語法錯誤: ${error.message}`);
      return false;
    }
  }
  
  return true;
}

// 檢查 API 數據檔案
function checkApiDataFiles() {
  console.log('\n📊 檢查 API 數據檔案...');
  
  const apiEndpoints = ['our-api', 'moa-api', 'notify-api'];
  const dataFiles = ['response-time.json', 'uptime.json'];
  
  for (const endpoint of apiEndpoints) {
    const apiPath = `api/${endpoint}`;
    console.log(`\n檢查 ${endpoint}:`);
    
    for (const dataFile of dataFiles) {
      const filePath = `${apiPath}/${dataFile}`;
      if (fs.existsSync(filePath)) {
        try {
          const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          console.log(`  ✅ ${dataFile} - 格式正確`);
        } catch (error) {
          console.log(`  ❌ ${dataFile} - JSON 格式錯誤: ${error.message}`);
          return false;
        }
      } else {
        console.log(`  ⚠️ ${dataFile} - 檔案不存在`);
      }
    }
  }
  
  return true;
}

// 模擬智慧監控腳本執行
async function simulateSmartMonitor() {
  console.log('\n🚀 模擬智慧監控腳本執行...');
  
  try {
    // 檢查是否能正常載入智慧監控腳本
    const smartMonitor = require('./smart-monitor.js');
    console.log('✅ 智慧監控腳本載入成功');
    
    // 檢查是否能正常載入 webhook 通知腳本
    const webhookNotify = require('./webhook-notify.js');
    console.log('✅ Webhook 通知腳本載入成功');
    
    // 檢查函數是否可用
    if (typeof smartMonitor.main === 'function') {
      console.log('✅ 智慧監控主函數可用');
    } else {
      console.log('❌ 智慧監控主函數不可用');
      return false;
    }
    
    if (typeof webhookNotify.detectStatusChange === 'function') {
      console.log('✅ 狀態變化檢測函數可用');
    } else {
      console.log('❌ 狀態變化檢測函數不可用');
      return false;
    }
    
    return true;
    
  } catch (error) {
    console.log(`❌ 模擬執行失敗: ${error.message}`);
    return false;
  }
}

// 主測試函數
async function main() {
  try {
    console.log('🚀 開始 GitHub Actions 環境測試...\n');
    
    // 設定環境
    setupGitHubActionsEnvironment();
    
    // 執行各項檢查
    const checks = [
      { name: '必要檔案檢查', fn: checkRequiredFiles },
      { name: '腳本語法檢查', fn: checkScriptSyntax },
      { name: 'API 數據檔案檢查', fn: checkApiDataFiles },
      { name: '智慧監控模擬', fn: simulateSmartMonitor }
    ];
    
    let allPassed = true;
    
    for (const check of checks) {
      const result = await check.fn();
      if (!result) {
        allPassed = false;
      }
    }
    
    // 顯示結果
    console.log('\n' + '='.repeat(50));
    if (allPassed) {
      console.log('🎉 所有測試通過！GitHub Actions 應該能正常運行');
      console.log('\n💡 下一步:');
      console.log('1. 提交這些檔案到 GitHub');
      console.log('2. 確保 WEBHOOK_URL 已設定在 GitHub Secrets 中');
      console.log('3. 手動觸發 GitHub Actions 工作流程來測試');
    } else {
      console.log('❌ 部分測試失敗，請檢查上述錯誤');
      console.log('\n🔧 建議:');
      console.log('1. 修復上述錯誤');
      console.log('2. 重新運行此測試腳本');
      console.log('3. 確認所有檔案都正確提交到 GitHub');
    }
    
  } catch (error) {
    console.error('❌ 測試過程中發生錯誤:', error.message);
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
  setupGitHubActionsEnvironment,
  checkRequiredFiles,
  checkScriptSyntax,
  checkApiDataFiles,
  simulateSmartMonitor
};
