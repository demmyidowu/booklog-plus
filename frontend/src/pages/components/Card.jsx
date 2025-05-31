export default function Card({ children, className = "", ...props }) {
  const classes = `rounded-lg border border-slate-200 bg-white text-slate-950 shadow-sm ${className}`

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  )
}
