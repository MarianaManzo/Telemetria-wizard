import { useState } from "react"
import { Button } from "./ui/button"
import { ChevronLeft, ChevronDown, RotateCcw, MoreVertical, Star, Download, Save, Edit, Calendar, Trash2, Check } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu"
import { NavigationConfirmationModal } from "./NavigationConfirmationModal"
import { ScheduledIndicator } from "./ScheduledIndicator"
import { toast } from "sonner@2.0.3"
import { SavedReport } from "../types"

interface BreadcrumbNavProps {
  lastUpdated?: Date | null
  onUpdate?: () => void
  onSave?: () => void
  onSaveAs?: () => void
  onRename?: () => void
  onBack?: () => void
  onToggleFavorite?: () => void
  onDeleteReport?: () => void
  onScheduleReport?: () => void
  onReportNavigate?: (reportId: number, reportName: string, savedReportData: SavedReport) => void
  showUpdateButton?: boolean
  isUpdating?: boolean
  isGenerating?: boolean
  saveEnabled?: boolean
  actionsEnabled?: boolean
  hasGeneratedData?: boolean
  savedReport?: SavedReport | null
  selectedReportName?: string
  extraContent?: React.ReactNode
  savedReports?: SavedReport[]
  hasUnsavedChanges?: boolean
  activeSchedulesCount?: number
}

