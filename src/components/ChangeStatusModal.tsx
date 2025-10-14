import { useEffect, useState } from "react"
import ModalBase from "./ModalBase"
import { Button } from "./ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Textarea } from "./ui/textarea"
import { Check } from "lucide-react"

interface ChangeStatusModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (newStatus: 'open' | 'closed', note?: string) => void
  currentStatus: 'open' | 'closed'
}

const statusOptions = [
  { value: 'open', label: 'Abierto' },
  { value: 'closed', label: 'Cerrado' },
]

export function ChangeStatusModal({ isOpen, onClose, onSave, currentStatus }: ChangeStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<'open' | 'closed'>(currentStatus)
  const [note, setNote] = useState('')

  useEffect(() => {
    if (isOpen) {
      setSelectedStatus(currentStatus)
      setNote('')
    }
  }, [isOpen, currentStatus])

  const handleSave = () => {
    if (selectedStatus === 'closed' && note.trim() === '') {
      return
    }
    onSave(selectedStatus, selectedStatus === 'closed' ? note : undefined)
    onClose()
  }

  const handleCancel = () => {
    onClose()
  }

  return (
    <ModalBase
      open={isOpen}
      onClose={handleCancel}
      title="Cambiar estado"
      size="sm"
      customFooter={(
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleCancel} className="text-[14px]">
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
      )}
    >
      <div className="space-y-4">
        <div>
          <label className="text-[14px] text-foreground block mb-2">
            <span className="text-red-500 mr-1">*</span>
            Estado
          </label>
          <Select
            value={selectedStatus}
            onValueChange={(value) => {
              setSelectedStatus(value as 'open' | 'closed')
              if (value !== 'closed') {
                setNote('')
              }
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar estado" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value} className="flex items-center justify-between">
                  <div className="flex items-center justify-between w-full">
                    <span>{option.label}</span>
                    {selectedStatus === option.value && <Check className="w-4 h-4 text-blue-600 ml-2" />}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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
    </ModalBase>
  )
}

