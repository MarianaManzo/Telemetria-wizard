import { useState } from "react"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Textarea } from "./ui/textarea"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar"
import { ChangeResponsibleModal } from "./ChangeResponsibleModal"
import { ChangeStatusModal } from "./ChangeStatusModal"
import { 
  X, 
  AlertTriangle, 
  Clock, 
  ChevronDown,
  ArrowLeft,
  FileText,
  StickyNote,
  Paperclip,
  Settings,
  Tag as TagIcon,
  MoreHorizontal,
  MoreVertical,
  UserCheck,
  RefreshCw,
  Check
} from "lucide-react"
import IconClockCircleOutlined from "../imports/IconClockCircleOutlined-32006-340"
import IconCheckCircleOutlined from "../imports/IconCheckCircleOutlined-32006-399"
import { Event, Rule } from "../types"

interface EventsDetailProps {
  event: Event
  onClose: () => void
  rules: Rule[]
  onStatusChange?: (eventId: string, newStatus: 'open' | 'in-progress' | 'closed', note?: string) => void
  onResponsibleChange?: (eventId: string, newResponsible: string) => void
}

const severityConfig = {
  high: { 
    label: 'Alta', 
    color: 'text-red-600',
    icon: AlertTriangle
  },
  medium: { 
    label: 'Media', 
    color: 'text-orange-600',
    icon: AlertTriangle
  },
  low: { 
    label: 'Baja', 
    color: 'text-blue-600',
    icon: Clock
  },
  informative: { 
    label: 'Informativo', 
    color: 'text-cyan-600',
    icon: Clock
  }
}

const statusConfig = {
  open: { label: 'Abierto', color: 'bg-green-500' },
  'in-progress': { label: 'En progreso', color: 'bg-yellow-500' },
  closed: { label: 'Cerrado', color: 'bg-gray-500' }
}

