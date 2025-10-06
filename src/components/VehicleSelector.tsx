import { useState, useEffect, useMemo } from "react"
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Checkbox } from "./ui/checkbox"
import { Search, ChevronLeft, ChevronRight, X, Inbox } from "lucide-react"

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

const MAX_SELECTION = 10

export function VehicleSelector({ isOpen, onClose, selectedVehicles, onSelectionChange }: VehicleSelectorProps) {
  const [searchLeft, setSearchLeft] = useState("")
  const [searchRight, setSearchRight] = useState("")
  const [tempSelected, setTempSelected] = useState<Vehicle[]>(selectedVehicles)
  const [leftSelection, setLeftSelection] = useState<string[]>([])
  const [rightSelection, setRightSelection] = useState<string[]>([])

  useEffect(() => {
    if (isOpen) {
      const validVehicles = (selectedVehicles || []).filter(v => v && v.id && v.name)
      setTempSelected(validVehicles)
      setSearchLeft("")
      setSearchRight("")
      setLeftSelection([])
      setRightSelection([])
    }
  }, [isOpen, selectedVehicles])

  const availableVehicles = useMemo(
    () => mockVehicles.filter(vehicle => !tempSelected.some(selected => selected.id === vehicle.id)),
    [tempSelected]
  )

  const filteredAvailable = useMemo(
    () => availableVehicles.filter(vehicle => vehicle?.name?.toLowerCase().includes(searchLeft.toLowerCase())),
    [availableVehicles, searchLeft]
  )

  const filteredSelected = useMemo(
    () => tempSelected.filter(vehicle => vehicle?.name?.toLowerCase().includes(searchRight.toLowerCase())),
    [tempSelected, searchRight]
  )

  useEffect(() => {
    setLeftSelection(prev => prev.filter(id => availableVehicles.some(vehicle => vehicle.id === id)))
  }, [availableVehicles])

  useEffect(() => {
    setRightSelection(prev => prev.filter(id => tempSelected.some(vehicle => vehicle.id === id)))
  }, [tempSelected])

  const toggleLeftSelection = (id: string) => {
    setLeftSelection(prev => (prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]))
  }

  const toggleRightSelection = (id: string) => {
    setRightSelection(prev => (prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]))
  }

  const moveSelectedToRight = () => {
    if (leftSelection.length === 0) return

    setTempSelected(prev => {
      const newSelected = [...prev]
      const remaining: string[] = []

      leftSelection.forEach(id => {
        if (newSelected.length >= MAX_SELECTION) {
          remaining.push(id)
          return
        }

        if (!newSelected.some(vehicle => vehicle.id === id)) {
          const vehicle = mockVehicles.find(item => item.id === id)
          if (vehicle) {
            newSelected.push(vehicle)
          }
        }
      })

      setLeftSelection(remaining)
      return newSelected
    })
  }

  const moveSelectedToLeft = () => {
    if (rightSelection.length === 0) return

    setTempSelected(prev => prev.filter(vehicle => !rightSelection.includes(vehicle.id)))
    setRightSelection([])
  }

  const handleCancel = () => {
    setTempSelected(selectedVehicles)
    setLeftSelection([])
    setRightSelection([])
    setSearchLeft("")
    setSearchRight("")
    onClose()
  }

  const handleContinue = () => {
    onSelectionChange(tempSelected)
    setSearchLeft("")
    setSearchRight("")
    setLeftSelection([])
    setRightSelection([])
    onClose()
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          handleCancel()
        }
      }}
    >
      <DialogContent
        className="flex flex-col"
        style={{ width: "860px", maxWidth: "860px" }}
        styles={{ body: { padding: 0 } }}
      >
        <DialogTitle className="sr-only">Compartir unidades</DialogTitle>
        <DialogDescription className="sr-only">
          Elige las unidades cuya ubicación deseas compartir.
        </DialogDescription>

        <div className="flex flex-col h-[560px]">
          <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Compartir unidades</h2>
              <p className="text-sm text-gray-600 mt-1">
                Elige las unidades cuya ubicación deseas compartir. Recuerda elegir al menos 1 para continuar.
              </p>
            </div>
            <DialogClose asChild>
              <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500">
                <X className="w-4 h-4" />
              </button>
            </DialogClose>
          </div>

          <div className="flex-1 px-6 py-4 overflow-hidden">
            <div className="grid grid-cols-[1fr_auto_1fr] gap-4 h-full">
              <div className="flex flex-col h-full border border-gray-200 rounded-xl bg-white overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b">
                  <h3 className="text-sm font-medium text-gray-700">Unidades</h3>
                  <span className="text-sm text-gray-500">{leftSelection.length}/{availableVehicles.length}</span>
                </div>
                <div className="px-4 py-3 border-b">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Buscar Unidades"
                      value={searchLeft}
                      onChange={(e) => setSearchLeft(e.target.value)}
                      className="pl-9 h-10 text-[14px]"
                    />
                  </div>
                </div>
                <div className="flex-1 overflow-hidden">
                  {filteredAvailable.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-sm text-gray-400">
                      No hay unidades disponibles
                    </div>
                  ) : (
                    <ul className="h-full overflow-y-auto divide-y divide-gray-100">
                      {filteredAvailable.map(vehicle => (
                        <li
                          key={vehicle.id}
                          className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer"
                          onClick={() => toggleLeftSelection(vehicle.id)}
                        >
                          <Checkbox
                            checked={leftSelection.includes(vehicle.id)}
                            onCheckedChange={() => toggleLeftSelection(vehicle.id)}
                            className="w-4 h-4"
                            onClick={(event) => event.stopPropagation()}
                          />
                          <span className="text-[14px] text-gray-700 truncate">{vehicle.name}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-center justify-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="w-10 h-10"
                  onClick={moveSelectedToRight}
                  disabled={leftSelection.length === 0 || tempSelected.length >= MAX_SELECTION}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="w-10 h-10"
                  onClick={moveSelectedToLeft}
                  disabled={rightSelection.length === 0}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex flex-col h-full border border-gray-200 rounded-xl bg-white overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b">
                  <h3 className="text-sm font-medium text-gray-700">Unidades a compartir</h3>
                  <span className="text-sm text-gray-500">{tempSelected.length}/{MAX_SELECTION}</span>
                </div>
                <div className="px-4 py-3 border-b">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Buscar Unidades"
                      value={searchRight}
                      onChange={(e) => setSearchRight(e.target.value)}
                      className="pl-9 h-10 text-[14px]"
                    />
                  </div>
                </div>
                <div className="flex-1 overflow-hidden">
                  {tempSelected.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center gap-3 text-gray-400">
                      <div className="w-16 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Inbox className="w-6 h-6" />
                      </div>
                      <p className="text-sm">No tienes unidades</p>
                    </div>
                  ) : (
                    <ul className="h-full overflow-y-auto divide-y divide-gray-100">
                      {filteredSelected.map(vehicle => (
                        <li
                          key={vehicle.id}
                          className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer"
                          onClick={() => toggleRightSelection(vehicle.id)}
                        >
                          <Checkbox
                            checked={rightSelection.includes(vehicle.id)}
                            onCheckedChange={() => toggleRightSelection(vehicle.id)}
                            className="w-4 h-4"
                            onClick={(event) => event.stopPropagation()}
                          />
                          <span className="text-[14px] text-gray-700 truncate">{vehicle.name}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
            <span className="text-sm text-gray-600">
              Unidades a compartir: {tempSelected.length} (Máx. {MAX_SELECTION})
            </span>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button
                onClick={handleContinue}
                disabled={tempSelected.length === 0}
                className="bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
              >
                Continuar
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
