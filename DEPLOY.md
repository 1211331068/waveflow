# WaveFlow 部署指南

## 方式一：Vercel 部署（推荐）

### 1. 准备工作
确保项目已推送到 GitHub / GitLab / Bitbucket。

### 2. 导入项目
1. 打开 [vercel.com](https://vercel.com) 并登录
2. 点击 **"New Project"**
3. 导入你的 Git 仓库
4. Vercel 会自动检测为 Next.js 项目

### 3. 配置
- **Build Command**: `next build`（默认，无需修改）
- **Output Directory**: `.next`（默认）
- 无需额外环境变量

### 4. 部署
点击 **"Deploy"**，Vercel 会自动构建并部署。

### 5. 自定义域名（可选）
部署后在 Vercel Dashboard → Settings → Domains 添加。

---

## 方式二：传统服务器部署

### 1. 确保服务器已安装 Node.js 18+

```bash
node -v  # 应 >= 18
```

### 2. 上传项目到服务器

```bash
# 方式1: 直接上传目录
scp -r ./ root@your-server:/opt/waveflow/

# 方式2: 使用 Git
git clone <your-repo> /opt/waveflow/
```

### 3. 启动服务

```bash
cd /opt/waveflow
npm install
npm run build
npm start          # 运行在 0.0.0.0:3000
```

### 4. 使用 PM2 后台运行

```bash
npm install -g pm2
npm run build
pm2 start npm --name waveflow -- start
pm2 save
pm2 startup
```

### 防火墙配置

```bash
ufw allow 3000
```
