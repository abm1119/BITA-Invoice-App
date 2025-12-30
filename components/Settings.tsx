
import React, { useState } from 'react';
import { auth } from '../firebase';
import { updatePassword, sendPasswordResetEmail, deleteUser, updateProfile } from 'firebase/auth';

const Settings: React.FC = () => {
    const user = auth.currentUser;
    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [newPassword, setNewPassword] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [isDeleting, setIsDeleting] = useState(false);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        try {
            await updateProfile(user, { displayName });
            setMessage({ type: 'success', text: 'Profile updated successfully.' });
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !newPassword) return;
        try {
            await updatePassword(user, newPassword);
            setMessage({ type: 'success', text: 'Password updated successfully.' });
            setNewPassword('');
        } catch (err: any) {
            setMessage({ type: 'error', text: 'For security, please re-login before changing password.' });
        }
    };

    const handleResetEmail = async () => {
        if (!user?.email) return;
        try {
            await sendPasswordResetEmail(auth, user.email);
            setMessage({ type: 'success', text: 'Reset email sent to ' + user.email });
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
        }
    };

    const handleDeleteAccount = async () => {
        if (!user) return;
        if (!window.confirm("CRITICAL WARNING: This will permanently delete your BITA account and all cloud backups. This cannot be undone. Proceed?")) return;

        try {
            await deleteUser(user);
        } catch (err: any) {
            setMessage({ type: 'error', text: 'Please re-login to authorize account deletion.' });
        }
    };

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center space-x-2 mb-2">
                        <span className="w-8 h-[2px] bg-bita-gold"></span>
                        <p className="text-[11px] font-black text-bita-gold uppercase tracking-[0.3em]">Account Management</p>
                    </div>
                    <h2 className="text-6xl font-serif font-black text-slate-800 tracking-tighter">Executive Profile</h2>
                    <p className="text-slate-500 font-medium text-lg mt-1">Manage your access and security preferences.</p>
                </div>
            </header>

            {message.text && (
                <div className={`p-6 rounded-[1.5rem] border font-bold flex items-center ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                    <span className="mr-3">{message.type === 'success' ? '✅' : '⚠️'}</span>
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Profile Section */}
                <div className="bita-card p-10 rounded-[3rem] bg-white space-y-8">
                    <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-xl">👤</div>
                        <h3 className="text-2xl font-serif font-bold text-slate-800">Personal Details</h3>
                    </div>

                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address (Read-only)</label>
                            <input
                                type="text" readOnly disabled
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 font-bold text-slate-400"
                                value={user?.email || ''}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name / Signature</label>
                            <input
                                type="text"
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 focus:bg-white focus:ring-4 focus:ring-bita-gold/10 outline-none transition-all font-bold text-slate-700"
                                value={displayName}
                                onChange={e => setDisplayName(e.target.value)}
                                placeholder="e.g. Khalid Brothers Admin"
                            />
                        </div>
                        <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-xl font-black text-sm hover:shadow-xl transition-all">
                            Update Profile Signature
                        </button>
                    </form>
                </div>

                {/* Security Section */}
                <div className="bita-card p-10 rounded-[3rem] bg-white space-y-8">
                    <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 bg-bita-red rounded-2xl flex items-center justify-center text-xl shadow-lg shadow-red-100">🔐</div>
                        <h3 className="text-2xl font-serif font-bold text-slate-800">Security Access</h3>
                    </div>

                    <div className="space-y-6">
                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-xs font-bold text-slate-500 mb-4">Request a secure password reset link via your registered email.</p>
                            <button
                                onClick={handleResetEmail}
                                className="w-full bg-white border border-slate-200 text-slate-700 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:border-bita-gold transition-all"
                            >
                                Send Reset Email
                            </button>
                        </div>

                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Force New Password</label>
                                <input
                                    type="password"
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 focus:bg-white focus:ring-4 focus:ring-bita-gold/10 outline-none transition-all font-bold text-slate-700"
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    placeholder="••••••••"
                                />
                            </div>
                            <button type="submit" className="w-full bg-bita-gold text-white py-4 rounded-xl font-black text-sm hover:shadow-xl transition-all">
                                Update Access Token
                            </button>
                        </form>
                    </div>
                </div>

                {/* Account Actions */}
                <div className="lg:col-span-2 bita-card p-10 rounded-[3rem] bg-red-50/30 border border-red-100 space-y-8">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center text-xl">⚠️</div>
                        <div>
                            <h3 className="text-2xl font-serif font-bold text-slate-800">Danger Zone</h3>
                            <p className="text-xs font-bold text-red-400">Irreversible account actions.</p>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-8 bg-white rounded-3xl border border-red-100">
                        <div className="flex-1">
                            <h4 className="font-bold text-slate-800">Terminate License & Delete Data</h4>
                            <p className="text-sm text-slate-500 mt-1">This will erase all your vendors, invoices, and cloud backups permanently from the Khalid Legacy servers.</p>
                        </div>
                        <button
                            onClick={handleDeleteAccount}
                            className="px-10 py-5 bg-red-600 text-white font-black rounded-2xl hover:bg-red-700 transition-all shadow-xl shadow-red-200 active:scale-95"
                        >
                            Delete Account
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-center pt-20 space-x-3 opacity-20">
                <img src="/logo.png" className="w-6 h-6 object-contain" alt="KB" />
                <p className="text-[10px] font-black uppercase tracking-[0.5em]">Identity & Access Management • BITA</p>
            </div>
        </div>
    );
};

export default Settings;
