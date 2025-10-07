import { useState } from "react"
import { VehicleSelector } from "./VehicleSelector"
import { ChevronDown } from "lucide-react"

interface UnidadData {
  id: string
  name: string
  status: string
  vehicleType: string
}

interface UnidadesSelectorInputProps {
  selectedUnits: UnidadData[]
  onSelectionChange: (units: UnidadData[]) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

// Generate the complete mock units array without runtime modification
const generateMockUnits = (): UnidadData[] => {
  const baseUnits: UnidadData[] = [
    { id: "1", name: "Cagsa6", status: "Activo", vehicleType: "Camión" },
    { id: "2", name: "Isuzu 92", status: "Activo", vehicleType: "Van" },
    { id: "3", name: "Cagsa8", status: "Activo", vehicleType: "SUV" },
    { id: "4", name: "Vector 85", status: "Activo", vehicleType: "Camión" },
    { id: "25", name: "DRM Leasing2", status: "Activo", vehicleType: "Van" },
    { id: "26", name: "Toyota 30", status: "Activo", vehicleType: "SUV" },
    { id: "5", name: "Unidad de Reparto GDL", status: "Mantenimiento", vehicleType: "Van" },
    { id: "6", name: "Unidad de Reparto CDMX", status: "Activo", vehicleType: "SUV" },
    { id: "7", name: "Unidad de Reparto GTO", status: "Activo", vehicleType: "Camión" },
    { id: "8", name: "Unidad de Reparto Querétaro", status: "Activo", vehicleType: "Van" },
    { id: "9", name: "Unidad de Reparto Chiapas", status: "Inactivo", vehicleType: "SUV" },
    { id: "10", name: "Toyota Camry Flota 1", status: "Activo", vehicleType: "Camión" },
    { id: "11", name: "Ford Transit 2023", status: "Activo", vehicleType: "Refrigerado" },
    { id: "12", name: "Mercedes Sprinter", status: "Activo", vehicleType: "Van" },
    { id: "13", name: "Chevrolet Express", status: "Activo", vehicleType: "Moto" },
    { id: "14", name: "Nissan NV200", status: "Activo", vehicleType: "Moto" },
    { id: "15", name: "Volkswagen Crafter", status: "Activo", vehicleType: "Camión" },
    { id: "16", name: "Iveco Daily", status: "Mantenimiento", vehicleType: "Van" },
    { id: "17", name: "Renault Master", status: "Activo", vehicleType: "Camión" },
    { id: "18", name: "Peugeot Boxer", status: "Activo", vehicleType: "Camión" },
    { id: "19", name: "Fiat Ducato", status: "Activo", vehicleType: "SUV" },
    { id: "20", name: "RAM ProMaster", status: "Activo", vehicleType: "SUV" },
    { id: "21", name: "Mitsubishi Fuso", status: "Activo", vehicleType: "Camión" }
  ]

  // Add additional units
  const types = ["Camión", "Van", "SUV", "Moto", "Refrigerado"]
  const zones = ["Norte", "Sur", "Centro", "Oeste", "Este"]
  const statuses = ["Activo", "Activo", "Activo", "Mantenimiento", "Inactivo"] // Más probabilidad de activo
  
  for (let i = 22; i <= 23; i++) {
    baseUnits.push({
      id: i.toString(),
      name: `${zones[i % zones.length]}-${String(i).padStart(3, '0')}`,
      status: statuses[i % statuses.length],
      vehicleType: types[i % types.length]
    })
  }

  return baseUnits
}

const mockUnits: UnidadData[] = generateMockUnits()

export function UnidadesSelectorInput({ 
  selectedUnits, 
  onSelectionChange, 
  placeholder = "Seleccionar unidades",
  className = "",
  disabled = false
}: UnidadesSelectorInputProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Render pills with max 3 visible
  const renderDisplayContent = () => {
    if (selectedUnits.length === 0) {
      return <span className="text-gray-500">{placeholder}</span>
    }

    const maxVisible = 3
    const visibleUnits = selectedUnits.slice(0, maxVisible)
    const remainingCount = selectedUnits.length - maxVisible

    return (
      <div className="flex items-center gap-1 flex-wrap">
        {visibleUnits.map((unit) => (
          <span
            key={unit.id}
            className="inline-flex items-center px-2 py-0.5 rounded-md text-[12px] bg-gray-100 text-gray-800 border max-w-[120px]"
          >
            <span className="truncate">{unit.name}</span>
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

  // Convert UnidadData to Vehicle format for VehicleSelector
  const vehiclesForSelector = mockUnits.map(unit => ({
    id: unit.id,
    name: unit.name
  }))

  const selectedVehicles = selectedUnits.map(unit => ({
    id: unit.id,
    name: unit.name
  }))

  const handleSelectionChange = (vehicles: { id: string; name: string }[]) => {
    // Convert back to UnidadData format
    const selectedUnitsData = vehicles.map(vehicle => {
      const originalUnit = mockUnits.find(unit => unit.id === vehicle.id)
      return originalUnit || {
        id: vehicle.id,
        name: vehicle.name,
        status: "Activo",
        vehicleType: "Camión"
      }
    })
    onSelectionChange(selectedUnitsData)
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="relative">
        <div
          className={`w-full min-h-[40px] px-3 py-1.5 text-[14px] border border-gray-300 rounded-md bg-white appearance-none pr-8 cursor-pointer text-gray-900 flex items-center ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          onClick={() => !disabled && setIsModalOpen(true)}
        >
          {renderDisplayContent()}
        </div>
        <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
      </div>

      <VehicleSelector
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedVehicles={selectedVehicles}
        onSelectionChange={handleSelectionChange}
        disabled={disabled}
      />
    </div>
  )
}