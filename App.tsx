import React, { useState, useEffect, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  type User
} from 'firebase/auth';
import { auth } from './firebase';
import { sqliteService } from './services/sqliteService';
import { syncService } from './services/syncService';
import { sendPasswordResetEmail } from 'firebase/auth';

import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Vendors from './components/Vendors';
import Invoices from './components/Invoices';
import OCRUpload from './components/OCRUpload';
import PriceHistory from './components/PriceHistory';
import ManualInvoiceForm from './components/ManualInvoiceForm';
import Settings from './components/Settings';
import { Vendor, Invoice, PaymentStatus } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [showManualForm, setShowManualForm] = useState(false);

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [authMsg, setAuthMsg] = useState('');

  const loadLocalData = useCallback(async () => {
    try {
      const v = await sqliteService.getVendors();
      const i = await sqliteService.getInvoices();
      setVendors(v);
      setInvoices(i);
    } catch (err) {
      console.error("BITA Engine Error: Failed to load local records.", err);
    }
  }, []);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        setIsSyncing(true);
        try {
          // Initialize engine and attempt restoration
          await syncService.downloadBackup();
          await loadLocalData();
        } finally {
          setIsSyncing(false);
        }
      } else {
        setVendors([]);
        setInvoices([]);
        setCurrentTab('dashboard');
      }
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
    };
  }, [loadLocalData]);

  const syncUp = useCallback(async () => {
    setIsSyncing(true);
    try {
      await syncService.uploadBackup();
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setAuthMsg('');
    try {
      if (authMode === 'login') await signInWithEmailAndPassword(auth, email, password);
      else await createUserWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(err.message.replace('Firebase: ', ''));
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your Internal ID (email) first.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setAuthMsg("Reset link sent! Check your inbox.");
      setError('');
    } catch (err: any) {
      setError(err.message.replace('Firebase: ', ''));
    }
  };

  const handleAddVendor = useCallback(async (v: Omit<Vendor, 'id'>) => {
    const vendorWithId = { ...v, id: Math.random().toString(36).substr(2, 9) };
    await sqliteService.addVendor(vendorWithId);
    await loadLocalData();
    await syncUp();
    return vendorWithId.id;
  }, [loadLocalData, syncUp]);

  const handleDeleteVendor = useCallback(async (id: string) => {
    if (confirm("Archiving vendor will remove them from the active list and delete associated invoices. Proceed?")) {
      await sqliteService.deleteVendor(id);
      await loadLocalData();
      await syncUp();
    }
  }, [loadLocalData, syncUp]);

  const handleAddInvoice = useCallback(async (inv: Omit<Invoice, 'id'>) => {
    const invoiceWithId = { ...inv, id: Math.random().toString(36).substr(2, 9) };
    await sqliteService.addInvoice(invoiceWithId);
    await loadLocalData();
    setShowManualForm(false);
    await syncUp();
  }, [loadLocalData, syncUp]);

  const handleDeleteInvoice = useCallback(async (id: string) => {
    if (confirm("Permanently erase this ledger entry?")) {
      await sqliteService.deleteInvoice(id);
      await loadLocalData();
      await syncUp();
    }
  }, [loadLocalData, syncUp]);

  const handleUpdateInvoiceStatus = useCallback(async (id: string, paidAmount: number, paymentDate?: string) => {
    const inv = invoices.find(i => i.id === id);
    if (inv) {
      let status = PaymentStatus.UNPAID;
      if (paidAmount >= inv.totalAmount) status = PaymentStatus.PAID;
      else if (paidAmount > 0) status = PaymentStatus.PARTIAL;

      const pDate = status === PaymentStatus.PAID ? (paymentDate || new Date().toISOString().split('T')[0]) : undefined;

      await sqliteService.updateInvoiceStatus(id, paidAmount, status, pDate);
      await loadLocalData();
      await syncUp();
    }
  }, [invoices, loadLocalData, syncUp]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#FCF9F2] relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]"></div>
      <div className="flex flex-col items-center relative z-10">
        <div className="w-32 h-32 mb-8 animate-pulse">
          <img src="./logo.png" alt="Loading BITA" className="w-full h-full object-contain drop-shadow-2xl" />
        </div>
        <div className="flex flex-col items-center">
          <h2 className="font-serif text-3xl font-black text-[#D41D24] tracking-tighter">BITA</h2>
          <div className="h-1 w-24 bg-slate-200 rounded-full mt-4 overflow-hidden">
            <div className="h-full bg-[#E5B15B] w-1/2 animate-[loading_1.5s_infinite_ease-in-out]"></div>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-3">Establishing Connection</p>
        </div>
      </div>
      <style>{`@keyframes loading { 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } }`}</style>
    </div>
  );

  if (!user) return (
    <div className="min-h-screen bg-[#FCF9F2] flex flex-col md:flex-row items-stretch">
      <div className="hidden md:flex md:w-1/2 bg-[#D41D24] items-center justify-center p-24 relative overflow-hidden shadow-[inset_-20px_0_50px_rgba(0,0,0,0.1)]">
        <div className="absolute inset-0 opacity-[0.07] bg-[url('https://www.transparenttextures.com/patterns/gplay.png')]"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-black/20 to-transparent pointer-events-none"></div>

        <div className="relative z-10 text-center space-y-8">
          <div className="w-64 h-64 bg-white p-4 rounded-full flex items-center justify-center border-[8px] border-[#E5B15B]/20 shadow-2xl mx-auto relative group">
            <div className="absolute inset-0 bg-[#E5B15B]/10 rounded-full animate-pulse-gold"></div>
            <img src="./logo.png" alt="Khalid Bakers" className="w-full h-full object-contain relative z-10 transition-transform duration-700 group-hover:scale-105" />
          </div>
          <div>
            <h1 className="text-8xl text-white font-black font-serif tracking-tighter mb-2 drop-shadow-2xl">BITA</h1>
            <div className="flex items-center justify-center space-x-4">
              <div className="h-[2px] w-12 bg-[#E5B15B]/50"></div>
              <p className="text-[#E5B15B] text-lg font-bold uppercase tracking-[0.4em]">Est. 1998</p>
              <div className="h-[2px] w-12 bg-[#E5B15B]/50"></div>
            </div>
          </div>
          <p className="text-white/60 font-medium max-w-sm mx-auto leading-relaxed">The Integrated Management Suite for the Khalid Bakers and Brothers Legacy.</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-white md:bg-transparent">
        <div className="max-w-md w-full animate-in fade-in slide-in-from-right-10 duration-700">
          <div className="md:hidden flex flex-col items-center mb-12">
            <img src="/logo.png" alt="Khalid Bakers" className="w-24 h-24 mb-4 object-contain" />
            <h1 className="text-5xl font-serif font-black text-[#D41D24]">BITA</h1>
          </div>

          <div className="mb-10">
            <h2 className="text-4xl font-serif font-black text-slate-800 mb-2">Management Access</h2>
            <p className="text-slate-500 font-medium text-lg">Secure entry for bakery leadership.</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            {error && <div className="p-5 bg-red-50 text-red-600 text-sm rounded-2xl border border-red-100 font-bold flex items-center animate-in shake duration-300">
              <span className="mr-3">⚠️</span> {error}
            </div>}
            {authMsg && <div className="p-5 bg-green-50 text-green-600 text-sm rounded-2xl border border-green-100 font-bold flex items-center">
              <span className="mr-3">✅</span> {authMsg}
            </div>}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Internal ID</label>
              <input
                type="email" required
                className="w-full px-6 py-5 rounded-[1.5rem] border border-slate-200 focus:border-[#E5B15B] focus:ring-[6px] focus:ring-[#E5B15B]/10 outline-none transition-all font-bold text-lg text-slate-700 placeholder:text-slate-300"
                placeholder="admin@khalidbakers.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Access Token</label>
                {authMode === 'login' && (
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-[10px] font-black text-bita-red uppercase tracking-widest hover:underline"
                  >
                    Forgot Token?
                  </button>
                )}
              </div>
              <input
                type="password" required
                className="w-full px-6 py-5 rounded-[1.5rem] border border-slate-200 focus:border-[#E5B15B] focus:ring-[6px] focus:ring-[#E5B15B]/10 outline-none transition-all font-bold text-lg text-slate-700 placeholder:text-slate-300"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            <button className="w-full bg-gradient-to-br from-[#D41D24] to-[#9d151a] text-white py-6 rounded-[1.5rem] font-black text-xl hover:shadow-[0_20px_60px_rgba(212,29,36,0.3)] hover:-translate-y-1 transition-all active:scale-[0.98] border-b-4 border-black/20">
              {authMode === 'login' ? 'Proceed to Hub' : 'Register Profile'}
            </button>
          </form>

          <div className="mt-10 text-center">
            <button
              onClick={() => { setAuthMode(authMode === 'login' ? 'signup' : 'login'); setError(''); setAuthMsg(''); }}
              className="group text-sm font-bold text-slate-400 hover:text-[#D41D24] transition-all flex items-center justify-center w-full"
            >
              <span className="mr-2">━━━━</span>
              {authMode === 'login' ? "Unauthorized? Create Profile" : "Existing Member? Sign In"}
              <span className="ml-2">━━━━</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#FCF9F2] text-slate-800 overflow-hidden font-sans">
      <Sidebar currentTab={currentTab} setTab={setCurrentTab} onLogout={() => signOut(auth)} />

      <main className="flex-1 flex flex-col min-w-0 relative">
        {isSyncing && (
          <div className="absolute top-8 right-8 z-50 flex items-center bg-white/95 backdrop-blur-md px-5 py-3 rounded-2xl border border-[#E5B15B]/20 shadow-2xl space-x-4 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="relative">
              <div className="animate-spin h-5 w-5 border-2 border-[#D41D24] border-t-transparent rounded-full"></div>
              <div className="absolute inset-0 bg-[#D41D24]/10 rounded-full blur-sm"></div>
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D41D24]">BITA Database Syncing...</span>
          </div>
        )}

        <header className="bg-white/90 backdrop-blur-md border-b border-slate-100 px-8 py-6 flex justify-between items-center md:hidden z-30">
          <div className="flex items-center space-x-3">
            <img src="./logo.png" alt="KB" className="w-10 h-10 object-contain" />
            <h1 className="text-3xl font-serif font-black text-[#D41D24]">BITA</h1>
          </div>
          <div className="flex space-x-3">
            <button className="p-4 bg-slate-50 rounded-2xl" onClick={() => setCurrentTab('dashboard')}>📊</button>
            <button className="p-4 bg-[#D41D24] text-white rounded-2xl shadow-lg shadow-red-200" onClick={() => setCurrentTab('upload')}>📷</button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-12 scroll-smooth">
          <div className="max-w-6xl mx-auto space-y-12">
            {currentTab === 'dashboard' && <Dashboard invoices={invoices} vendors={vendors} />}
            {currentTab === 'vendors' && (
              <Vendors
                vendors={vendors}
                onAdd={handleAddVendor}
                onDelete={handleDeleteVendor}
              />
            )}
            {currentTab === 'invoices' && (
              <div className="space-y-6">
                {!showManualForm ? (
                  <>
                    <div className="flex justify-between items-center bg-white/50 backdrop-blur-sm p-4 rounded-3xl border border-white/50 shadow-sm">
                      <p className="text-xs font-bold text-slate-400 px-4">Ledger Operations</p>
                      <button
                        onClick={() => setShowManualForm(true)}
                        className="bg-[#E5B15B] text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl shadow-[#E5B15B]/20 hover:-translate-y-0.5 transition-all"
                      >
                        + Register Manual Invoice
                      </button>
                    </div>
                    <Invoices
                      invoices={invoices} vendors={vendors}
                      onDelete={handleDeleteInvoice}
                      onUpdateStatus={handleUpdateInvoiceStatus}
                    />
                  </>
                ) : (
                  <ManualInvoiceForm
                    vendors={vendors}
                    onAdd={handleAddInvoice}
                    onCancel={() => setShowManualForm(false)}
                  />
                )}
              </div>
            )}
            {currentTab === 'history' && <PriceHistory invoices={invoices} vendors={vendors} />}
            {currentTab === 'upload' && (
              <OCRUpload
                vendors={vendors}
                onAddInvoice={handleAddInvoice}
                onAddVendor={handleAddVendor}
              />
            )}
            {currentTab === 'settings' && <Settings />}

            <div className="pt-20 pb-8 flex flex-col items-center opacity-30">
              <div className="h-[1px] w-24 bg-slate-300 mb-6"></div>
              <img src="./logo.png" alt="logo" className="w-12 h-12 object-contain grayscale mb-2" />
              <p className="text-[9px] font-black uppercase tracking-[0.5em] text-slate-500">Khalid Bakers and Brothers • BITA Suite v3.0 (Local-First Cloud Sync)</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;