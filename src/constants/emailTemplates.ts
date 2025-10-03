interface UserEmailTemplate {
  id: string
  name: string
  description: string
  createdBy: string
  createdAt: string
  usageCount: number
  recipients: string[]
  subject: string
  message: string
  category: 'personal' | 'shared' | 'company'
}

// Plantillas predefinidas creadas por usuarios
export const userEmailTemplates: UserEmailTemplate[] = [
  {
    id: 'template-1',
    name: 'Alerta Crítica Personalizada',
    description: 'Para eventos de alta prioridad que requieren atención inmediata',
    createdBy: 'María González',
    createdAt: '15 Mar 2024',
    usageCount: 23,
    category: 'shared',
    recipients: ['operaciones@empresa.com', 'supervisor@empresa.com', 'emergencias@empresa.com'],
    subject: '🚨 [CRÍTICO] {unidad} - Intervención Requerida',
    message: '🚨 ALERTA CRÍTICA 🚨\n\nSe ha detectado un evento crítico que requiere atención inmediata:\n\n📍 Unidad: {unidad}\n🎯 Evento: {regla_nombre}\n📍 Ubicación: {ubicacion_link}\n⏰ Fecha/Hora: {fecha_hora}\n🚗 Velocidad: {velocidad}\n👤 Conductor: {conductor}\n\n⚠️ ACCIÓN REQUERIDA:\n• Contactar inmediatamente al conductor\n• Verificar estado de la unidad\n• Reportar en sistema interno\n\nSistema de Monitoreo Avanzado\nNumaris Fleet Management'
  },
  {
    id: 'template-2',
    name: 'Resumen Diario Operacional',
    description: 'Template optimizado para reportes de fin de turno',
    createdBy: 'Carlos Rodríguez',
    createdAt: '10 Mar 2024',
    usageCount: 45,
    category: 'company',
    recipients: ['gerencia@empresa.com', 'operaciones@empresa.com'],
    subject: '[REPORTE] Evento en {unidad} - {fecha}',
    message: 'Reporte de Evento - Turno Operacional\n\n═══════════════════════════════\n📊 INFORMACIÓN DEL EVENTO\n═══════════════════════════════\n\n🚛 Unidad: {unidad}\n📅 Fecha: {fecha_hora}\n📍 Ubicación: {ubicacion_link}\n⚡ Tipo de evento: {regla_nombre}\n🏃‍♂️ Velocidad registrada: {velocidad}\n\n═══════════════════════════════\n🔧 DATOS TÉCNICOS\n═══════════════════════════════\n\n🌡️ Temperatura: {temperatura}\n⛽ Combustible: {combustible}\n🔋 Batería: {bateria}\n👤 Conductor: {conductor}\n\n═══════════════════════════════\n📋 SEGUIMIENTO\n═══════════════════════════════\n\nEste evento ha sido registrado en el sistema y está pendiente de revisión.\n\nSaludos,\nEquipo de Monitoreo - Turno {hora}'
  },
  {
    id: 'template-3',
    name: 'Notificación Cliente Premium',
    description: 'Comunicación formal para clientes VIP',
    createdBy: 'Ana Martínez',
    createdAt: '08 Mar 2024',
    usageCount: 12,
    category: 'personal',
    recipients: ['cliente.vip@empresa.com', 'atencion.premium@empresa.com'],
    subject: '[NUMARIS] Notificación de Servicio - {unidad}',
    message: 'Estimado Cliente,\n\nNos dirigimos a usted para informarle sobre un evento registrado en su flota:\n\n┌─────────────────────────────────────┐\n│           DETALLES DEL EVENTO       │\n└─────────────────────────────────────┘\n\n• Unidad afectada: {unidad}\n• Fecha y hora: {fecha_hora}\n• Ubicación actual: {ubicacion_link}\n• Tipo de evento: {regla_nombre}\n• Velocidad registrada: {velocidad}\n• Conductor asignado: {conductor}\n\n┌─────────────────────────────────────┐\n│         ACCIONES REALIZADAS         │\n└─────────────────────────────────────┘\n\n✓ Evento registrado automáticamente\n✓ Notificación enviada al supervisor\n✓ Ubicación verificada y confirmada\n✓ Seguimiento activo iniciado\n\nPara consultas adicionales, no dude en contactarnos.\n\nAtentamente,\nEquipo de Atención Premium\nNumaris Fleet Solutions\n📞 +54 11 4000-0000\n📧 premium@numaris.com'
  },
  {
    id: 'template-4',
    name: 'Alerta Técnica Mantenimiento',
    description: 'Especializada para eventos de mantenimiento y técnicos',
    createdBy: 'Roberto Silva',
    createdAt: '05 Mar 2024',
    usageCount: 31,
    category: 'shared',
    recipients: ['taller@empresa.com', 'mantenimiento@empresa.com', 'tecnico.jefe@empresa.com'],
    subject: '[TÉCNICO] {unidad} - {regla_nombre} | Rev. Requerida',
    message: '🔧 ALERTA TÉCNICA - MANTENIMIENTO 🔧\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n⚙️  INFORMACIÓN TÉCNICA DEL EVENTO\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n🏷️  ID Unidad: {unidad}\n📅 Timestamp: {fecha_hora}\n🗺️  Posición GPS: {ubicacion_link}\n⚠️  Alerta: {regla_nombre}\n🏃 Velocidad: {velocidad}\n👤 Operador: {conductor}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n📊 PARÁMETROS TÉCNICOS\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n🌡️ Temperatura motor: {temperatura}\n⛽ Nivel combustible: {combustible}\n🔋 Voltaje batería: {bateria}\n🛞 Presión neumáticos: {presion}\n🛢️ Nivel aceite: {nivel_aceite}\n📏 Odómetro: {odometro}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n🔍 ACCIÓN REQUERIDA\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n1. Revisar diagnóstico de unidad\n2. Programar inspección técnica\n3. Verificar histórico de mantenimiento\n4. Contactar con conductor si es necesario\n\nDepartamento Técnico\nNumaris Fleet Maintenance'
  },
  {
    id: 'template-5',
    name: 'Resumen Ejecutivo Simple',
    description: 'Información concisa para directivos y gerencia',
    createdBy: 'Patricia López',
    createdAt: '02 Mar 2024',
    usageCount: 18,
    category: 'company',
    recipients: ['direccion@empresa.com', 'gerencia.general@empresa.com'],
    subject: '[EJECUTIVO] Evento {unidad} - {fecha}',
    message: 'Resumen Ejecutivo de Evento\n\n▪️ Unidad: {unidad}\n▪️ Evento: {regla_nombre}\n▪️ Fecha/Hora: {fecha_hora}\n▪️ Ubicación: {ubicacion_link}\n▪️ Velocidad: {velocidad}\n▪️ Conductor: {conductor}\n\nEl evento ha sido registrado y está siendo gestionado por el equipo operativo.\n\nPara detalles adicionales, consulte el dashboard ejecutivo.\n\nSaludos cordiales,\nSistema de Gestión Numaris'
  },
  {
    id: 'template-6',
    name: 'Seguimiento Post-Evento',
    description: 'Para comunicar resolución y seguimiento de eventos',
    createdBy: 'Diego Fernández',
    createdAt: '28 Feb 2024',
    usageCount: 8,
    category: 'personal',
    recipients: ['seguimiento@empresa.com', 'calidad@empresa.com'],
    subject: '[SEGUIMIENTO] {unidad} - Estado del evento',
    message: '📋 SEGUIMIENTO DE EVENTO\n\n🔸 INFORMACIÓN INICIAL:\n\nUnidad: {unidad}\nEvento: {regla_nombre}\nFecha/Hora: {fecha_hora}\nUbicación: {ubicacion_link}\nVelocidad: {velocidad}\nConductor: {conductor}\n\n🔸 ESTADO ACTUAL:\n\n✅ Evento registrado exitosamente\n📊 Datos recopilados y validados\n🔍 En proceso de análisis\n📧 Notificaciones enviadas\n\n🔸 PRÓXIMOS PASOS:\n\n• Seguimiento en 24 horas\n• Análisis de patrones\n• Reporte de tendencias\n• Acciones preventivas\n\nEste mensaje es parte del proceso de mejora continua.\n\nEquipo de Calidad y Seguimiento\nNumaris Analytics'
  }
]

export type { UserEmailTemplate }