import { useState, useRef, useEffect, useLayoutEffect } from "react"
import { X, ChevronDown } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"

interface RecipientsSelectorProps {
  value: string[]
  onChange: (recipients: string[]) => void
  disabled?: boolean
  className?: string
}

// Lista de correos disponibles para selección rápida
const AVAILABLE_EMAILS = [
  "isaac.paredes@numaris.com",
  "mariana.manzo@numaris.com", 
  "@numaris.com",
  "admin@numaris.com",
  "reportes@numaris.com",
  "gerencia@numaris.com",
  "operaciones@numaris.com"
]

const MAX_VISIBLE_TAGS = 3 // Máximo 3 cápsulas visibles

export function RecipientsSelector({ value = [], onChange, disabled = false, className = "" }: RecipientsSelectorProps) {
  const [inputValue, setInputValue] = useState("")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom')
  const [containerWidth, setContainerWidth] = useState(0)
  const [validationError, setValidationError] = useState<string>("")
  const [hasError, setHasError] = useState(false)
  const [isShaking, setIsShaking] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)



  // Función para validar email con dominios específicos (.com y .mx)
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.(com|mx)$/i
    return emailRegex.test(email.trim())
  }

  // Función para normalizar email (lowercase y trim)
  const normalizeEmail = (email: string) => {
    return email.trim().toLowerCase()
  }

  // Verificar si un email ya existe (case-insensitive)
  const emailExists = (email: string) => {
    const normalized = normalizeEmail(email)
    return value.some(existingEmail => normalizeEmail(existingEmail) === normalized)
  }

  // Procesar texto que puede contener múltiples emails separados por comas
  const processEmailInput = (text: string) => {
    const emails = text.split(',').map(email => email.trim()).filter(email => email.length > 0)
    const validEmails: string[] = []
    let hasInvalidEmail = false
    let invalidEmailText = ""
    
    emails.forEach(email => {
      if (!isValidEmail(email)) {
        hasInvalidEmail = true
        invalidEmailText = email
      } else if (emailExists(email)) {
        hasInvalidEmail = true
        invalidEmailText = "Email ya agregado"
      } else {
        validEmails.push(email)
      }
    })
    
    if (hasInvalidEmail) {
      // Mostrar error para el primer email inválido
      const errorMessage = invalidEmailText.includes("@") ? 
        "Ingresa un correo válido (debe terminar en .com o .mx)" : 
        `"${invalidEmailText}" no es un correo válido`
      
      setValidationError(errorMessage)
      setHasError(true)
      setIsShaking(true)
      
      // Quitar la animación después de un momento y enfocar el input
      setTimeout(() => {
        setIsShaking(false)
        inputRef.current?.focus()
      }, 500)
      
      // Auto-ocultar el error después de 3 segundos
      setTimeout(() => {
        setValidationError("")
        setHasError(false)
      }, 3000)
    }
    
    if (validEmails.length > 0) {
      onChange([...value, ...validEmails])
      setInputValue("")
    }
  }

  // Manejar input de texto con soporte para separadores de tokens (comas)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value
    
    // Limpiar errores cuando el usuario empieza a escribir
    if (hasError) {
      setValidationError("")
      setHasError(false)
    }
    
    // Si contiene coma, procesar como múltiples emails
    if (text.includes(',')) {
      const parts = text.split(',')
      const completed = parts.slice(0, -1).join(',')
      const remaining = parts[parts.length - 1]
      
      if (completed) {
        processEmailInput(completed)
      }
      setInputValue(remaining)
    } else {
      setInputValue(text)
    }
    
    // Abrir dropdown automáticamente cuando se empieza a escribir
    if (text.trim() && !isDropdownOpen) {
      setIsDropdownOpen(true)
    }
  }

  // Manejar cuando se presiona una tecla
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault()
      addEmail(inputValue.trim())
      setIsDropdownOpen(false) // Cerrar dropdown después de agregar
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      // Si el input está vacío y hay emails, eliminar el último
      e.preventDefault()
      removeEmail(value[value.length - 1])
    } else if (e.key === ',' && inputValue.trim()) {
      e.preventDefault()
      addEmail(inputValue.trim())
    } else if (e.key === 'Escape') {
      // Cerrar dropdown con Escape
      setIsDropdownOpen(false)
    } else if (e.key === 'ArrowDown' && !isDropdownOpen) {
      // Abrir dropdown con flecha hacia abajo
      e.preventDefault()
      setIsDropdownOpen(true)
    }
  }

  // Manejar paste de lista de emails separados por comas
  const handlePaste = (e: React.ClipboardEvent) => {
    const pastedText = e.clipboardData.getData('text')
    if (pastedText.includes(',')) {
      e.preventDefault()
      processEmailInput(pastedText)
    }
  }

  // Agregar un email como cápsula
  const addEmail = (email: string) => {
    const trimmedEmail = email.trim()
    
    // Limpiar errores previos
    setValidationError("")
    setHasError(false)
    
    if (!trimmedEmail) return
    
    // Validar el email
    if (!isValidEmail(trimmedEmail)) {
      // Mostrar error de validación
      setValidationError("Ingresa un correo válido (debe terminar en .com o .mx)")
      setHasError(true)
      setIsShaking(true)
      
      // Quitar la animación después de un momento y enfocar el input
      setTimeout(() => {
        setIsShaking(false)
        inputRef.current?.focus()
      }, 500)
      
      // Auto-ocultar el error después de 3 segundos
      setTimeout(() => {
        setValidationError("")
        setHasError(false)
      }, 3000)
      return
    }
    
    // Verificar si el email ya existe
    if (emailExists(trimmedEmail)) {
      setValidationError("Este correo ya está agregado")
      setHasError(true)
      setIsShaking(true)
      
      // Quitar la animación después de un momento y enfocar el input
      setTimeout(() => {
        setIsShaking(false)
        inputRef.current?.focus()
      }, 500)
      
      setTimeout(() => {
        setValidationError("")
        setHasError(false)
      }, 3000)
      return
    }
    
    // Agregar el email si es válido y no existe
    onChange([...value, trimmedEmail])
    setInputValue("")
  }

  // Remover un email de las cápsulas
  const removeEmail = (emailToRemove: string) => {
    onChange(value.filter(email => email !== emailToRemove))
  }

  // Limpiar todos los emails (allowClear)
  const clearAll = () => {
    onChange([])
    setInputValue("")
    inputRef.current?.focus()
  }

  // Manejar selección desde el dropdown
  const handleEmailSelect = (email: string) => {
    if (!emailExists(email)) {
      onChange([...value, email])
    }
    setInputValue("") // Limpiar input después de seleccionar
    setIsDropdownOpen(false)
    setTimeout(() => {
      inputRef.current?.focus()
    }, 100)
  }

  // Filtrar emails por búsqueda en el input
  const getFilteredEmails = () => {
    const availableEmails = AVAILABLE_EMAILS.filter(email => !emailExists(email))
    
    if (!inputValue.trim()) return availableEmails
    
    return availableEmails.filter(email => 
      email.toLowerCase().includes(inputValue.toLowerCase())
    )
  }

  // Función para obtener cápsulas visibles y ocultas basada en espacio disponible
  const getVisibleTags = () => {
    if (value.length === 0) {
      return { visible: value, hidden: [] }
    }

    // Limitar estrictamente a máximo 2 cápsulas visibles para evitar desbordamiento
    const maxVisible = Math.min(2, value.length)
    
    return {
      visible: value.slice(0, maxVisible),
      hidden: value.slice(maxVisible)
    }
  }

  const { visible: visibleTags, hidden: hiddenTags } = getVisibleTags()
  const filteredEmails = getFilteredEmails()
  const showAddOption = inputValue.trim() && isValidEmail(inputValue.trim()) && !emailExists(inputValue.trim())

  // Calcular posición del dropdown para evitar que se salga de la pantalla
  const calculateDropdownPosition = () => {
    if (!containerRef.current) return

    // Forzar siempre el dropdown abajo
    setDropdownPosition('bottom')
  }

  // Calcular posición cuando se abre el dropdown
  useLayoutEffect(() => {
    if (isDropdownOpen) {
      calculateDropdownPosition()
    }
  }, [isDropdownOpen])

  // Recalcular posición al cambiar el tamaño de la ventana
  useEffect(() => {
    if (!isDropdownOpen) return

    const handleResize = () => {
      calculateDropdownPosition()
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isDropdownOpen])

  // Observer para detectar cambios en el tamaño del contenedor
  useEffect(() => {
    if (!containerRef.current) return

    // Configurar el ancho inicial
    setContainerWidth(containerRef.current.offsetWidth)

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width)
      }
    })

    resizeObserver.observe(containerRef.current)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])



  return (
    <TooltipProvider>
      <div className={`relative ${className}`}>
        {/* Contenedor con altura fija (una línea) */}
        <div 
          ref={containerRef}
          className={`relative h-10 w-full max-w-full border border-gray-300 rounded-md bg-white cursor-text overflow-hidden transition-all duration-200 ${
            hasError 
              ? 'border-red-500 ring-1 ring-red-500 ring-opacity-20' 
              : 'focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500'
          } ${isShaking ? 'animate-pulse' : ''}`}
          onClick={() => {
            inputRef.current?.focus()
            setIsDropdownOpen(true)
          }}
        >
          {/* Contenido interno con flexbox - área de contenido y controles separados */}
          <div className="flex items-center h-full w-full">
            {/* Área de contenido (cápsulas + input) con overflow controlado */}
            <div className="flex items-center gap-2 px-3 flex-1 min-w-0 overflow-hidden">
              {/* Mostrar cápsulas de emails seleccionados */}
              {visibleTags.map((email, index) => (
              <div
                key={index}
                className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-md border border-blue-200 flex-shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="text-sm truncate max-w-[100px]" title={email}>{email}</span>
                {!disabled && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeEmail(email)
                    }}
                    className="flex-shrink-0 text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}

            {/* Mostrar contador de elementos ocultos con tooltip */}
            {hiddenTags.length > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div 
                    className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-sm px-2 py-1 rounded-md border border-gray-200 flex-shrink-0 cursor-help"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="text-sm whitespace-nowrap">+{hiddenTags.length} más</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent 
                  className="max-w-xs p-0 bg-gray-900 border-gray-700"
                  side="top"
                  align="start"
                >
                  <div className="p-3">
                    <div className="text-xs font-medium text-white mb-2">
                      Destinatarios adicionales:
                    </div>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {hiddenTags.map((email, index) => (
                        <div key={index} className="text-sm text-white py-1 border-b border-gray-600 last:border-b-0">
                          {email}
                        </div>
                      ))}
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            )}
            
            {/* Input para escribir nuevos emails - flexible */}
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleInputKeyDown}
              onFocus={() => {
                setIsDropdownOpen(true)
              }}
              onPaste={handlePaste}
              onBlur={(e) => {
                // Solo cerrar si no estamos haciendo click en el dropdown
                const relatedTarget = e.relatedTarget as HTMLElement
                if (!containerRef.current?.contains(relatedTarget)) {
                  setTimeout(() => {
                    if (inputValue.trim() && isValidEmail(inputValue.trim())) {
                      addEmail(inputValue.trim())
                    }
                    setIsDropdownOpen(false)
                  }, 200)
                }
              }}
              placeholder={value.length === 0 ? "Agregar correos (separa con coma)" : ""}
              className="flex-1 min-w-[80px] max-w-full outline-none text-[14px] border-none p-0 bg-transparent placeholder-gray-500 text-gray-900"
              disabled={disabled}
              onClick={(e) => {
                e.stopPropagation()
                setIsDropdownOpen(true)
              }}
            />
            </div>

            {/* Controles fijos a la derecha - fuera del área de contenido */}
            <div className="flex items-center gap-1 flex-shrink-0 px-2">
              {/* Botón para limpiar todos */}
              {value.length > 0 && !disabled && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    clearAll()
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center w-5 h-5"
                  title="Limpiar todos"
                >
                  <X className="h-4 w-4" />
                </button>
              )}

              {/* Icono dropdown - siempre en la misma posición */}
              <button
                type="button"
                className="text-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center w-5 h-5"
                disabled={disabled}
                onClick={(e) => {
                  e.stopPropagation()
                  const newState = !isDropdownOpen
                  setIsDropdownOpen(newState)
                  if (newState) {
                    inputRef.current?.focus()
                    // Calcular posición después de abrir
                    setTimeout(() => calculateDropdownPosition(), 10)
                  }
                }}
                title="Abrir opciones"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Dropdown absolute positioned - FUERA del contenedor overflow-hidden */}
        {isDropdownOpen && (
          <div 
            ref={dropdownRef}
            className={`absolute left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-[999] max-h-60 overflow-y-auto ${
              dropdownPosition === 'top' 
                ? 'bottom-full mb-1' 
                : 'top-full mt-1'
            }`}
            style={{ position: 'absolute', zIndex: 999 }}
            onMouseDown={(e) => {
              e.preventDefault()
            }}
          >
            <div className="text-xs font-medium text-gray-500 px-3 py-2 border-b bg-gray-50">
              {inputValue.trim() ? `Buscando: "${inputValue.trim()}"` : "Seleccionar destinatarios:"}
            </div>
            
            {/* Opción "Agregar" si hay texto válido */}
            {showAddOption && (
              <div
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleEmailSelect(inputValue.trim())
                }}
                className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 border-b"
              >
                <span className="text-blue-600">Agregar: </span>
                <span className="font-medium">{inputValue.trim()}</span>
              </div>
            )}
            
            {/* Opciones predefinidas filtradas */}
            {filteredEmails.map((email) => (
              <div
                key={email}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleEmailSelect(email)
                }}
                className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100"
              >
                {email}
              </div>
            ))}
            
            {/* Mensaje cuando no hay resultados */}
            {filteredEmails.length === 0 && !showAddOption && (
              <div className="px-3 py-2 text-sm text-gray-500">
                {inputValue.trim() && !isValidEmail(inputValue.trim()) 
                  ? "Ingresa un correo válido (debe terminar en .com o .mx)" 
                  : inputValue.trim() 
                    ? "No se encontraron correos"
                    : "Todos los correos ya están agregados"
                }
              </div>
            )}
          </div>
        )}

        {/* Mensaje de error */}
        {validationError && (
          <div className="mt-1 text-xs text-red-600 flex items-center gap-1">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {validationError}
          </div>
        )}
        
        {/* Texto de ayuda - solo mostrar si no hay error */}
        {!validationError && (
          <div className="mt-1 text-xs text-gray-500">
            Escribe correos (deben terminar en .com o .mx) y sepáralos con comas, o usa el selector para agregar rápidamente.
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}