"use client"
import { useEffect, useState } from "react"
import { useUser } from "./UserContext.jsx"
import { Lightbulb, RefreshCw, Sparkles, BookOpen } from "lucide-react"
import Card from "./components/Card"
import Button from "./components/Button"
import Badge from "./components/Badge"

export default function Recommendations() {
  const user = useUser()
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  const fetchRecommendations = async () => {
    if (!user) return
    setIsLoading(true)
    try {
      const res = await fetch("http://localhost:5000/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id }),
      })
      if (!res.ok) throw new Error('Failed to fetch recommendations')
      const data = await res.json()
      setRecommendations(data.recommendations || [])
    } catch (err) {
      console.error("Error fetching recommendations:", err)
    } finally {
      setIsLoading(false)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecommendations()
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

      {recommendations.length === 0 ? (
        <div className="max-w-md mx-auto">
          <Card className="border-slate-200 text-center">
            <div className="p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lightbulb className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Ready for your next read?</h3>
              <p className="text-slate-600 mb-6 text-sm">
                Our AI will analyze your reading history and suggest the perfect book for you
              </p>
              <Button
                onClick={fetchRecommendations}
                disabled={isLoading}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Finding your perfect book...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Get Recommendation
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto space-y-6">
          {recommendations.map((book, index) => (
            <Card key={index} className="border-slate-200">
              <div className="p-6">
                <div className="flex gap-6">
                  <div className="w-24 h-32 bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-slate-800 mb-2">{book.title}</h3>
                    <p className="text-lg text-slate-600 mb-3">by {book.author}</p>
                    <div className="flex items-center gap-3 mb-4">
                      <Badge>{book.genre}</Badge>
                      {book.rating && (
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-slate-600">Rating:</span>
                          <span className="text-sm font-medium">{book.rating}/5</span>
                        </div>
                      )}
                    </div>
                    <p className="text-slate-700 leading-relaxed">{book.description}</p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
          <div className="text-center">
            <Button
              onClick={fetchRecommendations}
              disabled={isLoading}
              variant="outline"
              className="border-slate-200"
            >
              {isLoading ? "Refreshing..." : "Get More Recommendations"}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

