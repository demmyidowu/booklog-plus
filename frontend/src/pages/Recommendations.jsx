"use client"
import { useEffect, useState } from "react"
import { useUser } from "./UserContext.jsx"
import { Lightbulb, RefreshCw, Sparkles, BookOpen, ExternalLink, Plus, X } from "lucide-react"
import { trackEvent, trackError } from "../lib/analytics"
import Card from "./components/Card"
import Button from "./components/Button"
import Input from "./components/Input"
import Textarea from "./components/Textarea"
import { getApiUrl } from "../config"
import { toast } from "react-hot-toast"


export default function Recommendations() {
  const user = useUser()
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [hasRequested, setHasRequested] = useState(false)

  // Quick-log modal state
  const [showQuickLog, setShowQuickLog] = useState(false)
  const [selectedBook, setSelectedBook] = useState(null)
  const [reflection, setReflection] = useState("")
  const [quickLogLoading, setQuickLogLoading] = useState(false)


  const fetchRecommendations = async () => {
    if (!user) return
    setIsLoading(true)
    setError(null)
    setHasRequested(true)
    try {
      const res = await fetch(getApiUrl(`recommend?user_id=${user.id}`))
      if (!res.ok) {
        const error = new Error('Failed to fetch recommendations')
        error.status = res.status
        throw error
      }
      const data = await res.json()

      // Validate we got exactly 3 recommendations
      if (!data.recommendations || !Array.isArray(data.recommendations) || data.recommendations.length !== 3) {
        const error = new Error('Invalid recommendations format')
        error.data = data
        throw error
      }

      setRecommendations(data.recommendations)
      trackEvent('Recommendations', 'Recommendations Fetched Successfully')
    } catch (err) {
      console.error("Error fetching recommendations:", err)
      trackError(err, {
        userId: user?.id,
        hasRequested,
        status: err.status,
        data: err.data
      }, 'Recommendations')
      setError(err.message)
    } finally {
      setIsLoading(false)
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      setLoading(false)
    }

    // Check if we should auto-fetch (coming from successful book log)
    const checkAutoFetch = () => {
      const shouldAutoFetch = localStorage.getItem('autoFetchRecommendations') === 'true'
      if (shouldAutoFetch) {
        localStorage.removeItem('autoFetchRecommendations')
        fetchRecommendations()
      }
    }

    checkAutoFetch()
  }, [user, hasRequested])

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
      const response = await fetch(getApiUrl("add"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          book_name: selectedBook.title,
          author_name: selectedBook.author,
          reflection: reflection,
        }),
      })

      if (!response.ok) {
        const error = new Error('Failed to save book')
        error.status = response.status
        error.statusText = response.statusText
        throw error
      }

      const result = await response.json()
      console.log("✅ Recommended book logged:", result)

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
        status: err.status,
        statusText: err.statusText
      }, 'QuickLogRecommendedBook')
      toast.error('Failed to save book. Please try again.')
    } finally {
      setQuickLogLoading(false)
    }
  }

  if (loading) return <p className="p-6">Loading recommendations...</p>

  return (
    <>
      <div className="p-6 space-y-6">
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-slate-800 mb-3">AI Recommendations</h1>
          <p className="text-slate-600">
            Get personalized book suggestions based on your reading history and preferences
          </p>
        </div>

        {!hasRequested || (!error && recommendations.length === 0) ? (
          <div className="max-w-md mx-auto">
            <Card className="border-slate-200 text-center">
              <div className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lightbulb className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Ready for your next read?</h3>
                <p className="text-slate-600 mb-6 text-sm">
                  Our AI will analyze your reading history and suggest three perfect books for you
                </p>
                <Button
                  onClick={fetchRecommendations}
                  disabled={isLoading}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {isLoading ? (
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
              </div>
            </Card>
          </div>
        ) : error ? (
          <div className="max-w-md mx-auto">
            <Card className="border-slate-200 text-center p-6">
              <p className="text-red-600 mb-4">Error: {error}</p>
              <Button
                onClick={fetchRecommendations}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Try Again
              </Button>
            </Card>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recommendations.map((book, index) => (
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
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            I've read this!
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
              ))}
            </div>
            <div className="text-center mt-8">
              <Button
                onClick={fetchRecommendations}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading ? (
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

