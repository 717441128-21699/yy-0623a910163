import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Calendar, UserCircle, Settings, Bell } from 'lucide-react';
import PatientCard from '@/components/PatientCard';
import { useVisitStore } from '@/store/useVisitStore';

export default function PatientList() {
  const navigate = useNavigate();
  const { patients, getOrCreateTodayVisit, setCurrentVisit, setCompareVisit, getVisitsByPatientId } = useVisitStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return `${date.getMonth() + 1}月${date.getDate()}日 ${weekdays[date.getDay()]}`;
  };

  const handleStartVisit = (patientId: string) => {
    const visit = getOrCreateTodayVisit(patientId);
    setCurrentVisit(visit.id);
    
    const patientVisits = getVisitsByPatientId(patientId);
    const initialVisit = patientVisits.find(v => v.visitNumber === 0);
    if (initialVisit) {
      setCompareVisit(initialVisit.id);
    }
    
    navigate(`/patient/${patientId}`);
  };

  const waitingCount = patients.filter(p => p.status === 'waiting').length;
  const inProgressCount = patients.filter(p => p.status === 'in_progress').length;
  const completedCount = patients.filter(p => p.status === 'completed').length;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-teal-500 to-teal-700 rounded-lg flex items-center justify-center">
                <UserCircle size={22} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800">正畸复诊工作台</h1>
                <p className="text-xs text-slate-400">Orthodontic Follow-up Workstation</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg text-slate-700
                    focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400"
                />
              </div>

              <button className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>

              <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                <Settings size={20} />
              </button>

              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center">
                <span className="text-white text-sm font-medium">医</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                今日预约 <span className="text-teal-600">{patients.length}</span> 位患者
              </h2>
              <p className="text-sm text-slate-500 mt-1">{formatDate(selectedDate)}</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-slate-600">待接诊 {waitingCount}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                <span className="text-slate-600">进行中 {inProgressCount}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                <span className="text-slate-600">已完成 {completedCount}</span>
              </div>
            </div>
          </div>

          <div className="relative max-w-md">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="搜索患者姓名..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 placeholder:text-slate-400
                focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPatients.map((patient) => (
            <PatientCard
              key={patient.id}
              patient={patient}
              onStartVisit={handleStartVisit}
            />
          ))}
        </div>

        {filteredPatients.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
              <Search size={28} className="text-slate-400" />
            </div>
            <p className="text-slate-500">未找到匹配的患者</p>
          </div>
        )}
      </main>
    </div>
  );
}
