import { useState, type CSSProperties } from "react";
import { spacing, toPx } from "../styles/tokens";

interface RulesDetailSidebarProps {
  onViewChange?: (view: string) => void;
}

const sidebarItems = [
  { id: "regla", label: "Información general" },
  { id: "notas", label: "Notas" },
  { id: "adjuntos", label: "Archivos adjuntos" },
  { id: "eventos", label: "Eventos" },
];

const headerVar = "var(--app-header-height, 64px)";

const containerStyles: CSSProperties = {
  height: `calc(100vh - ${headerVar})`,
  background: "#fafafa",
  padding: "24px 16px",
  display: "flex",
  flexDirection: "column",
  gap: "3px",
  position: "sticky",
  top: headerVar,
  overflowY: "auto",
};

const navStyles: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "3px",
  justifyContent: "center",
  width: "100%",
};

const headingStyles: CSSProperties = {
  margin: "0 0 9px 0",
  fontSize: "18px",
  fontWeight: 400,
  color: "#252525E0",
  lineHeight: "22px",
  padding: "4px 8px",
};

const getButtonStyles = (active: boolean): CSSProperties => ({
  width: "100%",
  textAlign: "left",
  padding: "0 8px",
  borderRadius: "8px",
  border: "none",
  backgroundColor: active ? "#F2F2F2" : "transparent",
  color: active ? "#1f1f1f" : "#4a4a4a",
  fontSize: "14px",
  fontWeight: 400,
  cursor: "pointer",
  transition: "background-color 0.2s ease, color 0.2s ease",
  height: "30px",
  lineHeight: "30px",
  margin: "4px 0",
});

export function RulesDetailSidebar({ onViewChange }: RulesDetailSidebarProps) {
  const [activeItem, setActiveItem] = useState<string>(sidebarItems[0].id);

  const handleClick = (id: string) => {
    setActiveItem(id);
    onViewChange?.(id);
  };

  return (
    <aside style={containerStyles}>
      <h2 style={headingStyles}>Contenido</h2>
      <nav style={navStyles}>
        {sidebarItems.map((item) => {
          const active = activeItem === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleClick(item.id)}
              style={getButtonStyles(active)}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
