import React from 'react'
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Avatar, AvatarFallback } from "./ui/avatar"
import { ScrollArea } from "./ui/scroll-area"
import { Separator } from "./ui/separator"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Bell, AlertTriangle, Clock, X, Check, Trash2 } from "lucide-react"
import { useNotifications, WebNotification } from "../contexts/NotificationContext"

interface NotificationPanelProps {
  children: React.ReactNode
}

export function NotificationPanel({ children }: NotificationPanelProps) {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    removeNotification,
    clearAllNotifications 
  } = useNotifications()

  const getSeverityIcon = (severity: WebNotification['severity']) => {
    switch (severity) {
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      case 'medium':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />
      case 'low':
        return <Bell className="w-4 h-4 text-blue-500" />
      default:
        return <Bell className="w-4 h-4 text-gray-500" />
    }
  }

  const getSeverityColor = (severity: WebNotification['severity']) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-600'
      case 'medium':
        return 'bg-orange-100 text-orange-600'
      case 'low':
        return 'bg-blue-100 text-blue-600'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date()
    const diffInMs = now.getTime() - timestamp.getTime()
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    if (diffInMinutes < 1) {
      return 'Hace unos momentos'
    } else if (diffInMinutes < 60) {
      return `Hace ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`
    } else if (diffInHours < 24) {
      return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`
    } else {
      return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`
    }
  }

  const processNotificationMessage = (message: string) => {
    // Variable mappings for notification messages
    const variableMap = {
      '{ubicacion_link}': 'Av. Corrientes 1234, Buenos Aires',
      '{conductor}': 'Juan Pérez',
      '{vehiculo}': 'ABC-123',
      '{fecha}': new Date().toLocaleDateString('es-ES'),
      '{hora}': new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    }

    let processedMessage = message

    // Replace variables with their values
    Object.entries(variableMap).forEach(([variable, value]) => {
      processedMessage = processedMessage.replace(new RegExp(variable.replace(/[{}]/g, '\\$&'), 'g'), value)
    })

    // Convert location to clickable link
    const locationText = variableMap['{ubicacion_link}']
    if (processedMessage.includes(locationText)) {
      const encodedLocation = encodeURIComponent(locationText)
      processedMessage = processedMessage.replace(
        locationText,
        `<span class="notification-location-link" onclick="window.open('https://maps.google.com/?q=${encodedLocation}', '_blank')">${locationText}</span>`
      )
    }

    return processedMessage
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent 
        className="w-96 p-0 mr-4" 
        align="end"
        side="bottom"
        sideOffset={8}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-gray-900">Notificaciones</h3>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs px-2 py-0.5">
                {unreadCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                <Check className="w-3 h-3 mr-1" />
                Marcar todas como leídas
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllNotifications}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="max-h-96">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No tienes notificaciones</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification, index) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 transition-colors relative ${
                    !notification.isRead ? 'bg-blue-50/50' : ''
                  }`}
                  onClick={() => {
                    if (!notification.isRead) {
                      markAsRead(notification.id)
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarFallback className={getSeverityColor(notification.severity)}>
                        {getSeverityIcon(notification.severity)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 mb-1">
                            {notification.title}
                          </h4>
                          <p 
                            className="text-sm text-gray-600 leading-relaxed"
                            dangerouslySetInnerHTML={{
                              __html: processNotificationMessage(notification.message)
                            }}
                          />
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeNotification(notification.id)
                          }}
                          className="text-gray-400 hover:text-gray-600 p-1 h-auto w-auto flex-shrink-0"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{formatTimeAgo(notification.timestamp)}</span>
                        <>
                          <span>•</span>
                          {(() => {
                            const severityConfig = {
                              high: { 
                                label: 'Alta', 
                                bgColor: 'bg-red-100',
                                textColor: 'text-red-700',
                                iconColor: 'text-red-500',
                                icon: AlertTriangle
                              },
                              medium: { 
                                label: 'Media', 
                                bgColor: 'bg-orange-100',
                                textColor: 'text-orange-700',
                                iconColor: 'text-orange-500',
                                icon: AlertTriangle
                              },
                              low: { 
                                label: 'Baja', 
                                bgColor: 'bg-blue-100',
                                textColor: 'text-blue-700',
                                iconColor: 'text-blue-500',
                                icon: AlertTriangle
                              }
                            }
                            const severityInfo = severityConfig[notification.severity]
                            const SeverityIcon = severityInfo.icon
                            return (
                              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-xs ${severityInfo.bgColor}`}>
                                <SeverityIcon className={`w-3 h-3 ${severityInfo.iconColor}`} />
                                <span className={severityInfo.textColor}>
                                  {severityInfo.label}
                                </span>
                              </div>
                            )
                          })()}
                        </>
                      </div>
                    </div>
                    
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <>
            <Separator />
            <div className="p-3 bg-gray-50">
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full text-sm text-gray-600 hover:text-gray-900"
              >
                Ver todas las notificaciones
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}