import { AppRouter } from './routes'
import { AuthSessionBoundary } from './modules/auth/AuthSessionBoundary'

function App() {
  return (
    <AuthSessionBoundary>
      <AppRouter />
    </AuthSessionBoundary>
  )
}

export default App
