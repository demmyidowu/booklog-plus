"use client"
import { BookOpen, PlusCircle, History, Lightbulb, User } from "lucide-react"

const navigation = [
  { title: "Log a Book", id: "log-book", icon: PlusCircle },
  { title: "History", id: "history", icon: History },
  { title: "Recommendations", id: "recommendations", icon: Lightbulb },
]

function MainLayout({ children, currentPage, onNavigate, user, onLogout }) {
  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col">
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
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      isActive ? "bg-blue-100 text-blue-700" : "text-slate-700 hover:text-blue-700 hover:bg-blue-50"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.title}</span>
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
