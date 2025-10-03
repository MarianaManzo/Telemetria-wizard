import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { RadioGroup, RadioGroupItem } from "./ui/radio-group"
import { DatePickerWithCalendar } from "./DatePickerWithCalendar"
import { TimePickerInput } from "./TimePickerInput"
import { RecipientsSelector } from "./RecipientsSelector"
import { X, Loader2, AlertCircle } from "lucide-react"
import { ScheduledReport, ScheduleReportEditData } from "../types"

interface SavedReport {
  id: string
  name: string
  description?: string
  isFavorite?: boolean
  savedAt?: Date
  filters?: any
  hasGeneratedData?: boolean
  isGenerating?: boolean
  lastUpdated?: Date | null
  createdBy?: string
  originalTemplate?: string
  hasModifiedFilters?: boolean
}

interface ScheduleReportModalProps {
  isOpen: boolean
  onClose: () => void
  onSchedule: (data: ScheduleReportData) => Promise<void> | void
  onEdit?: (data: ScheduleReportEditData) => Promise<void> | void
  reportName?: string
  editingSchedule?: ScheduledReport | null
  isEditMode?: boolean
  isFromSavedReport?: boolean
  savedReports?: SavedReport[]
}

export interface ScheduleReportData {
  report: string
  format: string
  startDate: string
  startTime: string
  frequency: string
  endType: 'never' | 'after' | 'on'
  endAfterCount?: number
  endOnDate?: string
  recipients: string[]
  subject: string
}