export function EventsDetail({ event, onClose, rules, onStatusChange, onResponsibleChange }: EventsDetailProps) {
  const [activeTab, setActiveTab] = useState<'evento' | 'historial'>('evento')
  const [sidebarActiveItem, setSidebarActiveItem] = useState('evento')
  const [newNote, setNewNote] = useState("")
  const [status, setStatus] = useState(event.status)
  const [assignedTo, setAssignedTo] = useState(event.responsible)
  const [showChangeResponsibleModal, setShowChangeResponsibleModal] = useState(false)
  const [showChangeStatusModal, setShowChangeStatusModal] = useState(false)

  const handleStatusChange = (newStatus: 'open' | 'in-progress' | 'closed', note?: string) => {
    setStatus(newStatus)
    if (onStatusChange) {
      onStatusChange(event.id, newStatus, note)
    }
  }

  const handleResponsibleChange = (newResponsible: string) => {
    setAssignedTo(newResponsible)
    if (onResponsibleChange) {
      onResponsibleChange(event.id, newResponsible)
    }
  }

  const handleOpenChangeResponsibleModal = () => {
    setShowChangeResponsibleModal(true)
  }

  const handleChangeResponsibleFromModal = (newResponsible: string) => {
    handleResponsibleChange(newResponsible)
  }

  const handleOpenChangeStatusModal = () => {
    setShowChangeStatusModal(true)
  }

  const handleChangeStatusFromModal = (newStatus: 'open' | 'in-progress' | 'closed', note?: string) => {
    handleStatusChange(newStatus, note)
  }

  const severityInfo = severityConfig[event.severity]
  const statusInfo = statusConfig[event.status]
  const SeverityIcon = severityInfo.icon
  
  const relatedRule = rules.find(r => r.id === event.ruleId)

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }) + ' pm'
  }

  const formatDateLong = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) + ' pm'
  }

  const sidebarItems = [
    { id: 'contenido', label: 'Contenido', icon: FileText },
    { id: 'evento', label: 'Evento', icon: FileText, active: true },
    { id: 'notas', label: 'Notas', icon: StickyNote },
    { id: 'archivos', label: 'Archivos adjuntos', icon: Paperclip },
    { id: 'reglas', label: 'Reglas', icon: Settings },
    { id: 'etiquetas', label: 'Etiquetas', icon: TagIcon }
  ]

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">
      {/* Header */}
      <div className="border-b border-border bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="p-1"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-[16px] text-foreground">
              {event.id} - {relatedRule?.name || 'Regla no encontrada'} - {event.unitName}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="p-2 text-gray-600 hover:text-gray-900 cursor-pointer"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white shadow-lg border rounded-lg p-1">
                <DropdownMenuItem 
                  className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded cursor-pointer"
                  onClick={handleOpenChangeResponsibleModal}
                >
                  <UserCheck className="h-4 w-4 text-gray-500" />
                  <span className="text-[14px] text-gray-900">Cambiar responsable</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded cursor-pointer"
                  onClick={handleOpenChangeStatusModal}
                >
                  <RefreshCw className="h-4 w-4 text-gray-500" />
                  <span className="text-[14px] text-gray-900">Cambiar estado</span>
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
            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('evento')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'evento'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Evento
                </button>
                <button
                  onClick={() => setActiveTab('historial')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'historial'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Historial del registro
                </button>
              </nav>
            </div>

            {activeTab === 'evento' && (
              <div>
                {/* Información General Container */}
                <div className="bg-white rounded-lg border p-6">
                  <h2 className="text-[16px] text-foreground mb-6">Evento</h2>
                  
                  {/* Information Grid */}
                  <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                    <div>
                      <label className="text-[14px] text-foreground block mb-1">Regla:</label>
                      <div className="text-[14px] text-muted-foreground">Límite de velocidad 120 Km</div>
                    </div>
                    
                    <div>
                      <label className="text-[14px] text-foreground block mb-1">Estatus</label>
                      <div className="flex items-center gap-2">
                        {status === 'open' && (
                          <>
                            <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                            </div>
                            <span className="text-[14px] text-gray-900">Abierto</span>
                          </>
                        )}
                        {status === 'in-progress' && (
                          <>
                            <div className="w-4 h-4 flex-shrink-0">
                              <IconClockCircleOutlined />
                            </div>
                            <span className="text-[14px] text-gray-900">En progreso</span>
                          </>
                        )}
                        {status === 'closed' && (
                          <>
                            <div className="w-4 h-4 flex-shrink-0">
                              <IconCheckCircleOutlined />
                            </div>
                            <span className="text-[14px] text-gray-900">Cerrado</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="text-[14px] text-foreground block mb-1">Unidad</label>
                      <div className="text-[14px] text-muted-foreground">XHDF-2390</div>
                    </div>

                    <div>
                      <label className="text-[14px] text-foreground block mb-1">Severidad</label>
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${
                        event.severity === 'high'
                          ? 'bg-red-100 text-red-700 border-red-200'
                          : event.severity === 'medium'
                          ? 'bg-orange-100 text-orange-700 border-orange-200'
                          : event.severity === 'low'
                          ? 'bg-blue-100 text-blue-700 border-blue-200'
                          : 'bg-cyan-100 text-cyan-700 border-cyan-200'
                      }`}>
                        <div className={`w-4 h-4 border rounded-full flex items-center justify-center ${
                          event.severity === 'high'
                            ? 'border-red-500'
                            : event.severity === 'medium'
                            ? 'border-orange-500'
                            : event.severity === 'low'
                            ? 'border-blue-500'
                            : 'border-cyan-500'
                        }`}>
                          <span className={`text-[10px] font-bold ${
                            event.severity === 'high'
                              ? 'text-red-500'
                              : event.severity === 'medium'
                              ? 'text-orange-500'
                              : event.severity === 'low'
                              ? 'text-blue-500'
                              : 'text-cyan-500'
                          }`}>!</span>
                        </div>
                        <span className="text-[12px] font-medium">
                          {severityInfo.label}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="text-[14px] text-foreground block mb-1">Instrucciones:</label>
                      <div className="text-[14px] text-muted-foreground">
                        La unidad presenta un límite de velocidad de 120 Km.<br />
                        - Adjuntar imagen de referencia de ubicación y conductor asignado
                      </div>
                    </div>

                    <div>
                      <label className="text-[14px] text-foreground block mb-1">Notificación</label>
                      <div className="text-[14px] text-muted-foreground">Envío por correo electrónico</div>
                    </div>

                    <div>
                      <label className="text-[14px] text-foreground block mb-1">Ubicación</label>
                      <div className="text-[14px] text-muted-foreground">
                        Anillo Perif. Nte. Manuel Gómez Morín 767, Santa M...
                      </div>
                    </div>

                    <div>
                      <label className="text-[14px] text-foreground block mb-1">Fecha</label>
                      <div className="text-[14px] text-muted-foreground">24/12/2025 12:00:02 pm</div>
                    </div>

                    <div>
                      <label className="text-[14px] text-foreground block mb-1">Asignado a</label>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage 
                            src="https://images.unsplash.com/photo-1652471949169-9c587e8898cd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMGJ1c2luZXNzJTIwaGVhZHNob3R8ZW58MXx8fHwxNzU4NjUxMDA2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" 
                            alt={`Avatar de ${assignedTo}`}
                          />
                          <AvatarFallback className="text-[10px] bg-blue-100 text-blue-700">
                            {assignedTo.split(' ').map(name => name.charAt(0)).join('').toUpperCase().slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-[14px] text-muted-foreground">{assignedTo}</div>
                      </div>
                    </div>

                    <div>
                      <label className="text-[14px] text-foreground block mb-1">Duración</label>
                      <div className="text-[14px] text-muted-foreground">En todo momento</div>
                    </div>
                  </div>
                </div>

                {/* Notes Section Container */}
                <div className="bg-white rounded-lg border p-6 mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[16px] text-foreground">Notas</h3>
                    <Select defaultValue="recientes">
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="recientes">Recientes al principio</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Textarea
                    placeholder="Agregar nota..."
                    className="mb-4"
                    rows={3}
                  />

                  {/* Notes History */}
                  <div className="space-y-4">
                    {/* Show close note if event is closed */}
                    {event.status === 'closed' && event.closeNote && (
                      <div className="flex items-start space-x-3">
                        <Avatar className="w-8 h-8 flex-shrink-0">
                          <AvatarImage 
                            src="https://images.unsplash.com/photo-1652471949169-9c587e8898cd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMGJ1c2luZXNzJTIwaGVhZHNob3R8ZW58MXx8fHwxNzU4NjUxMDA2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral" 
                            alt={`Avatar de ${event.responsible}`}
                          />
                          <AvatarFallback className="text-[10px] bg-blue-100 text-blue-700">
                            {event.responsible.split(' ').map(name => name.charAt(0)).join('').toUpperCase().slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div>
                            <span className="text-[14px] text-foreground font-medium">Evento cerrado</span>
                          </div>
                          <div className="text-[14px] text-muted-foreground mt-1">
                            {event.closeNote}
                          </div>
                          <div className="flex items-center text-[12px] text-muted-foreground mt-2">
                            <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                            {formatDate(event.updatedAt)} por {event.responsible}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-xs text-gray-600">D</span>
                      </div>
                      <div className="flex-1">
                        <div>
                          <span className="text-[14px] text-foreground font-medium">Documento adjunto</span>
                        </div>
                        <div className="text-[14px] text-muted-foreground mt-1">
                          Se adjuntó la licencia de conducir. Descargar para ver más información
                        </div>
                        <div className="flex items-center text-[12px] text-muted-foreground mt-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                          28 Mayo 2025 por usuario@email.com
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-xs text-gray-600">C</span>
                      </div>
                      <div className="flex-1">
                        <div>
                          <span className="text-[14px] text-foreground font-medium">Comunicación con el conductor</span>
                        </div>
                        <div className="text-[14px] text-muted-foreground mt-1">
                          Se realizó la llamada con el conductor para conocer el estatus
                        </div>
                        <div className="flex items-center text-[12px] text-muted-foreground mt-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                          25 Mayo 2025 por usuario@email.com
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'historial' && (
              <div>
                <h2 className="text-[16px] text-gray-900 mb-6">Historial del registro</h2>
                <p className="text-[14px] text-gray-600">Contenido del historial del registro...</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel */}

      </div>

      {/* Change Responsible Modal */}
      <ChangeResponsibleModal
        isOpen={showChangeResponsibleModal}
        onClose={() => setShowChangeResponsibleModal(false)}
        onSave={handleChangeResponsibleFromModal}
        currentResponsible={assignedTo}
      />

      {/* Change Status Modal */}
      <ChangeStatusModal
        isOpen={showChangeStatusModal}
        onClose={() => setShowChangeStatusModal(false)}
        onSave={handleChangeStatusFromModal}
        currentStatus={status}
      />
    </div>
  )
}