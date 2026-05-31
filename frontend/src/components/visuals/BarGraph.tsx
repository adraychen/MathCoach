interface BarGraphProps {
  spec: {
    title?: string
    x_labels: string[]
    values: number[]
    y_axis_label?: string
    y_scale?: number[]
  }
}

export function BarGraph({ spec }: BarGraphProps) {
  const { title, x_labels, values, y_axis_label } = spec

  // Chart dimensions
  const width = 400
  const height = 250
  const padding = { top: 30, right: 20, bottom: 50, left: 50 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  // Calculate scales
  const maxValue = Math.max(...values) * 1.1
  const barWidth = chartWidth / values.length * 0.7
  const barGap = chartWidth / values.length * 0.3

  // Y-axis ticks
  const yTicks = 5
  const yTickValues = Array.from({ length: yTicks + 1 }, (_, i) =>
    Math.round((maxValue / yTicks) * i)
  )

  return (
    <div className="flex flex-col items-center">
      {title && (
        <div className="text-sm font-medium mb-2">{title}</div>
      )}
      <svg width={width} height={height} className="bg-white rounded border">
        {/* Y-axis */}
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={height - padding.bottom}
          stroke="#374151"
          strokeWidth={1}
        />

        {/* X-axis */}
        <line
          x1={padding.left}
          y1={height - padding.bottom}
          x2={width - padding.right}
          y2={height - padding.bottom}
          stroke="#374151"
          strokeWidth={1}
        />

        {/* Y-axis label */}
        {y_axis_label && (
          <text
            x={15}
            y={height / 2}
            transform={`rotate(-90, 15, ${height / 2})`}
            textAnchor="middle"
            className="text-xs fill-gray-600"
          >
            {y_axis_label}
          </text>
        )}

        {/* Y-axis ticks and grid lines */}
        {yTickValues.map((tick, i) => {
          const y = height - padding.bottom - (tick / maxValue) * chartHeight
          return (
            <g key={i}>
              <line
                x1={padding.left - 5}
                y1={y}
                x2={padding.left}
                y2={y}
                stroke="#374151"
                strokeWidth={1}
              />
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth={1}
                strokeDasharray="3,3"
              />
              <text
                x={padding.left - 8}
                y={y + 4}
                textAnchor="end"
                className="text-xs fill-gray-600"
              >
                {tick}
              </text>
            </g>
          )
        })}

        {/* Bars */}
        {values.map((value, i) => {
          const barHeight = (value / maxValue) * chartHeight
          const x = padding.left + i * (barWidth + barGap) + barGap / 2
          const y = height - padding.bottom - barHeight

          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill="#3b82f6"
                rx={2}
              />
              {/* Value label on top of bar */}
              <text
                x={x + barWidth / 2}
                y={y - 5}
                textAnchor="middle"
                className="text-xs fill-gray-700 font-medium"
              >
                {value}
              </text>
              {/* X-axis label */}
              <text
                x={x + barWidth / 2}
                y={height - padding.bottom + 15}
                textAnchor="middle"
                className="text-xs fill-gray-600"
              >
                {x_labels[i]?.length > 8 ? x_labels[i].slice(0, 7) + '...' : x_labels[i]}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
