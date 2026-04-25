import { Class, User } from '../types';
import { getUsers } from './authService';

const CLASSES_KEY = 'sb_classes';

export const getClasses = (): Class[] => {
  try {
    const data = localStorage.getItem(CLASSES_KEY);
    if (!data) return [];
    return JSON.parse(data) as Class[];
  } catch (e) {
    console.error('Error parsing sb_classes', e);
    return [];
  }
};

export const saveClasses = (classes: Class[]): void => {
  localStorage.setItem(CLASSES_KEY, JSON.stringify(classes));
};

export const generateClassCode = (): string => {
  const classes = getClasses();
  let attempts = 0;
  while (attempts < 10) {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    if (!classes.some(c => c.classCode === code)) {
      return code;
    }
    attempts++;
  }
  return 'ERR' + Math.random().toString(36).substring(2, 5).toUpperCase();
};

export const createClass = (teacherId: string, className: string): Class => {
  const classes = getClasses();
  const newClass: Class = {
    id: crypto.randomUUID(),
    teacherId,
    classCode: generateClassCode(),
    className,
    createdAt: Date.now(),
    studentIds: [],
    pendingIds: [],
  };
  classes.push(newClass);
  saveClasses(classes);
  return newClass;
};

export const getClassByCode = (code: string): Class | null => {
  const classes = getClasses();
  const upperCode = code.toUpperCase();
  
  // Try Class Code first
  const clsByCode = classes.find(c => c.classCode === upperCode);
  if (clsByCode) return clsByCode;

  // Fallback: Try Teacher School Code
  const users = getUsers();
  const teacher = users.find(u => u.role === 'teacher' && u.schoolCode?.toUpperCase() === upperCode);
  if (teacher) {
    return classes.find(c => c.teacherId === teacher.id) || null;
  }

  return null;
};

export const getClassesByTeacher = (teacherId: string): Class[] => {
  const classes = getClasses();
  return classes.filter(c => c.teacherId === teacherId);
};

export const getClassByStudent = (studentId: string): Class | null => {
  const classes = getClasses();
  return classes.find(c => c.studentIds.includes(studentId)) || null;
};

export const joinClass = (inputCode: string, studentId: string): { success: boolean, error?: string, status?: 'joined' | 'pending' } => {
  const classes = getClasses();
  const upperCode = inputCode.toUpperCase();
  
  // Try finding via Class Code
  let clsIndex = classes.findIndex(c => c.classCode === upperCode);
  
  // Fallback to Teacher Code (School Code) if not found
  if (clsIndex === -1) {
    const users = getUsers();
    const teacher = users.find(u => u.role === 'teacher' && u.schoolCode?.toUpperCase() === upperCode);
    if (teacher) {
      clsIndex = classes.findIndex(c => c.teacherId === teacher.id);
    }
  }
  
  if (clsIndex === -1) {
    return { success: false, error: 'Code not found. Check with your teacher.' };
  }
  
  const cls = classes[clsIndex];
  
  if (cls.studentIds.includes(studentId)) {
    return { success: false, error: 'You are already in this class.' };
  }
  
  if (cls.pendingIds.includes(studentId)) {
    return { success: false, error: 'Your request is already pending approval.' };
  }

  cls.studentIds.push(studentId);
  saveClasses(classes);
  
  return { success: true, status: 'joined' };
};

export const approveStudent = (classId: string, studentId: string): void => {
  const classes = getClasses();
  const clsIndex = classes.findIndex(c => c.id === classId);
  if (clsIndex === -1) return;
  
  const cls = classes[clsIndex];
  cls.pendingIds = cls.pendingIds.filter(id => id !== studentId);
  if (!cls.studentIds.includes(studentId)) {
    cls.studentIds.push(studentId);
  }
  saveClasses(classes);
};

export const removeStudent = (classId: string, studentId: string): void => {
  const classes = getClasses();
  const clsIndex = classes.findIndex(c => c.id === classId);
  if (clsIndex === -1) return;
  
  const cls = classes[clsIndex];
  cls.studentIds = cls.studentIds.filter(id => id !== studentId);
  cls.pendingIds = cls.pendingIds.filter(id => id !== studentId);
  saveClasses(classes);
};
