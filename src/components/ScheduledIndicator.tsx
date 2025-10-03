import { Mail } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"

interface ScheduledIndicatorProps {
  count: number
}

export function ScheduledIndicator({ count }: ScheduledIndicatorProps) {
  if (count === 0) return null

  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1.5 cursor-pointer">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <Mail className="w-4 h-4" />
              <span className="text-xs">
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Programación activada</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}