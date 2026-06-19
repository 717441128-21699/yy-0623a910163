import { useRef } from 'react';
import { Camera, X, Upload } from 'lucide-react';
import type { PhotoAngle } from '@/types';
import { ANGLE_LABELS } from '@/types';

interface PhotoSlotProps {
  angle: PhotoAngle;
  photoUrl?: string;
  isMissing?: boolean;
  isSelected?: boolean;
  onUpload: (angle: PhotoAngle, file: File) => void;
  onRemove: (angle: PhotoAngle) => void;
  onSelect?: (angle: PhotoAngle) => void;
}

export default function PhotoSlot({
  angle,
  photoUrl,
  isMissing,
  isSelected,
  onUpload,
  onRemove,
  onSelect,
}: PhotoSlotProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (photoUrl) {
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

  return (
    <div
      className={`
        relative aspect-[4/3] rounded-lg overflow-hidden cursor-pointer
        transition-all duration-200 group
        ${isSelected ? 'ring-2 ring-teal-600 ring-offset-2' : ''}
        ${isMissing && !photoUrl ? 'ring-2 ring-red-500 ring-offset-1' : ''}
        ${photoUrl ? 'bg-slate-100' : 'bg-slate-200 hover:bg-slate-300'}
      `}
      onClick={handleClick}
    >
      {photoUrl ? (
        <>
          <img
            src={photoUrl}
            alt={ANGLE_LABELS[angle]}
            className="w-full h-full object-cover"
          />
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full
              flex items-center justify-center opacity-0 group-hover:opacity-100
              transition-opacity duration-200 hover:bg-red-600"
          >
            <X size={16} />
          </button>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
            <span className="text-white text-sm font-medium">{ANGLE_LABELS[angle]}</span>
          </div>
        </>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className={`
            w-16 h-16 rounded-full flex items-center justify-center mb-2
            ${isMissing ? 'bg-red-100 text-red-500' : 'bg-slate-100 text-slate-400'}
          `}>
            {isMissing ? <Camera size={28} /> : <Upload size={28} />}
          </div>
          <span className={`text-sm font-medium ${isMissing ? 'text-red-500' : 'text-slate-500'}`}>
            {ANGLE_LABELS[angle]}
          </span>
          <span className="text-xs text-slate-400 mt-1">
            {isMissing ? '缺失，请补充' : '点击上传'}
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
