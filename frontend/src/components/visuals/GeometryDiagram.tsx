interface Point {
  x: number
  y: number
  label?: string
}

interface Shape {
  type: 'triangle' | 'line' | 'polygon'
  points: Point[]
  properties?: Record<string, string>
}

interface AngleMarker {
  vertex?: string
  points?: string[]
  label?: string
  measure?: number | string
}

interface GeometryDiagramProps {
  spec: {
    description?: string
    shapes?: Shape[] | string[]
    labels?: string[] | Record<string, string>
    angles?: AngleMarker[]
  }
}

export function GeometryDiagram({ spec }: GeometryDiagramProps) {
  const { description, shapes, angles } = spec

  // Check if we have coordinate-based shapes
  const hasCoordinateShapes = shapes && shapes.length > 0 && typeof shapes[0] === 'object'

  if (!hasCoordinateShapes) {
    // Fallback: show description for non-coordinate specs
    return (
      <div className="p-4 bg-slate-50 rounded border text-center">
        <div className="text-sm text-slate-600 mb-2">Geometry Diagram</div>
        <div className="text-sm">{description || 'Diagram not available'}</div>
        {angles && angles.length > 0 && (
          <div className="mt-2 text-xs text-slate-500">
            Angles: {angles.map((a, i) => (
              <span key={i} className="mr-2">
                {a.vertex || a.points?.join('')}: {a.measure}°
              </span>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Parse coordinate-based shapes
  const coordinateShapes = shapes as Shape[]

  // Collect all points from shapes
  const allPoints: Point[] = []
  coordinateShapes.forEach(shape => {
    shape.points?.forEach(p => {
      if (p.x !== undefined && p.y !== undefined) {
        allPoints.push(p)
      }
    })
  })

  if (allPoints.length === 0) {
    return (
      <div className="p-4 bg-slate-50 rounded border text-center">
        <div className="text-sm text-slate-600">{description || 'Diagram not available'}</div>
      </div>
    )
  }

  // Calculate bounds
  const xs = allPoints.map(p => p.x)
  const ys = allPoints.map(p => p.y)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)

  // SVG dimensions and padding
  const width = 300
  const height = 250
  const padding = 40

  // Scale to fit
  const rangeX = maxX - minX || 1
  const rangeY = maxY - minY || 1
  const scale = Math.min(
    (width - 2 * padding) / rangeX,
    (height - 2 * padding) / rangeY
  )

  // Transform function: flip Y axis (SVG has Y going down)
  const transformX = (x: number) => padding + (x - minX) * scale
  const transformY = (y: number) => height - padding - (y - minY) * scale

  // Build a map of labels to points for angle rendering
  const labelToPoint: Record<string, Point> = {}
  allPoints.forEach(p => {
    if (p.label) {
      labelToPoint[p.label] = p
    }
  })

  // Render angle arc
  const renderAngleArc = (angle: AngleMarker, index: number) => {
    // Try to get angle vertex from various formats
    let vertexLabel = angle.vertex
    let measure = angle.measure

    if (angle.points && angle.points.length >= 3) {
      // Format: ["B", "A", "C"] means angle at A
      vertexLabel = angle.points[1]
    }

    if (!vertexLabel || !labelToPoint[vertexLabel]) return null

    const vertex = labelToPoint[vertexLabel]
    const vx = transformX(vertex.x)
    const vy = transformY(vertex.y)

    // Simple angle arc indicator
    const arcRadius = 20

    return (
      <g key={`angle-${index}`}>
        <circle
          cx={vx}
          cy={vy}
          r={arcRadius}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={1.5}
          strokeDasharray="3,2"
          opacity={0.6}
        />
        {measure && (
          <text
            x={vx}
            y={vy - arcRadius - 5}
            textAnchor="middle"
            className="text-xs fill-blue-600 font-medium"
          >
            {typeof measure === 'number' ? `${measure}°` : measure}
          </text>
        )}
      </g>
    )
  }

  return (
    <div className="flex flex-col items-center">
      <svg width={width} height={height} className="bg-white rounded border">
        {/* Render shapes */}
        {coordinateShapes.map((shape, shapeIndex) => {
          const points = shape.points || []

          if (shape.type === 'triangle' || shape.type === 'polygon' || points.length >= 3) {
            // Render as closed polygon
            const pathPoints = points
              .map(p => `${transformX(p.x)},${transformY(p.y)}`)
              .join(' ')

            return (
              <g key={`shape-${shapeIndex}`}>
                <polygon
                  points={pathPoints}
                  fill="#f0f9ff"
                  stroke="#1e40af"
                  strokeWidth={2}
                />
              </g>
            )
          } else if (shape.type === 'line' || points.length === 2) {
            // Render as line
            const [p1, p2] = points
            return (
              <line
                key={`shape-${shapeIndex}`}
                x1={transformX(p1.x)}
                y1={transformY(p1.y)}
                x2={transformX(p2.x)}
                y2={transformY(p2.y)}
                stroke="#1e40af"
                strokeWidth={2}
              />
            )
          }

          return null
        })}

        {/* Render angle arcs */}
        {angles?.map((angle, i) => renderAngleArc(angle, i))}

        {/* Render point labels */}
        {allPoints.map((point, i) => {
          if (!point.label) return null

          const x = transformX(point.x)
          const y = transformY(point.y)

          // Offset label based on position relative to center
          const centerX = (transformX(minX) + transformX(maxX)) / 2
          const centerY = (transformY(minY) + transformY(maxY)) / 2
          const offsetX = x < centerX ? -12 : x > centerX ? 12 : 0
          const offsetY = y < centerY ? -12 : y > centerY ? 12 : -12

          return (
            <g key={`point-${i}`}>
              {/* Point dot */}
              <circle
                cx={x}
                cy={y}
                r={4}
                fill="#1e40af"
              />
              {/* Label */}
              <text
                x={x + offsetX}
                y={y + offsetY}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-sm fill-slate-800 font-semibold"
              >
                {point.label}
              </text>
            </g>
          )
        })}
      </svg>

      {/* Description below diagram */}
      {description && (
        <div className="text-xs text-slate-500 mt-2 max-w-[300px] text-center">
          {description}
        </div>
      )}
    </div>
  )
}
