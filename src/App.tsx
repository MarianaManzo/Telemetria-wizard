import { useState, useCallback, useMemo } from "react"
import { Layout } from "antd"
import { NotificationProvider } from "./contexts/NotificationContext"
import MainNavTopMenu from "./components/MainNavTopMenu"
import { Sidebar } from "./components/Sidebar"
import { RulesDetailSidebar } from "./components/RulesDetailSidebar"
import { EventsDetailSidebar } from "./components/EventsDetailSidebar"
import { RulesList } from "./components/RulesList"
import { RuleTypeSelector } from "./components/RuleTypeSelector"
import { RulesWizard } from "./components/RulesWizard"
import { TelemetryWizard } from "./components/TelemetryWizardWithModal"
import { RulesReadOnly } from "./components/RulesReadOnly"
import { EventsList } from "./components/EventsList"
import { EventsDetail } from "./components/EventsDetail"
import { TagsList } from "./components/TagsList"
import { Toaster } from "./components/ui/sonner"
import { showCustomToast } from "./components/CustomToast"
import { Star } from "lucide-react"
import { Rule, Event, AppView, Tag } from "./types"
import { initialRules, initialEvents, initialTags } from "./constants/data"

const { Sider, Content } = Layout;

const SIDEBAR_WIDTH = 240;

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('rules')
  const [rulesView, setRulesView] = useState<'list' | 'type-select' | 'new' | 'view' | 'edit'>('list')
  const [selectedRule, setSelectedRule] = useState<Rule | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [showEventDetail, setShowEventDetail] = useState(false)
  const [selectedRuleType, setSelectedRuleType] = useState<'telemetry' | 'zone' | null>(null)
  const [editingRule, setEditingRule] = useState<Rule | null>(null)
  // State management
  const [rules, setRules] = useState<Rule[]>(initialRules)
  const [events, setEvents] = useState<Event[]>(initialEvents)
  const [tags, setTags] = useState<Tag[]>(initialTags)

  const handleCreateRule = useCallback((ruleData: Partial<Rule>) => {
    if (editingRule) {
      // Editing existing rule
      const updatedRule: Rule = {
        ...editingRule,
        ...ruleData,
        conditions: ruleData.conditions || editingRule.conditions || [],
        conditionGroups: ruleData.conditionGroups || editingRule.conditionGroups || [],
        updatedAt: new Date()
      }

      console.log('Updating rule:', updatedRule.id, updatedRule)

      setRules(prev => prev.map(rule => 
        rule.id === editingRule.id ? updatedRule : rule
      ))

      // Update selectedRule with the new data
      setSelectedRule(updatedRule)
      console.log('Updated selectedRule:', updatedRule)

      setEditingRule(null)
      setRulesView('view')
      setSelectedRuleType(null)
      
      showCustomToast({
        title: "La regla se ha actualizado con éxito.",
        description: "Los cambios se han guardado correctamente"
      })
    } else {
      // Creating new rule
      const newRule: Rule = {
        id: `rule-${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: ruleData.name || 'Nueva regla',
        description: ruleData.description || '',
        status: 'active',
        severity: ruleData.severity || 'low',
        ruleType: ruleData.ruleType || selectedRuleType || 'telemetry',
        conditions: ruleData.conditions || [],
        conditionGroups: ruleData.conditionGroups || [],
        appliesTo: ruleData.appliesTo || { type: 'units', units: [] },
        zoneScope: ruleData.zoneScope || { type: 'all' },
        schedule: ruleData.schedule || { type: 'always' },
        closePolicy: ruleData.closePolicy || { type: 'manual' },
        eventSettings: ruleData.eventSettings || {
          instructions: '',
          responsible: 'supervisor-flota',
          severity: 'low',
          icon: 'alert',
          tags: []
        },
        notifications: ruleData.notifications || {
          email: {
            enabled: false,
            recipients: [],
            subject: '',
            body: ''
          }
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        owner: 'Usuario Actual',
        relatedEventsCount: 0,
        isFavorite: false
      }

      setRules(prev => [newRule, ...prev])
      setRulesView('list')
      setSelectedRuleType(null)
      
      showCustomToast({
        title: "La regla se ha creado con éxito.",
        description: "Puedes encontrarla en la lista de reglas"
      })
    }
  }, [editingRule])

  const handleRuleClick = useCallback((rule: Rule) => {
    setSelectedRule(rule)
    setRulesView('view')
  }, [])

  const handleNewRule = useCallback(() => {
    setSelectedRule(null)
    setEditingRule(null)
    setSelectedRuleType(null)
    setRulesView('type-select')
  }, [])

  const handleRuleTypeSelect = useCallback((type: 'telemetry' | 'zone') => {
    setSelectedRuleType(type)
    setRulesView('new')
  }, [])

  const handleBackToRules = useCallback(() => {
    setSelectedRule(null)
    setEditingRule(null)
    setSelectedRuleType(null)
    setRulesView('list')
  }, [])

  const handleBackToTypeSelector = useCallback(() => {
    if (editingRule) {
      // If editing, go back to the rule view and ensure selectedRule is current
      setRules(prev => {
        const currentRule = prev.find(rule => rule.id === editingRule.id)
        if (currentRule) {
          setSelectedRule(currentRule)
        }
        return prev
      })
      setRulesView('view')
    } else {
      // If creating new, go back to list
      setSelectedRule(null)
      setRulesView('list')
    }
    setSelectedRuleType(null)
    setEditingRule(null)
  }, [editingRule])

  const handleEditRule = useCallback((rule: Rule) => {
    setEditingRule(rule)
    const inferredType: 'telemetry' | 'zone' =
      rule.ruleType
        ? rule.ruleType
        : (rule.zoneScope?.type && rule.zoneScope.type !== 'all')
          ? 'zone'
          : 'telemetry'
    setSelectedRuleType(inferredType)
    setRulesView('edit')
  }, [])

  const handleRenameRule = useCallback((ruleId: string, newName: string, newDescription?: string) => {
    let updatedRule: Rule | null = null
    
    setRules(prev => prev.map(rule => 
      rule.id === ruleId ? { 
        ...rule, 
        name: newName, 
        description: newDescription !== undefined ? newDescription : rule.description,
        updatedAt: new Date() 
      } : rule
    ))

    // Get the updated rule to ensure consistency
    setRules(prev => {
      updatedRule = prev.find(rule => rule.id === ruleId) || null
      
      // Update selectedRule if it's the same rule
      setSelectedRule(current => {
        if (current && current.id === ruleId && updatedRule) {
          return updatedRule
        }
        return current
      })

      // Update editingRule if it's the same rule
      setEditingRule(current => {
        if (current && current.id === ruleId && updatedRule) {
          return updatedRule
        }
        return current
      })
      
      return prev
    })

    showCustomToast({
      title: "Regla renombrada con éxito",
      description: "El nombre se ha actualizado correctamente"
    })
  }, [])

  const handleEventClick = useCallback((event: Event) => {
    setSelectedEvent(event)
    setShowEventDetail(true)
  }, [])

  const handleCloseEventDetail = useCallback(() => {
    setSelectedEvent(null)
    setShowEventDetail(false)
  }, [])

  const handleEventStatusChange = useCallback((eventId: string, newStatus: 'open' | 'closed', note?: string) => {
    setEvents(prevEvents => {
      return prevEvents.map(event => {
        if (event.id === eventId) {
          const updatedEvent = {
            ...event, 
            status: newStatus,
            updatedAt: new Date(),
            ...(newStatus === 'closed'
              ? {
                  closeNote: note || event.closeNote,
                  closedAt: new Date(),
                }
              : { closeNote: undefined, closedAt: undefined })
          }
          
          return updatedEvent
        }
        return event
      })
    })

    // Update selectedEvent if it's the same event
    setSelectedEvent(prev => {
      if (prev && prev.id === eventId) {
        return { 
          ...prev, 
          status: newStatus,
          updatedAt: new Date(),
          ...(newStatus === 'closed'
            ? { closeNote: note || prev.closeNote, closedAt: new Date() }
            : { closeNote: undefined, closedAt: undefined })
        }
      }
      return prev
    })
    
    // Show toast notification
    showCustomToast({
      title: "Estado del evento actualizado",
      description: `El evento se ha marcado como ${
        newStatus === 'open' ? 'abierto' : 'cerrado'
      }`
    })
  }, [])

  const handleEventResponsibleChange = useCallback((eventId: string, newResponsible: string) => {
    setEvents(prevEvents => {
      return prevEvents.map(event => {
        if (event.id === eventId) {
          return { 
            ...event, 
            responsible: newResponsible,
            updatedAt: new Date()
          }
        }
        return event
      })
    })

    // Update selectedEvent if it's the same event
    setSelectedEvent(prev => {
      if (prev && prev.id === eventId) {
        return { 
          ...prev, 
          responsible: newResponsible,
          updatedAt: new Date()
        }
      }
      return prev
    })
    
    // Show toast notification
    showCustomToast({
      title: "Responsable del evento actualizado",
      description: `El evento ha sido asignado a ${newResponsible}`
    })
  }, [])

  const handleRuleStatusChange = useCallback((ruleId: string, newStatus: 'active' | 'inactive') => {
    console.log('handleRuleStatusChange called with:', ruleId, newStatus)
    setRules(prevRules => {
      return prevRules.map(rule => {
        if (rule.id === ruleId) {
          return { 
            ...rule, 
            status: newStatus,
            updatedAt: new Date()
          }
        }
        return rule
      })
    })

    // Update selectedRule if it matches the updated rule
    setSelectedRule(prev => {
      if (prev && prev.id === ruleId) {
        return { 
          ...prev, 
          status: newStatus,
          updatedAt: new Date()
        }
      }
      return prev
    })
    
    // Show toast notification
    showCustomToast({
      title: "Estado de la regla actualizado",
      description: `La regla se ha ${newStatus === 'active' ? 'activado' : 'desactivado'} correctamente`
    })
  }, [])

  const handleToggleRuleFavorite = useCallback((ruleId: string) => {
    setRules(prevRules => {
      return prevRules.map(rule => {
        if (rule.id === ruleId) {
          return { 
            ...rule, 
            isFavorite: !rule.isFavorite,
            updatedAt: new Date()
          }
        }
        return rule
      })
    })
  }, [])

  const handleDeleteRule = useCallback((ruleId: string) => {
    setRules(prevRules => prevRules.filter(rule => rule.id !== ruleId))
    
    // Also remove any events associated with this rule
    setEvents(prevEvents => prevEvents.filter(event => event.ruleId !== ruleId))
    
    showCustomToast({
      title: "Regla eliminada con éxito",
      description: "La regla y sus eventos asociados han sido eliminados"
    })
  }, [])

  const handleDuplicateRule = useCallback((ruleData: Partial<Rule>) => {
    const newRule: Rule = {
      id: `rule-${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: ruleData.name || 'Regla duplicada',
      description: ruleData.description || '',
      status: 'active',
      severity: ruleData.severity || 'low',
      conditions: ruleData.conditions || [],
      conditionGroups: ruleData.conditionGroups || [],
      appliesTo: ruleData.appliesTo || { type: 'units', units: [] },
      zoneScope: ruleData.zoneScope || { type: 'all' },
      schedule: ruleData.schedule || { type: 'always' },
      closePolicy: ruleData.closePolicy || { type: 'manual' },
      eventSettings: ruleData.eventSettings || {
        instructions: '',
        responsible: 'supervisor-flota',
        severity: 'low',
        icon: 'alert',
        tags: []
      },
      notifications: ruleData.notifications || {
        email: {
          enabled: false,
          recipients: [],
          subject: '',
          body: ''
        }
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      owner: 'Usuario Actual',
      relatedEventsCount: 0,
      isFavorite: false
    }

    setRules(prev => [newRule, ...prev])
    
    showCustomToast({
      title: "Regla duplicada con éxito",
      description: "La nueva regla ha sido creada y activada"
    })
  }, [])

  const handleGlobalNavigation = useCallback((view: AppView) => {
    setCurrentView(view)
    if (view !== 'rules' && !view.startsWith('tags-rules')) {
      setRulesView('list')
      setSelectedRule(null)
    }
    // Close any open modals/details when navigating
    setShowEventDetail(false)
    setSelectedEvent(null)
  }, [])

  const handleTopMenuSelect = useCallback((key: string) => {
    if (key === 'reglas') {
      handleGlobalNavigation('rules')
    } else if (key === 'eventos') {
      handleGlobalNavigation('events')
    }
  }, [handleGlobalNavigation])

  const topMenuSelectedKey = useMemo(() => {
    if (currentView === 'rules' || currentView === 'tags-rules' || rulesView !== 'list') {
      return 'reglas'
    }

    if (currentView === 'events' || currentView === 'my-events' || currentView === 'tags-events') {
      return 'eventos'
    }

    return 'monitoreo'
  }, [currentView, rulesView])

  const getFilteredEvents = useMemo(() => {
    if (currentView === 'my-events') {
      // Filter events assigned to current user (using 'supervisor-flota' as example of current user)
      return events.filter(event => event.responsible === 'supervisor-flota')
    }
    // Return all events for the general 'events' view
    return events
  }, [currentView, events])

  const renderContent = () => {
    // Handle event detail view regardless of current view
    if (showEventDetail && selectedEvent) {
      return (
        <EventsDetail
          event={selectedEvent}
          onClose={handleCloseEventDetail}
          rules={rules}
          onStatusChange={handleEventStatusChange}
          onResponsibleChange={handleEventResponsibleChange}
        />
      )
    }

    if (currentView === 'rules') {
      if (rulesView === 'list') {
        return (
          <RulesList
            rules={rules}
            events={events}
            onRuleClick={handleRuleClick}
            onNewRule={handleNewRule}
            onToggleFavorite={handleToggleRuleFavorite}
            onEventClick={handleEventClick}
            onStatusChange={handleRuleStatusChange}
            onRename={handleRenameRule}
            onDelete={handleDeleteRule}
            onDuplicate={handleDuplicateRule}
          />
        )
      } else if (rulesView === 'type-select') {
        return (
          <RuleTypeSelector
            onTypeSelect={handleRuleTypeSelect}
            onCancel={handleBackToRules}
          />
        )
      } else if (rulesView === 'new') {
        // Use TelemetryWizard for telemetry rules, regular wizard for others
        if (selectedRuleType === 'telemetry' || selectedRuleType === 'zone') {
          return (
            <TelemetryWizard
              wizardType={selectedRuleType}
              onSave={handleCreateRule}
              onCancel={handleBackToRules}
              onBackToTypeSelector={handleBackToTypeSelector}
              onRename={handleRenameRule}
            />
          )
        }
        return (
          <RulesWizard
            ruleType={selectedRuleType}
            onSave={handleCreateRule}
            onCancel={handleBackToRules}
          />
        )
      } else if (rulesView === 'edit' && editingRule) {
        // Edit mode with prefilled data
        if (selectedRuleType === 'telemetry' || selectedRuleType === 'zone') {
          return (
            <TelemetryWizard
              wizardType={selectedRuleType}
              rule={editingRule}
              onSave={handleCreateRule}
              onCancel={handleBackToTypeSelector}
              onBackToTypeSelector={handleBackToTypeSelector}
              onRename={handleRenameRule}
            />
          )
        }
        return (
          <RulesWizard
            ruleType={selectedRuleType}
            rule={editingRule}
            onSave={handleCreateRule}
            onCancel={handleBackToTypeSelector}
          />
        )
      } else if (rulesView === 'view' && selectedRule) {
        return (
          <RulesReadOnly
            key={`rule-${selectedRule.id}-${selectedRule.updatedAt?.getTime()}`}
            rule={selectedRule}
            onBack={handleBackToRules}
            events={events.filter(e => e.ruleId === selectedRule.id)}
            onStatusChange={handleRuleStatusChange}
            onEdit={handleEditRule}
            onDelete={handleDeleteRule}
            onRename={handleRenameRule}
          />
        )
      }
    } else if (currentView === 'events' || currentView === 'my-events') {
      return (
        <EventsList
          events={getFilteredEvents}
          onEventClick={handleEventClick}
          onStatusChange={handleEventStatusChange}
          onResponsibleChange={handleEventResponsibleChange}
          viewType={currentView}
        />
      )
    } else if (currentView === 'tags-rules') {
      return (
        <TagsList
          tags={tags}
          context="rules"
        />
      )
    } else if (currentView === 'tags-events') {
      return (
        <TagsList
          tags={tags}
          context="events"
        />
      )
    }

    return null
  }

  const shouldShowPrimarySidebar = !(
    currentView === 'rules' && (rulesView === 'type-select' || rulesView === 'new' || rulesView === 'edit')
  ) && !showEventDetail;

  const primarySidebar = shouldShowPrimarySidebar
    ? currentView === 'rules' && rulesView === 'view' && selectedRule
      ? <RulesDetailSidebar />
      : <Sidebar currentView={currentView} onViewChange={handleGlobalNavigation} />
    : null;

  const eventSidebar = showEventDetail && selectedEvent ? <EventsDetailSidebar /> : null;

  return (
    <NotificationProvider>
      <Layout style={{ minHeight: "100vh", background: "var(--color-bg-base)" }}>
        <MainNavTopMenu
          selectedMenuItem={topMenuSelectedKey}
          onMenuSelect={handleTopMenuSelect}
        />
        <Layout hasSider style={{ minHeight: 0, background: "var(--color-bg-base)" }}>
          {primarySidebar && (
            <Sider
              width={SIDEBAR_WIDTH}
              theme="light"
              style={{
                background: "var(--color-bg-base)",
                borderInlineEnd: "1px solid var(--color-gray-200)",
                paddingInline: 0,
                height: "100%",
              }}
            >
              {primarySidebar}
            </Sider>
          )}
          {eventSidebar && (
            <Sider
              width={SIDEBAR_WIDTH}
              theme="light"
              style={{
                background: "var(--color-bg-base)",
                borderInlineEnd: "1px solid var(--color-gray-200)",
                paddingInline: 0,
                height: "100%",
              }}
            >
              {eventSidebar}
            </Sider>
          )}
          <Content
            style={{
              background: "var(--color-bg-base)",
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {renderContent()}
          </Content>
        </Layout>
      </Layout>
      <Toaster />
    </NotificationProvider>
  )
}
