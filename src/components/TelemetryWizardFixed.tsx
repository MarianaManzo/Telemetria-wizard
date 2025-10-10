import { useState, useRef } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Badge } from "./ui/badge"
import { Checkbox } from "./ui/checkbox"
import { RadioGroup, RadioGroupItem } from "./ui/radio-group"
import { Switch } from "./ui/switch"
import { Textarea } from "./ui/textarea"
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
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
  MoreVertical,
  Edit
} from "lucide-react"
import { Rule, RuleCondition } from "../types"
import { UnidadesSelectorInput } from "./UnidadesSelectorInput"
import { EtiquetasSelectorInput } from "./EtiquetasSelectorInput"
import { ZonasSelectorInput } from "./ZonasSelectorInput"
import { GenericSelectorInput } from "./GenericSelectorInput"
import { SearchableUserSelect } from "./SearchableUserSelect"
import { SaveRuleModal } from "./SaveRuleModal"
import { RecipientsSelector } from "./RecipientsSelector"

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

interface TelemetryWizardProps {
  onSave: (rule: Partial<Rule>) => void
  onCancel: () => void
  onBackToTypeSelector: () => void
  rule?: Rule // Optional rule for editing
  onRename?: (ruleId: string, newName: string) => void
}

// Mock sensor data for telemetry
const telemetrySensors = [
  { value: 'speed', label: 'Velocidad', unit: 'km/h' },
  { value: 'fuel_level', label: 'Nivel de combustible', unit: '%' },
  { value: 'engine_temp', label: 'Temperatura del motor', unit: '°C' },
  { value: 'cargo_temp', label: 'Temperatura de carga', unit: '°C' },
  { value: 'rpm', label: 'RPM del motor', unit: 'rpm' },
  { value: 'odometer', label: 'Odómetro', unit: 'km' }
]

const operatorOptions = [
  { value: 'eq', label: 'es igual a' },
  { value: 'gte', label: 'es igual o mayor que' },
  { value: 'gt', label: 'es mayor que' },
  { value: 'lte', label: 'es igual o menor que' },
  { value: 'lt', label: 'es menor que' },
  { value: 'neq', label: 'no es igual a' }
]

