import { useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Calendar, Hash, Save, Printer, CheckCircle2 } from 'lucide-react';
import PhotoGrid from '@/components/PhotoGrid';
import CompareView from '@/components/CompareView';
import VisitTimeline from '@/components/VisitTimeline';
import OrderNote from '@/components/OrderNote';
import { useVisitStore } from '@/store/useVisitStore';
import type { PhotoAngle } from '@/types';
import { ANGLE_LABELS } from '@/types';

export default function VisitDetail() {
  const { id: patientId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    getPatientById,
    getVisitsByPatientId,
    getCurrentVisit,
    getCompareVisit,
    currentVisitId,
    compareVisitId,
    selectedAngle,
    setCurrentVisit,
    setCompareVisit,
    setSelectedAngle,
    updatePhoto,
    removePhoto,
    updateNotes,
    completeVisit,
    getOrCreateTodayVisit,
  } = useVisitStore();

  const patient = patientId ? getPatientById(patientId) : undefined;
  const patientVisits = patientId ? getVisitsByPatientId(patientId) : [];
  const currentVisit = getCurrentVisit();
  const compareVisit = getCompareVisit();

  useEffect(() => {
    if (patientId) {
      const visit = getOrCreateTodayVisit(patientId);
      setCurrentVisit(visit.id);

      if (!compareVisitId) {
        const initialVisit = patientVisits.find((v) => v.visitNumber === 0);
        if (initialVisit) {
          setCompareVisit(initialVisit.id);
        }
      }
    }
  }, [patientId]);

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

  const handleNotesChange = useCallback(
    (notes: string) => {
      if (!currentVisitId) return;
      updateNotes(currentVisitId, notes);
    },
    [currentVisitId, updateNotes]
  );

  const handleSaveVisit = useCallback(() => {
    if (!currentVisitId) return;
    completeVisit(currentVisitId);
    alert('复诊记录已保存！');
  }, [currentVisitId, completeVisit]);

  const currentAnglePhoto = currentVisit?.photos?.[selectedAngle as PhotoAngle];
  const compareAnglePhoto = compareVisit?.photos?.[selectedAngle as PhotoAngle];

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

              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
              >
                <Printer size={16} />
                打印
              </button>

              <button
                onClick={handleSaveVisit}
                className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
              >
                <Save size={16} />
                保存复诊
              </button>
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
              showMissingWarning={true}
            />

            <VisitTimeline
              visits={patientVisits}
              currentVisitId={currentVisitId || ''}
              compareVisitId={compareVisitId}
              onSelectCompare={setCompareVisit}
            />
          </div>

          <div className="col-span-8 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-800">
                  对比视图 -{' '}
                  <span className="text-teal-600">
                    {selectedAngle ? ANGLE_LABELS[selectedAngle] : '请选择角度'}
                  </span>
                </h3>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <CheckCircle2 size={14} className="text-teal-500" />
                  <span>左右拖动分割线对比</span>
                </div>
              </div>

              {currentAnglePhoto && compareAnglePhoto ? (
                <CompareView
                  leftImage={compareAnglePhoto}
                  rightImage={currentAnglePhoto}
                  leftLabel={compareLabel}
                  rightLabel={currentLabel}
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

            <OrderNote
              notes={currentVisit?.notes || ''}
              onNotesChange={handleNotesChange}
              onSave={handleSaveVisit}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
