import React, { useState, useRef, useEffect, useMemo, useCallback, Fragment } from 'react'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Flex, Typography } from "antd";
import { CloseOutlined } from '@ant-design/icons'
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Badge } from "./ui/badge"
import { Checkbox } from "./ui/checkbox"
import { RadioGroup, RadioGroupItem } from "./ui/radio-group"
import { Switch } from "./ui/switch"
import { VariableTextarea, VariableButton, type VariableTextareaHandle, type MessageVariableDescriptor } from "./VariableTextarea"
import { NotificationExampleModal } from "./NotificationExampleModal"
import { EmailTemplateDrawer } from "./EmailTemplateDrawer"
import { useNotifications } from "../contexts/NotificationContext"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "./ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import SectionCard from "./SectionCard"

import type { LucideIcon, LucideIconProps } from 'lucide-react'

import { 
  ArrowLeft, 
  X, 
  Plus, 
  ChevronDown,
  Settings,
  Gauge,
  Truck,
  Tag,
  MapPin,
  Clock,
  Calendar,
  AlertTriangle,
  XCircle,
  Mail,
  Bell,
  Link,
  Info,
  AlertCircle,
  AlertOctagon,
  Thermometer,
  Zap,
  Fuel,
  Shield,
  Lock,
  Unlock,
  Key,
  Eye,
  EyeOff,
  Signal,
  Wifi,
  Battery,
  BatteryLow,
  Navigation,
  Target,
  Activity,
  Radio,
  Satellite,
  Power,
  Smartphone,
  Monitor,
  Car,
  Plane,
  Ship,
  Train,
  Bike,
  Bus,
  Home,
  Building,
  Factory,
  Wrench,
  Cog,
  Database,
  HardDrive,
  Cpu,
  MemoryStick,
  Router,
  Globe,
  Cloud,
  Sun,
  Moon,
  Star,
  Heart,
  CheckCircle,
  XSquare,
  Triangle,
  Square,
  Circle,
  Diamond,
  Hexagon,
  Pentagon,
  GripVertical

} from "lucide-react"
import { Rule, RuleCondition, RuleConditionGroup } from "../types"
import { UnidadesSelectorInput } from "./UnidadesSelectorInput"
import { EtiquetasSelectorInput } from "./EtiquetasSelectorInput"
import { ZonasSelectorInput } from "./ZonasSelectorInput"
import { GenericSelectorInput } from "./GenericSelectorInput"
import { SaveRuleModal } from "./SaveRuleModal"
import { ExitRuleConfirmationModal } from "./ExitRuleConfirmationModal"
import { SensorSelectorWithSearch } from "./SensorSelectorWithSearch"
import { initialTags } from "../constants/data"
import { spacing, toPx, radii } from "../styles/tokens"

const { Title, Paragraph } = Typography;

interface UnidadData {
  id: string
  name: string
  status: string
  vehicleType: string
}

interface TagData {
  id: string
  name: string
  color: string
  vehicleCount: number
}

const DEFAULT_UNIT_STATUS = 'Activo'
const DEFAULT_UNIT_TYPE = 'Camión'

const normalizeUnitSelection = (unit: UnidadData | string, fallbackIndex = 0): UnidadData => {
  if (unit && typeof unit === 'object') {
    return {
      id: unit.id || `unit-${fallbackIndex + 1}`,
      name: unit.name || unit.id || `Unidad ${fallbackIndex + 1}`,
      status: unit.status || DEFAULT_UNIT_STATUS,
      vehicleType: unit.vehicleType || DEFAULT_UNIT_TYPE
    }
  }

  const normalizedId =
    typeof unit === 'string' && unit.trim().length > 0
      ? unit
      : `unit-${fallbackIndex + 1}`

  return {
    id: normalizedId,
    name: normalizedId,
    status: DEFAULT_UNIT_STATUS,
    vehicleType: DEFAULT_UNIT_TYPE
  }
}

const normalizeUnitsSelection = (units: (UnidadData | string)[] = []): UnidadData[] =>
  units.map((unit, index) => normalizeUnitSelection(unit, index))

// Import email templates from separate file
import { userEmailTemplates as initialEmailTemplates, type UserEmailTemplate } from "../constants/emailTemplates"
import { showCustomToast } from "./CustomToast"



// System sensors for telemetry
const systemTelemetrySensors = [
  { 
    value: 'movement_status', 
    label: 'Estado de movimiento', 
    unit: '', 
    dataType: 'boolean', 
    category: 'system' as const,
    valueDescription: 'En movimiento / Detenido',
    inputType: 'Dropdown (boolean string)',
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
    valueDescription: 'Encendido / Apagado',
    inputType: 'Dropdown (boolean con icono)',
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
    valueDescription: 'Sin conexión / Mayor a 24 hrs / Mayor a 60 min',
    inputType: 'Dropdown (lista predefinida)',
    options: [
      { value: 'no_connection', label: 'Sin conexión' },
      { value: 'more_24h', label: 'Mayor a 24 hrs' },
      { value: 'more_60min', label: 'Mayor a 60 min' }
    ]
  },
  { value: 'battery', label: 'Batería', unit: '%', dataType: 'numeric', category: 'system' as const, valueDescription: '% (0–100)', inputType: 'Input numérico (%)' },
  { value: 'gsm_signal', label: 'Señal GSM (%)', unit: '%', dataType: 'numeric', category: 'system' as const, valueDescription: '% (0–100)', inputType: 'Input numérico (%)' },
  { value: 'satellites_count', label: 'Número de Satélites', unit: '', dataType: 'numeric', category: 'system' as const, valueDescription: 'Número entero (0–20+)', inputType: 'Input numérico' },
  { value: 'location', label: 'Ubicación', unit: '', dataType: 'string', category: 'system' as const, valueDescription: 'Dirección o coordenadas', inputType: 'Input texto / mapa' },
  { value: 'relative_distance', label: 'Distancia relativa (m)', unit: 'm', dataType: 'numeric', category: 'system' as const, valueDescription: 'Metros', inputType: 'Input numérico' },
  { value: 'server_date', label: 'Fecha del servidor', unit: '', dataType: 'datetime', category: 'system' as const, valueDescription: 'Fecha y hora', inputType: 'Selector de fecha/hora' },
  { value: 'device_date', label: 'Fecha del dispositivo', unit: '', dataType: 'datetime', category: 'system' as const, valueDescription: 'Fecha y hora', inputType: 'Selector de fecha/hora' },
  { value: 'speed', label: 'Velocidad (km/h)', unit: 'km/h', dataType: 'numeric', category: 'system' as const, valueDescription: 'km/h (0–250)', inputType: 'Input numérico' },
  { value: 'odometer', label: 'Odómetro (Km)', unit: 'km', dataType: 'numeric', category: 'system' as const, valueDescription: 'Kilómetros', inputType: 'Input numérico' },
  { value: 'latitude', label: 'Latitud (°)', unit: '°', dataType: 'numeric', category: 'system' as const, valueDescription: 'Coordenada decimal', inputType: 'Input numérico' },
  { value: 'longitude', label: 'Longitud (°)', unit: '°', dataType: 'numeric', category: 'system' as const, valueDescription: 'Coordenada decimal', inputType: 'Input numérico' },
  { 
    value: 'power_takeoff', 
    label: 'Toma de fuerza', 
    unit: '', 
    dataType: 'boolean', 
    category: 'system' as const,
    valueDescription: 'Activada / Desactivada',
    inputType: 'Dropdown (boolean string)',
    options: [
      { value: 'true', label: 'Activada' },
      { value: 'false', label: 'Desactivada' }
    ]
  },
  { value: 'temperature', label: 'Temperatura (°C)', unit: '°C', dataType: 'numeric', category: 'system' as const, valueDescription: '°C (-40 a 120)', inputType: 'Input numérico' },
  { value: 'axis_x', label: 'eje x (°)', unit: '°', dataType: 'numeric', category: 'system' as const, valueDescription: 'Grados de acelerómetro', inputType: 'Input numérico' },
  { 
    value: 'panic_button', 
    label: 'Pánico', 
    unit: '', 
    dataType: 'boolean', 
    category: 'system' as const,
    valueDescription: 'Activado / No activado',
    inputType: 'Dropdown (boolean con icono campana)',
    options: [
      { value: 'true', label: 'Activado' },
      { value: 'false', label: 'No activado' }
    ]
  }
]

// Mock custom sensors - in real app, these would be loaded from API
const customTelemetrySensors = [
  { value: 'custom_fuel_sensor', label: 'Sensor de Combustible Personalizado', unit: 'L', dataType: 'numeric', category: 'custom' as const, valueDescription: 'Litros', inputType: 'Input numérico' },
  { 
    value: 'custom_door_sensor', 
    label: 'Sensor de Puerta Trasera', 
    unit: '', 
    dataType: 'boolean', 
    category: 'custom' as const,
    valueDescription: 'Abierta / Cerrada',
    inputType: 'Dropdown (boolean)',
    options: [
      { value: 'true', label: 'Abierta' },
      { value: 'false', label: 'Cerrada' }
    ]
  },
  { value: 'custom_cargo_weight', label: 'Peso de Carga', unit: 'kg', dataType: 'numeric', category: 'custom' as const, valueDescription: 'Kilogramos', inputType: 'Input numérico' },
  { 
    value: 'custom_driver_id', 
    label: 'ID Chofer Personalizado', 
    unit: '', 
    dataType: 'string', 
    category: 'custom' as const,
    valueDescription: 'Lista de choferes autorizados',
    inputType: 'Dropdown (lista predefinida)',
    options: [
      { value: 'ID001', label: 'Juan Pérez (ID001)' },
      { value: 'ID002', label: 'María Rodríguez (ID002)' },
      { value: 'ID003', label: 'Carlos García (ID003)' },
      { value: 'ID004', label: 'Ana Martínez (ID004)' },
      { value: 'ID005', label: 'Luis Hernández (ID005)' }
    ]
  }
]

// Combined sensors for backward compatibility
const telemetrySensors = [...systemTelemetrySensors, ...customTelemetrySensors]

type VariablePreviewValue = string | (() => string)

type EventMessageVariable = MessageVariableDescriptor & {
  preview: VariablePreviewValue
  category: 'vehicle' | 'context' | 'sensor' | 'system'
}

const EVENT_MESSAGE_VARIABLES: EventMessageVariable[] = [
  {
    key: '{unidad}',
    label: 'Unidad',
    description: 'Nombre o identificador de la unidad que generó el evento',
    preview: 'Unidad ABC-123',
    category: 'vehicle',
  },
  {
    key: '{chofer}',
    label: 'Chofer',
    description: 'Nombre del chofer asociado a la unidad',
    preview: 'Juan Pérez',
    category: 'vehicle',
  },
  {
    key: '{conductor}',
    label: 'Conductor',
    description: 'Identificador del conductor (sensor o llave iButton)',
    preview: 'Carlos Martínez',
    category: 'vehicle',
  },
  {
    key: '{patente}',
    label: 'Patente',
    description: 'Patente o matrícula de la unidad',
    preview: 'ABC123',
    category: 'vehicle',
  },
  {
    key: '{modelo}',
    label: 'Modelo',
    description: 'Modelo del vehículo reportado en el evento',
    preview: 'Ford Transit',
    category: 'vehicle',
  },
  {
    key: '{empresa}',
    label: 'Empresa',
    description: 'Empresa propietaria o asignada a la unidad',
    preview: 'Numaris Logistics',
    category: 'vehicle',
  },
  {
    key: '{ubicacion_link}',
    label: 'Ubicación con enlace',
    description: 'Dirección con enlace a mapas donde sucedió el evento',
    preview: 'Av. Corrientes 1234, Buenos Aires',
    category: 'context',
  },
  {
    key: '{direccion}',
    label: 'Dirección',
    description: 'Dirección textual del evento',
    preview: 'Av. Corrientes 1234',
    category: 'context',
  },
  {
    key: '{ciudad}',
    label: 'Ciudad',
    description: 'Ciudad detectada para la ubicación del evento',
    preview: 'Buenos Aires',
    category: 'context',
  },
  {
    key: '{zona}',
    label: 'Zona',
    description: 'Zona geográfica o geocerca involucrada',
    preview: 'Zona Centro',
    category: 'context',
  },
  {
    key: '{fecha_hora}',
    label: 'Fecha y hora',
    description: 'Fecha y hora en la que se generó el evento',
    preview: () => new Date().toLocaleString('es-AR'),
    category: 'context',
  },
  {
    key: '{fecha}',
    label: 'Fecha',
    description: 'Fecha formateada del evento',
    preview: () => new Date().toLocaleDateString('es-AR'),
    category: 'context',
  },
  {
    key: '{hora}',
    label: 'Hora',
    description: 'Hora local del evento',
    preview: () => new Date().toLocaleTimeString('es-AR'),
    category: 'context',
  },
  {
    key: '{timestamp}',
    label: 'Timestamp',
    description: 'Marca de tiempo en milisegundos',
    preview: () => Date.now().toString(),
    category: 'context',
  },
  {
    key: '{velocidad}',
    label: 'Velocidad',
    description: 'Velocidad registrada por el sensor (km/h)',
    preview: '85 km/h',
    category: 'sensor',
  },
  {
    key: '{temperatura}',
    label: 'Temperatura',
    description: 'Temperatura de motor o ambiente registrada',
    preview: '25 °C',
    category: 'sensor',
  },
  {
    key: '{combustible}',
    label: 'Combustible',
    description: 'Nivel de combustible disponible',
    preview: '75 %',
    category: 'sensor',
  },
  {
    key: '{rpm}',
    label: 'RPM',
    description: 'Revoluciones por minuto del motor',
    preview: '2.450 RPM',
    category: 'sensor',
  },
  {
    key: '{voltaje}',
    label: 'Voltaje',
    description: 'Voltaje de la batería del vehículo',
    preview: '12,4 V',
    category: 'sensor',
  },
  {
    key: '{bateria}',
    label: 'Batería',
    description: 'Nivel de batería del dispositivo',
    preview: '89 %',
    category: 'sensor',
  },
  {
    key: '{senal_gsm}',
    label: 'Señal GSM',
    description: 'Potencia de la señal GSM reportada',
    preview: '78 %',
    category: 'sensor',
  },
  {
    key: '{satelites}',
    label: 'Satélites',
    description: 'Cantidad de satélites utilizados en el fix',
    preview: '12',
    category: 'sensor',
  },
  {
    key: '{odometro}',
    label: 'Odómetro',
    description: 'Kilometraje acumulado de la unidad',
    preview: '125.340 km',
    category: 'sensor',
  },
  {
    key: '{latitud}',
    label: 'Latitud',
    description: 'Latitud donde se registró el evento',
    preview: '-34.6037',
    category: 'sensor',
  },
  {
    key: '{longitud}',
    label: 'Longitud',
    description: 'Longitud donde se registró el evento',
    preview: '-58.3816',
    category: 'sensor',
  },
  {
    key: '{distancia}',
    label: 'Distancia relativa',
    description: 'Distancia acumulada respecto de la condición configurada',
    preview: '320 m',
    category: 'sensor',
  },
  {
    key: '{fecha_servidor}',
    label: 'Fecha del servidor',
    description: 'Fecha y hora registradas en el servidor',
    preview: () => new Date().toLocaleString('es-AR'),
    category: 'sensor',
  },
  {
    key: '{fecha_dispositivo}',
    label: 'Fecha del dispositivo',
    description: 'Fecha y hora reportadas por el dispositivo',
    preview: () => new Date().toLocaleString('es-AR'),
    category: 'sensor',
  },
  {
    key: '{ignicion}',
    label: 'Ignición',
    description: 'Estado de ignición del vehículo',
    preview: 'Encendido',
    category: 'sensor',
  },
  {
    key: '{movimiento}',
    label: 'Movimiento',
    description: 'Estado de movimiento de la unidad',
    preview: 'En movimiento',
    category: 'sensor',
  },
  {
    key: '{conexion}',
    label: 'Conexión',
    description: 'Estado de conexión del dispositivo',
    preview: 'Activa',
    category: 'sensor',
  },
  {
    key: '{sensor_puerta}',
    label: 'Sensor de puerta',
    description: 'Estado del sensor de puerta configurado',
    preview: 'Cerrada',
    category: 'sensor',
  },
  {
    key: '{sensor_carga}',
    label: 'Sensor de carga',
    description: 'Estado del sensor de carga o compuerta',
    preview: 'Con carga',
    category: 'sensor',
  },
  {
    key: '{humedad}',
    label: 'Humedad',
    description: 'Nivel de humedad reportado por sensores ambientales',
    preview: '68 %',
    category: 'sensor',
  },
  {
    key: '{aceleracion}',
    label: 'Aceleración',
    description: 'Aceleración instantánea detectada',
    preview: '2,3 m/s²',
    category: 'sensor',
  },
  {
    key: '{frenado}',
    label: 'Frenado',
    description: 'Intensidad del frenado detectado',
    preview: 'Suave',
    category: 'sensor',
  },
  {
    key: '{giro}',
    label: 'Giro',
    description: 'Dirección del giro detectado',
    preview: 'Izquierda',
    category: 'sensor',
  },
  {
    key: '{inclinacion}',
    label: 'Inclinación',
    description: 'Ángulo de inclinación reportado',
    preview: '5°',
    category: 'sensor',
  },
  {
    key: '{peso}',
    label: 'Peso',
    description: 'Peso total reportado por sensores de balanza',
    preview: '2.840 kg',
    category: 'sensor',
  },
  {
    key: '{peso_carga}',
    label: 'Peso de carga',
    description: 'Peso específico de la carga detectada',
    preview: '1.250 kg',
    category: 'sensor',
  },
  {
    key: '{altura}',
    label: 'Altura',
    description: 'Altura sobre el nivel del mar reportada',
    preview: '156 m',
    category: 'sensor',
  },
  {
    key: '{toma_fuerza}',
    label: 'Toma de fuerza',
    description: 'Estado de la toma de fuerza del vehículo',
    preview: 'Inactiva',
    category: 'sensor',
  },
  {
    key: '{eje_x}',
    label: 'Eje X',
    description: 'Lectura del eje X del acelerómetro',
    preview: '1,2 g',
    category: 'sensor',
  },
  {
    key: '{panico}',
    label: 'Botón de pánico',
    description: 'Estado del botón de pánico',
    preview: 'No activado',
    category: 'sensor',
  },
  {
    key: '{evento_id}',
    label: 'ID de evento',
    description: 'Identificador interno del evento generado',
    preview: 'EVT-001',
    category: 'system',
  },
  {
    key: '{regla_nombre}',
    label: 'Nombre de la regla',
    description: 'Nombre de la regla que disparó el evento',
    preview: 'Exceso de velocidad',
    category: 'system',
  },
  {
    key: '{severidad}',
    label: 'Severidad',
    description: 'Nivel de severidad configurado para la regla',
    preview: 'Alta',
    category: 'system',
  },
  {
    key: '{duracion}',
    label: 'Duración',
    description: 'Duración que se cumplió para disparar el evento',
    preview: '5 minutos',
    category: 'system',
  },
  {
    key: '{usuario}',
    label: 'Usuario',
    description: 'Usuario responsable asignado al evento',
    preview: 'supervisor-flota',
    category: 'system',
  },
  {
    key: '{plataforma}',
    label: 'Plataforma',
    description: 'Nombre de la plataforma que envía la notificación',
    preview: 'Numaris',
    category: 'system',
  },
  {
    key: '{version}',
    label: 'Versión',
    description: 'Versión del sistema o plantilla utilizada',
    preview: 'v2.1',
    category: 'system',
  },
  {
    key: '{estado_motor}',
    label: 'Estado del motor',
    description: 'Estado operativo del motor',
    preview: 'En funcionamiento',
    category: 'sensor',
  },
  {
    key: '{nivel_aceite}',
    label: 'Nivel de aceite',
    description: 'Nivel de aceite registrado por sensores',
    preview: '85 %',
    category: 'sensor',
  },
  {
    key: '{presion}',
    label: 'Presión',
    description: 'Presión detectada por sensores hidráulicos o neumáticos',
    preview: '32 PSI',
    category: 'sensor',
  },
  {
    key: '{evento}',
    label: 'Nombre del evento',
    description: 'Descripción corta del evento generado',
    preview: 'Alerta de exceso de velocidad',
    category: 'system',
  },
]

