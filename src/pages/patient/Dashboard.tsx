import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { doc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'motion/react';
import { 
  Upload, 
  History, 
  Share2, 
  User, 
  Droplets, 
  Calendar, 
  MapPin, 
  QrCode,
  Lock,
  Unlock,
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { Reminders } from '../../components/Reminders';

export default function PatientDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const toggleSharing = async () => {
    if (!profile) return;
    try {
      await updateDoc(doc(db, 'users', profile.uid), {
        isSharingEnabled: !profile.isSharingEnabled
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${profile.uid}`);
    }
  };

  if (!profile) return null;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-10">
      {/* Profile Header Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[40px] p-2 shadow-2xl shadow-slate-200/50 border border-slate-100 flex flex-col md:flex-row gap-4 overflow-hidden"
      >
        <div className="flex-1 p-8 space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 bg-brand-50 rounded-[28px] flex items-center justify-center text-brand-600 shadow-inner border border-brand-100/50">
                <User className="w-10 h-10" />
              </div>
              <div>
                <p className="text-[10px] font-black text-brand-600 uppercase tracking-[0.3em] mb-1">Authenticated Account</p>
                <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight">{profile.name}</h1>
                <div className="flex gap-4 mt-2 text-sm font-bold text-slate-500">
                  <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-brand-500" /> {profile.age} Years</span>
                  <span className="flex items-center gap-1.5 text-slate-900">
                    <Droplets className="w-4 h-4 text-red-500" /> {profile.bloodGroup}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/patient/upload')}
                className="flex-1 md:flex-none bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 px-8 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-brand-100 active:scale-[0.98]"
              >
                <Upload className="w-4 h-4" /> Upload
              </button>
              <button
                onClick={() => navigate('/patient/timeline')}
                className="flex-1 md:flex-none bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold py-4 px-8 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <History className="w-4 h-4" /> History
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 border border-slate-100 p-6 rounded-3xl flex items-center justify-between group overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-20 h-20 text-slate-900" />
              </div>
              <div className="relative z-10">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Access Control</p>
                <p className="text-sm font-bold text-slate-900">Medical Visibility</p>
                <p className={`text-[10px] font-bold mt-1 px-2 py-0.5 rounded-full inline-block ${profile.isSharingEnabled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {profile.isSharingEnabled ? 'Public to Doctors' : 'Strictly Private'}
                </p>
              </div>
              <button 
                onClick={toggleSharing}
                className={`w-14 h-7 rounded-full transition-all relative p-1 z-10 ${profile.isSharingEnabled ? 'bg-brand-600' : 'bg-slate-300'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-all shadow-md ${profile.isSharingEnabled ? 'ml-7' : 'ml-0'}`}></div>
              </button>
            </div>

            <div className="bg-brand-600 p-6 rounded-3xl text-white flex items-center justify-between group cursor-pointer" onClick={() => window.dispatchEvent(new CustomEvent('open-healthu'))}>
               <div>
                 <p className="text-[10px] font-black text-brand-200 uppercase tracking-widest mb-1">AI Assistant</p>
                 <h4 className="font-bold">Chat with Healthu</h4>
                 <p className="text-[10px] text-brand-100/70 mt-1">Smart health diagnosis support</p>
               </div>
               <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md group-hover:scale-110 transition-transform">
                 <Sparkles className="w-6 h-6" />
               </div>
            </div>
          </div>
        </div>

        {/* QR Code Section - Dark Styled */}
        <div className="bg-slate-900 rounded-[38px] p-10 text-white flex flex-col items-center justify-center space-y-6 md:w-80 m-2 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-brand-500/20 rounded-full blur-3xl -ml-16 -mt-16"></div>
          <div className="bg-white p-5 rounded-3xl shadow-2xl relative z-10">
            <QRCodeSVG 
              value={`${window.location.origin}/doctor/patient/${profile.uid}`}
              size={160}
              level="H"
              includeMargin={false}
              fgColor="#0f172a"
            />
          </div>
          <div className="text-center relative z-10">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-3">Access Credential</p>
            <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl">
                <p className="text-[10px] text-slate-400 font-mono break-all">{profile.uid}</p>
            </div>
            <p className="text-[10px] text-slate-500 mt-4 leading-relaxed italic">Present this code to your healthcare provider for clinical review.</p>
          </div>
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <Reminders />
        </div>
        
        <div className="space-y-6">
            <div className="bg-slate-900 p-8 rounded-[40px] text-white overflow-hidden relative group cursor-pointer border border-slate-800">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-brand-500/20 transition-all"></div>
                <div className="relative z-10">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-brand-400 mb-6">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Pro Tip</p>
                    <h3 className="text-lg font-bold leading-tight mb-4">Hydration is a key metric in cellular recovery.</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">Drinking 2L of water daily reduces cognitive fatigue by up to 15%. Set a reminder above!</p>
                </div>
            </div>

            <div className="bg-slate-50 p-8 rounded-[40px] border border-slate-100 flex flex-col h-full justify-between">
                <div>
                    <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-brand-600 mb-6">
                        <MapPin className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Registered Address</h3>
                    <p className="text-slate-500 text-sm leading-relaxed mb-6">{profile.address}</p>
                </div>
                <button className="text-brand-600 font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all">
                    Update Details <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
