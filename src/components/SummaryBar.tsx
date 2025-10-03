import { useMemo } from "react"

interface TripRecord {
  unidad: string
  fecha: string
  distanciaKm: number
  velocidadMaxima: number
  numeroViajes: number
  inicioMovimiento: string
  ubicacionInicio: string
  ubicacionFin: string
  finMovimiento: string
}

interface SummaryBarProps {
  data: TripRecord[]
  generatedWithFilters?: any
}

export function SummaryBar({ data, generatedWithFilters }: SummaryBarProps) {
  const stats = useMemo(() => {
    if (data.length === 0) {
      return {
        dateRange: "-",
        totalUnits: 0,
        totalKm: 0,
        averageDailyKm: 0,
        maxSpeed: 0
      }
    }

    // Calculate date range
    const dates = [...new Set(data.map(record => record.fecha))].sort((a, b) => {
      // Convert DD/MM/YYYY to Date for proper sorting
      const [dayA, monthA, yearA] = a.split('/').map(Number)
      const [dayB, monthB, yearB] = b.split('/').map(Number)
      const dateA = new Date(yearA, monthA - 1, dayA)
      const dateB = new Date(yearB, monthB - 1, dayB)
      return dateA.getTime() - dateB.getTime()
    })
    
    const dateRange = dates.length === 1 
      ? dates[0] 
      : `${dates[0]} - ${dates[dates.length - 1]}`

    // Calculate total unique units
    const totalUnits = new Set(data.map(record => record.unidad)).size

    // Calculate total distance
    const totalKm = data.reduce((sum, record) => sum + record.distanciaKm, 0)

    // Calculate average daily kilometers
    const numberOfDays = dates.length
    const averageDailyKm = numberOfDays > 0 ? totalKm / numberOfDays : 0

    // Calculate maximum speed across all records
    const maxSpeed = Math.max(...data.map(record => record.velocidadMaxima))

    return {
      dateRange,
      totalUnits,
      totalKm,
      averageDailyKm,
      maxSpeed
    }
  }, [data])

  return (
    <div className="bg-gray-100 border border-gray-200 px-6 py-3 my-4 mx-6 rounded-lg mt-[8px] mr-[16px] mb-[16px] ml-[16px]">
      <div className="flex items-center gap-4 text-sm text-gray-700 overflow-hidden">
        <div className="flex items-center gap-1 flex-shrink-0 min-w-0">
          <span className="text-gray-900 truncate">Mostrando {data.length} registros</span>
        </div>
        
        <div className="w-px h-4 bg-gray-300 flex-shrink-0"></div>
        
        <div className="flex items-center gap-1 flex-1 min-w-0">
          <span className="font-medium flex-shrink-0">Fecha:</span>
          <span className="font-semibold text-gray-900 truncate">
            {(() => {
              const formatDate = (date: Date) => {
                const day = date.getDate().toString().padStart(2, '0')
                const month = (date.getMonth() + 1).toString().padStart(2, '0')
                const year = date.getFullYear()
                return `${day}/${month}/${year}`
              }
              
              // Si hay filtros personalizados de fecha con start y end
              if (generatedWithFilters?.customDateRange?.start && generatedWithFilters?.customDateRange?.end) {
                const startDate = new Date(generatedWithFilters.customDateRange.start)
                const endDate = new Date(generatedWithFilters.customDateRange.end)
                return `${formatDate(startDate)} - ${formatDate(endDate)}`
              }
              
              // Si hay filtro de fecha seleccionado (convertir a rango de fechas reales)
              if (generatedWithFilters?.date && generatedWithFilters.date !== 'personalizado') {
                const today = new Date()
                let startDate: Date
                let endDate: Date
                
                switch (generatedWithFilters.date) {
                  case 'hoy':
                    startDate = endDate = new Date(today)
                    break
                  case 'ayer':
                    startDate = new Date(today)
                    startDate.setDate(today.getDate() - 1)
                    endDate = new Date(startDate)
                    break
                  case 'ultimos7dias':
                    endDate = new Date(today)
                    startDate = new Date(today)
                    startDate.setDate(today.getDate() - 6)
                    break
                  case 'ultimos15dias':
                    endDate = new Date(today)
                    startDate = new Date(today)
                    startDate.setDate(today.getDate() - 14)
                    break
                  case 'ultimomes':
                    endDate = new Date(today)
                    startDate = new Date(today)
                    startDate.setDate(today.getDate() - 29)
                    break
                  case 'mesanterior':
                    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
                    const lastDayOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0)
                    startDate = lastMonth
                    endDate = lastDayOfLastMonth
                    break
                  default:
                    return stats.dateRange
                }
                
                // Si es el mismo día, mostrar solo una fecha
                if (startDate.getTime() === endDate.getTime()) {
                  return formatDate(startDate)
                }
                
                return `${formatDate(startDate)} - ${formatDate(endDate)}`
              }
              
              // Fallback a la fecha calculada de los datos
              return stats.dateRange
            })()}
          </span>
        </div>
        
        <div className="w-px h-4 bg-gray-300 flex-shrink-0"></div>
        
        <div className="flex items-center gap-1 flex-shrink-0 min-w-0">
          <span className="truncate">Total unidades:</span>
          <span className="font-semibold text-gray-900 truncate">{stats.totalUnits}</span>
        </div>
        
        <div className="w-px h-4 bg-gray-300 flex-shrink-0"></div>
        
        <div className="flex items-center gap-1 flex-shrink-0 min-w-0">
          <span className="truncate">Total Km:</span>
          <span className="font-semibold text-gray-900 truncate">{stats.totalKm.toLocaleString()} km</span>
        </div>
        
        <div className="w-px h-4 bg-gray-300 flex-shrink-0"></div>
        
        <div className="flex items-center gap-1 flex-shrink-0 min-w-0">
          <span className="truncate">Promedio diario:</span>
          <span className="font-semibold text-gray-900 truncate">{stats.averageDailyKm.toFixed(1)} km</span>
        </div>
        
        <div className="w-px h-4 bg-gray-300 flex-shrink-0"></div>
        
        <div className="flex items-center gap-1 flex-shrink-0 min-w-0">
          <span className="truncate">Vel. Máxima:</span>
          <span className="font-semibold text-gray-900 truncate">{stats.maxSpeed} km/h</span>
        </div>
      </div>
    </div>
  )
}