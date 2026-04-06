import sqlite3
import random
from datetime import datetime, timedelta

DB_FILE = 'etf_data.db'

ETF_LIST = [
    ('510050', '上证50ETF华夏'),
    ('510300', '沪深300ETF华泰柏瑞'),
    ('588000', '科创50ETF华夏'),
    ('510500', '中证500ETF南方')
]

BASE_VALUES = {
    '510050': 2300000.00,
    '510300': 4480000.00,
    '588000': 5150000.00,
    '510500': 950000.00
}

def generate_test_data():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    end_date = datetime(2026, 4, 3)
    start_date = end_date - timedelta(days=15)
    
    current_date = start_date
    trading_days = []
    
    while current_date <= end_date:
        if current_date.weekday() < 5:
            trading_days.append(current_date)
        current_date += timedelta(days=1)
    
    print(f"生成 {len(trading_days)} 个交易日的数据...")
    
    for i, date in enumerate(trading_days):
        date_str = date.strftime('%Y-%m-%d')
        print(f"  添加日期: {date_str}")
        
        for code, name in ETF_LIST:
            base_val = BASE_VALUES[code]
            variation = random.uniform(-0.03, 0.03)
            vol = base_val * (1 + i * 0.005 + variation)
            
            try:
                cursor.execute('''
                    INSERT OR REPLACE INTO etf_data (stat_date, sec_code, sec_name, tot_vol)
                    VALUES (?, ?, ?, ?)
                ''', (date_str, code, name, round(vol, 2)))
            except Exception as e:
                print(f"    错误 {code}: {e}")
    
    conn.commit()
    
    print("\n验证数据:")
    cursor.execute('SELECT DISTINCT stat_date FROM etf_data ORDER BY stat_date DESC')
    dates = cursor.fetchall()
    print(f"总交易日数: {len(dates)}")
    print("日期列表:")
    for d in dates:
        print(f"  {d[0]}")
    
    conn.close()
    print("\n测试数据生成完成!")

if __name__ == '__main__':
    generate_test_data()
