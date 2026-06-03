import { MainLayout } from '@/components/layout/MainLayout'

export function HomePage() {
  return (
    <MainLayout>
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <h1 className="text-3xl font-bold text-[var(--color-navy)]">Chào mừng đến CV Buddy</h1>
        <p className="mt-3 text-[var(--color-text-secondary)]">
          Xây dựng CV và Portfolio chuyên nghiệp cùng AI.
        </p>
      </div>
    </MainLayout>
  )
}
