# Gauss AI Coach

A React/Vite practice app for Grade 7 Gauss math competition preparation.

## Features

- **PDF Viewer**: Scrollable view of practice questions with page navigation
- **Answer Card**: Multiple choice (A/B/C/D/E) with instant feedback
- **Coaching Panel**: Hints, guided steps, and solutions when needed
- **Progress Tracking**: Skip and flag questions for review

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account with tables created (see `../sql/`)

### Installation

```bash
cd app
npm install
```

### Configuration

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Add your Supabase credentials:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Development

```bash
npm run dev
```

Open http://localhost:5173

### Build

```bash
npm run build
```

## Project Structure

```
app/
├── public/
│   └── G7gauss1-question.pdf     # Practice set PDF
├── src/
│   ├── components/
│   │   ├── AnswerCard.tsx        # Answer selection UI
│   │   ├── CoachingPanel.tsx     # Hints and solutions panel
│   │   ├── PDFViewer.tsx         # PDF display with navigation
│   │   ├── PracticeScreen.tsx    # Main practice screen layout
│   │   └── index.ts              # Component exports
│   ├── lib/
│   │   └── supabase.ts           # Supabase client setup
│   ├── types/
│   │   └── database.ts           # TypeScript type definitions
│   ├── App.tsx                   # App entry point
│   ├── main.tsx                  # React DOM render
│   └── index.css                 # Tailwind CSS imports
├── .env.example                  # Environment template
├── index.html                    # HTML entry point
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Screen Layout

```
+----------------------------------+-------------+
|                                  |             |
|         PDF Viewer               |  Coaching   |
|        (scrollable)              |   Panel     |
|                                  |   (right)   |
|                                  |             |
+----------------------------------+             |
|         Answer Card              |             |
|  [A] [B] [C] [D] [E]             |             |
|  [Skip] [Flag]                   |             |
+----------------------------------+-------------+
```

## Answer Card Behavior

| Action | Result |
|--------|--------|
| Correct answer | Save as correct, auto-advance to next question |
| Wrong answer | Save as incorrect, open coaching panel |
| Skip | Mark as skipped, advance to next question |
| Flag | Mark as flagged, advance to next question |

## Coaching Panel

- Activated by clicking the lightbulb icon or selecting a wrong answer
- Shows available coaching content:
  - Hint 1
  - Hint 2
  - Guided Steps
  - Detailed Solution
  - PSG Solution
- If `coaching_available` is false: "Coaching is not available for this question yet."

## Data Source

Fetches from Supabase tables:
- `gauss_practice_sets` - Practice set metadata
- `gauss_questions` - Question data with correct answers
- `gauss_solutions` - Hints, guided steps, solutions

See `../sql/001_create_gauss_mvp_schema.sql` for schema.

## Tech Stack

- React 19
- Vite 8
- TypeScript
- Tailwind CSS 4
- react-pdf (PDF rendering)
- lucide-react (icons)
- @supabase/supabase-js

## Related Files

| Path | Description |
|------|-------------|
| `../sql/001_create_gauss_mvp_schema.sql` | Database schema |
| `../sql/002_seed_G7gauss1.sql` | Seed data for G7gauss1 |
| `../extracted-data/G7gauss1-psg-metadata.json` | Question metadata |
| `../question-crops/G7gauss1/` | Individual question images |
| `../public/questions/` | Source PDFs |
