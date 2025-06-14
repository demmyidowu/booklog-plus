"use client"
import { BookOpen, PlusCircle, History, Lightbulb, User, Menu, X, BookmarkPlus } from "lucide-react"
import { useState, useEffect } from "react"

const navigation = [
  { title: "Dashboard", id: "dashboard", icon: BookOpen },
  { title: "Log a Book", id: "log-book", icon: PlusCircle },
  { title: "Reading History", id: "history", icon: History },
  { title: "Future Reads", id: "future-reads", icon: BookmarkPlus },
  { title: "Recommendations", id: "recommendations", icon: Lightbulb },
  { title: "Profile", id: "profile", icon: User },
]

export default function Sidebar({ currentPage, onNavigate }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Close mobile menu when page changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [currentPage])

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && !event.target.closest('.mobile-sidebar') && !event.target.closest('.mobile-menu-button')) {
        setIsMobileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isMobileMenuOpen])

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
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