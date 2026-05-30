import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { HomePage } from './pages/Home'
import { PracticePage } from './pages/Practice'
import { QuizPage } from './pages/Quiz'
import { ResultsPage } from './pages/Results'
import { GeneratePage } from './pages/Generate'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="practice" element={<PracticePage />} />
        <Route path="quiz/:sessionId" element={<QuizPage />} />
        <Route path="results/:sessionId" element={<ResultsPage />} />
        <Route path="generate" element={<GeneratePage />} />
      </Route>
    </Routes>
  )
}

export default App
