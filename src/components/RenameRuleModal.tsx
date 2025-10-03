import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog"
import { Rule } from "../types"

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

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-[16px]">Renombrar regla</DialogTitle>
          <DialogDescription className="text-[14px] text-muted-foreground">
            Modifica el nombre y descripción de la regla.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="rule-name" className="text-[14px]">
              Nombre de la regla *
            </Label>
            <Input
              id="rule-name"
              value={ruleName}
              onChange={(e) => setRuleName(e.target.value)}
              placeholder="Ingresa el nombre de la regla"
              className="text-[14px]"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="rule-description" className="text-[14px]">
              Descripción (opcional)
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
        
        <DialogFooter>
          <Button 
            variant="ghost" 
            onClick={handleClose}
            disabled={isRenaming}
            className="text-[14px] font-normal"
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}