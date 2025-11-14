import { useState, useRef, useEffect, useLayoutEffect, memo } from "react"
import { X, ChevronDown } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"

interface RecipientsSelectorProps {
  value: string[]
  onChange: (recipients: string[]) => void
  disabled?: boolean
  className?: string
  dropdownSide?: 'top' | 'bottom'
  placeholder?: string
  error?: boolean
}

const AVAILABLE_EMAILS = [
  "isaac.paredes@numaris.com",
  "mariana.manzo@numaris.com",
  "@numaris.com",
  "admin@numaris.com",
  "reportes@numaris.com",
  "gerencia@numaris.com",
  "operaciones@numaris.com"
]

const MAX_VISIBLE_TAGS = 3

const RecipientsSelector = memo(function RecipientsSelector({
  value = [],
  onChange,
  disabled = false,
  className = "",
  dropdownSide = 'bottom',
  placeholder = "Agregar correos (separa con coma)",
  error = false
}: RecipientsSelectorProps) {
  const [inputValue, setInputValue] = useState("")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>(dropdownSide)
  const [containerWidth, setContainerWidth] = useState(0)
  const [validationError, setValidationError] = useState<string>("")
  const [hasError, setHasError] = useState(false)
  const [isShaking, setIsShaking] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.(com|mx)$/i.test(email.trim())
  const normalizeEmail = (email: string) => email.trim().toLowerCase()
  const emailExists = (email: string) => value.some(existing => normalizeEmail(existing) === normalizeEmail(email))

  const processEmailInput = (text: string) => {
    const emails = text.split(',').map(email => email.trim()).filter(Boolean)
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
      const errorMessage = invalidEmailText.includes("@")
        ? "Ingresa un correo válido (debe terminar en .com o .mx)"
        : `"${invalidEmailText}" no es un correo válido`

      setValidationError(errorMessage)
      setHasError(true)
      setIsShaking(true)
      setTimeout(() => {
        setIsShaking(false)
        inputRef.current?.focus()
      }, 500)
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value
    if (hasError) {
      setValidationError("")
      setHasError(false)
    }

    if (text.includes(',')) {
      const parts = text.split(',')
      const completed = parts.slice(0, -1).join(',')
      const remaining = parts[parts.length - 1]

      if (completed) processEmailInput(completed)
      setInputValue(remaining)
    } else {
      setInputValue(text)
    }

    if (text.trim() && !isDropdownOpen) {
      setIsDropdownOpen(true)
    }
  }

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault()
      addEmail(inputValue.trim())
      setIsDropdownOpen(false)
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      e.preventDefault()
      removeEmail(value[value.length - 1])
    } else if (e.key === ',' && inputValue.trim()) {
      e.preventDefault()
      addEmail(inputValue.trim())
    } else if (e.key === 'Escape') {
      setIsDropdownOpen(false)
    } else if (e.key === 'ArrowDown' && !isDropdownOpen) {
      e.preventDefault()
      setIsDropdownOpen(true)
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const pastedText = e.clipboardData.getData('text')
    if (pastedText.includes(',')) {
      e.preventDefault()
      processEmailInput(pastedText)
    }
  }

  const addEmail = (email: string) => {
    const trimmedEmail = email.trim()
    setValidationError("")
    setHasError(false)
    if (!trimmedEmail) return

    if (!isValidEmail(trimmedEmail)) {
      setValidationError("Ingresa un correo válido (debe terminar en .com o .mx)")
      setHasError(true)
      setIsShaking(true)
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

    if (emailExists(trimmedEmail)) {
      setValidationError("Este correo ya está agregado")
      setHasError(true)
      setIsShaking(true)
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

    onChange([...value, trimmedEmail])
    setInputValue("")
  }

  const removeEmail = (emailToRemove: string) => {
    onChange(value.filter(email => email !== emailToRemove))
  }

  const clearAll = () => {
    onChange([])
    setInputValue("")
    inputRef.current?.focus()
  }

  const handleEmailSelect = (email: string) => {
    if (!emailExists(email)) onChange([...value, email])
    setInputValue("")
    setIsDropdownOpen(false)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  const getFilteredEmails = () => {
    const available = AVAILABLE_EMAILS.filter(email => !emailExists(email))
    if (!inputValue.trim()) return available

    return available.filter(email =>
      email.toLowerCase().includes(inputValue.toLowerCase())
    )
  }

  const getVisibleTags = () => {
    if (value.length === 0) return { visible: value, hidden: [] }

    const MAX_VISIBLE_TAGS_INLINE = 2

    if (value.length <= MAX_VISIBLE_TAGS_INLINE) {
      return { visible: value, hidden: [] }
    }

    return {
      visible: value.slice(0, MAX_VISIBLE_TAGS_INLINE),
      hidden: value.slice(MAX_VISIBLE_TAGS_INLINE)
    }
  }

  const { visible: visibleTags, hidden: hiddenTags } = getVisibleTags()
  const filteredEmails = getFilteredEmails()
  const showAddOption =
    inputValue.trim() && isValidEmail(inputValue.trim()) && !emailExists(inputValue.trim())

  const calculateDropdownPosition = () => {
    if (!containerRef.current) return
    setDropdownPosition(dropdownSide)
  }

  useEffect(() => setDropdownPosition(dropdownSide), [dropdownSide])

  useLayoutEffect(() => {
    if (isDropdownOpen) calculateDropdownPosition()
  }, [isDropdownOpen, dropdownSide])

  useEffect(() => {
    if (!isDropdownOpen) return
    const handleResize = () => calculateDropdownPosition()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isDropdownOpen])

  useEffect(() => {
    if (!containerRef.current) return
    setContainerWidth(containerRef.current.offsetWidth)

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const newWidth = entry.contentRect.width
        if (Math.abs(newWidth - containerWidth) > 10) setContainerWidth(newWidth)
      }
    })

    resizeObserver.observe(containerRef.current)
    return () => resizeObserver.disconnect()
  }, [containerWidth])

  return (
    <TooltipProvider>
      <div className={`relative ${className}`}>
        <div
          ref={containerRef}
          className={`relative min-h-[2.5rem] max-h-[6rem] w-full max-w-full rounded-md bg-white cursor-text overflow-hidden transition-all duration-200 ${
            hasError || error
              ? 'border border-red-500 ring-1 ring-red-500 ring-opacity-20'
              : 'border border-gray-300 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500'
          } ${isShaking ? 'animate-pulse' : ''}`}
          onClick={() => {
            inputRef.current?.focus()
            setIsDropdownOpen(true)
          }}
        >
          <div className="flex items-center gap-1 p-2 w-full min-h-[2.5rem] flex-nowrap">
            {visibleTags.map((email, index) => (
              <div
                key={index}
                className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-sm px-2 py-1 rounded-md border border-gray-200 flex-shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="text-sm truncate max-w-[120px]" title={email}>{email}</span>
                {!disabled && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeEmail(email)
                    }}
                    className="flex-shrink-0 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}

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

            <div className="flex items-center min-w-0 flex-1">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleInputKeyDown}
                onFocus={() => setIsDropdownOpen(true)}
                onPaste={handlePaste}
                onBlur={(e) => {
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
                placeholder={value.length === 0 ? placeholder : ""}
                className="flex-1 min-w-0 outline-none text-[14px] border-none p-0 bg-transparent placeholder-gray-400 text-gray-900"
                disabled={disabled}
                onClick={(e) => {
                  e.stopPropagation()
                  setIsDropdownOpen(true)
                }}
              />
            </div>

            <div className="absolute top-2 right-2 flex items-center gap-1 flex-shrink-0 bg-white">
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

        {isDropdownOpen && (
          <div
            ref={dropdownRef}
            className="absolute left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
            style={{
              position: 'absolute',
              zIndex: 9999,
              ...(dropdownPosition === 'top'
                ? { bottom: 'calc(100% + 4px)' }
                : { top: 'calc(100% + 4px)' }
              )
            }}
            onMouseDown={(e) => e.preventDefault()}
          >
            <div className="text-xs font-medium text-gray-500 px-3 py-2 border-b bg-gray-50">
              {inputValue.trim() ? `Buscando: "${inputValue.trim()}"` : "Seleccionar destinatarios:"}
            </div>

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

        {validationError && (
          <div className="mt-1 text-xs text-red-600 flex items-center gap-1">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 112 0 1 1 012 0zm-1-9a1 1 001-1v4a1 1 102 0V6a1 1 00-1-1z" clipRule="evenodd" />
            </svg>
            {validationError}
          </div>
        )}

        {!validationError && (
          <div className="mt-1 text-xs text-gray-500">
            Escribe correos (deben terminar en .com o .mx) y sepáralos con comas, o usa el selector para agregar rápidamente.
          </div>
        )}
      </div>
    </TooltipProvider>
  )
})

export { RecipientsSelector }
