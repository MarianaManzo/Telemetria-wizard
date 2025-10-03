import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Input } from "./ui/input"
import { Clock } from "lucide-react"
import { TimePickerPopover } from "./TimePickerPopover"

interface TimePickerInputProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function TimePickerInput({ 
  value, 
  onChange, 
  placeholder = "Seleccionar hora",
  disabled = false,
  className = ""
}: TimePickerInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  const handleTimeSelect = (time: string) => {
    onChange?.(time)
    setIsOpen(false)
  }
  
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Input
            type="time"
            value={value || ''}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder}
            className={`pr-10 cursor-pointer ${className}`}
            disabled={disabled}
            onClick={() => setIsOpen(true)}
          />
          <Clock 
            className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" 
          />
        </div>
      </PopoverTrigger>
      <PopoverContent 
        className="w-auto p-0 bg-transparent border-none shadow-none" 
        align="start"
        sideOffset={4}
      >
        <TimePickerPopover
          selected={value}
          onSelect={handleTimeSelect}
          onClose={() => setIsOpen(false)}
        />
      </PopoverContent>
    </Popover>
  )
}