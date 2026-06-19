import PhotoSlot from './PhotoSlot';
import type { PhotoAngle, PhotoAngleMap } from '@/types';
import { ANGLE_ORDER } from '@/types';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface PhotoGridProps {
  photos: PhotoAngleMap;
  selectedAngle: PhotoAngle | null;
  onUpload: (angle: PhotoAngle, file: File) => void;
  onRemove: (angle: PhotoAngle) => void;
  onSelectAngle: (angle: PhotoAngle) => void;
  showMissingWarning?: boolean;
}

export default function PhotoGrid({
  photos,
  selectedAngle,
  onUpload,
  onRemove,
  onSelectAngle,
  showMissingWarning = true,
}: PhotoGridProps) {
  const uploadedCount = Object.keys(photos).length;
  const totalCount = ANGLE_ORDER.length;
  const missingCount = totalCount - uploadedCount;
  const isComplete = missingCount === 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-800">标准位照片</h3>
        <div className="flex items-center gap-2">
          {isComplete ? (
            <span className="flex items-center gap-1 text-sm text-emerald-600 font-medium">
              <CheckCircle2 size={16} />
              已全部上传
            </span>
          ) : (
            <span className={`flex items-center gap-1 text-sm font-medium ${showMissingWarning ? 'text-amber-600' : 'text-slate-500'}`}>
              <AlertCircle size={16} />
              缺失 {missingCount} 张
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {ANGLE_ORDER.map((angle) => {
          const isMissing = showMissingWarning && !photos[angle];
          return (
            <PhotoSlot
              key={angle}
              angle={angle}
              photoUrl={photos[angle]}
              isMissing={isMissing}
              isSelected={selectedAngle === angle}
              onUpload={onUpload}
              onRemove={onRemove}
              onSelect={onSelectAngle}
            />
          );
        })}
      </div>
    </div>
  );
}
