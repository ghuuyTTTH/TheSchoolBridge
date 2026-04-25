
import { Class, User } from '../types';
import { db } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc, 
  arrayUnion, 
  arrayRemove, 
  deleteDoc,
  limit,
  orderBy
} from 'firebase/firestore';

export const getClasses = async (): Promise<Class[]> => {
  const querySnapshot = await getDocs(collection(db, 'classes'));
  return querySnapshot.docs.map(doc => doc.data() as Class);
};

export const generateClassCode = async (): Promise<string> => {
  let attempts = 0;
  while (attempts < 10) {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const q = query(collection(db, 'classes'), where('classCode', '==', code));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return code;
    }
    attempts++;
  }
  return 'ERR' + Math.random().toString(36).substring(2, 5).toUpperCase();
};

export const createClass = async (teacherId: string, className: string): Promise<Class> => {
  const classCode = await generateClassCode();
  const id = crypto.randomUUID();
  const newClass: Class = {
    id,
    teacherId,
    classCode,
    className,
    createdAt: Date.now(),
    studentIds: [],
    pendingIds: [],
  };
  await setDoc(doc(db, 'classes', id), newClass);
  return newClass;
};

export const getClassByCode = async (code: string): Promise<Class | null> => {
  const upperCode = (code || '').trim().toUpperCase();
  if (!upperCode) return null;
  
  // Try Class Code first
  const q = query(collection(db, 'classes'), where('classCode', '==', upperCode), limit(1));
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    return snapshot.docs[0].data() as Class;
  }

  // Fallback: Try Teacher School Code
  const teacherQ = query(collection(db, 'users'), where('role', '==', 'teacher'), where('schoolCode', '==', upperCode), limit(1));
  const teacherSnapshot = await getDocs(teacherQ);
  if (!teacherSnapshot.empty) {
    const teacherId = teacherSnapshot.docs[0].id;
    const classQ = query(collection(db, 'classes'), where('teacherId', '==', teacherId), orderBy('createdAt', 'desc'), limit(1));
    const classSnapshot = await getDocs(classQ);
    if (!classSnapshot.empty) {
      return classSnapshot.docs[0].data() as Class;
    }
  }

  return null;
};

export const getClassesByTeacher = async (teacherId: string): Promise<Class[]> => {
  const q = query(collection(db, 'classes'), where('teacherId', '==', teacherId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as Class);
};

export const getClassByStudent = async (studentId: string): Promise<Class | null> => {
  const q = query(collection(db, 'classes'), where('studentIds', 'array-contains', studentId), limit(1));
  const snapshot = await getDocs(q);
  return snapshot.empty ? null : (snapshot.docs[0].data() as Class);
};

export const joinClass = async (inputCode: string, studentId: string): Promise<{ success: boolean, error?: string, status?: 'joined' | 'pending' }> => {
  const upperCode = (inputCode || '').trim().toUpperCase();
  if (!upperCode) return { success: false, error: 'Please enter a valid code.' };

  const cls = await getClassByCode(upperCode);
  
  if (!cls) {
    return { success: false, error: 'Class not found. Please check with your teacher.' };
  }
  
  if (cls.studentIds.includes(studentId)) {
    return { success: true, status: 'joined' }; // Silently succeed if already in
  }
  
  try {
    const classRef = doc(db, 'classes', cls.id);
    const userRef = doc(db, 'users', studentId);

    // Update class student list
    await updateDoc(classRef, {
      studentIds: arrayUnion(studentId)
    });

    // Update user class list
    await updateDoc(userRef, {
      classes: arrayUnion(cls.id)
    });
    
    return { success: true, status: 'joined' };
  } catch (error: any) {
    console.error('Error joining class:', error);
    return { success: false, error: 'Failed to join class. Please try again.' };
  }
};

export const approveStudent = async (classId: string, studentId: string): Promise<void> => {
  const classRef = doc(db, 'classes', classId);
  await updateDoc(classRef, {
    pendingIds: arrayRemove(studentId),
    studentIds: arrayUnion(studentId)
  });
};

export const removeStudent = async (classId: string, studentId: string): Promise<void> => {
  const classRef = doc(db, 'classes', classId);
  await updateDoc(classRef, {
    studentIds: arrayRemove(studentId),
    pendingIds: arrayRemove(studentId)
  });
};
