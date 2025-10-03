import { DataTable } from "./DataTable"
import { FiltersModifiedEmptyState } from "./FiltersModifiedEmptyState"

interface DataTableWrapperProps {
  hasData: boolean
  onFilteredDataChange: (data: any[]) => void
  allowColumnFilters?: boolean
  allowGrouping?: boolean
  dataRefreshTrigger?: number
  preserveColumnFilters?: boolean
  isFullscreen?: boolean
  onFullscreenToggle?: () => void
  showFiltersModifiedState?: boolean
  onTableStateChange?: () => void
  resetTableState?: number
  appliedFilters?: any
}

export function DataTableWrapper({ 
  showFiltersModifiedState = false,
  onTableStateChange,
  resetTableState,
  appliedFilters,
  ...props 
}: DataTableWrapperProps) {
  // Show filters modified state if requested
  if (showFiltersModifiedState) {
    return <FiltersModifiedEmptyState />
  }

  // Otherwise, render the normal DataTable
  return <DataTable {...props} onTableStateChange={onTableStateChange} resetTableState={resetTableState} appliedFilters={appliedFilters} />
}