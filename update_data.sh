#!/bin/bash

# ETF 数据更新脚本
# 使用方法: ./update_data.sh

set -e

# 获取脚本所在目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo "=========================================="
echo "更新 ETF 数据"
echo "=========================================="

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_step() {
    echo -e "${YELLOW}------------------------------------------${NC}"
    echo -e "${YELLOW}$1${NC}"
    echo -e "${YELLOW}------------------------------------------${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# 1. 爬取今天的数据
print_step "步骤1/3: 爬取最新数据"
if [ -d "venv" ]; then
    source venv/bin/activate
fi
python3 etf_spider.py today
print_success "数据爬取完成"

# 2. 复制数据库到 Next.js 目录
print_step "步骤2/3: 同步数据库"
if [ -d "etf-database" ]; then
    cp etf_data.db etf-database/
    print_success "数据库同步完成"
else
    echo "警告: etf-database 目录不存在"
fi

# 3. 重启应用（如果 PM2 正在运行）
print_step "步骤3/3: 重启应用"
if command -v pm2 &> /dev/null; then
    cd etf-database 2>/dev/null || true
    if pm2 list | grep -q "etf-database"; then
        pm2 restart etf-database
        print_success "应用重启完成"
    else
        echo "PM2 应用未运行，跳过重启"
    fi
else
    echo "PM2 未安装，跳过重启"
fi

echo ""
echo "=========================================="
echo "更新完成！"
echo "=========================================="
