import { useRef, useEffect, useState, useCallback, useImperativeHandle, forwardRef } from "react"
import type { DragEvent } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { ChevronDown } from "lucide-react"

interface VariableTextareaProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  maxLength?: number
  name?: string
  showVariableButton?: boolean
}

export interface VariableTextareaHandle {
  insertVariable: (variableKey: string) => void
  focus: () => void
}

export interface MessageVariableDescriptor {
  key: string
  label: string
  description: string
}

// Lista de variables disponibles
const AVAILABLE_VARIABLES: MessageVariableDescriptor[] = [
  { key: '{unidad}', label: 'Nombre de la unidad', description: 'Nombre del vehículo o dispositivo' },
  { key: '{velocidad}', label: 'Velocidad actual', description: 'Velocidad registrada en el momento del evento' },
  { key: '{ubicacion_link}', label: 'Ubicación con enlace', description: 'Dirección con enlace a Google Maps' },
  { key: '{fecha_hora}', label: 'Fecha y hora', description: 'Timestamp del evento' },
  { key: '{conductor}', label: 'Conductor', description: 'Nombre del conductor asignado' },
  { key: '{temperatura}', label: 'Temperatura', description: 'Temperatura del motor o ambiente' },
  { key: '{combustible}', label: 'Nivel de combustible', description: 'Porcentaje de combustible restante' },
  { key: '{rpm}', label: 'RPM del motor', description: 'Revoluciones por minuto del motor' },
  { key: '{zona}', label: 'Zona geográfica', description: 'Nombre de la zona donde ocurrió el evento' },
  { key: '{voltaje}', label: 'Voltaje de batería', description: 'Voltaje actual de la batería del dispositivo' }
]

interface VariableButtonProps {
  onInsertVariable: (variableKey: string) => void
  variables?: MessageVariableDescriptor[]
  label?: string
  triggerClassName?: string
}

