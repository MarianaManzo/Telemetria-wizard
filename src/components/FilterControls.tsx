import { useState, useEffect, useRef } from "react"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Calendar, Truck, Tag, Plus, ChevronDown, Search, Check, AlertCircle, X } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"

import { DateRangeSelector } from "./DateRangeSelector"
import { VehicleSelector } from "./VehicleSelector"
import { EtiquetasSelector } from "./EtiquetasSelector"
// AddFilters removed
import { DynamicFilter } from "./DynamicFilter"

type DateOption = 
  | "hoy" 
  | "ayer" 
  | "ultimos7dias" 
  | "ultimos15dias" 
  | "ultimomes" 
  | "mesanterior" 
  | "personalizado"

const dateLabels: Record<DateOption, string> = {
  hoy: "Hoy",
  ayer: "Ayer", 
  ultimos7dias: "Últimos 7 días",
  ultimos15dias: "Últimos 15 días",
  ultimomes: "Último mes",
  mesanterior: "Mes anterior",
  personalizado: "Personalizado"
}

interface Vehicle {
  id: string
  name: string
}

interface Tag {
  id: string
  name: string
  color: string
  vehicleCount: number
}

interface FilterConfig {
  id: string
  name: string
  type: 'select' | 'range' | 'date' | 'multiselect'
  options?: string[]
}

interface FilterControlsProps {
  onGenerate: () => void
  disabled?: boolean
  addFiltersDisabled?: boolean
  onFiltersChange?: (filters: any) => void
  showDraftWarning?: boolean
  daysUntilDeletion?: number
  onDismissWarning?: () => void
  initialFilters?: any
  currentFilters?: any
}

