"use client"

// React hooks for component lifecycle and state management
import { useEffect, useState } from "react"
// Lucide React icons for UI elements
import { BookOpen, Search, Calendar, Trash2, Share, Edit } from "lucide-react"
// Custom UI components
import Card from "./components/Card"
import Badge from "./components/Badge"
import Input from "./components/Input"
import ShareModal from "./components/ShareModal"
import EditBookModal from "./components/EditBookModal"
// User authentication context
import { useUser } from "./UserContext"
// API configuration for backend communication
import { getApiUrl } from "../config"
// Toast notifications for user feedback
import { toast } from "react-hot-toast"

export default function History() {
  // Get current authenticated user from context
  const user = useUser()
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("")  // For filtering books by title/author
  
  // Books data and loading states
  const [books, setBooks] = useState([])           // User's complete reading history
  const [loading, setLoading] = useState(true)     // Initial data loading state
  const [deleting, setDeleting] = useState(null)   // Track which book is being deleted

  // Modal states
  const [showShareModal, setShowShareModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedBook, setSelectedBook] = useState(null)
  const [editLoading, setEditLoading] = useState(false)

  // Fetch user's reading history when component mounts or user changes
  useEffect(() => {
    async function fetchBooks() {
      // Don't fetch if user is not authenticated
      if (!user) return
      
      try {
        // Call backend API to get user's book collection
        const response = await fetch(getApiUrl(`books?user_id=${user.id}`))
        if (!response.ok) {
          throw new Error('Failed to fetch books')
        }
        
        // Parse JSON response and update state
        const data = await response.json()
        setBooks(data)  // Array of book objects with reflections
      } catch (err) {
        console.error("❌ Failed to fetch books:", err)
        // Could add toast notification here for user feedback
      } finally {
        setLoading(false)  // Always stop loading, even on error
      }
    }

    fetchBooks()
  }, [user])  // Re-run when user authentication state changes

  // Handle deletion of a book entry from user's history
  const handleDelete = async (book) => {
    // Confirm deletion with user to prevent accidental deletions
    if (!confirm("Are you sure you want to delete this book entry? This action cannot be undone.")) {
      return
    }

    // Create unique key for tracking deletion state
    const deleteKey = `${book.book_name}-${book.author_name}`
    setDeleting(deleteKey)  // Show loading state for this specific book

    try {
      // Send DELETE request to backend API
      const response = await fetch(getApiUrl('books/delete'), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,              // For security - ensure user owns the book
          book_name: book.book_name,     // Book identification
          author_name: book.author_name  // Additional identification
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

  // Handle opening share modal
  const handleShare = (book) => {
    setSelectedBook(book)
    setShowShareModal(true)
  }

  // Handle opening edit modal
  const handleEdit = (book) => {
    setSelectedBook(book)
    setShowEditModal(true)
  }

  // Handle closing modals
  const closeModals = () => {
    setShowShareModal(false)
    setShowEditModal(false)
    setSelectedBook(null)
  }

  // Handle saving edited book
  const handleEditSave = async (formData) => {
    if (!user || !selectedBook) return

    setEditLoading(true)

    try {
      const response = await fetch(getApiUrl('books/update'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          original_book_name: selectedBook.book_name,
          original_author_name: selectedBook.author_name,
          book_name: formData.book_name.trim(),
          author_name: formData.author_name.trim(),
          reflection: formData.reflection.trim()
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update book')
      }

      // Update the book in local state
      setBooks(books.map(book => 
        book.book_name === selectedBook.book_name && book.author_name === selectedBook.author_name
          ? { 
              ...book, 
              book_name: formData.book_name.trim(),
              author_name: formData.author_name.trim(),
              reflection: formData.reflection.trim()
            }
          : book
      ))

      toast.success('Book updated successfully!')
      closeModals()
    } catch (err) {
      console.error("❌ Failed to update book:", err)
      toast.error('Failed to update book. Please try again.')
    } finally {
      setEditLoading(false)
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
                    {/* Action buttons */}
                    <div className="absolute top-4 right-4 flex gap-1 z-10">
                      <button
                        onClick={() => handleShare(book)}
                        className="p-2 text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors shadow-md border border-slate-300 bg-white"
                        title="Share book"
                      >
                        <Share className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(book)}
                        className="p-2 text-slate-700 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors shadow-md border border-slate-300 bg-white"
                        title="Edit book"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(book)}
                        disabled={deleting === `${book.book_name}-${book.author_name}`}
                        className="p-2 text-slate-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 shadow-md border border-slate-300 bg-white"
                        title="Delete book entry"
                      >
                        {deleting === `${book.book_name}-${book.author_name}` ? (
                          <div className="h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
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

      {/* Share Modal */}
      <ShareModal
        book={selectedBook}
        isOpen={showShareModal}
        onClose={closeModals}
        source="history"
      />

      {/* Edit Modal */}
      <EditBookModal
        book={selectedBook}
        isOpen={showEditModal}
        onClose={closeModals}
        onSave={handleEditSave}
        includeReflection={true}
        loading={editLoading}
      />
    </div>
  )
}
