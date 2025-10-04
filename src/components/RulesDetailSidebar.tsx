import { useState } from "react";
import { Flex, Menu, Typography } from "antd";
import type { MenuProps } from "antd";
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

export function RulesDetailSidebar({ onViewChange }: RulesDetailSidebarProps) {
  const [activeItem, setActiveItem] = useState<string>(sidebarItems[0].id);

  const handleClick: MenuProps["onClick"] = ({ key }) => {
    setActiveItem(key);
    onViewChange?.(key);
  };

  return (
    <Flex
      vertical
      style={{
        height: "100%",
        background: "var(--color-bg-base)",
        padding: `${toPx(spacing.md)} ${toPx(spacing.sm)}`,
        gap: toPx(spacing.lg),
      }}
    >
      <Typography.Title level={5} style={{ margin: 0 }}>
        Contenido
      </Typography.Title>
      <Menu
        mode="inline"
        selectedKeys={[activeItem]}
        onClick={handleClick}
        items={sidebarItems.map(item => ({ key: item.id, label: item.label }))}
        style={{ borderInlineEnd: "none" }}
      />
    </Flex>
  );
}
