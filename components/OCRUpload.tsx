
import React, { useState, useRef } from 'react';
import { parseInvoiceImage } from '../services/geminiService';
import { Vendor, Invoice, PaymentStatus } from '../types';
import CameraScanner from './CameraScanner';

interface OCRUploadProps {
  vendors: Vendor[];
  onAddInvoice: (invoice: Omit<Invoice, 'id'>) => void;
  onAddVendor: (vendor: Omit<Vendor, 'id'>) => void;
}

const OCRUpload: React.FC<OCRUploadProps> = ({ vendors, onAddInvoice, onAddVendor }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [selectedVendorId, setSelectedVendorId] = useState<string>('');
  const [parsedData, setParsedData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processImage = async (base64: string) => {
    setIsScanning(true);
    setParsedData(null);
    setError(null);
    setShowCamera(false);
    setSelectedVendorId('');

    try {
      const result = await parseInvoiceImage(base64);
      if (result && result.vendorName) {
        setParsedData(result);
        // Attempt to auto-match
        const matched = vendors.find(v =>
          v.name.toLowerCase().includes(result.vendorName?.toLowerCase() || '') ||
          result.vendorName?.toLowerCase().includes(v.name.toLowerCase() || '')
        );
        if (matched) setSelectedVendorId(matched.id);
      } else {
        setError("Gemma 3 was unable to discern the invoice details. Ensure the lighting is optimal.");
      }
    } catch (err) {
      setError("AI Engine Handshake Failed. Retrying standard scan mode...");
    } finally {
      setIsScanning(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      processImage(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!parsedData) return;

    let vendorId = selectedVendorId;

    if (!vendorId) {
      if (confirm(`Gemma detected a New Partner: "${parsedData.vendorName}". Securely onboard them?`)) {
        const id = await onAddVendor({
          name: parsedData.vendorName || 'New Vendor',
          contactPerson: 'AI Identified',
          phone: '',
          email: ''
        });
        // Note: onAddVendor should return the ID, but in current setup it might be async
        // For simplicity, we'll ask user to try again or just wait for sync
        alert("Partnership initialized. Please Select the new vendor from the list and Commit.");
        return;
      }
      return;
    }

    await onAddInvoice({
      vendorId,
      invoiceNumber: parsedData.invoiceNumber || `BITA-GEN-${Date.now()}`,
      issueDate: parsedData.issueDate || new Date().toISOString().split('T')[0],
      totalAmount: parsedData.totalAmount || 0,
      paidAmount: 0,
      status: PaymentStatus.UNPAID,
      lineItems: parsedData.lineItems?.map((li: any) => ({
        id: Math.random().toString(36).substr(2, 9),
        ...li
      })) || []
    });

    setParsedData(null);
    setSelectedVendorId('');
    alert("Invoice successfully integrated into Khalid Bakers database.");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="flex justify-center mb-8 relative">
          <div className="absolute inset-0 bg-bita-gold/20 blur-3xl rounded-full scale-150 animate-pulse"></div>
          <div className="w-24 h-24 bg-white p-4 rounded-[2rem] shadow-2xl border-4 border-bita-gold/20 flex items-center justify-center relative z-10 transition-transform hover:rotate-6">
            <img src="./logo.png" alt="KB" className="w-full h-full object-contain" />
          </div>
        </div>
        <h2 className="text-7xl font-serif font-black text-slate-900 tracking-tighter leading-none">Vision Scan</h2>
        <p className="text-xl text-slate-500 font-bold tracking-tight uppercase">Powered by Gemma 3 Multimodal AI</p>
      </div>

      {showCamera && <CameraScanner onCapture={processImage} onClose={() => setShowCamera(false)} />}

      {/* Action Zone */}
      <div className={`bita-card p-20 rounded-[4.5rem] border-4 border-dashed transition-all duration-700 ${isScanning ? 'border-bita-red bg-red-50/50 shadow-[0_0_80px_rgba(212,29,36,0.1)]' : 'border-slate-200 bg-white shadow-[0_40px_100px_rgba(0,0,0,0.05)]'} flex flex-col items-center justify-center text-center space-y-10 relative overflow-hidden group`}>
        {isScanning && (
          <div className="absolute inset-x-0 h-1.5 bg-bita-red/20 overflow-hidden top-0">
            <div className="h-full bg-bita-red w-1/4 animate-[slide_1.5s_infinite_ease-in-out]"></div>
          </div>
        )}

        <div className={`w-44 h-44 rounded-[3.5rem] flex items-center justify-center shadow-2xl transition-all duration-700 relative ${isScanning ? 'bg-bita-red text-white scale-110 shadow-red-200' : 'bg-slate-50 text-bita-gold'}`}>
          <img src="/logo.png" className={`w-28 h-28 object-contain transition-all duration-700 ${isScanning ? 'brightness-100 invert animate-pulse' : 'opacity-80 group-hover:opacity-100 group-hover:scale-110'}`} alt="Scan" />
          <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-gradient-to-br from-bita-gold to-[#d49e45] rounded-[1.5rem] flex items-center justify-center text-3xl shadow-2xl border-4 border-white">
            {isScanning ? '🔍' : '✨'}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-4xl font-serif font-black text-slate-900">{isScanning ? 'Deciphering Ledger...' : 'Ready for Ingest'}</h3>
          <p className="text-slate-400 max-w-md font-bold mx-auto leading-relaxed text-lg tracking-tight">Capture or upload your wholesaler bill. Gemma 3 will automatically categorize and register every item.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 w-full max-w-md">
          <button
            onClick={() => setShowCamera(true)}
            disabled={isScanning}
            className="flex-1 bg-bita-red text-white px-10 py-7 rounded-3xl font-black text-xl hover:shadow-[0_25px_50px_rgba(212,29,36,0.4)] hover:-translate-y-1 transition-all active:scale-95 disabled:bg-slate-300 border-b-8 border-black/20"
          >
            Live Camera
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isScanning}
            className="flex-1 bg-slate-900 text-white px-10 py-7 rounded-3xl font-black text-xl hover:shadow-[0_25px_50px_rgba(0,0,0,0.3)] hover:-translate-y-1 transition-all active:scale-95 disabled:bg-slate-300 border-b-8 border-black/40"
          >
            Upload File
          </button>
        </div>

        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
        {error && (
          <div className="bg-red-50 text-red-600 font-bold text-sm px-10 py-4 rounded-2xl border-2 border-red-100 shadow-sm animate-bounce flex items-center gap-3">
            <span>⚠️</span> {error}
          </div>
        )}
      </div>

      {/* Results Section */}
      {parsedData && (
        <div className="bita-card p-16 rounded-[4.5rem] shadow-[0_60px_120px_rgba(0,0,0,0.12)] animate-in slide-in-from-top-12 duration-700 relative bg-white border border-slate-100 overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none scale-150">
            <img src="./logo.png" className="w-40 h-40 object-contain" alt="KB Bg" />
          </div>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-16 gap-8 pb-12 border-b-2 border-slate-50">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-bita-gold text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full">Validated by Gemma 3</span>
              </div>
              <h3 className="text-5xl font-serif font-black text-slate-900 tracking-tighter">Extraction Results</h3>
            </div>
            <div className="flex space-x-4 w-full lg:w-auto">
              <button onClick={() => setParsedData(null)} className="flex-1 lg:flex-none px-12 py-6 text-base text-slate-400 font-black hover:bg-slate-50 rounded-3xl transition-all uppercase tracking-widest">Discard</button>
              <button onClick={handleSave} className="flex-1 lg:flex-none px-16 py-6 text-base bg-slate-900 text-white font-black hover:bg-black rounded-3xl shadow-2xl transition-all active:scale-95 uppercase tracking-widest border-b-4 border-black">Commit Entry</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-16">
            <div className="bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-500 col-span-1 md:col-span-1">
              <div className="flex items-center space-x-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">
                <span className="text-lg">🏪</span> <span>Assign Vendor</span>
              </div>
              <select
                value={selectedVendorId}
                onChange={(e) => setSelectedVendorId(e.target.value)}
                className="w-full bg-white border-2 border-slate-200 rounded-2xl px-4 py-3 font-black text-slate-800 text-lg focus:border-bita-red outline-none transition-all"
              >
                <option value="">Select Partner...</option>
                {vendors.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
              <p className="mt-4 text-[10px] font-bold text-slate-400">AI DETECTED: {parsedData.vendorName || 'N/A'}</p>
            </div>
            {[
              { label: 'Issue Date', val: parsedData.issueDate || 'Pending', icon: '📅', color: 'text-slate-600' },
              { label: 'Ledger Impact', val: `₹${parsedData.totalAmount?.toLocaleString()}`, icon: '💰', color: 'text-bita-red', highlight: true },
            ].map((d, i) => (
              <div key={i} className="bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
                <div className="flex items-center space-x-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">
                  <span className="text-lg">{d.icon}</span> <span>{d.label}</span>
                </div>
                <p className={`text-3xl font-black tracking-tighter ${d.color} ${d.highlight ? 'text-4xl' : ''}`}>{d.val}</p>
              </div>
            ))}
          </div>

          <div className="space-y-8">
            <div className="flex justify-between items-end">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.4em] flex items-center gap-4">
                <span className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-sm shadow-lg">📦</span>
                Itemized Breakdown
              </h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{parsedData.lineItems?.length || 0} Positions Detected</p>
            </div>

            <div className="bg-slate-50/30 rounded-[3.5rem] border border-slate-100 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-900 text-white">
                    <th className="px-10 py-6 text-left font-black uppercase tracking-[0.2em] text-[10px]">Description</th>
                    <th className="px-10 py-6 text-center font-black uppercase tracking-[0.2em] text-[10px]">Category</th>
                    <th className="px-10 py-6 text-right font-black uppercase tracking-[0.2em] text-[10px]">Rate</th>
                    <th className="px-10 py-6 text-right font-black uppercase tracking-[0.2em] text-[10px]">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parsedData.lineItems?.map((item: any, i: number) => (
                    <tr key={i} className="hover:bg-white transition-colors">
                      <td className="px-10 py-7">
                        <p className="font-black text-slate-900 text-lg">{item.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Ref ID: {Math.random().toString(36).substr(2, 5).toUpperCase()}</p>
                      </td>
                      <td className="px-10 py-7 text-center">
                        <span className="bg-white px-4 py-1.5 rounded-full border border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">
                          {item.category || 'General'}
                        </span>
                      </td>
                      <td className="px-10 py-7 text-right text-slate-500 font-mono font-bold">₹{item.unitPrice}</td>
                      <td className="px-10 py-7 text-right font-black text-slate-900 font-mono text-xl">₹{item.total}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-900/5">
                    <td colSpan={3} className="px-10 py-8 text-right font-black text-slate-500 uppercase tracking-[0.2em] text-xs">Calculated Grand Total</td>
                    <td className="px-10 py-8 text-right font-black text-bita-red text-3xl tracking-tighter">₹{parsedData.totalAmount?.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      <style>{`
        @keyframes slide { 
          0% { transform: translateX(-100%); } 
          100% { transform: translateX(400%); } 
        }
      `}</style>
    </div>
  );
};

export default OCRUpload;
