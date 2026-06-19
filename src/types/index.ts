export type PhotoAngle =
  | 'front_smile'
  | 'profile'
  | 'oblique_45'
  | 'upper_occlusal'
  | 'lower_occlusal'
  | 'right_buccal';

export const ANGLE_LABELS: Record<PhotoAngle, string> = {
  front_smile: '正面微笑',
  profile: '侧貌',
  oblique_45: '45°侧面',
  upper_occlusal: '上颌咬合',
  lower_occlusal: '下颌咬合',
  right_buccal: '右侧咬合',
};

export const ANGLE_ORDER: PhotoAngle[] = [
  'front_smile',
  'profile',
  'oblique_45',
  'upper_occlusal',
  'lower_occlusal',
  'right_buccal',
];

export type PhotoQualityStatus = 'pending' | 'approved' | 'retake';

export interface PhotoItem {
  url: string;
  qualityStatus: PhotoQualityStatus;
  uploadedAt: string;
}

export type PhotoAngleMap = Partial<Record<PhotoAngle, PhotoItem>>;

export interface Patient {
  id: string;
  name: string;
  gender: '男' | '女';
  age: number;
  avatar: string;
  firstVisitDate: string;
  visitCount: number;
  stage: string;
  todayAppointment?: string;
  status?: 'waiting' | 'in_progress' | 'completed';
}

export interface Visit {
  id: string;
  patientId: string;
  date: string;
  visitNumber: number;
  status: 'draft' | 'completed';
  notes: string;
  photos: PhotoAngleMap;
  compareVisitId?: string;
  completedAt?: string;
}

export interface CompareState {
  scale: number;
  positionX: number;
  positionY: number;
}

export type QuickCompareTarget = 'initial' | 'previous' | 'current';
