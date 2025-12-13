'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/AuthContext'

export default function Navbar() {
    const { isAuthenticated, logout } = useAuth()

    return (
        <nav className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <Link href="/" className="text-2xl font-bold text-indigo-600">
                                Resume Editor
                            </Link>
                        </div>
                    </div>
                    <div className="flex items-center">
                        {isAuthenticated ? (
                            <>
                                <Link href="/resumes" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                                    My Resumes
                                </Link>
                                <button
                                    onClick={logout}
                                    className="ml-4 px-3 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link href="/login" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                                    Login
                                </Link>
                                <Link href="/register" className="ml-4 px-3 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}
