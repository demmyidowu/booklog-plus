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
import AnalyticsNotice from "./components/AnalyticsNotice"
import { Toaster } from "react-hot-toast"
import "./index.css"

function App() {

  window.onerror = function (msg, url, lineNo, columnNo, error) {
    console.log('ERROR DETAILS:', {
      message: msg,
      source: url,
      line: lineNo,
      column: columnNo,
      error: error
    });
    return false;
  }


  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(() => {
    return localStorage.getItem("currentPage") || "dashboard"
  })

  // 🔗 Navigation handler that updates both state and URL
  const handleNavigation = (page) => {
    setCurrentPage(page);
    // Update browser URL without page reload
    window.history.pushState({}, '', `/${page === 'signin' ? '' : page}`);
  };

  const user = useUser()

  useEffect(() => {
    // Read URL on page load and set appropriate page
    const path = window.location.pathname;

    switch (path) {
      case '/':
      case '/signin':
        setCurrentPage('signin');
        break;
      case '/signup':
        setCurrentPage('signup');
        break;
      case '/dashboard':
        setCurrentPage('dashboard');
        break;
      case '/log-book':
        setCurrentPage('log-book');
        break;
      case '/history':
        setCurrentPage('history');
        break;
      case '/recommendations':
        setCurrentPage('recommendations');
        break;
      case '/profile':
        setCurrentPage('profile');
        break;
      default:
        // If unknown path, redirect to appropriate default
        if (user) {
          handleNavigation('dashboard');
        } else {
          handleNavigation('signin');
        }
    }
  }, [user]);

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
    handleNavigation("signin")
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
        return <SignUpPage onNavigateToSignIn={() => handleNavigation("signin")} />
      case "signin":
        return (
          <SignInPage
            onNavigateToSignUp={() => handleNavigation("signup")}
            onSignIn={() => handleNavigation("dashboard")}
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
      <Toaster position="top-right" toastOptions={{
        duration: 4000,
        style: {
          background: '#333',
          color: '#fff',
        },
        success: {
          duration: 4000,
          style: {
            background: '#059669',
          },
        },
        error: {
          duration: 6000,
          style: {
            background: '#DC2626',
          },
        },
      }} />
      {showLayout && <Sidebar currentPage={currentPage} onNavigate={handleNavigation} />}
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
      <AnalyticsNotice />
    </div>
  )
}

export default App
