import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { startQuiz } from '@/services/api'

const TOPICS = [
  { value: 'all', label: 'All Topics' },
  { value: 'number_sense', label: 'Number Sense' },
  { value: 'factors_multiples_primes', label: 'Factors, Multiples & Primes' },
  { value: 'fractions_decimals_percents', label: 'Fractions, Decimals & Percents' },
  { value: 'patterns_sequences', label: 'Patterns & Sequences' },
  { value: 'geometry_measurement', label: 'Geometry & Measurement' },
  { value: 'counting_probability', label: 'Counting & Probability' },
  { value: 'logic_reasoning', label: 'Logic & Reasoning' },
]

const DIFFICULTIES = [
  { value: 'part_a', label: 'Part A (5 pts)', description: 'Entry-level questions' },
  { value: 'part_b', label: 'Part B (6 pts)', description: 'Intermediate questions' },
  { value: 'part_c', label: 'Part C (8 pts)', description: 'Advanced questions' },
]

const QUESTION_COUNTS = [3, 5, 10, 15]

export function PracticePage() {
  const navigate = useNavigate()
  const [topic, setTopic] = useState('all')
  const [difficulty, setDifficulty] = useState('part_a')
  const [numQuestions, setNumQuestions] = useState(5)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleStart = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const session = await startQuiz({
        program: 'waterloo_gauss',
        topic,
        difficulty,
        num_questions: numQuestions,
      })

      navigate(`/quiz/${session.session_id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start quiz')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Practice Settings</CardTitle>
          <CardDescription>
            Configure your practice session for Waterloo Gauss Grade 7
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Topic Selection */}
          <div className="space-y-3">
            <Label className="text-base">Topic</Label>
            <RadioGroup value={topic} onValueChange={setTopic}>
              {TOPICS.map((t) => (
                <div key={t.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={t.value} id={`topic-${t.value}`} />
                  <Label htmlFor={`topic-${t.value}`} className="font-normal">
                    {t.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Difficulty Selection */}
          <div className="space-y-3">
            <Label className="text-base">Difficulty</Label>
            <RadioGroup value={difficulty} onValueChange={setDifficulty}>
              {DIFFICULTIES.map((d) => (
                <div key={d.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={d.value} id={`diff-${d.value}`} />
                  <Label htmlFor={`diff-${d.value}`} className="font-normal">
                    {d.label}
                    <span className="text-muted-foreground ml-2 text-sm">
                      - {d.description}
                    </span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Question Count */}
          <div className="space-y-3">
            <Label className="text-base">Number of Questions</Label>
            <div className="flex gap-2">
              {QUESTION_COUNTS.map((count) => (
                <Button
                  key={count}
                  variant={numQuestions === count ? 'default' : 'outline'}
                  onClick={() => setNumQuestions(count)}
                  className="w-16"
                >
                  {count}
                </Button>
              ))}
            </div>
          </div>

          {error && (
            <div className="text-sm text-destructive">{error}</div>
          )}
        </CardContent>

        <CardFooter>
          <Button
            onClick={handleStart}
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? 'Starting...' : 'Start Practice'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
