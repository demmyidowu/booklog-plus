"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import Card from "./Card"
import Button from "./Button"
import Input from "./Input"
import Textarea from "./Textarea"

export default function EditBookModal({ 
  book, 
  onClose, 
  onSave, 
  isOpen, 
  includeReflection = false,
  loading = false 
}) {
  const [formData, setFormData] = useState({
    book_name: "",
    author_name: "",
    reflection: ""
  })

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen && book) {
      setFormData({
        book_name: book.book_name || "",
        author_name: book.author_name || "",
        reflection: book.reflection || ""
      })
    }
  }, [isOpen, book])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.book_name.trim() || !formData.author_name.trim()) return
    if (includeReflection && !formData.reflection.trim()) return

    onSave(formData)
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const isFormValid = () => {
    const basicValid = formData.book_name.trim() && formData.author_name.trim()
    const reflectionValid = !includeReflection || formData.reflection.trim()
    return basicValid && reflectionValid
  }

  const hasChanges = () => {
    if (!book) return false
    
    return (
      formData.book_name !== (book.book_name || "") ||
      formData.author_name !== (book.author_name || "") ||
      (includeReflection && formData.reflection !== (book.reflection || ""))
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md border-slate-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800">Edit Book</h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600"
              disabled={loading}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Book Title
              </label>
              <Input
                value={formData.book_name}
                onChange={(e) => handleChange('book_name', e.target.value)}
                placeholder="Enter the book title"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Author
              </label>
              <Input
                value={formData.author_name}
                onChange={(e) => handleChange('author_name', e.target.value)}
                placeholder="Enter the author's name"
                required
                disabled={loading}
              />
            </div>

            {includeReflection && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Reflection
                </label>
                <Textarea
                  value={formData.reflection}
                  onChange={(e) => handleChange('reflection', e.target.value)}
                  placeholder="Share your thoughts about the book..."
                  required
                  disabled={loading}
                />
              </div>
            )}

            <div className="flex gap-3">
              <Button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 border border-slate-300"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !isFormValid() || !hasChanges()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  )
}