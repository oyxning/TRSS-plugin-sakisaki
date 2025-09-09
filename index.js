import axios from 'axios'
import fs from 'fs-extra'
import path from 'path'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)

const DATA_DIR = './data/sakisaki-game'
const DATA_FILE = path.join(DATA_DIR, 'sakisaki_data.json')
const IMAGE_FILE = path.join(DATA_DIR, 'sjp.jpg')
const IMAGE_URL = 'https://raw.githubusercontent.com/oyxning/astrbot_plugin_sakisaki/refs/heads/master/sjp.jpg'

await fs.ensureDir(DATA_DIR)

const plugin = {
  name: 'sakisaki-game-plugin',
  dsc: '香草小祥追击游戏',
  event: 'message',
  priority: 5000,
  rule: [
    {
      reg: '^(saki|小祥)$',
      fnc: 'sakisakiGame',
      permission: 'all'
    },
    {
      reg: '^(saki排行|小祥排行)$',
      fnc: 'sakisakiRank',
      permission: 'all'
    },
    {
      reg: '^(saki清除排行)$',
      fnc: 'clearRank',
      permission: 'master'
    },
    {
      reg: '^#小祥帮助$',
      fnc: 'gameHelp',
      permission: 'all'
    }
  ]
}

async function initData() {
  if (!await fs.pathExists(DATA_FILE)) {
    await fs.writeJSON(DATA_FILE, {
      players: {},
      totalGames: 0,
      successCount: 0,
      lastTrigger: {}
    })
  }
  
  if (!await fs.pathExists(IMAGE_FILE)) {
    try {
      const response = await axios.get(IMAGE_URL, { responseType: 'stream' })
      const writer = fs.createWriteStream(IMAGE_FILE)
      response.data.pipe(writer)
      await new Promise((resolve, reject) => {
        writer.on('finish', resolve)
        writer.on('error', reject)
      })
    } catch (error) {
      console.error('[sakisaki] 下载图片失败:', error)
    }
  }
}

async function sakisakiGame(e) {
  const userId = e.user_id.toString()
  const groupId = e.group_id ? e.group_id.toString() : 'private'
  const now = Date.now()
  
  let data = await fs.readJSON(DATA_FILE)
  
  const lastTrigger = data.lastTrigger[groupId] || {}
  if (lastTrigger[userId] && now - lastTrigger[userId] < 3000) {
    const cd = Math.ceil((3000 - (now - lastTrigger[userId])) / 1000)
    e.reply(`冷却中，请等待${cd}秒...`)
    return true
  }
  
  if (!data.lastTrigger[groupId]) data.lastTrigger[groupId] = {}
  data.lastTrigger[groupId][userId] = now
  
  const successProb = 0.25
  const isSuccess = Math.random() < successProb
  
  if (!data.players[userId]) {
    data.players[userId] = {
      userId: userId,
      nickname: e.sender.card || e.sender.nickname,
      total: 0,
      success: 0,
      lastPlay: now
    }
  }
  
  const player = data.players[userId]
  player.total++
  player.lastPlay = now
  player.nickname = e.sender.card || e.sender.nickname
  
  data.totalGames++
  
  let message = ''
  
  if (isSuccess) {
    player.success++
    data.successCount++
    
    message = [
      `🎉 恭喜 ${player.nickname} 成功追上了香草小祥！`,
      `📊 总追击次数：${player.total} 次`,
      `🏆 成功次数：${player.success} 次`,
      `📈 成功率：${((player.success / player.total) * 100).toFixed(1)}%`
    ].join('\n')
    
    if (await fs.pathExists(IMAGE_FILE)) {
      try {
        await e.reply(segment.image(IMAGE_FILE))
        await sleep(1000)
      } catch (error) {
        console.error('[sakisaki] 发送图片失败:', error)
      }
    }
  } else {
    const failMessages = [
      `${player.nickname} 试图追击香草小祥，但是被甩掉了！`,
      `${player.nickname} 追得太慢，香草小祥跑掉了！`,
      `${player.nickname} 一个踉跄，香草小祥趁机溜走了！`,
      `${player.nickname} 被香草小祥的可爱迷惑，忘记追击了！`
    ]
    
    message = failMessages[Math.floor(Math.random() * failMessages.length)] + 
             `\n📊 当前成功率：${((player.success / player.total) * 100).toFixed(1)}%`
  }
  
  await fs.writeJSON(DATA_FILE, data)
  e.reply(message)
  return true
}

async function sakisakiRank(e) {
  try {
    const data = await fs.readJSON(DATA_FILE)
    const players = Object.values(data.players)
    
    if (players.length === 0) {
      e.reply('还没有人玩过香草小祥追击游戏呢！')
      return true
    }
    
    players.sort((a, b) => b.success - a.success)
    
    const topPlayers = players.slice(0, 10)
    const messages = [
      '🏆 香草小祥追击排行榜',
      '═══════════════════════'
    ]
    
    topPlayers.forEach((player, index) => {
      const medal = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'][index] || '🔟'
      const rate = ((player.success / player.total) * 100).toFixed(1)
      messages.push(
        `${medal} ${player.nickname}`,
        `   成功: ${player.success}次 | 总计: ${player.total}次 | 成功率: ${rate}%`
      )
    })
    
    messages.push(
      '═══════════════════════',
      `📊 总游戏次数: ${data.totalGames}`,
      `🎯 总成功次数: ${data.successCount}`,
      `📈 整体成功率: ${((data.successCount / data.totalGames) * 100).toFixed(1)}%`
    )
    
    e.reply(messages.join('\n'))
  } catch (error) {
    console.error('[sakisaki] 读取排行榜失败:', error)
    e.reply('获取排行榜失败，请稍后重试')
  }
  
  return true
}

async function clearRank(e) {
  try {
    const data = {
      players: {},
      totalGames: 0,
      successCount: 0,
      lastTrigger: {}
    }
    
    await fs.writeJSON(DATA_FILE, data)
    e.reply('✅ 香草小祥追击排行榜已重置！')
  } catch (error) {
    console.error('[sakisaki] 清除排行榜失败:', error)
    e.reply('清除排行榜失败，请稍后重试')
  }
  
  return true
}

async function gameHelp(e) {
  const helpText = [
    '🎮 香草小祥追击游戏帮助',
    '═══════════════════════',
    '🎯 游戏指令：',
    '• 输入 "saki" 或 "小祥" - 开始追击游戏',
    '• 输入 "saki排行" 或 "小祥排行" - 查看排行榜',
    '• 输入 "#小祥帮助" - 显示此帮助',
    '',
    '🎲 游戏规则：',
    '• 每次追击有25%的成功率',
    '• 成功追击会获得香草小祥的图片',
    '• 3秒冷却时间，防止刷屏',
    '',
    '🏆 排行榜：',
    '• 按成功次数排序',
    '• 显示前10名玩家',
    '• 包含成功率和总次数统计',
    '',
    '💡 提示：',
    '• 只有主人可以清除排行榜',
    '• 使用 "saki清除排行" 重置数据'
  ].join('\n')
  
  e.reply(helpText)
  return true
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

await initData()

export { plugin as default }

if (typeof module !== 'undefined' && module.exports) {
  module.exports = plugin
}