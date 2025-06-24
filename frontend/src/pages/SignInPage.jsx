"use client"

// React hook for component state management
import { useState } from "react"
// Lucide React icon for branding
import { BookOpen } from "lucide-react"
// Supabase client for authentication
import { supabase } from "../lib/supabase"
// Custom UI components
import Button from "./components/Button"
import Input from "./components/Input"
import Card from "./components/Card"
// Analytics tracking for user interactions
import { trackEvent, trackError } from "../lib/analytics"
// Toast notifications for user feedback
import { toast } from "react-hot-toast"

export default function SignInPage({ onNavigateToSignUp, onSignIn }) {
  // Form state for authentication credentials
  const [email, setEmail] = useState("")        // User's email address
  const [password, setPassword] = useState("")  // User's password
  const [loading, setLoading] = useState(false) // Loading state during authentication

  // Handle form submission for user authentication
  const handleSubmit = async (e) => {
    e.preventDefault()  // Prevent default form submission behavior
    setLoading(true)    // Show loading state during authentication

    try {
      // Attempt to authenticate user with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,     // User's email address
        password   // User's password
      })

      // Handle authentication errors
      if (error) {
        trackError(error, { email }, 'SignIn')  // Track error for analytics
        toast.error("Sign-in failed: " + error.message)  // Show user-friendly error
        return  // Exit early on error
      }

      // Track successful authentication for analytics
      trackEvent('Auth', 'Sign In Successful')
      
      // Persist user's preferred page in localStorage for better UX
      localStorage.setItem("currentPage", "dashboard")
      
      // Call parent component's sign-in handler if provided
      onSignIn?.()  // Optional chaining - only call if function exists
    } catch (err) {
      trackError(err, { email }, 'SignIn')
      toast.error("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  // Handle password reset functionality
  const handleForgotPassword = async () => {
    // Validate that user has entered an email address
    if (!email) return alert("Enter your email first.")
    
    try {
      // Send password reset email through Supabase
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,  // Redirect URL after reset
      })

      if (error) {
        trackError(error, { email }, 'PasswordReset')
        toast.error("Reset failed: " + error.message)
        return
      }

      trackEvent('Auth', 'Password Reset Requested')
      toast.success("Check your email for the reset link")
    } catch (err) {
      trackError(err, { email }, 'PasswordReset')
      toast.error("Failed to request password reset")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-0">
        <div className="p-6">
          <div className="text-center space-y-4 mb-6">
            <div className="flex items-center justify-center gap-2 text-blue-700">
              <BookOpen className="h-8 w-8" />
              <h1 className="text-2xl font-bold">BookLog+</h1>
            </div>
            <h2 className="text-xl text-slate-800 font-semibold">Welcome back</h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="email"
              type="email"
              placeholder="your.email@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <Input
              id="password"
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              {loading ? "Signing In..." : "Sign In"}
            </Button>
            <div className="text-center">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-blue-600 hover:underline"
                disabled={loading}
              >
                Forgot Password?
              </button>
            </div>
            <div className="text-center text-sm text-slate-600">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  console.log('Sign up button clicked!');
                  onNavigateToSignUp();
                }}
                className="text-blue-600 hover:underline font-medium"
                disabled={loading}
              >
                Sign up
              </button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  )
}
