
import React, { useState } from 'react';
import { Invoice, Vendor, PaymentStatus } from '../types';

interface InvoicesProps {
  invoices: Invoice[];
  vendors: Vendor[];
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, paidAmount: number, paymentDate?: string) => void;
}

const Invoices: React.FC<InvoicesProps> = ({ invoices, vendors, onDelete, onUpdateStatus }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [tempPaymentDate, setTempPaymentDate] = useState<Record<string, string>>({});

  const getVendorName = (id: string) => vendors.find(v => v.id === id)?.name || 'Unknown';

  const handlePaidAmountChange = (inv: Invoice, amount: string) => {
    const val = parseFloat(amount) || 0;
    const pDate = tempPaymentDate[inv.id] || new Date().toISOString().split('T')[0];
    onUpdateStatus(inv.id, val, pDate);
  };

  const handleDateChange = (invId: string, date: string) => {
    setTempPaymentDate(prev => ({ ...prev, [invId]: date }));
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <span className="w-8 h-[2px] bg-bita-gold"></span>
            <p className="text-[11px] font-black text-bita-gold uppercase tracking-[0.3em]">Financial Records</p>
          </div>
          <h2 className="text-5xl font-serif font-black text-slate-800 tracking-tighter">Ledger Book</h2>
          <p className="text-slate-500 font-medium text-lg mt-1">Audit trail of all wholesaler interactions and payments.</p>
        </div>
        <div className="hidden md:flex items-center space-x-2">
          <div className="bg-white border border-slate-100 px-5 py-3 rounded-2xl flex items-center space-x-3 shadow-sm">
            <img src="/logo.png" className="w-6 h-6 object-contain opacity-40" alt="KB" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Khalid Systems v3.0</span>
          </div>
        </div>
      </header>

      <div className="bita-card rounded-[2.5rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-6 font-black text-slate-400 uppercase tracking-widest text-[10px]">Invoice #</th>
                <th className="px-8 py-6 font-black text-slate-400 uppercase tracking-widest text-[10px]">Vendor</th>
                <th className="px-8 py-6 font-black text-slate-400 uppercase tracking-widest text-[10px]">Issued</th>
                <th className="px-8 py-6 font-black text-slate-400 uppercase tracking-widest text-[10px]">Total</th>
                <th className="px-8 py-6 font-black text-slate-400 uppercase tracking-widest text-[10px]">Settled Amount</th>
                <th className="px-8 py-6 font-black text-slate-400 uppercase tracking-widest text-[10px]">Paid Date</th>
                <th className="px-8 py-6 font-black text-slate-400 uppercase tracking-widest text-[10px]">Status</th>
                <th className="px-8 py-6 font-black text-slate-400 uppercase tracking-widest text-[10px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {invoices.sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()).map(inv => (
                <React.Fragment key={inv.id}>
                  <tr
                    className={`hover:bg-slate-50 cursor-pointer transition-colors ${expandedId === inv.id ? 'bg-slate-50' : ''}`}
                    onClick={() => setExpandedId(expandedId === inv.id ? null : inv.id)}
                  >
                    <td className="px-8 py-6">
                      <span className="font-mono font-bold text-slate-800">{inv.invoiceNumber}</span>
                    </td>
                    <td className="px-8 py-6 text-slate-700 font-bold">{getVendorName(inv.vendorId)}</td>
                    <td className="px-8 py-6 text-slate-500 font-medium whitespace-nowrap">{inv.issueDate}</td>
                    <td className="px-8 py-6 text-slate-900 font-black">₹{inv.totalAmount.toLocaleString()}</td>
                    <td className="px-8 py-6" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center space-x-2 group">
                        <span className="text-slate-300">₹</span>
                        <input
                          type="number"
                          value={inv.paidAmount}
                          onChange={(e) => handlePaidAmountChange(inv, e.target.value)}
                          className="w-28 bg-slate-100/50 border-none rounded-xl px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-bita-gold/10 focus:bg-white transition-all"
                        />
                      </div>
                    </td>
                    <td className="px-8 py-6" onClick={e => e.stopPropagation()}>
                      <input
                        type="date"
                        value={inv.paymentDate || tempPaymentDate[inv.id] || ''}
                        onChange={(e) => handleDateChange(inv.id, e.target.value)}
                        onBlur={() => handlePaidAmountChange(inv, inv.paidAmount.toString())}
                        className="bg-transparent border-none text-xs font-bold text-slate-500 outline-none focus:text-slate-900"
                      />
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${inv.status === PaymentStatus.PAID ? 'bg-green-50 text-green-700 border-green-100' :
                        inv.status === PaymentStatus.PARTIAL ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                          'bg-red-50 text-red-700 border-red-100'
                        }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); onDelete(inv.id); }}
                        className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all ml-auto"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                  {expandedId === inv.id && (
                    <tr>
                      <td colSpan={8} className="px-12 py-8 bg-slate-50/30">
                        <div className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm animate-in slide-in-from-top-4 duration-300">
                          <div className="flex items-center justify-between mb-6 border-b border-slate-50 pb-6">
                            <div>
                              <h4 className="font-serif font-bold text-slate-800 text-lg">Detailed Itemization</h4>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SKU Breakdown</p>
                            </div>
                            <img src="/logo.png" className="w-8 h-8 opacity-20" alt="KB" />
                          </div>
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="text-slate-400 border-b border-slate-50">
                                <th className="py-4 uppercase tracking-widest font-black">Item Description</th>
                                <th className="py-4 uppercase tracking-widest font-black">Category</th>
                                <th className="py-4 uppercase tracking-widest font-black text-right">Qty</th>
                                <th className="py-4 uppercase tracking-widest font-black text-right">Unit Price</th>
                                <th className="py-4 uppercase tracking-widest font-black text-right">Subtotal</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                              {inv.lineItems.map((item, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50">
                                  <td className="py-4 font-bold text-slate-700">{item.name}</td>
                                  <td className="py-4">
                                    <span className="bg-slate-100 px-2 py-1 rounded-lg text-slate-500 font-bold">{item.category}</span>
                                  </td>
                                  <td className="py-4 text-right font-mono font-bold">{item.quantity}</td>
                                  <td className="py-4 text-right font-mono">₹{item.unitPrice}</td>
                                  <td className="py-4 text-right font-mono font-black text-slate-800">₹{item.total}</td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot>
                              <tr>
                                <td colSpan={4} className="py-6 text-right">
                                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Invoice Value</span>
                                </td>
                                <td className="py-6 text-right font-black text-xl text-bita-red tracking-tighter">₹{inv.totalAmount.toLocaleString()}</td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {invoices.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center space-y-4 opacity-20">
                      <img src="./logo.png" className="w-16 h-16 grayscale" alt="Empty" />
                      <p className="font-bold italic text-slate-500">The ledger is currently clear.</p>
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

export default Invoices;
