import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Checkbox } from "./ui/checkbox"
import { Search, ChevronLeft, ChevronRight, MapPin } from "lucide-react"

interface Zone {
  id: string
  name: string
  type: string
  description?: string
}

interface ZoneSelectorProps {
  isOpen: boolean
  onClose: () => void
  selectedZones: Zone[]
  onSelectionChange: (zones: Zone[]) => void
}

const mockZones: Zone[] = [
  { id: "1", name: "Zona A", type: "Ciudad", description: "Zona metropolitana" },
  { id: "2", name: "Centro", type: "Comercial", description: "Centro comercial" },
  { id: "3", name: "Norte", type: "Ruta", description: "Ruta de distribución" },
  { id: "4", name: "Industrial", type: "Industrial", description: "Área industrial" },
  { id: "5", name: "Centro Histórico", type: "Urbana", description: "Zona histórica" },
  { id: "6", name: "Aeropuerto", type: "Transporte", description: "Terminal aérea" },
  { id: "7", name: "Puerto", type: "Transporte", description: "Terminal portuaria" },
  { id: "8", name: "Almacén Principal", type: "Logística", description: "Centro de distribución" },
  { id: "9", name: "Sucursal Norte", type: "Comercial", description: "Punto de venta" },
  { id: "10", name: "Taller Central", type: "Mantenimiento", description: "Centro de servicio" }
]

