import {
  X,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  StickyNote,
  Image as ImageIcon,
  ArrowLeftRight,
  User,
  FileCheck,
  Hash,
  TrendingUp,
  Minus,
} from 'lucide-react';
import type { Visit, Patient, PhotoAngle, CompareConclusion, CompareVerdict } from '@/types';
import { ANGLE_LABELS, ANGLE_ORDER } from '@/types';

interface VisitSummaryProps {
  visit: Visit;
  patient: Patient;
  compareVisit?: Visit;
  getVisitById: (id: string) => Visit | undefined;
  onClose: () => void;
  onBackToEdit?: () => void;
}

const verdictDisplay: Record<CompareVerdict, { label: string; color: string; icon: typeof TrendingUp }> = {
  improved: { label: '好转', color: 'text-emerald-600 bg-emerald-50', icon: TrendingUp },
  attention: { label: '需关注', color: 'text-amber-600 bg-amber-50', icon: AlertTriangle },
  stable: { label: '稳定', color: 'text-slate-600 bg-slate-100', icon: Minus },
};

const formatDateTime = (isoString: string) => {
  const date = new Date(isoString);
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${String(
    date.getHours()
  ).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

export default function VisitSummary({
  visit,
  patient,
  compareVisit,
  getVisitById,
  onClose,
  onBackToEdit,
}: VisitSummaryProps) {
  const uploadedAngles = Object.keys(visit.photos) as PhotoAngle[];
  const approvedAngles = uploadedAngles.filter(
    (a) => visit.photos[a]?.qualityStatus === 'approved'
  );
  const retakeAngles = uploadedAngles.filter(
    (a) => visit.photos[a]?.qualityStatus === 'retake'
  );
  const pendingAngles = uploadedAngles.filter(
    (a) => visit.photos[a]?.qualityStatus === 'pending'
  );
  const missingAngles = ANGLE_ORDER.filter((a) => !visit.photos[a]);

  const visitLabel =
    visit.visitNumber === 0 ? '初诊记录' : `第${visit.visitNumber}次复诊记录`;
  const compareLabel = compareVisit
    ? compareVisit.visitNumber === 0
      ? '初诊'
      : `第${compareVisit.visitNumber}次复诊`
    : '未选择';

  const hasConclusions = visit.conclusions.length > 0;

  const getCompareLabel = (compareVisitId: string) => {
    const cv = getVisitById(compareVisitId);
    if (!cv) return '未知';
    return cv.visitNumber === 0 ? '初诊' : `第${cv.visitNumber}次复诊`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-teal-600 to-teal-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <FileCheck size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{visitLabel}摘要</h2>
              <p className="text-sm text-teal-100">
                {visit.status === 'completed' ? '复诊记录已归档' : '复诊记录'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-slate-500 text-xs mb-2">
                <User size={14} />
                患者信息
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {patient.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{patient.name}</p>
                  <p className="text-sm text-slate-500">
                    {patient.gender} · {patient.age}岁 · {patient.stage}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-slate-500 text-xs mb-2">
                <Calendar size={14} />
                复诊信息
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Hash size={14} className="text-slate-400" />
                  <span className="text-sm text-slate-700">{visitLabel}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-slate-400" />
                  <span className="text-sm text-slate-700">
                    {visit.completedAt
                      ? formatDateTime(visit.completedAt)
                      : formatDateTime(visit.date)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-slate-500 text-xs">
                <ImageIcon size={14} />
                照片上传情况
              </div>
              <span className="text-xs text-slate-400">
                共 {ANGLE_ORDER.length} 个标准位
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {ANGLE_ORDER.map((angle) => {
                const photo = visit.photos[angle];
                const status = photo?.qualityStatus;
                let statusColor = 'bg-slate-200 text-slate-400 border-slate-200';
                let statusText = '缺失';

                if (status === 'approved') {
                  statusColor = 'bg-emerald-100 text-emerald-700 border-emerald-200';
                  statusText = '合格';
                } else if (status === 'retake') {
                  statusColor = 'bg-rose-100 text-rose-700 border-rose-200';
                  statusText = '需重拍';
                } else if (status === 'pending') {
                  statusColor = 'bg-amber-100 text-amber-700 border-amber-200';
                  statusText = '待审核';
                }

                return (
                  <div
                    key={angle}
                    className={`p-2.5 rounded-lg border ${statusColor} bg-opacity-50`}
                  >
                    <p className="text-xs font-medium">{ANGLE_LABELS[angle]}</p>
                    <p className="text-xs mt-0.5 opacity-80">{statusText}</p>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-200">
              <span className="flex items-center gap-1 text-xs text-emerald-600">
                <CheckCircle2 size={12} />
                合格 {approvedAngles.length}
              </span>
              {pendingAngles.length > 0 && (
                <span className="flex items-center gap-1 text-xs text-amber-600">
                  <Clock size={12} />
                  待审 {pendingAngles.length}
                </span>
              )}
              {retakeAngles.length > 0 && (
                <span className="flex items-center gap-1 text-xs text-rose-600">
                  <AlertTriangle size={12} />
                  重拍 {retakeAngles.length}
                </span>
              )}
              {missingAngles.length > 0 && (
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <X size={12} />
                  缺失 {missingAngles.length}
                </span>
              )}
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-slate-500 text-xs mb-2">
              <ArrowLeftRight size={14} />
              对比对象
            </div>
            <div className="flex items-center gap-3">
              <div className="px-3 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium">
                {visitLabel}
              </div>
              <ArrowLeftRight size={16} className="text-slate-400" />
              <div className="px-3 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm font-medium">
                {compareLabel}
              </div>
            </div>
          </div>

          {hasConclusions && (
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-slate-500 text-xs mb-3">
                <TrendingUp size={14} />
                对比结论
              </div>
              <div className="space-y-2">
                {visit.conclusions.map((conclusion, idx) => {
                  const vd = conclusion.verdict ? verdictDisplay[conclusion.verdict] : null;
                  const VerdictIcon = vd?.icon;

                  return (
                    <div key={idx} className="flex items-start gap-2 p-2.5 bg-white rounded-lg">
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="text-xs font-medium text-slate-700">
                          {ANGLE_LABELS[conclusion.angle]}
                        </span>
                        <span className="text-xs text-slate-400">vs</span>
                        <span className="text-xs text-slate-500">
                          {getCompareLabel(conclusion.compareVisitId)}
                        </span>
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

          <div className="bg-slate-50 rounded-xl p-4">
            <div className="flex items-center gap-2 text-slate-500 text-xs mb-2">
              <StickyNote size={14} />
              医嘱记录
            </div>
            {visit.notes ? (
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {visit.notes}
              </p>
            ) : (
              <p className="text-sm text-slate-400 italic">暂无医嘱记录</p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
          {onBackToEdit && (
            <button
              onClick={onBackToEdit}
              className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 transition-colors"
            >
              返回修改
            </button>
          )}
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
}
