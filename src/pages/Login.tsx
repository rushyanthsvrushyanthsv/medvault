import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { HeartPulse, UserCircle, Stethoscope, ChevronRight, ExternalLink } from 'lucide-react';

export default function Login() {
  const [role, setRole] = useState<UserRole>('patient');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const { loginWithGoogle, loginEmail, signupEmail } = useAuth();

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await loginWithGoogle(role);
      navigate('/onboarding'); // Logic in useAuth handles existing user routing eventually
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isSignUp) {
        await signupEmail(email, password, role);
      } else {
        await loginEmail(email, password);
      }
      navigate('/onboarding');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password login is not enabled in your Firebase console. Please go to Authentication > Sign-in method to enable it.');
      } else {
        setError(err.message || 'Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-200/30 rounded-full blur-3xl -mr-64 -mt-64 transition-all"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-slate-200/30 rounded-full blur-3xl -ml-64 -mb-64 transition-all"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white/80 backdrop-blur-xl rounded-[40px] shadow-2xl shadow-slate-200/50 p-8 md:p-10 border border-white/50 relative z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-brand-600 rounded-[28px] mb-6 text-white shadow-xl shadow-brand-200 transform -rotate-3 hover:rotate-0 transition-all duration-500">
            <HeartPulse className="w-12 h-12" />
          </div>
          <h1 className="text-4xl font-display font-black text-slate-900 tracking-tighter">MedVault<span className="text-brand-600">.</span></h1>
          <p className="text-slate-500 mt-2 font-medium text-sm">Secure clinical vault for patients & doctors.</p>
        </div>

        <div className="mb-8">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 text-center">Identity Mode</p>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setRole('patient')}
              className={`flex flex-col items-center justify-center gap-3 p-4 rounded-[32px] border-2 transition-all duration-300 ${
                role === 'patient' 
                  ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-lg shadow-brand-100 ring-4 ring-brand-500/5 scale-105' 
                  : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'
              }`}
            >
              <UserCircle className={`w-10 h-10 ${role === 'patient' ? 'text-brand-600' : 'text-slate-300'}`} />
              <span className="text-[10px] font-black uppercase tracking-widest">Patient</span>
            </button>
            <button
              onClick={() => setRole('doctor')}
              className={`flex flex-col items-center justify-center gap-3 p-4 rounded-[32px] border-2 transition-all duration-300 ${
                role === 'doctor' 
                  ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-lg shadow-brand-100 ring-4 ring-brand-500/5 scale-105' 
                  : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'
              }`}
            >
              <Stethoscope className={`w-10 h-10 ${role === 'doctor' ? 'text-brand-600' : 'text-slate-300'}`} />
              <span className="text-[10px] font-black uppercase tracking-widest">Doctor</span>
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-red-50 text-red-600 p-4 rounded-2xl text-[11px] font-bold mb-6 border border-red-100 flex items-start gap-3"
            >
              <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5 flex-shrink-0 animate-pulse" />
              <div className="space-y-2">
                <p>{error}</p>
                {error.includes('operation-not-allowed') && (
                  <div className="mt-2 text-[10px] bg-white/50 p-2 rounded-lg border border-red-100 font-medium">
                    Please go to the <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="underline text-red-700 flex inline-flex items-center gap-1">Firebase Console <ExternalLink className="w-2 h-2" /></a> and enable 'Email/Password' under Authentication &rsaquo; Sign-in method.
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleEmailAuth} className="space-y-4 mb-6">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
            <input 
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all text-sm font-medium"
              placeholder="name@example.com"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
            <input 
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all text-sm font-medium"
              placeholder="••••••••"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-5 px-8 rounded-3xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 group shadow-xl shadow-slate-200"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <span>{isSignUp ? 'Initialize Vault' : 'Secure Login'}</span>
                <ChevronRight className="w-5 h-5 ml-auto group-hover:translate-x-2 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
          <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest"><span className="bg-white px-4 text-slate-400">or use passkey</span></div>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full bg-white hover:bg-slate-50 text-slate-600 font-bold py-4 px-8 border border-slate-100 rounded-3xl transition-all flex items-center justify-center gap-4 disabled:opacity-50 group mb-6 shadow-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#FBBC05" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#4285F4" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
            <path fill="#34A853" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          <span className="text-xs">Continue with Google</span>
        </button>

        <div className="text-center">
          <button 
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-[10px] font-black text-brand-600 hover:text-brand-700 transition-colors uppercase tracking-widest"
          >
            {isSignUp ? "Account Verified? Login Instead" : "Need Access? Initialize Account"}
          </button>
        </div>
        
        <p className="mt-8 text-center text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">HIPAA Compliant Cloud Architecture</p>
      </motion.div>
    </div>
  );
}
