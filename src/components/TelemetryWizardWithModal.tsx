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
import { Textarea } from "./ui/textarea"
import { VariableTextarea, VariableButton } from "./VariableTextarea"
import { VariableInput } from "./VariableInput"
import { NotificationExampleModal } from "./NotificationExampleModal"
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
  ClipboardList,
  UserCheck,
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
  MessageSquare,
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
import { SearchableUserSelect } from "./SearchableUserSelect"
import { SaveRuleModal } from "./SaveRuleModal"
import { RecipientsSelector } from "./RecipientsSelector"
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

// Import email templates from separate file
import { userEmailTemplates, type UserEmailTemplate } from "../constants/emailTemplates"



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

// Severity configuration with colors
const severityConfig = {
  high: { 
    label: 'Alta', 
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
    borderColor: 'border-red-200'
  },
  medium: { 
    label: 'Media', 
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-200'
  },
  low: { 
    label: 'Baja', 
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200'
  },
  informative: { 
    label: 'Informativo', 
    bgColor: 'bg-cyan-100',
    textColor: 'text-cyan-700',
    borderColor: 'border-cyan-200'
  }
}

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
  showRemoveButton
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
          style={{ width: '36px', height: '36px', marginTop: '34px' }}
        >
          <GripVertical className="w-4 h-4 text-gray-400" />
        </div>

        <div className="min-w-0" style={{ flex: '0 0 180px' }}>
          <Label className="block mb-2" textClassName="text-[14px]">Sensor</Label>
          <SensorSelectorWithSearch
            value={condition.sensor}
            onValueChange={(value) => updateConditionInGroup(groupId, condition.id, 'sensor', value)}
            systemSensors={systemTelemetrySensors}
            customSensors={customTelemetrySensors}
            placeholder="Seleccionar sensor"
            className="w-full max-w-[180px] text-[14px]"
          />
        </div>

        <div className="min-w-0" style={{ flex: '0 0 180px' }}>
          <Label className="block mb-2" textClassName="text-[14px]">Operador</Label>
          <Select
            value={condition.operator}
            onValueChange={(value) => updateConditionInGroup(groupId, condition.id, 'operator', value)}
            disabled={!condition.sensor}
          >
            <SelectTrigger className="w-full" style={{ fontSize: '14px', height: '40px', borderRadius: '8px' }}>
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

        <div className="min-w-0" style={{ flex: '0 0 180px' }}>
          <Label className="block mb-2" textClassName="text-[14px]">Valor</Label>
          <div className="flex items-center gap-2">
            {/* Render different input types based on sensor dataType */}
            {sensor?.dataType === 'boolean' ? (
              <Select
                value={condition.value}
                onValueChange={(value) => updateConditionInGroup(groupId, condition.id, 'value', value)}
                disabled={!condition.sensor}
              >
                <SelectTrigger className="w-full" style={{ fontSize: '14px', height: '40px', borderRadius: '8px' }}>
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
              >
                <SelectTrigger className="w-full" style={{ fontSize: '14px', height: '40px', borderRadius: '8px' }}>
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
                style={{ height: '40px', borderRadius: '8px' }}
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

        {showRemoveButton && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => removeConditionFromGroup(groupId, condition.id)}
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
          style={{ width: '36px', height: '36px', marginTop: '34px' }}
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
          <SelectTrigger className="w-full" style={{ fontSize: '14px', height: '40px', borderRadius: '8px' }}>
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
              <SelectTrigger className="w-full" style={{ fontSize: '14px', height: '40px', borderRadius: '8px' }}>
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
              <SelectTrigger className="w-full" style={{ fontSize: '14px', height: '40px', borderRadius: '8px' }}>
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
              style={{ height: '40px', borderRadius: '8px' }}
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
  totalGroups
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
}

export function TelemetryWizard({ onSave, onCancel, onBackToTypeSelector, rule, onRename }: TelemetryWizardProps) {
  const isEditing = !!rule
  const { addNotification } = useNotifications()
  
  const [activeTab, setActiveTab] = useState("parameters")
  const [ruleName, setRuleName] = useState(rule?.name || "")
  const [ruleDescription, setRuleDescription] = useState(rule?.description || "")
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [showExitConfirmModal, setShowExitConfirmModal] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const [isSaving, setIsSaving] = useState(false)
  
  // Parameters - Support both new grouped structure and legacy flat structure
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
      conditions: [{
        id: '1',
        sensor: '',
        operator: '',
        value: '',
        dataType: 'numeric',
        logicOperator: 'and'
      }],
      groupLogicOperator: 'and' as const,
      betweenGroupOperator: undefined
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

  // Advanced configuration
  const [advancedOpen, setAdvancedOpen] = useState(false)
  
  // Geographic zone configuration
  const [geographicZone, setGeographicZone] = useState('cualquier-lugar')
  const [zoneType, setZoneType] = useState('dentro')
  const [selectedZonesData, setSelectedZonesData] = useState([])
  const [advancedTags, setAdvancedTags] = useState<Array<{id: string, name: string, color: string}>>([])

  // Event generation timing
  const [eventTiming, setEventTiming] = useState('cumplan-condiciones')
  
  // Duration configuration
  const [durationValue, setDurationValue] = useState('41')
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
  const [instructions, setInstructions] = useState(rule?.eventSettings?.instructions || '')
  const [assignResponsible, setAssignResponsible] = useState(!!rule?.eventSettings?.responsible)
  const [eventIcon, setEventIcon] = useState(rule?.eventSettings?.icon || 'info')
  const [eventSeverity, setEventSeverity] = useState(rule?.eventSettings?.severity || 'low')
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
  const [webhookEnabled, setWebhookEnabled] = useState(false)
  const [sendDeviceCommand, setSendDeviceCommand] = useState(false)
  const [unitTagsEnabled, setUnitTagsEnabled] = useState(false)
  const [unitUntagsEnabled, setUnitUntagsEnabled] = useState(false)
  const [unitUntags, setUnitUntags] = useState<Array<{id: string, name: string, color: string}>>([])

  // Notifications tab state
  const defaultEventMessage = rule?.notifications?.eventMessage || 'La unidad {unidad} ha registrado una alerta en {ubicacion_link} a las {fecha_hora}.'
  const [eventMessage, setEventMessage] = useState(defaultEventMessage)
  const [eventMessageCharCount, setEventMessageCharCount] = useState(defaultEventMessage.length)
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
  const [showEmailPersonalizer, setShowEmailPersonalizer] = useState(false)
  const [customEmailMessage, setCustomEmailMessage] = useState(rule?.notifications?.email?.body || defaultEventMessage)
  const [selectedEmailTemplate, setSelectedEmailTemplate] = useState<string | null>(null)
  const [showUserTemplates, setShowUserTemplates] = useState(false)

  
  const [pushNotificationEnabled, setPushNotificationEnabled] = useState(rule?.notifications?.push?.enabled || false)
  const [showNotificationExample, setShowNotificationExample] = useState(false)
  const [notificationExampleType, setNotificationExampleType] = useState<'web' | 'mobile'>('web')
  
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

  // Email selector state
  const [inputValue, setInputValue] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Email validation function
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Calculate visible and hidden tags for email selector
  const maxVisibleTags = 2
  const visibleTags = emailRecipients.slice(0, maxVisibleTags)
  const hiddenTags = emailRecipients.slice(maxVisibleTags)

  // Email management functions
  const addEmail = (email: string) => {
    const trimmedEmail = email.trim()
    if (trimmedEmail && isValidEmail(trimmedEmail) && !emailRecipients.includes(trimmedEmail)) {
      setEmailRecipients(prev => [...prev, trimmedEmail])
      setInputValue('')
    }
  }

  const removeEmail = (emailToRemove: string) => {
    setEmailRecipients(prev => prev.filter(email => email !== emailToRemove))
  }

  const clearAllEmails = () => {
    setEmailRecipients([])
    setInputValue('')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      if (inputValue.trim()) {
        addEmail(inputValue.trim())
      }
    } else if (e.key === 'Backspace' && !inputValue && emailRecipients.length > 0) {
      // Remove last email if input is empty and backspace is pressed
      setEmailRecipients(prev => prev.slice(0, -1))
    }
  }

  // Optimized template selection handler
  const handleTemplateSelection = useCallback((template: UserEmailTemplate) => {
    setEmailRecipients(template.recipients)
    setEmailSubject(template.subject)
    setCustomEmailMessage(template.message)
    setSelectedEmailTemplate(template.id)
    setShowUserTemplates(false)
    setShowEmailPersonalizer(true)
  }, [])

  // Memoized template cards to prevent re-renders
  const templateCards = useMemo(() => 
    userEmailTemplates.map((template) => (
      <div
        key={template.id}
        className="border border-gray-200 rounded-lg p-3 bg-white hover:bg-gray-50 cursor-pointer transition-colors"
        onClick={() => handleTemplateSelection(template)}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h5 className="text-[13px] font-medium text-gray-800 truncate">{template.name}</h5>
              <Badge 
                variant={template.category === 'company' ? 'default' : template.category === 'shared' ? 'secondary' : 'outline'}
                className="text-[10px] px-1.5 py-0.5"
              >
                {template.category === 'company' ? 'Empresa' : 
                 template.category === 'shared' ? 'Compartida' : 
                 'Personal'}
              </Badge>
            </div>
            <p className="text-[11px] text-gray-600 line-clamp-2 mb-2">{template.description}</p>
            
            <div className="flex items-center justify-between text-[10px] text-gray-500">
              <div className="flex items-center gap-3">
                <span>Por: {template.createdBy}</span>
                <span>{template.createdAt}</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="w-3 h-3" />
                <span>{template.usageCount}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Vista previa compacta */}
        <div className="mt-2 pt-2 border-t border-gray-100">
          <div className="text-[10px] text-gray-500 space-y-1">
            <div><span className="font-medium">Para:</span> {template.recipients.slice(0, 2).join(', ')}{template.recipients.length > 2 ? ` +${template.recipients.length - 2}` : ''}</div>
            <div><span className="font-medium">Asunto:</span> {template.subject.length > 40 ? template.subject.substring(0, 40) + '...' : template.subject}</div>
            <div><span className="font-medium">Mensaje:</span> {template.message.length > 60 ? template.message.substring(0, 60) + '...' : template.message}</div>
          </div>
        </div>
      </div>
    )), [handleTemplateSelection])

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedText = e.clipboardData.getData('text')
    const emails = pastedText.split(/[,;\s]+/).filter(email => email.trim())
    
    emails.forEach(email => {
      const trimmedEmail = email.trim()
      if (isValidEmail(trimmedEmail) && !emailRecipients.includes(trimmedEmail)) {
        setEmailRecipients(prev => [...prev, trimmedEmail])
      }
    })
    setInputValue('')
  }

  const handleZonesChange = (zones) => {
    setSelectedZonesData(zones)
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
  }

  const handleTagsChange = (tags: TagData[]) => {
    setSelectedTags(tags)
  }

  // Effect to initialize form data when editing an existing rule
  useEffect(() => {
    if (rule && isEditing) {
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
        setAssignResponsible(!!rule.eventSettings.responsible)
        
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
          setEmailDescription(rule.notifications.email.body || rule.notifications.eventMessage || '')
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
      
      // Initialize appliesTo settings
      if (rule.appliesTo) {
        if (rule.appliesTo.type === 'units' && rule.appliesTo.units && rule.appliesTo.units.length > 0) {
          setAppliesTo('unidades-especificas')
          setSelectedUnitsLocal(rule.appliesTo.units || [])
        } else if (rule.appliesTo.type === 'tags' && rule.appliesTo.tags && rule.appliesTo.tags.length > 0) {
          setAppliesTo('etiquetas')
          setSelectedTags(rule.appliesTo.tags || [])
        } else {
          setAppliesTo('all-units')
        }
      }

      // Initialize geographic zone settings
      if (rule.zoneScope) {
        if (rule.zoneScope.type === 'all') {
          setGeographicZone('cualquier-lugar')
        } else if (rule.zoneScope.type === 'custom' && rule.zoneScope.zones) {
          setGeographicZone('zonas-especificas')
          setSelectedZonesData(rule.zoneScope.zones || [])
          setZoneType(rule.zoneScope.inside ? 'dentro' : 'fuera')
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

      // Initialize responsible assignment
      if (rule.eventSettings?.responsible) {
        setAssignResponsible(!!rule.eventSettings.responsible)
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
  }, [rule, isEditing])

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
      const newGroup: RuleConditionGroup = {
        id: `group-${Date.now()}`,
        conditions: [{
          id: `condition-${Date.now()}`,
          sensor: '',
          operator: '',
          value: '',
          dataType: 'numeric',
          logicOperator: 'and'
        }],
        groupLogicOperator: 'and',
        betweenGroupOperator: 'and'
      }
      setConditionGroups([...conditionGroups, newGroup])
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
      // For new rules, check if user has modified anything from the initial state
      const initialEmailRecipients = ['usuario@email.com', 'usuario@email.com', 'usuario@email.com']
      const initialEmailSubject = 'Alerta: {{ruleName}} ha registrado un evento desde {{vehicleName}}'
      const initialEmailDescription = 'Unidad {{vehicleName}} ha excedido el límite de velocidad en {{location}} a las {{timestamp}}'
      
      return !!(
        ruleName.trim() ||
        ruleDescription.trim() ||
        JSON.stringify(conditionGroups) !== JSON.stringify(initialConditionGroups) ||
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
        // webhookNotificationEnabled !== false ||
        platformNotificationEnabled !== false
      )
    }

    // For editing rules, compare with original values
    return !!(
      ruleName !== (rule?.name || '') ||
      ruleDescription !== (rule?.description || '') ||
      JSON.stringify(conditionGroups) !== JSON.stringify(rule?.conditionGroups || initialConditionGroups) ||
      instructions !== (rule?.eventSettings?.instructions || '') ||
      eventSeverity !== (rule?.eventSettings?.severity || 'medium') ||
      eventIcon !== (rule?.eventSettings?.icon || 'info') ||
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

  const handleSave = async () => {
    if (isEditing) {
      // For editing, save the changes directly using handleSaveRule
      setIsSaving(true)
      
      try {
        console.log('Saving edited rule with ID:', rule?.id)
        // Use the complete handleSaveRule logic for editing
        handleSaveRule({
          id: rule?.id,
          name: ruleName,
          description: ruleDescription
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
    } else if (appliesTo === 'unidades-especificas') {
      appliesToData = { type: 'units', units: selectedUnitsLocal }
    } else if (appliesTo === 'etiquetas') {
      appliesToData = { type: 'tags', tags: selectedTags }
    }

    // Build zoneScope object based on current form state
    let zoneScopeData: any = { type: 'all' }
    if (geographicZone === 'cualquier-lugar') {
      zoneScopeData = { type: 'all' }
    } else if (geographicZone === 'zonas-especificas') {
      zoneScopeData = { 
        type: 'custom', 
        zones: selectedZonesData,
        inside: zoneType === 'dentro'
      }
    }

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
      name: ruleName,
      description: ruleDescription,
      conditions: flattenedConditions, // For backward compatibility
      conditionGroups: validConditionGroups, // New grouped structure
      appliesTo: appliesToData,
      zoneScope: zoneScopeData,
      schedule: scheduleData,
      closePolicy: closePolicyData,
      eventSettings: {
        instructions: instructions,
        responsible: assignResponsible ? 'supervisor-flota' : '',
        severity: eventSeverity,
        icon: eventIcon,
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
          body: showEmailPersonalizer ? customEmailMessage : (emailDescription || eventMessage),
          customMessage: showEmailPersonalizer ? customEmailMessage : undefined,
          useCustomMessage: showEmailPersonalizer
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
      severity: eventSeverity
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

  const handleNextStep = () => {
    if (currentTabIndex < tabs.length - 1) {
      setActiveTab(tabs[currentTabIndex + 1])
    }
  }



  // Tab states
  const tabs = ['parameters', 'actions', 'notifications']
  const currentTabIndex = tabs.indexOf(activeTab)
  const isFirstTab = currentTabIndex === 0
  const isLastTab = currentTabIndex === tabs.length - 1

  return (
    <TooltipProvider>
      <div className="flex-1 flex flex-col overflow-hidden bg-background relative">
        {/* Header */}
        <div className="border-b border-border bg-background px-6 py-4">
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
                  Telemetría
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
        <div className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="pb-6">
              <TabsList className="sticky top-0 bg-white border-b border-gray-200 w-full justify-start h-auto p-0 space-x-8 z-10">
                <TabsTrigger 
                  value="parameters" 
                  className={`bg-transparent border-0 rounded-none px-0 py-3 text-[14px] border-b-2 border-transparent data-[state=active]:border-blue-600 pointer-events-none ${
                    currentTabIndex >= 0 ? 'text-blue-600' : 'text-gray-500'
                  }`}
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
                  className={`bg-transparent border-0 rounded-none px-0 py-3 text-[14px] border-b-2 border-transparent data-[state=active]:border-blue-600 pointer-events-none ${
                    currentTabIndex >= 1 ? 'text-blue-600' : 'text-gray-500'
                  }`}
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
                  className={`bg-transparent border-0 rounded-none px-0 py-3 text-[14px] border-b-2 border-transparent data-[state=active]:border-blue-600 pointer-events-none ${
                    currentTabIndex >= 2 ? 'text-blue-600' : 'text-gray-500'
                  }`}
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
                <div
                  className="bg-white border border-gray-200 rounded-lg p-4"
                  style={{
                    background: "var(--color-bg-base)",
                    border: "1px solid var(--color-gray-200)",
                    borderRadius: toPx(radii.base),
                    padding: toPx(spacing.sm),
                  }}
                >
                  <div style={{ display: 'flex', gap: toPx(spacing.xs) }}>
                    <Gauge className="h-4 w-4 mt-1" style={{ color: "var(--color-gray-600)" }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <Title level={5} style={{ margin: 0, fontSize: "14px", color: "var(--color-gray-700)" }}>
                        Parámetros a evaluar
                      </Title>
                      <Paragraph style={{ margin: 0, color: "var(--color-gray-600)", fontSize: "14px" }}>
                        ¿Qué condiciones evalúa esta regla?
                      </Paragraph>
                    </div>
                  </div>
                  {conditionGroups.length > 0 && conditionGroups.some(g => g.conditions.length > 0) && (
                    <div
                      style={{
                        borderBottom: "1px solid var(--color-gray-200)",
                        marginBlock: toPx(spacing.sm),
                        marginInline: "calc(-1 * var(--size-sm))",
                      }}
                    />
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
                          />
                          
                          {/* Between groups operator - only show between group 1 and 2 */}
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
                                  {conditionGroups[1]?.betweenGroupOperator === 'and' || !conditionGroups[1]?.betweenGroupOperator ? 'Ambos grupos deben cumplirse' : 'Todas'}
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
                                  {conditionGroups[1]?.betweenGroupOperator === 'or' ? 'Al menos un grupo debe cumplirse' : 'Cualquiera'}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}

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
                    </div>
                  </DndProvider>

                  {/* Rule Summary */}
                  {conditionGroups.some(group => group.conditions.some(c => c.sensor && c.operator && c.value)) && (
                    <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Info className="h-4 w-4 text-gray-600" />
                        <h4 className="text-[14px] font-medium text-gray-700">Resumen de la regla</h4>
                      </div>
                      <div className="text-[14px] text-gray-600">
                        {(() => {
                          const validGroups = conditionGroups.map(group => ({
                            ...group,
                            conditions: group.conditions.filter(c => c.sensor && c.operator && c.value)
                          })).filter(group => group.conditions.length > 0)

                          if (validGroups.length === 0) return "Configura las condiciones para ver el resumen"
                          
                          return (
                            <div className="space-y-4">
                              {validGroups.map((group, groupIndex) => {
                                const groupNumber = groupIndex + 1
                                const logicText = group.groupLogicOperator === 'and' ? (
                                  <>
                                    <span className="text-blue-600">todas</span> estas condiciones se cumplen
                                  </>
                                ) : (
                                  <>
                                    <span className="text-amber-500">cualquiera</span> de estas condiciones se cumple
                                  </>
                                )
                                
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
                                        
                                        let operatorSymbol = ""
                                        switch (condition.operator) {
                                          case 'eq': operatorSymbol = "="; break
                                          case 'gte': operatorSymbol = "≥"; break
                                          case 'gt': operatorSymbol = ">"; break
                                          case 'lte': operatorSymbol = "≤"; break
                                          case 'lt': operatorSymbol = "<"; break
                                          case 'neq': operatorSymbol = "≠"; break
                                          default: operatorSymbol = "="
                                        }
                                        
                                        // Format value based on sensor dataType
                                        let displayValue = condition.value
                                        if (sensor.dataType === 'boolean' || sensor.dataType === 'string') {
                                          // Find the option label for boolean/string sensors
                                          const option = sensor.options?.find(opt => opt.value === condition.value)
                                          displayValue = option ? option.label : condition.value
                                        } else {
                                          // For numeric sensors, add unit if available
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

                {/* Apply this rule to */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Truck className="h-4 w-4 text-gray-600" />
                    <h3 className="text-[14px] font-medium text-gray-700">Aplica esta regla a</h3>
                  </div>
                  <p className="text-[14px] text-gray-600 mb-4">
                    Elige a cuáles unidades o etiquetas esta regla debe aplicar
                  </p>
                  <div className="-mx-4 border-b border-gray-200 mb-4"></div>
                  
                  <div className="space-y-4">
                    {/* Main selector */}
                    <div className="grid grid-cols-2 gap-8 items-center">
                      <div>
                        <label className="text-[14px] font-medium text-gray-700">¿A qué unidades aplicará la regla?</label>
                      </div>
                      <div>
                        <Select value={appliesTo} onValueChange={setAppliesTo}>
                          <SelectTrigger className="w-full text-[14px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="text-[14px]">
                            <SelectItem value="all-units">Todas las unidades</SelectItem>
                            <SelectItem value="custom">Personalizado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Conditional selectors */}
                    {appliesTo === 'custom' && (
                      <>
                        {/* Unidades */}
                        <div className="grid grid-cols-2 gap-8 items-center">
                          <div>
                            <div className="flex items-center gap-2">
                              <Truck className="h-4 w-4 text-gray-600" />
                              <label className="text-[14px] font-medium text-gray-700">Unidades</label>
                            </div>
                          </div>
                          <div>
                            <UnidadesSelectorInput
                              selectedUnits={selectedUnitsLocal}
                              onSelectionChange={handleUnitsChange}
                              placeholder="Seleccionar unidades"
                            />
                          </div>
                        </div>

                        {/* Etiquetas */}
                        <div className="grid grid-cols-2 gap-8 items-center">
                          <div>
                            <div className="flex items-center gap-2">
                              <Tag className="h-4 w-4 text-gray-600" />
                              <label className="text-[14px] font-medium text-gray-700">Etiquetas</label>
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
                              multiSelect={true}
                              showColorPills={true}
                              showPillsDisplay={true}
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Advanced Configuration */}
                <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <CollapsibleTrigger className="w-full">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <Settings className="h-4 w-4 text-gray-600" />
                          <h3 className="text-[14px] font-medium text-gray-700">Configuración avanzada</h3>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${advancedOpen ? 'rotate-180' : ''}`} />
                      </div>
                      <p className="text-[14px] text-gray-600 text-left mt-2">
                        Personaliza aún más tu regla definiendo lugares, horarios y otras configuraciones
                      </p>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-6">
                      {/* Header - Left aligned with first column labels */}


                      {/* Main content grid */}
                      <div className="space-y-6">
                        {/* Section 1 – Geographic zone */}
                        <div className="grid grid-cols-2 gap-8 items-start">
                          <div>
                            <div className="flex items-center gap-2 mb-4">
                              <MapPin className="h-4 w-4 text-gray-600" />
                              <label className="text-[14px] font-medium text-gray-700">¿En qué zona geográfica aplica esta regla?</label>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <Select value={geographicZone} onValueChange={setGeographicZone}>
                              <SelectTrigger className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="cualquier-lugar">En cualquier lugar</SelectItem>
                                <SelectItem value="dentro-zona">Dentro de una zona o grupo de zonas</SelectItem>
                                <SelectItem value="fuera-zona">Fuera de una zona o grupo de zonas</SelectItem>
                              </SelectContent>
                            </Select>

                          </div>
                        </div>

                        {/* Section 2 – Zonas */}
                        {(geographicZone === 'dentro-zona' || geographicZone === 'fuera-zona') && (
                          <div className="grid grid-cols-2 gap-8 items-center">
                            <div>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-gray-600" />
                                <label className="text-[14px] font-medium text-gray-700">Zonas</label>
                              </div>
                            </div>
                            <div className="space-y-4">
                              <ZonasSelectorInput
                                selectedZones={selectedZonesData.map(zone => ({ 
                                  id: zone.id, 
                                  name: zone.name, 
                                  type: zone.type,
                                  description: zone.description
                                }))}
                                onSelectionChange={handleZonesChange}
                                placeholder="Selecciona una zona"
                              />
                            </div>
                          </div>
                        )}

                        {/* Section 3 – Tags */}
                        {(geographicZone === 'dentro-zona' || geographicZone === 'fuera-zona') && (
                          <div className="grid grid-cols-2 gap-8 items-center">
                            <div>
                              <div className="flex items-center gap-2">
                                <Tag className="h-4 w-4 text-gray-600" />
                                <label className="text-[14px] font-medium text-gray-700">Etiquetas</label>
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
                                selectedItems={advancedTags}
                                onSelectionChange={(items) => {
                                  if (items.length <= 10) {
                                    setAdvancedTags(items)
                                    setHasUnsavedChanges(true)
                                  }
                                }}
                                placeholder="Seleccionar etiquetas"
                                title="Etiquetas de configuración avanzada"
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
                              />
                            </div>
                          </div>
                        )}

                        {/* Section 3 – Event moment */}
                        <div className="grid grid-cols-2 gap-8 items-center">
                          <div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-gray-600" />
                              <label className="text-[14px] font-medium text-gray-700">¿En qué momento se debe generar el evento?</label>
                            </div>
                          </div>
                          <div>
                            <Select value={eventTiming} onValueChange={setEventTiming}>
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

                        {/* Section 3B – Duration configuration (conditional) */}
                        {eventTiming === 'despues-tiempo' && (
                          <div className="grid grid-cols-2 gap-8 items-center">
                            <div>
                              <label className="text-[14px] font-medium text-gray-700">Duración</label>
                            </div>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min="1"
                                max="9999"
                                value={durationValue}
                                onChange={(e) => setDurationValue(e.target.value)}
                                className="w-20"
                                placeholder="41"
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
                          </div>
                        )}

                        {/* Duration example text (conditional) */}
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

                        {/* Section 4  Rule activity period */}
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

                        {/* Section 5 – Days of the week (table layout) */}
                        {ruleSchedule === 'personalizado' && (
                          <div className="mt-6">
                            <div className="space-y-4">
                              {Object.entries(scheduleConfig).map(([day, config]) => {
                                const dayLabels = {
                                  lunes: 'Lunes',
                                  martes: 'Martes', 
                                  miercoles: 'Miércoles',
                                  jueves: 'Jueves',
                                  viernes: 'Viernes',
                                  sabado: 'Sábado',
                                  domingo: 'Domingo'
                                }
                                
                                return (
                                  <div key={day} className="grid grid-cols-4 gap-4 items-center">
                                    {/* Column 1: Checkbox + day name (aligned with labels in first column) */}
                                    <div className="flex items-center space-x-3">
                                      <Checkbox
                                        checked={config.enabled}
                                        onCheckedChange={(checked) => updateDaySchedule(day, 'enabled', checked)}
                                      />
                                      <label className="text-[14px] text-gray-700 font-medium">
                                        {dayLabels[day]}
                                      </label>
                                    </div>
                                    
                                    {/* Column 2: Start time input (aligned with second column of dropdowns) */}
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
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    
                                    {/* Column 3: End time input (aligned directly to the right of column 2) */}
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
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    
                                    {/* Column 4: Condition dropdown (aligned with rightmost dropdown position) */}
                                    <div>
                                      <Select
                                        value={config.scope}
                                        onValueChange={(value) => updateDaySchedule(day, 'scope', value)}
                                      >
                                        <SelectTrigger className="w-full">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="dentro">Dentro de este horario</SelectItem>
                                          <SelectItem value="fuera">Fuera de este horario</SelectItem>
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
              </TabsContent>

              <TabsContent value="actions" className="mt-6 space-y-6">
                {/* Section 1 - Instrucciones a realizar */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ClipboardList className="h-4 w-4 text-gray-600" />
                    <h3 className="text-[14px] font-medium text-gray-700">Instrucciones a realizar</h3>
                  </div>
                  <p className="text-[14px] text-gray-600 mb-4">
                    Instrucciones a realizar cuando se genere un evento
                  </p>
                  <div className="-mx-4 border-b border-gray-200 mb-4"></div>
                  
                  <div className="grid grid-cols-2 gap-8 items-start">
                    <div>
                      <label className="text-[14px] font-medium text-gray-700">
                        ¿Qué debe realizar el usuario que atienda este evento?
                      </label>
                    </div>
                    <div>
                      <Textarea
                        placeholder="Agregar instrucciones"
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        className="min-h-[80px] resize-y"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2 - Asignar responsable al evento */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-gray-600" />
                      <h3 className="text-[14px] font-medium text-gray-700">Asignar responsable al evento</h3>
                    </div>
                    <Switch
                      checked={assignResponsible}
                      onCheckedChange={setAssignResponsible}
                      className="switch-blue"
                    />
                  </div>
                  <p className="text-[14px] text-gray-600 mb-4">
                    Selecciona el usuario al que se asignará cuando los eventos ocurran
                  </p>
                  {assignResponsible && (
                    <div className="-mx-4 border-b border-gray-200 mb-4"></div>
                  )}
                  
                  {assignResponsible && (
                    <div className="grid grid-cols-2 gap-8 items-center">
                      <div>
                        <label className="text-[14px] font-medium text-gray-700">
                          <span className="text-red-500">*</span> Asignar responsable
                        </label>
                      </div>
                      <div className="relative">
                        <SearchableUserSelect 
                          defaultValue="mariana.manzo@numaris.com"
                          users={[
                            { 
                              value: 'mariana.manzo@numaris.com', 
                              label: 'Mariana Manzo', 
                              email: 'mariana.manzo@numaris.com',
                              avatar: 'https://images.unsplash.com/photo-1652471949169-9c587e8898cd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHdvbWFuJTIwcHJvZmVzc2lvbmFsJTIwaGVhZHNob3R8ZW58MXx8fHwxNzU4NjIzODAyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
                            },
                            { 
                              value: 'juan.perez@numaris.com', 
                              label: 'Juan Pérez', 
                              email: 'juan.perez@numaris.com',
                              avatar: 'https://images.unsplash.com/photo-1652471943570-f3590a4e52ed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMG1hbiUyMHByb2Zlc3Npb25hbCUyMGhlYWRzaG90fGVufDF8fHx8MTc1ODYwNDk4M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
                            },
                            { 
                              value: 'ana.garcia@numaris.com', 
                              label: 'Ana García', 
                              email: 'ana.garcia@numaris.com',
                              avatar: 'https://images.unsplash.com/photo-1581065178047-8ee15951ede6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMGJ1c2luZXNzJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzU4NjE2NTgwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
                            },
                            { 
                              value: 'carlos.rodriguez@numaris.com', 
                              label: 'Carlos Rodríguez', 
                              email: 'carlos.rodriguez@numaris.com',
                              avatar: 'https://images.unsplash.com/photo-1752778935828-bf6fdd5a834a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3Jwb3JhdGUlMjBleGVjdXRpdmUlMjBoZWFkc2hvdCUyMGxhdGlub3xlbnwxfHx8fDE3NTg2NTExNzR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
                            },
                            { 
                              value: 'supervisor-flota', 
                              label: 'Supervisor de Flota', 
                              email: 'supervisor@numaris.com',
                              avatar: 'https://images.unsplash.com/photo-1524538198441-241ff79d153b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMGV4ZWN1dGl2ZSUyMHByb2Zlc3Npb25hbCUyMG1hbnxlbnwxfHx8fDE3NTg2NTExODF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
                            }
                          ]}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 3 - Clasificación del evento */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-gray-600" />
                    <h3 className="text-[14px] font-medium text-gray-700">Clasificación del evento</h3>
                  </div>
                  <p className="text-[14px] text-gray-600 mb-4">
                    Configura la información básica del evento que genera la regla
                  </p>
                  <div className="-mx-4 border-b border-gray-200 mb-4"></div>
                  
                  <div className="space-y-6">
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
                              {eventIcon ? (
                                <div className="flex items-center gap-2">
                                  {eventIcon === 'info' && <Info className="h-4 w-4" />}
                                  {eventIcon === 'warning' && <AlertTriangle className="h-4 w-4" />}
                                  {eventIcon === 'alert' && <AlertCircle className="h-4 w-4" />}
                                  {eventIcon === 'critical' && <AlertOctagon className="h-4 w-4" />}
                                  {eventIcon === 'thermometer' && <Thermometer className="h-4 w-4" />}
                                  {eventIcon === 'zap' && <Zap className="h-4 w-4" />}
                                  {eventIcon === 'fuel' && <Fuel className="h-4 w-4" />}
                                  {eventIcon === 'shield' && <Shield className="h-4 w-4" />}
                                  {eventIcon === 'lock' && <Lock className="h-4 w-4" />}
                                  {eventIcon === 'unlock' && <Unlock className="h-4 w-4" />}
                                  {eventIcon === 'key' && <Key className="h-4 w-4" />}
                                  {eventIcon === 'eye' && <Eye className="h-4 w-4" />}
                                  {eventIcon === 'eyeoff' && <EyeOff className="h-4 w-4" />}
                                  {eventIcon === 'signal' && <Signal className="h-4 w-4" />}
                                  {eventIcon === 'wifi' && <Wifi className="h-4 w-4" />}
                                  {eventIcon === 'battery' && <Battery className="h-4 w-4" />}
                                  {eventIcon === 'batterylow' && <BatteryLow className="h-4 w-4" />}
                                  {eventIcon === 'navigation' && <Navigation className="h-4 w-4" />}
                                  {eventIcon === 'target' && <Target className="h-4 w-4" />}
                                  {eventIcon === 'activity' && <Activity className="h-4 w-4" />}
                                  {eventIcon === 'radio' && <Radio className="h-4 w-4" />}
                                  {eventIcon === 'satellite' && <Satellite className="h-4 w-4" />}
                                  {eventIcon === 'power' && <Power className="h-4 w-4" />}
                                  {eventIcon === 'smartphone' && <Smartphone className="h-4 w-4" />}
                                  {eventIcon === 'monitor' && <Monitor className="h-4 w-4" />}
                                  {eventIcon === 'car' && <Car className="h-4 w-4" />}
                                  {eventIcon === 'plane' && <Plane className="h-4 w-4" />}
                                  {eventIcon === 'ship' && <Ship className="h-4 w-4" />}
                                  {eventIcon === 'train' && <Train className="h-4 w-4" />}
                                  {eventIcon === 'bike' && <Bike className="h-4 w-4" />}
                                  {eventIcon === 'bus' && <Bus className="h-4 w-4" />}
                                  {eventIcon === 'home' && <Home className="h-4 w-4" />}
                                  {eventIcon === 'building' && <Building className="h-4 w-4" />}
                                  {eventIcon === 'factory' && <Factory className="h-4 w-4" />}
                                  {eventIcon === 'wrench' && <Wrench className="h-4 w-4" />}
                                  {eventIcon === 'cog' && <Cog className="h-4 w-4" />}
                                  {eventIcon === 'database' && <Database className="h-4 w-4" />}
                                  {eventIcon === 'harddrive' && <HardDrive className="h-4 w-4" />}
                                  {eventIcon === 'cpu' && <Cpu className="h-4 w-4" />}
                                  {eventIcon === 'memorystick' && <MemoryStick className="h-4 w-4" />}
                                  {eventIcon === 'router' && <Router className="h-4 w-4" />}
                                  {eventIcon === 'globe' && <Globe className="h-4 w-4" />}
                                  {eventIcon === 'cloud' && <Cloud className="h-4 w-4" />}
                                  {eventIcon === 'sun' && <Sun className="h-4 w-4" />}
                                  {eventIcon === 'moon' && <Moon className="h-4 w-4" />}
                                  {eventIcon === 'star' && <Star className="h-4 w-4" />}
                                  {eventIcon === 'heart' && <Heart className="h-4 w-4" />}
                                  {eventIcon === 'checkcircle' && <CheckCircle className="h-4 w-4" />}
                                  {eventIcon === 'xsquare' && <XSquare className="h-4 w-4" />}
                                  {eventIcon === 'triangle' && <Triangle className="h-4 w-4" />}
                                  {eventIcon === 'square' && <Square className="h-4 w-4" />}
                                  {eventIcon === 'circle' && <Circle className="h-4 w-4" />}
                                  {eventIcon === 'diamond' && <Diamond className="h-4 w-4" />}
                                  {eventIcon === 'hexagon' && <Hexagon className="h-4 w-4" />}
                                  {eventIcon === 'pentagon' && <Pentagon className="h-4 w-4" />}

                                </div>
                              ) : (
                                <span>Seleccionar icono</span>
                              )}
                              <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-96 p-4" align="start">
                            <div className="grid grid-cols-10 gap-2">
                              {[
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
                                { id: 'square', icon: Square }
                              ].map(({ id, icon: IconComponent }) => (
                                <button
                                  key={id}
                                  type="button"
                                  onClick={() => setEventIcon(id)}
                                  className={`p-2 rounded border transition-all ${
                                    eventIcon === id
                                      ? 'bg-blue-500 border-blue-500 text-white'
                                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-100'
                                  }`}
                                >
                                  <IconComponent className="h-4 w-4" />
                                </button>
                              ))}
                            </div>
                          </PopoverContent>
                        </Popover>
                        <Select value={eventSeverity} onValueChange={setEventSeverity}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Seleccionar severidad">
                              {eventSeverity && severityConfig[eventSeverity] && (
                                <div className="flex items-center gap-2">
                                  <Badge 
                                    className={`${severityConfig[eventSeverity].bgColor} ${severityConfig[eventSeverity].textColor} ${severityConfig[eventSeverity].borderColor} border text-[12px] px-2 py-1 flex items-center gap-1`}
                                  >
                                    {eventIcon && (
                                      <>
                                        {eventIcon === 'info' && <Info className="h-3 w-3" />}
                                        {eventIcon === 'warning' && <AlertTriangle className="h-3 w-3" />}
                                        {eventIcon === 'alert' && <AlertCircle className="h-3 w-3" />}
                                        {eventIcon === 'critical' && <AlertOctagon className="h-3 w-3" />}
                                        {eventIcon === 'thermometer' && <Thermometer className="h-3 w-3" />}
                                        {eventIcon === 'zap' && <Zap className="h-3 w-3" />}
                                        {eventIcon === 'fuel' && <Fuel className="h-3 w-3" />}
                                        {eventIcon === 'shield' && <Shield className="h-3 w-3" />}
                                        {eventIcon === 'lock' && <Lock className="h-3 w-3" />}
                                        {eventIcon === 'unlock' && <Unlock className="h-3 w-3" />}
                                        {eventIcon === 'key' && <Key className="h-3 w-3" />}
                                        {eventIcon === 'eye' && <Eye className="h-3 w-3" />}
                                        {eventIcon === 'eyeoff' && <EyeOff className="h-3 w-3" />}
                                        {eventIcon === 'signal' && <Signal className="h-3 w-3" />}
                                        {eventIcon === 'wifi' && <Wifi className="h-3 w-3" />}
                                        {eventIcon === 'battery' && <Battery className="h-3 w-3" />}
                                        {eventIcon === 'batterylow' && <BatteryLow className="h-3 w-3" />}
                                        {eventIcon === 'navigation' && <Navigation className="h-3 w-3" />}
                                        {eventIcon === 'target' && <Target className="h-3 w-3" />}
                                        {eventIcon === 'activity' && <Activity className="h-3 w-3" />}
                                        {eventIcon === 'radio' && <Radio className="h-3 w-3" />}
                                        {eventIcon === 'satellite' && <Satellite className="h-3 w-3" />}
                                        {eventIcon === 'power' && <Power className="h-3 w-3" />}
                                        {eventIcon === 'smartphone' && <Smartphone className="h-3 w-3" />}
                                        {eventIcon === 'monitor' && <Monitor className="h-3 w-3" />}
                                        {eventIcon === 'car' && <Car className="h-3 w-3" />}
                                        {eventIcon === 'plane' && <Plane className="h-3 w-3" />}
                                        {eventIcon === 'ship' && <Ship className="h-3 w-3" />}
                                        {eventIcon === 'train' && <Train className="h-3 w-3" />}
                                        {eventIcon === 'bike' && <Bike className="h-3 w-3" />}
                                        {eventIcon === 'bus' && <Bus className="h-3 w-3" />}
                                        {eventIcon === 'home' && <Home className="h-3 w-3" />}
                                        {eventIcon === 'building' && <Building className="h-3 w-3" />}
                                        {eventIcon === 'factory' && <Factory className="h-3 w-3" />}
                                        {eventIcon === 'wrench' && <Wrench className="h-3 w-3" />}
                                        {eventIcon === 'cog' && <Cog className="h-3 w-3" />}
                                        {eventIcon === 'database' && <Database className="h-3 w-3" />}
                                        {eventIcon === 'harddrive' && <HardDrive className="h-3 w-3" />}
                                        {eventIcon === 'cpu' && <Cpu className="h-3 w-3" />}
                                        {eventIcon === 'memorystick' && <MemoryStick className="h-3 w-3" />}
                                        {eventIcon === 'router' && <Router className="h-3 w-3" />}
                                        {eventIcon === 'globe' && <Globe className="h-3 w-3" />}
                                        {eventIcon === 'cloud' && <Cloud className="h-3 w-3" />}
                                        {eventIcon === 'sun' && <Sun className="h-3 w-3" />}
                                        {eventIcon === 'moon' && <Moon className="h-3 w-3" />}
                                        {eventIcon === 'star' && <Star className="h-3 w-3" />}
                                        {eventIcon === 'heart' && <Heart className="h-3 w-3" />}
                                        {eventIcon === 'checkcircle' && <CheckCircle className="h-3 w-3" />}
                                        {eventIcon === 'xsquare' && <XSquare className="h-3 w-3" />}
                                        {eventIcon === 'triangle' && <Triangle className="h-3 w-3" />}
                                        {eventIcon === 'square' && <Square className="h-3 w-3" />}
                                      </>
                                    )}
                                    {severityConfig[eventSeverity].label}
                                  </Badge>
                                </div>
                              )}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {['high', 'medium', 'low', 'informative'].map((severity) => (
                              <SelectItem key={severity} value={severity}>
                                <div className="flex items-center gap-2 w-full">
                                  <Badge 
                                    className={`${severityConfig[severity].bgColor} ${severityConfig[severity].textColor} ${severityConfig[severity].borderColor} border text-[12px] px-2 py-1 flex items-center gap-1`}
                                  >
                                    {eventIcon && (
                                      <>
                                        {eventIcon === 'info' && <Info className="h-3 w-3" />}
                                        {eventIcon === 'warning' && <AlertTriangle className="h-3 w-3" />}
                                        {eventIcon === 'alert' && <AlertCircle className="h-3 w-3" />}
                                        {eventIcon === 'critical' && <AlertOctagon className="h-3 w-3" />}
                                        {eventIcon === 'thermometer' && <Thermometer className="h-3 w-3" />}
                                        {eventIcon === 'zap' && <Zap className="h-3 w-3" />}
                                        {eventIcon === 'fuel' && <Fuel className="h-3 w-3" />}
                                        {eventIcon === 'shield' && <Shield className="h-3 w-3" />}
                                        {eventIcon === 'lock' && <Lock className="h-3 w-3" />}
                                        {eventIcon === 'unlock' && <Unlock className="h-3 w-3" />}
                                        {eventIcon === 'key' && <Key className="h-3 w-3" />}
                                        {eventIcon === 'eye' && <Eye className="h-3 w-3" />}
                                        {eventIcon === 'eyeoff' && <EyeOff className="h-3 w-3" />}
                                        {eventIcon === 'signal' && <Signal className="h-3 w-3" />}
                                        {eventIcon === 'wifi' && <Wifi className="h-3 w-3" />}
                                        {eventIcon === 'battery' && <Battery className="h-3 w-3" />}
                                        {eventIcon === 'batterylow' && <BatteryLow className="h-3 w-3" />}
                                        {eventIcon === 'navigation' && <Navigation className="h-3 w-3" />}
                                        {eventIcon === 'target' && <Target className="h-3 w-3" />}
                                        {eventIcon === 'activity' && <Activity className="h-3 w-3" />}
                                        {eventIcon === 'radio' && <Radio className="h-3 w-3" />}
                                        {eventIcon === 'satellite' && <Satellite className="h-3 w-3" />}
                                        {eventIcon === 'power' && <Power className="h-3 w-3" />}
                                        {eventIcon === 'smartphone' && <Smartphone className="h-3 w-3" />}
                                        {eventIcon === 'monitor' && <Monitor className="h-3 w-3" />}
                                        {eventIcon === 'car' && <Car className="h-3 w-3" />}
                                        {eventIcon === 'plane' && <Plane className="h-3 w-3" />}
                                        {eventIcon === 'ship' && <Ship className="h-3 w-3" />}
                                        {eventIcon === 'train' && <Train className="h-3 w-3" />}
                                        {eventIcon === 'bike' && <Bike className="h-3 w-3" />}
                                        {eventIcon === 'bus' && <Bus className="h-3 w-3" />}
                                        {eventIcon === 'home' && <Home className="h-3 w-3" />}
                                        {eventIcon === 'building' && <Building className="h-3 w-3" />}
                                        {eventIcon === 'factory' && <Factory className="h-3 w-3" />}
                                        {eventIcon === 'wrench' && <Wrench className="h-3 w-3" />}
                                        {eventIcon === 'cog' && <Cog className="h-3 w-3" />}
                                        {eventIcon === 'database' && <Database className="h-3 w-3" />}
                                        {eventIcon === 'harddrive' && <HardDrive className="h-3 w-3" />}
                                        {eventIcon === 'cpu' && <Cpu className="h-3 w-3" />}
                                        {eventIcon === 'memorystick' && <MemoryStick className="h-3 w-3" />}
                                        {eventIcon === 'router' && <Router className="h-3 w-3" />}
                                        {eventIcon === 'globe' && <Globe className="h-3 w-3" />}
                                        {eventIcon === 'cloud' && <Cloud className="h-3 w-3" />}
                                        {eventIcon === 'sun' && <Sun className="h-3 w-3" />}
                                        {eventIcon === 'moon' && <Moon className="h-3 w-3" />}
                                        {eventIcon === 'star' && <Star className="h-3 w-3" />}
                                        {eventIcon === 'heart' && <Heart className="h-3 w-3" />}
                                        {eventIcon === 'checkcircle' && <CheckCircle className="h-3 w-3" />}
                                        {eventIcon === 'xsquare' && <XSquare className="h-3 w-3" />}
                                        {eventIcon === 'triangle' && <Triangle className="h-3 w-3" />}
                                        {eventIcon === 'square' && <Square className="h-3 w-3" />}
                                      </>
                                    )}
                                    {severityConfig[severity].label}
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                  </div>
                </div>

                {/* Section 4 - Cierre del evento */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="h-4 w-4 text-gray-600" />
                    <h3 className="text-[14px] font-medium text-gray-700">Cierre del evento</h3>
                  </div>
                  <p className="text-[14px] text-gray-600 mb-4">
                    Configura la información básica del evento que genera la regla
                  </p>
                  <div className="-mx-4 border-b border-gray-200 mb-4"></div>
                  
                  <div className="space-y-6">
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
                      <div className="grid grid-cols-2 gap-8 items-center">
                        <div>
                          <label className="text-[14px] font-medium text-gray-700">
                            <span className="text-red-500">*</span> Después de cuánto tiempo se debe cerrar
                          </label>
                        </div>
                        <div className="flex gap-4">
                          <Input
                            type="number"
                            value={closureTimeValue}
                            onChange={(e) => setClosureTimeValue(e.target.value)}
                            className="w-20"
                            min="1"
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
                      </div>
                    )}
                  </div>
                </div>

                {/* Section 5 - Asignar etiqueta a la unidad */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-gray-600" />
                      <h3 className="text-[14px] font-medium text-gray-700">Asignar etiqueta a la unidad</h3>
                    </div>
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
                  </div>
                  <p className="text-[14px] text-gray-600 mb-4">
                    Selecciona la etiqueta que se le asignará a la unidad cuando ocurra el evento
                  </p>
                  
                  {unitTagsEnabled && (
                    <>
                      <div className="-mx-4 border-b border-gray-200 mb-4"></div>
                      
                      <div className="space-y-6">
                        {/* Row 1: Etiquetas para la unidad */}
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-8 items-start">
                            <div>
                              <label className="text-[14px] font-medium text-gray-700">Asigna una etiqueta a la unidad</label>
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
                      </div>
                    </>
                  )}
                </div>

                {/* Section 5.1 - Desasignar etiqueta a la unidad */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-gray-600" />
                      <h3 className="text-[14px] font-medium text-gray-700">Desasignar etiqueta a la unidad</h3>
                    </div>
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
                  </div>
                  <p className="text-[14px] text-gray-600 mb-4">
                    Selecciona la etiqueta que se le desasignará a la unidad cuando ocurra el evento
                  </p>
                  
                  {unitUntagsEnabled && (
                    <>
                      <div className="-mx-4 border-b border-gray-200 mb-4"></div>
                      
                      <div className="space-y-6">
                        {/* Row 1: Etiquetas para desasignar de la unidad */}
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-8 items-start">
                            <div>
                              <label className="text-[14px] font-medium text-gray-700">Desasigna una etiqueta de la unidad</label>
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
                                title="Etiquetas para desasignar de la unidad"
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
                            <strong>Nota:</strong> Las etiquetas seleccionadas serán removidas de la unidad cuando ocurra el evento.<br />
                            En caso que la etiqueta no esté asociada a la unidad, no se realizará ninguna acción.
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Section 6 - Enviar comando al dispositivo */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-gray-600" />
                      <h3 className="text-[14px] font-medium text-gray-700">Enviar comando al dispositivo</h3>
                    </div>
                    <Switch
                      checked={sendDeviceCommand}
                      onCheckedChange={setSendDeviceCommand}
                      disabled={true}
                      className="switch-blue"
                    />
                  </div>
                  <p className="text-[14px] text-gray-600 mb-4">
                    Seleccionar como se notificará a usuarios cuando este evento ocurra. Puedes seleccionar múltiples opciones
                  </p>
                  {sendDeviceCommand && (
                    <div className="-mx-4 border-b border-gray-200 mb-4"></div>
                  )}
                  
                  {sendDeviceCommand && (
                    <div className="grid grid-cols-2 gap-8 items-center">
                      <div>
                        <label className="text-[14px] font-medium text-gray-700">
                          * Seleccionar comando a enviar
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
                </div>
              </TabsContent>

              <TabsContent value="notifications" className="mt-6 space-y-6">
                {/* Section 1 - Mensaje del evento */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Bell className="h-4 w-4 text-gray-600" />
                    <h3 className="text-[14px] font-medium text-gray-700">Mensaje del evento</h3>
                  </div>
                  <p className="text-[14px] text-gray-600 mb-4">
                    Redacta el mensaje que se enviará cuando ocurra este evento. Puedes usar variables para personalizar el contenido.
                  </p>
                  <div className="-mx-4 border-b border-gray-200 mb-4"></div>
                  
                  <div className="space-y-4">
                    {/* Variables de acceso rápido */}

                    {/* Todas las variables del sistema */}


                    {/* Mensaje del evento */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[14px] font-medium text-gray-700">
                          <span className="text-red-500">*</span> Mensaje del evento
                        </label>
                        <VariableButton 
                          onInsertVariable={(variable) => {
                            // Simplemente agregar al final del texto actual
                            const newText = (eventMessage + variable).slice(0, 120)
                            setEventMessage(newText)
                            setEventMessageCharCount(newText.length)
                            setEmailDescription(newText)
                            setDescriptionCharCount(newText.length)
                          }}
                        />
                      </div>
                      <div className="relative">
                        <VariableTextarea
                          name="event-message"
                          value={eventMessage}
                          onChange={(text) => {
                            setEventMessage(text)
                            setEventMessageCharCount(text.length)
                            // Also update email description if it's the same
                            setEmailDescription(text)
                            setDescriptionCharCount(text.length)
                          }}
                          showVariableButton={false}
                          placeholder="Escribe el mensaje que se enviará cuando ocurra este evento (máx. 120 caracteres). Usa variables como {unidad}, {velocidad}, {ubicacion_link} para personalizar el contenido."
                          maxLength={120}
                          className="min-h-[100px]"
                        />

                      </div>

                      {eventMessage && (
                        <div className="bg-gray-50 border border-gray-200 rounded p-3">
                          <div className="text-[12px] font-medium text-gray-600 mb-1">Vista previa:</div>
                          <div className="text-[13px] text-gray-700">
                            {(() => {
                              // Variable replacement mapping
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
                                // Variables técnicas con ejemplos
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
                              
                              // Split the message by variables to render them in blue
                              const variablePattern = /\{[^}]+\}/g
                              const parts = eventMessage.split(variablePattern)
                              const variables = eventMessage.match(variablePattern) || []
                              
                              const result = []
                              for (let i = 0; i < parts.length; i++) {
                                // Add text part
                                if (parts[i]) {
                                  result.push(<span key={`text-${i}`}>{parts[i]}</span>)
                                }
                                // Add variable part in blue with example value
                                if (variables[i]) {
                                  const exampleValue = variableReplacements[variables[i]] || variables[i]
                                  result.push(
                                    <span key={`var-${i}`} className="text-purple-600 font-medium">
                                      {exampleValue}
                                    </span>
                                  )
                                }
                              }
                              return result
                            })()}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section 2 - Canales de notificación */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Bell className="h-4 w-4 text-gray-600" />
                    <h3 className="text-[14px] font-medium text-gray-700">Canales de notificación</h3>
                  </div>
                  <p className="text-[14px] text-gray-600 mb-4">
                    Selecciona por qué medios quieres enviar el mensaje cuando ocurra este evento
                  </p>
                  <div className="-mx-4 border-b border-gray-200 mb-4"></div>
                  
                  <div className="space-y-4">
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
                            <div className="text-[12px] text-gray-600">Envío por email con asunto personalizable</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {/* Dropdown para seleccionar tipo de personalización */}
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="text-[11px] h-6 px-2"
                              >
                                <MessageSquare className="w-3 h-3 mr-1" />
                                Plantilla
                                <ChevronDown className="w-3 h-3 ml-1" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-48 p-1" align="end">
                              <div className="space-y-1">
                                <button
                                  onClick={() => {
                                    setShowUserTemplates(true)
                                    setShowEmailPersonalizer(false)
                                  }}
                                  className="w-full text-left px-2 py-1.5 text-[12px] hover:bg-gray-100 rounded flex items-center gap-2"
                                >
                                  <Star className="w-3 h-3 text-blue-500" />
                                  Plantillas de usuarios
                                </button>
                                <button
                                  onClick={() => {
                                    setShowEmailPersonalizer(true)
                                    setShowUserTemplates(false)
                                  }}
                                  className="w-full text-left px-2 py-1.5 text-[12px] hover:bg-gray-100 rounded flex items-center gap-2"
                                >
                                  <MessageSquare className="w-3 h-3 text-blue-500" />
                                  Personalizar mensaje
                                </button>
                              </div>
                            </PopoverContent>
                          </Popover>
                          <Switch
                            checked={emailEnabled}
                            onCheckedChange={setEmailEnabled}
                            className="switch-blue"
                          />
                        </div>
                      </div>
                      
                      {emailEnabled && (
                        <div className="border-t border-gray-200 p-3 bg-gray-50 space-y-3">
                          {/* Destinatarios */}
                          <div className="space-y-1">
                            <label className="text-[13px] font-medium text-gray-700">Destinatarios</label>
                            <RecipientsSelector
                              value={emailRecipients}
                              onChange={setEmailRecipients}
                              className="w-full"
                            />
                          </div>
                          
                          {/* Asunto del email */}
                          <div className="space-y-1">
                            <label className="text-[13px] font-medium text-gray-700">Asunto del email</label>
                            <VariableInput
                              value={emailSubject}
                              onChange={(value) => setEmailSubject(value)}
                              placeholder="Ej: [ALERTA] {unidad} - {regla_nombre}"
                              className="mt-6"
                              maxLength={100}
                              showVariableButton={true}
                            />
                            <div className="text-[11px] text-gray-500">
                              {showEmailPersonalizer 
                                 ? 'Se usará el mensaje personalizado configurado abajo'
                                 : 'El mensaje configurado arriba se usará como cuerpo del email'
                               }
                            </div>
                          </div>
                          
                          {/* Email Message Personalizer - Show when personalizer is open */}
                          {showEmailPersonalizer && (
                            <div className="border border-gray-200 rounded-lg p-3 bg-blue-50 space-y-3 mt-4">
                              <div className="flex items-center gap-2 mb-2">
                                <MessageSquare className="h-4 w-4 text-blue-600" />
                                <h4 className="text-[13px] font-medium text-gray-700">Mensaje personalizado para correo electrónico</h4>
                              </div>
                              
                              <div className="space-y-2">
                                {/* Selector de plantilla */}
                                <div className="space-y-1">
                                  <label className="text-[13px] font-medium text-gray-700">Selecciona plantilla</label>
                                  <Select
                                    value={selectedEmailTemplate || ""}
                                    onValueChange={(value) => {
                                      setSelectedEmailTemplate(value)
                                      // Aplicar plantilla seleccionada
                                      const templates = {
                                        'basic': 'Se ha registrado un evento en {unidad}:\n\nUbicación: {ubicacion_link}\nFecha y hora: {fecha_hora}\nVelocidad: {velocidad}\n\nSaludos,\nSistema de Monitoreo',
                                        'detailed': 'ALERTA: {regla_nombre}\n\nUnidad: {unidad}\nConductor: {conductor}\nUbicación: {ubicacion_link}\nFecha y hora: {fecha_hora}\nVelocidad: {velocidad}\nTemperatura: {temperatura}\nCombustible: {combustible}\n\nPor favor revise este evento lo antes posible.\n\nSistema de Monitoreo Numaris',
                                        'summary': 'Evento registrado en {unidad} el {fecha_hora}. Ubicación: {ubicacion_link}. Velocidad: {velocidad}.',
                                        'formal': 'Estimado/a,\n\nLe informamos que se ha registrado el siguiente evento:\n\nUnidad: {unidad}\nUbicación: {ubicacion_link}\nFecha: {fecha_hora}\nVelocidad registrada: {velocidad}\n\nPara más detalles, por favor consulte el sistema.\n\nAtentamente,\nEquipo de Monitoreo',
                                        'custom': customEmailMessage
                                      }
                                      if (value !== 'custom') {
                                        setCustomEmailMessage(templates[value] || '')
                                      }
                                    }}
                                  >
                                    <SelectTrigger className="w-full">
                                      <SelectValue placeholder="Selecciona una plantilla de mensaje" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="basic">Básica</SelectItem>
                                      <SelectItem value="detailed">Detallada</SelectItem>
                                      <SelectItem value="summary">Resumen</SelectItem>
                                      <SelectItem value="formal">Formal</SelectItem>
                                      <SelectItem value="custom">Personalizada</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <div className="text-[11px] text-gray-500">
                                    Selecciona una plantilla predefinida o "Personalizada" para crear tu propio mensaje
                                  </div>
                                </div>

                                <div className="flex justify-between items-center">
                                  <label className="text-[13px] font-medium text-gray-700">
                                    <span className="text-red-500">*</span> Mensaje personalizado
                                  </label>
                                  <VariableButton 
                                    onInsertVariable={(variable) => {
                                      
                                      setCustomEmailMessage(customEmailMessage + variable)
                                      
                                    }}
                                  />
                                </div>
                                <div className="relative">
                                  <VariableTextarea
                                    name="custom-email-message"
                                    value={customEmailMessage}
                                    onChange={(text) => {
                                      setCustomEmailMessage(text)
                                      // Si el usuario modifica el mensaje manualmente, cambiar a plantilla personalizada
                                      if (selectedEmailTemplate && selectedEmailTemplate !== 'custom') {
                                        setSelectedEmailTemplate('custom')
                                      }
                                    }}
                                    showVariableButton={false}
                                    placeholder="Escribe un mensaje específico para el correo electrónico. Usa variables como {unidad}, {velocidad}, {ubicacion_link} para personalizar el contenido."
                                    maxLength={120}
                                    className="min-h-[80px]"
                                  />
                                  <div className="absolute bottom-2 right-2 text-[11px] text-gray-500 bg-white px-1 rounded">
                                    
                                  </div>
                                </div>
                                
                                {/* Preview */}
                                {customEmailMessage && (
                                  <div className="mt-3 p-2 bg-white border border-gray-200 rounded-md">
                                    <div className="text-[11px] font-medium text-gray-600 mb-1">Vista previa del mensaje de email:</div>
                                    <div className="text-[12px] text-gray-700">
                                      {(() => {
                                        // Variable replacements for preview
                                        const variableReplacements = {
                                          '{unidad}': 'Camión C-1402',
                                          '{ubicacion}': 'Av. Libertador 1234, CABA',
                                          '{ubicacion_link}': 'Ver ubicación',
                                          '{velocidad}': '85 km/h',
                                          '{fecha}': '15/03/2024',
                                          '{hora}': '14:30',
                                          '{fecha_hora}': '15/03/2024 14:30',
                                          '{regla_nombre}': 'Exceso de velocidad',
                                          '{evento_id}': 'EV-2024-001234',
                                          '{temperatura}': '78°C',
                                          '{combustible}': '34%',
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
                                          '{altura}': '156 m',
                                          '{conductor}': 'Juan Pérez'
                                        }
                                        
                                        // Split the message by variables to render them in blue
                                        const variablePattern = /\{[^}]+\}/g
                                        const parts = customEmailMessage.split(variablePattern)
                                        const variables = customEmailMessage.match(variablePattern) || []
                                        
                                        const result = []
                                        for (let i = 0; i < parts.length; i++) {
                                          // Add text part
                                          if (parts[i]) {
                                            result.push(<span key={`text-${i}`}>{parts[i]}</span>)
                                          }
                                          // Add variable part in blue with example value
                                          if (variables[i]) {
                                            const exampleValue = variableReplacements[variables[i]] || variables[i]
                                            result.push(
                                              <span key={`var-${i}`} className="text-purple-600 font-medium">
                                                {exampleValue}
                                              </span>
                                            )
                                          }
                                        }
                                        return result
                                      })()}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {/* User Templates View - Show when user templates is open */}
                          {showUserTemplates && (
                            <div className="border border-gray-200 rounded-lg p-3 bg-purple-50 space-y-3 mt-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Star className="h-4 w-4 text-purple-600" />
                                  <h4 className="text-[13px] font-medium text-gray-700">Plantillas creadas por usuarios</h4>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setShowUserTemplates(false)}
                                  className="text-[11px] h-6 px-2 text-gray-500 hover:text-gray-700"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                              
                              <div className="space-y-2 max-h-80 overflow-y-auto">
                                {templateCards}
                              </div>
                              
                              <div className="pt-2 border-t border-gray-200">
                                <div className="text-[11px] text-gray-500 text-center">
                                  💡 Selecciona una plantilla para aplicarla y personalizarla
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>


                  </div>
                </div>

                {/* Section 3 - Webhook */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Link className="h-4 w-4 text-gray-600" />
                      <h3 className="text-[14px] font-medium text-gray-700">Webhook</h3>
                    </div>
                    <Switch
                      checked={webhookEnabled}
                      onCheckedChange={setWebhookEnabled}
                      className="switch-blue"
                    />
                  </div>
                  <p className="text-[14px] text-gray-600 mb-4">
                    Configura un webhook para enviar datos del evento a sistemas externos
                  </p>
                  {webhookEnabled && <div className="-mx-4 border-b border-gray-200 mb-4"></div>}

                  <div className="space-y-4">
                    {/* Webhook Enable Switch */}


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
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="border-t border-border bg-background px-6 py-4">
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
            description: ruleDescription
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
      </div>
    </TooltipProvider>
  )
}
