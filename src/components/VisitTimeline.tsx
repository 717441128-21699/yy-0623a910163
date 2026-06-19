import type { Visit } from '@/types';
import { Calendar, Clock, FileText, ChevronRight } from 'lucide-react';

interface VisitTimelineProps {
  visits: Visit[];
  currentVisitId: string;
  compareVisitId: string | null;
  onSelectCompare: (visitId: string) => void;
}

export default function VisitTimeline({
  visits,
  currentVisitId,
  compareVisitId,
  onSelectCompare,
}: VisitTimelineProps) {
  const sortedVisits = [...visits].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
      <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
        <Clock size={18} className="text-teal-600" />
        复诊记录
      </h3>

      <div className="relative">
        <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-slate-200" />

        <div className="space-y-3">
          {sortedVisits.map((visit, index) => {
            const isCurrent = visit.id === currentVisitId;
            const isCompare = visit.id === compareVisitId;
            const isInitial = visit.visitNumber === 0;

            return (
              <div key={visit.id} className="relative pl-10">
                <div
                  className={`
                    absolute left-2 top-2 w-5 h-5 rounded-full border-2 flex items-center justify-center
                    ${isCurrent
                      ? 'bg-teal-600 border-teal-600'
                      : isCompare
                      ? 'bg-amber-500 border-amber-500'
                      : 'bg-white border-slate-300'
                    }
                  `}
                >
                  {isCurrent && <div className="w-2 h-2 bg-white rounded-full" />}
                  {isCompare && !isCurrent && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>

                <div
                  className={`
                    p-3 rounded-lg cursor-pointer transition-all
                    ${isCurrent
                      ? 'bg-teal-50 border border-teal-200'
                      : isCompare
                      ? 'bg-amber-50 border border-amber-200'
                      : 'bg-slate-50 border border-transparent hover:bg-slate-100 hover:border-slate-200'
                    }
                  `}
                  onClick={() => !isCurrent && onSelectCompare(visit.id)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-800">
                        {isInitial ? '初诊' : `第${visit.visitNumber}次复诊`}
                      </span>
                      {isCurrent && (
                        <span className="text-xs px-2 py-0.5 bg-teal-600 text-white rounded-full">
                          当前
                        </span>
                      )}
                      {isCompare && !isCurrent && (
                        <span className="text-xs px-2 py-0.5 bg-amber-500 text-white rounded-full">
                          对比
                        </span>
                      )}
                    </div>
                    {!isCurrent && (
                      <ChevronRight size={16} className="text-slate-400" />
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500 mb-2">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {formatDate(visit.date)}
                    </span>
                    <span className="text-slate-400">·</span>
                    <span>{Object.keys(visit.photos).length}张照片</span>
                  </div>

                  {visit.notes && (
                    <div className="text-xs text-slate-600 line-clamp-2 flex items-start gap-1">
                      <FileText size={12} className="mt-0.5 flex-shrink-0 text-slate-400" />
                      <span>{visit.notes}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
