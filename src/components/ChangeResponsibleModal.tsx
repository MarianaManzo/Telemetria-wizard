import { useEffect, useState } from "react"
import ModalBase from "./ModalBase"
import { Button } from "./ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar"

interface ChangeResponsibleModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (newResponsible: string) => void
  currentResponsible: string
}

const responsibleOptions = [
  {
    value: "mariana.manzo@numaris.com",
    label: "Mariana Manzo",
    email: "mariana.manzo@numaris.com",
    avatar:
      "https://images.unsplash.com/photo-1652471949169-9c587e8898cd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHdvbWFuJTIwcHJvZmVzc2lvbmFsJTIwaGVhZHNob3R8ZW58MXx8fHwxNzU4NjIzODAyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  },
  {
    value: "juan.perez@numaris.com",
    label: "Juan Pérez",
    email: "juan.perez@numaris.com",
    avatar:
      "https://images.unsplash.com/photo-1652471943570-f3590a4e52ed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMG1hbiUyMHByb2Zlc3Npb25hbCUyMGhlYWRzaG90fGVufDF8fHx8MTc1ODYwNDk4M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  },
  {
    value: "ana.garcia@numaris.com",
    label: "Ana García",
    email: "ana.garcia@numaris.com",
    avatar:
      "https://images.unsplash.com/photo-1581065178047-8ee15951ede6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMGJ1c2luZXNzJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzU4NjE2NTgwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  },
  {
    value: "carlos.rodriguez@numaris.com",
    label: "Carlos Rodríguez",
    email: "carlos.rodriguez@numaris.com",
    avatar:
      "https://images.unsplash.com/photo-1752778935828-bf6fdd5a834a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3Jwb3JhdGUlMjBleGVjdXRpdmUlMjBoZWFkc2hvdCUyMGxhdGlub3xlbnwxfHx8fDE3NTg2NTExNzR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  },
  {
    value: "supervisor-flota",
    label: "Supervisor de Flota",
    email: "supervisor@numaris.com",
    avatar:
      "https://images.unsplash.com/photo-1524538198441-241ff79d153b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMGV4ZWN1dGl2ZSUyMHByb2Zlc3Npb25hbCUyMG1hbnxlbnwxfHx8fDE3NTg2NTExODF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  }
]

export function ChangeResponsibleModal({
  isOpen,
  onClose,
  onSave,
  currentResponsible,
}: ChangeResponsibleModalProps) {
  const [selectedResponsible, setSelectedResponsible] = useState(currentResponsible)

  useEffect(() => {
    if (isOpen) {
      setSelectedResponsible(currentResponsible)
    }
  }, [isOpen, currentResponsible])

  const handleSave = () => {
    onSave(selectedResponsible)
    onClose()
  }

  const handleCancel = () => {
    onClose()
  }

  const renderSelectedTrigger = () => {
    if (!selectedResponsible) {
      return <SelectValue placeholder="Seleccionar responsable" />
    }

    const selectedOption = responsibleOptions.find((opt) => opt.value === selectedResponsible)
    if (!selectedOption) {
      return <SelectValue placeholder="Seleccionar responsable" />
    }

    return (
      <div className="flex items-center gap-3">
        <Avatar className="w-6 h-6">
          <AvatarImage src={selectedOption.avatar} alt={`Avatar de ${selectedOption.label}`} />
          <AvatarFallback className="text-[10px] bg-blue-100 text-blue-700">
            {selectedOption.label
              .split(' ')
              .map((name) => name.charAt(0))
              .join('')
              .toUpperCase()
              .slice(0, 2)}
          </AvatarFallback>
        </Avatar>
        <span className="text-[14px] text-foreground truncate">{selectedOption.email}</span>
      </div>
    )
  }

  return (
    <ModalBase
      open={isOpen}
      onClose={handleCancel}
      title="Cambiar responsable"
      size="sm"
      customFooter={(
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleCancel} className="text-[14px]">
            Cancelar
          </Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white text-[14px]">
            Guardar
          </Button>
        </div>
      )}
    >
      <div className="space-y-4">
        <div>
          <label className="text-[14px] text-foreground block mb-2">
            <span className="text-red-500 mr-1">*</span>
            Asignado a
          </label>
          <Select value={selectedResponsible} onValueChange={setSelectedResponsible}>
            <SelectTrigger className="w-full">
              {renderSelectedTrigger()}
            </SelectTrigger>
            <SelectContent className="bg-white max-h-60">
              {responsibleOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-3 py-1">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={option.avatar} alt={`Avatar de ${option.label}`} />
                      <AvatarFallback className="text-[10px] bg-blue-100 text-blue-700">
                        {option.label
                          .split(' ')
                          .map((name) => name.charAt(0))
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-[14px] text-foreground">{option.label}</span>
                      <span className="text-[12px] text-muted-foreground">{option.email}</span>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </ModalBase>
  )
}

