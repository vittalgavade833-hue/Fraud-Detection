import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { transactionAPI, fraudAPI } from '../services/api';
import { ShieldCheck, AlertTriangle, ShieldAlert, DollarSign, Activity, ArrowUpRight } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { Link } from 'react-router-dom';

const RISK_COLORS = { LOW: '#10b981', MEDIUM: '#f59e0b', HIGH: '#ef4444' };

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentTxns, setRecentTxns] = useState([]);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [statsRes, txnsRes, alertsRes] = await Promise.all([
          transactionAPI.getStats(),
          transactionAPI.getAll({ limit: 5 }),
          fraudAPI.getAlerts({ limit: 5 })
        ]);
        setStats(statsRes.data?.data?.overview || {});
        setRecentTxns(txnsRes.data?.data || []);
        setRecentAlerts(alertsRes.data?.data || []);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const pieData = [
    { name: 'Normal (Low)', value: stats?.lowRiskCount || 0, color: '#10b981' },
    { name: 'Suspicious (Med)', value: stats?.mediumRiskCount || 0, color: '#f59e0b' },
    { name: 'Fraud (High)', value: stats?.highRiskCount || 0, color: '#ef4444' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {user?.name || 'Analyst'}</h1>
          <p className="text-gray-400 text-sm">Real-time fraud surveillance overview</p>
        </div>
        <Link to="/transactions/new" className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-medium text-sm flex items-center gap-2 transition">
          <Activity className="w-4 h-4" /> Analyze Transaction
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#1a1f3a] border border-[#252a4a]">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-sm font-medium">Total Volume</span>
            <DollarSign className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-2xl font-bold">${(stats?.totalAmount || 0).toLocaleString()}</p>
          <span className="text-xs text-gray-400">{stats?.totalTransactions || 0} Total Transactions</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#1a1f3a] border border-[#252a4a]">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-sm font-medium">Normal</span>
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400">{stats?.lowRiskCount || 0}</p>
          <span className="text-xs text-gray-400">Low Risk Classified</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#1a1f3a] border border-[#252a4a]">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-sm font-medium">Suspicious</span>
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-400">{stats?.mediumRiskCount || 0}</p>
          <span className="text-xs text-gray-400">Under Review</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#1a1f3a] border border-[#252a4a]">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-sm font-medium">Fraud Detected</span>
            <ShieldAlert className="w-5 h-5 text-red-400" />
          </div>
          <p className="text-2xl font-bold text-red-400">{stats?.highRiskCount || 0}</p>
          <span className="text-xs text-gray-400">High Risk Warnings</span>
        </div>
      </div>

      {/* Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[#1a1f3a] border border-[#252a4a]">
          <h2 className="text-lg font-semibold mb-4">Risk Distribution Breakdown</h2>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 text-xs text-gray-400 mt-2">
            {pieData.map(p => (
              <div key={p.name} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }}></span>
                <span>{p.name}: {p.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#1a1f3a] border border-[#252a4a]">
          <h2 className="text-lg font-semibold mb-4">Latest Fraud Alerts</h2>
          <div className="space-y-3">
            {recentAlerts.length === 0 ? (
              <p className="text-sm text-gray-500 py-6 text-center">No recent alerts registered</p>
            ) : (
              recentAlerts.slice(0, 4).map(alert => (
                <div key={alert.id} className="p-3 bg-[#0a0e27] border border-[#252a4a] rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-red-400">{alert.alert_type || 'Fraud Risk'}</p>
                    <p className="text-sm truncate w-36">{alert.description || 'Suspicious Activity'}</p>
                  </div>
                  <span className="px-2.5 py-1 text-xs rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-bold">
                    Score: {alert.risk_score || 80}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="p-5 rounded-2xl bg-[#1a1f3a] border border-[#252a4a]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Recent Financial Transactions</h2>
          <Link to="/transactions" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
            View All <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#252a4a] text-gray-400">
                <th className="pb-3 font-medium">Txn ID</th>
                <th className="pb-3 font-medium">Type</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium">Location</th>
                <th className="pb-3 font-medium">Risk Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#252a4a]">
              {recentTxns.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-6 text-center text-gray-500">No transactions found</td>
                </tr>
              ) : (
                recentTxns.map(t => (
                  <tr key={t.id} className="hover:bg-white/5 transition">
                    <td className="py-3 font-mono text-xs">{t.transaction_id}</td>
                    <td className="py-3 capitalize">{t.type}</td>
                    <td className="py-3 font-medium">${parseFloat(t.amount || 0).toFixed(2)}</td>
                    <td className="py-3 text-gray-400">{t.location || 'Online'}</td>
                    <td className="py-3">
                      <span className="px-2.5 py-1 text-xs rounded-full font-semibold"
                        style={{
                          backgroundColor: `${RISK_COLORS[t.risk_level || 'LOW']}20`,
                          color: RISK_COLORS[t.risk_level || 'LOW'],
                          border: `1px solid ${RISK_COLORS[t.risk_level || 'LOW']}40`
                        }}>
                        {t.risk_level || 'LOW'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
