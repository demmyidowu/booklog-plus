// React context and hooks for state management and lifecycle
import { createContext, useContext, useEffect, useState } from "react"
// Supabase client for authentication state management
import { supabase } from "../lib/supabase"

// Create React Context for user authentication state
// This allows any component in the app to access the current user
const UserContext = createContext()

export function UserProvider({ children }) {
  // User authentication state management
  // undefined = still loading, null = not logged in, object = logged in user
  const [user, setUser] = useState(undefined)

  // Set up authentication state management when component mounts
  useEffect(() => {
    // Get current user session on initial load
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user ?? null)  // Set user or null if not authenticated
    }

    // Initialize user state
    getUser()

    // Listen for authentication state changes (login, logout, token refresh)
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)  // Update user state when auth changes
      console.log("Auth state changed:", session?.user)  // Debug logging
    })

    // Cleanup: unsubscribe from auth state changes when component unmounts
    return () => subscription?.subscription?.unsubscribe()
  }, [])  // Empty dependency array - only run once on mount

  // Provide user state to all child components
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>
}

// Custom hook to access user authentication state from any component
// Usage: const user = useUser()
export function useUser() {
  return useContext(UserContext)  // Return current user from context
}
