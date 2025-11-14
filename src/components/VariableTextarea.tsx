import { useRef, useEffect, useState, useCallback, useImperativeHandle, forwardRef } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { ChevronDownIcon } from "lucide-react@0.487.0"

interface VariableTextareaProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  maxLength?: number
  name?: string
  showVariableButton?: boolean
  showCounter?: boolean
}

export interface VariableTextareaHandle {
  insertVariable: (variableKey: string) => void
  focus: () => void
}

export type VariableCategory = 'configuration' | 'event' | 'unit' | 'device'

export interface MessageVariableDescriptor {
  key: string
  label: string
  description: string
  category?: VariableCategory
}

const VARIABLE_CATEGORY_LABELS: Record<VariableCategory, string> = {
  configuration: 'Variables de la configuración',
  event: 'Variables del evento',
  unit: 'Variables de unidad',
  device: 'Variables de dispositivo'
}

const VARIABLE_CATEGORY_ORDER: VariableCategory[] = [
  'configuration',
  'event',
  'unit',
  'device'
]

// Lista de variables disponibles
const AVAILABLE_VARIABLES: MessageVariableDescriptor[] = [
  { key: '{unidad}', label: 'Nombre de la unidad', description: 'Nombre del vehículo o dispositivo', category: 'unit' },
  { key: '{velocidad}', label: 'Velocidad actual', description: 'Velocidad registrada en el momento del evento', category: 'configuration' },
  { key: '{ubicacion_link}', label: 'Ubicación con enlace', description: 'Dirección con enlace a Google Maps', category: 'event' },
  { key: '{fecha_hora}', label: 'Fecha y hora', description: 'Timestamp del evento', category: 'event' },
  { key: '{conductor}', label: 'Conductor', description: 'Nombre del conductor asignado', category: 'unit' },
  { key: '{temperatura}', label: 'Temperatura', description: 'Temperatura del motor o ambiente', category: 'configuration' },
  { key: '{combustible}', label: 'Nivel de combustible', description: 'Porcentaje de combustible restante', category: 'configuration' },
  { key: '{rpm}', label: 'RPM del motor', description: 'Revoluciones por minuto del motor', category: 'configuration' },
  { key: '{zona}', label: 'Zona geográfica', description: 'Nombre de la zona donde ocurrió el evento', category: 'event' },
  { key: '{voltaje}', label: 'Voltaje de batería', description: 'Voltaje actual de la batería del dispositivo', category: 'configuration' }
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
    'inline-flex items-center gap-1 rounded px-2 py-1 text-[14px] font-medium text-blue-600 hover:text-blue-700 focus:outline-none transition-colors'

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={triggerClasses}
          title="Insertar variable"
        >
          <span className="text-[14px]">{label}</span>
          <ChevronDownIcon className="w-3.5 h-3.5 text-blue-600" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="variable-button-popover"
        style={{ width: 300, maxWidth: 300 }}
        innerClassName="rounded-lg border border-gray-200 shadow-xl overflow-hidden"
        align="end"
      >
        <div className="p-3 border-b border-gray-100 bg-white">
          <div className="text-[12px] font-medium text-gray-900">Variables disponibles</div>
          <div className="text-[11px] text-gray-500">Click para insertar en el cursor</div>
        </div>
        <div className="max-h-64 overflow-y-auto bg-white">
          {(() => {
            const hasCategories = variables.some((variable) => !!variable.category)
            const renderVariableRow = (variable: MessageVariableDescriptor) => (
              <button
                key={variable.key}
                type="button"
                className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                onClick={() => onInsertVariable(variable.key)}
              >
                <div className="text-[13px] font-medium text-blue-600">
                  {variable.key}
                </div>
                <div className="text-[12px] text-gray-600 mt-1">
                  {variable.description}
                </div>
              </button>
            )

            if (!hasCategories) {
              return variables.map(renderVariableRow)
            }

            return VARIABLE_CATEGORY_ORDER.map((category) => {
              const categoryVariables = variables
                .filter((variable) => variable.category === category)
              if (categoryVariables.length === 0) {
                return null
              }
              const sortedVariables = [...categoryVariables].sort((a, b) =>
                a.label.localeCompare(b.label, 'es', { sensitivity: 'accent' })
              )
              return (
                <details
                  key={category}
                  className="border-b border-gray-100 last:border-b-0 group"
                  open
                >
                  <summary
                    className="flex items-center justify-between px-3 py-2 text-[12px] font-medium cursor-pointer select-none text-gray-500 bg-gray-50"
                  >
                    <span className="text-gray-500 font-medium">{VARIABLE_CATEGORY_LABELS[category]}</span>
                    <svg
                      className="w-[14px] h-[14px] text-gray-500 transition-transform duration-200 group-open:rotate-180 shrink-0"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M4 6L8 10L12 6"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </summary>
                  <div>
                    {sortedVariables.map(renderVariableRow)}
                  </div>
                </details>
              )
            })
          })()}
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
    showCounter = false
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

  const characterCount = value.length

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
        {showCounter && (
          <div className="absolute bottom-2 right-3 text-[12px] text-gray-400">
            {characterCount}/{maxLength}
          </div>
        )}
      </div>
    </div>
  )
}

export const VariableTextarea = forwardRef(VariableTextareaComponent)
