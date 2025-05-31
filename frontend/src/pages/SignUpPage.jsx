
"use client"

import { useState } from "react"
import { BookOpen } from "lucide-react"
import { supabase } from "../lib/supabase"
import Button from "./components/Button"
import Input from "./components/Input"
import Card from "./components/Card"

export default function SignUpPage({ onNavigateToSignIn }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: { name: formData.name },
        emailRedirectTo: "http://localhost:5173/update-password"
      },
    })

    if (signUpError) return alert("Signup failed: " + signUpError.message)

    const user = signUpData?.user
    if (!user) return alert("Signup succeeded, but no user returned.")

    const { error: profileError } = await supabase.from("User_Profile").upsert([
      { id: user.id, 
        name: formData.name }
    ])

    if (profileError) alert("Failed to create profile: " + profileError.message)
    else alert("Signup successful! Please check your email.")
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
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">Create Account</Button>
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
