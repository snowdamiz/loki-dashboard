import { useState, useEffect, useCallback } from 'react'

type ToastVariant = 'default' | 'destructive'

interface Toast {
  id: string
  title: string
  description?: string
  variant?: ToastVariant
}

interface ToastState {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

// Global toast state
let toastListeners: ((toasts: Toast[]) => void)[] = []
let toasts: Toast[] = []

const notifyListeners = () => {
  toastListeners.forEach(listener => listener(toasts))
}

export function useToast() {
  const [, forceUpdate] = useState({})

  useEffect(() => {
    const listener = () => forceUpdate({})
    toastListeners.push(listener)
    return () => {
      toastListeners = toastListeners.filter(l => l !== listener)
    }
  }, [])

  const toast = useCallback((props: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = { ...props, id }
    toasts = [...toasts, newToast]
    notifyListeners()

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      toasts = toasts.filter(t => t.id !== id)
      notifyListeners()
    }, 5000)
  }, [])

  return { toast }
}

// Toast Container Component (needs to be added to the app root)
export function ToastContainer() {
  const [currentToasts, setCurrentToasts] = useState<Toast[]>([])

  useEffect(() => {
    const listener = (newToasts: Toast[]) => setCurrentToasts(newToasts)
    toastListeners.push(listener)
    return () => {
      toastListeners = toastListeners.filter(l => l !== listener)
    }
  }, [])

  if (currentToasts.length === 0) return null

  return (
    <div className="fixed bottom-0 right-0 z-50 m-4 flex max-h-screen flex-col gap-2">
      {currentToasts.map(toast => (
        <div
          key={toast.id}
          className={`
            rounded-lg border p-4 shadow-lg min-w-[300px] max-w-sm
            ${toast.variant === 'destructive' 
              ? 'bg-red-900/90 border-red-800 text-red-100' 
              : 'bg-gray-900/90 border-gray-800 text-gray-100'
            }
            animate-slide-in-right
          `}
        >
          <div className="font-medium">{toast.title}</div>
          {toast.description && (
            <div className="mt-1 text-sm opacity-90">{toast.description}</div>
          )}
        </div>
      ))}
    </div>
  )
}