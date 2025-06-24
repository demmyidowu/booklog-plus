"use client"

// React hooks for component lifecycle and state management
import { useState, useEffect } from "react"
// Lucide React icons for UI elements and password visibility toggle
import { BookOpen, Eye, EyeOff } from "lucide-react"
// Supabase client for password reset functionality
import { supabase } from "../lib/supabase"
// Analytics tracking for user interactions
import { trackEvent, trackError } from "../lib/analytics"
// Custom UI components
import Button from "./components/Button"
import Input from "./components/Input"
import Card from "./components/Card"
// Toast notifications for user feedback
import { toast } from "react-hot-toast"

export default function UpdatePasswordPage({ onNavigateToSignIn }) {
  // Password update form state
  const [formData, setFormData] = useState({
    password: "",         // New password
    confirmPassword: "", // Password confirmation
  })
  
  // UI and loading states
  const [loading, setLoading] = useState(false)                   // Form submission loading
  const [showPassword, setShowPassword] = useState(false)         // Toggle password visibility
  const [showConfirmPassword, setShowConfirmPassword] = useState(false) // Toggle confirm password visibility
  
  // Session validation states
  const [isValidSession, setIsValidSession] = useState(false)     // Whether user has valid reset session
  const [isCheckingSession, setIsCheckingSession] = useState(true) // Loading state for session check

  // Validate that user has a valid password reset session on component mount
  // This ensures the page can only be accessed through a valid reset link
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Get current authentication session from Supabase
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Session check error:', error)
          setIsValidSession(false)
          toast.error("Invalid or expired reset link")  // User-friendly error message
          return
        }

        // Verify this is a valid password recovery session
        if (session?.user) {
          setIsValidSession(true)   // Allow password update
        } else {
          setIsValidSession(false)  // Block access - no valid session
          toast.error("Invalid or expired reset link. Please request a new one.")
        }
      } catch (err) {
        console.error('Session check failed:', err)
        setIsValidSession(false)
        toast.error("Unable to verify reset link")
      } finally {
        setIsCheckingSession(false)
      }
    }

    checkSession()
  }, [])

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate password match
      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match")
        return
      }

      // Validate password strength
      if (formData.password.length < 6) {
        toast.error("Password must be at least 6 characters long")
        return
      }

      // Update password
      const { error } = await supabase.auth.updateUser({
        password: formData.password
      })

      if (error) {
        trackError(error, { action: 'password_update' }, 'UpdatePassword')
        toast.error("Failed to update password: " + error.message)
        return
      }

      trackEvent('Auth', 'Password Updated Successfully')
      toast.success("Password updated successfully! Redirecting to sign in...")

      // Sign out and redirect to sign in
      await supabase.auth.signOut()

      setTimeout(() => {
        onNavigateToSignIn()
      }, 2000)

    } catch (err) {
      trackError(err, { action: 'password_update' }, 'UpdatePassword')
      toast.error("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleRequestNewLink = async () => {
    const email = prompt("Enter your email address to request a new reset link:")
    if (!email) return

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      })

      if (error) {
        trackError(error, { email }, 'PasswordReset')
        toast.error("Failed to send reset link: " + error.message)
        return
      }

      trackEvent('Auth', 'New Password Reset Requested')
      toast.success("New reset link sent! Check your email.")
    } catch (err) {
      trackError(err, { email }, 'PasswordReset')
      toast.error("Failed to request new reset link")
    }
  }

  // Show loading spinner while checking session
  if (isCheckingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg border-0">
          <div className="p-6 text-center">
            <div className="flex items-center justify-center gap-2 text-blue-700 mb-4">
              <BookOpen className="h-8 w-8" />
              <h1 className="text-2xl font-bold">BookLog+</h1>
            </div>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-slate-600 mt-4">Verifying reset link...</p>
          </div>
        </Card>
      </div>
    )
  }

  // Show error if invalid session
  if (!isValidSession) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg border-0">
          <div className="p-6 text-center">
            <div className="flex items-center justify-center gap-2 text-blue-700 mb-6">
              <BookOpen className="h-8 w-8" />
              <h1 className="text-2xl font-bold">BookLog+</h1>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl text-slate-800 font-semibold">Reset Link Invalid</h2>
              <p className="text-slate-600">
                This password reset link has expired or is invalid. Please request a new one.
              </p>

              <div className="space-y-3">
                <Button
                  onClick={handleRequestNewLink}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Request New Reset Link
                </Button>

                <Button
                  onClick={onNavigateToSignIn}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700"
                >
                  Back to Sign In
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  // Show password update form
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-0">
        <div className="p-6">
          <div className="text-center space-y-4 mb-6">
            <div className="flex items-center justify-center gap-2 text-blue-700">
              <BookOpen className="h-8 w-8" />
              <h1 className="text-2xl font-bold">BookLog+</h1>
            </div>
            <div>
              <h2 className="text-xl text-slate-800 font-semibold">Update Your Password</h2>
              <p className="text-slate-600 mt-2">Enter your new password below</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <div className="text-sm text-slate-600 space-y-1">
              <p>Password requirements:</p>
              <ul className="list-disc list-inside text-xs space-y-1">
                <li>At least 6 characters long</li>
                <li>Should be unique and secure</li>
              </ul>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={loading || !formData.password || !formData.confirmPassword}
            >
              {loading ? "Updating Password..." : "Update Password"}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={onNavigateToSignIn}
                className="text-sm text-slate-600 hover:text-blue-600 hover:underline"
                disabled={loading}
              >
                Back to Sign In
              </button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  )
}