import { useState, useMemo, useEffect, useCallback } from "react"
import { ScrollArea, ScrollBar } from "./ui/scroll-area"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Checkbox } from "./ui/checkbox"
import { Separator } from "./ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible"
import { EmptyStateReportIcon } from "./EmptyStateReportIcon"

import { Filter, X, Search, Group, ChevronDown, ChevronRight, RotateCcw, Maximize2, Minimize2, ChevronUp } from "lucide-react"

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

type SortField = keyof TripRecord
type SortDirection = 'asc' | 'desc' | null

interface ColumnFilter {
  unidad: string
  fecha: string
  distanciaKm: string
  velocidadMaxima: string
  numeroViajes: string
  inicioMovimiento: string
  ubicacionInicio: string
  ubicacionFin: string
  finMovimiento: string
}

interface ConditionalFilter {
  field: keyof ColumnFilter
  operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'neq' | 'between' | 'not_between' | 'none' | 'empty' | 'not_empty' | 'contains' | 'not_contains' | 'starts_with' | 'ends_with' | 'exactly' | 'date_is' | 'date_before' | 'date_after'
  value: string
  value2?: string // For "between" operations
}

interface ValueFilter {
  field: keyof ColumnFilter
  selectedValues: Set<string>
}

interface FilterState {
  [key: string]: {
    mode: 'condition' | 'values'
    condition?: ConditionalFilter
    values?: ValueFilter
  }
}

// Define column data types for intelligent filtering
type ColumnDataType = 'string' | 'number' | 'date' | 'time'

const COLUMN_DATA_TYPES: Record<keyof TripRecord, ColumnDataType> = {
  unidad: 'string',
  fecha: 'date',
  distanciaKm: 'number',
  velocidadMaxima: 'number',
  numeroViajes: 'number',
  inicioMovimiento: 'time',
  ubicacionInicio: 'string',
  ubicacionFin: 'string',
  finMovimiento: 'time'
}

// Filter options organized by data type
const FILTER_OPTIONS_BY_TYPE = {
  string: [
    { label: 'Ninguno', operator: 'none', requiresValue: false },
    { label: 'Está vacío', operator: 'empty', requiresValue: false },
    { label: 'No está vacío', operator: 'not_empty', requiresValue: false },
    { label: 'El texto contiene', operator: 'contains', requiresValue: true },
    { label: 'El texto no contiene', operator: 'not_contains', requiresValue: true },
    { label: 'El texto comienza con', operator: 'starts_with', requiresValue: true },
    { label: 'El texto termina con', operator: 'ends_with', requiresValue: true },
    { label: 'El texto es exactamente', operator: 'exactly', requiresValue: true }
  ],
  number: [
    { label: 'Ninguno', operator: 'none', requiresValue: false },
    { label: 'Está vacío', operator: 'empty', requiresValue: false },
    { label: 'No está vacío', operator: 'not_empty', requiresValue: false },
    { label: 'Mayor que', operator: 'gt', requiresValue: true },
    { label: 'Mayor o igual que', operator: 'gte', requiresValue: true },
    { label: 'Menos de', operator: 'lt', requiresValue: true },
    { label: 'Menor o igual que', operator: 'lte', requiresValue: true },
    { label: 'Es igual a', operator: 'eq', requiresValue: true },
    { label: 'No es igual a', operator: 'neq', requiresValue: true },
    { label: 'Está entre', operator: 'between', requiresValue: true, requiresTwoValues: true },
    { label: 'No está entre', operator: 'not_between', requiresValue: true, requiresTwoValues: true }
  ],
  date: [
    { label: 'Ninguno', operator: 'none', requiresValue: false },
    { label: 'Está vacío', operator: 'empty', requiresValue: false },
    { label: 'No está vacío', operator: 'not_empty', requiresValue: false },
    { label: 'La fecha es', operator: 'date_is', requiresValue: true },
    { label: 'La fecha es anterior', operator: 'date_before', requiresValue: true },
    { label: 'La fecha es posterior', operator: 'date_after', requiresValue: true }
  ],
  time: [
    { label: 'Ninguno', operator: 'none', requiresValue: false },
    { label: 'Está vacío', operator: 'empty', requiresValue: false },
    { label: 'No está vacío', operator: 'not_empty', requiresValue: false },
    { label: 'El tiempo contiene', operator: 'contains', requiresValue: true },
    { label: 'El tiempo no contiene', operator: 'not_contains', requiresValue: true },
    { label: 'El tiempo comienza con', operator: 'starts_with', requiresValue: true },
    { label: 'El tiempo termina con', operator: 'ends_with', requiresValue: true },
    { label: 'El tiempo es exactamente', operator: 'exactly', requiresValue: true }
  ]
}

