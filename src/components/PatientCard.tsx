import { User, Calendar, Clock, ChevronRight } from 'lucide-react';
import type { Patient } from '@/types';

interface PatientCardProps {
  patient: Patient;
  onStartVisit: (patientId: string) => void;
}

const statusConfig = {
  waiting: { label: '待接诊', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  in_progress: { label: '进行中', color: 'bg-teal-100 text-teal-700 border-teal-200' },
  completed: { label: '已完成', color: 'bg-slate-100 text-slate-600 border-slate-200' },
};

export default function PatientCard({ patient, onStartVisit }: PatientCardProps) {
  const status = patient.status || 'waiting';
  const statusInfo = statusConfig[status];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md hover:border-slate-300 transition-all duration-200 group">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center flex-shrink-0">
          <User size={24} className="text-white" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-lg font-semibold text-slate-800 truncate">
              {patient.name}
            </h3>
            <span className={`text-xs px-2.5 py-0.5 rounded-full border ${statusInfo.color} flex-shrink-0 ml-2`}>
              {statusInfo.label}
            </span>
          </div>

          <div className="flex items-center gap-3 text-sm text-slate-500 mb-3">
            <span>{patient.gender}</span>
            <span className="text-slate-300">·</span>
            <span>{patient.age}岁</span>
            <span className="text-slate-300">·</span>
            <span className="text-teal-600 font-medium">{patient.stage}</span>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400 mb-4">
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              初诊 {patient.firstVisitDate}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} />
              已复诊 {patient.visitCount} 次
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <span className="text-slate-500">预约时间：</span>
              <span className="font-medium text-slate-700">{patient.todayAppointment}</span>
            </div>

            <button
              onClick={() => onStartVisit(patient.id)}
              className="flex items-center gap-1 px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg
                hover:bg-teal-700 transition-colors group-hover:shadow-md"
            >
              {status === 'completed' ? '查看记录' : '开始复诊'}
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
