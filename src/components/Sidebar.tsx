import { sidebarItems } from "../constants/data"
import { AppView } from "../types"

interface SidebarProps {
  currentView: AppView
  onViewChange: (view: AppView) => void
}

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  return (
    <div className="w-48 bg-[#fafafa] border-r border-border">
      <div className="p-4">
        {(currentView === 'rules' || currentView === 'tags-rules') && (
          <>
            <h2 className="text-foreground font-medium mb-4">Reglas</h2>
            <nav className="space-y-1">
              <div
                className="px-3 py-2 rounded transition-colors cursor-pointer text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                onClick={() => {
                  onViewChange('rules');
                }}
              >
                Reglas
              </div>
              <div
                className={`px-3 py-2 rounded transition-colors cursor-pointer ${
                  currentView === 'tags-rules'
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
                onClick={() => {
                  onViewChange('tags-rules');
                }}
              >
                Etiquetas
              </div>
            </nav>
          </>
        )}

        {(currentView === 'events' || currentView === 'my-events' || currentView === 'tags-events') && (
          <>
            <h2 className="text-foreground font-medium mb-4">Eventos</h2>
            <nav className="space-y-1">
              <div
                className={`px-3 py-2 rounded transition-colors cursor-pointer ${
                  currentView === 'events'
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
                onClick={() => {
                  onViewChange('events');
                }}
              >
                Eventos
              </div>
              <div
                className={`px-3 py-2 rounded transition-colors cursor-pointer ${
                  currentView === 'my-events'
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
                onClick={() => {
                  onViewChange('my-events');
                }}
              >
                Mis eventos
              </div>
              <div
                className={`px-3 py-2 rounded transition-colors cursor-pointer ${
                  currentView === 'tags-events'
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`}
                onClick={() => {
                  onViewChange('tags-events');
                }}
              >
                Etiquetas
              </div>
            </nav>
          </>
        )}
      </div>
    </div>
  )
}