// Generate consistent dummy data that can be "updated" while preserving structure
// This ensures that column filters remain meaningful across data updates
const generateDummyData = (seed: number = 0, appliedFilters?: any): TripRecord[] => {
  const data: TripRecord[] = []
  const companies = ['PEP', 'FLT', 'TRK', 'VAN', 'UNI']
  
  // Use deterministic base data structure but allow for updates
  const baseUnits = [
    'PEP-1015', 'PEP-1023', 'PEP-1034', 'PEP-1045', 'PEP-1056',
    'FLT-1067', 'FLT-1078', 'FLT-1089', 'FLT-1090', 'FLT-1101',
    'TRK-1112', 'TRK-1123', 'TRK-1134', 'TRK-1145', 'TRK-1156',
    'VAN-1167', 'VAN-1178', 'VAN-1189', 'VAN-1190', 'VAN-1201',
    'UNI-1212', 'UNI-1223', 'UNI-1234', 'UNI-1245', 'UNI-1256'
  ]
  
  // Expand to 100 units by adding variations
  const allUnits: string[] = []
  for (let i = 0; i < 100; i++) {
    if (i < baseUnits.length) {
      allUnits.push(baseUnits[i])
    } else {
      const company = companies[Math.floor(i / 20) % companies.length]
      const unitNumber = String(1260 + i).padStart(4, '0')
      allUnits.push(`${company}-${unitNumber}`)
    }
  }

  // Common locations for fleet management
  const locations = [
    'Ciudad de México, CDMX',
    'Guadalajara, JAL',
    'Monterrey, NL',
    'Puebla, PUE',
    'Tijuana, BC',
    'León, GTO',
    'Juárez, CHIH',
    'Torreón, COAH',
    'Querétaro, QRO',
    'San Luis Potosí, SLP',
    'Mérida, YUC',
    'Mexicali, BC',
    'Aguascalientes, AGS',
    'Tampico, TAMPS',
    'Cuernavaca, MOR',
    'Saltillo, COAH',
    'Reynosa, TAMPS',
    'Durango, DGO',
    'Toluca, MEX',
    'Tuxtla Gutiérrez, CHIS'
  ]

  // Generate date range based on applied filters or default to last 6 days
  const generateDateRange = () => {
    const dates = []
    
    // Check if we have filter information to generate appropriate dates
    if (appliedFilters?.customDateRange?.start && appliedFilters?.customDateRange?.end) {
      // Use custom date range from filters
      const startDate = new Date(appliedFilters.customDateRange.start)
      const endDate = new Date(appliedFilters.customDateRange.end)
      
      // Generate dates between start and end
      const currentDate = new Date(startDate)
      while (currentDate <= endDate) {
        const day = currentDate.getDate().toString().padStart(2, '0')
        const month = (currentDate.getMonth() + 1).toString().padStart(2, '0')
        const year = currentDate.getFullYear()
        dates.push(`${day}/${month}/${year}`)
        currentDate.setDate(currentDate.getDate() + 1)
      }
      return dates
    } else if (appliedFilters?.date && appliedFilters.date !== 'personalizado') {
      // Generate dates based on preset filter selection
      const today = new Date()
      let startDate: Date
      let endDate: Date
      
      switch (appliedFilters.date) {
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
          // Default to last 6 days
          endDate = new Date(today)
          startDate = new Date(today)
          startDate.setDate(today.getDate() - 5)
          break
      }
      
      // Generate dates between start and end
      const currentDate = new Date(startDate)
      while (currentDate <= endDate) {
        const day = currentDate.getDate().toString().padStart(2, '0')
        const month = (currentDate.getMonth() + 1).toString().padStart(2, '0')
        const year = currentDate.getFullYear()
        dates.push(`${day}/${month}/${year}`)
        currentDate.setDate(currentDate.getDate() + 1)
      }
      return dates
    }
    
    // Default fallback - last 6 days from today
    const today = new Date()
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      const day = date.getDate().toString().padStart(2, '0')
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const year = date.getFullYear()
      dates.push(`${day}/${month}/${year}`)
    }
    return dates
  }

  const dateRange = generateDateRange()
  
  // Determine which units to generate data for based on filters
  let selectedUnits: string[] = []
  if (appliedFilters?.vehicles && appliedFilters.vehicles.length > 0) {
    // Use the selected vehicles from filters
    selectedUnits = appliedFilters.vehicles.map((vehicle: any) => vehicle.name || vehicle.id || vehicle)
  } else {
    // Default to all 100 units if no specific vehicles selected
    selectedUnits = allUnits
  }
  
  // Generate data only for the selected units across the date range
  for (let i = 0; i < selectedUnits.length * dateRange.length; i++) {
    // Create seeded randomness for updates
    const updateSeed = seed + i
    const random1 = (Math.sin(updateSeed * 12.9898) + 1) / 2
    const random2 = (Math.sin(updateSeed * 78.233) + 1) / 2
    const random3 = (Math.sin(updateSeed * 37.719) + 1) / 2
    const random4 = (Math.sin(updateSeed * 93.989) + 1) / 2
    const random5 = (Math.sin(updateSeed * 54.321) + 1) / 2
    
    // Assign units and dates systematically
    const unitIndex = Math.floor(i / dateRange.length) % selectedUnits.length
    const dateIndex = i % dateRange.length
    const fecha = dateRange[dateIndex]
    const selectedUnit = selectedUnits[unitIndex]
    
    // Generate times with some variation for updates
    const baseStartHour = Math.floor(i / 4) % 24
    const startHour = (baseStartHour + Math.floor(random1 * 3)) % 24
    const startMin = Math.floor(random2 * 60)
    const startSec = Math.floor(random3 * 60)
    const startTime = `${startHour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}:${startSec.toString().padStart(2, '0')}`
    
    const endHour = (startHour + Math.floor(random4 * 8) + 2) % 24
    const endMin = (startMin + Math.floor(random1 * 30)) % 60
    const endSec = (startSec + Math.floor(random2 * 30)) % 60
    const endTime = `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}:${endSec.toString().padStart(2, '0')}`
    
    // Generate consistent but updateable metrics
    const baseDistance = 50 + (i * 7) % 400
    const distance = Math.floor(baseDistance + (random3 * 100) - 50)
    const maxSpeed = Math.floor(40 + (random4 * 80) + (i % 50))
    const numTrips = Math.floor(1 + random5 * 8) // 1-8 trips
    
    // Generate locations
    const startLocationIndex = Math.floor(random1 * locations.length)
    const endLocationIndex = Math.floor(random2 * locations.length)
    
    data.push({
      unidad: selectedUnit,
      fecha: fecha,
      distanciaKm: Math.max(10, distance),
      velocidadMaxima: Math.max(30, Math.min(150, maxSpeed)),
      numeroViajes: numTrips,
      inicioMovimiento: startTime,
      ubicacionInicio: locations[startLocationIndex],
      ubicacionFin: locations[endLocationIndex],
      finMovimiento: endTime
    })
  }
  
  return data
}

interface DataTableProps {
  hasData: boolean
  onFilteredDataChange: (data: TripRecord[]) => void
  allowColumnFilters?: boolean
  allowGrouping?: boolean
  dataRefreshTrigger?: number
  preserveColumnFilters?: boolean
  isFullscreen?: boolean
  onFullscreenToggle?: () => void
  appliedFilters?: any
  onTableStateChange?: () => void
  resetTableState?: number
}

