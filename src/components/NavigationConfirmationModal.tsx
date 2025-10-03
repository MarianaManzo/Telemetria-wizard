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

interface NavigationConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  targetReportName: string
}

export function NavigationConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  targetReportName
}: NavigationConfirmationModalProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cambios sin guardar</AlertDialogTitle>
          <AlertDialogDescription>
            Tienes cambios sin guardar en el reporte actual. Si navegas a "{targetReportName}", 
            se perderán todos los cambios no guardados.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Continuar sin guardar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}