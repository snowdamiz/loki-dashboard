import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Dashboard from './components/Dashboard'
import Login from './components/Login'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ToastContainer } from './components/ui/use-toast'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function AuthenticatedApp() {
  const { isAuthenticated, login, logout } = useAuth()

  if (!isAuthenticated) {
    return <Login onLogin={login} />
  }

  return <Dashboard onLogout={logout} />
}

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <AuthenticatedApp />
        <ToastContainer />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App
