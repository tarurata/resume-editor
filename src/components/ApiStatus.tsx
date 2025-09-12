'use client'

import { useState, useEffect } from 'react'
import { healthApi } from '@/lib/api'

interface ApiStatusProps {
    className?: string
}

export default function ApiStatus({ className = '' }: ApiStatusProps) {
    const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking')
    const [lastChecked, setLastChecked] = useState<Date | null>(null)

    const checkApiStatus = async () => {
        try {
            await healthApi.check()
            setStatus('online')
            setLastChecked(new Date())
        } catch (error) {
            setStatus('offline')
            setLastChecked(new Date())
            console.warn('API is offline, using localStorage fallback')
        }
    }

    useEffect(() => {
        checkApiStatus()
        // Check every 30 seconds
        const interval = setInterval(checkApiStatus, 30000)
        return () => clearInterval(interval)
    }, [])

    const getStatusColor = () => {
        switch (status) {
            case 'online':
                return 'text-green-600 bg-green-100'
            case 'offline':
                return 'text-red-600 bg-red-100'
            case 'checking':
                return 'text-yellow-600 bg-yellow-100'
            default:
                return 'text-gray-600 bg-gray-100'
        }
    }

    const getStatusText = () => {
        switch (status) {
            case 'online':
                return 'API Online'
            case 'offline':
                return 'API Offline'
            case 'checking':
                return 'Checking...'
            default:
                return 'Unknown'
        }
    }

    return (
        <div className={`flex items-center space-x-2 ${className}`}>
            <div className={`w-2 h-2 rounded-full ${status === 'online' ? 'bg-green-500' :
                status === 'offline' ? 'bg-red-500' :
                    'bg-yellow-500 animate-pulse'
                }`} />
            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor()}`}>
                {getStatusText()}
            </span>
            {lastChecked && (
                <span className="text-xs text-gray-500">
                    {lastChecked.toLocaleTimeString()}
                </span>
            )}
        </div>
    )
}
