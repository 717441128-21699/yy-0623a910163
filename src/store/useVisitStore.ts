import { create } from 'zustand';
import type { Patient, Visit, PhotoAngle, PhotoAngleMap, PhotoQualityStatus, PhotoItem } from '@/types';
import { mockPatients, mockVisits } from '@/data/mockData';

const STORAGE_KEY = 'ortho-visit-workstation-data';

interface PersistedData {
  visits: Visit[];
  patients: Patient[];
}

const loadFromStorage = (): PersistedData | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    console.warn('Failed to load from localStorage');
  }
  return null;
};

const saveToStorage = (data: PersistedData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    console.warn('Failed to save to localStorage');
  }
};

const getInitialData = (): PersistedData => {
  const stored = loadFromStorage();
  if (stored && stored.visits && stored.patients) {
    return stored;
  }
  return {
    patients: mockPatients,
    visits: mockVisits,
  };
};

const initialData = getInitialData();

interface VisitState {
  patients: Patient[];
  visits: Visit[];
  currentPatientId: string | null;
  currentVisitId: string | null;
  compareVisitId: string | null;
  selectedAngle: PhotoAngle | null;
  showSummary: boolean;
  summaryVisitId: string | null;

  setCurrentPatient: (patientId: string) => void;
  setCurrentVisit: (visitId: string) => void;
  setCompareVisit: (visitId: string) => void;
  setSelectedAngle: (angle: PhotoAngle | null) => void;
  setShowSummary: (show: boolean, visitId?: string) => void;

  persist: () => void;

  getPatientById: (id: string) => Patient | undefined;
  getVisitById: (id: string) => Visit | undefined;
  getVisitsByPatientId: (patientId: string) => Visit[];
  getCurrentVisit: () => Visit | undefined;
  getCompareVisit: () => Visit | undefined;

  getInitialVisit: (patientId: string) => Visit | undefined;
  getPreviousVisit: (patientId: string, currentVisitId: string) => Visit | undefined;

  updatePhoto: (visitId: string, angle: PhotoAngle, photoUrl: string) => void;
  removePhoto: (visitId: string, angle: PhotoAngle) => void;
  updatePhotoQuality: (visitId: string, angle: PhotoAngle, status: PhotoQualityStatus) => void;
  updateNotes: (visitId: string, notes: string) => void;
  setCompareVisitForRecord: (visitId: string, compareVisitId: string) => void;
  completeVisit: (visitId: string) => void;

  getOrCreateTodayVisit: (patientId: string) => Visit;

  getQualityIssues: (visitId: string) => { missing: PhotoAngle[]; retake: PhotoAngle[] };
}

