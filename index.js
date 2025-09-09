// 适配TRSS-Yunzai/Miao-Yunzai框架
import { plugin } from '@lib/plugins/plugin.js'
import fs from 'fs-extra'
import axios from 'axios'
import path from 'path'
import { segment } from 'oicq'

// 定义插件类（必须继承plugin，否则Bot无法监听指令）
export class SakisakiGame extends plugin {
  constructor() {
    super({
      name: '香草小祥追击',
      dsc: '香草小祥追击游戏',
      event: 'message',
      priority: 5000,
      rule: [
        {
          reg: '^[/#]?saki$|^[/#]?小祥$',
          fnc: 'startGame'
        },
        {
          reg: '^[/#]?saki排行$|^[/#]?小祥排行$',
          fnc: 'showRanking'
        },
        {
          reg: '^[/#]?saki清除排行$',
          fnc: 'clearRanking',
          permission: 'master'
        },
        {
          reg: '^[/#]?小祥帮助$',
          fnc: 'showHelp'
        }
      ]
    })

    this.successProb = 0.25
    this.cdTime = 3000
    this.cdMap = new Map()
    this.dataPath = path.join(process.cwd(), 'data', 'sakisaki-game')
    this.dataFile = path.join(this.dataPath, 'sakisaki_data.json')
    this.imgFile = path.join(this.dataPath, 'sjp.jpg')
    
    fs.ensureDirSync(this.dataPath)
    this.initGameData()
  }

  initGameData() {
    if (!fs.existsSync(this.dataFile)) {
      const defaultData = {
        users: {},
        global: { totalTimes: 0, successTimes: 0 }
      }
      fs.writeJSONSync(this.dataFile, defaultData, { spaces: 2 })
    }
    this.gameData = fs.readJSONSync(this.dataFile)
  }

  saveGameData() {
    fs.writeJSONSync(this.dataFile, this.gameData, { spaces: 2 })
  }

  async startGame() {
    const userId = this.e.user_id
    const now = Date.now()
    
    if (this.cdMap.has(userId) && now - this.cdMap.get(userId) < this.cdTime) {
      return
    }
    this.cdMap.set(userId, now)
  
    if (!this.gameData.users[userId]) {
      this.gameData.users[userId] = { success: 0, total: 0 }
    }
  
    const userData = this.gameData.users[userId]
    userData.total++
    this.gameData.global.totalTimes++
  
    const nickname = this.e.sender.card || this.e.sender.nickname || this.e.user_id
  
    if (Math.random() < this.successProb) {
      userData.success++
      this.gameData.global.successTimes++
      
      await this.downloadImage()
      
      const successRate = ((userData.success / userData.total) * 100).toFixed(1)
      const msg = [
        `🎉 恭喜 ${nickname} 成功追上了香草小祥！`,
        `📊 总追击次数：${userData.total} 次`,
        `🏆 成功次数：${userData.success} 次`,
        `📈 成功率：${successRate}%`
      ].join('\n')
      
      this.e.reply(msg)
      this.e.reply(segment.image(this.imgFile))
    } else {
      this.e.reply(`💨 ${nickname} 没能追上香草小祥...再试一次吧！`)
    }
    
    this.saveGameData()
  }

  async showRanking() {
    const users = Object.entries(this.gameData.users)
      .map(([qq, data]) => ({ 
        qq, 
        ...data, 
        nickname: this.e.group?.pickMember?.(qq)?.card || this.e.group?.pickMember?.(qq)?.nickname || qq 
      }))
      .sort((a, b) => b.success - a.success)
      .slice(0, 10)
  
    if (users.length === 0) {
      this.e.reply('还没有人玩过游戏呢～快来成为第一个吧！')
      return
    }
  
    let msg = '🏆 香草小祥追击排行榜\n'
    msg += '═══════════════════════\n'
  
    users.forEach((user, index) => {
      const medal = ['🥇', '🥈', '🥉'][index] || '  '
      const successRate = ((user.success / user.total) * 100).toFixed(1)
      msg += `${medal} ${user.nickname}\n`
      msg += `   成功: ${user.success}次 | 总计: ${user.total}次 | 成功率: ${successRate}%\n`
    })
  
    const globalSuccessRate = this.gameData.global.totalTimes > 0 
      ? ((this.gameData.global.successTimes / this.gameData.global.totalTimes) * 100).toFixed(1)
      : 0
  
    msg += `\n📊 总游戏次数: ${this.gameData.global.totalTimes}\n`
    msg += `🎯 总成功次数: ${this.gameData.global.successTimes}\n`
    msg += `📈 整体成功率: ${globalSuccessRate}%`
  
    this.e.reply(msg)
  }

  clearRanking() {
    this.gameData = {
      users: {},
      global: { totalTimes: 0, successTimes: 0 }
    }
    this.saveGameData()
    this.e.reply('✅ 排行榜已重置！')
  }

  showHelp() {
    const helpMsg = [
      '🎮 香草小祥追击游戏帮助',
      '═══════════════════════',
      '• 发送「saki」或「小祥」开始游戏',
      '• 发送「saki排行」或「小祥排行」查看排行榜',
      '• 发送「saki清除排行」重置排行榜（仅主人）',
      '',
      '🎯 游戏规则：',
      '• 每次追击有25%的成功率',
      '• 成功追击可获得香草小祥图片',
      '• 3秒冷却时间，防止刷屏',
      '',
      '🏆 祝你游戏愉快！'
    ].join('\n')
    
    this.e.reply(helpMsg)
  }

  async downloadImage() {
    if (fs.existsSync(this.imgFile)) return
    
    try {
      const imageUrl = 'https://gitee.com/yhArcadia/Yunzai-Bot-plugins-index/raw/main/img/sjp.jpg'
      const response = await axios.get(imageUrl, { responseType: 'stream' })
      const writer = fs.createWriteStream(this.imgFile)
      response.data.pipe(writer)
      
      await new Promise((resolve, reject) => {
        writer.on('finish', resolve)
        writer.on('error', reject)
      })
    } catch (error) {
      console.error('图片下载失败:', error.message)
    }
  }
}