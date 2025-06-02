import { useEffect, useState } from "react"
import Dashboard from "./pages/Dashboard"
import LogBook from "./pages/LogBook"
import History from "./pages/History"
import Recommendations from "./pages/Recommendations"
import Profile from "./pages/Profile"
import SignInPage from "./pages/SignInPage"
import SignUpPage from "./pages/SignUpPage"
import Header from "./pages/Header"
import Sidebar from "./pages/Sidebar"
import { useUser } from "./pages/UserContext"
import { supabase } from "./lib/supabase"
import { trackPageView } from "./lib/analytics"  // Add this import
import "./index.css"

function App() {
  const [currentPage, setCurrentPage] = useState(() => {
    return localStorage.getItem("currentPage") || "dashboard"
  })

  const user = useUser()

  // 📊 Track page views
  useEffect(() => {
    trackPageView(currentPage)
  }, [currentPage])

  // 🧠 Persist the page on change
  useEffect(() => {
    localStorage.setItem("currentPage", currentPage)
  }, [currentPage])

  // 🔓 Sign out logic
  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setCurrentPage("signin")
    localStorage.setItem("currentPage", "signin")
  }

  // 🧠 Render current page
  const renderPage = () => {

    switch (currentPage) {
      case "dashboard": return <Dashboard />
      case "log-book": return <LogBook />
      case "history": return <History />
      case "recommendations": return <Recommendations />
      case "profile": return <Profile />
      case "signup":
        return <SignUpPage onNavigateToSignIn={() => setCurrentPage("signin")} />
      case "signin":
        return (
          <SignInPage
            onNavigateToSignUp={() => setCurrentPage("signup")}
            onSignIn={() => setCurrentPage("dashboard")}
          />
        )
      default:
        return <Dashboard />
    }
  }


  // 🔐 Show layout only if signed in and not on auth pages
  const showLayout = !!user && !["signin", "signup"].includes(currentPage)
  console.log("Current Page:", currentPage)
  console.log("user:", user)
  console.log("currentPage:", currentPage)
  console.log("showLayout:", showLayout)

  return (
    <div className="flex h-screen">
      {showLayout && <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />}
      <div className="flex-1 flex flex-col">
        {showLayout && (
          <Header
            user={user.user_metadata?.name || "Reader"}
            onSignOut={handleSignOut}
          />
        )}
        <main className="flex-1 overflow-auto bg-white p-6 text-black">
          {renderPage() || <p>Nothing to render</p>}
        </main>
      </div>
    </div>
  )
}

export default App
