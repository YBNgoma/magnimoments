import React from 'react';
import { User } from '../types';
import { LogOut, Heart } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
  showNav?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, showNav = true }) => {
  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#FBFBF9]">
      {showNav && (
        <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white/80 backdrop-blur-md border-b border-stone-100/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            <div className="flex items-center gap-3 group cursor-default">
              <div className="w-10 h-10 bg-stone-900 rounded-full flex items-center justify-center text-gold-300 shadow-lg group-hover:scale-105 transition-transform duration-300">
                <Heart size={18} fill="currentColor" />
              </div>
              <span className="font-serif text-2xl font-medium tracking-tight text-stone-900">
                Magnimoments
              </span>
            </div>
            
            <div className="flex items-center gap-6">
              {user ? (
                <>
                  <span className="text-sm text-stone-500 hidden sm:inline font-light">
                    Welcome back, <span className="font-medium text-stone-800">{user.name}</span>
                  </span>
                  <button 
                    onClick={onLogout}
                    className="p-2 text-stone-400 hover:text-stone-800 transition-colors rounded-full hover:bg-stone-100"
                    title="Sign Out"
                  >
                    <LogOut size={20} />
                  </button>
                </>
              ) : (
                <span className="text-sm text-stone-500 font-serif italic">Preserving Memories</span>
              )}
            </div>
          </div>
        </header>
      )}
      
      <main className={`flex-grow ${showNav ? 'pt-20' : ''}`}>
        {children}
      </main>

      <footer className="bg-white border-t border-stone-100 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="mb-4">
             <span className="font-serif text-lg text-stone-900 font-semibold tracking-tight">Magnimoments</span>
          </div>
          <p className="text-stone-400 text-sm font-light">&copy; {new Date().getFullYear()} Preserving legacies with dignity and grace.</p>
        </div>
      </footer>
    </div>
  );
};