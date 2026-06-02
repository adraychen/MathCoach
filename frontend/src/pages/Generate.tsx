import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { VisualRenderer } from '@/components/visuals/VisualRenderer'

const API_BASE = import.meta.env.VITE_API_URL || ''
const GENERATION_DELAY_MS = 45000 // 45 seconds between API calls (Groq: 6000 TPM, ~3885 tokens/question)
const PLAN_REFRESH_INTERVAL = 3 // Refresh plan status every N questions

interface TopicItem {
  primary_topic: string
  secondary_topic: string
  blueprint_code: string | null
  blueprint_name: string | null
  blueprint_id: string | null
  has_blueprint: boolean
}

interface TopicGroup {
  primary_topic: string
  items: TopicItem[]
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

interface PlanItem {
  id: string
  blueprint_code: string
  blueprint_name: string | null
  difficulty_level: string
  evidence_level: string
  dev_generation_target: number
  requires_visual: boolean
  priority: number
  notes: string | null
  generated_count: number
}

interface PlanStatus {
  plan: PlanItem[]
  total_target: number
  total_generated: number
  completed: boolean
}

export function GeneratePage() {
  const [topicGroups, setTopicGroups] = useState<TopicGroup[]>([])
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const [selectedBlueprint, setSelectedBlueprint] = useState<string>('')
  const [count, setCount] = useState(1)
  const [saveToDb, setSaveToDb] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingTopics, setIsLoadingTopics] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([])

  // Plan-based generation state
  const [planStatus, setPlanStatus] = useState<PlanStatus | null>(null)
  const [isLoadingPlan, setIsLoadingPlan] = useState(false)
  const [isPlanGenerating, setIsPlanGenerating] = useState(false)
  const [planLog, setPlanLog] = useState<string[]>([])
  const stopGenerationRef = useRef(false)

