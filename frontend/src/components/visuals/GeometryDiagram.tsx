interface GeometryDiagramProps {
  spec: {
    diagram_type?: string
    description?: string
    // Template parameters
    angle_a?: number | string
    angle_b?: number | string
    angle_c?: number | string
    exterior_angle?: number | string
    vertex_angle?: number | string
    base_angle?: number | string
    angle_1?: number | string
    angle_2?: number | string
    angle_abd?: number | string
    angle_dbc?: number | string
    angle_adb?: number | string
    target_angle?: string
    // Legacy coordinate-based
    shapes?: unknown[]
    labels?: unknown
    angles?: unknown[]
  }
}

export function GeometryDiagram({ spec }: GeometryDiagramProps) {
  const { diagram_type, description } = spec

  const width = 300
  const height = 220

  // Render based on diagram_type
  switch (diagram_type) {
    case 'triangle_angles':
      return renderTriangleAngles(spec, width, height)

    case 'triangle_exterior':
      return renderTriangleExterior(spec, width, height)

    case 'isosceles_triangle':
      return renderIsoscelesTriangle(spec, width, height)

    case 'intersecting_lines':
      return renderIntersectingLines(spec, width, height)

    case 'right_triangle_with_point':
      return renderRightTriangleWithPoint(spec, width, height)

    case 'right_angle_with_ray':
      return renderRightAngleWithRay(spec, width, height)

    default:
      // Fallback for description-based or unknown types
      return (
        <div className="p-4 bg-slate-50 rounded border text-center max-w-[300px]">
          <div className="text-sm text-slate-600 mb-2">Geometry Diagram</div>
          <div className="text-sm">{description || 'Diagram not available'}</div>
          {spec.angles && Array.isArray(spec.angles) && spec.angles.length > 0 && (
            <div className="mt-2 text-xs text-slate-500">
              {spec.angles.map((a: any, i: number) => (
                <span key={i} className="mr-2">
                  {a.vertex || a.label || ''}: {a.measure || a.value || ''}°
                </span>
              ))}
            </div>
          )}
        </div>
      )
  }
}

