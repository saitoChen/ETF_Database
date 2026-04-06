import requests
import re
import json

# 测试API - 查询单个ETF的历史数据
def test_single_etf_history():
    url = "https://query.sse.com.cn/commonQuery.do"
    
    # 需要找到查询单个ETF历史数据的API
    # 让我们先看看页面中的JavaScript代码
    # 我们尝试不同的sqlId
    
    # 测试查询ETF历史数据的API
    params = {
        "jsonCallBack": "jsonpCallback",
        "sqlId": "COMMON_SSE_ZQPZ_ETFZL_XXPL_ETFGM_SEARCH_L",
        "STAT_DATE": "",
        "SEC_CODE": "510050"
    }
    
    headers = {
        "Referer": "https://www.sse.com.cn/",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
    }
    
    response = requests.get(url, params=params, headers=headers)
    
    print("Testing single ETF query...")
    print("Status:", response.status_code)
    
    if response.status_code == 200:
        jsonp_text = response.text
        json_text = re.sub(r'^jsonpCallback\((.*)\)$', r'\1', jsonp_text)
        data = json.loads(json_text)
        
        print("\nResponse data:")
        print(json.dumps(data, indent=2, ensure_ascii=False))

# 测试不同的sqlId来找到历史数据查询接口
def test_different_sql_ids():
    url = "https://query.sse.com.cn/commonQuery.do"
    headers = {
        "Referer": "https://www.sse.com.cn/",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
    }
    
    # 可能的历史数据查询sqlId
    sql_ids = [
        "COMMON_SSE_ZQPZ_ETFZL_XXPL_ETFGM_SEARCH_L",
        "COMMON_SSE_ZQPZ_ETFZL_ETFGM_HISTORY_L",
        "COMMON_SSE_ZQPZ_ETFZL_ETFGM_HIS_L",
        "COMMON_SSE_ZQPZ_ETFZL_HISTORY_L"
    ]
    
    for sql_id in sql_ids:
        print(f"\nTesting sqlId: {sql_id}")
        params = {
            "jsonCallBack": "jsonpCallback",
            "sqlId": sql_id,
            "SEC_CODE": "510050",
            "pageHelp.pageSize": "100"
        }
        
        response = requests.get(url, params=params, headers=headers)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            jsonp_text = response.text
            json_text = re.sub(r'^jsonpCallback\((.*)\)$', r'\1', jsonp_text)
            try:
                data = json.loads(json_text)
                if data.get('pageHelp', {}).get('data'):
                    print(f"✓ Found data for sqlId: {sql_id}")
                    print(f"  Data count: {len(data['pageHelp']['data'])}")
                    return sql_id
            except:
                pass
    
    return None

if __name__ == "__main__":
    # 先测试不同的sqlId
    print("Finding correct sqlId for historical data...")
    correct_sql_id = test_different_sql_ids()
    
    if correct_sql_id:
        print(f"\nUsing sqlId: {correct_sql_id}")
    else:
        print("\nCould not find specific historical sqlId, using default...")
