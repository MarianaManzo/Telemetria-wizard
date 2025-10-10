import type { ReactNode } from 'react';
import { DownOutlined } from '@ant-design/icons';
import { cn } from './ui/utils';

interface SelectorTriggerProps {
  onClick?: () => void;
  disabled?: boolean;
  children?: ReactNode;
  className?: string;
  as?: 'button' | 'div';
}

export function SelectorTrigger({ onClick, disabled, children, className, as = 'button' }: SelectorTriggerProps) {
  const Component = as === 'button' ? 'button' : 'div';

  return (
    <Component
      type={Component === 'button' ? 'button' : undefined}
      onClick={disabled ? undefined : onClick}
      className={cn(
        'nm-selector-trigger w-full h-8 flex items-center gap-2 border border-gray-300 rounded-lg bg-white text-[14px] text-gray-900 px-3 cursor-pointer',
        disabled && 'opacity-50 cursor-not-allowed',
        className,
      )}
    >
      <span className="flex-1 min-w-0 text-left truncate text-gray-900">{children}</span>
      <DownOutlined className="nm-selector-trigger__icon" />
    </Component>
  );
}

export default SelectorTrigger;
