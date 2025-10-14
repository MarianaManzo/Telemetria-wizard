import { useEffect, useState } from "react"
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
  Check,
  ExternalLink
} from "lucide-react"
import { Event, Rule } from "../types"

interface EventsDetailProps {
  event: Event
  onClose: () => void
  rules: Rule[]
  onStatusChange?: (eventId: string, newStatus: 'open' | 'closed', note?: string) => void
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

const statusConfig: Record<'open' | 'closed', { label: string; color: string }> = {
  open: { label: 'Abierto', color: 'bg-green-500' },
  closed: { label: 'Cerrado', color: 'bg-gray-500' }
}

export function EventsDetail({ event, onClose, rules, onStatusChange, onResponsibleChange }: EventsDetailProps) {
  const [activeTab, setActiveTab] = useState<'evento' | 'historial'>('evento')
  const [sidebarActiveItem, setSidebarActiveItem] = useState('evento')
  const [newNote, setNewNote] = useState("")
  const [status, setStatus] = useState<'open' | 'closed'>(event.status === 'closed' ? 'closed' : 'open')
  const [assignedTo, setAssignedTo] = useState(event.responsible)
  const [showChangeResponsibleModal, setShowChangeResponsibleModal] = useState(false)
  const [showChangeStatusModal, setShowChangeStatusModal] = useState(false)

  useEffect(() => {
    setStatus(event.status)
    setAssignedTo(event.responsible)
  }, [event.status, event.responsible])

  const handleStatusChange = (newStatus: 'open' | 'closed', note?: string) => {
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

  const handleChangeStatusFromModal = (newStatus: 'open' | 'closed', note?: string) => {
    handleStatusChange(newStatus, note)
  }

  const severityInfo = severityConfig[event.severity]
  const statusInfo = statusConfig[status]
  
  const relatedRule = rules.find(r => r.id === event.ruleId)

  const formatDateTime = (date?: Date | null) => {
    if (!date) return '---'
    return `${date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })} ${date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    })}`
  }

  const formatDuration = (start: Date, end?: Date | null) => {
    const endDate = end ?? new Date()
    const diffMs = Math.max(0, endDate.getTime() - start.getTime())
    const totalMinutes = Math.floor(diffMs / 60000)
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    if (hours <= 0 && minutes <= 0) {
      return '---'
    }
    const parts: string[] = []
    if (hours > 0) {
      parts.push(`${hours} h`)
    }
    if (minutes > 0) {
      parts.push(`${minutes} min`)
    }
    return parts.join(' ')
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
                <div className="bg-white rounded-lg border p-6 space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#1C2452] block">Estatus</span>
                        <div className="mt-2 flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${status === 'open' ? 'bg-green-500' : 'bg-gray-400'}`} />
                          <span className="text-[14px] text-gray-900">{statusConfig[status].label}</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#1C2452] block">Inicio del evento</span>
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-[14px] text-gray-900">
                          <span>{formatDateTime(event.createdAt)}</span>
                          {event.historyUrl && (
                            <a
                              href={event.historyUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[#3559FF] hover:text-[#1D37B7] text-[13px] font-medium"
                            >
                              Ver en historial
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </div>

                      <div>
                        <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#1C2452] block">Ubicación inicial</span>
                        <p className="mt-2 text-[14px] text-gray-900 whitespace-pre-wrap">
                          {event.startAddress || '---'}
                        </p>
                      </div>

                      <div>
                        <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#1C2452] block">Duración</span>
                        <p className="mt-2 text-[14px] text-gray-900">
                          {formatDuration(event.createdAt, event.closedAt ?? (status === 'closed' ? event.updatedAt : null))}
                        </p>
                      </div>

                      <div>
                        <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#1C2452] block">Mensaje del evento</span>
                        <div className="mt-2 text-[14px] leading-[22px] text-[#313655] bg-[#FAFBFF] border border-[#EEF1FF] rounded-lg p-4 shadow-inner">
                          {event.eventMessageHtml ? (
                            <div dangerouslySetInnerHTML={{ __html: event.eventMessageHtml }} />
                          ) : (
                            <p>No hay mensaje registrado para este evento.</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#1C2452] block">Asignado a</span>
                        <div className="mt-2 flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage
                              src="https://images.unsplash.com/photo-1652471949169-9c587e8898cd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMGJ1c2luZXNzJTIwaGVhZHNob3R8ZW58MXx8fHwxNzU4NjUxMDA2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                              alt={`Avatar de ${assignedTo}`}
                            />
                            <AvatarFallback className="text-[10px] bg-blue-100 text-blue-700">
                              {assignedTo.split(' ').map(name => name.charAt(0)).join('').toUpperCase().slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-[14px] text-gray-900">{assignedTo}</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#1C2452] block">Severidad</span>
                        <div className={`mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full border ${
                          event.severity === 'high'
                            ? 'bg-red-100 text-red-700 border-red-200'
                            : event.severity === 'medium'
                            ? 'bg-orange-100 text-orange-700 border-orange-200'
                            : event.severity === 'low'
                            ? 'bg-blue-100 text-blue-700 border-blue-200'
                            : 'bg-cyan-100 text-cyan-700 border-cyan-200'
                        }`}>
                          <span className="text-[12px] font-medium">{severityInfo.label}</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#1C2452] block">Cierre del evento</span>
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-[14px] text-gray-900">
                          <span>{formatDateTime(event.closedAt ?? (status === 'closed' ? event.updatedAt : null))}</span>
                          {status === 'closed' && event.historyUrl && (
                            <a
                              href={event.historyUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[#3559FF] hover:text-[#1D37B7] text-[13px] font-medium"
                            >
                              Ver en historial
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </div>

                      <div>
                        <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#1C2452] block">Ubicación final</span>
                        <p className="mt-2 text-[14px] text-gray-900 whitespace-pre-wrap">
                          {event.endAddress || '---'}
                        </p>
                      </div>

                      <div>
                        <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#1C2452] block">Unidad</span>
                        <div className="mt-2 text-[14px] text-blue-600 hover:text-blue-800">
                          {event.unitLink ? (
                            <a href={event.unitLink} target="_blank" rel="noopener noreferrer" className="hover:underline">
                              {event.unitName}
                            </a>
                          ) : (
                            event.unitName
                          )}
                        </div>
                      </div>

                      <div>
                        <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#1C2452] block">Instrucciones</span>
                        <p className="mt-2 text-[14px] text-gray-900 whitespace-pre-wrap">
                          {event.instructions || '---'}
                        </p>
                      </div>

                      <div>
                        <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#1C2452] block">Acciones requeridas</span>
                        {event.actionsRequired && event.actionsRequired.length > 0 ? (
                          <ol className="mt-2 space-y-1 text-[14px] text-gray-900 list-decimal list-inside">
                            {event.actionsRequired.map((action, index) => (
                              <li key={index}>{action}</li>
                            ))}
                          </ol>
                        ) : (
                          <p className="mt-2 text-[14px] text-gray-500">---</p>
                        )}
                      </div>
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
                            {formatDateTime(event.updatedAt)} por {event.responsible}
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
                          28/05/2025 10:15:00 por usuario@email.com
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
                          25/05/2025 09:30:00 por usuario@email.com
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
