import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "../lib/supabase"

const UserContext = createContext()

export function UserProvider({ children }) {
  const [user, setUser] = useState(undefined) // undefined = loading, null = not logged in

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user ?? null)
    }

    getUser()

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      console.log("Auth state changed:", session?.user)

    })

    return () => subscription?.subscription?.unsubscribe()
  }, [])

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>
}

export function useUser() {
  return useContext(UserContext)
}
