#!/bin/bash

# ETF 项目一键部署脚本 (Ubuntu)
# 使用方法: ./deploy.sh

set -e

if [ "$#" -ne 0 ]; then
    echo "使用方法: $0"
    echo "例如: ./deploy.sh"
    exit 1
fi

USERNAME="root"
PROJECT_DIR="/root/project/ETF_Database"

echo "=========================================="
echo "ETF 项目一键部署"
echo "=========================================="

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_step() {
    echo -e "${YELLOW}------------------------------------------${NC}"
    echo -e "${YELLOW}步骤: $1${NC}"
    echo -e "${YELLOW}------------------------------------------${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# 1. 更新系统
print_step "1/10 更新系统软件包"
sudo apt update && sudo apt upgrade -y
print_success "系统更新完成"

# 2. 安装基础工具
print_step "2/10 安装基础工具"
sudo apt install -y git curl wget vim
print_success "基础工具安装完成"

# 3. 安装 Node.js
print_step "3/10 安装 Node.js (v20)"
if ! command -v node &> /dev/null; then
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    nvm install 20
    nvm use 20
    nvm alias default 20
else
    print_success "Node.js 已安装"
fi
node --version
npm --version

# 4. 安装 Python
print_step "4/10 安装 Python 3"
sudo apt install -y python3 python3-pip python3-venv
python3 --version
pip3 --version
print_success "Python 安装完成"

# 5. 检查项目目录
print_step "5/10 检查项目文件"
if [ ! -d "$PROJECT_DIR" ]; then
    print_error "项目目录不存在: $PROJECT_DIR"
    echo "请先将项目文件上传到服务器"
    echo "可以使用: scp -r /本地/ETF_Database root@服务器IP:/root/project/"
    exit 1
fi
print_success "项目目录存在"

# 6. 配置 Python 环境
print_step "6/10 配置 Python 虚拟环境"
cd "$PROJECT_DIR"
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip3 install -r requirements.txt
print_success "Python 环境配置完成"

# 7. 爬取历史数据
print_step "7/10 爬取历史数据"
cd "$PROJECT_DIR"
source venv/bin/activate
if [ ! -f "etf_data.db" ]; then
    echo "正在爬取历史数据..."
    python3 etf_spider.py historical
else
    print_success "数据库已存在，跳过爬取"
fi

# 8. 配置 Next.js
print_step "8/10 配置 Next.js 项目"
cd "$PROJECT_DIR/etf-database"
npm install
npm install --save-dev @types/better-sqlite3
if [ ! -f "etf_data.db" ]; then
    cp ../etf_data.db .
fi
npm run build
print_success "Next.js 项目配置完成"

# 9. 安装 PM2
print_step "9/10 安装 PM2"
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi
print_success "PM2 安装完成"

# 10. 配置 PM2
print_step "10/10 配置 PM2 并启动应用"
cd "$PROJECT_DIR/etf-database"

# 创建 ecosystem.config.js
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'etf-database',
    script: 'npm',
    args: 'start',
    cwd: '$PROJECT_DIR/etf-database',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
EOF

# 启动应用
pm2 delete etf-database 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u root --hp /root || true
print_success "PM2 配置完成"

echo ""
echo "=========================================="
echo "部署完成！"
echo "=========================================="
echo ""
echo "接下来请手动配置定时任务："
echo ""
echo "1. 编辑 crontab:"
echo "   crontab -e"
echo ""
echo "2. 添加以下行："
echo "   0 20 * * * cd $PROJECT_DIR && $PROJECT_DIR/venv/bin/python3 $PROJECT_DIR/etf_spider.py today >> $PROJECT_DIR/cron.log 2>&1"
echo ""
echo "常用命令："
echo "  pm2 status              - 查看应用状态"
echo "  pm2 logs etf-database - 查看日志"
echo "  pm2 restart etf-database - 重启应用"
echo ""
echo "访问地址：http://$(curl -s ifconfig.me):3000"
echo ""