"use client"

import { useEffect, useState } from "react"
import { BookOpen, Search, Calendar, Trash2 } from "lucide-react"
import Card from "./components/Card"
import Badge from "./components/Badge"
import Input from "./components/Input"
import { useUser } from "./UserContext"
import { getApiUrl } from "../config"

export default function History() {
  const user = useUser()
  const [searchTerm, setSearchTerm] = useState("")
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    async function fetchBooks() {
      if (!user) return
      try {
        const response = await fetch(getApiUrl(`books?user_id=${user.id}`))
        if (!response.ok) {
          throw new Error('Failed to fetch books')
        }
        const data = await response.json()
        setBooks(data)
      } catch (err) {
        console.error("❌ Failed to fetch books:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchBooks()
  }, [user])

  const handleDelete = async (book) => {
    if (!confirm("Are you sure you want to delete this book entry? This action cannot be undone.")) {
      return
    }

    const deleteKey = `${book.book_name}-${book.author_name}`
    setDeleting(deleteKey)

    try {
      const response = await fetch(getApiUrl('books/delete'), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          book_name: book.book_name,
          author_name: book.author_name
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to delete book')
      }

      // Remove the book from local state
      setBooks(books.filter(b => !(b.book_name === book.book_name && b.author_name === book.author_name)))
    } catch (err) {
      console.error("❌ Failed to delete book:", err)
      alert("Failed to delete book. Please try again.")
    } finally {
      setDeleting(null)
    }
  }

  const filteredBooks = books.filter((book) => {
    return (
      book.book_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author_name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  if (loading) return <p className="p-6">Loading your reading history...</p>

  if (!user) return <p className="p-6">Please sign in to view your reading history.</p>

  return (
    <div className="p-6 space-y-6">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 mb-3">Reading History</h1>
        <p className="text-slate-600">Track your reading journey and revisit your reflections</p>
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search by book title or author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-4">
          {filteredBooks.length === 0 ? (
            <Card className="text-center p-6">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-6 w-6 text-slate-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">No books found</h3>
              <p className="text-slate-600">
                {books.length === 0
                  ? "Start logging your reading journey by adding your first book!"
                  : "Try adjusting your search terms."}
              </p>
            </Card>
          ) : (
            filteredBooks.map((book) => (
              <Card key={book.id} className="border-slate-200 relative">
                <div className="p-6">
                  <div className="flex gap-4">
                    {/* Delete button */}
                    <button
                      onClick={() => handleDelete(book)}
                      disabled={deleting === `${book.book_name}-${book.author_name}`}
                      className="absolute top-4 right-4 p-2 text-slate-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50 shadow-md border border-slate-300 bg-white z-10"
                      title="Delete book entry"
                      style={{ opacity: 1 }}
                    >
                      {deleting === `${book.book_name}-${book.author_name}` ? (
                        <div className="h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                    <div className="w-12 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <BookOpen className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-slate-800 text-lg mb-1">{book.book_name}</h4>
                      <p className="text-sm text-slate-600 mb-2">by {book.author_name}</p>
                      <p className="text-slate-700 text-sm mb-2">{book.reflection}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(book.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
