import React, { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Textarea } from "./ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "./ui/dropdown-menu"
import { Switch } from "./ui/switch"
import { 
  ArrowLeft, 
  AlertTriangle, 
  Clock, 
  Settings,
  MessageSquare,
  FileText,
  Tag,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  MoreVertical,
  Trash2,
  Edit3,
  Edit,
  Copy,
  Monitor,
  Smartphone, 
  Mail
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"
import { Rule, Event, RuleConditionGroup } from "../types"
import { DeleteRuleModal } from "./DeleteRuleModal"
import { RenameRuleModal } from "./RenameRuleModal"
import exampleImage from 'figma:asset/25905393c492af8c8e0b3cf142e20c9dc3cbe9e4.png'

// System sensors for telemetry (updated to match TelemetryWizardWithModal)
const systemTelemetrySensors = [
  { 
    value: 'movement_status', 
    label: 'Estado de movimiento', 
    unit: '', 
    dataType: 'boolean', 
    category: 'system' as const,
    options: [
      { value: 'moving', label: 'En movimiento' },
      { value: 'stopped', label: 'Detenido' }
    ]
  },
  { 
    value: 'ignition', 
    label: 'Ignición', 
    unit: '', 
    dataType: 'boolean', 
    category: 'system' as const,
    options: [
      { value: 'true', label: 'Encendido' },
      { value: 'false', label: 'Apagado' }
    ]
  },
  { 
    value: 'connection_status', 
    label: 'Estado de conexión', 
    unit: '', 
    dataType: 'string', 
    category: 'system' as const,
    options: [
      { value: 'no_connection', label: 'Sin conexión' },
      { value: 'more_24h', label: 'Mayor a 24 hrs' },
      { value: 'more_60min', label: 'Mayor a 60 min' }
    ]
  },
  { value: 'battery', label: 'Batería', unit: '%', dataType: 'numeric', category: 'system' as const },
  { value: 'gsm_signal', label: 'Señal GSM (%)', unit: '%', dataType: 'numeric', category: 'system' as const },
  { value: 'satellites_count', label: 'Número de Satélites', unit: '', dataType: 'numeric', category: 'system' as const },
  { value: 'location', label: 'Ubicación', unit: '', dataType: 'string', category: 'system' as const },
  { value: 'relative_distance', label: 'Distancia relativa (m)', unit: 'm', dataType: 'numeric', category: 'system' as const },
  { value: 'server_date', label: 'Fecha del servidor', unit: '', dataType: 'datetime', category: 'system' as const },
  { value: 'device_date', label: 'Fecha del dispositivo', unit: '', dataType: 'datetime', category: 'system' as const },
  { value: 'speed', label: 'Velocidad (km/h)', unit: 'km/h', dataType: 'numeric', category: 'system' as const },
  { value: 'odometer', label: 'Odómetro (Km)', unit: 'km', dataType: 'numeric', category: 'system' as const },
  { value: 'latitude', label: 'Latitud (°)', unit: '°', dataType: 'numeric', category: 'system' as const },
  { value: 'longitude', label: 'Longitud (°)', unit: '°', dataType: 'numeric', category: 'system' as const },
  { 
    value: 'power_takeoff', 
    label: 'Toma de fuerza', 
    unit: '', 
    dataType: 'boolean', 
    category: 'system' as const,
    options: [
      { value: 'true', label: 'Activada' },
      { value: 'false', label: 'Desactivada' }
    ]
  },
  { value: 'temperature', label: 'Temperatura (°C)', unit: '°C', dataType: 'numeric', category: 'system' as const },
  { value: 'axis_x', label: 'eje x (°)', unit: '°', dataType: 'numeric', category: 'system' as const },
  { 
    value: 'panic_button', 
    label: 'Pánico', 
    unit: '', 
    dataType: 'boolean', 
    category: 'system' as const,
    options: [
      { value: 'true', label: 'Activado' },
      { value: 'false', label: 'No activado' }
    ]
  }
]

// Mock custom sensors
const customTelemetrySensors = [
  { value: 'custom_fuel_sensor', label: 'Sensor de Combustible Personalizado', unit: 'L', dataType: 'numeric', category: 'custom' as const },
  { 
    value: 'custom_door_sensor', 
    label: 'Sensor de Puerta Trasera', 
    unit: '', 
    dataType: 'boolean', 
    category: 'custom' as const,
    options: [
      { value: 'true', label: 'Abierta' },
      { value: 'false', label: 'Cerrada' }
    ]
  },
  { value: 'custom_cargo_weight', label: 'Peso de Carga', unit: 'kg', dataType: 'numeric', category: 'custom' as const },
  { 
    value: 'custom_driver_id', 
    label: 'ID Chofer Personalizado', 
    unit: '', 
    dataType: 'string', 
    category: 'custom' as const,
    options: [
      { value: 'ID001', label: 'Juan Pérez (ID001)' },
      { value: 'ID002', label: 'María Rodríguez (ID002)' },
      { value: 'ID003', label: 'Carlos García (ID003)' },
      { value: 'ID004', label: 'Ana Martínez (ID004)' },
      { value: 'ID005', label: 'Luis Hernández (ID005)' }
    ]
  }
]

// Combined sensors
const telemetrySensors = [...systemTelemetrySensors, ...customTelemetrySensors]

const operatorOptions = [
  { value: 'eq', label: 'es igual a', symbol: '=' },
  { value: 'neq', label: 'es distinto de', symbol: '≠' },
  { value: 'gt', label: 'es mayor que', symbol: '>' },
  { value: 'lt', label: 'es menor que', symbol: '<' },
  { value: 'gte', label: 'es igual o mayor que', symbol: '≥' },
  { value: 'lte', label: 'es igual o menor que', symbol: '≤' },
  { value: 'contains', label: 'contiene', symbol: '∋' },
  { value: 'not_contains', label: 'no contiene', symbol: '∌' }
]

// Helper function to render condition value
const formatConditionValue = (condition: any) => {
  const sensor = telemetrySensors.find(s => s.value === condition.sensor)
  const operator = operatorOptions.find(op => op.value === condition.operator)
  
  if (!sensor || !operator) return ''
  
  let displayValue = condition.value
  
  // For sensors with options (boolean/string types), show the label
  if (sensor.options) {
    const option = sensor.options.find(opt => opt.value === condition.value)
    if (option) {
      displayValue = option.label
    }
  } else if (sensor.unit && condition.value) {
    displayValue = `${condition.value} ${sensor.unit}`
  }
  
  return `${sensor.label} ${operator.symbol || operator.label} ${displayValue}`
}

// Helper function to render condition groups
const renderConditionGroups = (rule: Rule) => {
  // Use conditionGroups if available, otherwise create from legacy conditions
  let groups: RuleConditionGroup[] = []
  
  if (rule.conditionGroups && rule.conditionGroups.length > 0) {
    groups = rule.conditionGroups
  } else if (rule.conditions && rule.conditions.length > 0) {
    // Convert legacy conditions to group format
    groups = [{
      id: 'legacy-group',
      conditions: rule.conditions,
      groupLogicOperator: 'and',
      betweenGroupOperator: 'and'
    }]
  }
  
  if (groups.length === 0) {
    return (
      <p className="text-[14px] text-muted-foreground">
        No hay condiciones configuradas para esta regla.
      </p>
    )
  }
  
  return (
    <div className="space-y-4 mb-6">
      {groups.map((group, index) => (
        <div key={group.id}>
          <div className="flex items-center gap-1 mb-2">
            <span className="text-[14px] text-foreground">Grupo {index + 1}:</span>
            <span className={`text-[14px] font-medium ${
              group.groupLogicOperator === 'and' ? 'text-blue-600' : 'text-orange-600'
            }`}>
              {group.groupLogicOperator === 'and' ? 'Todas' : 'Cualquiera'}
            </span>
            <span className="text-[14px] text-foreground">
              {group.groupLogicOperator === 'and' ? 'deben cumplirse' : 'puede cumplirse'}
            </span>
          </div>
          <div className="ml-4 space-y-1">
            {group.conditions.map((condition, condIndex) => (
              <div key={condition.id} className="text-[14px] text-muted-foreground">
                - {formatConditionValue(condition)}
              </div>
            ))}
          </div>
        </div>
      ))}
      
      {groups.length > 1 && (
        <p className="text-[14px] text-muted-foreground">
          La regla se activará cuando se cumplan las condiciones de{' '}
          {groups.map((group, index) => {
            if (index === groups.length - 1 && index > 0) {
              return `${group.betweenGroupOperator === 'and' ? 'y' : 'o'} Grupo ${index + 1}`
            }
            return `Grupo ${index + 1}`
          }).join(', ')}.
        </p>
      )}
    </div>
  )
}

// Function to replace variables with realistic example values
const processMessageVariablesClean = (text: string | undefined): string => {
  if (!text) return ''
  
  const variableMap: Record<string, string> = {
    '{{nombreUnidad}}': 'Vehículo ABC-123',
    '{{fechaEvento}}': '27 de septiembre 2025',
    '{{horaEvento}}': '14:35:42',
    '{{tipoEvento}}': 'Exceso de velocidad',
    '{{ubicacion}}': 'Av. Providencia 1234, Santiago',
    '{{velocidad}}': '85 km/h',
    '{{velocidadMaxima}}': '60 km/h',
    '{{conductor}}': 'Juan Pérez',
    '{{zona}}': 'Centro de Santiago',
    '{{duracion}}': '5 minutos',
    '{{kilometraje}}': '45,230 km',
    '{{combustible}}': '65%',
    '{{temperatura}}': '23°C',
    '{{empresa}}': 'Transportes ABC',
    '{{supervisor}}': 'María González'
  }
  
  let processedText = text
  
  // Replace all variables found in the text
  Object.entries(variableMap).forEach(([variable, value]) => {
    const regex = new RegExp(variable.replace(/[{}]/g, '\\$&'), 'g')
    processedText = processedText.replace(regex, value)
  })
  
  return processedText
}

const severityConfig = {
  high: { 
    label: 'Alta', 
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
    iconColor: 'text-red-500',
    icon: AlertTriangle
  },
  medium: { 
    label: 'Media', 
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-700',
    iconColor: 'text-orange-500',
    icon: AlertTriangle
  },
  low: { 
    label: 'Baja', 
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    iconColor: 'text-blue-500',
    icon: AlertTriangle
  },
  informative: { 
    label: 'Informativo', 
    bgColor: 'bg-cyan-100',
    textColor: 'text-cyan-700',
    iconColor: 'text-cyan-500',
    icon: AlertTriangle
  }
}

const responsibleProfiles: Record<string, { name: string; email: string; avatar: string }> = {
  'mariana.manzo@numaris.com': {
    name: 'Mariana Manzo',
    email: 'mariana.manzo@numaris.com',
    avatar: 'https://images.unsplash.com/photo-1652471949169-9c587e8898cd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHdvbWFuJTIwcHJvZmVzc2lvbmFsJTIwaGVhZHNob3R8ZW58MXx8fHwxNzU4NjIzODAyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
  },
  'juan.perez@numaris.com': {
    name: 'Juan Pérez',
    email: 'juan.perez@numaris.com',
    avatar: 'https://images.unsplash.com/photo-1652471943570-f3590a4e52ed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMG1hbiUyMHByb2Zlc3Npb25hbCUyMGhlYWRzaG90fGVufDF8fHx8MTc1ODYwNDk4M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
  },
  'ana.garcia@numaris.com': {
    name: 'Ana García',
    email: 'ana.garcia@numaris.com',
    avatar: 'https://images.unsplash.com/photo-1581065178047-8ee15951ede6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMGJ1c2luZXNzJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzU4NjE2NTgwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
  },
  'carlos.rodriguez@numaris.com': {
    name: 'Carlos Rodríguez',
    email: 'carlos.rodriguez@numaris.com',
    avatar: 'https://images.unsplash.com/photo-1752778935828-bf6fdd5a834a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3Jwb3JhdGUlMjBleGVjdXRpdmUlMjBoZWFkc2hvdCUyMGxhdGlub3xlbnwxfHx8fDE3NTg2NTExNzR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
  },
  'supervisor-flota': {
    name: 'Supervisor de Flota',
    email: 'supervisor@numaris.com',
    avatar: 'https://images.unsplash.com/photo-1524538198441-241ff79d153b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMGV4ZWN1dGl2ZSUyMHByb2Zlc3Npb25hbCUyMG1hbnxlbnwxfHx8fDE3NTg2NTExODF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
  },
  'jefe-seguridad': {
    name: 'Jefe de Seguridad',
    email: 'seguridad@numaris.com',
    avatar: 'https://images.unsplash.com/photo-1755033016-0ed3cef4ad61?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMG1hbiUyMHByb2Zlc3Npb25hbCUyMGV4ZWN1dGl2ZXxlbnwxfHx8fDE3NTg2NDIwNjJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
  },
  'supervisor-logistica': {
    name: 'Supervisor de Logística',
    email: 'logistica@numaris.com',
    avatar: 'https://images.unsplash.com/photo-1745053227142-bbabcf52b92c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHdvbWFuJTIwcHJvZmVzc2lvbmFsfGVufDF8fHx8MTc1ODY0NzI1NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
  },
  'coordinador-operaciones': {
    name: 'Coordinador de Operaciones',
    email: 'operaciones@numaris.com',
    avatar: 'https://images.unsplash.com/photo-1524538198441-241ff79d153b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMG1hbiUyMHByY2Zlc3Npb25hbCUyMGV4ZWN1dGl2ZXxlbnwxfHx8fDE3NTg2NDIwNjJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
  }
}

interface RulesReadOnlyProps {
  rule: Rule
  onBack: () => void
  events: Event[]
  onStatusChange?: (ruleId: string, newStatus: 'active' | 'inactive') => void
  onEdit?: (rule: Rule) => void
  onDelete?: (ruleId: string) => void
  onRename?: (ruleId: string, newName: string, newDescription?: string) => void
}

export function RulesReadOnly({ rule, onBack, events, onStatusChange, onEdit, onDelete, onRename }: RulesReadOnlyProps) {
  const [sidebarActiveItem, setSidebarActiveItem] = useState('regla')
  const [activeMainTab, setActiveMainTab] = useState('informacion-general')
  
  // Helper function to render email recipients dynamically
  const renderEmailRecipients = (recipients: string[]) => {
    if (recipients.length === 0) return null
    
    const visibleRecipients = recipients.slice(0, 3)
    const remainingCount = recipients.length - 3
    
    return (
      <div className="flex flex-wrap gap-1 p-0 overflow-hidden" style={{ maxHeight: '3rem' }}>
        {visibleRecipients.map((recipient, index) => (
          <Badge key={index} variant="secondary" className="text-xs font-semibold mr-0">
            {recipient}
          </Badge>
        ))}
        {remainingCount > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="secondary" className="text-xs font-semibold cursor-help mr-0">
                  +{remainingCount}
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-slate-800 text-white border-slate-700 p-3 max-w-xs">
                <div className="space-y-1">
                  <div className="font-semibold text-sm mb-2">Destinatarios adicionales:</div>
                  {recipients.slice(3).map((recipient, index) => (
                    <div key={index} className="text-sm">{recipient}</div>
                  ))}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    )
  }

  // Helper function to render units dynamically
  const renderUnits = (unitIds: string[]) => {
    if (unitIds.length === 0) return (
      <span className="text-[12px] text-muted-foreground">Todas las unidades</span>
    )
    
    const visibleUnits = unitIds.slice(0, 6)
    const remainingCount = unitIds.length - 6
    
    return (
      <div className="flex flex-wrap gap-2">
        {visibleUnits.map((unitId, index) => {
          const unitNumber = unitId.split('-')[1] || (index + 1)
          const vehicleCode = `T-${unitNumber}-${123 + parseInt(unitNumber)}`
          return (
            <Badge key={index} variant="secondary" className="text-[12px] bg-blue-100 text-blue-700 hover:bg-blue-200">
              {vehicleCode}
            </Badge>
          )
        })}
        {remainingCount > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="secondary" className="text-[12px] bg-blue-100 text-blue-700 hover:bg-blue-200 cursor-help">
                  +{remainingCount}
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-slate-800 text-white border-slate-700 p-3 max-w-xs">
                <div className="space-y-1">
                  <div className="font-semibold text-sm mb-2">Unidades adicionales:</div>
                  <div className="grid grid-cols-2 gap-1 max-h-32 overflow-y-auto">
                    {unitIds.slice(6).map((unitId, index) => {
                      const unitNumber = unitId.split('-')[1] || (index + 7)
                      const vehicleCode = `T-${unitNumber}-${123 + parseInt(unitNumber)}`
                      return (
                        <div key={index} className="text-sm">{vehicleCode}</div>
                      )
                    })}
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    )
  }

  // Helper function to render tags dynamically
  const renderTagsList = (tagIds: string[], bgColor = "bg-purple-100", textColor = "text-purple-700", hoverColor = "hover:bg-purple-200") => {
    if (tagIds.length === 0) return (
      <span className="text-[12px] text-muted-foreground">Sin etiquetas específicas</span>
    )
    
    const visibleTags = tagIds.slice(0, 6)
    const remainingCount = tagIds.length - 6
    
    return (
      <div className="flex flex-wrap gap-2">
        {visibleTags.map((tagId, index) => {
          const tagName = tagId.replace('-', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
          return (
            <Badge key={index} variant="secondary" className={`text-[12px] ${bgColor} ${textColor} ${hoverColor}`}>
              {tagName}
            </Badge>
          )
        })}
        {remainingCount > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="secondary" className={`text-[12px] ${bgColor} ${textColor} ${hoverColor} cursor-help`}>
                  +{remainingCount}
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-slate-800 text-white border-slate-700 p-3 max-w-xs">
                <div className="space-y-1">
                  <div className="font-semibold text-sm mb-2">Etiquetas adicionales:</div>
                  <div className="grid grid-cols-1 gap-1 max-h-32 overflow-y-auto">
                    {tagIds.slice(6).map((tagId, index) => {
                      const tagName = tagId.replace('-', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
                      return (
                        <div key={index} className="text-sm">{tagName}</div>
                      )
                    })}
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    )
  }
  const [activeSubTab, setActiveSubTab] = useState('parametros')
  const [configAvanzadaOpen, setConfigAvanzadaOpen] = useState(true)
  const [newNote, setNewNote] = useState("")
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showRenameModal, setShowRenameModal] = useState(false)

  // Debug effect to track rule changes
  useEffect(() => {
    console.log('RulesReadOnly received rule update:', rule.id, rule.updatedAt, rule)
  }, [rule])

  const severityInfo = severityConfig[rule.eventSettings.severity]
  const SeverityIcon = severityInfo.icon

  const sidebarItems = [
    { id: 'contenido', label: 'Contenido', icon: FileText },
    { id: 'regla', label: 'Regla', icon: Settings },
    { id: 'notas', label: 'Notas', icon: MessageSquare },
    { id: 'eventos', label: 'Eventos', icon: FileText },
    { id: 'etiquetas', label: 'Etiquetas', icon: Tag }
  ]

  const formatConditions = () => {
    if (rule.conditions.length === 0) return "No hay condiciones definidas"
    
    return rule.conditions.map((condition, index) => {
      const prefix = index === 0 ? 'SI' : 'Y'
      return `${prefix} [${condition.sensor}] ${condition.operator} ${condition.value}`
    }).join('\n')
  }

  const getUnitsDescription = () => {
    if (rule.appliesTo.type === 'units') {
      const count = rule.appliesTo.units?.length || 0
      if (count === 0) return 'Todas las unidades'
      return `${count} unidad${count !== 1 ? 'es' : ''} seleccionada${count !== 1 ? 's' : ''}`
    } else {
      const count = rule.appliesTo.tags?.length || 0
      return `${count} etiqueta${count !== 1 ? 's' : ''} seleccionada${count !== 1 ? 's' : ''}`
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">
      {/* Header */}
      <div className="border-b border-border bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="p-1"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-[16px] text-foreground">{rule.name}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline"
              className="text-[14px] px-4 py-2 h-9 font-normal"
              onClick={() => onEdit?.(rule)}
            >
              Editar
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="p-2 text-gray-600 hover:text-gray-900 cursor-pointer"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  className="flex items-center gap-2"
                  onClick={() => setShowRenameModal(true)}
                >
                  <Edit className="w-4 h-4" />
                  <span className="pt-[0px] pr-[0px] pb-[0px] pl-[20px]">Renombrar</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="flex items-center gap-2"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    if (onStatusChange) {
                      const newStatus = rule.status === 'active' ? 'inactive' : 'active'
                      console.log('Changing rule status from', rule.status, 'to', newStatus)
                      onStatusChange(rule.id, newStatus)
                    }
                  }}
                >
                  <div className="w-4 h-4 flex items-center justify-center">
                    <Switch 
                      checked={rule.status === 'active'} 
                      className="switch-blue scale-75 pointer-events-none"
                    />
                  </div>
                  <span className="pt-[0px] pr-[0px] pb-[0px] pl-[20px]">
                    {rule.status === 'active' ? 'Desactivar regla' : 'Activar regla'}
                  </span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="flex items-center gap-2 text-destructive"
                  onClick={() => setShowDeleteModal(true)}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                  <span className="pt-[0px] pr-[0px] pb-[0px] pl-[20px]">Eliminar regla</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            {/* Main Tabs */}
            <div className="border-b border-border mb-6">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveMainTab('informacion-general')}
                  className={`py-2 px-1 border-b-2 font-medium text-[14px] ${
                    activeMainTab === 'informacion-general'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                  }`}
                >
                  Información general
                </button>
                <button
                  onClick={() => setActiveMainTab('historial-registro')}
                  className={`py-2 px-1 border-b-2 font-medium text-[14px] ${
                    activeMainTab === 'historial-registro'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                  }`}
                >
                  Historial del registro
                </button>
              </nav>
            </div>

            {activeMainTab === 'informacion-general' && (
              <>
                <div className="bg-white rounded-lg border p-6">
                  <div>
                    <h2 className="text-[16px] text-foreground mb-6">Información general</h2>
                    
                    {/* Sub Tabs */}
                    <div className="border-b border-border mb-6">
                      <nav className="-mb-px flex space-x-8">
                        <button
                          onClick={() => setActiveSubTab('parametros')}
                          className={`py-2 px-1 border-b-2 font-medium text-[14px] ${
                            activeSubTab === 'parametros'
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                          }`}
                        >
                          Parámetros
                        </button>
                        <button
                          onClick={() => setActiveSubTab('acciones')}
                          className={`py-2 px-1 border-b-2 font-medium text-[14px] ${
                            activeSubTab === 'acciones'
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                          }`}
                        >
                          Acciones a realizar
                        </button>
                        <button
                          onClick={() => setActiveSubTab('notificaciones')}
                          className={`py-2 px-1 border-b-2 font-medium text-[14px] ${
                            activeSubTab === 'notificaciones'
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                          }`}
                        >
                          Notificaciones
                        </button>
                      </nav>
                    </div>

                    {activeSubTab === 'parametros' && (
                      <div className="space-y-6">
                        {/* Parámetros a evaluar */}
                        <div className="bg-white rounded-lg border p-6">
                          <div className="flex items-center gap-2 mb-4">
                            <Settings className="w-4 h-4 text-muted-foreground" />
                            <h3 className="text-[16px] text-foreground font-medium">Parámetros a evaluar</h3>
                          </div>
                          <span className="text-[14px] font-semibold text-foreground block mb-3">Condiciones de activación:</span>

                          {/* Condiciones de la regla - dinámicas */}
                          {renderConditionGroups(rule)}
                        </div>

                        {/* Aplica esta regla a */}
                        <div className="bg-white rounded-lg border p-6">
                          <div className="flex items-center gap-2 mb-4">
                            <Settings className="w-4 h-4 text-muted-foreground" />
                            <h3 className="text-[16px] text-foreground font-medium">Aplica esta regla a</h3>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-6">
                            {/* Columna de Unidades */}
                            <div>
                              <span className="text-[14px] font-semibold text-foreground block mb-3">Unidades:</span>
                              {rule.appliesTo.type === 'units' ? (
                                renderUnits(rule.appliesTo.units || [])
                              ) : (
                                <span className="text-[12px] text-muted-foreground">Sin unidades específicas</span>
                              )}
                            </div>

                            {/* Columna de Etiquetas */}
                            <div>
                              <span className="text-[14px] font-semibold text-foreground block mb-3">Etiquetas:</span>
                              {rule.appliesTo.type === 'tags' ? (
                                renderTagsList(rule.appliesTo.tags || [])
                              ) : (
                                <span className="text-[12px] text-muted-foreground">Sin etiquetas específicas</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Configuración avanzada */}
                        <div className="bg-white rounded-lg border p-6">
                          <Collapsible open={configAvanzadaOpen} onOpenChange={setConfigAvanzadaOpen}>
                            <CollapsibleTrigger className="flex items-center gap-2 w-full text-left">
                              <Settings className="w-4 h-4 text-muted-foreground" />
                              <h3 className="text-[16px] text-foreground font-medium">Configuración avanzada</h3>
                              {configAvanzadaOpen ? (
                                <ChevronDown className="w-4 h-4 text-muted-foreground ml-auto" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
                              )}
                            </CollapsibleTrigger>
                            <p className="text-[14px] text-muted-foreground mt-2 hidden">Define las zonas, cuándo debe evaluarse y la duración del evento</p>
                            <CollapsibleContent className="mt-4">
                              <div className="space-y-6">
                                {/* Primera fila: Zona geográfica + Zonas (condicional) */}
                                {rule.zoneScope.type === 'all' ? (
                                  <div>
                                    <span className="text-[14px] font-semibold text-foreground">Zona geográfica:</span>
                                    <div className="text-[14px] text-muted-foreground mt-1">
                                      En cualquier lugar
                                    </div>
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-2 gap-6">
                                    <div>
                                      <span className="text-[14px] font-semibold text-foreground">Zona geográfica:</span>
                                      <div className="text-[14px] text-muted-foreground mt-1">
                                        {rule.zoneScope.type === 'inside' 
                                          ? 'Dentro de una zona o grupo de zonas'
                                          : 'Fuera de una zona o grupo de zonas'}
                                      </div>
                                    </div>
                                    <div>
                                      <span className="text-[14px] font-semibold text-foreground">Zonas:</span>
                                      <div className="mt-1">
                                        {/* Zonas seleccionadas */}
                                        {rule.zoneScope.zones && rule.zoneScope.zones.length > 0 ? (
                                          <div className="flex flex-wrap gap-2">
                                            {rule.zoneScope.zones.map((zoneId, index) => (
                                              <Badge key={`zone-${index}`} variant="secondary" className="text-[12px] bg-orange-100 text-orange-700 hover:bg-orange-200">
                                                Zona {zoneId.replace('zona-', '').toUpperCase()}
                                              </Badge>
                                            ))}
                                          </div>
                                        ) : (
                                          <span className="text-[12px] text-muted-foreground">Sin zonas seleccionadas</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Segunda fila: Etiquetas de zonas (solo si no es 'all') */}
                                {rule.zoneScope.type !== 'all' && (
                                  <div>
                                    <span className="text-[14px] font-semibold text-foreground">Etiquetas zonas:</span>
                                    <div className="mt-1">
                                      {rule.zoneScope.zoneTags && rule.zoneScope.zoneTags.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                          {rule.zoneScope.zoneTags.map((tag, index) => (
                                            <Badge key={`zone-tag-${index}`} variant="secondary" className="text-[12px] bg-blue-100 text-blue-700 hover:bg-blue-200">
                                              {tag}
                                            </Badge>
                                          ))}
                                        </div>
                                      ) : (
                                        <span className="text-[12px] text-muted-foreground">Sin etiquetas asignadas</span>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* Tercera fila: Generación de evento + Activación de la regla */}
                                <div className="grid grid-cols-2 gap-6">
                                  <div>
                                    <span className="text-[14px] font-semibold text-foreground">Generación de evento:</span>
                                    <div className="text-[14px] text-muted-foreground mt-1">
                                      {rule.eventSettings.eventTiming === 'despues-tiempo' 
                                        ? 'Después de cierto tiempo' 
                                        : 'Cuando se cumplan las condiciones'}
                                    </div>
                                  </div>
                                  <div>
                                    <span className="text-[14px] font-semibold text-foreground">Activación de la regla:</span>
                                    <div className="text-[14px] text-muted-foreground mt-1">
                                      {rule.schedule.type === 'always' 
                                        ? 'En todo momento' 
                                        : 'Personalizado'}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        </div>

                        {/* Etiquetas configuradas */}

                      </div>
                    )}

                    {activeSubTab === 'acciones' && (
                      <div className="space-y-6">
                        {/* Section 1 - Instrucciones a realizar */}
                        <div className="bg-white rounded-lg border p-6">
                          <div className="flex items-center gap-2 mb-4">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                            <h3 className="text-[16px] text-foreground font-medium">Instrucciones a realizar</h3>
                          </div>
                          
                          <div className="space-y-3">
                            <span className="text-[14px] font-semibold text-foreground block">Instrucciones:</span>
                            <div className="text-[14px] text-[rgba(113,113,130,1)]">
                              {rule.eventSettings.instructions || 'Sin instrucciones especiales configuradas'}
                            </div>
                          </div>
                        </div>

                        {/* Section 2 - Responsable del evento */}
                        <div className="bg-white rounded-lg border p-6">
                          <div className="flex items-center gap-2 mb-4">
                            <Settings className="w-4 h-4 text-muted-foreground" />
                            <h3 className="text-[16px] text-foreground font-medium">Responsable del evento</h3>
                          </div>
                          
                          <div className="space-y-3">
                            <span className="text-[14px] font-semibold text-foreground block">Asignar responsable:</span>
                            <div className="flex items-center gap-3">
                              {responsibleProfiles[rule.eventSettings.responsible] && (
                                <Avatar className="w-8 h-8">
                                  <AvatarImage 
                                    src={responsibleProfiles[rule.eventSettings.responsible].avatar}
                                    alt={responsibleProfiles[rule.eventSettings.responsible].name}
                                  />
                                  <AvatarFallback>
                                    {responsibleProfiles[rule.eventSettings.responsible].name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                              <div>
                                <div className="text-[14px] text-[rgba(113,113,130,1)]">
                                  {responsibleProfiles[rule.eventSettings.responsible]?.email || rule.eventSettings.responsible}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Section 3 - Clasificación del evento */}
                        <div className="bg-white rounded-lg border p-6">
                          <div className="flex items-center gap-2 mb-4">
                            <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                            <h3 className="text-[16px] text-foreground font-medium">Clasificación del evento</h3>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-6">
                            {/* Severidad del evento */}
                            <div>
                              <span className="text-[14px] font-semibold text-foreground block mb-3">Severidad del evento:</span>
                              <div className="flex items-center gap-3">
                                <div className={`flex items-center gap-2 px-3 py-1 rounded-md ${severityInfo.bgColor}`}>
                                  <SeverityIcon className={`w-4 h-4 ${severityInfo.iconColor}`} />
                                  <span className={`text-[14px] ${severityInfo.textColor}`}>
                                    {severityInfo.label}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Etiquetas del evento */}
                            <div>
                              <span className="text-[14px] font-semibold text-foreground block mb-3">Etiquetas del evento:</span>
                              {renderTagsList(rule.eventSettings.tags || [], "bg-green-100", "text-green-700", "hover:bg-green-200")}
                            </div>
                          </div>
                        </div>

                        {/* Section 4 - Cierre del evento */}
                        <div className="bg-white rounded-lg border p-6">
                          <div className="flex items-center gap-2 mb-4">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <h3 className="text-[16px] text-foreground font-medium">Cierre del evento</h3>
                          </div>
                          
                          <div className="space-y-3">
                            <span className="text-[14px] font-semibold text-foreground block">Cierre del evento:</span>
                            <div className="text-[14px] text-[rgba(113,113,130,1)]">
                              {rule.closePolicy.type === 'manual' ? 'Manualmente' : 
                               rule.closePolicy.type === 'auto-time' ? 'Automáticamente por tiempo' : 
                               'Automáticamente por condición'}
                              {rule.closePolicy.type === 'manual' && (
                                <span className="text-[12px] text-muted-foreground"> / Requiere nota al cerrar evento</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Section 5 - Asignar etiqueta a la unidad */}
                        <div className="bg-white rounded-lg border p-6">
                          <div className="flex items-center gap-2 mb-4">
                            <Tag className="w-4 h-4 text-muted-foreground" />
                            <h3 className="text-[16px] text-foreground font-medium">Asignar etiqueta a la unidad</h3>
                          </div>
                          
                          <div className="space-y-3">
                            <span className="text-[14px] font-semibold text-foreground block">Etiquetas asignadas:</span>
                            {renderTagsList(rule.eventSettings.unitTags || [], "bg-orange-100", "text-orange-700", "hover:bg-orange-200")}
                          </div>
                        </div>

                        {/* Section 5.1 - Desasignar etiqueta a la unidad */}
                        {rule.eventSettings.unitUntagsEnabled && (
                          <div className="bg-white rounded-lg border p-6">
                            <div className="flex items-center gap-2 mb-4">
                              <Tag className="w-4 h-4 text-muted-foreground" />
                              <h3 className="text-[16px] text-foreground font-medium">Desasignar etiqueta a la unidad</h3>
                            </div>
                            
                            <div className="space-y-3">
                              <span className="text-[14px] font-semibold text-foreground block">Etiquetas a desasignar:</span>
                              {renderTagsList(rule.eventSettings.unitUntags || [], "bg-red-100", "text-red-700", "hover:bg-red-200")}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {activeSubTab === 'notificaciones' && (
                      <div className="content-stretch flex flex-col gap-[21px] items-start relative size-full">
                        {/* Section 1 - Mensaje del evento */}
                        <div className="bg-white h-[155.5px] relative rounded-[8.75px] shrink-0 w-full">
                          <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[8.75px]" />
                          <div className="relative size-full">
                            <div className="box-border content-stretch flex flex-col gap-[14px] h-[155.5px] items-start pb-px pt-[22px] px-[22px] relative w-full">
                              {/* Header */}
                              <div className="content-stretch flex gap-[7px] h-[24px] items-center relative shrink-0 w-full">
                                <div className="relative shrink-0 size-[14px]">
                                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
                                    <g>
                                      <path d="M12.25 8.75C12.25 9.05942 12.1271 9.35616 11.9083 9.57496C11.6895 9.79375 11.3928 9.91667 11.0833 9.91667H4.08333L1.75 12.25V2.91667C1.75 2.60725 1.87292 2.3105 2.09171 2.09171C2.3105 1.87292 2.60725 1.75 2.91667 1.75H11.0833C11.3928 1.75 11.6895 1.87292 11.9083 2.09171C12.1271 2.3105 12.25 2.60725 12.25 2.91667V8.75Z" stroke="#717182" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
                                    </g>
                                  </svg>
                                </div>
                                <div className="h-[24px] relative shrink-0 w-[129.969px]">
                                  <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[24px] relative w-[129.969px]">
                                    <div className="absolute font-['Source_Sans_3:Medium',_sans-serif] font-medium leading-[0] left-0 text-[16px] text-neutral-950 text-nowrap top-0">
                                      <p className="leading-[24px] whitespace-pre">Mensaje del evento</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Content */}
                              <div className="content-stretch flex flex-col gap-[10.5px] h-[73.5px] items-start relative shrink-0 w-full">
                                <div className="content-stretch flex h-[21px] items-start relative shrink-0 w-full">
                                  <div className="basis-0 font-['Source_Sans_3:Regular',_sans-serif] font-normal grow leading-[0] min-h-px min-w-px relative shrink-0 text-[14px] text-neutral-950">
                                    <p className="leading-[21px] font-semibold">Mensaje del evento:</p>
                                  </div>
                                </div>
                                <div className="h-[42px] relative shrink-0 w-full">
                                  <div className="absolute font-['Source_Sans_3:Regular',_sans-serif] font-normal leading-[0] left-0 text-[14px] text-neutral-950 top-[-1px] w-[539px]">
                                    <p className="leading-[21px] whitespace-nowrap">
                                      <span className="text-[rgba(113,113,130,1)]">La unidad </span>
                                      <span className="font-['Source_Sans_3:SemiBold',_sans-serif] font-semibold text-[rgba(113,113,130,1)]">Unidad ABC-123</span>
                                      <span className="text-[rgba(113,113,130,1)]"> ha registrado una alerta en </span>
                                      <span className="font-['Source_Sans_3:SemiBold',_sans-serif] font-semibold text-[#1867ff] cursor-pointer">Av. Corrientes 1234, Buenos Aires</span>
                                      <span className="text-[rgba(113,113,130,1)]"> a las </span>
                                      <span className="font-['Source_Sans_3:SemiBold',_sans-serif] font-semibold text-[rgba(113,113,130,1)]">29/9/2025, 11:51:18 AM.</span>
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Section 2 - Canales de notificación */}
                        <div className="bg-white relative rounded-[8.75px] shrink-0 w-full">
                          <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[8.75px]" />
                          <div className="relative size-full">
                            <div className="box-border content-stretch flex flex-col gap-[14px] items-start px-[22px] py-[24px] relative w-full">
                              {/* Header */}
                              <div className="content-stretch flex gap-[7px] h-[24px] items-center relative shrink-0 w-full">
                                <MessageSquare className="w-[14px] h-[14px] text-muted-foreground" />
                                <div className="h-[24px] relative shrink-0 w-[156.984px]">
                                  <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[24px] relative w-[156.984px]">
                                    <div className="absolute font-['Source_Sans_3:Medium',_sans-serif] font-medium leading-[0] left-0 text-[16px] text-neutral-950 text-nowrap top-0">
                                      <p className="leading-[24px] whitespace-pre">Canales de notificación</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Notificación Web */}
                              <div className="bg-white relative rounded-[8.75px] shrink-0 w-full">
                                <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[8.75px]" />
                                <div className="flex flex-row items-center relative size-full">
                                  <div className="box-border content-stretch flex gap-[14px] items-center px-[22px] py-[8px] relative w-full">
                                    <div className="basis-0 content-stretch flex gap-[7px] grow h-[24px] items-center min-h-px min-w-px relative shrink-0">
                                      <Monitor className="w-[14px] h-[14px] text-muted-foreground" />
                                      <div className="h-[24px] relative shrink-0 w-[156.984px]">
                                        <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[24px] relative w-[156.984px]">
                                          <div className="absolute font-['Source_Sans_3:Medium',_sans-serif] font-medium leading-[0] left-0 text-[16px] text-neutral-950 text-nowrap top-0">
                                            <p className="leading-[24px] whitespace-pre text-[14px]">Notificación Web</p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="content-stretch flex items-start relative shrink-0">
                                      <div className="bg-[#1867ff] opacity-60 h-[16px] min-w-[28px] relative rounded-[16px] shrink-0 pointer-events-none">
                                        <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[2px] h-[16px] items-start min-w-inherit relative">
                                          <div className="box-border content-stretch flex gap-[2px] h-[16px] items-center justify-end overflow-clip p-[2px] relative shrink-0 w-[28px]">
                                            <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
                                              <div className="[grid-area:1_/_1] bg-white ml-0 mt-0 rounded-[16px] shadow-[0px_2px_4px_0px_rgba(0,35,11,0.2)] size-[12px]" />
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Notificación móvil */}
                              <div className="bg-white relative rounded-[8.75px] shrink-0 w-full">
                                <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[8.75px]" />
                                <div className="flex flex-row items-center relative size-full">
                                  <div className="box-border content-stretch flex gap-[14px] items-center px-[22px] py-[8px] relative w-full">
                                    <div className="basis-0 content-stretch flex gap-[7px] grow h-[24px] items-center min-h-px min-w-px relative shrink-0">
                                      <Smartphone className="w-[14px] h-[14px] text-muted-foreground" />
                                      <div className="h-[24px] relative shrink-0 w-[156.984px]">
                                        <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[24px] relative w-[156.984px]">
                                          <div className="absolute font-['Source_Sans_3:Medium',_sans-serif] font-medium leading-[0] left-0 text-[16px] text-neutral-950 text-nowrap top-0">
                                            <p className="leading-[24px] whitespace-pre text-[14px]">Notificación móvil</p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="content-stretch flex gap-[7px] h-[21px] items-center relative shrink-0">
                                      <div className="relative shrink-0">
                                        <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex items-start relative">
                                          <div className="bg-[rgba(0,0,0,0.25)] opacity-60 h-[16px] min-w-[28px] relative rounded-[16px] shrink-0 pointer-events-none">
                                            <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[2px] h-[16px] items-start min-w-inherit relative">
                                              <div className="box-border content-stretch flex gap-[2px] h-[16px] items-center overflow-clip p-[2px] relative shrink-0 w-[28px]">
                                                <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
                                                  <div className="[grid-area:1_/_1] bg-white ml-0 mt-0 rounded-[16px] shadow-[0px_2px_4px_0px_rgba(0,35,11,0.2)] size-[12px]" />
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Correo electr��nico */}
                              <div className="bg-white relative rounded-[8.75px] shrink-0 w-full">
                                <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[8.75px]" />
                                <div className="flex flex-col justify-center relative size-full">
                                  <div className="box-border content-stretch flex flex-col gap-[14px] items-start justify-center px-[22px] py-[8px] relative w-full">
                                    {/* Header with switch */}
                                    <div className="content-stretch flex gap-[14px] items-center relative shrink-0 w-full">
                                      <div className="basis-0 content-stretch flex gap-[7px] grow h-[24px] items-center min-h-px min-w-px relative shrink-0">
                                        <Mail className="w-[14px] h-[14px] text-muted-foreground" />
                                        <div className="h-[24px] relative shrink-0 w-[156.984px]">
                                          <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[24px] relative w-[156.984px]">
                                            <div className="absolute font-['Source_Sans_3:Medium',_sans-serif] font-medium leading-[0] left-0 text-[16px] text-neutral-950 text-nowrap top-0">
                                              <p className="leading-[24px] whitespace-pre text-[14px]">Correo electrónico</p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="content-stretch flex gap-[7px] h-[21px] items-center relative shrink-0">
                                        <div className="relative shrink-0">
                                          <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex items-start relative">
                                            <div className={`${rule.notifications.email.enabled ? 'bg-[#1867ff]' : 'bg-[rgba(0,0,0,0.25)]'} opacity-60 h-[16px] min-w-[28px] relative rounded-[16px] shrink-0 pointer-events-none`}>
                                              <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border content-stretch flex gap-[2px] h-[16px] items-center justify-end min-w-inherit relative">
                                                <div className={`box-border content-stretch flex gap-[2px] h-[16px] items-center ${rule.notifications.email.enabled ? 'justify-end' : ''} overflow-clip p-[2px] relative shrink-0 w-[28px]`}>
                                                  <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
                                                    <div className="[grid-area:1_/_1] bg-white ml-0 mt-0 rounded-[16px] shadow-[0px_2px_4px_0px_rgba(0,35,11,0.2)] size-[12px]" />
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {/* Fields - only show if email is enabled */}
                                    {rule.notifications.email.enabled && (
                                      <div className="content-stretch flex gap-[7px] items-start relative shrink-0 w-full">
                                        {/* Destinatario */}
                                        <div className="basis-0 grow min-h-px min-w-px relative shrink-0">
                                          <div className="text-[14px] text-neutral-950 mb-1 font-semibold">
                                            Destinatario:
                                          </div>
                                          {renderEmailRecipients(rule.notifications.email.recipients)}
                                        </div>
                                        
                                        {/* Asunto */}
                                        <div className="basis-0 grow min-h-px min-w-px relative shrink-0">
                                          <div className="text-[14px] text-neutral-950 mb-1 font-semibold">
                                            Asunto:
                                          </div>
                                          <div className="text-[14px] text-[rgba(113,113,130,1)] font-semibold">
                                            {rule.notifications.email.subject}
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Section 3 - Webhook */}
                        <div className="bg-white h-[134.5px] relative rounded-[8.75px] shrink-0 w-full">
                          <div aria-hidden="true" className="absolute border border-[rgba(0,0,0,0.1)] border-solid inset-0 pointer-events-none rounded-[8.75px]" />
                          <div className="relative size-full">
                            <div className="box-border content-stretch flex flex-col gap-[14px] h-[134.5px] items-start pb-px pt-[22px] px-[22px] relative w-full">
                              {/* Header */}
                              <div className="content-stretch flex gap-[7px] h-[24px] items-center relative shrink-0 w-full">
                                <div className="relative shrink-0 size-[14px]">
                                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
                                    <g>
                                      <path d="M7 8.75C7.9665 8.75 8.75 7.9665 8.75 7C8.75 6.0335 7.9665 5.25 7 5.25C6.0335 5.25 5.25 6.0335 5.25 7C5.25 7.9665 6.0335 8.75 7 8.75Z" stroke="#717182" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
                                      <path d="M7.12833 1.16667H6.87167C6.56225 1.16667 6.2655 1.28958 6.04671 1.50838C5.82792 1.72717 5.705 2.02391 5.705 2.33333V2.43833C5.70479 2.64292 5.65078 2.84386 5.5484 3.02099C5.44601 3.19812 5.29885 3.34521 5.12167 3.4475L4.87083 3.59333C4.69348 3.69573 4.49229 3.74964 4.2875 3.74964C4.08271 3.74964 3.88152 3.69573 3.70417 3.59333L3.61667 3.54667C3.34896 3.39224 3.03091 3.35034 2.73234 3.43018C2.43377 3.51002 2.17907 3.70506 2.02417 3.9725L1.89583 4.19417C1.7414 4.46188 1.69951 4.77993 1.77935 5.0785C1.85918 5.37707 2.05423 5.63176 2.32167 5.78667L2.40917 5.845C2.5855 5.9468 2.73211 6.09297 2.83445 6.26899C2.93678 6.445 2.99127 6.64473 2.9925 6.84833V7.14583C2.99332 7.35141 2.9398 7.55356 2.83736 7.7318C2.73492 7.91004 2.58721 8.05805 2.40917 8.16083L2.32167 8.21333C2.05423 8.36824 1.85918 8.62293 1.77935 8.9215C1.69951 9.22007 1.7414 9.53812 1.89583 9.80583L2.02417 10.0275C2.17907 10.2949 2.43377 10.49 2.73234 10.5698C3.03091 10.6497 3.34896 10.6078 3.61667 10.4533L3.70417 10.4067C3.88152 10.3043 4.08271 10.2504 4.2875 10.2504C4.49229 10.2504 4.69348 10.3043 4.87083 10.4067L5.12167 10.5525C5.29885 10.6548 5.44601 10.8019 5.5484 10.979C5.65078 11.1561 5.70479 11.3571 5.705 11.5617V11.6667C5.705 11.9761 5.82792 12.2728 6.04671 12.4916C6.2655 12.7104 6.56225 12.8333 6.87167 12.8333H7.12833C7.43775 12.8333 7.7345 12.7104 7.95329 12.4916C8.17208 12.2728 8.295 11.9761 8.295 11.6667V11.5617C8.29521 11.3571 8.34922 11.1561 8.4516 10.979C8.55399 10.8019 8.70115 10.6548 8.87833 10.5525L9.12917 10.4067C9.30652 10.3043 9.50771 10.2504 9.7125 10.2504C9.91729 10.2504 10.1185 10.3043 10.2958 10.4067L10.3833 10.4533C10.651 10.6078 10.9691 10.6497 11.2677 10.5698C11.5662 10.49 11.8209 10.2949 11.9758 10.0275L12.1042 9.8C12.2586 9.53229 12.3005 9.21424 12.2207 8.91567C12.1408 8.6171 11.9458 8.36241 11.6783 8.2075L11.5908 8.16083C11.4128 8.05805 11.2651 7.91004 11.1626 7.7318C11.0602 7.55356 11.0067 7.35141 11.0075 7.14583V6.85417C11.0067 6.64859 11.0602 6.44644 11.1626 6.2682C11.2651 6.08996 11.4128 5.94196 11.5908 5.83917L11.6783 5.78667C11.9458 5.63176 12.1408 5.37707 12.2207 5.0785C12.3005 4.77993 12.2586 4.46188 12.1042 4.19417L11.9758 3.9725C11.8209 3.70506 11.5662 3.51002 11.2677 3.43018C10.9691 3.35034 10.651 3.39224 10.3833 3.54667L10.2958 3.59333C10.1185 3.69573 9.91729 3.74964 9.7125 3.74964C9.50771 3.74964 9.30652 3.69573 9.12917 3.59333L8.87833 3.4475C8.70115 3.34521 8.55399 3.19812 8.4516 3.02099C8.34922 2.84386 8.29521 2.64292 8.295 2.43833V2.33333C8.295 2.02391 8.17208 1.72717 7.95329 1.50838C7.7345 1.28958 7.43775 1.16667 7.12833 1.16667Z" stroke="#717182" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
                                    </g>
                                  </svg>
                                </div>
                                <div className="h-[24px] relative shrink-0 w-[64.063px]">
                                  <div className="bg-clip-padding border-0 border-[transparent] border-solid box-border h-[24px] relative w-[64.063px]">
                                    <div className="absolute font-['Source_Sans_3:Medium',_sans-serif] font-medium leading-[0] left-0 text-[16px] text-neutral-950 text-nowrap top-0">
                                      <p className="leading-[24px] whitespace-pre">Webhook</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Content */}
                              <div className="content-stretch flex flex-col gap-[10.5px] h-[52.5px] items-start relative shrink-0 w-full">
                                <div className="content-stretch flex h-[21px] items-start relative shrink-0 w-full">
                                  <div className="basis-0 font-['Source_Sans_3:Regular',_sans-serif] font-normal grow leading-[0] min-h-px min-w-px relative shrink-0 text-[14px] text-neutral-950">
                                    <p className="leading-[21px] font-semibold">URL del webhook:</p>
                                  </div>
                                </div>
                                <div className="content-stretch flex h-[21px] items-start relative shrink-0 w-full">
                                  <div className="basis-0 font-['Source_Sans_3:Regular',_sans-serif] font-normal grow leading-[0] min-h-px min-w-px relative shrink-0 text-[14px] text-neutral-950">
                                    <p className="leading-[21px] text-[rgba(113,113,130,1)]">https://api.miwebhook.com/alerta</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {activeMainTab === 'historial-registro' && (
              <div className="bg-white rounded-lg border p-6">
                <h2 className="text-[16px] text-foreground mb-6">Historial del registro</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[14px] text-foreground">Regla creada</span>
                        <span className="text-[12px] text-muted-foreground">
                          {rule.createdAt.toLocaleDateString('es-ES', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className="text-[14px] text-muted-foreground">Por {rule.owner}</p>
                    </div>
                  </div>
                  
                  {rule.updatedAt.getTime() !== rule.createdAt.getTime() && (
                    <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[14px] text-foreground">Regla modificada</span>
                          <span className="text-[12px] text-muted-foreground">
                            {rule.updatedAt.toLocaleDateString('es-ES', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <p className="text-[14px] text-muted-foreground">Por {rule.owner}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <DeleteRuleModal
          ruleName={rule.name}
          onConfirm={() => {
            onDelete?.(rule.id)
            setShowDeleteModal(false)
            onBack()
          }}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}

      {/* Rename Modal */}
      {showRenameModal && (
        <RenameRuleModal
          rule={rule}
          onConfirm={(newName, newDescription) => {
            onRename?.(rule.id, newName, newDescription)
            setShowRenameModal(false)
          }}
          onCancel={() => setShowRenameModal(false)}
        />
      )}
    </div>
  )
}