import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

export function HomePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Welcome to MathCoach</h1>
        <p className="text-xl text-muted-foreground">
          AI-powered adaptive learning for math competitions
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-12">
        <Card>
          <CardHeader>
            <CardTitle>Socratic Coaching</CardTitle>
            <CardDescription>
              Learn through guided questions, not direct answers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Our AI coach asks guiding questions to help you discover solutions
              on your own, building deeper understanding.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Competition Style</CardTitle>
            <CardDescription>
              Practice with Waterloo Gauss-style questions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Questions designed to match the style, difficulty, and reasoning
              patterns of real math competitions.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Adaptive Learning</CardTitle>
            <CardDescription>
              Questions tailored to your level
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              The system tracks your progress and adapts to focus on areas
              where you need the most practice.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Misconception Aware</CardTitle>
            <CardDescription>
              Learn from your mistakes effectively
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              When you make an error, the AI identifies common misconceptions
              and guides you toward correct understanding.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <Button asChild size="lg">
          <Link to="/practice">Start Practicing</Link>
        </Button>
      </div>
    </div>
  )
}
