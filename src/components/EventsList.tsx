import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Badge } from "./ui/badge"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "./ui/select"
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar"
import { 
  Search, 
  Filter,
  AlertTriangle,
  Clock,
  FileX,
  MoreHorizontal,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Check,
  Users,
  CheckCircle
} from "lucide-react"
import IconClockCircleOutlined from "../imports/IconClockCircleOutlined-32006-340"
import IconCheckCircleOutlined from "../imports/IconCheckCircleOutlined-32006-399"
import { Event, AppView } from "../types"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { ChangeResponsibleModal } from "./ChangeResponsibleModal"
import { ChangeStatusModal } from "./ChangeStatusModal"
import { TruncatedText } from "./TruncatedText"

interface EventsListProps {
  events: Event[]
  onEventClick: (event: Event) => void
  onStatusChange?: (eventId: string, newStatus: 'open' | 'in-progress' | 'closed', note?: string) => void
  onResponsibleChange?: (eventId: string, newResponsible: string) => void
  viewType?: AppView
  searchQuery?: string
}

const severityConfig = {
  high: { 
    label: 'Alta', 
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: AlertTriangle
  },
  medium: { 
    label: 'Media', 
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: AlertTriangle
  },
  low: { 
    label: 'Baja', 
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: Clock
  },
  informative: { 
    label: 'Informativo', 
    color: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    icon: Clock
  }
}

const statusConfig = {
  open: { label: 'Abierto', color: 'bg-green-100 text-green-800 border-green-200' },
  'in-progress': { label: 'En progreso', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  closed: { label: 'Cerrado', color: 'bg-gray-100 text-gray-800 border-gray-200' }
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
  }
}

