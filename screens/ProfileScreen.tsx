
import React, { useState } from 'react';
import { Card, Header, useToast } from '../components/Shared';
import { Language, User } from '../types';
import { useData } from '../DataContext';
import { Camera, Save, User as UserIcon, Type, FileText } from 'lucide-react';
import { motion } from 'motion/react';
import { TRANSLATIONS } from '../constants';

interface ProfileScreenProps {
  user: User;
  onNavigate: (screen: string) => void;
  language: Language;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ user, onNavigate, language }) => {
  const { updateProfile } = useData();
  const { showToast, ToastComponent } = useToast();
  const t = TRANSLATIONS[language];
  const isRTL = language === 'ar';

  const [avatar, setAvatar] = useState(user.avatar || '');
  const [bio, setBio] = useState(user.bio || '');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limit for prototype base64 storage
        showToast(isRTL ? 'حجم الملف كبير جداً (الحد الأقصى 1 ميجابايت)' : 'File too large (max 1MB)', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    updateProfile(avatar, bio);
    showToast(isRTL ? 'تم تحديث الملف الشخصي بنجاح' : 'Profile updated successfully');
  };

  return (
    <div className="max-w-2xl mx-auto pb-12">
      <Header 
        title={isRTL ? 'الملف الشخصي' : 'User Profile'} 
        subtitle={isRTL ? 'إدارة معلوماتك الشخصية' : 'Manage your personal information'}
        onBack={() => onNavigate('dashboard')}
      />

      <div className="space-y-6">
        <section className="flex flex-col items-center">
          <div className="relative group">
            <div className="absolute inset-0 bg-blue-500 rounded-[2.5rem] blur-2xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <div className="relative w-40 h-40 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl bg-slate-100 flex items-center justify-center">
              {avatar ? (
                <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-20 h-20 text-slate-300" />
              )}
              <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                <Camera className="w-10 h-10 text-white" />
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>
            </div>
            <div className="absolute -bottom-2 -right-2 bg-blue-600 p-3 rounded-2xl shadow-xl text-white">
              <Camera className="w-5 h-5" />
            </div>
          </div>
          <h2 className="mt-6 text-2xl font-black text-slate-800">{user.name}</h2>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">{user.role}</p>
        </section>

        <Card className="space-y-6 p-8">
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest px-1">
              <Type className="w-4 h-4" />
              {isRTL ? 'الاسم المعروض' : 'Display Name'}
            </label>
            <div className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-slate-700 font-bold">
              {user.name}
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest px-1">
              <FileText className="w-4 h-4" />
              {isRTL ? 'سيرة ذاتية قصيرة' : 'Short Bio'}
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder={isRTL ? 'أخبرنا المزيد عن نفسك...' : 'Tell us a bit about yourself...'}
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 text-sm h-32 outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700 resize-none transition-all"
            />
          </div>

          <button
            onClick={handleSave}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-200 active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            <Save className="w-5 h-5" />
            <span className="uppercase tracking-widest">{isRTL ? 'حفظ التغييرات' : 'Save Changes'}</span>
          </button>
        </Card>

        <section className="bg-amber-50 border border-amber-100 rounded-3xl p-6 flex gap-4">
          <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center flex-shrink-0">
             <UserIcon className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h4 className="text-sm font-black text-amber-800 uppercase tracking-tight">{isRTL ? 'معلومات الحساب' : 'Account Info'}</h4>
            <p className="text-amber-700/70 text-xs font-medium mt-1">
              {isRTL ? 'بريدك الإلكتروني المسجل هو:' : 'Your registered email is:'} <span className="font-bold">{user.email}</span>
            </p>
          </div>
        </section>
      </div>
      {ToastComponent}
    </div>
  );
};
