'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from './AuthContext'
import { ComponentType } from 'react'

const withAuth = <P extends object>(WrappedComponent: ComponentType<P>) => {
  const ComponentWithAuth = (props: P) => {
    const { isAuthenticated } = useAuth()
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
      if (!isAuthenticated && pathname !== '/login' && pathname !== '/register') {
        router.push('/login')
      }
    }, [isAuthenticated, router, pathname])

    return isAuthenticated || pathname === '/login' || pathname === '/register' ? <WrappedComponent {...props} /> : null
  }

  return ComponentWithAuth
}

export default withAuth
