'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './AuthContext'
import { ComponentType } from 'react'

const withAuth = <P extends object>(WrappedComponent: ComponentType<P>) => {
  const ComponentWithAuth = (props: P) => {
    const { isAuthenticated } = useAuth()
    const router = useRouter()

    useEffect(() => {
      if (!isAuthenticated) {
        router.push('/login')
      }
    }, [isAuthenticated, router])

    return isAuthenticated ? <WrappedComponent {...props} /> : null
  }

  return ComponentWithAuth
}

export default withAuth
