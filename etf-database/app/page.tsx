'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ETFData {
  stat_date: string;
  sec_code: string;
  sec_name: string;
  tot_vol: number;
}

const ETF_COLORS: Record<string, string> = {
  '510050': '#FF6B6B',
  '510300': '#4ECDC4',
  '588000': '#45B7D1',
  '159949': '#96CEB4',
  '510500': '#FFEAA7'
};

export default function Home() {
  const [data, setData] = useState<ETFData[]>([]);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showPercentage, setShowPercentage] = useState(false);
  const [activeTab, setActiveTab] = useState('shares'); // 'shares' 或 'components'
  const [selectedETF, setSelectedETF] = useState<string>('');
  const [components, setComponents] = useState<any[]>([]);
  const [componentLoading, setComponentLoading] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<string>('');
  const [chartType, setChartType] = useState('day'); // 'day', 'month', 'year'
  const [chartData, setChartData] = useState<any>(null);
  const [chartLoading, setChartLoading] = useState(false);

  const fetchData = async (useLimit = true) => {
    setLoading(true);
    try {
      let url = '/api/etf-data';
      const params = new URLSearchParams();
      
      if (startDate && endDate) {
        params.append('startDate', startDate);
        params.append('endDate', endDate);
      } else if (useLimit) {
        params.append('limit', '10');
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      console.log('Fetching URL:', url);
      const response = await fetch(url);
      const result = await response.json();
      console.log('Fetched data:', result);
      setData(result);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = () => {
    fetchData(false);
  };

  const handleReset = () => {
    setStartDate('');
    setEndDate('');
    fetchData(true);
  };

  const fetchETFComponents = async (etfCode: string) => {
    setComponentLoading(true);
    try {
      // 从API获取成分股数据
      const response = await fetch(`/api/etf-components?code=${etfCode}`);
      if (!response.ok) {
        throw new Error('Failed to fetch components');
      }
      const data = await response.json();
      setComponents(data);
      setSelectedETF(etfCode);
    } catch (error) {
      console.error('Error fetching ETF components:', error);
      // 出错时使用模拟数据
      const mockComponents = {
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
      setComponents(mockComponents[etfCode] || []);
      setSelectedETF(etfCode);
    } finally {
      setComponentLoading(false);
    }
  };

  const fetchStockChart = async (stockCode: string, type: string) => {
    setChartLoading(true);
    try {
      // 从API获取股票K线数据
      const response = await fetch(`/api/stock-chart?code=${stockCode}&type=${type}`);
      if (!response.ok) {
        throw new Error('Failed to fetch chart data');
      }
      const data = await response.json();
      setChartData(data);
      setSelectedComponent(stockCode);
      setChartType(type);
    } catch (error) {
      console.error('Error fetching stock chart:', error);
      // 出错时使用模拟数据
      setChartData({
        code: stockCode,
        name: '股票',
        type: type,
        data: Array(30).fill(0).map((_, i) => ({
          date: new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
          open: 100 + Math.random() * 10,
          close: 100 + Math.random() * 10,
          high: 105 + Math.random() * 5,
          low: 95 + Math.random() * 5,
          volume: Math.floor(Math.random() * 100000) + 10000
        }))
      });
    } finally {
      setChartLoading(false);
    }
  };

  const transformData = () => {
    const dateMap = new Map<string, any>();
    const etfNameMap = new Map<string, string>();
    const firstValueMap = new Map<string, number>();
    
    const sortedData = [...data].sort((a, b) => a.stat_date.localeCompare(b.stat_date));
    
    sortedData.forEach(item => {
      if (!dateMap.has(item.stat_date)) {
        dateMap.set(item.stat_date, { date: item.stat_date });
      }
      const dateData = dateMap.get(item.stat_date);
      dateData[item.sec_code] = item.tot_vol;
      
      if (!etfNameMap.has(item.sec_code)) {
        etfNameMap.set(item.sec_code, item.sec_name);
      }
      
      if (!firstValueMap.has(item.sec_code)) {
        firstValueMap.set(item.sec_code, item.tot_vol);
      }
    });

    const sortedDates = Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date));
    
    if (showPercentage) {
      sortedDates.forEach(dateData => {
        Object.keys(dateData).forEach(key => {
          if (key !== 'date' && firstValueMap.has(key)) {
            const firstVal = firstValueMap.get(key)!;
            const currentVal = dateData[key];
            dateData[key] = ((currentVal - firstVal) / firstVal) * 100;
          }
        });
      });
    }
    
    return { processedData: sortedDates, etfNameMap: Object.fromEntries(etfNameMap) };
  };

  const { processedData, etfNameMap } = transformData();
  const uniqueETFs = Array.from(new Set(data.map(d => d.sec_code))).sort();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
          <p className="text-sm font-semibold text-gray-700 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              <span className="font-medium">{etfNameMap[entry.name] || entry.name}: </span>
              <span>
                {showPercentage 
                  ? `${entry.value.toFixed(2)}%` 
                  : `${entry.value.toFixed(2)} 万份`
                }
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">ETF 数据中心</h1>
        <p className="text-gray-600 mb-6">跟踪ETF总份额变化趋势和成分股分析</p>

        {/* TAB 切换 */}
        <div className="flex space-x-1 mb-8">
          <button
            onClick={() => setActiveTab('shares')}
            className={`px-6 py-3 rounded-t-lg font-medium transition-colors ${
              activeTab === 'shares'
                ? 'bg-white text-blue-600 shadow-md'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            ETF 份额趋势
          </button>
          <button
            onClick={() => setActiveTab('components')}
            className={`px-6 py-3 rounded-t-lg font-medium transition-colors ${
              activeTab === 'components'
                ? 'bg-white text-blue-600 shadow-md'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            ETF 成分股分析
          </button>
        </div>

        {activeTab === 'shares' && (
          <>
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="flex flex-wrap gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">开始日期</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">结束日期</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  查询
                </button>
                <button
                  onClick={handleReset}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  重置
                </button>
                <div className="ml-auto">
                  <button
                    onClick={() => setShowPercentage(!showPercentage)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      showPercentage 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {showPercentage ? '显示百分比' : '显示原始值'}
                  </button>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-xl text-gray-500">加载中...</div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-6">
                {processedData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={500}>
                    <LineChart data={processedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#6b7280"
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        stroke="#6b7280"
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => showPercentage 
                          ? `${value.toFixed(1)}%` 
                          : `${(value / 10000).toFixed(0)}万`
                        }
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend 
                        wrapperStyle={{ paddingTop: '20px' }}
                      />
                      {uniqueETFs.map((code) => {
                        const name = etfNameMap[code] || code;
                        return (
                          <Line
                            key={code}
                            type="monotone"
                            dataKey={code}
                            name={name}
                            stroke={ETF_COLORS[code] || '#8884d8'}
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            activeDot={{ r: 5 }}
                          />
                        );
                      })}
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-96 text-gray-500">
                    暂无数据
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">跟踪的ETF列表</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { code: '510050', name: '上证50ETF华夏' },
                  { code: '510300', name: '沪深300ETF华泰柏瑞' },
                  { code: '588000', name: '科创50ETF华夏' },
                  { code: '159949', name: '创业板50ETF' },
                  { code: '510500', name: '中证500ETF南方' }
                ].map((etf) => (
                  <div 
                    key={etf.code}
                    className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg"
                  >
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: ETF_COLORS[etf.code] || '#8884d8' }}
                    />
                    <div>
                      <div className="font-medium text-gray-800">{etf.code}</div>
                      <div className="text-sm text-gray-500">{etf.name}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'components' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">ETF 成分股分析</h2>
            
            {/* ETF 选择 */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-700 mb-4">选择ETF</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                  { code: '510050', name: '上证50ETF华夏' },
                  { code: '510300', name: '沪深300ETF华泰柏瑞' },
                  { code: '588000', name: '科创50ETF华夏' },
                  { code: '159949', name: '创业板50ETF' },
                  { code: '510500', name: '中证500ETF南方' }
                ].map((etf) => (
                  <button
                    key={etf.code}
                    onClick={() => fetchETFComponents(etf.code)}
                    className={`p-4 rounded-lg font-medium transition-colors ${
                      selectedETF === etf.code
                        ? 'bg-blue-100 text-blue-700 border border-blue-300'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="text-sm text-gray-500">{etf.code}</div>
                    <div className="font-medium">{etf.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 成分股列表 */}
            {selectedETF && (
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-700 mb-4">
                  {selectedETF} 成分股
                </h3>
                {componentLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-gray-500">加载中...</div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            股票代码
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            股票名称
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            权重 (%)
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            操作
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {components.map((component, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {component.code}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {component.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {component.weight}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <button
                                onClick={() => fetchStockChart(component.code, 'day')}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                查看K线
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* 股票K线 */}
            {selectedComponent && (
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-4">
                  股票K线 - {selectedComponent}
                </h3>
                <div className="flex space-x-2 mb-4">
                  <button
                    onClick={() => selectedComponent && fetchStockChart(selectedComponent, 'day')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      chartType === 'day'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    日K
                  </button>
                  <button
                    onClick={() => selectedComponent && fetchStockChart(selectedComponent, 'month')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      chartType === 'month'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    月K
                  </button>
                  <button
                    onClick={() => selectedComponent && fetchStockChart(selectedComponent, 'year')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      chartType === 'year'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    年K
                  </button>
                </div>
                <div className="bg-gray-50 rounded-lg p-6">
                  {chartLoading ? (
                    <div className="flex items-center justify-center h-80">
                      <div className="text-gray-500">加载中...</div>
                    </div>
                  ) : chartData ? (
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={chartData.data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="date" 
                          stroke="#6b7280"
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis 
                          stroke="#6b7280"
                          tick={{ fontSize: 12 }}
                        />
                        <Tooltip 
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-white p-3 border border-gray-200 rounded shadow">
                                  <p className="font-medium">{label}</p>
                                  <p>开盘: {data.open}</p>
                                  <p>收盘: {data.close}</p>
                                  <p>最高: {data.high}</p>
                                  <p>最低: {data.low}</p>
                                  <p>成交量: {data.volume}</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="close"
                          name="收盘价"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          dot={{ r: 2 }}
                          activeDot={{ r: 4 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="high"
                          name="最高价"
                          stroke="#10b981"
                          strokeWidth={1}
                          dot={false}
                        />
                        <Line
                          type="monotone"
                          dataKey="low"
                          name="最低价"
                          stroke="#ef4444"
                          strokeWidth={1}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-80">
                      <div className="text-gray-500">暂无数据</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
