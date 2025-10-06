import { useState, useMemo, type CSSProperties } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "./ui/command"
import { Separator } from "./ui/separator"
import { Check, ChevronDown, Search, Gauge, User } from "lucide-react"
import { cn } from "./ui/utils"

interface SensorOption {
  value: string
  label: string
  unit: string
  dataType: string
  category: 'system' | 'custom'
  valueDescription?: string
  inputType?: string
  options?: Array<{ value: string; label: string }>
}

interface SensorSelectorWithSearchProps {
  value: string
  onValueChange: (value: string) => void
  systemSensors: SensorOption[]
  customSensors?: SensorOption[]
  placeholder?: string
  className?: string
  style?: CSSProperties
}

export function SensorSelectorWithSearch({
  value,
  onValueChange,
  systemSensors,
  customSensors = [],
  placeholder = "Seleccionar sensor",
  className,
  style
}: SensorSelectorWithSearchProps) {
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")

  const allSensors = useMemo(() => [
    ...systemSensors,
    ...customSensors
  ], [systemSensors, customSensors])

  const selectedSensor = allSensors.find(sensor => sensor.value === value)

  const filteredSystemSensors = useMemo(() => {
    if (!searchValue) return systemSensors
    return systemSensors.filter(sensor =>
      sensor.label.toLowerCase().includes(searchValue.toLowerCase())
    )
  }, [systemSensors, searchValue])

  const filteredCustomSensors = useMemo(() => {
    if (!searchValue) return customSensors
    return customSensors.filter(sensor =>
      sensor.label.toLowerCase().includes(searchValue.toLowerCase())
    )
  }, [customSensors, searchValue])

  const handleSelect = (sensorValue: string) => {
    onValueChange(sensorValue)
    setOpen(false)
    setSearchValue("")
  }

  const showEmptyState =
    searchValue.trim().length > 0 &&
    filteredSystemSensors.length === 0 &&
    filteredCustomSensors.length === 0

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="lg"
          role="combobox"
          aria-expanded={open}
          style={{ fontSize: '14px', borderRadius: '8px', height: '40px', maxWidth: '180px', width: '100%', paddingLeft: '12px', paddingRight: '12px', ...style }}
          className={cn(
            "w-full justify-between bg-white hover:bg-gray-50 text-[14px]",
            !value && "text-muted-foreground",
            className
          )}
        >
          {selectedSensor ? (
            <span className="truncate text-gray-900">{selectedSensor.label}</span>
          ) : (
            <span className="ant-typography ant-typography-secondary truncate">{placeholder}</span>
          )}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 rounded-lg" align="start" style={{ borderRadius: '8px' }}>
        <Command>
          <div className="border-b">
            <CommandInput
              placeholder="Buscar sensor..."
              value={searchValue}
              onValueChange={setSearchValue}
              className="w-full bg-gray-100 px-3 py-2 text-[14px] outline-none placeholder:text-gray-500 disabled:cursor-not-allowed disabled:opacity-50 border-none rounded-none"
            />
          </div>
          <CommandList className="max-h-[300px]">
            {showEmptyState && (
              <CommandEmpty className="py-6 text-center text-sm">
                No se encontraron sensores.
              </CommandEmpty>
            )}
            
            {/* System sensors */}
            {filteredSystemSensors.length > 0 && (
              <>
                <CommandGroup>
                  <div className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-gray-500 bg-gray-50">
                    <Gauge className="h-3 w-3" />
                    <span>Sistema</span>
                  </div>
                  {filteredSystemSensors.map((sensor) => (
                    <CommandItem
                      key={sensor.value}
                      value={sensor.value}
                      onSelect={() => handleSelect(sensor.value)}
                      className="flex cursor-pointer gap-3"
                    >
                      <Check
                        className={cn(
                          "h-4 w-4 mt-1",
                          value === sensor.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col gap-1">
                        <span className="text-[14px] text-gray-900">{sensor.label}</span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
                {filteredCustomSensors.length > 0 && (
                  <Separator className="my-1" />
                )}
              </>
            )}

            {/* Custom sensors */}
            {filteredCustomSensors.length > 0 && (
              <CommandGroup>
                <div className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-gray-500 bg-gray-50">
                  <User className="h-3 w-3" />
                  <span>Personalizados</span>
                </div>
                {filteredCustomSensors.map((sensor) => (
                  <CommandItem
                    key={sensor.value}
                    value={sensor.value}
                    onSelect={() => handleSelect(sensor.value)}
                    className="flex cursor-pointer gap-3"
                  >
                    <Check
                      className={cn(
                        "h-4 w-4 mt-1",
                        value === sensor.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[14px] text-gray-900">{sensor.label}</span>
                          <span className="text-[10px] text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded-full">
                            Custom
                          </span>
                        </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
