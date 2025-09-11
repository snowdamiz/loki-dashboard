import React from 'react'
import { TrendingUp } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { formatSOL } from '../lib/utils'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface PerformanceChartProps {
  chartData: any
  chartFetching: boolean
  isFirstLoad: boolean
}

export default function PerformanceChart({ chartData, chartFetching, isFirstLoad }: PerformanceChartProps) {
  // Format chart data
  const formattedChartData = React.useMemo(() => {
    if (!chartData || typeof chartData !== 'object') return []
    
    // Filter out non-date keys and sort by date
    const entries = Object.entries(chartData)
      .filter(([key]) => {
        // Check if the key looks like a date (YYYY-MM-DD format)
        return /^\d{4}-\d{2}-\d{2}$/.test(key)
      })
      .sort(([a], [b]) => a.localeCompare(b))
    
    return entries.map(([date, data]: [string, any]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      profit: data.profit || 0,
      loss: -(data.loss || 0),
      net: (data.profit || 0) - (data.loss || 0),
      trades: data.trades || 0,
      buys: data.buys || 0,
      sells: data.sells || 0
    }))
  }, [chartData])

  return (
    <Card className="relative rounded-xl border border-gray-800 bg-gray-900/30 backdrop-blur-sm">
      {chartFetching && !isFirstLoad && (
        <div className="absolute top-4 right-4 z-10">
          <div className="w-2 h-2 bg-gray-500 rounded-full animate-ping"></div>
        </div>
      )}
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-white mb-1">Performance Overview</CardTitle>
            <CardDescription className="text-sm text-gray-500">Daily profit/loss trends</CardDescription>
          </div>
          {formattedChartData.length > 0 && (
            <div className="text-right">
              <p className="text-2xl font-bold text-white">
                {formatSOL(formattedChartData.reduce((sum, d) => sum + d.net, 0))}
              </p>
              <p className="text-xs text-gray-500">Last 7 days</p>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pl-2">
        {formattedChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={formattedChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorLoss" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis 
                dataKey="date" 
                stroke="#9ca3af" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#9ca3af" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value} SOL`}
              />
              <Tooltip 
                formatter={(value: any) => formatSOL(value)}
                contentStyle={{ 
                  backgroundColor: 'rgba(0, 0, 0, 0.9)',
                  border: '1px solid rgba(31, 41, 55, 1)',
                  borderRadius: '8px',
                  backdropFilter: 'blur(10px)'
                }}
                labelStyle={{ color: '#9ca3af' }}
              />
              <Area 
                type="monotone" 
                dataKey="profit" 
                stackId="1"
                stroke="#10b981" 
                fillOpacity={1}
                fill="url(#colorProfit)"
              />
              <Area 
                type="monotone" 
                dataKey="loss" 
                stackId="1"
                stroke="#ef4444" 
                fillOpacity={1}
                fill="url(#colorLoss)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[350px] text-gray-500">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No chart data available</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Data will appear once trades are made</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
