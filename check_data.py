import sqlite3

DB_FILE = 'etf_data.db'

conn = sqlite3.connect(DB_FILE)
cursor = conn.cursor()

print("=== 数据库中的所有数据 ===")
cursor.execute('SELECT stat_date, sec_code, sec_name, tot_vol FROM etf_data ORDER BY stat_date DESC')
rows = cursor.fetchall()
print(f"总记录数: {len(rows)}")
print("\n数据:")
for row in rows:
    print(f"{row[0]} {row[1]} {row[2]} {row[3]}")

print("\n=== 不同的交易日 ===")
cursor.execute('SELECT DISTINCT stat_date FROM etf_data ORDER BY stat_date DESC')
dates = cursor.fetchall()
print(f"交易日数: {len(dates)}")
for d in dates:
    print(d[0])

conn.close()
