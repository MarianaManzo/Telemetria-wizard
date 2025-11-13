import { useEffect, useMemo, useState } from 'react'

export interface ColumnPreference {
  id: string
  label: string
  enabled?: boolean
}

const STORAGE_PREFIX = 'tableColumnsConfig:'

const normalizePreferences = (stored: ColumnPreference[] | null, defaults: ColumnPreference[]) => {
  const defaultMap = new Map(defaults.map((col) => [col.id, col]))
  if (!stored || stored.length === 0) {
    return defaults.map((col) => ({ ...col, enabled: col.enabled ?? true }))
  }

  const sanitized: ColumnPreference[] = []
  const seen = new Set<string>()

  stored.forEach((col) => {
    if (defaultMap.has(col.id) && !seen.has(col.id)) {
      const fallback = defaultMap.get(col.id)!
      sanitized.push({ ...fallback, ...col, enabled: col.enabled ?? true })
      seen.add(col.id)
    }
  })

  defaults.forEach((col) => {
    if (!seen.has(col.id)) {
      sanitized.push({ ...col, enabled: col.enabled ?? true })
    }
  })

  return sanitized
}

export const useColumnPreferences = (tableId: string, defaultColumns: ColumnPreference[]) => {
  const storageKey = `${STORAGE_PREFIX}${tableId}`
  const initialState = useMemo(() => {
    if (typeof window === 'undefined') {
      return defaultColumns.map((col) => ({ ...col, enabled: col.enabled ?? true }))
    }
    try {
      const raw = window.localStorage.getItem(storageKey)
      if (!raw) {
        return defaultColumns.map((col) => ({ ...col, enabled: col.enabled ?? true }))
      }
      const parsed = JSON.parse(raw) as ColumnPreference[]
      return normalizePreferences(parsed, defaultColumns)
    } catch {
      return defaultColumns.map((col) => ({ ...col, enabled: col.enabled ?? true }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [columns, setColumns] = useState<ColumnPreference[]>(initialState)

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(columns))
    } catch {
      // ignore storage errors
    }
  }, [columns, storageKey])

  const visibleColumns = useMemo(() => columns.filter((col) => col.enabled !== false), [columns])

  return {
    columns,
    visibleColumns,
    setColumns,
  }
}
