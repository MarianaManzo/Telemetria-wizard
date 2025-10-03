import { Button } from "./ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from "./ui/dropdown-menu"
import { AlertTriangle, Save, Copy, Undo2 } from "lucide-react"

interface UnsavedChangesButtonProps {
  onSaveChanges: () => void
  onSaveAsNew: () => void
  onUndoChanges: () => void
}

export function UnsavedChangesButton({ 
  onSaveChanges, 
  onSaveAsNew, 
  onUndoChanges 
}: UnsavedChangesButtonProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100 hover:border-amber-300 cursor-pointer"
        >
          <AlertTriangle className="w-4 h-4 mr-2" />
          Cambios sin guardar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={onSaveChanges}>
          <Save className="w-4 h-4 mr-2" />
          Guardar cambios al reporte
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onSaveAsNew}>
          <Copy className="w-4 h-4 mr-2" />
          Guardar como reporte nuevo
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onUndoChanges}>
          <Undo2 className="w-4 h-4 mr-2" />
          Deshacer cambios
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}