import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Checkbox } from "./ui/checkbox"
import { Badge } from "./ui/badge"
import { Search, ChevronDown, X, Tag } from "lucide-react"

interface TagData {
  id: string
  name: string
  color: string
  vehicleCount: number
}

interface EtiquetasSelectorProps {
  selectedTags: TagData[]
  onSelectionChange: (tags: TagData[]) => void
  showError?: boolean
}

const mockTags: TagData[] = [
  { id: "1", name: "Flota Norte", color: "#3B82F6", vehicleCount: 12 },
  { id: "2", name: "Flota Sur", color: "#10B981", vehicleCount: 8 },
  { id: "3", name: "Delivery", color: "#F59E0B", vehicleCount: 15 },
  { id: "4", name: "Transporte", color: "#8B5CF6", vehicleCount: 22 },
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

export function EtiquetasSelector({ selectedTags, onSelectionChange, showError = false }: EtiquetasSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredTags = mockTags.filter(tag => 
    tag.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleTagToggle = (tag: TagData) => {
    const isSelected = selectedTags.some(selected => selected.id === tag.id)
    if (isSelected) {
      onSelectionChange(selectedTags.filter(t => t.id !== tag.id))
    } else {
      onSelectionChange([...selectedTags, tag])
    }
  }

  const handleSelectAll = () => {
    onSelectionChange(filteredTags)
  }

  const handleClearAll = () => {
    onSelectionChange([])
    setSearchTerm("")
  }

  const getDisplayText = () => {
    const count = selectedTags.length
    if (count === 0) return "Seleccionar etiqueta"
    if (count === 1) return "1 Etiqueta"
    return `${count} Etiquetas`
  }

  const handleApply = () => {
    setIsOpen(false)
    setSearchTerm("")
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Badge 
          variant="secondary" 
          className={`${
            selectedTags.length > 0 
              ? 'bg-blue-50 text-blue-700 border-blue-200' 
              : showError 
                ? 'bg-red-50 text-red-700 border-red-200' 
                : 'bg-gray-50 text-gray-700 border-gray-200'
          } px-3 flex items-center gap-1 cursor-pointer hover:bg-blue-100 whitespace-nowrap text-[12px] box-border`}
          style={{ height: 32 }}
        >
          <Tag className={`w-4 h-4 ${
            selectedTags.length > 0 
              ? 'text-blue-600' 
              : showError 
                ? 'text-red-600' 
                : 'text-gray-600'
          }`} />
          <span>Etiquetas: {getDisplayText()}</span>
          <ChevronDown className="w-3 h-4 ml-1" />
        </Badge>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="flex flex-col max-h-[400px]">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-900">Seleccionar etiquetas</h4>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAll}
                  className="text-xs text-blue-600 hover:text-blue-800 h-6 px-2"
                >
                  Todos
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAll}
                  className="text-xs text-blue-600 hover:text-blue-800 h-6 px-2"
                >
                  Limpiar
                </Button>
              </div>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar etiquetas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-8 text-sm"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>

          {/* Selected Tags Display */}
          {selectedTags.length > 0 && (
            <div key="selected-tags-section" className="p-3 border-b border-gray-100 bg-blue-50">
              <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                {selectedTags.map((tag) => (
                  <div
                    key={`selected-${tag.id}`}
                    className="text-xs bg-blue-100 text-blue-800 px-2 py-1 h-6 rounded flex items-center gap-1"
                  >
                    <div 
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="truncate max-w-[80px]">{tag.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags List */}
          <div className="flex-1 overflow-y-auto">
            {filteredTags.length > 0 ? (
              <div className="p-2">
                {filteredTags.map((tag) => {
                  const isSelected = selectedTags.some(selected => selected.id === tag.id)
                  return (
                    <div 
                      key={`filter-${tag.id}`} 
                      className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-md cursor-pointer"
                      onClick={() => handleTagToggle(tag)}
                    >
                      <Checkbox
                        checked={isSelected}
                        onChange={() => handleTagToggle(tag)}
                        className="w-4 h-4"
                      />
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div 
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: tag.color }}
                        />
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-sm font-medium truncate">{tag.name}</span>
                          <span className="text-xs text-gray-500">
                            {tag.vehicleCount} vehículo{tag.vehicleCount !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No se encontraron etiquetas con "{searchTerm}"</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">
                {selectedTags.length} de {filteredTags.length} seleccionadas
              </span>
              <Button
                onClick={handleApply}
                size="sm"
                className="h-7 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white"
              >
                Aplicar
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
