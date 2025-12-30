
import React from 'react';
import { auth } from '../firebase';

interface SidebarProps {
  currentTab: string;
  setTab: (tab: string) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentTab, setTab, onLogout }) => {
  const user = auth.currentUser;

  const navItems = [
    { id: 'dashboard', label: 'Business Hub', icon: '🏛️' },
    { id: 'vendors', label: 'Vendor Directory', icon: '🤝' },
    { id: 'invoices', label: 'Ledger Book', icon: '📜' },
    { id: 'history', label: 'Market Trends', icon: '📈' },
    { id: 'upload', label: 'Smart Scan', icon: '✨' },
    { id: 'settings', label: 'Executive Settings', icon: '⚙️' },
  ];

  return (
    <div className="w-72 bg-white border-r border-slate-100 h-full flex flex-col hidden md:flex z-20 shadow-[10px_0_50px_rgba(0,0,0,0.02)]">
      <div className="p-8 border-b border-slate-50 flex flex-col items-center group">
        <div className="w-24 h-24 mb-4 relative">
          <div className="absolute inset-0 bg-bita-gold/20 rounded-full blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100"></div>
          <img
            src="/logo.png"
            alt="Khalid Bakers Logo"
            className="w-full h-full object-contain relative z-10 drop-shadow-lg group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=KB';
            }}
          />
        </div>
        <h1 className="text-3xl font-serif font-black tracking-tight text-bita-red text-center">BITA</h1>
        <div className="flex items-center mt-1 space-x-2">
          <span className="h-[1px] w-4 bg-bita-gold"></span>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Khairpur Mir's</p>
          <span className="h-[1px] w-4 bg-bita-gold"></span>
        </div>
      </div>

      <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={`w-full flex items-center px-6 py-4 text-sm font-bold rounded-[1.25rem] transition-all duration-300 relative group ${currentTab === item.id
              ? 'bg-bita-red text-white shadow-xl shadow-red-200'
              : 'text-slate-500 hover:bg-slate-50 hover:text-bita-red'
              }`}
          >
            <span className={`mr-4 text-xl transition-transform group-hover:scale-110 ${currentTab === item.id ? 'scale-110' : ''}`}>
              {item.icon}
            </span>
            {item.label}
            {currentTab === item.id && (
              <span className="absolute right-4 w-1.5 h-1.5 bg-bita-gold rounded-full shadow-[0_0_10px_#FDB913]"></span>
            )}
          </button>
        ))}
      </nav>

      <div className="p-6 border-t border-slate-50 space-y-4 bg-slate-50/30">
        {user && (
          <div className="px-4 py-3 bg-white rounded-2xl border border-slate-100 flex items-center space-x-3 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-bita-red to-red-700 flex items-center justify-center text-xs font-black text-white shadow-inner">
              {user.email?.[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Executive</p>
              <p className="text-xs font-bold text-slate-700 truncate">{user.displayName || user.email?.split('@')[0]}</p>
            </div>
          </div>
        )}
        <button
          onClick={onLogout}
          className="w-full flex items-center px-6 py-4 text-sm font-black text-slate-400 hover:text-bita-red hover:bg-red-50 rounded-2xl transition-all"
        >
          <span className="mr-4">🚪</span>
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
