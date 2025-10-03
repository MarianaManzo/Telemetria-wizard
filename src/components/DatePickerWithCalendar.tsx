import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Input } from "./ui/input"
import { Calendar } from "lucide-react"
import { CustomCalendar } from "./CustomCalendar"

interface DatePickerWithCalendarProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function DatePickerWithCalendar({ 
  value, 
  onChange, 
  placeholder = "Seleccionar fecha",
  disabled = false,
  className = ""
}: DatePickerWithCalendarProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  const handleDateSelect = (date: Date) => {
    // Format date as YYYY-MM-DD for input[type="date"]
    const formattedDate = date.toISOString().split('T')[0]
    onChange?.(formattedDate)
    setIsOpen(false)
  }
  
  const selectedDate = value ? new Date(value + 'T00:00:00') : undefined
  
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Input
            type="date"
            value={value || ''}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder}
            className={`bg-white border-gray-300 text-sm pr-10 cursor-pointer ${className}`}
            disabled={disabled}
            onClick={() => setIsOpen(true)}
          />
          <Calendar 
            className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" 
          />
        </div>
      </PopoverTrigger>
      <PopoverContent 
        className="w-auto p-0 border-none shadow-none" 
        align="start"
        sideOffset={4}
        style={{ 
          backgroundColor: 'transparent !important', 
          border: 'none !important',
          boxShadow: 'none !important'
        }}
      >
        <div 
          style={{ 
            backgroundColor: '#ffffff', 
            borderRadius: '12px',
            isolation: 'isolate'
          }}
        >
          <CustomCalendar
            selected={selectedDate}
            onSelect={handleDateSelect}
            onClose={() => setIsOpen(false)}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}