export function BreadcrumbNav({ 
  lastUpdated, 
  onUpdate, 
  onSave, 
  onSaveAs,
  onRename,
  onBack,
  onToggleFavorite,
  onDeleteReport,
  onScheduleReport,
  onReportNavigate,
  showUpdateButton = false,
  isUpdating = false,
  isGenerating = false,
  saveEnabled = false,
  actionsEnabled = false,
  hasGeneratedData = false,
  savedReport = null,
  selectedReportName,
  extraContent,
  savedReports = [],
  hasUnsavedChanges = false,
  activeSchedulesCount = 0
}: BreadcrumbNavProps) {
  const [showNavigationModal, setShowNavigationModal] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState<{
    reportId: number
    reportName: string
    savedReportData: SavedReport
  } | null>(null)
  const formatTimestamp = (date: Date) => {
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }).replace('a. m.', 'am').replace('p. m.', 'pm')
  }

  const handleSecondaryAction = (action: string) => {
    switch (action) {
      case 'export-pdf':
        console.log('Exportar a PDF')
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
        console.log('Exportar a CSV')
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
      case 'save-as':
        if (onSaveAs) {
          onSaveAs()
        }
        break
      case 'rename':
        if (onRename) {
          onRename()
        }
        break
      case 'schedule':
        if (onScheduleReport) {
          onScheduleReport()
        }
        break
      case 'delete':
        if (onDeleteReport) {
          onDeleteReport()
        }
        break
      default:
        break
    }
  }

  const handleStarClick = () => {
    if (savedReport && onToggleFavorite) {
      onToggleFavorite()
    }
  }

  // Function to get saved reports for current template (excluding current report)
  const getSavedReportsForTemplate = (templateName: string) => {
    return savedReports.filter(report => 
      report.originalTemplate === templateName && 
      report.id !== savedReport?.id // Exclude current report from the list
    )
  }

  // Get current template name
  const currentTemplateName = savedReport?.originalTemplate || selectedReportName || "Viajes diario"

  // Handle report navigation with unsaved changes check
  const handleReportClick = (reportId: number, reportName: string, savedReportData: SavedReport) => {
    // Don't navigate to the same report
    if (savedReport && savedReport.id === savedReportData.id) {
      return
    }

    if (hasUnsavedChanges) {
      // Store pending navigation and show confirmation modal
      setPendingNavigation({ reportId, reportName, savedReportData })
      setShowNavigationModal(true)
    } else {
      // Navigate directly if no unsaved changes
      if (onReportNavigate) {
        onReportNavigate(reportId, reportName, savedReportData)
      }
    }
  }

  // Handle navigation confirmation
  const handleConfirmNavigation = () => {
    if (pendingNavigation && onReportNavigate) {
      onReportNavigate(
        pendingNavigation.reportId,
        pendingNavigation.reportName,
        pendingNavigation.savedReportData
      )
    }
    setShowNavigationModal(false)
    setPendingNavigation(null)
  }

  // Handle navigation cancellation
  const handleCancelNavigation = () => {
    setShowNavigationModal(false)
    setPendingNavigation(null)
  }

  return (
    <div className="bg-[rgba(255,255,255,1)] border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left section: Back button + Title */}
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-600 p-1 cursor-pointer"
            onClick={onBack}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-2">
            {/* Dropdown para seleccionar reportes */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="flex items-center gap-2 text-gray-900 font-medium hover:bg-gray-50 px-2 py-1 h-auto cursor-pointer"
                >
                  {savedReport ? savedReport.name : selectedReportName || "Viajes diario"}
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" alignOffset={-80} className="w-80" sideOffset={4} avoidCollisions={true}>
                {/* Sección Favoritos */}
                {getSavedReportsForTemplate(currentTemplateName).filter(r => r.isFavorite).length > 0 && (
                  <div className="px-3 py-2">
                    <div className="text-sm text-gray-500 mb-2">Favoritos</div>
                    {getSavedReportsForTemplate(currentTemplateName)
                      .filter(report => report.isFavorite)
                      .map((report) => (
                        <DropdownMenuItem 
                          key={report.id}
                          className="flex items-center gap-2 cursor-pointer"
                          onClick={() => handleReportClick(
                            parseInt(report.id.split('_')[1]) || 0,
                            report.name,
                            report
                          )}
                        >
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                          <span className="truncate">{report.name}</span>
                        </DropdownMenuItem>
                      ))}
                  </div>
                )}
                
                {/* Sección Reportes guardados */}
                {getSavedReportsForTemplate(currentTemplateName).filter(r => !r.isFavorite).length > 0 && (
                  <div className="px-3 py-2">
                    <div className="text-sm text-gray-500 mb-2">Reportes guardados</div>
                    {getSavedReportsForTemplate(currentTemplateName)
                      .filter(report => !report.isFavorite)
                      .map((report) => (
                        <DropdownMenuItem 
                          key={report.id}
                          className="py-2 cursor-pointer"
                          onClick={() => handleReportClick(
                            parseInt(report.id.split('_')[1]) || 0,
                            report.name,
                            report
                          )}
                        >
                          <span className="truncate">{report.name}</span>
                        </DropdownMenuItem>
                      ))}
                  </div>
                )}

                {/* Estado vacío */}
                {getSavedReportsForTemplate(currentTemplateName).length === 0 && (
                  <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                    No hay otros reportes guardados para esta plantilla
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Estrella con estado condicional y clickeable */}
            {savedReport && (
              <Button
                variant="ghost"
                size="sm"
                className="p-1 h-auto hover:bg-gray-100 cursor-pointer"
                onClick={handleStarClick}
                title={savedReport.isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
              >
                <Star 
                  className={`w-4 h-4 ${
                    savedReport.isFavorite 
                      ? 'text-yellow-500 fill-yellow-500' 
                      : 'text-gray-400 stroke-gray-400 hover:text-yellow-400'
                  }`} 
                />
              </Button>
            )}
          </div>
        </div>

        {/* Center section: Última actualización */}
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span>Última actualización:</span>
          <span className="text-gray-700">
            {isGenerating 
              ? (isUpdating ? 'Actualizando...' : 'Generando...') 
              : (lastUpdated ? formatTimestamp(lastUpdated) : '--')
            }
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onUpdate}
            disabled={!showUpdateButton || isUpdating}
            className={`p-1 h-auto ${
              !showUpdateButton || isUpdating 
                ? 'text-gray-300 cursor-not-allowed' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 cursor-pointer'
            }`}
            title={isUpdating ? 'Actualizando...' : 'Actualizar datos'}
          >
            <RotateCcw className={`w-4 h-4 ${isUpdating ? 'animate-spin' : ''}`} />
          </Button>
          <ScheduledIndicator count={activeSchedulesCount} />
        </div>

        {/* Right section: Actions */}
        <div className="flex items-center gap-2">
          {/* Extra content (like UnsavedChangesButton) */}
          {extraContent}
          
          {/* Guardar button - only show if no saved report */}
          {!savedReport && (
            <Button 
              variant="outline" 
              size="sm" 
              className={`${saveEnabled ? 'text-gray-600 hover:text-gray-900 cursor-pointer' : 'text-gray-400 cursor-not-allowed'}`}
              onClick={saveEnabled ? onSave : undefined}
              disabled={!saveEnabled}
            >
              Guardar
            </Button>
          )}
          
          {/* Actions dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className={`p-2 ${actionsEnabled ? 'text-gray-600 hover:text-gray-900 cursor-pointer' : 'text-gray-400 cursor-not-allowed'}`}
                disabled={!actionsEnabled}
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48" sideOffset={4} avoidCollisions={true}>
              {!savedReport ? (
                // Draft report options (before saving)
                <>
                  <DropdownMenuItem 
                    onClick={hasGeneratedData ? () => handleSecondaryAction('export-pdf') : undefined}
                    disabled={!hasGeneratedData}
                    className={!hasGeneratedData ? 'text-gray-400 cursor-not-allowed' : 'cursor-pointer'}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Exportar PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={hasGeneratedData ? () => handleSecondaryAction('export-csv') : undefined}
                    disabled={!hasGeneratedData}
                    className={!hasGeneratedData ? 'text-gray-400 cursor-not-allowed' : 'cursor-pointer'}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Exportar CSV
                  </DropdownMenuItem>
                </>
              ) : (
                // Saved report options (after saving)
                <>
                  <DropdownMenuItem 
                    onClick={actionsEnabled ? () => handleSecondaryAction('save-as') : undefined}
                    disabled={!actionsEnabled}
                    className={!actionsEnabled ? 'text-gray-400 cursor-not-allowed' : 'cursor-pointer'}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Guardar como
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={actionsEnabled ? () => handleSecondaryAction('rename') : undefined}
                    disabled={!actionsEnabled}
                    className={!actionsEnabled ? 'text-gray-400 cursor-not-allowed' : 'cursor-pointer'}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Renombrar
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={hasGeneratedData ? () => handleSecondaryAction('export-pdf') : undefined}
                    disabled={!hasGeneratedData}
                    className={!hasGeneratedData ? 'text-gray-400 cursor-not-allowed' : 'cursor-pointer'}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Exportar PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={hasGeneratedData ? () => handleSecondaryAction('export-csv') : undefined}
                    disabled={!hasGeneratedData}
                    className={!hasGeneratedData ? 'text-gray-400 cursor-not-allowed' : 'cursor-pointer'}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Exportar CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={actionsEnabled ? () => handleSecondaryAction('schedule') : undefined}
                    disabled={!actionsEnabled}
                    className={!actionsEnabled ? 'text-gray-400 cursor-not-allowed' : 'cursor-pointer'}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Programar envío
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={actionsEnabled ? () => handleSecondaryAction('delete') : undefined}
                    disabled={!actionsEnabled}
                    className={`group ${!actionsEnabled ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 hover:bg-red-600 hover:text-white focus:bg-red-600 focus:text-white data-[highlighted]:bg-red-600 data-[highlighted]:text-white cursor-pointer'}`}
                  >
                    <Trash2 className={`w-4 h-4 mr-2 ${!actionsEnabled ? 'text-gray-400' : 'text-red-600 group-hover:text-white group-focus:text-white group-data-[highlighted]:text-white'}`} />
                    Eliminar reporte
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Navigation Confirmation Modal */}
      <NavigationConfirmationModal
        isOpen={showNavigationModal}
        onClose={handleCancelNavigation}
        onConfirm={handleConfirmNavigation}
        targetReportName={pendingNavigation?.reportName || ""}
      />
    </div>
  )
}