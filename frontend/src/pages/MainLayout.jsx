"use client"

// Lucide React icons for navigation elements
import { BookOpen, PlusCircle, History, Lightbulb, User } from "lucide-react"

// Navigation configuration for the sidebar
// Each item defines a page in the application with its display title, route ID, and icon
const navigation = [
  { title: "Log a Book", id: "log-book", icon: PlusCircle },           // Add new book entries
  { title: "History", id: "history", icon: History },                 // View reading history
  { title: "Recommendations", id: "recommendations", icon: Lightbulb }, // AI book recommendations
]

function MainLayout({ children, currentPage, onNavigate, user, onLogout }) {
  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col">
        {/* Application Branding Header */}
        <div className="border-b border-slate-200 p-6">
          <div className="flex items-center gap-2 text-blue-700">
            <BookOpen className="h-6 w-6" />  {/* App icon */}
            <span className="text-xl font-bold">BookLog+</span>  {/* App name */}
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon  // Extract icon component for this navigation item
              const isActive = currentPage === item.id  // Check if this is the current page

              return (
                <li key={item.id}>
                  <button
                    onClick={() => onNavigate(item.id)}  // Navigate to this page when clicked
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      isActive ? "bg-blue-100 text-blue-700" : "text-slate-700 hover:text-blue-700 hover:bg-blue-50"
                    }`}  // Dynamic styling based on active state
                  >
                    <Icon className="h-4 w-4" />  {/* Navigation item icon */}
                    <span>{item.title}</span>      {/* Navigation item label */}
                  </button>
                </li>
              )
            })}
            <li>
              <button
                onClick={() => onNavigate("profile")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  currentPage === "profile"
                    ? "bg-blue-100 text-blue-700"
                    : "text-slate-700 hover:text-blue-700 hover:bg-blue-50"
                }`}
              >
                <User className="h-4 w-4" />
                <span>Profile</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
          <div></div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-700 hidden sm:block">{user?.name || "Guest"}</span>
            <div className="h-8 w-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-medium">
              { "FIXME LINE 71 MainLayout.jsx"
                //user.name
                //.split(" ")
                //.map((n) => n[0])
                //.join("")
                }
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}

export default MainLayout
