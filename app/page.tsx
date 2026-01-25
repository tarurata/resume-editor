'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // We assume the token is stored in localStorage with the key 'token'.
    // This is a common convention, but it's based on the assumption that
    // the `login` function from your AuthContext saves it this way.
    const token = localStorage.getItem('token')

    if (token) {
      router.push('/resumes')
    } else {
      router.push('/login')
    }
  }, [router])

  // Render nothing or a loading indicator while the redirect is happening
  return null
}
