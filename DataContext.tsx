import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { User, Class, Student, Badge, Notification, Message, HelpRequest, MoodLog, Mood } from './types';
import { useAuth } from './AuthContext';
import * as classService from './services/classService';
import { getUsers } from './services/authService';
import { db } from './services/firebase';
import { 
  collection, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  doc, 
  updateDoc, 
  deleteDoc,
  setDoc,
  getDoc
} from 'firebase/firestore';

interface DataContextType {
  classes: Class[];
  myStudents: User[]; // Scoped to teacher's selected class
  myMessages: Message[]; // Scoped to current user as participant
  myHelpRequests: HelpRequest[]; // Scoped based on role
  myMoodLogs: MoodLog[]; // Scoped based on role
  notifications: Notification[];
  
  // Actions
  sendMessage: (toId: string, text: string) => Promise<void>;
  sendHelpRequest: (subject: string, message: string, isAnonymous: boolean) => Promise<void>;
  resolveHelpRequest: (requestId: string) => Promise<void>;
  addMood: (mood: Mood) => Promise<void>;
  markNotificationRead: (id: string, action?: boolean) => Promise<void>;
  clearNotificationsByType: (type: Notification['type']) => Promise<void>;
  
  // Class Management (Teacher)
  createClass: (className: string) => Promise<Class>;
  selectedClassId: string | null;
  setSelectedClassId: (id: string | null) => void;
  teacherClasses: Class[];
  
  // Student/General
  classmates: User[];
  classTeacher: User | null;
  
  // Helpers
  studentClass: Class | null;
  currentChild: User | null;
  refreshData: () => void;
  updateStudent: (student: any) => Promise<void>;
  awardBadge: (studentId: string, badge: Badge) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  const [classes, setClasses] = useState<Class[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [helpRequests, setHelpRequests] = useState<HelpRequest[]>([]);
  const [moodLogs, setMoodLogs] = useState<MoodLog[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  // Real-time Listeners
  useEffect(() => {
    if (!user) return;

    const unsubClasses = onSnapshot(collection(db, 'classes'), (snapshot) => {
      setClasses(snapshot.docs.map(doc => doc.data() as Class));
    });

    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUsers(snapshot.docs.map(doc => doc.data() as User));
    });

    const unsubMessages = onSnapshot(
      query(collection(db, 'messages'), orderBy('timestamp', 'asc')),
      (snapshot) => {
        setMessages(snapshot.docs.map(doc => doc.data() as Message));
      }
    );

    const unsubHelp = onSnapshot(
      query(collection(db, 'helpRequests'), orderBy('timestamp', 'desc')),
      (snapshot) => {
        setHelpRequests(snapshot.docs.map(doc => doc.data() as HelpRequest));
      }
    );

    const unsubMoods = onSnapshot(
      query(collection(db, 'moodLogs'), orderBy('timestamp', 'desc')),
      (snapshot) => {
        setMoodLogs(snapshot.docs.map(doc => doc.data() as MoodLog));
      }
    );

    const unsubNotifs = onSnapshot(
      query(collection(db, 'notifications'), where('to', '==', user.id), orderBy('timestamp', 'desc')),
      (snapshot) => {
        setNotifications(snapshot.docs.map(doc => doc.data() as Notification));
      }
    );

    return () => {
      unsubClasses();
      unsubUsers();
      unsubMessages();
      unsubHelp();
      unsubMoods();
      unsubNotifs();
    };
  }, [user]);

  const teacherClasses = useMemo(() => {
    if (user?.role === 'teacher') {
      return classes.filter(c => c.teacherId === user.id);
    }
    return [];
  }, [user, classes]);

  // Set default selected class for teacher
  useEffect(() => {
    if (user?.role === 'teacher' && !selectedClassId && teacherClasses.length > 0) {
      setSelectedClassId(teacherClasses[0].id);
    }
  }, [user, teacherClasses, selectedClassId]);

  const studentClass = useMemo(() => {
    if (user?.role === 'student') {
      return classes.find(c => c.studentIds.includes(user.id)) || null;
    }
    return null;
  }, [user, classes]);

  const classmates = useMemo(() => {
    if (user?.role === 'student' && studentClass) {
      return users.filter(u => studentClass.studentIds.includes(u.id) && u.id !== user.id);
    }
    return [];
  }, [user, studentClass, users]);

  const classTeacher = useMemo(() => {
    if (user?.role === 'student' && studentClass) {
      return users.find(u => u.id === studentClass.teacherId) || null;
    }
    return null;
  }, [user, studentClass, users]);

  const currentChild = useMemo(() => {
    if (user?.role === 'parent' && user.childStudentId) {
      return users.find(u => u.studentId === user.childStudentId);
    }
    return null;
  }, [user, users]);

