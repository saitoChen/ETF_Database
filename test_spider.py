import etf_spider
import datetime

# 测试最近5天的数据
end_date = datetime.date.today()
start_date = end_date - datetime.timedelta(days=5)

print(f"Testing from {start_date} to {end_date}")

etf_spider.START_DATE = start_date.strftime('%Y-%m-%d')
etf_spider.fetch_historical_data()

# 查看数据库中的数据
data = etf_spider.get_data_from_db()
print(f"\nTotal records in DB: {len(data)}")
print("\nSample data:")
for item in data[:10]:
    print(f"{item['stat_date']} {item['sec_code']} {item['sec_name']} {item['tot_vol']}")
