import { useState } from "react"
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
  Plus
} from "lucide-react"
import { toast } from "sonner@2.0.3"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
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
import { Skeleton } from "./ui/skeleton"
import { SavedReport, ScheduledReport, AppView } from "../types"
import { reportsData, categories } from "../constants/data"
import { getTemplateCategory, getFiltersPreview, formatDateWithTime, getFrequencyLabel, formatNextSend } from "../utils/helpers"

interface ReportsListProps {
  currentView: AppView
  savedReports: SavedReport[]
  scheduledReports: ScheduledReport[]
  onReportClick: (reportId: number, reportName: string, savedReportData?: SavedReport) => void
  onToggleFavorite: (reportId: string) => void
  onDeleteReport: (savedReportData: SavedReport) => void
  onScheduleReport: (savedReportData: SavedReport) => void
  onToggleScheduledActive?: (scheduledId: string) => void
  onDeleteScheduledReport?: (scheduledId: string) => void
  onCreateSchedule?: () => void
}

export function ReportsList({ 
  currentView, 
  savedReports, 
  scheduledReports,
  onReportClick, 
  onToggleFavorite,
  onDeleteReport,
  onScheduleReport,
  onToggleScheduledActive,
  onDeleteScheduledReport,
  onCreateSchedule
}: ReportsListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Todas las categorías")
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('list')

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
              </Flex>
            </Flex>
            <div className="flex-1 min-w-0">
              <p className="text-gray-900 font-medium">
                El reporte se ha exportado con éxito.
              </p>
              <p className="text-gray-700">
                En breve comenzará la descarga del archivo solicitado.
              </p>
            </Flex>
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
          </Flex>
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
              </Flex>
            </Flex>
            <div className="flex-1 min-w-0">
              <p className="text-gray-900 font-medium">
                El reporte se ha exportado con éxito.
              </p>
              <p className="text-gray-700">
                En breve comenzará la descarga del archivo solicitado.
              </p>
            </Flex>
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
          </Flex>
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
        return []; // Empty array for disabled section
      default:
        // For templates, calculate actual saved reports count dynamically
        return reportsData.map(template => ({
          ...template,
          guardados: getActualSavedCount(template.nombre)
        }));
    }
  };

  const currentData = getCurrentData();

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
            </Flex>

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
          </Flex>
        </Flex>

        {/* View controls bar - only show in templates section (Reportes) */}
        {currentView === 'templates' && (
          <div className="flex items-center justify-end px-6 py-3 bg-white flex-shrink-0">
            {/* Right controls */}
            <div className="flex items-center gap-3">
              {/* Category filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2 text-sm h-9">
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
                  variant={viewMode === 'cards' ? 'default' : 'ghost'}
                  size="sm"
                  className="h-9 px-3 rounded-r-none border-r"
                  onClick={() => setViewMode('cards')}
                >
                  <Grid3X3 className="h-4 w-4" />
                  <span className="ml-2 text-sm">Tarjetas</span>
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  className="h-9 px-3 rounded-l-none"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                  <span className="ml-2 text-sm">Lista</span>
                </Button>
              </Flex>
            </Flex>
          </Flex>
        )}

        {/* Table view */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="border rounded-lg bg-white overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b bg-gray-50">
                      <TableHead className="text-sm font-medium text-muted-foreground">
                        Nombre del reporte
                      </TableHead>
                      <TableHead className="text-sm font-medium text-muted-foreground w-80">
                        Descripción
                      </TableHead>
                      {(currentView === "saved" || currentView === "favorites") ? (
                        <>
                          <TableHead className="text-sm font-medium text-muted-foreground">
                            Última actualización
                          </TableHead>
                          <TableHead className="text-sm font-medium text-muted-foreground">
                            Creado por
                          </TableHead>
                          <TableHead className="w-12"></TableHead>
                        </>
                      ) : currentView === "scheduled" ? (
                        <>
                          <TableHead className="text-sm font-medium text-muted-foreground">
                            Formato
                          </TableHead>
                          <TableHead className="text-sm font-medium text-muted-foreground">
                            Estado
                          </TableHead>
                          <TableHead className="text-sm font-medium text-muted-foreground">
                            Frecuencia
                          </TableHead>
                          <TableHead className="text-sm font-medium text-muted-foreground">
                            Último envío
                          </TableHead>
                          <TableHead className="text-sm font-medium text-muted-foreground">
                            Próximo envío
                          </TableHead>
                          <TableHead className="w-12"></TableHead>
                        </>
                      ) : (
                        <>
                          <TableHead className="text-sm font-medium text-muted-foreground">
                            Tipo
                          </TableHead>
                          <TableHead className="text-sm font-medium text-muted-foreground">
                            Guardados
                          </TableHead>
                        </>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentData.length === 0 ? (
                      <TableRow>
                        <TableCell 
                          colSpan={
                            (currentView === "saved" || currentView === "favorites") ? 5 : 
                            currentView === "scheduled" ? 8 : 4
                          } 
                          className="text-center py-8 text-muted-foreground"
                        >
                          {currentView === "saved" && "No tienes reportes guardados"}
                          {currentView === "favorites" && "No tienes reportes favoritos"}
                          {currentView === "drafts" && "No tienes borradores guardados"}
                          {currentView === "scheduled" && "No tienes reportes programados"}
                          {currentView === "templates" && "No hay plantillas disponibles"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      currentData.map((report) => (
                        <TableRow
                          key={report.id}
                          className="hover:bg-gray-50"
                        >
                          <TableCell className="py-4">
                            <div className="flex items-center">
                              {(currentView === "saved" || currentView === "favorites") && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="p-1 mr-2"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if ((report as any).savedReportData) {
                                          onToggleFavorite((report as any).savedReportData.id);
                                        }
                                      }}
                                    >
                                      <Star 
                                        className={`w-4 h-4 ${
                                          (report as any).isFavorite 
                                            ? 'text-yellow-500 fill-yellow-500' 
                                            : 'text-gray-400 hover:text-yellow-500'
                                        }`} 
                                      />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Favoritos</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                              {(report as any).isGenerating && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="mr-1" tabIndex={0}>
                                      <Skeleton className="w-4 h-4 rounded-full">
                                        <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                                      </Skeleton>
                                    </Flex>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Este reporte se está generando</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                              {currentView === "scheduled" ? (
                                <span className="text-foreground text-sm">
                                  {report.nombre}
                                </span>
                              ) : (
                                <span 
                                  className="text-blue-600 hover:underline text-sm cursor-pointer"
                                  onClick={() => onReportClick(
                                    report.id, 
                                    report.nombre, 
                                    (report as any).savedReportData
                                  )}
                                >
                                  {report.nombre}
                                </span>
                              )}
                            </Flex>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm py-4 max-w-xs">
                            <div className="truncate" title={report.descripcion}>
                              {report.descripcion}
                            </Flex>
                          </TableCell>
                          {(currentView === "saved" || currentView === "favorites") ? (
                            <>
                              <TableCell className="text-muted-foreground text-sm py-4">
                                {(report as any).lastUpdated ? (
                                  formatDateWithTime((report as any).lastUpdated)
                                ) : (report as any).isGenerating || !(report as any).savedReportData?.hasGeneratedData ? (
                                  <span className="text-muted-foreground">--</span>
                                ) : (
                                  <span className="text-gray-500">Sin generar</span>
                                )}
                              </TableCell>
                              <TableCell className="text-muted-foreground text-sm py-4">
                                {(report as any).createdBy}
                              </TableCell>
                              <TableCell className="py-4">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="p-1"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <MoreVertical className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" sideOffset={4} avoidCollisions={true}>
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleSecondaryAction('export-pdf', report);
                                      }}
                                    >
                                      <Download className="w-4 h-4 mr-2" />
                                      Exportar PDF
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleSecondaryAction('export-csv', report);
                                      }}
                                    >
                                      <FileX className="w-4 h-4 mr-2" />
                                      Exportar CSV
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleSecondaryAction('schedule', report);
                                      }}
                                    >
                                      <Calendar className="w-4 h-4 mr-2" />
                                      Programar envío
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                      className="text-destructive focus:text-destructive"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if ((report as any).savedReportData) {
                                          onDeleteReport((report as any).savedReportData);
                                        }
                                      }}
                                    >
                                      <Trash2 className="w-4 h-4 mr-2 text-red-600" />
                                      Eliminar reporte
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </>
                          ) : currentView === "scheduled" ? (
                            <>
                              <TableCell className="text-muted-foreground text-sm py-4">
                                {(report as any).format?.toUpperCase() || 'PDF'}
                              </TableCell>
                              <TableCell className="text-sm py-4">
                                <span className={`inline-flex items-center px-2 py-1 rounded-[8px] text-xs font-medium ${
                                  (report as any).isActive 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {(report as any).isActive ? 'Activo' : 'Inactivo'}
                                </span>
                              </TableCell>
                              <TableCell className="text-muted-foreground text-sm py-4">
                                {getFrequencyLabel((report as any).frequency)}
                              </TableCell>
                              <TableCell className="text-muted-foreground text-sm py-4">
                                {(report as any).lastSent ? formatDateWithTime((report as any).lastSent) : '--'}
                              </TableCell>
                              <TableCell className="text-muted-foreground text-sm py-4">
                                {(report as any).nextSend ? formatNextSend((report as any).nextSend) : '--'}
                              </TableCell>
                              <TableCell className="py-4">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="p-1"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <MoreVertical className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" sideOffset={4} avoidCollisions={true}>
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        console.log('Editar programación:', report.nombre);
                                      }}
                                    >
                                      <Calendar className="w-4 h-4 mr-2" />
                                      Editar programación
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if ((report as any).scheduledReportData && onToggleScheduledActive) {
                                          onToggleScheduledActive((report as any).scheduledReportData.id);
                                        }
                                      }}
                                    >
                                      <Clock className="w-4 h-4 mr-2" />
                                      {(report as any).isActive ? 'Pausar' : 'Activar'}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                      className="text-destructive focus:text-destructive"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if ((report as any).scheduledReportData && onDeleteScheduledReport) {
                                          onDeleteScheduledReport((report as any).scheduledReportData.id);
                                        }
                                      }}
                                    >
                                      <Trash2 className="w-4 h-4 mr-2 text-red-600" />
                                      Eliminar programación
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </>
                          ) : (
                            <>
                              <TableCell className="text-muted-foreground text-sm py-4">
                                {report.tipo}
                              </TableCell>
                              <TableCell className="text-muted-foreground text-sm py-4">
                                {report.guardados}
                              </TableCell>
                            </>
                          )}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Flex>
            </Flex>
          </Flex>
        </Flex>
      </div>
    </TooltipProvider>
  )
}
