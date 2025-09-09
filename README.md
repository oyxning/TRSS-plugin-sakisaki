# 🎮 香草小祥追击游戏插件

> TRSS-Yunzai移植版，源自AstrBot原版插件

一个有趣的香草小祥追击小游戏，每次追击都有25%的成功率，成功后会获得香草小祥的可爱图片！

## ✨ 功能特性

- 🎯 **追击游戏** - 输入"saki"或"小祥"开始游戏
- 📊 **排行榜系统** - 查看前10名玩家的追击成绩
- 🏆 **数据统计** - 个人成功率、总次数统计
- 🖼️ **图片奖励** - 成功追击获得香草小祥图片
- ⏱️ **冷却机制** - 3秒冷却防止刷屏
- 🔧 **管理功能** - 主人可清除排行榜

## 🚀 安装方法

### 方法1：直接安装
```bash
cd TRSS-Yunzai/plugins
git clone https://github.com/yourname/sakisaki-game-plugin.git
```

### 方法2：手动安装
1. 下载本插件到 `TRSS-Yunzai/plugins/sakisaki-game-plugin`
2. 安装依赖：
```bash
cd sakisaki-game-plugin
npm install
```
3. 重启TRSS-Yunzai

## 🎲 使用说明

### 游戏指令

| 指令 | 功能 |
|------|------|
| `saki` 或 `小祥` | 开始追击游戏 |
| `saki排行` 或 `小祥排行` | 查看排行榜 |
| `saki清除排行` | 清除排行榜（仅主人） |
| `#小祥帮助` | 显示帮助信息 |

### 游戏机制

- **成功率**：每次追击有25%的成功率
- **奖励**：成功追击获得香草小祥图片
- **冷却**：3秒冷却时间，防止刷屏
- **统计**：记录个人和全局数据

### 数据存储

插件数据存储在：
- `data/sakisaki-game/sakisaki_data.json` - 游戏数据
- `data/sakisaki-game/sjp.jpg` - 香草小祥图片

## 📊 排行榜说明

排行榜按成功次数排序，显示：
- 🥇🥈🥉 前三名特殊标识
- 玩家昵称
- 成功次数和总次数
- 个人成功率

## 🔧 配置选项

### 游戏概率（可修改）
在 `index.js` 中可调整：
```javascript
const successProb = 0.25  // 成功率
```

### 冷却时间
```javascript
const cdTime = 3000  // 冷却时间（毫秒）
```

## 🎮 游戏示例

```
用户A: saki
Bot: 🎉 恭喜 用户A 成功追上了香草小祥！
     📊 总追击次数：1 次
     🏆 成功次数：1 次
     📈 成功率：100.0%
[发送香草小祥图片]

用户B: saki排行
Bot: 🏆 香草小祥追击排行榜
     ═══════════════════════
     🥇 用户A
        成功: 1次 | 总计: 1次 | 成功率: 100.0%
     📊 总游戏次数: 1
     🎯 总成功次数: 1
     📈 整体成功率: 100.0%
```

## 🔄 更新日志

### v1.6.0 (当前版本)
- ✨ 从AstrBot移植到TRSS-Yunzai
- 🎯 保持原版游戏机制
- 📊 优化数据存储结构
- 🖼️ 自动下载香草小祥图片
- 🔧 添加主人管理功能

## 🛠️ 技术细节

### 插件结构
```
sakisaki-game-plugin/
├── index.js           # 主插件文件
├── package.json       # 插件配置
├── README.md         # 说明文档
└── config/           # 配置文件（可选）
```

### 依赖包
- `axios` - HTTP请求库
- `fs-extra` - 文件系统扩展

### 兼容性
- ✅ TRSS-Yunzai V3
- ✅ Yunzai-Bot V3
- ✅ Miao-Yunzai

## ⚠️ 注意事项

1. **网络要求**：首次使用需要下载香草小祥图片
2. **权限管理**：
   - 普通用户可使用游戏功能
   - 仅主人可清除排行榜
3. **数据安全**：数据自动保存，无需手动备份
4. **群聊限制**：建议一个群只有一个Bot实例运行

## 🐛 故障排除

### 图片下载失败
- 检查网络连接
- 手动下载图片到 `data/sakisaki-game/sjp.jpg`

### 数据异常
- 删除 `data/sakisaki-game/sakisaki_data.json` 重置数据
- 使用 `saki清除排行` 重置排行榜

### 指令无响应
- 检查插件是否正确安装
- 查看控制台日志获取错误信息

## 🤝 贡献指南

欢迎提交Issue和PR！

### 开发环境
```bash
git clone https://github.com/yourname/sakisaki-game-plugin.git
cd sakisaki-game-plugin
npm install
```

### 测试方法
1. 在测试群中安装插件
2. 使用测试账号进行游戏
3. 检查数据存储和排行榜功能

## 📞 联系方式

- 📧 提交Issue：GitHub Issues
- 💬 讨论群组：查看原仓库信息
- 🎮 游戏反馈群：928985352（进群密码：神人desuwa）

## 📄 许可证

MIT License - 基于原版AstrBot插件移植

---

*香草小祥追击游戏，祝你玩得开心！* 🎮✨