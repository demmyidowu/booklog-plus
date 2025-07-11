import { useState, useEffect } from 'react'
import { useUser } from '../pages/UserContext'
import { supabase } from '../lib/supabase'
import { trackEvent } from '../lib/analytics'
import { getApiUrl } from '../config'

export function useQuiz() {
    const user = useUser()
    const [quizCompleted, setQuizCompleted] = useState(false)
    const [showQuiz, setShowQuiz] = useState(false)
    const [loading, setLoading] = useState(true)
    const [userProfile, setUserProfile] = useState(null)

    useEffect(() => {
        if (!user) {
            setLoading(false)
            return
        }

        checkQuizStatus()
    }, [user])

    const checkQuizStatus = async () => {
        try {
            // Check if user has completed the quiz by looking at User_Profile
            const { data, error } = await supabase
                .table('User_Profile')
                .select('quiz_completed, quiz_responses, reading_interests, reading_goal, reading_pace, experience_level, preferred_genres')
                .eq('user_id', user.id)
                .single()

            if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
                console.error('Error checking quiz status:', error)
                setLoading(false)
                return
            }

            if (data) {
                setQuizCompleted(data.quiz_completed || false)
                setUserProfile(data)
            } else {
                setQuizCompleted(false)
                setUserProfile(null)
            }

        } catch (err) {
            console.error('Error in checkQuizStatus:', err)
        } finally {
            setLoading(false)
        }
    }

    const shouldShowQuiz = () => {
        if (!user || loading) return false
        
        // Don't show quiz if already completed
        if (quizCompleted) return false
        
        // Check if user has any books logged
        return !user.hasBooks // This would need to be determined elsewhere
    }

    const handleQuizComplete = async (quizResponses) => {
        try {
            // Submit quiz responses to backend
            const response = await fetch(getApiUrl('quiz-recommendations'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: user.id,
                    quiz_responses: quizResponses
                })
            })

            if (!response.ok) {
                throw new Error('Failed to submit quiz responses')
            }

            const result = await response.json()
            
            // Update local state
            setQuizCompleted(true)
            setShowQuiz(false)
            
            // Track completion
            trackEvent('Quiz', 'Quiz Completed')
            
            // Store quiz-based recommendations in localStorage for immediate access
            if (result.recommendations) {
                localStorage.setItem('quizRecommendations', JSON.stringify({
                    recommendations: result.recommendations,
                    timestamp: Date.now()
                }))
            }

            // Refresh user profile data
            await checkQuizStatus()
            
            return result

        } catch (error) {
            console.error('Error completing quiz:', error)
            trackEvent('Quiz', 'Quiz Error', error.message)
            throw error
        }
    }

    const showQuizModal = () => {
        setShowQuiz(true)
        trackEvent('Quiz', 'Quiz Modal Opened')
    }

    const hideQuizModal = () => {
        setShowQuiz(false)
        trackEvent('Quiz', 'Quiz Modal Closed')
    }

    const retakeQuiz = () => {
        setQuizCompleted(false)
        setShowQuiz(true)
        trackEvent('Quiz', 'Quiz Retaken')
    }

    return {
        quizCompleted,
        showQuiz,
        loading,
        userProfile,
        shouldShowQuiz,
        handleQuizComplete,
        showQuizModal,
        hideQuizModal,
        retakeQuiz
    }
}