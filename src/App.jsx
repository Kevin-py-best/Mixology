import { useEffect, useState } from 'react'
import HomePage from './pages/HomePage'
import QuizPage from './pages/QuizPage'
import ExplorerPage from './pages/ExplorerPage'
import BarsPage from './pages/BarsPage'
import BarDetailPage from './pages/BarDetailPage'
import CocktailDetailPage from './pages/CocktailDetailPage'
import Navbar from './components/Navbar'
import AccountPage from './pages/AccountPage'
import ProfilePage from './pages/ProfilePage'
import useAccount, { accountService } from './hooks/useAccount'

export default function App() {
  const [page, setPage] = useState("home")

  const [searchQuery, setSearchQuery] = useState("")

  const account = useAccount()
  const quizAnswers = account.profile.quizAnswers

  useEffect(() => {
    if (!account.ready) return
    const url = new URL(window.location.href)
    if (url.searchParams.get('auth') === 'quiz') {
      setPage(account.user ? 'quiz' : 'login')
      url.searchParams.delete('auth')
      window.history.replaceState(null, '', url.pathname + url.search + url.hash)
    }
  }, [account.ready, account.user])

  useEffect(() => {
    if (account.ready && !account.user && ['quiz', 'profile'].includes(page)) setPage('account')
  }, [account.ready, account.user, page])

  const [selectedCocktail, setSelectedCocktail] = useState(null)
  const [selectedBar, setSelectedBar] = useState(null)
  const [cocktailReturnPage, setCocktailReturnPage] = useState('explorer')

  const handleQuizComplete = async answers => {
    const updatedUser = await accountService.saveQuiz(answers)
    account.setUser(updatedUser)
    setPage("home")
  }

  const navigate = destination => {
    if (destination === 'quiz') setPage(account.user ? 'quiz' : 'account')
    else if (destination === 'account' || destination === 'profile') setPage(account.user ? 'profile' : 'account')
    else setPage(destination)
  }

  const handleSignOut = async () => {
    await accountService.signOut()
    account.setUser(null)
    setPage('home')
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
        <Navbar currentPage={page === 'bar-detail' ? 'bars' : page} onNavigate={navigate} onSearch={setSearchQuery} signedIn={Boolean(account.user)} />
      )}
      <main>
        {account.error && <p className="account-error" role="alert">{account.error}</p>}
        {!account.ready && <p className="session-loading" role="status">Restoring your session…</p>}
        {account.ready && page === "home" && (
          <HomePage
            onNavigate={navigate}
            quizAnswers={quizAnswers}
            displayName={account.profile.name}
            onSelectBar={openBar}
            onSelectCocktail={(cocktail) => openCocktail(cocktail, "home")}
          />
        )}
        {account.ready && ['account', 'login', 'signup'].includes(page) && (
          <AccountPage
            key={page}
            mode={page}
            onNavigate={navigate}
            onAuthenticated={user => { account.setUser(user); setPage('quiz') }}
          />
        )}
        {account.ready && page === 'profile' && account.user && (
          <ProfilePage
            key={account.user.id}
            profile={account.profile}
            onSave={async name => account.setUser(await accountService.saveProfile(name))}
            onSignOut={handleSignOut}
            onNavigate={navigate}
          />
        )}
        {account.ready && page === "quiz" && account.user && (
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
            key={selectedBar.id}
            bar={selectedBar}
            onBack={() => setPage('bars')}
            onSelectCocktail={cocktail => openCocktail(cocktail, 'bar-detail')}
          />
        )}
        {page === 'cocktail' && selectedCocktail && (
          <CocktailDetailPage
            key={selectedCocktail.slug}
            slug={selectedCocktail.slug}
            cocktail={selectedCocktail}
            onBack={() => setPage(cocktailReturnPage)}
            onNavigate={setPage}
            onSelectBar={openBar}
          />
        )}
      </main>
    </div>
  )
}
