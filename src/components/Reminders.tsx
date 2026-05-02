import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Plus, Trash2, CheckCircle2, Clock, Pill, Calendar as CalendarIcon, Activity, X } from 'lucide-react';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, updateDoc, serverTimestamp, orderBy } from 'firebase/firestore';

interface Reminder {
  id: string;
  title: string;
  time: string;
  type: 'medication' | 'appointment' | 'checkup';
  completed: boolean;
}

export const Reminders: React.FC = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newType, setNewType] = useState<'medication' | 'appointment' | 'checkup'>('medication');

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'reminders'),
      where('userId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Reminder[];
      setReminders(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'reminders');
    });

    return () => unsubscribe();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newTime || !auth.currentUser) return;

    try {
      await addDoc(collection(db, 'reminders'), {
        userId: auth.currentUser.uid,
        title: newTitle,
        time: newTime,
        type: newType,
        completed: false,
        createdAt: serverTimestamp()
      });
      setShowAdd(false);
      setNewTitle('');
      setNewTime('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'reminders');
    }
  };

  const toggleComplete = async (id: string, current: boolean) => {
    try {
      await updateDoc(doc(db, 'reminders', id), {
        completed: !current
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `reminders/${id}`);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'reminders', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `reminders/${id}`);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'medication': return <Pill className="w-4 h-4" />;
      case 'appointment': return <CalendarIcon className="w-4 h-4" />;
      case 'checkup': return <Activity className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-6 px-2">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Health Reminders</h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">Stay on Track</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="w-10 h-10 bg-slate-100 hover:bg-brand-600 hover:text-white text-slate-600 rounded-xl flex items-center justify-center transition-all shadow-sm"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-3">
        {reminders.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100">
            <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No active reminders</p>
          </div>
        ) : (
          reminders.map((reminder) => (
            <motion.div
              key={reminder.id}
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                reminder.completed ? 'bg-slate-50 border-slate-100' : 'bg-white border-slate-100 hover:border-brand-200'
              }`}
            >
              <button 
                onClick={() => toggleComplete(reminder.id, reminder.completed)}
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                  reminder.completed ? 'bg-green-500 text-white' : 'border-2 border-slate-200'
                }`}
              >
                {reminder.completed && <CheckCircle2 className="w-4 h-4" />}
              </button>
              
              <div className="flex-1 min-w-0">
                <h3 className={`font-bold text-sm truncate ${reminder.completed ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                  {reminder.title}
                </h3>
                <div className="flex items-center gap-3 mt-1">
                   <div className={`p-1 rounded-md ${
                     reminder.type === 'medication' ? 'bg-blue-50 text-blue-500' :
                     reminder.type === 'appointment' ? 'bg-purple-50 text-purple-500' :
                     'bg-green-50 text-green-500'
                   }`}>
                     {getTypeIcon(reminder.type)}
                   </div>
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                     <Clock className="w-3 h-3" /> {reminder.time}
                   </span>
                </div>
              </div>

              <button 
                onClick={() => handleDelete(reminder.id)}
                className="p-2 text-slate-300 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))
        )}
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[32px] p-8 w-full max-w-sm shadow-2xl relative"
            >
              <button 
                onClick={() => setShowAdd(false)}
                className="absolute right-6 top-6 p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
              
              <h3 className="text-2xl font-bold text-slate-900 mb-6">New Reminder</h3>
              
              <form onSubmit={handleAdd} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Title</label>
                  <input 
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Ex: Take Vitamin C"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Time</label>
                    <input 
                      type="time"
                      required
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Category</label>
                    <select 
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as any)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all appearance-none"
                    >
                      <option value="medication">Meds</option>
                      <option value="appointment">Visit</option>
                      <option value="checkup">Checkup</option>
                    </select>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 rounded-xl mt-4 transition-all shadow-lg shadow-brand-100"
                >
                  Create Plan
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
