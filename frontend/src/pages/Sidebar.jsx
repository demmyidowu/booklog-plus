"use client"

// Lucide React icons for navigation and mobile menu
import { BookOpen, PlusCircle, History, Lightbulb, User, Menu, X, BookmarkPlus } from "lucide-react"
// React hooks for state management and side effects
import { useState, useEffect } from "react"

// Complete navigation configuration for all app pages
// Each item defines a page with its display title, route ID, and corresponding icon
const navigation = [
  { title: "Dashboard", id: "dashboard", icon: BookOpen },           // Main dashboard with stats
  { title: "Log a Book", id: "log-book", icon: PlusCircle },        // Add new book entries
  { title: "Reading History", id: "history", icon: History },       // View past reading history
  { title: "Future Reads", id: "future-reads", icon: BookmarkPlus }, // Manage to-read list
  { title: "Recommendations", id: "recommendations", icon: Lightbulb }, // AI book recommendations
  { title: "Profile", id: "profile", icon: User },                 // User profile and settings
]

export default function Sidebar({ currentPage, onNavigate }) {
  // Mobile menu state management
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Close mobile menu automatically when user navigates to a different page
  // This provides better UX by hiding the menu after navigation
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [currentPage])  // Dependency on currentPage ensures this runs on page changes

  // Close mobile menu when user clicks outside of it
  // This provides intuitive UX behavior expected on mobile interfaces
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if menu is open and click is outside both sidebar and menu button
      if (isMobileMenuOpen && !event.target.closest('.mobile-sidebar') && !event.target.closest('.mobile-menu-button')) {
        setIsMobileMenuOpen(false)  // Close menu if clicking outside
      }
    }

    // Add event listener for clicks anywhere on the document
    document.addEventListener('mousedown', handleClickOutside)
    
    // Cleanup: remove event listener when component unmounts or effect re-runs
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isMobileMenuOpen])  // Re-run effect when menu state changes

  // Prevent background scrolling when mobile menu is open
  // This prevents the main content from scrolling behind the overlay menu
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'  // Disable scrolling
    } else {
      document.body.style.overflow = 'unset'   // Re-enable scrolling
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

  const handleNavigation = (pageId) => {
    onNavigate(pageId)
    // Mobile menu will close automatically via useEffect
  }

  return (
    <>
      {/* Mobile Menu Button - Only visible on mobile */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="mobile-menu-button fixed top-4 left-4 z-50 md:hidden bg-white border border-slate-200 rounded-lg p-2 shadow-lg"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? (
          <X className="h-6 w-6 text-slate-700" />
        ) : (
          <Menu className="h-6 w-6 text-slate-700" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" />
      )}

      {/* Desktop Sidebar - Always visible on desktop */}
      <div className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col">
        <div className="border-b border-slate-200 p-6">
          <div className="flex items-center gap-2 text-blue-700">
            <BookOpen className="h-6 w-6" />
            <span className="text-xl font-bold">BookLog+</span>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = currentPage === item.id

              return (
                <li key={item.id}>
                  <button
                    onClick={() => onNavigate(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${isActive ? "bg-blue-100 text-blue-700" : "text-slate-700 hover:text-blue-700 hover:bg-blue-50"
                      }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>

      {/* Mobile Sidebar - Slides in from left */}
      <div
        className={`mobile-sidebar fixed top-0 left-0 h-full w-80 bg-white border-r border-slate-200 z-50 transform transition-transform duration-300 ease-in-out md:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="border-b border-slate-200 p-6 pt-16"> {/* Extra padding top for menu button */}
          <div className="flex items-center gap-2 text-blue-700">
            <BookOpen className="h-6 w-6" />
            <span className="text-xl font-bold">BookLog+</span>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = currentPage === item.id

              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleNavigation(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors ${isActive ? "bg-blue-100 text-blue-700" : "text-slate-700 hover:text-blue-700 hover:bg-blue-50"
                      }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-lg">{item.title}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
    </>
  )
}