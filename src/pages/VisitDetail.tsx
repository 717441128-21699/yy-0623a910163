import { useEffect, useCallback, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Calendar,
  Hash,
  Save,
  Printer,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import PhotoGrid from '@/components/PhotoGrid';
import CompareView from '@/components/CompareView';
import VisitTimeline from '@/components/VisitTimeline';
import OrderNote from '@/components/OrderNote';
import QuickCompareBar from '@/components/QuickCompareBar';
import VisitSummary from '@/components/VisitSummary';
import CompareConclusionBar from '@/components/CompareConclusionBar';
import HistorySummaryList from '@/components/HistorySummaryList';
import { useVisitStore } from '@/store/useVisitStore';
import type { PhotoAngle, PhotoQualityStatus, QuickCompareTarget, CompareConclusion } from '@/types';
import { ANGLE_LABELS } from '@/types';

export default function VisitDetail() {
  const { id: patientId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showQualityWarning, setShowQualityWarning] = useState(false);
  const [quickCompareTarget, setQuickCompareTarget] = useState<QuickCompareTarget>('initial');

  const {
    getPatientById,
    getVisitsByPatientId,
    getCurrentVisit,
    getCompareVisit,
    getInitialVisit,
    getPreviousVisit,
    getVisitById,
    getQualityIssues,
    getConclusionsForAngle,
    currentVisitId,
    compareVisitId,
    selectedAngle,
    showSummary,
    summaryVisitId,
    setCurrentVisit,
    setCompareVisit,
    setSelectedAngle,
    setShowSummary,
    updatePhoto,
    removePhoto,
    updatePhotoQuality,
    updateNotes,
    completeVisit,
    saveConclusion,
    removeConclusion,
    getOrCreateTodayVisit,
  } = useVisitStore();

  const patient = patientId ? getPatientById(patientId) : undefined;
  const patientVisits = patientId ? getVisitsByPatientId(patientId) : [];
  const currentVisit = getCurrentVisit();
  const compareVisit = getCompareVisit();
  const initialVisit = patientId ? getInitialVisit(patientId) : undefined;
  const previousVisit =
    patientId && currentVisitId ? getPreviousVisit(patientId, currentVisitId) : undefined;
  const summaryVisit = summaryVisitId ? getVisitById(summaryVisitId) : undefined;

  const hasInitial = !!initialVisit && Object.keys(initialVisit.photos).length > 0;
  const hasPrevious = !!previousVisit && Object.keys(previousVisit.photos).length > 0;
  const hasCurrentPhoto =
    !!currentVisit &&
    !!selectedAngle &&
    !!currentVisit.photos[selectedAngle as PhotoAngle];

  useEffect(() => {
    if (patientId) {
      const visit = getOrCreateTodayVisit(patientId);
      setCurrentVisit(visit.id);

      if (!compareVisitId) {
        const initial = patientVisits.find((v) => v.visitNumber === 0);
        if (initial) {
          setCompareVisit(initial.id);
        }
      }
    }
  }, [patientId]);

  const handleQuickCompareChange = useCallback(
    (target: QuickCompareTarget) => {
      setQuickCompareTarget(target);
      if (!patientId || !currentVisitId) return;

      if (target === 'initial' && initialVisit) {
        setCompareVisit(initialVisit.id);
      } else if (target === 'previous' && previousVisit) {
        setCompareVisit(previousVisit.id);
      } else if (target === 'current') {
        setCompareVisit(currentVisitId);
      }
    },
    [patientId, currentVisitId, initialVisit, previousVisit, setCompareVisit]
  );

  useEffect(() => {
    if (compareVisitId === currentVisitId) {
      setQuickCompareTarget('current');
    } else if (initialVisit && compareVisitId === initialVisit.id) {
      setQuickCompareTarget('initial');
    } else if (previousVisit && compareVisitId === previousVisit.id) {
      setQuickCompareTarget('previous');
    }
  }, [compareVisitId, currentVisitId, initialVisit, previousVisit]);

  const handleUpload = useCallback(
    (angle: PhotoAngle, file: File) => {
      if (!currentVisitId) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        updatePhoto(currentVisitId, angle, result);
      };
      reader.readAsDataURL(file);
    },
    [currentVisitId, updatePhoto]
  );

  const handleRemove = useCallback(
    (angle: PhotoAngle) => {
      if (!currentVisitId) return;
      removePhoto(currentVisitId, angle);
    },
    [currentVisitId, removePhoto]
  );

  const handleQualityChange = useCallback(
    (angle: PhotoAngle, status: PhotoQualityStatus) => {
      if (!currentVisitId) return;
      updatePhotoQuality(currentVisitId, angle, status);
    },
    [currentVisitId, updatePhotoQuality]
  );

  const handleNotesChange = useCallback(
    (notes: string) => {
      if (!currentVisitId) return;
      updateNotes(currentVisitId, notes);
    },
    [currentVisitId, updateNotes]
  );

  const qualityIssues = useMemo(() => {
    if (!currentVisitId) return { missing: [] as PhotoAngle[], retake: [] as PhotoAngle[] };
    return getQualityIssues(currentVisitId);
  }, [currentVisitId, getQualityIssues, currentVisit?.photos]);

  const handleSaveVisit = useCallback(() => {
    if (!currentVisitId) return;

    const { missing, retake } = qualityIssues;
    if (missing.length > 0 || retake.length > 0) {
      setShowQualityWarning(true);
      return;
    }

    completeVisit(currentVisitId);
    setShowQualityWarning(false);
    setShowSummary(true, currentVisitId);
  }, [currentVisitId, qualityIssues, completeVisit, setShowSummary]);

  const handleForceSave = useCallback(() => {
    if (!currentVisitId) return;
    completeVisit(currentVisitId);
    setShowQualityWarning(false);
    setShowSummary(true, currentVisitId);
  }, [currentVisitId, completeVisit, setShowSummary]);

  const handleCloseSummary = useCallback(() => {
    setShowSummary(false);
  }, [setShowSummary]);

  const handleViewSummary = useCallback(
    (visitId: string) => {
      setShowSummary(true, visitId);
    },
    [setShowSummary]
  );

  const handleSaveConclusion = useCallback(
    (conclusion: CompareConclusion) => {
      if (!currentVisitId) return;
      saveConclusion(currentVisitId, conclusion);
    },
    [currentVisitId, saveConclusion]
  );

  const handleRemoveConclusion = useCallback(
    (angle: PhotoAngle, compareVisitId: string) => {
      if (!currentVisitId) return;
      removeConclusion(currentVisitId, angle, compareVisitId);
    },
    [currentVisitId, removeConclusion]
  );

  const existingConclusion = useMemo(() => {
    if (!currentVisitId || !selectedAngle || !compareVisitId) return undefined;
    const conclusions = getConclusionsForAngle(currentVisitId, selectedAngle);
    return conclusions.find((c) => c.compareVisitId === compareVisitId);
  }, [currentVisitId, selectedAngle, compareVisitId, getConclusionsForAngle]);

  const isCurrentMode = compareVisitId === currentVisitId;

  const currentAnglePhotoItem = currentVisit?.photos?.[selectedAngle as PhotoAngle];
  const compareAnglePhotoItem = compareVisit?.photos?.[selectedAngle as PhotoAngle];
  const currentAnglePhoto = currentAnglePhotoItem?.url;
  const compareAnglePhoto = compareAnglePhotoItem?.url;

  const leftImage = isCurrentMode ? currentAnglePhoto : compareAnglePhoto;
  const rightImage = currentAnglePhoto;

  const currentLabel = currentVisit
    ? currentVisit.visitNumber === 0
      ? '初诊'
      : `第${currentVisit.visitNumber}次复诊（本次）`
    : '';

  const compareLabel = compareVisit
    ? compareVisit.visitNumber === 0
      ? '初诊'
      : `第${compareVisit.visitNumber}次复诊`
    : '';

  const leftLabel = isCurrentMode ? currentLabel : compareLabel;
  const rightLabel = currentLabel;

  const isCompleted = currentVisit?.status === 'completed';

  if (!patient) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500">患者不存在</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-1.5 text-slate-600 hover:text-slate-800 transition-colors"
              >
                <ArrowLeft size={20} />
                <span className="text-sm font-medium">返回列表</span>
              </button>

              <div className="w-px h-6 bg-slate-200" />

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
                  <User size={18} className="text-white" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-800">{patient.name}</h2>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>{patient.gender}</span>
                    <span className="text-slate-300">·</span>
                    <span>{patient.age}岁</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-teal-600 font-medium">{patient.stage}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-lg">
                <Hash size={14} className="text-slate-500" />
                <span className="text-sm text-slate-600">
                  第 {currentVisit?.visitNumber || 0} 次复诊
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-lg">
                <Calendar size={14} className="text-slate-500" />
                <span className="text-sm text-slate-600">
                  {currentVisit?.date || new Date().toISOString().split('T')[0]}
                </span>
              </div>
              {isCompleted && (
                <span className="flex items-center gap-1 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium">
                  <CheckCircle2 size={14} />
                  已完成
                </span>
              )}

              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
              >
                <Printer size={16} />
                打印
              </button>

              {!isCompleted && (
                <button
                  onClick={handleSaveVisit}
                  className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
                >
                  <Save size={16} />
                  保存复诊
                </button>
              )}
              {isCompleted && (
                <button
                  onClick={() => setShowSummary(true, currentVisitId || '')}
                  className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
                >
                  <CheckCircle2 size={16} />
                  查看摘要
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-4 space-y-6">
            <PhotoGrid
              photos={currentVisit?.photos || {}}
              selectedAngle={selectedAngle}
              onUpload={handleUpload}
              onRemove={handleRemove}
              onSelectAngle={setSelectedAngle}
              onQualityChange={handleQualityChange}
              showMissingWarning={!isCompleted}
              showQualityControls={!isCompleted}
            />

            <VisitTimeline
              visits={patientVisits}
              currentVisitId={currentVisitId || ''}
              compareVisitId={compareVisitId}
              onSelectCompare={setCompareVisit}
              onViewSummary={handleViewSummary}
            />

            <HistorySummaryList
              visits={patientVisits}
              getVisitById={getVisitById}
              onViewSummary={handleViewSummary}
            />
          </div>

          <div className="col-span-8 space-y-6">
            <QuickCompareBar
              currentTarget={quickCompareTarget}
              hasInitial={hasInitial}
              hasPrevious={hasPrevious}
              hasCurrentPhoto={hasCurrentPhoto}
              onChangeTarget={handleQuickCompareChange}
            />

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-800">
                  对比视图 -{' '}
                  <span className="text-teal-600">
                    {selectedAngle ? ANGLE_LABELS[selectedAngle] : '请选择角度'}
                  </span>
                </h3>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  {isCurrentMode ? (
                    <span className="text-amber-600 font-medium">查看模式：本次照片</span>
                  ) : (
                    <>
                      <CheckCircle2 size={14} className="text-teal-500" />
                      <span>左右拖动分割线对比</span>
                    </>
                  )}
                </div>
              </div>

              {leftImage && rightImage ? (
                <CompareView
                  leftImage={leftImage}
                  rightImage={rightImage}
                  leftLabel={leftLabel}
                  rightLabel={rightLabel}
                />
              ) : (
                <div className="aspect-[4/3] bg-slate-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-3 bg-slate-200 rounded-full flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <p className="text-slate-500 font-medium">
                      {!currentAnglePhoto && !compareAnglePhoto
                        ? '请先上传照片并选择对比的历史复诊'
                        : !currentAnglePhoto
                        ? '请先上传当前角度的照片'
                        : '请选择有照片的历史复诊进行对比'}
                    </p>
                    <p className="text-sm text-slate-400 mt-1">
                      点击左侧照片格选择要对比的角度
                    </p>
                  </div>
                </div>
              )}
            </div>

            {!isCurrentMode && (
              <CompareConclusionBar
                angle={selectedAngle}
                compareVisitId={compareVisitId}
                existingConclusion={existingConclusion}
                onSave={handleSaveConclusion}
                onRemove={handleRemoveConclusion}
                readOnly={isCompleted}
              />
            )}

            <OrderNote
              notes={currentVisit?.notes || ''}
              onNotesChange={handleNotesChange}
              onSave={!isCompleted ? handleSaveVisit : undefined}
            />
          </div>
        </div>
      </main>

      {showQualityWarning && (qualityIssues.missing.length > 0 || qualityIssues.retake.length > 0) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-5 bg-gradient-to-r from-amber-500 to-amber-600">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <AlertTriangle size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">照片质控提醒</h3>
                  <p className="text-sm text-amber-100">保存前请确认以下问题</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {qualityIssues.missing.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-rose-600 mb-2">缺失角度：</p>
                  <div className="flex flex-wrap gap-2">
                    {qualityIssues.missing.map((angle) => (
                      <span
                        key={angle}
                        className="px-3 py-1 bg-rose-50 text-rose-700 rounded-lg text-sm border border-rose-200"
                      >
                        {ANGLE_LABELS[angle]}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {qualityIssues.retake.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-amber-600 mb-2">需重拍：</p>
                  <div className="flex flex-wrap gap-2">
                    {qualityIssues.retake.map((angle) => (
                      <span
                        key={angle}
                        className="px-3 py-1 bg-amber-50 text-amber-700 rounded-lg text-sm border border-amber-200"
                      >
                        {ANGLE_LABELS[angle]}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <p className="text-sm text-slate-500">
                建议补拍后再保存，确保记录完整。您也可以选择强制保存。
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
              <button
                onClick={() => setShowQualityWarning(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 transition-colors"
              >
                返回修改
              </button>
              <button
                onClick={handleForceSave}
                className="px-5 py-2 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition-colors"
              >
                强制保存
              </button>
            </div>
          </div>
        </div>
      )}

      {showSummary && summaryVisit && patient && (
        <VisitSummary
          visit={summaryVisit}
          patient={patient}
          compareVisit={summaryVisit.compareVisitId ? getVisitById(summaryVisit.compareVisitId) : compareVisit}
          getVisitById={getVisitById}
          onClose={handleCloseSummary}
          onBackToEdit={!isCompleted ? () => setShowSummary(false) : undefined}
        />
      )}
    </div>
  );
}