export function EventsList({ events, onEventClick, onStatusChange, onResponsibleChange, viewType, searchQuery = "" }: EventsListProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [severityFilter, setSeverityFilter] = useState<string>("all")
  const [responsibleFilter, setResponsibleFilter] = useState<string>("all")
  const [selectedEventForModal, setSelectedEventForModal] = useState<Event | null>(null)
  const [showChangeResponsibleModal, setShowChangeResponsibleModal] = useState(false)
  const [showChangeStatusModal, setShowChangeStatusModal] = useState(false)

  // Get unique responsibles for the filter
  const uniqueResponsibles = Array.from(new Set(events.map(event => event.responsible))).sort()

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.unitName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.ruleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.responsible.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || event.status === statusFilter
    const matchesSeverity = severityFilter === "all" || event.severity === severityFilter
    const matchesResponsible = responsibleFilter === "all" || event.responsible === responsibleFilter
    
    return matchesSearch && matchesStatus && matchesSeverity && matchesResponsible
  })

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleChangeResponsible = (event: Event) => {
    setSelectedEventForModal(event)
    setShowChangeResponsibleModal(true)
  }

  const handleChangeStatus = (event: Event) => {
    setSelectedEventForModal(event)
    setShowChangeStatusModal(true)
  }

  const handleCloseModals = () => {
    setSelectedEventForModal(null)
    setShowChangeResponsibleModal(false)
    setShowChangeStatusModal(false)
  }

  const handleResponsibleSave = (newResponsible: string) => {
    if (selectedEventForModal && onResponsibleChange) {
      onResponsibleChange(selectedEventForModal.id, newResponsible)
    }
    handleCloseModals()
  }

  const handleStatusSave = (newStatus: 'open' | 'in-progress' | 'closed', note?: string) => {
    if (selectedEventForModal && onStatusChange) {
      onStatusChange(selectedEventForModal.id, newStatus, note)
    }
    handleCloseModals()
  }

  return (
    <div className="flex-1 overflow-auto bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0 bg-white">
        <h1 className="text-foreground text-[16px]">
          {viewType === 'my-events' ? 'Mis eventos' : 'Eventos'}
        </h1>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6 px-6 pt-6">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Estatus" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="open">Abierto</SelectItem>
            <SelectItem value="in-progress">En progreso</SelectItem>
            <SelectItem value="closed">Cerrado</SelectItem>
          </SelectContent>
        </Select>

        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Severidad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las severidades</SelectItem>
            <SelectItem value="informative">Informativo</SelectItem>
            <SelectItem value="low">Baja</SelectItem>
            <SelectItem value="medium">Media</SelectItem>
            <SelectItem value="high">Alta</SelectItem>
          </SelectContent>
        </Select>

        {/* Solo mostrar filtro de responsable en la vista general de eventos, no en "Mis eventos" */}
        {viewType !== 'my-events' && (
          <Select value={responsibleFilter} onValueChange={setResponsibleFilter}>
            <SelectTrigger className="flex-1">
              {responsibleFilter === "all" ? (
                <SelectValue placeholder="Responsable" />
              ) : (
                <div className="flex items-center gap-3">
                  <Avatar className="w-6 h-6">
                    <AvatarImage 
                      src={responsibleProfiles[responsibleFilter]?.avatar} 
                      alt={`Avatar de ${responsibleProfiles[responsibleFilter]?.name || responsibleFilter}`}
                    />
                    <AvatarFallback className="text-[10px] bg-blue-100 text-blue-700">
                      {responsibleProfiles[responsibleFilter]?.name ? 
                        responsibleProfiles[responsibleFilter].name.split(' ').map(name => name.charAt(0)).join('').toUpperCase().slice(0, 2) :
                        responsibleFilter.split('@')[0].slice(0, 2).toUpperCase()
                      }
                    </AvatarFallback>
                  </Avatar>
                  <TruncatedText 
                    text={responsibleProfiles[responsibleFilter]?.email || responsibleFilter}
                    className="text-[14px] text-foreground"
                  />
                </div>
              )}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los responsables</SelectItem>
              {uniqueResponsibles.map((responsible) => {
                const profile = responsibleProfiles[responsible]
                return (
                  <SelectItem key={responsible} value={responsible}>
                    <div className="flex items-center gap-3 py-1">
                      <Avatar className="w-8 h-8">
                        <AvatarImage 
                          src={profile?.avatar} 
                          alt={`Avatar de ${profile?.name || responsible}`}
                        />
                        <AvatarFallback className="text-[10px] bg-blue-100 text-blue-700">
                          {profile?.name ? 
                            profile.name.split(' ').map(name => name.charAt(0)).join('').toUpperCase().slice(0, 2) :
                            responsible.split('@')[0].slice(0, 2).toUpperCase()
                          }
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-[14px] text-foreground">{profile?.name || responsible}</span>
                        <span className="text-[12px] text-muted-foreground">{profile?.email || responsible}</span>
                      </div>
                    </div>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        )}

        <Select>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Etiquetas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las etiquetas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Events Table */}
      <div className="px-6 pb-6">
        {filteredEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <FileX className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {searchQuery || statusFilter !== "all" || severityFilter !== "all" || responsibleFilter !== "all"
                ? "No se encontraron eventos que coincidan con los filtros" 
                : "No hay eventos registrados"
              }
            </h3>
            <p className="text-muted-foreground text-center max-w-md">
              {searchQuery || statusFilter !== "all" || severityFilter !== "all" || responsibleFilter !== "all"
                ? "Prueba ajustando los criterios de búsqueda o filtros"
                : "Los eventos aparecerán aquí cuando las reglas se activen según las condiciones configuradas"
              }
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border overflow-x-auto">
            <table className="w-full table-fixed min-w-[1200px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-[14px] font-medium text-gray-500 w-32">Identificador</th>
                  <th className="px-6 py-3 text-left text-[14px] font-medium text-gray-500 w-80">Evento</th>
                  <th className="px-6 py-3 text-left text-[14px] font-medium text-gray-500 w-32">Estatus</th>
                  <th className="px-6 py-3 text-left text-[14px] font-medium text-gray-500 w-32">Severidad</th>
                  <th className="px-6 py-3 text-left text-[14px] font-medium text-gray-500 w-40">Fecha de creación</th>
                  <th className="px-6 py-3 text-left text-[14px] font-medium text-gray-500 w-32">Unidad</th>
                  <th className="px-6 py-3 text-left text-[14px] font-medium text-gray-500 w-48">Responsable</th>
                  <th className="px-6 py-3 text-left text-[14px] font-medium text-gray-500 w-24 sticky right-0 bg-gray-50 shadow-[-4px_0_8px_rgba(0,0,0,0.15)] z-10">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEvents.map((event) => {
                  const statusInfo = statusConfig[event.status]
                  const severityInfo = severityConfig[event.severity]

                  return (
                    <tr 
                      key={event.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => onEventClick(event)}
                    >
                      <td className="px-6 py-4 text-[14px] font-medium">
                        <span className="text-blue-600 hover:text-blue-900 hover:underline">
                          {event.id}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[14px] text-gray-900">
                        <TruncatedText 
                          text={event.ruleName}
                          className="pr-2"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {event.status === 'open' && (
                            <>
                              <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                              </div>
                              <span className="text-[14px] text-gray-900">Abierto</span>
                            </>
                          )}
                          {event.status === 'in-progress' && (
                            <>
                              <div className="w-4 h-4 flex-shrink-0">
                                <IconClockCircleOutlined />
                              </div>
                              <span className="text-[14px] text-gray-900">En progreso</span>
                            </>
                          )}
                          {event.status === 'closed' && (
                            <>
                              <div className="w-4 h-4 flex-shrink-0">
                                <IconCheckCircleOutlined />
                              </div>
                              <span className="text-[14px] text-gray-900">Cerrado</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[14px] text-gray-500">
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
                          <span className="text-[12px] font-medium">{severityInfo.label}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[14px] text-gray-500">
                        <TruncatedText 
                          text={formatDate(event.createdAt)}
                          className="pr-2"
                        />
                      </td>
                      <td className="px-6 py-4 text-[14px] font-medium">
                        <span className="text-blue-600 hover:text-blue-900 hover:underline">
                          {event.unitId}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[14px] text-gray-500">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage 
                              src={responsibleProfiles[event.responsible]?.avatar} 
                              alt={`Avatar de ${responsibleProfiles[event.responsible]?.name || event.responsible}`}
                            />
                            <AvatarFallback className="text-[10px] bg-blue-100 text-blue-700">
                              {responsibleProfiles[event.responsible]?.name ? 
                                responsibleProfiles[event.responsible].name.split(' ').map(name => name.charAt(0)).join('').toUpperCase().slice(0, 2) :
                                event.responsible.split('@')[0].slice(0, 2).toUpperCase()
                              }
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <TruncatedText 
                              text={responsibleProfiles[event.responsible]?.email || event.responsible}
                              className="text-[14px] text-foreground"
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[14px] text-gray-500 sticky right-0 bg-white shadow-[-4px_0_8px_rgba(0,0,0,0.15)] z-10">
                        <div className="flex justify-center items-center">
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
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleChangeResponsible(event)
                                }}
                                className="flex items-center gap-2"
                              >
                                <Users className="w-4 h-4" />
                                <span>Cambiar responsable</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleChangeStatus(event)
                                }}
                                className="flex items-center gap-2"
                              >
                                <CheckCircle className="w-4 h-4" />
                                <span>Cambiar estado</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredEvents.length > 0 && (
        <div className="flex items-center justify-center gap-2 pb-6">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            disabled
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-[14px] text-gray-500">
            1
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            disabled
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="text-[14px] text-gray-500 ml-4">
            1 - {filteredEvents.length} Eventos
          </span>
        </div>
      )}

      {/* Modals */}
      {selectedEventForModal && (
        <>
          <ChangeResponsibleModal
            isOpen={showChangeResponsibleModal}
            onClose={handleCloseModals}
            onSave={handleResponsibleSave}
            currentResponsible={selectedEventForModal.responsible}
          />

          <ChangeStatusModal
            isOpen={showChangeStatusModal}
            onClose={handleCloseModals}
            onSave={handleStatusSave}
            currentStatus={selectedEventForModal.status}
          />
        </>
      )}
    </div>
  )
}