export function DataTable({ 
  hasData, 
  onFilteredDataChange, 
  allowColumnFilters = true, 
  allowGrouping = true,
  dataRefreshTrigger = 0,
  preserveColumnFilters = false,
  isFullscreen = false,
  onFullscreenToggle,
  appliedFilters,
  onTableStateChange,
  resetTableState
}: DataTableProps) {
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)
  const [filterStates, setFilterStates] = useState<FilterState>({})
  const [openFilterPopover, setOpenFilterPopover] = useState<string | null>(null)
  const [groupByField, setGroupByField] = useState<SortField | null>(null)
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())

  // Temporary filter states for popover - using separate state per field to prevent conflicts
  const [tempFilterStates, setTempFilterStates] = useState<{
    [fieldName: string]: {
      mode: 'condition' | 'values'
      operator: string
      value: string
      value2: string
      selectedValues: Set<string>
      valueSearch: string
    }
  }>({})

  const rawData = useMemo(() => {
    return hasData ? generateDummyData(dataRefreshTrigger, appliedFilters) : []
  }, [hasData, dataRefreshTrigger, appliedFilters])

  // Set default grouping to "unidad" when data is first generated
  useEffect(() => {
    if (hasData && rawData.length > 0 && !groupByField) {
      setGroupByField('unidad')
    }
  }, [hasData, rawData.length, groupByField])

  // COLUMN FILTER PRESERVATION SYSTEM
  useEffect(() => {
    if (!preserveColumnFilters && !hasData) {
      setFilterStates({})
    }
  }, [preserveColumnFilters, hasData])

  // Reset table state when resetTableState changes
  useEffect(() => {
    if (resetTableState && resetTableState > 0) {
      setFilterStates({})
      setSortField(null)
      setSortDirection(null)
      setGroupByField('unidad') // Reset to default grouping
      setCollapsedGroups(new Set())
    }
  }, [resetTableState])

  // Notify parent of table state changes
  useEffect(() => {
    if (onTableStateChange && (Object.keys(filterStates).length > 0 || sortField || groupByField !== 'unidad')) {
      onTableStateChange()
    }
  }, [filterStates, sortField, groupByField, onTableStateChange])

  // Get unique values for a column
  const getColumnUniqueValues = (field: keyof TripRecord): Array<{value: string, count: number}> => {
    const valueCounts = new Map<string, number>()
    
    rawData.forEach(record => {
      const value = String(record[field])
      valueCounts.set(value, (valueCounts.get(value) || 0) + 1)
    })
    
    return Array.from(valueCounts.entries())
      .map(([value, count]) => ({value, count}))
      .sort((a, b) => a.value.localeCompare(b.value))
  }

  // Get appropriate filter options based on column data type
  const getFilterOptionsForField = (field: keyof TripRecord) => {
    const dataType = COLUMN_DATA_TYPES[field]
    return FILTER_OPTIONS_BY_TYPE[dataType] || FILTER_OPTIONS_BY_TYPE.string
  }

  // Helper function to parse date from DD/MM/YYYY format for sorting
  const parseDate = (dateStr: string): Date | null => {
    const parts = dateStr.split('/')
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10)
      const month = parseInt(parts[1], 10) - 1 // Month is 0-indexed
      const year = parseInt(parts[2], 10)
      return new Date(year, month, day)
    }
    return null
  }

  // Smart group sorting function
  const sortGroups = (groups: Array<[string, TripRecord[]]>, field: SortField, direction: SortDirection) => {
    if (!direction) {
      // Default sorting when no sort direction is specified
      return groups.sort(([a], [b]) => {
        const dataType = COLUMN_DATA_TYPES[field]
        
        switch (dataType) {
          case 'date': {
            const dateA = parseDate(a)
            const dateB = parseDate(b)
            if (dateA && dateB) {
              return dateA.getTime() - dateB.getTime()
            }
            return a.localeCompare(b)
          }
          case 'number': {
            const numA = parseFloat(a)
            const numB = parseFloat(b)
            if (!isNaN(numA) && !isNaN(numB)) {
              return numA - numB
            }
            return a.localeCompare(b)
          }
          case 'time':
          case 'string':
          default:
            return a.localeCompare(b)
        }
      })
    }

    // Apply sort direction when sorting is active
    return groups.sort(([a], [b]) => {
      const dataType = COLUMN_DATA_TYPES[field]
      let comparison = 0
      
      switch (dataType) {
        case 'date': {
          const dateA = parseDate(a)
          const dateB = parseDate(b)
          if (dateA && dateB) {
            comparison = dateA.getTime() - dateB.getTime()
          } else {
            comparison = a.localeCompare(b)
          }
          break
        }
        case 'number': {
          const numA = parseFloat(a)
          const numB = parseFloat(b)
          if (!isNaN(numA) && !isNaN(numB)) {
            comparison = numA - numB
          } else {
            comparison = a.localeCompare(b)
          }
          break
        }
        case 'time':
        case 'string':
        default:
          comparison = a.localeCompare(b)
          break
      }
      
      return direction === 'asc' ? comparison : -comparison
    })
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc')
      } else if (sortDirection === 'desc') {
        setSortDirection(null)
        setSortField(null)
      } else {
        setSortDirection('asc')
      }
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const clearFilter = (field: keyof ColumnFilter) => {
    if (!allowColumnFilters) return
    const newFilterStates = { ...filterStates }
    delete newFilterStates[field]
    setFilterStates(newFilterStates)
  }

  const clearAllFilters = () => {
    if (!allowColumnFilters) return
    setFilterStates({})
  }

  const hasActiveFilters = Object.keys(filterStates).length > 0

  // Apply conditional filter logic
  const applyConditionalFilter = (value: string | number, condition: ConditionalFilter): boolean => {
    const stringValue = String(value).toLowerCase()
    const filterValue = condition.value.toLowerCase()

    switch (condition.operator) {
      case 'none':
        return true // No filter applied
      case 'empty':
        return stringValue === '' || stringValue === 'null' || stringValue === 'undefined'
      case 'not_empty':
        return stringValue !== '' && stringValue !== 'null' && stringValue !== 'undefined'
      case 'contains':
        return stringValue.includes(filterValue)
      case 'not_contains':
        return !stringValue.includes(filterValue)
      case 'starts_with':
        return stringValue.startsWith(filterValue)
      case 'ends_with':
        return stringValue.endsWith(filterValue)
      case 'exactly':
        return stringValue === filterValue
      case 'date_is': {
        if (condition.field === 'fecha') {
          const recordDate = parseDate(String(value))
          const filterDate = parseDate(condition.value)
          if (recordDate && filterDate) {
            return recordDate.getTime() === filterDate.getTime()
          }
        }
        return stringValue === filterValue
      }
      case 'date_before': {
        if (condition.field === 'fecha') {
          const recordDate = parseDate(String(value))
          const filterDate = parseDate(condition.value)
          if (recordDate && filterDate) {
            return recordDate.getTime() < filterDate.getTime()
          }
        }
        return false
      }
      case 'date_after': {
        if (condition.field === 'fecha') {
          const recordDate = parseDate(String(value))
          const filterDate = parseDate(condition.value)
          if (recordDate && filterDate) {
            return recordDate.getTime() > filterDate.getTime()
          }
        }
        return false
      }
    }

    const numericValue = typeof value === 'number' ? value : parseFloat(String(value))
    const conditionValue = parseFloat(condition.value)
    const conditionValue2 = condition.value2 ? parseFloat(condition.value2) : undefined

    if (isNaN(conditionValue)) {
      // For text comparisons
      switch (condition.operator) {
        case 'eq': return stringValue === filterValue
        case 'neq': return stringValue !== filterValue
        default: return stringValue.includes(filterValue)
      }
    }

    // For numeric comparisons
    if (isNaN(numericValue)) return false

    switch (condition.operator) {
      case 'gt': return numericValue > conditionValue
      case 'gte': return numericValue >= conditionValue
      case 'lt': return numericValue < conditionValue
      case 'lte': return numericValue <= conditionValue
      case 'eq': return numericValue === conditionValue
      case 'neq': return numericValue !== conditionValue
      case 'between': 
        return conditionValue2 !== undefined && numericValue >= conditionValue && numericValue <= conditionValue2
      case 'not_between': 
        return conditionValue2 !== undefined && (numericValue < conditionValue || numericValue > conditionValue2)
      default: return true
    }
  }

  // Apply value filter logic
  const applyValueFilter = (value: string | number, valueFilter: ValueFilter): boolean => {
    return valueFilter.selectedValues.has(String(value))
  }

  const filteredAndSortedData = useMemo(() => {
    let filtered = rawData

    // Apply filters
    if (hasActiveFilters && allowColumnFilters) {
      filtered = rawData.filter(record => {
        return Object.entries(filterStates).every(([field, filterState]) => {
          const recordValue = record[field as keyof TripRecord]
          
          if (filterState.mode === 'condition' && filterState.condition) {
            return applyConditionalFilter(recordValue, filterState.condition)
          } else if (filterState.mode === 'values' && filterState.values) {
            return applyValueFilter(recordValue, filterState.values)
          }
          
          return true
        })
      })
    }

    // Apply sorting
    if (sortField && sortDirection) {
      filtered = [...filtered].sort((a, b) => {
        const aValue = a[sortField]
        const bValue = b[sortField]
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          const comparison = aValue.localeCompare(bValue)
          return sortDirection === 'asc' ? comparison : -comparison
        } else if (typeof aValue === 'number' && typeof bValue === 'number') {
          const comparison = aValue - bValue
          return sortDirection === 'asc' ? comparison : -comparison
        }
        
        return 0
      })
    }

    return filtered
  }, [rawData, filterStates, sortField, sortDirection, hasActiveFilters, allowColumnFilters])

  // Group data by selected field with intelligent sorting
  const groupedData = useMemo(() => {
    if (!groupByField) return null

    const groups = new Map<string, TripRecord[]>()
    
    filteredAndSortedData.forEach(record => {
      const groupValue = String(record[groupByField])
      if (!groups.has(groupValue)) {
        groups.set(groupValue, [])
      }
      groups.get(groupValue)!.push(record)
    })

    // Convert to array and apply intelligent sorting
    const groupsArray = Array.from(groups.entries())
    
    // If the grouped field is also the sorted field, apply the sort direction to groups
    if (sortField === groupByField && sortDirection) {
      return sortGroups(groupsArray, groupByField, sortDirection)
    } else {
      // Default sorting based on data type
      return sortGroups(groupsArray, groupByField, null)
    }
  }, [filteredAndSortedData, groupByField, sortField, sortDirection])

  // Notify parent component of filtered data changes
  useEffect(() => {
    onFilteredDataChange(filteredAndSortedData)
  }, [filteredAndSortedData, onFilteredDataChange])

  const handleGroupByChange = (field: string) => {
    if (!allowGrouping) return
    setGroupByField(field as SortField)
    setCollapsedGroups(new Set()) // Reset collapsed state
  }

  const toggleGroupCollapse = (groupKey: string) => {
    if (!allowGrouping) return
    const newCollapsed = new Set(collapsedGroups)
    if (newCollapsed.has(groupKey)) {
      newCollapsed.delete(groupKey)
    } else {
      newCollapsed.add(groupKey)
    }
    setCollapsedGroups(newCollapsed)
  }

  const resetGrouping = () => {
    if (!allowGrouping) return
    setGroupByField(null)
    setCollapsedGroups(new Set())
  }

  const getGroupLabel = (field: SortField, value: string, count: number) => {
    switch (field) {
      case 'unidad':
        if (value.includes('-')) {
          const prefix = value.split('-')[0]
          return `${prefix} (${count} ${count === 1 ? 'unidad' : 'unidades'})`
        }
        return `${value} (${count} ${count === 1 ? 'unidad' : 'unidades'})`
      case 'fecha':
        return `${value} (${count} ${count === 1 ? 'registro' : 'registros'})`
      case 'distanciaKm':
        return `${value} km (${count} ${count === 1 ? 'viaje' : 'viajes'})`
      case 'velocidadMaxima':
        return `${value} km/h (${count} ${count === 1 ? 'viaje' : 'viajes'})`
      case 'numeroViajes':
        return `${value} viajes (${count} ${count === 1 ? 'registro' : 'registros'})`
      default:
        return `${value} (${count} ${count === 1 ? 'elemento' : 'elementos'})`
    }
  }

  const getColumnDisplayName = (field: SortField) => {
    switch (field) {
      case 'unidad': return 'Unidad'
      case 'fecha': return 'Fecha'
      case 'distanciaKm': return 'Distancia (km)'
      case 'velocidadMaxima': return 'Vel. Máx (Km/h)'
      case 'numeroViajes': return 'No. Viajes'
      case 'inicioMovimiento': return 'Inicio movimiento'
      case 'ubicacionInicio': return 'Ubicación Inicio'
      case 'ubicacionFin': return 'Ubicación Fin'
      case 'finMovimiento': return 'Fin movimiento'
      default: return field
    }
  }

  const getSortIcon = (field: SortField) => {
    const isActive = sortField === field
    const isAsc = isActive && sortDirection === 'asc'
    const isDesc = isActive && sortDirection === 'desc'
    
    return (
      <div className="w-3 h-3 flex flex-col items-center justify-center gap-[1px] flex-shrink-0">
        <div 
          className={`w-0 h-0 border-l-[3px] border-r-[3px] border-b-[3.5px] border-l-transparent border-r-transparent transition-colors ${
            isAsc ? 'border-b-blue-600' : 'border-b-gray-400 hover:border-b-gray-500'
          }`}
        />
        <div 
          className={`w-0 h-0 border-l-[3px] border-r-[3px] border-t-[3.5px] border-l-transparent border-r-transparent transition-colors ${
            isDesc ? 'border-t-blue-600' : 'border-t-gray-400 hover:border-t-gray-500'
          }`}
        />
      </div>
    )
  }

  const getFilterIcon = (field: keyof ColumnFilter) => {
    const hasFilter = filterStates[field] !== undefined
    return (
      <Filter className={`w-3 h-3 flex-shrink-0 ${hasFilter ? 'text-blue-600' : 'text-gray-400'}`} />
    )
  }

  // Initialize temp filter state for a field
  const initializeTempFilterState = useCallback((field: keyof ColumnFilter) => {
    const currentFilter = filterStates[field]
    
    if (currentFilter) {
      setTempFilterStates(prev => ({
        ...prev,
        [field]: {
          mode: currentFilter.mode,
          operator: currentFilter.mode === 'condition' && currentFilter.condition ? currentFilter.condition.operator : 'none',
          value: currentFilter.mode === 'condition' && currentFilter.condition ? currentFilter.condition.value : '',
          value2: currentFilter.mode === 'condition' && currentFilter.condition ? currentFilter.condition.value2 || '' : '',
          selectedValues: currentFilter.mode === 'values' && currentFilter.values ? new Set(currentFilter.values.selectedValues) : new Set(),
          valueSearch: ''
        }
      }))
    } else {
      setTempFilterStates(prev => ({
        ...prev,
        [field]: {
          mode: 'condition',
          operator: 'none',
          value: '',
          value2: '',
          selectedValues: new Set(),
          valueSearch: ''
        }
      }))
    }
  }, [filterStates])

  // Handle opening filter popover
  const handleOpenFilterPopover = (field: keyof ColumnFilter) => {
    if (!allowColumnFilters) return
    initializeTempFilterState(field)
    setOpenFilterPopover(field)
  }

  // Handle applying predefined filter
  const handleApplyPredefinedFilter = (field: keyof ColumnFilter, operator: string, value: string = '') => {
    const newFilterStates = { ...filterStates }
    
    if (operator === 'none') {
      // Remove filter entirely for "Ninguno"
      delete newFilterStates[field]
    } else {
      newFilterStates[field] = {
        mode: 'condition',
        condition: {
          field,
          operator: operator as any,
          value: value
        }
      }
    }
    
    setFilterStates(newFilterStates)
    setOpenFilterPopover(null)
  }

  // Handle applying filter
  const handleApplyFilter = (field: keyof ColumnFilter) => {
    const tempState = tempFilterStates[field]
    if (!tempState) return

    const newFilterStates = { ...filterStates }
    
    if (tempState.mode === 'condition') {
      if (tempState.operator === 'none') {
        // Remove filter for "none" operator
        delete newFilterStates[field]
      } else if (tempState.value.trim() || ['empty', 'not_empty'].includes(tempState.operator)) {
        newFilterStates[field] = {
          mode: 'condition',
          condition: {
            field,
            operator: tempState.operator as any,
            value: tempState.value,
            value2: tempState.value2 || undefined
          }
        }
      }
    } else if (tempState.mode === 'values') {
      if (tempState.selectedValues.size > 0) {
        newFilterStates[field] = {
          mode: 'values',
          values: {
            field,
            selectedValues: new Set(tempState.selectedValues)
          }
        }
      }
    }
    
    setFilterStates(newFilterStates)
    setOpenFilterPopover(null)
  }

  // Handle canceling filter
  const handleCancelFilter = () => {
    setOpenFilterPopover(null)
  }

  // Update temp filter state
  const updateTempFilterState = (field: keyof ColumnFilter, updates: Partial<typeof tempFilterStates[string]>) => {
    setTempFilterStates(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        ...updates
      }
    }))
  }

  // Check if operator requires input value
  const operatorRequiresValue = (operator: string): boolean => {
    return !['none', 'empty', 'not_empty'].includes(operator)
  }

  // Check if operator requires two values
  const operatorRequiresTwoValues = (operator: string): boolean => {
    return ['between', 'not_between'].includes(operator)
  }

  // Get placeholder text for input based on operator and field
  const getInputPlaceholder = (operator: string, field: keyof ColumnFilter, isSecondValue: boolean = false): string => {
    const dataType = COLUMN_DATA_TYPES[field as keyof TripRecord]
    
    if (['date_is', 'date_before', 'date_after'].includes(operator) || dataType === 'date') {
      return 'DD/MM/YYYY'
    }
    
    if (dataType === 'time') {
      return 'HH:MM:SS'
    }
    
    if (dataType === 'number') {
      if (isSecondValue) {
        return 'Valor máximo'
      }
      return operatorRequiresTwoValues(operator) ? 'Valor mínimo' : 'Valor numérico'
    }
    
    return isSecondValue ? 'Segundo valor' : 'Valor'
  }

  const ColumnHeader = ({ 
    field, 
    children, 
    className,
    width 
  }: { 
    field: SortField, 
    children: React.ReactNode, 
    className?: string,
    width: string
  }) => {
    const hasActiveFilter = filterStates[field] !== undefined && allowColumnFilters
    const headerBgClass = hasActiveFilter ? 'bg-blue-50' : 'bg-gray-50'
    
    const getSortTooltip = () => {
      if (sortField === field && sortDirection === 'asc') {
        return 'Orden ascendente (↑)'
      }
      if (sortField === field && sortDirection === 'desc') {
        return 'Orden descendente (↓)'
      }
      return 'Haz clic para ordenar'
    }
    
    const uniqueValues = getColumnUniqueValues(field)
    const tempState = tempFilterStates[field] || { valueSearch: '', selectedValues: new Set() }
    const filteredValues = uniqueValues.filter(({value}) => 
      value.toLowerCase().includes(tempState.valueSearch.toLowerCase())
    )

    // Get contextually appropriate filter options for this field
    const predefinedOptions = getFilterOptionsForField(field)
    
    return (
      <div 
        className={`px-3 py-3 text-left text-xs font-medium text-gray-700 border-r border-gray-200 ${headerBgClass} ${className || ''}`}
        style={{ width }}
      >
        <div className="flex items-center justify-between gap-3 min-w-0">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-auto p-0 hover:bg-gray-100 hover:bg-opacity-50 rounded-sm justify-start gap-2 text-xs font-medium text-gray-700 flex-1 min-w-0 transition-colors"
                  onClick={() => handleSort(field)}
                >
                  <span className="text-left leading-tight truncate" title={children?.toString()} style={{ lineHeight: '1.2' }}>
                    {children}
                  </span>
                  {getSortIcon(field)}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">{getSortTooltip()}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <div className="flex items-center flex-shrink-0">
            <Popover 
              open={openFilterPopover === field && allowColumnFilters} 
              onOpenChange={(open) => {
                if (!allowColumnFilters) return
                if (open) {
                  handleOpenFilterPopover(field)
                } else {
                  setOpenFilterPopover(null)
                }
              }}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-4 w-4 p-0 hover:bg-gray-100 flex-shrink-0 ${!allowColumnFilters ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={!allowColumnFilters}
                >
                  {getFilterIcon(field)}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-96 p-0" align="start">
                {/* Fixed height container with explicit dimensions */}
                <div className="h-96 flex flex-col">
                  {/* Scrollable content area - takes remaining space */}
                  <div className="flex-1 overflow-y-auto">
                    <div className="p-4 space-y-4">
                      {/* Arrow pointing up to column header - aligned with filter icon */}
                      <div className="absolute -top-2 left-3 w-4 h-4 bg-white border-l border-t border-border transform rotate-45 z-10"></div>
                      {/* Filter by Condition Section */}
                      <Collapsible 
                        open={tempState.mode === 'condition'} 
                        onOpenChange={(open) => {
                          if (open) updateTempFilterState(field, { mode: 'condition' })
                        }}
                      >
                        <CollapsibleTrigger asChild>
                          <Button
                            variant="ghost"
                            className="w-full justify-between p-2 h-auto text-sm font-medium text-gray-900 hover:bg-gray-50"
                          >
                            <div className="flex items-center gap-2">
                              {tempState.mode === 'condition' ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                              Filtrar por condición
                            </div>
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-3 pt-2">
                          {/* Predefined Options with constrained height */}
                          <div className="space-y-1">
                            <div className="h-48 overflow-y-auto border border-gray-200 rounded-md bg-white">
                              <div className="divide-y divide-gray-100">
                                {predefinedOptions.map((option) => (
                                  <button
                                    key={option.operator}
                                    className="w-full text-left px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors"
                                    onClick={() => {
                                      if (option.requiresValue) {
                                        updateTempFilterState(field, { 
                                          operator: option.operator, 
                                          value: '', 
                                          value2: '' 
                                        })
                                      } else {
                                        handleApplyPredefinedFilter(field, option.operator, '')
                                      }
                                    }}
                                  >
                                    {option.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Show input fields if an operator is selected and requires value */}
                          {operatorRequiresValue(tempState.operator) && (
                            <>
                              <Separator />
                              <div className="space-y-2">
                                <div className="text-sm font-medium text-gray-700 mb-2">
                                  Configurar filtro: {predefinedOptions.find(opt => opt.operator === tempState.operator)?.label}
                                </div>
                                <Input
                                  placeholder={getInputPlaceholder(tempState.operator, field)}
                                  value={tempState.value}
                                  onChange={(e) => updateTempFilterState(field, { value: e.target.value })}
                                  className="text-xs"
                                  autoFocus
                                />
                                {operatorRequiresTwoValues(tempState.operator) && (
                                  <Input
                                    placeholder={getInputPlaceholder(tempState.operator, field, true)}
                                    value={tempState.value2}
                                    onChange={(e) => updateTempFilterState(field, { value2: e.target.value })}
                                    className="text-xs"
                                  />
                                )}
                              </div>
                            </>
                          )}
                        </CollapsibleContent>
                      </Collapsible>

                      <Separator />

                      {/* Filter by Values Section */}
                      <Collapsible 
                        open={tempState.mode === 'values'} 
                        onOpenChange={(open) => {
                          if (open) updateTempFilterState(field, { mode: 'values' })
                        }}
                      >
                        <CollapsibleTrigger asChild>
                          <Button
                            variant="ghost"
                            className="w-full justify-between p-2 h-auto text-sm font-medium text-gray-900 hover:bg-gray-50"
                          >
                            <div className="flex items-center gap-2">
                              {tempState.mode === 'values' ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                              Filtrar por valores
                            </div>
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-3 pt-2">
                          <div className="flex items-center justify-between text-sm">
                            <Button
                              variant="link"
                              className="h-auto p-0 text-blue-600 text-sm"
                              onClick={() => {
                                const allValues = new Set(uniqueValues.map(({value}) => value))
                                updateTempFilterState(field, { selectedValues: allValues })
                              }}
                            >
                              Seleccionar las {uniqueValues.length} opciones
                            </Button>
                            <span className="text-gray-500">-</span>
                            <Button
                              variant="link"
                              className="h-auto p-0 text-blue-600 text-sm"
                              onClick={() => updateTempFilterState(field, { selectedValues: new Set() })}
                            >
                              Borrar
                            </Button>
                          </div>

                          <div className="relative">
                            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
                            <Input
                              placeholder=""
                              value={tempState.valueSearch}
                              onChange={(e) => updateTempFilterState(field, { valueSearch: e.target.value })}
                              className="pl-7 h-8 text-xs border-gray-300"
                            />
                          </div>

                          <ScrollArea className="h-48 border border-gray-200 rounded">
                            <div className="p-2 space-y-1">
                              {filteredValues.map(({value, count}) => (
                                <div key={value} className="flex items-center justify-between py-1 px-2 hover:bg-gray-50 rounded">
                                  <div className="flex items-center gap-2">
                                    <Checkbox
                                      checked={tempState.selectedValues.has(value)}
                                      onCheckedChange={(checked) => {
                                        const newSelected = new Set(tempState.selectedValues)
                                        if (checked) {
                                          newSelected.add(value)
                                        } else {
                                          newSelected.delete(value)
                                        }
                                        updateTempFilterState(field, { selectedValues: newSelected })
                                      }}
                                    />
                                    <span className="text-xs text-gray-900 truncate" title={value}>
                                      {value}
                                    </span>
                                  </div>
                                  <span className="text-xs text-gray-500 ml-2">{count}</span>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </CollapsibleContent>
                      </Collapsible>
                    </div>
                  </div>

                  {/* Action Buttons - Fixed at bottom with explicit height */}
                  <div className="h-16 border-t border-gray-200 bg-white flex-shrink-0 flex items-center px-4">
                    <div className="flex gap-2 w-full">
                      <Button
                        variant="outline"
                        className="flex-1 text-gray-700 border-gray-300"
                        onClick={handleCancelFilter}
                      >
                        Cancelar
                      </Button>
                      <Button
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => handleApplyFilter(field)}
                        disabled={
                          tempState.mode === 'condition' && 
                          operatorRequiresValue(tempState.operator) &&
                          (
                            !tempState.value.trim() ||
                            (operatorRequiresTwoValues(tempState.operator) && !tempState.value2.trim())
                          ) ||
                          (tempState.mode === 'values' && tempState.selectedValues.size === 0)
                        }
                      >
                        Aceptar
                      </Button>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    )
  }

  // Define optimized column widths for the new structure
  const columnWidths = {
    unidad: '120px',
    fecha: '100px', 
    distanciaKm: '120px',
    velocidadMaxima: '130px',
    numeroViajes: '100px',
    inicioMovimiento: '160px',
    ubicacionInicio: '180px',
    ubicacionFin: '180px',
    finMovimiento: '160px'
  }

  const totalWidth = Object.values(columnWidths).reduce((sum, width) => sum + parseInt(width), 0)

  const renderDataRow = (record: TripRecord, index: number) => (
    <div key={`${record.unidad}-${index}`} className="flex hover:bg-gray-50 transition-colors">
      <div className="px-3 py-2 text-xs text-gray-900 border-r border-gray-200" style={{ width: columnWidths.unidad }}>
        {record.unidad}
      </div>
      <div className="px-3 py-2 text-xs text-gray-900 border-r border-gray-200" style={{ width: columnWidths.fecha }}>
        {record.fecha}
      </div>
      <div className="px-3 py-2 text-xs text-gray-900 border-r border-gray-200" style={{ width: columnWidths.distanciaKm }}>
        {record.distanciaKm}
      </div>
      <div className="px-3 py-2 text-xs text-gray-900 border-r border-gray-200" style={{ width: columnWidths.velocidadMaxima }}>
        {record.velocidadMaxima}
      </div>
      <div className="px-3 py-2 text-xs text-gray-900 border-r border-gray-200" style={{ width: columnWidths.numeroViajes }}>
        {record.numeroViajes}
      </div>
      <div className="px-3 py-2 text-xs text-gray-900 border-r border-gray-200" style={{ width: columnWidths.inicioMovimiento }}>
        {record.inicioMovimiento}
      </div>
      <div className="px-3 py-2 text-xs text-gray-900 border-r border-gray-200 truncate" style={{ width: columnWidths.ubicacionInicio }} title={record.ubicacionInicio}>
        {record.ubicacionInicio}
      </div>
      <div className="px-3 py-2 text-xs text-gray-900 border-r border-gray-200 truncate" style={{ width: columnWidths.ubicacionFin }} title={record.ubicacionFin}>
        {record.ubicacionFin}
      </div>
      <div className="px-3 py-2 text-xs text-gray-900" style={{ width: columnWidths.finMovimiento }}>
        {record.finMovimiento}
      </div>
    </div>
  )

  if (!hasData) {
    // Show empty state with table headers
    return (
      <div className="bg-white mx-6 rounded-lg border border-gray-200 shadow-sm flex flex-col h-full">
        {/* Scrollable header only */}
        <div className="flex-shrink-0 overflow-hidden">
          <ScrollArea className="w-full">
            <div style={{ minWidth: `${totalWidth}px` }}>
              <div className="border-b border-gray-200">
                <div className="flex">
                  <ColumnHeader field="unidad" width={columnWidths.unidad}>Unidad</ColumnHeader>
                  <ColumnHeader field="fecha" width={columnWidths.fecha}>Fecha</ColumnHeader>
                  <ColumnHeader field="distanciaKm" width={columnWidths.distanciaKm}>Distancia (km)</ColumnHeader>
                  <ColumnHeader field="velocidadMaxima" width={columnWidths.velocidadMaxima}>Vel. Máx (Km/h)</ColumnHeader>
                  <ColumnHeader field="numeroViajes" width={columnWidths.numeroViajes}>No. Viajes</ColumnHeader>
                  <ColumnHeader field="inicioMovimiento" width={columnWidths.inicioMovimiento}>Inicio movimiento</ColumnHeader>
                  <ColumnHeader field="ubicacionInicio" width={columnWidths.ubicacionInicio}>Ubicación Inicio</ColumnHeader>
                  <ColumnHeader field="ubicacionFin" width={columnWidths.ubicacionFin}>Ubicación Fin</ColumnHeader>
                  <ColumnHeader field="finMovimiento" width={columnWidths.finMovimiento} className="border-r-0">Fin movimiento</ColumnHeader>
                </div>
              </div>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
        
        {/* Full-width empty state content */}
        <div className="flex-1 bg-gray-100 flex items-center justify-center min-h-0">
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <EmptyStateReportIcon className="w-38 h-auto" />
            </div>
            <h4 className="text-lg font-medium text-gray-700 mb-2">
              Sin resultados todavía
            </h4>
            <p className="text-sm text-gray-500 max-w-sm">
              Aplica los filtros y haz clic en "Generar" para ver los datos.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Show table with data
  return (
    <div className="bg-white mx-6 rounded-lg border border-gray-200 shadow-sm flex flex-col h-full">
      {/* Group By Controls */}
      <div className="border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0 bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Group className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Agrupar por:</span>
          </div>
          <Select value={groupByField || "none"} onValueChange={handleGroupByChange}>
            <SelectTrigger className="w-48 h-8 text-xs">
              <SelectValue placeholder="Sin agrupar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sin agrupar</SelectItem>
              <SelectItem value="unidad">Unidad</SelectItem>
              <SelectItem value="fecha">Fecha</SelectItem>
              <SelectItem value="distanciaKm">Distancia (km)</SelectItem>
              <SelectItem value="velocidadMaxima">Vel. Máx (Km/h)</SelectItem>
              <SelectItem value="numeroViajes">No. Viajes</SelectItem>
              <SelectItem value="inicioMovimiento">Inicio movimiento</SelectItem>
              <SelectItem value="ubicacionInicio">Ubicación Inicio</SelectItem>
              <SelectItem value="ubicacionFin">Ubicación Fin</SelectItem>
              <SelectItem value="finMovimiento">Fin movimiento</SelectItem>
            </SelectContent>
          </Select>
          {groupByField && (
            <Button
              variant="outline"
              size="sm"
              onClick={resetGrouping}
              className="h-8 px-3 text-xs text-gray-600 border-gray-300 hover:bg-gray-100"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Resetear
            </Button>
          )}
        </div>
        
        {/* Replace record count with fullscreen toggle */}
        <div className="flex items-center gap-3">
          <div className="text-xs text-gray-500">
            {groupByField 
              ? `Agrupado por ${getColumnDisplayName(groupByField)} (${groupedData?.length || 0} grupos)`
              : `${filteredAndSortedData.length} registros`
            }
          </div>
          {onFullscreenToggle && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onFullscreenToggle}
                    className="h-8 w-8 p-0 text-gray-600 hover:text-gray-900 hover:bg-gray-200"
                  >
                    {isFullscreen ? (
                      <Minimize2 className="w-4 h-4" />
                    ) : (
                      <Maximize2 className="w-4 h-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">
                    {isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>

      {/* Filter status bar */}
      {hasActiveFilters && allowColumnFilters && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-2 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2 text-sm text-blue-700">
            <Filter className="w-4 h-4" />
            <span>Filtros activos aplicados</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllFilters}
            className="h-7 px-3 text-xs text-blue-700 border-blue-300 hover:bg-blue-100"
          >
            Limpiar todos los filtros
          </Button>
        </div>
      )}

      {/* Header */}
      <div className="flex-shrink-0 overflow-hidden">
        <ScrollArea className="w-full">
          <div style={{ minWidth: `${totalWidth}px` }}>
            <div className="border-b border-gray-200">
              <div className="flex">
                <ColumnHeader field="unidad" width={columnWidths.unidad}>Unidad</ColumnHeader>
                <ColumnHeader field="fecha" width={columnWidths.fecha}>Fecha</ColumnHeader>
                <ColumnHeader field="distanciaKm" width={columnWidths.distanciaKm}>Distancia (km)</ColumnHeader>
                <ColumnHeader field="velocidadMaxima" width={columnWidths.velocidadMaxima}>Vel. Máx (Km/h)</ColumnHeader>
                <ColumnHeader field="numeroViajes" width={columnWidths.numeroViajes}>No. Viajes</ColumnHeader>
                <ColumnHeader field="inicioMovimiento" width={columnWidths.inicioMovimiento}>Inicio movimiento</ColumnHeader>
                <ColumnHeader field="ubicacionInicio" width={columnWidths.ubicacionInicio}>Ubicación Inicio</ColumnHeader>
                <ColumnHeader field="ubicacionFin" width={columnWidths.ubicacionFin}>Ubicación Fin</ColumnHeader>
                <ColumnHeader field="finMovimiento" width={columnWidths.finMovimiento} className="border-r-0">Fin movimiento</ColumnHeader>
              </div>
            </div>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Data Content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div style={{ minWidth: `${totalWidth}px` }}>
            {groupByField && groupedData ? (
              // Grouped view with sticky headers
              <div className="relative">
                {groupedData.map(([groupKey, groupRecords]) => {
                  const isCollapsed = collapsedGroups.has(groupKey)
                  const groupCount = groupRecords.length
                  
                  return (
                    <Collapsible key={groupKey} open={!isCollapsed} onOpenChange={() => toggleGroupCollapse(groupKey)}>
                      <CollapsibleTrigger asChild>
                        <div className="sticky top-0 z-10 flex items-center px-4 py-3 bg-gray-100 border-b border-gray-200 hover:bg-gray-150 cursor-pointer transition-colors">
                          <div className="flex items-center gap-2 flex-1">
                            {isCollapsed ? (
                              <ChevronRight className="w-4 h-4 text-gray-500" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-500" />
                            )}
                            <span className="text-sm font-medium text-gray-900">
                              {getGroupLabel(groupByField, groupKey, groupCount)}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {isCollapsed ? 'Expandir' : 'Colapsar'}
                          </div>
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="border-b border-gray-200">
                          {groupRecords.map((record, index) => renderDataRow(record, index))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  )
                })}
              </div>
            ) : (
              // Regular ungrouped view
              <div className="border-b border-gray-200">
                {filteredAndSortedData.map((record, index) => renderDataRow(record, index))}
              </div>
            )}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  )
}