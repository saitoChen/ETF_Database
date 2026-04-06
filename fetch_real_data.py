import etf_spider
import sqlite3
from datetime import datetime, timedelta

# 先清空数据库重新获取真实数据
DB_FILE = 'etf_data.db'

print("清空现有数据库...")
conn = sqlite3.connect(DB_FILE)
cursor = conn.cursor()
cursor.execute('DELETE FROM etf_data')
conn.commit()
conn.close()

# 更新开始日期，先获取最近一个月的真实数据
print("\n获取真实数据...")
etf_spider.START_DATE = '2026-03-01'
etf_spider.fetch_historical_data()

print("\n验证数据:")
conn = sqlite3.connect(DB_FILE)
cursor = conn.cursor()
cursor.execute('SELECT stat_date, sec_code, sec_name, tot_vol FROM etf_data WHERE stat_date = ?', ('2026-03-31',))
rows = cursor.fetchall()
print("\n2026-03-31的数据:")
for row in rows:
    print(f"  {row[1]} {row[2]}: {row[3]}")

conn.close()
