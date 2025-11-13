import type { ReactNode } from 'react'
import { cn } from './ui/utils'

interface SectionCardProps {
  icon: ReactNode
  title: ReactNode
  description?: ReactNode
  headerExtra?: ReactNode
  children: ReactNode
  className?: string
  contentClassName?: string
  showTopDivider?: boolean
  variant?: 'default' | 'plain'
}

export default function SectionCard({
  icon,
  title,
  description,
  headerExtra,
  children,
  className,
  contentClassName,
  showTopDivider = false,
  variant = 'default'
}: SectionCardProps) {
  const isDefaultVariant = variant === 'default'

  const headerStyle = isDefaultVariant
    ? {
        backgroundColor: '#FAFAFA',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16
      }
    : undefined

  return (
    <div
      className={cn(
        'bg-white',
        isDefaultVariant && 'rounded-[16px] border border-[#E4E7EC] overflow-hidden',
        showTopDivider && 'mt-6 pt-6 border-t border-[#C0C5CE]',
        className
      )}
    >
      <div
        className={cn(
          'flex items-start gap-3 px-6 py-4',
          isDefaultVariant && 'border-b border-[#E4E7EC]'
        )}
        style={headerStyle}
      >
        <div className="flex items-center justify-center text-gray-600">{icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-[14px] font-semibold text-gray-900 leading-5">{title}</h3>
              {headerExtra}
            </div>
            {description ? <p className="text-[14px] text-gray-600 leading-5">{description}</p> : null}
          </div>
        </div>
      </div>
      <div className={cn('px-6 py-6', contentClassName)}>{children}</div>
    </div>
  )
}
