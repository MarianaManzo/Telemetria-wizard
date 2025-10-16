import { useState } from "react"
import { ZoneSelector } from "./ZoneSelector"
import { DownOutlined } from "@ant-design/icons"

interface ZoneData {
  id: string
  name: string
  type: string
  description?: string
}

interface ZonasSelectorInputProps {
  selectedZones: ZoneData[]
  onSelectionChange: (zones: ZoneData[]) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

const mockZones: ZoneData[] = [
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

export function ZonasSelectorInput({ 
  selectedZones, 
  onSelectionChange, 
  placeholder = "Seleccionar zonas",
  className = "",
  disabled = false
}: ZonasSelectorInputProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Render pills with max 3 visible
  const renderDisplayContent = () => {
    if (selectedZones.length === 0) {
      return <span className="text-gray-500">{placeholder}</span>
    }

    const maxVisible = 3
    const visibleZones = selectedZones.slice(0, maxVisible)
    const remainingCount = selectedZones.length - maxVisible

    return (
      <div className="flex items-center gap-1 flex-wrap">
        {visibleZones.map((zone) => (
          <span
            key={zone.id}
            className="inline-flex items-center px-2 py-0.5 rounded-md text-[12px] bg-gray-100 text-gray-800 border max-w-[120px]"
          >
            <span className="truncate">{zone.name}</span>
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

  return (
    <div className={`w-full ${className}`}>
      <div className="relative">
        <div
          className={`w-full px-3 text-[14px] border border-gray-300 rounded-lg bg-white appearance-none pr-8 cursor-pointer text-gray-900 flex items-center box-border ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          style={{ height: 32 }}
          onClick={() => !disabled && setIsModalOpen(true)}
        >
          {renderDisplayContent()}
        </div>
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

      <ZoneSelector
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedZones={selectedZones}
        onSelectionChange={onSelectionChange}
      />
    </div>
  )
}
