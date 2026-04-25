
import React, { useState } from 'react';
import { Card, Header, Badge, ProgressBar, useToast } from '../components/Shared';
import { Student, Language } from '../types';
import { PARENT_TIPS, TRANSLATIONS } from '../constants';
import { useData } from '../DataContext';
import { useAuth } from '../AuthContext';
import { PrivateChat } from './StudentScreens';
import { Star, Award, Smile, Meh, Frown, AlertTriangle, MessageCircle, Lightbulb, TrendingUp, Clock } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  onNavigate?: (screen: string) => void;
  language?: Language;
}

export const ParentDashboard: React.FC<Props> = ({ onNavigate: parentOnNavigate, language: parentLanguage }) => {
  const { user: currentUser, signOut } = useAuth();
  const { myMoodLogs, currentChild } = useData();
  const { showToast, ToastComponent } = useToast();
  
  // Internal navigation state
  const [currentScreen, setCurrentScreen] = useState('dashboard');

  const language = parentLanguage || 'en';
  const onNavigate = (screen: string) => {
    setCurrentScreen(screen);
  };
  const t = TRANSLATIONS[language];

  if (currentScreen === 'private_chat') {
    return <PrivateChat onNavigate={onNavigate} language={language} />;
  }

  // If no child found
  if (!currentChild) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-8 text-center space-y-6">
        <div className="w-24 h-24 bg-rose-100 rounded-[2.5rem] flex items-center justify-center text-rose-600">
          <AlertTriangle className="w-12 h-12" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-800">{language === 'ar' ? 'لم يتم العثور على الطالب' : "Child not linked"}</h2>
          <p className="text-slate-500 mt-2">{language === 'ar' ? 'لم نتمكن من العثور على حساب طالب بهذا المعرف. تحقق من المعرف مع طفلك وحاول مرة أخرى.' : "We couldn't find a student account with that ID. Check the ID with your child and try again."}</p>
        </div>
        <button onClick={signOut} className="bg-slate-800 text-white font-black py-4 px-8 rounded-2xl shadow-lg active:scale-95 transition-all">
          {language === 'ar' ? 'العودة لتسجيل الدخول' : 'Back to Login'}
        </button>
      </div>
    );
  }

  // Adapter for child UI compatibility
  const childAdapter: Student = {
    id: currentChild.id,
    name: currentChild.name,
    email: currentChild.email,
    grade: 'Year 10',
    riskLevel: 'low',
    issueSummary: 'Doing well',
    attendance: 98,
    missingTasks: [],
    recentScores: [85, 90],
    subjects: [
      { id: 'math', name: 'Mathematics', progress: 75, score: 88, risk: 'low' },
      { id: 'science', name: 'Science', progress: 60, score: 92, risk: 'low' }
    ],
    points: 1250,
    level: 12,
    badges: [],
    moodHistory: [],
    strengths: [],
    weaknesses: [],
    isPeerMentor: false,
    currentMood: myMoodLogs.find(m => m.userId === currentChild.id)?.mood
  };

  const moodIcons = {
    happy: { icon: <Smile className="w-6 h-6 text-emerald-500" />, label: language === 'ar' ? 'ممتاز' : 'Great', color: 'bg-emerald-50' },
    neutral: { icon: <Meh className="w-6 h-6 text-blue-500" />, label: language === 'ar' ? 'جيد' : 'Okay', color: 'bg-blue-50' },
    sad: { icon: <Frown className="w-6 h-6 text-amber-500" />, label: language === 'ar' ? 'حزين' : 'Sad', color: 'bg-amber-50' },
    stressed: { icon: <AlertTriangle className="w-6 h-6 text-rose-500" />, label: language === 'ar' ? 'متوتر' : 'Stressed', color: 'bg-rose-50' },
  };

  return (
    <div className="pb-24 space-y-6">
      <Header 
        title={language === 'ar' ? `مرحباً، ولي أمر ${childAdapter.name.split(' ')[0]}` : `Hello, Mr./Ms. ${childAdapter.name.split(' ')[1] || childAdapter.name}`} 
        subtitle={language === 'ar' ? `بوابة ولي الأمر: ${childAdapter.name}` : `Parent Portal: ${childAdapter.name}`}
        avatar={currentUser?.avatar || "https://api.dicebear.com/7.x/initials/svg?seed=Parent"}
        onLogout={signOut}
      />

      {/* Student Stats Summary */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-none p-5 relative overflow-hidden shadow-xl shadow-blue-100">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
              <span className="text-[10px] font-black uppercase tracking-widest opacity-80">{t.level} {childAdapter.level}</span>
            </div>
            <div className="text-2xl font-black">{childAdapter.points} <span className="text-xs font-normal opacity-80">{t.xp}</span></div>
            <p className="text-[9px] font-black uppercase tracking-widest opacity-70 mt-2">{language === 'ar' ? 'التفاعل الأكاديمي' : 'Academic Engagement'}</p>
          </div>
          <Star className="absolute -right-4 -bottom-4 w-20 h-20 text-white/10 rotate-12" />
        </Card>
        {childAdapter.currentMood && (
          <Card className={`p-5 border-none flex flex-col justify-center shadow-sm ${moodIcons[childAdapter.currentMood].color}`}>
            <div className="flex items-center gap-2 mb-2">
              {moodIcons[childAdapter.currentMood].icon}
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{language === 'ar' ? 'الحالة المزاجية' : 'Current Mood'}</span>
            </div>
            <div className="text-xl font-black text-slate-800 tracking-tight">{moodIcons[childAdapter.currentMood].label}</div>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-2">{language === 'ar' ? 'آخر فحص: اليوم' : 'Last check-in: Today'}</p>
          </Card>
        )}
      </div>

      <div className="space-y-8">
        <section>
          <div className="flex justify-between items-center mb-4 px-1">
            <h2 className="text-lg font-black text-slate-800 tracking-tight">{language === 'ar' ? 'الملخص الأكاديمي' : 'Academic Summary'}</h2>
            <button 
              onClick={() => showToast(language === 'ar' ? 'جاري تحميل تقرير الدرجات الكامل...' : 'Loading full grade report...')}
              className="text-xs font-black text-blue-600 uppercase tracking-widest"
            >
              {language === 'ar' ? 'عرض الكل' : 'View All'}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {childAdapter.subjects.slice(0, 2).map(sub => (
              <Card key={sub.id} className="p-5 hover:shadow-md transition-all">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{language === 'ar' ? (sub.id === 'math' ? 'الرياضيات' : sub.name) : sub.name}</span>
                  <Badge level={sub.risk} />
                </div>
                <div className="text-3xl font-black text-slate-800 mb-3">{sub.score}%</div>
                <ProgressBar progress={sub.progress} color={sub.risk === 'high' ? 'bg-rose-400' : sub.risk === 'medium' ? 'bg-amber-400' : 'bg-emerald-400'} />
              </Card>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-black text-slate-800 mb-4 tracking-tight px-1">{language === 'ar' ? 'كيف تساعد في المنزل' : 'How to Help at Home'}</h2>
          <div className="space-y-3">
            {PARENT_TIPS.map((tip, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-4 bg-white p-5 rounded-[1.5rem] border border-slate-100 items-start shadow-sm hover:shadow-md transition-all"
              >
                <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner">
                  <Lightbulb className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">{tip}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-black text-slate-800 mb-4 tracking-tight px-1">{language === 'ar' ? 'ملاحظات المعلم' : 'Teacher Notes'}</h2>
          <Card className="border-l-4 border-l-blue-500 p-6 bg-blue-50/30 shadow-sm">
             <div className="flex justify-between items-start mb-3">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-xs shadow-md">TH</div>
                 <div>
                   <span className="font-black text-slate-800 text-sm tracking-tight">Ms. Henderson</span>
                   <div className="flex items-center gap-1 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                     <Clock className="w-3 h-3" />
                     Oct 14
                   </div>
                 </div>
               </div>
             </div>
             <p className="text-sm text-slate-600 mb-6 italic font-medium leading-relaxed">"{language === 'ar' ? 'أحمد طالب رائع في الفصل. نحن نعمل على التأكد من تسليم واجبات الرياضيات في وقتها!' : 'Alex is a delight in class. We\'re working on making sure those math homework assignments get in on time!'}"</p>
             <button 
               onClick={() => onNavigate('private_chat')}
               className="w-full py-4 bg-white text-blue-600 rounded-2xl font-black text-xs active:scale-95 transition-all flex items-center justify-center gap-2 shadow-sm border border-blue-100 uppercase tracking-widest"
             >
               <MessageCircle className="w-4 h-4" />
               {language === 'ar' ? 'الرد على المعلمة' : 'Reply to Ms. Henderson'}
             </button>
          </Card>
        </section>

        <button 
          onClick={() => onNavigate('private_chat')}
          className="w-full bg-slate-800 text-white py-5 rounded-2xl font-black shadow-xl shadow-slate-200 mt-4 active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest"
        >
           <MessageCircle className="w-5 h-5" />
           {language === 'ar' ? 'مراسلة الأخصائي الاجتماعي' : 'Message School Counselor'}
        </button>
      </div>
      {ToastComponent}
    </div>
  );
};
