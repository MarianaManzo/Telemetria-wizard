import { useState } from "react"

interface EventsDetailSidebarProps {
  onViewChange?: (view: string) => void
}

export function EventsDetailSidebar({ onViewChange }: EventsDetailSidebarProps) {
  const [activeItem, setActiveItem] = useState('evento')

  const sidebarItems = [
    { id: 'evento', label: 'Evento' },
    { id: 'notas', label: 'Notas' },
    { id: 'archivos', label: 'Archivos adjuntos' },
    { id: 'reglas', label: 'Reglas' },
    { id: 'etiquetas', label: 'Etiquetas' }
  ]

  const handleItemClick = (itemId: string) => {
    setActiveItem(itemId)
    onViewChange?.(itemId)
  }

  return (
    <div className="w-48 bg-[#fafafa] border-r border-border">
      <div className="p-4">
        <h2 className="text-foreground font-medium mb-4">Contenido</h2>
        <nav className="space-y-1">
          {sidebarItems.map((item) => {
            const isActive = item.id === activeItem
            return (
              <div
                key={item.id}
                className={`px-3 py-2 rounded transition-colors cursor-pointer ${
                  isActive
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
                onClick={() => handleItemClick(item.id)}
              >
                {item.label}
              </div>
            )
          })}
        </nav>
      </div>
    </div>
  )
}