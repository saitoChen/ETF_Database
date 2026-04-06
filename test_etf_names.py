import requests
import re
import json

url = "https://query.sse.com.cn/security/stock/queryExpandName.do"
params = {
    "jsonCallBack": "jsonpCallback",
    "secCodes": "510050,510300,588000,159949,510500"
}

headers = {
    'Referer': 'https://www.sse.com.cn/',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
}

response = requests.get(url, params=params, headers=headers)

jsonp_text = response.text
json_text = re.sub(r'^jsonpCallback\((.*)\)$', r'\1', jsonp_text)
data = json.loads(json_text)

print(json.dumps(data, indent=2, ensure_ascii=False))
