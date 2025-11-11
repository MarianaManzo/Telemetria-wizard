import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import ModalBase from './ModalBase'
import { Rule } from "../types"

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

  const [showNameError, setShowNameError] = useState(false)

  const handleSave = async () => {
    const trimmedName = ruleName.trim()
    if (trimmedName.length < 3 || trimmedName.length > 50) {
      setShowNameError(true)
      return
    }

    setShowNameError(false)
    setIsSaving(true)
    
    try {
      const ruleData = {
        ...defaultData,
        name: trimmedName,
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
    setRuleName(defaultData?.name || '')
    setRuleDescription(defaultData?.description || '')
    setShowNameError(false)
    onClose()
  }

  const trimmedName = ruleName.trim()
  const nameIsValid = trimmedName.length >= 3 && trimmedName.length <= 50

  const footer = (
    <div className="flex justify-end gap-4">
      <Button
        variant="outline"
        onClick={handleClose}
        disabled={isSaving}
        className="text-[14px] font-normal border-gray-300 text-gray-700 hover:bg-gray-50"
      >
        Cancelar
      </Button>
      <Button onClick={handleSave} disabled={!nameIsValid || isSaving} className="bg-blue-600 hover:bg-blue-700 text-white text-[14px] font-normal">
        {isSaving ? 'Guardando...' : 'Guardar'}
      </Button>
    </div>
  )

  return (
    <ModalBase open={isOpen} onClose={handleClose} title={isRenaming ? 'Renombrar' : 'Guardar regla'} subtitle={'Confirma los detalles antes de guardar la regla'} size="md" maskClosable={false} customFooter={footer}>
      <div className="space-y-4 mb-6">
        <div>
          <Label htmlFor="rule-name" className="text-[14px] font-medium text-gray-700 mb-2 block text-left">
            <span className="text-red-500 mr-1">*</span> Nombre de la regla
          </Label>
          <Input
            id="rule-name"
            value={ruleName}
            onChange={(e) => {
              const value = e.target.value.slice(0, 50)
              setRuleName(value)
              if (value.trim().length >= 3) {
                setShowNameError(false)
              }
            }}
            maxLength={50}
            placeholder="Escribe un nombre"
            className="text-[14px] w-full"
            aria-invalid={showNameError && !nameIsValid}
            style={{
              ...(showNameError && !nameIsValid
                ? { border: '1px solid #F04438', boxShadow: 'none', borderRadius: '8px' }
                : {})
            }}
          />
          {showNameError && (
            <p className="text-[12px] text-red-500 mt-1">
              {trimmedName.length === 0
                ? 'Este campo es obligatorio.'
                : 'Debe tener como mínimo 3 caracteres.'}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="rule-description" className="text-[14px] font-medium text-gray-700 mb-2 block text-left">
            Descripción (opcional)
          </Label>
          <Textarea id="rule-description" value={ruleDescription} onChange={(e) => setRuleDescription(e.target.value)} placeholder="Agrega una descripción breve" className="min-h-[80px] text-[14px] w-full resize-none" />
        </div>
      </div>
    </ModalBase>
  )
}