export const useVisitStore = create<VisitState>((set, get) => ({
  patients: initialData.patients,
  visits: initialData.visits,
  currentPatientId: null,
  currentVisitId: null,
  compareVisitId: null,
  selectedAngle: 'front_smile',
  showSummary: false,
  summaryVisitId: null,

  setCurrentPatient: (patientId) => set({ currentPatientId: patientId }),

  setCurrentVisit: (visitId) => set({ currentVisitId: visitId }),

  setCompareVisit: (visitId) => {
    set({ compareVisitId: visitId });
    const { currentVisitId, setCompareVisitForRecord } = get();
    if (currentVisitId) {
      setCompareVisitForRecord(currentVisitId, visitId);
    }
  },

  setSelectedAngle: (angle) => set({ selectedAngle: angle }),

  setShowSummary: (show, visitId) => set({
    showSummary: show,
    summaryVisitId: visitId ?? get().summaryVisitId,
  }),

  persist: () => {
    const { patients, visits } = get();
    saveToStorage({ patients, visits });
  },

  getPatientById: (id) => get().patients.find((p) => p.id === id),

  getVisitById: (id) => get().visits.find((v) => v.id === id),

  getVisitsByPatientId: (patientId) => {
    return get()
      .visits.filter((v) => v.patientId === patientId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  },

  getCurrentVisit: () => {
    const { currentVisitId, visits } = get();
    return visits.find((v) => v.id === currentVisitId);
  },

  getCompareVisit: () => {
    const { compareVisitId, visits } = get();
    return visits.find((v) => v.id === compareVisitId);
  },

  getInitialVisit: (patientId) => {
    return get()
      .getVisitsByPatientId(patientId)
      .find((v) => v.visitNumber === 0);
  },

  getPreviousVisit: (patientId, currentVisitId) => {
    const visits = get().getVisitsByPatientId(patientId);
    const currentIndex = visits.findIndex((v) => v.id === currentVisitId);
    if (currentIndex > 0) {
      return visits[currentIndex - 1];
    }
    return undefined;
  },

  updatePhoto: (visitId, angle, photoUrl) => {
    const photoItem: PhotoItem = {
      url: photoUrl,
      qualityStatus: 'pending',
      uploadedAt: new Date().toISOString(),
    };

    set((state) => ({
      visits: state.visits.map((v) =>
        v.id === visitId
          ? { ...v, photos: { ...v.photos, [angle]: photoItem } }
          : v
      ),
    }));
    get().persist();
  },

  removePhoto: (visitId, angle) => {
    set((state) => {
      const visit = state.visits.find((v) => v.id === visitId);
      if (!visit) return state;

      const newPhotos: PhotoAngleMap = { ...visit.photos };
      delete newPhotos[angle];

      return {
        visits: state.visits.map((v) =>
          v.id === visitId ? { ...v, photos: newPhotos } : v
        ),
      };
    });
    get().persist();
  },

  updatePhotoQuality: (visitId, angle, status) => {
    set((state) => ({
      visits: state.visits.map((v) => {
        if (v.id !== visitId) return v;
        const photo = v.photos[angle];
        if (!photo) return v;
        return {
          ...v,
          photos: {
            ...v.photos,
            [angle]: { ...photo, qualityStatus: status },
          },
        };
      }),
    }));
    get().persist();
  },

  updateNotes: (visitId, notes) => {
    set((state) => ({
      visits: state.visits.map((v) =>
        v.id === visitId ? { ...v, notes } : v
      ),
    }));
    get().persist();
  },

  setCompareVisitForRecord: (visitId, compareVisitId) => {
    set((state) => ({
      visits: state.visits.map((v) =>
        v.id === visitId ? { ...v, compareVisitId } : v
      ),
    }));
    get().persist();
  },

  completeVisit: (visitId) => {
    set((state) => ({
      visits: state.visits.map((v) =>
        v.id === visitId
          ? { ...v, status: 'completed' as const, completedAt: new Date().toISOString() }
          : v
      ),
    }));
    get().persist();
  },

  getOrCreateTodayVisit: (patientId) => {
    const { visits, getVisitsByPatientId } = get();
    const today = new Date().toISOString().split('T')[0];

    const patientVisits = getVisitsByPatientId(patientId);
    const todayVisit = patientVisits.find((v) => v.date === today);

    if (todayVisit) {
      return todayVisit;
    }

    const completedVisits = patientVisits.filter((v) => v.status === 'completed');
    const maxVisitNumber = Math.max(...completedVisits.map((v) => v.visitNumber), -1);
    const newVisit: Visit = {
      id: `visit-${Date.now()}`,
      patientId,
      date: today,
      visitNumber: maxVisitNumber + 1,
      status: 'draft',
      notes: '',
      photos: {},
    };

    set((state) => ({
      visits: [...state.visits, newVisit],
    }));
    get().persist();

    return newVisit;
  },

  getQualityIssues: (visitId) => {
    const visit = get().getVisitById(visitId);
    const missing: PhotoAngle[] = [];
    const retake: PhotoAngle[] = [];
    const allAngles: PhotoAngle[] = [
      'front_smile',
      'profile',
      'oblique_45',
      'upper_occlusal',
      'lower_occlusal',
      'right_buccal',
    ];

    if (!visit) {
      return { missing: allAngles, retake };
    }

    allAngles.forEach((angle) => {
      const photo = visit.photos[angle];
      if (!photo) {
        missing.push(angle);
      } else if (photo.qualityStatus === 'retake') {
        retake.push(angle);
      }
    });

    return { missing, retake };
  },
}));
