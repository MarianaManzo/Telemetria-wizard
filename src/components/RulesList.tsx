import { useState, useMemo } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Badge } from "./ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar"
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
import { DuplicateRuleModal } from "./DuplicateRuleModal"
import { TruncatedText } from "./TruncatedText"

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
  onDuplicate?: (ruleData: Partial<Rule>) => void
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

const statusConfig = {
  active: { label: 'Activado', color: 'text-blue-600' },
  inactive: { label: 'Desactivado', color: 'text-gray-500' },
  draft: { label: 'Borrador', color: 'text-orange-600' }
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
  },
  'jefe-seguridad': {
    name: 'Jefe de Seguridad',
    email: 'seguridad@numaris.com',
    avatar: 'https://images.unsplash.com/photo-1755033016-0ed3cef4ad61?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMG1hbiUyMHByb2Zlc3Npb25hbCUyMGV4ZWN1dGl2ZXxlbnwxfHx8fDE3NTg2NDIwNjJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
  },
  'supervisor-logistica': {
    name: 'Supervisor de Logística',
    email: 'logistica@numaris.com',
    avatar: 'https://images.unsplash.com/photo-1745053227142-bbabcf52b92c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHdvbWFuJTIwcHJvZmVzc2lvbmFsfGVufDF8fHx8MTc1ODY0NzI1NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
  },
  'coordinador-operaciones': {
    name: 'Coordinador de Operaciones',
    email: 'operaciones@numaris.com',
    avatar: 'https://images.unsplash.com/photo-1524538198441-241ff79d153b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMG1hbiUyMHByb2Zlc3Npb25hbCUyMGV4ZWN1dGl2ZXxlbnwxfHx8fDE3NTg2NDIwNjJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
  }
}

export function RulesList({ rules, events, onRuleClick, onNewRule, onToggleFavorite, onEventClick, onStatusChange, onRename, onDelete, onDuplicate }: RulesListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [severityFilter, setSeverityFilter] = useState<string>("all")
  
  // Modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [renameModalOpen, setRenameModalOpen] = useState(false)
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false)
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

  // Modal handlers
  const handleOpenDeleteModal = (rule: Rule) => {
    setSelectedRuleForModal(rule)
    setDeleteModalOpen(true)
  }

  const handleOpenRenameModal = (rule: Rule) => {
    setSelectedRuleForModal(rule)
    setRenameModalOpen(true)
  }

  const handleOpenDuplicateModal = (rule: Rule) => {
    setSelectedRuleForModal(rule)
    setDuplicateModalOpen(true)
  }

  const handleCloseModals = () => {
    setDeleteModalOpen(false)
    setRenameModalOpen(false)
    setDuplicateModalOpen(false)
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

  const handleConfirmDuplicate = (ruleData: Partial<Rule>) => {
    if (onDuplicate) {
      onDuplicate(ruleData)
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
          <table className="w-full table-fixed min-w-[1200px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-[14px] font-medium text-gray-500 w-40">Nombre</th>
                <th className="px-6 py-3 text-left text-[14px] font-medium text-gray-500 w-48">Descripción</th>
                <th className="px-6 py-3 text-left text-[14px] font-medium text-gray-500 w-24">Estado</th>
                <th className="px-6 py-3 text-left text-[14px] font-medium text-gray-500 w-28">Severidad</th>
                <th className="px-6 py-3 text-left text-[14px] font-medium text-gray-500 w-28">Último evento</th>
                <th className="px-6 py-3 text-left text-[14px] font-medium text-gray-500 w-48">Responsable</th>
                <th className="px-6 py-3 text-left text-[14px] font-medium text-gray-500 w-24 sticky right-0 bg-gray-50 shadow-[-4px_0_8px_rgba(0,0,0,0.15)] z-10">Acciones</th>
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
                      <TruncatedText 
                        text={rule.name}
                        className="pr-2"
                      >
                        <span className="text-blue-600 hover:text-blue-900 hover:underline">
                          {rule.name}
                        </span>
                      </TruncatedText>
                    </td>
                    <td className="px-6 py-4 text-[14px] text-gray-500">
                      <TruncatedText 
                        text={rule.description || '-'}
                        className="pr-2"
                      />
                    </td>
                    <td className="px-6 py-4 text-[14px]">
                      <div className="truncate pr-2">
                        <span className={`font-medium ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[14px]">
                      <div className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full ${severityInfo.bgColor}`}>
                        <SeverityIcon className={`w-4 h-4 ${severityInfo.iconColor}`} />
                        <span className={`text-[12px] font-medium ${severityInfo.textColor}`}>{severityInfo.label}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[14px] text-gray-500">
                      {lastEvent ? (
                        <TruncatedText 
                          text={formatDate(lastEvent.createdAt)}
                          className="pr-2"
                        />
                      ) : (
                        <TruncatedText 
                          text="Sin eventos"
                          className="pr-2"
                        />
                      )}
                    </td>
                    <td className="px-6 py-4 text-[14px] text-gray-500">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage 
                            src={responsibleProfiles[rule.eventSettings?.responsible]?.avatar} 
                            alt={`Avatar de ${responsibleProfiles[rule.eventSettings?.responsible]?.name || rule.eventSettings?.responsible}`}
                          />
                          <AvatarFallback className="text-[10px] bg-blue-100 text-blue-700">
                            {responsibleProfiles[rule.eventSettings?.responsible]?.name ? 
                              responsibleProfiles[rule.eventSettings.responsible].name.split(' ').map(name => name.charAt(0)).join('').toUpperCase().slice(0, 2) :
                              (rule.eventSettings?.responsible || rule.owner).split('@')[0].slice(0, 2).toUpperCase()
                            }
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <TruncatedText 
                            text={responsibleProfiles[rule.eventSettings?.responsible]?.email || rule.eventSettings?.responsible || rule.owner}
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
                                handleOpenDuplicateModal(rule);
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
                                  onCheckedChange={() => {}} // Empty handler since we handle the click on the parent
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
                    </td>
                  </tr>
                )
              })}
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

      <DuplicateRuleModal
        isOpen={duplicateModalOpen}
        onClose={handleCloseModals}
        onDuplicate={handleConfirmDuplicate}
        rule={selectedRuleForModal}
      />
    </div>
  )
}
