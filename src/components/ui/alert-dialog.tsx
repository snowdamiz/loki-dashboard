import * as React from "react"

interface AlertDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

export function AlertDialog({ open, onOpenChange, children }: AlertDialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-50">
        {children}
      </div>
    </div>
  )
}

export function AlertDialogContent({ 
  className = "", 
  children 
}: { 
  className?: string
  children: React.ReactNode 
}) {
  return (
    <div className={`
      w-full max-w-lg rounded-lg border bg-gray-900 p-6 shadow-lg
      ${className}
    `}>
      {children}
    </div>
  )
}

export function AlertDialogHeader({ children }: { children: React.ReactNode }) {
  return <div className="space-y-2">{children}</div>
}

export function AlertDialogTitle({ 
  className = "", 
  children 
}: { 
  className?: string
  children: React.ReactNode 
}) {
  return (
    <h2 className={`text-lg font-semibold ${className}`}>
      {children}
    </h2>
  )
}

export function AlertDialogDescription({ 
  className = "", 
  children 
}: { 
  className?: string
  children: React.ReactNode 
}) {
  return (
    <div className={`text-sm text-gray-500 ${className}`}>
      {children}
    </div>
  )
}

export function AlertDialogFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end mt-6">
      {children}
    </div>
  )
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline'
}

export function AlertDialogAction({ 
  children, 
  className = "",
  ...props 
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium
        transition-colors focus-visible:outline-none focus-visible:ring-2 
        focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  )
}

export function AlertDialogCancel({ 
  children, 
  className = "",
  onClick,
  ...props 
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium
        transition-colors hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 
        focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50
        ${className}
      `}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
}
