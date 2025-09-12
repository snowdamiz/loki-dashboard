import React from 'react'
import { cn } from '../../lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  iconColor?: string
  valueColor?: string
  trend?: {
    value: number
    label: string
  }
  isFetching?: boolean
  className?: string
}

export default function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-purple-400',
  valueColor = 'text-white',
  trend,
  isFetching,
  className
}: MetricCardProps) {
  return (
    <Card className={cn(
      "relative rounded-xl border border-gray-800 bg-gray-900/30 backdrop-blur-sm",
      className
    )}>
      {isFetching && (
        <div className="absolute top-2 right-2 z-10">
          <div className="w-2 h-2 bg-gray-500 rounded-full animate-ping"></div>
        </div>
      )}
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          {title}
        </CardTitle>
        <div className="p-2 bg-gray-800/50 rounded-lg">
          <Icon className={cn("h-4 w-4", iconColor)} />
        </div>
      </CardHeader>
      <CardContent>
        <div className={cn("text-3xl font-bold", valueColor)}>
          {value}
        </div>
        {(subtitle || trend) && (
          <div className="flex items-center justify-between mt-2">
            {subtitle && (
              <p className="text-xs text-gray-500">{subtitle}</p>
            )}
            {trend && (
              <span className={cn(
                "text-xs font-medium",
                trend.value >= 0 ? "text-green-400" : "text-red-400"
              )}>
                {trend.value >= 0 ? "+" : ""}{trend.value}% {trend.label}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}