# MathCoach Schema System

This directory contains the structured metadata definitions for the MathCoach question system. These schemas must be stable before AI question generation can begin.

## Schema Files

| File | Purpose |
|------|---------|
| `programs.json` | Math programs/competitions (Waterloo Gauss, AMC 8, etc.) |
| `topics.json` | Math topics and subtopics with keywords |
| `difficulty_levels.json` | Difficulty definitions per program |
| `reasoning_skills.json` | Cognitive skills questions can test |
| `misconceptions.json` | Common student errors with coaching hints |
| `archetypes.json` | Reusable question patterns/templates |
| `question_schema.json` | JSON Schema for question validation |
| `sample_question.json` | Example question using full schema |

## Architecture

```
programs.json
    └── defines programs with topic lists and scoring rules

topics.json
    └── defines topics with subtopics and keywords

difficulty_levels.json
    └── defines difficulty characteristics per program

reasoning_skills.json
    └── defines cognitive skills with coaching approaches

misconceptions.json
    └── defines common errors with coaching hints

archetypes.json
    └── defines question templates referencing skills & misconceptions

question_schema.json
    └── ties everything together as the question structure
```

## Key Design Principles

1. **Reference IDs**: All schemas use `id` fields that are referenced across schemas
2. **Program-Specific**: Difficulty levels and topics can vary by program
3. **Coaching-First**: Every misconception and skill includes coaching guidance
4. **Generation-Ready**: Archetypes include templates and distractor strategies
5. **Analytics-Aware**: Question schema includes fields for tracking performance

## Question ID Convention

Format: `{program}_{topic}_{difficulty}_{sequence}`

Example: `waterloo_gauss_factors_multiples_primes_part_a_0001`

## Usage

### Validating Questions

```python
import json
import jsonschema

with open('schema/question_schema.json') as f:
    schema = json.load(f)

with open('questions/my_question.json') as f:
    question = json.load(f)

jsonschema.validate(question, schema)
```

### Loading Metadata

```python
import json

def load_schema(name):
    with open(f'schema/{name}.json') as f:
        return json.load(f)

programs = load_schema('programs')
topics = load_schema('topics')
misconceptions = load_schema('misconceptions')
archetypes = load_schema('archetypes')
```

## Next Steps

1. **Migrate existing questions** to new schema format
2. **Build validation utilities** in Python
3. **Create question generator** that uses archetypes
4. **Integrate with Supabase** for persistent storage
