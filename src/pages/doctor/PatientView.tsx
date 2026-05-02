import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { UserProfile, MedicalRecord } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  User, 
  ShieldAlert, 
  Lock, 
  AlertCircle, 
  FileText, 
  FileCheck, 
  Calendar,
  ExternalLink,
  Droplets,
  MapPin,
  ClipboardCheck
} from 'lucide-react';

export default function PatientView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<UserProfile | null>(null);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    if (!id) return;

    const patientRef = doc(db, 'users', id);
    
    const unsubscribePatient = onSnapshot(patientRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        if (!data.isSharingEnabled) {
          setAccessDenied(true);
          setLoading(false);
          setPatient(data);
        } else {
          setAccessDenied(false);
          setPatient({ ...data, uid: id });
          // Fetch records if shared
          const q = query(
            collection(db, 'records'),
            where('patientId', '==', id),
            orderBy('createdAt', 'desc')
          );
          
          const unsubscribeRecords = onSnapshot(q, (recordsSnap) => {
            const docs = recordsSnap.docs.map(d => ({ id: d.id, ...d.data() } as MedicalRecord));
            setRecords(docs);
            setLoading(false);
          }, (error) => {
            handleFirestoreError(error, OperationType.GET, `records (patient: ${id})`);
          });

          return () => unsubscribeRecords();
        }
      } else {
        setLoading(false);
      }
    }, (error) => {
      if (error.message.includes('permission-denied')) {
        setAccessDenied(true);
      } else {
        handleFirestoreError(error, OperationType.GET, `users/${id}`);
      }
      setLoading(false);
    });

    return () => unsubscribePatient();
  }, [id]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      <p className="text-slate-500 font-medium">Authorizing access...</p>
    </div>
  );

  if (!patient) return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-3xl text-center border border-slate-100 shadow-sm">
      <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
      <h2 className="text-xl font-bold text-slate-900">Patient not found</h2>
      <p className="text-slate-500 mt-2 mb-6">The patient ID provided does not exist in our record.</p>
      <button onClick={() => navigate('/doctor/dashboard')} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold">Return Home</button>
    </div>
  );

  if (accessDenied) return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-3xl text-center border border-red-100 shadow-xl shadow-red-50">
      <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <Lock className="w-10 h-10 text-red-500" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 leading-tight">Access Denied</h2>
      <p className="text-slate-500 mt-3 mb-8">Patient <strong>{patient.name}</strong> has disabled profile sharing. Please ask them to enable it in their dashboard.</p>
      <button 
        onClick={() => navigate('/doctor/dashboard')}
        className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" /> Go Back
      </button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      <button 
        onClick={() => navigate('/doctor/dashboard')}
        className="flex items-center gap-2 text-slate-500 hover:text-brand-600 transition-colors mb-2 font-medium"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      {/* Patient Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[32px] p-8 shadow-2xl shadow-slate-200/50 border border-slate-100"
      >
        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
          <div className="w-20 h-20 bg-brand-600 rounded-[24px] flex items-center justify-center text-white shadow-lg shadow-brand-200 border-4 border-white">
            <User className="w-10 h-10" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight">{patient.name}</h1>
              <span className="px-3 py-1 bg-brand-50 text-brand-600 text-[10px] font-bold uppercase tracking-widest rounded-full border border-brand-100">Verified</span>
            </div>
            <p className="text-slate-500 font-medium text-lg mt-1">{patient.gender} • {patient.age} years • <span className="font-mono text-sm">ID: {patient.uid}</span></p>
          </div>
          <div className="flex flex-col items-end text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
            <div className="flex items-center gap-2 text-green-600 font-bold bg-green-50 px-3 py-1.5 rounded-xl border border-green-100">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Live Access
            </div>
          </div>
        </div>

        {/* Stats Grid from Design Mockup */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100/50 shadow-sm">
            <p className="text-[10px] text-slate-400 uppercase font-bold mb-1 tracking-widest">Blood Type</p>
            <p className="text-3xl font-bold flex items-center gap-2">
              <Droplets className="w-5 h-5 text-red-500" /> {patient.bloodGroup}
            </p>
          </div>
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100/50 shadow-sm">
            <p className="text-[10px] text-slate-400 uppercase font-bold mb-1 tracking-widest">Address</p>
            <p className="text-sm font-bold text-slate-700 line-clamp-1">{patient.address}</p>
          </div>
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100/50 shadow-sm">
            <p className="text-[10px] text-slate-400 uppercase font-bold mb-1 tracking-widest">Records</p>
            <p className="text-3xl font-bold">{records.length} Files</p>
          </div>
        </div>
      </motion.div>

      {/* Records Timeline */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h3 className="text-xl font-bold text-slate-900 mb-6 font-display px-2">Medical Timeline</h3>

        {records.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-100">
            <p className="text-slate-500">No medical records uploaded by this patient yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {records.map((record, index) => (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center p-4 bg-white border border-slate-100 rounded-2xl hover:shadow-xl hover:shadow-slate-200/40 hover:border-slate-200 transition-all cursor-pointer group"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 transition-colors ${
                    record.type === 'prescription' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'
                  }`}>
                    {record.type === 'prescription' ? <FileText className="w-6 h-6" /> : <FileCheck className="w-6 h-6" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate uppercase tracking-tight">{record.fileName}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                      {record.type} • {record.createdAt?.toDate().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <a 
                    href={record.fileURL} 
                    target="_blank" 
                    rel="noreferrer"
                    className="px-6 py-2.5 bg-slate-900 group-hover:bg-brand-600 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                  >
                    View File
                  </a>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </div>
  );
}
