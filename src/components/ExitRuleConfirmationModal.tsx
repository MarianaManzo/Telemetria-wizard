import { Dialog, DialogContent, DialogDescription, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { CloseIcon } from "./icons/CloseIcon";

interface ExitRuleConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExitWithoutSaving?: () => void;
  onStay?: () => void;
}

export function ExitRuleConfirmationModal({ 
  open, 
  onOpenChange, 
  onExitWithoutSaving, 
  onStay
}: ExitRuleConfirmationModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md p-0 rounded-[12px] shadow-lg [&>button]:hidden"
        styles={{ body: { padding: 0 } }}
      >
        <div className="flex flex-col">
          <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100">
            <DialogTitle className="text-[18px] font-semibold text-gray-900 leading-[24px]">
              No has guardado los cambios
            </DialogTitle>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              aria-label="Cerrar"
            >
              <CloseIcon />
            </button>
          </div>

          <div className="px-6 py-4">
            <DialogDescription className="text-[14px] leading-[20px] text-gray-700">
              Al salir de la regla perderás los cambios que no han sido guardados. ¿Estás seguro que deseas salir de la regla?
            </DialogDescription>
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={() => {
                onStay?.();
                onOpenChange(false);
              }}
              className="text-[14px] border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Permanecer aquí
            </Button>
            <Button
              onClick={() => {
                onExitWithoutSaving?.();
                onOpenChange(false);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white text-[14px] font-medium"
            >
              Salir sin guardar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
