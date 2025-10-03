// Helper function to map template names to their categories
export const getTemplateCategory = (templateName: string): string => {
  const templateCategoryMap: { [key: string]: string } = {
    "Viajes diario": "Viajes",
    "Estado de mantenimiento": "Mantenimiento", 
    "Seguimiento GPS": "Eventos"
  };
  
  return templateCategoryMap[templateName] || "Sin categoría";
};

// Helper function to create a preview of applied filters
export const getFiltersPreview = (filters: any) => {
  const parts = [];
  if (filters.dateRange) {
    parts.push(`Fecha: ${filters.dateRange.from || 'No especificada'} - ${filters.dateRange.to || 'No especificada'}`);
  }
  if (filters.vehicles && filters.vehicles.length > 0) {
    parts.push(`Unidades: ${filters.vehicles.length} seleccionadas`);
  }
  if (filters.tags && filters.tags.length > 0) {
    parts.push(`Etiquetas: ${filters.tags.length} aplicadas`);
  }
  return parts.length > 0 ? parts.join(', ') : 'Sin filtros configurados';
};

// Helper function to format date with time in Spanish format
export const formatDateWithTime = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'pm' : 'am';
  const displayHours = hours % 12 || 12;
  
  return `${day}/${month}/${year} ${displayHours.toString().padStart(2, '0')}:${minutes}:${seconds} ${ampm}`;
};

// Helper function to normalize names for comparison (case-insensitive and accent-insensitive)
export const normalizeReportName = (name: string): string => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .trim();
};

// Helper function to check if report name already exists
export const isReportNameDuplicate = (
  newName: string, 
  existingReports: { name: string; id?: string }[], 
  currentReportId?: string
): boolean => {
  // Return false if no name provided or no existing reports
  if (!newName || !existingReports || existingReports.length === 0) {
    return false;
  }
  
  const normalizedNewName = normalizeReportName(newName);
  
  // Return false if normalized name is empty
  if (!normalizedNewName) {
    return false;
  }
  
  return existingReports.some(report => {
    // Skip if report doesn't have a name
    if (!report.name) {
      return false;
    }
    
    // Skip comparison with the current report (for rename operations)
    if (currentReportId && report.id === currentReportId) {
      return false;
    }
    
    return normalizeReportName(report.name) === normalizedNewName;
  });
};

// Helper function to get frequency label in Spanish
export const getFrequencyLabel = (frequency: string): string => {
  const frequencyMap: { [key: string]: string } = {
    'daily': 'Diariamente',
    'weekly': 'Semanalmente', 
    'monthly': 'Mensualmente',
    'yearly': 'Anualmente'
  };
  
  return frequencyMap[frequency] || frequency;
};

// Helper function to format next send date
export const formatNextSend = (nextSend: Date): string => {
  const now = new Date();
  const diffTime = nextSend.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'Hoy';
  } else if (diffDays === 1) {
    return 'Mañana';
  } else if (diffDays > 1 && diffDays <= 7) {
    return `En ${diffDays} días`;
  } else {
    return formatDateWithTime(nextSend);
  }
};

// Helper function to format creation date for drafts (same as formatDateWithTime but using single digit for date/month when possible)
export const formatDraftCreationDate = (date: Date): string => {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'pm' : 'am';
  const displayHours = hours % 12 || 12;
  
  return `${day}/${month}/${year} ${displayHours}:${minutes}:${seconds} ${ampm}`;
};

// Helper function to get draft state display text and color
export const getDraftStateInfo = (appState: 'initial' | 'generating' | 'generated') => {
  switch (appState) {
    case 'generated':
      return {
        text: 'Generado',
        colorClass: 'text-muted-foreground'
      };
    case 'generating':
      return {
        text: 'Generando...',
        colorClass: 'text-muted-foreground'
      };
    case 'initial':
    default:
      return {
        text: 'Sin generar',
        colorClass: 'text-muted-foreground'
      };
  }
};

// Helper function to generate auto draft names based on filters
export const generateDraftName = (filters: any): string => {
  let name = 'Viajes diario (';
  
  // Add date preset or range
  if (filters.dateRange?.preset) {
    name += filters.dateRange.preset;
  } else if (filters.dateRange?.from && filters.dateRange?.to) {
    name += `${filters.dateRange.from} - ${filters.dateRange.to}`;
  } else {
    name += 'Personalizado';
  }
  
  // Add vehicle count
  const vehicleCount = filters.vehicleCount || filters.vehicles?.length || 0;
  name += ` /${vehicleCount} Unidades`;
  
  // Add tags count if any
  const tagCount = filters.tags?.length || 0;
  if (tagCount > 0) {
    name += ` /${tagCount} Etiqueta${tagCount === 1 ? '' : 's'}`;
  }
  
  name += ')';
  return name;
};

