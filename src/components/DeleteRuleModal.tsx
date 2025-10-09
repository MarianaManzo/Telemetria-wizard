import { X } from 'lucide-react'
import { Button } from './ui/button'
import ModalBase from './ModalBase'

interface DeleteRuleModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirmDelete: () => void
  ruleName: string
}

export function DeleteRuleModal({ isOpen, onClose, onConfirmDelete, ruleName }: DeleteRuleModalProps) {
  const footer = (
    <div className="flex-row gap-3 flex justify-end p-0 m-0">
      <Button onClick={onClose} className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 h-auto">
        Cancelar
      </Button>
      <Button
        onClick={() => {
          onConfirmDelete()
          onClose()
        }}
        className="bg-red-500 hover:bg-red-600 text-white border-red-500 hover:border-red-600 px-4 py-2 h-auto"
      >
        Sí, eliminar
      </Button>
    </div>
  )

  return (
    <ModalBase open={isOpen} onClose={onClose} title={<>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
            <X className="w-4 h-4 text-white" />
          </div>
          <span>Eliminar Regla - <span className="font-normal">{ruleName}</span></span>
        </div>
      </>} subtitle={'¿Estás seguro que deseas eliminar la regla?'} size="sm" maskClosable={false} customFooter={footer}>
      {/* no extra body content; the subtitle carries the message */}
    </ModalBase>
  )
}