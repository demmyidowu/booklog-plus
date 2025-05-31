"use client"
import { BookOpen, PlusCircle, History, Lightbulb, User } from "lucide-react"

const navigation = [
  { title: "Dashboard", id: "dashboard", icon: BookOpen },
  { title: "Log a Book", id: "log-book", icon: PlusCircle },
  { title: "Reading History", id: "history", icon: History },
  { title: "Recommendations", id: "recommendations", icon: Lightbulb },
  { title: "Profile", id: "profile", icon: User },
]

export default function Sidebar({ currentPage, onNavigate }) {
  return (
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
        </ul>
      </nav>
    </div>
  )
}
