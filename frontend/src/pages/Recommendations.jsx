"use client"
import { useEffect, useState } from "react"
import { useUser } from "./UserContext.jsx"
import { Lightbulb, RefreshCw, Sparkles, BookOpen, ExternalLink } from "lucide-react"
import { trackEvent, trackError } from "../lib/analytics"
import Card from "./components/Card"
import Button from "./components/Button"

export default function Recommendations() {
  const user = useUser()
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [hasRequested, setHasRequested] = useState(false)

  const fetchRecommendations = async () => {
    if (!user) return
    setIsLoading(true)
    setError(null)
    setHasRequested(true)
    try {
      const res = await fetch(`http://127.0.0.1:5000/recommend?user_id=${user.id}`)
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
  }, [user])

  if (loading) return <p className="p-6">Loading recommendations...</p>

  return (
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
  )
}

