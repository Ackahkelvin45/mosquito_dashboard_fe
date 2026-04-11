import React from 'react'

interface CardProps {
  title: string
  value: React.ReactNode
  icon: React.ReactNode
  bgColor: string
  description?: string
  valueSuffix?: string
  valueClassName?: string
}

function Card({
  title,
  value,
  icon,
  bgColor,
  description,
  valueSuffix,
  valueClassName = 'text-gray-800',
}: CardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 h-40   shadow-sm border flex flex-row justify-between  gap-2 border-gray-100 w-full">
      <div className="w-full flex h-full  justify-between items-stretch flex-col gap-1 min-w-0">
        <span className="text-sm font-raleway font-medium text-gray-600">{title}</span>
        <span className={`text-2xl font-mulish font-bold ${valueClassName}`}>
          {value}
          {valueSuffix && <span className="text-gray-600 font-normal"> {valueSuffix}</span>}
        </span>
        {description && (
          <span className="text-xs text-secondary  font-raleway mt-0.5">{description}</span>
        )}
      </div>
      <div className="shrink-0">
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: bgColor }}
        >
          {icon}
        </div>
      </div>
    </div>
  )
}

export default Card
