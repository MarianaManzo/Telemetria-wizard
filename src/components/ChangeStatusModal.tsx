import { useEffect, useState } from "react"
import ModalBase from "./ModalBase"
import { Button } from "./ui/button"
import { Textarea } from "./ui/textarea"

interface ChangeStatusModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (newStatus: 'open' | 'closed', note?: string) => void
  mode: 'close' | 'reopen'
  requireNote?: boolean
}

export function ChangeStatusModal({ isOpen, onClose, onSave, mode, requireNote = false }: ChangeStatusModalProps) {
  const targetStatus: 'open' | 'closed' = mode === 'close' ? 'closed' : 'open'
  const [note, setNote] = useState('')

  useEffect(() => {
    if (isOpen) {
      setNote('')
    }
  }, [isOpen, mode])

  const handleSave = () => {
    const trimmedNote = note.trim()
    if (requireNote && !trimmedNote) {
      return
    }
    onSave(targetStatus, trimmedNote || undefined)
    onClose()
  }

  const handleCancel = () => {
    onClose()
  }

  return (
    <ModalBase
      open={isOpen}
      onClose={handleCancel}
      title={mode === 'close' ? 'Cerrar evento' : 'Reabrir evento'}
      size="sm"
      customFooter={(
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleCancel} className="text-[14px]">
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={requireNote && !note.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white text-[14px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continuar
          </Button>
        </div>
      )}
    >
      <div className="space-y-4">
        <p className="text-[14px] text-[#4B5563]">
          {mode === 'close'
            ? 'Agrega una nota para dejar un registro del cambio de estado del evento.'
            : 'Agrega una nota si necesitas dejar un registro al reabrir el evento.'}
        </p>
        <div>
          <label className="text-[14px] text-foreground block mb-2">
            {requireNote && <span className="text-red-500 mr-1">*</span>}
            Nota {!requireNote && '(opcional)'}
          </label>
          <Textarea
            placeholder="Describe el motivo del cambio..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full min-h-[90px] resize-none"
          />
        </div>
      </div>
    </ModalBase>
  )
}
