import { NextResponse } from 'next/server';

// 模拟PCF文件数据 - 实际项目中应该从PCF文件解析
const ETF_COMPONENTS: Record<string, Array<{
  code: string;
  name: string;
  weight: number;
}>> = {
  '510050': [
    { code: '600519', name: '贵州茅台', weight: 14.23 },
    { code: '601318', name: '中国平安', weight: 9.87 },
    { code: '600036', name: '招商银行', weight: 8.56 },
    { code: '601166', name: '兴业银行', weight: 5.23 },
    { code: '600887', name: '伊利股份', weight: 4.78 }
  ],
  '510300': [
    { code: '600519', name: '贵州茅台', weight: 5.89 },
    { code: '601318', name: '中国平安', weight: 4.23 },
    { code: '600036', name: '招商银行', weight: 3.76 },
    { code: '000858', name: '五粮液', weight: 3.54 },
    { code: '601888', name: '中国中免', weight: 2.98 }
  ],
  '588000': [
    { code: '688981', name: '中芯国际', weight: 8.76 },
    { code: '688009', name: '中国通号', weight: 6.54 },
    { code: '688256', name: '寒武纪', weight: 5.23 },
    { code: '688012', name: '中微公司', weight: 4.89 },
    { code: '688999', name: '晶晨股份', weight: 4.12 }
  ],
  '159949': [
    { code: '300750', name: '宁德时代', weight: 15.67 },
    { code: '300059', name: '东方财富', weight: 8.92 },
    { code: '300124', name: '汇川技术', weight: 6.34 },
    { code: '300760', name: '迈瑞医疗', weight: 5.87 },
    { code: '300413', name: '芒果超媒', weight: 4.21 }
  ],
  '510500': [
    { code: '002415', name: '海康威视', weight: 3.45 },
    { code: '002594', name: '比亚迪', weight: 3.21 },
    { code: '002714', name: '牧原股份', weight: 2.89 },
    { code: '002230', name: '科大讯飞', weight: 2.67 },
    { code: '002841', name: '视源股份', weight: 2.45 }
  ]
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const etfCode = searchParams.get('code');

    if (!etfCode) {
      return NextResponse.json({ error: 'ETF code is required' }, { status: 400 });
    }

    const components = ETF_COMPONENTS[etfCode];

    if (!components) {
      return NextResponse.json({ error: 'ETF not found' }, { status: 404 });
    }

    return NextResponse.json(components);
  } catch (error) {
    console.error('Error fetching ETF components:', error);
    return NextResponse.json({ error: 'Failed to fetch components' }, { status: 500 });
  }
}
