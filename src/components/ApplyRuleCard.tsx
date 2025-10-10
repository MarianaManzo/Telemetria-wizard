import type { ReactNode } from 'react';
import { cn } from './ui/utils';

interface ApplyRuleCardProps {
  icon: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  question?: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export function ApplyRuleCard({ icon, title, description, question, action, children, className }: ApplyRuleCardProps) {
  return (
    <div className={cn('border border-gray-200 bg-white overflow-hidden shadow-[0_8px_24px_rgba(15,23,42,0.06)]', className)} style={{ borderRadius: 20 }}>
      <div className="bg-[#F5F6F7] px-6 py-5 flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-700">
          {icon}
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[18px] font-semibold text-gray-900 leading-6">{title}</span>
          {description ? <span className="text-[14px] text-gray-600 leading-5">{description}</span> : null}
        </div>
      </div>

      <div className="px-6 py-6 bg-white space-y-6">
        {(question || action) && (
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            {question ? <span className="text-[15px] font-semibold text-[#1F2937] leading-6">{question}</span> : null}
            {action ? <div className="w-full md:max-w-sm">{action}</div> : null}
          </div>
        )}

        {children}
      </div>
    </div>
  );
}

export default ApplyRuleCard;
