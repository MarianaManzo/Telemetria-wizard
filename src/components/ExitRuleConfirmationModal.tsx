import { ExclamationCircleFilled } from "@ant-design/icons";
import { Button, Space, Typography } from "antd";
import ModalBase from "./ModalBase";

const { Text } = Typography;

interface ExitRuleConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExitWithoutSaving?: () => void;
  onStay?: () => void;
}

export function ExitRuleConfirmationModal({
  open,
  onOpenChange,
  onExitWithoutSaving,
  onStay,
}: ExitRuleConfirmationModalProps) {
  const handleClose = () => onOpenChange(false);

  return (
    <ModalBase
      open={open}
      onClose={handleClose}
      title={
        <Space align="start" size={8}>
          <ExclamationCircleFilled style={{ color: "#faad14" }} />
          <span>No has guardado los cambios</span>
        </Space>
      }
      size="sm"
      customFooter={
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <Button onClick={() => { onStay?.(); handleClose(); }} type="primary">
            Permanecer aquí
          </Button>
          <Button onClick={() => { onExitWithoutSaving?.(); handleClose(); }}>
            Salir sin guardar
          </Button>
        </div>
      }
    >
      <Text style={{ fontSize: 14, lineHeight: "22px" }}>
        Al salir de la regla perderás los cambios que no han sido guardados. ¿Estás seguro que deseas salir de la regla?
      </Text>
    </ModalBase>
  );
}
