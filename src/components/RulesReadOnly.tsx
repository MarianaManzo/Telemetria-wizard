import React, { useState, useEffect, useRef, useMemo } from "react"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Textarea } from "./ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "./ui/dropdown-menu"
import { Switch } from "./ui/switch"
import abiertoIcon from "../assets/abierto.svg"
import cerradoIcon from "../assets/cerrado.svg"

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
  Mail,
  Gauge,
  Thermometer,
  Radio,
  AlertOctagon,
  CheckCircle,
  Paperclip,
  Download
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"
import { Row, Col, Collapse, Pagination } from "antd"
import type { LucideIcon } from "lucide-react"
import { Rule, Event, RuleConditionGroup, RuleSchedule, RuleAttachment, RuleNote } from "../types"
import { userEmailTemplates } from "../constants/emailTemplates"
import { DeleteRuleModal } from "./DeleteRuleModal"
import { RenameRuleModal } from "./RenameRuleModal"
import { ChangeStatusModal } from "./ChangeStatusModal"
import exampleImage from 'figma:asset/25905393c492af8c8e0b3cf142e20c9dc3cbe9e4.png'
import markerBody from "../assets/event.svg?raw"
import markerLabel from "../assets/Label event.svg?raw"
import BaseSectionCard from "./SectionCard"
import { ColumnSettingsPopover } from "./ColumnSettingsModal"
import { useColumnPreferences } from "../hooks/useColumnPreferences"

const { Panel } = Collapse

const SectionCard = (props: React.ComponentProps<typeof BaseSectionCard>) => (
  <BaseSectionCard variant="plain" horizontalPadding="none" {...props} />
)

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
const SECTION_DIVIDER_CLASS = 'border-b border-[#E4E7EC] last:border-b-0'

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string')

const WEEKDAY_LABELS: Record<string, string> = {
  monday: 'Lunes',
  tuesday: 'Martes',
  wednesday: 'Miércoles',
  thursday: 'Jueves',
  friday: 'Viernes',
  saturday: 'Sábado',
  sunday: 'Domingo',
  lunes: 'Lunes',
  martes: 'Martes',
  miercoles: 'Miércoles',
  miércoles: 'Miércoles',
  jueves: 'Jueves',
  viernes: 'Viernes',
  sabado: 'Sábado',
  sábado: 'Sábado',
  domingo: 'Domingo'
}

const normalizeEmailMessage = (text: string) => {
  if (!text) return ''
  let normalized = text
    .replace(/\\r/g, '')
    .replace(/\\n/g, '\n')
    .replace(/\r/g, '')

  if (!normalized.includes('\n')) {
    normalized = normalized
      .replace(/Resumen Ejecutivo de Evento\s*-/, 'Resumen Ejecutivo de Evento\n-')
      .replace(/\s*-\s+/g, '\n- ')
      .replace(/\s+El evento/, '\n\nEl evento')
      .replace(/\s+Para detalles/, '\nPara detalles')
      .replace(/\s+Saludos cordiales,/, '\n\nSaludos cordiales,')
      .replace(/Sistema de Gestión Numaris/, '\nSistema de Gestión Numaris')
      .trim()
  }

  return normalized
}

const highlightEmailTemplateMessage = (text: string) => {
  if (!text) {
    return (
      <span className="text-[12px] text-muted-foreground">
        No se definió un mensaje para el correo.
      </span>
    )
  }

  const formattedText = normalizeEmailMessage(text)
  const tokenRegex = /(\{\{[^}]+\}\}|\{[^}]+\})/g
  const nodes: React.ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null
  let key = 0

  while ((match = tokenRegex.exec(formattedText)) !== null) {
    const preceding = formattedText.slice(lastIndex, match.index)
    if (preceding) {
      nodes.push(<React.Fragment key={`text-${key++}`}>{preceding}</React.Fragment>)
    }
    nodes.push(
      <span
        key={`token-${key++}`}
        className="inline-flex items-center rounded-sm bg-purple-100 px-1 py-0.5 text-[12px] font-semibold text-purple-700"
      >
        {match[0]}
      </span>
    )
    lastIndex = match.index + match[0].length
  }

  const trailing = formattedText.slice(lastIndex)
  if (trailing) {
    nodes.push(<React.Fragment key={`text-${key++}`}>{trailing}</React.Fragment>)
  }

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

type CollapseSectionKey = 'parametros' | 'configuracion' | 'acciones'
const COLLAPSE_SECTION_KEYS: CollapseSectionKey[] = ['parametros', 'configuracion', 'acciones']
const isCollapseSection = (value: string): value is CollapseSectionKey =>
  COLLAPSE_SECTION_KEYS.includes(value as CollapseSectionKey)

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

const severityPalette = {
  high: { accent: '#DF3F40', fill: '#FECACA' },
  medium: { accent: '#EA580C', fill: '#FED7AA' },
  low: { accent: '#0891B2', fill: '#A5F3FC' },
  informative: { accent: '#0891B2', fill: '#A5F3FC' }
}

const severityConfig = {
  high: { label: 'Alta', icon: AlertTriangle, palette: severityPalette.high },
  medium: { label: 'Media', icon: AlertTriangle, palette: severityPalette.medium },
  low: { label: 'Baja', icon: AlertTriangle, palette: severityPalette.low },
  informative: { label: 'Informativo', icon: AlertTriangle, palette: severityPalette.informative }
}

type RuleDetailEventsColumnDefinition = {
  id: string
  label: string
  headerClassName: string
  cellClassName: string
  render: (event: Event) => React.ReactNode
}

const EVENTS_PAGE_SIZE = 7

const eventsTableStatusConfig: Record<Event['status'], { label: string; color: string }> = {
  open: { label: 'Abierto', color: 'bg-green-100 text-green-800 border border-green-200' },
  closed: { label: 'Cerrado', color: 'bg-gray-100 text-gray-800 border border-gray-200' }
}

const eventsTableSeverityConfig: Record<Event['severity'], { label: string; icon: LucideIcon }> = {
  high: { label: 'Alta', icon: AlertTriangle },
  medium: { label: 'Media', icon: AlertTriangle },
  low: { label: 'Baja', icon: AlertTriangle },
  informative: { label: 'Informativo', icon: AlertTriangle }
}

