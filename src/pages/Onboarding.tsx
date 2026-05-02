import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'motion/react';
import { User, Mail, MapPin, UserPlus, Info, GraduationCap, Calendar, Users, Droplets } from 'lucide-react';

export default function Onboarding() {
  const { profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    bloodGroup: 'A+',
    address: '',
    degree: ''
  });

  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        name: profile.name || '',
      }));
      if (profile.onboarded) {
        navigate(profile.role === 'patient' ? '/patient/dashboard' : '/doctor/dashboard');
      }
    }
  }, [profile, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setLoading(true);

    try {
      const updateData: any = {
        name: formData.name,
        address: formData.address,
        onboarded: true,
      };

      if (profile.role === 'patient') {
        updateData.age = formData.age;
        updateData.gender = formData.gender;
        updateData.bloodGroup = formData.bloodGroup;
        updateData.isSharingEnabled = true;
      } else {
        updateData.degree = formData.degree;
      }

      await updateDoc(doc(db, 'users', profile.uid), updateData);
      navigate(profile.role === 'patient' ? '/patient/dashboard' : '/doctor/dashboard');
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return null;
  if (!profile) return <div className="p-8 text-center">Please login first.</div>;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 py-12 px-4 relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-200/20 rounded-full blur-3xl -mr-64 -mt-64"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-slate-200/20 rounded-full blur-3xl -ml-64 -mb-64"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto bg-white/80 backdrop-blur-xl rounded-[40px] shadow-2xl shadow-slate-200/50 overflow-hidden border border-white/50 relative z-10"
      >
        <div className="bg-brand-600 px-10 py-12 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
          <div className="relative z-10">
            <h1 className="text-4xl font-display font-black tracking-tight">Complete Profile<span className="text-brand-300">.</span></h1>
            <p className="text-brand-100 mt-2 font-medium uppercase tracking-[0.2em] text-xs">Registering as a {profile.role}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Common Field: Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <User className="w-3 h-3" /> Full Name
              </label>
              <input
                required
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all text-sm font-medium"
                placeholder="John Doe"
              />
            </div>

            {/* Common Field: Email (Read-only) */}
            <div className="space-y-1.5 opacity-60">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                <Mail className="w-3 h-3" /> Email Address
              </label>
              <input
                disabled
                type="email"
                value={profile.email}
                className="w-full px-5 py-4 bg-slate-100 border border-slate-100 rounded-2xl outline-none text-sm font-medium cursor-not-allowed"
              />
            </div>

            {profile.role === 'patient' ? (
              <>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Calendar className="w-3 h-3" /> Age
                  </label>
                  <input
                    required
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all text-sm font-medium"
                    placeholder="25"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Users className="w-3 h-3" /> Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all text-sm font-medium appearance-none"
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <Droplets className="w-3 h-3" /> Blood Group
                  </label>
                  <select
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all text-sm font-medium"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </>
            ) : (
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <GraduationCap className="w-3 h-3" /> Qualification
                </label>
                <input
                  required
                  type="text"
                  name="degree"
                  value={formData.degree}
                  onChange={handleChange}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all text-sm font-medium"
                  placeholder="MBBS, MD (Cardiology)"
                />
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
              <MapPin className="w-3 h-3" /> Clinical / Office Address
            </label>
            <textarea
              required
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={3}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none resize-none transition-all text-sm font-medium"
              placeholder="123 Health Street, Medical City..."
            />
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-5 rounded-3xl transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3 disabled:opacity-50 group mt-4"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <span>Secure and Finalize</span>
                <UserPlus className="w-5 h-5 ml-auto group-hover:translate-x-2 transition-transform" />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
