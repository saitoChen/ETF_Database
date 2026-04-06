import etf_spider
from datetime import datetime, timedelta

# 测试上交所API的历史数据范围
test_dates = [
    '2026-03-01',
    '2026-02-28',
    '2026-02-01',
    '2026-01-01',
    '2025-12-01',
    '2025-11-01',
    '2025-10-01',
    '2025-09-01',
    '2025-08-01',
    '2025-07-01',
]

print("测试上交所API的历史数据范围...\n")

earliest_date = None

for date_str in test_dates:
    data = etf_spider.get_etf_data_by_date(date_str)
    if data:
        print(f"✓ {date_str}: 有数据 ({len(data)} 条)")
        earliest_date = date_str
    else:
        print(f"✗ {date_str}: 无数据")

print(f"\nAPI可提供的最早数据日期: {earliest_date}")

if earliest_date:
    print(f"\n正在获取从 {earliest_date} 开始的所有数据...")
