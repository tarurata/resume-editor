'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from './AuthContext'
import { ComponentType } from 'react'

const withAuth = <P extends object>(WrappedComponent: ComponentType<P>) => {
  const ComponentWithAuth = (props: P) => {
    const { isAuthenticated, loading } = useAuth()
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
      // If not loading and not authenticated, redirect to login page.
      // We don't want to redirect if the user is already on the login or register page.
      if (!loading && !isAuthenticated && pathname !== '/login' && pathname !== '/register') {
        router.push('/login')
      }
    }, [isAuthenticated, loading, router, pathname])

    // While loading, show a spinner or nothing to prevent flicker
    if (loading) {
      return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading...</p>
              </div>
          </div>
      );
    }

    // If authenticated, or on a public route, render the component.
    // Otherwise, the useEffect will handle the redirect, so we render null.
    if (isAuthenticated || pathname === '/login' || pathname === '/register') {
      return <WrappedComponent {...props} />;
    }

    return null;
  }

  return ComponentWithAuth
}

export default withAuth
