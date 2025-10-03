import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Monitor, Smartphone, Bell, X, MessageSquare } from "lucide-react"

interface NotificationExampleModalProps {
  isOpen: boolean
  onClose: () => void
  eventMessage: string
  type: 'web' | 'mobile'
}

export function NotificationExampleModal({ isOpen, onClose, eventMessage, type }: NotificationExampleModalProps) {
  // Character limits for different notification types
  const PUSH_LIMIT = 120
  const SMS_LIMIT = 160

  // Process variables in the message for the example
  const processMessage = (message: string) => {
    return message.replace(/{[^}]+}/g, (match) => {
      const variableMap: { [key: string]: string } = {
        '{unidad}': 'Unidad ABC-123',
        '{velocidad}': '85 km/h',
        '{ubicacion_link}': 'Av. Corrientes 1234, Buenos Aires',
        '{fecha_hora}': new Date().toLocaleString('es-AR'),
        '{chofer}': 'Juan Pérez',
        '{patente}': 'ABC123',
        '{fecha}': new Date().toLocaleDateString('es-AR'),
        '{hora}': new Date().toLocaleTimeString('es-AR')
      }
      return variableMap[match] || match
    })
  }

  // Location Link Component
  const LocationLink = ({ text, context }: { text: string, context: 'web' | 'push' | 'sms' }) => {
    let contextClass = 'notification-location-link'
    if (context === 'push') {
      contextClass += ' push-context'
    } else if (context === 'sms') {
      contextClass += ' sms-context'
    }

    // Additional inline styles to ensure visibility
    const inlineStyles = {
      color: context === 'web' ? '#2563eb' : context === 'push' ? '#93c5fd' : '#dcfce7',
      textDecoration: 'underline',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'inline'
    }

    return (
      <span
        className={contextClass}
        style={inlineStyles}
        onClick={(e) => {
          e.preventDefault()
          console.log('Location clicked:', 'Av. Corrientes 1234, Buenos Aires')
        }}
      >
        {text}
      </span>
    )
  }

  // Render message with clickable links for ubicacion_link
  const renderMessageWithLinks = (message: string, className: string = "", context: 'web' | 'push' | 'sms' = 'web') => {
    // Always process the message to handle variables
    const messageToRender = processMessage(message)
    
    // Check if the message contains the location text that came from {ubicacion_link}
    const truncatedLocationText = 'Av. Corrientes 1234, Buenos Aires'
    
    if (messageToRender.includes(truncatedLocationText)) {
      const parts = messageToRender.split(truncatedLocationText)

      return (
        <span className={className}>
          {parts[0]}
          <LocationLink text={truncatedLocationText} context={context} />
          {parts[1]}
        </span>
      )
    }
    
    return <span className={className}>{messageToRender}</span>
  }

  // Get message with appropriate limits
  const defaultWebMessage = "La unidad {unidad} ha excedido el límite de velocidad. Velocidad actual: {velocidad} en {ubicacion_link}"
  const defaultPushMessage = "La unidad {unidad} ha excedido el límite de velocidad. Velocidad actual: {velocidad}"
  const defaultSMSMessage = "ALERTA: La unidad {unidad} ha excedido el límite de velocidad. Velocidad: {velocidad}. Revisa inmediatamente."

  const fullMessage = (eventMessage && typeof eventMessage === 'string' && eventMessage.trim() !== '') ? eventMessage : defaultWebMessage
  const pushMessage = (eventMessage && typeof eventMessage === 'string' && eventMessage.trim() !== '') ? eventMessage : defaultPushMessage
  const smsMessage = (eventMessage && typeof eventMessage === 'string' && eventMessage.trim() !== '') ? eventMessage : defaultSMSMessage

  // Truncate messages if they exceed limits
  const truncatedPushMessage = pushMessage.length > PUSH_LIMIT ? pushMessage.substring(0, PUSH_LIMIT - 3) + '...' : pushMessage
  const truncatedSMSMessage = smsMessage.length > SMS_LIMIT ? smsMessage.substring(0, SMS_LIMIT - 3) + '...' : smsMessage

  // Character count helpers
  const getPushCharCount = () => pushMessage.length
  const getSMSCharCount = () => smsMessage.length
  const isPushOverLimit = () => pushMessage.length > PUSH_LIMIT
  const isSMSOverLimit = () => smsMessage.length > SMS_LIMIT

  const renderWebExample = () => (
    <div className="bg-gray-50 p-4 rounded-lg border">
      <div className="flex items-center gap-2 mb-3">
        <Monitor className="w-5 h-5 text-blue-600" />
        <span className="text-sm font-medium text-gray-900">Notificación Web</span>
        <Badge variant="outline" className="text-xs">Centro de notificaciones</Badge>
      </div>
      <div className="bg-white p-3 rounded-md shadow-sm border border-gray-200">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Bell className="w-4 h-4 text-red-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-gray-900 mb-1">
              Exceso de velocidad
            </h4>
            <div className="text-sm text-gray-600 leading-relaxed">
              {renderMessageWithLinks(fullMessage, "", 'web')}
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
              <span>Hace unos momentos</span>
              <span>•</span>
              <Badge variant="destructive" className="text-xs px-1 py-0">Alta prioridad</Badge>
            </div>
          </div>
          <button className="text-gray-400 hover:text-gray-600 p-1">
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        Esta notificación aparecerá en el centro de notificaciones del header
      </p>
    </div>
  )

  const renderMobilePushExample = () => (
    <div className="bg-gray-50 p-4 rounded-lg border">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-green-600" />
          <span className="text-sm font-medium text-gray-900">Notificación Push Móvil</span>
          <Badge variant="outline" className="text-xs">iOS/Android</Badge>
        </div>
        <div className="flex items-center gap-1">
          <span className={`text-xs ${isPushOverLimit() ? 'text-red-600' : 'text-gray-500'}`}>
            {getPushCharCount()}/{PUSH_LIMIT}
          </span>
          {isPushOverLimit() && (
            <Badge variant="destructive" className="text-xs px-1 py-0">
              Límite excedido
            </Badge>
          )}
        </div>
      </div>
      <div className="bg-black text-white p-3 rounded-xl max-w-xs mx-auto shadow-lg">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Bell className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-sm font-medium text-white">Numaris</h4>
              <span className="text-xs text-gray-400">ahora</span>
            </div>
            <div className="text-sm text-gray-300 leading-relaxed">
              {renderMessageWithLinks(truncatedPushMessage, "text-gray-300", 'push')}
            </div>
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-2 text-center">
        Esta notificación aparecerá en el dispositivo móvil del usuario
        {isPushOverLimit() && (
          <span className="block text-red-500 mt-1">
            ⚠️ Mensaje truncado - Excede el límite de {PUSH_LIMIT} caracteres
          </span>
        )}
      </p>
    </div>
  )

  const renderSMSExample = () => (
    <div className="bg-gray-50 p-4 rounded-lg border">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-orange-600" />
          <span className="text-sm font-medium text-gray-900">Mensaje SMS</span>
          <Badge variant="outline" className="text-xs">Móvil</Badge>
        </div>
        <div className="flex items-center gap-1">
          <span className={`text-xs ${isSMSOverLimit() ? 'text-red-600' : 'text-gray-500'}`}>
            {getSMSCharCount()}/{SMS_LIMIT}
          </span>
          {isSMSOverLimit() && (
            <Badge variant="destructive" className="text-xs px-1 py-0">
              Límite excedido
            </Badge>
          )}
        </div>
      </div>
      <div className="bg-green-500 text-white p-3 rounded-2xl max-w-xs mx-auto shadow-lg relative">
        <div className="absolute -bottom-2 right-3 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-green-500"></div>
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-green-100">Numaris - Gestión de Flotas</span>
          </div>
          <div className="text-sm text-white leading-relaxed">
            {renderMessageWithLinks(truncatedSMSMessage, "text-white", 'sms')}
          </div>
          <div className="flex justify-end mt-2">
            <span className="text-xs text-green-100">
              {new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-2 text-center">
        Este SMS se enviará al número de teléfono configurado del usuario
        {isSMSOverLimit() && (
          <span className="block text-red-500 mt-1">
            ⚠️ Mensaje truncado - Excede el límite de {SMS_LIMIT} caracteres
          </span>
        )}
      </p>
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={type === 'mobile' ? "max-w-lg" : "max-w-md"}>
        <DialogHeader>
          <DialogTitle>
            {type === 'web' ? 'Ejemplo de Notificación Web' : 'Ejemplos de Notificaciones Móviles'}
          </DialogTitle>
          <DialogDescription>
            {type === 'web' 
              ? 'Así es como se verá la notificación en la plataforma web (sin límite de caracteres)'
              : 'Así es como se verán las notificaciones en dispositivos móviles con sus respectivos límites de caracteres'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {type === 'web' ? (
            renderWebExample()
          ) : (
            <>
              {renderMobilePushExample()}
              {renderSMSExample()}
            </>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={onClose} variant="outline">
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}