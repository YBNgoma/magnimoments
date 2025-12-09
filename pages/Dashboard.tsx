import React, { useEffect, useState } from 'react';
import { User, MemorialWithRole, Role } from '../types';
import { getAccessibleMemorials, createMemorial } from '../services/mockBackend';
import { Plus, ArrowRight, User as UserIcon } from 'lucide-react';

interface DashboardProps {
  user: User;
  onSelectMemorial: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onSelectMemorial }) => {
  const [memorials, setMemorials] = useState<MemorialWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form State
  const [newName, setNewName] = useState('');
  const [newBirth, setNewBirth] = useState('');
  const [newDeath, setNewDeath] = useState('');
  const [newBio, setNewBio] = useState('');
  const [newOwnerEmail, setNewOwnerEmail] = useState('');

  useEffect(() => {
    loadMemorials();
  }, [user]);

  const loadMemorials = async () => {
    setLoading(true);
    try {
      const data = await getAccessibleMemorials(user);
      setMemorials(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMemorial(user, {
        fullName: newName,
        birthDate: newBirth,
        deathDate: newDeath,
        bio: newBio,
        slug: newName.toLowerCase().replace(/\s+/g, '-')
      }, newOwnerEmail);
      
      setShowCreateModal(false);
      setNewName(''); setNewBirth(''); setNewDeath(''); setNewBio(''); setNewOwnerEmail('');
      loadMemorials();
    } catch (e) {
      alert("Error creating memorial");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 animate-fade-in">
      <div className="flex items-end justify-between mb-12">
        <div>
          <h1 className="font-serif text-4xl text-stone-900 tracking-tight">Your Memorials</h1>
          <p className="text-stone-500 mt-2 font-light text-lg">Manage and contribute to your family legacies.</p>
        </div>
        {user.isSuperAdmin && (
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-stone-900 text-white px-6 py-3 rounded-full hover:bg-black transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
          >
            <Plus size={18} /> <span className="font-medium">New Memorial</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {[1,2,3].map(i => <div key={i} className="h-96 bg-stone-100 rounded-2xl animate-pulse"></div>)}
        </div>
      ) : memorials.length === 0 ? (
        <div className="text-center py-32 bg-white rounded-3xl border border-dashed border-stone-200">
          <p className="text-stone-400 mb-2 font-serif text-xl italic">No memorials found.</p>
          <p className="text-sm text-stone-500">
            {user.isSuperAdmin ? 'Start by creating a new memorial page.' : 'You haven\'t been invited to any memorials yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {memorials.map((m) => (
            <div 
              key={m.id} 
              onClick={() => onSelectMemorial(m.id)}
              className="group bg-white rounded-2xl overflow-hidden shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] transition-all duration-300 cursor-pointer flex flex-col h-full transform hover:-translate-y-1"
            >
              <div className="aspect-[4/3] overflow-hidden relative">
                <img 
                  src={m.coverPhotoUrl} 
                  alt={m.fullName} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
                <div className="absolute top-4 right-4">
                   {/* Role Badge */}
                   <span className={`text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full backdrop-blur-md text-white border border-white/20 ${
                    m.currentUserRole === Role.OWNER ? 'bg-amber-500/80' :
                    m.currentUserRole === Role.SUPER_ADMIN ? 'bg-stone-900/80' :
                    'bg-blue-500/80'
                  }`}>
                    {m.currentUserRole === Role.SUPER_ADMIN ? 'Admin' : m.currentUserRole}
                  </span>
                </div>
              </div>
              
              <div className="p-8 flex-grow flex flex-col">
                <h3 className="font-serif text-2xl text-stone-900 mb-1 group-hover:text-gold-600 transition-colors">{m.fullName}</h3>
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-4">
                  {new Date(m.birthDate).getFullYear()} — {new Date(m.deathDate).getFullYear()}
                </p>
                <p className="text-stone-500 text-sm leading-relaxed line-clamp-3 mb-6 font-light">
                  {m.bio}
                </p>
                
                <div className="mt-auto pt-6 border-t border-stone-100 flex items-center justify-between text-stone-400 group-hover:text-stone-900 transition-colors">
                  <span className="text-xs font-medium">View Memorial</span>
                  <ArrowRight size={16} className="-translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-8 animate-scale-up">
            <h2 className="font-serif text-3xl mb-6 text-stone-900">Create Memorial</h2>
            <form onSubmit={handleCreate} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Full Name</label>
                <input required className="w-full bg-stone-50 border-0 p-3 rounded-xl focus:ring-2 focus:ring-stone-200 transition-all" value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Johnathan Doe" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Birth Date</label>
                   <input required type="date" className="w-full bg-stone-50 border-0 p-3 rounded-xl focus:ring-2 focus:ring-stone-200" value={newBirth} onChange={e => setNewBirth(e.target.value)} />
                </div>
                <div>
                   <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Death Date</label>
                   <input required type="date" className="w-full bg-stone-50 border-0 p-3 rounded-xl focus:ring-2 focus:ring-stone-200" value={newDeath} onChange={e => setNewDeath(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Short Bio</label>
                <textarea required className="w-full bg-stone-50 border-0 p-3 rounded-xl focus:ring-2 focus:ring-stone-200 h-24 resize-none" value={newBio} onChange={e => setNewBio(e.target.value)} placeholder="Brief description..." />
              </div>
              <div className="bg-gold-50/50 p-4 rounded-xl border border-gold-100">
                <label className="block text-xs font-bold text-gold-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <UserIcon size={14} /> Primary Owner
                </label>
                <input required type="email" className="w-full bg-white border border-gold-200 p-3 rounded-lg focus:outline-none focus:border-gold-400" value={newOwnerEmail} onChange={e => setNewOwnerEmail(e.target.value)} placeholder="owner@family.com" />
              </div>
              
              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-5 py-2.5 text-stone-500 hover:bg-stone-50 rounded-xl transition-colors font-medium">Cancel</button>
                <button type="submit" className="px-6 py-2.5 bg-stone-900 text-white rounded-xl hover:bg-black transition-colors shadow-lg font-medium">Create Memorial</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};