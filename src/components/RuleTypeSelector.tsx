import { useState } from "react"
import { Button } from "./ui/button"
import { Card } from "./ui/card"
import { ArrowLeft, Gauge, MapPin, Settings } from "lucide-react"

interface RuleTypeSelectorProps {
  onTypeSelect: (type: 'telemetry' | 'zone' | 'entities') => void
  onCancel: () => void
}

export function RuleTypeSelector({ onTypeSelect, onCancel }: RuleTypeSelectorProps) {
  const [selectedType, setSelectedType] = useState<'telemetry' | 'zone' | 'entities' | null>(null)

  const ruleTypes = [
    {
      id: 'telemetry' as const,
      title: 'Telemetría',
      description: 'Configura reglas y acciones basadas en información proporcionada por tu dispositivo (velocidad, temperatura...)',
      icon: Gauge,
      primary: true
    },
    {
      id: 'zone' as const,
      title: 'Zona',
      description: 'Define acciones automáticas al entrar o salir de una zona delimitada.',
      icon: MapPin,
      primary: false
    },
    {
      id: 'entities' as const,
      title: 'Entidades',
      description: 'Genera una acción al crear, editar, modificar o eliminar cualquier registro del sistema (unidades, usuarios, comandos, sensores...)',
      icon: Settings,
      primary: false
    }
  ]

  const handleSelect = (type: 'telemetry' | 'zone' | 'entities') => {
    setSelectedType(type)
    onTypeSelect(type)
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-background">
      {/* Header */}
      <div className="border-b border-border bg-background px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Crear regla
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={onCancel}>
              Cancelar
            </Button>
            <Button 
              disabled={!selectedType}
              onClick={() => selectedType && onTypeSelect(selectedType)}
              className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-300 disabled:text-gray-500"
            >
              Guardar
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-xl font-medium text-foreground mb-2">
              Selecciona el tipo de regla para comenzar
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {ruleTypes.map((type) => {
              const Icon = type.icon
              const isSelected = selectedType === type.id
              
              return (
                <Card
                  key={type.id}
                  className={`relative flex h-full flex-col p-6 cursor-pointer transition-all hover:shadow-md ${
                    isSelected ? 'ring-2 ring-blue-500 border-blue-200' : ''
                  } ${type.primary ? 'border-blue-200 bg-blue-50/30' : ''}`}
                  onClick={() => setSelectedType(type.id)}
                >
                  <div className="flex flex-1 flex-col items-center gap-4 text-center">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                      type.primary 
                        ? 'border-blue-500 bg-blue-500' 
                        : 'border-gray-300 bg-gray-100'
                    }`}>
                      <Icon className={`w-6 h-6 ${
                        type.primary ? 'text-white' : 'text-gray-600'
                      }`} />
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-medium text-foreground">
                      {type.title}
                    </h3>

                    {/* Description */}
                    <p
                      className="text-sm text-muted-foreground leading-relaxed line-clamp-5 overflow-hidden"
                      style={{ maxHeight: 105, minHeight: 105 }}
                    >
                      {type.description}
                    </p>

                    {/* Select Button */}
                    <div className="mt-auto w-full">
                      <Button
                        variant={type.primary ? 'default' : 'outline'}
                        size="sm"
                        className={`${
                          type.primary
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : ''
                        } w-full`}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSelect(type.id)
                        }}
                      >
                        Seleccionar
                      </Button>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
