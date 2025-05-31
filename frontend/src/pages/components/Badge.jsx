export default function Badge({ children, variant = "default", className = "", ...props }) {
  const baseClasses =
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"

  const variants = {
    default: "bg-slate-900 text-slate-50 hover:bg-slate-800",
    secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
    destructive: "bg-red-500 text-white hover:bg-red-600",
    outline: "border border-slate-200 text-slate-900 hover:bg-slate-100",
  }

  const classes = `${baseClasses} ${variants[variant]} ${className}`

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  )
}
