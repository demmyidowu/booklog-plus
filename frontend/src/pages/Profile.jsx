"use client"

import { useEffect, useState } from "react"
import { User, LogOut } from "lucide-react"
import { supabase } from "../lib/supabase"
import Button from "./components/Button"
import Input from "./components/Input"
import Card from "./components/Card"
import toast from "react-hot-toast"
import { useUser } from "./UserContext"
//import { trackEvent, trackError } from "../lib/analytics"

export default function Profile({ onSignOut }) {
  const user = useUser()
  // Initialize state from user metadata if available
  const [firstName, setFirstName] = useState(user?.user_metadata?.name || "")
  const [initialName, setInitialName] = useState(user?.user_metadata?.name || "")
  const [isLoading, setIsLoading] = useState(false)
  const [bookCount, setBookCount] = useState(0)
  const [favoriteGenre, setFavoriteGenre] = useState("")
  const [readingGoal, setReadingGoal] = useState("")

  // Update state when user data changes
  useEffect(() => {
    if (user?.user_metadata?.name) {
      setFirstName(user.user_metadata.name)
      setInitialName(user.user_metadata.name)
    }
  }, [user])

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return
      setIsLoading(true)
      try {
        // Fetch book count from your Flask backend
        const response = await fetch(`http://127.0.0.1:5000/books?user_id=${user.id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch books')
        }
        const books = await response.json()
        setBookCount(books.length)
      } catch (err) {
        console.error("❌ Error:", err)
        toast.error("Failed to load some data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) return

    if (!firstName.trim()) {
      toast.error("First name is required")
      trackError(
        new Error("First name required"),
        { userId: user?.id },
        'Profile'
      )
      return
    }

    setIsLoading(true)
    try {
      // Update Supabase auth metadata
      const { error: userError } = await supabase.auth.updateUser({
        data: { name: firstName }
      })

      if (userError) {
        trackError(userError, { userId: user?.id, updateType: 'auth' }, 'Profile')
        throw userError
      }

      // Update User_Profile table
      const { error: profileError } = await supabase
        .from("User_Profile")
        .upsert([
          {
            user_id: user.id,
            first_name: firstName,
            favorite_genre: favoriteGenre,
            reading_goal: readingGoal
          }
        ])

      if (profileError) {
        trackError(profileError, {
          userId: user?.id,
          updateType: 'profile',
          fields: { favoriteGenre, readingGoal }
        }, 'Profile')
        throw profileError
      }

      toast.success("✅ Profile updated!")
      setInitialName(firstName)
      //trackEvent('Profile', 'Profile Updated Successfully')
    } catch (error) {
      console.error("❌ Save error:", error)
      trackError(error, {
        userId: user?.id,
        firstName,
        favoriteGenre,
        readingGoal
      }, 'Profile')
      toast.error("Failed to save profile")
      // Revert to previous name on error
      setFirstName(initialName)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setFirstName(initialName)
    toast("Changes canceled")
  }

  if (!user) return <p className="p-6">Please sign in to view your profile.</p>

  // Get initials from the current display name (firstName), not the saved one
  const initials = firstName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || "?"

  return (
    <div className="p-6 space-y-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 mb-6">Profile Settings</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="border-slate-200">
            <div className="p-6 text-center">
              <div className="w-20 h-20 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-medium">
                {initials}
              </div>
              <h2 className="text-xl text-slate-800 font-semibold">
                {isLoading ? "Loading..." : firstName || "Add your name"}
              </h2>
              <p className="text-slate-600 text-sm mt-1">So well-read, practically shelf-taught</p>
              <div className="mt-6">
                <div className="grid gap-4 text-sm">
                  <div>
                    <p className="font-medium text-slate-800">{bookCount}</p>
                    <p className="text-slate-600">Books Read</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="lg:col-span-2 space-y-6">
            <Card className="border-slate-200">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <User className="h-5 w-5 text-slate-600" />
                  <h3 className="text-slate-800 font-semibold">Account Information</h3>
                </div>
                <p className="text-slate-600 text-sm mb-6">Update your personal details</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="firstName" className="text-slate-700 text-sm font-medium">
                      First Name
                    </label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      disabled={isLoading}
                      className="border-slate-200 focus:border-blue-400 focus:ring-blue-400"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                      Save Changes
                    </Button>
                    <Button
                      type="button"
                      onClick={handleCancel}
                      variant="outline"
                      className="border-slate-200 text-slate-700 hover:bg-slate-50"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={onSignOut}
                      className="ml-auto"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </form>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
