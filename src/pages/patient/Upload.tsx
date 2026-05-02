import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, storage } from '../../lib/firebase';
import { useAuth } from '../../hooks/useAuth';
import { motion } from 'motion/react';
import { Upload, FileText, FileCheck, X, ArrowLeft, Loader2, Image as ImageIcon } from 'lucide-react';

export default function PatientUpload() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState<'prescription' | 'report'>('prescription');
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !profile) return;

    setLoading(true);
    try {
      // 1. Upload to Storage
      const storageRef = ref(storage, `records/${profile.uid}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const fileURL = await getDownloadURL(snapshot.ref);

      // 2. Save metadata to Firestore
      await addDoc(collection(db, 'records'), {
        patientId: profile.uid,
        fileURL,
        fileName: file.name,
        type,
        createdAt: serverTimestamp()
      });

      navigate('/patient/timeline');
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload file. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-500 hover:text-brand-600 transition-colors mb-6 font-medium"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100"
      >
        <div className="mb-8">
          <h1 className="text-2xl font-display font-bold text-slate-900">Upload Medical Record</h1>
          <p className="text-slate-500 mt-1">Add reports or prescriptions to your timeline</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* File Picker */}
          <div className="space-y-4">
            <label className="text-sm font-semibold text-slate-700 block px-1">Select Record File</label>
            <div 
              className={`relative border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center transition-all ${
                dragActive ? 'border-brand-500 bg-brand-50/50' : 'border-slate-200 hover:border-brand-300 bg-slate-50/30'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {file ? (
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center text-brand-600 mb-4">
                    {file.type.includes('image') ? <ImageIcon className="w-8 h-8" /> : <FileText className="w-8 h-8" />}
                  </div>
                  <p className="text-slate-900 font-semibold truncate max-w-[200px]">{file.name}</p>
                  <p className="text-slate-500 text-xs mt-1">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  <button 
                    type="button"
                    onClick={() => setFile(null)}
                    className="mt-4 text-red-500 hover:bg-red-50 px-4 py-1.5 rounded-lg text-sm font-medium transition-colors border border-red-100"
                  >
                    Change File
                  </button>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mb-4">
                    <Upload className="w-8 h-8" />
                  </div>
                  <p className="text-slate-700 font-semibold">Drag and drop file here</p>
                  <p className="text-slate-400 text-sm mt-1">or click to browse from device</p>
                  <input 
                    type="file" 
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept="image/*,application/pdf"
                  />
                </>
              )}
            </div>
          </div>

          {/* Record Type */}
          <div className="space-y-4">
            <label className="text-sm font-semibold text-slate-700 block px-1">Record Category</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setType('prescription')}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                  type === 'prescription' 
                    ? 'border-brand-500 bg-brand-50 text-brand-700' 
                    : 'border-slate-100 bg-white text-slate-500'
                }`}
              >
                <div className={`p-2 rounded-lg ${type === 'prescription' ? 'bg-brand-500 text-white' : 'bg-slate-100'}`}>
                  <FileText className="w-5 h-5" />
                </div>
                <span className="font-semibold">Prescription</span>
              </button>
              <button
                type="button"
                onClick={() => setType('report')}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                  type === 'report' 
                    ? 'border-brand-500 bg-brand-50 text-brand-700' 
                    : 'border-slate-100 bg-white text-slate-500'
                }`}
              >
                <div className={`p-2 rounded-lg ${type === 'report' ? 'bg-brand-500 text-white' : 'bg-slate-100'}`}>
                  <FileCheck className="w-5 h-5" />
                </div>
                <span className="font-semibold">Test Report</span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={!file || loading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-slate-200"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Upload className="w-5 h-5" />
                <span>Upload Medical Record</span>
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div >
  );
}
