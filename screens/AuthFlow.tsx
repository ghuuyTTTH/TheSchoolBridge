
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../AuthContext';
import { Role } from '../types';
import { Bridge } from '../components/Shared';
import { Globe, ArrowLeft, ArrowRight, Mail, Lock, User as UserIcon, School, GraduationCap, Users } from 'lucide-react';

export const AuthFlow: React.FC = () => {
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    extraField: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submissionError, setSubmissionError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Capture join code from URL
  const [joinCode, setJoinCode] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('join');
    if (code) {
      setJoinCode(code.toUpperCase());
      // If we have a join code, default to signup for students if they don't have an account
      // but let them decide. Actually, just pre-fill if possible.
    }
  }, []);

  useEffect(() => {
    const handleNavigation = async () => {
      if (user) {
        if (joinCode && user.role === 'student') {
          await import('../services/classService').then(m => m.joinClass(joinCode, user.id));
        }
        navigate(`/${user.role}/dashboard`);
      }
    };
    handleNavigation();
  }, [user, navigate, joinCode]);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleBlur = (field: string) => {
    const newErrors = { ...errors };
    if (field === 'email' && formData.email) {
      if (!validateEmail(formData.email)) {
        newErrors.email = 'Enter a valid email address';
      } else {
        delete newErrors.email;
      }
    }
    if (field === 'password' && formData.password) {
      if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      } else {
        delete newErrors.password;
      }
    }
    if (field === 'extraField' && formData.extraField) {
      if (formData.extraField.length < 4) {
        newErrors.extraField = 'Must be at least 4 characters';
      } else {
        delete newErrors.extraField;
      }
    }
    setErrors(newErrors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionError('');
    
    // Final validation
    if (!formData.email || !formData.password || (mode === 'signup' && (!formData.name || !formData.extraField))) {
      setSubmissionError('All fields are required');
      return;
    }

    if (errors.email || errors.password || errors.extraField) return;

    setIsSubmitting(true);
    try {
      if (mode === 'signin') {
        const result = await signIn(formData.email, formData.password);
        if (!result.success) {
          setSubmissionError(result.error || 'Failed to sign in');
        }
      } else {
        if (!selectedRole) return;
        const result = await signUp(formData.name, formData.email, formData.password, selectedRole, formData.extraField);
        if (!result.success) {
          setSubmissionError(result.error || 'Failed to create account');
        }
      }
    } catch (err) {
      setSubmissionError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getExtraFieldLabel = () => {
    if (selectedRole === 'student') return 'Student ID';
    if (selectedRole === 'teacher') return 'School Code';
    if (selectedRole === 'parent') return "Child's Student ID";
    return '';
  };

  if (!selectedRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-blue-600 to-emerald-500 flex flex-col items-center justify-center p-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm bg-white/95 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-2xl border border-white/20"
        >
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-emerald-400 rounded-3xl flex items-center justify-center mb-6 text-3xl font-black text-white shadow-lg rotate-3 overflow-hidden">
              <Bridge className="w-12 h-12" />
            </div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight text-center">SchoolBridge</h1>
            <p className="text-slate-500 text-sm mt-3 text-center">Select your role to continue</p>
          </div>

          <div className="space-y-3">
            {[
              { id: 'student', label: 'Student', icon: <GraduationCap className="w-5 h-5" />, color: 'bg-blue-50 text-blue-600' },
              { id: 'teacher', label: 'Teacher', icon: <School className="w-5 h-5" />, color: 'bg-emerald-50 text-emerald-600' },
              { id: 'parent', label: 'Parent', icon: <Users className="w-5 h-5" />, color: 'bg-amber-50 text-amber-600' },
            ].map(r => (
              <button 
                key={r.id}
                onClick={() => setSelectedRole(r.id as Role)}
                className="w-full bg-white border border-slate-100 p-4 rounded-3xl text-left hover:border-blue-200 hover:bg-blue-50/30 transition-all flex items-center gap-4 group shadow-sm"
              >
                <span className={`text-xl w-10 h-10 rounded-2xl flex items-center justify-center ${r.color} group-hover:scale-110 transition-transform`}>{r.icon}</span>
                <span className="font-bold text-slate-700">{r.label}</span>
                <ArrowRight className="w-4 h-4 ml-auto text-slate-300 group-hover:text-blue-500 transition-colors" />
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 sm:p-8">
      <div className="w-full max-w-md relative">
        <button 
          onClick={() => setSelectedRole(null)}
          className="absolute -top-12 left-0 flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to roles
        </button>

        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100"
          >
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">
                {selectedRole} portal
              </div>
              <h2 className="text-2xl font-black text-slate-800">
                {mode === 'signin' ? 'Welcome Back' : 'Join SchoolBridge'}
              </h2>
              <p className="text-slate-500 text-sm mt-2">
                {mode === 'signin' ? 'Sign in to access your dashboard' : 'Create an account to get started'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Salim Al-Rawahi"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all text-slate-700"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="email"
                    required
                    placeholder="name@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    onBlur={() => handleBlur('email')}
                    className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border ${errors.email ? 'border-rose-300 ring-rose-500/10 ring-2' : 'border-slate-100'} rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all text-slate-700`}
                  />
                </div>
                {errors.email && <p className="text-[10px] font-bold text-rose-500 ml-1">{errors.email}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="password"
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    onBlur={() => handleBlur('password')}
                    className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border ${errors.password ? 'border-rose-300 ring-rose-500/10 ring-2' : 'border-slate-100'} rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all text-slate-700`}
                  />
                </div>
                {errors.password && <p className="text-[10px] font-bold text-rose-500 ml-1">{errors.password}</p>}
              </div>

              {mode === 'signup' && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">{getExtraFieldLabel()}</label>
                  <div className="relative">
                    <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                      type="text"
                      required
                      placeholder="Min 4 characters"
                      value={formData.extraField}
                      onChange={(e) => setFormData({...formData, extraField: e.target.value})}
                      onBlur={() => handleBlur('extraField')}
                      className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 border ${errors.extraField ? 'border-rose-300 ring-rose-500/10 ring-2' : 'border-slate-100'} rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all text-slate-700`}
                    />
                  </div>
                  {errors.extraField && <p className="text-[10px] font-bold text-rose-500 ml-1">{errors.extraField}</p>}
                </div>
              )}

              {mode === 'signin' && (
                <div className="text-right">
                  <button type="button" onClick={() => alert("To reset your password, contact your school administrator.")} className="text-[10px] font-bold text-blue-600 hover:underline">Forgot password?</button>
                </div>
              )}

              <button 
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-4 rounded-2xl font-black text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
                  isSubmitting ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98]'
                }`}
              >
                {isSubmitting ? (
                   <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {mode === 'signin' ? 'Signing in...' : 'Creating account...'}
                   </>
                ) : (
                  <>{mode === 'signin' ? 'Sign in' : 'Create account'}</>
                )}
              </button>

              {submissionError && (
                <motion.div 
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3"
                >
                  <div className="w-5 h-5 rounded-full bg-amber-200 flex items-center justify-center text-amber-700 text-xs flex-shrink-0">!</div>
                  <p className="text-xs font-bold text-amber-800 leading-tight">{submissionError}</p>
                </motion.div>
              )}
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <p className="text-sm text-slate-500">
                {mode === 'signin' ? "Don't have an account?" : "Already have an account?"}
                <button 
                  onClick={() => {
                    setMode(mode === 'signin' ? 'signup' : 'signin');
                    setSubmissionError('');
                    setErrors({});
                  }}
                  className="ml-1 font-bold text-blue-600 hover:underline"
                >
                  {mode === 'signin' ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
