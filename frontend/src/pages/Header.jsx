export default function Header({ user, onSignOut }) {
  return (
    <div className="flex justify-between items-center p-4 bg-slate-100 border-b">
      <span className="text-lg font-semibold">Welcome, {user} 👋</span>
      <button onClick={onSignOut} className="text-red-500 hover:underline">
        Log Out
      </button>
    </div>
  )
}
