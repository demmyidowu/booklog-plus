import { useState, useEffect } from 'react'
import { useUser } from '../pages/UserContext'
import { supabase } from '../lib/supabase'
import { trackEvent } from '../lib/analytics'

export function useFirstTimeUser() {
    const user = useUser()
    const [isFirstTime, setIsFirstTime] = useState(false)
    const [showWelcome, setShowWelcome] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user) {
            setLoading(false)
            return
        }

        checkFirstTimeUser()
    }, [user])

    const checkFirstTimeUser = async () => {
        try {
            // Check if user has logged any books
            const { data: books, error } = await supabase
                .from('books')
                .select('id')
                .eq('user_id', user.id)
                .limit(1)

            if (error) {
                console.error('Error checking books:', error)
                setLoading(false)
                return
            }

            const hasBooks = books && books.length > 0
            const isFirstTimeUser = !hasBooks

            // Also check localStorage to avoid showing welcome multiple times
            const hasSeenWelcome = localStorage.getItem(`welcome_shown_${user.id}`) === 'true'

            setIsFirstTime(isFirstTimeUser)

            // Show welcome if it's their first time AND they haven't seen the welcome before
            if (isFirstTimeUser && !hasSeenWelcome) {
                setShowWelcome(true)
                trackEvent('User', 'First Time User Detected')
            }

        } catch (err) {
            console.error('Error in checkFirstTimeUser:', err)
        } finally {
            setLoading(false)
        }
    }

    const markWelcomeShown = () => {
        if (user) {
            localStorage.setItem(`welcome_shown_${user.id}`, 'true')
            setShowWelcome(false)
            trackEvent('User', 'Welcome Modal Completed')
        }
    }

    const skipWelcome = () => {
        if (user) {
            localStorage.setItem(`welcome_shown_${user.id}`, 'true')
            setShowWelcome(false)
            trackEvent('User', 'Welcome Modal Skipped')
        }
    }

    return {
        isFirstTime,
        showWelcome,
        loading,
        markWelcomeShown,
        skipWelcome
    }
}