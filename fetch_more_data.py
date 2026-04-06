import etf_spider

print("从2025年8月开始爬取历史数据...")
etf_spider.START_DATE = '2025-08-01'
etf_spider.fetch_historical_data()

print("\n完成！")
