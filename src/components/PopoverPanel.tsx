import type { ReactNode } from 'react';
import { Button } from './ui/button';
import { X } from 'lucide-react';

interface PopoverPanelProps {
  title?: ReactNode;
  onClose?: () => void;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  contentClassName?: string;
  hideCloseButton?: boolean;
  headerActions?: ReactNode;
}

export function PopoverPanel({
  title,
  onClose,
  children,
  footer,
  className = '',
  contentClassName = '',
  hideCloseButton,
  headerActions,
}: PopoverPanelProps) {
  return (
    <div className={`flex flex-col ${className}`} style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
      {(title || !hideCloseButton || headerActions) && (
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            {title && (
              <h3 className="text-[16px] font-semibold text-gray-900 leading-6">{title}</h3>
            )}
          </div>
          <div className="flex items-center gap-2">
            {headerActions}
            {!hideCloseButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 text-gray-400 hover:text-gray-600 hover:bg-transparent"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}

      <div className={`p-4 ${contentClassName}`}>{children}</div>

      {footer && (
        <div className="border-t border-gray-200 px-4 py-3" style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
          {footer}
        </div>
      )}
    </div>
  );
}

export type { PopoverPanelProps };
