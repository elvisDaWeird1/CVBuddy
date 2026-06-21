import { MainLayout } from '@/layouts/ClientLayout/ClientLayout'

export function FormPage() {
  return (
    <MainLayout>
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-bold text-[var(--color-navy)]">Góp ý</h1>
        <p className="mt-4 text-[var(--color-text-secondary)]">
          Gửi góp ý hoặc phản hồi để chúng tôi cải thiện CV Buddy.
        </p>
      </div>
    </MainLayout>
  )
}

export default FormPage
