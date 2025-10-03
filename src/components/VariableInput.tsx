import { useRef, useEffect, useState, useCallback } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { ChevronDown } from "lucide-react"

interface VariableInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  maxLength?: number
  name?: string
  showVariableButton?: boolean
}

// Lista de variables disponibles
const AVAILABLE_VARIABLES = [
  { key: '{unidad}', label: 'Nombre de la unidad', description: 'Nombre del vehículo o dispositivo' },
  { key: '{velocidad}', label: 'Velocidad actual', description: 'Velocidad registrada en el momento del evento' },
  { key: '{ubicacion_link}', label: 'Ubicación con enlace', description: 'Dirección con enlace a Google Maps' },
  { key: '{fecha_hora}', label: 'Fecha y hora', description: 'Timestamp del evento' },
  { key: '{conductor}', label: 'Conductor', description: 'Nombre del conductor asignado' },
  { key: '{temperatura}', label: 'Temperatura', description: 'Temperatura del motor o ambiente' },
  { key: '{combustible}', label: 'Nivel de combustible', description: 'Porcentaje de combustible restante' },
  { key: '{rpm}', label: 'RPM del motor', description: 'Revoluciones por minuto del motor' },
  { key: '{zona}', label: 'Zona geográfica', description: 'Nombre de la zona donde ocurrió el evento' },
  { key: '{voltaje}', label: 'Voltaje de batería', description: 'Voltaje actual de la batería del dispositivo' },
  { key: '{regla_nombre}', label: 'Nombre de la regla', description: 'Nombre de la regla que generó el evento' }
]

export function VariableInput({ 
  value, 
  onChange, 
  placeholder, 
  className = "", 
  maxLength = 120,
  name,
  showVariableButton = true
}: VariableInputProps) {
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

  // Función para renderizar contenido con variables destacadas en morado
  const renderContentWithHighlights = useCallback((text: string): string => {
    if (!text) return ''
    
    const variableRegex = /\{[^}]+\}/g
    
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
    if (maxLength && newText.length > maxLength) return
    
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
    if (maxLength && currentText.length > maxLength) {
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
    
    if (!maxLength || newText.length <= maxLength) {
      onChange(newText)
      
      setTimeout(() => {
        if (editorRef.current) {
          setCursorPosition(currentPosition + text.length)
        }
      }, 0)
    }
  }, [getCursorPosition, getPlainText, maxLength, onChange, setCursorPosition])

  // Manejar teclas especiales
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Permitir Enter como texto normal en input de una línea
    if (e.key === 'Enter') {
      e.preventDefault()
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

  return (
    <div className={`relative ${className}`}>
      {/* Botón de variables integrado */}
      {showVariableButton && (
        <div className="absolute -top-6 right-0 z-10">
          <Popover>
            <PopoverTrigger asChild>

            </PopoverTrigger>
            <PopoverContent className="w-64 p-0" align="end">
              <div className="p-2 border-b border-gray-100">
                <div className="text-[12px] font-medium text-gray-700">Variables disponibles</div>
                <div className="text-[11px] text-gray-500">Click para insertar en el cursor</div>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {AVAILABLE_VARIABLES.map((variable) => (
                  <button
                    key={variable.key}
                    type="button"
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                    onClick={() => insertVariableAtCursor(variable.key)}
                  >
                    <div className="text-[13px] font-medium text-purple-700">
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
        </div>
      )}

      {/* Contenedor del editor de una línea */}
      <div className="relative">
        <div
          ref={editorRef}
          contentEditable
          data-name={name}
          onInput={handleInput}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="h-10 w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-[13px] leading-none font-normal focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent overflow-hidden variable-input"
          style={{
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis'
          }}
          suppressContentEditableWarning={true}
        />
        
        {/* Placeholder cuando está vacío */}
        {!value && !isFocused && (
          <div className="absolute inset-0 px-3 py-2 text-gray-500 text-[13px] leading-none pointer-events-none flex items-center">
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