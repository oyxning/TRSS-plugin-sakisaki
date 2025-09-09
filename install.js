#!/usr/bin/env node

import fs from 'fs-extra'
import path from 'path'

console.log('🎮 香草小祥追击游戏插件 - 安装脚本')
console.log('=====================================')

const pluginDir = process.cwd()
const yunzaiDir = path.join(pluginDir, '..', '..')

// 检查是否在正确的目录
if (!fs.existsSync(path.join(yunzaiDir, 'package.json'))) {
  console.error('❌ 请将插件安装在TRSS-Yunzai/plugins目录下')
  process.exit(1)
}

// 安装依赖
console.log('📦 正在安装依赖...')
import { execSync } from 'child_process'
try {
  execSync('npm install', { stdio: 'inherit' })
  console.log('✅ 依赖安装完成')
} catch (error) {
  console.error('❌ 依赖安装失败:', error.message)
  process.exit(1)
}

console.log('\n🎉 安装完成！')
console.log('请重启TRSS-Yunzai以使用香草小祥追击游戏插件')
console.log('\n🎯 使用指令：')
console.log('• saki 或 小祥 - 开始游戏')
console.log('• saki排行 或 小祥排行 - 查看排行榜')
console.log('• #小祥帮助 - 显示帮助')