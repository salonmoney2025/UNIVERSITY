'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    // Clear all authentication data
    localStorage.clear()
    sessionStorage.clear()

    // Clear cookies by setting them to expire
    document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'

    // Redirect to login after a short delay
    setTimeout(() => {
      router.push('/login')
    }, 500)
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-lg">Logging out...</p>
      </div>
    </div>
  )
}
