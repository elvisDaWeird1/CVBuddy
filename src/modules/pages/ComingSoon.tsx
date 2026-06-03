import { MainLayout } from '@/components/layout/MainLayout'

export function ComingSoonPage() {
  return (
    <MainLayout>
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <h1 className="text-3xl font-bold text-[var(--color-navy)]">Coming Soon</h1>
        <p className="mt-3 text-[var(--color-text-secondary)]">
          Tính năng này đang được phát triển. Hãy quay lại sau nhé!
        </p>
      </div>
    </MainLayout>
  )
}
