import React, { useCallback, useMemo, useRef, useState } from "react";
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
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MinusOutlined,
  OrderedListOutlined,
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
  | { type: "button"; key: string; icon: React.ReactNode; ariaLabel: string; command?: string; handler?: () => void }
  | { type: "divider"; key: string };

type DraggableComponent = {
  label: string;
  helper: string;
  html: string;
};

type DraggableVariable = {
  label: string;
  html: string;
};

const pillCssText = [
  "display:inline-flex",
  "align-items:center",
  "gap:4px",
  "padding:2px 6px",
  "border-radius:12px",
  "border:1px solid #c792ff",
  "background:#f4e8ff",
  "color:#5b34b6",
  "font-weight:500",
  "font-size:13px",
  "line-height:1",
].join(";");

const createVariableHtml = (placeholder: string) => {
  const key = placeholder.replace(/[{}]/g, "");
  return `<span class="template-pill" data-variable="${key}" style="${pillCssText}">${placeholder}</span>`;
};

const createVariableElement = (placeholder: string) => {
  const span = document.createElement("span");
  span.className = "template-pill";
  span.setAttribute("data-variable", placeholder.replace(/[{}]/g, ""));
  span.textContent = placeholder;
  span.setAttribute("style", pillCssText);
  return span;
};

const componentItems: DraggableComponent[] = [
  {
    label: "Encabezado",
    helper: "Título principal",
    html: `<h2 style="margin:0 0 12px;font-size:18px;font-weight:600;">ALERTA DETECTADA</h2>`
  },
  {
    label: "Bloque de texto",
    helper: "Párrafo descriptivo",
    html: `<p style="margin:0 0 12px;line-height:1.5;">Escribe aquí el cuerpo del mensaje.</p>`
  },
  {
    label: "Mensaje de alerta",
    helper: "Resalta eventos",
    html: `<div style="margin:0 0 12px;padding:12px;border-radius:12px;border:1px solid #ffe0bd;background:#fff7f0;">Mensaje de alerta: ${createVariableHtml("{presion}")}</div>`
  },
  {
    label: "Botón de acción",
    helper: "CTA destacado",
    html: `<p style="margin:0 0 12px;"><a style="display:inline-flex;align-items:center;justify-content:center;padding:8px 16px;border-radius:999px;background:#3559ff;color:#fff;text-decoration:none;font-weight:600;" href="https://tu-enlace.com" target="_blank" rel="noopener noreferrer">Ver detalle</a></p>`
  },
  {
    label: "Divisor",
    helper: "Separador visual",
    html: `<hr style="border:none;border-top:1px solid #d9d9d9;margin:16px 0;" />`
  },
  {
    label: "Imagen",
    helper: "Elemento gráfico",
    html: `<figure style="margin:0 0 12px;"><img src="https://tu-imagen.com/ejemplo.png" alt="Imagen descriptiva" style="max-width:100%;border-radius:8px;" /><figcaption style="font-size:12px;color:#6f7390;margin-top:4px;">Descripción de la imagen</figcaption></figure>`
  },
];

const variableTokens = ["{unidad}", "{presion}", "{presion}", "{temperatura}", "{unidad}", "{unidad}"];

const variableItems: DraggableVariable[] = variableTokens.map((token) => ({
  label: token,
  html: createVariableHtml(token),
}));

const componentHtmlByLabel = Object.fromEntries(componentItems.map((item) => [item.label, item.html]));
const variableHtmlByLabel = Object.fromEntries(variableItems.map((item) => [item.label, item.html]));

const defaultPreviewHtml = [
  `<h2 style="margin:0 0 12px;font-size:18px;font-weight:600;">ALERTA DETECTADA</h2>`,
  `<p style="margin:0 0 8px;">Velocidad: ${createVariableHtml("{presion}")}</p>`,
  `<p style="margin:0 0 8px;">Ubicación: ${createVariableHtml("{ubicacion}")}</p>`,
  `<p style="margin:0 0 8px;">Temperatura: ${createVariableHtml("{temperatura}")}</p>`,
  `<p style="margin:0 0 16px;">Presión: ${createVariableHtml("{unidad}")}</p>`,
  `<p style="margin:0 0 16px;">Por favor revise este evento</p>`,
  `<p style="margin:0 0 0;color:#6f7390;">Sistema de Monitoreo Numaris</p>`,
].join("");

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

