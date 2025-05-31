"use client"

export default function Button({
  children,
  variant = "default",
  className = "",
  disabled = false,
  type = "button",
  onClick,
  ...props
}) {
  const baseClasses =
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 px-4 py-2"

  const variants = {
    default: "bg-slate-900 text-slate-50 hover:bg-slate-800",
    destructive: "bg-red-500 text-white hover:bg-red-600",
    outline: "border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900",
    secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200",
    ghost: "hover:bg-slate-100 hover:text-slate-900",
  }

  const classes = `${baseClasses} ${variants[variant]} ${className}`

  return (
    <button type={type} className={classes} disabled={disabled} onClick={onClick} {...props}>
      {children}
    </button>
  )
}
