import sqlite3

DB_FILE = 'etf_data.db'

conn = sqlite3.connect(DB_FILE)
cursor = conn.cursor()

print("=== 验证2026-03-31的数据 ===")
cursor.execute('SELECT stat_date, sec_code, sec_name, tot_vol FROM etf_data WHERE stat_date = ?', ('2026-03-31',))
rows = cursor.fetchall()

for row in rows:
    print(f"\n日期: {row[0]}")
    print(f"代码: {row[1]}")
    print(f"名称: {row[2]}")
    print(f"份额: {row[3]}")
    if row[1] == '510050':
        print(f"✓ 510050 数据正确: {row[3]} == 2302266.68 ? {row[3] == 2302266.68}")
    if row[1] == '510300':
        print(f"✓ 510300 数据正确: {row[3]} == 4482858.77 ? {row[3] == 4482858.77}")

print("\n=== 所有交易日 ===")
cursor.execute('SELECT DISTINCT stat_date FROM etf_data ORDER BY stat_date DESC')
dates = cursor.fetchall()
print(f"共 {len(dates)} 个交易日:")
for d in dates:
    print(f"  {d[0]}")

conn.close()
