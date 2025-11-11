import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Rule } from "../types"
import ModalBase from "./ModalBase"

interface RenameRuleModalProps {
  isOpen: boolean
  onClose: () => void
  onRename: (ruleId: string, newName: string, newDescription: string) => void
  rule: Rule | null
}

export function RenameRuleModal({ isOpen, onClose, onRename, rule }: RenameRuleModalProps) {
  const [ruleName, setRuleName] = useState(rule?.name || "")
  const [ruleDescription, setRuleDescription] = useState(rule?.description || "")
  const [isRenaming, setIsRenaming] = useState(false)

  const handleRename = async () => {
    if (!ruleName.trim() || !rule) {
      return
    }

    setIsRenaming(true)
    
    try {
      onRename(rule.id, ruleName.trim(), ruleDescription.trim())
      onClose()
    } catch (error) {
      console.error('Error renaming rule:', error)
    } finally {
      setIsRenaming(false)
    }
  }

  const handleClose = () => {
    setRuleName(rule?.name || "")
    setRuleDescription(rule?.description || "")
    onClose()
  }

  // Update state when rule changes
  useEffect(() => {
    if (rule) {
      setRuleName(rule.name)
      setRuleDescription(rule.description || "")
    }
  }, [rule])

  const footer = (
    <div className="flex justify-end gap-3">
      <Button
        variant="outline"
        onClick={handleClose}
        disabled={isRenaming}
        className="text-[14px]"
      >
        Cancelar
      </Button>
      <Button
        onClick={handleRename}
        disabled={!ruleName.trim() || isRenaming}
        className="bg-blue-600 hover:bg-blue-700 text-white text-[14px]"
      >
        {isRenaming ? "Renombrando..." : "Renombrar"}
      </Button>
    </div>
  )

  return (
    <ModalBase
      open={isOpen}
      onClose={handleClose}
      title="Renombrar regla"
      subtitle="Modifica el nombre y la descripción de esta regla."
      size="sm"
      customFooter={footer}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="rule-name" className="text-[14px] text-foreground flex items-center gap-1">
            <span className="text-red-500">*</span>
            <span>Nombre de la regla</span>
          </Label>
          <Input
            id="rule-name"
            value={ruleName}
            onChange={(e) => setRuleName(e.target.value)}
            placeholder="Ingresa el nombre de la regla"
            className="text-[14px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="rule-description" className="text-[14px] text-foreground">
            Descripción
          </Label>
          <Textarea
            id="rule-description"
            value={ruleDescription}
            onChange={(e) => setRuleDescription(e.target.value)}
            placeholder="Describe brevemente el propósito de esta regla"
            className="min-h-[80px] text-[14px]"
          />
        </div>
      </div>
    </ModalBase>
  )
}
