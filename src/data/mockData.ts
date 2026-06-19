import type { Patient, Visit, PhotoAngle, PhotoItem } from '@/types';

const generatePlaceholderImage = (label: string, bgColor: string): string => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
      <rect width="400" height="300" fill="${bgColor}"/>
      <text x="50%" y="45%" text-anchor="middle" fill="white" font-size="24" font-family="sans-serif" font-weight="bold">${label}</text>
      <text x="50%" y="60%" text-anchor="middle" fill="rgba(255,255,255,0.7)" font-size="14" font-family="sans-serif">示例照片</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.trim())}`;
};

const colors = {
  initial: ['#0F766E', '#0D9488', '#14B8A6', '#2DD4BF', '#5EEAD4', '#99F6E4'],
  visit1: ['#1E40AF', '#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE'],
  visit2: ['#B45309', '#D97706', '#F59E0B', '#FBBF24', '#FCD34D', '#FDE68A'],
};

export const mockPatients: Patient[] = [
  {
    id: 'p1',
    name: '张明华',
    gender: '男',
    age: 28,
    avatar: '',
    firstVisitDate: '2025-03-15',
    visitCount: 5,
    stage: '收缝期',
    todayAppointment: '09:00',
    status: 'waiting',
  },
  {
    id: 'p2',
    name: '李雨晴',
    gender: '女',
    age: 24,
    avatar: '',
    firstVisitDate: '2025-01-20',
    visitCount: 8,
    stage: '排齐整平期',
    todayAppointment: '09:30',
    status: 'in_progress',
  },
  {
    id: 'p3',
    name: '王子轩',
    gender: '男',
    age: 16,
    avatar: '',
    firstVisitDate: '2025-05-10',
    visitCount: 3,
    stage: '初始期',
    todayAppointment: '10:00',
    status: 'waiting',
  },
  {
    id: 'p4',
    name: '陈梦琪',
    gender: '女',
    age: 32,
    avatar: '',
    firstVisitDate: '2024-11-08',
    visitCount: 12,
    stage: '精细调整期',
    todayAppointment: '10:30',
    status: 'completed',
  },
  {
    id: 'p5',
    name: '刘浩然',
    gender: '男',
    age: 22,
    avatar: '',
    firstVisitDate: '2025-02-28',
    visitCount: 6,
    stage: '收缝期',
    todayAppointment: '14:00',
    status: 'waiting',
  },
  {
    id: 'p6',
    name: '赵诗涵',
    gender: '女',
    age: 18,
    avatar: '',
    firstVisitDate: '2025-04-15',
    visitCount: 4,
    stage: '排齐整平期',
    todayAppointment: '14:30',
    status: 'waiting',
  },
];

const angles: PhotoAngle[] = [
  'front_smile',
  'profile',
  'oblique_45',
  'upper_occlusal',
  'lower_occlusal',
  'right_buccal',
];

const angleLabels: Record<PhotoAngle, string> = {
  front_smile: '正面微笑',
  profile: '侧貌',
  oblique_45: '45°侧面',
  upper_occlusal: '上颌咬合',
  lower_occlusal: '下颌咬合',
  right_buccal: '右侧咬合',
};

const generateVisitPhotos = (colorSet: string[], allApproved: boolean = true): Record<PhotoAngle, PhotoItem> => {
  const photos = {} as Record<PhotoAngle, PhotoItem>;
  angles.forEach((angle, index) => {
    photos[angle] = {
      url: generatePlaceholderImage(angleLabels[angle], colorSet[index % colorSet.length]),
      qualityStatus: allApproved ? 'approved' : 'pending',
      uploadedAt: new Date().toISOString(),
    };
  });
  return photos;
};

export const mockVisits: Visit[] = [
  {
    id: 'v1-p2-initial',
    patientId: 'p2',
    date: '2025-01-20',
    visitNumber: 0,
    status: 'completed',
    notes: '初诊记录：上下牙列拥挤，深覆合II度。方案：拔牙矫治，拔除4颗第一前磨牙。',
    photos: generateVisitPhotos(colors.initial),
    completedAt: '2025-01-20T10:30:00Z',
    conclusions: [],
  },
  {
    id: 'v1-p2-1',
    patientId: 'p2',
    date: '2025-04-15',
    visitNumber: 1,
    status: 'completed',
    notes: '托槽粘接完成，患者适应良好。继续观察，下次复诊更换主弓丝。',
    photos: generateVisitPhotos(colors.visit1),
    completedAt: '2025-04-15T09:45:00Z',
    conclusions: [
      { angle: 'front_smile', compareVisitId: 'v1-p2-initial', description: '托槽已粘接，牙列开始排齐', verdict: 'improved', createdAt: '2025-04-15T09:40:00Z' },
      { angle: 'upper_occlusal', compareVisitId: 'v1-p2-initial', description: '上颌弓丝入槽，注意口腔卫生', verdict: 'attention', createdAt: '2025-04-15T09:42:00Z' },
    ],
  },
  {
    id: 'v1-p2-2',
    patientId: 'p2',
    date: '2025-07-20',
    visitNumber: 2,
    status: 'completed',
    notes: '牙列排齐进展顺利，上下牙弓形态良好。开始轻力牵引调整中线。',
    photos: generateVisitPhotos(colors.visit2),
    completedAt: '2025-07-20T11:00:00Z',
    conclusions: [
      { angle: 'front_smile', compareVisitId: 'v1-p2-1', description: '前牙排齐明显改善', verdict: 'improved', createdAt: '2025-07-20T10:55:00Z' },
    ],
  },
  {
    id: 'v1-p2-current',
    patientId: 'p2',
    date: '2026-06-20',
    visitNumber: 3,
    status: 'draft',
    notes: '',
    photos: {},
    conclusions: [],
  },
  {
    id: 'v1-p1-initial',
    patientId: 'p1',
    date: '2025-03-15',
    visitNumber: 0,
    status: 'completed',
    notes: '初诊：安氏II类错颌，下颌后缩。隐形矫治方案。',
    photos: generateVisitPhotos(colors.initial),
    completedAt: '2025-03-15T14:20:00Z',
    conclusions: [],
  },
  {
    id: 'v1-p1-current',
    patientId: 'p1',
    date: '2026-06-20',
    visitNumber: 5,
    status: 'draft',
    notes: '',
    photos: {},
    conclusions: [],
  },
];

export const quickOrderTemplates = [
  '继续牵引',
  '调整皮筋佩戴',
  '更换主弓丝',
  '加强口腔卫生',
  '注意饮食习惯',
  '下次复诊拍片',
  '保持器佩戴检查',
  '中线调整',
];
