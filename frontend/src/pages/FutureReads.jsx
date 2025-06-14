"use client"

import { useEffect, useState } from "react"
import { BookOpen, Search, Calendar, Trash2, Plus, CheckCircle, X, ExternalLink } from "lucide-react"
import Card from "./components/Card"
import Input from "./components/Input"
import Textarea from "./components/Textarea"
import Button from "./components/Button"
import { useUser } from "./UserContext"
import { getApiUrl } from "../config"
import { toast } from "react-hot-toast"
import { trackEvent, trackError } from "../lib/analytics"

export default function FutureReads() {
    const user = useUser()
    const [searchTerm, setSearchTerm] = useState("")
    const [books, setBooks] = useState([])
    const [loading, setLoading] = useState(true)
    const [deleting, setDeleting] = useState(null)
    const [showAddModal, setShowAddModal] = useState(false)
    const [newBook, setNewBook] = useState({ book_name: "", author_name: "" })
    const [addingBook, setAddingBook] = useState(false)
    const [goodreadsLinks, setGoodreadsLinks] = useState({})
    const [searchingGoodreads, setSearchingGoodreads] = useState(new Set())

    // Quick-log modal state
    const [showQuickLog, setShowQuickLog] = useState(false)
    const [selectedBook, setSelectedBook] = useState(null)
    const [reflection, setReflection] = useState("")
    const [quickLogLoading, setQuickLogLoading] = useState(false)

    // Function to search for Goodreads links
    const searchGoodreadsLink = async (bookName, authorName) => {
        const searchKey = `${bookName}-${authorName}`
        if (goodreadsLinks[searchKey] || searchingGoodreads.has(searchKey)) {
            return // Already searched or searching
        }

        setSearchingGoodreads(prev => new Set([...prev, searchKey]))

        try {
            // Simple search URL construction (users can search manually)
            const searchQuery = encodeURIComponent(bookName)
            const goodreadsSearchUrl = `https://www.goodreads.com/search?q=${searchQuery}`

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
        async function fetchToReadBooks() {
            if (!user) return
            try {
                const response = await fetch(getApiUrl(`to-read?user_id=${user.id}`))
                if (!response.ok) {
                    throw new Error('Failed to fetch to-read books')
                }
                const data = await response.json()
                setBooks(data)

                // Generate Goodreads links for all books
                data.forEach(book => {
                    searchGoodreadsLink(book.book_name, book.author_name)
                })

            } catch (err) {
                console.error("❌ Failed to fetch to-read books:", err)
                trackError(err, { userId: user?.id }, 'FutureReads')
            } finally {
                setLoading(false)
            }
        }

        fetchToReadBooks()
    }, [user])

    const handleDelete = async (book) => {
        if (!confirm("Are you sure you want to remove this book from your future reads? This action cannot be undone.")) {
            return
        }

        const deleteKey = `${book.book_name}-${book.author_name}`
        setDeleting(deleteKey)

        try {
            const response = await fetch(getApiUrl('to-read/delete'), {
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

            setBooks(books.filter(b => !(b.book_name === book.book_name && b.author_name === book.author_name)))
            toast.success('Book removed from future reads')
            trackEvent('FutureReads', 'Book Removed')
        } catch (err) {
            console.error("❌ Failed to delete book:", err)
            trackError(err, { userId: user?.id, book_name: book.book_name }, 'FutureReads')
            toast.error('Failed to remove book. Please try again.')
        } finally {
            setDeleting(null)
        }
    }

    const handleAddBook = async (e) => {
        e.preventDefault()
        if (!user || !newBook.book_name.trim() || !newBook.author_name.trim()) return

        setAddingBook(true)

        try {
            const response = await fetch(getApiUrl("to-read/add"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: user.id,
                    book_name: newBook.book_name.trim(),
                    author_name: newBook.author_name.trim(),
                }),
            })

            if (!response.ok) {
                const error = new Error('Failed to add book to future reads')
                error.status = response.status
                error.statusText = response.statusText
                throw error
            }

            const result = await response.json()

            // Add the new book to the local state
            const newBookEntry = {
                book_name: newBook.book_name.trim(),
                author_name: newBook.author_name.trim(),
                created_at: new Date().toISOString()
            }
            setBooks([newBookEntry, ...books])

            // Generate Goodreads link for the new book
            searchGoodreadsLink(newBookEntry.book_name, newBookEntry.author_name)

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
                status: err.status,
                statusText: err.statusText
            }, 'FutureReads')
            toast.error('Failed to add book. Please try again.')
        } finally {
            setAddingBook(false)
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

        setQuickLogLoading(true)

        try {
            // Add to read books
            const response = await fetch(getApiUrl("add"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: user.id,
                    book_name: selectedBook.book_name,
                    author_name: selectedBook.author_name,
                    reflection: reflection,
                }),
            })

            if (!response.ok) {
                const error = new Error('Failed to save book')
                error.status = response.status
                error.statusText = response.statusText
                throw error
            }

            // Remove from future reads
            await handleDelete(selectedBook)

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
                status: err.status,
                statusText: err.statusText
            }, 'FutureReads')
            toast.error('Failed to save book. Please try again.')
        } finally {
            setQuickLogLoading(false)
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
                                                {/* Delete button */}
                                                <button
                                                    onClick={() => handleDelete(book)}
                                                    disabled={deleting === `${book.book_name}-${book.author_name}`}
                                                    className="absolute top-4 right-4 p-2 text-slate-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shadow-md border border-slate-300 bg-white z-10"
                                                    title="Remove from future reads"
                                                >
                                                    {deleting === `${book.book_name}-${book.author_name}` ? (
                                                        <div className="h-4 w-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                                                    ) : (
                                                        <Trash2 className="h-4 w-4" />
                                                    )}
                                                </button>

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
                                    disabled={addingBook}
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
                                        disabled={addingBook}
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
                                        disabled={addingBook}
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        disabled={addingBook}
                                        className="flex-1 bg-slate-200 hover:bg-slate-300 text-white-800 border border-slate-300"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={addingBook || !newBook.book_name.trim() || !newBook.author_name.trim()}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                        {addingBook ? "Adding..." : "Add Book"}
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
                                    disabled={quickLogLoading}
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
                                        disabled={quickLogLoading}
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        type="button"
                                        onClick={closeQuickLog}
                                        disabled={quickLogLoading}
                                        className="flex-1 bg-slate-200 hover:bg-slate-300 text-white-800 border border-slate-300"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={quickLogLoading || !reflection.trim()}
                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        {quickLogLoading ? "Marking as Read..." : "Mark as Read"}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </Card>
                </div>
            )}
        </>
    )
}