export function ZoneSelector({ isOpen, onClose, selectedZones, onSelectionChange }: ZoneSelectorProps) {
  const [searchLeft, setSearchLeft] = useState("")
  const [searchRight, setSearchRight] = useState("")
  const [tempSelected, setTempSelected] = useState<Zone[]>(selectedZones)

  // Reset temp selected when modal opens with new selectedZones
  useEffect(() => {
    if (isOpen) {
      // Filter out any invalid zones to prevent undefined errors
      const validZones = (selectedZones || []).filter(z => z && z.id && z.name)
      setTempSelected(validZones)
      setSearchLeft("")
      setSearchRight("")
    }
  }, [isOpen, selectedZones])

  const availableZones = mockZones.filter(zone => 
    zone && zone.id && !tempSelected.some(selected => selected?.id === zone.id)
  )

  const filteredAvailable = availableZones.filter(zone => 
    zone?.name?.toLowerCase().includes(searchLeft.toLowerCase())
  )

  const filteredSelected = tempSelected.filter(zone => 
    zone?.name?.toLowerCase().includes(searchRight.toLowerCase())
  )

  const handleZoneToggle = (zone: Zone, isSelected: boolean) => {
    if (isSelected) {
      setTempSelected(prev => prev.filter(z => z.id !== zone.id))
    } else {
      setTempSelected(prev => [...prev, zone])
    }
  }

  const handleClearAvailable = () => {
    setSearchLeft("")
  }

  const handleClearSelected = () => {
    setTempSelected([])
  }

  const handleSelectAllAvailable = () => {
    // Add all available zones to selection
    setTempSelected(prev => {
      const newSelected = [...prev]
      availableZones.forEach(zone => {
        if (!newSelected.some(selected => selected.id === zone.id)) {
          newSelected.push(zone)
        }
      })
      return newSelected
    })
  }

  const handleDeselectAllSelected = () => {
    // Remove all selected zones
    setTempSelected([])
  }

  // Check if all available zones are selected
  const allAvailableSelected = availableZones.length > 0 && availableZones.every(zone => 
    tempSelected.some(selected => selected.id === zone.id)
  )

  // Check if all selected zones should be checked (always true for selected column)
  const allSelectedChecked = tempSelected.length > 0

  const handleCancel = () => {
    setTempSelected(selectedZones)
    setSearchLeft("")
    setSearchRight("")
    onClose()
  }

  const handleContinue = () => {
    // Apply the selection changes
    onSelectionChange(tempSelected)
    setSearchLeft("")
    setSearchRight("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        // Reset temp state when closing without saving
        setTempSelected(selectedZones)
      }
      onClose()
    }}>
      <DialogContent className="h-[600px] p-0 flex flex-col" style={{ width: '800px', maxWidth: '800px' }}>
        <DialogTitle className="sr-only">Seleccionar zonas</DialogTitle>
        <DialogDescription className="sr-only">
          Interfaz para seleccionar las zonas geográficas necesarias para la regla. Permite elegir entre todas las zonas disponibles o solo algunas específicas.
        </DialogDescription>
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl mb-2">Seleccionar zonas</h2>
            <p className="text-sm text-gray-600">
              Selecciona las zonas geográficas donde debe aplicarse la regla. Elige todas las zonas o solo 
              algunas del total disponible. Recuerda que debes seleccionar al menos 1 zona para continuar.
            </p>
          </div>
          
        </div>

        {/* Content */}
        <div className="flex-1 px-6 py-4 overflow-hidden">
          <div className="grid grid-cols-2 gap-6 h-full">
            {/* Available Zones - Left Column */}
            <div className="flex flex-col space-y-4 h-full">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox 
                    checked={allAvailableSelected} 
                    onCheckedChange={(checked) => {
                      if (checked) {
                        handleSelectAllAvailable()
                      } else {
                        // Don't deselect all, just clear the search to show all available
                        setSearchLeft("")
                      }
                    }}
                    className="w-4 h-4" 
                  />
                  <span className="text-sm">{availableZones.length} Zonas</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleClearAvailable} 
                  className="text-blue-600 hover:text-blue-800 text-sm p-0 h-auto"
                >
                  Limpiar
                </Button>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar Zonas"
                  value={searchLeft}
                  onChange={(e) => setSearchLeft(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>

              <div className="border rounded-lg flex-1 overflow-hidden">
                <div className="h-full overflow-y-auto">
                  <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
                    {filteredAvailable.map((zone) => (
                      <div key={zone.id} className="flex items-center gap-3 hover:bg-gray-50 p-1 rounded">
                        <Checkbox
                          checked={false}
                          onCheckedChange={() => handleZoneToggle(zone, false)}
                          className="w-4 h-4"
                        />
                        <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium">{zone?.name || 'Sin nombre'}</div>
                          <div className="text-xs text-gray-500">{zone?.type}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="w-8 h-8 p-0" disabled>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span>1</span>
                  <Button variant="outline" size="sm" className="w-8 h-8 p-0" disabled>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  <span className="ml-3">0 - {availableZones.length} Zonas</span>
                </div>
              </div>
            </div>

            {/* Selected Zones - Right Column */}
            <div className="flex flex-col space-y-4 h-full">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox 
                    checked={allSelectedChecked} 
                    onCheckedChange={(checked) => {
                      if (!checked) {
                        handleDeselectAllSelected()
                      }
                      // If checking, we don't need to do anything special since all items are already selected in this column
                    }}
                    className="w-4 h-4" 
                  />
                  <span className="text-sm">{tempSelected.length} Seleccionadas</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleClearSelected} 
                  className="text-blue-600 hover:text-blue-800 text-sm p-0 h-auto"
                >
                  Limpiar
                </Button>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar Zonas"
                  value={searchRight}
                  onChange={(e) => setSearchRight(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>

              <div className="border rounded-lg flex-1 overflow-hidden">
                {tempSelected.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <div className="w-16 h-12 bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                      <MapPin className="w-8 h-6 text-gray-300" />
                    </div>
                    <p className="text-sm">No tienes zonas</p>
                  </div>
                ) : (
                  <div className="h-full overflow-y-auto">
                    <div className="p-4 space-y-3">
                      {filteredSelected.map((zone) => (
                        <div key={zone.id} className="flex items-center gap-3 hover:bg-gray-50 p-1 rounded">
                          <Checkbox
                            checked={true}
                            onCheckedChange={() => handleZoneToggle(zone, true)}
                            className="w-4 h-4"
                          />
                          <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium">{zone?.name || 'Sin nombre'}</div>
                            <div className="text-xs text-gray-500">{zone?.type}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="w-8 h-8 p-0" disabled>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span>1</span>
                  <Button variant="outline" size="sm" className="w-8 h-8 p-0" disabled>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  <span className="ml-3">1 - {tempSelected.length} Zonas</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t">
          <span className="text-sm">Zonas seleccionadas : {tempSelected.length}</span>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button 
              onClick={handleContinue}
              className={`${tempSelected.length === 0 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
              disabled={tempSelected.length === 0}
            >
              Continuar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}