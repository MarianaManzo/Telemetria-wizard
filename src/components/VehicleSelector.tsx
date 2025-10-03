import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Checkbox } from "./ui/checkbox"
import { Search, ChevronLeft, ChevronRight, X } from "lucide-react"

interface Vehicle {
  id: string
  name: string
}

interface VehicleSelectorProps {
  isOpen: boolean
  onClose: () => void
  selectedVehicles: Vehicle[]
  onSelectionChange: (vehicles: Vehicle[]) => void
}

const mockVehicles: Vehicle[] = [
  { id: "1", name: "Cagsa6" },
  { id: "2", name: "Isuzu 92" },
  { id: "3", name: "Cagsa8" },
  { id: "4", name: "Vector 85" },
  { id: "25", name: "DRM Leasing2" },
  { id: "26", name: "Toyota 30" },
  { id: "5", name: "Unidad de Reparto GDL" },
  { id: "6", name: "Unidad de Reparto CDMX" },
  { id: "7", name: "Unidad de Reparto GTO" },
  { id: "8", name: "Unidad de Reparto Querétaro" },
  { id: "9", name: "Unidad de Reparto Chiapas" },
  { id: "10", name: "Toyota Camry Flota 1" },
  { id: "11", name: "Ford Transit 2023" },
  { id: "12", name: "Mercedes Sprinter" },
  { id: "13", name: "Chevrolet Express" },
  { id: "14", name: "Nissan NV200" },
  { id: "15", name: "Volkswagen Crafter" },
  { id: "16", name: "Iveco Daily" },
  { id: "17", name: "Renault Master" },
  { id: "18", name: "Peugeot Boxer" },
  { id: "19", name: "Fiat Ducato" },
  { id: "20", name: "RAM ProMaster" },
  { id: "21", name: "Mitsubishi Fuso" },
  { id: "22", name: "Norte-022" },
  { id: "23", name: "Sur-023" }
]

export function VehicleSelector({ isOpen, onClose, selectedVehicles, onSelectionChange }: VehicleSelectorProps) {
  const [searchLeft, setSearchLeft] = useState("")
  const [searchRight, setSearchRight] = useState("")
  const [tempSelected, setTempSelected] = useState<Vehicle[]>(selectedVehicles)

  // Reset temp selected when modal opens with new selectedVehicles
  useEffect(() => {
    if (isOpen) {
      // Filter out any invalid vehicles to prevent undefined errors
      const validVehicles = (selectedVehicles || []).filter(v => v && v.id && v.name)
      setTempSelected(validVehicles)
      setSearchLeft("")
      setSearchRight("")
    }
  }, [isOpen, selectedVehicles])

  const availableVehicles = mockVehicles.filter(vehicle => 
    vehicle && vehicle.id && !tempSelected.some(selected => selected?.id === vehicle.id)
  )

  const filteredAvailable = availableVehicles.filter(vehicle => 
    vehicle?.name?.toLowerCase().includes(searchLeft.toLowerCase())
  )

  const filteredSelected = tempSelected.filter(vehicle => 
    vehicle?.name?.toLowerCase().includes(searchRight.toLowerCase())
  )

  const handleVehicleToggle = (vehicle: Vehicle, isSelected: boolean) => {
    if (isSelected) {
      setTempSelected(prev => prev.filter(v => v.id !== vehicle.id))
    } else {
      setTempSelected(prev => [...prev, vehicle])
    }
  }

  const handleClearAvailable = () => {
    setSearchLeft("")
  }

  const handleClearSelected = () => {
    setTempSelected([])
  }

  const handleSelectAllAvailable = () => {
    // Add all available vehicles to selection
    setTempSelected(prev => {
      const newSelected = [...prev]
      availableVehicles.forEach(vehicle => {
        if (!newSelected.some(selected => selected.id === vehicle.id)) {
          newSelected.push(vehicle)
        }
      })
      return newSelected
    })
  }

  const handleDeselectAllSelected = () => {
    // Remove all selected vehicles
    setTempSelected([])
  }

  // Check if all available vehicles are selected
  const allAvailableSelected = availableVehicles.length > 0 && availableVehicles.every(vehicle => 
    tempSelected.some(selected => selected.id === vehicle.id)
  )

  // Check if all selected vehicles should be checked (always true for selected column)
  const allSelectedChecked = tempSelected.length > 0

  const handleCancel = () => {
    setTempSelected(selectedVehicles)
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
        setTempSelected(selectedVehicles)
      }
      onClose()
    }}>
      <DialogContent className="h-[600px] p-0 flex flex-col" style={{ width: '800px', maxWidth: '800px' }}>
        <DialogTitle className="sr-only">Seleccionar unidades</DialogTitle>
        <DialogDescription className="sr-only">
          Interfaz para seleccionar las unidades vehiculares necesarias para generar el reporte. Permite elegir entre todas las unidades disponibles o solo algunas específicas.
        </DialogDescription>
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl mb-2">Seleccionar unidades</h2>
            <p className="text-sm text-gray-600">
              Selecciona las unidades con las cuales deseas crear el reporte. Elige todas las unidades o solo 
              algunas del total disponible. Recuerda que debes seleccionar al menos 1 unidad para continuar.
            </p>
          </div>
          
        </div>

        {/* Content */}
        <div className="flex-1 px-6 py-4 overflow-hidden">
          <div className="grid grid-cols-2 gap-6 h-full">
            {/* Available Vehicles - Left Column */}
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
                  <span className="text-sm">{availableVehicles.length} Unidades</span>
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
                  placeholder="Buscar Unidades"
                  value={searchLeft}
                  onChange={(e) => setSearchLeft(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>

              <div className="border rounded-lg flex-1 overflow-hidden">
                <div className="h-full overflow-y-auto">
                  <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
                    {filteredAvailable.map((vehicle) => (
                      <div key={vehicle.id} className="flex items-center gap-3 hover:bg-gray-50 p-1 rounded">
                        <Checkbox
                          checked={false}
                          onCheckedChange={() => handleVehicleToggle(vehicle, false)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">{vehicle?.name || 'Sin nombre'}</span>
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
                  <span className="ml-3">0 - {availableVehicles.length} Unidades</span>
                </div>
              </div>
            </div>

            {/* Selected Vehicles - Right Column */}
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
                  placeholder="Buscar Unidades"
                  value={searchRight}
                  onChange={(e) => setSearchRight(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>

              <div className="border rounded-lg flex-1 overflow-hidden">
                {tempSelected.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <div className="w-16 h-12 bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                      <div className="w-8 h-6 bg-gray-200 rounded"></div>
                    </div>
                    <p className="text-sm">No tienes unidades</p>
                  </div>
                ) : (
                  <div className="h-full overflow-y-auto">
                    <div className="p-4 space-y-3">
                      {filteredSelected.map((vehicle) => (
                        <div key={vehicle.id} className="flex items-center gap-3 hover:bg-gray-50 p-1 rounded">
                          <Checkbox
                            checked={true}
                            onCheckedChange={() => handleVehicleToggle(vehicle, true)}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">{vehicle?.name || 'Sin nombre'}</span>
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
                  <span className="ml-3">1 - {tempSelected.length} Unidades</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t">
          <span className="text-sm">Unidades seleccionadas : {tempSelected.length}</span>
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