// Triangle with labeled interior angles
function renderTriangleAngles(spec: GeometryDiagramProps['spec'], width: number, height: number) {
  const { angle_a, angle_b, angle_c, target_angle } = spec

  // Triangle vertices
  const A = { x: 150, y: 30 }  // top
  const B = { x: 50, y: 180 }  // bottom left
  const C = { x: 250, y: 180 } // bottom right

  return (
    <div className="flex flex-col items-center">
      <svg width={width} height={height} className="bg-white rounded border">
        {/* Triangle */}
        <polygon
          points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`}
          fill="#f0f9ff"
          stroke="#1e40af"
          strokeWidth={2}
        />

        {/* Angle arcs */}
        <path d={`M ${A.x + 15} ${A.y + 20} A 20 20 0 0 1 ${A.x - 15} ${A.y + 20}`} fill="none" stroke="#3b82f6" strokeWidth={1.5} />
        <path d={`M ${B.x + 25} ${B.y - 5} A 20 20 0 0 1 ${B.x + 10} ${B.y - 20}`} fill="none" stroke="#3b82f6" strokeWidth={1.5} />
        <path d={`M ${C.x - 25} ${C.y - 5} A 20 20 0 0 0 ${C.x - 10} ${C.y - 20}`} fill="none" stroke="#3b82f6" strokeWidth={1.5} />

        {/* Vertex labels */}
        <text x={A.x} y={A.y - 8} textAnchor="middle" className="text-sm fill-slate-800 font-semibold">A</text>
        <text x={B.x - 12} y={B.y + 5} textAnchor="middle" className="text-sm fill-slate-800 font-semibold">B</text>
        <text x={C.x + 12} y={C.y + 5} textAnchor="middle" className="text-sm fill-slate-800 font-semibold">C</text>

        {/* Angle labels */}
        {angle_a && (
          <text x={A.x} y={A.y + 40} textAnchor="middle" className={`text-xs font-medium ${target_angle === 'A' ? 'fill-red-600' : 'fill-blue-600'}`}>
            {target_angle === 'A' ? '?' : `${angle_a}°`}
          </text>
        )}
        {angle_b && (
          <text x={B.x + 35} y={B.y - 25} textAnchor="middle" className={`text-xs font-medium ${target_angle === 'B' ? 'fill-red-600' : 'fill-blue-600'}`}>
            {target_angle === 'B' ? '?' : `${angle_b}°`}
          </text>
        )}
        {angle_c && (
          <text x={C.x - 35} y={C.y - 25} textAnchor="middle" className={`text-xs font-medium ${target_angle === 'C' ? 'fill-red-600' : 'fill-blue-600'}`}>
            {target_angle === 'C' ? '?' : `${angle_c}°`}
          </text>
        )}
      </svg>
    </div>
  )
}

// Triangle with exterior angle at vertex C
function renderTriangleExterior(spec: GeometryDiagramProps['spec'], width: number, height: number) {
  const { angle_a, angle_b, angle_c, exterior_angle, target_angle } = spec

  // Triangle vertices
  const A = { x: 150, y: 30 }  // top
  const B = { x: 50, y: 160 }  // bottom left
  const C = { x: 200, y: 160 } // bottom right
  const D = { x: 280, y: 160 } // extension point

  return (
    <div className="flex flex-col items-center">
      <svg width={width} height={height} className="bg-white rounded border">
        {/* Triangle */}
        <polygon
          points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`}
          fill="#f0f9ff"
          stroke="#1e40af"
          strokeWidth={2}
        />

        {/* Extension line BC to D */}
        <line x1={C.x} y1={C.y} x2={D.x} y2={D.y} stroke="#1e40af" strokeWidth={2} />

        {/* Angle arcs */}
        {angle_a && (
          <path d={`M ${A.x + 12} ${A.y + 18} A 18 18 0 0 1 ${A.x - 12} ${A.y + 18}`} fill="none" stroke="#3b82f6" strokeWidth={1.5} />
        )}
        {angle_b && (
          <path d={`M ${B.x + 22} ${B.y - 5} A 18 18 0 0 1 ${B.x + 8} ${B.y - 18}`} fill="none" stroke="#3b82f6" strokeWidth={1.5} />
        )}
        {/* Interior angle at C */}
        {angle_c && (
          <path d={`M ${C.x - 22} ${C.y - 5} A 18 18 0 0 0 ${C.x - 8} ${C.y - 18}`} fill="none" stroke="#3b82f6" strokeWidth={1.5} />
        )}
        {/* Exterior angle ACD */}
        {(exterior_angle || target_angle === 'ACD') && (
          <path d={`M ${C.x + 8} ${C.y - 18} A 22 22 0 0 1 ${C.x + 22} ${C.y - 5}`} fill="none" stroke="#ef4444" strokeWidth={2} />
        )}

        {/* Vertex labels */}
        <text x={A.x} y={A.y - 8} textAnchor="middle" className="text-sm fill-slate-800 font-semibold">A</text>
        <text x={B.x - 12} y={B.y + 5} textAnchor="middle" className="text-sm fill-slate-800 font-semibold">B</text>
        <text x={C.x} y={C.y + 18} textAnchor="middle" className="text-sm fill-slate-800 font-semibold">C</text>
        <text x={D.x + 8} y={D.y + 5} textAnchor="middle" className="text-sm fill-slate-800 font-semibold">D</text>

        {/* Angle labels */}
        {angle_a && (
          <text x={A.x} y={A.y + 38} textAnchor="middle" className={`text-xs font-medium ${target_angle === 'A' ? 'fill-red-600' : 'fill-blue-600'}`}>
            {target_angle === 'A' ? '?' : `${angle_a}°`}
          </text>
        )}
        {angle_b && (
          <text x={B.x + 32} y={B.y - 22} textAnchor="middle" className={`text-xs font-medium ${target_angle === 'B' ? 'fill-red-600' : 'fill-blue-600'}`}>
            {target_angle === 'B' ? '?' : `${angle_b}°`}
          </text>
        )}
        {angle_c && (
          <text x={C.x - 32} y={C.y - 22} textAnchor="middle" className={`text-xs font-medium ${target_angle === 'ACB' ? 'fill-red-600' : 'fill-blue-600'}`}>
            {target_angle === 'ACB' ? '?' : `${angle_c}°`}
          </text>
        )}
        {(exterior_angle || target_angle === 'ACD') && (
          <text x={C.x + 38} y={C.y - 22} textAnchor="middle" className={`text-xs font-medium ${target_angle === 'ACD' ? 'fill-red-600' : 'fill-orange-600'}`}>
            {target_angle === 'ACD' ? '?' : `${exterior_angle}°`}
          </text>
        )}
      </svg>
    </div>
  )
}

