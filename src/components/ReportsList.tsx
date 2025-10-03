import { useState, useEffect } from "react"
import { 
  Star,
  MoreVertical,
  Download,
  FileX,
  Calendar,
  Trash2,
  Loader2,
  X,
  ChevronDown,
  Grid3X3,
  List,
  Search,
  FileText,
  Check,
  Users,
  Clock,
  Plus,
  Edit,
  Pause,
  Play
} from "lucide-react"
import { toast } from "sonner@2.0.3"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Badge } from "./ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"
import { TruncatedText } from "./TruncatedText"
import { Skeleton } from "./ui/skeleton"
import { SavedReport, ScheduledReport, DraftReport, AppView } from "../types"
import { reportsData, categories } from "../constants/data"
import { getTemplateCategory, getFiltersPreview, formatDateWithTime, getFrequencyLabel, formatNextSend, formatDraftCreationDate, getDraftStateInfo, getFullNameFromEmail } from "../utils/helpers"

interface ReportsListProps {
  currentView: AppView
  savedReports: SavedReport[]
  scheduledReports: ScheduledReport[]
  draftReports: DraftReport[]
  onReportClick: (reportId: number, reportName: string, savedReportData?: SavedReport, draftData?: DraftReport) => void
  onToggleFavorite: (reportId: string) => void
  onDeleteReport: (savedReportData: SavedReport) => void
  onScheduleReport: (savedReportData: SavedReport) => void
  onToggleScheduledActive?: (scheduledId: string) => void
  onDeleteScheduledReport?: (scheduledId: string) => void
  onCreateSchedule?: () => void
  onEditScheduledReport?: (scheduledReport: ScheduledReport) => void
}

