'use client'

import { useUser, useRole } from '@/lib/auth/hooks'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface AuthCheckProps {
  children: React.ReactNode
  requireAuth?: boolean
  requireAdmin?: boolean
  redirectTo?: string
  fallback?: React.ReactNode
}

export function AuthCheck({
  children,
  requireAuth = false,
  requireAdmin = false,
  redirectTo = '/login',
  fallback = <div>Loading...</div>,
}: AuthCheckProps) {
  const { user, loading: userLoading } = useUser()
  const { isAdmin, loading: roleLoading } = useRole()
  const router = useRouter()

  useEffect(() => {
    if (userLoading || roleLoading) return

    if (requireAuth && !user) {
      router.push(redirectTo)
      return
    }

    if (requireAdmin && !isAdmin) {
      router.push('/dashboard')
      return
    }
  }, [user, isAdmin, userLoading, roleLoading, requireAuth, requireAdmin, redirectTo, router])

  if (userLoading || roleLoading) {
    return fallback
  }

  if (requireAuth && !user) {
    return null
  }

  if (requireAdmin && !isAdmin) {
    return null
  }

  return <>{children}</>
}