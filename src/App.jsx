import { useState } from 'react'
import HomePage from './pages/HomePage'
import QuizPage from './pages/QuizPage'
import ExplorerPage from './pages/ExplorerPage'
import BarsPage from './pages/BarsPage'
import Navbar from './components/Navbar'

export default function App() {
  const [page, setPage] = useState('home')
  const [searchQuery, setSearchQuery] = useState('')
  const [quizAnswers, setQuizAnswers] = useState(null)

  const handleQuizComplete = (answers) => {
    setQuizAnswers(answers)
    setPage('home')
  }

  return (
    <div style={{ backgroundColor: '#1A1918', minHeight: '100vh', color: '#F0EBE1' }}>
      {page !== 'quiz' && (
        <Navbar currentPage={page} onNavigate={setPage} onSearch={setSearchQuery} />
      )}
      <main>
        {page === 'home' && (
          <HomePage
            onNavigate={setPage}
            quizAnswers={quizAnswers}
          />
        )}
        {page === 'quiz' && (
          <QuizPage
            onComplete={handleQuizComplete}
            onBack={() => setPage('home')}
          />
        )}
        {page === 'explorer' && <ExplorerPage searchQuery={searchQuery} />}
        {page === 'bars' && <BarsPage />}
      </main>
    </div>
  )
}
