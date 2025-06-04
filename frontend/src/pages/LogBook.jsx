"use client"

import { useState } from "react"
import { useUser } from "./UserContext"
import { trackEvent, trackError } from '../lib/analytics'
import Button from "./components/Button"
import Input from "./components/Input"
import Textarea from "./components/Textarea"
import Card from "./components/Card"
import { toast } from "react-hot-toast"
import { getApiUrl } from "../config"

export default function LogBook() {
  //trackEvent('LogBook', 'A Book Was Logged')
  const user = useUser()
  const [formData, setFormData] = useState({
    book_name: "",
    author_name: "",
    reflection: "",
  })

  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) {
      alert("Please sign in to log a book")
      return
    }

    setLoading(true)

    try {
      const response = await fetch(getApiUrl("add"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          book_name: formData.book_name,
          author_name: formData.author_name,
          reflection: formData.reflection,
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

      toast.success('Book logged successfully!')
      trackEvent('Books', 'Book Logged Successfully')
      setFormData({ book_name: "", author_name: "", reflection: "" })
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
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800 mb-3">Log a New Book</h1>
        <p className="text-slate-600">Record your reading journey and reflections</p>
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
            />
          </div>

          <Button
            type="submit"
            disabled={loading || !user}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? "Saving..." : "Save Book"}
          </Button>
        </form>
      </Card>
    </div>
  )
}
