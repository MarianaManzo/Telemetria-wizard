import type { ReactNode } from 'react';
import { Button } from './ui/button';
import { X } from 'lucide-react';

interface PopoverBaseProps {
  children: ReactNode;
  className?: string;
}

interface PopoverHeaderProps {
  title?: ReactNode;
  onClose?: () => void;
  hideCloseButton?: boolean;
  actions?: ReactNode;
  className?: string;
}

interface PopoverContentProps {
  children: ReactNode;
  className?: string;
}

interface PopoverFooterProps {
  children: ReactNode;
  className?: string;
}

function Base({ children, className = '' }: PopoverBaseProps) {
  return (
    <div className={`flex flex-col ${className}`} style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
      {children}
    </div>
  );
}

function Header({ title, onClose, hideCloseButton, actions, className = '' }: PopoverHeaderProps) {
  if (!title && hideCloseButton && !actions) {
    return null;
  }

  return (
    <div className={`flex items-center justify-between px-4 py-4 border-b border-gray-200 ${className}`}>
      <div className="flex items-center gap-2">
        {title && <h3 className="text-[16px] font-semibold text-gray-900 leading-6">{title}</h3>}
      </div>
      <div className="flex items-center gap-2">
        {actions}
        {!hideCloseButton && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-9 w-9 text-gray-400 hover:text-gray-600 hover:bg-transparent"
          >
            <X className="h-[18px] w-[18px]" />
          </Button>
        )}
      </div>
    </div>
  );
}

function Content({ children, className = '' }: PopoverContentProps) {
  return <div className={className}>{children}</div>;
}

function Footer({ children, className = '' }: PopoverFooterProps) {
  return (
    <div className={`border-t border-gray-200 ${className}`}>
      {children}
    </div>
  );
}

export const PopoverBase = Object.assign(Base, {
  Header,
  Content,
  Footer,
});

export type { PopoverBaseProps, PopoverHeaderProps, PopoverContentProps, PopoverFooterProps };
