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
  Users,
  CheckCircle
} from "lucide-react"
import { Event, AppView } from "../types"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"

interface EventsListProps {
  events: Event[]
  onEventClick: (event: Event) => void
  onStatusChange?: (eventId: string, newStatus: 'open' | 'closed') => void
  viewType?: AppView
}

const severityConfig = {
  critical: { 
    label: 'Crítico', 
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: AlertTriangle
  },
  high: { 
    label: 'Alto', 
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: AlertTriangle
  },
  medium: { 
    label: 'Medio', 
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: Clock
  },
  low: { 
    label: 'Bajo', 
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: Clock
  }
}

const statusConfig = {
  open: { label: 'Abierto', color: 'bg-green-100 text-green-800 border-green-200' },
  'in-progress': { label: 'En progreso', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  closed: { label: 'Cerrado', color: 'bg-gray-100 text-gray-800 border-gray-200' }
}

export function EventsList({ events, onEventClick, onStatusChange, viewType }: EventsListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [severityFilter, setSeverityFilter] = useState<string>("all")

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.unitName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.ruleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.responsible.toLowerCase().includes(searchQuery.toLowerCase())
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
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar eventos"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
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
            <SelectItem value="critical">Crítico</SelectItem>
            <SelectItem value="high">Alto</SelectItem>
            <SelectItem value="medium">Medio</SelectItem>
            <SelectItem value="low">Bajo</SelectItem>
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
                        <div className="truncate pr-2" title={event.ruleName}>
                          {event.ruleName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {onStatusChange ? (
                          <Select 
                            value={event.status === 'in-progress' ? 'open' : event.status} 
                            onValueChange={(newStatus: 'open' | 'closed') => {
                              onStatusChange(event.id, newStatus)
                            }}
                          >
                            <SelectTrigger 
                              className={`w-28 h-8 text-[12px] border-0 rounded-full text-white font-medium ${
                                event.status === 'closed' 
                                  ? 'bg-red-500 hover:bg-red-600' 
                                  : 'bg-green-500 hover:bg-green-600'
                              }`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <SelectValue>
                                {event.status === 'closed' ? 'Cerrado' : 'Abierto'}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="open" className="py-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                  <span className="text-green-800 font-medium">Abierto</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="closed" className="py-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                  <span className="text-red-800 font-medium">Cerrado</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge className={`${statusInfo.color} text-[14px] px-3 py-1`}>
                            {statusInfo.label}
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 text-[14px] text-gray-500">
                        <div className="truncate pr-2" title={severityInfo.label}>
                          {severityInfo.label}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[14px] text-gray-500">
                        <div className="truncate pr-2" title={formatDate(event.createdAt)}>
                          {formatDate(event.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[14px] font-medium">
                        <span className="text-blue-600 hover:text-blue-900 hover:underline">
                          {event.unitId}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[14px] text-gray-500">
                        <div className="truncate pr-2" title={event.responsible}>
                          {event.responsible}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-[14px] text-gray-500 sticky right-0 bg-white shadow-[-4px_0_8px_rgba(0,0,0,0.15)] z-10">
                        <div className="flex justify-center items-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="p-2 text-gray-600 hover:text-gray-900 cursor-pointer"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-2"
                              >
                                <Users className="w-4 h-4" />
                                <span>Cambiar responsable</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-2"
                              >
                                <CheckCircle className="w-4 h-4" />
                                <span>Cerrar evento</span>
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
    </div>
  )
}