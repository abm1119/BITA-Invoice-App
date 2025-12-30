
import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Invoice, Vendor } from '../types';

interface PriceHistoryProps {
  invoices: Invoice[];
  vendors: Vendor[];
}

const PriceHistory: React.FC<PriceHistoryProps> = ({ invoices, vendors }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const allItems = useMemo(() => {
    const itemsMap = new Map<string, { date: string; price: number; vendor: string }[]>();
    invoices.forEach(inv => {
      const vendorName = vendors.find(v => v.id === inv.vendorId)?.name || 'Unknown';
      inv.lineItems.forEach(item => {
        const key = item.name.toLowerCase().trim();
        if (!itemsMap.has(key)) itemsMap.set(key, []);
        const history = itemsMap.get(key);
        if (history) {
          history.push({
            date: inv.issueDate,
            price: item.unitPrice,
            vendor: vendorName
          });
        }
      });
    });
    return itemsMap;
  }, [invoices, vendors]);

  const filteredItemNames = useMemo(() => {
    return Array.from(allItems.keys()).filter((name: string) => name.includes(searchTerm.toLowerCase()));
  }, [allItems, searchTerm]);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <span className="w-8 h-[2px] bg-bita-gold"></span>
            <p className="text-[11px] font-black text-bita-gold uppercase tracking-[0.3em]">Market Dynamics</p>
          </div>
          <h2 className="text-5xl font-serif font-black text-slate-800 tracking-tighter">Market Trends</h2>
          <p className="text-slate-500 font-medium text-lg mt-1">Real-time fluctuations of ingredient procurement costs.</p>
        </div>
        <div className="relative group">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
            <span className="text-xl group-focus-within:scale-110 transition-transform">🔍</span>
          </div>
          <input
            type="text"
            placeholder="Search items (e.g. sugar, flour)..."
            className="w-full md:w-96 bg-white border border-slate-100 rounded-[1.5rem] pl-14 pr-6 py-5 shadow-sm focus:ring-4 focus:ring-bita-gold/10 outline-none transition-all font-bold text-slate-700"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      <div className="grid grid-cols-1 gap-10">
        {filteredItemNames.length > 0 ? filteredItemNames.map(itemName => {
          const itemHistory = allItems.get(itemName);
          if (!itemHistory) return null;

          const history = [...itemHistory].sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
          const latestPrice = history[history.length - 1].price;
          const prevPrice = history.length > 1 ? history[history.length - 2].price : latestPrice;
          const change = latestPrice - prevPrice;

          return (
            <div key={itemName} className="bita-card p-10 rounded-[3rem] bg-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[5rem] -mr-10 -mt-10 opacity-30 transition-transform group-hover:scale-110"></div>
              <div className="flex flex-col md:flex-row justify-between items-start mb-10 gap-6 relative z-10">
                <div className="flex items-center space-x-5">
                  <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center text-3xl shadow-xl">
                    {itemName.toLowerCase().includes('flour') ? '🥖' : itemName.toLowerCase().includes('sugar') ? '🍯' : '📦'}
                  </div>
                  <div>
                    <h3 className="text-2xl font-serif font-bold text-slate-800 capitalize tracking-tight">{itemName}</h3>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">Aggregated tracking: {history.length} Cycles</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center justify-end space-x-3 mb-1">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Latest Procurement</span>
                    <p className="text-4xl font-black text-slate-900 tracking-tighter">₹{latestPrice}</p>
                  </div>
                  <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-widest ${change > 0 ? 'bg-red-50 text-red-600 border border-red-100' : change < 0 ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>
                    <span>{change > 0 ? 'Cost Increase' : change < 0 ? 'Price Drop' : 'Stable Rate'}</span>
                    <span className="text-sm">{change > 0 ? '↑' : change < 0 ? '↓' : '•'}</span>
                    <span>₹{Math.abs(change)}</span>
                  </div>
                </div>
              </div>

              <div className="h-64 w-full mb-10 bg-slate-50/50 rounded-[2rem] p-6 border border-slate-100">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="date" hide />
                    <YAxis
                      fontSize={11}
                      stroke="#94a3b8"
                      fontFamily="Inter"
                      fontWeight="700"
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{ border: 'none', borderRadius: '20px', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', fontWeight: '800' }}
                    />
                    <Line
                      type="stepAfter"
                      dataKey="price"
                      stroke="#D41D24"
                      strokeWidth={4}
                      dot={{ r: 6, fill: '#D41D24', strokeWidth: 4, stroke: '#fff' }}
                      activeDot={{ r: 8, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="border border-slate-100 rounded-[2rem] overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 text-left font-black text-slate-400 uppercase tracking-widest text-[10px]">Date of Transaction</th>
                      <th className="px-6 py-4 text-left font-black text-slate-400 uppercase tracking-widest text-[10px]">Supply Partner</th>
                      <th className="px-6 py-4 text-right font-black text-slate-400 uppercase tracking-widest text-[10px]">Price Paid</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {history.slice().reverse().slice(0, 3).map((h: any, i: number) => (
                      <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 text-slate-500 font-bold">{h.date}</td>
                        <td className="px-6 py-4 text-slate-800 font-black tracking-tight">{h.vendor}</td>
                        <td className="px-6 py-4 text-right font-black text-sm text-slate-900">₹{h.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        }) : (
          <div className="p-24 text-center">
            <div className="flex flex-col items-center space-y-4 opacity-20">
              <img src="/logo.png" className="w-20 h-20 grayscale" alt="Empty" />
              <p className="font-bold italic text-slate-500 text-lg">No history available for "{searchTerm}"</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer Branded Watermark */}
      <div className="flex items-center justify-center pt-20 space-x-3 opacity-20">
        <img src="/logo.png" className="w-6 h-6 object-contain" alt="KB" />
        <p className="text-[10px] font-black uppercase tracking-[0.5em]">Market Analysis Unit • BITA</p>
      </div>
    </div>
  );
};

export default PriceHistory;
