import { useState } from "react"
import { Calendar } from "./ui/calendar"
import { Button } from "./ui/button"
import { Card } from "./ui/card"
import { CalendarDays, X } from "lucide-react"

interface DateRangePickerProps {
  onClose: () => void
  onApply: (startDate: Date | undefined, endDate: Date | undefined) => void
}

export function DateRangePicker({ onClose, onApply }: DateRangePickerProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [selectingStart, setSelectingStart] = useState(true)

  const handleDateSelect = (date: Date | undefined) => {
    if (selectingStart) {
      setStartDate(date)
      setEndDate(undefined)
      setSelectingStart(false)
    } else {
      setEndDate(date)
    }
  }

  const handleApply = () => {
    onApply(startDate, endDate)
    onClose()
  }

  const handleClear = () => {
    setStartDate(undefined)
    setEndDate(undefined)
    setSelectingStart(true)
  }

  const formatDate = (date: Date | undefined) => {
    if (!date) return ""
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit", 
      year: "numeric"
    })
  }

  return (
    <Card className="absolute top-full left-0 mt-2 p-4 shadow-lg z-50 bg-white border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-blue-600" />
          <span className="font-medium text-gray-900">Seleccionar rango de fechas</span>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex gap-4 mb-4">
        <div className="flex-1">
          <label className="block text-sm text-gray-600 mb-1">Fecha inicio</label>
          <div className={`px-3 py-2 border rounded-md text-sm ${
            selectingStart ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
          }`}>
            {startDate ? formatDate(startDate) : "Seleccionar fecha"}
          </div>
        </div>
        <div className="flex-1">
          <label className="block text-sm text-gray-600 mb-1">Fecha fin</label>
          <div className={`px-3 py-2 border rounded-md text-sm ${
            !selectingStart ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
          }`}>
            {endDate ? formatDate(endDate) : "Seleccionar fecha"}
          </div>
        </div>
      </div>

      <div className="mb-4">
        <Calendar
          mode="single"
          selected={selectingStart ? startDate : endDate}
          onSelect={handleDateSelect}
          className="rounded-md border"
        />
      </div>

      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={handleClear}>
          Limpiar
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            size="sm" 
            onClick={handleApply}
            disabled={!startDate || !endDate}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Aplicar
          </Button>
        </div>
      </div>
    </Card>
  )
}