export function FilterControls({ 
  onGenerate, 
  disabled = false, 
  addFiltersDisabled = false, 
  onFiltersChange,
  showDraftWarning = false,
  daysUntilDeletion = 7,
  onDismissWarning,
  initialFilters,
  currentFilters
}: FilterControlsProps) {
  const [selectedDate, setSelectedDate] = useState<DateOption>("hoy")
  const [selectedVehicles, setSelectedVehicles] = useState<Vehicle[]>([])
  const [selectedTags, setSelectedTags] = useState<Tag[]>([])
  const [vehicleSelectorOpen, setVehicleSelectorOpen] = useState(false)
  const [dynamicFilters, setDynamicFilters] = useState<FilterConfig[]>([])
  const [showValidationError, setShowValidationError] = useState(false)
  const [showRangeError, setShowRangeError] = useState(false)
  const [showVehiclesError, setShowVehiclesError] = useState(false)
  const [showTagsError, setShowTagsError] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  
  const vehiclesBadgeRef = useRef<HTMLDivElement>(null)

  const [customDateRange, setCustomDateRange] = useState<{
    start?: Date
    end?: Date
  }>({})

  // Initialize filters from saved report
  useEffect(() => {
    if (initialFilters && !isInitialized) {
      // Set date filter
      if (initialFilters.date) {
        setSelectedDate(initialFilters.date)
      }
      
      // Set custom date range if applicable
      if (initialFilters.customDateRange) {
        setCustomDateRange(initialFilters.customDateRange)
      }
      
      // Set vehicles filter
      if (initialFilters.vehicles) {
        setSelectedVehicles(initialFilters.vehicles)
      }
      
      // Set tags filter
      if (initialFilters.tags) {
        setSelectedTags(initialFilters.tags)
      }
      
      // Set dynamic filters
      if (initialFilters.dynamicFilters) {
        setDynamicFilters(initialFilters.dynamicFilters)
      }
      
      setIsInitialized(true)
      
      // Emit the initial filters to parent
      onFiltersChange?.(initialFilters)
    }
  }, [initialFilters, isInitialized, onFiltersChange])
  
  // Update filters when currentFilters change (for undo functionality)
  useEffect(() => {
    if (currentFilters && isInitialized) {

      
      setIsSyncing(true) // Prevent callbacks during sync
      
      // Set date filter
      if (currentFilters.date) {
        setSelectedDate(currentFilters.date)
      }
      
      // Set custom date range if applicable
      if (currentFilters.customDateRange) {
        setCustomDateRange(currentFilters.customDateRange)
      } else {
        setCustomDateRange({})
      }
      
      // Set vehicles filter
      if (currentFilters.vehicles) {
        setSelectedVehicles(currentFilters.vehicles)
      } else {
        setSelectedVehicles([])
      }
      
      // Set tags filter
      if (currentFilters.tags) {
        setSelectedTags(currentFilters.tags)
      } else {
        setSelectedTags([])
      }
      
      // Set dynamic filters
      if (currentFilters.dynamicFilters) {
        setDynamicFilters(currentFilters.dynamicFilters)
      } else {
        setDynamicFilters([])
      }
      
      // Reset sync flag after a short delay to allow all state updates to complete
      setTimeout(() => {
        setIsSyncing(false)
      }, 50)
    }
  }, [currentFilters, isInitialized])

  // Clear validation error when at least one filter is selected
  useEffect(() => {
    const hasVehicles = selectedVehicles.length > 0
    const hasTags = selectedTags.length > 0
    
    if (showValidationError && (hasVehicles || hasTags)) {
      setShowValidationError(false)
    }
  }, [selectedVehicles, selectedTags, showValidationError])

  // Clear range error when a valid range is selected
  useEffect(() => {
    const hasValidRange = selectedDate !== "personalizado" || (customDateRange.start && customDateRange.end)
    
    if (showRangeError && hasValidRange) {
      setShowRangeError(false)
    }
  }, [selectedDate, customDateRange, showRangeError])

  const handleDateOptionSelect = (option: DateOption) => {
    setSelectedDate(option)
    if (option !== "personalizado") {
      // Reset custom date range when switching away from personalizado
      setCustomDateRange({})
      // Clear range error when selecting a non-custom date option
      setShowRangeError(false)
    }
    
    // Only emit filter change if not syncing
    if (!isSyncing) {
      onFiltersChange?.({
        date: option,
        customDateRange: option === "personalizado" ? customDateRange : {},
        vehicles: selectedVehicles,
        tags: selectedTags,
        dynamicFilters
      })
    }
  }

  const handleDateRangeSelect = (startDate: Date | undefined, endDate: Date | undefined) => {
    const newRange = { start: startDate, end: endDate }
    setCustomDateRange(newRange)
    
    // Only emit filter change if not syncing
    if (!isSyncing) {
      onFiltersChange?.({
        date: selectedDate,
        customDateRange: newRange,
        vehicles: selectedVehicles,
        tags: selectedTags,
        dynamicFilters
      })
    }
  }

  const getDateDisplayText = () => {
    return dateLabels[selectedDate]
  }

  const hasValidDateRange = () => {
    return selectedDate !== "personalizado" || (customDateRange.start && customDateRange.end)
  }

  const hasFilledDateRange = () => {
    // Show as filled (blue) for all date selections, including "personalizado"
    // Badge of date is ALWAYS filled when any date option is selected (including personalizado)
    // The showRangeError only affects the DateRangeSelector component, NOT this badge
    return true // Always show as filled - date badge is never in error state
  }

  const hasValidCustomDateRange = () => {
    // For the DateRangeSelector - only show as filled when custom range has valid dates
    return customDateRange.start && customDateRange.end
  }

  const getVehicleDisplayText = () => {
    if (selectedVehicles.length === 0) {
      return "Seleccionar Unidades"
    }
    return `${selectedVehicles.length} Unidad${selectedVehicles.length === 1 ? '' : 'es'}`
  }

  const handleVehicleSelectionChange = (vehicles: Vehicle[]) => {
    setSelectedVehicles(vehicles)
    
    // Clear errors based on OR validation logic (vehicles OR tags required)
    if (vehicles.length > 0) {
      // If vehicles are now filled, clear both vehicles and tags errors
      // because the OR condition is satisfied
      setShowVehiclesError(false)
      setShowTagsError(false) // Clear tags error even if tags are empty
      setShowValidationError(false)
    }
    
    // Only emit filter change if not syncing
    if (!isSyncing) {
      onFiltersChange?.({
        date: selectedDate,
        customDateRange,
        vehicles,
        tags: selectedTags,
        dynamicFilters
      })
    }
  }

  const handleTagsSelectionChange = (tags: Tag[]) => {
    setSelectedTags(tags)
    
    // Clear errors based on OR validation logic (vehicles OR tags required)
    if (tags.length > 0) {
      // If tags are now filled, clear both vehicles and tags errors
      // because the OR condition is satisfied
      setShowTagsError(false)
      setShowVehiclesError(false) // Clear vehicles error even if vehicles are empty
      setShowValidationError(false)
    }
    
    // Only emit filter change if not syncing
    if (!isSyncing) {
      onFiltersChange?.({
        date: selectedDate,
        customDateRange,
        vehicles: selectedVehicles,
        tags,
        dynamicFilters
      })
    }
  }

  const handleFilterAdd = (filter: FilterConfig) => {
    // Don't add duplicate filters
    if (!dynamicFilters.some(f => f.id === filter.id)) {
      const newFilters = [...dynamicFilters, filter]
      setDynamicFilters(newFilters)
      
      // Only emit filter change if not syncing
      if (!isSyncing) {
        onFiltersChange?.({
          date: selectedDate,
          customDateRange,
          vehicles: selectedVehicles,
          tags: selectedTags,
          dynamicFilters: newFilters
        })
      }
    }
  }

  const handleFilterRemove = (filterId: string) => {
    const newFilters = dynamicFilters.filter(f => f.id !== filterId)
    setDynamicFilters(newFilters)
    
    // Only emit filter change if not syncing
    if (!isSyncing) {
      onFiltersChange?.({
        date: selectedDate,
        customDateRange,
        vehicles: selectedVehicles,
        tags: selectedTags,
        dynamicFilters: newFilters
      })
    }
  }

  const handleFilterValueChange = (filterId: string, value: string | string[]) => {
    // Handle filter value changes if needed for advanced functionality
    console.log(`Filter ${filterId} changed to: ${value}`)
    
    // Only emit filter change if not syncing
    if (!isSyncing) {
      onFiltersChange?.({
        date: selectedDate,
        customDateRange,
        vehicles: selectedVehicles,
        tags: selectedTags,
        dynamicFilters
      })
    }
  }

  // Handle generate button click with validation
  const handleGenerateClick = () => {
    const hasVehicles = selectedVehicles.length > 0
    const hasTags = selectedTags.length > 0
    const hasValidRange = selectedDate !== "personalizado" || (customDateRange.start && customDateRange.end)
    
    let hasErrors = false
    
    // Clear all previous errors first
    setShowValidationError(false)
    setShowRangeError(false)
    setShowVehiclesError(false)
    setShowTagsError(false)
    
    // Validate range first
    if (!hasValidRange) {
      setShowRangeError(true)
      hasErrors = true
    }
    
    // OR validation: at least one must be filled (Unidades OR Etiquetas)
    if (!hasVehicles && !hasTags) {
      setShowValidationError(true)
      setShowVehiclesError(true) // Mark vehicles as error
      setShowTagsError(true) // Mark tags as error
      // Focus on Unidades badge if no range error
      if (!hasErrors) {
        vehiclesBadgeRef.current?.focus()
      }
      hasErrors = true
    }
    
    // If there are errors, don't proceed
    if (hasErrors) {
      return
    }
    
    // Clear any existing errors and proceed with generation
    setShowValidationError(false)
    setShowRangeError(false)
    setShowVehiclesError(false)
    setShowTagsError(false)
    onGenerate()
  }

  return (
    <div className="bg-white mx-6 border-b border-border rounded-[8px] m-[16px] mt-[16px] mr-[16px] mb-[8px] ml-[16px]">
      {/* Draft warning banner */}
      {showDraftWarning && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-800">
              Este borrador se eliminará automáticamente en {daysUntilDeletion} días. Guárdalo ahora para no perder tu información.
            </p>
          </div>
          {onDismissWarning && (
            <button
              onClick={onDismissWarning}
              className="text-amber-600 hover:text-amber-800 transition-colors p-1 cursor-pointer"
              aria-label="Cerrar aviso"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
      
      <div className="px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Scrollable Filters Container */}
          <div className="flex items-center gap-2 min-w-0 flex-1 overflow-x-auto">
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-sm text-gray-600">Filtros:</span>
            </div>
            
            {/* Date Filter */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger className="rounded-md" disabled={disabled}>
                  <Badge variant="secondary" className={`${
                    hasFilledDateRange()
                      ? 'bg-blue-50 text-blue-700 border-blue-200' 
                      : 'bg-gray-50 text-gray-700 border-gray-200'
                  } flex items-center gap-1 cursor-pointer hover:bg-blue-100 h-8 px-3 whitespace-nowrap text-[12px] ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <Calendar className={`w-4 h-4 ${
                      hasFilledDateRange()
                        ? 'text-blue-600' 
                        : 'text-gray-600'
                    }`} />
                    Fecha: {getDateDisplayText()}
                    <ChevronDown className="w-3 h-4 ml-1" />
                  </Badge>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  {Object.entries(dateLabels).map(([key, label]) => (
                    <DropdownMenuItem 
                      key={key}
                      onClick={() => handleDateOptionSelect(key as DateOption)}
                      className={selectedDate === key ? "bg-blue-50 text-blue-700" : ""}
                    >
                      {label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {selectedDate === "personalizado" && (
              <div className="flex items-center gap-2 flex-shrink-0">
                <DateRangeSelector 
                  onDateRangeSelect={handleDateRangeSelect}
                  selectedRange={customDateRange}
                  disabled={disabled}
                  showError={showRangeError}
                  isFilled={hasValidCustomDateRange()}
                />
              </div>
            )}

            {/* Unidades Filter */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge
                ref={vehiclesBadgeRef}
                tabIndex={0} 
                variant="secondary" 
                className={`${
                  selectedVehicles.length > 0 
                    ? 'bg-blue-50 text-blue-700 border-blue-200' 
                    : showVehiclesError 
                      ? 'bg-red-50 text-red-700 border-red-200' 
                      : 'bg-gray-50 text-gray-700 border-gray-200'
                } h-8 px-3 flex items-center gap-1 cursor-pointer hover:bg-blue-100 whitespace-nowrap ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => !disabled && setVehicleSelectorOpen(true)}
              >
                <Truck className={`w-4 h-4 ${
                  selectedVehicles.length > 0 
                    ? 'text-blue-600' 
                    : showVehiclesError 
                      ? 'text-red-600' 
                      : 'text-gray-600'
                }`} />
                <span className="text-sm">Unidades: {getVehicleDisplayText()}</span>
              </Badge>
            </div>

            {/* Etiquetas Filter - Using new EtiquetasSelector component directly */}
            {!disabled && (
              <div className="flex items-center gap-2 flex-shrink-0">
                <EtiquetasSelector
                  selectedTags={selectedTags}
                  onSelectionChange={handleTagsSelectionChange}
                  showError={showTagsError}
                />
              </div>
            )}

            {/* Disabled state for Etiquetas when disabled */}
            {disabled && (
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge 
                  variant="secondary" 
                  className={`${
                    showTagsError 
                      ? 'bg-red-50 text-red-700 border-red-200' 
                      : 'bg-gray-50 text-gray-700 border-gray-200'
                  } h-8 px-3 flex items-center gap-1 opacity-50 cursor-not-allowed whitespace-nowrap`}
                >
                  <Tag className={`w-4 h-4 ${showTagsError ? 'text-red-600' : 'text-gray-600'}`} />
                  <span className="text-sm">Etiquetas: Seleccionar etiqueta</span>
                </Badge>
              </div>
            )}

            {/* Dynamic Filters */}
            {dynamicFilters.map((filter) => (
              <div key={filter.id} className="flex-shrink-0">
                <DynamicFilter
                  filter={filter}
                  onRemove={handleFilterRemove}
                  onValueChange={handleFilterValueChange}
                />
              </div>
            ))}
          </div>

          {/* Fixed Action Buttons */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <Button 
              onClick={disabled ? undefined : handleGenerateClick}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 h-8 whitespace-nowrap"
            >
              Generar
            </Button>
          </div>
        </div>
      </div>
      
      <VehicleSelector
        isOpen={vehicleSelectorOpen}
        onClose={() => setVehicleSelectorOpen(false)}
        selectedVehicles={selectedVehicles}
        onSelectionChange={handleVehicleSelectionChange}
      />
    </div>
  )
}