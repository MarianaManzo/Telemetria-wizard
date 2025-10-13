import React, { useRef, useState, useCallback, useMemo } from "react";
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
import ModalBase from "./ModalBase";

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

const componentItems = [
  { label: "Encabezado", helper: "Título principal", snippet: "ALERTA DETECTADA\n\n" },
  { label: "Bloque de texto", helper: "Párrafo descriptivo", snippet: "Escribe aquí el cuerpo del mensaje.\n\n" },
  { label: "Mensaje de alerta", helper: "Resalta eventos", snippet: "Mensaje de alerta: describe la situación detectada.\n\n" },
  { label: "Botón de acción", helper: "CTA destacado", snippet: "Botón de acción: [Ver detalle](https://tu-enlace.com)\n\n" },
  { label: "Divisor", helper: "Separador visual", snippet: "---\n\n" },
  { label: "Imagen", helper: "Elemento gráfico", snippet: "![Imagen descriptiva](https://tu-imagen.com/ejemplo.png)\n\n" },
];

const variableItems = ["{unidad}", "{presion}", "{presion}", "{temperatura}", "{unidad}", "{unidad}"];

type PreviewBlock =
  | { type: "title"; text: string }
  | { type: "row"; label: string; value: string }
  | { type: "text"; text: string }
  | { type: "divider" };

const defaultPreviewBlocks: PreviewBlock[] = [
  { type: "title", text: "ALERTA DETECTADA" },
  { type: "row", label: "Velocidad", value: "{presion}" },
  { type: "row", label: "Ubicación", value: "{ubicacion}" },
  { type: "row", label: "Temperatura", value: "{temperatura}" },
  { type: "row", label: "Presión", value: "{unidad}" },
  { type: "divider" },
  { type: "text", text: "Por favor revise este evento" },
  { type: "divider" },
  { type: "text", text: "Sistema de Monitoreo Numaris" },
];

const chipStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  borderRadius: 12,
  padding: "2px 6px",
  background: "#f4e8ff",
  color: "#5b34b6",
  border: "1px solid #c792ff",
  fontWeight: 500,
};

function renderTextWithChips(text: string) {
  return text.split(/(\{[^}]+\})/g).map((segment, index) => {
    if (segment.startsWith("{") && segment.endsWith("}")) {
      return (
        <span key={`chip-${segment}-${index}`} style={{ ...chipStyle, marginRight: 4 }}>
          {segment}
        </span>
      );
    }
    return (
      <span key={`text-${index}`} style={{ whiteSpace: "pre-wrap" }}>
        {segment}
      </span>
    );
  });
}

