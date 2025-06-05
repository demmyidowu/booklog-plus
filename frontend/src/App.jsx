import { useEffect, useState } from "react"
import Dashboard from "./pages/Dashboard"
import LogBook from "./pages/LogBook"
import History from "./pages/History"
import Recommendations from "./pages/Recommendations"
import Profile from "./pages/Profile"
import SignInPage from "./pages/SignInPage"
import SignUpPage from "./pages/SignUpPage"
import UpdatePasswordPage from "./pages/UpdatePassword"
import Header from "./pages/Header"
import Sidebar from "./pages/Sidebar"
import { useUser } from "./pages/UserContext"
import { supabase } from "./lib/supabase"
import { trackPageView } from "./lib/analytics"
import AnalyticsNotice from "./components/AnalyticsNotice"
import WelcomeModal from "./pages/components/WelcomeModal"
import { useFirstTimeUser } from "./hooks/useFirstTimeUser"
import { Toaster } from "react-hot-toast"
import "./index.css"

function App() {
  // Error handler for debugging
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

  const user = useUser()
  const { isFirstTime, showWelcome, markWelcomeShown, skipWelcome } = useFirstTimeUser()

  // 🔗 Navigation handler that updates both state and URL
  const handleNavigation = (page) => {
    setCurrentPage(page);
    // Update browser URL without page reload
    const url = page === 'signin' ? '/' : `/${page}`;
    window.history.pushState({}, '', url);
    // Also update localStorage
    localStorage.setItem("currentPage", page);
  };

  // 🎯 Handle welcome flow completion
  const handleWelcomeGetStarted = () => {
    markWelcomeShown()
    handleNavigation('log-book')
  }

  // 🔗 Read URL on page load and set appropriate page
  useEffect(() => {
    const path = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);

    switch (path) {
      case '/':
      case '/signin':
        setCurrentPage('signin');
        break;
      case '/signup':
        setCurrentPage('signup');
        break;
      case '/update-password':  // Add this case
        setCurrentPage('update-password');
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
          // 🎯 For first-time users, show welcome modal
          handleNavigation(isFirstTime ? 'dashboard' : 'dashboard');
        } else {
          handleNavigation('signin');
        }
    }
  }, [user, isFirstTime]);

  // 📊 Track page views
  useEffect(() => {
    //trackPageView(currentPage)
  }, [currentPage])

  // 🔓 Sign out logic
  const handleSignOut = async () => {
    await supabase.auth.signOut()
    handleNavigation("signin")
  }

  // 🧠 Render current page
  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard isFirstTime={isFirstTime} />
      case "log-book":
        return <LogBook onNavigate={handleNavigation} isFirstTime={isFirstTime} />
      case "history":
        return <History />
      case "recommendations":
        return <Recommendations />
      case "profile":
        return <Profile />
      case "signup":
        return <SignUpPage onNavigateToSignIn={() => handleNavigation("signin")} />
      case "signin":
        return (
          <SignInPage
            onNavigateToSignUp={() => handleNavigation("signup")}
            onSignIn={() => handleNavigation("dashboard")}
          />
        )
      case "update-password":
        return <UpdatePasswordPage onNavigateToSignIn={() => handleNavigation("signin")} />
      default:
        return <Dashboard isFirstTime={isFirstTime} />
    }
  }

  // 🔐 Show layout only if signed in and not on auth pages
  const showLayout = !!user && !["signin", "signup", "update-password"].includes(currentPage)

  console.log("Current Page:", currentPage)
  console.log("user:", user)
  console.log("showLayout:", showLayout)
  console.log("isFirstTime:", isFirstTime)
  console.log("showWelcome:", showWelcome)

  return (
    <div className="min-h-screen bg-gray-50 flex">
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


      {/* Welcome Modal */}
      <WelcomeModal
        isOpen={showWelcome}
        onClose={skipWelcome}
        onGetStarted={handleWelcomeGetStarted}
        userName={user?.user_metadata?.name}
      />

      {/* Sidebar - Now handles its own mobile responsiveness */}
      {showLayout && (
        <Sidebar
          currentPage={currentPage}
          onNavigate={handleNavigation}
        />
      )}

      {/* Main Content Area */}
      <div className={"flex-1 min-h-screen flex flex-col"}>
        {showLayout && (
          <Header
            user={user.user_metadata?.name || "Reader"}
            onSignOut={handleSignOut}
          />
        )}

        <main className={`flex-1 bg-white text-black ${showLayout ? 'p-6 md:p-6 pt-20 md:pt-6' : 'p-0'}`}>
          {renderPage() || <p>Nothing to render</p>}
        </main>
      </div>

      <AnalyticsNotice />
    </div>
  )
}

export default App