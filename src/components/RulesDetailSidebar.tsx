import { useState, type CSSProperties } from "react";
import { spacing, toPx } from "../styles/tokens";

interface RulesDetailSidebarProps {
  onViewChange?: (view: string) => void;
}

const sidebarItems = [
  { id: "regla", label: "Regla" },
  { id: "notas", label: "Notas" },
  { id: "eventos", label: "Eventos" },
  { id: "etiquetas", label: "Etiquetas" },
];

const containerStyles: CSSProperties = {
  height: "100%",
  background: "#fafafa",
  padding: `${toPx(spacing.md)} ${toPx(spacing.sm)}`,
  display: "flex",
  flexDirection: "column",
  gap: toPx(spacing.lg),
};

const navStyles: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "6px",
};

const headingStyles: CSSProperties = {
  margin: 0,
  fontSize: "16px",
  fontWeight: 500,
  color: "#1f1f1f",
};

const getButtonStyles = (active: boolean): CSSProperties => ({
  width: "100%",
  textAlign: "left",
  padding: "6px 12px",
  borderRadius: "8px",
  border: "none",
  backgroundColor: active ? "#e8e8e8" : "transparent",
  color: active ? "#1f1f1f" : "#4a4a4a",
  fontSize: "14px",
  fontWeight: 400,
  cursor: "pointer",
  transition: "background-color 0.2s ease, color 0.2s ease",
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