export default function TemplateDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const MIN = 726;
  const [width, setWidth] = useState(MIN);
  const [bodyContent, setBodyContent] = useState("");
  const [previewVisible, setPreviewVisible] = useState(false);
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

  const allowDrop = useCallback((event: React.DragEvent<HTMLTextAreaElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }, []);

  const handleDropIntoBody = useCallback(
    (event: React.DragEvent<HTMLTextAreaElement>) => {
      event.preventDefault();
      const text = event.dataTransfer.getData("text/plain");
      if (!text) return;
      const target = event.currentTarget;
      const { selectionStart, selectionEnd } = target;
      const start = selectionStart ?? bodyContent.length;
      const end = selectionEnd ?? start;
      const nextValue = `${bodyContent.slice(0, start)}${text}${bodyContent.slice(end)}`;
      setBodyContent(nextValue);
      const cursor = start + text.length;
      requestAnimationFrame(() => {
        target.selectionStart = cursor;
        target.selectionEnd = cursor;
      });
    },
    [bodyContent],
  );

  const handleBodyChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBodyContent(event.target.value);
  }, []);

  const handleDragStart = useCallback((payload: string) => {
    return (event: React.DragEvent<HTMLDivElement>) => {
      event.dataTransfer.setData("text/plain", payload);
      event.dataTransfer.effectAllowed = "copyMove";
    };
  }, []);

  const openPreview = useCallback(() => {
    setPreviewVisible(true);
  }, []);

  const closePreview = useCallback(() => {
    setPreviewVisible(false);
  }, []);

  const previewBlocks = useMemo<PreviewBlock[]>(() => {
    if (!bodyContent.trim()) {
      return defaultPreviewBlocks;
    }

    return bodyContent
      .split(/\n+/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map<PreviewBlock>((text, index) => {
        if (index === 0) {
          return { type: "title", text };
        }
        if (text === "---") {
          return { type: "divider" };
        }
        const colonIndex = text.indexOf(":");
        if (colonIndex > -1) {
          const label = text.slice(0, colonIndex).trim();
          const value = text.slice(colonIndex + 1).trim();
          return { type: "row", label, value };
        }
        return { type: "text", text };
      });
  }, [bodyContent]);

  return (
    <>
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
            onClick={openPreview}
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
            <ConfigProvider
              theme={{
                components: {
                  Collapse: { headerPadding: "16px" },
                  Form: { itemMarginBottom: 8, verticalLabelPadding: "0 0 4px" },
                },
              }}
            >
              <div>
                <Collapse defaultActiveKey={["cfg"]} ghost expandIconPosition="end">
                  <Panel header={<span style={{ fontSize: 14, fontWeight: 600 }}>Configuración de plantilla</span>} key="cfg">
                    <Text>Diseña tu plantilla con componentes y variables dinámicas.</Text>
                    <div style={{ height: 12 }} />
                    <Form
                      layout="vertical"
                      requiredMark
                      style={{ display: "grid", gap: 8 }}
                      labelCol={{ style: { fontWeight: 500 } }}
                    >
                      <Form.Item label="Nombre de la plantilla" required>
                        <Input />
                      </Form.Item>
                      <Form.Item label="Asunto" required>
                        <Input />
                      </Form.Item>
                      <Form.Item label="Remitentes" required>
                        <Select placeholder="Select" options={[]} />
                      </Form.Item>
                      <Form.Item label="Destinatarios" required>
                        <Select placeholder="Select" options={[]} />
                      </Form.Item>
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
                    <Input.TextArea
                      rows={10}
                      placeholder="Escribe el contenido..."
                      value={bodyContent}
                      onChange={handleBodyChange}
                      onDrop={handleDropIntoBody}
                      onDragOver={allowDrop}
                    />
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
                      {componentItems.map(({ label, helper, snippet }) => (
                        <div
                          key={label}
                          draggable
                          onDragStart={handleDragStart(snippet)}
                          style={{
                            border: "1px solid #f0f0f0",
                            borderRadius: 8,
                            padding: 10,
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            background: "#fff",
                            cursor: "grab",
                          }}
                        >
                          <span style={{ fontSize: 18, lineHeight: 1 }}>⋮⋮</span>
                          <div>
                            <div>{label}</div>
                            <Text type="secondary">{helper}</Text>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Panel>

                  <Panel header={<span style={{ fontSize: 14, fontWeight: 600 }}>Variables</span>} key="vars">
                    <Input.Search placeholder="Search" style={{ marginBottom: 8 }} />
                    <div style={{ display: "grid", gap: 8 }}>
                      {variableItems.map((v, i) => (
                        <div
                          key={i}
                          draggable
                          onDragStart={handleDragStart(v)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            border: "1px solid #c792ff",
                            background: "#f4e8ff",
                            color: "#5b34b6",
                            borderRadius: 12,
                            padding: "6px 10px",
                            fontWeight: 500,
                            cursor: "grab",
                          }}
                        >
                          <span style={{ fontSize: 18, lineHeight: 1 }}>⋮⋮</span>
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
      <ModalBase
        open={previewVisible}
        onClose={closePreview}
        title="Vista previa"
        size="md"
        customFooter={
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button onClick={closePreview}>Cerrar</Button>
          </div>
        }
      >
        <div
          style={{
            borderRadius: 12,
            border: "1px solid #e5e5e5",
            padding: 16,
            background: "#fff",
            display: "grid",
            gap: 12,
          }}
        >
          {previewBlocks.map((block, index) => {
            switch (block.type) {
              case "title":
                return (
                  <Text key={`title-${index}`} strong style={{ fontSize: 16 }}>
                    {renderTextWithChips(block.text)}
                  </Text>
                );
              case "row":
                return (
                  <div
                    key={`row-${block.label}-${index}`}
                    style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}
                  >
                    <Text strong style={{ minWidth: 105 }}>{block.label}:</Text>
                    {renderTextWithChips(block.value)}
                  </div>
                );
              case "text":
                return (
                  <div key={`text-${index}`} style={{ color: index === previewBlocks.length - 1 ? "#6f7390" : undefined }}>
                    {renderTextWithChips(block.text)}
                  </div>
                );
              case "divider":
                return <Divider key={`divider-${index}`} style={{ margin: 0 }} />;
              default:
                return null;
            }
          })}
        </div>
      </ModalBase>
    </>
  );
}

export { TemplateDrawer as EmailTemplateDrawer };