const insertHtmlAtCursor = (html: string, root: HTMLElement): boolean => {
  ensureSelectionInEditor(root);
  const inserted = document.execCommand("insertHTML", false, html);
  if (inserted) return true;

  const selection = window.getSelection();
  if (!selection) return false;
  if (selection.rangeCount === 0) {
    const range = document.createRange();
    range.selectNodeContents(root);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
  }
  const range = selection.getRangeAt(0);
  range.deleteContents();
  const fragment = range.createContextualFragment(html);
  range.insertNode(fragment);
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
  return true;
};

const getCaretOffset = (root: HTMLElement): number | null => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;
  const range = selection.getRangeAt(0);
  if (!root.contains(range.commonAncestorContainer)) return null;
  const preRange = range.cloneRange();
  preRange.selectNodeContents(root);
  preRange.setEnd(range.endContainer, range.endOffset);
  return preRange.toString().length;
};

const setCaretOffset = (root: HTMLElement, offset: number) => {
  const selection = window.getSelection();
  if (!selection) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
  let currentOffset = 0;
  let textNode: Text | null = null;

  while (walker.nextNode()) {
    const node = walker.currentNode as Text;
    const nextOffset = currentOffset + (node.textContent?.length ?? 0);
    if (offset <= nextOffset) {
      textNode = node;
      const position = offset - currentOffset;
      const range = document.createRange();
      range.setStart(node, Math.max(0, position));
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
      return;
    }
    currentOffset = nextOffset;
  }

  const fallbackRange = document.createRange();
  fallbackRange.selectNodeContents(root);
  fallbackRange.collapse(false);
  selection.removeAllRanges();
  selection.addRange(fallbackRange);
};

const ensureSelectionInEditor = (root: HTMLElement) => {
  const selection = window.getSelection();
  if (!selection) return;
  if (selection.rangeCount === 0 || !root.contains(selection.anchorNode)) {
    const range = document.createRange();
    range.selectNodeContents(root);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
  }
};

const normalizeEditorContent = (root: HTMLElement) => {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
  const textNodes: Text[] = [];

  while (walker.nextNode()) {
    const node = walker.currentNode as Text;
    if (!node.textContent) continue;
    if (!node.textContent.includes("{")) continue;
    if (node.parentElement?.closest(".template-pill")) continue;
    if (/\{[^}{\s]+\}/.test(node.textContent)) {
      textNodes.push(node);
    }
  }

  textNodes.forEach((textNode) => {
    const parent = textNode.parentNode;
    if (!parent) return;
    const parts = textNode.textContent?.split(/(\{[^}{\s]+\})/g) ?? [];
    const fragment = document.createDocumentFragment();

    parts.forEach((part) => {
      if (!part) return;
      if (/^\{[^}{\s]+\}$/.test(part)) {
        fragment.appendChild(createVariableElement(part));
      } else {
        fragment.appendChild(document.createTextNode(part));
      }
    });

    parent.replaceChild(fragment, textNode);
  });
};

const clampCaretOutsidePills = (root: HTMLElement) => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;
  const range = selection.getRangeAt(0);
  if (!root.contains(range.commonAncestorContainer)) return;
  const pill = (range.commonAncestorContainer as HTMLElement).closest?.(".template-pill");
  if (!pill || !pill.parentElement) return;

  const afterRange = document.createRange();
  afterRange.setStartAfter(pill);
  afterRange.collapse(true);
  selection.removeAllRanges();
  selection.addRange(afterRange);
};

