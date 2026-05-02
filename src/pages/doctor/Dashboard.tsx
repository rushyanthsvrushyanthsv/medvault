import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Search, 
  QrCode, 
  Stethoscope, 
  ArrowRight,
  ClipboardList,
  Camera,
  CheckCircle2
} from 'lucide-react';
import { QRScanner } from '../../components/QRScanner';

export default function DoctorDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [patientId, setPatientId] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (patientId.trim()) {
      navigate(`/doctor/patient/${patientId.trim()}`);
    }
  };

  const handleQRScan = (decodedText: string) => {
    const uid = decodedText.split('/').pop();
    if (uid) {
      setPatientId(uid);
      setIsScanning(false);
      navigate(`/doctor/patient/${uid}`);
    }
  };

  if (!profile) return null;

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      <AnimatePresence>
        {isScanning && (
          <QRScanner 
            onScan={handleQRScan} 
            onClose={() => setIsScanning(false)} 
          />
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-8"
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center text-brand-600">
              <Stethoscope className="w-5 h-5" />
            </div>
            <p className="text-[10px] text-brand-600 font-black uppercase tracking-[0.2em]">Doctor Portal</p>
          </div>
          <h1 className="text-4xl font-display font-bold text-slate-900 tracking-tight">Welcome, Dr. {profile.name}</h1>
        </div>
        <div className="flex gap-2">
          <span className="px-4 py-1.5 bg-brand-50 text-brand-600 rounded-full text-[10px] font-bold uppercase tracking-widest border border-brand-100 shadow-sm flex items-center gap-2">
            <div className="w-2 h-2 bg-brand-500 rounded-full animate-pulse" />
            System Live
          </span>
        </div>
      </motion.div>

      {/* Primary Action Card - Bento Style */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-2 bg-white rounded-[40px] p-8 md:p-10 shadow-2xl shadow-slate-200/50 border border-slate-100 flex flex-col justify-between"
        >
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">Patient Retrieval</h2>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed max-w-md">Search and access end-to-end encrypted medical history by entering the specific patient identifier.</p>
            
            <form onSubmit={handleSearch} className="relative group">
              <div className="relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                <input 
                  type="text"
                  placeholder="Paste Patient ID..."
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="w-full pl-16 pr-32 py-6 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:ring-8 focus:ring-brand-500/5 focus:border-brand-500 outline-none transition-all font-mono text-lg shadow-inner"
                />
                <button 
                  type="submit"
                  disabled={!patientId.trim()}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 px-6 rounded-2xl transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-slate-200"
                >
                  Retrieve <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
             <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl text-[10px] font-bold text-slate-400 uppercase tracking-widest border border-slate-100">
               <CheckCircle2 className="w-3 h-3 text-green-500" /> AES-256 Encrypted
             </div>
             <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl text-[10px] font-bold text-slate-400 uppercase tracking-widest border border-slate-100">
               <CheckCircle2 className="w-3 h-3 text-green-500" /> Zero-Knowledge
             </div>
          </div>
        </motion.div>

        {/* QR Scan Action Card */}
        <motion.button 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          onClick={() => setIsScanning(true)}
          className="bg-brand-600 rounded-[40px] p-8 text-white flex flex-col items-center justify-center text-center group hover:bg-brand-700 transition-all shadow-2xl shadow-brand-200"
        >
          <div className="w-20 h-20 bg-white/20 rounded-[28px] backdrop-blur-md flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Camera className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold mb-2">Instant QR Access</h3>
          <p className="text-brand-100 text-xs leading-relaxed opacity-80">Scan patient's dashboard code for immediate report visualization.</p>
          
          <div className="mt-8 w-full py-4 bg-white/10 rounded-2xl border border-white/20 font-bold text-xs uppercase tracking-widest">
            Launch Camera
          </div>
        </motion.button>
      </div>

      {/* Bottom Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-8 bg-slate-900 rounded-[40px] text-white flex items-center gap-6">
           <div className="w-16 h-16 bg-slate-800 rounded-3xl flex items-center justify-center text-brand-400 flex-shrink-0">
             <ClipboardList className="w-8 h-8" />
           </div>
           <div>
             <h4 className="font-bold text-lg mb-1">Unified Timeline</h4>
             <p className="text-slate-400 text-sm leading-relaxed">Medical intelligence parsed into a single, cohesive patient history viewing experience.</p>
           </div>
        </div>
        <div className="p-8 bg-white border border-slate-100 rounded-[40px] flex items-center gap-6">
           <div className="w-16 h-16 bg-brand-50 rounded-3xl flex items-center justify-center text-brand-600 flex-shrink-0">
             <Users className="w-8 h-8" />
           </div>
           <div>
             <h4 className="font-bold text-lg text-slate-900 mb-1">Collaborative Care</h4>
             <p className="text-slate-500 text-sm leading-relaxed">Multi-specialist access supported through shared patient authorization keys.</p>
           </div>
        </div>
      </div>
    </div>
  );
}
