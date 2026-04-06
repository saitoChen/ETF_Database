import sqlite3
import etf_spider

DB_FILE = 'etf_data.db'

print("清空数据库...")
conn = sqlite3.connect(DB_FILE)
cursor = conn.cursor()
cursor.execute('DELETE FROM etf_data')
conn.commit()
conn.close()

print("\n从2025年8月开始爬取完整历史数据...")
etf_spider.START_DATE = '2025-08-01'

# 直接修改 etf_spider的fetch_historical_data函数的逻辑，不从最新日期开始，而从指定日期开始
import datetime
from datetime import timedelta

# 重写fetch_historical_data
def my_fetch_historical_data():
    etf_spider.init_db()
    etf_spider.get_etf_full_names()
    
    start_date = datetime.datetime.strptime('2025-08-01', '%Y-%m-%d').date()
    
    end_date = datetime.date.today()
    current_date = start_date
    
    print(f"Fetching data from {current_date} to {end_date}")
    
    while current_date <= end_date:
        date_str = current_date.strftime('%Y-%m-%d')
        print(f"Checking {date_str}...")
        
        data = etf_spider.get_etf_data_by_date(date_str)
        
        if data:
            print(f"Found {len(data)} records for {date_str}")
            etf_spider.save_data_to_db(data)
        else:
            print(f"No data for {date_str}")
        
        current_date += timedelta(days=1)
        import time
        time.sleep(0.2)
    
    etf_spider.update_existing_names()

my_fetch_historical_data()

print("\n验证数据...")
conn = sqlite3.connect(DB_FILE)
cursor = conn.cursor()
cursor.execute('SELECT MIN(stat_date), MAX(stat_date) FROM etf_data')
result = cursor.fetchone()
print(f"最早日期: {result[0]}")
print(f"最晚日期: {result[1]}")

cursor.execute('SELECT COUNT(DISTINCT stat_date) FROM etf_data')
count = cursor.fetchone()
print(f"交易日数: {count[0]}")
conn.close()

print("\n完成！")