  // Load topics
  useEffect(() => {
    const loadTopics = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/generation/topics`)
        if (!response.ok) throw new Error('Failed to load topics')
        const data = await response.json()
        setTopicGroups(data.groups)
        // Expand all groups by default
        setExpandedGroups(new Set(data.groups.map((g: TopicGroup) => g.primary_topic)))
        // Select first available blueprint
        for (const group of data.groups) {
          for (const item of group.items) {
            if (item.has_blueprint && item.blueprint_code) {
              setSelectedBlueprint(item.blueprint_code)
              return
            }
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load topics')
      } finally {
        setIsLoadingTopics(false)
      }
    }
    loadTopics()
  }, [])

  // Load generation plan
  const loadPlan = useCallback(async () => {
    setIsLoadingPlan(true)
    try {
      const response = await fetch(`${API_BASE}/api/generation/plan`)
      if (!response.ok) throw new Error('Failed to load plan')
      const data = await response.json()
      setPlanStatus(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load plan')
    } finally {
      setIsLoadingPlan(false)
    }
  }, [])

  useEffect(() => {
    loadPlan()
  }, [loadPlan])

  const toggleGroup = (primaryTopic: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(primaryTopic)) {
        next.delete(primaryTopic)
      } else {
        next.add(primaryTopic)
      }
      return next
    })
  }

  // Generate according to plan
  const handlePlanGenerate = async () => {
    setIsPlanGenerating(true)
    stopGenerationRef.current = false
    setPlanLog([])
    setError(null)

    const addLog = (msg: string) => {
      setPlanLog((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`])
    }

    addLog('Starting plan-based generation...')
    let questionCount = 0

    while (!stopGenerationRef.current) {
      try {
        const response = await fetch(`${API_BASE}/api/generation/generate-next`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}))
          throw new Error(errData.detail || 'Generation failed')
        }

        const data = await response.json()

        if (data.completed) {
          addLog('All questions generated!')
          break
        }

        if (data.question) {
          const q = data.question
          const firstIssue = q.validation_issues?.[0] || ''

          // Check if rate limited (in validation_issues)
          if (firstIssue.includes('429') || firstIssue.includes('rate_limit')) {
            addLog(`Rate limited. Waiting 60s...`)
            await new Promise((resolve) => setTimeout(resolve, 60000))
            continue // Retry without incrementing count
          }

          questionCount++

          if (q.saved) {
            addLog(`[${questionCount}] Saved: ${data.blueprint_code} - ${q.id}`)
          } else if (q.validation_issues?.length > 0) {
            addLog(`[${questionCount}] Invalid: ${data.blueprint_code} - ${firstIssue.substring(0, 80)}`)
          } else {
            addLog(`[${questionCount}] Generated: ${data.blueprint_code}`)
          }
        }

        addLog(`Remaining: ${data.remaining}`)

        // Refresh plan status periodically (not every question)
        if (questionCount % PLAN_REFRESH_INTERVAL === 0) {
          await loadPlan()
        }

        // Rate limit delay with countdown
        const waitSeconds = GENERATION_DELAY_MS / 1000
        addLog(`Waiting ${waitSeconds}s for rate limit...`)
        await new Promise((resolve) => setTimeout(resolve, GENERATION_DELAY_MS))

      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error'
        addLog(`Error: ${msg}`)

        // If rate limited, wait longer
        if (msg.includes('rate') || msg.includes('429') || msg.includes('too_many')) {
          addLog('Rate limited. Waiting 60s...')
          await new Promise((resolve) => setTimeout(resolve, 60000))
        } else {
          setError(msg)
          break
        }
      }
    }

    if (stopGenerationRef.current) {
      addLog('Generation stopped by user.')
    }

    setIsPlanGenerating(false)
    await loadPlan()
  }

  const handleStopGeneration = () => {
    stopGenerationRef.current = true
  }

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

  if (isLoadingTopics) {
    return (
      <div className="max-w-4xl mx-auto text-center">
        <p>Loading topics...</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Question Generation</CardTitle>
          <CardDescription>
            Generate questions using AI from blueprint templates. Topics without blueprints are disabled.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Topic Selection */}
          <div className="space-y-3">
            <Label className="text-base">Select Topic & Blueprint</Label>
            {topicGroups.length === 0 ? (
              <p className="text-sm text-muted-foreground">No topics found</p>
            ) : (
              <div className="border rounded max-h-96 overflow-y-auto">
                {topicGroups.map((group) => (
                  <div key={group.primary_topic} className="border-b last:border-b-0">
                    {/* Group Header */}
                    <button
                      type="button"
                      className="w-full flex items-center justify-between p-3 bg-muted/50 hover:bg-muted text-left font-medium"
                      onClick={() => toggleGroup(group.primary_topic)}
                    >
                      <span className="capitalize">{group.primary_topic}</span>
                      <span className="text-muted-foreground text-sm">
                        {expandedGroups.has(group.primary_topic) ? '▼' : '▶'}
                        {' '}
                        ({group.items.filter(i => i.has_blueprint).length}/{group.items.length} available)
                      </span>
                    </button>

                    {/* Group Items */}
                    {expandedGroups.has(group.primary_topic) && (
                      <div className="divide-y">
                        {group.items.map((item, idx) => (
                          <div
                            key={`${item.secondary_topic}-${idx}`}
                            className={`flex items-center p-2 pl-6 ${
                              item.has_blueprint
                                ? 'cursor-pointer hover:bg-muted/30'
                                : 'opacity-50 cursor-not-allowed'
                            } ${
                              selectedBlueprint === item.blueprint_code ? 'bg-primary/10' : ''
                            }`}
                            onClick={() => {
                              if (item.has_blueprint && item.blueprint_code) {
                                setSelectedBlueprint(item.blueprint_code)
                              }
                            }}
                          >
                            <input
                              type="radio"
                              name="topic-selection"
                              checked={selectedBlueprint === item.blueprint_code}
                              onChange={() => {
                                if (item.has_blueprint && item.blueprint_code) {
                                  setSelectedBlueprint(item.blueprint_code)
                                }
                              }}
                              disabled={!item.has_blueprint}
                              className="h-4 w-4 mr-3"
                            />
                            <div className="flex-1 min-w-0">
                              <span className="text-sm capitalize">{item.secondary_topic}</span>
                              {item.blueprint_name && (
                                <span className="text-xs text-muted-foreground ml-2">
                                  → {item.blueprint_name}
                                </span>
                              )}
                            </div>
                            {!item.has_blueprint && (
                              <span className="text-xs text-muted-foreground">No blueprint</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
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

      {/* Plan-Based Generation */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Generate According to Plan</CardTitle>
          <CardDescription>
            Automatically generate questions based on the blueprint generation plan
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {isLoadingPlan ? (
            <p className="text-sm text-muted-foreground">Loading plan...</p>
          ) : planStatus ? (
            <>
              {/* Progress Summary */}
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>{planStatus.total_generated} / {planStatus.total_target}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className="bg-primary h-3 rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, (planStatus.total_generated / planStatus.total_target) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
                {planStatus.completed && (
                  <span className="text-green-600 font-medium">Complete</span>
                )}
              </div>

              {/* Plan Table */}
              <div className="max-h-64 overflow-y-auto border rounded">
                <table className="w-full text-sm">
                  <thead className="bg-muted sticky top-0">
                    <tr>
                      <th className="text-left p-2">Blueprint</th>
                      <th className="text-left p-2">Difficulty</th>
                      <th className="text-center p-2">Visual</th>
                      <th className="text-center p-2">Priority</th>
                      <th className="text-right p-2">Progress</th>
                    </tr>
                  </thead>
                  <tbody>
                    {planStatus.plan.map((item) => (
                      <tr
                        key={item.id}
                        className={
                          item.generated_count >= item.dev_generation_target
                            ? 'bg-green-50 dark:bg-green-950'
                            : ''
                        }
                      >
                        <td className="p-2 text-sm">{item.blueprint_name || item.blueprint_code}</td>
                        <td className="p-2">{item.difficulty_level}</td>
                        <td className="p-2 text-center">{item.requires_visual ? 'Yes' : ''}</td>
                        <td className="p-2 text-center">{item.priority}</td>
                        <td className="p-2 text-right">
                          {item.generated_count} / {item.dev_generation_target}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Generation Log */}
              {planLog.length > 0 && (
                <div className="bg-muted p-3 rounded max-h-48 overflow-y-auto font-mono text-xs">
                  {planLog.map((log, i) => (
                    <div key={i}>{log}</div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              No generation plan found. Run the SQL to create the plan table first.
            </p>
          )}

          {error && <div className="text-sm text-destructive">{error}</div>}
        </CardContent>

        <CardFooter className="gap-2">
          {isPlanGenerating ? (
            <Button onClick={handleStopGeneration} variant="destructive" className="w-full">
              Stop Generation
            </Button>
          ) : (
            <Button
              onClick={handlePlanGenerate}
              disabled={!planStatus || planStatus.completed || isLoadingPlan}
              className="w-full"
              size="lg"
            >
              Generate According to Plan
            </Button>
          )}
          <Button onClick={loadPlan} variant="outline" disabled={isLoadingPlan}>
            Refresh
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
                      <div className="flex justify-center p-3 bg-blue-50 dark:bg-blue-950 rounded">
                        <VisualRenderer
                          type={q.visual.type}
                          spec={q.visual.spec as Record<string, unknown>}
                        />
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
