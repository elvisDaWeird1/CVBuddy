export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-gray-600 mb-6">Trang không tồn tại</p>
        <a href="/" className="text-blue-600 hover:underline">
          Quay về trang chủ
        </a>
      </div>
    </div>
  )
}
