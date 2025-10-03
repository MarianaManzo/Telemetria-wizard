import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { ChevronDown, Search, X } from "lucide-react"

interface TagData {
  id: string
  name: string
  color: string
  vehicleCount: number
}

interface EtiquetasSelectorInputProps {
  selectedTags: TagData[]
  onSelectionChange: (tags: TagData[]) => void
  placeholder?: string
  className?: string
}

const mockTags: TagData[] = [
  { id: "1", name: "Norte", color: "#3B82F6", vehicleCount: 12 },
  { id: "2", name: "Sur", color: "#10B981", vehicleCount: 8 },
  { id: "3", name: "Delivery", color: "#F59E0B", vehicleCount: 15 },
  { id: "4", name: "Express", color: "#8B5CF6", vehicleCount: 22 },
  { id: "5", name: "Ejecutivo", color: "#EF4444", vehicleCount: 6 },
  { id: "6", name: "Económico", color: "#06B6D4", vehicleCount: 9 },
  { id: "7", name: "Premium", color: "#EC4899", vehicleCount: 4 },
  { id: "8", name: "Carga", color: "#F97316", vehicleCount: 7 },
  { id: "9", name: "Pasajeros", color: "#84CC16", vehicleCount: 11 },
  { id: "10", name: "Guadalajara", color: "#6366F1", vehicleCount: 5 },
  { id: "11", name: "Ciudad de México", color: "#14B8A6", vehicleCount: 18 },
  { id: "12", name: "Monterrey", color: "#F43F5E", vehicleCount: 7 },
  { id: "13", name: "Puebla", color: "#A855F7", vehicleCount: 3 },
  { id: "14", name: "Tijuana", color: "#059669", vehicleCount: 6 },
  { id: "15", name: "Urgente", color: "#DC2626", vehicleCount: 2 },
  { id: "16", name: "Mantenimiento", color: "#9CA3AF", vehicleCount: 4 },
  { id: "17", name: "Nuevo", color: "#22C55E", vehicleCount: 8 },
  { id: "18", name: "En Reparación", color: "#EAB308", vehicleCount: 3 }
]

export function EtiquetasSelectorInput({ 
  selectedTags, 
  onSelectionChange, 
  placeholder = "Seleccionar etiquetas",
  className = ""
}: EtiquetasSelectorInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  
  // Render pills with max 3 visible, each with its own color and X button
  const renderDisplayContent = () => {
    if (selectedTags.length === 0) {
      return <span className="text-gray-500">{placeholder}</span>
    }

    const maxVisible = 3
    const visibleTags = selectedTags.slice(0, maxVisible)
    const remainingCount = selectedTags.length - maxVisible

    return (
      <div className="flex items-center gap-1 flex-wrap">
        {visibleTags.map((tag) => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[12px] text-white border max-w-[120px]"
            style={{ backgroundColor: tag.color }}
          >
            <span className="truncate">{tag.name}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                const newSelection = selectedTags.filter(selected => selected.id !== tag.id)
                onSelectionChange(newSelection)
              }}
              className="ml-1 hover:bg-black/20 rounded-full p-0.5 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        {remainingCount > 0 && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[12px] bg-gray-200 text-gray-600 border">
            +{remainingCount}
          </span>
        )}
      </div>
    )
  }

  const filteredTags = mockTags.filter(tag =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className={`w-full ${className}`}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <div
              className="w-full min-h-[40px] px-3 py-1.5 text-[14px] border border-gray-300 rounded-md bg-white appearance-none pr-8 cursor-pointer text-gray-900 flex items-center"
              onClick={() => setIsOpen(true)}
            >
              {renderDisplayContent()}
            </div>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
          </div>
        </PopoverTrigger>
        
        <PopoverContent className="w-full p-0" align="start">
          <div className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[14px] font-medium text-gray-900">Etiquetas de unidades</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Divider below title */}
            <div className="border-t border-gray-200 -mx-4 mb-4"></div>

            {/* Search */}
            <div className="flex items-center gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar etiquetas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-9"
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onSelectionChange([])
                  setSearchTerm("")
                }}
                className="text-[12px] text-blue-600 hover:text-blue-800 h-9 px-3 whitespace-nowrap"
                disabled={selectedTags.length === 0}
              >
                Limpiar
              </Button>
            </div>

            {/* Items List */}
            <div className="max-h-64 overflow-y-auto">
              {filteredTags.length === 0 ? (
                <div className="flex items-center justify-center h-20 text-[14px] text-gray-500">
                  {searchTerm ? "No se encontraron etiquetas" : "No hay etiquetas disponibles"}
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredTags.map((tag) => {
                    const isSelected = selectedTags.some(selected => selected.id === tag.id)
                    return (
                      <div
                        key={tag.id}
                        className={`flex items-center justify-between py-0.5 px-3 rounded cursor-pointer transition-colors ${
                          isSelected 
                            ? 'bg-blue-50 border border-blue-200' 
                            : 'hover:bg-gray-50 border border-transparent'
                        }`}
                        onClick={() => {
                          if (isSelected) {
                            onSelectionChange(selectedTags.filter(selected => selected.id !== tag.id))
                          } else {
                            onSelectionChange([...selectedTags, tag])
                          }
                        }}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div 
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: tag.color }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className={`text-[14px] truncate ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                              {tag.name}
                            </div>
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
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}