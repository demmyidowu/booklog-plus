"use client"

// React hook for component state management
import { useState } from "react"
// User authentication context
import { useUser } from "./UserContext"
// Analytics tracking for user interactions
import { trackEvent, trackError } from '../lib/analytics'
// Custom UI components for forms and layout
import Button from "./components/Button"
import Input from "./components/Input"
import Textarea from "./components/Textarea"
import Card from "./components/Card"
// Toast notifications for user feedback
import { toast } from "react-hot-toast"
// API configuration for backend communication
import { getApiUrl } from "../config"

export default function LogBook({ onNavigate, isFirstTime }) {
  // TODO: Uncomment when analytics tracking is fully implemented
  //trackEvent('LogBook', 'A Book Was Logged')
  
  // Get current authenticated user from context
  const user = useUser()
  
  // Form state management for book entry
  const [formData, setFormData] = useState({
    book_name: "",    // Title of the book
    author_name: "",  // Author's name
    reflection: "",   // User's personal thoughts/reflection
  })

  // Loading state for form submission
  const [loading, setLoading] = useState(false)

  // Handle form input changes
  // Updates the form state when user types in any input field
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,  // Update specific field based on input name
    }))
  }

  // Handle form submission to add a new book entry
  const handleSubmit = async (e) => {
    e.preventDefault()  // Prevent default form submission behavior
    
    // Ensure user is authenticated before allowing book submission
    if (!user) {
      alert("Please sign in to log a book")
      return
    }

    setLoading(true)  // Show loading state during API call

    try {
      // Send POST request to backend API to save book entry
      const response = await fetch(getApiUrl("add"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,                    // Associate book with current user
          book_name: formData.book_name,       // Book title from form
          author_name: formData.author_name,   // Author name from form
          reflection: formData.reflection,     // User's reflection from form
        }),
      })

      if (!response.ok) {
        const error = new Error('Failed to save book')
        error.status = response.status
        error.statusText = response.statusText
        throw error
      }

      const result = await response.json()
      console.log("✅ Book saved:", result)

      toast.success('Book logged successfully!', {
        duration: 3000,
        style: {
          background: '#059669',
        },
      })
      trackEvent('Books', 'Book Logged Successfully')
      setFormData({ book_name: "", author_name: "", reflection: "" })

      setTimeout(() => {
        toast.success("Based on your reading, here are some perfect recommendations! ✨", {
          duration: 4000,
          style: {
            background: '#7C3AED',
          },
        })
        if (onNavigate) {
          // Set a flag in localStorage that Recommendations can check
          localStorage.setItem('autoFetchRecommendations', 'true')

          // Set URL and navigate
          const url = new URL(window.location)
          url.pathname = '/recommendations'
          window.history.replaceState({}, '', url.toString())

          setTimeout(() => {
            onNavigate('recommendations')
          }, 50)
        }
      }, 1500) // 1.5 second delay for smooth transition


    } catch (err) {
      console.error("❌ Failed to log book:", err)
      trackError(err, {
        userId: user?.id,
        book_name: formData.book_name,
        author_name: formData.author_name,
        status: err.status,
        statusText: err.statusText
      }, 'LogBook')
      toast.error('Failed to save book. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* First-time user progress indicator */}
      {isFirstTime && (
        <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">1</span>
              </div>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Step 1: Log Your First Book
              </h3>
              <p className="text-sm text-blue-600 mt-1">
                Tell us about a book you've recently read to get personalized recommendations
              </p>
            </div>
          </div>
        </div>
      )}


      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800 mb-3">
          {isFirstTime ? "Log Your First Book" : "Log a New Book"}
        </h1>
        <p className="text-slate-600">
          {isFirstTime
            ? "Start your reading journey and get personalized recommendations"
            : "Record your reading journey and get personalized recommendations"
          }
        </p>
      </div>

      <Card className="border-slate-200">
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="book_name" className="block text-sm font-medium text-slate-700 mb-1">
              Book Title
            </label>
            <Input
              id="book_name"
              name="book_name"
              value={formData.book_name}
              onChange={handleChange}
              placeholder="Enter the book title"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="author_name" className="block text-sm font-medium text-slate-700 mb-1">
              Author
            </label>
            <Input
              id="author_name"
              name="author_name"
              value={formData.author_name}
              onChange={handleChange}
              placeholder="Enter the author's name"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="reflection" className="block text-sm font-medium text-slate-700 mb-1">
              Why did you like this book, or what did you learn from it?
            </label>
            <Textarea
              id="reflection"
              name="reflection"
              value={formData.reflection}
              onChange={handleChange}
              placeholder="Share your thoughts about the book..."
              required
              disabled={loading}
            />
          </div>

          <Button
            type="submit"
            disabled={loading || !user}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? "Saving..." : isFirstTime ? "Log First Book" : "Log Book"}
          </Button>
          {loading && (
            <p className="text-center text-sm text-slate-600 mt-2">
              {isFirstTime
                ? "Great choice! We'll show you amazing recommendations next! ✨"
                : "We'll show you personalized recommendations next! ✨"
              }
            </p>
          )}
        </form>
      </Card>
    </div>
  )
}
