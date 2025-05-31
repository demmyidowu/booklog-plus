export default function Select({ children, className = "", ...props }) {
  const classes = `flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`

  return (
    <select className={classes} {...props}>
      {children}
    </select>
  )
}
