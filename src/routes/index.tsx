import { RouterProvider } from 'react-router/dom'
import { appRouter } from './app-router.tsx'

export function AppRouter() {
  return <RouterProvider router={appRouter} />
}
