import { MainLayout } from '@/components/layout/MainLayout'

export function ProjectPage() {
  return (
    <MainLayout>
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-bold text-[var(--color-navy)]">Về dự án</h1>
        <p className="mt-4 text-[var(--color-text-secondary)]">
          CV Buddy — nền tảng xây dựng CV &amp; Portfolio thông minh, tích hợp AI gợi ý cải thiện nội dung.
        </p>
      </div>
    </MainLayout>
  )
}