  // Filtered Data Views
  const myStudents = useMemo(() => {
    if (user?.role === 'teacher' && selectedClassId) {
      const cls = teacherClasses.find(c => c.id === selectedClassId);
      if (cls) {
        return users.filter(u => cls.studentIds.includes(u.id));
      }
    }
    return [];
  }, [user, selectedClassId, teacherClasses, users]);

  const myMessages = useMemo(() => {
    if (!user) return [];
    return messages.filter(m => m.senderId === user.id || m.receiverId === user.id);
  }, [user, messages]);

  const myHelpRequests = useMemo(() => {
    if (!user) return [];
    if (user.role === 'student') {
      return helpRequests.filter(h => h.studentId === user.id);
    }
    if (user.role === 'teacher' && selectedClassId) {
      const cls = teacherClasses.find(c => c.id === selectedClassId);
      if (cls) {
        return helpRequests.filter(h => cls.studentIds.includes(h.studentId));
      }
    }
    return [];
  }, [user, helpRequests, selectedClassId, teacherClasses]);

  const myMoodLogs = useMemo(() => {
    if (!user) return [];
    if (user.role === 'student') {
      return moodLogs.filter(m => m.userId === user.id);
    }
    if (user.role === 'parent' && currentChild) {
      return moodLogs.filter(m => m.userId === currentChild.id);
    }
    if (user.role === 'teacher' && selectedClassId) {
      const cls = teacherClasses.find(c => c.id === selectedClassId);
      if (cls) {
        return moodLogs.filter(m => cls.studentIds.includes(m.userId));
      }
    }
    return [];
  }, [user, moodLogs, currentChild, selectedClassId, teacherClasses]);

  // Actions
  const sendMessage = async (toId: string, text: string) => {
    if (!user) return;
    const id = crypto.randomUUID();
    const newMsg: Message = {
      id,
      senderId: user.id,
      receiverId: toId,
      text,
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    await setDoc(doc(db, 'messages', id), newMsg);
  };

  const sendHelpRequest = async (subject: string, message: string, isAnonymous: boolean) => {
    if (!user || user.role !== 'student') return;
    const id = crypto.randomUUID();
    const newRequest: HelpRequest = {
      id,
      studentId: user.id,
      subject,
      message,
      timestamp: new Date().toISOString(),
      isAnonymous,
      status: 'pending',
    };
    await setDoc(doc(db, 'helpRequests', id), newRequest);
  };

  const resolveHelpRequest = async (requestId: string) => {
    await updateDoc(doc(db, 'helpRequests', requestId), { status: 'resolved' });
  };

  const addMood = async (mood: Mood) => {
    if (!user) return;
    const id = crypto.randomUUID();
    const newLog: MoodLog = {
      id,
      userId: user.id,
      mood,
      timestamp: Date.now(),
    };
    await setDoc(doc(db, 'moodLogs', id), newLog);
  };

  const markNotificationRead = async (id: string) => {
    await updateDoc(doc(db, 'notifications', id), { read: true });
  };

  const clearNotificationsByType = async (type: Notification['type']) => {
    const toClear = notifications.filter(n => n.type === type);
    for (const n of toClear) {
      await deleteDoc(doc(db, 'notifications', n.id));
    }
  };

  const createClass = async (className: string) => {
    if (!user || user.role !== 'teacher') throw new Error('Unauthorized');
    const newClass = await classService.createClass(user.id, className);
    setSelectedClassId(newClass.id);
    return newClass;
  };

  const updateStudent = async (updatedStudent: any) => {
    await setDoc(doc(db, 'studentProgress', updatedStudent.id), updatedStudent, { merge: true });
  };

  const awardBadge = async (studentId: string, badge: Badge) => {
    const progressRef = doc(db, 'studentProgress', studentId);
    const progressSnap = await getDoc(progressRef);
    const data = progressSnap.exists() ? progressSnap.data() : { badges: [] };
    
    await setDoc(progressRef, {
      badges: [...(data.badges || []), { ...badge, unlockedAt: new Date().toISOString() }]
    }, { merge: true });
    
    const notifId = crypto.randomUUID();
    const newNotif: Notification = {
      id: notifId,
      to: studentId,
      title: 'New Badge Awarded! 🏆',
      message: `You earned the ${badge.name} badge!`,
      type: 'update',
      timestamp: Date.now(),
      read: false
    };
    await setDoc(doc(db, 'notifications', notifId), newNotif);
  };

  const refreshData = () => {};

  return (
    <DataContext.Provider value={{
      classes,
      myStudents,
      myMessages,
      myHelpRequests,
      myMoodLogs,
      notifications,
      sendMessage,
      sendHelpRequest,
      resolveHelpRequest,
      addMood,
      markNotificationRead,
      clearNotificationsByType,
      createClass,
      selectedClassId,
      setSelectedClassId,
      teacherClasses,
      studentClass,
      currentChild,
      refreshData,
      updateStudent,
      awardBadge,
      classmates,
      classTeacher
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