// Isosceles triangle with equal sides marked
function renderIsoscelesTriangle(spec: GeometryDiagramProps['spec'], width: number, height: number) {
  const { vertex_angle, base_angle, exterior_angle, target_angle } = spec

  // Isosceles triangle vertices (symmetric)
  const A = { x: 150, y: 30 }  // apex
  const B = { x: 60, y: 170 }  // bottom left
  const C = { x: 240, y: 170 } // bottom right
  const D = { x: 290, y: 170 } // extension if needed

  const hasExterior = exterior_angle || target_angle === 'ACD'

  return (
    <div className="flex flex-col items-center">
      <svg width={width} height={height} className="bg-white rounded border">
        {/* Triangle */}
        <polygon
          points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`}
          fill="#f0f9ff"
          stroke="#1e40af"
          strokeWidth={2}
        />

        {/* Equal side marks on AB */}
        <line x1={100} y1={95} x2={108} y2={105} stroke="#1e40af" strokeWidth={2} />
        {/* Equal side marks on AC */}
        <line x1={192} y1={105} x2={200} y2={95} stroke="#1e40af" strokeWidth={2} />

        {/* Extension line if needed */}
        {hasExterior && (
          <line x1={C.x} y1={C.y} x2={D.x} y2={D.y} stroke="#1e40af" strokeWidth={2} />
        )}

        {/* Vertex angle arc at A */}
        {vertex_angle && (
          <path d={`M ${A.x + 15} ${A.y + 22} A 22 22 0 0 1 ${A.x - 15} ${A.y + 22}`} fill="none" stroke="#3b82f6" strokeWidth={1.5} />
        )}
        {/* Base angle arcs */}
        {base_angle && (
          <>
            <path d={`M ${B.x + 25} ${B.y - 5} A 20 20 0 0 1 ${B.x + 10} ${B.y - 20}`} fill="none" stroke="#3b82f6" strokeWidth={1.5} />
            <path d={`M ${C.x - 25} ${C.y - 5} A 20 20 0 0 0 ${C.x - 10} ${C.y - 20}`} fill="none" stroke="#3b82f6" strokeWidth={1.5} />
          </>
        )}
        {/* Exterior angle */}
        {hasExterior && (
          <path d={`M ${C.x + 10} ${C.y - 20} A 25 25 0 0 1 ${C.x + 25} ${C.y - 5}`} fill="none" stroke="#ef4444" strokeWidth={2} />
        )}

        {/* Vertex labels */}
        <text x={A.x} y={A.y - 8} textAnchor="middle" className="text-sm fill-slate-800 font-semibold">A</text>
        <text x={B.x - 12} y={B.y + 5} textAnchor="middle" className="text-sm fill-slate-800 font-semibold">B</text>
        <text x={C.x} y={C.y + 18} textAnchor="middle" className="text-sm fill-slate-800 font-semibold">C</text>
        {hasExterior && (
          <text x={D.x + 8} y={D.y + 5} textAnchor="middle" className="text-sm fill-slate-800 font-semibold">D</text>
        )}

        {/* Angle labels */}
        {vertex_angle && (
          <text x={A.x} y={A.y + 45} textAnchor="middle" className={`text-xs font-medium ${target_angle === 'A' ? 'fill-red-600' : 'fill-blue-600'}`}>
            {target_angle === 'A' ? '?' : `${vertex_angle}°`}
          </text>
        )}
        {base_angle && (
          <>
            <text x={B.x + 35} y={B.y - 25} textAnchor="middle" className={`text-xs font-medium ${target_angle === 'B' ? 'fill-red-600' : 'fill-blue-600'}`}>
              {target_angle === 'B' ? '?' : `${base_angle}°`}
            </text>
            <text x={C.x - 35} y={C.y - 25} textAnchor="middle" className={`text-xs font-medium ${target_angle === 'C' || target_angle === 'ACB' ? 'fill-red-600' : 'fill-blue-600'}`}>
              {target_angle === 'C' || target_angle === 'ACB' ? '?' : `${base_angle}°`}
            </text>
          </>
        )}
        {hasExterior && (
          <text x={C.x + 42} y={C.y - 25} textAnchor="middle" className={`text-xs font-medium ${target_angle === 'ACD' ? 'fill-red-600' : 'fill-orange-600'}`}>
            {target_angle === 'ACD' ? '?' : `${exterior_angle}°`}
          </text>
        )}
      </svg>
    </div>
  )
}

// Two intersecting lines with angles
function renderIntersectingLines(spec: GeometryDiagramProps['spec'], width: number, height: number) {
  const { angle_1, angle_2, target_angle } = spec

  const center = { x: 150, y: 110 }
  const len = 80

  return (
    <div className="flex flex-col items-center">
      <svg width={width} height={height} className="bg-white rounded border">
        {/* Horizontal line */}
        <line x1={center.x - len} y1={center.y} x2={center.x + len} y2={center.y} stroke="#1e40af" strokeWidth={2} />
        {/* Diagonal line */}
        <line x1={center.x - len * 0.7} y1={center.y + len * 0.7} x2={center.x + len * 0.7} y2={center.y - len * 0.7} stroke="#1e40af" strokeWidth={2} />

        {/* Right angle marker if 90 degrees */}
        {(angle_1 === 90 || angle_1 === '90') && (
          <rect x={center.x} y={center.y - 12} width={12} height={12} fill="none" stroke="#3b82f6" strokeWidth={1.5} />
        )}

        {/* Center point */}
        <circle cx={center.x} cy={center.y} r={3} fill="#1e40af" />
        <text x={center.x - 12} y={center.y + 18} textAnchor="middle" className="text-sm fill-slate-800 font-semibold">O</text>

        {/* Angle labels */}
        {angle_1 && (
          <text x={center.x + 25} y={center.y - 20} textAnchor="middle" className={`text-xs font-medium ${target_angle === '1' ? 'fill-red-600' : 'fill-blue-600'}`}>
            {target_angle === '1' ? '?' : `${angle_1}°`}
          </text>
        )}
        {angle_2 && (
          <text x={center.x - 25} y={center.y - 20} textAnchor="middle" className={`text-xs font-medium ${target_angle === '2' ? 'fill-red-600' : 'fill-blue-600'}`}>
            {target_angle === '2' ? '?' : `${angle_2}°`}
          </text>
        )}
      </svg>
    </div>
  )
}

// Right triangle with a point D on one side (e.g., on BC)
function renderRightTriangleWithPoint(spec: GeometryDiagramProps['spec'], width: number, height: number) {
  const { angle_abd, angle_dbc, angle_a, angle_adb, target_angle } = spec as any

  // Right triangle ABC with right angle at B
  const A = { x: 150, y: 30 }   // top
  const B = { x: 50, y: 180 }   // bottom left (right angle)
  const C = { x: 250, y: 180 }  // bottom right
  // D is on BC
  const D = { x: 120, y: 180 }  // point between B and C

  return (
    <div className="flex flex-col items-center">
      <svg width={width} height={height} className="bg-white rounded border">
        {/* Triangle ABC */}
        <polygon
          points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`}
          fill="#f0f9ff"
          stroke="#1e40af"
          strokeWidth={2}
        />

        {/* Line AD (connecting A to D) */}
        <line x1={A.x} y1={A.y} x2={D.x} y2={D.y} stroke="#1e40af" strokeWidth={2} />

        {/* Right angle marker at B */}
        <rect x={B.x} y={B.y - 15} width={15} height={15} fill="none" stroke="#3b82f6" strokeWidth={1.5} />

        {/* Angle arc for ABD */}
        {angle_abd && (
          <path d={`M ${B.x + 25} ${B.y - 5} A 22 22 0 0 1 ${B.x + 15} ${B.y - 20}`} fill="none" stroke="#3b82f6" strokeWidth={1.5} />
        )}

        {/* Angle arc for DBC */}
        {angle_dbc && (
          <path d={`M ${B.x + 35} ${B.y - 5} A 30 30 0 0 1 ${B.x + 30} ${B.y - 10}`} fill="none" stroke="#22c55e" strokeWidth={1.5} />
        )}

        {/* Vertex labels */}
        <text x={A.x} y={A.y - 10} textAnchor="middle" className="text-sm fill-slate-800 font-semibold">A</text>
        <text x={B.x - 12} y={B.y + 5} textAnchor="middle" className="text-sm fill-slate-800 font-semibold">B</text>
        <text x={C.x + 12} y={C.y + 5} textAnchor="middle" className="text-sm fill-slate-800 font-semibold">C</text>
        <text x={D.x} y={D.y + 18} textAnchor="middle" className="text-sm fill-slate-800 font-semibold">D</text>

        {/* Point markers */}
        <circle cx={D.x} cy={D.y} r={3} fill="#1e40af" />

        {/* Angle labels */}
        {angle_abd && (
          <text x={B.x + 40} y={B.y - 25} textAnchor="middle" className={`text-xs font-medium ${target_angle === 'ABD' ? 'fill-red-600' : 'fill-blue-600'}`}>
            {target_angle === 'ABD' ? '?' : `${angle_abd}°`}
          </text>
        )}
        {angle_dbc && (
          <text x={B.x + 55} y={B.y - 10} textAnchor="middle" className={`text-xs font-medium ${target_angle === 'DBC' ? 'fill-red-600' : 'fill-green-600'}`}>
            {target_angle === 'DBC' ? '?' : `${angle_dbc}°`}
          </text>
        )}
        {angle_a && (
          <text x={A.x} y={A.y + 35} textAnchor="middle" className={`text-xs font-medium ${target_angle === 'A' || target_angle === 'BAC' ? 'fill-red-600' : 'fill-blue-600'}`}>
            {target_angle === 'A' || target_angle === 'BAC' ? '?' : `${angle_a}°`}
          </text>
        )}
        {angle_adb && (
          <text x={D.x - 20} y={D.y - 25} textAnchor="middle" className={`text-xs font-medium ${target_angle === 'ADB' ? 'fill-red-600' : 'fill-blue-600'}`}>
            {target_angle === 'ADB' ? '?' : `${angle_adb}°`}
          </text>
        )}

        {/* 90° label at B */}
        <text x={B.x + 22} y={B.y - 20} textAnchor="middle" className="text-xs fill-blue-600 font-medium">90°</text>
      </svg>
    </div>
  )
}