export function ReportsList({ 
  currentView, 
  savedReports, 
  scheduledReports,
  draftReports,
  onReportClick, 
  onToggleFavorite,
  onDeleteReport,
  onScheduleReport,
  onToggleScheduledActive,
  onDeleteScheduledReport,
  onCreateSchedule,
  onEditScheduledReport
}: ReportsListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Todas las categorías")
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards')
  const [sortField, setSortField] = useState<string>("")
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  
  // Persistent view mode for templates section (Reportes)
  const [templatesViewMode, setTemplatesViewMode] = useState<'cards' | 'list'>('cards')

  // Handle view mode changes based on current section
  useEffect(() => {
    if (currentView === 'templates') {
      // When entering templates section, restore the user's preferred view (default: cards)
      setViewMode(templatesViewMode)
    } else {
      // For all other sections, always use list view
      setViewMode('list')
    }
  }, [currentView, templatesViewMode])

  // Update templates view preference when user changes view in templates section
  const handleViewModeChange = (newViewMode: 'cards' | 'list') => {
    setViewMode(newViewMode)
    if (currentView === 'templates') {
      setTemplatesViewMode(newViewMode)
    }
  }

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Get sort arrows for column headers
  const getSortArrows = (field: string) => {
    if (sortField !== field) {
      return (
        <div className="ml-1 flex flex-col">
          <div className="w-0 h-0 border-l-2 border-r-2 border-b-3 border-transparent border-b-gray-300"></div>
          <div className="w-0 h-0 border-l-2 border-r-2 border-t-3 border-transparent border-t-gray-300 mt-0.5"></div>
        </div>
      )
    }
    
    return (
      <div className="ml-1">
        {sortDirection === 'asc' ? (
          <div className="w-0 h-0 border-l-2 border-r-2 border-b-3 border-transparent border-b-gray-600"></div>
        ) : (
          <div className="w-0 h-0 border-l-2 border-r-2 border-t-3 border-transparent border-t-gray-600"></div>
        )}
      </div>
    )
  }

  // Get tag color classes
  const getTagColorClasses = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case 'viajes':
        return 'bg-blue-100 text-blue-800'
      case 'combustible':
        return 'bg-green-100 text-green-800'
      case 'mantenimiento':
        return 'bg-orange-100 text-orange-800'
      case 'conductores':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Handle report click wrapper
  const handleReportClick = (id: number, name: string, savedReportData?: any, draftData?: DraftReport) => {
    if (currentView === 'drafts' && draftData) {
      onReportClick(id, name, undefined, draftData);
    } else if (savedReportData) {
      onReportClick(id, name, savedReportData);
    } else {
      onReportClick(id, name);
    }
  }

  // Handle secondary actions
  const handleSecondaryAction = (action: string, report: any) => {
    switch (action) {
      case 'export-pdf':
        console.log('Exportar a PDF:', report.nombre)
        // Show export success toast
        toast.custom((t) => (
          <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-lg border border-gray-200 max-w-md">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-900 font-medium">
                El reporte se ha exportado con éxito.
              </p>
              <p className="text-gray-700">
                En breve comenzará la descarga del archivo solicitado.
              </p>
            </div>
            <button
              onClick={() => toast.dismiss(t)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        ))
        break
      case 'export-csv':
        console.log('Exportar a CSV:', report.nombre)
        // Show export success toast
        toast.custom((t) => (
          <div className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-lg border border-gray-200 max-w-md">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-900 font-medium">
                El reporte se ha exportado con éxito.
              </p>
              <p className="text-gray-700">
                En breve comenzará la descarga del archivo solicitado.
              </p>
            </div>
            <button
              onClick={() => toast.dismiss(t)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        ))
        break
      case 'schedule':
        if (report.savedReportData) {
          onScheduleReport(report.savedReportData)
        }
        break
      default:
        break
    }
  }

  // Get current section title
  const getSectionTitle = () => {
    switch (currentView) {
      case "saved":
        return "Guardados";
      case "favorites":
        return "Favoritos";
      case "drafts":
        return "Borradores";
      case "scheduled":
        return "Programados";
      default:
        return "Reportes";
    }
  }

  // Function to get saved reports for a specific template
  const getSavedReportsForTemplate = (templateName: string) => {
    return savedReports.filter(report => report.originalTemplate === templateName)
  }

  // Function to calculate actual saved reports count for a template
  const getActualSavedCount = (templateName: string) => {
    return savedReports.filter(report => report.originalTemplate === templateName).length
  }

  // Get current data based on active view
  const getCurrentData = () => {
    switch (currentView) {
      case "saved":
        return (savedReports || []).map(report => ({
          id: parseInt(report.id.split('_')[1]) || 0,
          nombre: report.name,
          descripcion: report.description,
          tipo: getTemplateCategory(report.originalTemplate),
          guardados: 0,
          icon: FileText,
          iconBg: "bg-green-100",
          iconColor: "text-green-600",
          savedAt: report.savedAt,
          lastUpdated: report.lastUpdated,
          createdBy: report.createdBy,
          isFavorite: report.isFavorite,
          isGenerating: report.isGenerating,
          savedReportData: report,
          filtersPreview: getFiltersPreview(report.filters)
        }));
      case "favorites":
        return (savedReports || [])
          .filter(report => report.isFavorite)
          .map(report => ({
            id: parseInt(report.id.split('_')[1]) || 0,
            nombre: report.name,
            descripcion: report.description,
            tipo: getTemplateCategory(report.originalTemplate),
            guardados: 0,
            icon: Star,
            iconBg: "bg-yellow-100",
            iconColor: "text-yellow-600",
            savedAt: report.savedAt,
            lastUpdated: report.lastUpdated,
            createdBy: report.createdBy,
            isFavorite: report.isFavorite,
            isGenerating: report.isGenerating,
            savedReportData: report,
            filtersPreview: getFiltersPreview(report.filters)
          }));
      case "scheduled":
        return (scheduledReports || []).map(schedule => ({
          id: parseInt(schedule.id.split('_')[1]) || 0,
          nombre: schedule.name,
          descripcion: schedule.description,
          tipo: getTemplateCategory(schedule.reportTemplate),
          guardados: 0,
          icon: Calendar,
          iconBg: "bg-purple-100",
          iconColor: "text-purple-600",
          createdAt: schedule.createdAt,
          lastSent: schedule.lastSent,
          nextSend: schedule.nextSend,
          createdBy: schedule.createdBy,
          frequency: schedule.frequency,
          isActive: schedule.isActive,
          sentCount: schedule.sentCount,
          scheduledReportData: schedule,
          recipients: schedule.recipients,
          format: schedule.format
        }));
      case "drafts":
        return (draftReports || []).map(draft => ({
          id: parseInt(draft.id.split('_')[1]) || 0,
          nombre: draft.name,
          descripcion: '', // Drafts don't have descriptions
          tipo: "Viajes", // All drafts are "Viajes" category
          guardados: 0,
          icon: FileText,
          iconBg: "bg-gray-100",
          iconColor: "text-gray-600",
          fechaCreacion: formatDraftCreationDate(draft.createdAt),
          estado: getDraftStateInfo(draft.appState).text,
          estadoColor: getDraftStateInfo(draft.appState).colorClass,
          creadoPor: "usuario@email.com",
          draftData: draft
        }));
      default:
        // For templates, calculate actual saved reports count dynamically
        return reportsData.map(template => ({
          ...template,
          guardados: getActualSavedCount(template.nombre)
        }));
    }
  };

  const currentData = getCurrentData();

  // Get sorted reports
  const sortedReports = [...currentData].sort((a, b) => {
    if (!sortField) return 0;

    let aValue: any, bValue: any;

    switch (sortField) {
      case 'nombre':
        aValue = a.nombre?.toLowerCase() || '';
        bValue = b.nombre?.toLowerCase() || '';
        break;
      case 'tipo':
        aValue = a.tipo?.toLowerCase() || '';
        bValue = b.tipo?.toLowerCase() || '';
        break;
      case 'guardados':
        aValue = a.guardados || 0;
        bValue = b.guardados || 0;
        break;
      case 'fechaCreacion':
        // For drafts, use the actual Date object for proper sorting
        if (currentView === 'drafts') {
          aValue = (a as any).draftData?.createdAt?.getTime() || 0;
          bValue = (b as any).draftData?.createdAt?.getTime() || 0;
        } else {
          aValue = (a as any).fechaCreacion || '';
          bValue = (b as any).fechaCreacion || '';
        }
        break;
      case 'estado':
        aValue = (a as any).estado || '';
        bValue = (b as any).estado || '';
        break;
      case 'creadoPor':
        aValue = (a as any).creadoPor || '';
        bValue = (b as any).creadoPor || '';
        break;
      case 'lastUpdated':
        aValue = (a as any).lastUpdated?.getTime() || 0;
        bValue = (b as any).lastUpdated?.getTime() || 0;
        break;
      case 'createdBy':
        aValue = (a as any).createdBy?.toLowerCase() || '';
        bValue = (b as any).createdBy?.toLowerCase() || '';
        break;
      case 'format':
        aValue = (a as any).format?.toLowerCase() || '';
        bValue = (b as any).format?.toLowerCase() || '';
        break;
      case 'isActive':
        aValue = (a as any).isActive ? 1 : 0;
        bValue = (b as any).isActive ? 1 : 0;
        break;
      case 'frequency':
        aValue = (a as any).frequency?.toLowerCase() || '';
        bValue = (b as any).frequency?.toLowerCase() || '';
        break;
      case 'lastSent':
        aValue = (a as any).lastSent?.getTime() || 0;
        bValue = (b as any).lastSent?.getTime() || 0;
        break;
      case 'nextSend':
        aValue = (a as any).nextSend?.getTime() || 0;
        bValue = (b as any).nextSend?.getTime() || 0;
        break;
      default:
        return 0;
    }

    if (typeof aValue === 'string') {
      const comparison = aValue.localeCompare(bValue);
      return sortDirection === 'asc' ? comparison : -comparison;
    } else {
      const comparison = aValue - bValue;
      return sortDirection === 'asc' ? comparison : -comparison;
    }
  });

  return (
    <TooltipProvider>
      <div className="flex-1 bg-white flex flex-col">
        {/* Header with search - Fixed */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <h1 className="text-foreground">{getSectionTitle()}</h1>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar reporte"
                className="pl-9 pr-9 bg-gray-50 border-gray-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Create Schedule Button - only show in scheduled section */}
            {currentView === 'scheduled' && onCreateSchedule && (
              <Button 
                onClick={onCreateSchedule}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear programación
              </Button>
            )}
          </div>
        </div>

        {/* View controls bar - only show in templates section (Reportes) */}
        {currentView === 'templates' && (
          <div className="flex items-center justify-end px-6 py-3 bg-white flex-shrink-0 pt-[24px] pr-[21px] pb-[0px] pl-[21px]">
            {/* Right controls */}
            <div className="flex items-center gap-3">
              {/* Category filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2 text-sm h-9 cursor-pointer">
                    {selectedCategory}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent sideOffset={4} avoidCollisions={true}>
                  {categories.map((category) => (
                    <DropdownMenuItem
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* View toggle buttons */}
              <div className="flex items-center border border-border rounded-lg">
                <Button
                  variant={viewMode === 'cards' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-9 px-3 rounded-r-none border-r cursor-pointer"
                  onClick={() => handleViewModeChange('cards')}
                >
                  <Grid3X3 className="h-4 w-4" />
                  <span className="ml-2 text-sm">Tarjetas</span>
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-9 px-3 rounded-l-none cursor-pointer"
                  onClick={() => handleViewModeChange('list')}
                >
                  <List className="h-4 w-4" />
                  <span className="ml-2 text-sm">Lista</span>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Table view */}
        <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {/* Content Area - Table or Cards View */}
          {(viewMode === 'list' || currentView !== 'templates') ? (
            <>
              {/* Borradores information message */}
              {currentView === 'drafts' && (
                <div className="p-0 mx-0 my-6">
                  <p className="text-sm text-black ml-0">
                    Aquí encontrarás los reportes que generaste pero aún no has guardado. Estos se eliminarán automáticamente después de 30 días.
                  </p>
                </div>
              )}
              <div className="border rounded-lg bg-white overflow-x-auto">
              <Table className="w-full table-fixed">
                <TableHeader>
                  <TableRow className="border-b bg-gray-50">
                    {currentView === 'drafts' ? (
                      <>
                        <TableHead
                          className="text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none w-32"
                          onClick={() => handleSort("fechaCreacion")}
                        >
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center">
                                  Fecha de creación
                                  {getSortArrows("fechaCreacion")}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Haz clic para ordenar por fecha de creación</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableHead>
                        <TableHead
                          className="text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none w-1/3 min-w-0"
                          onClick={() => handleSort("nombre")}
                        >
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center">
                                  Borrador
                                  {getSortArrows("nombre")}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Haz clic para ordenar por nombre del borrador</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableHead>
                        <TableHead
                          className="text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none w-24"
                          onClick={() => handleSort("estado")}
                        >
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center">
                                  Estado
                                  {getSortArrows("estado")}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Haz clic para ordenar por estado del borrador</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableHead>
                        <TableHead
                          className="text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none w-28"
                          onClick={() => handleSort("tipo")}
                        >
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center">
                                  Categoría
                                  {getSortArrows("tipo")}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Haz clic para ordenar por categoría</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableHead>
                        <TableHead
                          className="text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none w-32"
                          onClick={() => handleSort("creadoPor")}
                        >
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center">
                                  Creado por
                                  {getSortArrows("creadoPor")}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Haz clic para ordenar por usuario creador</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableHead>
                      </>
                    ) : currentView === 'templates' ? (
                      <>
                        <TableHead
                          className="text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none"
                          onClick={() => handleSort("nombre")}
                        >
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center">
                                  Nombre del reporte
                                  {getSortArrows("nombre")}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Haz clic para ordenar por nombre del reporte</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableHead>
                        <TableHead className="text-sm font-medium text-muted-foreground w-80">
                          Descripción
                        </TableHead>
                        <TableHead
                          className="text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none"
                          onClick={() => handleSort("tipo")}
                        >
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center">
                                  Tipo
                                  {getSortArrows("tipo")}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Haz clic para ordenar por tipo de reporte</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableHead>
                        <TableHead
                          className="text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none"
                          onClick={() => handleSort("guardados")}
                        >
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center">
                                  Guardados
                                  {getSortArrows("guardados")}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Haz clic para ordenar por cantidad de reportes guardados</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableHead>
                      </>
                     ) : currentView === 'scheduled' ? (
                      <>
                        <TableHead
                          className="text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none w-1/3 min-w-0"
                          onClick={() => handleSort("nombre")}
                        >
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center">
                                  Nombre del reporte
                                  {getSortArrows("nombre")}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Haz clic para ordenar por nombre del reporte programado</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableHead>
                        <TableHead className="text-sm font-medium text-muted-foreground w-1/6 min-w-0">
                          Descripción
                        </TableHead>
                        <TableHead
                          className="text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none w-20"
                          onClick={() => handleSort("format")}
                        >
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center">
                                  Formato
                                  {getSortArrows("format")}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Haz clic para ordenar por formato de exportación</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableHead>
                        <TableHead
                          className="text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none w-16"
                          onClick={() => handleSort("isActive")}
                        >
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center">
                                  Estado
                                  {getSortArrows("isActive")}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Haz clic para ordenar por estado de la programación</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableHead>
                        <TableHead
                          className="text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none w-24"
                          onClick={() => handleSort("frequency")}
                        >
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center">
                                  Frecuencia
                                  {getSortArrows("frequency")}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Haz clic para ordenar por frecuencia de envío</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableHead>
                        <TableHead
                          className="text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none w-28"
                          onClick={() => handleSort("lastSent")}
                        >
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center">
                                  Último envío
                                  {getSortArrows("lastSent")}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Haz clic para ordenar por fecha del último envío</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableHead>
                        <TableHead
                          className="text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none w-28"
                          onClick={() => handleSort("nextSend")}
                        >
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center">
                                  Próximo envío
                                  {getSortArrows("nextSend")}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Haz clic para ordenar por fecha del próximo envío</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableHead>
                        <TableHead className="text-sm font-medium text-muted-foreground w-16">
                        </TableHead>
                      </>
                     ) : (
                      <>
                        <TableHead className="text-sm font-medium text-muted-foreground w-12">
                        </TableHead>
                        <TableHead
                          className="text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none"
                          onClick={() => handleSort("nombre")}
                        >
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center">
                                  Nombre del reporte
                                  {getSortArrows("nombre")}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Haz clic para ordenar por nombre del reporte</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableHead>
                        <TableHead className="text-sm font-medium text-muted-foreground w-80">
                          Descripción
                        </TableHead>
                        <TableHead
                          className="text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none"
                          onClick={() => handleSort("lastUpdated")}
                        >
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center">
                                  Última actualización
                                  {getSortArrows("lastUpdated")}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Haz clic para ordenar por fecha de última actualización</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableHead>
                        <TableHead
                          className="text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none"
                          onClick={() => handleSort("createdBy")}
                        >
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center">
                                  Creado por
                                  {getSortArrows("createdBy")}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Haz clic para ordenar por usuario creador</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableHead>
                        <TableHead className="text-sm font-medium text-muted-foreground w-16">
                        </TableHead>
                      </>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedReports.length > 0 ? (
                    sortedReports.map((report) => (
                      <TableRow
                        key={report.id}
                        className="hover:bg-gray-50"
                      >
                        {currentView === 'drafts' ? (
                          <>
                            <TableCell className="py-4 text-sm text-muted-foreground w-32">
                              {(report as any).fechaCreacion}
                            </TableCell>
                            <TableCell className="py-4 w-1/3 min-w-0">
                              <TruncatedText 
                                text={report.nombre}
                                className="pr-2"
                              >
                                <span 
                                  className="text-blue-600 hover:underline text-sm cursor-pointer"
                                  onClick={() => handleReportClick(report.id, report.nombre, undefined, (report as any).draftData)}
                                >
                                  {report.nombre}
                                </span>
                              </TruncatedText>
                            </TableCell>
                            <TableCell className="py-4 text-sm w-24">
                              <span className={`font-medium ${(report as any).estadoColor || 'text-muted-foreground'}`}>
                                {(report as any).estado}
                              </span>
                            </TableCell>
                            <TableCell className="py-4 text-sm text-muted-foreground w-28">
                              <TruncatedText 
                                text={report.tipo}
                                className="pr-2"
                              />
                            </TableCell>
                            <TableCell className="py-4 text-sm text-muted-foreground w-32">
                              <TruncatedText 
                                text={(report as any).creadoPor}
                                className="pr-2"
                              />
                            </TableCell>
                          </>
                        ) : currentView === 'templates' ? (
                          <>
                            <TableCell className="py-4">
                              <span 
                                className="text-blue-600 hover:underline text-sm cursor-pointer"
                                onClick={() => handleReportClick(report.id, report.nombre)}
                              >
                                {report.nombre}
                              </span>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm py-4 max-w-xs">
                              <TruncatedText 
                                text={(report as any).descripcion}
                              />
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm py-4">
                              {report.tipo}
                            </TableCell>
                            <TableCell className="text-blue-600 text-sm py-4">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <span 
                                    className="cursor-pointer hover:underline"
                                    onClick={(e) => {
                                      e.stopPropagation(); // Prevenir navegación al reporte
                                    }}
                                  >
                                    {(report as any).guardados}
                                  </span>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="w-80">
                                  {/* Sección Favoritos */}
                                  <div className="px-3 py-2">
                                    <div className="text-sm text-gray-500 mb-2">Favoritos</div>
                                    <DropdownMenuItem className="flex items-center gap-2">
                                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                                      <span className="truncate">Viajes diario Dic 2024 Ope...</span>
                                    </DropdownMenuItem>
                                  </div>
                                  
                                  <DropdownMenuSeparator />
                                  
                                  {/* Secci��n Reportes guardados */}
                                  <div className="px-3 py-2">
                                    <div className="text-sm text-gray-500 mb-2">Reportes guardados</div>
                                    <DropdownMenuItem className="py-2">
                                      <span className="truncate">Viajes diario Mayo 2025</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="py-2">
                                      <span className="truncate">Viajes diario Enero 2025 Oper...</span>
                                    </DropdownMenuItem>
                                  </div>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </>
                        ) : currentView === 'scheduled' ? (
                          <>
                            {/* Columna Nombre del reporte */}
                            <TableCell className="py-4 w-1/5 min-w-0">
                              <TruncatedText 
                                text={report.nombre}
                                className="pr-2"
                              >
                                <span className="text-foreground text-sm cursor-pointer">
                                  {report.nombre}
                                </span>
                              </TruncatedText>
                            </TableCell>
                            {/* Columna Descripción */}
                            <TableCell className="text-muted-foreground text-sm py-4 w-32 min-w-0">
                              <TruncatedText 
                                text={(report as any).descripcion}
                                className="pr-2"
                              />
                            </TableCell>
                            {/* Columna Formato */}
                            <TableCell className="text-muted-foreground text-sm py-4 w-20">
                              <TruncatedText 
                                text={(report as any).format}
                                className="pr-2"
                              />
                            </TableCell>
                            {/* Columna Estado */}
                            <TableCell className="text-sm py-4 w-24">
                              <Badge 
                                className={`text-xs px-2 py-1 ${
                                  (report as any).isActive 
                                    ? 'bg-green-100 text-green-700 hover:bg-green-100' 
                                    : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100'
                                }`}
                              >
                                {(report as any).isActive ? 'Activo' : 'Pausado'}
                              </Badge>
                            </TableCell>
                            {/* Columna Frecuencia */}
                            <TableCell className="text-muted-foreground text-sm py-4 w-24">
                              <TruncatedText 
                                text={getFrequencyLabel((report as any).frequency)}
                                className="pr-2"
                              />
                            </TableCell>
                            {/* Columna Último envío */}
                            <TableCell className="text-muted-foreground text-sm py-4 w-28">
                              <TruncatedText 
                                text={(report as any).lastSent ? formatDateWithTime((report as any).lastSent) : 'Sin envíos'}
                                className="pr-2"
                              />
                            </TableCell>
                            {/* Columna Próximo envío */}
                            <TableCell className="text-muted-foreground text-sm py-4 w-28">
                              <TruncatedText 
                                text={formatNextSend((report as any).nextSend)}
                                className="pr-2"
                              />
                            </TableCell>
                            {/* Columna Acciones secundarias */}
                            <TableCell className="py-4">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem 
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      onEditScheduledReport((report as any).scheduledReportData)
                                    }}
                                  >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      onToggleScheduledActive((report as any).scheduledReportData?.id || report.id.toString())
                                    }}
                                  >
                                    {(report as any).isActive ? (
                                      <>
                                        <Pause className="mr-2 h-4 w-4" />
                                        Pausar
                                      </>
                                    ) : (
                                      <>
                                        <Play className="mr-2 h-4 w-4" />
                                        Activar
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    className="group text-red-600 hover:bg-red-600 hover:text-white focus:bg-red-600 focus:text-white data-[highlighted]:bg-red-600 data-[highlighted]:text-white"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      onDeleteScheduledReport((report as any).scheduledReportData?.id || report.id.toString())
                                    }}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4 text-red-600 group-hover:text-white group-focus:text-white group-data-[highlighted]:text-white" />
                                    Eliminar
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </>
                        ) : (
                          <>
                            {/* Columna Favorito */}
                            <TableCell className="py-4 text-center">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onToggleFavorite((report as any).savedReportData?.id || report.id.toString())
                                }}
                                className="text-yellow-500 hover:text-yellow-600 transition-colors cursor-pointer"
                              >
                                <Star 
                                  className={`w-4 h-4 ${(report as any).isFavorite ? 'fill-yellow-500' : ''}`} 
                                />
                              </button>
                            </TableCell>
                            {/* Columna Nombre del reporte */}
                            <TableCell className="py-4">
                              <TruncatedText 
                                text={report.nombre}
                                className="pr-2"
                              >
                                <span 
                                  className="text-blue-600 hover:underline text-sm cursor-pointer"
                                  onClick={() => handleReportClick(report.id, report.nombre, (report as any).savedReportData)}
                                >
                                  {report.nombre}
                                </span>
                              </TruncatedText>
                            </TableCell>
                            {/* Columna Descripción */}
                            <TableCell className="text-muted-foreground text-sm py-4 max-w-xs">
                              <TruncatedText 
                                text={(report as any).descripcion}
                              />
                            </TableCell>
                            {/* Columna Última actualización */}
                            <TableCell className="text-muted-foreground text-sm py-4">
                              {(report as any).lastUpdated ? formatDateWithTime((report as any).lastUpdated) : '--'}
                            </TableCell>
                            {/* Columna Creado por */}
                            <TableCell className="text-muted-foreground text-sm py-4">
                              {getFullNameFromEmail((report as any).createdBy)}
                            </TableCell>
                            {/* Columna Acciones secundarias */}
                            <TableCell className="py-4">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem 
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleSecondaryAction('export-pdf', { nombre: report.nombre, savedReportData: (report as any).savedReportData })
                                    }}
                                  >
                                    <Download className="mr-2 h-4 w-4" />
                                    Exportar a PDF
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleSecondaryAction('export-csv', { nombre: report.nombre, savedReportData: (report as any).savedReportData })
                                    }}
                                  >
                                    <Download className="mr-2 h-4 w-4" />
                                    Exportar a CSV
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleSecondaryAction('schedule', { nombre: report.nombre, savedReportData: (report as any).savedReportData })
                                    }}
                                  >
                                    <Calendar className="mr-2 h-4 w-4" />
                                    Programar envío
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    className="group text-red-600 hover:bg-red-600 hover:text-white focus:bg-red-600 focus:text-white data-[highlighted]:bg-red-600 data-[highlighted]:text-white"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      if ((report as any).savedReportData) {
                                        onDeleteReport((report as any).savedReportData)
                                      }
                                    }}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4 text-red-600 group-hover:text-white group-focus:text-white group-data-[highlighted]:text-white" />
                                    Eliminar
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={currentView === 'drafts' ? 5 : currentView === 'templates' ? 4 : currentView === 'scheduled' ? 8 : 6}
                        className="text-center py-8 text-muted-foreground"
                      >
                        {searchTerm ||
                        selectedCategory !== "Todas las categorías"
                          ? "No se encontraron reportes que coincidan con los filtros."
                          : "No hay reportes disponibles."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            </>
          ) : (
            /* Cards View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedReports.length > 0 ? (
                sortedReports.map((report) => {
                  const IconComponent = report.icon;
                  return (
                    <div
                      key={report.id}
                      className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow cursor-pointer relative flex flex-col"
                      onClick={() => handleReportClick(report.id, report.nombre)}
                    >
                      {currentView === 'drafts' ? (
                        /* Borradores Card Layout */
                        <>
                          {/* Header with icon */}
                          <div className="flex items-start gap-3 mb-4">
                            <div className={`p-2.5 rounded-lg ${report.iconBg} flex-shrink-0`}>
                              <IconComponent className={`h-5 w-5 ${report.iconColor}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-medium text-foreground leading-tight mb-2">
                                {report.nombre}
                              </h3>
                              <Badge className={`text-xs px-2 py-1 ${getTagColorClasses(report.tipo)}`}>
                                {report.tipo}
                              </Badge>
                            </div>
                          </div>

                          {/* Content for borradores - takes remaining space */}
                          <div className="space-y-3 flex-1">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Fecha:</span>
                              <span className="text-foreground font-medium">
                                {(report as any).fechaCreacion}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Estado:</span>
                              <span className={`font-medium ${
                                (report as any).estado === 'Generado' 
                                  ? 'text-green-600' 
                                  : (report as any).estado === 'Generando...' 
                                  ? 'text-blue-600' 
                                  : (report as any).estado === 'En progreso'
                                  ? 'text-orange-600'
                                  : 'text-muted-foreground'
                              }`}>
                                {(report as any).estado}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Creado por:</span>
                              <span className="text-foreground font-medium truncate ml-2">
                                {(report as any).creadoPor}
                              </span>
                            </div>
                          </div>
                        </>
                      ) : (
                        /* Reports Card Layout - Consistent height with aligned "Guardados" */
                        <>
                          {/* Header with icon in top left */}
                          <div className="flex items-start gap-3 mb-4">
                            <div className={`p-2.5 rounded-lg ${report.iconBg} flex-shrink-0`}>
                              <IconComponent className={`h-5 w-5 ${report.iconColor}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-medium text-foreground leading-tight mb-2">
                                {report.nombre}
                              </h3>
                              <Badge className={`text-xs px-2 py-1 ${getTagColorClasses(report.tipo)}`}>
                                {report.tipo}
                              </Badge>
                            </div>
                          </div>

                          {/* Description - truncated to 2 lines */}
                          <div className="mb-6">
                            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                              {(report as any).descripcion}
                            </p>
                          </div>

                          {/* Guardados section */}
                          <div className="flex justify-end">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <span 
                                  className="text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation(); // Prevenir navegación al reporte
                                  }}
                                >
                                  {(report as any).guardados} Guardados
                                </span>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-80">
                                {/* Sección Favoritos */}
                                <div className="px-3 py-2">
                                  <div className="text-sm text-gray-500 mb-2">Favoritos</div>
                                  <DropdownMenuItem className="flex items-center gap-2">
                                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                                    <span className="truncate">Viajes diario Dic 2024 Ope...</span>
                                  </DropdownMenuItem>
                                </div>
                                
                                <DropdownMenuSeparator />
                                
                                {/* Sección Reportes guardados */}
                                <div className="px-3 py-2">
                                  <div className="text-sm text-gray-500 mb-2">Reportes guardados</div>
                                  <DropdownMenuItem className="py-2">
                                    <span className="truncate">Viajes diario Mayo 2025</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="py-2">
                                    <span className="truncate">Viajes diario Enero 2025 Oper...</span>
                                  </DropdownMenuItem>
                                </div>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  {searchTerm ||
                  selectedCategory !== "Todas las categorías"
                    ? "No se encontraron reportes que coincidan con los filtros."
                    : "No hay reportes disponibles."}
                </div>
              )}
            </div>
          )}
        </div>
        </div>
      </div>
    </TooltipProvider>
  )
}