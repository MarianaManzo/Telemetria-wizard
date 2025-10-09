import type { ReactNode } from 'react';
import { Button } from './ui/button';
import { CloseOutlined } from '@ant-design/icons';
import { cn } from './ui/utils';

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
    <div className={cn('flex flex-col bg-white', className)} style={{ fontFamily: "'Source Sans 3', sans-serif" }}>
      {children}
    </div>
  );
}

function Header({ title, onClose, hideCloseButton, actions, className = '' }: PopoverHeaderProps) {
  if (!title && hideCloseButton && !actions) {
    return null;
  }

  return (
    <div className={cn('flex items-center justify-between px-4 py-4 border-b border-gray-200', className)}>
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
            className="h-8 w-8 text-gray-400 hover:text-gray-600 hover:bg-transparent flex items-center justify-center"
          >
            <CloseOutlined style={{ fontSize: 18 }} />
          </Button>
        )}
      </div>
    </div>
  );
}

function Content({ children, className = '' }: PopoverContentProps) {
  return <div className={cn('px-4 py-4', className)}>{children}</div>;
}

function Footer({ children, className = '' }: PopoverFooterProps) {
  return <div className={cn('border-t border-gray-200 px-4 py-4', className)}>{children}</div>;
}

export const PopoverBase = Object.assign(Base, {
  Header,
  Content,
  Footer,
});

export type { PopoverBaseProps, PopoverHeaderProps, PopoverContentProps, PopoverFooterProps };
