import type { ReactNode } from "react"
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip"

type ItemWithName = {
  id?: string | number
  name: string
}

type CapsuleOverflowTooltipProps<T extends ItemWithName> = {
  items: T[]
  className?: string
  children: ReactNode
  side?: "top" | "bottom" | "left" | "right"
}

export function CapsuleOverflowTooltip<T extends ItemWithName>({
  items,
  className = "",
  children,
  side = "top"
}: CapsuleOverflowTooltipProps<T>) {
  if (!items || items.length === 0) {
    return <span className={className}>{children}</span>
  }

  return (
    <Tooltip>
      <TooltipTrigger
        asChild
        overlayInnerStyle={{
          backgroundColor: "rgba(17, 24, 39, 0.9)",
          color: "#F9FAFB",
          borderRadius: 8,
          border: "1px solid rgba(55, 65, 81, 0.4)",
          boxShadow: "0px 8px 24px rgba(15, 23, 42, 0.36)",
          padding: "8px 12px",
          maxWidth: 240
        }}
      >
        <span className={className}>{children}</span>
      </TooltipTrigger>
      <TooltipContent side={side}>
        <div className="flex flex-col gap-1 text-[14px] text-gray-100" style={{ maxWidth: 240 }}>
          {items.map((item, index) => (
            <span key={String(item.id ?? index)} className="truncate">
              {item.name}
            </span>
          ))}
        </div>
      </TooltipContent>
    </Tooltip>
  )
}
