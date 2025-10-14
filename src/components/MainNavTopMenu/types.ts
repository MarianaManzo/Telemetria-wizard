// TypeScript type definitions for MainNavTopMenu component

export interface Notification {
  id: string;
  evento: string;
  description: string;
  fechaCreacion: string; // ISO date string
  severidad: 'Alta' | 'Media' | 'Baja' | 'Informativa';
  unread: boolean;
}

export interface SeverityStyle {
  icon: string; // SVG path data
  color: string;
  bg: string;
}

export interface MainNavTopMenuProps {
  selectedMenuItem?: string;
  onMenuSelect?: (key: string) => void;
  onNotificationSelect?: (id: string) => void;
  onViewAllNotifications?: () => void;
}

export type MenuItemKey =
  | 'monitoreo'
  | 'unidades'
  | 'dispositivos'
  | 'zonas'
  | 'eventos'
  | 'reportes'
  | 'reglas';
