import { useMemo, useState } from "react"
import { Dropdown, Input } from "antd"
import { DownOutlined } from "@ant-design/icons"
import { Search } from "lucide-react"
import { Button } from "./ui/button"

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
  hasError?: boolean
  title?: string
  hideHeader?: boolean
  layout?: 'grid' | 'list'
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
  className = "",
  hasError = false,
  title = "Etiquetas de unidades",
  hideHeader = false,
  layout = 'grid'
}: EtiquetasSelectorInputProps) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredTags = useMemo(() => {
    if (!searchTerm) return mockTags
    return mockTags.filter(tag => tag.name.toLowerCase().includes(searchTerm.toLowerCase()))
  }, [searchTerm])

  const toggleTag = (tag: TagData) => {
    const isSelected = selectedTags.some(item => item.id === tag.id)
    if (isSelected) {
      onSelectionChange(selectedTags.filter(item => item.id !== tag.id))
    } else {
      onSelectionChange([...selectedTags, tag])
    }
  }

  const renderDisplayContent = () => {
    if (selectedTags.length === 0) {
      return <span className="text-gray-500">{placeholder}</span>
    }

    const maxVisible = 3
    const visibleTags = selectedTags.slice(0, maxVisible)
    const remainingCount = selectedTags.length - maxVisible

    return (
      <div className="flex items-center gap-1 flex-wrap">
        {visibleTags.map(tag => (
          <span
            key={tag.id}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[12px] text-white border max-w-[120px]"
            style={{ backgroundColor: tag.color }}
          >
            <span className="truncate">{tag.name}</span>
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

  const renderTagCapsule = (tag: TagData) => {
    const isSelected = selectedTags.some(item => item.id === tag.id)
    const baseColor = tag.color || '#6B7280'
    const background = baseColor
    const color = '#FFFFFF'
    const borderColor = baseColor

    const isList = layout === 'list'
    return (
      <button
        key={tag.id}
        type="button"
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          toggleTag(tag)
        }}
        style={{
          border: `1px solid ${borderColor}`,
          background,
          color,
          borderRadius: 999,
          padding: '6px 12px',
          fontSize: 12,
          display: isList ? 'block' : 'inline-flex',
          width: isList ? '100%' : undefined,
          textAlign: isList ? 'center' : undefined,
          cursor: 'pointer',
          transition: 'transform 0.15s ease',
          boxShadow: isSelected ? '0 8px 16px rgba(0,0,0,0.18)' : 'none'
        }}
      >
        <span style={{ fontWeight: 500 }}>{tag.name}</span>
      </button>
    )
  }

  const overlay = (
    <div
      onClick={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.preventDefault()}
      style={{
        width: 320,
        background: '#ffffff',
        borderRadius: 12,
        border: '1px solid #E5E7EB',
        boxShadow: '0 16px 40px rgba(15, 23, 42, 0.12)',
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 12
      }}
    >
      {!hideHeader && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#1f2937' }}>{title}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onSelectionChange([])
              setSearchTerm("")
            }}
            className="text-xs h-7 px-2 text-blue-600 hover:text-blue-800"
            disabled={selectedTags.length === 0}
          >
            Limpiar
          </Button>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Input
          prefix={<Search className="w-4 h-4 text-gray-400" />}
          placeholder="Buscar etiquetas..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          allowClear
          style={{ borderRadius: 8, height: 36 }}
        />
        {hideHeader && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onSelectionChange([])
              setSearchTerm("")
            }}
            className="text-xs h-9 px-3 text-blue-600 hover:text-blue-800"
            disabled={selectedTags.length === 0}
          >
            Limpiar
          </Button>
        )}
      </div>

      <div
        style={{
          maxHeight: 240,
          overflowY: 'auto',
          display: 'flex',
          flexWrap: layout === 'grid' ? 'wrap' : 'nowrap',
          flexDirection: layout === 'grid' ? 'row' : 'column',
          gap: layout === 'grid' ? 8 : 4
        }}
      >
        {filteredTags.length > 0 ? (
          filteredTags.map(renderTagCapsule)
        ) : (
          <span style={{ fontSize: 12, color: '#9CA3AF' }}>
            {searchTerm ? `No se encontraron etiquetas para "${searchTerm}"` : 'No hay etiquetas disponibles'}
          </span>
        )}
      </div>
    </div>
  )

  return (
    <div className={`w-full ${className}`}>
      <Dropdown
        trigger={["click"]}
        open={open}
        onOpenChange={(openState) => {
          setOpen(openState)
          if (!openState) {
            setSearchTerm("")
          }
        }}
        menu={{ items: [] }}
        dropdownRender={() => overlay}
        placement="bottomLeft"
      >
        <span>
          <div className="relative">
            <div
              className={`w-full px-3 text-[14px] border rounded-lg bg-white appearance-none pr-8 cursor-pointer text-gray-900 flex items-center box-border ${
                hasError ? 'border-red-400' : 'border-gray-300'
              }`}
              style={{
                height: 32,
                borderColor: hasError ? '#F04438' : undefined,
                boxShadow: hasError ? '0 0 0 1px rgba(240,68,56,0.35)' : undefined,
              }}
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
        </span>
      </Dropdown>
    </div>
  )
}