// Right angle at vertex B with rays BA and BC, ray BD divides the angle
function renderRightAngleWithRay(spec: GeometryDiagramProps['spec'], width: number, height: number) {
  const { angle_abd, angle_dbc, target_angle } = spec as any

  // B is at the corner (vertex of right angle)
  // A is up (end of ray BA), C is right (end of ray BC)
  // D is on ray BD which divides the 90° angle
  const B = { x: 80, y: 160 }
  const A = { x: 80, y: 40 }       // straight up from B
  const C = { x: 260, y: 160 }     // straight right from B

  // Calculate D position based on angle_abd
  // angle_abd is measured from BA toward BC (clockwise in standard math, but counter-clockwise in SVG)
  // BA points up (-90° in SVG), BC points right (0° in SVG)
  // If angle_abd = 35°, then BD is at -90° + 35° = -55° from horizontal
  const abdDegrees = Number(angle_abd) || 35
  const rayLength = 100
  // In SVG: -90° is up, 0° is right. angle_abd rotates from up toward right.
  // SVG angle for BD = -90 + angle_abd degrees
  const bdAngleRad = ((-90 + abdDegrees) * Math.PI) / 180
  const D = {
    x: B.x + rayLength * Math.cos(bdAngleRad),
    y: B.y + rayLength * Math.sin(bdAngleRad)  // sin is negative for negative angles, so y goes up
  }

  // Arc positions for angle indicators
  const arcRadius = 40
  const abdEndAngleRad = bdAngleRad
  const abdArcEnd = {
    x: B.x + arcRadius * Math.cos(abdEndAngleRad),
    y: B.y + arcRadius * Math.sin(abdEndAngleRad)
  }
  const dbcArcStart = {
    x: B.x + arcRadius * Math.cos(bdAngleRad),
    y: B.y + arcRadius * Math.sin(bdAngleRad)
  }

  return (
    <div className="flex flex-col items-center">
      <svg width={width} height={height} className="bg-white rounded border">
        {/* Ray BA (vertical up) */}
        <line x1={B.x} y1={B.y} x2={A.x} y2={A.y} stroke="#1e40af" strokeWidth={2} />

        {/* Ray BC (horizontal right) */}
        <line x1={B.x} y1={B.y} x2={C.x} y2={C.y} stroke="#1e40af" strokeWidth={2} />

        {/* Ray BD (divides the angle) */}
        <line x1={B.x} y1={B.y} x2={D.x} y2={D.y} stroke="#1e40af" strokeWidth={2} />

        {/* Right angle marker at B (small square) */}
        <rect x={B.x} y={B.y - 15} width={15} height={15} fill="none" stroke="#94a3b8" strokeWidth={1} />

        {/* Arc for angle ABD (from A direction to D direction) */}
        <path
          d={`M ${B.x} ${B.y - arcRadius} A ${arcRadius} ${arcRadius} 0 0 1 ${abdArcEnd.x} ${abdArcEnd.y}`}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={2}
        />

        {/* Arc for angle DBC (from D direction to C direction) */}
        <path
          d={`M ${dbcArcStart.x} ${dbcArcStart.y} A ${arcRadius} ${arcRadius} 0 0 1 ${B.x + arcRadius} ${B.y}`}
          fill="none"
          stroke="#22c55e"
          strokeWidth={2}
        />

        {/* Vertex labels */}
        <text x={A.x} y={A.y - 10} textAnchor="middle" className="text-sm fill-slate-800 font-semibold">A</text>
        <text x={B.x - 15} y={B.y + 5} textAnchor="middle" className="text-sm fill-slate-800 font-semibold">B</text>
        <text x={C.x + 10} y={C.y + 5} textAnchor="middle" className="text-sm fill-slate-800 font-semibold">C</text>
        <text x={D.x + 12} y={D.y - 5} textAnchor="middle" className="text-sm fill-slate-800 font-semibold">D</text>

        {/* Point marker at D */}
        <circle cx={D.x} cy={D.y} r={4} fill="#1e40af" />

        {/* Angle ABD label - positioned along the ABD arc */}
        <text
          x={B.x + 18}
          y={B.y - 50}
          textAnchor="middle"
          className={`text-xs font-medium ${target_angle === 'ABD' ? 'fill-red-600' : 'fill-blue-600'}`}
        >
          {target_angle === 'ABD' ? '?' : `${angle_abd || ''}°`}
        </text>

        {/* Angle DBC label - positioned along the DBC arc */}
        <text
          x={B.x + 50}
          y={B.y - 20}
          textAnchor="middle"
          className={`text-xs font-medium ${target_angle === 'DBC' ? 'fill-red-600' : 'fill-green-600'}`}
        >
          {target_angle === 'DBC' ? '?' : `${angle_dbc || ''}°`}
        </text>
      </svg>
    </div>
  )
}