// Componente separado para el botón de variables
export function VariableButton({
  onInsertVariable,
  variables = AVAILABLE_VARIABLES,
  label = 'Más variables',
  triggerClassName,
}: VariableButtonProps) {
  const triggerClasses =
    triggerClassName ||
    'px-2 py-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors flex items-center gap-1 text-[12px]'

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={triggerClasses}
          title="Insertar variable"
        >
          <span className="text-[14px]">{label}</span>
          <ChevronDown className="w-3 h-3" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0 m-2" align="end">
        <div className="p-2 border-b border-gray-100">
          <div className="text-[12px] font-medium text-gray-700">Variables disponibles</div>
          <div className="text-[11px] text-gray-500">Click para insertar en el cursor</div>
        </div>
        <div className="max-h-64 overflow-y-auto">
          {variables.map((variable) => (
            <button
              key={variable.key}
              type="button"
              className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
              draggable
              onDragStart={(event) => {
                event.dataTransfer.setData('application/x-variable-key', variable.key)
                event.dataTransfer.setData('text/plain', variable.key)
                event.dataTransfer.effectAllowed = 'copy'
              }}
              onClick={() => onInsertVariable(variable.key)}
            >
              <div className="text-[13px] font-medium text-blue-600">
                {variable.key}
              </div>
              <div className="text-[12px] text-gray-600 mt-1">
                {variable.description}
              </div>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

const VariableTextareaComponent = (
  props: VariableTextareaProps,
  ref: React.ForwardedRef<VariableTextareaHandle>
) => {
  const {
    value,
    onChange,
    placeholder,
    className = '',
    maxLength = 120,
    name,
    showVariableButton = true,
  } = props
  const editorRef = useRef<HTMLDivElement>(null)
  const [isFocused, setIsFocused] = useState(false)
  const isUpdatingRef = useRef(false)

  // Función para obtener texto plano del editor
  const getPlainText = useCallback((element: HTMLElement): string => {
    return element.textContent || ''
  }, [])

  // Función para obtener posición del cursor
  const getCursorPosition = useCallback((): number => {
    if (!editorRef.current) return 0
    
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return 0
    
    const range = selection.getRangeAt(0)
    const preCaretRange = range.cloneRange()
    preCaretRange.selectNodeContents(editorRef.current)
    preCaretRange.setEnd(range.endContainer, range.endOffset)
    
    return preCaretRange.toString().length
  }, [])

  // Función para establecer posición del cursor
  const setCursorPosition = useCallback((position: number) => {
    if (!editorRef.current) return
    
    const selection = window.getSelection()
    if (!selection) return
    
    const walker = document.createTreeWalker(
      editorRef.current,
      NodeFilter.SHOW_TEXT,
      null
    )
    
    let currentPos = 0
    let node = walker.nextNode()
    
    while (node) {
      const nodeLength = node.textContent?.length || 0
      
      if (currentPos + nodeLength >= position) {
        const range = document.createRange()
        range.setStart(node, Math.min(position - currentPos, nodeLength))
        range.setEnd(node, Math.min(position - currentPos, nodeLength))
        
        selection.removeAllRanges()
        selection.addRange(range)
        return
      }
      
      currentPos += nodeLength
      node = walker.nextNode()
    }
    
    // Si llegamos aquí, posicionar al final
    const range = document.createRange()
    range.selectNodeContents(editorRef.current)
    range.collapse(false)
    selection.removeAllRanges()
    selection.addRange(range)
  }, [])

  // Función para renderizar contenido con variables destacadas
  const renderContentWithHighlights = useCallback((text: string): string => {
    if (!text) return ''
    
    const variableRegex = /(\{[^}]+\})/g
    
    return text.replace(variableRegex, (match) => {
      return `<span style="display: inline-block; padding: 2px 6px; background-color: #f3e8ff; color: #7c3aed; border-radius: 4px; font-size: 13px; font-weight: 500; margin: 0 1px;">${match}</span>`
    })
  }, [])

  // Función para insertar variable en posición del cursor
  const insertVariableAtCursor = useCallback((variable: string) => {
    if (!editorRef.current) return

    const currentPosition = getCursorPosition()
    const currentText = getPlainText(editorRef.current)
    
    // Construir nuevo texto
    const newText = currentText.slice(0, currentPosition) + variable + currentText.slice(currentPosition)
    
    // Verificar límite
    if (newText.length > maxLength) return
    
    // Actualizar valor
    onChange(newText)
    
    // Focus y posición del cursor después de la actualización
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.focus()
        setCursorPosition(currentPosition + variable.length)
      }
    }, 0)
  }, [getCursorPosition, getPlainText, maxLength, onChange, setCursorPosition])

  // Manejar entrada de texto
  const handleInput = useCallback(() => {
    if (!editorRef.current || isUpdatingRef.current) return
    
    const currentText = getPlainText(editorRef.current)
    
    // Verificar límite
    if (currentText.length > maxLength) {
      // Si excede el límite, restaurar el valor anterior
      isUpdatingRef.current = true
      editorRef.current.innerHTML = renderContentWithHighlights(value)
      isUpdatingRef.current = false
      return
    }
    
    // Guardar posición del cursor
    const cursorPos = getCursorPosition()
    
    // Actualizar el valor si es diferente
    if (currentText !== value) {
      onChange(currentText)
    }
    
    // Re-renderizar con highlighting manteniendo cursor
    setTimeout(() => {
      if (editorRef.current && !isUpdatingRef.current) {
        isUpdatingRef.current = true
        editorRef.current.innerHTML = renderContentWithHighlights(currentText)
        setCursorPosition(cursorPos)
        isUpdatingRef.current = false
      }
    }, 0)
  }, [value, onChange, maxLength, getCursorPosition, getPlainText, renderContentWithHighlights, setCursorPosition])

  // Manejar paste
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault()
    
    if (!editorRef.current) return
    
    const text = e.clipboardData.getData('text/plain')
    const currentPosition = getCursorPosition()
    const currentText = getPlainText(editorRef.current)
    
    const newText = currentText.slice(0, currentPosition) + text + currentText.slice(currentPosition)
    
    if (newText.length <= maxLength) {
      onChange(newText)
      
      setTimeout(() => {
        if (editorRef.current) {
          setCursorPosition(currentPosition + text.length)
        }
      }, 0)
    }
  }, [getCursorPosition, getPlainText, maxLength, onChange, setCursorPosition])

  const focusEditor = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.focus()
    }
  }, [])

  const setCaretFromPoint = useCallback((clientX: number, clientY: number) => {
    if (!editorRef.current) return

    const selection = window.getSelection()
    if (!selection) return

    const doc: any = document

    let range: Range | null = null

    if (typeof doc.caretRangeFromPoint === 'function') {
      range = doc.caretRangeFromPoint(clientX, clientY)
    } else if (typeof doc.caretPositionFromPoint === 'function') {
      const position = doc.caretPositionFromPoint(clientX, clientY)
      if (position) {
        range = document.createRange()
        range.setStart(position.offsetNode, position.offset)
        range.collapse(true)
      }
    }

    if (range) {
      selection.removeAllRanges()
      selection.addRange(range)
    }
  }, [])

  // Actualizar contenido cuando cambie el valor externo
  useEffect(() => {
    if (!editorRef.current || isUpdatingRef.current) return
    
    const currentText = getPlainText(editorRef.current)
    if (currentText !== value) {
      isUpdatingRef.current = true
      editorRef.current.innerHTML = renderContentWithHighlights(value)
      isUpdatingRef.current = false
    }
  }, [value, getPlainText, renderContentWithHighlights])

  useImperativeHandle(
    ref,
    () => ({
      insertVariable: (variableKey: string) => {
        insertVariableAtCursor(variableKey)
      },
      focus: () => {
        focusEditor()
      }
    }),
    [focusEditor, insertVariableAtCursor]
  )

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    if (!editorRef.current) return
    e.preventDefault()
    setCaretFromPoint(e.clientX, e.clientY)
  }, [setCaretFromPoint])

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    if (!editorRef.current) return
    e.preventDefault()

    const variableKey =
      e.dataTransfer.getData('application/x-variable-key') ||
      e.dataTransfer.getData('text/plain')

    if (!variableKey) return

    focusEditor()
    setCaretFromPoint(e.clientX, e.clientY)
    insertVariableAtCursor(variableKey)
  }, [focusEditor, insertVariableAtCursor, setCaretFromPoint])

  return (
    <div className={className}>
      {/* Botón de variables arriba del textarea a la derecha - solo si showVariableButton es true */}
      {showVariableButton && (
        <div className="flex justify-end mb-2">
          <VariableButton
            label="+ Variable"
            variables={AVAILABLE_VARIABLES}
            onInsertVariable={insertVariableAtCursor}
          />
        </div>
      )}

      {/* Contenedor del editor */}
      <div className="relative">
        <div
          ref={editorRef}
          contentEditable
          data-name={name}
          onInput={handleInput}
          onPaste={handlePaste}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="min-h-[100px] w-full resize-y p-3 pb-8 border border-gray-200 rounded-lg bg-white text-[14px] leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          style={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}
          suppressContentEditableWarning={true}
        />
        
        {/* Placeholder cuando está vacío */}
        {!value && !isFocused && (
          <div className="absolute inset-0 p-3 text-gray-500 text-[14px] leading-relaxed pointer-events-none">
            {placeholder}
          </div>
        )}
        
        {/* Input oculto para compatibilidad con formularios */}
        <input
          type="hidden"
          name={name}
          value={value}
        />
      </div>
    </div>
  )
}

export const VariableTextarea = forwardRef(VariableTextareaComponent)
