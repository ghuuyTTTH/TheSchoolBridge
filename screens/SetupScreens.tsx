
import React, { useState } from 'react';
import { Card, Header } from '../components/Shared';
import { OMANI_SUBJECTS, TRANSLATIONS } from '../constants';
import { Language } from '../types';
import { useData } from '../DataContext';
import { Plus, X, ArrowRight, UserPlus, Mail, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  language: Language;
}

export const TeacherSetup: React.FC<Props> = ({ language }) => {
  const { currentUser, createClass } = useData();
  const [step, setStep] = useState(1);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [className, setClassName] = useState('');
  const [students, setStudents] = useState<{ email: string, parentEmail: string }[]>([
    { email: '', parentEmail: '' }
  ]);

  const t = TRANSLATIONS[language];

  const handleCreate = async () => {
    if (currentUser && className && selectedSubjects.length > 0) {
      await createClass(currentUser.id, className, selectedSubjects, students.filter(s => s.email.includes('@')));
    }
  };

  const addStudentField = () => {
    setStudents([...students, { email: '', parentEmail: '' }]);
  };

  const updateStudent = (index: number, field: 'email' | 'parentEmail', value: string) => {
    const newStudents = [...students];
    newStudents[index][field] = value;
    setStudents(newStudents);
  };

  const removeStudent = (index: number) => {
    setStudents(students.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 pb-24">
      <Header title={language === 'ar' ? 'إعداد الفصل' : 'Class Setup'} subtitle={language === 'ar' ? `الخطوة ${step} من 3` : `Step ${step} of 3`} />

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <h2 className="text-xl font-black text-slate-800 tracking-tight">
              {language === 'ar' ? 'اختر المواد' : 'Step 1: Select Subjects'}
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {OMANI_SUBJECTS.map(sub => (
                <button
                  key={sub.id}
                  onClick={() => {
                    setSelectedSubjects(prev => prev.includes(sub.id) ? prev.filter(id => id !== sub.id) : [...prev, sub.id]);
                  }}
                  className={`p-5 rounded-3xl border-2 transition-all flex items-center justify-between group ${
                    selectedSubjects.includes(sub.id) ? 'border-blue-500 bg-blue-50' : 'border-slate-100 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedSubjects.includes(sub.id) ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <span className="font-black text-slate-700">{language === 'ar' ? sub.nameAr : sub.name}</span>
                  </div>
                  {selectedSubjects.includes(sub.id) && <Plus className="w-5 h-5 text-blue-600 rotate-45" />}
                </button>
              ))}
            </div>
            <button 
              disabled={selectedSubjects.length === 0}
              onClick={() => setStep(2)}
              className="w-full bg-slate-800 text-white py-5 rounded-3xl font-black flex items-center justify-center gap-2 disabled:opacity-50"
            >
              Next <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
            <h2 className="text-xl font-black text-slate-800 tracking-tight">
              {language === 'ar' ? 'اسم الفصل' : 'Step 2: Class Name'}
            </h2>
            <Card className="p-6">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2">Class Name (e.g. Grade 11-A)</label>
              <input 
                value={className}
                onChange={e => setClassName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 font-black text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Grade 10B"
              />
            </Card>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 py-5 rounded-3xl font-black text-slate-400 uppercase tracking-widest">Back</button>
              <button 
                disabled={!className}
                onClick={() => setStep(3)}
                className="flex-[2] bg-slate-800 text-white py-5 rounded-3xl font-black flex items-center justify-center gap-2 disabled:opacity-50"
              >
                Next <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
             <div className="flex justify-between items-center">
               <h2 className="text-xl font-black text-slate-800 tracking-tight">{language === 'ar' ? 'إضافة الطلاب' : 'Step 3: Add Students'}</h2>
               <button onClick={addStudentField} className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2"><UserPlus className="w-4 h-4"/> Add</button>
             </div>

             <div className="space-y-4">
               {students.map((s, i) => (
                 <Card key={i} className="p-5 space-y-4 relative">
                   {students.length > 1 && (
                     <button onClick={() => removeStudent(i)} className="absolute top-4 right-4 text-slate-300 hover:text-rose-500"><X className="w-4 h-4"/></button>
                   )}
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Mail className="w-3 h-3"/> Student Email (Gmail)</label>
                     <input 
                       value={s.email}
                       onChange={e => updateStudent(i, 'email', e.target.value)}
                       className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm font-medium"
                       placeholder="student@gmail.com"
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Mail className="w-3 h-3"/> Linked Parent Email</label>
                     <input 
                       value={s.parentEmail}
                       onChange={e => updateStudent(i, 'parentEmail', e.target.value)}
                       className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm font-medium"
                       placeholder="parent@gmail.com"
                     />
                   </div>
                 </Card>
               ))}
             </div>

             <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 py-5 rounded-3xl font-black text-slate-400 uppercase tracking-widest">Back</button>
              <button 
                disabled={students.some(s => !s.email.includes('@'))}
                onClick={handleCreate}
                className="flex-[2] bg-blue-600 text-white py-5 rounded-3xl font-black shadow-xl shadow-blue-200 active:scale-95 transition-all"
              >
                {language === 'ar' ? 'بدء الفصل' : 'Launch Class'} 🚀
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
