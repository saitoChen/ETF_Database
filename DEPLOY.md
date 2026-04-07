# ETF 项目部署指南 (Ubuntu)

## 第一步：连接到服务器

使用SSH连接到你的Ubuntu服务器：
```bash
ssh your_username@your_server_ip
```

## 第二步：更新系统

```bash
sudo apt update && sudo apt upgrade -y
```

## 第三步：安装基础工具

```bash
sudo apt install -y git curl wget vim
```

## 第四步：安装 Node.js 和 npm

使用 nvm (Node Version Manager) 安装 Node.js：

```bash
# 安装 nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 重新加载 shell 配置
source ~/.bashrc

# 安装 Node.js v20
nvm install 20
nvm use 20
nvm alias default 20

# 验证安装
node --version
npm --version
```

## 第五步：安装 Python 3

```bash
# 安装 Python 3 和 pip
sudo apt install -y python3 python3-pip python3-venv

# 验证安装
python3 --version
pip3 --version
```

## 第六步：上传项目文件

### 方式一：使用 Git（推荐）

如果你的代码在 Git 仓库中：
```bash
# 克隆项目
cd ~
git clone <你的仓库地址> ETF_Database
cd ETF_Database
```

### 方式二：使用 SCP 上传

在本地电脑的终端执行：
```bash
scp -r /path/to/ETF_Database your_username@your_server_ip:~/
```

## 第七步：配置 Python 环境

```bash
cd ~/ETF_Database

# 创建虚拟环境（可选但推荐）
python3 -m venv venv
source venv/bin/activate

# 安装依赖
pip3 install -r requirements.txt
```

## 第八步：爬取历史数据

```bash
# 确保在项目目录中
cd ~/ETF_Database

# 爬取从2025年8月开始的历史数据
python3 etf_spider.py historical
```

## 第九步：配置 Next.js 项目

```bash
cd ~/ETF_Database/etf-database

# 安装依赖
npm install

# 从上级目录复制数据库文件
cp ../etf_data.db .

# 构建生产版本
npm run build
```

## 第十步：安装 PM2 (进程管理器)

PM2 可以帮你保持应用持续运行：

```bash
npm install -g pm2
```

## 第十一步：使用 PM2 启动应用

在 `~/ETF_Database/etf-database` 目录下创建一个 `ecosystem.config.js` 文件：

```javascript
module.exports = {
  apps: [{
    name: 'etf-database',
    script: 'npm',
    args: 'start',
    cwd: '/home/your_username/ETF_Database/etf-database',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
```

启动应用：

```bash
cd ~/ETF_Database/etf-database
pm2 start ecosystem.config.js

# 查看状态
pm2 status

# 查看日志
pm2 logs etf-database

# 设置开机自启动
pm2 startup
pm2 save
```

## 第十二步：配置定时任务 (crontab)

设置每天晚上20点自动爬取数据：

```bash
# 编辑 crontab
crontab -e
```

添加以下行（注意修改路径为你的实际路径）：

```bash
# 每天20:00执行爬虫
0 20 * * * cd /home/your_username/ETF_Database && /home/your_username/ETF_Database/venv/bin/python3 etf_spider.py today >> /home/your_username/ETF_Database/cron.log 2>&1
```

保存并退出。

## 第十三步：安装 Nginx (可选，用于反向代理)

如果你想通过域名访问或使用80/443端口：

```bash
sudo apt install -y nginx

# 创建配置文件
sudo vim /etc/nginx/sites-available/etf-database
```

添加以下配置：

```nginx
server {
    listen 80;
    server_name your_domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

启用配置：

```bash
sudo ln -s /etc/nginx/sites-available/etf-database /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 验证部署

1. 检查 PM2 状态：
```bash
pm2 status
```

2. 检查应用是否运行：
```bash
curl http://localhost:3000
```

3. 在浏览器访问：
```
http://your_server_ip:3000
```

## 常用命令

### PM2 命令
```bash
pm2 status              # 查看状态
pm2 logs etf-database   # 查看日志
pm2 restart etf-database # 重启
pm2 stop etf-database   # 停止
pm2 delete etf-database # 删除
```

### 更新数据
```bash
cd ~/ETF_Database
python3 etf_spider.py today
cp etf_data.db etf-database/
pm2 restart etf-database
```

## 常见问题

### 问题1：权限错误
确保文件权限正确：
```bash
chmod +x ~/ETF_Database/etf_spider.py
chmod 644 ~/ETF_Database/etf_data.db
```

### 问题2：端口被占用
检查3000端口：
```bash
sudo lsof -i :3000
# 或者
sudo netstat -tulpn | grep 3000
```

### 问题3：Python依赖问题
重新安装依赖：
```bash
cd ~/ETF_Database
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip3 install -r requirements.txt
```
