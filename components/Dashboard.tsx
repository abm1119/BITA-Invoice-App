
import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Invoice, Vendor, PaymentStatus } from '../types';

interface DashboardProps {
  invoices: Invoice[];
  vendors: Vendor[];
}

const Dashboard: React.FC<DashboardProps> = ({ invoices, vendors }) => {
  const stats = useMemo(() => {
    const totalUnpaid = invoices.reduce((acc, inv) => acc + (inv.totalAmount - (inv.paidAmount || 0)), 0);
    const totalExpenditure = invoices.reduce((acc, inv) => acc + inv.totalAmount, 0);
    const settledThisMonth = invoices
      .filter(i => i.status === PaymentStatus.PAID && i.paymentDate && i.paymentDate.startsWith(new Date().toISOString().slice(0, 7)))
      .reduce((acc, inv) => acc + inv.totalAmount, 0);

    return {
      totalUnpaid,
      totalExpenditure,
      settledThisMonth,
      vendorCount: vendors.length,
      unpaidCount: invoices.filter(i => i.status !== PaymentStatus.PAID).length
    };
  }, [invoices, vendors]);

  const marketTrend = useMemo(() => {
    return invoices
      .sort((a, b) => new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime())
      .map(inv => ({
        date: new Date(inv.issueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
        total: inv.totalAmount
      }));
  }, [invoices]);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <span className="w-8 h-[2px] bg-bita-gold"></span>
            <p className="text-[11px] font-black text-bita-gold uppercase tracking-[0.3em]">Operational Overview</p>
          </div>
          <h2 className="text-6xl font-serif font-black text-slate-800 tracking-tighter">Business Hub</h2>
          <p className="text-slate-500 font-medium text-lg mt-1">Analytics for Khalid Bakers & Brothers.</p>
        </div>
        <div className="flex items-center space-x-4 bg-white px-8 py-5 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-50 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-1 bg-bita-gold h-full"></div>
          <div className="w-12 h-12 relative flex-shrink-0">
            <div className="absolute inset-0 bg-bita-gold/10 rounded-full animate-ping scale-75"></div>
            <img src="/logo.png" className="w-full h-full object-contain relative z-10" alt="KB Logo" />
          </div>
          <div className="text-right">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Khalid Legacy</p>
            <p className="text-sm font-black text-bita-red uppercase">Verified Instance</p>
          </div>
        </div>
      </header>

      {/* Modern High-Impact Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {[
          { label: 'Unpaid Ledger', val: `₹${stats.totalUnpaid.toLocaleString()}`, color: 'text-red-600', icon: '💸', bg: 'bg-red-50' },
          { label: 'Settled Monthly', val: `₹${stats.settledThisMonth.toLocaleString()}`, color: 'text-green-600', icon: '✅', bg: 'bg-green-50' },
          { label: 'Supply Network', val: stats.vendorCount, color: 'text-slate-800', icon: '🤝', bg: 'bg-slate-50' },
          { label: 'Open Invoices', val: stats.unpaidCount, color: 'text-orange-500', icon: '📜', bg: 'bg-orange-50' },
        ].map((s, i) => (
          <div key={i} className="bita-card p-8 rounded-[3rem] relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-24 h-24 ${s.bg} rounded-bl-[4rem] -mr-8 -mt-8 transition-transform group-hover:scale-110 opacity-30`}></div>
            <div className="relative z-10 flex flex-col space-y-3">
              <div className="text-4xl">{s.icon}</div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{s.label}</p>
              <p className={`text-3xl font-black ${s.color} tracking-tight`}>{s.val}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Expenditure Chart */}
        <div className="lg:col-span-2 bita-card p-10 rounded-[3.5rem] bg-white relative">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-2xl font-serif font-bold text-slate-800">Financial Trajectory</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Purchase Volume Analysis</p>
            </div>
            <div className="flex items-center space-x-2 text-[10px] font-black text-green-600 bg-green-50 px-4 py-2 rounded-full border border-green-100">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span>LIVE INTELLIGENCE</span>
            </div>
          </div>
          <div className="h-[400px] w-full">
            {marketTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={marketTrend}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D41D24" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#D41D24" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="date"
                    stroke="#cbd5e1"
                    fontSize={11}
                    fontFamily="Inter"
                    fontWeight="700"
                    tickLine={false}
                    axisLine={false}
                    dy={15}
                  />
                  <YAxis
                    stroke="#cbd5e1"
                    fontSize={11}
                    fontFamily="Inter"
                    fontWeight="700"
                    tickLine={false}
                    axisLine={false}
                    dx={-10}
                    tickFormatter={(val) => `₹${val / 1000}k`}
                  />
                  <Tooltip
                    contentStyle={{ border: 'none', borderRadius: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', fontWeight: '800', fontFamily: 'Inter' }}
                    cursor={{ stroke: '#FDB913', strokeWidth: 2 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#D41D24"
                    strokeWidth={5}
                    fillOpacity={1}
                    fill="url(#colorTotal)"
                    animationDuration={2000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full space-y-4 opacity-30">
                <img src="/logo.png" className="w-16 h-16 grayscale opacity-50 mb-4" alt="Empty" />
                <p className="font-bold italic">Awaiting first ledger entries...</p>
              </div>
            )}
          </div>
        </div>

        {/* High Dues / Recent Debts */}
        <div className="bita-card p-10 rounded-[3.5rem] bg-gradient-to-b from-white to-slate-50/50">
          <div className="mb-8 flex justify-between items-start">
            <div>
              <h3 className="text-2xl font-serif font-bold text-slate-800">Critical Dues</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Action Required</p>
            </div>
            <div className="w-10 h-10 opacity-20">
              <img src="/logo.png" className="w-full h-full object-contain" alt="Badge" />
            </div>
          </div>
          <div className="space-y-5">
            {invoices.filter(i => i.status !== PaymentStatus.PAID).sort((a, b) => b.totalAmount - a.totalAmount).slice(0, 5).map((inv, idx) => (
              <div key={idx} className="flex items-center justify-between p-5 bg-white rounded-3xl border border-slate-100 shadow-sm hover:border-bita-gold hover:shadow-md transition-all group">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center shadow-inner font-black text-bita-red group-hover:bg-red-50 transition-colors">
                    {vendors.find(v => v.id === inv.vendorId)?.name[0] || 'V'}
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-800 truncate max-w-[110px]">
                      {vendors.find(v => v.id === inv.vendorId)?.name || 'Unknown'}
                    </p>
                    <p className="text-[10px] text-slate-400 font-black tracking-tight">{new Date(inv.issueDate).toDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-red-600 tracking-tighter">₹{(inv.totalAmount - inv.paidAmount).toLocaleString()}</p>
                  <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest italic">Outstanding</span>
                </div>
              </div>
            ))}
            {invoices.filter(i => i.status !== PaymentStatus.PAID).length === 0 && (
              <div className="py-24 text-center space-y-4">
                <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center text-4xl mx-auto shadow-inner relative">
                  <img src="/logo.png" className="absolute inset-0 w-full h-full object-contain opacity-10 p-4" alt="Bg" />
                  🏆
                </div>
                <div>
                  <p className="text-slate-800 font-black">All Clear</p>
                  <p className="text-slate-400 text-xs font-medium">Khalid Bakers is fully paid up!</p>
                </div>
              </div>
            )}
          </div>
          <button className="w-full mt-8 py-4 border-2 border-dashed border-slate-200 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] hover:border-bita-gold hover:text-bita-gold transition-all">
            View Full Archive
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
