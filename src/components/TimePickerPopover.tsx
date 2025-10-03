import { useState, useEffect } from "react"
import { Button } from "./ui/button"

interface TimePickerPopoverProps {
  selected?: string
  onSelect?: (time: string) => void
  onClose?: () => void
}

export function TimePickerPopover({ selected, onSelect, onClose }: TimePickerPopoverProps) {
  const [selectedHour, setSelectedHour] = useState(1)
  const [selectedMinute, setSelectedMinute] = useState(0)
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>('AM')

  // Initialize with current value
  useEffect(() => {
    if (selected) {
      const [hourStr, minuteStr] = selected.split(':')
      const hour24 = parseInt(hourStr)
      const minute = parseInt(minuteStr)
      
      if (hour24 === 0) {
        setSelectedHour(12)
        setSelectedPeriod('AM')
      } else if (hour24 <= 12) {
        setSelectedHour(hour24)
        setSelectedPeriod(hour24 === 12 ? 'PM' : 'AM')
      } else {
        setSelectedHour(hour24 - 12)
        setSelectedPeriod('PM')
      }
      
      setSelectedMinute(minute)
    } else {
      // Default to current time if no value
      const now = new Date()
      const hour = now.getHours()
      const minute = Math.round(now.getMinutes() / 15) * 15 // Round to nearest 15 minutes
      
      setSelectedHour(hour === 0 ? 12 : hour > 12 ? hour - 12 : hour)
      setSelectedMinute(minute >= 60 ? 0 : minute)
      setSelectedPeriod(hour >= 12 ? 'PM' : 'AM')
    }
  }, [selected])

  const hours = Array.from({ length: 12 }, (_, i) => i + 1)
  const minutes = [0, 15, 30, 45]
  const periods = ['AM', 'PM'] as const

  const handleNow = () => {
    const now = new Date()
    const hour = now.getHours()
    const minute = Math.round(now.getMinutes() / 15) * 15 // Round to nearest 15 minutes
    
    setSelectedHour(hour === 0 ? 12 : hour > 12 ? hour - 12 : hour)
    setSelectedMinute(minute >= 60 ? 0 : minute)
    setSelectedPeriod(hour >= 12 ? 'PM' : 'AM')
  }

  const handleApply = () => {
    // Convert to 24-hour format for the time input
    let hour24 = selectedHour
    if (selectedPeriod === 'PM' && selectedHour !== 12) {
      hour24 += 12
    } else if (selectedPeriod === 'AM' && selectedHour === 12) {
      hour24 = 0
    }
    
    const timeString = `${hour24.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`
    onSelect?.(timeString)
    onClose?.()
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 w-64">
      {/* Time selector grid */}
      <div className="flex gap-4 mb-6">
        {/* Hours column */}
        <div className="flex flex-col items-center">
          <div className="h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
            <div className="flex flex-col gap-1 py-2">
              {hours.map((hour) => (
                <button
                  key={hour}
                  onClick={() => setSelectedHour(hour)}
                  className={`w-12 h-8 text-sm rounded transition-colors ${
                    selectedHour === hour
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {hour.toString().padStart(2, '0')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Minutes column */}
        <div className="flex flex-col items-center">
          <div className="h-32 overflow-y-auto">
            <div className="flex flex-col gap-1 py-2">
              {minutes.map((minute) => (
                <button
                  key={minute}
                  onClick={() => setSelectedMinute(minute)}
                  className={`w-12 h-8 text-sm rounded transition-colors ${
                    selectedMinute === minute
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {minute.toString().padStart(2, '0')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* AM/PM column */}
        <div className="flex flex-col items-center">
          <div className="h-32 flex flex-col justify-center">
            <div className="flex flex-col gap-1">
              {periods.map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`w-12 h-8 text-sm rounded transition-colors ${
                    selectedPeriod === period
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex justify-between items-center">
        <Button
          variant="ghost"
          onClick={handleNow}
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-sm px-3 py-1 h-auto"
        >
          Ahora
        </Button>
        <Button
          onClick={handleApply}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-1 h-auto rounded-md"
        >
          Aplicar
        </Button>
      </div>
    </div>
  )
}