import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const stockCode = searchParams.get('code');
    const type = searchParams.get('type') || 'day'; // day, week, month

    if (!stockCode) {
      return NextResponse.json({ error: 'Stock code is required' }, { status: 400 });
    }

    // 构建API请求URL - 使用新浪财经的API
    let apiUrl = '';
    let period = '';

    switch (type) {
      case 'day':
        period = 'day';
        break;
      case 'week':
        period = 'week';
        break;
      case 'month':
        period = 'month';
        break;
      default:
        period = 'day';
    }

    // 构建股票代码 - 新浪财经的格式
    let sinaCode = stockCode;
    if (stockCode.startsWith('6')) {
      sinaCode = `sh${stockCode}`; // 上海股票
    } else {
      sinaCode = `sz${stockCode}`; // 深圳股票
    }

    // 新浪财经API
    apiUrl = `https://hq.sinajs.cn/list=${sinaCode}`;

    const response = await fetch(apiUrl);
    const data = await response.text();

    // 解析新浪财经的数据
    // 示例数据格式: var hq_str_sh600519="贵州茅台,1600.00,1599.00,1601.00,1602.00,1598.00,1600.00,1601.00,100,160000,160000000";
    const match = data.match(/var hq_str_\w+="([^"]+)"/);
    if (!match) {
      // 如果新浪API失败，返回模拟数据
      return NextResponse.json(getMockChartData(stockCode, type));
    }

    const stockInfo = match[1].split(',');
    const name = stockInfo[0];
    const price = parseFloat(stockInfo[1]);

    // 生成模拟的K线数据
    const chartData = getMockChartData(stockCode, type, name, price);

    return NextResponse.json(chartData);
  } catch (error) {
    console.error('Error fetching stock chart:', error);
    // 出错时返回模拟数据
    const { searchParams } = new URL(request.url);
    const stockCode = searchParams.get('code') || '';
    const type = searchParams.get('type') || 'day';
    return NextResponse.json(getMockChartData(stockCode, type));
  }
}

// 生成模拟K线数据
function getMockChartData(stockCode: string, type: string, name = '股票', price = 100) {
  const data = [];
  const now = new Date();
  let days = 30;

  switch (type) {
    case 'day':
      days = 30;
      break;
    case 'week':
      days = 12 * 7; // 12周
      break;
    case 'month':
      days = 12 * 30; // 12个月
      break;
  }

  let basePrice = price * 0.9;
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // 生成随机价格波动
    const change = (Math.random() - 0.5) * 2;
    basePrice = Math.max(price * 0.8, basePrice * (1 + change / 100));
    
    const open = basePrice * (1 + (Math.random() - 0.5) * 0.01);
    const close = basePrice;
    const high = Math.max(open, close) * (1 + Math.random() * 0.01);
    const low = Math.min(open, close) * (1 - Math.random() * 0.01);
    const volume = Math.floor(Math.random() * 100000) + 10000;

    data.push({
      date: date.toISOString().split('T')[0],
      open: parseFloat(open.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      volume
    });
  }

  return {
    code: stockCode,
    name,
    type,
    data
  };
}
