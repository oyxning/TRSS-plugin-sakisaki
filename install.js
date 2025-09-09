#!/usr/bin/env node

import fs from 'fs-extra'
import path from 'path'
import { execSync } from 'child_process'

const pluginDir = process.cwd()
const yunzaiDir = path.join(pluginDir, '..', '..')

if (!fs.existsSync(path.join(yunzaiDir, 'package.json'))) {
  console.error('请将插件安装在TRSS-Yunzai/plugins目录下')
  process.exit(1)
}

console.log('安装依赖...')
try {
  execSync('npm install', { stdio: 'inherit' })
  console.log('安装完成！重启TRSS-Yunzai即可使用')
} catch (error) {
  console.error('安装失败:', error.message)
  process.exit(1)
}