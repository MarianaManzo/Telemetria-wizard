import { useState, useMemo } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Badge } from "./ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "./ui/select"
import { 
  Search, 
  Plus, 
  Filter,
  AlertTriangle,
  Clock,
  Settings,
  Star,
  MoreHorizontal,
  MoreVertical,
  FileX
} from "lucide-react"
import { Rule, Event } from "../types"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "./ui/dropdown-menu"

interface RulesListProps {
  rules: Rule[]
  events: Event[]
  onRuleClick: (rule: Rule) => void
  onNewRule: () => void
  onToggleFavorite: (ruleId: string) => void
  onEventClick?: (event: Event) => void
  onStatusChange?: (ruleId: string, newStatus: 'active' | 'inactive') => void
}

const severityConfig = {
  critical: { 
    label: 'Crítico', 
    color: 'text-red-500',
    icon: AlertTriangle
  },
  high: { 
    label: 'Alto', 
    color: 'text-purple-500',
    icon: AlertTriangle
  },
  medium: { 
    label: 'Medio', 
    color: 'text-blue-500',
    icon: Clock
  },
  low: { 
    label: 'Bajo', 
    color: 'text-gray-500',
    icon: Clock
  }
}

const statusConfig = {
  active: { label: 'Activada', color: 'bg-green-100 text-green-800 border-green-200' },
  inactive: { label: 'Desactivada', color: 'bg-gray-100 text-gray-800 border-gray-200' },
  draft: { label: 'Borrador', color: 'bg-orange-100 text-orange-800 border-orange-200' }
}

export function RulesList({ rules, events, onRuleClick, onNewRule, onToggleFavorite, onEventClick, onStatusChange }: RulesListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [severityFilter, setSeverityFilter] = useState<string>("all")

  // Pre-calculate open events count for performance optimization
  const openEventsCountByRuleId = useMemo(() => {
    const countMap: Record<string, number> = {}
    events.forEach(event => {
      if (event.status === 'open') {
        countMap[event.ruleId] = (countMap[event.ruleId] || 0) + 1
      }
    })
    return countMap
  }, [events])

  // Pre-calculate last event for each rule
  const lastEventByRuleId = useMemo(() => {
    const lastEventMap: Record<string, Event> = {}
    events.forEach(event => {
      const currentLast = lastEventMap[event.ruleId]
      if (!currentLast || event.createdAt > currentLast.createdAt) {
        lastEventMap[event.ruleId] = event
      }
    })
    return lastEventMap
  }, [events])

  const filteredRules = rules.filter(rule => {
    const matchesSearch = rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         rule.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         rule.owner.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || rule.status === statusFilter
    const matchesSeverity = severityFilter === "all" || rule.severity === severityFilter
    
    return matchesSearch && matchesStatus && matchesSeverity
  })

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getScopeDescription = (rule: Rule) => {
    if (rule.appliesTo.type === 'units') {
      const count = rule.appliesTo.units?.length || 0
      return `${count} unidad${count !== 1 ? 'es' : ''}`
    } else {
      const count = rule.appliesTo.tags?.length || 0
      return `${count} etiqueta${count !== 1 ? 's' : ''}`
    }
  }

  const getScheduleDescription = (rule: Rule) => {
    if (rule.schedule.type === 'always') {
      return 'Siempre activa'
    } else {
      const dayCount = rule.schedule.days?.length || 0
      const timeCount = rule.schedule.timeRanges?.length || 0
      return `${dayCount} días, ${timeCount} rango${timeCount !== 1 ? 's' : ''}`
    }
  }

  return (
    <div className="flex-1 overflow-auto bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0 bg-white">
        <h1 className="text-foreground text-[16px]">Reglas</h1>
        <div className="flex items-center gap-3">
          <Button 
            onClick={onNewRule}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            size="sm"
            style={{ fontSize: 14, lineHeight: '22px', height: 32, padding: '4px 15px', borderRadius: 8 }}
          >
            Crear regla
          </Button>
        </div>
      </div>

      {/* Filters section removed */}

      {/* Rules Table */}
      <div className="px-6 pb-6 mx-[0px] my-[24px]">
      {filteredRules.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <FileX className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            {searchQuery || statusFilter !== "all" || severityFilter !== "all" 
              ? "No se encontraron reglas que coincidan con los filtros" 
              : "No hay reglas configuradas"
            }
          </h3>
          <p className="text-muted-foreground mb-6 text-center max-w-md">
            {searchQuery || statusFilter !== "all" || severityFilter !== "all"
              ? "Prueba ajustando los criterios de búsqueda o filtros"
              : "Las reglas te permiten monitorear condiciones específicas y generar eventos automáticamente cuando se cumplan"
            }
          </p>
          {(!searchQuery && statusFilter === "all" && severityFilter === "all") && (
            <Button onClick={onNewRule} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Crear primera regla
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-x-auto">
          <table className="w-full table-fixed min-w-[1000px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-[14px] font-medium text-gray-500 w-40">Nombre</th>
                <th className="px-6 py-3 text-left text-[14px] font-medium text-gray-500 w-48">Descripción</th>
                <th className="px-6 py-3 text-left text-[14px] font-medium text-gray-500 w-24">Estado</th>
                <th className="px-6 py-3 text-left text-[14px] font-medium text-gray-500 w-28">Severidad</th>
                <th className="px-6 py-3 text-left text-[14px] font-medium text-gray-500 w-28">Último evento</th>
                <th className="px-6 py-3 text-left text-[14px] font-medium text-gray-500 w-28">Responsable</th>
                <th className="px-4 py-2 text-center text-[14px] font-medium text-gray-500 w-10">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRules.map((rule) => {
                const statusInfo = statusConfig[rule.status]
                const severityInfo = severityConfig[rule.severity]
                const SeverityIcon = severityInfo.icon
                const openEventsCount = openEventsCountByRuleId[rule.id] || 0
                const lastEvent = lastEventByRuleId[rule.id]

                return (
                  <tr 
                    key={rule.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => onRuleClick(rule)}
                  >
                    <td className="px-6 py-4 text-[14px] font-medium">
                      <div className="truncate pr-2" title={rule.name}>
                        <span className="text-blue-600 hover:text-blue-900 hover:underline">
                          {rule.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[14px] text-gray-500">
                      <div className="truncate pr-2" title={rule.description || ''}>
                        {rule.description || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={`${statusInfo.color} text-[12px]`}>
                        {statusInfo.label}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-[14px]">
                      <div className={`flex items-center gap-1 ${severityInfo.color}`}>
                        <SeverityIcon className="w-3 h-3" />
                        <span className="truncate pr-2">{severityInfo.label}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[14px] text-gray-500">
                      {lastEvent ? (
                        <div className="truncate pr-2" title={formatDate(lastEvent.createdAt)}>
                          {formatDate(lastEvent.createdAt)}
                        </div>
                      ) : (
                        <div className="truncate pr-2">
                          Sin eventos
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-[14px] text-gray-500">
                      <div className="truncate pr-2" title={rule.owner}>
                        {rule.owner}
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-[14px] text-gray-500">
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
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onRuleClick(rule) }}>
                              Ver detalles
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                              Editar regla
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                              Duplicar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={(e) => e.stopPropagation()}
                              className="text-destructive"
                            >
                              Eliminar
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
    </div>
  )
}
