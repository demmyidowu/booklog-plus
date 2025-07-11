import { useState, useEffect } from 'react'
import { useUser } from '../pages/UserContext'
import { trackEvent } from '../lib/analytics'
import { useUserProfile, useCompleteQuiz } from './useApi'

export function useQuiz() {
    const user = useUser()
    const [showQuiz, setShowQuiz] = useState(false)
    const { data: userProfile, isLoading: loading } = useUserProfile()
    const completeQuizMutation = useCompleteQuiz()

    const quizCompleted = userProfile?.quiz_completed || false

    const shouldShowQuiz = () => {
        if (!user || loading) return false
        
        // Don't show quiz if already completed
        if (quizCompleted) return false
        
        // Check if user has any books logged
        return !user.hasBooks // This would need to be determined elsewhere
    }

    const handleQuizComplete = async (quizResponses) => {
        try {
            const result = await completeQuizMutation.mutateAsync(quizResponses)
            
            // Update local state immediately
            setShowQuiz(false)
            
            // Store quiz-based recommendations in localStorage for immediate access
            if (result.recommendations) {
                localStorage.setItem('quizRecommendations', JSON.stringify({
                    recommendations: result.recommendations,
                    timestamp: Date.now()
                }))
            }
            
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
        // Show quiz modal
        setShowQuiz(true)
        
        // Clear stored recommendations so new ones will be generated
        localStorage.removeItem('quizRecommendations')
        
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