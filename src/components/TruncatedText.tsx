import { useRef, useEffect, useState } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"

interface TruncatedTextProps {
  text: string
  className?: string
  children?: React.ReactNode
  maxLines?: number
}

export function TruncatedText({ text, className = "", children, maxLines = 1 }: TruncatedTextProps) {
  const textRef = useRef<HTMLDivElement>(null)
  const [isTruncated, setIsTruncated] = useState(false)

  useEffect(() => {
    const checkTruncation = () => {
      if (textRef.current) {
        const element = textRef.current
        
        if (maxLines === 1) {
          // For single line truncation, check if scrollWidth > clientWidth
          setIsTruncated(element.scrollWidth > element.clientWidth)
        } else {
          // For multi-line truncation, check if scrollHeight > clientHeight
          setIsTruncated(element.scrollHeight > element.clientHeight)
        }
      }
    }

    // Check truncation on mount and when text changes
    checkTruncation()

    // Check truncation on window resize
    window.addEventListener('resize', checkTruncation)
    return () => window.removeEventListener('resize', checkTruncation)
  }, [text, maxLines])

  const truncateClass = maxLines === 1 ? 'truncate' : `line-clamp-${maxLines}`

  if (isTruncated) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div 
              ref={textRef} 
              className={`${truncateClass} ${className}`}
            >
              {children || text}
            </div>
          </TooltipTrigger>
          <TooltipContent 
            side="top" 
            className="bg-black text-white border-black max-w-xs break-words"
          >
            {text}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <div 
      ref={textRef} 
      className={`${truncateClass} ${className}`}
    >
      {children || text}
    </div>
  )
}