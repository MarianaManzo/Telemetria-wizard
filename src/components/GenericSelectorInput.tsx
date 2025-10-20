import { useState, useRef, useEffect } from "react"
import { Dropdown } from "antd"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Search, X } from "lucide-react"
import { DownOutlined } from "@ant-design/icons"
interface GenericSelectorInputProps<T = any> {
  selectedItems: T[]
  onSelectionChange: (items: T[]) => void
  placeholder?: string
  className?: string
  title?: string
  items: T[]
  searchPlaceholder?: string
  getDisplayText?: (count: number) => string
  renderItemIcon?: (item: T) => React.ReactNode
  renderItemDetails?: (item: T) => React.ReactNode
  disabled?: boolean
  maxSelections?: number
  multiSelect?: boolean
  showColorPills?: boolean
  showPillsDisplay?: boolean
  maxVisiblePills?: number
  showFooterCount?: boolean
}

export function GenericSelectorInput<T extends { id: string; name: string; color?: string }>({
  selectedItems,
  onSelectionChange,
  placeholder = "Seleccionar elementos...",
  className = "",
  title = "Seleccionar elementos",
  items,
  searchPlaceholder = "Buscar...",
  getDisplayText,
  renderItemIcon,
  renderItemDetails,
  disabled = false,
  maxSelections,
  multiSelect = true,
  showColorPills = false,
  showPillsDisplay = false,
  maxVisiblePills = 3,
  showFooterCount = false
}: GenericSelectorInputProps<T>) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [dynamicVisiblePills, setDynamicVisiblePills] = useState(maxVisiblePills)
  const [overlayWidth, setOverlayWidth] = useState<number>()
  const [isClearHover, setIsClearHover] = useState(false)
  const triggerRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const pillsRef = useRef<HTMLDivElement>(null)

  const displayText = getDisplayText 
    ? getDisplayText(selectedItems.length)
    : selectedItems.length === 0 
    ? placeholder 
    : selectedItems.length === 1 
    ? selectedItems[0].name
    : `${selectedItems.length} elementos seleccionados`

  // Calculate how many pills can fit dynamically by measuring actual widths
  const calculateVisiblePills = () => {
    if (!containerRef.current || !showColorPills || selectedItems.length === 0) {
      return maxVisiblePills
    }

    const containerWidth = containerRef.current.offsetWidth
    const paddingAndChevron = 40 // Reserve space for padding and chevron icon
    const availableWidth = containerWidth - paddingAndChevron
    
    // If only 1-2 items, always try to show them
    if (selectedItems.length <= 2) {
      // Estimate if they fit: ~80-120px per pill average
      const estimatedWidth = selectedItems.length * 100
      return estimatedWidth <= availableWidth ? selectedItems.length : 1
    }

    // For more items, we need to account for the counter
    const counterWidth = 45 // Estimated width for "+XX" counter
    const widthForPills = availableWidth - counterWidth
    
    // Calculate how many pills can fit
    // More conservative per-pill estimate to avoid cutting
    const avgPillWidth = 90 // Base width for typical tag names
    const gap = 4 // Gap between pills
    const effectivePillWidth = avgPillWidth + gap
    
    const maxFittingPills = Math.floor(widthForPills / effectivePillWidth)
    
    // Ensure at least 1 pill is shown, but never more than total - 1 (to always show counter)
    const pillsToShow = Math.max(1, Math.min(maxFittingPills, selectedItems.length - 1))
    
    // Special case: if we calculated that all pills fit, check if they really do
    if (pillsToShow >= selectedItems.length - 1) {
      const totalEstimatedWidth = selectedItems.length * effectivePillWidth
      if (totalEstimatedWidth <= availableWidth) {
        return selectedItems.length // Show all, no counter needed
      }
    }
    
    return pillsToShow
  }

  // Measure actual pill widths to get precise fitting calculation
  const measurePillsFit = () => {
    if (!containerRef.current || !pillsRef.current) return dynamicVisiblePills

    const containerWidth = containerRef.current.offsetWidth
    const paddingAndChevron = 40
    const availableWidth = containerWidth - paddingAndChevron

    // Create temporary elements to measure actual pill widths
    const tempContainer = document.createElement('div')
    tempContainer.style.position = 'absolute'
    tempContainer.style.visibility = 'hidden'
    tempContainer.style.whiteSpace = 'nowrap'
    tempContainer.style.display = 'flex'
    tempContainer.style.gap = '4px'
    tempContainer.style.fontFamily = 'Source Sans 3, sans-serif'
    tempContainer.style.fontSize = '12px'
    document.body.appendChild(tempContainer)

    let totalWidth = 0
    let fittingPills = 0
    let counterWidth = 50 // Reserve space for counter (more conservative)

    try {
      // Measure each pill
      for (let i = 0; i < selectedItems.length; i++) {
        const item = selectedItems[i]
        const pillEl = document.createElement('span')
        pillEl.className = 'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs border flex-shrink-0'
        pillEl.style.maxWidth = '120px'
        pillEl.style.fontFamily = 'Source Sans 3, sans-serif'
        pillEl.style.fontSize = '12px'
        pillEl.style.backgroundColor = item.color || '#6B7280'
        pillEl.style.color = '#ffffff'
        pillEl.style.padding = '2px 8px'
        
        // Create inner content with X button space
        const textSpan = document.createElement('span')
        textSpan.textContent = item.name
        textSpan.style.overflow = 'hidden'
        textSpan.style.textOverflow = 'ellipsis'
        textSpan.style.whiteSpace = 'nowrap'
        
        const buttonSpace = document.createElement('span')
        buttonSpace.style.width = '16px' // Space for X button
        buttonSpace.style.marginLeft = '4px'
        
        pillEl.appendChild(textSpan)
        pillEl.appendChild(buttonSpace)
        tempContainer.appendChild(pillEl)

        const pillWidth = pillEl.offsetWidth + 4 // +4 for gap
        
        // Measure actual counter width for precision
        if (i === 0) {
          const counterEl = document.createElement('span')
          counterEl.className = 'inline-flex items-center px-2 py-0.5 rounded-md text-xs bg-gray-200 text-gray-600 flex-shrink-0'
          counterEl.style.fontFamily = 'Source Sans 3, sans-serif'
          counterEl.style.fontSize = '12px'
          counterEl.style.padding = '2px 8px'
          counterEl.textContent = `+${selectedItems.length - 1}`
          tempContainer.appendChild(counterEl)
          const measuredCounterWidth = counterEl.offsetWidth + 4 // +4 for gap
          tempContainer.removeChild(counterEl)
          if (measuredCounterWidth > counterWidth) {
            counterWidth = measuredCounterWidth
          }
        }

        const wouldFitWithCounter = (totalWidth + pillWidth + counterWidth) <= availableWidth
        const wouldFitWithoutCounter = (totalWidth + pillWidth) <= availableWidth

        // If this is the last item and it fits without counter, include it
        if (i === selectedItems.length - 1 && wouldFitWithoutCounter) {
          fittingPills = i + 1
          break
        }
        
        // If it fits with counter space reserved, include it
        if (wouldFitWithCounter) {
          totalWidth += pillWidth
          fittingPills = i + 1
        } else {
          // Stop if it doesn't fit
          break
        }
      }

      // Ensure at least 1 pill if we have items
      if (selectedItems.length > 0 && fittingPills === 0) {
        fittingPills = 1
      }

    } finally {
      document.body.removeChild(tempContainer)
    }

    return fittingPills
  }

  // Update dynamic visible pills when container size or items change
  useEffect(() => {
    if (showColorPills && selectedItems.length > 0) {
      // Small delay to ensure DOM is rendered
      const timer = setTimeout(() => {
        const newVisiblePills = measurePillsFit()
        setDynamicVisiblePills(newVisiblePills)
      }, 50)
      return () => clearTimeout(timer)
    } else {
      setDynamicVisiblePills(maxVisiblePills)
    }
  }, [selectedItems.length, maxVisiblePills, showColorPills])

  useEffect(() => {
    if (triggerRef.current) {
      setOverlayWidth(triggerRef.current.offsetWidth)
    }
  }, [isOpen, selectedItems.length, showPillsDisplay, showColorPills])

  const clearDisabled = disabled || (selectedItems.length === 0 && !searchTerm)

  useEffect(() => {
    if (clearDisabled && isClearHover) {
      setIsClearHover(false)
    }
  }, [clearDisabled, isClearHover])

  // Initial calculation after mount
  useEffect(() => {
    if (showColorPills && selectedItems.length > 0) {
      const timer = setTimeout(() => {
        const newVisiblePills = measurePillsFit()
        setDynamicVisiblePills(newVisiblePills)
      }, 100) // Longer delay for initial render to ensure DOM is ready
      return () => clearTimeout(timer)
    }
  }, []) // Run only once on mount

  // Also recalculate on resize
  useEffect(() => {
    let resizeTimer: ReturnType<typeof setTimeout> | null = null

    const handleResize = () => {
      if (resizeTimer) {
        clearTimeout(resizeTimer)
      }

      resizeTimer = setTimeout(() => {
        if (showColorPills && selectedItems.length > 0) {
          const newVisiblePills = measurePillsFit()
          setDynamicVisiblePills(newVisiblePills)
        }

        if (triggerRef.current) {
          setOverlayWidth(triggerRef.current.offsetWidth)
        }
      }, 20)
    }

    window.addEventListener('resize', handleResize)
    return () => {
      if (resizeTimer) {
        clearTimeout(resizeTimer)
      }
      window.removeEventListener('resize', handleResize)
    }
  }, [selectedItems.length, maxVisiblePills, showColorPills])

  // Render pills with max visible limit
  const renderDisplayContent = () => {
    if (selectedItems.length === 0) {
      return <span className="text-gray-500">{displayText}</span>
    }

    if (!showPillsDisplay) {
      return <span className="text-gray-900">{displayText}</span>
    }

    const visibleItems = selectedItems.slice(0, maxVisiblePills)
    const remainingCount = selectedItems.length - maxVisiblePills

    return (
      <div className="flex items-center gap-1 flex-wrap">
        {visibleItems.map((item) => (
          <span
            key={item.id}
            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[12px] border max-w-[120px] ${
              showColorPills && item.color
                ? 'text-white'
                : 'bg-gray-100 text-gray-800'
            }`}
            style={showColorPills && item.color ? { backgroundColor: item.color } : undefined}
          >
            <span className="truncate">{item.name}</span>
          </span>
        ))}
        {remainingCount > 0 && (
          <span key="remaining-count" className="inline-flex items-center px-2 py-0.5 rounded-md text-[12px] bg-gray-200 text-gray-600 border">
            +{remainingCount}
          </span>
        )}
      </div>
    )
  }

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleItemToggle = (item: T) => {
    if (disabled) return
    
    const isSelected = selectedItems.some(selected => selected.id === item.id)
    if (isSelected) {
      onSelectionChange(selectedItems.filter(selected => selected.id !== item.id))
    } else {

      onSelectionChange([...selectedItems, item])
    }
  }

  const handleClearAll = () => {
    if (disabled) return
    onSelectionChange([])
    setSearchTerm("")
  }

  const handleDropdownOpenChange = (openState: boolean) => {
    if (disabled) return

    setIsOpen(openState)
    if (!openState) {
      setSearchTerm("")
    }
  }

  const computedOverlayWidth = overlayWidth && overlayWidth > 0 ? overlayWidth : 320
  const clearButtonColor = clearDisabled
    ? '#9ca3af'
    : searchTerm
      ? (isClearHover ? '#1d4ed8' : '#2563eb')
      : (isClearHover ? '#1f2937' : '#4b5563')

  const overlay = (
    <div
      style={{
        width: computedOverlayWidth,
        background: '#ffffff',
        borderRadius: 12,
        border: '1px solid #E5E7EB',
        boxShadow: '0 16px 40px rgba(15, 23, 42, 0.12)'
      }}
      onMouseDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
      role="group"
      aria-label={title}
    >
      <div className="p-4">
        {/* Search */}
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-9"
              disabled={disabled}
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="text-[12px] h-9 px-3 whitespace-nowrap"
            disabled={clearDisabled}
            style={{ color: clearButtonColor }}
            onMouseEnter={() => {
              if (!clearDisabled) setIsClearHover(true)
            }}
            onMouseLeave={() => {
              if (isClearHover) setIsClearHover(false)
            }}
          >
            Limpiar
          </Button>
        </div>

        {/* Items List */}
        <div className="max-h-64 overflow-y-auto">
          {filteredItems.length === 0 ? (
            <div className="flex items-center justify-center h-20 text-[14px] text-gray-500">
              {searchTerm ? "No se encontraron elementos" : "No hay elementos disponibles"}
            </div>
          ) : (
            <div className="space-y-1">
              {filteredItems.map((item) => {
                const isSelected = selectedItems.some(selected => selected.id === item.id)
                return (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between py-0.5 px-3 rounded cursor-pointer transition-colors ${
                      isSelected 
                        ? 'bg-blue-50 border border-blue-200' 
                        : 'hover:bg-gray-50 border border-transparent'
                    }`}
                    onClick={() => handleItemToggle(item)}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {renderItemIcon && renderItemIcon(item)}
                      <div className="flex-1 min-w-0">
                        {showColorPills && item.color ? (
                          <div className="flex items-center">
                            <span 
                              className="inline-flex items-center px-3 py-1.5 text-[12px] font-medium text-white"
                              style={{ backgroundColor: item.color, borderRadius: '8px' }}
                            >
                              {item.name}
                            </span>
                          </div>
                        ) : (
                          <div className={`text-[14px] truncate ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                            {item.name}
                          </div>
                        )}
                        {renderItemDetails && renderItemDetails(item)}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="ml-2 flex-shrink-0">
                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer with count - only show when showFooterCount is true */}
        {showFooterCount && maxSelections && (
          <>
            <div className="border-t border-gray-200 -mx-4 mt-4"></div>
            <div className="pt-3 flex items-center justify-between text-[14px] text-gray-600">
              <span>{selectedItems.length} seleccionadas</span>
              <span>({selectedItems.length}/{maxSelections})</span>
            </div>
          </>
        )}

      </div>
    </div>
  )

  return (
    <div className={`w-full ${className}`}>
      <Dropdown
        trigger={["click"]}
        open={isOpen}
        onOpenChange={handleDropdownOpenChange}
        dropdownRender={() => overlay}
        placement="bottomLeft"
        menu={{ items: [] }}
        disabled={disabled}
        destroyPopupOnHide
        overlayStyle={{ padding: 0 }}
      >
        <div ref={triggerRef} className="relative">
          {showPillsDisplay && showColorPills && selectedItems.length > 0 && selectedItems.some(item => item.color) ? (
            <div
              ref={containerRef}
              className={`w-full px-3 text-[14px] border border-gray-300 rounded-lg bg-white appearance-none pr-8 cursor-pointer text-gray-900 flex items-center box-border ${
                disabled ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              style={{ height: 32 }}
            >
              <div ref={pillsRef} className="flex items-center gap-1 flex-1 overflow-hidden h-[28px]">
                {selectedItems.slice(0, dynamicVisiblePills).map((item) => (
                  <span
                    key={item.id}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[12px] text-white border max-w-[120px] flex-shrink-0"
                    style={{ backgroundColor: (item as any).color }}
                  >
                    <span className="truncate">{item.name}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        const newSelection = selectedItems.filter(selected => selected.id !== item.id)
                        onSelectionChange(newSelection)
                      }}
                      className="ml-1 hover:bg-black/20 rounded-full p-0.5 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {selectedItems.length > dynamicVisiblePills && (
                  <span key="dynamic-remaining-count" className="inline-flex items-center px-2 py-0.5 rounded-md text-[12px] bg-gray-200 text-gray-600 border flex-shrink-0">
                    +{selectedItems.length - dynamicVisiblePills}
                  </span>
                )}
              </div>
            </div>
          ) : showPillsDisplay ? (
            <div
              className={`w-full px-3 text-[14px] border border-gray-300 rounded-lg bg-white appearance-none pr-8 cursor-pointer text-gray-900 flex items-center box-border ${
                disabled ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              style={{ height: 32 }}
            >
              {renderDisplayContent()}
            </div>
          ) : (
            <div
              className={`w-full px-3 text-sm border border-gray-300 rounded-lg bg-white cursor-pointer text-gray-900 flex items-center box-border ${
                disabled ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              style={{ height: 32 }}
            >
              {selectedItems.length === 0 ? (
                <span className="text-gray-500">{placeholder || displayText}</span>
              ) : showPillsDisplay && showColorPills ? (
                <div className="flex gap-1 items-center overflow-hidden h-[28px]">
                  {selectedItems.slice(0, dynamicVisiblePills).map((item) => (
                    <span
                      key={item.id}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs text-white max-w-[120px] flex-shrink-0"
                      style={{ backgroundColor: item.color || '#6B7280' }}
                    >
                      <span className="truncate">{item.name}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          const newSelection = selectedItems.filter(selected => selected.id !== item.id)
                          onSelectionChange(newSelection)
                        }}
                        className="ml-1 hover:bg-black/20 rounded-full p-0.5 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {selectedItems.length > dynamicVisiblePills && (
                    <span key="alt-dynamic-remaining-count" className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-200 text-gray-600 flex-shrink-0">
                      +{selectedItems.length - dynamicVisiblePills}
                    </span>
                  )}
                </div>
              ) : (
                <span>{displayText}</span>
              )}
            </div>
          )}
          <DownOutlined
            style={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: 14,
              color: '#9ca3af',
            }}
          />
        </div>
      </Dropdown>
    </div>
  )
}