const EVENT_MESSAGE_VARIABLES_MAP = new Map<string, EventMessageVariable>()
EVENT_MESSAGE_VARIABLES.forEach((variable) => {
  EVENT_MESSAGE_VARIABLES_MAP.set(variable.key, variable)
})

const SENSOR_TO_VARIABLE_KEY: Record<string, string> = {
  speed: '{velocidad}',
  fuel_level: '{combustible}',
  temperature: '{temperatura}',
  cargo_temp: '{temperatura}',
  engine_temp: '{temperatura}',
  battery: '{bateria}',
  gsm_signal: '{senal_gsm}',
  satellites_count: '{satelites}',
  location: '{ubicacion_link}',
  relative_distance: '{distancia}',
  server_date: '{fecha_servidor}',
  device_date: '{fecha_dispositivo}',
  speed_limit: '{velocidad}',
  odometer: '{odometro}',
  latitude: '{latitud}',
  longitude: '{longitud}',
  power_takeoff: '{toma_fuerza}',
  temperature_axis: '{temperatura}',
  axis_x: '{eje_x}',
  panic_button: '{panico}',
  movement_status: '{movimiento}',
  ignition: '{ignicion}',
  connection_status: '{conexion}',
  custom_fuel_sensor: '{combustible}',
  custom_door_sensor: '{sensor_puerta}',
  custom_cargo_weight: '{peso_carga}',
  custom_driver_id: '{conductor}',
}

const CONTEXT_VARIABLE_PRIORITY = [
  '{unidad}',
  '{conductor}',
  '{chofer}',
  '{fecha_hora}',
  '{ubicacion_link}',
  '{zona}',
]

const VARIABLE_TOKEN_REGEX = /\{[^}]+\}/g

const getUniqueVariablesInText = (text: string): string[] => {
  if (!text) return []
  const matches = text.match(VARIABLE_TOKEN_REGEX)
  if (!matches) return []
  const result: string[] = []
  const seen = new Set<string>()
  matches.forEach((match) => {
    if (!seen.has(match)) {
      seen.add(match)
      result.push(match)
    }
  })
  return result
}

interface SuggestionContext {
  geographicZone: string
  appliesTo: string
  eventTiming: string
}

const buildSuggestedVariables = (
  conditionGroups: RuleConditionGroup[],
  eventMessage: string,
  context: SuggestionContext
): EventMessageVariable[] => {
  const suggestions: EventMessageVariable[] = []
  const seen = new Set<string>()

  const pushVariable = (key: string) => {
    const normalizedKey = key.startsWith('{') ? key : `{${key}}`
    if (seen.has(normalizedKey)) return
    const variable = EVENT_MESSAGE_VARIABLES_MAP.get(normalizedKey)
    if (!variable) return
    seen.add(normalizedKey)
    suggestions.push(variable)
  }

  conditionGroups.forEach((group) => {
    group.conditions.forEach((condition) => {
      if (!condition.sensor) return
      const variableKey = SENSOR_TO_VARIABLE_KEY[condition.sensor]
      if (variableKey) {
        pushVariable(variableKey)
      }
    })
  })

  const contextualKeys = [...CONTEXT_VARIABLE_PRIORITY]

  if (context.geographicZone && context.geographicZone !== 'cualquier-lugar') {
    contextualKeys.push('{zona}', '{direccion}')
  }

  if (context.appliesTo && context.appliesTo !== 'all-units') {
    contextualKeys.push('{unidad}', '{conductor}', '{chofer}')
  }

  if (context.eventTiming && context.eventTiming !== 'cumplan-condiciones') {
    contextualKeys.push('{duracion}', '{hora}')
  }

  contextualKeys.forEach(pushVariable)

  getUniqueVariablesInText(eventMessage).forEach(pushVariable)

  if (suggestions.length < 6) {
    for (const variable of EVENT_MESSAGE_VARIABLES) {
      if (suggestions.length >= 6) break
      pushVariable(variable.key)
    }
  }

  return suggestions.slice(0, 6)
}

const resolveVariablePreview = (key: string): string => {
  const normalizedKey = key.startsWith('{') ? key : `{${key}}`
  const variable = EVENT_MESSAGE_VARIABLES_MAP.get(normalizedKey)
  if (!variable) {
    return normalizedKey
  }

  const { preview } = variable
  return typeof preview === 'function' ? preview() : preview
}

const SuggestedVariableDragIcon = () => (
  <svg
    width="12"
    height="16"
    viewBox="0 0 12 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="shrink-0"
  >
    {[0, 1, 2, 3].map((row) => (
      <g key={row} transform={`translate(0, ${row * 4})`}>
        {[2, 8].map((cx) => (
          <circle
            key={cx}
            cx={cx}
            cy={2}
            r={1.4}
            fill="#BEA5F5"
          />
        ))}
      </g>
    ))}
  </svg>
)

// Severity configuration with colors
const severityConfig = {
  high: {
    label: 'Alta',
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
    borderColor: 'border-red-200',
    previewBg: '#FFE1E1',
    previewText: '#DF3F40',
  },
  medium: {
    label: 'Media',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-200',
    previewBg: '#FFEAD5',
    previewText: '#C2410C',
  },
  low: {
    label: 'Baja',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
    previewBg: '#DBEAFE',
    previewText: '#1D4ED8',
  },
  informative: {
    label: 'Informativo',
    bgColor: 'bg-cyan-100',
    textColor: 'text-cyan-700',
    borderColor: 'border-cyan-200',
    previewBg: '#CFFAFE',
    previewText: '#0E7490',
  },
} as const

const eventIconOptions = [
  { id: 'info', icon: Info },
  { id: 'warning', icon: AlertTriangle },
  { id: 'alert', icon: AlertCircle },
  { id: 'critical', icon: AlertOctagon },
  { id: 'thermometer', icon: Thermometer },
  { id: 'zap', icon: Zap },
  { id: 'fuel', icon: Fuel },
  { id: 'shield', icon: Shield },
  { id: 'lock', icon: Lock },
  { id: 'unlock', icon: Unlock },
  { id: 'key', icon: Key },
  { id: 'eye', icon: Eye },
  { id: 'eyeoff', icon: EyeOff },
  { id: 'signal', icon: Signal },
  { id: 'wifi', icon: Wifi },
  { id: 'battery', icon: Battery },
  { id: 'batterylow', icon: BatteryLow },
  { id: 'navigation', icon: Navigation },
  { id: 'target', icon: Target },
  { id: 'activity', icon: Activity },
  { id: 'radio', icon: Radio },
  { id: 'satellite', icon: Satellite },
  { id: 'power', icon: Power },
  { id: 'smartphone', icon: Smartphone },
  { id: 'monitor', icon: Monitor },
  { id: 'car', icon: Car },
  { id: 'plane', icon: Plane },
  { id: 'ship', icon: Ship },
  { id: 'train', icon: Train },
  { id: 'bike', icon: Bike },
  { id: 'bus', icon: Bus },
  { id: 'home', icon: Home },
  { id: 'building', icon: Building },
  { id: 'factory', icon: Factory },
  { id: 'wrench', icon: Wrench },
  { id: 'cog', icon: Cog },
  { id: 'database', icon: Database },
  { id: 'harddrive', icon: HardDrive },
  { id: 'cpu', icon: Cpu },
  { id: 'memorystick', icon: MemoryStick },
  { id: 'router', icon: Router },
  { id: 'globe', icon: Globe },
  { id: 'cloud', icon: Cloud },
  { id: 'sun', icon: Sun },
  { id: 'moon', icon: Moon },
  { id: 'star', icon: Star },
  { id: 'heart', icon: Heart },
  { id: 'checkcircle', icon: CheckCircle },
  { id: 'xsquare', icon: XSquare },
  { id: 'triangle', icon: Triangle },
  { id: 'square', icon: Square },
  { id: 'circle', icon: Circle },
  { id: 'diamond', icon: Diamond },
  { id: 'hexagon', icon: Hexagon },
  { id: 'pentagon', icon: Pentagon },
]

type IconPair = {
  outline: LucideIcon
  solid: React.FC<LucideIconProps>
}

const eventIconMap = eventIconOptions.reduce<Record<string, IconPair>>((acc, option) => {
  const SolidIcon: React.FC<LucideIconProps> = ({ color, stroke, ...rest }) => {
    const fillColor = color || 'currentColor'
    const strokeColor = stroke || '#FFFFFF'

    return (
      <option.icon
        {...rest}
        strokeWidth={0}
        fill={fillColor}
        stroke={strokeColor}
        color={strokeColor}
      />
    )
  }

  acc[option.id] = { outline: option.icon, solid: SolidIcon }
  return acc
}, {})

const operatorOptions = [
  { value: 'eq', label: 'es igual a' },
  { value: 'neq', label: 'es distinto de' },
  { value: 'gt', label: 'es mayor que' },
  { value: 'lt', label: 'es menor que' },
  { value: 'gte', label: 'es igual o mayor que' },
  { value: 'lte', label: 'es igual o menor que' },
  { value: 'contains', label: 'contiene' },
  { value: 'not_contains', label: 'no contiene' }
]

// Group-based components for drag and drop functionality
interface DraggableConditionGroupProps {
  group: RuleConditionGroup;
  groupIndex: number;
  moveGroup: (fromIndex: number, toIndex: number) => void;
  updateGroup: (groupId: string, field: string, value: any) => void;
  removeGroup: (groupId: string) => void;
  addConditionToGroup: (groupId: string) => void;
  updateConditionInGroup: (groupId: string, conditionId: string, field: string, value: any) => void;
  removeConditionFromGroup: (groupId: string, conditionId: string) => void;
  moveConditionInGroup: (groupId: string, fromIndex: number, toIndex: number) => void;
  telemetrySensors: any[];
  operatorOptions: any[];
  totalGroups: number;
  showValidationErrors: boolean;
}

interface DraggableConditionInGroupProps {
  condition: RuleCondition;
  conditionIndex: number;
  groupId: string;
  moveConditionInGroup: (groupId: string, fromIndex: number, toIndex: number) => void;
  updateConditionInGroup: (groupId: string, conditionId: string, field: string, value: any) => void;
  removeConditionFromGroup: (groupId: string, conditionId: string) => void;
  telemetrySensors: any[];
  operatorOptions: any[];
  conditionsInGroupLength: number;
  showRemoveButton: boolean;
  showValidationErrors: boolean;
}

// Legacy DraggableCondition component for backward compatibility
interface DraggableConditionProps {
  condition: RuleCondition;
  index: number;
  moveCondition: (fromIndex: number, toIndex: number) => void;
  updateCondition: (id: string, field: string, value: any) => void;
  removeCondition: (id: string) => void;
  telemetrySensors: any[];
  operatorOptions: any[];
  conditionsLength: number;
}

