import { MainLayout } from '@/components/layout/MainLayout'

export function AiBuddyPage() {
  return (
    <MainLayout>
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-bold text-[var(--color-navy)]">AI Buddy</h1>
        <p className="mt-4 text-[var(--color-text-secondary)]">
          Trợ lý AI giúp bạn phân tích và đề xuất cải thiện nội dung CV.
        </p>
      </div>
    </MainLayout>
  )
}
