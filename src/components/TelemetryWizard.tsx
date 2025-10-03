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
  const [showRenameInput, setShowRenameInput] = useState(false)
  const [tempRuleName, setTempRuleName] = useState(rule?.name || "")
  
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

  const handleSave = () => {
    setShowSaveModal(true)
  }

  const handleRename = () => {
    setTempRuleName(ruleName)
    setShowRenameInput(true)
  }

  const handleRenameConfirm = () => {
    if (rule && tempRuleName.trim() && tempRuleName !== ruleName) {
      setRuleName(tempRuleName.trim())
      if (onRename) {
        onRename(rule.id, tempRuleName.trim())
      }
    }
    setShowRenameInput(false)
  }

  const handleRenameCancel = () => {
    setTempRuleName(ruleName)
    setShowRenameInput(false)
  }

  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRenameConfirm()
    } else if (e.key === 'Escape') {
      handleRenameCancel()
    }
  }

  const handleSaveRule = (ruleData: Partial<Rule>) => {
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
                    {showRenameInput ? (
                      <Input
                        value={tempRuleName}
                        onChange={(e) => setTempRuleName(e.target.value)}
                        onKeyDown={handleRenameKeyDown}
                        onBlur={handleRenameConfirm}
                        className="text-[16px] h-auto p-0 border-none bg-transparent focus:ring-0 font-normal"
                        autoFocus
                      />
                    ) : (
                      <span className="text-[16px]">{isEditing ? (ruleName || 'Editar regla') : 'Crear regla'}</span>
                    )}
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
                className="bg-blue-600 hover:bg-blue-700 text-white text-[14px] font-normal"
              >
                {isEditing ? 'Guardar cambios' : 'Guardar regla'}
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
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Truck className="h-4 w-4 text-gray-600" />
                    <h3 className="text-[14px] font-medium text-gray-700">Aplica esta regla a</h3>
                  </div>
                  <p className="text-[14px] text-gray-600 mb-4">
                    Elige a cuáles unidades o etiquetas esta regla debe aplicar
                  </p>
                  {(selectedUnitsLocal.length > 0 || selectedTags.length > 0) && (
                    <div className="-mx-4 border-b border-gray-200 mb-4"></div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
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
                        Define las zonas, cuándo debe evaluarse y la duración del evento
                      </p>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-6">
                      {/* Header - Left aligned with first column labels */}
                      <div className="mb-6">
                        <h3 className="text-[14px] font-medium text-gray-700 mb-1">Configuración avanzada</h3>
                        <p className="text-[14px] text-gray-600">
                          Define las zonas, cuándo debe evaluarse y la duración del evento
                        </p>
                      </div>

                      {/* Main content grid */}
                      <div className="space-y-6">
                        {/* Section 1 – Geographic zone */}
                        <div className="grid grid-cols-2 gap-8 items-start">
                          <div>
                            <div className="flex items-center gap-2 mb-4">
                              <MapPin className="h-4 w-4 text-gray-600" />
                              <label className="text-[14px] font-medium text-gray-700">¿En qué zona geográfica aplica esta regla?</label>
                            </div>
                            {geographicZone === 'personalizado' && (
                              <div className="flex items-center gap-6 pt-4">
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="radio"
                                    id="dentro-zona"
                                    name="zone-type"
                                    value="dentro"
                                    checked={zoneType === 'dentro'}
                                    onChange={(e) => setZoneType(e.target.value)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 focus:ring-2"
                                    disabled={true}
                                  />
                                  <label htmlFor="dentro-zona" className="text-[14px] text-gray-700">
                                    Dentro de zona
                                  </label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="radio"
                                    id="fuera-zona"
                                    name="zone-type"
                                    value="fuera"
                                    checked={zoneType === 'fuera'}
                                    onChange={(e) => setZoneType(e.target.value)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 focus:ring-2"
                                    disabled={true}
                                  />
                                  <label htmlFor="fuera-zona" className="text-[14px] text-gray-700">
                                    Fuera de zona
                                  </label>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="space-y-4">
                            <Select value={geographicZone} onValueChange={() => {}}>
                              <SelectTrigger className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="cualquier-lugar" disabled>Cualquier lugar</SelectItem>
                                <SelectItem value="personalizado" disabled>Personalizado</SelectItem>
                              </SelectContent>
                            </Select>

                          </div>
                        </div>

                        {/* Section 2 – Zonas */}
                        {geographicZone === 'personalizado' && (
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
                        {geographicZone === 'personalizado' && (
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
                              <Select onValueChange={() => {}}>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Seleccionar etiquetas" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="cliente-a" disabled>Cliente A</SelectItem>
                                  <SelectItem value="cliente-b" disabled>Cliente B</SelectItem>
                                </SelectContent>
                              </Select>
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
                            <Select value={eventTiming} onValueChange={() => {}}>
                              <SelectTrigger className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="cumplan-condiciones" disabled>Cuando se cumplan las condiciones</SelectItem>
                                <SelectItem value="inmediatamente" disabled>Inmediatamente</SelectItem>
                                <SelectItem value="despues-tiempo" disabled>Después de un tiempo</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Section 4  Rule activity period */}
                        <div className="grid grid-cols-2 gap-8 items-center">
                          <div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-600" />
                              <label className="text-[14px] font-medium text-gray-700">¿Cuándo estará activa esta regla?</label>
                            </div>
                          </div>
                          <div>
                            <Select value={ruleSchedule} onValueChange={() => {}}>
                              <SelectTrigger className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="todo-momento" disabled>En todo momento</SelectItem>
                                <SelectItem value="personalizado" disabled>Personalizado</SelectItem>
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
                                        disabled={true}
                                      />
                                      <label className="text-[14px] text-gray-700 font-medium">
                                        {dayLabels[day]}
                                      </label>
                                    </div>
                                    
                                    {/* Column 2: Start time input (aligned with second column of dropdowns) */}
                                    <div>
                                      <Select
                                        value={config.start}
                                        onValueChange={() => {}}
                                      >
                                        <SelectTrigger className="w-full">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="06:00" disabled>06:00 am</SelectItem>
                                          <SelectItem value="07:00" disabled>07:00 am</SelectItem>
                                          <SelectItem value="08:00" disabled>08:00 am</SelectItem>
                                          <SelectItem value="09:00" disabled>09:00 am</SelectItem>
                                          <SelectItem value="10:00" disabled>10:00 am</SelectItem>
                                          <SelectItem value="11:00" disabled>11:00 am</SelectItem>
                                          <SelectItem value="12:00" disabled>12:00 pm</SelectItem>
                                          <SelectItem value="13:00" disabled>01:00 pm</SelectItem>
                                          <SelectItem value="14:00" disabled>02:00 pm</SelectItem>
                                          <SelectItem value="15:00" disabled>03:00 pm</SelectItem>
                                          <SelectItem value="16:00" disabled>04:00 pm</SelectItem>
                                          <SelectItem value="17:00" disabled>05:00 pm</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    
                                    {/* Column 3: End time input (aligned directly to the right of column 2) */}
                                    <div>
                                      <Select
                                        value={config.end}
                                        onValueChange={() => {}}
                                      >
                                        <SelectTrigger className="w-full">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="18:00" disabled>06:00 pm</SelectItem>
                                          <SelectItem value="19:00" disabled>07:00 pm</SelectItem>
                                          <SelectItem value="20:00" disabled>08:00 pm</SelectItem>
                                          <SelectItem value="21:00" disabled>09:00 pm</SelectItem>
                                          <SelectItem value="22:00" disabled>10:00 pm</SelectItem>
                                          <SelectItem value="23:00" disabled>11:00 pm</SelectItem>
                                          <SelectItem value="00:00" disabled>12:00 am</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    
                                    {/* Column 4: Condition dropdown (aligned with rightmost dropdown position) */}
                                    <div>
                                      <Select
                                        value={config.scope}
                                        onValueChange={() => {}}
                                      >
                                        <SelectTrigger className="w-full">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="dentro" disabled>Dentro de este horario</SelectItem>
                                          <SelectItem value="fuera" disabled>Fuera de este horario</SelectItem>
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
                      disabled
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
                          * Asignar responsable
                        </label>
                      </div>
                      <div className="relative">
                        <SearchableUserSelect 
                          defaultValue="usuario@email.com"
                          users={[
                            { value: 'usuario@email.com', label: 'usuario@email.com' },
                            { value: 'supervisor@fleet.com', label: 'supervisor@fleet.com' },
                            { value: 'admin@fleet.com', label: 'admin@fleet.com' },
                            { value: 'operador@fleet.com', label: 'operador@fleet.com' },
                            { value: 'gerente@fleet.com', label: 'gerente@fleet.com' }
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
                          * Severidad del evento
                        </label>
                      </div>
                      <div className="flex gap-4">
                        <Select value={eventIcon} onValueChange={setEventIcon}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Icono" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="info">
                              <div className="flex items-center justify-center">
                                <Info className="h-4 w-4 text-gray-900" />
                              </div>
                            </SelectItem>
                            <SelectItem value="warning">
                              <div className="flex items-center justify-center">
                                <AlertTriangle className="h-4 w-4 text-gray-900" />
                              </div>
                            </SelectItem>
                            <SelectItem value="alert">
                              <div className="flex items-center justify-center">
                                <AlertCircle className="h-4 w-4 text-gray-900" />
                              </div>
                            </SelectItem>
                            <SelectItem value="critical">
                              <div className="flex items-center justify-center">
                                <AlertOctagon className="h-4 w-4 text-gray-900" />
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <Select value={eventSeverity} onValueChange={setEventSeverity}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Crítico" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bajo">Bajo</SelectItem>
                            <SelectItem value="medio">Medio</SelectItem>
                            <SelectItem value="alto">Alto</SelectItem>
                            <SelectItem value="critico">Crítico</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Row 2: Etiquetas */}
                    <div className="grid grid-cols-2 gap-8 items-center">
                      <div>
                        <div className="flex items-center gap-2">
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
                          selectedItems={eventTags ? [{ id: eventTags, name: eventTags, color: '#3B82F6' }] : []}
                          onSelectionChange={(items) => setEventTags(items.length > 0 ? items[0].id : '')}
                          placeholder="Seleccionar etiquetas"
                          title="Etiquetas del evento"
                          items={[
                            { id: 'cliente-a', name: 'Cliente A', color: '#3B82F6' },
                            { id: 'cliente-b', name: 'Cliente B', color: '#10B981' },
                            { id: 'urgente', name: 'Urgente', color: '#EF4444' },
                            { id: 'mantenimiento', name: 'Mantenimiento', color: '#F59E0B' }
                          ]}
                          searchPlaceholder="Buscar etiquetas..."
                          getDisplayText={(count) => count === 0 ? "Seleccionar etiquetas" : count === 1 ? "1 etiqueta seleccionada" : `${count} etiquetas seleccionadas`}
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
                          * ¿Cómo debe cerrarse el evento?
                        </label>
                      </div>
                      <div>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="w-full">
                              <Select value={closePolicy} onValueChange={() => {}}>
                                <SelectTrigger className="w-full">
                                  <div className="truncate">
                                    <SelectValue placeholder="Manualmente (Requiere nota al cerrar evento)" />
                                  </div>
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="manualmente" disabled>Manual</SelectItem>
                                  <SelectItem value="automaticamente-condiciones" disabled>Automático por condiciones</SelectItem>
                                  <SelectItem value="inmediato" disabled>Inmediato</SelectItem>
                                  <SelectItem value="automaticamente-tiempo" disabled>Automático por tiempo</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-[12px]">
                              {closePolicy === 'manualmente' 
                                ? 'Manual'
                                : closePolicy === 'automaticamente-condiciones'
                                ? 'Automático por condiciones'
                                : closePolicy === 'inmediato'
                                ? 'Inmediato'
                                : closePolicy === 'automaticamente-tiempo'
                                ? 'Automático por tiempo'
                                : 'Manual'
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
                            disabled
                          />
                        </div>
                      </div>
                    )}

                    {/* Row 3: Time configuration - only show when "automaticamente-tiempo" is selected */}
                    {closePolicy === 'automaticamente-tiempo' && (
                      <div className="grid grid-cols-2 gap-8 items-center">
                        <div>
                          <label className="text-[14px] font-medium text-gray-700">
                            * Después de cuánto tiempo se debe cerrar
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
                      disabled
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
                        <Select defaultValue="automaticamente-tiempo" disabled>
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
                {/* Section 1 - Envío por correo electrónico */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-600" />
                      <h3 className="text-[14px] font-medium text-gray-700">Envío por correo electrónico</h3>
                    </div>
                    <Switch
                      checked={emailEnabled}
                      onCheckedChange={setEmailEnabled}
                      disabled
                    />
                  </div>
                  <p className="text-[14px] text-gray-600 mb-4">
                    Envío de notificación por correo electrónico cuando suceda un evento
                  </p>
                  {emailEnabled && (
                    <div className="-mx-4 border-b border-gray-200 mb-4"></div>
                  )}
                  
                  {emailEnabled && (
                    <div className="space-y-4">
                      {/* Row 1: Destinatarios */}
                      <div className="grid grid-cols-[120px_1fr] gap-4 items-center">
                        <div>
                          <label className="text-[14px] font-medium text-gray-700">
                            Destinatarios
                          </label>
                        </div>
                        <div className="w-full">
                          <RecipientsSelector
                            value={emailRecipients}
                            onChange={setEmailRecipients}
                            className="w-full"
                          />
                        </div>
                      </div>

                      {/* Row 2: Asunto */}
                      <div className="grid grid-cols-[120px_1fr] gap-4 items-center">
                        <div>
                          <label className="text-[14px] font-medium text-gray-700">
                            Asunto
                          </label>
                        </div>
                        <div>
                          <Input
                            value={emailSubject}
                            onChange={(e) => setEmailSubject(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Row 3: Descripción */}
                      <div className="grid grid-cols-[120px_1fr] gap-4 items-start">
                        <div>
                          <label className="text-[14px] font-medium text-gray-700">
                            Descripción
                          </label>
                        </div>
                        <div className="relative">
                          <Textarea
                            value={emailDescription}
                            onChange={(e) => {
                              setEmailDescription(e.target.value)
                              setDescriptionCharCount(e.target.value.length)
                            }}
                            className="min-h-[80px]"
                          />
                          <div className="absolute bottom-2 right-2 text-[12px] text-gray-500">
                            {descriptionCharCount} / 40
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 2 - Notificación Push */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-gray-600" />
                      <h3 className="text-[14px] font-medium text-gray-700">Notificación Push</h3>
                    </div>
                    <Switch
                      checked={pushNotificationEnabled}
                      onCheckedChange={setPushNotificationEnabled}
                      disabled
                    />
                  </div>
                  <p className="text-[14px] text-gray-600 mb-4">
                    Alerta al celular o computadora cuando ocurra un evento
                  </p>
                </div>

                {/* Section 3 - Webhook */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Link className="h-4 w-4 text-gray-600" />
                      <h3 className="text-[14px] font-medium text-gray-700">Webhook</h3>
                    </div>
                    <Switch
                      checked={webhookNotificationEnabled}
                      onCheckedChange={setWebhookNotificationEnabled}
                      disabled
                    />
                  </div>
                  <p className="text-[14px] text-gray-600 mb-4">
                    Enviar alertas automáticas a otra app o sistema cuando ocurra un evento
                  </p>
                </div>

                {/* Section 4 - Notificación en la plataforma */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-gray-600" />
                      <h3 className="text-[14px] font-medium text-gray-700">Notificación en la plataforma</h3>
                    </div>
                    <Switch
                      checked={platformNotificationEnabled}
                      onCheckedChange={setPlatformNotificationEnabled}
                      disabled
                    />
                  </div>
                  <p className="text-[14px] text-gray-600 mb-4">
                    Notificación en el centro de la aplicación para los usuarios asignados
                  </p>
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
          onClose={() => setShowSaveModal(false)}
          onSave={handleSaveRule}
          defaultData={{
            name: ruleName,
            description: ruleDescription
          }}
          isRenaming={isEditing && showRenameInput}
        />
      </div>
    </TooltipProvider>
  )
}