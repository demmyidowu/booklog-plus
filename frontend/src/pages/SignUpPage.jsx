"use client"

import { useState } from "react"
import { BookOpen } from "lucide-react"
import { supabase } from "../lib/supabase"
import { trackEvent, trackError } from '../lib/analytics'
import Button from "./components/Button"
import Input from "./components/Input"
import Card from "./components/Card"
import { toast } from "react-hot-toast"

export default function SignUpPage({ onNavigateToSignIn }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [loading, setLoading] = useState(false)

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
      // Check if passwords match
      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match")
        return
      }

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
          },
          emailRedirectTo: window.location.origin
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
            <Input id="email" name="email" type="email" placeholder="your.email@university.edu" value={formData.email} onChange={handleChange} />
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
