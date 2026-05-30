import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { HomePage } from './pages/Home'
import { PracticePage } from './pages/Practice'
import { QuizPage } from './pages/Quiz'
import { ResultsPage } from './pages/Results'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="practice" element={<PracticePage />} />
        <Route path="quiz/:sessionId" element={<QuizPage />} />
        <Route path="results/:sessionId" element={<ResultsPage />} />
      </Route>
    </Routes>
  )
}

export default App
