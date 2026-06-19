import { create } from 'zustand';
import type { Patient, Visit, PhotoAngle, PhotoAngleMap } from '@/types';
import { mockPatients, mockVisits } from '@/data/mockData';

interface VisitState {
  patients: Patient[];
  visits: Visit[];
  currentPatientId: string | null;
  currentVisitId: string | null;
  compareVisitId: string | null;
  selectedAngle: PhotoAngle | null;
  
  setCurrentPatient: (patientId: string) => void;
  setCurrentVisit: (visitId: string) => void;
  setCompareVisit: (visitId: string) => void;
  setSelectedAngle: (angle: PhotoAngle | null) => void;
  
  getPatientById: (id: string) => Patient | undefined;
  getVisitById: (id: string) => Visit | undefined;
  getVisitsByPatientId: (patientId: string) => Visit[];
  getCurrentVisit: () => Visit | undefined;
  getCompareVisit: () => Visit | undefined;
  
  updatePhoto: (visitId: string, angle: PhotoAngle, photoUrl: string) => void;
  removePhoto: (visitId: string, angle: PhotoAngle) => void;
  updateNotes: (visitId: string, notes: string) => void;
  completeVisit: (visitId: string) => void;
  
  getOrCreateTodayVisit: (patientId: string) => Visit;
}

export const useVisitStore = create<VisitState>((set, get) => ({
  patients: mockPatients,
  visits: mockVisits,
  currentPatientId: null,
  currentVisitId: null,
  compareVisitId: null,
  selectedAngle: 'front_smile',

  setCurrentPatient: (patientId) => set({ currentPatientId: patientId }),
  
  setCurrentVisit: (visitId) => set({ currentVisitId: visitId }),
  
  setCompareVisit: (visitId) => set({ compareVisitId: visitId }),
  
  setSelectedAngle: (angle) => set({ selectedAngle: angle }),

  getPatientById: (id) => get().patients.find(p => p.id === id),
  
  getVisitById: (id) => get().visits.find(v => v.id === id),
  
  getVisitsByPatientId: (patientId) => {
    return get().visits
      .filter(v => v.patientId === patientId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  },
  
  getCurrentVisit: () => {
    const { currentVisitId, visits } = get();
    return visits.find(v => v.id === currentVisitId);
  },
  
  getCompareVisit: () => {
    const { compareVisitId, visits } = get();
    return visits.find(v => v.id === compareVisitId);
  },

  updatePhoto: (visitId, angle, photoUrl) => {
    set(state => ({
      visits: state.visits.map(v => 
        v.id === visitId 
          ? { ...v, photos: { ...v.photos, [angle]: photoUrl } }
          : v
      ),
    }));
  },
  
  removePhoto: (visitId, angle) => {
    set(state => {
      const visit = state.visits.find(v => v.id === visitId);
      if (!visit) return state;
      
      const newPhotos: PhotoAngleMap = { ...visit.photos };
      delete newPhotos[angle];
      
      return {
        visits: state.visits.map(v => 
          v.id === visitId ? { ...v, photos: newPhotos } : v
        ),
      };
    });
  },
  
  updateNotes: (visitId, notes) => {
    set(state => ({
      visits: state.visits.map(v => 
        v.id === visitId ? { ...v, notes } : v
      ),
    }));
  },
  
  completeVisit: (visitId) => {
    set(state => ({
      visits: state.visits.map(v => 
        v.id === visitId ? { ...v, status: 'completed' as const } : v
      ),
    }));
  },

  getOrCreateTodayVisit: (patientId) => {
    const { visits, getVisitsByPatientId } = get();
    const today = new Date().toISOString().split('T')[0];
    
    const patientVisits = getVisitsByPatientId(patientId);
    const todayVisit = patientVisits.find(v => v.date === today && v.status === 'draft');
    
    if (todayVisit) {
      return todayVisit;
    }
    
    const maxVisitNumber = Math.max(...patientVisits.map(v => v.visitNumber), 0);
    const newVisit: Visit = {
      id: `visit-${Date.now()}`,
      patientId,
      date: today,
      visitNumber: maxVisitNumber + 1,
      status: 'draft',
      notes: '',
      photos: {},
    };
    
    set(state => ({
      visits: [...state.visits, newVisit],
    }));
    
    return newVisit;
  },
}));
