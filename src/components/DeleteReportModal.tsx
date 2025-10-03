import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog"
import { Button } from "./ui/button"
import { X } from "lucide-react"

interface DeleteReportModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirmDelete: () => void
  reportName: string
}

export function DeleteReportModal({
  isOpen,
  onClose,
  onConfirmDelete,
  reportName
}: DeleteReportModalProps) {
  const handleConfirmDelete = () => {
    onConfirmDelete()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
          {/* Red circle with X icon */}
          <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
            <X className="w-5 h-5 text-white" />
          </div>
          
          <div className="flex-1 min-w-0">
            <DialogTitle className="text-left text-gray-900 font-normal">
              Eliminar Reporte - {reportName}
            </DialogTitle>
            <DialogDescription className="space-y-2 mt-2">
              <span className="block text-gray-900">
                ¿Estás seguro que quieres eliminar el reporte?
              </span>
              <span className="block text-gray-700">
                Esta acción no se puede deshacer.
              </span>
            </DialogDescription>
          </div>

          {/* Close button */}
          <Button
            variant="ghost"
            size="sm"
            className="p-1 h-auto w-auto text-gray-400 hover:text-gray-600"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </Button>
        </DialogHeader>

        {/* Action buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="px-6"
          >
            Cancelar
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleConfirmDelete}
            className="px-6 bg-red-500 hover:bg-red-600"
          >
            Sí, eliminar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}