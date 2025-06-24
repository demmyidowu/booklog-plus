// Simple header component for user greeting and logout functionality
export default function Header({ user, onSignOut }) {
  return (
    <div className="flex justify-between items-center p-4 bg-slate-100 border-b">
      {/* Welcome message with user's name */}
      <span className="text-lg font-semibold">Welcome, {user} 👋</span>
      
      {/* Logout button */}
      <button 
        onClick={onSignOut}  // Trigger logout when clicked
        className="text-red-500 hover:underline"  // Red styling to indicate destructive action
      >
        Log Out
      </button>
    </div>
  )
}
