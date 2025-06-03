import { useState, useEffect } from 'react'
import { AlertCircle, X } from 'lucide-react'

export default function AnalyticsNotice() {
    const [isBlocked, setIsBlocked] = useState(false)
    const [isDismissed, setIsDismissed] = useState(false)

    useEffect(() => {
        // Check if analytics is blocked by trying to load the GA script
        const checkAnalytics = async () => {
            try {
                const response = await fetch('https://www.google-analytics.com/analytics.js', {
                    mode: 'no-cors'  // This is required for the check to work
                })
                setIsBlocked(false)
            } catch (error) {
                setIsBlocked(true)
            }
        }

        checkAnalytics()
    }, [])

    if (!isBlocked || isDismissed) return null

    return (
        <div className="fixed bottom-4 right-4 max-w-sm bg-white rounded-lg shadow-lg border border-slate-200 p-4">
            <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <div className="flex-1">
                    <h4 className="text-sm font-medium text-slate-900">Analytics Blocked</h4>
                    <p className="mt-1 text-sm text-slate-600">
                        We noticed that analytics is blocked. To help us improve BookLog+, consider allowing analytics in your browser settings or ad blocker.
                    </p>
                    <div className="mt-3">
                        <button
                            onClick={() => setIsDismissed(true)}
                            className="text-sm font-medium text-blue-600 hover:text-blue-500"
                        >
                            Got it
                        </button>
                    </div>
                </div>
                <button
                    onClick={() => setIsDismissed(true)}
                    className="flex-shrink-0 text-slate-400 hover:text-slate-500"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>
        </div>
    )
} 