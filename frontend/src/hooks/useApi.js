import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useUser } from '../pages/UserContext'
import { supabase } from '../lib/supabase'
import { getApiUrl } from '../config'
import { trackEvent, trackError } from '../lib/analytics'

// Query Keys - centralized for easy cache invalidation
export const QUERY_KEYS = {
  userBooks: (userId) => ['books', userId],
  userToRead: (userId) => ['toRead', userId],
  userProfile: (userId) => ['profile', userId],
  recommendations: (userId) => ['recommendations', userId],
  quizRecommendations: (userId) => ['quizRecommendations', userId],
}

// Custom hook for fetching user's books with caching
export function useUserBooks() {
  const user = useUser()
  
  return useQuery({
    queryKey: QUERY_KEYS.userBooks(user?.id),
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated')
      
      const response = await fetch(getApiUrl(`books?user_id=${user.id}`))
      if (!response.ok) throw new Error('Failed to fetch books')
      
      const books = await response.json()
      return books
    },
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000, // 10 minutes - books don't change often
    gcTime: 30 * 60 * 1000, // 30 minutes
  })
}

// Custom hook for fetching user's to-read list with caching
export function useUserToRead() {
  const user = useUser()
  
  return useQuery({
    queryKey: QUERY_KEYS.userToRead(user?.id),
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated')
      
      const response = await fetch(getApiUrl(`to-read?user_id=${user.id}`))
      if (!response.ok) throw new Error('Failed to fetch to-read list')
      
      const toRead = await response.json()
      return toRead
    },
    enabled: !!user?.id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  })
}

// Custom hook for fetching user profile with caching
export function useUserProfile() {
  const user = useUser()
  
  return useQuery({
    queryKey: QUERY_KEYS.userProfile(user?.id),
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated')
      
      const { data, error } = await supabase
        .from('User_Profile')
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      if (error && error.code !== 'PGRST116') throw error
      return data
    },
    enabled: !!user?.id,
    staleTime: 30 * 60 * 1000, // 30 minutes - profile changes rarely
    gcTime: 60 * 60 * 1000, // 1 hour
  })
}

// Custom hook for fetching AI recommendations with controlled caching
export function useRecommendations() {
  const user = useUser()
  
  return useQuery({
    queryKey: QUERY_KEYS.recommendations(user?.id),
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated')
      
      const response = await fetch(getApiUrl(`recommend?user_id=${user.id}`))
      if (!response.ok) throw new Error('Failed to fetch recommendations')
      
      const data = await response.json()
      return data.recommendations
    },
    enabled: false, // Only fetch when explicitly requested
    staleTime: 0, // Always consider data stale to show loading on refetch
    gcTime: 3 * 60 * 60 * 1000, // 3 hours cache for background data
  })
}

// Mutation hook for adding books with optimistic updates
export function useAddBook() {
  const queryClient = useQueryClient()
  const user = useUser()
  
  return useMutation({
    mutationFn: async (bookData) => {
      const response = await fetch(getApiUrl('add'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          ...bookData
        })
      })
      
      if (!response.ok) throw new Error('Failed to add book')
      return response.json()
    },
    onSuccess: () => {
      // Invalidate and refetch books list
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.userBooks(user?.id) })
      trackEvent('Books', 'Book Added Successfully')
    },
    onError: (error) => {
      trackError(error, { userId: user?.id }, 'AddBook')
    }
  })
}

// Mutation hook for adding to-read books
export function useAddToRead() {
  const queryClient = useQueryClient()
  const user = useUser()
  
  return useMutation({
    mutationFn: async (bookData) => {
      const response = await fetch(getApiUrl('to-read/add'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          ...bookData
        })
      })
      
      if (!response.ok) throw new Error('Failed to add to reading list')
      return response.json()
    },
    onSuccess: () => {
      // Invalidate and refetch to-read list
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.userToRead(user?.id) })
      trackEvent('Books', 'Book Added to Future Reads')
    },
    onError: (error) => {
      trackError(error, { userId: user?.id }, 'AddToRead')
    }
  })
}

