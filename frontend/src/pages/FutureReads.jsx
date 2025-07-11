"use client"

// React hooks for component lifecycle and state management
import { useEffect, useState } from "react"
// Lucide React icons for UI elements
import { BookOpen, Search, Calendar, Trash2, Plus, CheckCircle, X, ExternalLink, Share, Edit } from "lucide-react"
// Custom UI components
import Card from "./components/Card"
import Input from "./components/Input"
import Textarea from "./components/Textarea"
import Button from "./components/Button"
import ShareModal from "./components/ShareModal"
import EditBookModal from "./components/EditBookModal"
// User authentication context
import { useUser } from "./UserContext"
// Toast notifications for user feedback
import { toast } from "react-hot-toast"
// Analytics tracking for user interactions
import { trackEvent, trackError } from "../lib/analytics"
// Cached API hooks
import { useUserToRead, useAddToRead, useDeleteToRead, useUpdateToRead, useAddBook } from "../hooks/useApi"

export default function FutureReads() {
    // Get current authenticated user from context
    const user = useUser()
    
    // Cached data hooks
    const { data: books = [], isLoading: loading, error: booksError } = useUserToRead()
    const addToReadMutation = useAddToRead()
    const deleteToReadMutation = useDeleteToRead()
    const updateToReadMutation = useUpdateToRead()
    const addBookMutation = useAddBook()
    
    // Search and filter state
    const [searchTerm, setSearchTerm] = useState("")  // For filtering books by title/author
    
    // Add new book modal state
    const [showAddModal, setShowAddModal] = useState(false)  // Show/hide add book modal
    const [newBook, setNewBook] = useState({ book_name: "", author_name: "" })  // New book form data
    
    // Goodreads integration state
    const [goodreadsLinks, setGoodreadsLinks] = useState({})          // Cache of Goodreads URLs
    const [searchingGoodreads, setSearchingGoodreads] = useState(new Set())  // Track ongoing searches

    // Quick-log modal state (for moving to-read books to read books)
    const [showQuickLog, setShowQuickLog] = useState(false)    // Show/hide quick log modal
    const [selectedBook, setSelectedBook] = useState(null)     // Book selected for quick logging
    const [reflection, setReflection] = useState("")           // Reflection text for quick log

    // Share and Edit modals state
    const [showShareModal, setShowShareModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [selectedBookForModal, setSelectedBookForModal] = useState(null)

    // Function to generate Goodreads search links for books
    // This creates searchable URLs rather than direct book links
    const searchGoodreadsLink = async (bookName, authorName) => {
        const searchKey = `${bookName}-${authorName}`  // Unique key for caching
        
        // Skip if already searched or currently searching
        if (goodreadsLinks[searchKey] || searchingGoodreads.has(searchKey)) {
            return // Already searched or searching
        }

        // Mark as currently searching to prevent duplicate requests
        setSearchingGoodreads(prev => new Set([...prev, searchKey]))

        try {
            // Create Goodreads search URL (users can manually search)
            // This is safer than trying to guess exact book URLs
            const searchQuery = encodeURIComponent(bookName)
            const goodreadsSearchUrl = `https://www.goodreads.com/search?q=${searchQuery}`

            // Cache the search URL for this book
            setGoodreadsLinks(prev => ({
                ...prev,
                [searchKey]: goodreadsSearchUrl
            }))
        } catch (err) {
            console.error("Failed to generate Goodreads link:", err)
        } finally {
            setSearchingGoodreads(prev => {
                const newSet = new Set(prev)
                newSet.delete(searchKey)
                return newSet
            })
        }
    }

    useEffect(() => {
        // Generate Goodreads links for all books when data loads
        if (books && books.length > 0) {
            books.forEach(book => {
                searchGoodreadsLink(book.book_name, book.author_name)
            })
        }
    }, [books])

    const handleDelete = async (book) => {
        if (!confirm("Are you sure you want to remove this book from your future reads? This action cannot be undone.")) {
            return
        }

        try {
            await deleteToReadMutation.mutateAsync({
                book_name: book.book_name,
                author_name: book.author_name
            })
            toast.success('Book removed from future reads')
            trackEvent('FutureReads', 'Book Removed')
        } catch (err) {
            console.error("❌ Failed to delete book:", err)
            trackError(err, { userId: user?.id, book_name: book.book_name }, 'FutureReads')
            toast.error('Failed to remove book. Please try again.')
        }
    }

    const handleAddBook = async (e) => {
        e.preventDefault()
        if (!user || !newBook.book_name.trim() || !newBook.author_name.trim()) return

        try {
            await addToReadMutation.mutateAsync({
                book_name: newBook.book_name.trim(),
                author_name: newBook.author_name.trim(),
            })

            // Generate Goodreads link for the new book
            searchGoodreadsLink(newBook.book_name.trim(), newBook.author_name.trim())

            toast.success('Book added to future reads! 📚')
            trackEvent('FutureReads', 'Book Added')
            setShowAddModal(false)
            setNewBook({ book_name: "", author_name: "" })

        } catch (err) {
            console.error("❌ Failed to add book to future reads:", err)
            trackError(err, {
                userId: user?.id,
                book_name: newBook.book_name,
                author_name: newBook.author_name,
            }, 'FutureReads')
            toast.error('Failed to add book. Please try again.')
        }
    }

    // Handle marking book as read (quick-log modal)
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

        try {
            // Add to read books
            await addBookMutation.mutateAsync({
                book_name: selectedBook.book_name,
                author_name: selectedBook.author_name,
                reflection: reflection,
            })

            // Remove from future reads
            await deleteToReadMutation.mutateAsync({
                book_name: selectedBook.book_name,
                author_name: selectedBook.author_name
            })

            toast.success(`"${selectedBook.book_name}" moved to reading history! 📚`, {
                duration: 3000,
                style: {
                    background: '#7C3AED',
                },
            })

            trackEvent('FutureReads', 'Book Marked as Read')
            closeQuickLog()

        } catch (err) {
            console.error("❌ Failed to mark book as read:", err)
            trackError(err, {
                userId: user?.id,
                book_name: selectedBook?.book_name,
                author_name: selectedBook?.author_name,
            }, 'FutureReads')
            toast.error('Failed to save book. Please try again.')
        }
    }

    // Handle opening share modal
    const handleShare = (book) => {
        setSelectedBookForModal(book)
        setShowShareModal(true)
    }

    // Handle opening edit modal
    const handleEdit = (book) => {
        setSelectedBookForModal(book)
        setShowEditModal(true)
    }

    // Handle closing share/edit modals
    const closeShareEditModals = () => {
        setShowShareModal(false)
        setShowEditModal(false)
        setSelectedBookForModal(null)
    }

    // Handle saving edited book
    const handleEditSave = async (formData) => {
        if (!user || !selectedBookForModal) return

        try {
            await updateToReadMutation.mutateAsync({
                original_book_name: selectedBookForModal.book_name,
                original_author_name: selectedBookForModal.author_name,
                book_name: formData.book_name.trim(),
                author_name: formData.author_name.trim()
            })

            // Update Goodreads links cache
            const oldKey = `${selectedBookForModal.book_name}-${selectedBookForModal.author_name}`
            const newKey = `${formData.book_name.trim()}-${formData.author_name.trim()}`
            if (oldKey !== newKey) {
                // Generate new Goodreads link
                searchGoodreadsLink(formData.book_name.trim(), formData.author_name.trim())
            }

            toast.success('Book updated successfully!')
            trackEvent('FutureReads', 'Book Edited')
            closeShareEditModals()
        } catch (err) {
            console.error("❌ Failed to update book:", err)
            trackError(err, { userId: user?.id, book_name: selectedBookForModal?.book_name }, 'FutureReads')
            toast.error('Failed to update book. Please try again.')
        }
    }

    const filteredBooks = books.filter((book) => {
        return (
            book.book_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            book.author_name.toLowerCase().includes(searchTerm.toLowerCase())
        )
    })

    if (loading) return <p className="p-6">Loading your future reads...</p>

    if (!user) return <p className="p-6">Please sign in to view your future reads.</p>

    return (
        <>
            <div className="p-6 space-y-6">
                <div className="text-center max-w-2xl mx-auto">
                    <h1 className="text-3xl font-bold text-slate-800 mb-3">Future Reads</h1>
                    <p className="text-slate-600">Your Next Great Reads📗</p>
                </div>

                <div className="max-w-3xl mx-auto">
                    <div className="mb-6 flex gap-4 flex-col sm:flex-row">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                            <Input
                                type="text"
                                placeholder="Search by book title or author..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Button
                            onClick={() => setShowAddModal(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            Add Book
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {filteredBooks.length === 0 ? (
                            <Card className="text-center p-6">
                                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <BookOpen className="h-6 w-6 text-slate-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-800 mb-2">No books found</h3>
                                <p className="text-slate-600 mb-4">
                                    {books.length === 0
                                        ? "Start building your reading list by adding books you want to read!"
                                        : "Try adjusting your search terms."}
                                </p>
                                {books.length === 0 && (
                                    <Button
                                        onClick={() => setShowAddModal(true)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                        Add Your First Book
                                    </Button>
                                )}
                            </Card>
                        ) : (
                            filteredBooks.map((book, index) => {
                                const searchKey = `${book.book_name}-${book.author_name}`
                                const goodreadsLink = goodreadsLinks[searchKey]

                                return (
                                    <Card key={`${book.book_name}-${book.author_name}-${index}`} className="border-slate-200 relative">
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
                                                        disabled={deleteToReadMutation.isPending}
                                                        className="p-2 text-slate-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 shadow-md border border-slate-300 bg-white"
                                                        title="Remove from future reads"
                                                    >
                                                        {deleteToReadMutation.isPending ? (
                                                            <div className="h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                                                        ) : (
                                                            <Trash2 className="h-4 w-4" />
                                                        )}
                                                    </button>
                                                </div>

                                                <div className="w-12 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <BookOpen className="h-5 w-5 text-white" />
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium text-slate-800 text-lg mb-1">{book.book_name}</h4>
                                                    <p className="text-sm text-slate-600 mb-3">by {book.author_name}</p>

                                                    {/* Goodreads Link - moved here, below author but above date */}
                                                    {goodreadsLink && (
                                                        <div className="mb-3">
                                                            <a
                                                                href={goodreadsLink}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 transition-colors"
                                                            >
                                                                Search on Goodreads
                                                                <ExternalLink className="h-3 w-3 ml-1" />
                                                            </a>
                                                        </div>
                                                    )}

                                                    <div className="flex items-center gap-3 mb-3">
                                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                                            <Calendar className="h-3 w-3" />
                                                            <span>Added {new Date(book.created_at).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>

                                                    <Button
                                                        onClick={() => openQuickLog(book)}
                                                        className="bg-green-600 hover:bg-green-700 text-white text-sm flex items-center gap-2"
                                                    >
                                                        <CheckCircle className="h-4 w-4" />
                                                        Mark as Read
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                )
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Add Book Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <Card className="w-full max-w-md border-slate-200">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-slate-800">Add Book to Future Reads</h3>
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="text-slate-400 hover:text-slate-600"
                                    disabled={addToReadMutation.isPending}
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <form onSubmit={handleAddBook} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Book Title
                                    </label>
                                    <Input
                                        value={newBook.book_name}
                                        onChange={(e) => setNewBook(prev => ({ ...prev, book_name: e.target.value }))}
                                        placeholder="Enter the book title"
                                        required
                                        disabled={addToReadMutation.isPending}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Author
                                    </label>
                                    <Input
                                        value={newBook.author_name}
                                        onChange={(e) => setNewBook(prev => ({ ...prev, author_name: e.target.value }))}
                                        placeholder="Enter the author's name"
                                        required
                                        disabled={addToReadMutation.isPending}
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        disabled={addToReadMutation.isPending}
                                        className="flex-1 bg-slate-200 hover:bg-slate-300 text-white-800 border border-slate-300"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={addToReadMutation.isPending || !newBook.book_name.trim() || !newBook.author_name.trim()}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                        {addToReadMutation.isPending ? "Adding..." : "Add Book"}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </Card>
                </div>
            )}

            {/* Quick Log Modal */}
            {showQuickLog && selectedBook && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <Card className="w-full max-w-md border-slate-200">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-slate-800">Mark as Read</h3>
                                <button
                                    onClick={closeQuickLog}
                                    className="text-slate-400 hover:text-slate-600"
                                    disabled={addBookMutation.isPending || deleteToReadMutation.isPending}
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
                                        value={selectedBook.book_name}
                                        disabled
                                        className="bg-slate-50"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Author
                                    </label>
                                    <Input
                                        value={selectedBook.author_name}
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
                                        disabled={addBookMutation.isPending || deleteToReadMutation.isPending}
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        type="button"
                                        onClick={closeQuickLog}
                                        disabled={addBookMutation.isPending || deleteToReadMutation.isPending}
                                        className="flex-1 bg-slate-200 hover:bg-slate-300 text-white-800 border border-slate-300"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={addBookMutation.isPending || deleteToReadMutation.isPending || !reflection.trim()}
                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        {(addBookMutation.isPending || deleteToReadMutation.isPending) ? "Marking as Read..." : "Mark as Read"}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </Card>
                </div>
            )}

            {/* Share Modal */}
            <ShareModal
                book={selectedBookForModal}
                isOpen={showShareModal}
                onClose={closeShareEditModals}
                source="future"
            />

            {/* Edit Modal */}
            <EditBookModal
                book={selectedBookForModal}
                isOpen={showEditModal}
                onClose={closeShareEditModals}
                onSave={handleEditSave}
                includeReflection={false}
                loading={updateToReadMutation.isPending}
            />
        </>
    )
}