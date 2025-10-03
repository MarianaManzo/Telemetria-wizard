import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog"
import { X } from "lucide-react"
import { Button } from "./ui/button"

interface DeleteRuleModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirmDelete: () => void
  ruleName: string
}

export function DeleteRuleModal({
  isOpen,
  onClose,
  onConfirmDelete,
  ruleName
}: DeleteRuleModalProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-lg p-6 gap-0">
        {/* Header con ícono y botón cerrar */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
              <X className="w-4 h-4 text-white" />
            </div>
            <AlertDialogTitle className="text-lg text-gray-900 leading-tight">
              Eliminar Regla - <span className="font-normal">{ruleName}</span>
            </AlertDialogTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600 hover:bg-transparent -mt-1 -mr-1"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Descripción */}
        <AlertDialogDescription className="text-gray-600 text-left mb-8 text-base">
          ¿Estás seguro que deseas eliminar la regla?
        </AlertDialogDescription>
        
        {/* Footer con botones */}
        <AlertDialogFooter className="gap-3 flex-row justify-end p-0 m-0">
          <AlertDialogCancel 
            onClick={onClose}
            className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 h-auto"
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              onConfirmDelete()
              onClose()
            }}
            className="bg-red-500 hover:bg-red-600 text-white border-red-500 hover:border-red-600 px-4 py-2 h-auto"
          >
            Sí, eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}