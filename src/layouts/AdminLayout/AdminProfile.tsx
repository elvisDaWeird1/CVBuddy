import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthAvatarMenu } from '@/layouts/ClientLayout/AuthAvatarMenu'
import { logout } from '@/modules/auth/authApi'
import { clearAuthSession } from '@/modules/auth/authStorage'
import { useAuthSession } from '@/modules/auth/useAuthSession'

export function AdminProfile() {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const navigate = useNavigate()
  const { account } = useAuthSession()
  const name = account?.fullName?.trim() || account?.companyName?.trim() || 'Administrator'
  const email = account?.email?.trim() || 'Admin account'

  const handleLogout = async () => {
    if (isLoggingOut) return

    setIsLoggingOut(true)
    try {
      await logout()
    } catch {
      // Local cleanup and redirect are still required when the server rejects the token.
    } finally {
      clearAuthSession()
      navigate('/login', { replace: true })
      setIsLoggingOut(false)
    }
  }

  return (
    <div className="border-t border-white/15 px-3 pt-4">
      <div className="flex items-center gap-3 rounded-[var(--radius-lg)] px-2 py-2 transition-colors hover:bg-white/10">
        <AuthAvatarMenu
          account={account}
          buttonClassName="h-10 w-10 border-white/20 bg-white/10 text-[var(--color-cyan)] hover:border-[var(--color-cyan)] hover:bg-white/15"
          className="shrink-0"
          menuClassName="bottom-[calc(100%+0.5rem)] left-0 right-auto top-auto"
          onLogout={() => void handleLogout()}
          profileLabel="User overview"
          profileTo="/admin"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-[var(--color-text-on-navy)]">{name}</p>
          <p className="mt-0.5 truncate text-xs text-white/60">{email}</p>
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-cyan)]">Admin</p>
        </div>
      </div>
    </div>
  )
}
