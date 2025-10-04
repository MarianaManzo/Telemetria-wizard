import type { MenuProps } from "antd";
import { Flex, Menu, Typography } from "antd";
import type { CSSProperties } from "react";
import { spacing, toPx } from "../styles/tokens";
import { AppView } from "../types";

interface SidebarProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
}

const { Title } = Typography;

const sectionSpacing: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: toPx(spacing.sm),
};

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const showRulesSection = currentView === "rules" || currentView === "tags-rules";
  const showEventsSection =
    currentView === "events" || currentView === "my-events" || currentView === "tags-events";

  const handleMenuClick: MenuProps["onClick"] = ({ key }) => {
    onViewChange(key as AppView);
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
      {showRulesSection && (
        <div style={sectionSpacing}>
          <Title level={5} style={{ margin: 0 }}>
            Reglas
          </Title>
          <Menu
            mode="inline"
            selectedKeys={[currentView === "rules" ? "rules" : "tags-rules"]}
            onClick={handleMenuClick}
            items={[
              { key: "rules", label: "Reglas" },
              { key: "tags-rules", label: "Etiquetas" },
            ]}
            style={{ borderInlineEnd: "none" }}
          />
        </div>
      )}

      {showEventsSection && (
        <div style={sectionSpacing}>
          <Title level={5} style={{ margin: 0 }}>
            Eventos
          </Title>
          <Menu
            mode="inline"
            selectedKeys={[currentView]}
            onClick={handleMenuClick}
            items={[
              { key: "events", label: "Eventos" },
              { key: "my-events", label: "Mis eventos" },
              { key: "tags-events", label: "Etiquetas" },
            ]}
            style={{ borderInlineEnd: "none" }}
          />
        </div>
      )}
    </Flex>
  );
}
