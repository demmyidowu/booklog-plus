import { useState } from "react"
import { supabase } from "../lib/supabase"

export default function UpdatePassword() {
  const [newPassword, setNewPassword] = useState("")

  const handleUpdate = async () => {
    const { data, error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) alert("Error: " + error.message)
    else alert("Password updated successfully!")
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Update Your Password</h1>
      <input
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        className="border p-2 w-full mb-4"
        placeholder="New password"
      />
      <button onClick={handleUpdate} className="bg-blue-600 text-white px-4 py-2 rounded">
        Update Password
      </button>
    </div>
  )
}