export function ScheduleReportModal({ 
  isOpen, 
  onClose, 
  onSchedule, 
  onEdit,
  reportName = "Viajes diario",
  editingSchedule = null,
  isEditMode = false,
  isFromSavedReport = false,
  savedReports = []
}: ScheduleReportModalProps) {
  const [formData, setFormData] = useState<ScheduleReportData>({
    report: isEditMode || isFromSavedReport ? reportName : '',
    format: '',
    startDate: '',
    startTime: '',
    frequency: '',
    endType: 'never',
    endAfterCount: 2,
    endOnDate: '',
    recipients: [],
    subject: ''
  })

  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Helper function to validate dates
  const isDateInPast = (dateString: string, timeString?: string): boolean => {
    if (!dateString) return false
    
    const now = new Date()
    const inputDate = new Date(dateString)
    
    // If time is provided, include it in the comparison
    if (timeString) {
      const [hours, minutes] = timeString.split(':').map(Number)
      inputDate.setHours(hours, minutes, 0, 0)
    } else {
      // For date-only comparison, set to end of day to be more lenient
      inputDate.setHours(23, 59, 59, 999)
    }
    
    return inputDate < now
  }

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Required fields validation
    if (!formData.report.trim()) {
      newErrors.report = 'El reporte es obligatorio'
    }

    if (!formData.startDate) {
      newErrors.startDate = 'La fecha de inicio es obligatoria'
    } else if (isDateInPast(formData.startDate, formData.startTime)) {
      newErrors.startDate = 'La fecha y hora de inicio no puede ser en el pasado'
    }

    if (!formData.startTime) {
      newErrors.startTime = 'La hora de inicio es obligatoria'
    }

    if (!formData.format) {
      newErrors.format = 'El formato es obligatorio'
    }

    if (!formData.frequency) {
      newErrors.frequency = 'La frecuencia es obligatoria'
    }

    // End date validation (only if "on" is selected)
    if (formData.endType === 'on') {
      if (!formData.endOnDate) {
        newErrors.endOnDate = 'La fecha de finalización es obligatoria'
      } else if (isDateInPast(formData.endOnDate)) {
        newErrors.endOnDate = 'La fecha de finalización no puede ser en el pasado'
      } else if (formData.startDate && formData.endOnDate <= formData.startDate) {
        newErrors.endOnDate = 'La fecha de finalización debe ser posterior a la fecha de inicio'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Poblar datos del formulario cuando estamos editando
  useEffect(() => {
    if (isEditMode && editingSchedule && isOpen) {
      // Safely handle date conversion with validation
      const startDateStr = editingSchedule.startDate && !isNaN(new Date(editingSchedule.startDate).getTime()) 
        ? new Date(editingSchedule.startDate).toISOString().split('T')[0]
        : ''
      const endDateStr = editingSchedule.endOnDate && !isNaN(new Date(editingSchedule.endOnDate).getTime())
        ? new Date(editingSchedule.endOnDate).toISOString().split('T')[0] 
        : ''
      
      setFormData({
        report: editingSchedule.reportTemplate, // Usar reportTemplate en lugar de name
        format: editingSchedule.format,
        startDate: startDateStr,
        startTime: editingSchedule.startTime,
        frequency: editingSchedule.frequency,
        endType: editingSchedule.endType,
        endAfterCount: editingSchedule.endAfterCount || 2,
        endOnDate: endDateStr,
        recipients: editingSchedule.recipients,
        subject: editingSchedule.subject
      })
    } else if (!isEditMode && isOpen) {
      // Resetear formulario para modo creación
      setFormData({
        report: isFromSavedReport ? (reportName || "Viajes diario") : '', // Solo usar reportName si es desde reporte guardado
        format: '',
        startDate: '',
        startTime: '',
        frequency: '',
        endType: 'never',
        endAfterCount: 2,
        endOnDate: '',
        recipients: [],
        subject: ''
      })
    }
  }, [isEditMode, editingSchedule, isOpen, reportName])

  // Efecto adicional para actualizar el nombre del reporte cuando cambia (solo para crear programación desde reporte guardado)
  useEffect(() => {
    if (!isEditMode && isFromSavedReport && reportName && isOpen) {
      setFormData(prev => ({
        ...prev,
        report: reportName
      }))
    }
  }, [reportName, isFromSavedReport, isEditMode, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form before submitting
    if (!validateForm()) {
      return
    }
    
    setIsLoading(true)
    
    try {
      if (isEditMode && onEdit && editingSchedule) {
        // Modo edición
        const editData: ScheduleReportEditData = {
          id: editingSchedule.id,
          ...formData
        }
        const result = onEdit(editData)
        if (result instanceof Promise) {
          await result
        }
      } else {
        // Modo creación
        const result = onSchedule(formData)
        if (result instanceof Promise) {
          await result
        }
      }
      handleReset()
      onClose()
    } catch (error) {
      console.error('Error scheduling/editing report:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setErrors({}) // Clear errors when resetting
    
    if (isEditMode && editingSchedule) {
      // Restaurar datos originales si estamos editando
      // Safely handle date conversion with validation
      const startDateStr = editingSchedule.startDate && !isNaN(new Date(editingSchedule.startDate).getTime()) 
        ? new Date(editingSchedule.startDate).toISOString().split('T')[0]
        : ''
      const endDateStr = editingSchedule.endOnDate && !isNaN(new Date(editingSchedule.endOnDate).getTime())
        ? new Date(editingSchedule.endOnDate).toISOString().split('T')[0] 
        : ''
      
      setFormData({
        report: editingSchedule.reportTemplate, // Usar reportTemplate en lugar de name
        format: editingSchedule.format,
        startDate: startDateStr,
        startTime: editingSchedule.startTime,
        frequency: editingSchedule.frequency,
        endType: editingSchedule.endType,
        endAfterCount: editingSchedule.endAfterCount || 2,
        endOnDate: endDateStr,
        recipients: editingSchedule.recipients,
        subject: editingSchedule.subject
      })
    } else {
      // Formulario limpio para modo creación
      setFormData({
        report: isFromSavedReport ? reportName : '',
        format: '',
        startDate: '',
        startTime: '',
        frequency: '',
        endType: 'never',
        endAfterCount: 2,
        endOnDate: '',
        recipients: [],
        subject: ''
      })
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      handleReset()
      onClose()
    }
  }

  // Helper component for error display
  const ErrorMessage = ({ error }: { error?: string }) => {
    if (!error) return null
    return (
      <div className="flex items-center gap-1 text-red-600 text-xs mt-1">
        <AlertCircle className="w-3 h-3" />
        <span>{error}</span>
      </div>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-[600px] max-h-[90vh] p-0 gap-0 overflow-hidden"
        aria-describedby={undefined}
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* Header */}
        <DialogHeader className="flex flex-row items-center justify-between px-6 py-4 border-b">
          <DialogTitle className="text-lg font-medium text-gray-900">
            {isEditMode ? 'Editar programación' : (isFromSavedReport ? 'Programar envío' : 'Crear programación')}
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)] min-h-0">
          {/* Información básica */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Información básica</h3>
            
            {/* Reporte */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                <span className="text-red-500 mr-1">*</span>
                Reporte :
              </Label>
              <Select 
                value={formData.report} 
                onValueChange={(value) => {
                  setFormData(prev => ({ ...prev, report: value }))
                  // Clear errors when user makes changes
                  if (errors.report) {
                    setErrors(prev => ({ ...prev, report: '' }))
                  }
                }}
                disabled={isEditMode || isFromSavedReport}
              >
                <SelectTrigger className={`text-sm ${(isEditMode || isFromSavedReport) ? 'bg-gray-100 border-gray-200 text-gray-600 cursor-not-allowed' : 'bg-white border-gray-300'} ${errors.report ? 'border-red-500' : ''}`}>
                  <SelectValue placeholder="Selecciona un reporte" className="text-gray-500" />
                </SelectTrigger>
                <SelectContent>
                  {/* Show current report name if it's from a saved report and not in saved reports list */}
                  {isFromSavedReport && formData.report && 
                   !savedReports.some(report => report.name === formData.report) && (
                    <SelectItem value={formData.report}>
                      {formData.report}
                    </SelectItem>
                  )}
                  {/* Show all saved reports */}
                  {savedReports.map((report) => (
                    <SelectItem key={report.id} value={report.name}>
                      {report.name}
                    </SelectItem>
                  ))}
                  {/* Show default options if no saved reports exist */}
                  {savedReports.length === 0 && (
                    <>
                      <SelectItem value="Viajes diario">
                        Viajes diario
                      </SelectItem>
                      <SelectItem value="Estado de mantenimiento">
                        Estado de mantenimiento
                      </SelectItem>
                      <SelectItem value="Seguimiento GPS">
                        Seguimiento GPS
                      </SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
              <ErrorMessage error={errors.report} />
            </div>

            {/* Fecha inicio */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                <span className="text-red-500 mr-1">*</span>
                Fecha inicio :
              </Label>
              <div className="flex gap-3">
                <div className="flex-1">
                  <DatePickerWithCalendar
                    value={formData.startDate}
                    onChange={(value) => {
                      setFormData(prev => ({ ...prev, startDate: value }))
                      // Clear errors when user makes changes
                      if (errors.startDate) {
                        setErrors(prev => ({ ...prev, startDate: '' }))
                      }
                    }}
                    placeholder="Seleccionar fecha"
                    disabled={isLoading}
                    className={errors.startDate ? 'border-red-500' : ''}
                  />
                  <ErrorMessage error={errors.startDate} />
                </div>
                <div className="flex-1">
                  <TimePickerInput
                    value={formData.startTime}
                    onChange={(value) => {
                      setFormData(prev => ({ ...prev, startTime: value }))
                      // Clear errors when user makes changes
                      if (errors.startTime) {
                        setErrors(prev => ({ ...prev, startTime: '' }))
                      }
                    }}
                    placeholder="Seleccionar hora"
                    disabled={isLoading}
                    className={errors.startTime ? 'border-red-500' : ''}
                  />
                  <ErrorMessage error={errors.startTime} />
                </div>
              </div>
            </div>

            {/* Formato y Repetir en la misma fila */}
            <div className="flex gap-3">
              {/* Formato */}
              <div className="flex-1 space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  <span className="text-red-500 mr-1">*</span>
                  Formato :
                </Label>
                <Select 
                  value={formData.format} 
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, format: value }))
                    // Clear errors when user makes changes
                    if (errors.format) {
                      setErrors(prev => ({ ...prev, format: '' }))
                    }
                  }}
                >
                  <SelectTrigger className={`bg-white border-gray-300 text-sm ${errors.format ? 'border-red-500' : ''}`}>
                    <SelectValue placeholder="Seleccionar formato del reporte" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                  </SelectContent>
                </Select>
                <ErrorMessage error={errors.format} />
              </div>

              {/* Repetir */}
              <div className="flex-1 space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  <span className="text-red-500 mr-1">*</span>
                  Repetir :
                </Label>
                <Select 
                  value={formData.frequency} 
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, frequency: value }))
                    // Clear errors when user makes changes
                    if (errors.frequency) {
                      setErrors(prev => ({ ...prev, frequency: '' }))
                    }
                  }}
                >
                  <SelectTrigger className={`bg-white border-gray-300 text-sm ${errors.frequency ? 'border-red-500' : ''}`}>
                    <SelectValue placeholder="Elegir frecuencia de envío" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Diariamente</SelectItem>
                    <SelectItem value="weekly">Semanalmente</SelectItem>
                    <SelectItem value="monthly">Mensualmente</SelectItem>
                    <SelectItem value="yearly">Anualmente</SelectItem>
                  </SelectContent>
                </Select>
                <ErrorMessage error={errors.frequency} />
              </div>
            </div>

            {/* Finaliza */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">
                <span className="text-red-500 mr-1">*</span>
                Finaliza :
              </Label>
              <RadioGroup 
                value={formData.endType} 
                onValueChange={(value: 'never' | 'after' | 'on') => setFormData(prev => ({ ...prev, endType: value }))}
                className="space-y-3"
                disabled={isLoading}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="never" id="never" />
                  <Label htmlFor="never" className="text-sm text-gray-700 font-normal">Nunca</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="after" id="after" />
                  <Label htmlFor="after" className="text-sm text-gray-700 font-normal">Después de</Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.endAfterCount}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, endAfterCount: parseInt(e.target.value) || 1 }))
                    }}
                    className="bg-white border-gray-300 text-sm w-16 h-8 px-2"
                    disabled={formData.endType !== 'after' || isLoading}
                  />
                  <span className="text-sm text-gray-700">veces</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="on" id="on" />
                  <Label htmlFor="on" className="text-sm text-gray-700 font-normal">En</Label>
                  <div className="w-40">
                    <DatePickerWithCalendar
                      value={formData.endOnDate || ''}
                      onChange={(value) => {
                        setFormData(prev => ({ ...prev, endOnDate: value }))
                        // Clear errors when user makes changes
                        if (errors.endOnDate) {
                          setErrors(prev => ({ ...prev, endOnDate: '' }))
                        }
                      }}
                      placeholder="Seleccionar fecha"
                      disabled={formData.endType !== 'on' || isLoading}
                      className={`w-full ${errors.endOnDate ? 'border-red-500' : ''}`}
                    />
                  </div>
                </div>
                {errors.endOnDate && (
                  <div className="ml-6">
                    <ErrorMessage error={errors.endOnDate} />
                  </div>
                )}
              </RadioGroup>
            </div>
          </div>

          {/* Divisor entre secciones */}
          <hr className="border-t border-gray-200" />

          {/* Información de envío */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Información de envío</h3>
            </div>
            
            {/* Destinatario */}
            <div className="space-y-2 min-w-0 max-w-full">
              <Label className="text-sm font-medium text-gray-700">
                Destinatario :
              </Label>
              <div className="w-full max-w-full min-w-0">
                <RecipientsSelector
                  value={formData.recipients}
                  onChange={(recipients) => setFormData(prev => ({ ...prev, recipients }))}
                  disabled={isLoading}
                  className="w-full max-w-full"
                />
              </div>
            </div>

            {/* Asunto */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Asunto :
              </Label>
              <Input
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Asunto del correo (Opcional)"
                className="bg-white border-gray-300 text-sm"
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleClose}
            disabled={isLoading}
            className="text-sm font-medium text-gray-700 border-gray-300 bg-white hover:bg-gray-50"
          >
            Cancelar
          </Button>
          <Button 
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading}
            className="text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white min-w-[80px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {isEditMode ? 'Guardando...' : 'Creando...'}
              </>
            ) : (
              isEditMode ? 'Guardar cambios' : (isFromSavedReport ? 'Programar envío' : 'Crear')
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}