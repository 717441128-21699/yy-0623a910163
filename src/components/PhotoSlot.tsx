import { useRef } from 'react';
import { Camera, X, Upload, CheckCircle, RotateCcw, Clock } from 'lucide-react';
import type { PhotoAngle, PhotoItem, PhotoQualityStatus } from '@/types';
import { ANGLE_LABELS } from '@/types';

interface PhotoSlotProps {
  angle: PhotoAngle;
  photo?: PhotoItem;
  isMissing?: boolean;
  isRetake?: boolean;
  isSelected?: boolean;
  onUpload: (angle: PhotoAngle, file: File) => void;
  onRemove: (angle: PhotoAngle) => void;
  onSelect?: (angle: PhotoAngle) => void;
  onQualityChange?: (angle: PhotoAngle, status: PhotoQualityStatus) => void;
  showQualityControls?: boolean;
}

const qualityConfig: Record<PhotoQualityStatus, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: '待审核', color: 'text-amber-500 bg-amber-50 border-amber-200', icon: Clock },
  approved: { label: '合格', color: 'text-emerald-600 bg-emerald-50 border-emerald-200', icon: CheckCircle },
  retake: { label: '需重拍', color: 'text-rose-600 bg-rose-50 border-rose-200', icon: RotateCcw },
};

export default function PhotoSlot({
  angle,
  photo,
  isMissing,
  isRetake,
  isSelected,
  onUpload,
  onRemove,
  onSelect,
  onQualityChange,
  showQualityControls = true,
}: PhotoSlotProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasPhoto = !!photo;
  const qualityStatus = photo?.qualityStatus || 'pending';
  const QualityIcon = qualityConfig[qualityStatus].icon;

  const handleClick = () => {
    if (hasPhoto) {
      onSelect?.(angle);
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(angle, file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove(angle);
  };

  const handleQualityClick = (e: React.MouseEvent, status: PhotoQualityStatus) => {
    e.stopPropagation();
    onQualityChange?.(angle, status);
  };

  const needsAttention = isMissing || isRetake;

  return (
    <div
      className={`
        relative aspect-[4/3] rounded-lg overflow-hidden cursor-pointer
        transition-all duration-200 group
        ${isSelected ? 'ring-2 ring-teal-600 ring-offset-2' : ''}
        ${isMissing && !hasPhoto ? 'ring-2 ring-red-500 ring-offset-1' : ''}
        ${isRetake && hasPhoto ? 'ring-2 ring-rose-500 ring-offset-1' : ''}
        ${hasPhoto ? 'bg-slate-100' : 'bg-slate-200 hover:bg-slate-300'}
      `}
      onClick={handleClick}
    >
      {hasPhoto ? (
        <>
          <img
            src={photo.url}
            alt={ANGLE_LABELS[angle]}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 left-2 flex gap-1.5">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded border ${qualityConfig[qualityStatus].color}`}>
              <QualityIcon size={12} />
              {qualityConfig[qualityStatus].label}
            </span>
          </div>

          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full
              flex items-center justify-center opacity-0 group-hover:opacity-100
              transition-opacity duration-200 hover:bg-red-600"
          >
            <X size={16} />
          </button>

          {showQualityControls && (
            <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={(e) => handleQualityClick(e, 'approved')}
                className={`p-1.5 rounded-md transition-colors ${
                  qualityStatus === 'approved'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white/90 text-emerald-600 hover:bg-emerald-50'
                }`}
                title="标记合格"
              >
                <CheckCircle size={14} />
              </button>
              <button
                onClick={(e) => handleQualityClick(e, 'retake')}
                className={`p-1.5 rounded-md transition-colors ${
                  qualityStatus === 'retake'
                    ? 'bg-rose-500 text-white'
                    : 'bg-white/90 text-rose-600 hover:bg-rose-50'
                }`}
                title="需重拍"
              >
                <RotateCcw size={14} />
              </button>
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-2 pointer-events-none">
            <span className="text-white text-sm font-medium">{ANGLE_LABELS[angle]}</span>
          </div>
        </>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={`
            w-16 h-16 rounded-full flex items-center justify-center mb-2
            ${needsAttention ? 'bg-red-100 text-red-500' : 'bg-slate-100 text-slate-400'}
          `}>
            {needsAttention ? <Camera size={28} /> : <Upload size={28} />}
          </div>
          <span className={`text-sm font-medium ${needsAttention ? 'text-red-500' : 'text-slate-500'}`}>
            {ANGLE_LABELS[angle]}
          </span>
          <span className="text-xs text-slate-400 mt-1">
            {isMissing ? '缺失，请补充' : isRetake ? '需重拍' : '点击上传'}
          </span>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