const eventsTableSeverityVisuals: Record<Event['severity'], {
  shapeBgClass: string
  iconColorClass: string
  badgeClass: string
  dotBorderClass: string
  dotTextClass: string
}> = {
  high: {
    shapeBgClass: 'bg-red-100',
    iconColorClass: 'text-red-600',
    badgeClass: 'bg-red-100 border border-red-200 text-red-700',
    dotBorderClass: 'border-red-500',
    dotTextClass: 'text-red-500'
  },
  medium: {
    shapeBgClass: 'bg-orange-100',
    iconColorClass: 'text-orange-600',
    badgeClass: 'bg-orange-100 border border-orange-200 text-orange-700',
    dotBorderClass: 'border-orange-500',
    dotTextClass: 'text-orange-500'
  },
  low: {
    shapeBgClass: 'bg-blue-100',
    iconColorClass: 'text-blue-600',
    badgeClass: 'bg-blue-100 border border-blue-200 text-blue-700',
    dotBorderClass: 'border-blue-500',
    dotTextClass: 'text-blue-500'
  },
  informative: {
    shapeBgClass: 'bg-cyan-100',
    iconColorClass: 'text-cyan-600',
    badgeClass: 'bg-cyan-100 border border-cyan-200 text-cyan-700',
    dotBorderClass: 'border-cyan-500',
    dotTextClass: 'text-cyan-500'
  }
}

const severityOctagonClipPath = 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)'

const SAMPLE_EVENT_UNITS = [
  { id: 'NN-001', label: 'XHDF-2390', location: 'Wallaby Way, Sydney' },
  { id: 'NN-002', label: 'PQRT-1234', location: '90210 Sunset Boulevard, Los Angeles' },
  { id: 'NN-003', label: 'LMNO-5678', location: 'Powell Street, San Francisco' },
  { id: 'NN-004', label: 'ABCD-9101', location: 'Wisteria Lane, Sacramento' }
]

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
  onDuplicate?: (rule: Rule) => void
}

