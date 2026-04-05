
import React, { useState, useRef, useEffect } from 'react';
import { LogOut, User, ChevronDown, LogIn, UserCircle, Settings, HelpCircle, ShieldCheck } from 'lucide-react';

interface UserMenuProps {
  user: any;
  onSignIn: () => void;
  onSignOut: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ user, onSignIn, onSignOut }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) {
    return (
      <button 
        onClick={onSignIn}
        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg active:scale-95"
      >
        <LogIn size={18} /> 로그인
      </button>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-1.5 pr-4 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-full transition-all active:scale-95"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-inner overflow-hidden">
          {user.photoURL ? (
            <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <User size={16} />
          )}
        </div>
        <div className="hidden md:block text-left">
          <div className="text-xs font-bold text-white truncate max-w-[100px]">{user.displayName || '사용자'}</div>
          <div className="text-[10px] text-gray-500 font-medium truncate max-w-[100px]">{user.email}</div>
        </div>
        <ChevronDown size={14} className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-56 bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-4 border-b border-gray-800 bg-gray-850/50">
            <div className="text-sm font-bold text-white mb-1">{user.displayName}</div>
            <div className="text-xs text-gray-500 truncate">{user.email}</div>
          </div>
          
          <div className="p-2">
            <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-all">
              <UserCircle size={18} /> 프로필 설정
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-all">
              <Settings size={18} /> 환경 설정
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-all">
              <HelpCircle size={18} /> 도움말 및 지원
            </button>
          </div>

          <div className="p-2 border-t border-gray-800 bg-gray-950/50">
            <button 
              onClick={() => { setIsOpen(false); onSignOut(); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-xl transition-all"
            >
              <LogOut size={18} /> 로그아웃
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
