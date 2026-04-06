import requests
import re
import json
import sqlite3
import datetime
from datetime import timedelta
import time
import os

# 配置
ETF_CODES = ['510050', '510300', '588000', '159949', '510500']
START_DATE = '2025-08-01'
DB_FILE = 'etf_data.db'

# API配置
API_URL = 'https://query.sse.com.cn/commonQuery.do'
NAME_API_URL = 'https://query.sse.com.cn/security/stock/queryExpandName.do'
HEADERS = {
    'Referer': 'https://www.sse.com.cn/',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

# ETF完整名称映射
ETF_FULL_NAMES = {
    '510050': '上证50ETF华夏',
    '510300': '沪深300ETF华泰柏瑞',
    '588000': '科创50ETF华夏',
    '159949': '创业板50ETF',
    '510500': '中证500ETF南方'
}

def get_etf_full_names():
    try:
        params = {
            'jsonCallBack': 'jsonpCallback',
            'secCodes': ','.join(ETF_CODES)
        }
        response = requests.get(NAME_API_URL, params=params, headers=HEADERS, timeout=30)
        response.raise_for_status()
        
        jsonp_text = response.text
        json_text = re.sub(r'^jsonpCallback\((.*)\)$', r'\1', jsonp_text)
        data = json.loads(json_text)
        
        if data.get('result'):
            for item in data['result']:
                if len(item) >= 2:
                    ETF_FULL_NAMES[item[0]] = item[1]
    except Exception as e:
        print(f"Error fetching ETF names: {e}")

def init_db():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS etf_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            stat_date TEXT NOT NULL,
            sec_code TEXT NOT NULL,
            sec_name TEXT NOT NULL,
            tot_vol REAL NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(stat_date, sec_code)
        )
    ''')
    conn.commit()
    conn.close()

def get_etf_data_by_date(date_str):
    params = {
        'jsonCallBack': 'jsonpCallback',
        'isPagination': 'true',
        'pageHelp.pageSize': '1000',
        'pageHelp.pageNo': '1',
        'pageHelp.beginPage': '1',
        'pageHelp.cacheSize': '1',
        'pageHelp.endPage': '10',
        'sqlId': 'COMMON_SSE_ZQPZ_ETFZL_XXPL_ETFGM_SEARCH_L',
        'STAT_DATE': date_str
    }
    
    try:
        response = requests.get(API_URL, params=params, headers=HEADERS, timeout=30)
        response.raise_for_status()
        
        jsonp_text = response.text
        json_text = re.sub(r'^jsonpCallback\((.*)\)$', r'\1', jsonp_text)
        data = json.loads(json_text)
        
        result = []
        if data.get('pageHelp', {}).get('data'):
            for item in data['pageHelp']['data']:
                if item['SEC_CODE'] in ETF_CODES:
                    result.append({
                        'stat_date': item['STAT_DATE'],
                        'sec_code': item['SEC_CODE'],
                        'sec_name': ETF_FULL_NAMES.get(item['SEC_CODE'], item['SEC_NAME']),
                        'tot_vol': float(item['TOT_VOL'])
                    })
        return result
    except Exception as e:
        print(f"Error fetching data for {date_str}: {e}")
        return []

def save_data_to_db(data_list):
    if not data_list:
        return
    
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    for data in data_list:
        try:
            cursor.execute('''
                INSERT OR REPLACE INTO etf_data (stat_date, sec_code, sec_name, tot_vol)
                VALUES (?, ?, ?, ?)
            ''', (data['stat_date'], data['sec_code'], data['sec_name'], data['tot_vol']))
        except Exception as e:
            print(f"Error saving data: {e}")
    
    conn.commit()
    conn.close()
    print(f"Saved {len(data_list)} records to database")

def is_trading_day(date_str):
    data = get_etf_data_by_date(date_str)
    return len(data) > 0

def get_latest_date_in_db():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute('SELECT MAX(stat_date) FROM etf_data')
    result = cursor.fetchone()
    conn.close()
    return result[0] if result[0] else None

def update_existing_names():
    init_db()
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    for code, name in ETF_FULL_NAMES.items():
        cursor.execute('''
            UPDATE etf_data 
            SET sec_name = ? 
            WHERE sec_code = ?
        ''', (name, code))
    
    conn.commit()
    conn.close()
    print("Updated existing ETF names in database")

def fetch_historical_data():
    init_db()
    get_etf_full_names()
    
    start_date = datetime.datetime.strptime(START_DATE, '%Y-%m-%d').date()
    latest_date = get_latest_date_in_db()
    
    if latest_date:
        latest_date_obj = datetime.datetime.strptime(latest_date, '%Y-%m-%d').date()
        if latest_date_obj >= start_date:
            start_date = latest_date_obj + timedelta(days=1)
    
    end_date = datetime.date.today()
    current_date = start_date
    
    print(f"Fetching data from {current_date} to {end_date}")
    
    while current_date <= end_date:
        date_str = current_date.strftime('%Y-%m-%d')
        print(f"Checking {date_str}...")
        
        data = get_etf_data_by_date(date_str)
        
        if data:
            print(f"Found {len(data)} records for {date_str}")
            save_data_to_db(data)
        else:
            print(f"No data for {date_str}")
        
        current_date += timedelta(days=1)
        time.sleep(0.5)
    
    update_existing_names()

def fetch_today_data():
    init_db()
    get_etf_full_names()
    today = datetime.date.today().strftime('%Y-%m-%d')
    print(f"Fetching data for {today}...")
    
    data = get_etf_data_by_date(today)
    
    if data:
        print(f"Found {len(data)} records for {today}")
        save_data_to_db(data)
    else:
        print(f"No data for {today}")
    
    update_existing_names()

def get_data_from_db(start_date=None, end_date=None):
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    query = 'SELECT stat_date, sec_code, sec_name, tot_vol FROM etf_data'
    params = []
    
    if start_date and end_date:
        query += ' WHERE stat_date BETWEEN ? AND ?'
        params.extend([start_date, end_date])
    elif start_date:
        query += ' WHERE stat_date >= ?'
        params.append(start_date)
    elif end_date:
        query += ' WHERE stat_date <= ?'
        params.append(end_date)
    
    query += ' ORDER BY stat_date DESC, sec_code'
    
    cursor.execute(query, params)
    results = cursor.fetchall()
    conn.close()
    
    data_list = []
    for row in results:
        data_list.append({
            'stat_date': row[0],
            'sec_code': row[1],
            'sec_name': row[2],
            'tot_vol': row[3]
        })
    
    return data_list

if __name__ == '__main__':
    import sys
    
    if len(sys.argv) > 1:
        if sys.argv[1] == 'historical':
            fetch_historical_data()
        elif sys.argv[1] == 'today':
            fetch_today_data()
        else:
            print("Usage: python3 etf_spider.py [historical|today]")
    else:
        fetch_historical_data()
