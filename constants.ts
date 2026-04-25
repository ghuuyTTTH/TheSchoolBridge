
import { Student, Role, RiskLevel } from './types';

export const RISK_COLORS: Record<RiskLevel, { bg: string, text: string, border: string }> = {
  low: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
  medium: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
  high: { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-200' },
};

export const OMANI_SUBJECTS = [
  { id: 'islamic', name: 'Islamic Studies', nameAr: 'التربية الإسلامية' },
  { id: 'social', name: 'Social Studies', nameAr: 'الدراسات الاجتماعية' },
  { id: 'math', name: 'Mathematics', nameAr: 'الرياضيات' },
  { id: 'arabic', name: 'Arabic', nameAr: 'اللغة العربية' },
  { id: 'english', name: 'English', nameAr: 'اللغة الإنجليزية' },
  { id: 'science', name: 'General Science', nameAr: 'العلوم العامة' },
  { id: 'physics', name: 'Physics', nameAr: 'الفيزياء' },
  { id: 'chemistry', name: 'Chemistry', nameAr: 'الكيمياء' },
  { id: 'biology', name: 'Biology', nameAr: 'الأحياء' },
];

export const MOCK_STUDENTS: Student[] = [
  {
    id: '1',
    email: 'ahmed@sb.local',
    name: 'Ahmed Al-Said',
    grade: '10th',
    riskLevel: 'high',
    issueSummary: 'Falling behind in Mathematics; 3 missing assignments.',
    attendance: 85,
    missingTasks: ['Calculus Quiz 2', 'Algebra Homework #4', 'Weekly Reflection'],
    recentScores: [45, 52, 60, 48, 55],
    subjects: [
      { id: 'math', name: 'Mathematics', progress: 45, score: 55, risk: 'high', lastImprovement: 12 },
      { id: 'islamic', name: 'Islamic Studies', progress: 88, score: 82, risk: 'low', lastImprovement: 5 },
      { id: 'arabic', name: 'Arabic', progress: 62, score: 68, risk: 'medium', lastImprovement: -2 }
    ],
    points: 450,
    level: 4,
    badges: [
      { id: 'b1', name: 'Early Bird', icon: '🌅', description: 'Submitted 5 tasks before deadline' },
      { id: 'b2', name: 'Help Seeker', icon: '🙋', description: 'Asked for help when stuck' }
    ],
    moodHistory: [
      { date: '2026-03-30', mood: 'neutral' },
      { date: '2026-03-31', mood: 'sad' },
      { date: '2026-04-01', mood: 'stressed' }
    ],
    strengths: ['Arabic', 'Islamic Studies'],
    weaknesses: ['Mathematics', 'Physics'],
    isPeerMentor: false,
    studyPlan: {
      id: 'sp1',
      title: 'Math Recovery Plan',
      tasks: [
        { id: 't1', title: 'Quadratic Equations Basics', type: 'video', completed: true, duration: '10m' },
        { id: 't2', title: 'Practice Set: Factoring', type: 'practice', completed: false, duration: '20m' },
        { id: 't3', title: 'Weekly Quiz Prep', type: 'practice', completed: false, duration: '15m' }
      ]
    }
  },
  {
    id: '2',
    email: 'fatima@sb.local',
    name: 'Fatima Al-Balushi',
    grade: '10th',
    riskLevel: 'medium',
    issueSummary: 'Sudden drop in engagement levels.',
    attendance: 98,
    missingTasks: ['Biology Lab Report'],
    recentScores: [88, 92, 75, 70, 68],
    subjects: [
      { id: 'biology', name: 'Biology', progress: 75, score: 72, risk: 'medium', lastImprovement: -15 },
      { id: 'social', name: 'Social Studies', progress: 95, score: 90, risk: 'low', lastImprovement: 2 },
      { id: 'english', name: 'English', progress: 100, score: 95, risk: 'low', lastImprovement: 0 }
    ],
    points: 1200,
    level: 12,
    badges: [
      { id: 'b3', name: 'Perfect Attendance', icon: '📅', description: '100% attendance for 3 months' },
      { id: 'b4', name: 'Artistic Soul', icon: '🎨', description: 'Top performer in Visual Arts' }
    ],
    moodHistory: [
      { date: '2026-04-01', mood: 'happy' }
    ],
    strengths: ['Social Studies', 'Biology'],
    weaknesses: ['Physics'],
    isPeerMentor: true
  },
  {
    id: '3',
    email: 'salim@sb.local',
    name: 'Salim Al-Harthy',
    grade: '10th',
    riskLevel: 'low',
    issueSummary: 'Consistently performing well.',
    attendance: 95,
    missingTasks: [],
    recentScores: [92, 95, 88, 94, 91],
    subjects: [
      { id: 'math', name: 'Mathematics', progress: 92, score: 94, risk: 'low', lastImprovement: 3 },
      { id: 'physics', name: 'Physics', progress: 98, score: 96, risk: 'low', lastImprovement: 5 }
    ],
    points: 2500,
    level: 25,
    badges: [
      { id: 'b5', name: 'Math Whiz', icon: '🔢', description: 'Score above 90% in all Math tests' },
      { id: 'b6', name: 'Code Ninja', icon: '💻', description: 'Mastered advanced algorithms' }
    ],
    moodHistory: [
      { date: '2026-04-01', mood: 'happy' }
    ],
    strengths: ['Mathematics', 'Physics'],
    weaknesses: [],
    isPeerMentor: true
  }
];

export const PARENT_TIPS = [
  "Ask about specific challenges in Mathematics homework.",
  "Schedule a 15-minute quiet reading time daily.",
  "Check the SchoolBridge portal every Tuesday for new alerts.",
  "Celebrate the 95% attendance rate this month!"
];

export const TRANSLATIONS = {
  en: {
    welcome: "Welcome to SchoolBridge",
    selectRole: "Select your role to explore the prototype",
    student: "I am a Student",
    teacher: "I am a Teacher",
    parent: "I am a Parent",
    login: "Login",
    username: "Username",
    password: "Password",
    switchRole: "Switch Role",
    home: "Home",
    progress: "Progress",
    help: "Help",
    chat: "Chat",
    class: "Class",
    students: "Students",
    alerts: "Alerts",
    library: "Library",
    grades: "Grades",
    teacherContact: "Teacher",
    studyBuddy: "Study Buddy",
    focusMode: "Focus Mode",
    studyPlan: "Study Plan",
    peerSupport: "Peer Support",
    yourProgress: "Your Progress",
    attentionNeeded: "Attention Needed",
    moodQuestion: "How are you feeling today?",
    level: "Level",
    xp: "XP",
    badges: "Badges",
    omanCurriculum: "Omani National Curriculum",
    privateChat: "Private Chat",
    messageTeacher: "Message Teacher",
    messageSchool: "Message School Counselor",
    academicSummary: "Academic Summary",
    howToHelp: "How to Help at Home",
    teacherNotes: "Teacher Notes",
    reply: "Reply",
    anonymousBoard: "Ask Without Fear Board",
    struggleDetector: "Silent Struggle Detector",
    riskAlerts: "Risk Alerts",
    emotionalAlerts: "Emotional Alerts",
    aiInsights: "AI Insights",
    internalNote: "Add Internal Note",
    saveNote: "Save Note",
    viewHistory: "View History",
    emailParent: "Email Parent",
    assignTutor: "Assign Tutor",
    messageStudent: "Message Student",
    quickActions: "Quick Actions",
    riskProfile: "Risk Profile",
    recentIssues: "Recent Issues",
    attendance: "Attendance",
    engagement: "Engagement",
    viewAnalysis: "View Analysis",
    anonymousStudent: "Anonymous Student",
    answerPrivately: "Answer Privately",
    postToClass: "Post to Class",
  },
  ar: {
    welcome: "مرحباً بك في سكول بريدج",
    selectRole: "اختر دورك لاستكشاف النموذج الأولي",
    student: "أنا طالب",
    teacher: "أنا معلم",
    parent: "أنا ولي أمر",
    login: "تسجيل الدخول",
    username: "اسم المستخدم",
    password: "كلمة المرور",
    switchRole: "تغيير الدور",
    home: "الرئيسية",
    progress: "التقدم",
    help: "المساعدة",
    chat: "المحادثة",
    class: "الفصل",
    students: "الطلاب",
    alerts: "التنبيهات",
    library: "المكتبة",
    grades: "الدرجات",
    teacherContact: "المعلم",
    studyBuddy: "رفيق الدراسة",
    focusMode: "وضع التركيز",
    studyPlan: "خطة الدراسة",
    peerSupport: "دعم الأقران",
    yourProgress: "تقدمك",
    attentionNeeded: "يحتاج للاهتمام",
    moodQuestion: "كيف تشعر اليوم؟",
    level: "المستوى",
    xp: "نقاط الخبرة",
    badges: "الأوسمة",
    omanCurriculum: "المنهج الوطني العماني",
    privateChat: "محادثة خاصة",
    messageTeacher: "مراسلة المعلم",
    messageSchool: "مراسلة الأخصائي الاجتماعي",
    academicSummary: "الملخص الأكاديمي",
    howToHelp: "كيف تساعد في المنزل",
    teacherNotes: "ملاحظات المعلم",
    reply: "رد",
    anonymousBoard: "لوحة اسأل بدون خوف",
    struggleDetector: "كاشف الصعوبات الصامت",
    riskAlerts: "تنبيهات المخاطر",
    emotionalAlerts: "التنبيهات العاطفية",
    aiInsights: "رؤى الذكاء الاصطناعي",
    internalNote: "إضافة ملاحظة داخلية",
    saveNote: "حفظ الملاحظة",
    viewHistory: "عرض السجل",
    emailParent: "مراسلة ولي الأمر",
    assignTutor: "تعيين معلم خصوصي",
    messageStudent: "مراسلة الطالب",
    quickActions: "إجراءات سريعة",
    riskProfile: "ملف المخاطر",
    recentIssues: "المشكلات الأخيرة",
    attendance: "الحضور",
    engagement: "التفاعل",
    viewAnalysis: "عرض التحليل",
    anonymousStudent: "طالب مجهول",
    answerPrivately: "رد خاص",
    postToClass: "نشر للفصل",
  }
};
