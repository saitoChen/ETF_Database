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
    
    return { chartData: sortedDates, etfNameMap: Object.fromEntries(etfNameMap) };
  };

  const { chartData, etfNameMap } = transformData();
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
        <h1 className="text-4xl font-bold text-gray-800 mb-2">和汪汪队跳舞</h1>
        <p className="text-gray-600 mb-8">跟踪ETF总份额变化趋势</p>

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
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={500}>
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
      </div>
    </div>
  );
}
