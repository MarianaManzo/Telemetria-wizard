import { 
  Settings, 
  AlertTriangle, 
  FileText, 
  Star
} from "lucide-react"
import { Rule, Event, AppView, Tag } from "../types"

// Navigation items for top header - updated for Rules & Events system
export const navigationItems = [
  { title: 'Monitoreo', isActive: false },
  { title: 'Unidades', isActive: false },
  { title: 'Dispositivos', isActive: false },
  { title: 'Zonas', isActive: false },
  { title: 'Eventos', isActive: false },
  { title: 'Rutas', isActive: false },
  { title: 'Reglas', isActive: true }
]

// Sidebar items for Rules & Events system
export const sidebarItems = [
  { title: "Reglas", key: "rules" },
  { title: "Eventos", key: "events" },
  { title: "Etiquetas", key: "tags" }
]

// Mock Tags Data
export const initialTags: Tag[] = [
  {
    id: 'tag-1',
    name: 'Conductor experimentado',
    color: '#3B82F6',
    assignedCount: 15,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: 'tag-2',
    name: 'Licencia de velocidad',
    color: '#10B981',
    assignedCount: 8,
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-18')
  },
  {
    id: 'tag-3',
    name: 'Exceso de velocidad',
    color: '#EF4444',
    assignedCount: 23,
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-22')
  },
  {
    id: 'tag-4',
    name: 'Inactive default',
    color: '#6B7280',
    assignedCount: 5,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: 'tag-5',
    name: 'Cadena de frío',
    color: '#3B82F6',
    assignedCount: 12,
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-21')
  },
  {
    id: 'tag-6',
    name: 'Seguridad',
    color: '#F59E0B',
    assignedCount: 31,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-23')
  },
  {
    id: 'tag-7',
    name: 'Zona restringida',
    color: '#DC2626',
    assignedCount: 7,
    createdAt: new Date('2024-01-11'),
    updatedAt: new Date('2024-01-19')
  },
  {
    id: 'tag-8',
    name: 'Operaciones nocturnas',
    color: '#7C3AED',
    assignedCount: 19,
    createdAt: new Date('2024-01-09'),
    updatedAt: new Date('2024-01-17')
  },
  {
    id: 'tag-9',
    name: 'Mantenimiento preventivo',
    color: '#059669',
    assignedCount: 24,
    createdAt: new Date('2024-01-06'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: 'tag-10',
    name: 'Combustible bajo',
    color: '#DC2626',
    assignedCount: 18,
    createdAt: new Date('2024-01-07'),
    updatedAt: new Date('2024-01-21')
  },
  {
    id: 'tag-11',
    name: 'Transporte de carga especial',
    color: '#7C2D12',
    assignedCount: 6,
    createdAt: new Date('2024-01-13'),
    updatedAt: new Date('2024-01-23')
  },
  {
    id: 'tag-12',
    name: 'Ruta urbana',
    color: '#1D4ED8',
    assignedCount: 42,
    createdAt: new Date('2024-01-04'),
    updatedAt: new Date('2024-01-24')
  },
  {
    id: 'tag-13',
    name: 'Ruta interurbana',
    color: '#7C3AED',
    assignedCount: 35,
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-22')
  },
  {
    id: 'tag-14',
    name: 'Conductor novato',
    color: '#F59E0B',
    assignedCount: 11,
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-25')
  },
  {
    id: 'tag-15',
    name: 'Vehículo pesado',
    color: '#374151',
    assignedCount: 28,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-19')
  },
  {
    id: 'tag-16',
    name: 'Vehículo ligero',
    color: '#059669',
    assignedCount: 33,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-18')
  },
  {
    id: 'tag-17',
    name: 'Emergencia médica',
    color: '#DC2626',
    assignedCount: 4,
    createdAt: new Date('2024-01-17'),
    updatedAt: new Date('2024-01-26')
  },
  {
    id: 'tag-18',
    name: 'Transporte escolar',
    color: '#EAB308',
    assignedCount: 16,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: 'tag-19',
    name: 'Carga peligrosa',
    color: '#DC2626',
    assignedCount: 9,
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-23')
  },
  {
    id: 'tag-20',
    name: 'GPS desconectado',
    color: '#6B7280',
    assignedCount: 12,
    createdAt: new Date('2024-01-11'),
    updatedAt: new Date('2024-01-24')
  },
  {
    id: 'tag-21',
    name: 'Frenado brusco',
    color: '#DC2626',
    assignedCount: 27,
    createdAt: new Date('2024-01-09'),
    updatedAt: new Date('2024-01-22')
  },
  {
    id: 'tag-22',
    name: 'Aceleración brusca',
    color: '#F59E0B',
    assignedCount: 31,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-21')
  },
  {
    id: 'tag-23',
    name: 'Ralentí prolongado',
    color: '#EAB308',
    assignedCount: 22,
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-25')
  },
  {
    id: 'tag-24',
    name: 'Parada no autorizada',
    color: '#DC2626',
    assignedCount: 14,
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-26')
  },
  {
    id: 'tag-25',
    name: 'Desvío de ruta',
    color: '#F59E0B',
    assignedCount: 19,
    createdAt: new Date('2024-01-06'),
    updatedAt: new Date('2024-01-23')
  },
  {
    id: 'tag-26',
    name: 'Temperatura motor alta',
    color: '#DC2626',
    assignedCount: 8,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-24')
  },
  {
    id: 'tag-27',
    name: 'Presión aceite baja',
    color: '#F59E0B',
    assignedCount: 13,
    createdAt: new Date('2024-01-07'),
    updatedAt: new Date('2024-01-22')
  },
  {
    id: 'tag-28',
    name: 'Batería baja',
    color: '#EAB308',
    assignedCount: 17,
    createdAt: new Date('2024-01-13'),
    updatedAt: new Date('2024-01-25')
  },
  {
    id: 'tag-29',
    name: 'Kilometraje alto',
    color: '#6B7280',
    assignedCount: 21,
    createdAt: new Date('2024-01-04'),
    updatedAt: new Date('2024-01-21')
  },
  {
    id: 'tag-30',
    name: 'Vehículo nuevo',
    color: '#059669',
    assignedCount: 7,
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-27')
  },
  {
    id: 'tag-31',
    name: 'Horario diurno',
    color: '#EAB308',
    assignedCount: 38,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: 'tag-32',
    name: 'Entrega urgente',
    color: '#DC2626',
    assignedCount: 15,
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-26')
  },
  {
    id: 'tag-33',
    name: 'Cliente VIP',
    color: '#7C3AED',
    assignedCount: 12,
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-23')
  },
  {
    id: 'tag-34',
    name: 'Zona de construcción',
    color: '#F59E0B',
    assignedCount: 20,
    createdAt: new Date('2024-01-11'),
    updatedAt: new Date('2024-01-24')
  },
  {
    id: 'tag-35',
    name: 'Tráfico intenso',
    color: '#DC2626',
    assignedCount: 26,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-22')
  },
  {
    id: 'tag-36',
    name: 'Condiciones climáticas adversas',
    color: '#6B7280',
    assignedCount: 18,
    createdAt: new Date('2024-01-09'),
    updatedAt: new Date('2024-01-25')
  },
  {
    id: 'tag-37',
    name: 'Inspección técnica vencida',
    color: '#DC2626',
    assignedCount: 5,
    createdAt: new Date('2024-01-17'),
    updatedAt: new Date('2024-01-27')
  },
  {
    id: 'tag-38',
    name: 'Seguro vencido',
    color: '#DC2626',
    assignedCount: 3,
    createdAt: new Date('2024-01-19'),
    updatedAt: new Date('2024-01-28')
  },
  {
    id: 'tag-39',
    name: 'Licencia vencida',
    color: '#DC2626',
    assignedCount: 2,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-29')
  },
  {
    id: 'tag-40',
    name: 'Capacitación requerida',
    color: '#1D4ED8',
    assignedCount: 16,
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-26')
  }
]

// Mock Rules Data
export const initialRules: Rule[] = [
  {
    id: 'rule-1',
    name: 'Exceso de velocidad',
    description: 'Detecta cuando un vehículo excede el límite de velocidad permitido',
    status: 'active',
    ruleType: 'telemetry',
    severity: 'high',
    conditions: [],
    conditionGroups: [
      {
        id: 'group-1',
        conditions: [
          {
            id: 'cond-1a',
            sensor: 'speed',
            operator: 'gt',
            value: 120,
            dataType: 'numeric'
          },
          {
            id: 'cond-1b',
            sensor: 'movement_status',
            operator: 'eq',
            value: 'moving',
            dataType: 'boolean'
          }
        ],
        groupLogicOperator: 'and',
        betweenGroupOperator: 'and'
      }
    ],
    appliesTo: {
      type: 'units',
      units: [
        'unit-1', 'unit-2', 'unit-3', 'unit-4', 'unit-5'
      ]
    },
    zoneScope: {
      type: 'all'
    },
    schedule: {
      type: 'always'
    },
    closePolicy: {
      type: 'manual'
    },
    eventSettings: {
      instructions: 'Verificar velocidad del vehículo y contactar al conductor inmediatamente. Documentar cualquier evidencia.',
      responsible: 'mariana.manzo@numaris.com',
      severity: 'high',
      icon: 'speed',
      shortName: 'Velocidad',
      tags: ['seguridad', 'velocidad', 'monitoreo', 'alertas', 'cumplimiento'],
      unitTags: ['conductor-alerta', 'infraccion'],
      unitUntags: ['aprobado', 'excelente-conductor'],
      unitUntagsEnabled: true
    },
    notifications: {
      email: {
        enabled: true,
        recipients: [
          'supervisor@flota.com',
          'gerente@operaciones.com',
          'monitoreo@empresa.com',
          'alertas@tracking.com',
          'admin@sistema.com'
        ],
        subject: '[CRÍTICO] {unidad} - Intervención Requerida',
        body: 'ALERTA CRÍTICA\n\nSe ha detectado un evento crítico que requiere atención inmediata:\n\nUnidad: {unidad}\nEvento: {regla_nombre}\nUbicación: {ubicacion_link}\nFecha/Hora: {fecha_hora}\nVelocidad: {velocidad}\nConductor: {conductor}\n\nACCIÓN REQUERIDA:\n• Contactar inmediatamente al conductor\n• Verificar estado de la unidad\n• Reportar en sistema interno\n\nSistema de Monitoreo Avanzado\nNumaris Fleet Management',
        templateId: 'template-1'
      }
    },
    notes: [
      {
        id: 'rule-1-note-1',
        content: 'Se actualizó el protocolo de respuesta para intervenciones en campo.',
        createdAt: new Date('2024-01-18T09:30:00'),
        createdBy: 'mariana.manzo@numaris.com',
        type: 'update'
      },
      {
        id: 'rule-1-note-2',
        content: 'Recordatorio: validar calibración de sensores de velocidad en unidades nuevas.',
        createdAt: new Date('2024-01-19T11:45:00'),
        createdBy: 'juan.perez@numaris.com'
      }
    ],
    attachments: [
      {
        id: 'rule-1-attachment-1',
        name: 'Guía de actuación en exceso de velocidad.pdf',
        type: 'PDF',
        size: '1.2 MB',
        uploadedBy: 'soporte-operaciones@numaris.com',
        uploadedAt: new Date('2024-01-18T08:15:00'),
        description: 'Procedimiento de intervención y escalamiento.'
      },
      {
        id: 'rule-1-attachment-2',
        name: 'Checklist de inspección rápida.xlsx',
        type: 'XLSX',
        size: '340 KB',
        uploadedBy: 'mariana.manzo@numaris.com',
        uploadedAt: new Date('2024-01-19T10:05:00')
      }
    ],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
    owner: 'Juan Pérez',
    relatedEventsCount: 12,
    isFavorite: true
  },
  {
    id: 'rule-2',
    name: 'Entrada a zona restringida',
    description: 'Alerta cuando un vehículo no autorizado ingresa a una zona restringida',
    status: 'active',
    ruleType: 'zone',
    severity: 'high',
    conditions: [],
    conditionGroups: [
      {
        id: 'group-1',
        conditions: [
          {
            id: 'cond-2a',
            sensor: 'location',
            operator: 'contains',
            value: 'zona-restringida',
            dataType: 'string'
          },
          {
            id: 'cond-2b',
            sensor: 'speed',
            operator: 'gt',
            value: 5,
            dataType: 'numeric'
          }
        ],
        groupLogicOperator: 'and',
        betweenGroupOperator: 'and'
      }
    ],
    appliesTo: {
      type: 'units',
      units: Array.from({length: 50}, (_, i) => `unit-${i + 1}`)
    },
    zoneScope: {
      type: 'inside',
      zones: ['zona-restringida-1', 'zona-alta-seguridad', 'zona-militar'],
      zoneTags: ['zona-restringida', 'alta-seguridad', 'acceso-especial']
    },
    schedule: {
      type: 'always'
    },
    closePolicy: {
      type: 'manual'
    },
    eventSettings: {
      instructions: 'Contactar inmediatamente al conductor y equipo de seguridad. El vehículo debe salir de la zona en 5 minutos.',
      responsible: 'juan.perez@numaris.com',
      severity: 'high',
      icon: 'warning',
      shortName: 'Zona restr.',
      tags: ['seguridad', 'zona-violacion', 'acceso-restringido', 'perimetro', 'vigilancia', 'control-acceso', 'seguridad-critica', 'zona-protegida', 'autorizacion', 'restricciones'],
      unitTags: ['acceso-restringido', 'seguridad-critica'],
      unitUntags: ['acceso-autorizado'],
      unitUntagsEnabled: true
    },
    notifications: {
      email: {
        enabled: true,
        recipients: [
          'seguridad@empresa.com',
          'supervisor@empresa.com',
          'gerente@seguridad.com',
          'alertas@empresa.com',
          'monitoreo@empresa.com',
          'jefe@operaciones.com',
          'coordinador@logistica.com',
          'responsable@seguridad.com',
          'director@operaciones.com',
          'admin@sistema.com'
        ],
        subject: '[REPORTE] Evento en {unidad} - {fecha}',
        body: 'Reporte de Evento - Turno Operacional\n\n==============================\nINFORMACIÓN DEL EVENTO\n==============================\n\nUnidad: {unidad}\nFecha: {fecha_hora}\nUbicación: {ubicacion_link}\nTipo de evento: {regla_nombre}\nVelocidad registrada: {velocidad}\n\n==============================\nDATOS TÉCNICOS\n==============================\n\nTemperatura: {temperatura}\nCombustible: {combustible}\nBatería: {bateria}\nConductor: {conductor}\n\n==============================\nSEGUIMIENTO\n==============================\n\nEste evento ha sido registrado en el sistema y está pendiente de revisión.\n\nSaludos,\nEquipo de Monitoreo - Turno {hora}',
        templateId: 'template-2'
      }
    },
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-18'),
    owner: 'María González',
    relatedEventsCount: 3,
    isFavorite: false
  },
  {
    id: 'rule-3',
    name: 'Temperatura de carga crítica',
    description: 'Monitorea la temperatura de la carga refrigerada para evitar deterioro',
    status: 'active',
    ruleType: 'telemetry',
    severity: 'medium',
    conditions: [],
    conditionGroups: [
      {
        id: 'group-1',
        conditions: [
          {
            id: 'cond-3a',
            sensor: 'temperature',
            operator: 'gt',
            value: 8,
            dataType: 'numeric'
          },
          {
            id: 'cond-3b',
            sensor: 'power_takeoff',
            operator: 'eq',
            value: 'true',
            dataType: 'boolean'
          },
          {
            id: 'cond-3c',
            sensor: 'speed',
            operator: 'gt',
            value: 0,
            dataType: 'numeric'
          }
        ],
        groupLogicOperator: 'or',
        betweenGroupOperator: 'and'
      },
      {
        id: 'group-2',
        conditions: [
          {
            id: 'cond-3d',
            sensor: 'ignition',
            operator: 'eq',
            value: 'true',
            dataType: 'boolean'
          }
        ],
        groupLogicOperator: 'and',
        betweenGroupOperator: 'and'
      }
    ],
    appliesTo: {
      type: 'tags',
      tags: ['cadena-frio', 'refrigeracion', 'temperatura-controlada']
    },
    zoneScope: {
      type: 'all'
    },
    schedule: {
      type: 'custom',
      ruleContext: 'inside',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      timeRanges: [{ start: '06:00', end: '18:00' }]
    },
    closePolicy: {
      type: 'auto-time',
      duration: 30
    },
    eventSettings: {
      instructions: 'Verificar sistema de refrigeración y ajustar temperatura. Revisar puertas del compartimento de carga.',
      responsible: 'ana.garcia@numaris.com',
      severity: 'medium',
      icon: 'thermometer',
      shortName: 'Temp carga',
      tags: ['cadena-frio', 'temperatura'],
      unitTags: ['refrigeracion']
    },
    notifications: {
      email: {
        enabled: false,
        recipients: ['cliente.vip@empresa.com', 'atencion.premium@empresa.com'],
        subject: '[NUMARIS] Notificación de Servicio - {unidad}',
        body: 'Estimado Cliente,\n\nNos dirigimos a usted para informarle sobre un evento registrado en su flota:\n\n┌─────────────────────────────────────┐\n│           DETALLES DEL EVENTO       │\n└─────────────────────────────────────┘\n\n• Unidad afectada: {unidad}\n• Fecha y hora: {fecha_hora}\n• Ubicación actual: {ubicacion_link}\n• Tipo de evento: {regla_nombre}\n• Velocidad registrada: {velocidad}\n• Conductor asignado: {conductor}\n\n┌─────────────────────────────────────┐\n│         ACCIONES REALIZADAS         │\n└─────────────────────────────────────┘\n\n- Evento registrado automáticamente\n- Notificación enviada al supervisor\n- Ubicación verificada y confirmada\n- Seguimiento activo iniciado\n\nPara consultas adicionales, no dude en contactarnos.\n\nAtentamente,\nEquipo de Atención Premium\nNumaris Fleet Solutions\nTeléfono: +54 11 4000-0000\nCorreo: premium@numaris.com',
        templateId: 'template-3'
      }
    },
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-22'),
    owner: 'Carlos López',
    relatedEventsCount: 7,
    isFavorite: false
  },
  {
    id: 'rule-4',
    name: 'Parada prolongada sin autorización',
    description: 'Detecta cuando un vehículo permanece estacionado por más tiempo del permitido',
    status: 'inactive',
    ruleType: 'telemetry',
    severity: 'informative',
    conditions: [],
    conditionGroups: [
      {
        id: 'group-1',
        conditions: [
          {
            id: 'cond-4a',
            sensor: 'ignition',
            operator: 'eq',
            value: 'false',
            dataType: 'boolean'
          },
          {
            id: 'cond-4b',
            sensor: 'movement_status',
            operator: 'eq',
            value: 'stopped',
            dataType: 'boolean'
          }
        ],
        groupLogicOperator: 'and',
        betweenGroupOperator: 'or'
      },
      {
        id: 'group-2',
        conditions: [
          {
            id: 'cond-5a',
            sensor: 'speed',
            operator: 'lt',
            value: 5,
            dataType: 'numeric'
          },
          {
            id: 'cond-5b',
            sensor: 'battery',
            operator: 'gt',
            value: 20,
            dataType: 'numeric'
          },
          {
            id: 'cond-5c',
            sensor: 'connection_status',
            operator: 'eq',
            value: 'less_10min',
            dataType: 'string'
          }
        ],
        groupLogicOperator: 'or',
        betweenGroupOperator: 'or'
      }
    ],
    appliesTo: {
      type: 'units',
      units: Array.from({length: 20}, (_, i) => `unit-${i + 10}`)
    },
    zoneScope: {
      type: 'outside',
      zones: ['zona-a', 'zona-b', 'zona-centro', 'zona-d', 'zona-e'],
      zoneTags: ['zona-urbana', 'zona-comercial']
    },
    schedule: {
      type: 'always'
    },
    closePolicy: {
      type: 'auto-condition'
    },
    eventSettings: {
      instructions: 'Contactar al conductor para verificar el motivo de la parada prolongada. Documentar justificación.',
      responsible: 'carlos.rodriguez@numaris.com',
      severity: 'informative',
      icon: 'clock',
      shortName: 'Parada',
      tags: []
    },
    notifications: {
      email: {
        enabled: true,
        recipients: [
          'operaciones@empresa.com',
          'coordinador@logistica.com',
          'supervisor@flota.com'
        ],
        subject: '[TÉCNICO] {unidad} - {regla_nombre} | Rev. Requerida',
        body: 'ALERTA TÉCNICA - MANTENIMIENTO\n\n==============================\nINFORMACIÓN TÉCNICA DEL EVENTO\n==============================\n\nID Unidad: {unidad}\nTimestamp: {fecha_hora}\nPosición GPS: {ubicacion_link}\nAlerta: {regla_nombre}\nVelocidad: {velocidad}\nOperador: {conductor}\n\n==============================\nPARÁMETROS TÉCNICOS\n==============================\n\nTemperatura motor: {temperatura}\nNivel combustible: {combustible}\nVoltaje batería: {bateria}\nPresión neumáticos: {presion}\nNivel aceite: {nivel_aceite}\nOdómetro: {odometro}\n\n==============================\nACCIÓN REQUERIDA\n==============================\n\n1. Revisar diagnóstico de unidad\n2. Programar inspección técnica\n3. Verificar histórico de mantenimiento\n4. Contactar con conductor si es necesario\n\nDepartamento Técnico\nNumaris Fleet Maintenance',
        templateId: 'template-4'
      }
    },
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-16'),
    owner: 'Ana Rodríguez',
    relatedEventsCount: 1,
    isFavorite: false
  },
  {
    id: 'rule-5',
    name: 'Botón de pánico activado',
    description: 'Detecta cuando se activa el botón de pánico en un vehículo',
    status: 'active',
    ruleType: 'telemetry',
    severity: 'high',
    conditions: [
      {
        id: 'cond-6',
        sensor: 'panic_button',
        operator: 'eq',
        value: 'true',
        dataType: 'boolean'
      }
    ],
    appliesTo: {
      type: 'tags',
      tags: ['emergencia', 'seguridad-especial']
    },
    zoneScope: {
      type: 'all'
    },
    schedule: {
      type: 'custom',
      ruleContext: 'inside',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      timeRanges: [
        { start: '06:00', end: '18:00' },
        { start: '06:00', end: '18:00' },
        { start: '06:00', end: '18:00' },
        { start: '06:00', end: '18:00' },
        { start: '06:00', end: '18:00' },
        { start: '06:00', end: '18:00' },
        { start: '06:00', end: '18:00' }
      ]
    },
    closePolicy: {
      type: 'manual'
    },
    eventSettings: {
      instructions: 'Respuesta de emergencia inmediata. Contactar con autoridades y despatar unidad de seguridad.',
      responsible: 'jefe-seguridad',
      severity: 'high',
      icon: 'alert',
      shortName: 'Pánico',
      tags: [],
      unitTags: ['emergencia', 'alta-prioridad', 'seguridad-critica'],
      unitUntags: ['rutina', 'normal'],
      unitUntagsEnabled: true
    },
    notifications: {
      email: {
        enabled: false,
        recipients: ['direccion@empresa.com', 'gerencia.general@empresa.com'],
        subject: '[EJECUTIVO] Evento {unidad} - {fecha}',
        body: 'Resumen Ejecutivo de Evento\n\n- Unidad: {unidad}\n- Evento: {regla_nombre}\n- Fecha/Hora: {fecha_hora}\n- Ubicación: {ubicacion_link}\n- Velocidad: {velocidad}\n- Conductor: {conductor}\n\nEl evento ha sido registrado y está siendo gestionado por el equipo operativo.\n\nPara detalles adicionales, consulte el dashboard ejecutivo.\n\nSaludos cordiales,\nSistema de Gestión Numaris',
        templateId: 'template-5'
      }
    },
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-25'),
    owner: 'Sistema Emergencias',
    relatedEventsCount: 0,
    isFavorite: true
  },
  {
    id: 'rule-6',
    name: 'Desconexión prolongada del GPS',
    description: 'Detecta cuando un vehículo pierde conectividad GPS por más de 15 minutos',
    status: 'active',
    ruleType: 'telemetry',
    severity: 'medium',
    conditions: [],
    conditionGroups: [
      {
        id: 'group-1',
        conditions: [
          {
            id: 'cond-7a',
            sensor: 'connection_status',
            operator: 'eq',
            value: 'more_24h',
            dataType: 'string'
          },
          {
            id: 'cond-7b',
            sensor: 'gsm_signal',
            operator: 'lt',
            value: 10,
            dataType: 'numeric'
          }
        ],
        groupLogicOperator: 'and',
        betweenGroupOperator: 'or'
      },
      {
        id: 'group-2',
        conditions: [
          {
            id: 'cond-7c',
            sensor: 'satellites_count',
            operator: 'lt',
            value: 4,
            dataType: 'numeric'
          },
          {
            id: 'cond-7d',
            sensor: 'battery',
            operator: 'lt',
            value: 15,
            dataType: 'numeric'
          }
        ],
        groupLogicOperator: 'or',
        betweenGroupOperator: 'or'
      }
    ],
    appliesTo: {
      type: 'units',
      units: Array.from({length: 100}, (_, i) => `unit-${i + 1}`)
    },
    zoneScope: {
      type: 'all'
    },
    schedule: {
      type: 'always'
    },
    closePolicy: {
      type: 'auto-condition'
    },
    eventSettings: {
      instructions: 'Verificar conectividad del dispositivo GPS y contactar al conductor para confirmar ubicación.',
      responsible: 'supervisor-logistica',
      severity: 'medium',
      icon: 'signal',
      shortName: 'GPS off',
      tags: ['conectividad', 'gps', 'comunicacion', 'rastreo', 'monitoreo'],
      unitTags: ['monitoreo']
    },
    notifications: {
      email: {
        enabled: true,
        recipients: [
          'logistica@empresa.com',
          'soporte@sistemas.com',
          'monitoreo@gps.com',
          'tecnico@soporte.com',
          'alertas@conectividad.com'
        ],
        subject: '[SEGUIMIENTO] {unidad} - Estado del evento',
        body: 'SEGUIMIENTO DE EVENTO\n\nINFORMACIÓN INICIAL:\n\nUnidad: {unidad}\nEvento: {regla_nombre}\nFecha/Hora: {fecha_hora}\nUbicación: {ubicacion_link}\nVelocidad: {velocidad}\nConductor: {conductor}\n\nESTADO ACTUAL:\n\n- Evento registrado exitosamente\n- Datos recopilados y validados\n- En proceso de análisis\n- Notificaciones enviadas\n\nPRÓXIMOS PASOS:\n\n• Seguimiento en 24 horas\n• Análisis de patrones\n• Reporte de tendencias\n• Acciones preventivas\n\nEste mensaje es parte del proceso de mejora continua.\n\nEquipo de Calidad y Seguimiento\nNumaris Analytics',
        templateId: 'template-6'
      }
    },
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-24'),
    owner: 'Sistema GPS',
    relatedEventsCount: 5,
    isFavorite: false
  }
]

// Mock Events Data
export const initialEvents: Event[] = [
  {
    id: 'evt-1',
    ruleId: 'rule-1',
    ruleName: 'Exceso de velocidad',
    status: 'open',
    severity: 'high',
    icon: 'speed',
    unitId: 'unit-1',
    unitName: 'Unidad 001',
    responsible: 'supervisor-flota',
    instructions: 'Verificar velocidad del vehículo y contactar al conductor inmediatamente. Documentar cualquier evidencia.',
    createdAt: new Date('2024-01-22T14:30:00'),
    updatedAt: new Date('2024-01-22T14:30:00'),
    startAddress: 'Anillo Perif. Nte. Manuel Gómez Morín 767, Santa María, Monterrey',
    historyUrl: 'https://example.com/historial/evt-1',
    startLocationLink: 'https://maps.google.com/?q=25.7073,-100.3119',
    unitLink: 'https://example.com/unidad/unit-1',
    driverName: 'Juan Pérez',
    speedRecorded: '135 Km/h',
    eventMessageHtml:
      'La unidad <span class="template-pill" data-variable="unidad" style="display:inline-flex;align-items:center;gap:4px;padding:2px 6px;border-radius:12px;border:1px solid #c792ff;background:#f4e8ff;color:#5b34b6;font-weight:500;font-size:13px;line-height:1;">Unidad 001</span> excedió el límite de velocidad alcanzando <span class="template-pill" style="display:inline-flex;align-items:center;gap:4px;padding:2px 6px;border-radius:12px;border:1px solid #c792ff;background:#f4e8ff;color:#5b34b6;font-weight:500;font-size:13px;line-height:1;">135 Km/h</span> en <span class="template-pill" style="display:inline-flex;align-items:center;gap:4px;padding:2px 6px;border-radius:12px;border:1px solid #c792ff;background:#f4e8ff;color:#5b34b6;font-weight:500;font-size:13px;line-height:1;">Anillo Perif. Nte. Manuel Gómez Morín 767</span> el día <span class="template-pill" style="display:inline-flex;align-items:center;gap:4px;padding:2px 6px;border-radius:12px;border:1px solid #c792ff;background:#f4e8ff;color:#5b34b6;font-weight:500;font-size:13px;line-height:1;">24/12/2025</span> a las <span class="template-pill" style="display:inline-flex;align-items:center;gap:4px;padding:2px 6px;border-radius:12px;border:1px solid #c792ff;background:#f4e8ff;color:#5b34b6;font-weight:500;font-size:13px;line-height:1;">12:00:02 pm</span>. El conductor asignado es <span class="template-pill" style="display:inline-flex;align-items:center;gap:4px;padding:2px 6px;border-radius:12px;border:1px solid #c792ff;background:#f4e8ff;color:#5b34b6;font-weight:500;font-size:13px;line-height:1;">Juan Pérez</span>. Además, se detectaron alertas similares en <span class="template-pill" style="display:inline-flex;align-items:center;gap:4px;padding:2px 6px;border-radius:12px;border:1px solid #c792ff;background:#f4e8ff;color:#5b34b6;font-weight:500;font-size:13px;line-height:1;">Parque Industrial Monterrey</span> durante las últimas <span class="template-pill" style="display:inline-flex;align-items:center;gap:4px;padding:2px 6px;border-radius:12px;border:1px solid #c792ff;background:#f4e8ff;color:#5b34b6;font-weight:500;font-size:13px;line-height:1;">2 semanas</span>, por lo que se recomienda <span class="template-pill" style="display:inline-flex;align-items:center;gap:4px;padding:2px 6px;border-radius:12px;border:1px solid #c792ff;background:#f4e8ff;color:#5b34b6;font-weight:500;font-size:13px;line-height:1;">monitoreo continuo</span> y una revisión del <span class="template-pill" style="display:inline-flex;align-items:center;gap:4px;padding:2px 6px;border-radius:12px;border:1px solid #c792ff;background:#f4e8ff;color:#5b34b6;font-weight:500;font-size:13px;line-height:1;">sistema de frenos</span> en el próximo servicio programado.',
    actionsRequired: [
      'Adjuntar imagen de referencia de ubicación y conductor asignado',
      'Verificar estado del vehículo y realizar inspección visual',
      'Contactar al conductor para obtener declaración del incidente',
    ],
    notes: [],
    tags: ['seguridad', 'velocidad'],
    location: { lat: 9.9281, lng: -84.0907 }
  },
  {
    id: 'evt-2',
    ruleId: 'rule-2',
    ruleName: 'Entrada a zona restringida',
    status: 'open',
    severity: 'high',
    icon: 'warning',
    unitId: 'unit-2',
    unitName: 'Unidad 002',
    responsible: 'jefe-seguridad',
    instructions: 'Contactar inmediatamente al conductor y equipo de seguridad. El vehículo debe salir de la zona en 5 minutos.',
    createdAt: new Date('2024-01-22T13:15:00'),
    updatedAt: new Date('2024-01-22T13:45:00'),
    startAddress: '42 Wallaby Way, Sydney',
    notes: [
      {
        id: 'note-1',
        content: 'Conductor contactado, saliendo de la zona ahora',
        createdAt: new Date('2024-01-22T13:45:00'),
        createdBy: 'jefe-seguridad'
      }
    ],
    tags: ['seguridad', 'zona-violacion'],
    location: { lat: 9.9350, lng: -84.0795 }
  },
  {
    id: 'evt-3',
    ruleId: 'rule-3',
    ruleName: 'Temperatura de carga crítica',
    status: 'closed',
    severity: 'medium',
    icon: 'thermometer',
    unitId: 'unit-3',
    unitName: 'Unidad 003',
    responsible: 'mariana.manzo@numaris.com',
    instructions: 'Verificar sistema de refrigeración y ajustar temperatura. Revisar puertas del compartimento de carga.',
    createdAt: new Date('2024-01-21T09:20:00'),
    updatedAt: new Date('2024-01-21T10:15:00'),
    closedAt: new Date('2024-01-21T10:10:00'),
    startAddress: 'Bodega central - Ruta norte',
    endAddress: 'Centro de distribución - Monterrey',
    historyUrl: 'https://example.com/historial/evt-3',
    unitLink: 'https://example.com/unidad/unit-3',
    actionsRequired: [
      'Verificar integridad del sistema de refrigeración',
      'Registrar temperatura final en el reporte de cadena de frío',
      'Coordinar seguimiento a las 24h',
    ],
    notes: [
      {
        id: 'note-2',
        content: 'Sistema de refrigeración ajustado. Temperatura normalizada.',
        createdAt: new Date('2024-01-21T10:15:00'),
        createdBy: 'mariana.manzo@numaris.com'
      }
    ],
    tags: ['cadena-frio', 'temperatura'],
    location: { lat: 9.9142, lng: -84.0742 },
    closeNote: 'Problema resuelto: se reemplazó el sensor de temperatura defectuoso y se ajustó el sistema de refrigeración. La carga se mantuvo en rango seguro durante todo el trayecto.'
  },
  {
    id: 'evt-4',
    ruleId: 'rule-1',
    ruleName: 'Exceso de velocidad',
    status: 'open',
    severity: 'high',
    icon: 'speed',
    unitId: 'unit-4',
    unitName: 'Unidad 004',
    responsible: 'supervisor-flota',
    instructions: 'Verificar velocidad del vehículo y contactar al conductor inmediatamente. Documentar cualquier evidencia.',
    createdAt: new Date('2024-01-23T10:45:00'),
    updatedAt: new Date('2024-01-23T11:00:00'),
    startAddress: '90210 Sunset Boulevard, Beverly Hills',
    notes: [
      {
        id: 'note-3',
        content: 'Conductor contactado. Reduciendo velocidad.',
        createdAt: new Date('2024-01-23T11:00:00'),
        createdBy: 'supervisor-flota'
      }
    ],
    tags: ['seguridad', 'velocidad'],
    location: { lat: 9.9200, lng: -84.0850 }
  },
  {
    id: 'evt-5',
    ruleId: 'rule-4',
    ruleName: 'Parada prolongada sin autorización',
    status: 'open',
    severity: 'informative',
    icon: 'clock',
    unitId: 'unit-5',
    unitName: 'Unidad 005',
    responsible: 'mariana.manzo@numaris.com',
    instructions: 'Contactar al conductor para verificar el motivo de la parada prolongada. Documentar justificación.',
    createdAt: new Date('2024-01-23T16:20:00'),
    updatedAt: new Date('2024-01-23T16:20:00'),
    startAddress: 'Powell Street, San Francisco',
    notes: [],
    tags: ['operacion', 'tiempo'],
    location: { lat: 9.9100, lng: -84.0900 }
  },
  {
    id: 'evt-6',
    ruleId: 'rule-1',
    ruleName: 'Exceso de velocidad',
    status: 'open',
    severity: 'high',
    icon: 'speed',
    unitId: 'unit-6',
    unitName: 'Unidad 006',
    responsible: 'mariana.manzo@numaris.com',
    instructions: 'Verificar velocidad del vehículo y contactar al conductor inmediatamente. Documentar cualquier evidencia.',
    createdAt: new Date('2024-01-24T08:15:00'),
    updatedAt: new Date('2024-01-24T08:30:00'),
    startAddress: 'Wisteria Lane, Fairview',
    notes: [
      {
        id: 'note-4',
        content: 'Contactando al conductor. Velocidad registrada: 95 km/h en zona de 60 km/h.',
        createdAt: new Date('2024-01-24T08:30:00'),
        createdBy: 'mariana.manzo@numaris.com'
      }
    ],
    tags: ['seguridad', 'velocidad'],
    location: { lat: 9.9250, lng: -84.0820 }
  },
  {
    id: 'evt-7',
    ruleId: 'rule-3',
    ruleName: 'Temperatura de carga crítica',
    status: 'open',
    severity: 'medium',
    icon: 'thermometer',
    unitId: 'unit-7',
    unitName: 'Unidad 007',
    responsible: 'mariana.manzo@numaris.com',
    instructions: 'Verificar sistema de refrigeración y ajustar temperatura. Revisar puertas del compartimento de carga.',
    createdAt: new Date('2024-01-24T12:45:00'),
    updatedAt: new Date('2024-01-24T12:45:00'),
    startAddress: '1 Hacker Way, Menlo Park',
    notes: [],
    tags: ['cadena-frio', 'temperatura'],
    location: { lat: 9.9180, lng: -84.0780 }
  },
  {
    id: 'evt-8',
    ruleId: 'rule-1',
    ruleName: 'Exceso de velocidad',
    status: 'closed',
    severity: 'high',
    icon: 'speed',
    unitId: 'unit-8',
    unitName: 'Unidad 008',
    responsible: 'supervisor-flota',
    instructions: 'Verificar velocidad del vehículo y contactar al conductor inmediatamente. Documentar cualquier evidencia.',
    createdAt: new Date('2024-01-20T15:30:00'),
    updatedAt: new Date('2024-01-20T16:45:00'),
    startAddress: '1600 Amphitheatre Pkwy, Mountain View',
    notes: [
      {
        id: 'note-5',
        content: 'Conductor fue contactado exitosamente. Velocidad reducida.',
        createdAt: new Date('2024-01-20T16:00:00'),
        createdBy: 'supervisor-flota'
      }
    ],
    tags: ['seguridad', 'velocidad'],
    location: { lat: 9.9300, lng: -84.0650 },
    closeNote: 'Incidente resuelto: conductor aplicó protocolo de seguridad y redujo velocidad inmediatamente. Se programó sesión de capacitación en manejo defensivo como medida preventiva.'
  }
]

// Legacy data - keeping for reference but will be phased out
export const reportsData = [
  {
    id: 1,
    nombre: "Viajes diario",
    descripcion: "Seguimiento diario de actividades de movimiento y rutas completadas por la flota",
    tipo: "Viajes",
    guardados: 3,
    icon: FileText,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  }
]

export const categories = ["Todas las categorías"]

// Legacy imports
import { SavedReport, ScheduledReport, DraftReport } from "../types"
import { generateDraftName, getFullNameFromEmail } from "../utils/helpers"

export const initialScheduledReports: ScheduledReport[] = []
export const initialSavedReports: SavedReport[] = []
export const initialDraftReports: DraftReport[] = []
