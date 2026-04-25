import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { User, Class, Student, Badge, Notification, Message, HelpRequest, MoodLog, Mood } from './types';
import { useAuth } from './AuthContext';
import * as classService from './services/classService';
import { getUsers } from './services/authService';

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

const KEYS = {
  MESSAGES: 'sb_messages',
  MOODS: 'sb_moods',
  HELP: 'sb_help',
  PLANS: 'sb_plans',
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Base state from localStorage
  const [messages, setMessages] = useState<Message[]>([]);
  const [helpRequests, setHelpRequests] = useState<HelpRequest[]>([]);
  const [moodLogs, setMoodLogs] = useState<MoodLog[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Teacher specific state
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  // Load data on mount and refresh
  useEffect(() => {
    const loadData = () => {
      const savedMessages = localStorage.getItem(KEYS.MESSAGES);
      setMessages(savedMessages ? JSON.parse(savedMessages) : []);
      
      const savedHelp = localStorage.getItem(KEYS.HELP);
      setHelpRequests(savedHelp ? JSON.parse(savedHelp) : []);
      
      const savedMoods = localStorage.getItem(KEYS.MOODS);
      setMoodLogs(savedMoods ? JSON.parse(savedMoods) : []);
    };
    loadData();
  }, [refreshTrigger]);

  const refreshData = () => setRefreshTrigger(prev => prev + 1);

  // Persistence effects
  useEffect(() => { if (messages.length > 0) localStorage.setItem(KEYS.MESSAGES, JSON.stringify(messages)); }, [messages]);
  useEffect(() => { if (helpRequests.length > 0) localStorage.setItem(KEYS.HELP, JSON.stringify(helpRequests)); }, [helpRequests]);
  useEffect(() => { if (moodLogs.length > 0) localStorage.setItem(KEYS.MOODS, JSON.stringify(moodLogs)); }, [moodLogs]);

  // Scoping Logic
  const allUsers = useMemo(() => getUsers(), [user, refreshTrigger]);

  const teacherClasses = useMemo(() => {
    if (user?.role === 'teacher') {
      return classService.getClassesByTeacher(user.id);
    }
    return [];
  }, [user, refreshTrigger]);

  // Set default selected class for teacher
  useEffect(() => {
    if (user?.role === 'teacher' && !selectedClassId && teacherClasses.length > 0) {
      setSelectedClassId(teacherClasses[0].id);
    }
  }, [user, teacherClasses, selectedClassId]);

  const studentClass = useMemo(() => {
    if (user?.role === 'student') {
      return classService.getClassByStudent(user.id);
    }
    return null;
  }, [user, refreshTrigger]);

  const classmates = useMemo(() => {
    if (user?.role === 'student' && studentClass) {
      return allUsers.filter(u => studentClass.studentIds.includes(u.id) && u.id !== user.id);
    }
    return [];
  }, [user, studentClass, allUsers]);

  const classTeacher = useMemo(() => {
    if (user?.role === 'student' && studentClass) {
      return allUsers.find(u => u.id === studentClass.teacherId) || null;
    }
    return null;
  }, [user, studentClass, allUsers]);

  const currentChild = useMemo(() => {
    if (user?.role === 'parent' && user.childStudentId) {
      return allUsers.find(u => u.studentId === user.childStudentId);
    }
    return null;
  }, [user, allUsers]);

  // Filtered Data Views
  const myStudents = useMemo(() => {
    if (user?.role === 'teacher' && selectedClassId) {
      const cls = teacherClasses.find(c => c.id === selectedClassId);
      if (cls) {
        return allUsers.filter(u => cls.studentIds.includes(u.id));
      }
    }
    return [];
  }, [user, selectedClassId, teacherClasses, allUsers]);

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
    const newMsg: Message = {
      id: crypto.randomUUID(),
      senderId: user.id,
      receiverId: toId,
      text,
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    setMessages(prev => [...prev, newMsg]);
  };

  const sendHelpRequest = async (subject: string, message: string, isAnonymous: boolean) => {
    if (!user || user.role !== 'student') return;
    const newRequest: HelpRequest = {
      id: crypto.randomUUID(),
      studentId: user.id,
      subject,
      message,
      timestamp: new Date().toISOString(),
      isAnonymous,
      status: 'pending',
    };
    setHelpRequests(prev => [...prev, newRequest]);
  };

  const resolveHelpRequest = async (requestId: string) => {
    setHelpRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'resolved' } : r));
  };

  const addMood = async (mood: Mood) => {
    if (!user) return;
    const newLog: MoodLog = {
      id: crypto.randomUUID(),
      userId: user.id,
      mood,
      timestamp: Date.now(),
    };
    setMoodLogs(prev => [...prev, newLog]);
  };

  const markNotificationRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearNotificationsByType = async (type: Notification['type']) => {
    setNotifications(prev => prev.filter(n => n.type !== type));
  };

  const createClass = async (className: string) => {
    if (!user || user.role !== 'teacher') throw new Error('Unauthorized');
    const newClass = classService.createClass(user.id, className);
    refreshData();
    setSelectedClassId(newClass.id);
    return newClass;
  };

  const updateStudent = async (updatedStudent: any) => {
    // In this lab, we use localStorage for student progress if not in authService
    const key = `student_progress_${updatedStudent.id}`;
    localStorage.setItem(key, JSON.stringify(updatedStudent));
    refreshData();
  };

  const awardBadge = async (studentId: string, badge: Badge) => {
    const studentProgressKey = `student_progress_${studentId}`;
    const saved = localStorage.getItem(studentProgressKey);
    const data = saved ? JSON.parse(saved) : { badges: [] };
    const updated = {
      ...data,
      id: studentId,
      badges: [...(data.badges || []), { ...badge, unlockedAt: new Date().toISOString() }]
    };
    localStorage.setItem(studentProgressKey, JSON.stringify(updated));
    
    // Also notify student
    const newNotif: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      to: studentId,
      title: 'New Badge Awarded! 🏆',
      message: `You earned the ${badge.name} badge!`,
      type: 'update',
      timestamp: Date.now(),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
    refreshData();
  };

  return (
    <DataContext.Provider value={{
      classes: classService.getClasses(),
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
