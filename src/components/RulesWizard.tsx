import { useState, useMemo } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Badge } from "./ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "./ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Switch } from "./ui/switch"
import { Checkbox } from "./ui/checkbox"
import { RadioGroup, RadioGroupItem } from "./ui/radio-group"
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar"
import { 
  ArrowLeft, 
  X, 
  Plus, 
  AlertCircle,
  CheckCircle2,
  Clock,
  Settings,
  Bell,
  Eye,
  AlertTriangle,
  Gauge,
  Thermometer,
  MapPin,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { Rule, RuleCondition } from "../types"

interface RulesWizardProps {
  ruleType?: 'telemetry' | 'zone' | null
  onSave: (rule: Partial<Rule>) => void
  onCancel: () => void
}

// Mock sensor data
const sensorOptions = [
  { value: 'speed', label: 'Velocidad', dataType: 'numeric' as const, unit: 'km/h' },
  { value: 'fuel_level', label: 'Nivel de combustible', dataType: 'numeric' as const, unit: '%' },
  { value: 'engine_temp', label: 'Temperatura del motor', dataType: 'numeric' as const, unit: '°C' },
  { value: 'cargo_temp', label: 'Temperatura de carga', dataType: 'numeric' as const, unit: '°C' },
  { value: 'engine_status', label: 'Estado del motor', dataType: 'boolean' as const },
  { value: 'door_status', label: 'Estado de puertas', dataType: 'boolean' as const },
  { value: 'zone_entry', label: 'Entrada a zona', dataType: 'boolean' as const },
  { value: 'driver_id', label: 'ID del conductor', dataType: 'text' as const }
]

// Mock units and tags
const mockUnits = [
  { id: 'unit-1', name: 'Unidad 001', type: 'Camión' },
  { id: 'unit-2', name: 'Unidad 002', type: 'Furgoneta' },
  { id: 'unit-3', name: 'Unidad 003', type: 'Camión' },
  { id: 'unit-4', name: 'Unidad 004', type: 'Auto' }
]

const mockTags = [
  { id: 'tag-1', name: 'Alta prioridad', color: 'red' },
  { id: 'tag-2', name: 'Vehículos restringidos', color: 'orange' },
  { id: 'tag-3', name: 'Cadena de frío', color: 'blue' },
  { id: 'tag-4', name: 'Entrega express', color: 'green' }
]

const responsibleOptions = [
  { 
    value: "supervisor-flota", 
    label: "Supervisor de flota", 
    email: "supervisor@numaris.com",
    avatar: "https://images.unsplash.com/photo-1524538198441-241ff79d153b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMGV4ZWN1dGl2ZSUyMHByb2Zlc3Npb25hbCUyMG1hbnxlbnwxfHx8fDE3NTg2NTExODF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  },
  { 
    value: "jefe-seguridad", 
    label: "Jefe de seguridad", 
    email: "seguridad@numaris.com",
    avatar: "https://images.unsplash.com/photo-1652471943570-f3590a4e52ed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMG1hbiUyMHByb2Zlc3Npb25hbCUyMGhlYWRzaG90fGVufDF8fHx8MTc1ODYwNDk4M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  },
  { 
    value: "supervisor-logistica", 
    label: "Supervisor de logística", 
    email: "logistica@numaris.com",
    avatar: "https://images.unsplash.com/photo-1652471949169-9c587e8898cd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHdvbWFuJTIwcHJvZmVzc2lvbmFsJTIwaGVhZHNob3R8ZW58MXx8fHwxNzU4NjIzODAyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  },
  { 
    value: "coordinador-operaciones", 
    label: "Coordinador de operaciones", 
    email: "operaciones@numaris.com",
    avatar: "https://images.unsplash.com/photo-1581065178047-8ee15951ede6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMGJ1c2luZXNzJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzU4NjE2NTgwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  }
]

const getOperatorOptions = (dataType: 'numeric' | 'text' | 'boolean') => {
  switch (dataType) {
    case 'numeric':
      return [
        { value: '>', label: 'mayor que (>)' },
        { value: '>=', label: 'mayor o igual (≥)' },
        { value: '<', label: 'menor que (<)' },
        { value: '<=', label: 'menor o igual (≤)' },
        { value: '=', label: 'igual a (=)' },
        { value: '!=', label: 'diferente de (≠)' }
      ]
    case 'text':
      return [
        { value: 'contains', label: 'contiene' },
        { value: 'does not contain', label: 'no contiene' },
        { value: '=', label: 'igual a' },
        { value: '!=', label: 'diferente de' }
      ]
    case 'boolean':
      return [
        { value: 'is true', label: 'es verdadero' },
        { value: 'is false', label: 'es falso' }
      ]
    default:
      return []
  }
}

export function RulesWizard({ ruleType, onSave, onCancel }: RulesWizardProps) {
  const [currentStep, setCurrentStep] = useState("parameters")
  const [ruleName, setRuleName] = useState("")
  const [ruleDescription, setRuleDescription] = useState("")
  
  // Step 1: Parameters
  const [conditions, setConditions] = useState<RuleCondition[]>([
    {
      id: '1',
      sensor: '',
      operator: '',
      value: '',
      dataType: 'numeric'
    }
  ])

  // Step 2: Apply to
  const [appliesTo, setAppliesTo] = useState<'units' | 'tags'>('units')
  const [selectedUnits, setSelectedUnits] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  // Step 3: Event settings
  const [instructions, setInstructions] = useState('')
  const [responsible, setResponsible] = useState('supervisor-flota')
  const [severity, setSeverity] = useState<'critical' | 'high' | 'medium' | 'low'>('medium')
  const [selectedIcon, setSelectedIcon] = useState('alert')
  const [eventTags, setEventTags] = useState<string[]>([])

  // Step 4: Notifications
  const [emailEnabled, setEmailEnabled] = useState(false)
  const [emailRecipients, setEmailRecipients] = useState<string[]>([])
  const [emailSubject, setEmailSubject] = useState('')
  const [emailBody, setEmailBody] = useState('')

  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({})

  const steps = [
    { id: 'parameters', label: 'Parámetros', icon: Settings },
    { id: 'apply-to', label: 'Aplicar a', icon: Settings },
    { id: 'events', label: 'Config. eventos', icon: AlertCircle },
    { id: 'notifications', label: 'Notificaciones', icon: Bell }
  ]

  // Get current step index
  const currentStepIndex = steps.findIndex(s => s.id === currentStep)
  const isFirstStep = currentStepIndex === 0
  const isLastStep = currentStepIndex === steps.length - 1

  // Memoized validation that doesn't cause side effects
  const isCurrentStepValid = useMemo(() => {
    if (currentStep === 'parameters') {
      const validConditions = conditions.filter(c => c.sensor && c.operator && (c.value !== '' || c.dataType === 'boolean'))
      return validConditions.length > 0
    }

    if (currentStep === 'apply-to') {
      if (appliesTo === 'units') {
        return selectedUnits.length > 0
      }
      if (appliesTo === 'tags') {
        return selectedTags.length > 0
      }
    }

    return true
  }, [currentStep, conditions, appliesTo, selectedUnits, selectedTags])

  const validateStep = (step: string): boolean => {
    const newErrors: Record<string, string> = {}

    if (step === 'parameters') {
      const validConditions = conditions.filter(c => c.sensor && c.operator && (c.value !== '' || c.dataType === 'boolean'))
      if (validConditions.length === 0) {
        newErrors.conditions = 'Se requiere al menos una condición válida'
      }
    }

    if (step === 'apply-to') {
      if (appliesTo === 'units' && selectedUnits.length === 0) {
        newErrors.units = 'Debe seleccionar al menos una unidad'
      }
      if (appliesTo === 'tags' && selectedTags.length === 0) {
        newErrors.tags = 'Debe seleccionar al menos una etiqueta'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (!validateStep(currentStep)) return

    const currentIndex = steps.findIndex(s => s.id === currentStep)
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id)
    }
  }

  const handlePrevious = () => {
    const currentIndex = steps.findIndex(s => s.id === currentStep)
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].id)
    }
  }

  const handleSave = () => {
    if (!ruleName.trim()) {
      setErrors({ name: 'El nombre de la regla es obligatorio' })
      return
    }

    const ruleData: Partial<Rule> = {
      name: ruleName,
      description: ruleDescription,
      conditions: conditions.filter(c => c.sensor && c.operator && (c.value !== '' || c.dataType === 'boolean')),
      appliesTo: {
        type: appliesTo,
        units: appliesTo === 'units' ? selectedUnits : undefined,
        tags: appliesTo === 'tags' ? selectedTags : undefined
      },
      zoneScope: { type: 'all' }, // Simplified for this version
      schedule: { type: 'always' }, // Simplified for this version
      closePolicy: { type: 'manual' }, // Simplified for this version
      eventSettings: {
        instructions,
        responsible,
        severity,
        icon: selectedIcon,
        tags: eventTags
      },
      notifications: {
        email: {
          enabled: emailEnabled,
          recipients: emailRecipients,
          subject: emailSubject,
          body: emailBody
        }
      },
      severity,
      ruleType: ruleType || 'telemetry'
    }

    onSave(ruleData)
  }

  const addCondition = () => {
    const newCondition: RuleCondition = {
      id: `condition-${Date.now()}`,
      sensor: '',
      operator: '',
      value: '',
      dataType: 'numeric'
    }
    setConditions([...conditions, newCondition])
  }

  const removeCondition = (id: string) => {
    if (conditions.length > 1) {
      setConditions(conditions.filter(c => c.id !== id))
    }
  }

  const updateCondition = (id: string, field: keyof RuleCondition, value: any) => {
    setConditions(
      conditions.map(c => {
        if (c.id === id) {
          const updated = { ...c, [field]: value }
          
          // Reset operator and value when sensor changes
          if (field === 'sensor') {
            const sensor = sensorOptions.find(s => s.value === value)
            updated.dataType = sensor?.dataType || 'numeric'
            updated.operator = ''
            updated.value = ''
          }
          
          // Reset value when operator changes
          if (field === 'operator') {
            updated.value = ''
          }
          
          return updated
        }
        return c
      })
    )
  }

  const getStepStatus = (stepId: string) => {
    const currentIndex = steps.findIndex(s => s.id === currentStep)
    const stepIndex = steps.findIndex(s => s.id === stepId)
    
    if (stepIndex < currentIndex) return 'completed'
    if (stepIndex === currentIndex) return 'current'
    return 'pending'
  }

  const generateLiveSummary = () => {
    const validConditions = conditions.filter(c => c.sensor && c.operator && (c.value !== '' || c.dataType === 'boolean'))
    
    if (validConditions.length === 0) {
      return "No hay condiciones definidas aún"
    }

    const conditionStrings = validConditions.map(c => {
      const sensor = sensorOptions.find(s => s.value === c.sensor)
      let valueStr = String(c.value)
      if (c.dataType === 'boolean') {
        valueStr = c.operator === 'is true' ? 'verdadero' : 'falso'
      } else if (sensor?.unit) {
        valueStr += ` ${sensor.unit}`
      }
      return `[${sensor?.label || c.sensor}] ${c.operator} ${valueStr}`
    })

    return `SI ${conditionStrings.join(' Y ')}`
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-background">
      {/* Header */}
      <div className="border-b border-border bg-background px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Atrás
            </Button>
            <div>
              <h1 className="text-xl font-medium text-foreground">Crear regla</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </div>

        {/* Progress Tabs */}
        <div className="mt-4">
          <Tabs value={currentStep} onValueChange={setCurrentStep}>
            <TabsList className="grid grid-cols-4 w-full">
              {steps.map((step) => {
                const status = getStepStatus(step.id)
                const Icon = step.icon
                
                return (
                  <TabsTrigger
                    key={step.id}
                    value={step.id}
                    className="flex items-center gap-2 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700"
                    disabled={status === 'pending'}
                  >
                    {status === 'completed' ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                    <span className="hidden md:inline">{step.label}</span>
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Content with scroll */}
      <div className="flex-1 overflow-auto">
        <div className="p-6 pb-24">
          <Tabs value={currentStep} className="w-full">
            {/* Step 1: Parameters */}
            <TabsContent value="parameters" className="m-0">
              <div className="flex">
                <div className="flex-1 space-y-6">
                  <div>
                    <h2 className="text-lg font-medium text-foreground mb-2">Parámetros</h2>
                    <p className="text-muted-foreground">Define las condiciones que activarán esta regla</p>
                  </div>

                  {/* Name and Description */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Información básica</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="ruleName">Nombre de la regla *</Label>
                        <Input
                          id="ruleName"
                          placeholder="Ingresa un nombre para la regla"
                          value={ruleName}
                          onChange={(e) => setRuleName(e.target.value)}
                          className={`mt-2 ${errors.name ? 'border-red-200' : ''}`}
                        />
                        {errors.name && (
                          <div className="text-red-600 text-sm mt-1">{errors.name}</div>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="ruleDescription">Descripción</Label>
                        <Textarea
                          id="ruleDescription"
                          placeholder="Describe el propósito de esta regla (opcional)"
                          value={ruleDescription}
                          onChange={(e) => setRuleDescription(e.target.value)}
                          rows={3}
                          className="mt-2"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Condition Builder */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Condiciones de activación</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Define cuándo se debe activar esta regla
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {conditions.map((condition, index) => {
                        const sensor = sensorOptions.find(s => s.value === condition.sensor)
                        const operatorOptions = getOperatorOptions(sensor?.dataType || 'numeric')
                        const isValid = condition.sensor && condition.operator && (condition.value !== '' || condition.dataType === 'boolean')
                        
                        return (
                          <Card key={condition.id} className={`p-4 ${!isValid && condition.sensor ? 'border-red-200' : ''}`}>
                            <div className="flex items-center gap-4">
                              {/* Condition label */}
                              <div className="flex items-center gap-2 min-w-0">
                                <Badge variant="outline" className="whitespace-nowrap">
                                  {index === 0 ? 'SI' : 'Y'}
                                </Badge>
                              </div>

                              {/* Sensor select */}
                              <div className="min-w-0 flex-1">
                                <Select
                                  value={condition.sensor}
                                  onValueChange={(value) => updateCondition(condition.id, 'sensor', value)}
                                >
                                  <SelectTrigger className={`w-full ${!condition.sensor ? 'border-red-200' : ''}`}>
                                    <SelectValue placeholder="Seleccionar sensor" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {sensorOptions.map((sensor) => (
                                      <SelectItem key={sensor.value} value={sensor.value}>
                                        <div className="flex items-center justify-between w-full">
                                          <span>{sensor.label}</span>
                                          <Badge variant="outline" className="ml-2 text-xs">
                                            {sensor.dataType}
                                          </Badge>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Operator select */}
                              <div className="min-w-0">
                                <Select
                                  value={condition.operator}
                                  onValueChange={(value) => updateCondition(condition.id, 'operator', value)}
                                  disabled={!condition.sensor}
                                >
                                  <SelectTrigger className={`w-40 ${!condition.operator && condition.sensor ? 'border-red-200' : ''}`}>
                                    <SelectValue placeholder="Operador" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {operatorOptions.map((op) => (
                                      <SelectItem key={op.value} value={op.value}>
                                        {op.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Value input */}
                              {condition.dataType !== 'boolean' && (
                                <div className="min-w-0">
                                  <Input
                                    type={condition.dataType === 'numeric' ? 'number' : 'text'}
                                    placeholder={condition.dataType === 'numeric' ? 'Valor' : 'Texto'}
                                    value={String(condition.value)}
                                    onChange={(e) => updateCondition(condition.id, 'value', e.target.value)}
                                    className="w-24"
                                  />
                                </div>
                              )}

                              {/* Remove button */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeCondition(condition.id)}
                                disabled={conditions.length <= 1}
                                className="flex-shrink-0"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>

                            {/* Validation error */}
                            {!isValid && condition.sensor && (
                              <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                                <AlertCircle className="w-4 h-4" />
                                <span>
                                  {!condition.operator ? 'Por favor selecciona un operador' : 'Por favor ingresa un valor'}
                                </span>
                              </div>
                            )}
                          </Card>
                        )
                      })}

                      {/* Add condition button */}
                      <Button
                        variant="outline"
                        onClick={addCondition}
                        className="flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Agregar condición
                      </Button>

                      {/* Global validation error */}
                      {errors.conditions && (
                        <div className="flex items-center gap-2 text-red-600 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          <span>{errors.conditions}</span>
                        </div>
                      )}

                      {/* Helper text */}
                      <div className="text-sm text-muted-foreground">
                        Todas las condiciones deben cumplirse para que la regla se active.
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Live Summary Panel */}
                <div className="w-80 border-l border-border pl-6 ml-6">
                  <div className="sticky top-6">
                    <h3 className="font-medium text-foreground mb-4">Resumen en vivo</h3>
                    <div className="bg-muted rounded-lg p-4">
                      <div className="text-sm font-mono text-foreground">
                        {generateLiveSummary()}
                      </div>
                    </div>
                    <div className="mt-4 text-xs text-muted-foreground">
                      Este resumen se actualiza mientras editas las condiciones
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Step 2: Apply To */}
            <TabsContent value="apply-to" className="m-0">
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-medium text-foreground mb-2">Aplicar a</h2>
                  <p className="text-muted-foreground">Elige a qué unidades o etiquetas aplicar esta regla</p>
                </div>

                <Card>
                  <CardContent className="pt-6 space-y-6">
                    {/* Type selection */}
                    <div>
                      <Label className="text-base font-medium">Aplicar esta regla a:</Label>
                      <RadioGroup
                        value={appliesTo}
                        onValueChange={(value: 'units' | 'tags') => setAppliesTo(value)}
                        className="flex gap-6 mt-3"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="units" id="units" />
                          <Label htmlFor="units">Unidades específicas</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="tags" id="tags" />
                          <Label htmlFor="tags">Etiquetas</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Units selector */}
                    {appliesTo === 'units' && (
                      <div>
                        <Label>Seleccionar unidades</Label>
                        <div className="mt-2 space-y-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                          {mockUnits.map((unit) => (
                            <div key={unit.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={unit.id}
                                checked={selectedUnits.includes(unit.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedUnits([...selectedUnits, unit.id])
                                  } else {
                                    setSelectedUnits(selectedUnits.filter(id => id !== unit.id))
                                  }
                                }}
                              />
                              <Label htmlFor={unit.id} className="flex-1 cursor-pointer">
                                <div className="font-medium">{unit.name}</div>
                                <div className="text-sm text-muted-foreground">{unit.type}</div>
                              </Label>
                            </div>
                          ))}
                        </div>
                        {errors.units && (
                          <div className="text-red-600 text-sm mt-2">{errors.units}</div>
                        )}
                      </div>
                    )}

                    {/* Tags selector */}
                    {appliesTo === 'tags' && (
                      <div>
                        <Label>Seleccionar etiquetas</Label>
                        <div className="mt-2 space-y-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                          {mockTags.map((tag) => (
                            <div key={tag.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={tag.id}
                                checked={selectedTags.includes(tag.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedTags([...selectedTags, tag.id])
                                  } else {
                                    setSelectedTags(selectedTags.filter(id => id !== tag.id))
                                  }
                                }}
                              />
                              <Label htmlFor={tag.id} className="flex-1 cursor-pointer flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full bg-${tag.color}-500`} />
                                <span className="font-medium">{tag.name}</span>
                              </Label>
                            </div>
                          ))}
                        </div>
                        {errors.tags && (
                          <div className="text-red-600 text-sm mt-2">{errors.tags}</div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Step 3: Event Settings */}
            <TabsContent value="events" className="m-0">
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-medium text-foreground mb-2">Configuración de eventos</h2>
                  <p className="text-muted-foreground">Configura cómo se crean los eventos cuando se activa esta regla</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="instructions">Instrucciones</Label>
                      <Textarea
                        id="instructions"
                        placeholder="Describe qué debe hacer el responsable cuando se genere este evento..."
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        rows={4}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="responsible">Responsable</Label>
                      <Select value={responsible} onValueChange={setResponsible}>
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {responsibleOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center gap-3 py-1">
                                <Avatar className="w-8 h-8">
                                  <AvatarImage 
                                    src={option.avatar} 
                                    alt={`Avatar de ${option.label}`}
                                  />
                                  <AvatarFallback className="text-[10px] bg-blue-100 text-blue-700">
                                    {option.label.split(' ').map(name => name.charAt(0)).join('').toUpperCase().slice(0, 2)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                  <span className="text-[14px] text-foreground">{option.label}</span>
                                  <span className="text-[12px] text-muted-foreground">{option.email}</span>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <Label>Severidad</Label>
                      <RadioGroup value={severity} onValueChange={(value: any) => setSeverity(value)} className="mt-2">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="critical" id="critical" />
                            <Label htmlFor="critical" className="flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-red-500" />
                              <span>Crítico</span>
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="high" id="high" />
                            <Label htmlFor="high" className="flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-purple-500" />
                              <span>Alto</span>
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="medium" id="medium" />
                            <Label htmlFor="medium" className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-blue-500" />
                              <span>Medio</span>
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="low" id="low" />
                            <Label htmlFor="low" className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-500" />
                              <span>Bajo</span>
                            </Label>
                          </div>
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label>Ícono del evento</Label>
                      <RadioGroup value={selectedIcon} onValueChange={setSelectedIcon} className="mt-2">
                        <div className="grid grid-cols-3 gap-2">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="alert" id="alert" />
                            <Label htmlFor="alert" className="flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4" />
                              <span>Alerta</span>
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="gauge" id="gauge" />
                            <Label htmlFor="gauge" className="flex items-center gap-2">
                              <Gauge className="w-4 h-4" />
                              <span>Medidor</span>
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="temp" id="temp" />
                            <Label htmlFor="temp" className="flex items-center gap-2">
                              <Thermometer className="w-4 h-4" />
                              <span>Temperatura</span>
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="location" id="location" />
                            <Label htmlFor="location" className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              <span>Ubicación</span>
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="clock" id="clock" />
                            <Label htmlFor="clock" className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>Tiempo</span>
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="eye" id="eye" />
                            <Label htmlFor="eye" className="flex items-center gap-2">
                              <Eye className="w-4 h-4" />
                              <span>Observar</span>
                            </Label>
                          </div>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Step 4: Notifications */}
            <TabsContent value="notifications" className="m-0">
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-medium text-foreground mb-2">Notificaciones</h2>
                  <p className="text-muted-foreground">Configura cómo se notificarán los eventos generados por esta regla</p>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="w-5 h-5" />
                      Notificaciones por email
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="email-enabled"
                        checked={emailEnabled}
                        onCheckedChange={setEmailEnabled}
                      />
                      <Label htmlFor="email-enabled">Enviar notificaciones por email</Label>
                    </div>

                    {emailEnabled && (
                      <div className="space-y-4 pl-6 border-l-2 border-blue-200">
                        <div>
                          <Label htmlFor="email-subject">Asunto del email</Label>
                          <Input
                            id="email-subject"
                            placeholder="Evento generado: {nombre_regla}"
                            value={emailSubject}
                            onChange={(e) => setEmailSubject(e.target.value)}
                            className="mt-2"
                          />
                        </div>

                        <div>
                          <Label htmlFor="email-body">Cuerpo del mensaje</Label>
                          <Textarea
                            id="email-body"
                            placeholder="Se ha generado un nuevo evento..."
                            value={emailBody}
                            onChange={(e) => setEmailBody(e.target.value)}
                            rows={4}
                            className="mt-2"
                          />
                        </div>

                        <div>
                          <Label>Destinatarios</Label>
                          <div className="mt-2 text-sm text-muted-foreground">
                            Los emails se enviarán automáticamente al responsable seleccionado en la configuración de eventos.
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Fixed Footer with Navigation */}
      <div className="border-t border-border bg-background px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={isFirstStep}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Paso {currentStepIndex + 1} de {steps.length}
            </span>
          </div>

          {isLastStep ? (
            <Button
              onClick={handleSave}
              disabled={!isCurrentStepValid || !ruleName.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-300 disabled:text-gray-500 flex items-center gap-2"
            >
              Guardar
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!isCurrentStepValid}
              className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-300 disabled:text-gray-500 flex items-center gap-2"
            >
              Siguiente
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
