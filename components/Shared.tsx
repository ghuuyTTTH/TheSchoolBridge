
import React from 'react';
import { RiskLevel } from '../types';
import { RISK_COLORS } from '../constants';
import { motion } from 'motion/react';

import { CheckCircle2, AlertCircle, LucideProps, X, LogOut } from 'lucide-react';

export const Bridge = (props: any) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 12c4 0 4-4 8-4s4 4 8 4" />
    <path d="M2 16c4 0 4-4 8-4s4 4 8 4" />
    <path d="M2 20h20" />
    <path d="M6 20v-6" />
    <path d="M18 20v-6" />
  </svg>
);

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const useToast = () => {
  const [toast, setToast] = React.useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const ToastComponent = toast ? (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-xl border ${
        toast.type === 'success' ? 'bg-emerald-500/90 border-emerald-400 text-white' : 'bg-rose-500/90 border-rose-400 text-white'
      }`}
    >
      {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
      <span className="font-bold text-sm tracking-tight">{toast.message}</span>
    </motion.div>
  ) : null;

  return { showToast, ToastComponent };
};

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => (
  <div 
    onClick={onClick}
    className={`bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/50 backdrop-blur-sm ${onClick ? 'active:scale-[0.98] transition-all cursor-pointer hover:shadow-lg hover:-translate-y-1' : ''} ${className}`}
  >
    {children}
  </div>
);

export const Badge: React.FC<{ level: RiskLevel; label?: string }> = ({ level, label }) => {
  const colors = RISK_COLORS[level];
  return (
    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-sm ${colors.bg} ${colors.text} ${colors.border}`}>
      {label || level}
    </span>
  );
};

export const ProgressBar: React.FC<{ progress: number; color?: string }> = ({ progress, color = 'bg-blue-500' }) => (
  <div className="w-full bg-slate-100/50 rounded-full h-3 overflow-hidden p-0.5 border border-slate-100">
    <div 
      className={`h-full rounded-full transition-all duration-1000 ease-out shadow-sm ${color}`} 
      style={{ width: `${progress}%` }}
    />
  </div>
);

export const Header: React.FC<{ title: string; subtitle?: string; avatar?: string; onBack?: () => void; onLogout?: () => void }> = ({ title, subtitle, avatar, onBack, onLogout }) => (
  <div className="flex items-center justify-between mb-8 pt-4">
    <div className="flex items-center gap-4">
      {onBack && (
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white shadow-sm border border-slate-100 active:scale-90 transition-transform">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
        </button>
      )}
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">{title}</h1>
        {subtitle && <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">{subtitle}</p>}
      </div>
    </div>
    <div className="flex items-center gap-3">
      {onLogout && (
        <button 
          onClick={onLogout}
          className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white shadow-sm border border-slate-100 text-slate-400 hover:text-rose-600 hover:bg-rose-50 active:scale-90 transition-all"
          title="Sign Out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      )}
      {avatar && (
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500 rounded-full blur-md opacity-20 animate-pulse"></div>
          <img src={avatar} alt="Avatar" className="w-12 h-12 rounded-2xl border-2 border-white shadow-md relative z-10 object-cover" />
        </div>
      )}
    </div>
  </div>
);

export const BottomNav: React.FC<{ activeTab: string; onChange: (tab: string) => void; items: { id: string; label: string; icon: React.ReactNode; badgeCount?: number }[] }> = ({ activeTab, onChange, items }) => (
  <div className="fixed bottom-6 left-6 right-6 bg-white/80 backdrop-blur-xl border border-white/20 px-4 py-3 flex justify-around rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] z-50">
    {items.map((item) => (
      <button
        key={item.id}
        onClick={() => onChange(item.id)}
        className={`flex flex-col items-center gap-1.5 transition-all relative px-4 py-1 ${activeTab === item.id ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
      >
        {activeTab === item.id && (
          <motion.div 
            layoutId="nav-pill"
            className="absolute inset-0 bg-blue-50 rounded-2xl -z-10"
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
        )}
        <div className={`transition-transform duration-300 relative ${activeTab === item.id ? 'scale-110' : ''}`}>
          {item.icon}
          {item.badgeCount !== undefined && item.badgeCount > 0 && (
            <span className="absolute -top-1 -right-2 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-bounce">
              {item.badgeCount}
            </span>
          )}
        </div>
        <span className="text-[10px] font-black uppercase tracking-tighter">{item.label}</span>
      </button>
    ))}
  </div>
);

export const SimulatedGmailNotification: React.FC<{ 
  title: string; 
  message: string; 
  onClose: () => void;
  onOpen: () => void;
  language?: string;
}> = ({ title, message, onClose, onOpen, language = 'en' }) => {
  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      className="fixed top-24 right-6 left-6 md:left-auto md:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-[100] flex"
    >
      <div className="w-1.5 bg-red-500" />
      <div className="p-4 flex gap-4 items-start w-full text-left">
        <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-red-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2m0 4l-8 5-8-5V6l8 5 8-5v2Z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Gmail • Just Now</span>
            <button onClick={onClose} className="text-slate-300 hover:text-slate-500 transition-all -mt-1">
              <X className="w-4 h-4" />
            </button>
          </div>
          <h4 className="text-xs font-black text-slate-800 truncate mb-0.5">{title}</h4>
          <p className="text-[11px] text-slate-500 leading-snug line-clamp-2 mb-2">{message}</p>
          <div className="flex gap-2">
            <button onClick={onOpen} className="px-3 py-1 bg-red-50 text-red-600 text-[10px] font-black rounded-lg uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all">
              {language === 'ar' ? 'فتح' : 'Open'}
            </button>
            <button onClick={onClose} className="px-3 py-1 bg-slate-50 text-slate-500 text-[10px] font-black rounded-lg uppercase tracking-widest hover:bg-slate-200 transition-all">
              {language === 'ar' ? 'تجاهل' : 'Dismiss'}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
