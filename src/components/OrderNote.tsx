import { useState } from 'react';
import { StickyNote, Plus, X, Save } from 'lucide-react';
import { quickOrderTemplates } from '@/data/mockData';

interface OrderNoteProps {
  notes: string;
  onNotesChange: (notes: string) => void;
  onSave?: () => void;
}

export default function OrderNote({ notes, onNotesChange, onSave }: OrderNoteProps) {
  const [activeTags, setActiveTags] = useState<string[]>([]);

  const handleTagClick = (tag: string) => {
    if (activeTags.includes(tag)) {
      setActiveTags(activeTags.filter((t) => t !== tag));
    } else {
      setActiveTags([...activeTags, tag]);
      
      const prefix = notes.length > 0 && !notes.endsWith('\n') ? '；' : '';
      const newNotes = notes + prefix + tag;
      onNotesChange(newNotes);
    }
  };

  const removeTag = (tag: string) => {
    setActiveTags(activeTags.filter((t) => t !== tag));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <StickyNote size={18} className="text-teal-600" />
          医嘱记录
        </h3>
        {onSave && (
          <button
            onClick={onSave}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors"
          >
            <Save size={14} />
            保存
          </button>
        )}
      </div>

      <div className="mb-4">
        <label className="text-sm font-medium text-slate-600 mb-2 block">常用医嘱</label>
        <div className="flex flex-wrap gap-2">
          {quickOrderTemplates.map((tag) => (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              className={`
                px-3 py-1.5 text-sm rounded-lg border transition-all flex items-center gap-1
                ${activeTags.includes(tag)
                  ? 'bg-teal-600 text-white border-teal-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-teal-400 hover:text-teal-600'
                }
              `}
            >
              <Plus size={14} />
              {tag}
            </button>
          ))}
        </div>
      </div>

      {activeTags.length > 0 && (
        <div className="mb-3">
          <label className="text-sm font-medium text-slate-600 mb-2 block">已添加</label>
          <div className="flex flex-wrap gap-2">
            {activeTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-teal-50 text-teal-700 text-sm rounded-lg border border-teal-200"
              >
                {tag}
                <button
                  onClick={() => removeTag(tag)}
                  className="text-teal-500 hover:text-teal-700"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="text-sm font-medium text-slate-600 mb-2 block">医嘱详情</label>
        <textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="请输入本次复诊医嘱，如：继续牵引，调整皮筋佩戴方式..."
          className="w-full h-32 px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700
            placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400
            transition-colors"
        />
        <div className="text-right text-xs text-slate-400 mt-1">
          {notes.length} 字
        </div>
      </div>
    </div>
  );
}
