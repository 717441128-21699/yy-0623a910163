import { useState, useRef, useEffect, useCallback } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Move } from 'lucide-react';

interface CompareViewProps {
  leftImage: string;
  rightImage: string;
  leftLabel: string;
  rightLabel: string;
}

export default function CompareView({
  leftImage,
  rightImage,
  leftLabel,
  rightLabel,
}: CompareViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [splitPosition, setSplitPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0, startX: 0, startY: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = (x / rect.width) * 100;
      setSplitPosition(Math.max(5, Math.min(95, percentage)));
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
    }
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging || !containerRef.current || e.touches.length !== 1) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = e.touches[0].clientX - rect.left;
      const percentage = (x / rect.width) * 100;
      setSplitPosition(Math.max(5, Math.min(95, percentage)));
    },
    [isDragging]
  );

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale((prev) => Math.max(0.5, Math.min(4, prev + delta)));
  }, []);

  const handlePanStart = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 0 && scale > 1) {
        setIsPanning(true);
        panStartRef.current = {
          x: e.clientX,
          y: e.clientY,
          startX: position.x,
          startY: position.y,
        };
      }
    },
    [scale, position]
  );

  const handlePanMove = useCallback(
    (e: MouseEvent) => {
      if (!isPanning) return;
      const dx = e.clientX - panStartRef.current.x;
      const dy = e.clientY - panStartRef.current.y;
      setPosition({
        x: panStartRef.current.startX + dx,
        y: panStartRef.current.startY + dy,
      });
    },
    [isPanning]
  );

  const handlePanEnd = useCallback(() => {
    setIsPanning(false);
  }, []);

  useEffect(() => {
    if (isPanning) {
      document.addEventListener('mousemove', handlePanMove);
      document.addEventListener('mouseup', handlePanEnd);
    }
    return () => {
      document.removeEventListener('mousemove', handlePanMove);
      document.removeEventListener('mouseup', handlePanEnd);
    };
  }, [isPanning, handlePanMove, handlePanEnd]);

  const resetView = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const zoomIn = () => setScale((prev) => Math.min(4, prev + 0.25));
  const zoomOut = () => setScale((prev) => Math.max(0.5, prev - 0.25));

  const imageTransform = `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-600">对比视图</span>
            <span className="text-xs text-slate-400">{Math.round(scale * 100)}%</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={zoomOut}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            title="缩小"
          >
            <ZoomOut size={18} />
          </button>
          <button
            onClick={resetView}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            title="重置视图"
          >
            <RotateCcw size={18} />
          </button>
          <button
            onClick={zoomIn}
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            title="放大"
          >
            <ZoomIn size={18} />
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className={`relative aspect-[4/3] bg-slate-900 overflow-hidden ${scale > 1 ? (isPanning ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'}`}
        onMouseDown={handlePanStart}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ overflow: 'hidden' }}
        >
          <img
            src={rightImage}
            alt={rightLabel}
            className="max-w-full max-h-full object-contain select-none"
            style={{ transform: imageTransform, transformOrigin: 'center center' }}
            draggable={false}
          />
        </div>

        <div
          className="absolute inset-y-0 left-0 overflow-hidden"
          style={{ width: `${splitPosition}%` }}
        >
          <div className="absolute inset-0 flex items-center justify-center" style={{ width: `${100 * 100 / splitPosition}%` }}>
            <img
              src={leftImage}
              alt={leftLabel}
              className="max-w-full max-h-full object-contain select-none"
              style={{ transform: imageTransform, transformOrigin: 'center center' }}
              draggable={false}
            />
          </div>
        </div>

        <div
          className={`absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-ew-resize z-10 transition-opacity ${isDragging ? 'opacity-100' : 'opacity-80 hover:opacity-100'}`}
          style={{ left: `${splitPosition}%`, transform: 'translateX(-50%)' }}
          onMouseDown={handleMouseDown}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center">
            <div className="flex gap-1">
              <div className="w-0.5 h-5 bg-slate-300 rounded-full" />
              <div className="w-0.5 h-5 bg-slate-300 rounded-full" />
            </div>
          </div>
        </div>

        <div className="absolute top-3 left-3 px-3 py-1.5 bg-black/60 text-white text-sm font-medium rounded-lg backdrop-blur-sm">
          {leftLabel}
        </div>
        <div className="absolute top-3 right-3 px-3 py-1.5 bg-black/60 text-white text-sm font-medium rounded-lg backdrop-blur-sm">
          {rightLabel}
        </div>

        {scale > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 bg-black/60 text-white text-xs rounded-lg backdrop-blur-sm">
            <Move size={14} />
            拖拽平移查看细节
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 text-center text-sm text-slate-500 py-3 border-t border-slate-100">
        <div className="border-r border-slate-100">
          <span className="font-medium text-slate-700">{leftLabel}</span>
        </div>
        <div>
          <span className="font-medium text-slate-700">{rightLabel}</span>
        </div>
      </div>
    </div>
  );
}
