# ETF 数据库项目

这是一个ETF基金份额数据爬虫和可视化项目。

## 功能特性

- 爬取上海证券交易所ETF基金的总份额数据
- 支持从历史日期开始批量爬取
- 每天20:00自动爬取当天数据
- 折线图可视化展示
- 支持日期区间查询
- 默认展示最近10个交易日数据

## 跟踪的ETF

| 代码 | 名称 |
|------|------|
| 510050 | 50ETF |
| 510300 | 300ETF |
| 588000 | 科创50 |
| 159949 | 创业板50 |
| 510500 | 500ETF |

## 安装和使用

### 1. 安装Python依赖

```bash
pip3 install -r requirements.txt
```

### 2. 爬取历史数据

从2025年8月1日开始爬取数据：

```bash
python3 etf_spider.py historical
```

或者只爬取当天数据：

```bash
python3 etf_spider.py today
```

### 3. 启动定时任务（每天20:00自动爬取）

```bash
python3 scheduler.py
```

### 4. 启动前端项目

```bash
cd etf-database
npm install
npm run dev
```

然后打开浏览器访问 http://localhost:3000

## 项目结构

```
ETF_Database/
├── etf_spider.py          # Python爬虫脚本
├── scheduler.py           # 定时任务脚本
├── requirements.txt       # Python依赖
├── etf_data.db           # SQLite数据库（运行后生成）
├── etf-database/         # Next.js前端项目
│   ├── app/
│   │   ├── api/etf-data/route.ts  # API路由
│   │   └── page.tsx                  # 主页面
│   └── package.json
└── README.md
```

## 数据库说明

使用SQLite数据库存储数据，表结构如下：

```sql
CREATE TABLE etf_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    stat_date TEXT NOT NULL,
    sec_code TEXT NOT NULL,
    sec_name TEXT NOT NULL,
    tot_vol REAL NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(stat_date, sec_code)
)
```
