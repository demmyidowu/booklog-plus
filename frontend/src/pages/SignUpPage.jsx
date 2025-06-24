"use client"

// React hook for component state management
import { useState } from "react"
// Lucide React icon for branding
import { BookOpen } from "lucide-react"
// Supabase client for user registration
import { supabase } from "../lib/supabase"
// Analytics tracking for user interactions
import { trackEvent, trackError } from '../lib/analytics'
// Custom UI components
import Button from "./components/Button"
import Input from "./components/Input"
import Card from "./components/Card"
// Toast notifications for user feedback
import { toast } from "react-hot-toast"

export default function SignUpPage({ onNavigateToSignIn }) {
  // Registration form state management
  const [formData, setFormData] = useState({
    name: "",            // User's display name
    email: "",           // User's email address (used for login)
    password: "",        // User's chosen password
    confirmPassword: "", // Password confirmation for validation
  })
  const [loading, setLoading] = useState(false)  // Loading state during registration

  // Handle form input changes
  // Updates the form state when user types in any input field
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,  // Update specific field based on input name
    }))
  }

  // Handle form submission for user registration
  const handleSubmit = async (e) => {
    e.preventDefault()  // Prevent default form submission behavior
    setLoading(true)    // Show loading state during registration

    try {
      // Client-side validation: ensure passwords match
      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match")
        return  // Exit early if validation fails
      }

      // Attempt to register user with Supabase Auth
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,     // User's email for authentication
        password: formData.password, // User's chosen password
        options: {
          data: {
            name: formData.name,   // Store user's name in metadata
          },
          emailRedirectTo: `${window.location.origin}/signin`  // Redirect after email confirmation
        },
      })

      if (signUpError) {
        trackError(signUpError, { email: formData.email, name: formData.name }, 'SignUp')
        toast.error("Signup failed: " + signUpError.message)
        return
      }

      const user = signUpData?.user
      if (!user) {
        toast.error("Signup failed: No user data returned")
        return
      }

      // Check if email confirmation is required
      if (user.identities?.length === 0) {
        toast.error("This email is already registered. Please sign in instead.")
        onNavigateToSignIn()
        return
      }

      const { error: profileError } = await supabase.from("User_Profile").upsert([
        {
          id: user.id,
          name: formData.name,
          email: formData.email,
        }
      ])

      if (profileError) {
        trackError(profileError, {
          userId: user.id,
          email: formData.email,
          name: formData.name
        }, 'SignUpProfile')
        toast.error("Failed to create profile: " + profileError.message)
        return
      }

      trackEvent('Auth', 'Sign Up Successful')
      toast.success("Account created! Please check your email to verify your account.", {
        duration: 6000 // Show for 6 seconds
      })
      setTimeout(() => {
        onNavigateToSignIn()
      }, 2000) // Wait 2 seconds before redirecting
    } catch (err) {
      trackError(err, { email: formData.email, name: formData.name }, 'SignUp')
      toast.error("An unexpected error occurred during sign up")
    } finally {
      setLoading(false)
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
            <div>
              <h2 className="text-xl text-slate-800 font-semibold">Create your account</h2>
              <p className="text-slate-600 mt-2">Start your enhanced reading journey today</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input id="name" name="name" type="text" placeholder="Your Name" value={formData.name} onChange={handleChange} />
            <Input id="email" name="email" type="email" placeholder="your-email@example.com" value={formData.email} onChange={handleChange} />
            <Input id="password" name="password" type="password" placeholder="Enter Password" value={formData.password} onChange={handleChange} />
            <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} />
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>Create Account</Button>
            <div className="text-center text-sm text-slate-600">
              Already have an account?
              <button type="button" onClick={onNavigateToSignIn} className="text-blue-600 hover:underline font-medium">Sign in</button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  )
}
