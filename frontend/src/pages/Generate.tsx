import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

const API_BASE = import.meta.env.VITE_API_URL || ''

interface Blueprint {
  id: string
  blueprint_code: string
  blueprint_name: string
  primary_topic: string | null
  difficulty_level: string | null
  visual_required: boolean | null
}

interface GeneratedQuestion {
  id: string | null
  question_text: string | null
  options: Record<string, string> | null
  correct_answer: string | null
  coaching_hints: string[] | null
  visual?: {
    required: boolean
    type: string
    spec?: Record<string, unknown>
  } | null
  validation_issues: string[]
  saved: boolean
}

export function GeneratePage() {
  const [blueprints, setBlueprints] = useState<Blueprint[]>([])
  const [selectedBlueprint, setSelectedBlueprint] = useState<string>('')
  const [count, setCount] = useState(1)
  const [saveToDb, setSaveToDb] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingBlueprints, setIsLoadingBlueprints] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([])

  // Load blueprints
  useEffect(() => {
    const loadBlueprints = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/generation/blueprints`)
        if (!response.ok) throw new Error('Failed to load blueprints')
        const data = await response.json()
        setBlueprints(data.blueprints)
        if (data.blueprints.length > 0) {
          setSelectedBlueprint(data.blueprints[0].blueprint_code)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load blueprints')
      } finally {
        setIsLoadingBlueprints(false)
      }
    }
    loadBlueprints()
  }, [])

  const handleGenerate = async () => {
    if (!selectedBlueprint) return

    setIsLoading(true)
    setError(null)
    setGeneratedQuestions([])

    try {
      const response = await fetch(`${API_BASE}/api/generation/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blueprint_code: selectedBlueprint,
          count,
          save_to_db: saveToDb,
        }),
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.detail || 'Generation failed')
      }

      const data = await response.json()
      setGeneratedQuestions(data.questions)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingBlueprints) {
    return (
      <div className="max-w-4xl mx-auto text-center">
        <p>Loading blueprints...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Question Generation</CardTitle>
          <CardDescription>
            Generate questions using AI from blueprint templates
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Blueprint Selection */}
          <div className="space-y-3">
            <Label className="text-base">Blueprint</Label>
            {blueprints.length === 0 ? (
              <p className="text-sm text-muted-foreground">No blueprints found</p>
            ) : (
              <RadioGroup value={selectedBlueprint} onValueChange={setSelectedBlueprint}>
                {blueprints.map((bp) => (
                  <div key={bp.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={bp.blueprint_code} id={`bp-${bp.blueprint_code}`} />
                    <Label htmlFor={`bp-${bp.blueprint_code}`} className="font-normal cursor-pointer">
                      {bp.blueprint_name}
                      <span className="text-muted-foreground ml-2 text-sm">
                        ({bp.primary_topic} - {bp.difficulty_level})
                      </span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          </div>

          {/* Count Selection */}
          <div className="space-y-3">
            <Label className="text-base">Number of Questions</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 5].map((n) => (
                <Button
                  key={n}
                  variant={count === n ? 'default' : 'outline'}
                  onClick={() => setCount(n)}
                  className="w-12"
                >
                  {n}
                </Button>
              ))}
            </div>
          </div>

          {/* Save Option */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="save-to-db"
              checked={saveToDb}
              onChange={(e) => setSaveToDb(e.target.checked)}
              className="h-4 w-4"
            />
            <Label htmlFor="save-to-db" className="font-normal cursor-pointer">
              Save valid questions to database
            </Label>
          </div>

          {error && (
            <div className="text-sm text-destructive">{error}</div>
          )}
        </CardContent>

        <CardFooter>
          <Button
            onClick={handleGenerate}
            disabled={isLoading || !selectedBlueprint}
            className="w-full"
            size="lg"
          >
            {isLoading ? 'Generating...' : 'Generate Questions'}
          </Button>
        </CardFooter>
      </Card>

      {/* Generated Questions */}
      {generatedQuestions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Generated Questions</h2>
          {generatedQuestions.map((q, idx) => (
            <Card key={idx} className={q.validation_issues.length > 0 ? 'border-yellow-500' : 'border-green-500'}>
              <CardHeader>
                <CardTitle className="text-lg flex justify-between">
                  <span>Question {idx + 1}</span>
                  <span className="text-sm font-normal">
                    {q.saved && <span className="text-green-600 mr-2">Saved</span>}
                    {q.validation_issues.length > 0 ? (
                      <span className="text-yellow-600">{q.validation_issues.length} issues</span>
                    ) : (
                      <span className="text-green-600">Valid</span>
                    )}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {q.question_text ? (
                  <>
                    <p className="font-medium">{q.question_text}</p>

                    {q.options && (
                      <div className="space-y-1">
                        {Object.entries(q.options).map(([key, value]) => (
                          <div
                            key={key}
                            className={`p-2 rounded ${
                              key === q.correct_answer
                                ? 'bg-green-100 dark:bg-green-900'
                                : 'bg-muted'
                            }`}
                          >
                            <span className="font-medium mr-2">{key}.</span>
                            {value}
                            {key === q.correct_answer && ' (correct)'}
                          </div>
                        ))}
                      </div>
                    )}

                    {q.visual?.required && q.visual.spec && (
                      <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded">
                        <p className="font-medium text-sm mb-2">Visual ({q.visual.type}):</p>
                        <pre className="text-xs overflow-auto bg-white dark:bg-slate-900 p-2 rounded">
                          {JSON.stringify(q.visual.spec, null, 2)}
                        </pre>
                      </div>
                    )}

                    {q.coaching_hints && q.coaching_hints.length > 0 && (
                      <div>
                        <p className="font-medium text-sm">Coaching Hints:</p>
                        <ul className="list-disc list-inside text-sm text-muted-foreground">
                          {q.coaching_hints.map((hint, i) => (
                            <li key={i}>{hint}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-muted-foreground">Generation failed</p>
                )}

                {q.validation_issues.length > 0 && (
                  <div className="text-sm text-yellow-600">
                    <p className="font-medium">Issues:</p>
                    <ul className="list-disc list-inside">
                      {q.validation_issues.map((issue, i) => (
                        <li key={i}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
