import { useState } from "react"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { X, ChevronDown, Tag, Check } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/command"
import { Checkbox } from "./ui/checkbox"

interface FilterConfig {
  id: string
  name: string
  type: 'select' | 'range' | 'date' | 'multiselect'
  options?: string[]
}

interface DynamicFilterProps {
  filter: FilterConfig
  onRemove: (filterId: string) => void
  onValueChange?: (filterId: string, value: string | string[]) => void
}

export function DynamicFilter({ filter, onRemove, onValueChange }: DynamicFilterProps) {
  const [selectedValue, setSelectedValue] = useState<string>("")
  const [selectedValues, setSelectedValues] = useState<string[]>([])
  const [popoverOpen, setPopoverOpen] = useState(false)

  const handleValueSelect = (value: string) => {
    setSelectedValue(value)
    onValueChange?.(filter.id, value)
  }

  const handleMultiValueToggle = (value: string) => {
    setSelectedValues(prev => {
      const newValues = prev.includes(value) 
        ? prev.filter(v => v !== value)
        : [...prev, value]
      onValueChange?.(filter.id, newValues)
      return newValues
    })
  }

  const getDisplayText = () => {
    if (filter.type === 'multiselect') {
      if (selectedValues.length === 0) {
        return `${filter.name}: Seleccionar`
      }
      return `${filter.name}: ${selectedValues.length} Etiqueta${selectedValues.length === 1 ? '' : 's'}`
    } else {
      if (selectedValue) {
        return `${filter.name}: ${selectedValue}`
      }
      return `${filter.name}: Seleccionar`
    }
  }

  const getValueCount = () => {
    if (filter.type === 'multiselect') {
      return selectedValues.length
    }
    return selectedValue ? 1 : 0
  }

  // Render multiselect filter (Etiquetas)
  if (filter.type === 'multiselect') {
    return (
      <div className="flex items-center gap-2">
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <Badge 
              variant="secondary" 
              className={`${getValueCount() > 0 ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-50 text-gray-700 border-gray-200'} h-8 px-3 flex items-center gap-1 cursor-pointer hover:bg-blue-100 whitespace-nowrap`}
            >
              <Tag className={`w-4 h-4 ${getValueCount() > 0 ? 'text-blue-600' : 'text-gray-600'}`} />
              <span className="text-sm">{getDisplayText()}</span>
              <ChevronDown className="w-3 h-4 ml-1" />
            </Badge>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-0" align="start">
            <Command>
              <CommandInput placeholder="Buscar etiquetas..." className="h-9" />
              <CommandList>
                <CommandEmpty>No se encontraron etiquetas.</CommandEmpty>
                <CommandGroup>
                  {filter.options?.map((option) => (
                    <CommandItem
                      key={option}
                      onSelect={() => handleMultiValueToggle(option)}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Checkbox
                        checked={selectedValues.includes(option)}
                        onChange={() => handleMultiValueToggle(option)}
                        className="w-4 h-4"
                      />
                      <span className="flex-1">{option}</span>
                      {selectedValues.includes(option) && (
                        <Check className="w-4 h-4 text-blue-600" />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
              {selectedValues.length > 0 && (
                <div className="border-t p-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedValues([])
                      onValueChange?.(filter.id, [])
                    }}
                    className="w-full text-gray-600 hover:text-gray-800"
                  >
                    Limpiar selección
                  </Button>
                </div>
              )}
            </Command>
          </PopoverContent>
        </Popover>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(filter.id)}
          className="w-6 h-6 p-0 text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    )
  }

  // Render regular select filter
  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Badge 
            variant="secondary" 
            className={`${selectedValue ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-50 text-gray-700 border-gray-200'} h-8 px-3 flex items-center gap-1 cursor-pointer hover:bg-blue-100 whitespace-nowrap`}
          >
            <span className="text-sm">{getDisplayText()}</span>
            <ChevronDown className="w-3 h-3 ml-1" />
          </Badge>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          {filter.options?.map((option) => (
            <DropdownMenuItem
              key={option}
              onClick={() => handleValueSelect(option)}
              className="cursor-pointer"
            >
              {option}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRemove(filter.id)}
        className="w-6 h-6 p-0 text-gray-400 hover:text-gray-600"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  )
}