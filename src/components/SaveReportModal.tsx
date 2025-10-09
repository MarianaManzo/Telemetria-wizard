import { useState, useEffect } from 'react'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Star, Loader2 } from 'lucide-react'
import { SaveModalMode, SavedReport } from '../types'
import { isReportNameDuplicate } from '../utils/helpers'
import ModalBase from './ModalBase'
import { Button } from './ui/button'

interface SaveReportModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: { name: string; description: string; isFavorite: boolean }) => Promise<void>
  isExistingReport?: boolean
  currentReportName?: string
  mode?: SaveModalMode
  existingReports?: SavedReport[]
  currentReportId?: string
}

export function SaveReportModal({
  isOpen,
  onClose,
  onSave,
  isExistingReport = false,
  currentReportName = '',
  mode = 'save',
  existingReports = [],
  currentReportId,
}: SaveReportModalProps) {
  const [name, setName] = useState(currentReportName)
  const [description, setDescription] = useState('')
  const [isFavorite, setIsFavorite] = useState(false)
  const [nameError, setNameError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Update name when modal opens with a different currentReportName
  useEffect(() => {
    if (isOpen) {
      setName(currentReportName)
      // Clear error when modal opens
      setNameError('')
    }
  }, [isOpen, currentReportName])

  // Validate name when existingReports changes (to ensure validation on fresh data)
  useEffect(() => {
    if (name && isOpen && existingReports) {
      const timeoutId = setTimeout(() => {
        validateName(name)
      }, 0)
      return () => clearTimeout(timeoutId)
    }
  }, [existingReports, name, isOpen, mode, currentReportId])

  const validateName = (value: string) => {
    if (!value.trim()) {
      setNameError('El nombre del reporte es obligatorio')
      return false
    }
    if (value.trim().length < 3) {
      setNameError('El nombre debe tener al menos 3 caracteres')
      return false
    }

    // Check for duplicate names
    const isDuplicate = isReportNameDuplicate(value.trim(), existingReports, currentReportId)
    if (isDuplicate) {
      const actionText = mode === 'save-as' ? 'guardar como' : mode === 'rename' ? 'renombrar' : 'guardar'
      setNameError(`Ya existe un reporte con este nombre. No es posible ${actionText} con un nombre duplicado.`)
      return false
    }

    setNameError('')
    return true
  }

  const handleNameChange = (value: string) => {
    setName(value)
    // Always validate on change to provide real-time feedback
    validateName(value)
  }

  const handleSave = async () => {
    if (!validateName(name)) {
      return
    }

    setIsLoading(true)

    try {
      await onSave({
        name: name.trim(),
        description: description.trim(),
        isFavorite,
      })

      // Reset form
      setName('')
      setDescription('')
      setIsFavorite(false)
      setNameError('')
      onClose()
    } catch (error) {
      console.error('Error saving report:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setName(currentReportName)
      setDescription('')
      setIsFavorite(false)
      setNameError('')
      onClose()
    }
  }

  // Get modal title based on mode
  const getModalTitle = () => {
    switch (mode) {
      case 'save-as':
        return 'Guardar como'
      case 'rename':
        return 'Renombrar reporte'
      default:
        return isExistingReport ? 'Guardar cambios al reporte' : 'Guardar reporte'
    }
  }

  // Get modal description based on mode
  const getModalDescription = () => {
    switch (mode) {
      case 'save-as':
        return '' // No description for save-as modal
      case 'rename':
        return '' // No description for rename modal
      default:
        return isExistingReport
          ? 'Actualiza la información del reporte existente con los cambios realizados.'
          : 'Completa la información para guardar tu reporte y poder acceder a él más tarde.'
    }
  }

  const footer = (
    <div className="flex justify-between items-center pt-6 border-t">
      <button
        type="button"
        onClick={() => setIsFavorite(!isFavorite)}
        disabled={isLoading}
        className={`flex items-center gap-2 p-2 rounded-md transition-colors ${
          isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-50 cursor-pointer'
        }`}
        title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      >
        <Star
          className={`w-5 h-5 transition-colors ${
            isFavorite ? 'fill-blue-500 text-blue-500' : 'text-blue-500 hover:text-blue-600'
          }`}
        />
        <span className="text-sm text-blue-600">Agregar a favoritos</span>
      </button>

      <div className="flex gap-3">
        <Button variant="outline" onClick={handleClose} disabled={isLoading} className="text-gray-600 border-gray-300 hover:bg-gray-50">
          Cancelar
        </Button>
        <Button onClick={handleSave} disabled={isLoading || !name.trim() || !!nameError} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]">
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Guardando...
            </>
          ) : (
            'Guardar'
          )}
        </Button>
      </div>
    </div>
  )

  return (
    <ModalBase
      open={isOpen}
      onClose={handleClose}
      title={getModalTitle()}
      subtitle={getModalDescription() || undefined}
      size="md"
      maskClosable={false}
      customFooter={footer}
    >
      <div className="space-y-6 py-4">
        <div className="space-y-2">
          <Label htmlFor="report-name">
            Nombre del reporte <span className="text-red-500">*</span>
          </Label>
          <Input
            id="report-name"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Ingresa el nombre del reporte"
            className={`bg-input-background ${nameError ? 'border-red-500' : ''}`}
            disabled={isLoading}
          />
          {nameError && <p className="text-red-500 text-sm">{nameError}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="report-description">Descripción</Label>
          <Textarea
            id="report-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe brevemente el contenido del reporte (opcional)"
            rows={3}
            className="bg-input-background resize-none"
            disabled={isLoading}
          />
        </div>
      </div>
    </ModalBase>
  )
}