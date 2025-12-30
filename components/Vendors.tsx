
import React, { useState } from 'react';
import { Vendor } from '../types';

interface VendorsProps {
  vendors: Vendor[];
  onAdd: (vendor: Omit<Vendor, 'id'>) => void;
  onDelete: (id: string) => void;
}

const Vendors: React.FC<VendorsProps> = ({ vendors, onAdd, onDelete }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newVendor, setNewVendor] = useState({ name: '', contactPerson: '', phone: '', email: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newVendor.name) {
      onAdd(newVendor);
      setNewVendor({ name: '', contactPerson: '', phone: '', email: '' });
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <span className="w-8 h-[2px] bg-bita-gold"></span>
            <p className="text-[11px] font-black text-bita-gold uppercase tracking-[0.3em]">Supply Network</p>
          </div>
          <h2 className="text-5xl font-serif font-black text-slate-800 tracking-tighter">Vendor Directory</h2>
          <p className="text-slate-500 font-medium text-lg mt-1">Manage wholesale partnerships and contact points.</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="bg-bita-red text-white px-8 py-4 rounded-2xl font-black text-sm hover:shadow-xl hover:shadow-red-200 transition-all flex items-center space-x-3 group"
        >
          <img src="/logo.png" className="w-5 h-5 object-contain brightness-0 invert group-hover:rotate-12 transition-transform" alt="KB" />
          <span>{isAdding ? 'Close Form' : 'Onboard Vendor'}</span>
        </button>
      </header>

      {isAdding && (
        <form onSubmit={handleSubmit} className="bita-card p-10 rounded-[2.5rem] grid grid-cols-1 md:grid-cols-2 gap-6 animate-in zoom-in-95 duration-500">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Vendor Name</label>
            <input
              required
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 focus:bg-white focus:ring-4 focus:ring-bita-gold/10 outline-none transition-all font-bold text-slate-700"
              value={newVendor.name}
              onChange={e => setNewVendor({ ...newVendor, name: e.target.value })}
              placeholder="e.g. Bulk Flour Co."
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Person</label>
            <input
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 focus:bg-white focus:ring-4 focus:ring-bita-gold/10 outline-none transition-all font-bold text-slate-700"
              value={newVendor.contactPerson}
              onChange={e => setNewVendor({ ...newVendor, contactPerson: e.target.value })}
              placeholder="e.g. John Doe"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone</label>
            <input
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 focus:bg-white focus:ring-4 focus:ring-bita-gold/10 outline-none transition-all font-bold text-slate-700"
              value={newVendor.phone}
              onChange={e => setNewVendor({ ...newVendor, phone: e.target.value })}
              placeholder="e.g. +91 9876543210"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
            <input
              type="email"
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 focus:bg-white focus:ring-4 focus:ring-bita-gold/10 outline-none transition-all font-bold text-slate-700"
              value={newVendor.email}
              onChange={e => setNewVendor({ ...newVendor, email: e.target.value })}
              placeholder="e.g. vendor@example.com"
            />
          </div>
          <div className="md:col-span-2 pt-4">
            <button type="submit" className="bg-slate-800 text-white w-full py-5 rounded-2xl font-black text-lg hover:bg-black transition-all shadow-lg">
              Confirm Vendor Onboarding
            </button>
          </div>
        </form>
      )}

      <div className="bita-card rounded-[2.5rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-6 font-black text-slate-400 uppercase tracking-widest text-[10px]">Vendor Name</th>
                <th className="px-8 py-6 font-black text-slate-400 uppercase tracking-widest text-[10px]">Representative</th>
                <th className="px-8 py-6 font-black text-slate-400 uppercase tracking-widest text-[10px]">Direct Phone</th>
                <th className="px-8 py-6 font-black text-slate-400 uppercase tracking-widest text-[10px]">Email Address</th>
                <th className="px-8 py-6 font-black text-slate-400 uppercase tracking-widest text-[10px] text-right">Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {vendors.map(vendor => (
                <tr key={vendor.id} className="hover:bg-slate-50/80 group transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-bita-gold/10 flex items-center justify-center font-black text-bita-gold text-xs">
                        {vendor.name[0]}
                      </div>
                      <span className="text-slate-800 font-bold">{vendor.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-slate-600 font-medium">{vendor.contactPerson || 'N/A'}</td>
                  <td className="px-8 py-6 text-slate-600 font-medium font-mono">{vendor.phone || 'N/A'}</td>
                  <td className="px-8 py-6 text-slate-600 font-medium">{vendor.email || 'N/A'}</td>
                  <td className="px-8 py-6 text-right">
                    <button
                      onClick={() => onDelete(vendor.id)}
                      className="text-red-300 hover:text-red-600 font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all px-4 py-2 hover:bg-red-50 rounded-xl"
                    >
                      Archive
                    </button>
                  </td>
                </tr>
              ))}
              {vendors.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center space-y-4 opacity-20">
                      <img src="/logo.png" className="w-16 h-16 grayscale" alt="Empty" />
                      <p className="font-bold italic text-slate-500">No vendors registered in the KB network.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Vendors;
