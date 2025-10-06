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
const PAGE_SIZE = 8

export function VehicleSelector({ isOpen, onClose, selectedVehicles, onSelectionChange }: VehicleSelectorProps) {
  const [searchLeft, setSearchLeft] = useState("")
  const [searchRight, setSearchRight] = useState("")
  const [tempSelected, setTempSelected] = useState<Vehicle[]>(selectedVehicles)
  const [leftPage, setLeftPage] = useState(0)
  const [rightPage, setRightPage] = useState(0)

  useEffect(() => {
    if (isOpen) {
      const validVehicles = (selectedVehicles || []).filter(v => v && v.id && v.name)
      setTempSelected(validVehicles)
      setSearchLeft("")
      setSearchRight("")
      setLeftPage(0)
      setRightPage(0)
    }
  }, [isOpen, selectedVehicles])

  const availableVehicles = useMemo(
    () => mockVehicles.filter(vehicle => !tempSelected.some(selected => selected.id === vehicle.id)),
    [tempSelected]
  )

  const filteredAvailable = useMemo(() => {
    const term = searchLeft.trim().toLowerCase()
    return availableVehicles.filter(vehicle => vehicle?.name?.toLowerCase().includes(term))
  }, [availableVehicles, searchLeft])

  const filteredSelected = useMemo(() => {
    const term = searchRight.trim().toLowerCase()
    return tempSelected.filter(vehicle => vehicle?.name?.toLowerCase().includes(term))
  }, [tempSelected, searchRight])

  const totalAvailablePages = Math.max(1, Math.ceil(filteredAvailable.length / PAGE_SIZE))
  const totalSelectedPages = Math.max(1, Math.ceil(filteredSelected.length / PAGE_SIZE))

  useEffect(() => {
    setLeftPage(prev => Math.min(prev, totalAvailablePages - 1))
  }, [totalAvailablePages])

  useEffect(() => {
    setRightPage(prev => Math.min(prev, totalSelectedPages - 1))
  }, [totalSelectedPages])

  const paginatedAvailable = useMemo(() => {
    const start = leftPage * PAGE_SIZE
    return filteredAvailable.slice(start, start + PAGE_SIZE)
  }, [filteredAvailable, leftPage])

  const paginatedSelected = useMemo(() => {
    const start = rightPage * PAGE_SIZE
    return filteredSelected.slice(start, start + PAGE_SIZE)
  }, [filteredSelected, rightPage])

  const handleToggleAvailable = (vehicle: Vehicle) => {
    if (tempSelected.some(item => item.id === vehicle.id)) return
    if (tempSelected.length >= MAX_SELECTION) return
    setTempSelected(prev => [...prev, vehicle])
  }

  const handleToggleSelected = (vehicle: Vehicle) => {
    setTempSelected(prev => prev.filter(item => item.id !== vehicle.id))
  }

  const handleClearAvailable = () => {
    setSearchLeft("")
    setLeftPage(0)
  }

  const handleClearSelected = () => {
    setTempSelected([])
    setRightPage(0)
  }

  const handleSelectAllAvailable = () => {
    if (tempSelected.length >= MAX_SELECTION) return
    setTempSelected(prev => {
      const remainingSlots = MAX_SELECTION - prev.length
      if (remainingSlots <= 0) return prev
      const toAdd = filteredAvailable.slice(0, remainingSlots)
      return [...prev, ...toAdd]
    })
  }

  const handleDeselectAllSelected = () => {
    setTempSelected([])
  }

  const handleCancel = () => {
    setTempSelected(selectedVehicles)
    setSearchLeft("")
    setSearchRight("")
    setLeftPage(0)
    setRightPage(0)
    onClose()
  }

  const handleContinue = () => {
    onSelectionChange(tempSelected)
    setSearchLeft("")
    setSearchRight("")
    setLeftPage(0)
    setRightPage(0)
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
        style={{ width: "790px", maxWidth: "790px", borderRadius: "8px" }}
        styles={{ body: { padding: 0 } }}
        maskStyle={{ backgroundColor: "rgba(0,0,0,0.4)" }}
      >
        <DialogTitle className="sr-only">Seleccionar unidades</DialogTitle>
        <DialogDescription className="sr-only">
          Selecciona las unidades con las cuales deseas crear el reporte.
        </DialogDescription>

        <div className="flex flex-col" style={{ height: "560px" }}>
          <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b bg-white">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Seleccionar unidades</h2>
              <p className="text-sm text-gray-600 mt-1">
                Selecciona las unidades con las cuales deseas crear el reporte. Elige todas las unidades o solo algunas del total disponible.
                Recuerda que debes seleccionar al menos 1 unidad para continuar.
              </p>
            </div>
            <DialogClose asChild>
              <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500">
                <X className="w-4 h-4" />
              </button>
            </DialogClose>
          </div>

          <div className="flex-1 px-6 py-4 overflow-hidden bg-white">
            <div className="grid grid-cols-2 gap-4 h-full">
              <div className="flex flex-col h-full border border-gray-200 rounded-xl bg-white overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={availableVehicles.length === 0 && tempSelected.length > 0}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          handleSelectAllAvailable()
                        } else {
                          handleDeselectAllSelected()
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium text-gray-700">{mockVehicles.length} Unidades</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleClearAvailable}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Limpiar
                    </button>
                    <span className="text-sm text-gray-500">{availableVehicles.length} disponibles</span>
                  </div>
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
                <div className="flex-1 overflow-hidden px-4 py-3">
                  {filteredAvailable.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-sm text-gray-400">
                      No hay unidades disponibles
                    </div>
                  ) : (
                    <div className="h-full overflow-y-auto rounded-lg border border-gray-200">
                      <ul className="divide-y divide-gray-100">
                      {paginatedAvailable.map(vehicle => (
                        <li
                          key={vehicle.id}
                          className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleToggleAvailable(vehicle)}
                        >
                          <Checkbox
                            checked={false}
                            onCheckedChange={() => handleToggleAvailable(vehicle)}
                            className="w-4 h-4"
                            onClick={(event) => event.stopPropagation()}
                          />
                          <span className="text-[14px] text-gray-700 truncate">{vehicle.name}</span>
                        </li>
                      ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between px-4 py-3 border-t text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setLeftPage(prev => Math.max(0, prev - 1))}
                      className="flex items-center justify-center w-8 h-8 rounded border border-gray-300 text-blue-600 hover:border-blue-500 disabled:text-gray-300 disabled:border-gray-200"
                      disabled={leftPage === 0}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="w-6 text-center text-sm text-gray-700">{Math.min(leftPage + 1, totalAvailablePages)}</span>
                    <button
                      type="button"
                      onClick={() => setLeftPage(prev => Math.min(totalAvailablePages - 1, prev + 1))}
                      className="flex items-center justify-center w-8 h-8 rounded border border-gray-300 text-blue-600 hover:border-blue-500 disabled:text-gray-300 disabled:border-gray-200"
                      disabled={leftPage >= totalAvailablePages - 1}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <span>
                    {filteredAvailable.length === 0
                      ? "0 - 0 Unidades"
                      : `${leftPage * PAGE_SIZE + 1} - ${Math.min((leftPage + 1) * PAGE_SIZE, filteredAvailable.length)} Unidades`
                    }
                  </span>
                </div>
              </div>

              <div className="flex flex-col h-full border border-gray-200 rounded-xl bg-white overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={tempSelected.length > 0}
                      onCheckedChange={(checked) => {
                        if (!checked) {
                          handleDeselectAllSelected()
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium text-gray-700">{tempSelected.length} Seleccionadas</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleClearSelected}
                      className="text-sm text-blue-600 hover:text-blue-800"
                      disabled={tempSelected.length === 0}
                    >
                      Limpiar
                    </button>
                    <span className="text-sm text-gray-500">Máx. {MAX_SELECTION}</span>
                  </div>
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
                <div className="flex-1 overflow-hidden px-4 py-3">
                  {tempSelected.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center gap-3 text-gray-400">
                      <div className="w-16 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Inbox className="w-6 h-6" />
                      </div>
                      <p className="text-sm">No tienes unidades</p>
                    </div>
                  ) : (
                    <div className="h-full overflow-y-auto rounded-lg border border-gray-200">
                      <ul className="divide-y divide-gray-100">
                      {paginatedSelected.map(vehicle => (
                        <li
                          key={vehicle.id}
                          className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleToggleSelected(vehicle)}
                        >
                          <Checkbox
                            checked={true}
                            onCheckedChange={() => handleToggleSelected(vehicle)}
                            className="w-4 h-4"
                            onClick={(event) => event.stopPropagation()}
                          />
                          <span className="text-[14px] text-gray-700 truncate">{vehicle.name}</span>
                        </li>
                      ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between px-4 py-3 border-t text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setRightPage(prev => Math.max(0, prev - 1))}
                      className="flex items-center justify-center w-8 h-8 rounded border border-gray-300 text-blue-600 hover:border-blue-500 disabled:text-gray-300 disabled:border-gray-200"
                      disabled={rightPage === 0}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="w-6 text-center text-sm text-gray-700">{Math.min(rightPage + 1, totalSelectedPages)}</span>
                    <button
                      type="button"
                      onClick={() => setRightPage(prev => Math.min(totalSelectedPages - 1, prev + 1))}
                      className="flex items-center justify-center w-8 h-8 rounded border border-gray-300 text-blue-600 hover:border-blue-500 disabled:text-gray-300 disabled:border-gray-200"
                      disabled={rightPage >= totalSelectedPages - 1}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <span>
                    {tempSelected.length === 0
                      ? "0 - 0 Unidades"
                      : `${rightPage * PAGE_SIZE + 1} - ${Math.min((rightPage + 1) * PAGE_SIZE, filteredSelected.length)} Unidades`
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
            <span className="text-sm text-gray-600">
              Unidades seleccionadas: {tempSelected.length}
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
