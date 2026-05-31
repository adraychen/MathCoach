import { BarGraph } from './BarGraph'

interface VisualRendererProps {
  type: string
  spec: Record<string, unknown>
}

export function VisualRenderer({ type, spec }: VisualRendererProps) {
  switch (type) {
    case 'bar_graph':
      return <BarGraph spec={spec as Parameters<typeof BarGraph>[0]['spec']} />

    case 'line_graph':
      // TODO: Implement LineGraph component
      return (
        <div className="p-4 bg-muted rounded text-center text-sm text-muted-foreground">
          Line graph visualization coming soon
          <pre className="mt-2 text-xs text-left overflow-auto">
            {JSON.stringify(spec, null, 2)}
          </pre>
        </div>
      )

    case 'coordinate_grid':
      // TODO: Implement CoordinateGrid component
      return (
        <div className="p-4 bg-muted rounded text-center text-sm text-muted-foreground">
          Coordinate grid visualization coming soon
          <pre className="mt-2 text-xs text-left overflow-auto">
            {JSON.stringify(spec, null, 2)}
          </pre>
        </div>
      )

    case 'geometry_diagram':
      // TODO: Implement GeometryDiagram component
      return (
        <div className="p-4 bg-muted rounded text-center text-sm text-muted-foreground">
          Geometry diagram visualization coming soon
          <pre className="mt-2 text-xs text-left overflow-auto">
            {JSON.stringify(spec, null, 2)}
          </pre>
        </div>
      )

    case 'table':
      // TODO: Implement Table component
      return (
        <div className="p-4 bg-muted rounded text-center text-sm text-muted-foreground">
          Table visualization coming soon
          <pre className="mt-2 text-xs text-left overflow-auto">
            {JSON.stringify(spec, null, 2)}
          </pre>
        </div>
      )

    case 'fraction_area':
      // TODO: Implement FractionArea component
      return (
        <div className="p-4 bg-muted rounded text-center text-sm text-muted-foreground">
          Fraction area visualization coming soon
          <pre className="mt-2 text-xs text-left overflow-auto">
            {JSON.stringify(spec, null, 2)}
          </pre>
        </div>
      )

    default:
      return (
        <div className="p-4 bg-muted rounded">
          <div className="text-sm text-muted-foreground mb-2">
            Unknown visual type: {type}
          </div>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(spec, null, 2)}
          </pre>
        </div>
      )
  }
}
