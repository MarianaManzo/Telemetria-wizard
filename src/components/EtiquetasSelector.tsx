import { useMemo, useState } from "react"
import { Dropdown, Input } from "antd"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Tag as TagIcon, Search, ChevronDown } from "lucide-react"

type TagData = {
  id: string
  name: string
  color: string
  vehicleCount: number
}

type EtiquetasSelectorProps = {
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

  const renderTagCapsule = (tag: TagData) => {
    const isSelected = selectedTags.some(item => item.id === tag.id)
    const background = isSelected ? tag.color : '#f5f5f5'
    const color = isSelected ? '#ffffff' : '#1f2937'
    const borderColor = isSelected ? tag.color : '#e5e7eb'

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
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          cursor: 'pointer',
          transition: 'transform 0.15s ease',
          boxShadow: isSelected ? '0 8px 16px rgba(0,0,0,0.12)' : 'none'
        }}
      >
        <span
          style={{
            display: 'inline-flex',
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: isSelected ? '#ffffff' : tag.color
          }}
        />
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#1f2937' }}>Seleccionar etiquetas</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="ghost" size="sm" onClick={handleSelectAll} className="text-xs h-7 px-2 text-blue-600 hover:text-blue-800">
            Todos
          </Button>
          <Button variant="ghost" size="sm" onClick={handleClearAll} className="text-xs h-7 px-2 text-blue-600 hover:text-blue-800">
            Limpiar
          </Button>
        </div>
      </div>

      <Input
        prefix={<Search className="w-4 h-4 text-gray-400" />}
        placeholder="Buscar etiquetas..."
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
        allowClear
        style={{ borderRadius: 8, height: 36 }}
      />

      <div
        style={{
          maxHeight: 240,
          overflowY: 'auto',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8
        }}
      >
        {filteredTags.length > 0 ? (
          filteredTags.map(renderTagCapsule)
        ) : (
          <span style={{ fontSize: 12, color: '#9CA3AF' }}>
            No se encontraron etiquetas con "{searchTerm}"
          </span>
        )}
      </div>

      <div style={{
        marginTop: 4,
        paddingTop: 12,
        borderTop: '1px solid #E5E7EB',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span style={{ fontSize: 12, color: '#6B7280' }}>
          {selectedTags.length} seleccionadas
        </span>
        <Button
          size="sm"
          className="h-7 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => setOpen(false)}
        >
          Cerrar
        </Button>
      </div>
    </div>
  )

  return (
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
          <TagIcon className={`w-4 h-4 ${
            selectedTags.length > 0
              ? 'text-blue-600'
              : showError
                ? 'text-red-600'
                : 'text-gray-600'
          }`} />
          <span>Etiquetas: {getDisplayText()}</span>
          <ChevronDown className="w-3 h-4 ml-1" />
        </Badge>
      </span>
    </Dropdown>
  )
}
