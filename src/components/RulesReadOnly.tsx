import React, { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Textarea } from "./ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
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
import { userEmailTemplates } from "../constants/emailTemplates"
import { DeleteRuleModal } from "./DeleteRuleModal"
import { RenameRuleModal } from "./RenameRuleModal"
import exampleImage from 'figma:asset/25905393c492af8c8e0b3cf142e20c9dc3cbe9e4.png'
import SectionCard from "./SectionCard"

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

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string')

const highlightEmailTemplateMessage = (text: string) => {
  if (!text) {
    return (
      <span className="text-[12px] text-muted-foreground">
        No se definió un mensaje para el correo.
      </span>
    )
  }

  const tokenRegex = /(\{\{[^}]+\}\}|\{[^}]+\})/g
  const parts = text.split(tokenRegex)
  const tokens = text.match(tokenRegex) || []
  let tokenIndex = 0
  const nodes: React.ReactNode[] = []

  parts.forEach((part, index) => {
    if (part) {
      nodes.push(<React.Fragment key={`text-${index}`}>{part}</React.Fragment>)
    }

    if (tokenIndex < tokens.length) {
      const token = tokens[tokenIndex++]
      nodes.push(
        <span
          key={`token-${index}`}
          className="inline-flex items-center rounded-sm bg-purple-100 px-1 py-0.5 text-[12px] font-semibold text-purple-700"
        >
          {token}
        </span>
      )
    }
  })

  return (
    <div className="whitespace-pre-wrap text-[13px] leading-relaxed text-[#313655]">
      {nodes}
    </div>
  )
}
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

  const renderEmailSenders = (senders: string[]) => {
    if (senders.length === 0) {
      return <span className="text-[12px] text-muted-foreground">No hay remitentes configurados.</span>
    }

    return (
      <div className="flex flex-wrap gap-2">
        {senders.map((sender) => (
          <Badge key={sender} variant="secondary" className="text-[12px] font-semibold bg-slate-100 text-slate-700">
            {sender}
          </Badge>
        ))}
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

  const emailSettings = rule.notifications.email
  const emailRecipients = emailSettings?.recipients || []
  const emailTemplate = emailSettings?.templateId
    ? userEmailTemplates.find((template) => template.id === emailSettings.templateId)
    : undefined
  const rawEmailSubject = emailSettings?.subject?.trim() || ''
  const emailSubjectDisplay = emailTemplate?.subject || rawEmailSubject || 'Sin asunto definido'
  const emailMessageContent = emailTemplate?.message || emailSettings?.body || ''

  const emailSettingsRecord = emailSettings as unknown as Record<string, unknown> | undefined
  const emailSendersFromSettings = emailSettingsRecord && isStringArray(emailSettingsRecord['sender'])
    ? (emailSettingsRecord['sender'] as string[])
    : undefined
  const emailSenders = emailSendersFromSettings?.length
    ? emailSendersFromSettings
    : emailTemplate?.sender?.length
      ? emailTemplate.sender
      : []

  const notificationChannels = [
    {
      id: 'web',
      label: 'Notificación web',
      description: 'Visible en la plataforma de monitorización',
      enabled: false,
      icon: Monitor
    },
    {
      id: 'mobile',
      label: 'Notificación móvil',
      description: 'Push notification en la app móvil (no configurada)',
      enabled: false,
      icon: Smartphone
    }
  ]

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
                <h2 className="text-[18px] text-foreground mb-6">Información general</h2>

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
                        onClick={() => setActiveSubTab('configuracion')}
                        className={`py-2 px-1 border-b-2 font-medium text-[14px] ${
                          activeSubTab === 'configuracion'
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                        }`}
                      >
                        Configuración
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
                  </nav>
                </div>

                {activeSubTab === 'parametros' && (
                    <div className="space-y-4">
                      <SectionCard
                        icon={<Settings className="w-4 h-4 text-muted-foreground" />}
                        title="Parámetros a evaluar"
                        description={<span className="text-[14px] font-medium text-foreground">Condiciones de activación</span>}
                      >
                        {renderConditionGroups(rule)}
                      </SectionCard>

                      <SectionCard
                        icon={<Tag className="w-4 h-4 text-muted-foreground" />}
                        title="Aplica esta regla a"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <span className="text-[14px] font-semibold text-foreground block mb-2">Unidades</span>
                            {rule.appliesTo.type === 'units' ? (
                              renderUnits(rule.appliesTo.units || [])
                            ) : (
                              <span className="text-[12px] text-muted-foreground">Sin unidades específicas</span>
                            )}
                          </div>
                          <div>
                            <span className="text-[14px] font-semibold text-foreground block mb-2">Etiquetas</span>
                            {rule.appliesTo.type === 'tags' ? (
                              renderTagsList(rule.appliesTo.tags || [])
                            ) : (
                              <span className="text-[12px] text-muted-foreground">Sin etiquetas específicas</span>
                            )}
                          </div>
                        </div>
                      </SectionCard>

                      <SectionCard
                        icon={<Settings className="w-4 h-4 text-muted-foreground" />}
                        title="Configuración avanzada"
                        headerExtra={
                          <button
                            type="button"
                            onClick={() => setConfigAvanzadaOpen((prev) => !prev)}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {configAvanzadaOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </button>
                        }
                        className="overflow-hidden"
                        contentClassName={configAvanzadaOpen ? 'pt-4 pb-0' : 'p-0'}
                      >
                        {configAvanzadaOpen && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
                            <div>
                              <span className="text-[14px] font-semibold text-foreground block mb-2">Zona geográfica</span>
                              <p className="text-[14px] text-muted-foreground">En cualquier lugar</p>
                            </div>
                            <div>
                              <span className="text-[14px] font-semibold text-foreground block mb-2">Activación de la regla</span>
                              <p className="text-[14px] text-muted-foreground">En todo momento</p>
                            </div>
                            <div>
                              <span className="text-[14px] font-semibold text-foreground block mb-2">Generación de evento</span>
                              <p className="text-[14px] text-muted-foreground">Cuando se cumplan las condiciones</p>
                            </div>
                            <div>
                              <span className="text-[14px] font-semibold text-foreground block mb-2">Cierre del evento</span>
                              <p className="text-[14px] text-muted-foreground">Cuando deje de cumplirse la condición</p>
                            </div>
                          </div>
                        )}
                      </SectionCard>
                    </div>
                  )}

                {activeSubTab === 'configuracion' && (
                    <div className="space-y-4">
                        <SectionCard
                          icon={<FileText className="w-4 h-4 text-muted-foreground" />}
                          title="Instrucciones a realizar"
                        >
                          <div className="space-y-3">
                            <span className="text-[14px] font-semibold text-foreground block">Instrucciones:</span>
                            <div className="text-[14px] text-[rgba(113,113,130,1)]">
                              {rule.eventSettings.instructions || 'Sin instrucciones especiales configuradas'}
                            </div>
                          </div>
                        </SectionCard>

                        <SectionCard
                          icon={<Settings className="w-4 h-4 text-muted-foreground" />}
                          title="Responsable del evento"
                        >
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
                              <div className="text-[14px] text-[rgba(113,113,130,1)]">
                                {responsibleProfiles[rule.eventSettings.responsible]?.email || rule.eventSettings.responsible}
                              </div>
                            </div>
                          </div>
                        </SectionCard>

                        <SectionCard
                          icon={<AlertTriangle className="w-4 h-4 text-muted-foreground" />}
                          title="Clasificación del evento"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                            <div>
                              <span className="text-[14px] font-semibold text-foreground block mb-3">Etiquetas del evento:</span>
                              {renderTagsList(rule.eventSettings.tags || [], "bg-green-100", "text-green-700", "hover:bg-green-200")}
                            </div>
                          </div>
                        </SectionCard>

                        <SectionCard
                          icon={<Clock className="w-4 h-4 text-muted-foreground" />}
                          title="Cierre del evento"
                        >
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
                        </SectionCard>

                        <SectionCard
                          icon={<Tag className="w-4 h-4 text-muted-foreground" />}
                          title="Asignar etiqueta a la unidad"
                        >
                          <div className="space-y-3">
                            <span className="text-[14px] font-semibold text-foreground block">Etiquetas asignadas:</span>
                            {renderTagsList(rule.eventSettings.unitTags || [], "bg-orange-100", "text-orange-700", "hover:bg-orange-200")}
                          </div>
                        </SectionCard>

                        {rule.eventSettings.unitUntagsEnabled && (
                          <SectionCard
                            icon={<Tag className="w-4 h-4 text-muted-foreground" />}
                            title="Desasignar etiqueta a la unidad"
                          >
                            <div className="space-y-3">
                              <span className="text-[14px] font-semibold text-foreground block">Etiquetas a desasignar:</span>
                              {renderTagsList(rule.eventSettings.unitUntags || [], "bg-red-100", "text-red-700", "hover:bg-red-200")}
                            </div>
                          </SectionCard>
                        )}
                      </div>
                  )}

                {activeSubTab === 'acciones' && (
                    <div className="space-y-4">
                      <SectionCard
                        icon={<MessageSquare className="w-4 h-4 text-muted-foreground" />}
                        title="Mensaje del evento"
                        description={<span className="text-[14px] font-medium text-foreground">Vista previa con variables dinámicas</span>}
                      >
                        {emailMessageContent ? (
                          <div className="rounded-lg border border-[#E5E9FF] bg-[#F8F9FF] p-4">
                            {highlightEmailTemplateMessage(emailMessageContent)}
                          </div>
                        ) : (
                          <p className="text-[14px] text-muted-foreground">
                            No hay mensaje configurado para este canal.
                          </p>
                        )}
                      </SectionCard>

                      <SectionCard
                        icon={<Monitor className="w-4 h-4 text-muted-foreground" />}
                        title="Canales de notificación"
                        description={<span className="text-[14px] font-medium text-foreground">Medios disponibles para este evento</span>}
                      >
                        <div className="space-y-6">
                          <div className="space-y-3">
                            {notificationChannels.map((channel) => (
                              <div key={channel.id} className="flex items-start justify-between rounded-md border border-border px-3 py-2">
                                <div className="flex items-center gap-3">
                                  <channel.icon className="w-4 h-4 text-muted-foreground" />
                                  <div>
                                    <span className="block text-[14px] font-semibold text-foreground">{channel.label}</span>
                                    <span className="text-[12px] text-muted-foreground">{channel.description}</span>
                                  </div>
                                </div>
                                <Switch
                                  checked={channel.enabled}
                                  disabled
                                  className="switch-blue pointer-events-none scale-90"
                                />
                              </div>
                            ))}
                          </div>

                          {emailSettings && (
                            <div className="rounded-lg border border-[#E5E9FF] bg-white shadow-sm">
                              <div className="flex items-center justify-between gap-3 border-b border-[#E5E9FF] bg-[#F8F9FF] px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <Mail className="w-4 h-4 text-muted-foreground" />
                                  <span className="text-[14px] font-semibold text-foreground">Correo electrónico</span>
                                </div>
                                <Switch
                                  checked={!!emailSettings.enabled}
                                  disabled
                                  className="switch-blue pointer-events-none scale-90"
                                />
                              </div>

                              <div className="space-y-6 p-4">
                                {emailSettings.enabled ? (
                                  <>
                                    <div className="grid gap-6 md:grid-cols-2">
                                      <div>
                                        <span className="text-[14px] font-semibold text-foreground block mb-2">Asunto</span>
                                        <p className="text-[14px] text-[rgba(113,113,130,1)]">{emailSubjectDisplay}</p>
                                      </div>
                                      <div>
                                        <span className="text-[14px] font-semibold text-foreground block mb-2">Destinatarios</span>
                                        {emailRecipients.length > 0 ? (
                                          renderEmailRecipients(emailRecipients)
                                        ) : (
                                          <span className="text-[12px] text-muted-foreground">No hay destinatarios configurados.</span>
                                        )}
                                      </div>
                                    </div>

                                    <div className="grid gap-6 md:grid-cols-2">
                                      <div>
                                        <span className="text-[14px] font-semibold text-foreground block mb-2">Remitentes</span>
                                        {renderEmailSenders(emailSenders)}
                                      </div>
                                      <div>
                                        <span className="text-[14px] font-semibold text-foreground block mb-2">Plantilla seleccionada</span>
                                        <p className="text-[14px] text-[rgba(113,113,130,1)]">
                                          {emailTemplate ? emailTemplate.name : 'Sin plantilla asociada'}
                                        </p>
                                        {emailTemplate?.description && (
                                          <p className="text-[12px] text-muted-foreground mt-1">
                                            {emailTemplate.description}
                                          </p>
                                        )}
                                      </div>
                                    </div>

                                    <div className="space-y-2 rounded-lg border border-[#E5E9FF] bg-[#F8F9FF] p-4">
                                      <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#363C6E]">
                                        Contenido del mensaje
                                      </span>
                                      <div className="rounded-md border border-[#D6DDFF] bg-white p-3">
                                        {highlightEmailTemplateMessage(emailMessageContent)}
                                      </div>
                                    </div>
                                  </>
                                ) : (
                                  <p className="text-[14px] text-muted-foreground">
                                    El envío por correo electrónico está desactivado para esta regla.
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </SectionCard>

                    </div>
                  )}
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
