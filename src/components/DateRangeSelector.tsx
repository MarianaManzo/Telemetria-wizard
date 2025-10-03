import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Card } from "./ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { CalendarDays, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react"

interface DateRangeSelectorProps {
  onDateRangeSelect: (startDate: Date | undefined, endDate: Date | undefined) => void
  selectedRange?: { start?: Date; end?: Date }
  disabled?: boolean
  showError?: boolean
  isFilled?: boolean
}

export function DateRangeSelector({ onDateRangeSelect, selectedRange, disabled = false, showError = false, isFilled = false }: DateRangeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [startDate, setStartDate] = useState<Date | undefined>(selectedRange?.start)
  const [endDate, setEndDate] = useState<Date | undefined>(selectedRange?.end)
  const [selectingStart, setSelectingStart] = useState(true)
  const [hoverDate, setHoverDate] = useState<Date | undefined>()
  const [validationError, setValidationError] = useState<string | null>(null)

  useEffect(() => {
    setStartDate(selectedRange?.start)
    setEndDate(selectedRange?.end)
  }, [selectedRange])

  // Función para calcular diferencia en días
  const calculateDaysDifference = (start: Date, end: Date): number => {
    const timeDiff = Math.abs(end.getTime() - start.getTime())
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1 // +1 para incluir ambos días
  }

  // Función para validar el rango de fechas
  const validateDateRange = (start: Date, end: Date): boolean => {
    const daysDiff = calculateDaysDifference(start, end)
    if (daysDiff > 30) {
      setValidationError(`El rango seleccionado es de ${daysDiff} días. Selecciona máximo 30 días para tu consulta.`)
      return false
    }
    setValidationError(null)
    return true
  }

  // Función para verificar si un día debe estar deshabilitado
  const isDateDisabled = (date: Date): boolean => {
    // Si estamos seleccionando el primer día, ningún día está deshabilitado
    if (selectingStart) return false
    
    // Si no hay fecha de inicio seleccionada, ningún día está deshabilitado
    if (!startDate) return false
    
    // Calcular cuántos días tendría el rango si seleccionamos esta fecha
    let potentialEnd = date
    let potentialStart = startDate
    
    // Si la fecha potencial es anterior al inicio, intercambiar
    if (date < startDate) {
      potentialStart = date
      potentialEnd = startDate
    }
    
    const daysDiff = calculateDaysDifference(potentialStart, potentialEnd)
    
    // Deshabilitar si excede 30 días
    return daysDiff > 30
  }

  const handleDateClick = (date: Date) => {
    if (selectingStart) {
      // Primer clic = Inicio (resaltado)
      setStartDate(date)
      setEndDate(undefined)
      setSelectingStart(false)
      setValidationError(null) // Limpiar error al iniciar nueva selección
    } else {
      // Segundo clic = Fin → validar y confirmar
      let finalStart = startDate!
      let finalEnd = date
      
      // Si el Fin es anterior al Inicio, reordenar automáticamente
      if (date < startDate!) {
        finalStart = date
        finalEnd = startDate!
      }
      
      // Validar el rango antes de aplicar
      if (validateDateRange(finalStart, finalEnd)) {
        setStartDate(finalStart)
        setEndDate(finalEnd)
        
        // Aplicar selección automáticamente solo si es válida
        onDateRangeSelect(finalStart, finalEnd)
        
        // Cerrar el calendario
        setIsOpen(false)
        
        // Reset para próxima selección
        setSelectingStart(true)
        setHoverDate(undefined)
      } else {
        // No aplicar la selección si el rango es inválido
        // Mantener el calendario abierto para que el usuario pueda corregir
        setStartDate(finalStart)
        setEndDate(finalEnd)
      }
    }
  }

  const handleDateHover = (date: Date) => {
    // Hover previsualiza el rango solo si ya tenemos fecha de inicio
    if (!selectingStart && startDate) {
      // Verificar si el hover excedería los 30 días
      let potentialStart = startDate
      let potentialEnd = date
      
      if (date < startDate) {
        potentialStart = date
        potentialEnd = startDate
      }
      
      const daysDiff = calculateDaysDifference(potentialStart, potentialEnd)
      
      if (daysDiff > 30) {
        setValidationError(`Este rango sería de ${daysDiff} días. Selecciona máximo 30 días para tu consulta.`)
      } else {
        setValidationError(null)
        setHoverDate(date)
      }
    }
  }

  const handleDateLeave = () => {
    setHoverDate(undefined)
    // Limpiar error de hover si no estamos en un estado de error persistente
    if (validationError && validationError.includes('Este rango sería de')) {
      setValidationError(null)
    }
  }

  const handleClear = () => {
    // Limpiar reinicia la selección y vacía el input
    setStartDate(undefined)
    setEndDate(undefined)
    setSelectingStart(true)
    setHoverDate(undefined)
    setValidationError(null)
    onDateRangeSelect(undefined, undefined)
  }

  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const formatDateRange = () => {
    // Prioritize selectedRange from props (external state) over internal state
    const start = selectedRange?.start
    const end = selectedRange?.end
    
    if (start && end) {
      const formatDate = (date: Date) => {
        const day = date.getDate().toString().padStart(2, '0')
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const year = date.getFullYear()
        return `${day}/${month}/${year}`
      }
      return `${formatDate(start)} — ${formatDate(end)}`
    }
    return "Selecciona un rango"
  }

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString("es-ES", { month: "long", year: "numeric" })
  }

  const isDateInRange = (date: Date): boolean => {
    // Use selected range from props if available, otherwise use internal state
    const currentStart = selectedRange?.start || startDate
    const currentEnd = selectedRange?.end || endDate
    
    if (!currentStart) return false
    
    // Use hoverDate for preview when actively selecting, otherwise use the actual end date
    const rangeEnd = hoverDate || currentEnd
    if (!rangeEnd) return false
    
    const actualStart = currentStart < rangeEnd ? currentStart : rangeEnd
    const actualEnd = currentStart < rangeEnd ? rangeEnd : currentStart
    
    return date >= actualStart && date <= actualEnd
  }

  const isDateStart = (date: Date): boolean => {
    // Use selected range from props if available, otherwise use internal state
    const currentStart = selectedRange?.start || startDate
    const currentEnd = selectedRange?.end || endDate
    
    if (!currentStart) return false
    
    const rangeEnd = hoverDate || currentEnd
    if (!rangeEnd) return date.getTime() === currentStart.getTime()
    
    const actualStart = currentStart < rangeEnd ? currentStart : rangeEnd
    return date.getTime() === actualStart.getTime()
  }

  const isDateEnd = (date: Date): boolean => {
    // Use selected range from props if available, otherwise use internal state
    const currentStart = selectedRange?.start || startDate
    const currentEnd = selectedRange?.end || endDate
    
    if (!currentStart) return false
    
    const rangeEnd = hoverDate || currentEnd
    if (!rangeEnd) return false
    
    const actualEnd = currentStart < rangeEnd ? rangeEnd : currentStart
    return date.getTime() === actualEnd.getTime()
  }

  const getDayStyle = (date: Date, isCurrentMonthDay: boolean): string => {
    const baseClasses = "h-8 flex items-center justify-center text-sm"
    
    if (!isCurrentMonthDay) {
      return `${baseClasses} text-gray-400 cursor-default`
    }
    
    // Verificar si el día está deshabilitado
    const disabled = isDateDisabled(date)
    
    if (disabled) {
      return `${baseClasses} text-gray-300 cursor-not-allowed bg-gray-50`
    }
    
    if (isDateStart(date)) {
      return `${baseClasses} text-white bg-blue-600 rounded cursor-pointer`
    }
    
    if (isDateEnd(date)) {
      return `${baseClasses} text-white bg-blue-600 rounded cursor-pointer`
    }
    
    if (isDateInRange(date)) {
      return `${baseClasses} text-white bg-blue-600 cursor-pointer`
    }
    
    return `${baseClasses} text-gray-900 hover:bg-gray-100 rounded cursor-pointer`
  }

  const renderCalendarDays = (monthDate: Date) => {
    const year = monthDate.getFullYear()
    const month = monthDate.getMonth()
    
    // Get first day of month and calculate starting position
    const firstDay = new Date(year, month, 1)
    const startDate = new Date(firstDay)
    // Adjust for Sunday = 0, but we want Sunday = 7
    const dayOfWeek = firstDay.getDay() === 0 ? 7 : firstDay.getDay()
    startDate.setDate(startDate.getDate() - (dayOfWeek - 1))
    
    // Generate 42 days (6 weeks)
    const days = []
    const currentDate = new Date(startDate)
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(currentDate)
      const isCurrentMonthDay = date.getMonth() === month
      const disabled = isDateDisabled(date)
      
      days.push(
        <div
          key={i}
          className={getDayStyle(date, isCurrentMonthDay)}
          onClick={() => isCurrentMonthDay && !disabled && handleDateClick(date)}
          onMouseEnter={() => {
            if (isCurrentMonthDay) {
              if (disabled) {
                // Mostrar mensaje de error para días deshabilitados
                if (!selectingStart && startDate) {
                  let potentialStart = startDate
                  let potentialEnd = date
                  
                  if (date < startDate) {
                    potentialStart = date
                    potentialEnd = startDate
                  }
                  
                  const daysDiff = calculateDaysDifference(potentialStart, potentialEnd)
                  setValidationError(`Este rango sería de ${daysDiff} días. Selecciona máximo 30 días para tu consulta.`)
                }
              } else {
                handleDateHover(date)
              }
            }
          }}
          onMouseLeave={() => {
            if (isCurrentMonthDay) {
              handleDateLeave()
            }
          }}
        >
          {date.getDate()}
        </div>
      )
      
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    return days
  }

  const previousMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          disabled={disabled}
          className={`w-72 h-8 rounded-lg justify-between text-left font-normal px-3 ${
            showError 
              ? 'border-red-200 bg-red-50 hover:bg-red-100' 
              : isFilled
                ? 'border-blue-200 bg-blue-50 hover:bg-blue-100'
                : 'border-gray-200 bg-white hover:bg-gray-50'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <CalendarDays className={`w-4 h-4 flex-shrink-0 ${
              showError 
                ? 'text-red-600' 
                : isFilled 
                  ? 'text-blue-600' 
                  : 'text-gray-600'
            }`} />
            <span className={`text-sm font-semibold truncate ${
              showError 
                ? 'text-red-900' 
                : isFilled 
                  ? 'text-blue-600' 
                  : 'text-gray-900'
            }`}>Rango: {formatDateRange()}</span>
          </div>
          <ChevronDown className={`w-4 h-4 flex-shrink-0 ${
            showError 
              ? 'text-red-400' 
              : isFilled 
                ? 'text-blue-400' 
                : 'text-gray-400'
          }`} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[600px] p-0" align="start">
        <Card className="border-0 shadow-none">
          <div className="p-6 bg-white">
            {/* Navigation Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={handlePreviousMonth} className="p-1 hover:bg-gray-100">
                  <ChevronLeft className="w-4 h-4" />
                  <ChevronLeft className="w-4 h-4 -ml-2" />
                </Button>
                <Button variant="ghost" size="sm" onClick={handlePreviousMonth} className="p-1 hover:bg-gray-100">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex items-center gap-8">
                <span className="text-base font-medium text-gray-900">{getMonthName(previousMonth)}</span>
                <span className="text-base font-medium text-gray-900">{getMonthName(currentMonth)}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={handleNextMonth} className="p-1 hover:bg-gray-100">
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleNextMonth} className="p-1 hover:bg-gray-100">
                  <ChevronRight className="w-4 h-4" />
                  <ChevronRight className="w-4 h-4 -ml-2" />
                </Button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-2 gap-8">
              {/* Previous Month */}
              <div className="min-w-0">
                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'].map((day) => (
                    <div key={day} className="h-8 flex items-center justify-center text-sm text-gray-600 font-medium">
                      {day}
                    </div>
                  ))}
                </div>
                
                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-1">
                  {renderCalendarDays(previousMonth)}
                </div>
              </div>

              {/* Current Month */}
              <div className="min-w-0">
                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'].map((day) => (
                    <div key={day} className="h-8 flex items-center justify-center text-sm text-gray-600 font-medium">
                      {day}
                    </div>
                  ))}
                </div>
                
                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-1">
                  {renderCalendarDays(currentMonth)}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleClear}
                className="text-blue-600 hover:text-blue-800"
              >
                Limpiar
              </Button>
              <p className={`text-sm ${validationError ? 'text-red-600' : 'text-gray-600'}`}>
                {validationError || '*Selecciona máximo 30 días para tu consulta.'}
              </p>
            </div>
          </div>
        </Card>
      </PopoverContent>
    </Popover>
  )
}