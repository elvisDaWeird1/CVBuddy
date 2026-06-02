import { BrowserRouter } from 'react-router-dom'
import { Routes, Route } from 'react-router-dom'
import { routeConfig } from './routes'
import { Suspense } from 'react'

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
        <Routes>
          {routeConfig.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
