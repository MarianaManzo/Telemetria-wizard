import { useState, useMemo, type ReactNode } from "react"
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
  FileX,
  Edit,
  Copy,
  Trash2
} from "lucide-react"
import { Rule, Event } from "../types"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "./ui/dropdown-menu"
import { Switch } from "./ui/switch"
import { DeleteRuleModal } from "./DeleteRuleModal"
import { RenameRuleModal } from "./RenameRuleModal"
import { TruncatedText } from "./TruncatedText"
import { ColumnSettingsPopover } from "./ColumnSettingsModal"
import { useColumnPreferences } from "../hooks/useColumnPreferences"

interface RulesListProps {
  rules: Rule[]
  events: Event[]
  onRuleClick: (rule: Rule) => void
  onNewRule: () => void
  onToggleFavorite: (ruleId: string) => void
  onEventClick?: (event: Event) => void
  onStatusChange?: (ruleId: string, newStatus: 'active' | 'inactive') => void
  onRename?: (ruleId: string, newName: string, newDescription?: string) => void
  onDelete?: (ruleId: string) => void
  onDuplicate?: (rule: Rule) => void
}

const severityConfig = {
  high: { 
    label: 'Alta', 
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
    iconColor: 'text-red-500',
    icon: AlertTriangle
  },
  medium: { 
    label: 'Media', 
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-700',
    iconColor: 'text-orange-500',
    icon: AlertTriangle
  },
  low: { 
    label: 'Baja', 
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    iconColor: 'text-blue-500',
    icon: AlertTriangle
  },
  informative: { 
    label: 'Informativo', 
    bgColor: 'bg-cyan-100',
    textColor: 'text-cyan-700',
    iconColor: 'text-cyan-500',
    icon: AlertTriangle
  }
}

type RulesTableColumnDefinition = {
  id: string
  label: string
  headerClassName: string
  cellClassName: string
  render: (rule: Rule) => React.ReactNode
}

const statusConfig = {
  active: { label: 'Activado', color: 'text-blue-600' },
  inactive: { label: 'Desactivado', color: 'text-gray-500' },
  draft: { label: 'Borrador', color: 'text-orange-600' }
}