// Mutation hook for deleting books
export function useDeleteBook() {
  const queryClient = useQueryClient()
  const user = useUser()
  
  return useMutation({
    mutationFn: async ({ book_name, author_name }) => {
      const response = await fetch(getApiUrl('books/delete'), {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          book_name,
          author_name
        })
      })
      
      if (!response.ok) throw new Error('Failed to delete book')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.userBooks(user?.id) })
      trackEvent('Books', 'Book Deleted')
    },
    onError: (error) => {
      trackError(error, { userId: user?.id }, 'DeleteBook')
    }
  })
}

// Mutation hook for deleting to-read books
export function useDeleteToRead() {
  const queryClient = useQueryClient()
  const user = useUser()
  
  return useMutation({
    mutationFn: async ({ book_name, author_name }) => {
      const response = await fetch(getApiUrl('to-read/delete'), {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          book_name,
          author_name
        })
      })
      
      if (!response.ok) throw new Error('Failed to delete to-read book')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.userToRead(user?.id) })
      trackEvent('Books', 'Future Read Deleted')
    },
    onError: (error) => {
      trackError(error, { userId: user?.id }, 'DeleteToRead')
    }
  })
}

// Mutation hook for updating books
export function useUpdateBook() {
  const queryClient = useQueryClient()
  const user = useUser()
  
  return useMutation({
    mutationFn: async (bookData) => {
      const response = await fetch(getApiUrl('books/update'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          ...bookData
        })
      })
      
      if (!response.ok) throw new Error('Failed to update book')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.userBooks(user?.id) })
      trackEvent('Books', 'Book Updated')
    },
    onError: (error) => {
      trackError(error, { userId: user?.id }, 'UpdateBook')
    }
  })
}

// Mutation hook for updating to-read books
export function useUpdateToRead() {
  const queryClient = useQueryClient()
  const user = useUser()
  
  return useMutation({
    mutationFn: async (bookData) => {
      const response = await fetch(getApiUrl('to-read/update'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          ...bookData
        })
      })
      
      if (!response.ok) throw new Error('Failed to update to-read book')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.userToRead(user?.id) })
      trackEvent('Books', 'Future Read Updated')
    },
    onError: (error) => {
      trackError(error, { userId: user?.id }, 'UpdateToRead')
    }
  })
}

// Mutation hook for quiz completion with extended caching
export function useCompleteQuiz() {
  const queryClient = useQueryClient()
  const user = useUser()
  
  return useMutation({
    mutationFn: async (quizResponses) => {
      const response = await fetch(getApiUrl('quiz-recommendations'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          quiz_responses: quizResponses
        })
      })
      
      if (!response.ok) throw new Error('Failed to complete quiz')
      return response.json()
    },
    onSuccess: (data) => {
      // Update user profile cache
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.userProfile(user?.id) })
      
      // Cache quiz recommendations with extended expiry
      queryClient.setQueryData(
        QUERY_KEYS.quizRecommendations(user?.id),
        data.recommendations,
        {
          staleTime: 7 * 24 * 60 * 60 * 1000, // 7 days for quiz recommendations
        }
      )
      
      trackEvent('Quiz', 'Quiz Completed Successfully')
    },
    onError: (error) => {
      trackError(error, { userId: user?.id }, 'CompleteQuiz')
    }
  })
}

// Hook for generating book synopsis with caching
export function useGenerateSynopsis() {
  return useMutation({
    mutationFn: async ({ book_name, author_name, source = 'history' }) => {
      const response = await fetch(getApiUrl('generate-synopsis'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          book_name,
          author_name,
          source
        })
      })
      
      if (!response.ok) throw new Error('Failed to generate synopsis')
      return response.json()
    },
    onSuccess: () => {
      trackEvent('Books', 'Synopsis Generated')
    },
    onError: (error) => {
      trackError(error, {}, 'GenerateSynopsis')
    }
  })
}

// Utility hook for invalidating all user data (useful for logout)
export function useInvalidateUserData() {
  const queryClient = useQueryClient()
  const user = useUser()
  
  return () => {
    queryClient.removeQueries({ queryKey: ['books', user?.id] })
    queryClient.removeQueries({ queryKey: ['toRead', user?.id] })
    queryClient.removeQueries({ queryKey: ['profile', user?.id] })
    queryClient.removeQueries({ queryKey: ['recommendations', user?.id] })
    queryClient.removeQueries({ queryKey: ['quizRecommendations', user?.id] })
  }
}