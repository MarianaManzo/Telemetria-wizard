export type AppState = 'initial' | 'generating' | 'generated'
export type AppView = 'rules' | 'events' | 'my-events' | 'reports' | 'drafts' | 'scheduled' | 'tags-rules' | 'tags-events'
export type SaveModalMode = 'save' | 'save-as' | 'rename'
export type TagsContext = 'rules' | 'events'

export interface Tag {
  id: string
  name: string
  color: string
  assignedCount: number
  createdAt: Date
  updatedAt: Date
}

export interface ScheduleReportEditData {
  id: string
  report: string
  format: string
  startDate: string
  startTime: string
  frequency: string
  endType: 'never' | 'after' | 'on'
  endAfterCount?: number
  endOnDate?: string
  recipients: string[]
  subject: string
}

// Event and Rule Types
export interface Event {
  id: string
  ruleId: string
  ruleName: string
  status: 'open' | 'closed'
  severity: 'informative' | 'low' | 'medium' | 'high'
  icon: string
  unitId: string
  unitName: string
  responsible: string
  instructions: string
  createdAt: Date
  updatedAt: Date
  closedAt?: Date | null
  startAddress?: string
  endAddress?: string
  historyUrl?: string
  unitLink?: string
  eventMessageHtml?: string
  actionsRequired?: string[]
  startLocationLink?: string
  driverName?: string
  speedRecorded?: string
  notes: EventNote[]
  tags: string[]
  location: { lat: number; lng: number }
  closeNote?: string
}

export interface EventNote {
  id: string
  content: string
  createdAt: Date
  createdBy: string
}

export interface Rule {
  id: string
  name: string
  description: string
  status: 'active' | 'inactive'
  ruleType?: 'telemetry' | 'zone'
  severity: 'informative' | 'low' | 'medium' | 'high'
  conditions: RuleCondition[] // Legacy flat structure for backward compatibility
  conditionGroups?: RuleConditionGroup[] // New grouped structure
  appliesTo: RuleAppliesTo
  zoneScope: RuleZoneScope
  schedule: RuleSchedule
  closePolicy: RuleClosePolicy
  eventSettings: RuleEventSettings
  notifications: RuleNotifications
  createdAt: Date
  updatedAt: Date
  owner: string
  relatedEventsCount: number
  isFavorite: boolean
}

export interface RuleCondition {
  id: string
  sensor: string
  operator: string
  value: any
  dataType: 'numeric' | 'boolean' | 'text'
  logicOperator?: 'and' | 'or' // Operador lógico con la siguiente condición
}

export interface RuleConditionGroup {
  id: string
  conditions: RuleCondition[]
  groupLogicOperator: 'and' | 'or' // Operador lógico para las condiciones dentro del grupo
  betweenGroupOperator?: 'and' | 'or' // Operador lógico con el siguiente grupo
}

export interface RuleAppliesTo {
  type: 'units' | 'tags'
  units?: string[]
  tags?: string[]
}

export interface RuleZoneScope {
  type: 'all' | 'inside' | 'outside'
  zones?: string[]
  zoneTags?: string[]
}

export interface RuleSchedule {
  type: 'always' | 'custom'
  days?: string[]
  timeRanges?: { start: string; end: string }[]
}

export interface RuleClosePolicy {
  type: 'manual' | 'auto-time' | 'auto-condition'
  duration?: number
}

export interface RuleEventSettings {
  instructions: string
  responsible: string
  severity: 'informative' | 'low' | 'medium' | 'high'
  icon: string
  shortName?: string
  tags: string[]
  unitTags?: string[]
  unitUntags?: string[]
  unitUntagsEnabled?: boolean
  eventTiming?: 'cumplan-condiciones' | 'despues-tiempo'
  durationValue?: string
  durationUnit?: string
}

export interface RuleNotifications {
  email: {
    enabled: boolean
    recipients: string[]
    subject: string
    body: string
    templateId?: string | null
  }
}

// Legacy types for backward compatibility
export interface SavedReport {
  id: string
  name: string
  description?: string
  createdAt: Date
  updatedAt: Date
}

export interface ScheduledReport {
  id: string
  name: string
  schedule: string
  nextRun: Date
  createdAt: Date
}

export interface DraftReport {
  id: string
  name: string
  createdAt: Date
  updatedAt: Date
}
