import { useState } from "react"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { Button } from "./ui/button"

interface CustomCalendarProps {
  selected?: Date
  onSelect?: (date: Date) => void
  onClose?: () => void
}

export function CustomCalendar({ selected, onSelect, onClose }: CustomCalendarProps) {
  const [currentDate, setCurrentDate] = useState(selected || new Date())
  
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]
  
  const daysOfWeek = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa']
  
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  
  // Get first day of month and number of days
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const daysInMonth = lastDayOfMonth.getDate()
  const startingDayOfWeek = firstDayOfMonth.getDay()
  
  // Get days from previous month
  const daysFromPrevMonth = startingDayOfWeek
  const prevMonth = new Date(year, month, 0)
  const daysInPrevMonth = prevMonth.getDate()
  
  // Calculate how many days to show from next month
  const totalCells = 42 // 6 rows × 7 days
  const daysFromNextMonth = totalCells - daysInMonth - daysFromPrevMonth
  
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }
  
  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }
  
  const handlePrevYear = () => {
    setCurrentDate(new Date(year - 1, month, 1))
  }
  
  const handleNextYear = () => {
    setCurrentDate(new Date(year + 1, month, 1))
  }
  
  const handleDateSelect = (day: number, monthOffset: number = 0) => {
    const selectedDate = new Date(year, month + monthOffset, day)
    onSelect?.(selectedDate)
    onClose?.()
  }
  
  const handleToday = () => {
    const today = new Date()
    setCurrentDate(today)
    onSelect?.(today)
    onClose?.()
  }
  
  const isSelected = (day: number, monthOffset: number = 0) => {
    if (!selected) return false
    const dateToCheck = new Date(year, month + monthOffset, day)
    return dateToCheck.toDateString() === selected.toDateString()
  }
  
  const isToday = (day: number, monthOffset: number = 0) => {
    const today = new Date()
    const dateToCheck = new Date(year, month + monthOffset, day)
    return dateToCheck.toDateString() === today.toDateString()
  }
  
  return (
    <div 
      className="!bg-white rounded-xl shadow-lg border border-gray-200 p-4 w-80 !text-gray-900"
      style={{ 
        backgroundColor: '#ffffff !important',
        color: '#111827 !important'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 !text-gray-400 hover:!text-gray-600"
            onClick={handlePrevYear}
          >
            <ChevronsLeft className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 !text-gray-400 hover:!text-gray-600"
            onClick={handlePrevMonth}
          >
            <ChevronLeft className="h-3 w-3" />
          </Button>
        </div>
        
        <h2 
          className="text-sm font-medium !text-gray-900"
          style={{ color: '#111827 !important' }}
        >
          {months[month]} {year}
        </h2>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 !text-gray-400 hover:!text-gray-600"
            onClick={handleNextMonth}
          >
            <ChevronRight className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 !text-gray-400 hover:!text-gray-600"
            onClick={handleNextYear}
          >
            <ChevronsRight className="h-3 w-3" />
          </Button>
        </div>
      </div>
      
      {/* Days of week */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {daysOfWeek.map((day) => (
          <div 
            key={day} 
            className="text-center text-xs font-medium !text-gray-500 py-2"
            style={{ color: '#6b7280 !important' }}
          >
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Previous month days */}
        {Array.from({ length: daysFromPrevMonth }, (_, i) => {
          const day = daysInPrevMonth - daysFromPrevMonth + i + 1
          return (
            <button
              key={`prev-${day}`}
              className="h-8 w-8 text-xs !text-gray-300 hover:!bg-gray-50 rounded flex items-center justify-center"
              onClick={() => handleDateSelect(day, -1)}
              style={{ 
                color: '#d1d5db !important',
                backgroundColor: 'transparent !important'
              }}
            >
              {day}
            </button>
          )
        })}
        
        {/* Current month days */}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1
          const selected = isSelected(day)
          const today = isToday(day)
          
          return (
            <button
              key={day}
              className={`h-8 w-8 text-xs rounded flex items-center justify-center transition-colors ${
                selected
                  ? '!bg-blue-600 !text-white hover:!bg-blue-700'
                  : today
                  ? '!bg-blue-100 !text-blue-600 hover:!bg-blue-200'
                  : '!text-gray-900 hover:!bg-gray-100'
              }`}
              onClick={() => handleDateSelect(day)}
              style={
                selected
                  ? { backgroundColor: '#2563eb !important', color: '#ffffff !important' }
                  : today
                  ? { backgroundColor: '#dbeafe !important', color: '#2563eb !important' }
                  : { color: '#111827 !important', backgroundColor: 'transparent !important' }
              }
            >
              {day}
            </button>
          )
        })}
        
        {/* Next month days */}
        {Array.from({ length: daysFromNextMonth }, (_, i) => {
          const day = i + 1
          return (
            <button
              key={`next-${day}`}
              className="h-8 w-8 text-xs !text-gray-300 hover:!bg-gray-50 rounded flex items-center justify-center"
              onClick={() => handleDateSelect(day, 1)}
              style={{ 
                color: '#d1d5db !important',
                backgroundColor: 'transparent !important'
              }}
            >
              {day}
            </button>
          )
        })}
      </div>
      
      {/* Today button */}
      <div className="flex justify-center mt-4 pt-3 border-t !border-gray-100">
        <Button
          variant="ghost"
          size="sm"
          className="!text-blue-600 hover:!text-blue-700 hover:!bg-blue-50 text-sm"
          onClick={handleToday}
          style={{ 
            color: '#2563eb !important',
            backgroundColor: 'transparent !important'
          }}
        >
          Hoy
        </Button>
      </div>
    </div>
  )
}