import React, { useRef, useState, useCallback } from "react";
import { CloseOutlined } from "@ant-design/icons";
import { Drawer, Button, Form, Input, Select, Collapse, Typography, Divider } from "antd";

const { Panel } = Collapse;
const { Text, Title } = Typography;

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
          <a>👁️ Vista previa</a>
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
            <div>
              <Collapse defaultActiveKey={["cfg"]} ghost expandIconPosition="end">
                <Panel header="Configuración de plantilla" key="cfg">
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
                <Panel header="Contenido del mensaje" key="body">
                  <Text>Usa “#” para autocompletar variables</Text>
                  <div style={{ height: 8 }} />
                  {/* Toolbar simple */}
                  <div style={{ display: "flex", gap: 8, padding: "8px 0" }}>
                    <Button size="small">B</Button>
                    <Button size="small">I</Button>
                    <Button size="small">U</Button>
                    <Divider type="vertical" />
                    <Button size="small">Izq</Button>
                    <Button size="small">Cen</Button>
                    <Button size="small">Der</Button>
                    <Button size="small">Just</Button>
                  </div>
                  <Input.TextArea rows={10} placeholder="Escribe el contenido..." />
                  <div style={{ height: 12 }} />
                  {/* Ejemplo con variables */}
                  <div style={{ border: "1px solid #f0f0f0", borderRadius: 8, padding: 12 }}>
                    <Title level={5} style={{ marginTop: 0 }}>ALERTA DETECTADA</Title>
                    <div>Velocidad: <span className="chip">{`{presion}`}</span></div>
                    <div>Ubicación: <span className="chip">{`{ubicacion}`}</span></div>
                    <div>Temperatura: <span className="chip">{`{temperatura}`}</span></div>
                    <div>Presión: <span className="chip">{`{unidad}`}</span></div>
                    <div style={{ marginTop: 8 }}>Por favor revise este evento</div>
                  </div>
                </Panel>
              </Collapse>
            </div>

            {/* DIVIDER VERTICAL */}
            <div style={{ background: "#f0f0f0", width: 1, height: "100%" }} />

            {/* SIDEBAR */}
            <aside style={{ position: "sticky", top: 0, background: "rgba(0, 0, 0, 0.03)" }}>
              {/* Divider horizontal de la columna */}
              <Divider style={{ margin: "0 0 12px" }} />

              <Collapse defaultActiveKey={["comp", "vars"]} ghost expandIconPosition="end">
                <Panel header="Componentes" key="comp">
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

                <Panel header="Variables" key="vars">
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
