
export type Role = 'student' | 'teacher' | 'parent';

export type Language = 'en' | 'ar';

export type RiskLevel = 'low' | 'medium' | 'high';

export type Mood = 'happy' | 'neutral' | 'sad' | 'stressed';

export interface Notification {
  id: string;
  to: string;
  title: string;
  message: string;
  type: 'invite' | 'alert' | 'update' | 'message' | 'help';
  timestamp: number;
  read: boolean;
  payload?: {
    screen: string;
    data?: any;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  studentId: string | null;     // set for students
  schoolCode: string | null;    // set for teachers
  childStudentId: string | null;// set for parents
  createdAt: number;
  classes?: string[];           // IDs of classes joined
}

export interface Session {
  userId: string;
  role: string;
  name: string;
  expiresAt: number;
}

export interface Class {
  id: string;                 // crypto.randomUUID()
  teacherId: string;          // the teacher user's id
  classCode: string;          // 6-char uppercase unique code
  className: string;          // e.g. "Year 10 Biology — Block A"
  createdAt: number;
  studentIds: string[];       // ids of approved students
  pendingIds: string[];       // ids of students awaiting approval
}

export interface MoodLog {
  id: string;
  userId: string;
  mood: Mood;
  timestamp: number;
}

export interface Subject {
  id: string;
  name: string;
  progress: number;
  score: number;
  risk: RiskLevel;
  lastImprovement?: number; 
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  unlockedAt?: string;
}

export interface Student {
  id: string;
  email: string;
  name: string;
  grade: string;
  riskLevel: RiskLevel;
  issueSummary: string;
  attendance: number;
  missingTasks: string[];
  recentScores: number[];
  subjects: Subject[];
  // Gamification
  points: number;
  level: number;
  badges: Badge[];
  // Emotional Check-in
  currentMood?: Mood;
  moodHistory: { date: string, mood: Mood }[];
  // Peer Support
  strengths: string[];
  weaknesses: string[];
  isPeerMentor: boolean;
  // Study Plan
  studyPlan?: StudyPlan;
  // Internal Teacher Notes
  internalNotes?: TeacherNote[];
}

export interface StudyPlan {
  id: string;
  title: string;
  tasks: {
    id: string;
    title: string;
    type: 'video' | 'practice' | 'reading';
    completed: boolean;
    duration: string;
  }[];
}

export interface TeacherNote {
  id: string;
  date: string;
  text: string;
  category: 'academic' | 'behavioral' | 'emotional';
}

export interface HelpRequest {
  id: string;
  studentId: string;
  subject: string;
  message: string;
  timestamp: string;
  isAnonymous: boolean;
  status: 'pending' | 'resolved';
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
  isRead: boolean;
}

export interface DiscussionQuestion {
  id: string;
  text: string;
  authorId?: string; // Optional for anonymous
  isAnonymous: boolean;
  timestamp: string;
  replies: { id: string, text: string, authorName: string, timestamp: string }[];
}
