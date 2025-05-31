"use client"

import { useState } from "react"
import { useUser } from "./UserContext"
import Button from "./components/Button"
import Input from "./components/Input"
import Textarea from "./components/Textarea"
import Card from "./components/Card"

export default function LogBook() {
  const user = useUser()
  const [formData, setFormData] = useState({
    title: "",
    author: "",
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
      const response = await fetch("http://127.0.0.1:5000/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          book_name: formData.title,
          author_name: formData.author,
          reflection: formData.reflection,
          user_id: user.id,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save book')
      }

      const result = await response.json()
      console.log("✅ Book saved:", result)

      alert("Book saved successfully!")
      setFormData({ title: "", author: "", reflection: "" })
    } catch (err) {
      console.error("❌ Failed to log book:", err)
      alert("Failed to log book. Please try again.")
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
            <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">
              Book Title
            </label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter the book title"
              required
            />
          </div>

          <div>
            <label htmlFor="author" className="block text-sm font-medium text-slate-700 mb-1">
              Author
            </label>
            <Input
              id="author"
              name="author"
              value={formData.author}
              onChange={handleChange}
              placeholder="Enter the author's name"
              required
            />
          </div>

          <div>
            <label htmlFor="reflection" className="block text-sm font-medium text-slate-700 mb-1">
              Your Reflection
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
