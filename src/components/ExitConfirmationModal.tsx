import { Button } from "./ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog"

interface ExitConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onStay: () => void
  onExitWithoutSaving: () => void
}

export function ExitConfirmationModal({ 
  isOpen, 
  onClose, 
  onStay, 
  onExitWithoutSaving 
}: ExitConfirmationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>You haven't saved the report</DialogTitle>
          <DialogDescription className="text-sm text-gray-600 leading-relaxed">
            Do you want to save it before leaving?
            <br />
            If you decide not to save it, don't worry: you will still be able to find it later in the 'Drafts' section.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onExitWithoutSaving}
            className="text-sm"
          >
            Exit without saving
          </Button>
          <Button
            onClick={onStay}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
          >
            Stay here
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}