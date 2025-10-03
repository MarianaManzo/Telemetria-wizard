import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog"
import { VisuallyHidden } from "./ui/visually-hidden"
import { Button } from "./ui/button"

interface TimePickerModalProps {
  isOpen: boolean
  onClose: () => void
  onTimeSelect: (time: string) => void
  value?: string
}

export function TimePickerModal({ isOpen, onClose, onTimeSelect, value }: TimePickerModalProps) {
  const [selectedHour, setSelectedHour] = useState(1)
  const [selectedMinute, setSelectedMinute] = useState(0)
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM'>('AM')

  // Initialize with current value when modal opens
  useEffect(() => {
    if (isOpen && value) {
      const [time, period] = value.split(' ')
      if (time && period) {
        const [hourStr, minuteStr] = time.split(':')
        const hour = parseInt(hourStr)
        const minute = parseInt(minuteStr)
        
        setSelectedHour(hour === 0 ? 12 : hour > 12 ? hour - 12 : hour)
        setSelectedMinute(minute)
        setSelectedPeriod(period as 'AM' | 'PM')
      }
    } else if (isOpen) {
      // Default to current time if no value
      const now = new Date()
      const hour = now.getHours()
      const minute = Math.round(now.getMinutes() / 15) * 15 // Round to nearest 15 minutes
      
      setSelectedHour(hour === 0 ? 12 : hour > 12 ? hour - 12 : hour)
      setSelectedMinute(minute)
      setSelectedPeriod(hour >= 12 ? 'PM' : 'AM')
    }
  }, [isOpen, value])

  const hours = Array.from({ length: 12 }, (_, i) => i + 1)
  const minutes = [0, 15, 30, 45]
  const periods = ['AM', 'PM'] as const

  const handleNow = () => {
    const now = new Date()
    const hour = now.getHours()
    
    setSelectedHour(hour === 0 ? 12 : hour > 12 ? hour - 12 : hour)
    setSelectedMinute(0) // Always set to 00 minutes
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
    onTimeSelect(timeString)
    onClose()
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-auto max-w-none p-0 bg-white rounded-xl shadow-xl border border-gray-200">
        <VisuallyHidden>
          <DialogTitle>Selector de Horario</DialogTitle>
          <DialogDescription>
            Selecciona la hora usando las columnas para horas, minutos y AM/PM. Puedes usar el botón "Ahora" para seleccionar la hora actual o "Aplicar" para confirmar tu selección.
          </DialogDescription>
        </VisuallyHidden>
        <div className="p-4" style={{ maxWidth: '170px' }}>
          {/* Time selector - single column */}
          <div className="mb-4">
            {/* Hours selector */}
            <div className="flex flex-col items-center">
              <div className="h-48 overflow-y-auto w-full">
                <div className="flex flex-col gap-1 py-2">
                  {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                    <button
                      key={hour}
                      onClick={() => {
                        setSelectedHour(hour === 0 ? 12 : hour > 12 ? hour - 12 : hour)
                        setSelectedPeriod(hour >= 12 ? 'PM' : 'AM')
                        setSelectedMinute(0) // Reset minutes to 00
                      }}
                      className={`w-full h-8 text-sm rounded transition-colors ${
                        ((hour === 0 && selectedHour === 12 && selectedPeriod === 'AM') ||
                         (hour > 0 && hour < 12 && selectedHour === hour && selectedPeriod === 'AM') ||
                         (hour === 12 && selectedHour === 12 && selectedPeriod === 'PM') ||
                         (hour > 12 && selectedHour === (hour - 12) && selectedPeriod === 'PM'))
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {hour.toString().padStart(2, '0')}:00
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
              Now
            </Button>
            <Button
              onClick={handleApply}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-1 h-auto rounded-md"
            >
              Ok
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}