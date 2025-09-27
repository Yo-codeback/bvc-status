#!/usr/bin/env node

/**
 * 短暫上線 Discord Bot 通知腳本
 * 用於在 GitHub Actions 中短暫上線並發送詳細的監控狀態資訊
 */

const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const yaml = require('js-yaml');
const fs = require('fs');

// 監控的 API 端點配置
const monitoredSites = [
  {
    name: 'our_api 主要資料 (資料來源)',
    url: 'https://bvc-api.deno.dev',
    historyFile: 'history/our-api.yml'
  },
  {
    name: 'moa_api 農業部資料 (副資料來源)',
    url: 'https://data.moa.gov.tw/Service/OpenData/FromM/FarmTransData.aspx',
    historyFile: 'history/moa-api.yml'
  },
  {
    name: 'notify_api 通知頁面 (通知內容)',
    url: 'https://bvcaanotify.deno.dev',
    historyFile: 'history/notify-api.yml'
  }
];

/**
 * 讀取 YAML 檔案
 */
function readYamlFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const fileContents = fs.readFileSync(filePath, 'utf8');
      return yaml.load(fileContents);
    }
  } catch (error) {
    console.warn(`無法讀取檔案 ${filePath}:`, error.message);
  }
  return null;
}

/**
 * 判斷服務狀態（基於 YAML 數據）
 */
function determineServiceStatus(yamlData) {
  // YAML 檔案直接包含 status 欄位
  if (yamlData.status) {
    return yamlData.status;
  }
  
  // 根據 HTTP 狀態碼判斷
  if (yamlData.code) {
    if (yamlData.code >= 200 && yamlData.code < 300) {
      return 'up';
    } else if (yamlData.code >= 400) {
      return 'down';
    }
  }
  
  // 根據響應時間判斷（如果沒有明確狀態）
  if (yamlData.responseTime) {
    const responseTime = parseInt(yamlData.responseTime);
    if (responseTime > 10000) { // 超過 10 秒認為是慢
      return 'slow';
    } else if (responseTime > 0) {
      return 'up';
    }
  }
  
  // 默認為正常
  return 'up';
}

/**
 * 解析響應時間（從 YAML 數據）
 */
function parseResponseTime(responseTime) {
  try {
    if (typeof responseTime === 'number') {
      return responseTime.toString();
    }
    if (typeof responseTime === 'string') {
      return responseTime.replace(' ms', '').replace(' ms', '');
    }
    return '0';
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
      
      const historyFile = site.historyFile;
      
      if (!fs.existsSync(historyFile)) {
        console.log(`⚠️ ${site.name} 歷史檔案不存在，跳過檢查`);
        continue;
      }

      const yamlData = readYamlFile(historyFile);

      if (!yamlData) {
        console.log(`⚠️ ${site.name} 無法讀取 YAML 數據，跳過檢查`);
        continue;
      }

      const responseTime = parseResponseTime(yamlData.responseTime);
      const status = determineServiceStatus(yamlData);
      const statusInfo = getStatusInfo(status);
      const lastUpdated = yamlData.lastUpdated || new Date().toISOString();
      
      // 計算運行時間（從 startTime 到 lastUpdated）
      let uptime = '未知';
      if (yamlData.startTime && yamlData.lastUpdated) {
        try {
          const startTime = new Date(yamlData.startTime);
          const endTime = new Date(yamlData.lastUpdated);
          const totalTime = endTime - startTime;
          const days = Math.floor(totalTime / (1000 * 60 * 60 * 24));
          uptime = `${days} 天`;
        } catch (error) {
          console.warn(`無法計算運行時間: ${error.message}`);
        }
      }
      
      results.push({
        name: site.name,
        url: site.url,
        status,
        statusInfo,
        responseTime,
        uptime,
        lastChecked: lastUpdated,
        httpCode: yamlData.code
      });
      
      console.log(`📊 ${site.name} 狀態: ${status}, 響應時間: ${responseTime}ms, 運行時間: ${uptime}, HTTP狀態: ${yamlData.code}`);
      
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
    const fieldValue = `**狀態**: ${statusInfo.emoji} ${statusInfo.text}\n**響應時間**: ${site.responseTime}ms\n**運行時間**: ${site.uptime}\n**HTTP狀態**: ${site.httpCode}`;
    
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
  
  // 要 Tag 的用戶 ID
  const alertUserId = '<@1106816996655513620>'; 
  
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
    
    // 檢查是否有異常或緩慢狀態
    const hasDown = siteResults.some(site => site.status === 'down');
    const hasSlow = siteResults.some(site => site.status === 'slow');
    
    // 準備發送的內容
    let content = '';
    if (hasDown || hasSlow) {
        // 如果有紅燈或黃燈，加入 Tag
        content = `${alertUserId} 注意！檢測到服務 **🔴異常** 或 **🟡緩慢**，請查看詳細報告。`;
    }
    
    // 發送狀態訊息到指定頻道
    const channel = await client.channels.fetch(channelId);
    if (!channel) {
      console.error(`❌ 無法找到頻道 ${channelId}`);
      return;
    }
    
    // 使用 content 欄位發送 Tag 和文字，並附帶 Embed
    await channel.send({ 
        content: content, // 包含 Tag 的文字
        embeds: [statusEmbed] 
    });
    console.log(`✅ 狀態報告已發送到頻道 ${channelId}`);
    
    // 【可選：移除此段】原本針對 Down 狀態的額外緊急告警，現在 Tag 已經包含在上面了
    // if (hasDown) {
    //   // 如果有服務異常，發送緊急通知
    //   const alertEmbed = new EmbedBuilder()
    //     .setTitle('🚨 緊急告警')
    //     .setDescription('檢測到服務異常，請立即檢查！')
    //     .setColor(0xff0000)
    //     .setTimestamp();
      
    //   const downSites = siteResults.filter(site => site.status === 'down');
    //   downSites.forEach(site => {
    //     alertEmbed.addFields({
    //       name: `🔴 ${site.name}`,
    //       value: `狀態: ${site.statusInfo.text}\n響應時間: ${site.responseTime}ms`,
    //       inline: true
    //     });
    //   });
      
    //   await channel.send({ embeds: [alertEmbed] });
    //   console.log('🚨 緊急告警已發送');
    // }
    // 【可選：移除此段 結束】
    
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
