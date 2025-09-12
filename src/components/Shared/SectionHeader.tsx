import React from 'react'
import { cn } from '../../lib/utils'

interface SectionHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
  className?: string
}

export default function SectionHeader({ 
  title, 
  subtitle, 
  action, 
  className 
}: SectionHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between mb-4", className)}>
      <div>
        <h2 className="text-lg font-semibold text-white">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-gray-500 mt-1">
            {subtitle}
          </p>
        )}
      </div>
      {action && (
        <div className="flex items-center space-x-2">
          {action}
        </div>
      )}
    </div>
  )
}