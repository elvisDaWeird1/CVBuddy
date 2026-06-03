import { MainLayout } from '@/components/layout/MainLayout'

export function AboutUsPage() {
  return (
    <MainLayout>
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-bold text-[var(--color-navy)]">Về chúng tôi</h1>
        <p className="mt-4 text-[var(--color-text-secondary)]">
          CV Buddy được xây dựng với mục tiêu giúp sinh viên tạo CV và Portfolio chuyên nghiệp một cách dễ dàng.
        </p>
      </div>
    </MainLayout>
  )
}
