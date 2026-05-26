#!/bin/bash
# WaveFlow 生产环境启动脚本
# 用于 Lighthouse / VPS 部署

set -e

echo "🚀 启动 WaveFlow 音乐平台..."

# 安装依赖
echo "📦 安装依赖..."
npm install --production=false

# 构建 Next.js
echo "🔨 构建项目..."
npm run build

# 启动音乐API服务器（后台）
echo "🎵 启动音乐 API 服务器 (127.0.0.1:3001)..."
node scripts/music-server.cjs &
MUSIC_PID=$!

# 等待音乐服务器就绪
sleep 3

# 启动 Next.js 生产服务器
echo "🌐 启动 Web 服务器 (0.0.0.0:3000)..."
export MUSIC_API_URL="http://127.0.0.1:3001"
export NODE_ENV=production
npx next start -p 3000 -H 0.0.0.0 &
NEXT_PID=$!

echo ""
echo "✅ WaveFlow 已启动!"
echo "   Web:     http://0.0.0.0:3000"
echo "   Music:   http://127.0.0.1:3001 (internal)"
echo "   PID Web: $NEXT_PID"
echo "   PID API: $MUSIC_PID"
echo ""

# 等待任一进程退出
wait -n
