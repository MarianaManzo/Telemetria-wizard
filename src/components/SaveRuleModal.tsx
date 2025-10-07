import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "./ui/dialog"
import { Rule } from "../types"
import { CloseIcon } from "./icons/CloseIcon"

interface SaveRuleModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (ruleData: Partial<Rule>) => void
  defaultData?: Partial<Rule>
  isRenaming?: boolean
}

export function SaveRuleModal({ isOpen, onClose, onSave, defaultData, isRenaming = false }: SaveRuleModalProps) {
  const [ruleName, setRuleName] = useState(defaultData?.name || "")
  const [ruleDescription, setRuleDescription] = useState(defaultData?.description || "")
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    if (!ruleName.trim()) {
      return
    }

    setIsSaving(true)
    
    try {
      const ruleData = {
        ...defaultData,
        name: ruleName.trim(),
        description: ruleDescription.trim()
      }
      
      onSave(ruleData)
      onClose()
    } catch (error) {
      console.error('Error saving rule:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleClose = () => {
    setRuleName(defaultData?.name || "")
    setRuleDescription(defaultData?.description || "")
    onClose()
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          handleClose()
        }
      }}
    >
      <DialogContent
        className="max-w-[480px] bg-white rounded-[12px] p-0 shadow-lg [&>button]:hidden"
        styles={{ body: { padding: 0 } }}
      >
        <div className="flex flex-col">
          <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100">
            <div>
              <DialogTitle className="text-[18px] font-semibold text-gray-900 leading-[24px]">
                {isRenaming ? 'Renombrar' : 'Guardar regla'}
              </DialogTitle>
              <DialogDescription className="mt-1 text-[14px] text-gray-600 leading-[20px]">
                Confirma los detalles antes de guardar la regla
              </DialogDescription>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              aria-label="Cerrar"
            >
              <CloseIcon />
            </button>
          </div>

          <div className="px-6 py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rule-name" className="text-[14px] font-medium text-gray-700">
                Nombre de la regla
              </Label>
              <Input
                id="rule-name"
                value={ruleName}
                onChange={(e) => setRuleName(e.target.value)}
                placeholder="Escribe un nombre"
                className="text-[14px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rule-description" className="text-[14px] font-medium text-gray-700">
                Descripción (opcional)
              </Label>
              <Textarea
                id="rule-description"
                value={ruleDescription}
                onChange={(e) => setRuleDescription(e.target.value)}
                placeholder="Agrega una descripción breve"
                className="min-h-[96px] text-[14px] resize-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSaving}
              className="text-[14px] font-normal border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={!ruleName.trim() || isSaving}
              className="bg-blue-600 hover:bg-blue-700 text-white text-[14px] font-medium"
            >
              {isSaving ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
