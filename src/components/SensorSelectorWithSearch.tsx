import { useState, useMemo } from "react"
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
}

interface SensorSelectorWithSearchProps {
  value: string
  onValueChange: (value: string) => void
  systemSensors: SensorOption[]
  customSensors?: SensorOption[]
  placeholder?: string
  className?: string
}

export function SensorSelectorWithSearch({
  value,
  onValueChange,
  systemSensors,
  customSensors = [],
  placeholder = "Seleccionar sensor",
  className
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

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between bg-white hover:bg-gray-50",
            !value && "text-muted-foreground",
            className
          )}
        >
          {selectedSensor ? (
            <span className="truncate">{selectedSensor.label}</span>
          ) : (
            placeholder
          )}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <div className="flex items-center border-b px-3">
            <CommandInput
              placeholder="Buscar sensor..."
              value={searchValue}
              onValueChange={setSearchValue}
              className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <CommandList className="max-h-[300px]">
            <CommandEmpty className="py-6 text-center text-sm">
              No se encontraron sensores.
            </CommandEmpty>
            
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
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Check
                        className={cn(
                          "h-4 w-4",
                          value === sensor.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <span>{sensor.label}</span>
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
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "h-4 w-4",
                        value === sensor.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <span>{sensor.label}</span>
                    <span className="text-[10px] text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded-full">
                      Custom
                    </span>
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