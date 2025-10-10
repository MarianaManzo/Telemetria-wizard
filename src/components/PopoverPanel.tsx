import type { ReactNode } from 'react';
import { Button as AntdButton } from 'antd';
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
          <AntdButton
            type="text"
            aria-label="Cerrar"
            icon={<CloseOutlined style={{ fontSize: 16 }} />}
            onClick={onClose}
            style={{
              color: '#9CA3AF',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          />
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
