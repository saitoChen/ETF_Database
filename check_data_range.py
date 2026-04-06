import sqlite3

DB_FILE = 'etf_data.db'

conn = sqlite3.connect(DB_FILE)
cursor = conn.cursor()

print("=== 数据库中的数据范围 ===")
cursor.execute('SELECT MIN(stat_date), MAX(stat_date) FROM etf_data')
result = cursor.fetchone()
print(f"最早日期: {result[0]}")
print(f"最晚日期: {result[1]}")

print("\n=== 所有交易日 ===")
cursor.execute('SELECT DISTINCT stat_date FROM etf_data ORDER BY stat_date')
dates = cursor.fetchall()
print(f"共 {len(dates)} 个交易日:")
for d in dates:
    print(f"  {d[0]}")

conn.close()
