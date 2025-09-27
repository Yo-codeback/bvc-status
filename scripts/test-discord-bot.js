#!/usr/bin/env node

/**
 * 測試 Discord Bot 通知功能
 */

const { main: discordBotNotify } = require('./discord-bot-notify.js');

async function testDiscordBot() {
  console.log('🧪 開始測試 Discord Bot 通知功能...\n');
  
  try {
    // 檢查環境變數
    const botToken = process.env.bot_token;
    
    if (!botToken) {
      console.log('❌ 測試失敗: 未找到 bot_token 環境變數');
      console.log('💡 請設定環境變數: export bot_token="你的_bot_token"');
      return;
    }
    
    console.log('✅ 找到 bot_token 環境變數');
    console.log('📊 模擬檢查監控數據...');
    
    // 執行 Bot 通知
    await discordBotNotify();
    
    console.log('\n🎉 測試完成！');
    console.log('💡 請檢查 Discord 頻道 1421404291444510783 是否收到狀態報告');
    
  } catch (error) {
    console.error('❌ 測試過程中發生錯誤:', error.message);
    console.error('詳細錯誤:', error);
  }
}

// 如果直接執行此腳本
if (require.main === module) {
  testDiscordBot();
}

module.exports = { testDiscordBot };
