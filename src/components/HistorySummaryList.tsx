import { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  StickyNote,
  Image as ImageIcon,
  TrendingUp,
  AlertTriangle as AttentionIcon,
  Minus,
  FileCheck,
} from 'lucide-react';
import type { Visit, PhotoAngle, CompareConclusion, CompareVerdict } from '@/types';
import { ANGLE_LABELS, ANGLE_ORDER } from '@/types';

interface HistorySummaryListProps {
  visits: Visit[];
  getVisitById: (id: string) => Visit | undefined;
  onViewSummary?: (visitId: string) => void;
}

const verdictDisplay: Record<CompareVerdict, { label: string; color: string; icon: typeof TrendingUp }> = {
  improved: { label: '好转', color: 'text-emerald-600 bg-emerald-50', icon: TrendingUp },
  attention: { label: '需关注', color: 'text-amber-600 bg-amber-50', icon: AttentionIcon },
  stable: { label: '稳定', color: 'text-slate-600 bg-slate-100', icon: Minus },
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
};

const formatDateTime = (isoString: string) => {
  const date = new Date(isoString);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

export default function HistorySummaryList({
  visits,
  getVisitById,
  onViewSummary,
}: HistorySummaryListProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const sortedVisits = [...visits].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const toggleExpand = (visitId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(visitId)) {
        next.delete(visitId);
      } else {
        next.add(visitId);
      }
      return next;
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
      <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
        <FileCheck size={18} className="text-teal-600" />
        历史摘要
      </h3>

      <div className="space-y-2">
        {sortedVisits.map((visit) => {
          const isExpanded = expandedIds.has(visit.id);
          const isInitial = visit.visitNumber === 0;
          const visitLabel = isInitial ? '初诊' : `第${visit.visitNumber}次复诊`;
          const uploadedAngles = Object.keys(visit.photos) as PhotoAngle[];
          const approvedCount = uploadedAngles.filter(
            (a) => visit.photos[a]?.qualityStatus === 'approved'
          ).length;
          const retakeCount = uploadedAngles.filter(
            (a) => visit.photos[a]?.qualityStatus === 'retake'
          ).length;
          const hasConclusions = visit.conclusions.length > 0;

          return (
            <div key={visit.id} className="border border-slate-200 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleExpand(visit.id)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown size={16} className="text-slate-400" />
                  ) : (
                    <ChevronRight size={16} className="text-slate-400" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-800 text-sm">{visitLabel}</span>
                      {visit.status === 'completed' ? (
                        <span className="text-xs px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded">
                          已完成
                        </span>
                      ) : (
                        <span className="text-xs px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded">
                          草稿
                        </span>
                      )}
                      {hasConclusions && (
                        <span className="text-xs px-1.5 py-0.5 bg-teal-100 text-teal-700 rounded">
                          {visit.conclusions.length}条结论
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Calendar size={10} />
                        {formatDate(visit.date)}
                      </span>
                      <span>{uploadedAngles.length}张照片</span>
                      {visit.completedAt && (
                        <span className="flex items-center gap-1">
                          <Clock size={10} />
                          {formatDateTime(visit.completedAt)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {approvedCount > 0 && (
                    <span className="text-xs text-emerald-600 flex items-center gap-0.5">
                      <CheckCircle2 size={10} />
                      {approvedCount}
                    </span>
                  )}
                  {retakeCount > 0 && (
                    <span className="text-xs text-rose-500 flex items-center gap-0.5">
                      <AlertTriangle size={10} />
                      {retakeCount}
                    </span>
                  )}
                  {onViewSummary && visit.status === 'completed' && (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewSummary(visit.id);
                      }}
                      className="text-xs text-teal-600 hover:text-teal-700 font-medium px-2 py-0.5 rounded hover:bg-teal-50 transition-colors"
                    >
                      摘要
                    </span>
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-slate-100 space-y-3">
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-2 flex items-center gap-1">
                      <ImageIcon size={12} />
                      照片与质控
                    </p>
                    <div className="grid grid-cols-3 gap-1.5">
                      {ANGLE_ORDER.map((angle) => {
                        const photo = visit.photos[angle];
                        const status = photo?.qualityStatus;
                        let bgColor = 'bg-slate-100 text-slate-400';
                        let statusText = '缺失';

                        if (status === 'approved') {
                          bgColor = 'bg-emerald-50 text-emerald-700';
                          statusText = '合格';
                        } else if (status === 'retake') {
                          bgColor = 'bg-rose-50 text-rose-600';
                          statusText = '需重拍';
                        } else if (status === 'pending') {
                          bgColor = 'bg-amber-50 text-amber-600';
                          statusText = '待审';
                        }

                        return (
                          <div key={angle} className={`px-2 py-1.5 rounded text-xs ${bgColor}`}>
                            <span className="font-medium">{ANGLE_LABELS[angle]}</span>
                            <span className="ml-1 opacity-70">· {statusText}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {hasConclusions && (
                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-2 flex items-center gap-1">
                        <TrendingUp size={12} />
                        对比结论
                      </p>
                      <div className="space-y-1.5">
                        {visit.conclusions.map((conclusion, idx) => {
                          const compareVisit = getVisitById(conclusion.compareVisitId);
                          const compareLabel = compareVisit
                            ? compareVisit.visitNumber === 0
                              ? '初诊'
                              : `第${compareVisit.visitNumber}次`
                            : '';
                          const vd = conclusion.verdict
                            ? verdictDisplay[conclusion.verdict]
                            : null;
                          const VerdictIcon = vd?.icon;

                          return (
                            <div
                              key={idx}
                              className="flex items-start gap-2 p-2 bg-slate-50 rounded-lg"
                            >
                              <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
                                <span className="text-xs font-medium text-slate-600">
                                  {ANGLE_LABELS[conclusion.angle]}
                                </span>
                                <span className="text-xs text-slate-400">vs</span>
                                <span className="text-xs text-slate-500">{compareLabel}</span>
                              </div>
                              {vd && VerdictIcon && (
                                <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium flex-shrink-0 ${vd.color}`}>
                                  <VerdictIcon size={10} />
                                  {vd.label}
                                </span>
                              )}
                              {conclusion.description && (
                                <span className="text-xs text-slate-600 leading-relaxed">
                                  {conclusion.description}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {visit.notes && (
                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1">
                        <StickyNote size={12} />
                        医嘱
                      </p>
                      <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                        {visit.notes}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
