import { useState } from "react"
import { Row, Col } from "antd"
import { Button } from "./ui/button"
import { Card } from "./ui/card"
import { ArrowLeft, Gauge, MapPin } from "lucide-react"

interface RuleTypeSelectorProps {
  onTypeSelect: (type: 'telemetry' | 'zone') => void
  onCancel: () => void
}

export function RuleTypeSelector({ onTypeSelect, onCancel }: RuleTypeSelectorProps) {
  const [selectedType, setSelectedType] = useState<'telemetry' | 'zone' | null>(null)

  const ruleTypes = [
    {
      id: 'telemetry' as const,
      title: 'Telemetría',
      description: 'Configura reglas y acciones basadas en información proporcionada por tu dispositivo (velocidad, temperatura...)',
      icon: Gauge
    },
    {
      id: 'zone' as const,
      title: 'Zona',
      description: 'Define acciones automáticas al entrar o salir de una zona delimitada.',
      icon: MapPin
    }
  ]

  const handleSelect = (type: 'telemetry' | 'zone') => {
    setSelectedType(type)
    onTypeSelect(type)
  }

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Header */}
      <div
        style={{
          padding: '16px 24px',
          position: 'sticky',
          top: 'var(--app-header-height, 64px)',
          zIndex: 110,
          backgroundColor: '#fff',
          borderBottom: '1px solid #f0f0f0',
          marginTop: 0,
        }}
      >
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

          <div className="max-w-5xl mx-auto px-2">
            <Row gutter={[16, 16]} justify="center">
              {ruleTypes.map((type) => {
                const Icon = type.icon
                const isSelected = selectedType === type.id

                return (
                  <Col key={type.id} xs={24} md={12}>
                    <Card
                      className={`relative p-6 cursor-pointer transition-all hover:shadow-md h-full ${
                        isSelected ? 'ring-2 ring-blue-500 border-blue-200' : ''
                      }`}
                      onClick={() => setSelectedType(type.id)}
                      style={{ height: '100%' }}
                    >
                      <div className="flex flex-col items-center text-center space-y-4 h-full">
                        {/* Icon */}
                        <div className="w-12 h-12 rounded-full flex items-center justify-center border-2 border-gray-300 bg-gray-100">
                          <Icon className="w-6 h-6 text-gray-600" />
                        </div>

                        {/* Title */}
                        <h3 className="text-lg font-medium text-foreground">
                          {type.title}
                        </h3>

                        {/* Description */}
                        <p className="text-sm text-muted-foreground leading-relaxed min-h-[4rem] flex items-center text-center">
                          {type.description}
                        </p>

                        {/* Select Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-4"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSelect(type.id)
                          }}
                        >
                          Seleccionar
                        </Button>
                      </div>
                    </Card>
                  </Col>
                )
              })}
            </Row>
          </div>
        </div>
      </div>
    </div>
  )
}