const moveCaretToDragPoint = (event: React.DragEvent<HTMLDivElement>, root: HTMLElement) => {
  const selection = window.getSelection();
  if (!selection) return;
  let range: Range | null = null;
  const caretRangeFromPoint = (document as any).caretRangeFromPoint as
    | ((x: number, y: number) => Range | null)
    | undefined;
  if (caretRangeFromPoint) {
    range = caretRangeFromPoint(event.clientX, event.clientY);
  } else {
    const caretPositionFromPoint = (document as any).caretPositionFromPoint as
      | ((x: number, y: number) => { offsetNode: Node; offset: number } | null)
      | undefined;
    const pos = caretPositionFromPoint?.(event.clientX, event.clientY);
    if (pos) {
      range = document.createRange();
      range.setStart(pos.offsetNode, pos.offset);
      range.collapse(true);
    }
  }

  if (range && root.contains(range.commonAncestorContainer)) {
    selection.removeAllRanges();
    selection.addRange(range);
  } else {
    ensureSelectionInEditor(root);
  }
};

export default function TemplateDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const MIN = 726;
  const [width, setWidth] = useState(MIN);
  const [bodyHtml, setBodyHtml] = useState("");
  const [previewVisible, setPreviewVisible] = useState(false);
  const dragging = useRef(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const dragPayloadRef = useRef<string | null>(null);
  const lastSelectionRef = useRef<Range | null>(null);

  const textToolbarItems: ToolbarItem[] = useMemo(
    () => [
      { type: "button", key: "bold", icon: <BoldOutlined />, ariaLabel: "Negrita", command: "bold" },
      { type: "button", key: "italic", icon: <ItalicOutlined />, ariaLabel: "Cursiva", command: "italic" },
      { type: "button", key: "underline", icon: <UnderlineOutlined />, ariaLabel: "Subrayado", command: "underline" },
      { type: "button", key: "strike", icon: <StrikethroughOutlined />, ariaLabel: "Tachado", command: "strikeThrough" },
      { type: "divider", key: "divider-1" },
      { type: "button", key: "link", icon: <LinkOutlined />, ariaLabel: "Insertar enlace" },
      { type: "button", key: "code", icon: <CodeOutlined />, ariaLabel: "Código", command: "formatBlock" },
      { type: "button", key: "highlight", icon: <HighlightOutlined />, ariaLabel: "Resaltar", command: "backColor" },
      { type: "divider", key: "divider-2" },
      { type: "button", key: "unordered", icon: <UnorderedListOutlined />, ariaLabel: "Lista con viñetas", command: "insertUnorderedList" },
      { type: "button", key: "ordered", icon: <OrderedListOutlined />, ariaLabel: "Lista numerada", command: "insertOrderedList" },
      { type: "button", key: "indent", icon: <MenuUnfoldOutlined />, ariaLabel: "Aumentar sangría", command: "indent" },
      { type: "button", key: "outdent", icon: <MenuFoldOutlined />, ariaLabel: "Reducir sangría", command: "outdent" },
      { type: "divider", key: "divider-3" },
      { type: "button", key: "align-left", icon: <AlignLeftOutlined />, ariaLabel: "Alinear a la izquierda", command: "justifyLeft" },
      { type: "button", key: "align-center", icon: <AlignCenterOutlined />, ariaLabel: "Centrar", command: "justifyCenter" },
      { type: "button", key: "align-right", icon: <AlignRightOutlined />, ariaLabel: "Alinear a la derecha", command: "justifyRight" },
      { type: "divider", key: "divider-4" },
      { type: "button", key: "separator", icon: <MinusOutlined />, ariaLabel: "Separador", handler: () => {
        const editor = editorRef.current;
        if (!editor) return;
        insertHtmlAtCursor("<hr style=\"border:none;border-top:1px solid #d9d9d9;margin:16px 0;\" />", editor);
      } },
      { type: "button", key: "undo", icon: <UndoOutlined />, ariaLabel: "Deshacer", command: "undo" },
      { type: "button", key: "redo", icon: <RedoOutlined />, ariaLabel: "Rehacer", command: "redo" },
    ],
    [],
  );

  const rememberSelection = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    if (!editor.contains(range.commonAncestorContainer)) return;
    lastSelectionRef.current = range.cloneRange();
  }, []);

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

  const restoreSelection = useCallback(() => {
    const editor = editorRef.current;
    const selection = window.getSelection();
    if (!editor || !selection) return;
    const stored = lastSelectionRef.current;
    if (stored) {
      selection.removeAllRanges();
      selection.addRange(stored.cloneRange());
    } else {
      ensureSelectionInEditor(editor);
    }
  }, []);

  const syncEditorState = useCallback((preserveCaret: boolean) => {
    const editor = editorRef.current;
    if (!editor) return;
    let caret: number | null = null;
    if (preserveCaret) {
      caret = getCaretOffset(editor);
    }
    normalizeEditorContent(editor);
    if (preserveCaret && caret !== null) {
      setCaretOffset(editor, caret);
    }
    setBodyHtml(editor.innerHTML);
    rememberSelection();
  }, [rememberSelection]);

  const handleEditorInput = useCallback(() => {
    syncEditorState(true);
    rememberSelection();
    const editor = editorRef.current;
    if (editor) clampCaretOutsidePills(editor);
  }, [rememberSelection, syncEditorState]);

  const allowDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }, []);

  const handleDropIntoBody = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const editor = editorRef.current;
      if (!editor) return;
      editor.focus({ preventScroll: true });
      restoreSelection();
      const htmlData = event.dataTransfer.getData("text/html");
      const customData = event.dataTransfer.getData("application/x-template-html");
      const labelFallback = event.dataTransfer.getData("application/x-template-label") || event.dataTransfer.getData("text/plain");
      const fromLabel = componentHtmlByLabel[labelFallback] || variableHtmlByLabel[labelFallback] || "";
      const html = htmlData || customData || dragPayloadRef.current || fromLabel;
      if (!html) return;
      const inserted = insertHtmlAtCursor(html, editor);
      if (!inserted) {
        editor.insertAdjacentHTML("beforeend", html);
      }
      syncEditorState(true);
      rememberSelection();
      clampCaretOutsidePills(editor);
      dragPayloadRef.current = null;
    },
    [rememberSelection, restoreSelection, syncEditorState],
  );

  const handlePaste = useCallback(
    (event: React.ClipboardEvent<HTMLDivElement>) => {
      event.preventDefault();
      const editor = editorRef.current;
      if (!editor) return;
      const text = event.clipboardData.getData("text/plain");
      insertHtmlAtCursor(escapeHtml(text).replace(/\n/g, "<br/>"), editor);
      syncEditorState(true);
      rememberSelection();
      clampCaretOutsidePills(editor);
    },
    [rememberSelection, syncEditorState],
  );

  const handleDragStart = useCallback((html: string, label: string) => {
    return (event: React.DragEvent<HTMLDivElement>) => {
      dragPayloadRef.current = html;
      event.dataTransfer.setData("text/html", html);
      event.dataTransfer.setData("text/plain", label);
      event.dataTransfer.setData("application/x-template-html", html);
      event.dataTransfer.setData("application/x-template-label", label);
      event.dataTransfer.effectAllowed = "copyMove";
    };
  }, []);

  const openPreview = useCallback(() => setPreviewVisible(true), []);
  const closePreview = useCallback(() => setPreviewVisible(false), []);

  const previewHtml = useMemo(() => {
    const stripped = bodyHtml.replace(/<[^>]*>/g, "").trim();
    return stripped ? bodyHtml : defaultPreviewHtml;
  }, [bodyHtml]);

  const handleToolbarAction = useCallback((item: ToolbarItem) => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus({ preventScroll: true });
    restoreSelection();
    if (item.key === "link") {
      const url = window.prompt("Introduce el enlace", "https://");
      if (url) {
        document.execCommand("createLink", false, url);
      }
    } else if (item.handler) {
      item.handler();
    } else if (item.command) {
      if (item.command === "formatBlock") {
        document.execCommand("formatBlock", false, "pre");
      } else if (item.command === "backColor") {
        document.execCommand("backColor", false, "#f4e8ff");
      } else {
        document.execCommand(item.command, false);
      }
    }
    syncEditorState(true);
    rememberSelection();
    clampCaretOutsidePills(editor);
  }, [rememberSelection, restoreSelection, syncEditorState]);

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
        <div style={{ flex: 1, overflow: "auto" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: 16 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(486px, 1fr) 1px minmax(0, 240px)",
                gap: 0,
                alignItems: "start",
              }}
            >
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
                      <Form layout="vertical" requiredMark style={{ display: "grid", gap: 8 }} labelCol={{ style: { fontWeight: 500 } }}>
                        <Form.Item label="Nombre de la plantilla" required>
                          <Input />
                        </Form.Item>
                        <Form.Item label="Asunto" required>
                          <Input />
                        </Form.Item>
                        <Form.Item label="Remitentes" required>
                          <Select placeholder="Selecciona" options={[]} />
                        </Form.Item>
                        <Form.Item label="Destinatarios" required>
                          <Select placeholder="Selecciona" options={[]} />
                        </Form.Item>
                      </Form>
                    </Panel>
                  </Collapse>

                  <Divider style={{ margin: "12px 0" }} />
                  <div style={{ height: 12 }} />

                  <Collapse defaultActiveKey={["body"]} ghost expandIconPosition="end">
                    <Panel header={<span style={{ fontSize: 14, fontWeight: 600 }}>Contenido del mensaje</span>} key="body">
                      <Text>Usa “#” para autocompletar variables o arrastra componentes del panel derecho.</Text>
                      <div style={{ height: 8 }} />
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
                            <div key={item.key} style={{ width: 1, margin: "6px 4px", background: "#e5e5e5" }} />
                          ) : (
                            <button
                              key={item.key}
                              type="button"
                              aria-label={item.ariaLabel}
                              onMouseDown={(event) => event.preventDefault()}
                              onClick={() => handleToolbarAction(item)}
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
                      <div
                        ref={editorRef}
                        contentEditable
                        suppressContentEditableWarning
                        onInput={handleEditorInput}
                        onDrop={handleDropIntoBody}
                        onDragOver={allowDrop}
                        onPaste={handlePaste}
                        onKeyUp={rememberSelection}
                        onMouseUp={rememberSelection}
                        onFocus={restoreSelection}
                        onBlur={rememberSelection}
                        style={{
                          minHeight: 240,
                          padding: 12,
                          border: "1px solid #d9d9d9",
                          borderRadius: 12,
                          background: "#fff",
                          lineHeight: 1.5,
                          fontSize: 14,
                          outline: "none",
                        }}
                        data-placeholder="Escribe el contenido..."
                      />
                    </Panel>
                  </Collapse>
                </div>
              </ConfigProvider>

              <div style={{ background: "#f0f0f0", width: 1, height: "100%" }} />

              <aside style={{ position: "sticky", top: 0, background: "rgba(0, 0, 0, 0.03)" }}>
                <Divider style={{ margin: "0 0 12px" }} />

                <ConfigProvider theme={{ components: { Collapse: { headerPadding: "16px" } } }}>
                  <Collapse defaultActiveKey={["comp", "vars"]} ghost expandIconPosition="end">
                    <Panel header={<span style={{ fontSize: 14, fontWeight: 600 }}>Componentes</span>} key="comp">
                      <div style={{ display: "grid", gap: 8 }}>
                        {componentItems.map(({ label, helper, html }) => (
                          <div
                            key={label}
                            draggable
                            onDragStart={handleDragStart(html, label)}
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
                        {variableItems.map(({ label, html }, index) => (
                          <div
                            key={`${label}-${index}`}
                            draggable
                            onDragStart={handleDragStart(html, label)}
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
                            {label}
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

        <div
          onMouseDown={startDrag}
          style={{
            position: "absolute",
            top: 0,
            left: -2,
            width: 4,
            height: "100%",
            cursor: "col-resize",
            background: "transparent",
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
            fontSize: 14,
            lineHeight: 1.5,
          }}
          dangerouslySetInnerHTML={{ __html: previewHtml }}
        />
      </ModalBase>
    </>
  );
}

export { TemplateDrawer as EmailTemplateDrawer };
