import React, { useState } from 'react';
import { User } from '../types';
import { login } from '../services/mockBackend';
import { Heart, ArrowRight } from 'lucide-react';

interface AuthProps {
  onLogin: (user: User) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const user = await login(email);
      if (user) {
        onLogin(user);
      } else {
        setError('Login failed. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FBFBF9] relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[50vw] h-[50vh] bg-gold-100 rounded-full blur-[120px] opacity-40 -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[40vw] h-[40vh] bg-stone-200 rounded-full blur-[100px] opacity-40 translate-y-1/2 -translate-x-1/2"></div>

      <div className="w-full max-w-md p-8 relative z-10 animate-fade-in-up">
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-[0_20px_40px_-12px_rgba(0,0,0,0.05)] border border-white p-10">
          <div className="flex flex-col items-center mb-10">
            <div className="w-14 h-14 bg-stone-900 rounded-2xl rotate-3 flex items-center justify-center text-gold-300 mb-6 shadow-xl shadow-stone-900/10">
              <Heart size={28} fill="currentColor" className="-rotate-3" />
            </div>
            <h1 className="font-serif text-4xl text-stone-900 mb-3 tracking-tight">Magnimoments</h1>
            <p className="text-stone-500 text-center text-sm font-light leading-relaxed max-w-[260px]">
              A private sanctuary for your family's most cherished memories.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider ml-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-3 bg-white/50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-stone-900/5 focus:border-stone-400 outline-none transition-all placeholder:text-stone-300"
                placeholder="you@family.com"
              />
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-stone-900 text-white font-medium rounded-xl hover:bg-black transition-all shadow-lg shadow-stone-900/20 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:shadow-none"
            >
              {loading ? 'Accessing...' : 'Enter Sanctuary'}
              {!loading && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-stone-100">
            <p className="text-[10px] text-stone-400 text-center uppercase tracking-widest mb-4">Demo Access</p>
            <div className="flex gap-2 justify-center flex-wrap">
              <button onClick={() => setEmail('admin@magnimoments.com')} className="px-3 py-1.5 bg-white border border-stone-100 text-stone-600 text-xs rounded-lg hover:border-stone-300 transition-colors">Admin</button>
              <button onClick={() => setEmail('jane@family.com')} className="px-3 py-1.5 bg-white border border-stone-100 text-stone-600 text-xs rounded-lg hover:border-stone-300 transition-colors">Jane (Owner)</button>
              <button onClick={() => setEmail('new@family.com')} className="px-3 py-1.5 bg-white border border-stone-100 text-stone-600 text-xs rounded-lg hover:border-stone-300 transition-colors">Guest</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};