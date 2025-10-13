import React, { useRef, useState, useCallback } from "react";
import {
  AlignCenterOutlined,
  AlignLeftOutlined,
  AlignRightOutlined,
  BoldOutlined,
  CloseOutlined,
  CodeOutlined,
  HighlightOutlined,
  ItalicOutlined,
  LinkOutlined,
  MinusOutlined,
  OrderedListOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  RedoOutlined,
  StrikethroughOutlined,
  UnderlineOutlined,
  UndoOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { ConfigProvider, Drawer, Button, Form, Input, Select, Collapse, Typography, Divider } from "antd";
import { EyeOutlined } from "@ant-design/icons";

const { Panel } = Collapse;
const { Text } = Typography;

type ToolbarItem =
  | { type: "button"; key: string; icon: React.ReactNode; ariaLabel: string }
  | { type: "divider"; key: string };

const textToolbarItems: ToolbarItem[] = [
  { type: "button", key: "bold", icon: <BoldOutlined />, ariaLabel: "Negrita" },
  { type: "button", key: "italic", icon: <ItalicOutlined />, ariaLabel: "Cursiva" },
  { type: "button", key: "underline", icon: <UnderlineOutlined />, ariaLabel: "Subrayado" },
  { type: "button", key: "strike", icon: <StrikethroughOutlined />, ariaLabel: "Tachado" },
  { type: "button", key: "mention", icon: <span style={{ fontWeight: 600 }}>@</span>, ariaLabel: "Mención" },
  { type: "divider", key: "divider-1" },
  { type: "button", key: "link", icon: <LinkOutlined />, ariaLabel: "Insertar enlace" },
  { type: "button", key: "code", icon: <CodeOutlined />, ariaLabel: "Insertar código" },
  { type: "button", key: "quote", icon: <HighlightOutlined />, ariaLabel: "Destacar texto" },
  { type: "divider", key: "divider-2" },
  { type: "button", key: "unordered", icon: <UnorderedListOutlined />, ariaLabel: "Lista con viñetas" },
  { type: "button", key: "ordered", icon: <OrderedListOutlined />, ariaLabel: "Lista numerada" },
  { type: "button", key: "indent", icon: <MenuUnfoldOutlined />, ariaLabel: "Aumentar sangría" },
  { type: "button", key: "outdent", icon: <MenuFoldOutlined />, ariaLabel: "Reducir sangría" },
  { type: "divider", key: "divider-3" },
  { type: "button", key: "align-left", icon: <AlignLeftOutlined />, ariaLabel: "Alinear a la izquierda" },
  { type: "button", key: "align-center", icon: <AlignCenterOutlined />, ariaLabel: "Centrar" },
  { type: "button", key: "align-right", icon: <AlignRightOutlined />, ariaLabel: "Alinear a la derecha" },
  { type: "button", key: "align-justify", icon: <span style={{ fontWeight: 600 }}>≋</span>, ariaLabel: "Justificar" },
  { type: "divider", key: "divider-4" },
  { type: "button", key: "separator", icon: <MinusOutlined />, ariaLabel: "Separador" },
  { type: "button", key: "undo", icon: <UndoOutlined />, ariaLabel: "Deshacer" },
  { type: "button", key: "redo", icon: <RedoOutlined />, ariaLabel: "Rehacer" },
];

export default function TemplateDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const MIN = 726;
  const [width, setWidth] = useState(MIN);
  const dragging = useRef(false);

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging.current) return;
    const newW = Math.max(window.innerWidth - e.clientX, MIN);
    setWidth(newW);
  }, [MIN]);

  const stopDrag = useCallback(() => {
    dragging.current = false;
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", stopDrag);
  }, [onMouseMove]);

  const startDrag = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", stopDrag);
  }, [onMouseMove, stopDrag]);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      placement="right"
      width={width}
      mask
      title={
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
          <span>Crear plantilla</span>
          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={onClose}
            style={{ margin: 0, padding: 4, display: "flex", alignItems: "center", justifyContent: "center" }}
          />
        </div>
      }
      closable={false}
      styles={{
        header: { padding: "16px 0 16px 24px" },
        body: { padding: 0, display: "flex", flexDirection: "column", height: "100%" },
        footer: { position: "sticky", bottom: 0, background: "#fff" },
      }}
      footer={
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Button
            type="link"
            icon={<EyeOutlined />}
            style={{ paddingLeft: 0, paddingRight: 0, fontWeight: 500 }}
          >
            Vista previa
          </Button>
          <div style={{ display: "flex", gap: 8 }}>
            <Button onClick={onClose}>Cancelar</Button>
            <Button type="primary">Guardar</Button>
          </div>
        </div>
      }
    >
      {/* Área scrollable */}
      <div style={{ flex: 1, overflow: "auto" }}>
        {/* Contenedor centrado */}
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: 16 }}>
          {/* GRID con divider vertical al centro */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(486px, 1fr) 1px minmax(0, 240px)",
              gap: 0,
              alignItems: "start",
            }}
          >
            {/* COLUMNA PRINCIPAL */}
            <ConfigProvider theme={{ components: { Collapse: { headerPadding: "16px" } } }}>
              <div>
                <Collapse defaultActiveKey={["cfg"]} ghost expandIconPosition="end">
                  <Panel header={<span style={{ fontSize: 14, fontWeight: 600 }}>Configuración de plantilla</span>} key="cfg">
                    <Text>Diseña tu plantilla con componentes y variables dinámicas.</Text>
                    <div style={{ height: 12 }} />
                    <Form layout="vertical" requiredMark="optional">
                      <Form.Item label="Nombre de la plantilla" required><Input /></Form.Item>
                      <Form.Item label="Asunto" required><Input /></Form.Item>
                      <Form.Item label="Remitentes"><Select placeholder="Select" options={[]} /></Form.Item>
                      <Form.Item label="Destinatarios"><Select placeholder="Select" options={[]} /></Form.Item>
                    </Form>
                  </Panel>
                </Collapse>

                {/* Divider bajo configuración */}
                <Divider style={{ margin: "12px 0" }} />

                <div style={{ height: 12 }} />

                <Collapse defaultActiveKey={["body"]} ghost expandIconPosition="end">
                  {/* 2ª sección: título solicitado */}
                  <Panel header={<span style={{ fontSize: 14, fontWeight: 600 }}>Contenido del mensaje</span>} key="body">
                    <Text>Usa “#” para autocompletar variables</Text>
                    <div style={{ height: 8 }} />
                    {/* Toolbar de formato */}
                  <div
                    style={{
                      display: "flex",
                      width: "100%",
                      border: "1px solid #d9d9d9",
                      borderRadius: 999,
                      overflow: "hidden",
                      background: "#fff",
                      padding: "0 4px",
                    }}
                  >
                    {textToolbarItems.map((item) =>
                      item.type === "divider" ? (
                        <div
                          key={item.key}
                          style={{ width: 1, margin: "6px 4px", background: "#e5e5e5" }}
                        />
                      ) : (
                        <button
                          key={item.key}
                          type="button"
                          aria-label={item.ariaLabel}
                          style={{
                            border: "none",
                            background: "transparent",
                            padding: "6px 10px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 16,
                            lineHeight: 1,
                            cursor: "pointer",
                          }}
                        >
                          {item.icon}
                        </button>
                      ),
                    )}
                  </div>
                    <div style={{ height: 12 }} />
                    <Input.TextArea rows={10} placeholder="Escribe el contenido..." />
                    <div style={{ height: 12 }} />
                  </Panel>
                </Collapse>
              </div>
            </ConfigProvider>

            {/* DIVIDER VERTICAL */}
            <div style={{ background: "#f0f0f0", width: 1, height: "100%" }} />

            {/* SIDEBAR */}
            <aside style={{ position: "sticky", top: 0, background: "rgba(0, 0, 0, 0.03)" }}>
              {/* Divider horizontal de la columna */}
              <Divider style={{ margin: "0 0 12px" }} />

              <ConfigProvider theme={{ components: { Collapse: { headerPadding: "16px" } } }}>
                <Collapse defaultActiveKey={["comp", "vars"]} ghost expandIconPosition="end">
                  <Panel header={<span style={{ fontSize: 14, fontWeight: 600 }}>Componentes</span>} key="comp">
                    <div style={{ display: "grid", gap: 8 }}>
                      {["Encabezado","Bloque de texto","Mensaje de alerta","Botón de acción","Divisor","Imagen"].map((t) => (
                        <div key={t} style={{ border: "1px solid #f0f0f0", borderRadius: 8, padding: 10, display:"flex", alignItems:"center", gap:8, background: "#fff" }}>
                          <span style={{ cursor:"grab" }}>⋮⋮</span>
                          <div>
                            <div>{t}</div>
                            <Text type="secondary">Título principal</Text>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Panel>

                  <Panel header={<span style={{ fontSize: 14, fontWeight: 600 }}>Variables</span>} key="vars">
                    <Input.Search placeholder="Search" style={{ marginBottom: 8 }} />
                    <div style={{ display: "grid", gap: 8 }}>
                      {["{unidad}","{presion}","{presion}","{temperatura}","{unidad}","{unidad}"].map((v,i)=>(
                        <div key={i} style={{ border:"1px solid #e6e6e6", borderRadius: 8, padding: 8, background:"#faf5ff" }}>
                          {v}
                        </div>
                      ))}
                    </div>
                  </Panel>
                </Collapse>
              </ConfigProvider>
            </aside>
          </div>
        </div>
      </div>

      {/* HANDLE de resize (borde izquierdo) */}
      <div
        onMouseDown={startDrag}
        style={{
          position: "absolute",
          top: 0, left: -2, width: 4, height: "100%",
          cursor: "col-resize", background: "transparent",
        }}
      >
        <div style={{ position: "absolute", top: 0, right: 1, width: 2, height: "100%", background: "#d9d9d9" }} />
      </div>
    </Drawer>
  );
}

export { TemplateDrawer as EmailTemplateDrawer };
