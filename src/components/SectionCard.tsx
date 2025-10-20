import type { ReactNode } from 'react';
import { cn } from './ui/utils';

interface SectionCardProps {
  icon: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  headerExtra?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

export default function SectionCard({
  icon,
  title,
  description,
  headerExtra,
  children,
  className,
  contentClassName,
}: SectionCardProps) {
  return (
    <div className={cn('bg-white border border-gray-200 rounded-lg', className)}>
      <div className="flex items-start gap-3 px-4 py-4 bg-gray-100 border-b border-gray-200 rounded-t-lg">
        <div className="flex items-center justify-center text-gray-600">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-[14px] font-semibold text-gray-900 leading-5">{title}</h3>
              {headerExtra}
            </div>
            {description ? (
              <p className="text-[14px] text-gray-600 leading-5">{description}</p>
            ) : null}
          </div>
        </div>
      </div>
      <div className={cn('p-4', contentClassName)}>{children}</div>
    </div>
  );
}
