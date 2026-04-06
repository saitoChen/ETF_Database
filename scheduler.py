import time
import schedule
import subprocess
import os
from datetime import datetime

def run_spider():
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] 开始爬取今天的数据...")
    script_path = os.path.join(os.path.dirname(__file__), 'etf_spider.py')
    result = subprocess.run(['python3', script_path, 'today'], capture_output=True, text=True)
    print(result.stdout)
    if result.stderr:
        print(f"错误: {result.stderr}")
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] 爬取完成")

def main():
    print("ETF数据爬虫定时任务已启动")
    print("每天20:00自动爬取数据")
    print("按 Ctrl+C 停止\n")
    
    schedule.every().day.at("20:00").do(run_spider)
    
    while True:
        schedule.run_pending()
        time.sleep(60)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n定时任务已停止")