function DraggableConditionInGroup({
  condition,
  conditionIndex,
  groupId,
  moveConditionInGroup,
  updateConditionInGroup,
  removeConditionFromGroup,
  telemetrySensors,
  operatorOptions,
  conditionsInGroupLength,
  showRemoveButton,
  showValidationErrors
}: DraggableConditionInGroupProps) {
  const [{ isDragging }, drag] = useDrag({
    type: 'condition-in-group',
    item: { conditionIndex, groupId },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const [, drop] = useDrop({
    accept: 'condition-in-group',
    hover: (draggedItem: { conditionIndex: number; groupId: string }) => {
      if (draggedItem.groupId === groupId && draggedItem.conditionIndex !== conditionIndex) {
        moveConditionInGroup(groupId, draggedItem.conditionIndex, conditionIndex)
        draggedItem.conditionIndex = conditionIndex
      }
    },
  })

  const sensor = telemetrySensors.find(s => s.value === condition.sensor)

  // Filter operators based on sensor dataType
  const getAvailableOperators = (sensorDataType: string) => {
    if (sensorDataType === 'boolean' || sensorDataType === 'string') {
      // For boolean and string sensors: only equals and not equals
      return operatorOptions.filter(op => op.value === 'eq' || op.value === 'neq')
    } else {
      // For numeric sensors: all operators (=, >, <, ≥, ≤, ≠)
      return operatorOptions
    }
  }

  const availableOperators = sensor ? getAvailableOperators(sensor.dataType) : operatorOptions
  const isValueProvided = condition.value !== '' && condition.value !== null && condition.value !== undefined
  const isOperatorDisabled = !condition.sensor
  const isValueDisabled = !condition.sensor
  const showSensorError = showValidationErrors && !condition.sensor
  const showOperatorError = showValidationErrors && !condition.operator && !isOperatorDisabled
  const showValueError = showValidationErrors && !isValueProvided && !isValueDisabled
  const getInputErrorStyles = (hasError: boolean) =>
    hasError
      ? ({
          border: '1px solid #F04438',
          borderRadius: '8px',
          boxShadow: 'none'
        } as React.CSSProperties)
      : undefined


  return (
    <TooltipProvider>
      <div
        ref={(node) => drag(drop(node))}
        className={`rounded-lg border border-gray-200/50 bg-white transition-all ${isDragging ? 'opacity-50' : 'hover:border-blue-200 hover:shadow-sm'}`}
        style={{ padding: '8px' }}
      >
      <div className="flex gap-3 relative" style={{ paddingTop: '8px' }}>
        {/* Drag handle */}
        <div 
          ref={drag}
          className="flex-shrink-0 cursor-move hover:bg-gray-100 rounded flex items-center justify-center"
          style={{ width: '36px', height: '36px', marginTop: '28px' }}
        >
          <GripVertical className="w-4 h-4 text-gray-400" />
        </div>

        <div className="min-w-0" style={{ flex: '0 0 180px' }}>
          <Label className="block mb-2" textClassName="text-[14px]">
            <span className="text-red-500 mr-1">*</span>
            Sensor
          </Label>
          <SensorSelectorWithSearch
            value={condition.sensor}
            onValueChange={(value) => updateConditionInGroup(groupId, condition.id, 'sensor', value)}
            systemSensors={systemTelemetrySensors}
            customSensors={customTelemetrySensors}
            placeholder="Seleccionar sensor"
            className="w-full max-w-[180px] text-[14px]"
            hasError={showSensorError}
          />
          {showSensorError && (
            <p className="mt-1 text-[12px] text-red-500">Campo obligatorio.</p>
          )}
        </div>

        <div className="min-w-0" style={{ flex: '0 0 180px' }}>
          <Label className="block mb-2" textClassName="text-[14px]">
            <span className="text-red-500 mr-1">*</span>
            Operador
          </Label>
          <Select
            value={condition.operator}
            onValueChange={(value) => updateConditionInGroup(groupId, condition.id, 'operator', value)}
            disabled={!condition.sensor}
            aria-invalid={showOperatorError}
          >
            <SelectTrigger
              className="w-full"
              status={showOperatorError ? "error" : undefined}
            >
              <SelectValue placeholder="Seleccionar operador" />
            </SelectTrigger>
            <SelectContent className="rounded-lg overflow-hidden" style={{ borderRadius: '8px' }}>
              {availableOperators.map((op) => (
                <SelectItem key={op.value} value={op.value} className="text-[14px]">
                  {op.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {showOperatorError && (
            <p className="mt-1 text-[12px] text-red-500">Campo obligatorio.</p>
          )}
        </div>

        <div className="min-w-0" style={{ flex: '0 0 180px' }}>
          <Label className="block mb-2" textClassName="text-[14px]">
            <span className="text-red-500 mr-1">*</span>
            Valor
          </Label>
          <div className="flex items-center gap-2">
            {/* Render different input types based on sensor dataType */}
            {sensor?.dataType === 'boolean' ? (
              <Select
                value={condition.value}
                onValueChange={(value) => updateConditionInGroup(groupId, condition.id, 'value', value)}
                disabled={!condition.sensor}
                aria-invalid={showValueError}
              >
                <SelectTrigger
                  className="w-full"
                  status={showValueError ? "error" : undefined}
                >
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent className="rounded-lg overflow-hidden" style={{ borderRadius: '8px' }}>
                  {sensor.options?.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-[14px]">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : sensor?.dataType === 'string' ? (
              <Select
                value={condition.value}
                onValueChange={(value) => updateConditionInGroup(groupId, condition.id, 'value', value)}
                disabled={!condition.sensor}
                aria-invalid={showValueError}
              >
                <SelectTrigger
                  className="w-full"
                  status={showValueError ? "error" : undefined}
                >
                  <SelectValue placeholder="Seleccionar opción" />
                </SelectTrigger>
                <SelectContent className="rounded-lg overflow-hidden" style={{ borderRadius: '8px' }}>
                  {sensor.options?.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-[14px]">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
            <Input
              type="number"
              placeholder="Valor"
              value={condition.value}
              onChange={(e) => updateConditionInGroup(groupId, condition.id, 'value', e.target.value)}
              className="w-full text-[14px]"
              aria-invalid={showValueError}
              style={{
                height: '32px',
                borderRadius: '8px',
                ...getInputErrorStyles(showValueError)
              }}
              disabled={!condition.sensor}
            />
            )}
            {sensor && sensor.unit && (
              <span className="text-[14px] text-gray-600 whitespace-nowrap">
                {sensor.unit}
              </span>
            )}
          </div>
          {showValueError && (
            <p className="mt-1 text-[12px] text-red-500">Campo obligatorio.</p>
          )}
        </div>

        {showRemoveButton && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => removeConditionFromGroup(groupId, condition.id)}
            className="w-8 h-8 bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
            style={{ marginTop: '28px' }}
          >
            <CloseOutlined className="text-gray-700 text-[14px]" />
          </Button>
        )}
      </div>
      </div>
    </TooltipProvider>
  )
}

function DraggableCondition({
  condition,
  index,
  moveCondition,
  updateCondition,
  removeCondition,
  telemetrySensors,
  operatorOptions,
  conditionsLength
}: DraggableConditionProps) {
  const [{ isDragging }, drag] = useDrag({
    type: 'condition',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const [, drop] = useDrop({
    accept: 'condition',
    hover: (draggedItem: { index: number }) => {
      if (draggedItem.index !== index) {
        moveCondition(draggedItem.index, index)
        draggedItem.index = index
      }
    },
  })

  const sensor = telemetrySensors.find(s => s.value === condition.sensor)

  // Filter operators based on sensor dataType
  const getAvailableOperators = (sensorDataType: string) => {
    if (sensorDataType === 'boolean' || sensorDataType === 'string') {
      // For boolean and string sensors: only equals and not equals
      return operatorOptions.filter(op => op.value === 'eq' || op.value === 'neq')
    } else {
      // For numeric sensors: all operators (=, >, <, ≥, ≤, ≠)
      return operatorOptions
    }
  }

  const availableOperators = sensor ? getAvailableOperators(sensor.dataType) : operatorOptions

  return (
    <TooltipProvider>
      <div
        ref={(node) => drag(drop(node))}
        className={`rounded-lg border border-gray-200/50 ${index === 0 ? 'bg-white' : 'bg-gray-50/50'} transition-all ${isDragging ? 'opacity-50' : 'hover:border-blue-200 hover:shadow-sm'}`}
        style={{ padding: '8px' }}
      >
      <div className="flex gap-3" style={{ paddingTop: '8px' }}>
        {/* Drag handle - show for all conditions */}
        <div 
          ref={drag}
          className="flex-shrink-0 cursor-move hover:bg-gray-100 rounded flex items-center justify-center"
          style={{ width: '36px', height: '36px', marginTop: '28px' }}
        >
          <GripVertical className="w-4 h-4 text-gray-400" />
        </div>

        {/* Logic operator dropdown - only show for conditions after the first */}
        {index > 0 && (
          <div className="min-w-0 w-16">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex bg-gray-100 rounded-md p-1 h-10 items-center mt-6">
                  <button
                    type="button"
                    onClick={() => updateCondition(condition.id, 'logicOperator', 'and')}
                    className={`flex-1 py-1 rounded text-[12px] font-medium transition-colors flex items-center justify-center ${
                      condition.logicOperator === 'and' 
                        ? 'bg-blue-600/30 text-blue-800' 
                        : 'bg-transparent text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    Y
                  </button>
                  <button
                    type="button"
                    onClick={() => updateCondition(condition.id, 'logicOperator', 'or')}
                    className={`flex-1 py-1 rounded text-[12px] font-medium transition-colors flex items-center justify-center ${
                      condition.logicOperator === 'or' 
                        ? 'bg-yellow-500/50 text-yellow-800' 
                        : 'bg-transparent text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    O
                  </button>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {condition.logicOperator === 'and' 
                    ? 'Y: Esta condición Y la siguiente deben cumplirse' 
                    : 'O: Esta condición O la siguiente debe cumplirse'
                  }
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
        )}

        <div className="min-w-0" style={{ flex: '0 0 180px' }}>
          <Label className="block mb-2" textClassName="text-[14px]">Sensor</Label>
          <SensorSelectorWithSearch
            value={condition.sensor}
            onValueChange={(value) => updateCondition(condition.id, 'sensor', value)}
            systemSensors={systemTelemetrySensors}
            customSensors={customTelemetrySensors}
            placeholder="Seleccionar sensor"
            className="w-full max-w-[180px] text-[14px]"
          />
        </div>

        <div className="min-w-0 flex-1">
          <Label className="block mb-2" textClassName="text-[14px]">Operador</Label>
        <Select
          value={condition.operator}
          onValueChange={(value) => updateCondition(condition.id, 'operator', value)}
          disabled={!condition.sensor}
        >
            <SelectTrigger
              className="w-full"
              status={showOperatorError ? "error" : undefined}
            >
              <SelectValue placeholder="Seleccionar operador" />
            </SelectTrigger>
            <SelectContent className="rounded-lg overflow-hidden" style={{ borderRadius: '8px' }}>
              {availableOperators.map((op) => (
                <SelectItem key={op.value} value={op.value} className="text-[14px]">
                  {op.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-0 flex-1">
          <Label className="block mb-2" textClassName="text-[14px]">Valor</Label>
          <div className="flex items-center gap-2">
            {/* Render different input types based on sensor dataType */}
            {sensor?.dataType === 'boolean' ? (
              // Dropdown for boolean sensors (Encendido/Apagado, Activado/Desactivado, etc.)
            <Select
              value={condition.value}
              onValueChange={(value) => updateCondition(condition.id, 'value', value)}
              disabled={!condition.sensor}
            >
                <SelectTrigger
                  className="w-full"
                  status={showValueError ? "error" : undefined}
                >
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent className="rounded-lg overflow-hidden" style={{ borderRadius: '8px' }}>
                  {sensor.options?.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-[14px]">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : sensor?.dataType === 'string' ? (
              // Select with predefined list for string sensors (Chofer, ID Chofer, etc.)
            <Select
              value={condition.value}
              onValueChange={(value) => updateCondition(condition.id, 'value', value)}
              disabled={!condition.sensor}
            >
                <SelectTrigger
                  className="w-full"
                  status={showValueError ? "error" : undefined}
                >
                  <SelectValue placeholder="Seleccionar opción" />
                </SelectTrigger>
                <SelectContent className="rounded-lg overflow-hidden" style={{ borderRadius: '8px' }}>
                  {sensor.options?.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-[14px]">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              // Numeric input for measurable values (km/h, voltios, minutos, °C, etc.)
            <Input
              type="number"
              placeholder="Valor"
              value={condition.value}
              onChange={(e) => updateCondition(condition.id, 'value', e.target.value)}
              className="w-full text-[14px]"
              style={{ height: '32px', borderRadius: '8px' }}
              disabled={!condition.sensor}
            />
            )}
            {sensor && sensor.unit && (
              <span className="text-[14px] text-gray-600 whitespace-nowrap">
                {sensor.unit}
              </span>
            )}
          </div>
        </div>

        {conditionsLength > 1 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => removeCondition(condition.id)}
            className="w-8 h-8 bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
            style={{ marginTop: '34px' }}
          >
            <CloseOutlined className="text-gray-700 text-[14px]" />
          </Button>
        )}
      </div>
      </div>
    </TooltipProvider>
  )
}

function DraggableConditionGroup({
  group,
  groupIndex,
  moveGroup,
  updateGroup,
  removeGroup,
  addConditionToGroup,
  updateConditionInGroup,
  removeConditionFromGroup,
  moveConditionInGroup,
  telemetrySensors,
  operatorOptions,
  totalGroups,
  showValidationErrors
}: DraggableConditionGroupProps) {
  const [{ isDragging }, drag] = useDrag({
    type: 'group',
    item: { groupIndex },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const [, drop] = useDrop({
    accept: 'group',
    hover: (draggedItem: { groupIndex: number }) => {
      if (draggedItem.groupIndex !== groupIndex) {
        moveGroup(draggedItem.groupIndex, groupIndex)
        draggedItem.groupIndex = groupIndex
      }
    },
  })

  return (
    <TooltipProvider>
      <div
        ref={(node) => drag(drop(node))}
        className={`border-2 border-dashed border-blue-200 rounded-lg p-4 mb-4 ${isDragging ? 'opacity-50' : ''} ${groupIndex === 0 ? 'bg-blue-50/30' : 'bg-gray-50/30'}`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Group drag handle */}

            
            <div className="flex items-center gap-2">
              <h4 className="text-[14px] font-medium text-gray-700">
                Grupo {groupIndex + 1}
              </h4>

            </div>

            {/* Group logic operator selector */}
            <div className="flex items-center gap-2">

              <div className="flex bg-gray-100 rounded-md p-1">
                <button
                  type="button"
                  onClick={() => updateGroup(group.id, 'groupLogicOperator', 'and')}
                  className={`px-3 py-2 rounded text-[14px] font-medium transition-colors flex items-center justify-center ${
                    group.groupLogicOperator === 'and' 
                      ? 'bg-blue-600/30 text-blue-800' 
                      : 'bg-transparent text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Todas
                </button>
                <button
                  type="button"
                  onClick={() => updateGroup(group.id, 'groupLogicOperator', 'or')}
                  className={`px-3 py-2 rounded text-[14px] font-medium transition-colors flex items-center justify-center ${
                    group.groupLogicOperator === 'or' 
                      ? 'bg-yellow-500/50 text-yellow-800' 
                      : 'bg-transparent text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Cualquiera
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Add condition button */}
            {group.conditions.length < 3 && (
              <Button
                variant="link"
                size="sm"
                onClick={() => addConditionToGroup(group.id)}
                className="text-[14px] px-2 py-1 h-7 text-blue-600 hover:text-blue-700 flex items-center gap-2 whitespace-nowrap"
              >
                <Plus className="w-3 h-3" />
                <span>Agregar condición</span>
                <span className="text-blue-600">({group.conditions.length}/3)</span>
              </Button>
            )}

            {/* Remove group button */}
            {totalGroups > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeGroup(group.id)}
                className="w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center p-0"
              >
                <X className="w-3 h-3 text-gray-600" />
              </Button>
            )}
          </div>
        </div>



        {/* Conditions within the group */}
        <div className="space-y-3">
          <DndProvider backend={HTML5Backend}>
            {group.conditions.map((condition, conditionIndex) => (
              <DraggableConditionInGroup
                key={condition.id}
                condition={condition}
                conditionIndex={conditionIndex}
                groupId={group.id}
                moveConditionInGroup={moveConditionInGroup}
                updateConditionInGroup={updateConditionInGroup}
                removeConditionFromGroup={removeConditionFromGroup}
                telemetrySensors={telemetrySensors}
                operatorOptions={operatorOptions}
                conditionsInGroupLength={group.conditions.length}
                showRemoveButton={group.conditions.length > 1}
                showValidationErrors={showValidationErrors}
              />
            ))}
          </DndProvider>
        </div>

        {/* Empty state for groups with no conditions */}
        {group.conditions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p className="text-[14px] mb-2">Este grupo no tiene condiciones</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addConditionToGroup(group.id)}
              className="text-[14px]"
            >
              <Plus className="w-3 h-3 mr-1" />
              Agregar primera condición
            </Button>
          </div>
        )}


      </div>
    </TooltipProvider>
  )
}

interface TelemetryWizardProps {
  onSave: (ruleData: Partial<Rule>) => void
  onCancel: () => void
  onBackToTypeSelector: () => void
  rule?: Rule
  onRename?: (ruleId: string, newName: string, newDescription?: string) => void
  wizardType?: 'telemetry' | 'zone'
  forceCreateMode?: boolean
}

export function TelemetryWizard({ onSave, onCancel, onBackToTypeSelector, rule, onRename, wizardType = 'telemetry', forceCreateMode = false }: TelemetryWizardProps) {
  const isEditing = !!rule && !forceCreateMode
  const { addNotification } = useNotifications()

  const resolvedRuleType: 'telemetry' | 'zone' = rule?.ruleType === 'zone' || wizardType === 'zone' ? 'zone' : 'telemetry'
  const wizardLabel = resolvedRuleType === 'zone' ? 'Zonas' : 'Telemetría'
  
  const [activeTab, setActiveTab] = useState("parameters")
  const [ruleName, setRuleName] = useState(rule?.name || "")
  const [ruleDescription, setRuleDescription] = useState(rule?.description || "")
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [showExitConfirmModal, setShowExitConfirmModal] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showParametersErrors, setShowParametersErrors] = useState(false)

  const [isSaving, setIsSaving] = useState(false)
  
  // Parameters - Support both new grouped structure and legacy flat structure
  const createEmptyCondition = () => ({
    id: `condition-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    sensor: '',
    operator: '',
    value: '',
    dataType: 'numeric',
    logicOperator: 'and' as const,
  })

  const createEmptyGroup = () => ({
    id: `group-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    conditions: [createEmptyCondition()],
    groupLogicOperator: 'and' as const,
    betweenGroupOperator: 'and' as const,
  })

  const initialConditionGroups = (() => {
    // If rule has conditionGroups (new structure), standardize the structure
    if (rule?.conditionGroups && rule.conditionGroups.length > 0) {
      return rule.conditionGroups.map((group, index) => ({
        ...group,
        // Standardize the logic operator property
        groupLogicOperator: group.groupLogicOperator || group.logic || 'and',
        // Ensure betweenGroupOperator is set for multi-group scenarios
        betweenGroupOperator: index === 0 ? undefined : (group.betweenGroupOperator || 'or'),
        // Ensure all conditions have required properties
        conditions: group.conditions.map(condition => ({
          ...condition,
          logicOperator: condition.logicOperator || 'and'
        }))
      }))
    }
    
    // If rule has legacy flat conditions, convert them to a single group
    if (rule?.conditions && rule.conditions.length > 0) {
      return [{
        id: 'group-1',
        conditions: rule.conditions.map(condition => ({
          ...condition,
          logicOperator: condition.logicOperator || 'and'
        })),
        groupLogicOperator: 'and' as const,
        betweenGroupOperator: undefined
      }]
    }
    
    // Default: single group with one empty condition
    return [{
      id: 'group-1',
      conditions: [createEmptyCondition()],
      groupLogicOperator: 'and' as const,
      betweenGroupOperator: undefined,
    }]
  })()

  const [conditionGroups, setConditionGroups] = useState<RuleConditionGroup[]>(initialConditionGroups)
  
  // Legacy conditions state for backward compatibility (kept for existing functions)
  const [conditions, setConditions] = useState<RuleCondition[]>(
    rule?.conditions?.map(condition => ({
      ...condition,
      logicOperator: condition.logicOperator || 'and'
    })) || []
  )

  // Apply to
  const [appliesTo, setAppliesTo] = useState('all-units')
  const [selectedUnitsLocal, setSelectedUnitsLocal] = useState<UnidadData[]>([])
  const [selectedTags, setSelectedTags] = useState<TagData[]>([])
  const [showAppliesErrors, setShowAppliesErrors] = useState(false)
  const [showDurationError, setShowDurationError] = useState(false)
  const [showActionsErrors, setShowActionsErrors] = useState(false)

  // Advanced configuration
  const [advancedOpen, setAdvancedOpen] = useState(false)
  
  // Geographic zone configuration
  const [zoneEventAction, setZoneEventAction] = useState<'entrada' | 'salida'>('entrada')
  const [selectedZonesData, setSelectedZonesData] = useState([])
  const [selectedZoneTags, setSelectedZoneTags] = useState<TagData[]>([])
  const [validateZoneEntry, setValidateZoneEntry] = useState(resolvedRuleType !== 'zone')

  useEffect(() => {
    if (!isEditing) {
      setValidateZoneEntry(resolvedRuleType !== 'zone')
    }
  }, [resolvedRuleType, isEditing])

  // Event generation timing
  const [eventTiming, setEventTiming] = useState('cumplan-condiciones')
  
  // Duration configuration
  const [durationValue, setDurationValue] = useState('')
  const [durationUnit, setDurationUnit] = useState('segundos')
  
  // Rule schedule
  const [ruleSchedule, setRuleSchedule] = useState('todo-momento')
  const [scheduleConfig, setScheduleConfig] = useState({
    lunes: { enabled: true, start: '06:00', end: '18:00', scope: 'dentro' },
    martes: { enabled: true, start: '06:00', end: '18:00', scope: 'dentro' },
    miercoles: { enabled: true, start: '06:00', end: '18:00', scope: 'dentro' },
    jueves: { enabled: true, start: '06:00', end: '18:00', scope: 'fuera' },
    viernes: { enabled: true, start: '06:00', end: '18:00', scope: 'dentro' },
    sabado: { enabled: true, start: '06:00', end: '18:00', scope: 'fuera' },
    domingo: { enabled: true, start: '06:00', end: '18:00', scope: 'fuera' }
  })

  // Actions tab state
  const defaultResponsible = rule?.eventSettings?.responsible || 'mariana.manzo@numaris.com'
  const [instructions, setInstructions] = useState(rule?.eventSettings?.instructions || '')
  const [assignResponsible, setAssignResponsible] = useState(
    rule?.eventSettings?.responsible ? true : false
  )
  const [selectedResponsible, setSelectedResponsible] = useState(defaultResponsible)
  const [eventIcon, setEventIcon] = useState(rule?.eventSettings?.icon || 'info')
  const [iconSearch, setIconSearch] = useState('')
  const [eventSeverity, setEventSeverity] = useState(rule?.eventSettings?.severity || 'low')
  const [eventShortName, setEventShortName] = useState(rule?.eventSettings?.shortName ?? '')
  const iconPair = eventIcon ? eventIconMap[eventIcon] : undefined
  const EventIconComponent = iconPair?.outline
  const previewSeverityStyles = severityConfig[eventSeverity] || severityConfig.low
  const PreviewIconComponent: React.FC<LucideIconProps> = iconPair?.solid
    ? (props) => iconPair.solid({ ...props, color: props.color || previewSeverityStyles.previewText, stroke: props.stroke || '#FFFFFF' })
    : (props) => <AlertOctagon {...props} strokeWidth={0} fill={props.color || previewSeverityStyles.previewText} stroke={props.stroke || '#FFFFFF'} />
  const filteredIconOptions = useMemo(
    () => eventIconOptions.filter(({ id }) => id.toLowerCase().includes(iconSearch.toLowerCase())),
    [iconSearch]
  )
  const [eventTags, setEventTags] = useState<Array<{id: string, name: string, color: string}>>(
    rule?.eventSettings?.tags ? rule.eventSettings.tags.map((tag: string) => ({ 
      id: tag.toLowerCase().replace(/\s+/g, '-'), 
      name: tag, 
      color: '#3B82F6' 
    })) : []
  )
  const [unitTags, setUnitTags] = useState<Array<{id: string, name: string, color: string}>>(
    rule?.eventSettings?.unitTags ? rule.eventSettings.unitTags.map((tag: string) => ({ 
      id: tag.toLowerCase().replace(/\s+/g, '-'), 
      name: tag, 
      color: '#3B82F6' 
    })) : []
  )
  const [closePolicy, setClosePolicy] = useState('manualmente')
  const [requireNoteOnClose, setRequireNoteOnClose] = useState(true)
  const [closureTimeValue, setClosureTimeValue] = useState('120')
  const [closureTimeUnit, setClosureTimeUnit] = useState('minutos')
  const [showClosureTimeError, setShowClosureTimeError] = useState(false)
  useEffect(() => {
    if (closePolicy !== 'automaticamente-tiempo') {
      setShowClosureTimeError(false)
    }
  }, [closePolicy])
  const [webhookEnabled, setWebhookEnabled] = useState(false)
  const [sendDeviceCommand, setSendDeviceCommand] = useState(false)
  const [unitTagsEnabled, setUnitTagsEnabled] = useState(false)
  const [unitUntagsEnabled, setUnitUntagsEnabled] = useState(false)
  const [unitUntags, setUnitUntags] = useState<Array<{id: string, name: string, color: string}>>([])

  // Notifications tab state
  const defaultEventMessage = rule?.notifications?.eventMessage || 'La unidad {unidad} ha registrado una alerta en {ubicacion_link} a las {fecha_hora}.'
  const [eventMessage, setEventMessage] = useState(defaultEventMessage)
  const [eventMessageCharCount, setEventMessageCharCount] = useState(defaultEventMessage.length)
  const eventMessageEditorRef = useRef<VariableTextareaHandle>(null)
  const [emailEnabled, setEmailEnabled] = useState(rule?.notifications?.email?.enabled || false)
  const [emailRecipients, setEmailRecipients] = useState(
    rule?.notifications?.email?.recipients || ['usuario@email.com', 'usuario@email.com', 'usuario@email.com']
  )
  const [emailSubject, setEmailSubject] = useState(
    rule?.notifications?.email?.subject || '[ALERTA] {unidad} - {regla_nombre}'
  )
  const [emailDescription, setEmailDescription] = useState(defaultEventMessage)
  const [descriptionCharCount, setDescriptionCharCount] = useState(defaultEventMessage.length)
  
  // Email personalization states
  const [emailTemplates, setEmailTemplates] = useState<UserEmailTemplate[]>(initialEmailTemplates)
  const [customEmailMessage, setCustomEmailMessage] = useState(rule?.notifications?.email?.body || defaultEventMessage)
  const [selectedEmailTemplate, setSelectedEmailTemplate] = useState<string | null>(rule?.notifications?.email?.templateId ?? null)
  const [templateDrawerOpen, setTemplateDrawerOpen] = useState(false)

  const [mapPreviewStart, setMapPreviewStart] = useState('Inicio del evento')
  const [mapPreviewEnd, setMapPreviewEnd] = useState('Punto de seguimiento')
  const [pushNotificationEnabled, setPushNotificationEnabled] = useState(rule?.notifications?.push?.enabled || false)
  const [showNotificationExample, setShowNotificationExample] = useState(false)
  const [notificationExampleType, setNotificationExampleType] = useState<'web' | 'mobile'>('web')
  const headerRef = useRef<HTMLDivElement | null>(null)
  const [headerHeight, setHeaderHeight] = useState(0)

  useEffect(() => {
    const element = headerRef.current
    if (!element) return

    const updateHeight = () => {
      setHeaderHeight(Math.round(element.getBoundingClientRect().height))
    }

    updateHeight()

    if (typeof ResizeObserver === 'undefined') {
      return
    }

    const observer = new ResizeObserver(updateHeight)
    observer.observe(element)

    return () => observer.disconnect()
  }, [])

  const tabsStickyTop = headerHeight > 0 ? headerHeight : 88

  const zoneContextValue = useMemo(
    () =>
      resolvedRuleType === 'zone' && (selectedZonesData.length > 0 || selectedZoneTags.length > 0)
        ? 'zonas-especificas'
        : 'cualquier-lugar',
    [resolvedRuleType, selectedZonesData, selectedZoneTags]
  )

  const suggestedEventVariables = useMemo(
    () =>
      buildSuggestedVariables(conditionGroups, eventMessage, {
        geographicZone: zoneContextValue,
        appliesTo,
        eventTiming,
      }),
    [conditionGroups, eventMessage, zoneContextValue, appliesTo, eventTiming]
  )

  const hasConfiguredSensors = useMemo(
    () =>
      conditionGroups.some((group) =>
        group.conditions.some((condition) => Boolean(condition.sensor))
      ),
    [conditionGroups]
  )

  const handleInsertEventVariable = useCallback(
    (variableKey: string) => {
      if (eventMessageEditorRef.current) {
        eventMessageEditorRef.current.focus()
        eventMessageEditorRef.current.insertVariable(variableKey)
        return
      }

      setEventMessage((prev) => {
        const next = (prev + variableKey).slice(0, 120)
        setEventMessageCharCount(next.length)
        setEmailDescription(next)
        setDescriptionCharCount(next.length)
        return next
      })
    },
    [setEmailDescription, setDescriptionCharCount, setEventMessageCharCount]
  )
  
  // Function to add a web notification example
  const addWebNotificationExample = () => {
    // Process the event message with variables
    const variableReplacements = {
      '{unidad}': 'Unidad ABC-123',
      '{velocidad}': '85 km/h',
      '{ubicacion_link}': 'Av. Corrientes 1234, Buenos Aires',
      '{fecha_hora}': new Date().toLocaleString('es-AR'),
      '{chofer}': 'Juan Pérez',
      '{patente}': 'ABC123',
      '{temperatura}': '25°C',
      '{combustible}': '75%',
      '{ignicion}': 'Encendido',
      '{fecha}': new Date().toLocaleDateString('es-AR'),
      '{hora}': new Date().toLocaleTimeString('es-AR'),
      '{timestamp}': Date.now().toString(),
      '{direccion}': 'Av. Corrientes 1234',
      '{ciudad}': 'Buenos Aires',
      '{coordenadas}': '-34.6037, -58.3816',
      '{modelo}': 'Ford Transit',
      '{evento_id}': 'EVT-001',
      '{regla_nombre}': 'Exceso de velocidad',
      '{severidad}': 'Alta',
      '{duracion}': '5 minutos',
      '{empresa}': 'Mi Empresa',
      '{usuario}': 'supervisor-flota',
      '{plataforma}': 'Numaris',
      '{version}': 'v2.1',
      '{voltaje}': '12.4V',
      '{zona}': 'Zona Centro',
      '{rpm}': '2,450 RPM',
      '{conductor}': 'Carlos Martínez',
      '{presion}': '32 PSI',
      '{nivel_aceite}': '85%',
      '{odometro}': '125,340 km',
      '{estado_motor}': 'En funcionamiento',
      '{bateria}': '89%',
      '{sensor_puerta}': 'Cerrada',
      '{sensor_carga}': 'Con carga',
      '{humedad}': '68%',
      '{aceleracion}': '2.3 m/s²',
      '{frenado}': 'Suave',
      '{giro}': 'Izquierda',
      '{inclinacion}': '5°',
      '{peso}': '2,840 kg',
      '{altura}': '156 m'
    }

    // Use a simple static message for the notification example

    // Add the notification to the global notification center
    addNotification({
      title: 'Exceso de velocidad',
      message: 'La unidad ABC-123 ha excedido el límite de velocidad. Velocidad actual: 85 km/h en Av. Corrientes 1234, Buenos Aires',
      severity: 'high',
      type: 'rule-event'
    })
  }


  const [webhookNotificationEnabled, setWebhookNotificationEnabled] = useState(rule?.notifications?.webhook?.enabled || false)
  const [platformNotificationEnabled, setPlatformNotificationEnabled] = useState(rule?.notifications?.platform?.enabled || false)

  const extractPlainTextFromHtml = useCallback((input: string) => {
    if (typeof document === 'undefined') {
      return input
    }
    const temp = document.createElement('div')
    temp.innerHTML = input
    return temp.textContent || temp.innerText || ''
  }, [])

  // Optimized template selection handler
  const handleTemplateSelection = useCallback((template: UserEmailTemplate) => {
    setEmailRecipients(template.recipients && template.recipients.length > 0 ? template.recipients : [])
    setEmailSubject(template.subject)
    setCustomEmailMessage(template.message)
    const plainDescription = template.message.includes('<')
      ? extractPlainTextFromHtml(template.message)
      : template.message
    setEmailDescription(plainDescription)
    setSelectedEmailTemplate(template.id)
  }, [extractPlainTextFromHtml])

  const handleTemplateSaved = useCallback((payload: {
    name: string;
    subject: string;
    description: string;
    recipients: string[];
    sender: string[];
    messageHtml: string;
  }) => {
    const newTemplate: UserEmailTemplate = {
      id: `template-${Date.now()}`,
      name: payload.name,
      description: payload.description,
      createdBy: 'Usuario',
      createdAt: new Date().toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      usageCount: 0,
      category: 'personal',
      recipients: payload.recipients,
      sender: payload.sender,
      subject: payload.subject,
      message: payload.messageHtml,
    }

    setEmailTemplates((prev) => [newTemplate, ...prev])
    handleTemplateSelection(newTemplate)
    setTemplateDrawerOpen(false)
    showCustomToast({
      title: 'Plantilla guardada',
      description: `"${payload.name}" se añadió a tus plantillas`,
    })
  }, [handleTemplateSelection])

  const selectedEmailTemplateData = useMemo(() => {
    if (!selectedEmailTemplate) return null
    return emailTemplates.find((template) => template.id === selectedEmailTemplate) || null
  }, [selectedEmailTemplate, emailTemplates])

  const renderedEmailTemplateMessage = useMemo(() => {
    if (!customEmailMessage) return []

    const containsHtml = /<\/?[a-z][\s\S]*>/i.test(customEmailMessage)
    if (containsHtml) {
      return [
        <div
          key="html-preview"
          className="text-[13px] leading-[22px] text-[#313655]"
          dangerouslySetInnerHTML={{ __html: customEmailMessage }}
        />,
      ]
    }

    const tokenRegex = /(\{[^}]+\})/g

    return customEmailMessage.split(tokenRegex).map((segment, index) => {
      if (!segment) return null

      if (/^\{[^}]+\}$/.test(segment)) {
        return (
          <span
            key={`token-${index}`}
            className="inline-flex items-center rounded-md bg-[#EFE7FF] px-2 py-0.5 text-[12px] font-medium text-[#5B34B6]"
          >
            {segment}
          </span>
        )
      }

      const lines = segment.split('\n')

      return (
        <Fragment key={`text-${index}`}>
          {lines.map((line, lineIndex) => (
            <Fragment key={`text-${index}-${lineIndex}`}>
              {line}
              {lineIndex < lines.length - 1 && <br />}
            </Fragment>
          ))}
        </Fragment>
      )
    }).filter(Boolean) as React.ReactNode[]
  }, [customEmailMessage])

  const handleZonesChange = (zones) => {
    setSelectedZonesData(zones)
  }

  const handleEventTimingChange = (value: string) => {
    setEventTiming(value as 'cumplan-condiciones' | 'despues-tiempo')
    if (value !== 'despues-tiempo') {
      setShowDurationError(false)
    } else if (Number(durationValue) > 0) {
      setShowDurationError(false)
    }
  }

  const removeZone = (zoneId: string) => {
    setSelectedZonesData(zones => zones.filter(zone => zone.id !== zoneId))
  }

  const updateDaySchedule = (day: string, field: string, value: any) => {
    setScheduleConfig(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }))
  }

  const handleUnitsChange = (units: UnidadData[]) => {
    setSelectedUnitsLocal(units)
    if (appliesTo === 'custom' && (units.length > 0 || selectedTags.length > 0)) {
      setShowAppliesErrors(false)
    }
  }

  const handleTagsChange = (tags: TagData[]) => {
    setSelectedTags(tags)
    if (appliesTo === 'custom' && (selectedUnitsLocal.length > 0 || tags.length > 0)) {
      setShowAppliesErrors(false)
    }
  }

  const handleZoneTagsChange = (tags: TagData[]) => {
    setSelectedZoneTags(tags)
  }

  const ensureInitialConditionGroup = () => {
    setConditionGroups((prev) => {
      if (prev.length === 0) {
        return [createEmptyGroup()]
      }

      const [first, ...rest] = prev
      if (first.conditions.length === 0) {
        return [{ ...first, conditions: [createEmptyCondition()] }, ...rest]
      }

      return prev
    })
  }

  const handleToggleZoneValidation = (checked: boolean) => {
    if (resolvedRuleType !== 'zone') return
    setValidateZoneEntry(checked)
    if (checked) {
      ensureInitialConditionGroup()
    }
  }

  // Effect to initialize form data when editing an existing rule
  useEffect(() => {
    if (rule && (isEditing || forceCreateMode)) {
      console.log('Initializing form with rule data:', rule)
      console.log('Current form state before initialization:', {
        ruleName,
        ruleDescription,
        conditionGroups: conditionGroups.length,
        appliesTo,
        instructions
      })
      
      // Initialize basic rule info
      setRuleName(rule.name || '')
      setRuleDescription(rule.description || '')
      
      // Initialize condition groups if available
      if (rule.conditionGroups && rule.conditionGroups.length > 0) {
        setConditionGroups(rule.conditionGroups)
      } else if (rule.conditions && rule.conditions.length > 0) {
        // Convert legacy conditions to groups format
        const legacyGroup = {
          id: 'group-1',
          logic: 'and' as const,
          conditions: rule.conditions
        }
        setConditionGroups([legacyGroup])
      }
      
      // Initialize event settings
      if (rule.eventSettings) {
        setInstructions(rule.eventSettings.instructions || '')
        setEventSeverity(rule.eventSettings.severity || 'medium')
        setEventIcon(rule.eventSettings.icon || 'info')
        setEventShortName(rule.eventSettings.shortName ?? '')
        const responsibleValue = rule.eventSettings.responsible || defaultResponsible
        setSelectedResponsible(responsibleValue)
        const hasExplicitResponsible = rule.eventSettings.responsible !== undefined
        setAssignResponsible(hasExplicitResponsible ? responsibleValue.trim().length > 0 : false)

        if (rule.eventSettings.tags) {
          setEventTags(rule.eventSettings.tags.map(tagName => ({ name: tagName })))
        }
        if (rule.eventSettings.unitTags) {
          setUnitTags(rule.eventSettings.unitTags.map(tagName => ({ name: tagName })))
        }
        if (rule.eventSettings.unitUntags) {
          setUnitUntags(rule.eventSettings.unitUntags.map(tagName => ({ name: tagName })))
        }
      }
      
      // Initialize notification settings
      if (rule.notifications) {
        setEventMessage(rule.notifications.eventMessage || '')
        
        if (rule.notifications.email) {
          setEmailEnabled(rule.notifications.email.enabled || false)
          setEmailSubject(rule.notifications.email.subject || '')
          setEmailRecipients(rule.notifications.email.recipients || [])
          const emailBody = rule.notifications.email.body || rule.notifications.eventMessage || ''
          setEmailDescription(emailBody)
          setCustomEmailMessage(emailBody)
          setSelectedEmailTemplate(rule.notifications.email.templateId || null)
        }
        
        if (rule.notifications.push) {
          setPushNotificationEnabled(rule.notifications.push.enabled || false)
        }
        
        if (rule.notifications.webhook) {
          setWebhookNotificationEnabled(rule.notifications.webhook.enabled || false)
        }
        
        if (rule.notifications.platform) {
          setPlatformNotificationEnabled(rule.notifications.platform.enabled || false)
        }
      }
      
      const hasExistingConditions = (
        rule.conditionGroups?.some(group => group.conditions?.some(condition => condition.sensor)) ||
        rule.conditions?.some(condition => condition.sensor)
      )

      if (resolvedRuleType === 'zone') {
        setValidateZoneEntry(Boolean(hasExistingConditions))
      } else {
        setValidateZoneEntry(true)
      }

      // Initialize appliesTo settings
      if (rule.appliesTo) {
        if (rule.appliesTo.type === 'units' && rule.appliesTo.units && rule.appliesTo.units.length > 0) {
          setAppliesTo('custom')
          const normalizedUnits = normalizeUnitsSelection(rule.appliesTo.units as (UnidadData | string)[])
          setSelectedUnitsLocal(normalizedUnits)
        } else if (rule.appliesTo.type === 'tags' && rule.appliesTo.tags && rule.appliesTo.tags.length > 0) {
          setAppliesTo('custom')
          const mappedTags = rule.appliesTo.tags.map(tagName => {
            const match = initialTags.find(tag => tag.id === tagName || tag.name === tagName)
            return {
              id: match?.id ?? tagName,
              name: match?.name ?? tagName,
              color: match?.color ?? '#2563EB',
              vehicleCount: (match as any)?.assignedCount ?? 0,
            }
          })
          setSelectedTags(mappedTags as any)
          setSelectedUnitsLocal([])
        } else {
          setAppliesTo('all-units')
          setSelectedUnitsLocal([])
        }
      }

      // Initialize geographic zone settings
      if (rule.zoneScope) {
        if (rule.zoneScope.type === 'inside') {
          setZoneEventAction('entrada')
        } else if (rule.zoneScope.type === 'outside') {
          setZoneEventAction('salida')
        }

        if (rule.zoneScope.zones && Array.isArray(rule.zoneScope.zones)) {
          const formattedZones = rule.zoneScope.zones.map((zone: any, index: number) => {
            if (typeof zone === 'string') {
              return {
                id: zone,
                name: zone,
                type: 'Zona',
                description: `Zona ${index + 1}`,
              }
            }
            return zone
          })
          setSelectedZonesData(formattedZones)
        }

        if (rule.zoneScope.zoneTags && Array.isArray(rule.zoneScope.zoneTags)) {
          const mappedZoneTags = rule.zoneScope.zoneTags.map((tagName: string) => {
            const match = initialTags.find(tag => tag.id === tagName || tag.name === tagName)
            return {
              id: match?.id ?? tagName,
              name: match?.name ?? tagName,
              color: match?.color ?? '#2563EB',
              vehicleCount: match?.assignedCount ?? 0,
            }
          })
          setSelectedZoneTags(mappedZoneTags)
        }
      }

      // Initialize schedule settings
      if (rule.schedule) {
        if (rule.schedule.type === 'always') {
          setRuleSchedule('todo-momento')
        } else if (rule.schedule.type === 'custom') {
          setRuleSchedule('horarios-especificos')
          // Initialize schedule config if available
          if (rule.schedule.days && rule.schedule.timeRanges) {
            // Map the schedule data to our format
            // This would need specific implementation based on how schedule data is stored
          }
        }
      }

      // Initialize event timing settings
      if (rule.eventSettings?.eventTiming) {
        setEventTiming(rule.eventSettings.eventTiming)
      }
      if (rule.eventSettings?.durationValue) {
        setDurationValue(rule.eventSettings.durationValue)
      }
      if (rule.eventSettings?.durationUnit) {
        setDurationUnit(rule.eventSettings.durationUnit)
      }

      // Initialize close policy settings
      if (rule.closePolicy) {
        if (rule.closePolicy.type === 'manual') {
          setClosePolicy('manualmente')
        } else if (rule.closePolicy.type === 'auto-time') {
          setClosePolicy('automaticamente-tiempo')
          if (rule.closePolicy.duration) {
            setClosureTimeValue(rule.closePolicy.duration.toString())
          }
        }
      }

      console.log('Form initialized with rule data')
      console.log('Form state after initialization:', {
        ruleName,
        ruleDescription,
        conditionGroups: conditionGroups.length,
        appliesTo,
        instructions,
        eventSeverity,
        eventMessage
      })
    }
  }, [rule, isEditing, defaultResponsible, forceCreateMode])

  // Debug effect to track form state changes
  useEffect(() => {
    if (isEditing && rule) {
      console.log('Form state changed:', {
        ruleName,
        ruleDescription,
        conditionGroups: conditionGroups.length,
        appliesTo,
        instructions,
        eventSeverity,
        eventMessage,
        emailEnabled,
        emailSubject
      })
    }
  }, [ruleName, ruleDescription, conditionGroups, appliesTo, instructions, eventSeverity, eventMessage, emailEnabled, emailSubject, isEditing, rule])

  const addCondition = () => {
    const newCondition: RuleCondition = {
      id: `condition-${Date.now()}`,
      sensor: '',
      operator: '',
      value: '',
      dataType: 'numeric',
      logicOperator: 'and' // Default logic operator
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
            updated.operator = ''
            updated.value = ''
            
            // Also clear operator if it's not valid for the new sensor type
            const newSensor = telemetrySensors.find(s => s.value === value)
            if (newSensor) {
              const availableOps = newSensor.dataType === 'boolean' || newSensor.dataType === 'string' 
                ? operatorOptions.filter(op => op.value === 'eq' || op.value === 'neq')
                : operatorOptions
              
              if (!availableOps.find(op => op.value === updated.operator)) {
                updated.operator = ''
              }
            }
          }
          
          return updated
        }
        return c
      })
    )
  }

  const clearAll = () => {
    setConditions([{
      id: '1',
      sensor: '',
      operator: '',
      value: '',
      dataType: 'numeric',
      logicOperator: 'and'
    }])
  }

  // Logic operator for conditions - REMOVED: Now using individual operators per condition

  // Group management functions
  const addGroup = () => {
    if (conditionGroups.length < 2) {
      setConditionGroups([...conditionGroups, createEmptyGroup()])
    }
  }

  const removeGroup = (groupId: string) => {
    if (conditionGroups.length > 1) {
      setConditionGroups(conditionGroups.filter(g => g.id !== groupId))
    }
  }

  const updateGroup = (groupId: string, field: string, value: any) => {
    setConditionGroups(conditionGroups.map(group => 
      group.id === groupId ? { ...group, [field]: value } : group
    ))
  }

  const moveGroup = (fromIndex: number, toIndex: number) => {
    const updatedGroups = [...conditionGroups]
    const [removed] = updatedGroups.splice(fromIndex, 1)
    updatedGroups.splice(toIndex, 0, removed)
    setConditionGroups(updatedGroups)
  }

  // Condition management within groups
  const addConditionToGroup = (groupId: string) => {
    setConditionGroups(conditionGroups.map(group => {
      if (group.id === groupId && group.conditions.length < 3) {
        const newCondition: RuleCondition = {
          id: `condition-${Date.now()}`,
          sensor: '',
          operator: '',
          value: '',
          dataType: 'numeric',
          logicOperator: 'and'
        }
        return {
          ...group,
          conditions: [...group.conditions, newCondition]
        }
      }
      return group
    }))
  }

  const removeConditionFromGroup = (groupId: string, conditionId: string) => {
    setConditionGroups(conditionGroups.map(group => {
      if (group.id === groupId && group.conditions.length > 1) {
        return {
          ...group,
          conditions: group.conditions.filter(c => c.id !== conditionId)
        }
      }
      return group
    }))
  }

  const updateConditionInGroup = (groupId: string, conditionId: string, field: string, value: any) => {
    setConditionGroups(prevGroups => {
      const newGroups = prevGroups.map(group => {
        if (group.id === groupId) {
          const newConditions = group.conditions.map(condition => {
            if (condition.id === conditionId) {
              const updated = { ...condition, [field]: value }
              
              // Reset operator and value when sensor changes
              if (field === 'sensor') {
                updated.operator = ''
                updated.value = ''
                
                // Also clear operator if it's not valid for the new sensor type
                const newSensor = telemetrySensors.find(s => s.value === value)
                if (newSensor) {
                  const availableOps = newSensor.dataType === 'boolean' || newSensor.dataType === 'string' 
                    ? operatorOptions.filter(op => op.value === 'eq' || op.value === 'neq')
                    : operatorOptions
                  
                  if (!availableOps.find(op => op.value === updated.operator)) {
                    updated.operator = ''
                  }
                }
              }
              
              return updated
            }
            return condition
          })
          
          return {
            ...group,
            conditions: newConditions
          }
        }
        return group
      })
      
      return newGroups
    })
  }

  const moveConditionInGroup = (groupId: string, fromIndex: number, toIndex: number) => {
    setConditionGroups(conditionGroups.map(group => {
      if (group.id === groupId) {
        const updatedConditions = [...group.conditions]
        const [removed] = updatedConditions.splice(fromIndex, 1)
        updatedConditions.splice(toIndex, 0, removed)
        return {
          ...group,
          conditions: updatedConditions
        }
      }
      return group
    }))
  }

  const clearAllGroups = () => {
    setConditionGroups([{
      id: 'group-1',
      conditions: [{
        id: '1',
        sensor: '',
        operator: '',
        value: '',
        dataType: 'numeric',
        logicOperator: 'and'
      }],
      groupLogicOperator: 'and',
      betweenGroupOperator: undefined
    }])
  }

  // Move condition function for drag and drop (legacy)
  const moveCondition = (fromIndex: number, toIndex: number) => {
    const updatedConditions = [...conditions]
    const [removed] = updatedConditions.splice(fromIndex, 1)
    updatedConditions.splice(toIndex, 0, removed)
    setConditions(updatedConditions)
  }

  // Function to detect if there are unsaved changes
  const detectChanges = () => {
    if (!isEditing) {
      const initialEmailRecipients = ['usuario@email.com', 'usuario@email.com', 'usuario@email.com']
      const initialZoneValidation = resolvedRuleType === 'zone' ? false : true

      return !!(
        ruleName.trim() ||
        ruleDescription.trim() ||
        JSON.stringify(conditionGroups) !== JSON.stringify(initialConditionGroups) ||
        (resolvedRuleType === 'zone' && validateZoneEntry !== initialZoneValidation) ||
        instructions.trim() ||
        eventSeverity !== 'medium' ||
        eventIcon !== 'info' ||
        eventTags.length > 0 ||
        unitTags.length > 0 ||
        unitUntags.length > 0 ||
        eventMessage !== defaultEventMessage ||
        emailEnabled !== false ||
        emailSubject !== '[ALERTA] {unidad} - {regla_nombre}' ||
        JSON.stringify(emailRecipients) !== JSON.stringify(initialEmailRecipients) ||
        pushNotificationEnabled !== false ||
        platformNotificationEnabled !== false
      )
    }

    // For editing rules, compare with original values
    const originalZoneValidation = resolvedRuleType === 'zone'
      ? Boolean(
          rule?.conditionGroups?.some(group => group.conditions?.some(condition => condition.sensor)) ||
          rule?.conditions?.some(condition => condition.sensor)
        )
      : true

    return !!(
      ruleName !== (rule?.name || '') ||
      ruleDescription !== (rule?.description || '') ||
      JSON.stringify(conditionGroups) !== JSON.stringify(rule?.conditionGroups || initialConditionGroups) ||
      validateZoneEntry !== originalZoneValidation ||
      instructions !== (rule?.eventSettings?.instructions || '') ||
      eventSeverity !== (rule?.eventSettings?.severity || 'medium') ||
      eventIcon !== (rule?.eventSettings?.icon || 'info') ||
      eventShortName !== (rule?.eventSettings?.shortName || 'Evento') ||
      JSON.stringify(eventTags.map(tag => tag.name)) !== JSON.stringify(rule?.eventSettings?.tags || []) ||
      JSON.stringify(unitTags.map(tag => tag.name)) !== JSON.stringify(rule?.eventSettings?.unitTags || []) ||
      JSON.stringify(unitUntags.map(tag => tag.name)) !== JSON.stringify(rule?.eventSettings?.unitUntags || []) ||
      eventMessage !== (rule?.notifications?.eventMessage || defaultEventMessage) ||
      emailEnabled !== (rule?.notifications?.email?.enabled || false) ||
      emailSubject !== (rule?.notifications?.email?.subject || '') ||
      JSON.stringify(emailRecipients) !== JSON.stringify(rule?.notifications?.email?.recipients || []) ||
      pushNotificationEnabled !== (rule?.notifications?.push?.enabled || false) ||
      // webhookNotificationEnabled !== (rule?.notifications?.webhook?.enabled || false) ||
      platformNotificationEnabled !== (rule?.notifications?.platform?.enabled || false)
    )
  }

  // Function to handle cancel with unsaved changes detection
  const handleCancel = () => {
    const hasChanges = detectChanges()
    if (hasChanges) {
      setShowExitConfirmModal(true)
    } else {
      onCancel()
    }
  }

  // Function to handle exit without saving from modal
  const handleExitWithoutSaving = () => {
    setShowExitConfirmModal(false)
    onCancel()
  }

  // Function to stay in the editor from modal
  const handleStayInEditor = () => {
    setShowExitConfirmModal(false)
  }

  const flagParameterErrors = useCallback(() => {
    const hasValidCondition = conditionGroups.some(group =>
      group.conditions.some(condition => condition.sensor && condition.operator && condition.value)
    )
    const hasAtLeastOneGroup = conditionGroups.length > 0
    const missingCustomTargets =
      appliesTo === 'custom' && selectedUnitsLocal.length === 0 && selectedTags.length === 0
    const missingDuration = eventTiming === 'despues-tiempo' && (!durationValue || Number(durationValue) <= 0)

    const hasErrors = !hasAtLeastOneGroup || !hasValidCondition || missingCustomTargets || missingDuration

    if (!hasAtLeastOneGroup || !hasValidCondition) {
      setShowParametersErrors(true)
    }
    if (missingCustomTargets) {
      setShowAppliesErrors(true)
    }
    if (missingDuration) {
      setShowDurationError(true)
    }

    return !hasErrors
  }, [
    conditionGroups,
    appliesTo,
    selectedUnitsLocal.length,
    selectedTags.length,
    eventTiming,
    durationValue,
  ])

  const requiresClosureTime = closePolicy === 'automaticamente-tiempo'

  const hasValidActions = useMemo(
    () =>
      Boolean(
        eventShortName.trim() &&
          (!requiresClosureTime || (closureTimeValue && Number(closureTimeValue) > 0))
      ),
    [eventShortName, requiresClosureTime, closureTimeValue]
  )

  const flagActionErrors = useCallback(() => {
    let isValid = true

    if (!eventShortName.trim()) {
      setShowActionsErrors(true)
      isValid = false
    }

    if (requiresClosureTime) {
      if (!closureTimeValue || Number(closureTimeValue) <= 0) {
        setShowClosureTimeError(true)
        isValid = false
      }
    } else {
      setShowClosureTimeError(false)
    }

    return isValid
  }, [eventShortName, requiresClosureTime, closureTimeValue])

  const handleSave = async () => {
    const parametersOk = flagParameterErrors()
    const actionsOk = flagActionErrors()
    if (!parametersOk || !actionsOk) {
      return
    }

    if (isEditing) {
      // For editing, save the changes directly using handleSaveRule
      setIsSaving(true)
      
      try {
        console.log('Saving edited rule with ID:', rule?.id)
        // Use the complete handleSaveRule logic for editing
        handleSaveRule({
          id: rule?.id,
          name: ruleName,
          description: ruleDescription,
          ruleType: resolvedRuleType
        })
        // Remove timeout and save immediately
        setIsSaving(false)
      } catch (error) {
        console.error('Error saving rule:', error)
        setIsSaving(false)
      }
    } else {
      // For new rules, open the save modal
      setShowSaveModal(true)
    }
  }



  const handleSaveRule = (ruleData: Partial<Rule>) => {
    const parametersOk = flagParameterErrors()
    const actionsOk = flagActionErrors()
    if (!parametersOk || !actionsOk) {
      return
    }

    // Handle creating new rule - prepare group data
    const validConditionGroups = conditionGroups.map(group => ({
      ...group,
      conditions: group.conditions.filter(c => c.sensor && c.operator && c.value)
    })).filter(group => group.conditions.length > 0)

    const flattenedConditions = validConditionGroups.flatMap(group => group.conditions)

    // Build appliesTo object based on current form state
    let appliesToData: any = { type: 'units', units: [] }
    if (appliesTo === 'all-units') {
      appliesToData = { type: 'units', units: [] }
    } else if (appliesTo === 'custom') {
      const unitsPayload = selectedUnitsLocal
        .map(unit => unit.id)
        .filter((id): id is string => typeof id === 'string' && id.trim().length > 0)
      const tagsPayload = selectedTags.map(tag => tag.name)

      appliesToData = {
        type: unitsPayload.length > 0 ? 'units' : 'tags',
        units: unitsPayload,
        tags: tagsPayload,
      }
    }

    const zoneScopeData = resolvedRuleType === 'zone'
      ? {
          type: zoneEventAction === 'entrada' ? 'inside' : 'outside',
          zones: selectedZonesData,
          zoneTags: selectedZoneTags.map(tag => tag.name),
        }
      : { type: 'all' }

    // Build schedule object based on current form state
    let scheduleData: any = { type: 'always' }
    if (ruleSchedule === 'todo-momento') {
      scheduleData = { type: 'always' }
    } else if (ruleSchedule === 'horarios-especificos') {
      scheduleData = { 
        type: 'custom',
        // Add schedule configuration here when implemented
      }
    }

    // Build closePolicy object based on current form state
    let closePolicyData: any = { type: 'manual' }
    if (closePolicy === 'manualmente') {
      closePolicyData = { type: 'manual' }
    } else if (closePolicy === 'automaticamente-tiempo') {
      closePolicyData = { 
        type: 'auto-time',
        duration: parseInt(closureTimeValue) || 120
      }
    }

    const finalRuleType: 'telemetry' | 'zone' =
      ruleData.ruleType === 'zone' || resolvedRuleType === 'zone' ? 'zone' : 'telemetry'

    const finalName = ruleData.name ?? ruleName
    const finalDescription = ruleData.description ?? ruleDescription

    const completeRuleData: Partial<Rule> = {
      ...ruleData,
      // Preserve existing rule properties when editing
      ...(isEditing && rule ? {
        id: rule.id,
        createdAt: rule.createdAt,
        owner: rule.owner,
        relatedEventsCount: rule.relatedEventsCount,
        isFavorite: rule.isFavorite,
        status: rule.status
      } : {}),
      name: finalName,
      description: finalDescription,
      conditions: flattenedConditions, // For backward compatibility
      conditionGroups: validConditionGroups, // New grouped structure
      appliesTo: appliesToData,
      zoneScope: zoneScopeData,
      schedule: scheduleData,
      closePolicy: closePolicyData,
      eventSettings: {
        instructions: instructions,
        responsible: assignResponsible ? selectedResponsible : '',
        severity: eventSeverity,
        icon: eventIcon,
        shortName: eventShortName,
        tags: eventTags.map(tag => tag.name),
        unitTags: unitTags.map(tag => tag.name),
        unitUntags: unitUntags.map(tag => tag.name),
        unitUntagsEnabled: unitUntagsEnabled,
        eventTiming: eventTiming,
        durationValue: durationValue,
        durationUnit: durationUnit
      },
      notifications: {
        eventMessage: eventMessage,
        email: {
          enabled: emailEnabled,
          recipients: emailRecipients,
          subject: emailSubject,
          body: customEmailMessage,
          templateId: selectedEmailTemplate
        },
        push: {
          enabled: pushNotificationEnabled
        },
        webhook: {
          enabled: webhookNotificationEnabled
        },
        platform: {
          enabled: platformNotificationEnabled
        }
      },
      severity: eventSeverity,
      ruleType: finalRuleType
    }

    console.log('Saving rule data:', completeRuleData)
    console.log('Is editing:', isEditing)
    console.log('Original rule:', rule)
    
    // Call the onSave function passed from parent
    onSave(completeRuleData)
  }

  // Navigation functions
  const handlePreviousStep = () => {
    if (currentTabIndex > 0) {
      setActiveTab(tabs[currentTabIndex - 1])
    }
  }

  const isConditionComplete = useCallback((condition: RuleCondition) => {
    if (!condition) return false
    const hasValue = condition.value !== '' && condition.value !== null && condition.value !== undefined
    return Boolean(condition.sensor && condition.operator && hasValue)
  }, [])

  const hasValidCondition = useMemo(
    () => conditionGroups.some(group => group.conditions.some(isConditionComplete)),
    [conditionGroups, isConditionComplete]
  )

  const hasAtLeastOneGroup = conditionGroups.length > 0
  const needsCustomTargets = appliesTo === 'custom' && selectedUnitsLocal.length === 0 && selectedTags.length === 0
  const needsDurationValue = eventTiming === 'despues-tiempo' && (!durationValue || Number(durationValue) <= 0)
  const showCustomTargetsError = appliesTo === 'custom' && showAppliesErrors && needsCustomTargets
  const canProceedToConfig = hasAtLeastOneGroup && hasValidCondition && !needsCustomTargets && !needsDurationValue
  const showClosureTimeHelper = requiresClosureTime && showClosureTimeError
  const shortNameHasError = showActionsErrors && !eventShortName.trim()

  const handleNextStep = () => {
    if (currentTabIndex === 0 && !canProceedToConfig) {
      flagParameterErrors()
      return
    }
    if (currentTabIndex === 1 && !hasValidActions) {
      flagActionErrors()
      return
    }
    if (currentTabIndex < tabs.length - 1) {
      setActiveTab(tabs[currentTabIndex + 1])
    }
  }



  // Tab states
  const tabs = ['parameters', 'actions', 'notifications']
  const currentTabIndex = tabs.indexOf(activeTab)
  const handleTabChange = (nextTab: string) => {
    if (nextTab === activeTab) return
    if (currentTabIndex === 0 && nextTab !== 'parameters' && !canProceedToConfig) {
      flagParameterErrors()
      return
    }
    if (currentTabIndex === 1 && nextTab === 'notifications' && !hasValidActions) {
      flagActionErrors()
      return
    }
    setActiveTab(nextTab)
  }
  const isFirstTab = currentTabIndex === 0
  const isLastTab = currentTabIndex === tabs.length - 1
  const isNextButtonBlocked = currentTabIndex === 0 && !canProceedToConfig

  const renderConditionsCard = () => {
    const isZone = resolvedRuleType === 'zone'
    const showContent = !isZone || validateZoneEntry

    return (
      <div className={`border border-gray-200 rounded-lg ${isZone && !validateZoneEntry ? 'bg-gray-50' : 'bg-white'}`}>
        <div
          className={`flex items-start gap-3 px-4 py-4 border-b border-gray-200 rounded-t-lg ${
            isZone && !validateZoneEntry ? 'bg-gray-50' : 'bg-gray-100'
          }`}
        >
          <div className="flex items-center justify-center w-8 h-8 text-gray-600">
            <Gauge className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <h3 className="text-[14px] font-semibold text-gray-900">
              {isZone ? 'Validar parámetros al momento de entrar a la zona' : 'Parámetros a evaluar'}
            </h3>
            <p className="text-[14px] text-gray-600">
              {isZone
                ? 'El evento sólo será generado si las condiciones se cumplen al momento de entrar a la zona'
                : '¿Qué condiciones evalúa esta regla?'}
            </p>
          </div>
          {isZone && (
            <Switch checked={validateZoneEntry} onCheckedChange={handleToggleZoneValidation} className="mt-1" />
          )}
        </div>

        {showContent && (
          <div className="p-4">
            {conditionGroups.length > 0 && conditionGroups.some(g => g.conditions.length > 0) && (
              <div className="-mx-4 border-b border-gray-200 mb-4"></div>
            )}

            <DndProvider backend={HTML5Backend}>
              <div className="space-y-6 relative">
                {conditionGroups.map((group, groupIndex) => (
                  <div key={group.id}>
                    <DraggableConditionGroup
                      group={group}
                      groupIndex={groupIndex}
                      moveGroup={moveGroup}
                      updateGroup={updateGroup}
                      removeGroup={removeGroup}
                      addConditionToGroup={addConditionToGroup}
                      updateConditionInGroup={updateConditionInGroup}
                      removeConditionFromGroup={removeConditionFromGroup}
                      moveConditionInGroup={moveConditionInGroup}
                      telemetrySensors={telemetrySensors}
                      operatorOptions={operatorOptions}
                      totalGroups={conditionGroups.length}
                      showValidationErrors={showParametersErrors}
                    />

                    {groupIndex === 0 && conditionGroups.length === 2 && (
                      <div className="flex justify-center my-4">
                        <div className="flex bg-gray-100 rounded-md p-1">
                          <button
                            type="button"
                            onClick={() => updateGroup(conditionGroups[1].id, 'betweenGroupOperator', 'and')}
                            className={`px-3 py-2 rounded text-[14px] font-medium transition-colors flex items-center justify-center ${
                              conditionGroups[1]?.betweenGroupOperator === 'and' || !conditionGroups[1]?.betweenGroupOperator
                                ? 'bg-blue-600/30 text-blue-800'
                                : 'bg-transparent text-gray-600 hover:text-gray-800'
                            }`}
                          >
                            {conditionGroups[1]?.betweenGroupOperator === 'and' || !conditionGroups[1]?.betweenGroupOperator
                              ? 'Ambos grupos deben cumplirse'
                              : 'Todas'}
                          </button>
                          <button
                            type="button"
                            onClick={() => updateGroup(conditionGroups[1].id, 'betweenGroupOperator', 'or')}
                            className={`px-3 py-2 rounded text-[14px] font-medium transition-colors flex items-center justify-center ${
                              conditionGroups[1]?.betweenGroupOperator === 'or'
                                ? 'bg-yellow-500/50 text-yellow-800'
                                : 'bg-transparent text-gray-600 hover:text-gray-800'
                            }`}
                          >
                            {conditionGroups[1]?.betweenGroupOperator === 'or' ? 'Cualquiera puede cumplirse' : 'Cualquiera'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </DndProvider>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="link"
                  onClick={addGroup}
                  className="p-0 h-auto text-blue-600 hover:text-blue-700 flex items-center gap-2 text-[14px] whitespace-nowrap"
                  disabled={conditionGroups.length >= 2}
                >
                  <Plus className="w-4 h-4" />
                  <span>Agregar grupo</span>
                  <span className="text-blue-600">({conditionGroups.length}/2)</span>
                </Button>
              </div>
              <Button
                variant="link"
                onClick={clearAllGroups}
                className="p-0 h-auto text-blue-600 hover:text-blue-700 text-[14px]"
                disabled={conditionGroups.length === 1 && conditionGroups[0].conditions.length === 1 && !conditionGroups[0].conditions[0].sensor}
              >
                Limpiar todo
              </Button>
            </div>

            {hasValidCondition && (
              <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="h-4 w-4 text-gray-600" />
                  <h4 className="text-[14px] font-medium text-gray-700">Resumen de la regla</h4>
                </div>
                <div className="text-[14px] text-gray-600">
                  {(() => {
                    const validGroups = conditionGroups
                      .map(group => ({
                        ...group,
                        conditions: group.conditions.filter(c => c.sensor && c.operator && c.value)
                      }))
                      .filter(group => group.conditions.length > 0)

                    if (validGroups.length === 0) return 'Configura las condiciones para ver el resumen'

                    return (
                      <div className="flex flex-col gap-4">
                        {validGroups.map((group, groupIndex) => {
                          const groupNumber = groupIndex + 1
                          const logicWord = group.groupLogicOperator === 'and' ? 'Todas' : 'Cualquiera'
                          const logicColor = group.groupLogicOperator === 'and' ? 'text-blue-600' : 'text-amber-500'
                          const logicSuffix = group.groupLogicOperator === 'and' ? 'deben cumplirse' : 'puede cumplirse'

                          return (
                            <div key={group.id} className="space-y-2">
                              <div className="font-medium">
                                Grupo {groupNumber}: <span className={logicColor}>{logicWord}</span> {logicSuffix}
                              </div>
                              <div className="space-y-1">
                                {group.conditions.map((condition, condIndex) => {
                                  const sensor = telemetrySensors.find(s => s.value === condition.sensor)
                                  if (!sensor) return null

                                  let operatorSymbol = ''
                                  switch (condition.operator) {
                                    case 'eq': operatorSymbol = '='; break
                                    case 'gte': operatorSymbol = '≥'; break
                                    case 'gt': operatorSymbol = '>'; break
                                    case 'lte': operatorSymbol = '≤'; break
                                    case 'lt': operatorSymbol = '<'; break
                                    case 'neq': operatorSymbol = '≠'; break
                                    default: operatorSymbol = '='
                                  }

                                  let displayValue = condition.value
                                  if (sensor.dataType === 'boolean' || sensor.dataType === 'string') {
                                    const option = sensor.options?.find(opt => opt.value === condition.value)
                                    displayValue = option ? option.label : condition.value
                                  } else {
                                    displayValue = sensor.unit ? `${condition.value} ${sensor.unit}` : condition.value
                                  }

                                  return (
                                    <div key={condIndex} className="text-[14px] ml-4">
                                      - {sensor.label} {operatorSymbol} {displayValue}
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )
                        })}

                        {validGroups.length > 1 && (
                          <div className="pt-2 border-t border-gray-200">
                            <div className="font-medium">
                              La regla se activará cuando se cumplan las condiciones de Grupo 1 {validGroups[1]?.betweenGroupOperator === 'or' ? 'o' : 'y'} Grupo 2.
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })()}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  const renderApplyCard = () => (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="flex items-start gap-3 px-4 py-4 bg-gray-100 rounded-t-lg border-b border-gray-200">
        <div className="flex items-center justify-center w-8 h-8 text-gray-600">
          <Truck className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-[14px] font-semibold text-gray-900">Aplica esta regla a</h3>
          <p className="text-[14px] text-gray-600">
            Elige a cuáles unidades o etiquetas esta regla debe aplicar
          </p>
        </div>
      </div>
      <div className="p-4 flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-8 items-center">
          <div>
            <label className="text-[14px] font-medium text-gray-700">¿A qué unidades aplicará la regla?</label>
          </div>
          <div>
            <Select value={appliesTo} onValueChange={(value) => {
              setAppliesTo(value)
              if (value !== 'custom') {
                setShowAppliesErrors(false)
              }
            }}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-units">Todas las unidades</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {appliesTo === 'custom' && (
          <>
            <div className="grid grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-gray-600" />
                  <label className="text-[14px] font-medium text-gray-700">
                    <span className="text-red-500 mr-1">*</span>
                    Unidades
                  </label>
                </div>
              </div>
              <div>
                <UnidadesSelectorInput
                  selectedUnits={selectedUnitsLocal}
                  onSelectionChange={handleUnitsChange}
                  placeholder="Seleccionar unidades"
                  hasError={showCustomTargetsError}
                />
                {showCustomTargetsError && (
                  <p className="mt-1 text-[12px] text-red-500">Selecciona al menos una unidad o etiqueta.</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-gray-600" />
                  <label className="text-[14px] font-medium text-gray-700">
                    <span className="text-red-500 mr-1">*</span>
                    Etiquetas
                  </label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="w-4 h-4 rounded-full bg-gray-300 flex items-center justify-center hover:bg-gray-400 transition-colors cursor-help">
                        <span className="text-[10px] text-gray-600">i</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-[12px]">
                        Se aplicará a cualquier unidad que tenga al menos 1 de esas etiquetas
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
              <div>
                <GenericSelectorInput
                  selectedItems={selectedTags}
                  onSelectionChange={handleTagsChange}
                  placeholder="Seleccionar etiquetas"
                  title="Etiquetas para aplicar regla"
                  items={initialTags.map((tag, index) => ({
                    id: tag.id,
                    name: tag.name,
                    color: tag.color,
                    key: `tag-${tag.id}-${index}`
                  }))}
                  searchPlaceholder="Buscar etiquetas..."
                  getDisplayText={(count) => {
                    if (count === 0) return "Seleccionar etiquetas"
                    if (count === 1) return "1 etiqueta seleccionada"
                    return `${count} etiquetas seleccionadas`
                  }}
                  multiSelect
                  showColorPills
                  showPillsDisplay
                  hasError={showCustomTargetsError}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )

  const renderAdvancedCard = () => (
    <Collapsible
      open={advancedOpen}
      onOpenChange={setAdvancedOpen}
      collapseProps={{ className: "advanced-collapse", collapsible: "header" }}
    >
      <div className="bg-white border border-gray-200 rounded-lg">
        <CollapsibleTrigger className="w-full bg-gray-100 border-b border-gray-200 rounded-t-[8px] px-4 py-4">
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-8 h-8 text-gray-600">
              <Settings className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-[14px] font-semibold text-gray-900 leading-5">Configuración avanzada</h3>
                <p className="text-[14px] text-gray-600 leading-5 mt-2">
                  Define las condiciones adicionales de tu regla, cuándo debe activarse y otras configuraciones avanzadas
                </p>
              </div>
              <ChevronDown
                className={`h-4 w-4 text-gray-600 transition-transform ${advancedOpen ? 'rotate-180' : ''}`}
              />
            </div>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="px-4 pb-4 pt-6">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-600" />
                  <label className="text-[14px] font-medium text-gray-700">¿En qué momento se debe generar el evento?</label>
                </div>
              </div>
              <div>
                <Select value={eventTiming} onValueChange={handleEventTimingChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cumplan-condiciones">Cuando se cumplan las condiciones</SelectItem>
                    <SelectItem value="despues-tiempo">Después de cierto tiempo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {eventTiming === 'despues-tiempo' && (
              <div className="grid grid-cols-2 gap-8 items-start">
                <div>
                  <label className="text-[14px] font-medium text-gray-700">
                    <span className="text-red-500 mr-1">*</span>
                    Duración
                  </label>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={durationValue}
                      onChange={(e) => {
                        setDurationValue(e.target.value)
                        if (Number(e.target.value) > 0) {
                          setShowDurationError(false)
                        }
                      }}
                      className="w-24"
                      style={{
                        height: '32px',
                        borderRadius: '8px',
                        ...(showDurationError
                          ? {
                              border: '1px solid #F04438',
                              boxShadow: 'none'
                            }
                          : {})
                      }}
                      placeholder="Ingresa duración"
                    />
                    <Select value={durationUnit} onValueChange={setDurationUnit}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="segundos">segundos</SelectItem>
                        <SelectItem value="minutos">minutos</SelectItem>
                        <SelectItem value="horas">horas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {showDurationError && (
                    <p className="text-[12px] text-red-500">Ingresa una duración válida para continuar.</p>
                  )}
                </div>
              </div>
            )}

            {eventTiming === 'despues-tiempo' && (
              <div className="grid grid-cols-2 gap-8 items-center">
                <div></div>
                <div>
                  <p className="text-[12px] text-gray-500 mt-1">
                    Ejemplo: "Velocidad &gt; 110 km/h durante más de {durationValue} {durationUnit}"
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-600" />
                  <label className="text-[14px] font-medium text-gray-700">¿Cuándo estará activa esta regla?</label>
                </div>
              </div>
              <div>
                <Select value={ruleSchedule} onValueChange={setRuleSchedule}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo-momento">En todo momento</SelectItem>
                    <SelectItem value="personalizado">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {ruleSchedule === 'personalizado' && (
              <div className="mt-6">
                <div className="flex flex-col gap-4">
                  {Object.entries(scheduleConfig).map(([day, config]) => {
                    const dayLabels: Record<string, string> = {
                      lunes: 'Lunes',
                      martes: 'Martes',
                      miercoles: 'Miércoles',
                      jueves: 'Jueves',
                      viernes: 'Viernes',
                      sabado: 'Sábado',
                      domingo: 'Domingo',
                    }

                    return (
                      <div key={day} className="grid grid-cols-4 gap-4 items-center">
                        <div className="flex items-center gap-4 pl-8 pr-12">
                          <Checkbox
                            checked={config.enabled}
                            onCheckedChange={(checked) => updateDaySchedule(day, 'enabled', checked)}
                          />
                          <label className="text-[14px] text-gray-700 font-medium">
                            {dayLabels[day]}
                          </label>
                        </div>
                        <div>
                          <Select
                            value={config.start}
                            onValueChange={(value) => updateDaySchedule(day, 'start', value)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="06:00">06:00 am</SelectItem>
                              <SelectItem value="07:00">07:00 am</SelectItem>
                              <SelectItem value="08:00">08:00 am</SelectItem>
                              <SelectItem value="09:00">09:00 am</SelectItem>
                              <SelectItem value="10:00">10:00 am</SelectItem>
                              <SelectItem value="11:00">11:00 am</SelectItem>
                              <SelectItem value="12:00">12:00 pm</SelectItem>
                              <SelectItem value="13:00">01:00 pm</SelectItem>
                              <SelectItem value="14:00">02:00 pm</SelectItem>
                              <SelectItem value="15:00">03:00 pm</SelectItem>
                              <SelectItem value="16:00">04:00 pm</SelectItem>
                              <SelectItem value="17:00">05:00 pm</SelectItem>
                              <SelectItem value="18:00">06:00 pm</SelectItem>
                              <SelectItem value="19:00">07:00 pm</SelectItem>
                              <SelectItem value="20:00">08:00 pm</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Select
                            value={config.end}
                            onValueChange={(value) => updateDaySchedule(day, 'end', value)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="18:00">06:00 pm</SelectItem>
                              <SelectItem value="19:00">07:00 pm</SelectItem>
                              <SelectItem value="20:00">08:00 pm</SelectItem>
                              <SelectItem value="21:00">09:00 pm</SelectItem>
                              <SelectItem value="22:00">10:00 pm</SelectItem>
                              <SelectItem value="23:00">11:00 pm</SelectItem>
                              <SelectItem value="00:00">12:00 am</SelectItem>
                              <SelectItem value="01:00">01:00 am</SelectItem>
                              <SelectItem value="02:00">02:00 am</SelectItem>
                              <SelectItem value="03:00">03:00 am</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Select
                            value={config.scope}
                            onValueChange={(value) => updateDaySchedule(day, 'scope', value)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="dentro">Dentro</SelectItem>
                              <SelectItem value="fuera">Fuera</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )

  const renderZoneCard = () => {
    if (resolvedRuleType !== 'zone') return null

    return (
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-4 py-4 bg-gray-100 border-b border-gray-200 rounded-t-lg flex flex-col gap-1">
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="h-4 w-4" />
            <h3 className="text-[14px] font-semibold text-gray-900">Zonas</h3>
          </div>
          <p className="text-[13px] text-gray-500">Detección de ingreso o salida de zona</p>
        </div>
        <div className="p-4 flex flex-col gap-4">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-6 items-center">
              <label className="text-[14px] font-medium text-gray-700">¿Qué acción activará el evento?</label>
              <Select value={zoneEventAction} onValueChange={(value: 'entrada' | 'salida') => setZoneEventAction(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entrada">Entrada a una zona o grupo de zonas</SelectItem>
                  <SelectItem value="salida">Salida de una zona o grupo de zonas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-6 items-center">
              <label className="text-[14px] font-medium text-gray-700">Zonas geográficas</label>
              <ZonasSelectorInput
                selectedZones={selectedZonesData}
                onSelectionChange={setSelectedZonesData}
                placeholder="Seleccionar zonas"
              />
            </div>

            <div className="grid grid-cols-2 gap-6 items-center">
              <label className="text-[14px] font-medium text-gray-700">Etiquetas de zona</label>
              <EtiquetasSelectorInput
                selectedTags={selectedZoneTags}
                onSelectionChange={handleZoneTagsChange}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="telemetry-wizard flex-1 flex flex-col bg-background relative">
        {/* Header */}
        <div
          ref={headerRef}
          className="telemetry-wizard__header border-b border-border bg-background"
          style={{
            position: 'sticky',
            top: 'var(--app-header-height, 64px)',
            zIndex: 120,
            padding: '16px 24px',
            backgroundColor: '#fff',
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancel}
                    className="flex items-center gap-2 p-0 hover:bg-transparent"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-[16px]">{isEditing ? (ruleName || 'Editar regla') : 'Crear regla'}</span>
                  </Button>
                </div>
                <div className="text-[14px] text-muted-foreground" style={{ marginLeft: '22px' }}>
                  {wizardLabel}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="text-[14px] font-normal"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700 text-white text-[14px] font-normal disabled:opacity-50"
              >
                {isEditing ? (isSaving ? 'Guardando...' : 'Guardar') : 'Guardar regla'}
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="max-w-4xl mx-auto p-6">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="pb-6">
              <TabsList
                className="telemetry-wizard__tabs w-full justify-start h-auto p-0 space-x-8"
                style={{ top: `${tabsStickyTop}px` }}
              >
                <TabsTrigger 
                  value="parameters" 
                  className={`bg-transparent border-0 rounded-none px-0 py-3 text-[14px] border-b-2 border-transparent data-[state=active]:border-blue-600 ${
                    currentTabIndex >= 0 ? 'text-blue-600' : 'text-gray-500'
                  } cursor-pointer`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded-full text-white text-[12px] font-medium flex items-center justify-center ${
                      currentTabIndex >= 0 ? 'bg-blue-600' : 'bg-gray-400'
                    }`}>
                      1
                    </div>
                    <span>Parámetros</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="actions"
                  aria-disabled={currentTabIndex === 0 && !canProceedToConfig}
                  className={`bg-transparent border-0 rounded-none px-0 py-3 text-[14px] border-b-2 border-transparent data-[state=active]:border-blue-600 ${
                    currentTabIndex >= 1 ? 'text-blue-600' : 'text-gray-500'
                  } ${currentTabIndex === 0 && !canProceedToConfig ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded-full text-white text-[12px] font-medium flex items-center justify-center ${
                      currentTabIndex >= 1 ? 'bg-blue-600' : 'bg-gray-400'
                    }`}>
                      2
                    </div>
                    <span>Configuración</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="notifications"
                  className={`bg-transparent border-0 rounded-none px-0 py-3 text-[14px] border-b-2 border-transparent data-[state=active]:border-blue-600 ${
                    currentTabIndex >= 2 ? 'text-blue-600' : 'text-gray-500'
                  } cursor-pointer`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded-full text-white text-[12px] font-medium flex items-center justify-center ${
                      currentTabIndex >= 2 ? 'bg-blue-600' : 'bg-gray-400'
                    }`}>
                      3
                    </div>
                    <span>Acción a realizar</span>
                  </div>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="parameters" className="mt-6 space-y-6">
                {resolvedRuleType === 'zone' ? (
                  <>
                    {renderZoneCard()}
                    {renderApplyCard()}
                    {renderConditionsCard()}
                    {renderAdvancedCard()}
                  </>
                ) : (
                  <>
                    {renderConditionsCard()}
                    {renderApplyCard()}
                    {renderAdvancedCard()}
                  </>
                )}
              </TabsContent>
              <TabsContent value="actions" className="mt-6 space-y-6">
                {/* Section 1 - Clasificación del evento */}
                    <SectionCard
                      icon={<AlertTriangle className="h-4 w-4 text-gray-600" />}
                      title="Clasificación del evento"
                      description="Configura la información básica del evento que genera la regla"
                      contentClassName="space-y-6"
                    >
                    {/* Row 1: Severidad del evento */}
                    <div className="grid grid-cols-2 gap-8 items-center">
                      <div>
                        <label className="text-[14px] font-medium text-gray-700">
                          <span className="text-red-500">*</span> Severidad del evento
                        </label>
                      </div>
                      <div className="flex gap-4">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-fit justify-start">
                              <div className="flex items-center gap-2">
                                {EventIconComponent ? (
                                  <EventIconComponent className="h-4 w-4" />
                                ) : (
                                  <span>Seleccionar icono</span>
                                )}
                              </div>
                              <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[200px] bg-white border border-gray-200 rounded-lg shadow-lg">
                            <div className="grid grid-cols-4 gap-2 max-h-[300px] overflow-y-auto px-2 py-2">
                            {eventIconOptions.map(({ id, icon: IconOption }) => (
                                  <button
                                    key={id}
                                    className={`flex h-12 w-12 items-center justify-center rounded-lg border transition-colors ${
                                      eventIcon === id
                                        ? 'bg-blue-100 border-blue-500 text-blue-600'
                                        : 'bg-gray-50 border-transparent text-gray-600 hover:bg-blue-50'
                                    }`}
                                    onClick={() => {
                                      setEventIcon(id)
                                    }}
                                  >
                                  <IconOption className="h-5 w-5" />
                                </button>
                              ))}
                            </div>
                          </PopoverContent>
                        </Popover>
                        <Select value={eventSeverity} onValueChange={setEventSeverity}>
                          <SelectTrigger className="w-full severity-select px-2">
                            <SelectValue placeholder="Seleccionar severidad">
                              {eventSeverity && severityConfig[eventSeverity] && (
                                <div
                                  className={`severity-chip ${severityConfig[eventSeverity].bgColor} ${severityConfig[eventSeverity].textColor} ${severityConfig[eventSeverity].borderColor}`}
                                >
                                  {EventIconComponent && <EventIconComponent className="h-4 w-4" />}
                                  <span className="text-[14px] leading-none">{severityConfig[eventSeverity].label}</span>
                                </div>
                              )}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {['high', 'medium', 'low', 'informative'].map((severity) => (
                              <SelectItem key={severity} value={severity}>
                                <div
                                  className={`severity-chip ${severityConfig[severity].bgColor} ${severityConfig[severity].textColor} ${severityConfig[severity].borderColor}`}
                                >
                                  {EventIconComponent && <EventIconComponent className="h-4 w-4" />}
                                  <span className="text-[14px] leading-none">{severityConfig[severity].label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Row 1.1: Nombre corto y vista previa */}
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[14px] font-medium text-gray-700" htmlFor="event-short-name">
                          <span className="text-red-500">*</span> Nombre corto
                        </label>
                        <Input
                          id="event-short-name"
                          value={eventShortName}
                          onChange={(event) => {
                            const value = event.target.value.slice(0, 10)
                            setEventShortName(value)
                            if (showActionsErrors && value.trim().length > 0) {
                              setShowActionsErrors(false)
                            }
                          }}
                          maxLength={10}
                          suffix={
                            <span className="flex items-center h-full text-[11px] leading-none text-gray-400">
                              {eventShortName.length}/10
                            </span>
                          }
                          placeholder="Ej. Frenado"
                          className="text-[14px]"
                          aria-invalid={shortNameHasError}
                          style={{
                            ...(shortNameHasError
                              ? { border: '1px solid #F04438', boxShadow: 'none', borderRadius: '8px' }
                              : {})
                          }}
                        />
                        {shortNameHasError && (
                          <p className="text-[12px] text-red-500">Ingresa un nombre corto.</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <span className="text-[14px] font-medium text-gray-700">Vista previa en mapa</span>
                        <div className="flex flex-col items-center gap-2 p-2 text-[12px]" style={{ color: previewSeverityStyles.previewText, background: '#FFFFFF', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                          <div
                            className="inline-flex h-9 w-9 items-center justify-center"
                            style={{
                              clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
                              paddingInline: '8px',
                              backgroundColor: previewSeverityStyles.previewText,
                            }}
                          >
                            <PreviewIconComponent color={previewSeverityStyles.previewBg} stroke={previewSeverityStyles.previewBg} className="h-4 w-4" />
                          </div>
                          <span
                            className="inline-flex items-center gap-1 text-[11px] font-medium"
                            style={{
                              backgroundColor: previewSeverityStyles.previewText,
                              color: previewSeverityStyles.previewBg,
                              padding: '4px 8px',
                              borderRadius: '8px',
                            }}
                          >
                            {eventShortName || 'Evento'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Row 2: Etiquetas */}
                    <div className="grid grid-cols-2 gap-8 items-center">
                      <div>
                        <div className="flex items-center gap-2">
                          <label className="text-[14px] font-medium text-gray-700">Asigna una etiqueta al evento generado</label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="w-4 h-4 rounded-full bg-gray-300 flex items-center justify-center hover:bg-gray-400 transition-colors cursor-help">
                                <span className="text-[10px] text-gray-600">i</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-[12px]">
                                Puedes seleccionar hasta 10 etiquetas para el evento generado
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                      <div>
                        <GenericSelectorInput
                          selectedItems={eventTags}
                          onSelectionChange={(items) => {
                            if (items.length <= 10) {
                              setEventTags(items)
                            }
                          }}
                          placeholder="Seleccionar etiquetas"
                          title="Etiquetas del evento"
                          items={[
                            { id: 'cliente-a', name: 'Cliente A', color: '#3B82F6' },
                            { id: 'cliente-b', name: 'Cliente B', color: '#10B981' },
                            { id: 'urgente', name: 'Urgente', color: '#EF4444' },
                            { id: 'mantenimiento', name: 'Mantenimiento', color: '#F59E0B' },
                            { id: 'operaciones', name: 'Operaciones', color: '#8B5CF6' },
                            { id: 'seguridad', name: 'Seguridad', color: '#F97316' },
                            { id: 'combustible', name: 'Combustible', color: '#06B6D4' },
                            { id: 'velocidad', name: 'Velocidad', color: '#EC4899' },
                            { id: 'temperatura', name: 'Temperatura', color: '#84CC16' },
                            { id: 'ubicacion', name: 'Ubicación', color: '#6366F1' }
                          ]}
                          searchPlaceholder="Buscar etiquetas..."
                          getDisplayText={(count) => {
                            if (count === 0) return "Seleccionar etiquetas"
                            if (count === 1) return "1 etiqueta seleccionada"
                            return `${count} etiquetas seleccionadas${count >= 10 ? ' (máximo)' : ''}`
                          }}
                          maxSelections={10}
                          multiSelect={true}
                          showColorPills={true}
                          showPillsDisplay={true}
                          showFooterCount={true}
                        />
                      </div>
                    </div>

                    </SectionCard>

                {/* Section 3 - Cierre del evento */}
                <SectionCard
                  icon={<XCircle className="h-4 w-4 text-gray-600" />}
                  title="Cierre del evento"
                  description="Configura la información básica del evento que genera la regla"
                  contentClassName="space-y-6"
                >
                  {/* Row 1: Close policy selection */}
                  <div className="grid grid-cols-2 gap-8 items-center">
                    <div>
                      <label className="text-[14px] font-medium text-gray-700">
                        <span className="text-red-500">*</span> ¿Cómo debe cerrarse el evento?
                      </label>
                    </div>
                    <div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="w-full">
                            <Select value={closePolicy} onValueChange={setClosePolicy}>
                              <SelectTrigger className="w-full">
                                <div className="truncate">
                                  <SelectValue placeholder="Manualmente (Requiere nota al cerrar evento)" />
                                </div>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="manualmente">Manualmente</SelectItem>
                                <SelectItem value="automaticamente-condiciones">Automáticamente (Cuando las condiciones ya no se cumplan)</SelectItem>
                                <SelectItem value="automaticamente-tiempo">Automáticamente (Después de un tiempo definido)</SelectItem>
                                <SelectItem value="inmediato">Cerrar evento de inmediato (sin requerir intervención del usuario)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-[12px]">
                            {closePolicy === 'manualmente' 
                              ? 'Manualmente'
                              : closePolicy === 'automaticamente-condiciones'
                              ? 'Automáticamente (Cuando las condiciones ya no se cumplan)'
                              : closePolicy === 'inmediato'
                              ? 'Cerrar evento de inmediato (sin requerir intervención del usuario)'
                              : closePolicy === 'automaticamente-tiempo'
                              ? 'Automáticamente (Después de un tiempo definido)'
                              : 'Manualmente'
                            }
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>

                  {/* Row 2: Require note toggle - only show when "manualmente" is selected */}
                  {closePolicy === 'manualmente' && (
                    <div className="grid grid-cols-2 gap-8 items-center">
                      <div>
                        <label className="text-[14px] font-medium text-gray-700">
                          Requerir nota al cierre del evento
                        </label>
                      </div>
                      <div className="flex justify-end">
                        <Switch
                          checked={requireNoteOnClose}
                          onCheckedChange={setRequireNoteOnClose}
                          className="switch-blue"
                        />
                      </div>
                    </div>
                  )}

                  {/* Row 3: Time configuration - only show when "automaticamente-tiempo" is selected */}
                  {closePolicy === 'automaticamente-tiempo' && (
                    <div className="grid grid-cols-2 gap-8 items-start">
                      <div>
                        <label className="text-[14px] font-medium text-gray-700">
                          <span className="text-red-500">*</span> Después de cuánto tiempo se debe cerrar
                        </label>
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-4">
                          <Input
                            type="number"
                            value={closureTimeValue}
                            onChange={(e) => {
                              setClosureTimeValue(e.target.value)
                              if (Number(e.target.value) > 0) {
                                setShowClosureTimeError(false)
                              }
                            }}
                            className="w-20"
                            aria-invalid={showClosureTimeHelper}
                            style={{
                              height: '32px',
                              borderRadius: '8px',
                              ...(showClosureTimeHelper
                                ? { border: '1px solid #F04438', boxShadow: 'none' }
                                : {})
                            }}
                          />
                          <Select value={closureTimeUnit} onValueChange={setClosureTimeUnit}>
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="minutos">Minutos</SelectItem>
                              <SelectItem value="horas">Horas</SelectItem>
                              <SelectItem value="dias">Días</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {showClosureTimeHelper && (
                          <p className="text-[12px] text-red-500">Ingresa un tiempo válido para el cierre automático.</p>
                        )}
                      </div>
                    </div>
                  )}
                </SectionCard>

                {/* Section 5 - Asignar etiqueta a la unidad */}
                <SectionCard
                  icon={<Tag className="h-4 w-4 text-gray-600" />}
                  title="Asignar etiqueta a la unidad"
                  description="Selecciona la etiqueta que se asignará a la unidad cuando ocurra el evento"
                  headerExtra={
                    <Switch
                      checked={unitTagsEnabled}
                      onCheckedChange={(checked) => {
                        setUnitTagsEnabled(checked)
                        if (!checked) {
                          setUnitTags([])
                        }
                      }}
                      className="switch-blue"
                    />
                  }
                  contentClassName={unitTagsEnabled ? 'space-y-6' : 'p-0'}
                >
                  {unitTagsEnabled && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-8 items-start">
                        <div>
                          <label className="text-[14px] font-medium text-gray-700">Asignar etiquetas</label>
                        </div>
                        <div>
                          <GenericSelectorInput
                            selectedItems={unitTags}
                            onSelectionChange={(items) => {
                              if (items.length <= 10) {
                                setUnitTags(items)
                              }
                            }}
                            placeholder="Seleccionar etiquetas"
                            title="Etiquetas para la unidad"
                            items={initialTags.map(tag => ({
                              id: tag.id,
                              name: tag.name,
                              color: tag.color
                            }))}
                            searchPlaceholder="Buscar etiquetas..."
                            getDisplayText={(count) => {
                              if (count === 0) return "Seleccionar etiquetas"
                              if (count === 1) return "1 etiqueta seleccionada"
                              return `${count} etiquetas seleccionadas${count >= 10 ? ' (máximo)' : ''}`
                            }}
                            maxSelections={10}
                            multiSelect={true}
                            showColorPills={true}
                            showPillsDisplay={true}
                            showFooterCount={true}
                          />
                        </div>
                      </div>
                      <p className="text-[13px] text-[rgba(145,145,145,1)]">
                        <strong>Nota:</strong> Cada unidad puede tener un máximo de 10 etiquetas activas.<br />
                        Si la regla que estás configurando intenta asignar una nueva etiqueta y la unidad ya alcanzó el límite, la etiqueta no será añadida.
                      </p>
                    </div>
                  )}
                </SectionCard>

                {/* Section 5.1 - Desasignar etiqueta a la unidad */}
                <SectionCard
                  icon={<Tag className="h-4 w-4 text-gray-600" />}
                  title="Desasignar etiqueta a la unidad"
                  description="Selecciona las etiquetas que se removerán de la unidad"
                  headerExtra={
                    <Switch
                      checked={unitUntagsEnabled}
                      onCheckedChange={(checked) => {
                        setUnitUntagsEnabled(checked)
                        if (!checked) {
                          setUnitUntags([])
                        }
                      }}
                      className="switch-blue"
                    />
                  }
                  contentClassName={unitUntagsEnabled ? 'space-y-6' : 'p-0'}
                >
                  {unitUntagsEnabled && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-8 items-start">
                        <div>
                          <label className="text-[14px] font-medium text-gray-700">Desasignar etiquetas</label>
                        </div>
                        <div>
                          <GenericSelectorInput
                            selectedItems={unitUntags}
                            onSelectionChange={(items) => {
                              if (items.length <= 10) {
                                setUnitUntags(items)
                              }
                            }}
                            placeholder="Seleccionar etiquetas"
                            title="Etiquetas para desasignar"
                            items={initialTags.map(tag => ({
                              id: tag.id,
                              name: tag.name,
                              color: tag.color
                            }))}
                            searchPlaceholder="Buscar etiquetas..."
                            getDisplayText={(count) => {
                              if (count === 0) return "Seleccionar etiquetas"
                              if (count === 1) return "1 etiqueta seleccionada"
                              return `${count} etiquetas seleccionadas${count >= 10 ? ' (máximo)' : ''}`
                            }}
                            maxSelections={10}
                            multiSelect={true}
                            showColorPills={true}
                            showPillsDisplay={true}
                            showFooterCount={true}
                          />
                        </div>
                      </div>
                      <p className="text-[13px] text-[rgba(145,145,145,1)]">
                        <strong>Nota:</strong> Al remover etiquetas se liberan espacios para nuevas asignaciones futuras.
                      </p>
                    </div>
                  )}
                </SectionCard>

                {/* Section 6 - Enviar comando al dispositivo */}
                <SectionCard
                  icon={<Tag className="h-4 w-4 text-gray-600" />}
                  title="Enviar comando al dispositivo"
                  description="Selecciona si deseas ejecutar un comando automáticamente cuando se active el evento"
                  headerExtra={
                    <Switch
                      checked={sendDeviceCommand}
                      onCheckedChange={setSendDeviceCommand}
                      disabled
                      className="switch-blue"
                    />
                  }
                  contentClassName={sendDeviceCommand ? 'space-y-6' : 'p-0'}
                >
                  {sendDeviceCommand && (
                    <div className="grid grid-cols-2 gap-8 items-center">
                      <div>
                        <label className="text-[14px] font-medium text-gray-700">
                          Seleccionar comando a enviar
                        </label>
                      </div>
                      <div>
                        <Select defaultValue="automaticamente-tiempo">
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Seleccionar comando" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="automaticamente-tiempo">Automáticamente (Después de un tiempo definido)</SelectItem>
                            <SelectItem value="manualmente">Manualmente</SelectItem>
                            <SelectItem value="inmediato">Inmediato</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </SectionCard>
              </TabsContent>

              <TabsContent value="notifications" className="mt-6 space-y-6">
              {/* Section 1 - Mensaje del evento */}
                <SectionCard
                  icon={<Bell className="h-4 w-4 text-gray-600" />}
                  title="Mensaje del evento"
                  description="Redacta el mensaje que se enviará cuando ocurra este evento. Puedes usar variables para personalizar el contenido."
                  contentClassName="space-y-4"
                >
                    <div className="border border-gray-200 rounded-lg bg-gray-50 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 whitespace-nowrap">
                          <Zap className="h-4 w-4 text-blue-600" />
                          <h4 className="text-[13px] font-medium text-gray-700">Variables sugeridas</h4>
                          <span className="text-[11px] text-gray-500">
                            Arrastra o haz clic para insertar la variable en tu mensaje.
                          </span>
                        </div>
                        <VariableButton
                          label="Más variables"
                          variables={EVENT_MESSAGE_VARIABLES}
                          onInsertVariable={handleInsertEventVariable}
                          triggerClassName="inline-flex items-center gap-1 text-[14px] font-normal text-[#1677FF] hover:text-[#125FCC]"
                        />
                      </div>
                      {!hasConfiguredSensors && (
                        <p className="text-[11px] text-gray-500 mt-2">
                          Configura condiciones con sensores para obtener recomendaciones más precisas.
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {suggestedEventVariables.length > 0 ? (
                          suggestedEventVariables.map((variable) => (
                            <button
                              key={variable.key}
                              type="button"
                              className="inline-flex items-center gap-2 cursor-grab active:cursor-grabbing transition-colors"
                              style={{
                                backgroundColor: '#F9F0FF',
                                borderColor: '#BEA5F5',
                                color: '#7839EE',
                                borderRadius: '8px',
                                borderWidth: '1px',
                                borderStyle: 'solid',
                                padding: '4px 12px',
                              }}
                              draggable
                              onDragStart={(event) => {
                                event.dataTransfer.setData('application/x-variable-key', variable.key)
                                event.dataTransfer.setData('text/plain', variable.key)
                                event.dataTransfer.effectAllowed = 'copy'
                              }}
                              onClick={() => handleInsertEventVariable(variable.key)}
                            >
                              <span className="flex items-center justify-center">
                                <SuggestedVariableDragIcon />
                              </span>
                              <span className="text-[13px] leading-none" style={{ color: '#7839EE' }}>
                                {variable.key}
                              </span>
                            </button>
                          ))
                        ) : (
                          <span className="text-[12px] text-gray-500">
                            Aún no hay variables sugeridas. Configura condiciones con sensores para ver recomendaciones.
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[14px] font-medium text-gray-700">
                          <span className="text-red-500">*</span> Mensaje del evento
                        </label>
                        <span className={`text-[12px] ${eventMessageCharCount > 110 ? 'text-red-500' : 'text-gray-500'}`}>
                          {eventMessageCharCount}/120
                        </span>
                      </div>
                      <VariableTextarea
                        ref={eventMessageEditorRef}
                        name="event-message"
                        value={eventMessage}
                        onChange={(text) => {
                          setEventMessage(text)
                          setEventMessageCharCount(text.length)
                          setEmailDescription(text)
                          setDescriptionCharCount(text.length)
                        }}
                        showVariableButton={false}
                        placeholder={
                          hasConfiguredSensors
                            ? 'Escribe el mensaje (máx. 120 caracteres) o arrastra variables desde la barra superior.'
                            : 'Escribe el mensaje del evento (máx. 120 caracteres). Puedes insertar variables desde "Más variables".'
                        }
                        maxLength={120}
                        className="min-h-[120px]"
                      />

                      {eventMessage && (
                        <div className="bg-gray-50 border border-gray-200 rounded p-3">
                          <div className="text-[12px] font-medium text-gray-600 mb-1">Vista previa</div>
                          <div className="text-[13px] text-gray-700 leading-relaxed">
                            {(() => {
                              const parts = eventMessage.split(VARIABLE_TOKEN_REGEX)
                              const variables = eventMessage.match(VARIABLE_TOKEN_REGEX) || []
                              const fragments: React.ReactNode[] = []
                              for (let i = 0; i < parts.length; i++) {
                                if (parts[i]) {
                                  fragments.push(<span key={`text-${i}`}>{parts[i]}</span>)
                                }
                                if (variables[i]) {
                                  const exampleValue = resolveVariablePreview(variables[i])
                                  fragments.push(
                                    <span key={`var-${i}`} className="text-purple-600 font-medium">
                                      {exampleValue}
                                    </span>
                                  )
                                }
                              }
                              return fragments
                            })()}
                          </div>
                        </div>
                      )}
                    </div>
                  </SectionCard>

              {/* Section 2 - Canales de notificación */}
              <SectionCard
                icon={<Bell className="h-4 w-4 text-gray-600" />}
                title="Canales de notificación"
                description="Selecciona por qué medios quieres enviar el mensaje cuando ocurra este evento"
                contentClassName="space-y-4"
              >
                    {/* Notificación Web (siempre activada) */}
                    <div className="border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <Monitor className="h-5 w-5 text-gray-600" />
                          <div>
                            <div className="text-[14px] font-medium text-gray-700">Notificación Web</div>
                            <div className="text-[12px] text-gray-600">Notificación en la plataforma web (siempre activo)</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              addWebNotificationExample()
                            }}
                            className="text-[11px] h-6 px-2"
                          >
                            <Monitor className="w-3 h-3 mr-1" />
                            Ver ejemplo
                          </Button>
                          <Switch
                            checked={true}
                            disabled={true}
                            className="switch-blue"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Notificación Móvil */}
                    <div className="border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <Smartphone className="h-5 w-5 text-gray-600" />
                          <div>
                            <div className="text-[14px] font-medium text-gray-700">Notificación Móvil</div>
                            <div className="text-[12px] text-gray-600">Push notification en la app móvil</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setNotificationExampleType('mobile')
                              setShowNotificationExample(true)
                            }}
                            className="text-[11px] h-6 px-2"
                          >
                            <Smartphone className="w-3 h-3 mr-1" />
                            Ver ejemplo
                          </Button>
                          <Switch
                            checked={pushNotificationEnabled}
                            onCheckedChange={setPushNotificationEnabled}
                            className="switch-blue"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Correo electrónico */}
                    <div className="border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <Mail className="h-5 w-5 text-gray-600" />
                          <div>
                            <div className="text-[14px] font-medium text-gray-700">Correo electrónico</div>
                            <div className="text-[12px] text-gray-600">Usa plantillas guardadas para automatizar el mensaje</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={emailEnabled}
                            onCheckedChange={setEmailEnabled}
                            className="switch-blue"
                          />
                        </div>
                      </div>

                      {emailEnabled && (
                        <div className="border-t border-gray-200 bg-gray-50 p-3 space-y-4">
                          <div className="space-y-2">
                            <label className="flex items-center gap-1 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#2B3075]">
                              <span className="text-[#4C6FFF]">*</span>
                              Seleccionar plantilla
                            </label>
                            <div className="flex flex-wrap items-center gap-3">
                              <div className="min-w-[240px] flex-1">
                                <Select
                                  value={selectedEmailTemplate || ''}
                                  onValueChange={(value) => {
                                    const template = emailTemplates.find((tpl) => tpl.id === value)
                                    if (template) {
                                      handleTemplateSelection(template)
                                    }
                                  }}
                                >
                                  <SelectTrigger className="w-full [&_.ant-select-selector]:!h-[44px] [&_.ant-select-selector]:!rounded-xl [&_.ant-select-selector]:!border-[#CBD3FF] [&_.ant-select-selector]:!px-4 [&_.ant-select-selector]:!py-2 [&_.ant-select-selector]:!text-[13px] [&_.ant-select-selector:hover]:!border-[#7B8CFF] [&_.ant-select-selector:focus-within]:!border-[#4C6FFF]">
                                    <SelectValue placeholder="Selecciona una plantilla guardada" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {emailTemplates.map((template) => (
                                      <SelectItem key={template.id} value={template.id}>
                                        {template.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <Button
                                type="link"
                                className="px-0 text-[#3559FF] hover:text-[#1D37B7]"
                                onClick={() => setTemplateDrawerOpen(true)}
                              >
                                + Crear plantilla
                              </Button>
                            </div>
                          </div>

                          {selectedEmailTemplateData ? (
                            <div className="space-y-4">
                              <div className="rounded-lg border border-[#E1E6FF] bg-white p-4 shadow-[0px_8px_20px_rgba(76,111,255,0.08)] space-y-4">
                                <div className="space-y-1">
                                  <span className="text-[13px] font-semibold text-[#1C2452]">
                                    Plantilla - {selectedEmailTemplateData.name}
                                  </span>
                                  <span className="text-[12px] text-[#6F7390]">{selectedEmailTemplateData.description}</span>
                                </div>

                                <div className="rounded-lg border border-[#EEF1FF] bg-[#FAFBFF] p-4 shadow-inner">
                                  {renderedEmailTemplateMessage.length > 0 ? (
                                    <div className="text-[13px] leading-[22px] text-[#313655]">
                                      {renderedEmailTemplateMessage.map((node, index) => (
                                        <Fragment key={index}>{node}</Fragment>
                                      ))}
                                    </div>
                                  ) : (
                                    <span className="text-[12px] text-gray-500">Esta plantilla no tiene mensaje definido.</span>
                                  )}
                                </div>

                                <div className="grid gap-3 md:grid-cols-2">
                                  <div className="rounded-lg border border-[#E5E9FF] bg-[#F8F9FF] p-3">
                                    <span className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.08em] text-[#363C6E]">
                                      Remitentes
                                    </span>
                                    <div className="flex flex-wrap gap-2">
                                      {selectedEmailTemplateData?.sender && selectedEmailTemplateData.sender.length > 0 ? (
                                        selectedEmailTemplateData.sender.map((sender: string) => (
                                          <span
                                            key={sender}
                                            className="inline-flex items-center rounded-[8px] border border-[#D5DCFF] bg-white px-3 py-1 text-[12px] font-medium text-[#394074]"
                                          >
                                            {sender}
                                          </span>
                                        ))
                                      ) : (
                                        <span className="text-[12px] text-gray-500">
                                          {selectedEmailTemplateData ? 'Sin remitentes guardados.' : 'Selecciona una plantilla para ver remitentes.'}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="rounded-lg border border-[#E5E9FF] bg-[#F8F9FF] p-3">
                                    <span className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.08em] text-[#363C6E]">
                                      Destinatarios
                                    </span>
                                    <div className="flex flex-wrap gap-2">
                                      {emailRecipients.length > 0 ? (
                                        emailRecipients.map((recipient) => (
                                          <span
                                            key={recipient}
                                            className="inline-flex items-center rounded-[8px] border border-[#D5DCFF] bg-white px-3 py-1 text-[12px] font-medium text-[#394074]"
                                          >
                                            {recipient}
                                          </span>
                                        ))
                                      ) : (
                                        <span className="text-[12px] text-gray-500">Sin destinatarios guardados.</span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="rounded-lg border border-[#E5E9FF] bg-[#F8F9FF] p-3">
                                  <span className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.08em] text-[#363C6E]">
                                    Asunto del correo
                                  </span>
                                  <div className="rounded-md border border-[#D6DDFF] bg-white px-3 py-2 text-[13px] font-medium text-[#1C2452]">
                                    {emailSubject || 'Sin asunto definido.'}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="rounded-lg border border-dashed border-[#C5CCF7] bg-white px-4 py-8 text-center text-[13px] text-[#6F7390]">
                              Selecciona una plantilla para visualizar el detalle guardado.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
              </SectionCard>

              {/* Section 3 - Webhook */}
              <SectionCard
                icon={<Link className="h-4 w-4 text-gray-600" />}
                title="Webhook"
                description="Configura un webhook para enviar datos del evento a sistemas externos"
                contentClassName={webhookEnabled ? 'space-y-4' : 'hidden'}
                headerExtra={
                  <Switch
                    checked={webhookEnabled}
                    onCheckedChange={setWebhookEnabled}
                    className="switch-blue"
                    disabled
                  />
                }
              >
                {webhookEnabled && <div className="-mx-4 border-b border-gray-200 mb-4"></div>}

                {/* Webhook Configuration */}
                {webhookEnabled && (
                  <div className="space-y-4">
                        {/* URL Field */}
                        <div>
                          <label className="block text-[12px] font-medium text-gray-700 mb-1">
                            URL del endpoint
                          </label>
                          <input
                            type="url"
                            placeholder="https://ejemplo.com/webhook/events"
                            className="w-full px-3 py-2 text-[14px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        {/* HTTP Method */}
                        <div>
                          <label className="block text-[12px] font-medium text-gray-700 mb-1">
                            Método HTTP
                          </label>
                          <Select defaultValue="POST">
                            <SelectTrigger className="text-[14px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="POST">POST</SelectItem>
                              <SelectItem value="PUT">PUT</SelectItem>
                              <SelectItem value="PATCH">PATCH</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Headers */}
                        <div>
                          <label className="block text-[12px] font-medium text-gray-700 mb-1">
                            Headers personalizados
                          </label>
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Nombre del header"
                                className="flex-1 px-3 py-2 text-[14px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                              <input
                                type="text"
                                placeholder="Valor"
                                className="flex-1 px-3 py-2 text-[14px] border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                              <button className="px-3 py-2 text-[14px] bg-blue-600 text-white rounded-md hover:bg-blue-700">
                                +
                              </button>
                            </div>
                            <p className="text-[12px] text-gray-500">
                              Agrega headers de autenticación o personalización según lo requiera tu endpoint
                            </p>
                          </div>
                        </div>

                        {/* Retry Configuration */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[12px] font-medium text-gray-700 mb-1">
                              Reintentos
                            </label>
                            <Select defaultValue="3">
                              <SelectTrigger className="text-[14px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="0">Sin reintentos</SelectItem>
                                <SelectItem value="1">1 reintento</SelectItem>
                                <SelectItem value="3">3 reintentos</SelectItem>
                                <SelectItem value="5">5 reintentos</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="block text-[12px] font-medium text-gray-700 mb-1">
                              Timeout (segundos)
                            </label>
                            <Select defaultValue="30">
                              <SelectTrigger className="text-[14px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="10">10 segundos</SelectItem>
                                <SelectItem value="30">30 segundos</SelectItem>
                                <SelectItem value="60">60 segundos</SelectItem>
                                <SelectItem value="120">120 segundos</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Test Webhook Button */}
                        <div className="pt-2">
                          <button className="w-full px-4 py-2 text-[14px] border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                            Probar webhook
                          </button>
                        </div>
                      </div>
                    )}
                </SectionCard>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="telemetry-wizard__footer border-t border-border bg-background px-6 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Button
              variant="outline"
              onClick={isFirstTab ? onBackToTypeSelector : handlePreviousStep}
              disabled={isFirstTab}
              className="text-[14px] font-normal"
            >
              Anterior
            </Button>
            <Button
              onClick={handleNextStep}
              disabled={isLastTab}
              className="bg-blue-600 hover:bg-blue-700 text-white text-[14px] font-normal"
            >
              Siguiente
            </Button>
          </div>
        </div>

        {/* Save Rule Modal */}
        <SaveRuleModal
          isOpen={showSaveModal}
          onClose={() => {
            setShowSaveModal(false)
          }}
          onSave={handleSaveRule}
          defaultData={{
            name: ruleName,
            description: ruleDescription,
            ruleType: resolvedRuleType
          }}
          isRenaming={false}
        />

        {/* Exit Confirmation Modal */}
        <ExitRuleConfirmationModal
          open={showExitConfirmModal}
          onOpenChange={setShowExitConfirmModal}
          onExitWithoutSaving={handleExitWithoutSaving}
          onStay={handleStayInEditor}
        />

        {/* Notification Example Modal */}
        <NotificationExampleModal
          isOpen={showNotificationExample}
          onClose={() => setShowNotificationExample(false)}
          eventMessage=""
          type={notificationExampleType}
        />
        <EmailTemplateDrawer
          open={templateDrawerOpen}
          onClose={() => setTemplateDrawerOpen(false)}
          onSave={handleTemplateSaved}
        />
      </div>
    </TooltipProvider>
  )
}