export function TelemetryWizard({ onSave, onCancel, onBackToTypeSelector, rule, onRename }: TelemetryWizardProps) {
  const isEditing = !!rule
  
  const [activeTab, setActiveTab] = useState("parameters")
  const [ruleName, setRuleName] = useState(rule?.name || "")
  const [ruleDescription, setRuleDescription] = useState(rule?.description || "")
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  // Parameters
  const [conditions, setConditions] = useState<RuleCondition[]>(
    rule?.conditions && rule.conditions.length > 0 
      ? rule.conditions 
      : [{
          id: '1',
          sensor: 'speed',
          operator: 'gte',
          value: '120',
          dataType: 'numeric'
        }]
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

  // Event generation timing
  const [eventTiming, setEventTiming] = useState('cumplan-condiciones')
  
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
  const [eventSeverity, setEventSeverity] = useState(rule?.eventSettings?.severity || 'critico')
  const [eventTags, setEventTags] = useState(
    rule?.eventSettings?.tags ? rule.eventSettings.tags.join(', ') : ''
  )
  const [closePolicy, setClosePolicy] = useState('manualmente')
  const [requireNoteOnClose, setRequireNoteOnClose] = useState(true)
  const [closureTimeValue, setClosureTimeValue] = useState('120')
  const [closureTimeUnit, setClosureTimeUnit] = useState('minutos')
  const [webhookEnabled, setWebhookEnabled] = useState(false)
  const [sendDeviceCommand, setSendDeviceCommand] = useState(false)

  // Notifications tab state
  const emailDescriptionText = rule?.notifications?.email?.body || 'Unidad {{vehicleName}} ha excedido el límite de velocidad en {{location}} a las {{timestamp}}'
  const [emailEnabled, setEmailEnabled] = useState(rule?.notifications?.email?.enabled || false)
  const [emailRecipients, setEmailRecipients] = useState(
    rule?.notifications?.email?.recipients || ['usuario@email.com', 'usuario@email.com', 'usuario@email.com']
  )
  const [emailSubject, setEmailSubject] = useState(
    rule?.notifications?.email?.subject || 'Alerta: {{ruleName}} ha registrado un evento desde {{vehicleName}}'
  )
  const [emailDescription, setEmailDescription] = useState(emailDescriptionText)
  const [descriptionCharCount, setDescriptionCharCount] = useState(emailDescriptionText.length)
  const [pushNotificationEnabled, setPushNotificationEnabled] = useState(rule?.notifications?.push?.enabled || false)
  const [webhookNotificationEnabled, setWebhookNotificationEnabled] = useState(rule?.notifications?.webhook?.enabled || false)
  const [platformNotificationEnabled, setPlatformNotificationEnabled] = useState(rule?.notifications?.platform?.enabled || false)

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
            updated.operator = ''
            updated.value = ''
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
      dataType: 'numeric'
    }])
  }

  const handleSave = async () => {
    if (isEditing) {
      // For editing, save the changes directly
      setIsSaving(true)
      
      try {
        const completeRuleData: Partial<Rule> = {
          id: rule?.id,
          name: ruleName,
          description: ruleDescription,
          conditions: conditions.filter(c => c.sensor && c.operator && c.value),
          appliesTo: {
            type: appliesTo === 'all-units' ? 'units' : 'units',
            units: appliesTo === 'all-units' ? [] : []
          },
          zoneScope: { type: 'all' },
          schedule: { type: 'always' },
          closePolicy: { type: 'manual' },
          eventSettings: {
            instructions: instructions,
            responsible: assignResponsible ? 'supervisor-flota' : '',
            severity: eventSeverity,
            icon: eventIcon,
            tags: eventTags.split(',').map(tag => tag.trim())
          },
          notifications: {
            email: {
              enabled: emailEnabled,
              recipients: emailRecipients,
              subject: emailSubject,
              body: emailDescription
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
          severity: 'medium'
        }

        // Simulate saving delay
        setTimeout(() => {
          onSave(completeRuleData)
          setIsSaving(false)
        }, 1000)
      } catch (error) {
        console.error('Error saving rule:', error)
        setIsSaving(false)
      }
    } else {
      // For new rules, open the save modal
      setIsRenaming(false)
      setShowSaveModal(true)
    }
  }

  const handleRename = () => {
    // Open the save modal for renaming
    setIsRenaming(true)
    setShowSaveModal(true)
  }

  const handleSaveRule = (ruleData: Partial<Rule>) => {
    if (isEditing && rule) {
      // Handle renaming existing rule
      if (onRename) {
        setRuleName(ruleData.name || ruleName)
        setRuleDescription(ruleData.description || ruleDescription)
        onRename(rule.id, ruleData.name || ruleName)
      }
    } else {
      // Handle creating new rule
      const completeRuleData: Partial<Rule> = {
        ...ruleData,
        conditions: conditions.filter(c => c.sensor && c.operator && c.value),
        appliesTo: {
          type: appliesTo === 'all-units' ? 'units' : 'units',
          units: appliesTo === 'all-units' ? [] : []
        },
        zoneScope: { type: 'all' },
        schedule: { type: 'always' },
        closePolicy: { type: 'manual' },
        eventSettings: {
          instructions: instructions,
          responsible: assignResponsible ? 'supervisor-flota' : '',
          severity: eventSeverity,
          icon: eventIcon,
          tags: eventTags.split(',').map(tag => tag.trim())
        },
        notifications: {
          email: {
            enabled: emailEnabled,
            recipients: emailRecipients,
            subject: emailSubject,
            body: emailDescription
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
        severity: 'medium'
      }

      onSave(completeRuleData)
    }
    
    setShowSaveModal(false)
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
                    onClick={onCancel}
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
                onClick={handleSave}
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700 text-white text-[14px] font-normal disabled:opacity-50"
              >
                {isEditing ? (isSaving ? 'Guardando...' : 'Guardar cambios') : 'Guardar regla'}
              </Button>
              {isEditing && rule && (
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
                  <DropdownMenuContent align="end" className="w-48 bg-white shadow-lg border rounded-lg p-1">
                    <DropdownMenuItem 
                      className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded cursor-pointer"
                      onClick={handleRename}
                    >
                      <Edit className="h-4 w-4 text-gray-500" />
                      <span className="text-[14px] text-gray-900">Renombrar</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto p-6">
            <Tabs value={activeTab} onValueChange={() => {}} className="pb-6">
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
                    <span>Acciones a realizar</span>
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
                    <span>Notificaciones</span>
                  </div>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="parameters" className="mt-6 space-y-6">
                {/* Parameters to evaluate */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Gauge className="h-4 w-4 text-gray-600" />
                    <h3 className="text-[14px] font-medium text-gray-700">Parámetros a evaluar</h3>
                  </div>
                  <p className="text-[14px] text-gray-600 mb-4">
                    ¿Qué condiciones evalúa esta regla?
                  </p>
                  {conditions.length > 0 && (
                    <div className="-mx-4 border-b border-gray-200 mb-4"></div>
                  )}
                  
                  <div className="space-y-4">
                    {conditions.map((condition, index) => {
                      const sensor = telemetrySensors.find(s => s.value === condition.sensor)
                      
                      return (
                        <div key={condition.id} className="flex items-center gap-3">
                          <div className="min-w-0 flex-1">
                            <label className="text-[14px] font-medium text-gray-700 block mb-1">Sensor</label>
                            <Select
                              value={condition.sensor}
                              onValueChange={(value) => updateCondition(condition.id, 'sensor', value)}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Seleccionar sensor" />
                              </SelectTrigger>
                              <SelectContent>
                                {telemetrySensors.map((sensor) => (
                                  <SelectItem key={sensor.value} value={sensor.value}>
                                    {sensor.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="min-w-0 flex-1">
                            <label className="text-[14px] font-medium text-gray-700 block mb-1">Operador</label>
                            <Select
                              value={condition.operator}
                              onValueChange={(value) => updateCondition(condition.id, 'operator', value)}
                              disabled={!condition.sensor}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Seleccionar operador" />
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

                          <div className="min-w-0 flex-1">
                            <label className="text-[14px] font-medium text-gray-700 block mb-1">Valor</label>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                placeholder="Valor"
                                value={condition.value}
                                onChange={(e) => updateCondition(condition.id, 'value', e.target.value)}
                                className="w-full"
                              />
                              {sensor && (
                                <span className="text-[14px] text-gray-600 whitespace-nowrap">
                                  {sensor.unit}
                                </span>
                              )}
                            </div>
                          </div>

                          {conditions.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeCondition(condition.id)}
                              className="mt-6"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      )
                    })}

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-6">
                        <Button
                          variant="link"
                          onClick={addCondition}
                          className="p-0 h-auto text-blue-600 hover:text-blue-700"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Agregar otra condición
                        </Button>
                        <Button
                          variant="link"
                          onClick={() => {}}
                          className="p-0 h-auto text-blue-600 hover:text-blue-700"
                          disabled
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Agregar grupo
                        </Button>
                      </div>
                      <Button
                        variant="link"
                        onClick={clearAll}
                        className="p-0 h-auto text-blue-600 hover:text-blue-700"
                      >
                        Limpiar todo
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Apply this rule to */}
                <div className="bg-white border border-gray-200 rounded-lg">
                  <div className="flex items-start gap-3 px-4 py-4 bg-gray-100 rounded-t-lg border-b border-gray-200">
                    <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600">
                      <Truck className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-[14px] font-semibold text-gray-900">Aplica esta regla a</h3>
                      <p className="text-[14px] text-gray-600">
                        Elige a cuáles unidades o etiquetas esta regla debe aplicar
                      </p>
                    </div>
                  </div>
                  <div className="p-4 grid grid-cols-2 gap-4">
                    {/* Unidades */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Truck className="h-4 w-4 text-gray-600" />
                        <label className="text-[14px] font-medium text-gray-700">Unidades</label>
                      </div>
                      <UnidadesSelectorInput
                        selectedUnits={selectedUnitsLocal}
                        onSelectionChange={handleUnitsChange}
                        placeholder="Seleccionar unidades"
                      />
                    </div>

                    {/* Etiquetas */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
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
                      <EtiquetasSelectorInput
                        selectedTags={selectedTags}
                        onSelectionChange={handleTagsChange}
                        placeholder="Seleccionar etiquetas"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Save Rule Modal */}
        <SaveRuleModal
          isOpen={showSaveModal}
          onClose={() => setShowSaveModal(false)}
          onSave={handleSaveRule}
          defaultData={{ name: ruleName, description: ruleDescription }}
          isRenaming={isRenaming}
        />
      </div>
    </TooltipProvider>
  )
}
