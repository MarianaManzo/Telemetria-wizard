import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog"
import { Button } from "./ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Textarea } from "./ui/textarea"
import { X, Check } from "lucide-react"

interface ChangeStatusModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (newStatus: 'open' | 'in-progress' | 'closed', note?: string) => void
  currentStatus: 'open' | 'in-progress' | 'closed'
}

const statusOptions = [
  { value: "open", label: "Abierto" },
  { value: "in-progress", label: "En progreso" },
  { value: "closed", label: "Cerrado" }
]

export function ChangeStatusModal({ 
  isOpen, 
  onClose, 
  onSave, 
  currentStatus 
}: ChangeStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<'open' | 'in-progress' | 'closed'>(currentStatus)
  const [note, setNote] = useState("")

  const handleSave = () => {
    // If status is closed, note is required
    if (selectedStatus === 'closed' && note.trim() === '') {
      return // Don't save if note is empty when status is closed
    }
    
    onSave(selectedStatus, selectedStatus === 'closed' ? note : undefined)
    onClose()
  }

  const handleCancel = () => {
    setSelectedStatus(currentStatus) // Reset to original value
    setNote("") // Reset note
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white p-0 gap-0 rounded-lg">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-[16px] text-foreground">
              Cambiar estado
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="p-1 hover:bg-gray-100"
            >
              <X className="w-4 h-4 text-gray-500" />
            </Button>
          </div>
          <DialogDescription className="sr-only">
            Selecciona un nuevo estado para este evento
          </DialogDescription>
        </DialogHeader>

        {/* Content */}
        <div className="px-6 py-6">
          <div className="space-y-4">
            <div>
              <label className="text-[14px] text-foreground block mb-2">
                <span className="text-red-500 mr-1">*</span>
                Estado
              </label>
              <Select value={selectedStatus} onValueChange={(value) => {
                setSelectedStatus(value as 'open' | 'in-progress' | 'closed')
                // Reset note when changing status
                if (value !== 'closed') {
                  setNote("")
                }
              }}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {statusOptions.map((option) => (
                    <SelectItem 
                      key={option.value} 
                      value={option.value}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span>{option.label}</span>
                        {selectedStatus === option.value && (
                          <Check className="w-4 h-4 text-blue-600 ml-2" />
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Note field - only show when status is closed */}
            {selectedStatus === 'closed' && (
              <div>
                <label className="text-[14px] text-foreground block mb-2">
                  <span className="text-red-500 mr-1">*</span>
                  Nota
                </label>
                <Textarea
                  placeholder="Agregar nota..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full min-h-[80px] resize-none"
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="text-[14px]"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={selectedStatus === 'closed' && note.trim() === ''}
            className="bg-blue-600 hover:bg-blue-700 text-white text-[14px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Guardar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}