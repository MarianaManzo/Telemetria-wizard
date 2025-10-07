import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { IconExclamationCircleFilled } from "./icons/IconExclamationCircleFilled";
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
      <DialogContent className="max-w-md p-0 gap-0 [&>button]:hidden">
        <div className="bg-white box-border content-stretch flex flex-col items-start justify-start overflow-clip relative rounded-[8px] shadow-[0px_6px_16px_0px_rgba(0,0,0,0.08),0px_3px_6px_-4px_rgba(0,0,0,0.12),0px_9px_28px_8px_rgba(0,0,0,0.05)] size-full">
          {/* Header */}
          <div className="relative shrink-0 w-full" data-name="Head">
            <div className="flex flex-row items-center relative size-full">
              <div className="box-border content-stretch flex gap-3 items-center justify-start px-6 py-4 relative w-full">
                <IconExclamationCircleFilled />
                <div className="basis-0 font-['Source_Sans_3:SemiBold',_sans-serif] font-semibold grow leading-[0] min-h-px min-w-px relative shrink-0 text-[16px] text-[rgba(37,37,37,0.88)]">
                  <DialogTitle className="leading-[24px]">No has guardado los cambios</DialogTitle>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="relative shrink-0 w-full" data-name="Content Wrapper">
            <div className="flex flex-col justify-center relative size-full">
              <div className="box-border content-stretch flex flex-col gap-4 items-start justify-center px-6 py-3 relative w-full">
                <div className="font-['Source_Sans_3:Regular',_sans-serif] font-normal leading-[0] min-w-full relative shrink-0 text-[14px] text-[rgba(37,37,37,0.88)]" style={{ width: "min-content" }}>
                  <DialogDescription className="leading-[22px]">
                    Al salir de la regla perderás los cambios que no han sido guardados. ¿Estás seguro que deseas salir de la regla?
                  </DialogDescription>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-[rgba(0,0,0,0)] relative shrink-0 w-full" data-name="Footer">
            <div className="flex flex-row items-center justify-end relative size-full">
              <div className="box-border content-stretch flex gap-4 items-center justify-end pb-4 pt-0 px-6 relative w-full">
                {/* Permanecer aquí button */}
                <Button
                  onClick={() => {
                    onStay?.();
                    onOpenChange(false);
                  }}
                  className="bg-[#1867ff] box-border content-stretch flex flex-col gap-2 items-center justify-center px-4 py-0 relative rounded-[8px] shrink-0 h-8 border border-[#1867ff] shadow-[0px_2px_0px_0px_rgba(5,145,255,0.1)]"
                >
                  <div className="content-stretch flex gap-2 h-8 items-center justify-center relative shrink-0">
                    <div className="font-['Source_Sans_3:Regular',_sans-serif] font-normal leading-[0] relative shrink-0 text-[14px] text-nowrap text-white">
                      <p className="leading-[22px] whitespace-pre">Permanecer aquí</p>
                    </div>
                  </div>
                </Button>
                
                {/* Salir sin guardar button */}
                <Button
                  variant="outline"
                  onClick={() => {
                    onExitWithoutSaving?.();
                    onOpenChange(false);
                  }}
                  className="bg-white box-border content-stretch flex flex-col gap-2 items-center justify-center px-4 py-0 relative rounded-[8px] shrink-0 h-8 border border-[#d9d9d9] shadow-[0px_2px_0px_0px_rgba(0,0,0,0.02)]"
                >
                  <div className="content-stretch flex gap-2 h-8 items-center justify-center relative shrink-0">
                    <div className="font-['Source_Sans_3:Regular',_sans-serif] font-normal leading-[0] relative shrink-0 text-[14px] text-[rgba(37,37,37,0.88)] text-nowrap">
                      <p className="leading-[22px] whitespace-pre">Salir sin guardar</p>
                    </div>
                  </div>
                </Button>
              </div>
            </div>
          </div>

          {/* Close button */}
          <div className="absolute overflow-clip right-5 rounded-[6px] size-[22px] top-4" data-name="Button Close">
            <button
              onClick={() => onOpenChange(false)}
              className="w-full h-full"
            >
              <CloseIcon />
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}