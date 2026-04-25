
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Card, Header, ProgressBar, Badge, useToast } from '../components/Shared';
import { Student, Mood, StudyPlan, Language } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Brain, 
  Timer, 
  Target, 
  Users, 
  MessageCircle, 
  Award, 
  Star, 
  TrendingUp, 
  AlertCircle, 
  ChevronRight, 
  Play, 
  CheckCircle2,
  Send,
  User as UserIcon,
  Sparkles,
  Zap,
  Smile,
  Meh,
  Frown,
  AlertTriangle,
  Paperclip,
  LogOut,
  Search,
  MessageSquare,
  Clock,
  HelpCircle
} from 'lucide-react';
import { explainLesson } from '../services/geminiService';
import { TRANSLATIONS } from '../constants';
import { useData } from '../DataContext';
import { useAuth } from '../AuthContext';
import * as classService from '../services/classService';

interface Props {
  onNavigate?: (screen: string, data?: any) => void;
  language?: Language;
  student?: Student;
}

export const JoinClassFlow: React.FC<{ language: Language, onJoined: () => void, onSignOut: () => void }> = ({ language, onJoined, onSignOut }) => {
  const { user } = useAuth();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shaking, setShaking] = useState(false);
  const { showToast } = useToast();
  const { joinClass } = classService;

  const handleSubmit = async (overrideCode?: string) => {
    const cleanCode = (overrideCode || code).trim().toUpperCase();
    if (!cleanCode) return;
    
    setLoading(true);
    setError('');
    
    try {
      const result = await joinClass(cleanCode, user!.id);
      if (result.success) {
        showToast(language === 'ar' ? 'تم الانضمام بنجاح!' : 'Successfully joined class!');
        onJoined();
      } else {
        setError(result.error || 'Something went wrong');
        setShaking(true);
        setTimeout(() => setShaking(false), 500);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const joinCode = params.get('join');
    if (joinCode) {
      setCode(joinCode.toUpperCase());
      handleSubmit(joinCode);
    }
  }, []);

  return (
    <div className="fixed inset-0 bg-white z-[200] flex flex-col p-8 overflow-y-auto">
      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full text-center space-y-12 py-12">
        <div className="space-y-4">
          <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white mx-auto shadow-xl shadow-blue-200">
             <Users className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">{language === 'ar' ? 'مرحباً بك في جسر المدرسة' : 'Welcome to SchoolBridge'}</h2>
          <p className="text-slate-500 font-medium">{language === 'ar' ? 'أدخل رمز المعلم أو رمز الفصل للبدء' : 'Enter the Teacher Code or Class Code to get started.'}</p>
        </div>

        <div className={`space-y-6 w-full ${shaking ? 'animate-shake' : ''}`}>
          <div className="flex flex-col gap-4">
            <input
              type="text"
              value={code}
              onChange={e => {
                setCode(e.target.value.toUpperCase());
                setError('');
              }}
              placeholder={language === 'ar' ? 'مثال: OMAN-10' : 'e.g. CLASS-10'}
              className={`w-full bg-slate-50 border-2 rounded-3xl py-6 text-center text-3xl font-black focus:ring-4 focus:ring-blue-100 outline-none transition-all tracking-widest ${
                error ? 'border-rose-300 bg-rose-50' : 'border-slate-100 focus:border-blue-500'
              }`}
            />
          </div>
          {error && <p className="text-rose-600 text-xs font-black uppercase tracking-widest">{error}</p>}
          <button
            onClick={handleSubmit}
            disabled={code.trim().length < 2 || loading}
            className="w-full bg-blue-600 text-white font-black py-5 rounded-3xl shadow-lg active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? (language === 'ar' ? 'جاري التحقق...' : 'Verifying...') : (language === 'ar' ? 'انضم الآن' : 'Join Class')}
          </button>
        </div>
        <button onClick={onSignOut} className="text-slate-400 font-bold hover:text-slate-600 flex items-center gap-2">
           <LogOut className="w-4 h-4" /> {language === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}
        </button>
      </div>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
        .animate-shake { animation: shake 0.2s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export const StudentDashboard: React.FC<Props> = ({ onNavigate: parentOnNavigate, language: parentLanguage }) => {
  const { user: currentUser, signOut } = useAuth();
  const { myMoodLogs, addMood, studentClass, refreshData, classTeacher } = useData();
  const { showToast, ToastComponent } = useToast();
  
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [selectedData, setSelectedData] = useState<any>(null);

  const language = parentLanguage || 'en';
  const onNavigate = (screen: string, data?: any) => {
    setCurrentScreen(screen);
    setSelectedData(data);
  };

  const t = TRANSLATIONS[language];

  if (!studentClass) {
    return <JoinClassFlow language={language} onJoined={refreshData} onSignOut={signOut} />;
  }

  // Student details derived from user and scoped data
  const savedProgress = localStorage.getItem(`student_progress_${currentUser?.id}`);
  const studentData = savedProgress ? JSON.parse(savedProgress) : null;

  const studentAdapter: Student = {
    id: currentUser!.id,
    name: currentUser!.name,
    email: currentUser!.email,
    grade: studentData?.grade || 'Year 10',
    riskLevel: studentData?.riskLevel || 'low',
    issueSummary: studentData?.issueSummary || 'Ready to learn!',
    attendance: studentData?.attendance || 100,
    missingTasks: studentData?.missingTasks || [],
    recentScores: studentData?.recentScores || [],
    subjects: studentData?.subjects || [
      { id: 'math', name: 'Mathematics', progress: 0, score: 0, risk: 'low' },
      { id: 'science', name: 'Science', progress: 0, score: 0, risk: 'low' }
    ],
    points: studentData?.points || 0,
    level: studentData?.level || 1,
    badges: studentData?.badges || [],
    moodHistory: [],
    strengths: studentData?.strengths || [],
    weaknesses: studentData?.weaknesses || [],
    isPeerMentor: studentData?.isPeerMentor || false,
    currentMood: myMoodLogs.sort((a,b) => b.timestamp - a.timestamp)[0]?.mood
  };

  if (currentScreen === 'ai_companion') return <AICompanion student={studentAdapter} onNavigate={onNavigate} language={language} />;
  if (currentScreen === 'focus_mode') return <FocusMode onNavigate={onNavigate} language={language} />;
  if (currentScreen === 'study_plan') return <StudyPlanView student={studentAdapter} onNavigate={onNavigate} language={language} />;
  if (currentScreen === 'peer_matching') return <PeerMatching student={studentAdapter} onNavigate={onNavigate} language={language} />;
  if (currentScreen === 'progress_detail') return <ProgressDetail student={studentAdapter} onNavigate={onNavigate} language={language} />;
  if (currentScreen === 'private_chat') return <PrivateChat onNavigate={onNavigate} language={language} />;
  if (currentScreen === 'help_request') return <HelpRequest onNavigate={onNavigate} language={language} />;

  const handleMoodSelect = (mood: Mood) => {
    addMood(mood);
    showToast(language === 'ar' ? 'شكراً لمشاركتنا شعورك!' : 'Thanks for sharing how you feel!');
  };

  const moodIcons = {
    happy: { icon: <Smile className="w-8 h-8 text-green-500" />, label: language === 'ar' ? 'ممتاز' : 'Great', color: 'bg-green-50' },
    neutral: { icon: <Meh className="w-8 h-8 text-blue-500" />, label: language === 'ar' ? 'جيد' : 'Okay', color: 'bg-blue-50' },
    sad: { icon: <Frown className="w-8 h-8 text-orange-500" />, label: language === 'ar' ? 'حزين' : 'Sad', color: 'bg-orange-50' },
    stressed: { icon: <AlertTriangle className="w-8 h-8 text-red-500" />, label: language === 'ar' ? 'متوتر' : 'Stressed', color: 'bg-red-50' },
  };

  return (
    <div className="pb-24 space-y-6">
      <Header 
        title={language === 'ar' ? `مرحباً، ${studentAdapter.name.split(' ')[0]} 👋` : `Hi, ${studentAdapter.name.split(' ')[0]} 👋`} 
        subtitle={studentClass.className}
        avatar={currentUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${studentAdapter.name}`}
        onLogout={signOut}
      />

      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-none p-5 relative overflow-hidden shadow-lg shadow-blue-100">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
              <span className="text-[10px] font-black uppercase tracking-widest opacity-80">{t.level} {studentAdapter.level}</span>
            </div>
            <div className="text-3xl font-black">{studentAdapter.points} <span className="text-sm font-normal opacity-80">{t.xp}</span></div>
          </div>
          <Star className="absolute -right-4 -bottom-4 w-24 h-24 text-white/10 rotate-12" />
        </Card>
        <Card className="bg-white p-5 flex flex-col justify-center shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4 text-purple-500" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.badges}</span>
          </div>
          <div className="flex -space-x-2 mt-1">
            {studentAdapter.badges.map((badge, i) => (
              <div key={i} className="w-10 h-10 rounded-xl bg-slate-50 border-2 border-white flex items-center justify-center text-xl shadow-sm">
                {badge.icon}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {!studentAdapter.currentMood && (
        <Card className="bg-gradient-to-br from-white to-slate-50 border-2 border-blue-100/50 shadow-xl p-6">
          <h3 className="font-black text-slate-800 mb-5 text-center tracking-tight">{t.moodQuestion}</h3>
          <div className="grid grid-cols-4 gap-3">
            {(Object.entries(moodIcons) as [Mood, any][]).map(([mood, data]) => (
              <button key={mood} onClick={() => handleMoodSelect(mood)} className={`flex flex-col items-center gap-2 p-4 rounded-[1.5rem] transition-all hover:scale-105 ${data.color}`}>
                <div>{data.icon}</div>
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-tighter">{data.label}</span>
              </button>
            ))}
          </div>
        </Card>
      )}

      <section>
        <h2 className="text-lg font-black text-slate-800 mb-4 tracking-tight">{language === 'ar' ? 'أدوات التعلم' : 'Learning Tools'}</h2>
        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => onNavigate('ai_companion')} className="flex flex-col items-start p-5 rounded-[2rem] bg-indigo-50 border border-indigo-100/50 hover:bg-indigo-100 transition-all text-left shadow-sm">
            <div className="w-12 h-12 bg-indigo-200 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
              <Brain className="w-7 h-7 text-indigo-600" />
            </div>
            <span className="font-black text-slate-800 text-sm tracking-tight">{t.studyBuddy}</span>
          </button>
          <button onClick={() => onNavigate('focus_mode')} className="flex flex-col items-start p-5 rounded-[2rem] bg-rose-50 border border-rose-100/50 hover:bg-rose-100 transition-all text-left shadow-sm">
            <div className="w-12 h-12 bg-rose-200 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
              <Timer className="w-7 h-7 text-rose-600" />
            </div>
            <span className="font-black text-slate-800 text-sm tracking-tight">{t.focusMode}</span>
          </button>
          <button onClick={() => onNavigate('study_plan')} className="flex flex-col items-start p-5 rounded-[2rem] bg-emerald-50 border border-emerald-100/50 hover:bg-emerald-100 transition-all text-left shadow-sm">
            <div className="w-12 h-12 bg-emerald-200 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
              <Target className="w-7 h-7 text-emerald-600" />
            </div>
            <span className="font-black text-slate-800 text-sm tracking-tight">{t.studyPlan}</span>
          </button>
          <button onClick={() => onNavigate('private_chat', classTeacher)} className="flex flex-col items-start p-5 rounded-[2rem] bg-blue-50 border border-blue-100/50 hover:bg-blue-100 transition-all text-left shadow-sm">
            <div className="w-12 h-12 bg-blue-200 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
              <MessageSquare className="w-7 h-7 text-blue-600" />
            </div>
            <span className="font-black text-slate-800 text-sm tracking-tight">{language === 'ar' ? 'اسأل المعلم' : 'Ask Teacher'}</span>
          </button>
          <button onClick={() => onNavigate('peer_matching')} className="flex flex-col items-start p-5 rounded-[2rem] bg-purple-50 border border-purple-100/50 hover:bg-purple-100 transition-all text-left shadow-sm">
            <div className="w-12 h-12 bg-purple-200 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
              <Users className="w-7 h-7 text-purple-600" />
            </div>
            <span className="font-black text-slate-800 text-sm tracking-tight">{t.peerSupport}</span>
          </button>
          <button onClick={() => onNavigate('help_request')} className="flex flex-col items-start p-5 rounded-[2rem] bg-amber-50 border border-amber-100/50 hover:bg-amber-100 transition-all text-left shadow-sm">
            <div className="w-12 h-12 bg-amber-200 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
              <HelpCircle className="w-7 h-7 text-amber-600" />
            </div>
            <span className="font-black text-slate-800 text-sm tracking-tight">{language === 'ar' ? 'أحتاج مساعدة' : 'I Need Help'}</span>
          </button>
        </div>
      </section>

      {/* Badges Section */}
      <section className="mt-8">
        <h2 className="text-lg font-black text-slate-800 mb-4 tracking-tight flex items-center justify-between">
          <span>{t.badges}</span>
          <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">{studentAdapter.badges.length}</span>
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2 scrollbar-hide">
          {studentAdapter.badges.length > 0 ? (
            studentAdapter.badges.map((badge, idx) => (
              <motion.div 
                key={badge.id + idx}
                whileHover={{ scale: 1.05 }}
                className="flex-shrink-0 flex flex-col items-center gap-3 p-5 bg-white rounded-[2rem] border border-slate-100 shadow-sm min-w-[120px]"
              >
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl shadow-inner">
                  <span>{badge.icon}</span>
                </div>
                <div className="text-center">
                  <span className="block text-[10px] font-black text-slate-800 uppercase tracking-tighter leading-none mb-1">{badge.name}</span>
                  {badge.unlockedAt && (
                    <span className="text-[8px] font-bold text-slate-400">
                      {new Date(badge.unlockedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>
              </motion.div>
            ))
          ) : (
            <div className="w-full py-10 flex flex-col items-center justify-center bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
              <Award className="w-10 h-10 text-slate-200 mb-3" />
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">
                {language === 'ar' ? 'لا توجد أوسمة بعد' : 'No badges earned yet'}
              </p>
              <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-1">
                {language === 'ar' ? 'استمر في الدراسة للحصول عليها!' : 'Keep learning to unlock them!'}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Progress Section */}
      {(studentAdapter.recentScores.length > 0 || studentAdapter.subjects.some(s => s.progress > 0)) && (
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-black text-slate-800 tracking-tight">{t.yourProgress}</h2>
            <button onClick={() => onNavigate('progress_detail')} className="text-xs font-black text-blue-600 uppercase">{language === 'ar' ? 'التفاصيل' : 'Details'}</button>
          </div>
          <div className="space-y-4">
            {studentAdapter.subjects.map(sub => (
              <Card key={sub.id} className="p-5 flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="font-black text-slate-700 text-sm">{sub.name}</span>
                  <Badge level={sub.risk} />
                </div>
                <ProgressBar progress={sub.progress} color={sub.progress < 50 ? 'bg-rose-400' : 'bg-emerald-400'} />
              </Card>
            ))}
          </div>
        </section>
      )}
      {ToastComponent}
    </div>
  );
};

export const PrivateChat: React.FC<Props> = ({ student: initialUser, onNavigate, language }) => {
  const { user: currentUser } = useAuth();
  const { myStudents, classmates, classTeacher, myMessages: messages, sendMessage } = useData();
  const { showToast, ToastComponent } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Scoped users: If teacher, show myStudents. If student, show classmates + classTeacher.
  const users = useMemo(() => {
    if (currentUser?.role === 'teacher') {
      return myStudents.map(s => ({ id: s.id, name: s.name, role: 'Student' }));
    }
    if (currentUser?.role === 'student') {
      const list = classmates.map(s => ({ id: s.id, name: s.name, role: 'Classmate' }));
      if (classTeacher) {
        list.unshift({ id: classTeacher.id, name: classTeacher.name, role: 'Teacher' });
      }
      return list;
    }
    return [];
  }, [currentUser, myStudents, classmates, classTeacher]);

  const [selectedUser, setSelectedUser] = useState<any>(initialUser || null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState('');
  const t = TRANSLATIONS[language || 'en'];

  // If initialUser is provided but not in full format, try to find it in our contact list
  useEffect(() => {
    if (initialUser && !selectedUser) {
      const found = users.find(u => u.id === initialUser.id || u.id === (initialUser as any).studentId);
      if (found) setSelectedUser(found);
      else setSelectedUser(initialUser); // Fallback to raw prop
    }
  }, [initialUser, users, selectedUser]);

  const searchResults = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const chatMessages = messages.filter(m => 
    selectedUser && (
      (m.senderId === currentUser?.id && m.receiverId === selectedUser.id) ||
      (m.senderId === selectedUser.id && m.receiverId === currentUser?.id)
    )
  );

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [chatMessages]);

  const handleSend = () => {
    if (!input.trim() || !selectedUser || !currentUser) return;
    sendMessage(selectedUser.id, input);
    setInput('');
  };

  return (
    <div className="flex flex-col h-[85vh]">
      <Header title={t.privateChat} onBack={() => onNavigate!('dashboard')} />
      {!selectedUser ? (
        <div className="space-y-6 overflow-y-auto">
          <div className="relative px-2">
            <Search className="absolute left-6 top-4 w-5 h-5 text-slate-400" />
            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 outline-none" />
          </div>
          <div className="space-y-3">
            {searchResults.map(u => (
              <button key={u.id} onClick={() => setSelectedUser(u)} className="w-full bg-white border border-slate-100 p-4 rounded-3xl text-left flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs ${u.role === 'Teacher' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    {u.name.split(' ').map(n=>n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-800">{u.name}</h4>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{u.role}</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300" />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="bg-blue-50/50 rounded-3xl p-4 flex items-center justify-between border border-blue-100 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-xs">{selectedUser.name.split(' ').map((n:any)=>n[0]).join('')}</div>
              <h4 className="text-sm font-black text-slate-800">{selectedUser.name}</h4>
            </div>
            <button onClick={() => setSelectedUser(null)} className="text-blue-600 text-[10px] font-black uppercase">Change</button>
          </div>
          <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
            {chatMessages.map((m, i) => (
              <div key={i} className={`flex ${m.senderId === currentUser?.id ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-4 rounded-3xl text-sm font-medium ${m.senderId === currentUser?.id ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-slate-700 shadow-sm border border-slate-100 rounded-tl-none'}`}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-full shadow-lg border border-slate-100 p-2 flex items-center gap-2">
            <input value={input} onChange={(e)=>setInput(e.target.value)} onKeyPress={(e)=>e.key==='Enter'&&handleSend()} placeholder="Type message..." className="flex-1 bg-transparent py-3 px-4 outline-none font-medium" />
            <button onClick={handleSend} className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center active:scale-90 transition-all shadow-lg shadow-blue-200">
              <Send className="w-5 h-5" />
            </button>
          </div>
        </>
      )}
      {ToastComponent}
    </div>
  );
};

export const AICompanion: React.FC<Props> = ({ student, onNavigate, language }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
    { role: 'ai', text: `Hi! I'm your Study Buddy. How can I help you today?` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const t = TRANSLATIONS[language || 'en'];

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);
    try {
      const response = await explainLesson(userMsg, 'intermediate');
      setMessages(prev => [...prev, { role: 'ai', text: response || "I'm sorry, I couldn't process that." }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: "Oops! Technical difficulties." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[85vh]">
      <Header title={t.studyBuddy} onBack={() => onNavigate!('dashboard')} />
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-3xl text-sm font-medium ${m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-slate-700 shadow-sm border border-slate-100 rounded-tl-none'}`}>
              {m.text}
            </div>
          </div>
        ))}
      </div>
      <div className="relative">
        <input value={input} onChange={(e)=>setInput(e.target.value)} onKeyPress={(e)=>e.key==='Enter'&&handleSend()} placeholder="Ask me anything..." className="w-full bg-white border border-slate-200 rounded-full py-4 pl-6 pr-14 outline-none" />
        <button onClick={handleSend} disabled={loading} className="absolute right-2 top-2 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center active:scale-90 transition-transform disabled:opacity-50">
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export const FocusMode: React.FC<Props> = ({ onNavigate, language }) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [task, setTask] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const t = TRANSLATIONS[language || 'en'];

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((time) => time - 1), 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isStarted) {
    return (
      <div className="pb-24">
        <Header title={t.focusMode} onBack={() => onNavigate!('dashboard')} />
        <Card className="p-8 text-center space-y-6">
          <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto"><Timer className="w-10 h-10 text-rose-600" /></div>
          <h2 className="text-xl font-black text-slate-800">Ready to focus?</h2>
          <input value={task} onChange={(e)=>setTask(e.target.value)} placeholder="What are you working on?" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center font-black outline-none" />
          <button onClick={() => setIsStarted(true)} disabled={!task} className="w-full bg-rose-600 text-white font-black py-4 rounded-3xl disabled:opacity-50 transition-all">Start Session</button>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900 z-[100] flex flex-col items-center justify-center p-8 text-white">
      <button onClick={() => onNavigate!('dashboard')} className="absolute top-8 left-8 p-3 rounded-2xl bg-white/10"><ChevronRight className="w-6 h-6 rotate-180" /></button>
      <div className="text-center space-y-12">
        <div className="space-y-2"><h2 className="text-2xl font-black tracking-tight">{task}</h2></div>
        <div className="relative w-64 h-64 flex items-center justify-center">
          <div className="text-6xl font-black tracking-tighter">{formatTime(timeLeft)}</div>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setIsActive(!isActive)} className={`w-32 py-4 rounded-3xl font-black transition-all ${isActive ? 'bg-white/10' : 'bg-rose-600 text-white'}`}>{isActive ? 'Pause' : 'Resume'}</button>
          <button onClick={() => { setTimeLeft(25 * 60); setIsActive(false); }} className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center"><Zap className="w-6 h-6" /></button>
        </div>
      </div>
    </div>
  );
};

export const StudyPlanView: React.FC<Props> = ({ student, onNavigate, language }) => {
  const { showToast, ToastComponent } = useToast();
  const { myStudyPlans } = useData();
  const t = TRANSLATIONS[language || 'en'];
  const plan = myStudyPlans[0]; 

  if (!plan) {
    return (
      <div className="pb-24">
        <Header title={t.studyPlan} onBack={() => onNavigate!('dashboard')} />
        <Card className="p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto"><Sparkles className="w-8 h-8 text-blue-600" /></div>
          <h3 className="font-black text-slate-800">No active plan</h3>
        </Card>
      </div>
    );
  }

  return (
    <div className="pb-24">
      <Header title={t.studyPlan} subtitle={plan.title} onBack={() => onNavigate!('dashboard')} />
      <div className="space-y-4">
        {plan.tasks.map((task:any) => (
          <Card key={task.id} className="p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${task.completed ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
              {task.completed ? <CheckCircle2 className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </div>
            <div className="flex-1">
              <h4 className="font-black text-slate-800 text-sm">{task.title}</h4>
              <span className="text-[10px] text-slate-400 font-black uppercase">{task.type} • {task.duration}</span>
            </div>
          </Card>
        ))}
      </div>
      {ToastComponent}
    </div>
  );
};

export const PeerMatching: React.FC<Props> = ({ student, onNavigate, language }) => {
  const { classmates } = useData();
  const { showToast, ToastComponent } = useToast();
  const t = TRANSLATIONS[language || 'en'];
  
  // Real potential matches from classmates
  const matches = classmates.map(c => ({
    id: c.id,
    name: c.name,
    match: 85 + Math.floor(Math.random() * 15),
    strength: 'Various',
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.name}`,
    raw: c
  }));

  return (
    <div className="pb-24">
      <Header title={t.peerSupport} onBack={() => onNavigate!('dashboard')} />
      <Card className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 mb-6">
        <h3 className="font-black text-lg mb-1">Peer Support</h3>
        <p className="text-xs opacity-80">Connect with classmates to study together.</p>
      </Card>
      {matches.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
          <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-400 font-black">No classmates found yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map((match) => (
            <Card key={match.id} className="p-5 flex items-center gap-4">
              <img src={match.avatar} alt={match.name} className="w-14 h-14 rounded-2xl object-cover shadow-sm" />
              <div className="flex-1">
                <h5 className="font-black text-slate-800">{match.name}</h5>
                <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold">Match: <span className="text-emerald-600">{match.match}%</span></p>
              </div>
              <button 
                onClick={() => onNavigate!('private_chat', match.raw)} 
                className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center shadow-sm hover:border-blue-200 hover:bg-blue-50 transition-all border border-transparent"
              >
                <MessageCircle className="w-6 h-6 text-slate-400" />
              </button>
            </Card>
          ))}
        </div>
      )}
      {ToastComponent}
    </div>
  );
};

export const HelpRequest: React.FC<{ onNavigate: (screen: string) => void; language: Language }> = ({ onNavigate, language }) => {
  const { sendHelpRequest } = useData();
  const [subject, setSubject] = useState('Mathematics');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!message) return;
    setLoading(true);
    await sendHelpRequest(subject, message, isAnonymous);
    setSent(true);
    setLoading(false);
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6 text-4xl">✅</div>
        <h2 className="text-2xl font-black text-slate-800 mb-2">{language === 'ar' ? 'تم إرسال الطلب!' : 'Request Sent!'}</h2>
        <p className="text-slate-500 mb-8">{language === 'ar' ? 'تم إخطار معلمك وسيتواصل معك قريباً. تذكر، من الجيد دائماً طلب المساعدة!' : 'Your teacher has been notified and will reach out soon. Remember, it\'s okay to ask for help!'}</p>
        <button 
          onClick={() => onNavigate('dashboard')}
          className="w-full bg-blue-600 text-white font-black py-4 rounded-3xl shadow-lg active:scale-95 transition-transform"
        >
          {language === 'ar' ? 'العودة للوحة القيادة' : 'Back to Dashboard'}
        </button>
      </div>
    );
  }

  return (
    <div className="pb-32">
      <Header title={language === 'ar' ? 'طلب مساعدة' : 'Get Help'} onBack={() => onNavigate('dashboard')} />
      <div className="space-y-6">
        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{language === 'ar' ? 'المادة الدراسية' : 'What subject do you need help with?'}</label>
              <select 
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-slate-800 font-bold appearance-none outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>Mathematics</option>
                <option>Science</option>
                <option>English</option>
                <option>Arabic</option>
                <option>Social Studies</option>
                <option>Islamic Studies</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{language === 'ar' ? 'صف مشكلتك' : 'Describe what\'s on your mind'}</label>
              <textarea 
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-slate-800 font-bold h-32 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={language === 'ar' ? 'أواجه صعوبة في فهم...' : 'I\'m struggling with the new concepts...'}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div>
                <span className="font-black text-slate-800 block text-sm">{language === 'ar' ? 'البقاء مجهولاً؟' : 'Stay Anonymous?'}</span>
                <span className="text-[10px] text-slate-400 font-bold">{language === 'ar' ? 'سيتم إخفاء هويتك في لوحة الفصل العامة' : 'Only your teacher will see your identity if they choose to reply privately'}</span>
              </div>
              <button 
                onClick={() => setIsAnonymous(!isAnonymous)}
                className={`w-12 h-6 rounded-full p-1 transition-all ${isAnonymous ? 'bg-blue-600' : 'bg-slate-300'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-all ${isAnonymous ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
        </Card>

        <button 
          onClick={handleSubmit}
          disabled={loading || !message}
          className="w-full bg-blue-600 disabled:opacity-50 text-white font-black py-4 rounded-3xl shadow-lg shadow-blue-200 active:scale-95 transition-transform flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Send className="w-5 h-5" />
              {language === 'ar' ? 'إرسال الطلب' : 'Submit Request'}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export const ProgressDetail: React.FC<Props> = ({ student, onNavigate, language }) => {
  const t = TRANSLATIONS[language || 'en'];
  const chartData = student.recentScores.length > 0 
    ? student.recentScores.map((score, i) => ({ name: `Week ${i + 1}`, score }))
    : [{ name: 'Start', score: 0 }];

  const avgImprovement = student.recentScores.length > 1 
    ? Math.round(((student.recentScores[student.recentScores.length - 1] - student.recentScores[0]) / student.recentScores[0]) * 100)
    : 0;

  return (
    <div className="pb-24">
      <Header title={t.progress} onBack={() => onNavigate!('dashboard')} />
      <div className="space-y-6">
        <Card className="p-6">
          <h3 className="font-black text-slate-800 mb-6 tracking-tight">Performance Trend</h3>
          {student.recentScores.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400">
              <TrendingUp className="w-12 h-12 mb-2 opacity-20" />
              <p className="font-black">{language === 'ar' ? 'لا توجد بيانات بعد' : 'No data available yet'}</p>
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} domain={[0, 100]} />
                  <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                  <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={4} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-5">
            <span className="text-[10px] font-black text-slate-400 uppercase">Avg Improve</span>
            <div className={`text-2xl font-black mt-1 ${avgImprovement >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {avgImprovement >= 0 ? '+' : ''}{avgImprovement}%
            </div>
          </Card>
          <Card className="p-5">
            <span className="text-[10px] font-black text-slate-400 uppercase">Status</span>
            <div className="text-xs font-bold text-blue-600 mt-1">
              {student.recentScores.length === 0 ? (language === 'ar' ? 'بانتظار البيانات' : 'Awaiting data') : (language === 'ar' ? 'مستقر' : 'Stable')}
            </div>
          </Card>
        </div>
        {student.recentScores.length > 0 && (
          <Card className="border-l-4 border-l-blue-500 p-6 bg-blue-50/30">
            <p className="text-sm text-slate-600 italic leading-relaxed">"Keep up the consistent effort. Focus on your upcoming assessments."</p>
            <div className="mt-4 flex items-center gap-2"><Clock className="w-3 h-3 text-slate-400"/><span className="text-[10px] font-black text-slate-400 uppercase">Feedback</span></div>
          </Card>
        )}
      </div>
    </div>
  );
};
