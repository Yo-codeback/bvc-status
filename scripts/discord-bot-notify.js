#!/usr/bin/env node

/**
 * 短暫上線 Discord Bot 通知腳本
 * 用於在 GitHub Actions 中短暫上線並發送詳細的監控狀態資訊
 */

const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

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
  const fs = require('fs');
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
 * 獲取狀態表情符號和顏色
 */
function getStatusInfo(status) {
  switch (status) {
    case 'up':
      return { emoji: '🟢', color: 0x00ff00, text: '正常運行' };
    case 'slow':
      return { emoji: '🟡', color: 0xffa500, text: '運行緩慢' };
    case 'down':
      return { emoji: '🔴', color: 0xff0000, text: '服務異常' };
    default:
      return { emoji: '⚪', color: 0x9e9e9e, text: '狀態未知' };
  }
}

/**
 * 檢查所有站點狀態
 */
async function checkAllSites() {
  const results = [];
  
  for (const site of monitoredSites) {
    try {
      console.log(`🔍 檢查 ${site.name}...`);
      
      const responseTimeFile = `${site.apiPath}/response-time.json`;
      const uptimeFile = `${site.apiPath}/uptime.json`;
      
      if (!require('fs').existsSync(responseTimeFile) || !require('fs').existsSync(uptimeFile)) {
        console.log(`⚠️ ${site.name} 數據檔案不存在，跳過檢查`);
        continue;
      }

      const responseTimeData = readJsonFile(responseTimeFile);
      const uptimeData = readJsonFile(uptimeFile);

      if (!responseTimeData || !uptimeData) {
        console.log(`⚠️ ${site.name} 無法讀取數據，跳過檢查`);
        continue;
      }

      const responseTime = parseResponseTime(responseTimeData.message);
      const uptime = uptimeData.message;
      const status = determineServiceStatus(responseTimeData, uptimeData);
      const statusInfo = getStatusInfo(status);
      
      results.push({
        name: site.name,
        url: site.url,
        status,
        statusInfo,
        responseTime,
        uptime,
        lastChecked: new Date().toISOString()
      });
      
      console.log(`📊 ${site.name} 狀態: ${status}, 響應時間: ${responseTime}ms, 運行時間: ${uptime}`);
      
    } catch (error) {
      console.error(`❌ 檢查 ${site.name} 時發生錯誤:`, error.message);
    }
  }
  
  return results;
}

/**
 * 創建監控狀態嵌入
 */
function createStatusEmbed(siteResults, messageType = 'routine') {
  const timestamp = new Date().toLocaleString('zh-TW');
  
  // 計算整體狀態
  const allUp = siteResults.every(site => site.status === 'up');
  const hasDown = siteResults.some(site => site.status === 'down');
  const hasSlow = siteResults.some(site => site.status === 'slow');
  
  let overallStatus, overallColor, title;
  if (hasDown) {
    overallStatus = '🔴 部分服務異常';
    overallColor = 0xff0000;
    title = '🚨 服務狀態異常';
  } else if (hasSlow) {
    overallStatus = '🟡 服務運行緩慢';
    overallColor = 0xffa500;
    title = '⚠️ 服務狀態警告';
  } else {
    overallStatus = '🟢 所有服務正常';
    overallColor = 0x00ff00;
    title = '✅ 服務狀態正常';
  }
  
  const embed = new EmbedBuilder()
    .setTitle(title)
    .setDescription(`**整體狀態**: ${overallStatus}\n**檢查時間**: ${timestamp}`)
    .setColor(overallColor)
    .setTimestamp()
    .setFooter({ 
      text: 'BVC 智慧監控系統', 
      iconURL: 'https://raw.githubusercontent.com/upptime/upptime.js.org/master/static/img/icon.svg'
    });

  // 添加每個服務的詳細資訊
  siteResults.forEach(site => {
    const statusInfo = site.statusInfo;
    const fieldValue = `**狀態**: ${statusInfo.emoji} ${statusInfo.text}\n**響應時間**: ${site.responseTime}ms\n**運行時間**: ${site.uptime}`;
    
    embed.addFields({
      name: site.name,
      value: fieldValue,
      inline: true
    });
  });

  // 添加統計資訊
  const upCount = siteResults.filter(s => s.status === 'up').length;
  const slowCount = siteResults.filter(s => s.status === 'slow').length;
  const downCount = siteResults.filter(s => s.status === 'down').length;
  
  embed.addFields({
    name: '📊 統計摘要',
    value: `🟢 正常: ${upCount} 個\n🟡 緩慢: ${slowCount} 個\n🔴 異常: ${downCount} 個`,
    inline: false
  });

  return embed;
}

/**
 * 主函數
 */
async function main() {
  const botToken = process.env.bot_token;
  const channelId = '1421404291444510783'; // 指定的頻道ID
  const messageType = process.env.MESSAGE_TYPE || 'routine'; // routine, outage, recovery
  
  if (!botToken) {
    console.error('❌ 未找到 bot_token 環境變數');
    process.exit(1);
  }

  console.log('🤖 啟動 Discord Bot...');
  
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent
    ]
  });

  try {
    // 等待 Bot 上線
    await client.login(botToken);
    console.log('✅ Bot 已成功上線');
    
    // 檢查所有站點狀態
    console.log('📊 開始檢查所有站點狀態...');
    const siteResults = await checkAllSites();
    
    if (siteResults.length === 0) {
      console.log('⚠️ 沒有可用的監控數據');
      return;
    }
    
    // 創建狀態嵌入
    const statusEmbed = createStatusEmbed(siteResults, messageType);
    
    // 發送狀態訊息到指定頻道
    const channel = await client.channels.fetch(channelId);
    if (!channel) {
      console.error(`❌ 無法找到頻道 ${channelId}`);
      return;
    }
    
    await channel.send({ embeds: [statusEmbed] });
    console.log(`✅ 狀態報告已發送到頻道 ${channelId}`);
    
    // 根據狀態發送額外的通知
    const hasDown = siteResults.some(site => site.status === 'down');
    const hasSlow = siteResults.some(site => site.status === 'slow');
    
    if (hasDown) {
      // 如果有服務異常，發送緊急通知
      const alertEmbed = new EmbedBuilder()
        .setTitle('🚨 緊急告警')
        .setDescription('檢測到服務異常，請立即檢查！')
        .setColor(0xff0000)
        .setTimestamp();
      
      const downSites = siteResults.filter(site => site.status === 'down');
      downSites.forEach(site => {
        alertEmbed.addFields({
          name: `🔴 ${site.name}`,
          value: `狀態: ${site.statusInfo.text}\n響應時間: ${site.responseTime}ms`,
          inline: true
        });
      });
      
      await channel.send({ embeds: [alertEmbed] });
      console.log('🚨 緊急告警已發送');
    }
    
  } catch (error) {
    console.error('❌ Bot 執行過程中發生錯誤:', error.message);
  } finally {
    // 確保 Bot 下線
    console.log('🔌 Bot 正在下線...');
    await client.destroy();
    console.log('✅ Bot 已成功下線');
  }
}

// 如果直接執行此腳本
if (require.main === module) {
  main().catch(error => {
    console.error('❌ 執行失敗:', error.message);
    process.exit(1);
  });
}

module.exports = {
  main,
  checkAllSites,
  createStatusEmbed,
  getStatusInfo
};
