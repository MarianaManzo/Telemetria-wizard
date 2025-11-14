import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react'
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
import { VariableTextarea, VariableButton, type VariableTextareaHandle, type MessageVariableDescriptor, type VariableCategory } from "./VariableTextarea"
import { RecipientsSelector } from "./RecipientsSelector"
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
import { cn } from "./ui/utils"

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
import markerBody from "../assets/event.svg?raw"
import markerLabel from "../assets/Label event.svg?raw"

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

const VersionBadge = ({ className = '' }: { className?: string }) => (
  <span
    className={cn(
      'inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] shadow-sm border',
      className
    )}
    style={{
      backgroundColor: '#111323',
      borderColor: '#05060C',
      color: '#FFFFFF'
    }}
  >
    V2
  </span>
)

// System sensors for telemetry
const systemTelemetrySensors = [
  { 
    value: 'movement_status', 
    label: 'Estado de movimiento', 
    unit: '', 
    dataType: 'boolean', 
    category: 'event' as const,
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
    category: 'event' as const,
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
    category: 'event' as const,
    valueDescription: 'Sin conexión / Mayor a 24 hrs / Mayor a 60 min',
    inputType: 'Dropdown (lista predefinida)',
    options: [
      { value: 'no_connection', label: 'Sin conexión' },
      { value: 'more_24h', label: 'Mayor a 24 hrs' },
      { value: 'more_60min', label: 'Mayor a 60 min' }
    ]
  },
  { value: 'battery', label: 'Batería', unit: '%', dataType: 'numeric', category: 'event' as const, valueDescription: '% (0–100)', inputType: 'Input numérico (%)' },
  { value: 'gsm_signal', label: 'Señal GSM (%)', unit: '%', dataType: 'numeric', category: 'event' as const, valueDescription: '% (0–100)', inputType: 'Input numérico (%)' },
  { value: 'satellites_count', label: 'Número de Satélites', unit: '', dataType: 'numeric', category: 'event' as const, valueDescription: 'Número entero (0–20+)', inputType: 'Input numérico' },
  { value: 'location', label: 'Ubicación', unit: '', dataType: 'string', category: 'event' as const, valueDescription: 'Dirección o coordenadas', inputType: 'Input texto / mapa' },
  { value: 'relative_distance', label: 'Distancia relativa (m)', unit: 'm', dataType: 'numeric', category: 'event' as const, valueDescription: 'Metros', inputType: 'Input numérico' },
  { value: 'server_date', label: 'Fecha del servidor', unit: '', dataType: 'datetime', category: 'event' as const, valueDescription: 'Fecha y hora', inputType: 'Selector de fecha/hora' },
  { value: 'device_date', label: 'Fecha del dispositivo', unit: '', dataType: 'datetime', category: 'event' as const, valueDescription: 'Fecha y hora', inputType: 'Selector de fecha/hora' },
  { value: 'speed', label: 'Velocidad (km/h)', unit: 'km/h', dataType: 'numeric', category: 'event' as const, valueDescription: 'km/h (0–250)', inputType: 'Input numérico' },
  { value: 'odometer', label: 'Odómetro (Km)', unit: 'km', dataType: 'numeric', category: 'event' as const, valueDescription: 'Kilómetros', inputType: 'Input numérico' },
  { value: 'latitude', label: 'Latitud (°)', unit: '°', dataType: 'numeric', category: 'event' as const, valueDescription: 'Coordenada decimal', inputType: 'Input numérico' },
  { value: 'longitude', label: 'Longitud (°)', unit: '°', dataType: 'numeric', category: 'event' as const, valueDescription: 'Coordenada decimal', inputType: 'Input numérico' },
  { 
    value: 'power_takeoff', 
    label: 'Toma de fuerza', 
    unit: '', 
    dataType: 'boolean', 
    category: 'event' as const,
    valueDescription: 'Activada / Desactivada',
    inputType: 'Dropdown (boolean string)',
    options: [
      { value: 'true', label: 'Activada' },
      { value: 'false', label: 'Desactivada' }
    ]
  },
  { value: 'temperature', label: 'Temperatura (°C)', unit: '°C', dataType: 'numeric', category: 'event' as const, valueDescription: '°C (-40 a 120)', inputType: 'Input numérico' },
  { value: 'axis_x', label: 'eje x (°)', unit: '°', dataType: 'numeric', category: 'event' as const, valueDescription: 'Grados de acelerómetro', inputType: 'Input numérico' },
  { 
    value: 'panic_button', 
    label: 'Pánico', 
    unit: '', 
    dataType: 'boolean', 
    category: 'event' as const,
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
  category: VariableCategory
}

const EVENT_MESSAGE_VARIABLES: EventMessageVariable[] = [
  {
    key: '{unidad}',
    label: 'Unidad',
    description: 'Nombre o identificador de la unidad que generó el evento',
    preview: 'Unidad ABC-123',
    category: 'unit',
  },
  {
    key: '{chofer}',
    label: 'Chofer',
    description: 'Nombre del chofer asociado a la unidad',
    preview: 'Juan Pérez',
    category: 'unit',
  },
  {
    key: '{conductor}',
    label: 'Conductor',
    description: 'Identificador del conductor (sensor o llave iButton)',
    preview: 'Carlos Martínez',
    category: 'unit',
  },
  {
    key: '{patente}',
    label: 'Patente',
    description: 'Patente o matrícula de la unidad',
    preview: 'ABC123',
    category: 'unit',
  },
  {
    key: '{modelo}',
    label: 'Modelo',
    description: 'Modelo del vehículo reportado en el evento',
    preview: 'Ford Transit',
    category: 'unit',
  },
  {
    key: '{empresa}',
    label: 'Empresa',
    description: 'Empresa propietaria o asignada a la unidad',
    preview: 'Numaris Logistics',
    category: 'unit',
  },
  {
    key: '{ubicacion_link}',
    label: 'Ubicación con enlace',
    description: 'Dirección con enlace a mapas donde sucedió el evento',
    preview: 'Av. Corrientes 1234, Buenos Aires',
    category: 'event',
  },
  {
    key: '{direccion}',
    label: 'Dirección',
    description: 'Dirección textual del evento',
    preview: 'Av. Corrientes 1234',
    category: 'event',
  },
  {
    key: '{ciudad}',
    label: 'Ciudad',
    description: 'Ciudad detectada para la ubicación del evento',
    preview: 'Buenos Aires',
    category: 'event',
  },
  {
    key: '{zona}',
    label: 'Zona',
    description: 'Zona geográfica o geocerca involucrada',
    preview: 'Zona Centro',
    category: 'event',
  },
  {
    key: '{fecha_hora}',
    label: 'Fecha y hora',
    description: 'Fecha y hora en la que se generó el evento',
    preview: () => new Date().toLocaleString('es-AR'),
    category: 'event',
  },
  {
    key: '{fecha}',
    label: 'Fecha',
    description: 'Fecha formateada del evento',
    preview: () => new Date().toLocaleDateString('es-AR'),
    category: 'event',
  },
  {
    key: '{hora}',
    label: 'Hora',
    description: 'Hora local del evento',
    preview: () => new Date().toLocaleTimeString('es-AR'),
    category: 'event',
  },
  {
    key: '{timestamp}',
    label: 'Timestamp',
    description: 'Marca de tiempo en milisegundos',
    preview: () => Date.now().toString(),
    category: 'event',
  },
  {
    key: '{velocidad}',
    label: 'Velocidad',
    description: 'Velocidad registrada por el sensor (km/h)',
    preview: '85 km/h',
    category: 'configuration',
  },
  {
    key: '{temperatura}',
    label: 'Temperatura',
    description: 'Temperatura de motor o ambiente registrada',
    preview: '25 °C',
    category: 'configuration',
  },
  {
    key: '{combustible}',
    label: 'Combustible',
    description: 'Nivel de combustible disponible',
    preview: '75 %',
    category: 'configuration',
  },
  {
    key: '{rpm}',
    label: 'RPM',
    description: 'Revoluciones por minuto del motor',
    preview: '2.450 RPM',
    category: 'configuration',
  },
  {
    key: '{voltaje}',
    label: 'Voltaje',
    description: 'Voltaje de la batería del vehículo',
    preview: '12,4 V',
    category: 'configuration',
  },
  {
    key: '{bateria}',
    label: 'Batería',
    description: 'Nivel de batería del dispositivo',
    preview: '89 %',
    category: 'configuration',
  },
  {
    key: '{senal_gsm}',
    label: 'Señal GSM',
    description: 'Potencia de la señal GSM reportada',
    preview: '78 %',
    category: 'configuration',
  },
  {
    key: '{satelites}',
    label: 'Satélites',
    description: 'Cantidad de satélites utilizados en el fix',
    preview: '12',
    category: 'configuration',
  },
  {
    key: '{odometro}',
    label: 'Odómetro',
    description: 'Kilometraje acumulado de la unidad',
    preview: '125.340 km',
    category: 'configuration',
  },
  {
    key: '{latitud}',
    label: 'Latitud',
    description: 'Latitud donde se registró el evento',
    preview: '-34.6037',
    category: 'configuration',
  },
  {
    key: '{longitud}',
    label: 'Longitud',
    description: 'Longitud donde se registró el evento',
    preview: '-58.3816',
    category: 'configuration',
  },
  {
    key: '{distancia}',
    label: 'Distancia relativa',
    description: 'Distancia acumulada respecto de la condición configurada',
    preview: '320 m',
    category: 'configuration',
  },
  {
    key: '{fecha_servidor}',
    label: 'Fecha del servidor',
    description: 'Fecha y hora registradas en el servidor',
    preview: () => new Date().toLocaleString('es-AR'),
    category: 'configuration',
  },
  {
    key: '{fecha_dispositivo}',
    label: 'Fecha del dispositivo',
    description: 'Fecha y hora reportadas por el dispositivo',
    preview: () => new Date().toLocaleString('es-AR'),
    category: 'configuration',
  },
  {
    key: '{ignicion}',
    label: 'Ignición',
    description: 'Estado de ignición del vehículo',
    preview: 'Encendido',
    category: 'configuration',
  },
  {
    key: '{movimiento}',
    label: 'Movimiento',
    description: 'Estado de movimiento de la unidad',
    preview: 'En movimiento',
    category: 'configuration',
  },
  {
    key: '{conexion}',
    label: 'Conexión',
    description: 'Estado de conexión del dispositivo',
    preview: 'Activa',
    category: 'configuration',
  },
  {
    key: '{sensor_puerta}',
    label: 'Sensor de puerta',
    description: 'Estado del sensor de puerta configurado',
    preview: 'Cerrada',
    category: 'configuration',
  },
  {
    key: '{sensor_carga}',
    label: 'Sensor de carga',
    description: 'Estado del sensor de carga o compuerta',
    preview: 'Con carga',
    category: 'configuration',
  },
  {
    key: '{humedad}',
    label: 'Humedad',
    description: 'Nivel de humedad reportado por sensores ambientales',
    preview: '68 %',
    category: 'configuration',
  },
  {
    key: '{aceleracion}',
    label: 'Aceleración',
    description: 'Aceleración instantánea detectada',
    preview: '2,3 m/s²',
    category: 'configuration',
  },
  {
    key: '{frenado}',
    label: 'Frenado',
    description: 'Intensidad del frenado detectado',
    preview: 'Suave',
    category: 'configuration',
  },
  {
    key: '{giro}',
    label: 'Giro',
    description: 'Dirección del giro detectado',
    preview: 'Izquierda',
    category: 'configuration',
  },
  {
    key: '{inclinacion}',
    label: 'Inclinación',
    description: 'Ángulo de inclinación reportado',
    preview: '5°',
    category: 'configuration',
  },
  {
    key: '{peso}',
    label: 'Peso',
    description: 'Peso total reportado por sensores de balanza',
    preview: '2.840 kg',
    category: 'configuration',
  },
  {
    key: '{peso_carga}',
    label: 'Peso de carga',
    description: 'Peso específico de la carga detectada',
    preview: '1.250 kg',
    category: 'configuration',
  },
  {
    key: '{altura}',
    label: 'Altura',
    description: 'Altura sobre el nivel del mar reportada',
    preview: '156 m',
    category: 'configuration',
  },
  {
    key: '{toma_fuerza}',
    label: 'Toma de fuerza',
    description: 'Estado de la toma de fuerza del vehículo',
    preview: 'Inactiva',
    category: 'configuration',
  },
  {
    key: '{eje_x}',
    label: 'Eje X',
    description: 'Lectura del eje X del acelerómetro',
    preview: '1,2 g',
    category: 'configuration',
  },
  {
    key: '{panico}',
    label: 'Botón de pánico',
    description: 'Estado del botón de pánico',
    preview: 'No activado',
    category: 'configuration',
  },
  {
    key: '{evento_id}',
    label: 'ID de evento',
    description: 'Identificador interno del evento generado',
    preview: 'EVT-001',
    category: 'event',
  },
  {
    key: '{regla_nombre}',
    label: 'Nombre de la regla',
    description: 'Nombre de la regla que disparó el evento',
    preview: 'Exceso de velocidad',
    category: 'event',
  },
  {
    key: '{severidad}',
    label: 'Severidad',
    description: 'Nivel de severidad configurado para la regla',
    preview: 'Alta',
    category: 'event',
  },
  {
    key: '{duracion}',
    label: 'Duración',
    description: 'Duración que se cumplió para disparar el evento',
    preview: '5 minutos',
    category: 'event',
  },
  {
    key: '{usuario}',
    label: 'Usuario',
    description: 'Usuario responsable asignado al evento',
    preview: 'supervisor-flota',
    category: 'event',
  },
  {
    key: '{plataforma}',
    label: 'Plataforma',
    description: 'Nombre de la plataforma que envía la notificación',
    preview: 'Numaris',
    category: 'event',
  },
  {
    key: '{version}',
    label: 'Versión',
    description: 'Versión del sistema o plantilla utilizada',
    preview: 'v2.1',
    category: 'event',
  },
  {
    key: '{estado_motor}',
    label: 'Estado del motor',
    description: 'Estado operativo del motor',
    preview: 'En funcionamiento',
    category: 'configuration',
  },
  {
    key: '{nivel_aceite}',
    label: 'Nivel de aceite',
    description: 'Nivel de aceite registrado por sensores',
    preview: '85 %',
    category: 'configuration',
  },
  {
    key: '{presion}',
    label: 'Presión',
    description: 'Presión detectada por sensores hidráulicos o neumáticos',
    preview: '32 PSI',
    category: 'configuration',
  },
  {
    key: '{evento}',
    label: 'Nombre del evento',
    description: 'Descripción corta del evento generado',
    preview: 'Alerta de exceso de velocidad',
    category: 'event',
  },
  {
    key: '{device_imei}',
    label: 'IMEI del dispositivo',
    description: 'Identificador único del dispositivo GPS que reportó el evento',
    preview: '356789034567890',
    category: 'device',
  },
  {
    key: '{device_marca}',
    label: 'Marca del dispositivo',
    description: 'Fabricante o marca comercial del dispositivo GPS',
    preview: 'Teltonika',
    category: 'device',
  },
  {
    key: '{device_modelo}',
    label: 'Modelo del dispositivo',
    description: 'Modelo específico del dispositivo GPS instalado',
    preview: 'FMB125',
    category: 'device',
  },
  {
    key: '{device_sim}',
    label: 'SIM del dispositivo',
    description: 'Número de SIM o línea asociada al dispositivo',
    preview: '+52 55 5555 5555',
    category: 'device',
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

type MapMarkerSeverity = keyof typeof severityConfig

function WizardMapPreview({
  severity,
  label,
  iconId
}: {
  severity: MapMarkerSeverity
  label: string
  iconId?: string
}) {
  const paletteSource = severityConfig[severity] ?? severityConfig.low
  const accent = paletteSource.previewText
  const fill = paletteSource.previewBg

  const tintedBody = markerBody
    .replace(/#DC2626/g, accent)
    .replace(/#FECDD2/g, fill)
    .replace(/#DF3F40/g, accent)
    .replace(/<path d="M23\.5693[\s\S]*?\/>/, '')

  const tintedLabel = markerLabel
    .replace(/#FECDD2/g, fill)
    .replace(/#DF3F40/g, accent)

  const iconPair = iconId && eventIconMap[iconId] ? eventIconMap[iconId] : eventIconMap['info']
  const IconPreview = iconPair?.outline

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative flex items-center justify-center" style={{ width: 34, height: 34 }}>
        <div dangerouslySetInnerHTML={{ __html: tintedBody }} />
        {IconPreview ? (
          <IconPreview
            className="absolute pointer-events-none"
            color={accent}
            strokeWidth={1.5}
            style={{ width: 16, height: 16 }}
          />
        ) : null}
      </div>
      <div className="relative" style={{ width: 74, height: 20 }}>
        <div dangerouslySetInnerHTML={{ __html: tintedLabel }} />
        <span
          className="absolute inset-0 flex items-center justify-center text-[11px] font-medium"
          style={{ color: accent }}
        >
          {label}
        </span>
      </div>
    </div>
  )
}

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
    if (sensorDataType === 'boolean') {
      return operatorOptions.filter(op => op.value === 'eq')
    }
    if (sensorDataType === 'string') {
      // For string sensors: only equals and not equals
      return operatorOptions.filter(op => op.value === 'eq' || op.value === 'neq')
    } else {
      // For numeric sensors: all operators (=, >, <, ≥, ≤, ≠)
      return operatorOptions
    }
  }

  const availableOperators = sensor ? getAvailableOperators(sensor.dataType) : operatorOptions
  const isBooleanSensor = sensor?.dataType === 'boolean'

  useEffect(() => {
    if (isBooleanSensor && condition.operator !== 'eq') {
      updateConditionInGroup(groupId, condition.id, 'operator', 'eq')
    }
  }, [isBooleanSensor, condition.operator, condition.id, groupId, updateConditionInGroup])
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
            disabled={!condition.sensor || isBooleanSensor}
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
              sensor.category === 'custom' ? (
                <Input
                  type="text"
                  placeholder="Escribe un valor"
                  value={condition.value}
                  onChange={(e) => updateConditionInGroup(groupId, condition.id, 'value', e.target.value)}
                  className="w-full text-[14px]"
                  aria-invalid={showValueError}
                  disabled={!condition.sensor}
                  style={getInputErrorStyles(showValueError)}
                />
              ) : (
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
              )
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
    if (sensorDataType === 'boolean') {
      return operatorOptions.filter(op => op.value === 'eq')
    }
    if (sensorDataType === 'string') {
      return operatorOptions.filter(op => op.value === 'eq' || op.value === 'neq')
    } else {
      // For numeric sensors: all operators (=, >, <, ≥, ≤, ≠)
      return operatorOptions
    }
  }

  const availableOperators = sensor ? getAvailableOperators(sensor.dataType) : operatorOptions
  const isBooleanSensor = sensor?.dataType === 'boolean'

  useEffect(() => {
    if (isBooleanSensor && condition.operator !== 'eq') {
      updateCondition(condition.id, 'operator', 'eq')
    }
  }, [isBooleanSensor, condition.operator, condition.id, updateCondition])

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
          disabled={!condition.sensor || isBooleanSensor}
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
              sensor.category === 'custom' ? (
                <Input
                  type="text"
                  placeholder="Escribe un valor"
                  value={condition.value}
                  onChange={(e) => updateCondition(condition.id, 'value', e.target.value)}
                  className="w-full text-[14px]"
                  disabled={!condition.sensor}
                  style={{ height: '32px', borderRadius: '8px' }}
                />
              ) : (
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
              )
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
  const [showZoneSelectionErrors, setShowZoneSelectionErrors] = useState(false)
  const [showScheduleDayError, setShowScheduleDayError] = useState(false)
  const [showDurationError, setShowDurationError] = useState(false)
  const [showActionsErrors, setShowActionsErrors] = useState(false)

  // Advanced configuration
  const [advancedOpen, setAdvancedOpen] = useState(false)
  
  // Geographic zone configuration
  const [zoneEventAction, setZoneEventAction] = useState<'entrada' | 'salida'>('entrada')
  const [selectedZonesData, setSelectedZonesData] = useState([])
  const [selectedZoneTags, setSelectedZoneTags] = useState<TagData[]>([])
  const [geographicScope, setGeographicScope] = useState<'anywhere' | 'inside' | 'outside'>('anywhere')
  const [showZoneScopeErrors, setShowZoneScopeErrors] = useState(false)
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

  const [sendDeviceCommand, setSendDeviceCommand] = useState(false)
  const [unitTagsEnabled, setUnitTagsEnabled] = useState(false)
  const [showUnitTagsError, setShowUnitTagsError] = useState(false)
  const [unitUntagsEnabled, setUnitUntagsEnabled] = useState(false)
  const [unitUntags, setUnitUntags] = useState<Array<{id: string, name: string, color: string}>>([])
  const [showUnitUntagsError, setShowUnitUntagsError] = useState(false)

  // Notifications tab state
  const defaultEventMessage = rule?.notifications?.eventMessage || 'La unidad {unidad} ha registrado una alerta en {ubicacion_link} a las {fecha_hora}.'
  const DEFAULT_EMAIL_SENDERS = ['noreply@numaris.com']
  const EVENT_MESSAGE_LIMIT = 2500
  const [eventMessage, setEventMessage] = useState(defaultEventMessage)
  const eventMessageEditorRef = useRef<VariableTextareaHandle>(null)
  const emailMessageEditorRef = useRef<VariableTextareaHandle>(null)
  const [showEventMessageError, setShowEventMessageError] = useState(false)
  const [emailEnabled, setEmailEnabled] = useState(rule?.notifications?.email?.enabled || false)
  const [emailRecipients, setEmailRecipients] = useState(
    rule?.notifications?.email?.recipients || ['usuario@email.com', 'usuario@email.com', 'usuario@email.com']
  )
  const [emailSenders, setEmailSenders] = useState<string[]>(
    rule?.notifications?.email?.sender || DEFAULT_EMAIL_SENDERS
  )
  const [emailSubject, setEmailSubject] = useState(
    rule?.notifications?.email?.subject || '[ALERTA] {unidad} - {regla_nombre}'
  )
  
  // Email personalization state
  const [customEmailMessage, setCustomEmailMessage] = useState(rule?.notifications?.email?.body || defaultEventMessage)

  const [showEmailSubjectError, setShowEmailSubjectError] = useState(false)
  const [showEmailSendersError, setShowEmailSendersError] = useState(false)
  const [showEmailRecipientsError, setShowEmailRecipientsError] = useState(false)
  const [showEmailMessageError, setShowEmailMessageError] = useState(false)
  const [mapPreviewStart, setMapPreviewStart] = useState('Inicio del evento')
  const [mapPreviewEnd, setMapPreviewEnd] = useState('Punto de seguimiento')
  const pushNotificationEnabled = false
  const headerRef = useRef<HTMLDivElement | null>(null)
  const [headerHeight, setHeaderHeight] = useState(0)

  useEffect(() => {
    if (!emailEnabled) {
      setShowEmailSubjectError(false)
      setShowEmailSendersError(false)
      setShowEmailRecipientsError(false)
      setShowEmailMessageError(false)
    }
  }, [emailEnabled])

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

  const zoneSelectionEmpty = selectedZonesData.length === 0 && selectedZoneTags.length === 0
  const scheduleHasSelectedDay = useMemo(() => {
    return Object.values(scheduleConfig).some((day) => day.enabled)
  }, [scheduleConfig])

  const zoneContextValue = useMemo(() => {
    if (resolvedRuleType === 'zone') {
      return !zoneSelectionEmpty
        ? 'zonas-especificas'
        : 'cualquier-lugar'
    }

    if (geographicScope === 'inside' || geographicScope === 'outside') {
      return 'zonas-especificas'
    }

    return 'cualquier-lugar'
  }, [resolvedRuleType, zoneSelectionEmpty, geographicScope])

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
        if (showEventMessageError) {
          setShowEventMessageError(false)
        }
        return
      }

      setEventMessage((prev) => {
        const next = (prev + variableKey).slice(0, EVENT_MESSAGE_LIMIT)
        if (showEventMessageError && next.trim().length > 0) {
          setShowEventMessageError(false)
        }
        return next
      })
    },
    [showEventMessageError]
  )
  const handleInsertEmailVariable = useCallback(
    (variableKey: string) => {
      if (emailMessageEditorRef.current) {
        emailMessageEditorRef.current.focus()
        emailMessageEditorRef.current.insertVariable(variableKey)
        return
      }

      setCustomEmailMessage((prev) => {
        const next = (prev + variableKey).slice(0, EVENT_MESSAGE_LIMIT)
        return next
      })
    },
    [setCustomEmailMessage]
  )
  const [webhookNotificationEnabled, setWebhookNotificationEnabled] = useState(rule?.notifications?.webhook?.enabled || false)
  const [platformNotificationEnabled, setPlatformNotificationEnabled] = useState(rule?.notifications?.platform?.enabled || false)

  // Template selection temporalmente deshabilitado: los usuarios redactan el mensaje manualmente

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
    const normalizedValue =
      field === 'enabled'
        ? value === true
        : value

    setScheduleConfig(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: normalizedValue
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
  } else {
    setShowZoneSelectionErrors(false)
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
          setCustomEmailMessage(emailBody)
          setEmailSenders(rule.notifications.email.sender || DEFAULT_EMAIL_SENDERS)
        }
        
        if (rule.notifications.push) {
          // UI no longer permite editar push; se mantiene desactivado
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
          setGeographicScope('inside')
        } else if (rule.zoneScope.type === 'outside') {
          setZoneEventAction('salida')
          setGeographicScope('outside')
        } else {
          setGeographicScope('anywhere')
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

  const flagParameterErrors = useCallback((options?: { requireZoneScope?: boolean }) => {
    const requireZoneScope = options?.requireZoneScope ?? true
    const hasValidCondition = conditionGroups.some(group =>
      group.conditions.some(condition => condition.sensor && condition.operator && condition.value)
    )
    const hasAtLeastOneGroup = conditionGroups.length > 0
    const missingCustomTargets =
      appliesTo === 'custom' && selectedUnitsLocal.length === 0 && selectedTags.length === 0
    const missingDuration = eventTiming === 'despues-tiempo' && (!durationValue || Number(durationValue) <= 0)
    const zoneScopeActive = resolvedRuleType !== 'zone' && geographicScope !== 'anywhere'
    const missingZoneScope = zoneScopeActive && zoneSelectionEmpty
    const requireZoneSelection = resolvedRuleType === 'zone' && validateZoneEntry

    if (zoneScopeActive && zoneSelectionEmpty) {
      setShowZoneScopeErrors(true)
    }
    if (requireZoneSelection && zoneSelectionEmpty) {
      setShowZoneSelectionErrors(true)
    }

    const hasErrors =
      (isZoneValidationRequired && (!hasAtLeastOneGroup || !hasValidCondition)) ||
      missingCustomTargets ||
      missingDuration ||
      (requireZoneScope && missingZoneScope) ||
      (requireZoneSelection && zoneSelectionEmpty)

    if (isZoneValidationRequired && (!hasAtLeastOneGroup || !hasValidCondition)) {
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
    resolvedRuleType,
    geographicScope,
    zoneSelectionEmpty,
    validateZoneEntry,
  ])

  const requiresClosureTime = closePolicy === 'automaticamente-tiempo'

  const needsUnitTags = unitTagsEnabled && unitTags.length === 0
  const needsUnitUntags = unitUntagsEnabled && unitUntags.length === 0

  const trimmedShortName = eventShortName.trim()
  const hasValidActions = useMemo(
    () =>
      Boolean(
        trimmedShortName.length >= 3 &&
          (!requiresClosureTime || (closureTimeValue && Number(closureTimeValue) > 0)) &&
          !needsUnitTags &&
          !needsUnitUntags
      ),
    [
      trimmedShortName,
      requiresClosureTime,
      closureTimeValue,
      needsUnitTags,
      needsUnitUntags,
    ]
  )

  const flagActionErrors = useCallback(() => {
    let isValid = true

    if (eventShortName.trim().length < 3) {
      setShowActionsErrors(true)
      isValid = false
    } else if (showActionsErrors) {
      setShowActionsErrors(false)
    }

    if (requiresClosureTime) {
      if (!closureTimeValue || Number(closureTimeValue) <= 0) {
        setShowClosureTimeError(true)
        isValid = false
      }
    } else {
      setShowClosureTimeError(false)
    }

    if (needsUnitTags) {
      setShowUnitTagsError(true)
      isValid = false
    } else if (unitTags.length > 0) {
      setShowUnitTagsError(false)
    }

    if (needsUnitUntags) {
      setShowUnitUntagsError(true)
      isValid = false
    } else if (unitUntags.length > 0) {
      setShowUnitUntagsError(false)
    }

    return isValid
  }, [
    eventShortName,
    requiresClosureTime,
    closureTimeValue,
    needsUnitTags,
    needsUnitUntags,
    unitTags.length,
    unitUntags.length,
    showActionsErrors,
  ])

  const flagNotificationErrors = useCallback(() => {
    let isValid = true
    if (!eventMessage.trim()) {
      setShowEventMessageError(true)
      isValid = false
    } else if (showEventMessageError) {
      setShowEventMessageError(false)
    }

    if (emailEnabled) {
      if (!emailSubject.trim()) {
        setShowEmailSubjectError(true)
        isValid = false
      } else if (showEmailSubjectError) {
        setShowEmailSubjectError(false)
      }

      if (emailSenders.length === 0) {
        setShowEmailSendersError(true)
        isValid = false
      } else if (showEmailSendersError) {
        setShowEmailSendersError(false)
      }

      if (emailRecipients.length === 0) {
        setShowEmailRecipientsError(true)
        isValid = false
      } else if (showEmailRecipientsError) {
        setShowEmailRecipientsError(false)
      }

      if (!customEmailMessage.trim()) {
        setShowEmailMessageError(true)
        isValid = false
      } else if (showEmailMessageError) {
        setShowEmailMessageError(false)
      }
    } else {
      if (showEmailSubjectError) setShowEmailSubjectError(false)
      if (showEmailSendersError) setShowEmailSendersError(false)
      if (showEmailRecipientsError) setShowEmailRecipientsError(false)
      if (showEmailMessageError) setShowEmailMessageError(false)
    }

    return isValid
  }, [
    customEmailMessage,
    emailEnabled,
    emailRecipients.length,
    emailSenders.length,
    emailSubject,
    eventMessage,
    showEmailMessageError,
    showEmailRecipientsError,
    showEmailSendersError,
    showEmailSubjectError,
    showEventMessageError,
  ])

  const handleSave = async () => {
    const parametersOk = flagParameterErrors()
    const actionsOk = flagActionErrors()
    const notificationsOk = flagNotificationErrors()
    if (!parametersOk || !actionsOk || !notificationsOk) {
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

    const isTelemetryWithZoneScope = resolvedRuleType !== 'zone' && geographicScope !== 'anywhere'
    const zoneScopeData = resolvedRuleType === 'zone'
      ? {
          type: zoneEventAction === 'entrada' ? 'inside' : 'outside',
          zones: selectedZonesData,
          zoneTags: selectedZoneTags.map(tag => tag.name),
        }
      : isTelemetryWithZoneScope
        ? {
            type: geographicScope === 'inside' ? 'inside' : 'outside',
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
          sender: emailSenders,
          recipients: emailRecipients,
          subject: emailSubject,
          body: customEmailMessage,
          templateId: rule?.notifications?.email?.templateId ?? null
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
  const zoneSelectionRequired = resolvedRuleType === 'zone'
  const scheduleRequiresDays = ruleSchedule === 'personalizado'
  const scheduleValid = !scheduleRequiresDays || scheduleHasSelectedDay
  const isZoneValidationRequired = !(resolvedRuleType === 'zone' && !validateZoneEntry)
  const effectiveHasAtLeastOneGroup = isZoneValidationRequired ? hasAtLeastOneGroup : true
  const effectiveHasValidCondition = isZoneValidationRequired ? hasValidCondition : true
  const needsCustomTargets = appliesTo === 'custom' && selectedUnitsLocal.length === 0 && selectedTags.length === 0
  const needsDurationValue = eventTiming === 'despues-tiempo' && (!durationValue || Number(durationValue) <= 0)
  const shouldRestrictByZone = resolvedRuleType !== 'zone' && geographicScope !== 'anywhere'
  const showCustomTargetsError = appliesTo === 'custom' && showAppliesErrors && needsCustomTargets
  const showZoneScopeError = shouldRestrictByZone && showZoneScopeErrors && zoneSelectionEmpty
  const canProceedToConfig =
    effectiveHasAtLeastOneGroup &&
    effectiveHasValidCondition &&
    !needsCustomTargets &&
    !needsDurationValue &&
    (!zoneSelectionRequired || !zoneSelectionEmpty) &&
    scheduleValid
  const showClosureTimeHelper = requiresClosureTime && showClosureTimeError
  const shortNameHasError = showActionsErrors && trimmedShortName.length < 3

useEffect(() => {
  if (!shouldRestrictByZone || !zoneSelectionEmpty) {
    setShowZoneScopeErrors(false)
  }
}, [shouldRestrictByZone, zoneSelectionEmpty])

useEffect(() => {
  if (!zoneSelectionEmpty && showZoneSelectionErrors) {
    setShowZoneSelectionErrors(false)
  }
}, [zoneSelectionEmpty, showZoneSelectionErrors])

useEffect(() => {
  if (scheduleValid) {
    setShowScheduleDayError(false)
  }
}, [scheduleValid])

  const handleNextStep = () => {
    if (currentTabIndex === 0) {
      flagParameterErrors({ requireZoneScope: false })
      if (zoneSelectionRequired && zoneSelectionEmpty) {
        setShowZoneSelectionErrors(true)
      }
      if (scheduleRequiresDays && !scheduleHasSelectedDay) {
        setShowScheduleDayError(true)
      }
    }
    if (currentTabIndex === 0 && !canProceedToConfig) {
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
  const notificationsTabDisabled =
    (currentTabIndex === 0 && !canProceedToConfig) ||
    (currentTabIndex === 1 && !hasValidActions)
  const handleTabChange = (nextTab: string) => {
    if (nextTab === activeTab) return
    if (currentTabIndex === 0) {
      flagParameterErrors({ requireZoneScope: false })
      if (zoneSelectionRequired && zoneSelectionEmpty) {
        setShowZoneSelectionErrors(true)
      }
      if (scheduleRequiresDays && !scheduleHasSelectedDay) {
        setShowScheduleDayError(true)
      }
    }
    if (currentTabIndex === 0 && nextTab !== 'parameters' && !canProceedToConfig) {
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
  const isNextButtonBlocked =
    (currentTabIndex === 0 && !canProceedToConfig) ||
    (currentTabIndex === 1 && !hasValidActions)

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
        <div className="grid grid-cols-2 gap-8 items-start">
          <div className="flex flex-col gap-1">
            <div className="flex items-start gap-1">
              <span className="text-red-500 leading-5">*</span>
              <label className="text-[14px] font-medium text-gray-700 leading-5">
                ¿A qué unidades aplicará la regla?
              </label>
            </div>
            {appliesTo === 'custom' && (
              <p className={`text-[12px] pl-4 ${showCustomTargetsError ? 'text-red-500' : 'text-gray-500'}`}>
                Selecciona al menos una unidad o etiqueta.
              </p>
            )}
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
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-gray-600" />
                  <label className="text-[14px] font-medium text-gray-700">
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
            {resolvedRuleType !== 'zone' && (
              <>
                <div className="grid grid-cols-2 gap-8 items-start">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-start gap-1">
                      <span className="text-red-500 leading-5">*</span>
                      <label className="text-[14px] font-medium text-gray-700 leading-5">
                        ¿En qué zona geográfica aplica esta regla?
                      </label>
                    </div>
                    {shouldRestrictByZone && (
                      <p
                        className={`text-[12px] ${
                          showZoneScopeError ? 'text-red-500' : 'text-gray-500'
                        } pl-4`}
                      >
                        Selecciona al menos una zona o etiqueta.
                      </p>
                    )}
                  </div>
                  <div>
                    <Select
                      value={geographicScope}
                      onValueChange={(value) => {
                        const scope = value as 'anywhere' | 'inside' | 'outside'
                        setGeographicScope(scope)
                        if (scope === 'anywhere') {
                          setShowZoneScopeErrors(false)
                        }
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="anywhere">En cualquier lugar</SelectItem>
                        <SelectItem value="inside">Dentro de una zona o grupo de zonas</SelectItem>
                        <SelectItem value="outside">Fuera de una zona o grupo de zonas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {shouldRestrictByZone && (
                  <>
                    <div className="grid grid-cols-2 gap-8 items-start">
                      <div className="flex items-center gap-2 text-gray-700 pl-4">
                        <MapPin className="h-4 w-4 text-gray-600" />
                        <span className="text-[14px] font-medium">Zonas</span>
                      </div>
                      <div>
                        <ZonasSelectorInput
                          selectedZones={selectedZonesData}
                          onSelectionChange={setSelectedZonesData}
                          placeholder="Seleccionar zona"
                          hasError={showZoneScopeError}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 items-start">
                      <div className="flex items-center gap-2 text-gray-700 pl-4">
                        <Tag className="h-4 w-4 text-gray-600" />
                        <span className="text-[14px] font-medium">Etiquetas</span>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            Usa etiquetas para agrupar zonas y simplificar la selección.
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div>
                        <EtiquetasSelectorInput
                          selectedTags={selectedZoneTags}
                          onSelectionChange={setSelectedZoneTags}
                          placeholder="Seleccionar etiquetas"
                          hasError={showZoneScopeError}
                        />
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            <div className="grid grid-cols-2 gap-8 items-center">
                  <div>
                    <label className="text-[14px] font-medium text-gray-700 flex items-center gap-1">
                      <span className="text-red-500">*</span>
                      ¿En qué momento se debe generar el evento?
                    </label>
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
                <div className="pl-4">
                  <label className="text-[14px] font-medium text-gray-700">Duración</label>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={1}
                      onKeyDown={(event) => {
                        if (event.key === '-' || event.key === 'Minus') {
                          event.preventDefault()
                        }
                      }}
                      value={durationValue}
                      onChange={(e) => {
                        const nextValue = e.target.value
                        if (nextValue === '') {
                          setDurationValue('')
                          return
                        }
                        if (Number(nextValue) < 0) {
                          return
                        }
                        setDurationValue(nextValue)
                        if (Number(nextValue) > 0) {
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
              <div className="flex flex-col gap-1">
                <label className="text-[14px] font-medium text-gray-700 flex items-center gap-1">
                  <span className="text-red-500">*</span>
                  ¿Cuándo estará activa esta regla?
                </label>
                {scheduleRequiresDays && (
                  <span className={`text-[12px] ${showScheduleDayError ? 'text-red-500' : 'text-gray-500'}`}>
                    Selecciona al menos un día.
                  </span>
                )}
              </div>
              <div>
                <Select value={ruleSchedule} onValueChange={setRuleSchedule}>
                  <SelectTrigger
                    className={`w-full ${showScheduleDayError ? 'focus:ring-red-200' : ''}`}
                    status={showScheduleDayError ? 'error' : undefined}
                  >
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
                            onChange={(event) => updateDaySchedule(day, 'enabled', event.target.checked)}
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

    const zoneSelectionHasError = showZoneSelectionErrors && zoneSelectionEmpty

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
              <div className="flex flex-col gap-1">
                <label className="text-[14px] font-medium flex items-center gap-1 text-gray-700">
                <span className="text-red-500">*</span>
                ¿Qué acción activará el evento?
                </label>
                <span className={`text-[12px] ${zoneSelectionHasError ? 'text-red-500' : 'text-gray-500'}`}>
                  Selecciona al menos una zona o etiqueta.
                </span>
              </div>
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
                hasError={zoneSelectionHasError}
              />
            </div>

            <div className="grid grid-cols-2 gap-6 items-center">
              <label className="text-[14px] font-medium text-gray-700">Etiquetas de zona</label>
              <EtiquetasSelectorInput
                selectedTags={selectedZoneTags}
                onSelectionChange={handleZoneTagsChange}
                hasError={zoneSelectionHasError}
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
                {isEditing ? (isSaving ? 'Guardando...' : 'Guardar') : 'Guardar'}
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
                  aria-disabled={notificationsTabDisabled}
                  className={`bg-transparent border-0 rounded-none px-0 py-3 text-[14px] border-b-2 border-transparent data-[state=active]:border-blue-600 ${
                    currentTabIndex >= 2 ? 'text-blue-600' : 'text-gray-500'
                  } ${notificationsTabDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
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
                          minLength={3}
                          value={eventShortName}
                          onChange={(event) => {
                            const value = event.target.value.slice(0, 10)
                            setEventShortName(value)
                            if (showActionsErrors && value.trim().length >= 3) {
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
                          <p className="text-[12px] text-red-500">
                            {trimmedShortName.length === 0
                              ? 'Campo obligatorio.'
                              : 'Debe tener como mínimo 3 caracteres.'}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <span className="text-[14px] font-medium text-gray-700">Vista previa en mapa</span>
                        <WizardMapPreview
                          severity={eventSeverity}
                          label={eventShortName.trim() || 'Evento'}
                          iconId={eventIcon}
                        />
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
                          setShowUnitTagsError(false)
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
                          <label className="text-[14px] font-medium text-gray-700">
                            <span className="text-red-500 mr-1">*</span>
                            Asignar etiquetas
                          </label>
                        </div>
                        <div>
                          <GenericSelectorInput
                            selectedItems={unitTags}
                            onSelectionChange={(items) => {
                              if (items.length <= 10) {
                                setUnitTags(items)
                                if (items.length > 0) {
                                  setShowUnitTagsError(false)
                                }
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
                            hasError={showUnitTagsError}
                          />
                          {showUnitTagsError && (
                            <p className="mt-1 text-[12px] text-red-500">Selecciona al menos una etiqueta.</p>
                          )}
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
                          setShowUnitUntagsError(false)
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
                          <label className="text-[14px] font-medium text-gray-700">
                            <span className="text-red-500 mr-1">*</span>
                            Desasignar etiquetas
                          </label>
                        </div>
                        <div>
                          <GenericSelectorInput
                            selectedItems={unitUntags}
                            onSelectionChange={(items) => {
                              if (items.length <= 10) {
                                setUnitUntags(items)
                                if (items.length > 0) {
                                  setShowUnitUntagsError(false)
                                }
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
                            hasError={showUnitUntagsError}
                          />
                          {showUnitUntagsError && (
                            <p className="mt-1 text-[12px] text-red-500">Selecciona al menos una etiqueta.</p>
                          )}
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
                  icon={
                    <div className="flex items-center gap-2">
                      <VersionBadge />
                      <Tag className="h-4 w-4 text-gray-600" />
                    </div>
                  }
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
                    <div className="border border-gray-200 rounded-lg bg-gray-50 p-4 space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <h4 className="text-[13px] font-medium text-gray-700">Variables configuradas</h4>
                        <VariableButton
                          label="Más variables"
                          variables={EVENT_MESSAGE_VARIABLES}
                          onInsertVariable={handleInsertEventVariable}
                        />
                      </div>
                      <span className="text-[11px] text-gray-500 block">
                        Escribe ‘#’ en el mensaje para abrir el listado de variables disponibles o haz clic para insertarlas.
                      </span>
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
                              className="inline-flex items-center transition-colors"
                              style={{
                                backgroundColor: '#F9F0FF',
                                borderColor: '#BEA5F5',
                                color: '#7839EE',
                                borderRadius: '8px',
                                borderWidth: '1px',
                                borderStyle: 'solid',
                                padding: '4px 12px',
                              }}
                              onClick={() => handleInsertEventVariable(variable.key)}
                            >
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
                      <label className="text-[14px] font-medium text-gray-700 flex items-center gap-1">
                        <span className="text-red-500">*</span> Mensaje del evento
                      </label>
                      <VariableTextarea
                        ref={eventMessageEditorRef}
                        name="event-message"
                        value={eventMessage}
                        onChange={(text) => {
                          setEventMessage(text)
                          if (showEventMessageError && text.trim().length > 0) {
                            setShowEventMessageError(false)
                          }
                        }}
                        showVariableButton={false}
                        placeholder={
                          hasConfiguredSensors
                            ? 'Escribe el mensaje (máx. 2500 caracteres) o inserta variables desde la barra superior.'
                            : 'Escribe el mensaje del evento (máx. 2500 caracteres). Puedes insertar variables desde "Más variables".'
                        }
                        maxLength={EVENT_MESSAGE_LIMIT}
                        showCounter
                        editorClassName="min-h-[120px]"
                        editorStyle={
                          showEventMessageError
                            ? { borderColor: '#F04438', boxShadow: '0 0 0 1px rgba(240,68,56,0.3)' }
                            : undefined
                        }
                      />
                      {showEventMessageError && (
                        <p className="text-[12px] text-red-500">Campo obligatorio.</p>
                      )}

                      {/* Vista previa oculta temporalmente */}
                    </div>
                  </SectionCard>

              {/* Section 2 - Canales de notificación */}
              <SectionCard
                icon={<Bell className="h-4 w-4 text-gray-600" />}
                title="Canales de notificación"
                description="Selecciona por qué medios quieres enviar el mensaje cuando ocurra este evento"
                contentClassName="space-y-4"
              >
                    {/* Notificación Web (referencia) */}
                    <div className="border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between p-3">
                        <div className="flex items-center gap-3">
                          <VersionBadge />
                          <Monitor className="h-5 w-5 text-gray-500" />
                          <div>
                            <div className="text-[14px] font-medium text-gray-700">Notificación Web</div>
                            <div className="text-[12px] text-gray-600">Siempre activa desde la plataforma</div>
                          </div>
                        </div>
                        <Switch checked={false} disabled className="switch-blue opacity-50" />
                      </div>
                    </div>

                    {/* Notificación Móvil (referencia) */}
                    <div className="border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between p-3">
                        <div className="flex items-center gap-3">
                          <VersionBadge />
                          <Smartphone className="h-5 w-5 text-gray-500" />
                          <div>
                            <div className="text-[14px] font-medium text-gray-700">Notificación Móvil</div>
                            <div className="text-[12px] text-gray-600">No configurable en este flujo</div>
                          </div>
                        </div>
                        <Switch checked={false} disabled className="switch-blue opacity-50" />
                      </div>
                    </div>

                    {/* Correo electrónico */}
                    <div className="border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <Mail className="h-5 w-5 text-gray-600" />
                          <div>
                            <div className="text-[14px] font-medium text-gray-700">Correo electrónico</div>
                            <div className="text-[12px] text-gray-600">Envío por email con asunto personalizable</div>
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
                        <div className="border-t border-gray-200 p-4 space-y-5">
                          <div className="space-y-4">
                            <div
                              className="grid gap-4 items-center"
                              style={{ gridTemplateColumns: '220px minmax(0, 1fr)' }}
                            >
                              <label className="text-[13px] font-medium text-gray-700 flex items-center gap-1">
                                <span className="text-red-500">*</span>
                                Asunto
                              </label>
                              <Input
                                value={emailSubject}
                                onChange={(e) => {
                                  setEmailSubject(e.target.value)
                                  if (showEmailSubjectError && e.target.value.trim().length > 0) {
                                    setShowEmailSubjectError(false)
                                  }
                                }}
                                placeholder="Alerta Velocidad"
                                className="h-11 rounded-xl border-[#CBD3FF] bg-white text-[14px]"
                                aria-invalid={showEmailSubjectError}
                                style={{
                                  ...(showEmailSubjectError
                                    ? { border: '1px solid #F04438', boxShadow: 'none' }
                                    : {}),
                                }}
                              />
                            </div>
                            {showEmailSubjectError && (
                              <p className="text-[12px] text-red-500">
                                Define el asunto del correo electrónico.
                              </p>
                            )}

                            <div
                              className="grid gap-4 items-center"
                              style={{ gridTemplateColumns: '220px minmax(0, 1fr)' }}
                            >
                              <label className="text-[13px] font-medium text-gray-700 flex items-center gap-1">
                                <span className="text-red-500">*</span>
                                Remitentes
                              </label>
                              <RecipientsSelector
                                value={emailSenders}
                                onChange={(values) => {
                                  setEmailSenders(values)
                                  if (showEmailSendersError && values.length > 0) {
                                    setShowEmailSendersError(false)
                                  }
                                }}
                                className="w-full"
                                placeholder="noreply@numaris.com"
                                error={showEmailSendersError}
                              />
                            </div>
                            {showEmailSendersError && (
                              <p className="text-[12px] text-red-500">Agrega al menos un remitente.</p>
                            )}

                            <div
                              className="grid gap-4 items-center"
                              style={{ gridTemplateColumns: '220px minmax(0, 1fr)' }}
                            >
                              <label className="text-[13px] font-medium text-gray-700 flex items-center gap-1">
                                <span className="text-red-500">*</span>
                                Destinatarios
                              </label>
                              <RecipientsSelector
                                value={emailRecipients}
                                onChange={(values) => {
                                  setEmailRecipients(values)
                                  if (showEmailRecipientsError && values.length > 0) {
                                    setShowEmailRecipientsError(false)
                                  }
                                }}
                                className="w-full"
                                placeholder="Agregar destinatarios (separa con coma)"
                                error={showEmailRecipientsError}
                              />
                            </div>
                            {showEmailRecipientsError && (
                              <p className="text-[12px] text-red-500">Agrega al menos un destinatario.</p>
                            )}

                            <div className="border-t border-gray-200 pt-4 space-y-2">
                              <div className="flex items-center justify-between">
                                <label className="text-[13px] font-medium text-gray-700 flex items-center gap-1">
                                  <span className="text-red-500">*</span>
                                  Mensaje de correo electrónico
                                </label>
                                <VariableButton
                                  label="Más variables"
                                  onInsertVariable={handleInsertEmailVariable}
                                />
                              </div>
                              <VariableTextarea
                                ref={emailMessageEditorRef}
                                value={customEmailMessage}
                                onChange={(value) => {
                                  setCustomEmailMessage(value)
                                  if (showEmailMessageError && value.trim().length > 0) {
                                    setShowEmailMessageError(false)
                                  }
                                }}
                                placeholder="Escribe el mensaje que recibirán tus destinatarios..."
                                className="w-full"
                                editorClassName="min-h-[160px] border border-[#CBD3FF] rounded-2xl bg-white px-4 py-3 text-[14px]"
                                editorStyle={
                                  showEmailMessageError
                                    ? { borderColor: '#F04438', boxShadow: '0 0 0 1px rgba(240,68,56,0.3)' }
                                    : undefined
                                }
                                showVariableButton={false}
                                maxLength={EVENT_MESSAGE_LIMIT}
                              />
                              {showEmailMessageError && (
                                <p className="text-[12px] text-red-500">Escribe el cuerpo del correo.</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
              </SectionCard>

              {/* Section 3 - Webhook (referencia) */}
              <SectionCard
                icon={
                  <div className="flex items-center gap-2">
                    <VersionBadge />
                    <Link className="h-4 w-4 text-gray-600" />
                  </div>
                }
                title="Webhook"
                description="Integración externa administrada desde la plataforma web"
                headerExtra={
                  <Switch checked={false} disabled className="switch-blue opacity-50" />
                }
                contentClassName="hidden"
              >
                <div />
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
              onClick={isLastTab ? handleSave : handleNextStep}
              disabled={!isLastTab && isNextButtonBlocked}
              className="bg-blue-600 hover:bg-blue-700 text-white text-[14px] font-normal"
            >
              {isLastTab ? 'Guardar' : 'Siguiente'}
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
      </div>
    </TooltipProvider>
  )
}
