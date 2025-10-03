import { useState } from "react"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Plus, Search, Check } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/command"

interface Filter {
  id: string
  name: string
  type: 'select' | 'range' | 'date' | 'multiselect'
  options?: string[]
}

interface AddFiltersProps {
  onFilterAdd: (filter: Filter) => void
  disabled?: boolean
}

const availableFilters: Filter[] = [
  {
    id: "tiempo-movimiento",
    name: "Tiempo en movimiento",
    type: "select",
    options: ["5 minutos", "10 minutos", "15 minutos", "30 minutos", "1 hora"]
  },
  {
    id: "velocidad-promedio",
    name: "Velocidad promedio",
    type: "select",
    options: ["0-20 km/h", "21-40 km/h", "41-60 km/h", "61-80 km/h", "80+ km/h"]
  },
  {
    id: "distancia-recorrida",
    name: "Distancia recorrida",
    type: "select", 
    options: ["0-10 km", "11-25 km", "26-50 km", "51-100 km", "100+ km"]
  },
  {
    id: "consumo-combustible",
    name: "Consumo de combustible",
    type: "select",
    options: ["Bajo", "Medio", "Alto", "Muy alto"]
  },
  {
    id: "numero-paradas",
    name: "Número de paradas",
    type: "select",
    options: ["1-5", "6-10", "11-20", "21-50", "50+"]
  },
  {
    id: "tipo-vehiculo",
    name: "Tipo de vehículo",
    type: "select",
    options: ["Sedán", "Van", "Camión", "Motocicleta", "Pickup"]
  },
  {
    id: "conductor",
    name: "Conductor",
    type: "multiselect",
    options: ["Juan Pérez", "María García", "Carlos López", "Ana Martínez", "Luis Rodríguez"]
  },
  {
    id: "ruta",
    name: "Ruta",
    type: "multiselect",
    options: ["Ruta A", "Ruta B", "Ruta C", "Ruta Express", "Ruta Local"]
  },
  {
    id: "zona",
    name: "Zona",
    type: "multiselect",
    options: ["Norte", "Sur", "Este", "Oeste", "Centro"]
  }
]

export function AddFilters({ onFilterAdd, disabled = false }: AddFiltersProps) {
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")

  const filteredFilters = availableFilters.filter(filter =>
    filter.name.toLowerCase().includes(searchValue.toLowerCase())
  )

  const handleFilterSelect = (filter: Filter) => {
    if (!disabled) {
      onFilterAdd(filter)
      setOpen(false)
      setSearchValue("")
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!disabled) {
      setOpen(newOpen)
    }
  }

  return (
    <Popover open={open && !disabled} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Badge 
          variant="outline" 
          className={`h-8 px-3 flex items-center gap-1 hover:bg-gray-100 ${
            disabled 
              ? 'opacity-50 cursor-not-allowed' 
              : 'cursor-pointer'
          }`}
          onClick={() => !disabled && setOpen(!open)}
        >
          <Plus className="w-4 h-4 text-gray-600" />
          <span className="text-sm text-gray-700">Agregar filtros</span>
        </Badge>
      </PopoverTrigger>
      {!disabled && (
        <PopoverContent className="w-72 p-0" align="start">
          <Command>
            <div className="flex items-center border-b">
              <CommandInput
                placeholder="Buscar filtros..."
                value={searchValue}
                onValueChange={setSearchValue}
                className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <CommandList className="max-h-60">
              <CommandEmpty className="py-6 text-center text-sm">
                No se encontraron filtros.
              </CommandEmpty>
              <CommandGroup>
                {filteredFilters.map((filter) => (
                  <CommandItem
                    key={filter.id}
                    value={filter.name}
                    onSelect={() => handleFilterSelect(filter)}
                    className="flex items-center gap-2 px-4 py-2 cursor-pointer"
                  >
                    <span className="text-sm">{filter.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      )}
    </Popover>
  )
}