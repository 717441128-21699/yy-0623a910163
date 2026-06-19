import type { QuickCompareTarget } from '@/types';
import { CalendarDays, ArrowLeftRight, Clock } from 'lucide-react';

interface QuickCompareBarProps {
  patientId: string;
  currentVisitId: string;
  currentTarget: QuickCompareTarget;
  hasInitial: boolean;
  hasPrevious: boolean;
  onChangeTarget: (target: QuickCompareTarget) => void;
}

const targetConfig: Record<QuickCompareTarget, { label: string; icon: typeof CalendarDays; description: string }> = {
  initial: { label: '初诊', icon: CalendarDays, description: '治疗开始时' },
  previous: { label: '上次复诊', icon: Clock, description: '最近一次记录' },
  current: { label: '本次', icon: ArrowLeftRight, description: '左右互相比对' },
};

export default function QuickCompareBar({
  currentTarget,
  hasInitial,
  hasPrevious,
  onChangeTarget,
}: QuickCompareBarProps) {
  const targets: QuickCompareTarget[] = ['initial', 'previous', 'current'];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-slate-700">快捷对比</h4>
        <span className="text-xs text-slate-400">快速切换左侧对比对象</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {targets.map((target) => {
          const config = targetConfig[target];
          const Icon = config.icon;
          const isActive = currentTarget === target;
          const isDisabled = target !== 'current' && (
            (target === 'initial' && !hasInitial) ||
            (target === 'previous' && !hasPrevious)
          );

          return (
            <button
              key={target}
              onClick={() => !isDisabled && onChangeTarget(target)}
              disabled={isDisabled}
              className={`
                relative p-3 rounded-lg border-2 transition-all text-left
                ${isActive
                  ? 'border-teal-500 bg-teal-50'
                  : isDisabled
                  ? 'border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed'
                  : 'border-slate-200 bg-white hover:border-teal-300 hover:bg-teal-50/50'
                }
              `}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon
                  size={16}
                  className={isActive ? 'text-teal-600' : isDisabled ? 'text-slate-400' : 'text-slate-500'}
                />
                <span
                  className={`text-sm font-semibold ${
                    isActive ? 'text-teal-700' : isDisabled ? 'text-slate-400' : 'text-slate-700'
                  }`}
                >
                  {config.label}
                </span>
              </div>
              <p className={`text-xs ${isActive ? 'text-teal-600' : 'text-slate-400'}`}>
                {isDisabled ? '暂无数据' : config.description}
              </p>
              {isActive && (
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-teal-500" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
