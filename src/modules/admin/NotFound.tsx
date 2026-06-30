export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-main)]">
      <div className="text-center">
        <h1 className="mb-4 text-6xl font-bold text-[var(--color-text-primary)]">404</h1>
        <p className="mb-6 text-[var(--color-text-secondary)]">Trang không tồn tại</p>
        <a href="/" className="text-[var(--color-teal)] hover:underline">
          Quay về trang chủ
        </a>
      </div>
    </div>
  )
}
