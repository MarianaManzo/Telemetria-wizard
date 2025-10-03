import { toast } from "sonner@2.0.3"
import { CheckCircle, X } from "lucide-react"

interface CustomToastProps {
  title: string
  description: string
  type?: 'success' | 'error' | 'info'
}

export const showCustomToast = ({ title, description, type = 'success' }: CustomToastProps) => {
  const iconColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'
  const IconComponent = type === 'success' ? CheckCircle : type === 'error' ? X : CheckCircle

  return toast.custom((t) => (
    <div className="flex items-center gap-3 bg-background p-4 rounded-lg shadow-lg border border-border max-w-md">
      <div className="flex-shrink-0">
        <div className={`w-8 h-8 ${iconColor} rounded-full flex items-center justify-center`}>
          {type === 'success' ? (
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : type === 'error' ? (
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-foreground font-medium">
          {title}
        </p>
        <p className="text-muted-foreground">
          {description}
        </p>
      </div>
      <button
        onClick={() => toast.dismiss(t)}
        className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  ))
}