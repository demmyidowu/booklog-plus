import { useState, useEffect } from 'react'
import { useUser } from '../pages/UserContext'
import { supabase } from '../lib/supabase'
import { trackEvent } from '../lib/analytics'
import { getApiUrl } from '../config'

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
            // Check if user has logged any books using Flask API
            const response = await fetch(getApiUrl(`books?user_id=${user.id}`))

            if (!response.ok) {
                console.error('Error checking books: HTTP', response.status)
                setLoading(false)
                return
            }

            const books = await response.json()
            const hasBooks = books && books.length > 0
            
            // Also check if user has completed the quiz
            let hasCompletedQuiz = false
            try {
                const { data: profile } = await supabase
                    .table('User_Profile')
                    .select('quiz_completed')
                    .eq('user_id', user.id)
                    .single()
                
                hasCompletedQuiz = profile?.quiz_completed || false
            } catch (err) {
                // Profile doesn't exist yet, that's okay
                hasCompletedQuiz = false
            }
            
            // User is first time if they have no books AND haven't completed quiz
            const isFirstTimeUser = !hasBooks && !hasCompletedQuiz

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