// Helper function to convert draft filters to FilterControls format
export const convertDraftFiltersToControls = (draftFilters: any): any => {
  if (!draftFilters) return {};
  
  const controlsFilters: any = {};
  
  // Convert date range format
  if (draftFilters.dateRange?.preset) {
    // Map preset names to FilterControls format
    const presetMap: { [key: string]: string } = {
      'Hoy': 'hoy',
      'Ayer': 'ayer',
      'Últimos 7 días': 'ultimos7dias',
      'Últimos 15 días': 'ultimos15dias',
      'Último mes': 'ultimomes',
      'Mes anterior': 'mesanterior',
      'Personalizado': 'personalizado'
    };
    
    controlsFilters.date = presetMap[draftFilters.dateRange.preset] || 'hoy';
  } else if (draftFilters.dateRange?.from && draftFilters.dateRange?.to) {
    controlsFilters.date = 'personalizado';
    controlsFilters.customDateRange = {
      start: new Date(draftFilters.dateRange.from),
      end: new Date(draftFilters.dateRange.to)
    };
  }
  
  // Convert vehicles to object format
  if (draftFilters.vehicles && Array.isArray(draftFilters.vehicles)) {
    controlsFilters.vehicles = draftFilters.vehicles.map((vehicle: any) => {
      if (typeof vehicle === 'string') {
        return { id: vehicle, name: vehicle };
      }
      return vehicle;
    });
  }
  
  // Copy vehicle count
  if (draftFilters.vehicleCount) {
    controlsFilters.vehicleCount = draftFilters.vehicleCount;
  }
  
  // Convert tags (already in correct format if using objects)
  if (draftFilters.tags) {
    controlsFilters.tags = draftFilters.tags;
  }
  
  // Copy other filters
  if (draftFilters.dynamicFilters) {
    controlsFilters.dynamicFilters = draftFilters.dynamicFilters;
  }
  
  return controlsFilters;
};

// Helper function to convert FilterControls format to draft filters
export const convertControlsToDraftFilters = (controlsFilters: any): any => {
  if (!controlsFilters) return {};
  
  const draftFilters: any = {};
  
  // Convert date format back
  if (controlsFilters.date) {
    const presetMap: { [key: string]: string } = {
      'hoy': 'Hoy',
      'ayer': 'Ayer',
      'ultimos7dias': 'Últimos 7 días',
      'ultimos15dias': 'Últimos 15 días',
      'ultimomes': 'Último mes',
      'mesanterior': 'Mes anterior',
      'personalizado': 'Personalizado'
    };
    
    if (controlsFilters.date === 'personalizado' && controlsFilters.customDateRange) {
      draftFilters.dateRange = {
        from: controlsFilters.customDateRange.start?.toISOString().split('T')[0],
        to: controlsFilters.customDateRange.end?.toISOString().split('T')[0]
      };
    } else {
      draftFilters.dateRange = {
        preset: presetMap[controlsFilters.date] || 'Hoy'
      };
    }
  }
  
  // Convert vehicles back to array format
  if (controlsFilters.vehicles) {
    draftFilters.vehicles = controlsFilters.vehicles.map((vehicle: any) => {
      return typeof vehicle === 'string' ? vehicle : vehicle.id || vehicle.name;
    });
    draftFilters.vehicleCount = draftFilters.vehicles.length;
  }
  
  // Convert tags
  if (controlsFilters.tags) {
    draftFilters.tags = controlsFilters.tags;
  }
  
  // Copy other filters
  if (controlsFilters.dynamicFilters) {
    draftFilters.dynamicFilters = controlsFilters.dynamicFilters;
  }
  
  return draftFilters;
};

// Helper function to convert email to full name display
export const getFullNameFromEmail = (email: string): string => {
  const emailToNameMap: { [key: string]: string } = {
    'usuario@email.com': 'Carlos Rodríguez Morales',
    'admin@email.com': 'María José Castillo Vega',
    'supervisor@email.com': 'José Luis Fernández Solano',
    'manager@empresa.com': 'Ana Patricia González Rojas',
    'mantenimiento@empresa.com': 'Roberto Miguel Jiménez Castro',
    'operations@empresa.com': 'Laura Elizabeth Vargas Mora',
    'reportes@empresa.com': 'Diego Alejandro Sánchez López',
    'gps@empresa.com': 'Sofía Beatriz Herrera Quesada'
  };
  
  return emailToNameMap[email] || email; // Return email if no mapping found
};