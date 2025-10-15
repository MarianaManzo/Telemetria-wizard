import { useState } from "react"
import { Button } from "./ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "./ui/select"
import {
  AlertTriangle,
  Clock,
  FileX,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertOctagon
} from "lucide-react"
import IconCheckCircleOutlined from "../imports/IconCheckCircleOutlined-32006-399"
import { Event, AppView } from "../types"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { ChangeStatusModal } from "./ChangeStatusModal"
import { TruncatedText } from "./TruncatedText"

interface EventsListProps {
  events: Event[]
  onEventClick: (event: Event) => void
  onStatusChange?: (eventId: string, newStatus: 'open' | 'closed', note?: string) => void
  viewType?: AppView
  searchQuery?: string
}

const severityConfig = {
  high: { 
    label: 'Alta', 
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: AlertOctagon
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

const statusConfig: Record<'open' | 'closed', { label: string; color: string }> = {
  open: { label: 'Abierto', color: 'bg-green-100 text-green-800 border-green-200' },
  closed: { label: 'Cerrado', color: 'bg-gray-100 text-gray-800 border-gray-200' }
}

const severityVisuals: Record<Event['severity'], {
  badgeClass: string
  dotBorderClass: string
  dotTextClass: string
  iconColorClass: string
  shapeBgClass: string
}> = {
  high: {
    badgeClass: 'bg-red-100 text-red-700 border-red-200',
    dotBorderClass: 'border-red-500',
    dotTextClass: 'text-red-500',
    iconColorClass: 'text-red-600',
    shapeBgClass: 'bg-red-100'
  },
  medium: {
    badgeClass: 'bg-orange-100 text-orange-700 border-orange-200',
    dotBorderClass: 'border-orange-500',
    dotTextClass: 'text-orange-500',
    iconColorClass: 'text-orange-600',
    shapeBgClass: 'bg-orange-100'
  },
  low: {
    badgeClass: 'bg-blue-100 text-blue-700 border-blue-200',
    dotBorderClass: 'border-blue-500',
    dotTextClass: 'text-blue-500',
    iconColorClass: 'text-blue-600',
    shapeBgClass: 'bg-blue-100'
  },
  informative: {
    badgeClass: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    dotBorderClass: 'border-cyan-500',
    dotTextClass: 'text-cyan-500',
    iconColorClass: 'text-cyan-600',
    shapeBgClass: 'bg-cyan-100'
  }
}

const severityOctagonClipPath = 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)'

export function EventsList({ events, onEventClick, onStatusChange, viewType, searchQuery = "" }: EventsListProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [severityFilter, setSeverityFilter] = useState<string>("all")
  const [selectedEventForModal, setSelectedEventForModal] = useState<Event | null>(null)
  const [showChangeStatusModal, setShowChangeStatusModal] = useState(false)

  const filteredEvents = events.filter(event => {
    const matchesSearch =
      event.unitName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.ruleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || event.status === statusFilter
    const matchesSeverity = severityFilter === "all" || event.severity === severityFilter

    return matchesSearch && matchesStatus && matchesSeverity
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

  const handleChangeStatus = (event: Event) => {
    setSelectedEventForModal(event)
    setShowChangeStatusModal(true)
  }

  const handleCloseModals = () => {
    setSelectedEventForModal(null)
    setShowChangeStatusModal(false)
  }

  const handleStatusSave = (newStatus: 'open' | 'closed', note?: string) => {
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
              {searchQuery || statusFilter !== "all" || severityFilter !== "all"
                ? "No se encontraron eventos que coincidan con los filtros" 
                : "No hay eventos registrados"
              }
            </h3>
            <p className="text-muted-foreground text-center max-w-md">
              {searchQuery || statusFilter !== "all" || severityFilter !== "all"
                ? "Prueba ajustando los criterios de búsqueda o filtros"
                : "Los eventos aparecerán aquí cuando las reglas se activen según las condiciones configuradas"
              }
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border overflow-x-auto">
            <table className="w-full min-w-[1200px] table-auto border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-[14px] font-medium text-gray-500 w-32">Identificador</th>
                  <th className="px-6 py-3 text-left text-[14px] font-medium text-gray-500 w-[22rem]">Evento</th>
                  <th className="px-6 py-3 text-left text-[14px] font-medium text-gray-500 w-44">Inicio del evento</th>
                  <th className="px-6 py-3 text-left text-[14px] font-medium text-gray-500 w-32">Unidad</th>
                  <th className="px-6 py-3 text-left text-[14px] font-medium text-gray-500 w-[18rem]">Ubicación</th>
                  <th className="px-6 py-3 text-left text-[14px] font-medium text-gray-500 w-36">Estatus</th>
                  <th className="px-6 py-3 text-left text-[14px] font-medium text-gray-500 w-36">Severidad</th>
                  <th className="px-6 py-3 text-left text-[14px] font-medium text-gray-500 sticky right-0 bg-gray-50 shadow-[-4px_0_8px_rgba(0,0,0,0.08)] z-20 w-20">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEvents.map((event) => {
                  const statusInfo = statusConfig[event.status]
                  const severityInfo = severityConfig[event.severity]
                  const severityVisual = severityVisuals[event.severity]
                  const SeverityIcon = severityInfo.icon
                  const locationText = event.startAddress || event.endAddress || '---'

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
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span
                            className={`inline-flex h-9 w-9 items-center justify-center ${severityVisual.shapeBgClass}`}
                            style={{ clipPath: severityOctagonClipPath, paddingInline: '8px' }}
                          >
                            <SeverityIcon className={`h-4 w-4 ${severityVisual.iconColorClass}`} />
                          </span>
                          <TruncatedText 
                            text={event.ruleName}
                            className="pr-2 text-[14px] font-medium text-gray-900"
                          />
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
                        <TruncatedText 
                          text={locationText}
                          className="pr-2"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {event.status === 'open' ? (
                            <>
                              <div className="flex h-4 w-4 items-center justify-center rounded-full bg-green-500">
                                <div className="h-1.5 w-1.5 rounded-full bg-white"></div>
                              </div>
                              <span className="text-[14px] text-gray-900">{statusInfo.label}</span>
                            </>
                          ) : (
                            <>
                              <div className="w-4 h-4 flex-shrink-0">
                                <IconCheckCircleOutlined />
                              </div>
                              <span className="text-[14px] text-gray-900">{statusInfo.label}</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[14px] text-gray-500">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${severityVisual.badgeClass}`}>
                          <div className={`w-4 h-4 border rounded-full flex items-center justify-center ${severityVisual.dotBorderClass}`}>
                            <span className={`text-[10px] font-bold ${severityVisual.dotTextClass}`}>!</span>
                          </div>
                          <span className="text-[12px] font-medium">{severityInfo.label}</span>
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
        <ChangeStatusModal
          isOpen={showChangeStatusModal}
          onClose={handleCloseModals}
          onSave={handleStatusSave}
          currentStatus={selectedEventForModal.status}
        />
      )}
    </div>
  )
}