export function RulesList({ rules, events, onRuleClick, onNewRule, onToggleFavorite, onEventClick, onStatusChange, onRename, onDelete, onDuplicate }: RulesListProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [severityFilter, setSeverityFilter] = useState<string>("all")
  const hasActiveFilters = statusFilter !== "all" || severityFilter !== "all"
  
  // Modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [renameModalOpen, setRenameModalOpen] = useState(false)
  const [selectedRuleForModal, setSelectedRuleForModal] = useState<Rule | null>(null)

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

  const rulesTableColumns: RulesTableColumnDefinition[] = [
    {
      id: 'name',
      label: 'Nombre',
      headerClassName: 'px-6 py-3 text-left text-[14px] font-medium text-gray-500 w-40',
      cellClassName: 'px-6 py-4 text-[14px] font-medium',
      render: (rule) => (
        <TruncatedText text={rule.name} className="pr-2">
          <span className="text-blue-600 hover:text-blue-900 hover:underline">{rule.name}</span>
        </TruncatedText>
      )
    },
    {
      id: 'description',
      label: 'Descripción',
      headerClassName: 'px-6 py-3 text-left text-[14px] font-medium text-gray-500 w-48',
      cellClassName: 'px-6 py-4 text-[14px] text-gray-500',
      render: (rule) => <TruncatedText text={rule.description || '-'} className="pr-2" />
    },
    {
      id: 'status',
      label: 'Estado',
      headerClassName: 'px-6 py-3 text-left text-[14px] font-medium text-gray-500 w-24',
      cellClassName: 'px-6 py-4 text-[14px]',
      render: (rule) => {
        const statusInfo = statusConfig[rule.status]
        return (
          <div className="truncate pr-2">
            <span className={`font-medium ${statusInfo.color}`}>{statusInfo.label}</span>
          </div>
        )
      }
    },
    {
      id: 'severity',
      label: 'Severidad',
      headerClassName: 'px-6 py-3 text-left text-[14px] font-medium text-gray-500 w-28',
      cellClassName: 'px-6 py-4 text-[14px]',
      render: (rule) => {
        const severityInfo = severityConfig[rule.severity]
        const SeverityIcon = severityInfo.icon
        return (
          <div className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-[8px] ${severityInfo.bgColor}`}>
            <SeverityIcon className={`w-4 h-4 ${severityInfo.iconColor}`} />
            <span className={`text-[12px] font-medium ${severityInfo.textColor}`}>{severityInfo.label}</span>
          </div>
        )
      }
    },
    {
      id: 'last-event',
      label: 'Último evento',
      headerClassName: 'px-6 py-3 text-left text-[14px] font-medium text-gray-500 w-28 whitespace-nowrap',
      cellClassName: 'px-6 py-4 text-[14px] text-gray-500',
      render: (rule) => {
        const lastEvent = lastEventByRuleId[rule.id]
        return lastEvent ? (
          <TruncatedText text={formatDate(lastEvent.createdAt)} className="pr-2" />
        ) : (
          <TruncatedText text="Sin eventos" className="pr-2" />
        )
      }
    },
    {
      id: 'actions',
      label: 'Acciones',
      headerClassName: 'px-6 py-3 text-left text-[14px] font-medium text-gray-500 w-24 sticky right-0 bg-gray-50 shadow-[-4px_0_8px_rgba(0,0,0,0.15)] z-10',
      cellClassName: 'px-6 py-4 whitespace-nowrap text-[14px] text-gray-500 sticky right-0 bg-white shadow-[-4px_0_8px_rgba(0,0,0,0.15)] z-10',
      render: (rule) => (
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
                  e.stopPropagation(); 
                  handleOpenRenameModal(rule);
                }}
                className="flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                <span className="pt-[0px] pr-[0px] pb-[0px] pl-[8px]">Renombrar</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  onDuplicate?.(rule);
                }}
                className="flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                <span className="pt-[0px] pr-[0px] pb-[0px] pl-[8px]">Duplicar</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  handleToggleStatus(rule);
                }}
                className="flex items-center gap-2"
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  <Switch
                    checked={rule.status === 'active'}
                    onCheckedChange={() => {}}
                    className="switch-blue scale-75 pointer-events-none"
                  />
                </div>
                <span className="pt-[0px] pr-[0px] pb-[0px] pl-[8px]">{rule.status === 'active' ? 'Desactivar regla' : 'Activar regla'}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  handleOpenDeleteModal(rule);
                }}
                className="flex items-center gap-2 text-destructive"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
                <span className="pt-[0px] pr-[0px] pb-[0px] pl-[8px]">Eliminar regla</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    }
  ]

  const defaultColumnPreferences = rulesTableColumns.map((column) => ({
    id: column.id,
    label: column.label,
    enabled: true
  }))

  const {
    columns: columnPreferences,
    visibleColumns: visibleColumnPreferences,
    setColumns: setColumnPreferences
  } = useColumnPreferences('rules-list-columns', defaultColumnPreferences)

  const columnsById = useMemo(() => {
    const map = new Map<string, RulesTableColumnDefinition>()
    rulesTableColumns.forEach((column) => map.set(column.id, column))
    return map
  }, [rulesTableColumns])

  const orderedColumns = visibleColumnPreferences
    .map((pref) => columnsById.get(pref.id))
    .filter((column): column is RulesTableColumnDefinition => Boolean(column))

  const filteredRules = rules.filter(rule => {
    const matchesStatus = statusFilter === "all" || rule.status === statusFilter
    const matchesSeverity = severityFilter === "all" || rule.severity === severityFilter
    return matchesStatus && matchesSeverity
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

  // Modal handlers
  const handleOpenDeleteModal = (rule: Rule) => {
    setSelectedRuleForModal(rule)
    setDeleteModalOpen(true)
  }

  const handleOpenRenameModal = (rule: Rule) => {
    setSelectedRuleForModal(rule)
    setRenameModalOpen(true)
  }

  const handleCloseModals = () => {
    setDeleteModalOpen(false)
    setRenameModalOpen(false)
    setSelectedRuleForModal(null)
  }

  const handleConfirmDelete = () => {
    if (selectedRuleForModal && onDelete) {
      onDelete(selectedRuleForModal.id)
    }
    handleCloseModals()
  }

  const handleConfirmRename = (ruleId: string, newName: string, newDescription?: string) => {
    if (onRename) {
      onRename(ruleId, newName, newDescription)
    }
    handleCloseModals()
  }

  const handleToggleStatus = (rule: Rule) => {
    if (onStatusChange) {
      const newStatus = rule.status === 'active' ? 'inactive' : 'active'
      onStatusChange(rule.id, newStatus)
    }
  }

  return (
    <div className="flex-1 overflow-auto bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0 bg-white">
        <h1 className="text-foreground" style={{ fontSize: '18px', lineHeight: '24px' }}>
          Reglas
        </h1>
        <div className="flex items-center gap-3">
          <Button 
            onClick={onNewRule}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva regla
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 pt-6 pb-4 border-b border-gray-100 bg-white">
        <div className="flex flex-wrap items-center gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="min-w-[200px]">
              <SelectValue placeholder="Todos los estados" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="active">Activadas</SelectItem>
              <SelectItem value="inactive">Desactivadas</SelectItem>
              <SelectItem value="draft">Borradores</SelectItem>
            </SelectContent>
          </Select>

          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="min-w-[200px]">
              <SelectValue placeholder="Todas las severidades" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las severidades</SelectItem>
              <SelectItem value="informative">Informativo</SelectItem>
              <SelectItem value="low">Baja</SelectItem>
              <SelectItem value="medium">Media</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="link"
            className="h-auto px-0 flex-shrink-0"
            onClick={() => {
              setStatusFilter("all")
              setSeverityFilter("all")
            }}
            disabled={!hasActiveFilters}
          >
            Limpiar todo
          </Button>
        </div>
      </div>

      {/* Rules Table */}
      <div className="px-6 pb-6 mx-[0px] my-[24px]">
      {filteredRules.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <FileX className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            {statusFilter !== "all" || severityFilter !== "all" 
              ? "No se encontraron reglas que coincidan con los filtros" 
              : "No hay reglas configuradas"
            }
          </h3>
          <p className="text-muted-foreground mb-6 text-center max-w-md">
            {statusFilter !== "all" || severityFilter !== "all"
              ? "Prueba ajustando los criterios de búsqueda o filtros"
              : "Las reglas te permiten monitorear condiciones específicas y generar eventos automáticamente cuando se cumplan"
            }
          </p>
          {(statusFilter === "all" && severityFilter === "all") && (
            <Button onClick={onNewRule} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Crear primera regla
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-x-auto">
          <table className="w-full table-fixed min-w-[1200px]">
            <thead className="bg-gray-50">
              <tr>
                {orderedColumns.map((column) => (
                  <th key={column.id} className={column.headerClassName}>
                    {column.id === 'actions' ? (
                      <div className="flex justify-center">
                        <ColumnSettingsPopover
                          columns={columnPreferences}
                          onApply={setColumnPreferences}
                        />
                      </div>
                    ) : (
                      column.label
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRules.map((rule) => (
                <tr
                  key={rule.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => onRuleClick(rule)}
                >
                  {orderedColumns.map((column) => (
                    <td key={column.id} className={column.cellClassName}>
                      {column.render(rule)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      </div>

      {/* Modales */}
      <DeleteRuleModal
        isOpen={deleteModalOpen}
        onClose={handleCloseModals}
        onConfirmDelete={handleConfirmDelete}
        ruleName={selectedRuleForModal?.name || ""}
      />

      <RenameRuleModal
        isOpen={renameModalOpen}
        onClose={handleCloseModals}
        onRename={handleConfirmRename}
        rule={selectedRuleForModal}
      />

    </div>
  )
}
