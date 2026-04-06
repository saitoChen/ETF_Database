import etf_spider

print("Updating ETF names in database...")
etf_spider.get_etf_full_names()
etf_spider.update_existing_names()

print("\nUpdated ETF names:")
for code, name in etf_spider.ETF_FULL_NAMES.items():
    print(f"  {code}: {name}")

# 查看更新后的数据
data = etf_spider.get_data_from_db()
print(f"\nTotal records: {len(data)}")
print("\nSample data:")
for item in data[:10]:
    print(f"  {item['stat_date']} {item['sec_code']} {item['sec_name']} {item['tot_vol']}")
