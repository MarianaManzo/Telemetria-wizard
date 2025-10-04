import { Loader2 } from "lucide-react";
import { Flex, Typography } from "antd";
import { spacing, radii, toPx } from "../styles/tokens";
import { Button } from "./ui/button";

interface LoadingStateProps {
  onCancel?: () => void;
  isUpdating?: boolean;
  isSavedReport?: boolean;
}

export function LoadingState({ onCancel, isUpdating = false, isSavedReport = false }: LoadingStateProps) {
  const getTitle = () => (isUpdating ? "El reporte se está actualizando" : "El reporte se está generando");

  const getDescription = () =>
    isSavedReport
      ? 'Puedes cerrar o cambiar de pantalla sin problema. Te avisaremos cuando esté listo y también lo podrás consultar en "Guardados".'
      : 'Puedes cerrar o cambiar de pantalla sin problema. Te avisaremos cuando esté listo y también lo podrás consultar en "Borradores".';

  return (
    <Flex
      vertical
      style={{
        background: "var(--color-bg-base)",
        marginInline: toPx(spacing.sm),
        borderRadius: toPx(radii.base),
        border: "1px solid var(--color-gray-200)",
        boxShadow: "var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05))",
        height: "100%",
      }}
    >
      <Flex flex={1} align="center" justify="center" style={{ minHeight: 0 }}>
        <Flex
          vertical
          align="center"
          style={{ textAlign: "center", maxWidth: 400, padding: toPx(spacing.sm), gap: toPx(spacing.sm) }}
        >
          <Flex align="center" justify="center" style={{ marginBottom: toPx(spacing.md) }}>
            <Loader2 style={{ width: 48, height: 48, color: "var(--color-primary)" }} className="animate-spin" />
          </Flex>
          <Typography.Title level={4} style={{ margin: 0, color: "var(--color-gray-700)" }}>
            {getTitle()}
          </Typography.Title>
          <Typography.Paragraph style={{ color: "var(--color-gray-600)", margin: 0 }}>
            {getDescription()}
          </Typography.Paragraph>
          {onCancel && (
            <Button type="link" onClick={onCancel} style={{ padding: 0 }}>
              Cancelar
            </Button>
          )}
        </Flex>
      </Flex>
    </Flex>
  );
}
