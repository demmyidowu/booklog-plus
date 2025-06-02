"use client"

import { useEffect, useState } from "react"
import { BookOpen, Search, Calendar } from "lucide-react"
import Card from "./components/Card"
import Badge from "./components/Badge"
import Input from "./components/Input"
import { useUser } from "./UserContext"

export default function History() {
  const user = useUser()
  const [searchTerm, setSearchTerm] = useState("")
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBooks() {
      if (!user) return
      try {
        const response = await fetch(`http://127.0.0.1:5000/books?user_id=${user.id}`)
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
              <Card key={book.id} className="border-slate-200">
                <div className="p-6">
                  <div className="flex gap-4">
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
