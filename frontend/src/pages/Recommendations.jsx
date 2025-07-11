"use client"

// React hooks for component lifecycle and state management
import { useEffect, useState } from "react"
// User authentication context
import { useUser } from "./UserContext.jsx"
// Lucide React icons for UI elements
import { Lightbulb, RefreshCw, Sparkles, BookOpen, ExternalLink, Plus, X, BookmarkPlus, Brain } from "lucide-react"
// Analytics tracking for user interactions
import { trackEvent, trackError } from "../lib/analytics"
// Custom UI components
import Card from "./components/Card"
import Button from "./components/Button"
import Input from "./components/Input"
import Textarea from "./components/Textarea"
// Toast notifications for user feedback
import { toast } from "react-hot-toast"
// Quiz hook
import { useQuiz } from "../hooks/useQuiz"
// Cached API hooks
import { useUserBooks, useRecommendations, useAddBook, useAddToRead } from "../hooks/useApi"


export default function Recommendations() {
  // Get current authenticated user from context
  const user = useUser()
  const { quizCompleted, showQuizModal } = useQuiz()
  
  // Cached data hooks
  const { data: books = [], isLoading: booksLoading } = useUserBooks()
  const { data: recommendations = [], isLoading: recommendationsLoading, isFetching: recommendationsFetching, error, refetch: fetchRecommendations } = useRecommendations()
  const addBookMutation = useAddBook()
  const addToReadMutation = useAddToRead()
  
  // Local state
  const [hasRequested, setHasRequested] = useState(false)       // Track if user has requested recommendations
  const [quizRecommendations, setQuizRecommendations] = useState([]) // Quiz-based recommendations
  
  // Future reads integration states
  const [addingToFutureReads, setAddingToFutureReads] = useState(null)  // Track which book is being added
  const [processedBooks, setProcessedBooks] = useState(new Set())        // Track books already processed

  // Quick-log modal state (for immediately logging a recommended book as read)
  const [showQuickLog, setShowQuickLog] = useState(false)       // Show/hide quick log modal
  const [selectedBook, setSelectedBook] = useState(null)        // Book selected for quick logging
  const [reflection, setReflection] = useState("")              // User's reflection for quick log
  const [quickLogLoading, setQuickLogLoading] = useState(false) // Quick log submission loading state


  // Handle recommendation fetching with caching
  const handleFetchRecommendations = async () => {
    if (!user) return
    
    setHasRequested(true)
    try {
      await fetchRecommendations()
      trackEvent('Recommendations', 'Recommendations Fetched Successfully')
    } catch (err) {
      console.error("Error fetching recommendations:", err)
      trackError(err, {
        userId: user?.id,
        hasRequested,
      }, 'Recommendations')
    }
  }

  useEffect(() => {
    // Check if we should auto-fetch (coming from successful book log)
    const checkAutoFetch = () => {
      const shouldAutoFetch = localStorage.getItem('autoFetchRecommendations') === 'true'
      if (shouldAutoFetch) {
        localStorage.removeItem('autoFetchRecommendations')
        handleFetchRecommendations()
      }
    }

    checkAutoFetch()
  }, [user, hasRequested])

  // Check for quiz recommendations in localStorage
  useEffect(() => {
    const storedQuizRecs = localStorage.getItem('quizRecommendations')
    if (storedQuizRecs) {
      try {
        const { recommendations, timestamp } = JSON.parse(storedQuizRecs)
        // Only use quiz recommendations if they're less than 24 hours old
        const isRecent = Date.now() - timestamp < 24 * 60 * 60 * 1000
        if (isRecent && recommendations) {
          setQuizRecommendations(recommendations)
        } else {
          localStorage.removeItem('quizRecommendations')
        }
      } catch (e) {
        console.error('Error parsing quiz recommendations:', e)
        localStorage.removeItem('quizRecommendations')
      }
    }
  }, [])

  const hasBooks = books && books.length > 0

  // Handle quick-log modal
  const openQuickLog = (book) => {
    setSelectedBook(book)
    setReflection("")
    setShowQuickLog(true)
  }

  const closeQuickLog = () => {
    setShowQuickLog(false)
    setSelectedBook(null)
    setReflection("")
  }

  const handleQuickLogSubmit = async (e) => {
    e.preventDefault()
    if (!user || !selectedBook) return

    setQuickLogLoading(true)

    try {
      await addBookMutation.mutateAsync({
        book_name: selectedBook.title,
        author_name: selectedBook.author,
        reflection: reflection,
      })

      // Mark this book as processed
      setProcessedBooks(prev => new Set([...prev, selectedBook.title]))

      toast.success(`"${selectedBook.title}" logged successfully! 📚`, {
        duration: 3000,
        style: {
          background: '#7C3AED',
        },
      })

      trackEvent('Books', 'Recommended Book Logged')
      closeQuickLog()

    } catch (err) {
      console.error("❌ Failed to log recommended book:", err)
      trackError(err, {
        userId: user?.id,
        book_name: selectedBook?.title,
        author_name: selectedBook?.author,
      }, 'QuickLogRecommendedBook')
      toast.error('Failed to save book. Please try again.')
    } finally {
      setQuickLogLoading(false)
    }
  }
  const handleAddToFutureReads = async (book) => {
    if (!user) return

    setAddingToFutureReads(book.title)

    try {
      await addToReadMutation.mutateAsync({
        book_name: book.title,
        author_name: book.author,
      })

      // Mark this book as processed
      setProcessedBooks(prev => new Set([...prev, book.title]))

      toast.success(`"${book.title}" added to Future Reads! 📖`, {
        duration: 3000,
        style: {
          background: '#059669',
        },
      })

      trackEvent('Books', 'Book Added to Future Reads')

    } catch (err) {
      console.error("❌ Failed to add book to future reads:", err)
      trackError(err, {
        userId: user?.id,
        book_name: book.title,
        author_name: book.author,
      }, 'AddToFutureReads')

      if (err.message?.includes('already in your to-read list')) {
        toast.error('Book is already in your Future Reads!')
      } else {
        toast.error('Failed to add book to Future Reads. Please try again.')
      }
    } finally {
      setAddingToFutureReads(null)
    }
  }

  if (booksLoading) return <p className="p-6">Loading recommendations...</p>

  return (
    <>
      <div className="p-6 space-y-6">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-slate-800 mb-3">AI Recommendations</h1>
          <p className="text-slate-600">
            Get personalized book suggestions based on your reading history and preferences
          </p>
        </div>

        {/* Show quiz recommendations if user has completed quiz but has no books */}
        {quizRecommendations.length > 0 && !hasBooks ? (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Picked for You Based on Your Quiz</h3>
              <p className="text-slate-600 text-sm">
                Here are personalized recommendations based on your reading personality
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {quizRecommendations.map((book, index) => {
                const isProcessed = processedBooks.has(book.title)
                const isAddingThis = addingToFutureReads === book.title

                return (
                  <Card key={index} className="border-slate-200">
                    <div className="p-6">
                      <div className="flex flex-col gap-4">
                        <div className="w-12 h-16 bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg flex items-center justify-center">
                          <BookOpen className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-800 text-lg mb-1">{book.title}</h4>
                          <p className="text-sm text-slate-600 mb-2">by {book.author}</p>
                          <p className="text-slate-700 text-sm leading-relaxed mb-4">{book.description}</p>

                          <div className="space-y-3">
                            <Button
                              onClick={() => openQuickLog(book)}
                              disabled={isProcessed || isAddingThis}
                              className={`w-full text-sm ${isProcessed
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-purple-600 hover:bg-purple-700'
                                } text-white`}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              {isProcessed ? "Already processed" : "I've read this!"}
                            </Button>

                            <Button
                              onClick={() => handleAddToFutureReads(book)}
                              disabled={isProcessed || isAddingThis}
                              className={`w-full text-sm ${isProcessed
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-green-600 hover:bg-green-700'
                                } text-white`}
                            >
                              {isAddingThis ? (
                                <>
                                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                  Adding...
                                </>
                              ) : (
                                <>
                                  <BookmarkPlus className="h-4 w-4 mr-2" />
                                  {isProcessed ? "Already processed" : "Add to Future Reads"}
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
            <div className="text-center mt-8">
              <Button
                onClick={handleFetchRecommendations}
                disabled={recommendationsFetching}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {recommendationsFetching ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Getting More Recommendations...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Get More Recommendations
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : !hasRequested || (!error && recommendations.length === 0) ? (
          <div className="max-w-md mx-auto">
            <Card className="border-slate-200 text-center">
              <div className="p-8">
                {/* Show quiz prompt if user hasn't completed quiz and has no books */}
                {!quizCompleted && !hasBooks ? (
                  <>
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Brain className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">Get Your First Recommendations!</h3>
                    <p className="text-slate-600 mb-6 text-sm">
                      Take our Reading Personality Quiz to get personalized book recommendations tailored just for you
                    </p>
                    <Button
                      onClick={showQuizModal}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Brain className="h-4 w-4 mr-2" />
                      Take Quiz
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Lightbulb className="h-8 w-8 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">Ready for your next read?</h3>
                    <p className="text-slate-600 mb-6 text-sm">
                      Our AI will analyze your reading history and suggest three perfect books for you
                    </p>
                    <Button
                      onClick={handleFetchRecommendations}
                      disabled={recommendationsFetching}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      {recommendationsFetching ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Finding your perfect books...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Get Recommendations
                        </>
                      )}
                    </Button>
                  </>
                )}
              </div>
            </Card>
          </div>
        ) : error ? (
          <div className="max-w-md mx-auto">
            <Card className="border-slate-200 text-center p-6">
              <p className="text-red-600 mb-4">Error: {error}</p>
              <Button
                onClick={handleFetchRecommendations}
                disabled={recommendationsFetching}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Try Again
              </Button>
            </Card>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recommendations.map((book, index) => {
                const isProcessed = processedBooks.has(book.title)
                const isAddingThis = addingToFutureReads === book.title

                return (
                  <Card key={index} className="border-slate-200">
                    <div className="p-6">
                      <div className="flex flex-col gap-4">
                        <div className="w-12 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                          <BookOpen className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-800 text-lg mb-1">{book.title}</h4>
                          <p className="text-sm text-slate-600 mb-2">by {book.author}</p>
                          <p className="text-slate-700 text-sm leading-relaxed mb-4">{book.description}</p>

                          <div className="space-y-3">
                            {/* Quick Log Button */}
                            <Button
                              onClick={() => openQuickLog(book)}
                              disabled={isProcessed || isAddingThis}
                              className={`w-full text-sm ${isProcessed
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-purple-600 hover:bg-purple-700'
                                } text-white`}
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              {isProcessed ? "Already processed" : "I've read this!"}
                            </Button>

                            {/* Add to Future Reads Button */}
                            <Button
                              onClick={() => handleAddToFutureReads(book)}
                              disabled={isProcessed || isAddingThis}
                              className={`w-full text-sm ${isProcessed
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-green-600 hover:bg-green-700'
                                } text-white`}
                            >
                              {isAddingThis ? (
                                <>
                                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                  Adding...
                                </>
                              ) : (
                                <>
                                  <BookmarkPlus className="h-4 w-4 mr-2" />
                                  {isProcessed ? "Already processed" : "Add to Future Reads"}
                                </>
                              )}
                            </Button>


                            {/* Goodreads Link */}
                            {book.link && (
                              <a
                                href={book.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 transition-colors"
                              >
                                View on Goodreads
                                <ExternalLink className="h-3 w-3 ml-1" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
            <div className="text-center mt-8">
              <Button
                onClick={handleFetchRecommendations}
                disabled={recommendationsFetching}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {recommendationsFetching ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Getting New Recommendations...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Get New Recommendations
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Log Modal */}
      {showQuickLog && selectedBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md border-slate-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-800">Log This Book</h3>
                <button
                  onClick={closeQuickLog}
                  className="text-slate-400 hover:text-slate-600"
                  disabled={quickLogLoading}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleQuickLogSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Book Title
                  </label>
                  <Input
                    value={selectedBook.title}
                    disabled
                    className="bg-slate-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Author
                  </label>
                  <Input
                    value={selectedBook.author}
                    disabled
                    className="bg-slate-50"
                  />
                </div>

                <div>
                  <label htmlFor="quick-reflection" className="block text-sm font-medium text-slate-700 mb-1">
                    Why did you like this book, or what did you learn from it?
                  </label>
                  <Textarea
                    id="quick-reflection"
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                    placeholder="Share your thoughts about the book..."
                    required
                    disabled={quickLogLoading}
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    onClick={closeQuickLog}
                    disabled={quickLogLoading}
                    className="flex-1 bg-slate-200 hover:bg-slate-300 text-white-800 border border-slate-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={quickLogLoading || !reflection.trim()}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    {quickLogLoading ? "Logging..." : "Log Book"}
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      )}
    </>
  )
}

