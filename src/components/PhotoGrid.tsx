import PhotoSlot from './PhotoSlot';
import type { PhotoAngle, PhotoAngleMap, PhotoQualityStatus } from '@/types';
import { ANGLE_ORDER, ANGLE_LABELS } from '@/types';
import { AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react';

interface PhotoGridProps {
  photos: PhotoAngleMap;
  selectedAngle: PhotoAngle | null;
  onUpload: (angle: PhotoAngle, file: File) => void;
  onRemove: (angle: PhotoAngle) => void;
  onSelectAngle: (angle: PhotoAngle) => void;
  onQualityChange?: (angle: PhotoAngle, status: PhotoQualityStatus) => void;
  showMissingWarning?: boolean;
  showQualityControls?: boolean;
}

export default function PhotoGrid({
  photos,
  selectedAngle,
  onUpload,
  onRemove,
  onSelectAngle,
  onQualityChange,
  showMissingWarning = true,
  showQualityControls = true,
}: PhotoGridProps) {
  const uploadedAngles = Object.keys(photos) as PhotoAngle[];
  const uploadedCount = uploadedAngles.length;
  const totalCount = ANGLE_ORDER.length;
  const missingCount = totalCount - uploadedCount;

  const retakeAngles = uploadedAngles.filter((a) => photos[a]?.qualityStatus === 'retake');
  const pendingAngles = uploadedAngles.filter((a) => photos[a]?.qualityStatus === 'pending');
  const approvedCount = uploadedAngles.filter((a) => photos[a]?.qualityStatus === 'approved').length;

  const hasIssues = missingCount > 0 || retakeAngles.length > 0;
  const isAllGood = approvedCount === totalCount;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-800">标准位照片</h3>
        <div className="flex items-center gap-3">
          {isAllGood ? (
            <span className="flex items-center gap-1 text-sm text-emerald-600 font-medium">
              <CheckCircle2 size={16} />
              全部合格
            </span>
          ) : (
            <div className="flex items-center gap-2 text-sm">
              {approvedCount > 0 && (
                <span className="flex items-center gap-1 text-emerald-600 font-medium">
                  <CheckCircle2 size={14} />
                  {approvedCount}合格
                </span>
              )}
              {pendingAngles.length > 0 && (
                <span className="flex items-center gap-1 text-amber-600 font-medium">
                  <AlertCircle size={14} />
                  {pendingAngles.length}待审
                </span>
              )}
              {retakeAngles.length > 0 && (
                <span className="flex items-center gap-1 text-rose-600 font-medium">
                  <AlertTriangle size={14} />
                  {retakeAngles.length}重拍
                </span>
              )}
              {missingCount > 0 && showMissingWarning && (
                <span className="flex items-center gap-1 text-red-600 font-medium">
                  <AlertCircle size={14} />
                  {missingCount}缺失
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {hasIssues && showMissingWarning && (
        <div className={`mb-4 p-3 rounded-lg border ${
          retakeAngles.length > 0
            ? 'bg-rose-50 border-rose-200'
            : 'bg-amber-50 border-amber-200'
        }`}>
          <div className="flex items-start gap-2">
            <AlertTriangle
              size={16}
              className={`mt-0.5 flex-shrink-0 ${retakeAngles.length > 0 ? 'text-rose-500' : 'text-amber-500'}`}
            />
            <div className="text-sm">
              {missingCount > 0 && (
                <div className="mb-1">
                  <span className={`font-medium ${retakeAngles.length > 0 ? 'text-rose-700' : 'text-amber-700'}`}>
                    缺失角度：
                  </span>
                  <span className="text-slate-700">
                    {missingCount > 0
                      ? ANGLE_ORDER.filter((a) => !photos[a]).map((a) => ANGLE_LABELS[a]).join('、')
                      : '无'}
                  </span>
                </div>
              )}
              {retakeAngles.length > 0 && (
                <div>
                  <span className="font-medium text-rose-700">需重拍：</span>
                  <span className="text-slate-700">
                    {retakeAngles.map((a) => ANGLE_LABELS[a]).join('、')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        {ANGLE_ORDER.map((angle) => {
          const photo = photos[angle];
          const isMissing = showMissingWarning && !photo;
          const isRetake = photo?.qualityStatus === 'retake';
          return (
            <PhotoSlot
              key={angle}
              angle={angle}
              photo={photo}
              isMissing={isMissing}
              isRetake={isRetake}
              isSelected={selectedAngle === angle}
              onUpload={onUpload}
              onRemove={onRemove}
              onSelect={onSelectAngle}
              onQualityChange={onQualityChange}
              showQualityControls={showQualityControls}
            />
          );
        })}
      </div>
    </div>
  );
}
