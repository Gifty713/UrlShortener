import { useEffect, useState } from 'react'
import AuthPage from '../Components/AuthPage'
import Analytics from '../Components/Analytics'
import Dashboard from '../Components/Dashboard'
import Home from '../Components/Home'
import ShortLinkPage from '../Components/ShortLinkPage'
import PasswordLinkPage from '../Components/PasswordLinkPage'
import { isAuthenticated, logout as endSession, restoreSession } from '../Services/authService'
import { Box, CircularProgress } from '@mui/material'
import './App.css'

function App() {
  const [path, setPath] = useState(window.location.pathname)
  const [authenticated, setAuthenticated] = useState(isAuthenticated())
  const [restoringSession, setRestoringSession] = useState(() => ['/dashboard', '/analytics'].includes(window.location.pathname))
  const navigate = (to) => { window.history.pushState({}, '', to); setPath(to) }

  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname)
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  useEffect(() => {
    if (!restoringSession) return undefined
    let active = true
    restoreSession().then(sessionRestored => { if (active) { setAuthenticated(sessionRestored); setRestoringSession(false) } })
    return () => { active = false }
  }, [restoringSession])

  useEffect(() => {
    if (!restoringSession && (path === '/dashboard' || path === '/analytics') && !authenticated) {
      window.history.replaceState({}, '', '/login')
      window.dispatchEvent(new PopStateEvent('popstate'))
    }
  }, [path, authenticated, restoringSession])

  const logout = async () => { await endSession(); setAuthenticated(false); navigate('/') }
  const protectedPath = path === '/dashboard' || path === '/analytics'
  const unlockMatch = path.match(/^\/go\/([^/]+)\/unlock$/)
  const shortLinkMatch = path.match(/^\/go\/([^/]+)$/)
  if (unlockMatch) return <PasswordLinkPage alias={decodeURIComponent(unlockMatch[1])} navigate={navigate} />
  if (shortLinkMatch) return <ShortLinkPage alias={decodeURIComponent(shortLinkMatch[1])} navigate={navigate} />
  if (restoringSession) return <Box className="auth-page"><CircularProgress aria-label="Restoring session" /></Box>
  if (protectedPath && !authenticated) return <AuthPage kind="login" navigate={navigate} onAuthenticated={() => setAuthenticated(true)} />
  if (path === '/login') return <AuthPage kind="login" navigate={navigate} onAuthenticated={() => setAuthenticated(true)} />
  if (path === '/signup') return <AuthPage kind="signup" navigate={navigate} onAuthenticated={() => setAuthenticated(true)} />
  if (path === '/dashboard') return <Dashboard navigate={navigate} onLogout={logout} />
  if (path === '/analytics') return <Analytics navigate={navigate} onLogout={logout} />
  return <Home navigate={navigate} />
}
export default App
