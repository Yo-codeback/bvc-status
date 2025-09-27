#!/usr/bin/env node

/**
 * 驗證 Discord.js 設定
 * 用於測試 Discord.js 是否可以正常載入
 */

console.log('🧪 驗證 Discord.js 和 YAML 設定...');

try {
  // 嘗試載入 discord.js
  const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
  
  console.log('✅ Discord.js 載入成功');
  console.log('📦 可用的組件:');
  console.log('  - Client:', typeof Client);
  console.log('  - GatewayIntentBits:', typeof GatewayIntentBits);
  console.log('  - EmbedBuilder:', typeof EmbedBuilder);
  
  // 嘗試載入 js-yaml
  const yaml = require('js-yaml');
  console.log('✅ js-yaml 載入成功');
  console.log('📦 YAML 載入器:', typeof yaml.load);
  
  // 測試創建 Client 實例
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent
    ]
  });
  
  console.log('✅ Client 實例創建成功');
  
  // 測試創建 Embed
  const embed = new EmbedBuilder()
    .setTitle('測試嵌入')
    .setDescription('這是一個測試嵌入')
    .setColor(0x00ff00);
    
  console.log('✅ EmbedBuilder 測試成功');
  console.log('🎉 所有 Discord.js 組件都正常運作！');
  
} catch (error) {
  console.error('❌ Discord.js 載入失敗:', error.message);
  console.error('💡 請確認已安裝 discord.js: npm install discord.js');
  process.exit(1);
}
