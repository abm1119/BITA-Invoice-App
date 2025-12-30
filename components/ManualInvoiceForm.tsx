
import React, { useState } from 'react';
import { Vendor, Invoice, PaymentStatus, LineItem } from '../types';

interface ManualInvoiceFormProps {
    vendors: Vendor[];
    onAdd: (invoice: Omit<Invoice, 'id'>) => void;
    onCancel: () => void;
}

const ManualInvoiceForm: React.FC<ManualInvoiceFormProps> = ({ vendors, onAdd, onCancel }) => {
    const [vendorId, setVendorId] = useState('');
    const [invoiceNumber, setInvoiceNumber] = useState(`INV-${Date.now().toString().slice(-6)}`);
    const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
    const [lineItems, setLineItems] = useState<Omit<LineItem, 'id'>[]>([
        { name: '', category: 'General', quantity: 1, unitPrice: 0, total: 0 }
    ]);

    const handleAddItem = () => {
        setLineItems([...lineItems, { name: '', category: 'General', quantity: 1, unitPrice: 0, total: 0 }]);
    };

    const handleRemoveItem = (index: number) => {
        setLineItems(lineItems.filter((_, i) => i !== index));
    };

    const handleItemChange = (index: number, field: keyof LineItem, value: string | number) => {
        const newItems = [...lineItems];
        (newItems[index] as any)[field] = value;
        if (field === 'quantity' || field === 'unitPrice') {
            newItems[index].total = newItems[index].quantity * (newItems[index].unitPrice || 0);
        }
        setLineItems(newItems);
    };

    const totalAmount = lineItems.reduce((sum, item) => sum + item.total, 0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!vendorId) {
            alert("Please select a vendor.");
            return;
        }
        if (lineItems.some(i => !i.name || i.total < 0)) {
            alert("Please fill in all item details correctly.");
            return;
        }

        onAdd({
            vendorId,
            invoiceNumber: invoiceNumber || `MANUAL-${Date.now()}`,
            issueDate,
            totalAmount,
            paidAmount: 0,
            status: PaymentStatus.UNPAID,
            lineItems: lineItems.map(li => ({ ...li, id: Math.random().toString(36).substr(2, 9) }))
        });
    };

    return (
        <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-500">
            <div className="flex justify-between items-center mb-10 border-b border-slate-50 pb-8">
                <div>
                    <div className="flex items-center space-x-2 mb-2">
                        <span className="w-6 h-[2px] bg-bita-gold"></span>
                        <p className="text-[10px] font-black text-bita-gold uppercase tracking-[0.2em]">Manual Entry</p>
                    </div>
                    <h3 className="text-4xl font-serif font-black text-slate-800 tracking-tighter">New Ledger Entry</h3>
                </div>
                <button onClick={onCancel} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Vendor Entity</label>
                        <select
                            value={vendorId}
                            onChange={e => setVendorId(e.target.value)}
                            className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-bita-gold/10 font-bold text-slate-700 appearance-none"
                            required
                        >
                            <option value="">Select Wholesaler...</option>
                            {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                        </select>
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Invoice ID</label>
                        <input
                            type="text"
                            value={invoiceNumber}
                            onChange={e => setInvoiceNumber(e.target.value)}
                            className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-bita-gold/10 font-bold text-slate-700"
                            placeholder="INV-001"
                            required
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Registration Date</label>
                        <input
                            type="date"
                            value={issueDate}
                            onChange={e => setIssueDate(e.target.value)}
                            className="w-full px-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-bita-gold/10 font-bold text-slate-700"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Inventory Details</h4>
                        <button
                            type="button"
                            onClick={handleAddItem}
                            className="text-xs font-black text-bita-gold bg-bita-gold/5 px-4 py-2 rounded-xl hover:bg-bita-gold/10 transition-all border border-bita-gold/20"
                        >
                            + Add Line Item
                        </button>
                    </div>

                    <div className="space-y-4">
                        {lineItems.map((item, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                                <div className="md:col-span-4 space-y-2">
                                    <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Item Description</label>
                                    <input
                                        type="text"
                                        value={item.name}
                                        onChange={e => handleItemChange(index, 'name', e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-white border-none focus:ring-4 focus:ring-bita-gold/10 font-semibold text-sm"
                                        placeholder="e.g., Premium Flour"
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Category</label>
                                    <input
                                        type="text"
                                        value={item.category}
                                        onChange={e => handleItemChange(index, 'category', e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-white border-none focus:ring-4 focus:ring-bita-gold/10 font-semibold text-sm"
                                        placeholder="General"
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Qty</label>
                                    <input
                                        type="number"
                                        value={item.quantity}
                                        onChange={e => handleItemChange(index, 'quantity', parseFloat(e.target.value))}
                                        className="w-full px-4 py-3 rounded-xl bg-white border-none focus:ring-4 focus:ring-bita-gold/10 font-mono font-bold text-sm"
                                    />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-[9px] font-bold text-slate-400 uppercase ml-1">Price</label>
                                    <input
                                        type="number"
                                        value={item.unitPrice}
                                        onChange={e => handleItemChange(index, 'unitPrice', parseFloat(e.target.value))}
                                        className="w-full px-4 py-3 rounded-xl bg-white border-none focus:ring-4 focus:ring-bita-gold/10 font-mono font-bold text-sm"
                                    />
                                </div>
                                <div className="md:col-span-1 flex flex-col items-center">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase mb-2">Subtotal</span>
                                    <span className="font-mono font-black text-slate-800 text-sm">₹{item.total}</span>
                                </div>
                                <div className="md:col-span-1 text-right">
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveItem(index)}
                                        className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-white rounded-xl transition-all"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-8 border-t border-slate-50">
                    <div className="bg-slate-900 text-white px-10 py-6 rounded-[2rem] flex items-center space-x-6 shadow-2xl">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-50">Grand Total Value</span>
                        <span className="text-4xl font-serif font-black text-bita-gold tracking-tighter">₹{totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex space-x-4 w-full md:w-auto">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 md:flex-none px-10 py-5 font-black text-slate-400 hover:bg-slate-50 rounded-2xl transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 md:flex-none px-16 py-5 bg-bita-red text-white font-black rounded-2xl shadow-[0_20px_40px_rgba(212,29,36,0.2)] hover:shadow-[0_25px_50px_rgba(212,29,36,0.3)] hover:-translate-y-1 transition-all active:scale-95 border-b-4 border-black/10"
                        >
                            Authorize & Commit
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default ManualInvoiceForm;
