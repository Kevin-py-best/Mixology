import { useState } from 'react'
import HomePage from './pages/HomePage'
import QuizPage from './pages/QuizPage'
import ExplorerPage from './pages/ExplorerPage'
import BarsPage from './pages/BarsPage'
import BarDetailPage from './pages/BarDetailPage'
import CocktailDetailPage from './pages/CocktailDetailPage'
import Navbar from './components/Navbar'
import { cocktails } from './data/cocktails'

export default function App() {
  const [page, setPage] = useState("home")

  const [searchQuery, setSearchQuery] = useState("")

  const [quizAnswers, setQuizAnswers] = useState(null)

  const [selectedCocktail, setSelectedCocktail] = useState(null)
  const [selectedBar, setSelectedBar] = useState(null)
  const [cocktailReturnPage, setCocktailReturnPage] = useState('explorer')

  const handleQuizComplete = (answers) => {
    setQuizAnswers(answers)

    setPage("home")
  }

  const openCocktail = (cocktail, returnPage) => {
    setSelectedCocktail(cocktail)

    setCocktailReturnPage(returnPage)
    setPage('cocktail')
  }

  const openBar = bar => {
    setSelectedBar(bar)
    setPage('bar-detail')
  }

  return (
    <div style={{ backgroundColor: '#1A1918', minHeight: '100vh', color: '#F0EBE1' }}>
      {page !== 'quiz' && (
        <Navbar currentPage={page === 'bar-detail' ? 'bars' : page} onNavigate={setPage} onSearch={setSearchQuery} />
      )}
      <main>
        {page === "home" && (
          <HomePage
            onNavigate={setPage}
            quizAnswers={quizAnswers}
            onSelectCocktail={(cocktail) => openCocktail(cocktail, "home")}
          />
        )}
        {page === "quiz" && (
          <QuizPage
            onComplete={handleQuizComplete}
            onBack={() => setPage("home")}
          />
        )}
        {page === "explorer" && (
          <ExplorerPage
            searchQuery={searchQuery}
            onSelectCocktail={(cocktail) => openCocktail(cocktail, "explorer")}
          />
        )}
        {page === 'bars' && <BarsPage onSelectBar={openBar} />}
        {page === 'bar-detail' && selectedBar && (
          <BarDetailPage
            bar={selectedBar}
            cocktails={cocktails}
            onBack={() => setPage('bars')}
            onSelectCocktail={cocktail => openCocktail(cocktail, 'bar-detail')}
          />
        )}
        {page === 'cocktail' && selectedCocktail && (
          <CocktailDetailPage
            slug={selectedCocktail.slug}
            cocktail={selectedCocktail}
            onBack={() => setPage(cocktailReturnPage)}
            onNavigate={setPage}
          />
        )}
      </main>
    </div>
  )
}