export function RulesReadOnly({ rule, onBack, events, onStatusChange, onEdit, onDelete, onRename, onDuplicate }: RulesReadOnlyProps) {
  const [sidebarActiveItem, setSidebarActiveItem] = useState('regla')
  const [activeMainTab, setActiveMainTab] = useState('informacion-general')
  
  // Helper function to render email recipients dynamically
  const renderEmailRecipients = (recipients: string[]) => {
    if (recipients.length === 0) {
      return <span className="text-[12px] text-muted-foreground">Sin destinatarios configurados.</span>
    }

    const visibleRecipients = recipients.slice(0, 2)
    const remainingCount = recipients.length - visibleRecipients.length

    return (
      <div className="flex items-center gap-1 overflow-hidden">
        <div className="flex items-center gap-1 overflow-hidden flex-nowrap">
          {visibleRecipients.map((recipient, index) => (
            <Badge
              key={`${recipient}-${index}`}
              variant="secondary"
              className="text-xs font-semibold whitespace-nowrap"
            >
              {recipient}
            </Badge>
          ))}
        </div>
        {remainingCount > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="secondary"
                  className="text-xs font-semibold cursor-help whitespace-nowrap"
                >
                  +{remainingCount}
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-slate-800 text-white border-slate-700 p-3 max-w-xs">
                <div className="space-y-1">
                  <div className="font-semibold text-sm mb-2">Destinatarios adicionales:</div>
                  <div className="grid grid-cols-1 gap-1 max-h-32 overflow-y-auto">
                    {recipients.slice(visibleRecipients.length).map((recipient, index) => (
                      <div key={index} className="text-sm">{recipient}</div>
                    ))}
                  </div>
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
  const renderUnits = (units: (string | { id?: string; name?: string })[]) => {
    if (!units || units.length === 0) {
      return <span className="text-[12px] text-muted-foreground">Todas las unidades</span>
    }

    const formatUnitLabel = (unit: string | { id?: string; name?: string }, index: number) => {
      if (typeof unit === 'string') {
        const segments = unit.split('-')
        if (segments.length > 1) {
          const unitNumber = segments[segments.length - 1]
          const parsedNumber = parseInt(unitNumber, 10)
          if (!Number.isNaN(parsedNumber)) {
            return `T-${unitNumber}-${123 + parsedNumber}`
          }
        }
        return unit
      }
      return unit?.name || unit?.id || `Unidad ${index + 1}`
    }

    const normalizedUnits = units.map((unit, index) => ({
      key: typeof unit === 'string' ? `${unit}-${index}` : unit?.id || `${index}-${unit?.name ?? 'unidad'}`,
      label: formatUnitLabel(unit, index)
    }))

    const visibleUnits = normalizedUnits.slice(0, 6)
    const remainingUnits = normalizedUnits.slice(6)

    return (
      <div className="flex flex-wrap gap-2">
        {visibleUnits.map(({ key, label }) => (
          <Badge key={key} variant="secondary" className="text-[12px] bg-blue-100 text-blue-700 hover:bg-blue-200">
            {label}
          </Badge>
        ))}
        {remainingUnits.length > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="secondary" className="text-[12px] bg-blue-100 text-blue-700 hover:bg-blue-200 cursor-help">
                  +{remainingUnits.length}
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-slate-800 text-white border-slate-700 p-3 max-w-xs">
                <div className="space-y-1">
                  <div className="font-semibold text-sm mb-2">Unidades adicionales:</div>
                  <div className="grid grid-cols-2 gap-1 max-h-32 overflow-y-auto">
                    {remainingUnits.map(({ key, label }) => (
                      <div key={key} className="text-sm">{label}</div>
                    ))}
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
const eventIconMap: Record<string, LucideIcon> = {
  speed: Gauge,
  warning: AlertTriangle,
  alert: AlertOctagon,
  thermometer: Thermometer,
  clock: Clock,
  signal: Radio
}

const mapIconColors = severityPalette

const MapPreviewIcon = ({ severity, label }: { severity: 'high' | 'medium' | 'low' | 'informative'; label: string }) => {
  const palette = mapIconColors[severity] ?? mapIconColors.low
  const tintedBody = markerBody
    .replace(/#DC2626/g, palette.accent)
    .replace(/#FECDD2/g, palette.fill)
    .replace(/#DF3F40/g, palette.accent)

  const tintedLabel = markerLabel
    .replace(/#FECDD2/g, palette.fill)
    .replace(/#DF3F40/g, palette.accent)

  return (
    <div className="flex flex-col items-center gap-2">
      <div dangerouslySetInnerHTML={{ __html: tintedBody }} />
      <div className="relative" style={{ width: 74, height: 20 }}>
        <div dangerouslySetInnerHTML={{ __html: tintedLabel }} />
        <span className="absolute inset-0 flex items-center justify-center text-[11px] font-medium" style={{ color: palette.accent }}>
          {label}
        </span>
      </div>
    </div>
  )
}

const randomTagStyles = [
  { bg: '#FFEAD5', text: '#B54708' },
  { bg: '#E0F2FE', text: '#1D4ED8' },
  { bg: '#DCFCE7', text: '#166534' },
  { bg: '#EDE9FE', text: '#5B21B6' },
  { bg: '#FDECF4', text: '#9D174D' },
  { bg: '#E0F7FA', text: '#0D9488' },
]

const getTagStyle = (index: number) => randomTagStyles[index % randomTagStyles.length]

const renderTagsList = (tagIds: string[], bgColor = "bg-purple-100", textColor = "text-purple-700", hoverColor = "hover:bg-purple-200") => {
    if (tagIds.length === 0) return (
      <span className="text-[12px] text-muted-foreground">Sin etiquetas específicas</span>
    )
    
    const visibleTags = tagIds.slice(0, 6)
    const remainingCount = tagIds.length - 6
    
    return (
      <div className="flex flex-wrap gap-2">
        {visibleTags.map((tagId, index) => {
          const style = getTagStyle(index)
          const tagName = tagId.replace('-', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
          return (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 text-[12px] font-medium leading-none"
              style={{ backgroundColor: style.bg, color: style.text, borderRadius: '4px' }}
            >
              {tagName}
            </span>
          )
        })}
        {remainingCount > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  className="inline-flex items-center px-3 py-1 text-[12px] font-medium leading-none cursor-help"
                  style={{
                    backgroundColor: getTagStyle(visibleTags.length).bg,
                    color: getTagStyle(visibleTags.length).text,
                    borderRadius: '4px',
                  }}
                >
                  +{remainingCount}
                </span>
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

const getWeekdayLabel = (value: string) => {
  if (!value) return ''
  if (WEEKDAY_LABELS[value]) return WEEKDAY_LABELS[value]
  const normalized = value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
  return WEEKDAY_LABELS[normalized] || value.charAt(0).toUpperCase() + value.slice(1)
}

const formatTimeDisplay = (time?: string) => {
  if (!time) return '--'
  const [hourStr = '00', minuteStr = '00'] = time.split(':')
  const hour = parseInt(hourStr, 10)
  if (Number.isNaN(hour)) {
    return time
  }
  const suffix = hour >= 12 ? 'pm' : 'am'
  const normalizedHour = hour % 12 || 12
  return `${normalizedHour.toString().padStart(2, '0')}:${minuteStr.padEnd(2, '0')} ${suffix}`
}

const renderCustomScheduleDetails = (schedule: RuleSchedule) => {
  const days = schedule.days || []
  const timeRanges = schedule.timeRanges || []

  if (!days.length) {
    return <p className="text-[14px] text-muted-foreground">Sin días configurados</p>
  }

  return (
    <div className="w-full rounded-lg border border-[#E4E7EC] bg-white divide-y divide-[#E4E7EC]">
      {days.map((day, index) => {
        const range = timeRanges[index] || timeRanges[0]
        return (
          <div key={`${day}-${index}`} className="grid grid-cols-4 px-4 py-3 text-[14px] text-foreground items-center gap-2">
            <div className="flex items-center gap-2 col-span-1">
              <input
                type="checkbox"
                checked
                disabled
                className="h-4 w-4 rounded border-blue-500 text-blue-600 focus:ring-blue-500"
              />
              <span>{getWeekdayLabel(day)}</span>
            </div>
            <span>{formatTimeDisplay(range?.start)}</span>
            <span>{formatTimeDisplay(range?.end)}</span>
            <span>{schedule.ruleContext === 'outside' ? 'Fuera' : 'Dentro'}</span>
          </div>
        )
      })}
    </div>
  )
}

const getScheduleSummary = (rule: Rule) => {
  if (rule.schedule?.type === 'custom') {
    const days = (rule.schedule.days || []).map((day: any) => getWeekdayLabel(day))
    const timeRanges = rule.schedule.timeRanges?.map((range: any) => `${range.start} - ${range.end}`) || []
    const dayText = days.length ? days.join(', ') : 'Sin días configurados'
    const timeText = timeRanges.length ? timeRanges.join(', ') : 'Todo el día'
    return `${dayText} · ${timeText}`
  }
  return 'En todo momento'
}

const getEventTimingDescription = (rule: Rule) => {
  if (rule.eventSettings?.eventTiming === 'despues-tiempo') {
    return `Después de ${rule.eventSettings.durationValue} ${rule.eventSettings.durationUnit}`
  }
  return 'Cuando se cumplan las condiciones'
}

const getClosureDescription = (rule: Rule) => {
  if (rule.closePolicy?.type === 'auto-time') {
    return `Automáticamente después de ${rule.closePolicy.duration} minutos`
  }
  return 'Cuando deje de cumplirse la condición'
}

const getZoneScopeDescription = (rule: Rule) => {
  if (rule.zoneScope?.type === 'inside') return 'Dentro de una zona o grupo de zonas'
  if (rule.zoneScope?.type === 'outside') return 'Fuera de una zona o grupo de zonas'
  return 'En cualquier lugar'
}

const COLLAPSE_SECTION_LABELS: Record<CollapseSectionKey, string> = {
  parametros: 'Parámetros',
  configuracion: 'Configuración',
  acciones: 'Acciones a realizar'
}

  const [openPanelKey, setOpenPanelKey] = useState<CollapseSectionKey | null>('parametros')
  const [expandAll, setExpandAll] = useState(false)
  const [infoHeaderHeight, setInfoHeaderHeight] = useState(0)
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  const generalInfoHeaderRef = useRef<HTMLDivElement | null>(null)
  const parametrosHeaderRef = useRef<HTMLButtonElement>(null)
  const configuracionHeaderRef = useRef<HTMLButtonElement>(null)
  const accionesHeaderRef = useRef<HTMLButtonElement>(null)
  const notasHeaderRef = useRef<HTMLDivElement>(null)
  const adjuntosHeaderRef = useRef<HTMLDivElement>(null)
  const eventosHeaderRef = useRef<HTMLDivElement>(null)
  const sectionHeaderRefs: Record<CollapseSectionKey, React.RefObject<HTMLElement>> = {
    parametros: parametrosHeaderRef,
    configuracion: configuracionHeaderRef,
    acciones: accionesHeaderRef
  }
  const effectiveMainHeader = infoHeaderHeight || 64
  const effectiveSectionHeader = 56
  const sectionStickyTop = effectiveMainHeader + effectiveSectionHeader * COLLAPSE_SECTION_KEYS.length
  const collapseStyle = {
    '--section-sticky-top': `${sectionStickyTop}px`
  } as React.CSSProperties & { '--section-sticky-top': string }
  const infoScrollMaxHeight = `calc(100vh - ${sectionStickyTop + 140}px)` // adjust for header + padding

  const renderPanelHeader = (
    key: CollapseSectionKey,
    label: string,
    ref: React.RefObject<HTMLButtonElement>
  ) => {
    const isActive = expandAll || openPanelKey === key
    return (
      <button
        type="button"
        ref={ref}
        className={`collapse-pill ${isActive ? 'collapse-pill--active' : ''}`}
        style={{
          scrollMarginTop: sectionStickyTop + 16,
          backgroundColor: '#F0F0F0'
        }}
      >
        <span>{label}</span>
        <ChevronDown className={`collapse-pill__icon ${isActive ? 'rotate-180' : ''}`} />
      </button>
    )
  }
  const [configAvanzadaOpen, setConfigAvanzadaOpen] = useState(true)
  const [notes, setNotes] = useState<RuleNote[]>(rule.notes ?? [])
  const [newNote, setNewNote] = useState("")
  const [notesSort, setNotesSort] = useState<'recent' | 'oldest'>('recent')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showRenameModal, setShowRenameModal] = useState(false)
  const [selectedEventForModal, setSelectedEventForModal] = useState<Event | null>(null)
  const [showChangeStatusModal, setShowChangeStatusModal] = useState(false)
  const [statusModalMode, setStatusModalMode] = useState<'close' | 'reopen'>('close')
  const [eventsPage, setEventsPage] = useState(1)
  const relatedEvents = useMemo(() => {
    return events.filter((event) => event.ruleId === rule.id)
  }, [events, rule.id])
  const demoEvents = useMemo<Event[]>(() => {
    if (relatedEvents.length > 0) {
      return []
    }
    const baseDate = rule.updatedAt ?? rule.createdAt ?? new Date()
    const severity = (rule.eventSettings?.severity ?? 'medium') as Event['severity']
    return SAMPLE_EVENT_UNITS.slice(0, 3).map((unit, index) => {
      const createdAt = new Date(baseDate.getTime() - index * 3_600_000)
      const updatedAt = new Date(createdAt.getTime() + 600_000)
      return {
        id: `${rule.id.toUpperCase()}-DEMO-${index + 1}`,
        ruleId: rule.id,
        ruleName: rule.name,
        status: index === 0 ? 'open' : 'closed',
        severity,
        icon: '',
        unitId: unit.id,
        unitName: unit.label,
        responsible: rule.owner,
        instructions: rule.eventSettings?.instructions ?? 'Sin instrucciones configuradas.',
        createdAt,
        updatedAt,
        closedAt: index === 0 ? null : updatedAt,
        startAddress: unit.location,
        endAddress: unit.location,
        historyUrl: undefined,
        unitLink: undefined,
        eventMessageHtml: undefined,
        actionsRequired: [],
        startLocationLink: undefined,
        driverName: undefined,
        speedRecorded: undefined,
        notes: [],
        tags: rule.eventSettings?.tags ?? [],
        location: { lat: 0, lng: 0 },
        closeNote: undefined
      }
    })
  }, [relatedEvents.length, rule])
  const hasRealEvents = relatedEvents.length > 0
  const eventsToDisplay = hasRealEvents ? relatedEvents : demoEvents
  const totalEventPages = Math.max(1, Math.ceil(eventsToDisplay.length / EVENTS_PAGE_SIZE) || 1)
  const paginatedEvents =
    eventsToDisplay.length === 0
      ? []
      : eventsToDisplay.slice((eventsPage - 1) * EVENTS_PAGE_SIZE, eventsPage * EVENTS_PAGE_SIZE)
  const requireCloseNote = rule.closePolicy.type === 'manual'
  const sortedNotes = useMemo(() => {
    const notesCopy = [...notes]
    return notesCopy.sort((a, b) => {
      if (notesSort === 'recent') {
        return b.createdAt.getTime() - a.createdAt.getTime()
      }
      return a.createdAt.getTime() - b.createdAt.getTime()
    })
  }, [notes, notesSort])
  const attachments = rule.attachments ?? []

  const detailEventColumns: RuleDetailEventsColumnDefinition[] = [
    {
      id: 'identifier',
      label: 'Identificador',
      headerClassName: 'px-6 py-3 text-left text-[14px] font-medium text-gray-500 w-32',
      cellClassName: 'px-6 py-4 text-[14px] font-medium',
      render: (event) => (
        <span className="text-blue-600 hover:text-blue-900 hover:underline">{event.id}</span>
      )
    },
    {
      id: 'event',
      label: 'Evento',
      headerClassName: 'px-6 py-3 text-left text-[14px] font-medium text-gray-500 w-[22rem]',
      cellClassName: 'px-6 py-4',
      render: (event) => {
        const severityInfo = eventsTableSeverityConfig[event.severity]
        const severityVisual = eventsTableSeverityVisuals[event.severity]
        const SeverityIconCompact = severityInfo.icon
        return (
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex h-9 w-9 items-center justify-center ${severityVisual.shapeBgClass}`}
              style={{ clipPath: severityOctagonClipPath, paddingInline: '8px' }}
            >
              <SeverityIconCompact className={`h-4 w-4 ${severityVisual.iconColorClass}`} />
            </span>
            <div className="truncate pr-2 text-[14px] font-medium text-gray-900" title={event.ruleName}>
              {event.ruleName}
            </div>
          </div>
        )
      }
    },
    {
      id: 'start',
      label: 'Fecha de evento',
      headerClassName: 'px-6 py-3 text-left text-[14px] font-medium text-gray-500 w-44 whitespace-nowrap',
      cellClassName: 'px-6 py-4 whitespace-nowrap text-[14px] text-gray-500',
      render: (event) => (
        <div className="truncate pr-2" title={formatEventDateTime(event.createdAt)}>
          {formatEventDateTime(event.createdAt)}
        </div>
      )
    },
    {
      id: 'unit',
      label: 'Unidad',
      headerClassName: 'px-6 py-3 text-left text-[14px] font-medium text-gray-500 w-32',
      cellClassName: 'px-6 py-4 text-[14px] font-medium',
      render: (event) => (
        <span className="text-blue-600 hover:text-blue-900 hover:underline">
          {event.unitId || event.unitName || '---'}
        </span>
      )
    },
    {
      id: 'location',
      label: 'Ubicación',
      headerClassName: 'px-6 py-3 text-left text-[14px] font-medium text-gray-500 whitespace-nowrap',
      cellClassName: 'px-6 py-4 text-[14px] text-gray-500',
      render: (event) => {
        const locationText = event.startAddress || event.endAddress || '---'
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className="pr-2"
                  style={{ maxWidth: 150, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                >
                  {locationText}
                </div>
              </TooltipTrigger>
              <TooltipContent>{locationText}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      }
    },
    {
      id: 'status',
      label: 'Estatus',
      headerClassName: 'px-6 py-3 text-left text-[14px] font-medium text-gray-500 w-36',
      cellClassName: 'px-6 py-4 text-[14px] text-gray-500',
      render: (event) => {
        const statusInfo = eventsTableStatusConfig[event.status]
        return (
          <div className="flex items-center gap-2 font-medium whitespace-nowrap">
            {event.status === 'open' ? (
              <>
                <img src={abiertoIcon} alt="Abierto" className="h-4 w-4" />
                <span className="text-gray-900">{statusInfo.label}</span>
              </>
            ) : (
              <>
                <img src={cerradoIcon} alt="Cerrado" className="h-4 w-4" />
                <span className="text-gray-900">{statusInfo.label}</span>
              </>
            )}
          </div>
        )
      }
    },
    {
      id: 'severity',
      label: 'Severidad',
      headerClassName: 'px-6 py-3 text-left text-[14px] font-medium text-gray-500 w-36',
      cellClassName: 'px-6 py-4 text-[14px] text-gray-500',
      render: (event) => {
        const severityInfo = eventsTableSeverityConfig[event.severity]
        const severityVisual = eventsTableSeverityVisuals[event.severity]
        return (
          <span
            className={`inline-flex items-center gap-1.5 rounded-[8px] px-2.5 py-1 text-[12px] font-medium whitespace-nowrap ${severityVisual.badgeClass}`}
          >
            <span className={`inline-flex h-4 w-4 items-center justify-center rounded-full border ${severityVisual.dotBorderClass}`}>
              <span className={`text-[10px] font-bold ${severityVisual.dotTextClass}`}>!</span>
            </span>
            {severityInfo.label}
          </span>
        )
      }
    },
    {
      id: 'actions',
      label: 'Acciones',
      headerClassName: 'px-6 py-3 text-left text-[14px] font-medium text-gray-500 sticky right-0 bg-gray-50 shadow-[-4px_0_8px_rgba(0,0,0,0.08)] z-20 w-20',
      cellClassName: 'px-6 py-4 whitespace-nowrap text-[14px] text-gray-500 sticky right-0 bg-white shadow-[-4px_0_8px_rgba(0,0,0,0.15)] z-10',
      render: (event) => (
        <div className="flex justify-center items-center">
          {event.status === 'open' ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2 text-gray-600 hover:text-gray-900 cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="flex items-center gap-2"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleOpenChangeStatus(event, 'close')
                  }}
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Cerrar evento</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              disabled
              className="p-2 text-gray-400 cursor-not-allowed opacity-50"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          )}
        </div>
      )
    }
  ]

  const defaultDetailColumnPreferences = detailEventColumns.map((column) => ({
    id: column.id,
    label: column.label,
    enabled: true
  }))

  const {
    columns: detailColumnPreferences,
    visibleColumns: visibleDetailColumnPreferences,
    setColumns: setDetailColumnPreferences
  } = useColumnPreferences(`rule-detail-events:${rule.id}`, defaultDetailColumnPreferences)

  const detailColumnsById = useMemo(() => {
    const map = new Map<string, RuleDetailEventsColumnDefinition>()
    detailEventColumns.forEach((column) => map.set(column.id, column))
    return map
  }, [detailEventColumns])

  const orderedDetailColumns = visibleDetailColumnPreferences
    .map((pref) => detailColumnsById.get(pref.id))
    .filter((column): column is RuleDetailEventsColumnDefinition => Boolean(column))

  useEffect(() => {
    setEventsPage(1)
  }, [eventsToDisplay.length])

  useEffect(() => {
    if (eventsPage > totalEventPages) {
      setEventsPage(totalEventPages)
    }
  }, [eventsPage, totalEventPages])

  const formatEventDateTime = (dateValue: Date | string) => {
    const date = dateValue instanceof Date ? dateValue : new Date(dateValue)
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatNoteTimestamp = (dateValue: Date | string) => {
    const date = dateValue instanceof Date ? dateValue : new Date(dateValue)
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatAttachmentDate = (dateValue: Date | string) => {
    const date = dateValue instanceof Date ? dateValue : new Date(dateValue)
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const getInitials = (value: string) =>
    value
      ?.split(/[\s@.]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('') || 'NA'

  const handleOpenChangeStatus = (eventData: Event, mode: 'close' | 'reopen' = 'close') => {
    setSelectedEventForModal(eventData)
    setStatusModalMode(mode)
    setShowChangeStatusModal(true)
  }

  const handleCloseChangeStatusModal = () => {
    setShowChangeStatusModal(false)
    setSelectedEventForModal(null)
  }

  const handleStatusSave = (newStatus: 'open' | 'closed', note?: string) => {
    console.log('Change event status request:', selectedEventForModal?.id, newStatus, note)
    handleCloseChangeStatusModal()
  }

  const handleAddNote = () => {
    const content = newNote.trim()
    if (!content) {
      return
    }
    const newEntry: RuleNote = {
      id: `rule-note-${Date.now()}`,
      content,
      createdAt: new Date(),
      createdBy: rule.owner,
      type: 'comment'
    }
    setNotes((prev) => [newEntry, ...prev])
    setNewNote('')
    setNotesSort('recent')
  }

  const handleSectionChange = (key: string | string[]) => {
    if (expandAll) {
      return
    }
    const normalizedKey = Array.isArray(key) ? key[0] : key
    if (!normalizedKey) {
      setOpenPanelKey(null)
      return
    }

    if (!isCollapseSection(normalizedKey)) {
      return
    }

    setOpenPanelKey(normalizedKey)
    const headerElement = sectionHeaderRefs[normalizedKey]?.current
    headerElement?.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' })
  }

  // Debug effect to track rule changes
  useEffect(() => {
    console.log('RulesReadOnly received rule update:', rule.id, rule.updatedAt, rule)
  }, [rule])

  useEffect(() => {
    setNotes(rule.notes ?? [])
    setNewNote('')
    setNotesSort('recent')
  }, [rule])

  useEffect(() => {
    const headerElement = generalInfoHeaderRef.current
    if (!headerElement || typeof window === 'undefined' || typeof ResizeObserver === 'undefined') {
      return
    }
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) {
        setInfoHeaderHeight(entry.contentRect.height)
      }
    })
    setInfoHeaderHeight(headerElement.getBoundingClientRect().height)
    observer.observe(headerElement)
    return () => observer.disconnect()
  }, [])

  const severityInfo = severityConfig[rule.eventSettings.severity]
  const severityPaletteColors = severityInfo?.palette ?? severityPalette.low
  const SeverityIcon = severityInfo.icon
  const shortNameRaw = (rule.eventSettings.shortName || '').trim()
  const shortNameValue = shortNameRaw || 'Evento'
  const shortNameDisplay = shortNameValue.slice(0, 10)
  const EventIconComponent = eventIconMap[rule.eventSettings.icon] || AlertTriangle

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

  const scheduleContent =
    rule.schedule?.type === 'custom'
      ? renderCustomScheduleDetails(rule.schedule)
      : (
        <p className="text-[14px] text-muted-foreground">{getScheduleSummary(rule)}</p>
      )

const advancedConfigItems = [
    {
      title: "Zona geográfica",
      content: <p className="text-[14px] text-muted-foreground">{getZoneScopeDescription(rule)}</p>
    },
    {
      title: "Generación de evento",
      content: <p className="text-[14px] text-muted-foreground">{getEventTimingDescription(rule)}</p>
    },
    {
      title: "Cierre del evento",
      content: <p className="text-[14px] text-muted-foreground">{getClosureDescription(rule)}</p>
    }
  ]

  const renderParametrosTab = () => (
    <div className="space-y-4">
      <SectionCard className={SECTION_DIVIDER_CLASS}
        icon={<Settings className="w-4 h-4 text-muted-foreground" />}
        title="Parámetros a evaluar"
      >
        {renderConditionGroups(rule)}
      </SectionCard>

      <SectionCard className={SECTION_DIVIDER_CLASS}
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

      <SectionCard className={`${SECTION_DIVIDER_CLASS} overflow-hidden`}
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
        contentClassName={configAvanzadaOpen ? 'pt-4 pb-0' : 'p-0'}
      >
        {configAvanzadaOpen && (
          <div className="pb-4 space-y-6">
            <Row gutter={[24, 24]}>
              {advancedConfigItems.map((item) => (
                <Col key={item.title} xs={24} md={12}>
                  <div className="flex flex-col gap-2">
                    <span className="text-[14px] font-semibold text-foreground">{item.title}</span>
                    {typeof item.content === 'string' ? (
                      <p className="text-[14px] text-muted-foreground">{item.content}</p>
                    ) : (
                      item.content
                    )}
                  </div>
                </Col>
              ))}
            </Row>

            {rule.schedule?.type === 'custom' && (
              <div className="space-y-2">
                <span className="text-[14px] font-semibold text-foreground">Horario personalizado</span>
                {scheduleContent}
              </div>
            )}
          </div>
        )}
      </SectionCard>
    </div>
  )

  const renderConfiguracionTab = () => (
    <div className="space-y-4">
      <SectionCard className={SECTION_DIVIDER_CLASS}
        icon={<AlertTriangle className="w-4 h-4 text-muted-foreground" />}
        title="Clasificación del evento"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div>
              <span className="text-[14px] font-semibold text-foreground block mb-1">Nombre corto</span>
              <span className="text-[14px] text-foreground" title={shortNameValue}>{shortNameDisplay}</span>
            </div>

            <div>
              <span className="text-[14px] font-semibold text-foreground block mb-2">Vista previa en mapa</span>
              <div className="flex flex-col items-start lg:items-center gap-4">
                <MapPreviewIcon
                  severity={rule.eventSettings.severity || 'low'}
                  label={shortNameDisplay}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <span className="text-[14px] font-semibold text-foreground block mb-3">Severidad del evento:</span>
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center gap-2 px-3 py-1 border"
                  style={{
                    backgroundColor: severityPaletteColors.fill,
                    color: severityPaletteColors.accent,
                    borderColor: severityPaletteColors.accent,
                    borderRadius: 4
                  }}
                >
                  <SeverityIcon className="w-4 h-4" color={severityPaletteColors.accent} />
                  <span className="text-[14px]">
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
        </div>
      </SectionCard>

    </div>
  )

  const renderAccionesTab = () => (
    <SectionCard
      className={SECTION_DIVIDER_CLASS}
      icon={<MessageSquare className="w-4 h-4 text-muted-foreground" />}
      title="Mensaje del evento"
    >
      {emailMessageContent ? (
        <div className="space-y-3">
          <div className="flex items-center gap-1 text-[14px] font-semibold text-foreground">
            <span className="text-red-500">*</span>
            <span>Mensaje del evento</span>
          </div>
          <div className="rounded-2xl bg-white p-4 text-[14px] leading-relaxed text-[#313655] whitespace-pre-wrap">
            {highlightEmailTemplateMessage(emailMessageContent)}
          </div>
        </div>
      ) : (
        <p className="text-[14px] text-muted-foreground">No hay mensaje configurado para este canal.</p>
      )}
    </SectionCard>
  )

  const isSpecialRuleLayout = rule.name === 'Desconexión prolongada del GPS'

  const sidebarItems = [
    { id: 'contenido', label: 'Contenido', icon: FileText },
    { id: 'regla', label: 'Información general', icon: Settings },
    { id: 'notas', label: 'Notas', icon: MessageSquare },
    { id: 'adjuntos', label: 'Archivos adjuntos', icon: Paperclip },
    { id: 'eventos', label: 'Eventos', icon: FileText }
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

  const appHeaderVar = 'var(--app-header-height, 64px)'
  const ruleHeaderHeight = 72

  return (
    <div className="flex-1 flex flex-col bg-white min-h-0 min-w-0">
      {/* Header + Main Tabs */}
      <div
        className="bg-white"
        style={{ position: 'sticky', top: appHeaderVar, zIndex: 50, boxShadow: '0 1px 2px rgba(15,23,42,0.08)' }}
      >
        <div className="border-b border-border px-6 py-4">
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
                  {onDuplicate && (
                    <DropdownMenuItem 
                      className="flex items-center gap-2"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        onDuplicate(rule)
                      }}
                    >
                      <Copy className="w-4 h-4" />
                      <span className="pt-[0px] pr-[0px] pb-[0px] pl-[20px]">Duplicar</span>
                    </DropdownMenuItem>
                  )}
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
        <div className="border-b border-border px-6 bg-white">
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
      </div>

      <div className="flex flex-1 min-h-0 min-w-0">
        {/* Main Content */}
        <div className="flex flex-1 min-h-0 min-w-0 flex-col">
          <div className="flex-1 overflow-hidden">
            <div className="w-full px-6 py-6">
              {activeMainTab === 'informacion-general' && (
                <div className="flex flex-col gap-6">
                  <div
                    className="w-full rounded-[12px] border border-[#E4E7EC] bg-white overflow-hidden"
                    style={collapseStyle}
                  >
                    <div
                      id="infoScroll"
                      className="info-scroll min-w-0 overflow-auto"
                      style={{ maxHeight: infoScrollMaxHeight }}
                      ref={scrollContainerRef}
                    >
                      <div
        id="mainHeader"
        ref={generalInfoHeaderRef}
        className="sticky top-0 z-10 flex items-center justify-between border-b border-[#E4E7EC] bg-white px-6 py-4"
        style={{ borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
      >
        <h2 className="text-[18px] font-semibold text-foreground">Información general</h2>
        <button
          type="button"
          onClick={() => {
            setExpandAll((prev) => {
              const next = !prev
              if (next) {
                setOpenPanelKey(null)
              } else {
                setOpenPanelKey(null)
              }
              return next
            })
          }}
          className="flex items-center gap-1 text-[14px] font-semibold transition-colors"
          style={{ color: '#1677FF' }}
        >
          <span>{expandAll ? 'Cerrar todo' : 'Abrir todo'}</span>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${expandAll ? 'rotate-180' : ''}`}
            strokeWidth={2.5}
          />
        </button>
      </div>

                      <div className="info-collapse">
                        <Collapse
                          accordion={!expandAll}
                          bordered={false}
                          activeKey={expandAll ? COLLAPSE_SECTION_KEYS : openPanelKey ?? undefined}
                          onChange={handleSectionChange}
                          expandIcon={() => null}
                        >
                      <Panel
                        key="parametros"
                        header={renderPanelHeader('parametros', COLLAPSE_SECTION_LABELS.parametros, parametrosHeaderRef)}
                      >
                        <div className="space-y-6 py-6 px-0">
                          <SectionCard className={SECTION_DIVIDER_CLASS}
                            icon={<Settings className="w-4 h-4 text-muted-foreground" />}
                            title="Parámetros a evaluar"
                          >
                            {renderConditionGroups(rule)}
                          </SectionCard>

                          <SectionCard className={`${SECTION_DIVIDER_CLASS} overflow-hidden`}
                            icon={<Settings className="w-4 h-4 text-muted-foreground" />}
                            title="Configuración avanzada"
                            headerExtra={
                              <button
                                type="button"
                                onClick={() => setConfigAvanzadaOpen((prev) => !prev)}
                                className="text-muted-foreground transition-colors hover:text-foreground"
                              >
                                {configAvanzadaOpen ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </button>
                            }
                            contentClassName={configAvanzadaOpen ? 'pt-4 pb-0' : 'p-0'}
                          >
                            {configAvanzadaOpen && (
                              <div className="pb-4 space-y-6">
                                <Row gutter={[24, 24]}>
                                  {advancedConfigItems.map((item) => (
                                    <Col key={item.title} xs={24} md={12}>
                                      <div className="flex flex-col gap-2">
                                        <span className="text-[14px] font-semibold text-foreground">{item.title}</span>
                                        {typeof item.content === 'string' ? (
                                          <p className="text-[14px] text-muted-foreground">{item.content}</p>
                                        ) : (
                                          item.content
                                        )}
                                      </div>
                                    </Col>
                                  ))}
                                  <Col xs={24} md={12}>
                                    <div className="flex flex-col gap-2">
                                      <span className="text-[14px] font-semibold text-foreground">Activación de la regla</span>
                                      <div className="text-[14px] text-muted-foreground">
                                        {rule.schedule?.type === 'custom' ? 'Personalizada' : getScheduleSummary(rule)}
                                      </div>
                                    </div>
                                  </Col>
                                </Row>

                                {rule.schedule?.type === 'custom' && (
                                  <div className="space-y-2">
                                    <span className="text-[14px] font-semibold text-foreground">Horario personalizado</span>
                                    {scheduleContent}
                                  </div>
                                )}
                              </div>
                            )}
                          </SectionCard>
                        </div>
                      </Panel>

                      <Panel
                        key="configuracion"
                        header={renderPanelHeader('configuracion', COLLAPSE_SECTION_LABELS.configuracion, configuracionHeaderRef)}
                      >
                        <div className="space-y-6 py-6 px-0">
                          <SectionCard className={SECTION_DIVIDER_CLASS}
                            icon={<AlertTriangle className="w-4 h-4 text-muted-foreground" />}
                            title="Clasificación del evento"
                          >
                            <div className="space-y-6">
                              <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2">
                                <div>
                                  <span className="mb-1 block text-[14px] font-semibold text-foreground">Nombre corto</span>
                                  <span className="text-[14px] text-foreground" title={shortNameValue}>
                                    {shortNameDisplay}
                                  </span>
                                </div>

                                <div>
                                  <span className="mb-2 block text-[14px] font-semibold text-foreground">Vista previa en mapa</span>
                                  <div className="flex flex-col items-start gap-4 lg:items-center">
                                    <MapPreviewIcon
                                      severity={rule.eventSettings.severity || 'low'}
                                      label={shortNameDisplay}
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                                <div>
                                  <span className="mb-3 block text-[14px] font-semibold text-foreground">Severidad del evento:</span>
                                  <div className="flex items-center gap-3">
                                    <div
                                      className="flex items-center gap-2 border px-3 py-1"
                                      style={{
                                        backgroundColor: severityPaletteColors.fill,
                                        color: severityPaletteColors.accent,
                                        borderColor: severityPaletteColors.accent,
                                        borderRadius: 4
                                      }}
                                    >
                                      <SeverityIcon className="h-4 w-4" color={severityPaletteColors.accent} />
                                      <span className="text-[14px]">{severityInfo.label}</span>
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <span className="mb-3 block text-[14px] font-semibold text-foreground">Etiquetas del evento:</span>
                                  {renderTagsList(
                                    rule.eventSettings.tags || [],
                                    "bg-green-100",
                                    "text-green-700",
                                    "hover:bg-green-200"
                                  )}
                                </div>
                              </div>
                            </div>
                          </SectionCard>

      <SectionCard
        className={SECTION_DIVIDER_CLASS}
        icon={<Clock className="w-4 h-4 text-muted-foreground" />}
        title="Cierre del evento"
      >
                            <div className="space-y-3">
                              <span className="block text-[14px] font-semibold text-foreground">Cierre del evento:</span>
                              <div className="text-[14px] text-[rgba(113,113,130,1)]">
                                {rule.closePolicy.type === 'manual'
                                  ? 'Manualmente'
                                  : rule.closePolicy.type === 'auto-time'
                                    ? 'Automáticamente por tiempo'
                                    : 'Automáticamente por condición'}
                                {rule.closePolicy.type === 'manual' && (
                                  <span className="text-[12px] text-muted-foreground"> / Requiere nota al cerrar evento</span>
                                )}
                              </div>
                            </div>
                          </SectionCard>

      
                        </div>
                      </Panel>

                      <Panel
                        key="acciones"
                        header={renderPanelHeader('acciones', COLLAPSE_SECTION_LABELS.acciones, accionesHeaderRef)}
                      >
                        <div className="space-y-6 py-6 px-0">{renderAccionesTab()}</div>
                      </Panel>
                    </Collapse>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 mt-6">
                  <div
                    ref={notasHeaderRef}
                    className="rounded-[12px] border border-[#E4E7EC] bg-white"
                    style={{ scrollMarginTop: sectionStickyTop + 16 }}
                  >
                    <div className="px-6 py-6">
                      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                        <h3 className="text-[18px] font-semibold text-[#1F1F1F] m-0">Notas</h3>
                        <Select
                          value={notesSort}
                          onValueChange={(value) => setNotesSort(value as 'recent' | 'oldest')}
                        >
                          <SelectTrigger className="w-56 h-11 rounded-full border-[#D0D5DD] bg-white text-[14px] text-[#1D2939] shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
                            <SelectValue placeholder="Recientes al principio" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="recent">Recientes al principio</SelectItem>
                            <SelectItem value="oldest">Más antiguas al principio</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Textarea
                        placeholder="Agregar nota..."
                        className="mb-4 rounded-[16px] border border-[#D0D5DD] bg-white text-[14px] text-[#1D2939] placeholder:text-[#98A2B3] focus:border-[#1677FF] focus:ring-[#1677FF]/30 min-h-[96px]"
                        value={newNote}
                        onChange={(event) => setNewNote(event.target.value)}
                      />

                      <div className="space-y-4">
                        {sortedNotes.length === 0 ? null : (
                          sortedNotes.map((note) => (
                            <div key={note.id} className="flex flex-col gap-1 rounded-2xl border border-[#EEF0F4] px-4 py-3">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="text-[14px] font-semibold text-[#101828]">
                                  {note.createdBy || 'Usuario'}
                                </span>
                                <span className="text-[12px] text-[#98A2B3]">
                                  {formatNoteTimestamp(note.createdAt)}
                                </span>
                              </div>
                              <p className="text-[14px] text-[#475467] whitespace-pre-line">
                                {note.content}
                              </p>
                              {note.type === 'update' && (
                                <span className="text-[12px] font-medium text-[#1677FF]">
                                  Actualización
                                </span>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  <div
                    ref={adjuntosHeaderRef}
                    className="rounded-[12px] border border-[#E4E7EC] bg-white"
                    style={{ scrollMarginTop: sectionStickyTop + 16 }}
                  >
                    <div className="px-6 py-6 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <h3 className="text-[18px] font-semibold text-[#1F1F1F] m-0">Archivos adjuntos</h3>
                          <span className="text-[15px] text-[#98A2B3]">
                            {attachments.length === 0 ? 'No tienes archivos adjuntos' : `${attachments.length} archivo${attachments.length === 1 ? '' : 's'}`}
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          className="rounded-full bg-white flex items-center gap-3 h-10 px-5"
                          style={{ borderColor: '#1677FF', color: '#1677FF' }}
                        >
                          <span className="text-[20px] leading-none text-[#1677FF]">+</span>
                          <span className="text-[15px] font-medium text-[#1677FF]">Adjuntar</span>
                        </Button>
                      </div>

                      {attachments.length === 0 ? null : (
                        <div className="space-y-3">
                          {attachments.map((file) => (
                            <div
                              key={file.id}
                              className="flex flex-col gap-3 rounded-2xl border border-[#EEF0F4] px-4 py-3 md:flex-row md:items-center md:justify-between"
                            >
                              <div className="min-w-0">
                                <p className="truncate text-[14px] font-semibold text-[#101828]">
                                  {file.name}
                                </p>
                                <p className="text-[13px] text-[#475467]">
                                  {file.size}{file.description ? ` · ${file.description}` : ''}
                                </p>
                                <p className="text-[12px] text-[#98A2B3]">
                                  Cargado por {file.uploadedBy} · {formatAttachmentDate(file.uploadedAt)}
                                </p>
                              </div>
                              <Button variant="secondary" className="rounded-full h-9 px-4 bg-[#F5F8FF] text-[#1677FF] hover:bg-[#E4ECFF]">
                                Descargar
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                  <div className="rounded-[12px] border border-[#E4E7EC] bg-white overflow-hidden">
                    <div className="px-6 py-6">
                      <div
                        ref={eventosHeaderRef}
                        className="mb-6 text-[15px] font-semibold text-foreground"
                        style={{ scrollMarginTop: sectionStickyTop + 16 }}
                      >
                        <span>Eventos</span>
                      </div>

                      <div className="bg-white rounded-lg border overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full table-auto border-collapse">
                            <thead className="bg-gray-50">
                              <tr>
                                {orderedDetailColumns.map((column) => (
                                  <th key={column.id} className={column.headerClassName}>
                                    {column.id === 'actions' ? (
                                      <div className="flex justify-center">
                                        <ColumnSettingsPopover
                                          columns={detailColumnPreferences}
                                          onApply={setDetailColumnPreferences}
                                        />
                                      </div>
                                    ) : (
                                      column.label
                                    )}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {eventsToDisplay.length === 0 ? (
                                <tr>
                                  <td colSpan={8} className="px-6 py-8 text-center text-[14px] text-gray-500">
                                    No se han detonado eventos con esta regla todavía.
                                  </td>
                                </tr>
                              ) : (
                                paginatedEvents.map((event) => (
                                  <tr key={event.id} className="hover:bg-gray-50 cursor-pointer">
                                    {orderedDetailColumns.map((column) => (
                                      <td key={column.id} className={column.cellClassName}>
                                        {column.render(event)}
                                      </td>
                                    ))}
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                      {eventsToDisplay.length > 0 && (
                        <div className="flex flex-wrap items-center justify-center px-6 pt-4">
                          <Pagination
                            current={eventsPage}
                            total={eventsToDisplay.length}
                            pageSize={EVENTS_PAGE_SIZE}
                            showSizeChanger={false}
                            onChange={setEventsPage}
                            showTotal={(total, range) => `${range[0]} - ${range[1]} Eventos`}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
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
    </div>

    {/* Delete Modal */}
    <DeleteRuleModal
      isOpen={showDeleteModal}
      ruleName={rule.name}
      onConfirmDelete={() => {
        onDelete?.(rule.id)
        setShowDeleteModal(false)
        onBack()
      }}
      onClose={() => setShowDeleteModal(false)}
    />

    <RenameRuleModal
      isOpen={showRenameModal}
      rule={rule}
      onClose={() => setShowRenameModal(false)}
      onRename={(ruleId, newName, newDescription) => {
        onRename?.(ruleId, newName, newDescription)
        setShowRenameModal(false)
      }}
    />

    {selectedEventForModal && (
      <ChangeStatusModal
        isOpen={showChangeStatusModal}
        onClose={handleCloseChangeStatusModal}
        onSave={handleStatusSave}
        mode={statusModalMode}
        requireNote={statusModalMode === 'close' && requireCloseNote}
      />
    )}
  </div>
)
}
