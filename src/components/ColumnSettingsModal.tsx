import { useEffect, useState } from 'react'
import { MenuOutlined, EyeInvisibleOutlined, EyeOutlined, SettingOutlined } from '@ant-design/icons'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Button } from './ui/button'
import { ColumnPreference } from '../hooks/useColumnPreferences'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'

interface ColumnSettingsModalProps {
  isOpen: boolean
  columns: ColumnPreference[]
  onClose: () => void
  onApply: (columns: ColumnPreference[]) => void
}

const arrayMove = <T,>(arr: T[], from: number, to: number) => {
  const updated = [...arr]
  const [item] = updated.splice(from, 1)
  updated.splice(to, 0, item)
  return updated
}

const useColumnSettingsState = (isActive: boolean, columns: ColumnPreference[]) => {
  const [localColumns, setLocalColumns] = useState(columns)
  const [dragIndex, setDragIndex] = useState<number | null>(null)

  useEffect(() => {
    if (isActive) {
      setLocalColumns(columns)
    }
  }, [isActive, columns])

  const handleToggle = (columnId: string) => {
    setLocalColumns((prev) => {
      const visibleCount = prev.filter((col) => col.enabled !== false).length
      return prev.map((col) => {
        if (col.id !== columnId) return col
        if (col.enabled !== false && visibleCount === 1) {
          return col
        }
        return { ...col, enabled: col.enabled === false ? true : false }
      })
    })
  }

  const handleDragStart = (index: number) => setDragIndex(index)

  const handleDrop = (index: number) => {
    if (dragIndex === null || dragIndex === index) return
    setLocalColumns((prev) => arrayMove(prev, dragIndex, index))
    setDragIndex(null)
  }

  return { localColumns, setLocalColumns, handleToggle, handleDragStart, handleDrop }
}

interface ColumnSettingsListProps {
  columns: ColumnPreference[]
  onToggle: (columnId: string) => void
  onDragStart: (index: number) => void
  onDrop: (index: number) => void
}

const ColumnSettingsList = ({ columns, onToggle, onDragStart, onDrop }: ColumnSettingsListProps) => (
  <div className="space-y-2 py-2">
    {columns.map((column, index) => (
      <div
        key={column.id}
        className="flex items-center justify-between rounded-md border border-gray-200 px-3 py-2 text-[14px]"
        draggable
        onDragStart={() => onDragStart(index)}
        onDragOver={(event) => event.preventDefault()}
        onDrop={() => onDrop(index)}
      >
        <div className="flex items-center gap-2">
          <MenuOutlined className="text-gray-500" />
          <span>{column.label}</span>
        </div>
        <button
          type="button"
          onClick={() => onToggle(column.id)}
          className="text-gray-600"
          aria-label={column.enabled === false ? 'Mostrar columna' : 'Ocultar columna'}
        >
          {column.enabled === false ? <EyeInvisibleOutlined /> : <EyeOutlined />}
        </button>
      </div>
    ))}
  </div>
)

export function ColumnSettingsModal({ isOpen, columns, onClose, onApply }: ColumnSettingsModalProps) {
  const { localColumns, handleToggle, handleDragStart, handleDrop } =
    useColumnSettingsState(isOpen, columns)

  const handleApply = () => {
    onApply(localColumns)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => (!open ? onClose() : null)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Personalizar columnas</DialogTitle>
        </DialogHeader>
        <ColumnSettingsList
          columns={localColumns}
          onToggle={handleToggle}
          onDragStart={handleDragStart}
          onDrop={handleDrop}
        />
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleApply}>Aplicar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function ColumnSettingsIconButton(
  props: React.ButtonHTMLAttributes<HTMLButtonElement>
) {
  const { className = '', ...rest } = props
  return (
    <button
      type="button"
      className={`ml-auto flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-gray-600 transition hover:border-gray-200 hover:text-gray-900 ${className}`}
      {...rest}
    >
      <SettingOutlined className="text-[16px]" />
    </button>
  )
}

export function ColumnSettingsTriggerButton({ onClick }: { onClick: () => void }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <ColumnSettingsIconButton onClick={onClick} aria-label="Personalizar columnas" />
        </TooltipTrigger>
        <TooltipContent>Personalizar columnas</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

interface ColumnSettingsPopoverProps {
  columns: ColumnPreference[]
  onApply: (columns: ColumnPreference[]) => void
}

export function ColumnSettingsPopover({ columns, onApply }: ColumnSettingsPopoverProps) {
  const [open, setOpen] = useState(false)
  const { localColumns, handleToggle, handleDragStart, handleDrop, setLocalColumns } =
    useColumnSettingsState(open, columns)

  const handleApply = () => {
    onApply(localColumns)
    setOpen(false)
  }

  const handleCancel = () => {
    setLocalColumns(columns)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <ColumnSettingsIconButton aria-label="Personalizar columnas" />
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="end">
        <div className="px-4 py-3 border-b border-gray-200 text-[14px] font-semibold">
          Personalizar columnas
        </div>
        <div className="max-h-64 overflow-auto px-2">
          <ColumnSettingsList
            columns={localColumns}
            onToggle={handleToggle}
            onDragStart={handleDragStart}
            onDrop={handleDrop}
          />
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-gray-200 px-4 py-3">
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button onClick={handleApply}>Aplicar</Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
