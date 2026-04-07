# ETF 项目快速部署指南

## 🚀 方式一：使用一键部署脚本（推荐）

### 第一步：上传项目文件到服务器

在**本地电脑**的终端执行：

```bash
# 把项目上传到服务器
scp -r /Users/jeffchen/code/project/ETF_Database your_username@your_server_ip:~/
```

### 第二步：连接服务器并运行部署脚本

在服务器上执行：

```bash
# 连接到服务器
ssh your_username@your_server_ip

# 进入项目目录
cd ~/ETF_Database

# 给脚本添加执行权限
chmod +x deploy.sh

# 运行部署脚本（替换为你的实际用户名）
./deploy.sh ubuntu
```

### 第三步：配置定时任务

部署完成后，手动配置定时任务：

```bash
# 编辑 crontab
crontab -e
```

添加以下内容（注意修改路径为你的实际路径）：

```bash
# 每天20:00自动更新数据
0 20 * * * cd /home/ubuntu/ETF_Database && ./update_data.sh >> /home/ubuntu/ETF_Database/cron.log 2>&1
```

保存退出即可。

---

## 📋 方式二：手动分步部署

详细步骤请查看 [DEPLOY.md](./DEPLOY.md)

---

## 🌐 访问应用

部署完成后，在浏览器访问：

```
http://your_server_ip:3000
```

---

## 🔧 常用命令

### 查看应用状态
```bash
pm2 status
```

### 查看日志
```bash
pm2 logs etf-database
```

### 手动更新数据
```bash
cd ~/ETF_Database
./update_data.sh
```

### 重启应用
```bash
pm2 restart etf-database
```

---

## 📁 项目文件说明

- `etf_spider.py` - Python 爬虫脚本
- `scheduler.py` - 定时任务脚本
- `etf-database/` - Next.js 前端项目
- `etf_data.db` - SQLite 数据库文件
- `deploy.sh` - 一键部署脚本
- `update_data.sh` - 数据更新脚本
- `DEPLOY.md` - 详细部署文档
- `QUICK_START.md` - 本文档

---

## ⚠️ 常见问题

### 问题：无法访问 http://your_server_ip:3000

**解决方案：**

1. 检查防火墙是否开放3000端口：
```bash
sudo ufw allow 3000
```

2. 检查应用是否正在运行：
```bash
pm2 status
```

3. 查看应用日志：
```bash
pm2 logs etf-database
```

### 问题：定时任务不执行

**解决方案：**

1. 检查 cron 服务状态：
```bash
sudo systemctl status cron
```

2. 查看 cron 日志：
```bash
grep CRON /var/log/syslog
```

3. 检查脚本路径和权限是否正确

### 问题：数据更新后页面不显示

**解决方案：**

运行数据更新脚本会自动重启应用：
```bash
cd ~/ETF_Database
./update_data.sh
```

或者手动重启：
```bash
pm2 restart etf-database
```

---

## 📞 需要帮助？

如有问题，请查看详细文档 [DEPLOY.md](./DEPLOY.md)
