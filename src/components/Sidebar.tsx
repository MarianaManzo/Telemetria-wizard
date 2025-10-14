import type { CSSProperties } from "react"
import { spacing, toPx } from "../styles/tokens"
import type { AppView } from "../types"

interface SidebarProps {
  currentView: AppView
  onViewChange: (view: AppView) => void
}

type SidebarItem = {
  key: AppView
  label: string
}

type SidebarSection = {
  title: string
  items: SidebarItem[]
}

const containerStyles: CSSProperties = {
  flex: 1,
  minHeight: 0,
  background: "#fafafa",
  padding: `16px`,
  display: "flex",
  flexDirection: "column",
  gap: "30px",
}

const sectionStyles: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "16px",
}

const navListStyles: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "4px",
}

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const eventsSection: SidebarSection = {
    title: "Eventos",
    items: [
      { key: "events", label: "Todos los eventos" },
      { key: "my-events", label: "Mis eventos" },
      { key: "rules", label: "Reglas" },
      { key: "tags-events", label: "Etiquetas" },
    ],
  }

  const rulesSection: SidebarSection = {
    title: "Reglas",
    items: [
      { key: "rules", label: "Reglas" },
      { key: "tags-rules", label: "Etiquetas" },
    ],
  }

  const isEventsContext = currentView === "events" || currentView === "my-events" || currentView === "tags-events"
  const isRulesContext = currentView === "rules" || currentView === "tags-rules"

  const sections: SidebarSection[] = []

  if (isEventsContext) {
    sections.push(eventsSection)
  }

  if (isRulesContext) {
    sections.push(rulesSection)
  }

  if (sections.length === 0) {
    sections.push(eventsSection)
  }

  const isItemActive = (key: AppView) => {
    if (key === "rules") {
      return currentView === "rules" || currentView === "tags-rules"
    }
    return currentView === key
  }

  const handleClick = (key: AppView) => {
    onViewChange(key)
  }

  return (
    <aside style={containerStyles}>
      {sections.map((section) => (
        <div key={section.title} style={sectionStyles}>
          <h2 style={{ fontSize: "18px", fontWeight: 400, color: "#1f1f1f", margin: 0 }}>{section.title}</h2>
          <nav style={navListStyles}>
            {section.items.map((item) => {
              const active = isItemActive(item.key)
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleClick(item.key)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "0 8px",
                    height: "30px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: active ? "#e9e9e9" : "transparent",
                    color: active ? "#2f2f2f" : "#4a4a4a",
                    fontSize: "14px",
                    fontWeight: 400,
                    cursor: "pointer",
                    transition: "background-color 0.2s, color 0.2s",
                  }}
                >
                  {item.label}
                </button>
              )
            })}
          </nav>
        </div>
      ))}
    </aside>
  )
}
