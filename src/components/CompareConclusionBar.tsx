import { useState, useEffect } from 'react';
import { MessageSquareText, TrendingUp, AlertTriangle, Minus, Save, X } from 'lucide-react';
import type { PhotoAngle, CompareConclusion, CompareVerdict } from '@/types';
import { ANGLE_LABELS } from '@/types';

interface CompareConclusionBarProps {
  angle: PhotoAngle | null;
  compareVisitId: string | null;
  existingConclusion: CompareConclusion | undefined;
  onSave: (conclusion: CompareConclusion) => void;
  onRemove: (angle: PhotoAngle, compareVisitId: string) => void;
  readOnly?: boolean;
}

const verdictConfig: Record<CompareVerdict, { label: string; color: string; activeColor: string; icon: typeof TrendingUp }> = {
  improved: { label: '好转', color: 'border-emerald-200 text-emerald-600 hover:bg-emerald-50', activeColor: 'bg-emerald-500 text-white border-emerald-500', icon: TrendingUp },
  attention: { label: '需关注', color: 'border-amber-200 text-amber-600 hover:bg-amber-50', activeColor: 'bg-amber-500 text-white border-amber-500', icon: AlertTriangle },
  stable: { label: '稳定', color: 'border-slate-200 text-slate-600 hover:bg-slate-50', activeColor: 'bg-slate-500 text-white border-slate-500', icon: Minus },
};

export default function CompareConclusionBar({
  angle,
  compareVisitId,
  existingConclusion,
  onSave,
  onRemove,
  readOnly = false,
}: CompareConclusionBarProps) {
  const [description, setDescription] = useState('');
  const [verdict, setVerdict] = useState<CompareVerdict | null>(null);

  useEffect(() => {
    if (existingConclusion) {
      setDescription(existingConclusion.description);
      setVerdict(existingConclusion.verdict);
    } else {
      setDescription('');
      setVerdict(null);
    }
  }, [existingConclusion, angle]);

  if (!angle || !compareVisitId) {
    return null;
  }

  const handleSave = () => {
    if (!verdict) return;
    const conclusion: CompareConclusion = {
      angle,
      compareVisitId,
      description,
      verdict,
      createdAt: existingConclusion?.createdAt || new Date().toISOString(),
    };
    onSave(conclusion);
  };

  const handleRemove = () => {
    if (angle && compareVisitId) {
      onRemove(angle, compareVisitId);
    }
  };

  const hasContent = description.trim() || verdict;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <MessageSquareText size={16} className="text-teal-600" />
          对比结论 - {ANGLE_LABELS[angle]}
        </h4>
        {existingConclusion && !readOnly && (
          <button
            onClick={handleRemove}
            className="text-xs text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1"
          >
            <X size={12} />
            清除
          </button>
        )}
      </div>

      <div className="flex gap-2 mb-3">
        {(Object.keys(verdictConfig) as CompareVerdict[]).map((v) => {
          const config = verdictConfig[v];
          const Icon = config.icon;
          const isActive = verdict === v;

          return (
            <button
              key={v}
              onClick={() => !readOnly && setVerdict(v)}
              disabled={readOnly}
              className={`
                flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-all
                ${isActive ? config.activeColor : config.color}
                ${readOnly ? 'cursor-default' : 'cursor-pointer'}
              `}
            >
              <Icon size={14} />
              {config.label}
            </button>
          );
        })}
      </div>

      <textarea
        value={description}
        onChange={(e) => !readOnly && setDescription(e.target.value)}
        readOnly={readOnly}
        placeholder="描述该角度的变化情况，如：前牙覆合改善、间隙关闭明显..."
        className={`
          w-full h-20 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-700
          placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400
          transition-colors ${readOnly ? 'bg-slate-50 cursor-default' : ''}
        `}
      />

      {!readOnly && hasContent && (
        <div className="flex items-center justify-end mt-2">
          <button
            onClick={handleSave}
            disabled={!verdict}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
              ${verdict
                ? 'bg-teal-600 text-white hover:bg-teal-700'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }
            `}
          >
            <Save size={14} />
            保存结论
          </button>
        </div>
      )}

      {existingConclusion && !readOnly && (
        <p className="text-xs text-slate-400 mt-2">
          已记录于 {new Date(existingConclusion.createdAt).toLocaleString('zh-CN')}
        </p>
      )}
    </div>
  );
}
