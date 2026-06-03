import { Outlet } from 'react-router-dom'
import { Header } from '@/layouts/ClientLayout/Header'
import { Footer } from '@/layouts/ClientLayout/Footer'

export function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg-main)]">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
